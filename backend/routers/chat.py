import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from agent.graph import graph
from agent.pricing import calc_chat_cost, calc_embedding_cost, log_session_cost
from agent.prompts import CHAT_SYSTEM_PROMPT
from agent.state import AgentState
from agent.tools import pop_embedding_tokens
from auth.utils import get_current_customer
from database.connection import SessionLocal
from database.models import Conversation, Message
from langchain_core.messages import HumanMessage, SystemMessage


router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None



# Kullanıcının mesajını alır, LangGraph agent'ı çalıştırır, cevabı ve kullanılan tool'ları döndürür.
@router.post("")
def chat(request: ChatRequest, customer=Depends(get_current_customer)):
    session_id = request.session_id or str(uuid.uuid4())

    system_prompt = CHAT_SYSTEM_PROMPT.format(
        customer_name=customer.name,
        customer_id=str(customer.customer_id),
    )

    config = {"configurable": {"thread_id": session_id}}

    input_state = {
        "messages": [
            SystemMessage(content=system_prompt),
            HumanMessage(content=request.message),
        ],
        "customer_id": str(customer.customer_id),
        "customer_name": customer.name,
        "tool_calls_made": [],
        "session_id": session_id,
    }

    result = graph.invoke(input_state, config=config)

    ai_message = result["messages"][-1]
    tool_calls_made = [
        msg.name
        for msg in result["messages"]
        if hasattr(msg, "name") and msg.name
    ]

    return {
        "response": ai_message.content,
        "session_id": session_id,
        "tools_used": tool_calls_made,
    }



# session_id'ye göre LangGraph hafızasından konuşma geçmişini çeker.
@router.get("/history/{session_id}")
def get_history(session_id: str, customer=Depends(get_current_customer)):
    config = {"configurable": {"thread_id": session_id}}
    state = graph.get_state(config)

    if not state or not state.values.get("messages"):
        return {"messages": []}

    messages = []
    for msg in state.values["messages"]:
        role = msg.__class__.__name__.replace("Message", "").lower()
        if role in ("human", "ai"):
            messages.append({
                "role": role,
                "content": msg.content,
            })

    return {"messages": messages, "session_id": session_id}




class EndSessionRequest(BaseModel):
    session_id: str


# Konuşmayı sonlandırır; RAM'deki mesajları PostgreSQL'e kalıcı olarak yazar.
@router.post("/end")
def end_session(request: EndSessionRequest, customer=Depends(get_current_customer)):
    config = {"configurable": {"thread_id": request.session_id}}
    state = graph.get_state(config)

    if not state or not state.values.get("messages"):
        raise HTTPException(status_code=404, detail="Session not found.")

    with SessionLocal() as db:
        conversation = Conversation(
            conversation_id=str(uuid.uuid4()),
            customer_id=str(customer.customer_id),
            mode="chat",
            started_at=datetime.utcnow(),
            ended_at=datetime.utcnow(),
        )
        db.add(conversation)
        db.flush()

        role_map = {"human": "user", "ai": "assistant"}
        for msg in state.values["messages"]:
            raw_role = msg.__class__.__name__.replace("Message", "").lower()
            role = role_map.get(raw_role)
            if role is None:
                continue
            tool_used = None
            if raw_role == "ai" and msg.tool_calls:
                tool_used = msg.tool_calls[0]["name"]

            db.add(Message(
                message_id=str(uuid.uuid4()),
                conversation_id=conversation.conversation_id,
                role=role,
                content=msg.content or "",
                tool_used=tool_used,
                created_at=datetime.utcnow(),
            ))

        db.commit()

    # ── Token & Fiyat Logu ────────────────────────────────────────
    sv = state.values
    prompt_tokens     = sv.get("prompt_tokens", 0)
    completion_tokens = sv.get("completion_tokens", 0)
    embedding_tokens  = pop_embedding_tokens()

    llm_cost   = calc_chat_cost("gpt-4o", prompt_tokens, completion_tokens)
    embed_cost = calc_embedding_cost(embedding_tokens)
    total_cost = llm_cost + embed_cost

    log_session_cost(
        label="CHAT",
        details={
            "👤 Müşteri         ": customer.name,
            "📥 Prompt tokens   ": prompt_tokens,
            "📤 Completion tokens": completion_tokens,
            "🔍 Embedding tokens ": embedding_tokens,
            "🤖 LLM modeli      ": "gpt-4o",
            "🧩 Embedding modeli ": "text-embedding-3-small",
        },
        total_usd=total_cost,
    )
    # ─────────────────────────────────────────────────────────────

    return {"status": "ok", "conversation_id": str(conversation.conversation_id)}

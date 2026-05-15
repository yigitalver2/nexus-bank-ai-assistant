import json
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import uuid
from datetime import datetime
from database.connection import SessionLocal
from database.models import Conversation, Message



from agent.prompts import VOICE_SYSTEM_PROMPT
from agent.tools import (
    all_tools,
    search_knowledge_base,
    get_account_info,
    get_transaction_history,
    get_loan_status,
    create_support_ticket,
    escalate_to_human,
    verify_customer_identity
    
)
from auth.utils import get_current_customer
from config import settings

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/token")
async def get_voice_token(current_customer: dict = Depends(get_current_customer)):
    customer_id   = str(current_customer["customer_id"])
    customer_name = current_customer["name"]

    system_prompt = VOICE_SYSTEM_PROMPT.format(
        customer_name=customer_name,
        customer_id=customer_id,
    )

    tool_definitions = [
        {
            "type": "function",
            "name": t.name,
            "description": t.description,
            "parameters": t.args_schema.model_json_schema(),
        }
        for t in all_tools
    ]

    session_config = {
        "model": settings.openai_realtime_model,
        "modalities": ["audio", "text"],
        "voice": settings.openai_realtime_voice,
        "instructions": system_prompt,
        "tools": tool_definitions,
        "turn_detection": {"type": "server_vad"},
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json=session_config,
            timeout=15,
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to create voice session")

    data = response.json()
    return {
        "client_secret": data["client_secret"]["value"],
        "session_id": data["id"],
    }

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: str
    session_id: str
    
    
    
TOOL_MAP = {
    "verify_customer_identity": verify_customer_identity,
    "get_account_info": get_account_info,
    "get_transaction_history": get_transaction_history,
    "get_loan_status": get_loan_status,
    "create_support_ticket": create_support_ticket,
    "escalate_to_human": escalate_to_human,
    "search_knowledge_base": search_knowledge_base,
}


@router.post("/tool")
async def run_voice_tool(
    body: ToolCallRequest,
    current_customer: dict = Depends(get_current_customer),
):
    tool = TOOL_MAP.get(body.tool_name)
    if not tool:
        raise HTTPException(status_code=400, detail=f"Unknown tool: {body.tool_name}")

    customer_id = str(current_customer["customer_id"])

    try:
        args = json.loads(body.arguments)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid tool arguments JSON")

    if "customer_id" in args:
        args["customer_id"] = customer_id

    result = tool.invoke(args)
    return {"result": result}



class TranscriptMessage(BaseModel):
    role: str
    content: str

class EndVoiceSessionRequest(BaseModel):
    session_id: str
    transcript: list[TranscriptMessage]
    
    
    
    
@router.post("/end")
async def end_voice_session(
    body: EndVoiceSessionRequest,
    current_customer: dict = Depends(get_current_customer),
):
    customer_id = str(current_customer["customer_id"])

    with SessionLocal() as db:
        conversation = Conversation(
            conversation_id=str(uuid.uuid4()),
            customer_id=customer_id,
            mode="voice",
            started_at=datetime.utcnow(),
            ended_at=datetime.utcnow(),
        )
        db.add(conversation)
        db.flush()

        for msg in body.transcript:
            if msg.role not in ("user", "assistant"):
                continue
            db.add(Message(
                message_id=str(uuid.uuid4()),
                conversation_id=conversation.conversation_id,
                role=msg.role,
                content=msg.content,
                created_at=datetime.utcnow(),
            ))

        db.commit()

    return {"ok": True, "conversation_id": conversation.conversation_id}
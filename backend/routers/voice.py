import httpx
from fastapi import APIRouter, Depends, HTTPException

from agent.prompts import VOICE_SYSTEM_PROMPT
from agent.tools import all_tools
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

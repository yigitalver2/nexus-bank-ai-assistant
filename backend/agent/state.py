from typing import TypedDict
from langchain_core.messages import BaseMessage



class AgentState(TypedDict):
    messages: list[BaseMessage]
    customer_id: str
    customer_name: str
    tool_calls_made: list[str]
    session_id: str
    
    
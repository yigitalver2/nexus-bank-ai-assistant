from typing import Annotated, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    customer_id: str
    customer_name: str
    tool_calls_made: list[str]
    session_id: str
    prompt_tokens: int
    completion_tokens: int
    embedding_tokens: int
    
    
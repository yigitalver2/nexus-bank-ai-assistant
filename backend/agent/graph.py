from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from agent.state import AgentState
from agent.tools import all_tools


llm = ChatOpenAI(model="gpt-4o", temperature=0)
llm_with_tools = llm.bind_tools(all_tools)


def agent_node(state: AgentState) -> dict:
    response = llm_with_tools.invoke(state["messages"])
    usage = response.response_metadata.get("token_usage", {})
    return {
        "messages":          [response],
        "prompt_tokens":     state.get("prompt_tokens", 0)     + usage.get("prompt_tokens", 0),
        "completion_tokens": state.get("completion_tokens", 0) + usage.get("completion_tokens", 0),
    }


def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END


tools_node = ToolNode(all_tools)

graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", tools_node)

graph_builder.add_edge(START, "agent")
graph_builder.add_conditional_edges("agent", should_continue)
graph_builder.add_edge("tools", "agent")

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)
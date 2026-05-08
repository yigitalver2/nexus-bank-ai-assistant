import uuid
from datetime import datetime

from langchain_core.tools import tool
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from database.models import Account, Transaction, Loan, SupportTicket
from knowledge.chroma_client import get_collection


@tool
def search_knowledge_base(query: str) -> str:
    
    """Search the Nexus Bank knowledge base for information about products,
    procedures, FAQs, and policies."""
    
    collection = get_collection()
    
    results = collection.query(
        query_texts=[query],
        n_results=4,
        include=["documents", "metadatas"],
    )
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    if not documents:
        return "No relevant information found in the knowledge base."

    output = []
    for doc, meta in zip(documents, metadatas):
        output.append(f"[{meta.get('title', 'Unknown')}]\n{doc}")

    return "\n\n---\n\n".join(output)


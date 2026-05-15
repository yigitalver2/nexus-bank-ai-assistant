import uuid
from datetime import datetime

from langchain_core.tools import tool
from langchain_openai import OpenAIEmbeddings
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from database.models import Account, Transaction, Loan, SupportTicket, Customer
from knowledge.chroma_client import get_collection

_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")


@tool
def search_knowledge_base(query: str) -> str:
    
    """Search the Nexus Bank knowledge base for information about products,
    procedures, FAQs, and policies."""
    
    collection = get_collection()
    
    query_vector = _embeddings.embed_query(query)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=5,
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




@tool
def get_account_info(customer_id: str) -> str:
    
    """Get all bank accounts and balances for the customer."""
    
    with SessionLocal() as db:
        accounts = db.query(Account).filter(
            Account.customer_id == customer_id,
            Account.status == "active",
        ).all()

    if not accounts:
        return "No active accounts found."

    lines = []
    
    for acc in accounts:
        lines.append(
            f"Account ID: {acc.account_id} | Type: {acc.type} | "
            f"Balance: {acc.balance:.2f} {acc.currency} | IBAN: {acc.iban}"
        )
    return "\n".join(lines)



@tool
def get_transaction_history(
    customer_id: str,
    limit: int = 20,
    start_date: str | None = None,
    end_date: str | None = None,
) -> str:
    """Get transaction history for the customer.

    Args:
        customer_id: The customer's ID.
        limit: Max number of transactions to return (default 20).
        start_date: Optional start date filter in YYYY-MM-DD format (inclusive).
        end_date: Optional end date filter in YYYY-MM-DD format (inclusive).
    """

    with SessionLocal() as db:
        account_ids = [
            row.account_id for row in db.query(Account.account_id).filter(
                Account.customer_id == customer_id
            ).all()
        ]

        if not account_ids:
            return "No accounts found."

        query = db.query(Transaction).filter(
            Transaction.account_id.in_(account_ids)
        )

        if start_date:
            query = query.filter(
                Transaction.created_at >= datetime.fromisoformat(start_date)
            )
        if end_date:
            end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59)
            query = query.filter(Transaction.created_at <= end_dt)

        transactions = query.order_by(Transaction.created_at.desc()).limit(limit).all()

    if not transactions:
        return "No transactions found for the given criteria."

    lines = []
    for tx in transactions:
        lines.append(
            f"{tx.created_at.strftime('%Y-%m-%d')} | {tx.type.upper()} | "
            f"{tx.amount:.2f} | {tx.description}"
        )
    return "\n".join(lines)


@tool
def get_loan_status(customer_id: str) -> str:
    """Get the status of all loans for the customer."""
    with SessionLocal() as db:
        loans = db.query(Loan).filter(
            Loan.customer_id == customer_id,
            Loan.status.in_(["active", "pending"]),
        ).all()

    if not loans:
        return "No active or pending loans found."

    lines = []
    for loan in loans:
        lines.append(
            f"Type: {loan.type} | Status: {loan.status} | "
            f"Amount: {loan.amount:.2f} | Remaining: {loan.remaining_amount:.2f} | "
            f"Monthly Payment: {loan.monthly_payment:.2f} | Rate: {loan.interest_rate}%"
        )
    return "\n".join(lines)



@tool
def create_support_ticket(customer_id: str, subject: str, description: str) -> str:
    """Create a support ticket for the customer."""
    with SessionLocal() as db:
        ticket = SupportTicket(
            ticket_id=str(uuid.uuid4()),
            customer_id=customer_id,
            subject=subject,
            description=description,
            status="open",
            priority="medium",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        ticket_id = ticket.ticket_id

    return (
        f"Support ticket created successfully.\n"
        f"Ticket ID: {ticket_id}\n"
        f"Subject: {subject}\n"
        f"Status: Open | Priority: Medium\n"
        f"Our team will respond within 1-2 business days."
    )


@tool
def escalate_to_human(customer_id: str, reason: str) -> str:
    
    """Escalate the conversation to a human agent when the issue cannot be
    resolved by the AI assistant."""
    
    ref_number = f"ESC-{uuid.uuid4().hex[:8].upper()}"
    return (
        f"Your request has been escalated to a human agent.\n"
        f"Escalation Reference: {ref_number}\n"
        f"Reason: {reason}\n"
        f"A representative will contact you within 2 business hours.\n"
        f"You can also call us directly at 1-800-NEXUS-00."
    )



all_tools = [
    search_knowledge_base,
    get_account_info,
    get_transaction_history,
    get_loan_status,
    create_support_ticket,
    escalate_to_human,
]

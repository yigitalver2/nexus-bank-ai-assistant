from fastapi import APIRouter, Depends, HTTPException

from auth.utils import get_current_customer
from database.connection import SessionLocal
from database.models import Account, Transaction, Loan, SupportTicket

router = APIRouter(prefix="/api", tags=["account"])


# Müşterinin aktif hesaplarını ve bakiyelerini döndürür (dashboard sol panel için).
@router.get("/account/{customer_id}")
def get_account(customer_id: str, customer=Depends(get_current_customer)):
    if str(customer.customer_id) != customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    with SessionLocal() as db:
        accounts = db.query(Account).filter(
            Account.customer_id == customer_id,
            Account.status == "active",
        ).all()

    return [
        {
            "id": str(acc.account_id),
            "type": acc.type,
            "balance": float(acc.balance),
            "currency": acc.currency,
            "iban": acc.iban,
        }
        for acc in accounts
    ]


# Müşterinin tüm hesaplarına ait son 20 işlemi yeniden eskiye sıralı döndürür.
@router.get("/transactions/{customer_id}")
def get_transactions(customer_id: str, customer=Depends(get_current_customer)):
    if str(customer.customer_id) != customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    with SessionLocal() as db:
        account_ids = [
            row.account_id for row in db.query(Account.account_id).filter(
                Account.customer_id == customer_id
            ).all()
        ]

        transactions = db.query(Transaction).filter(
            Transaction.account_id.in_(account_ids)
        ).order_by(Transaction.created_at.desc()).limit(20).all()

    return [
        {
            "id": str(tx.transaction_id),
            "type": tx.type,
            "amount": float(tx.amount),
            "description": tx.description,
            "category": tx.category,
            "date": tx.created_at.strftime("%Y-%m-%d"),
        }
        for tx in transactions
    ]


# Müşterinin açık ve işlemdeki destek taleplerini döndürür.
@router.get("/tickets/{customer_id}")
def get_tickets(customer_id: str, customer=Depends(get_current_customer)):
    if str(customer.customer_id) != customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    with SessionLocal() as db:
        tickets = db.query(SupportTicket).filter(
            SupportTicket.customer_id == customer_id,
            SupportTicket.status.in_(["open", "in_progress"]),
        ).order_by(SupportTicket.created_at.desc()).all()

    return [
        {
            "id": str(t.ticket_id),
            "subject": t.subject,
            "status": t.status,
            "priority": t.priority,
            "date": t.created_at.strftime("%Y-%m-%d"),
        }
        for t in tickets
    ]

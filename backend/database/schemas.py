from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ─────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CustomerOut(BaseModel):
    customer_id: UUID
    name: str
    email: EmailStr
    phone: str | None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: CustomerOut


# ─────────────────────────────────────────────
# Account
# ─────────────────────────────────────────────
class AccountOut(BaseModel):
    account_id: UUID
    type: str
    balance: float
    currency: str
    iban: str | None
    status: str

    model_config = {"from_attributes": True}


class TransactionOut(BaseModel):
    transaction_id: UUID
    account_id: UUID
    type: str
    amount: float
    description: str | None
    category: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class LoanOut(BaseModel):
    loan_id: UUID
    type: str
    amount: float
    interest_rate: float
    monthly_payment: float
    remaining_amount: float
    status: str

    model_config = {"from_attributes": True}


class CreditCardOut(BaseModel):
    credit_card_id: UUID
    card_number_masked: str
    credit_limit: float
    available_limit: float
    billing_date: int
    due_date: int
    status: str

    model_config = {"from_attributes": True}


class TicketOut(BaseModel):
    ticket_id: UUID
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Chat
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    tool_used: str | None
    session_id: str


class MessageOut(BaseModel):
    message_id: UUID
    role: str
    content: str
    tool_used: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class EndSessionRequest(BaseModel):
    session_id: str


# ─────────────────────────────────────────────
# Knowledge
# ─────────────────────────────────────────────
class IngestRequest(BaseModel):
    text: str
    title: str
    category: str
    language: str = "en"


class SearchRequest(BaseModel):
    query: str
    n_results: int = 5

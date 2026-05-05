import uuid
from datetime import datetime

from sqlalchemy import (
    DECIMAL,
    TEXT,
    VARCHAR,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


# ─────────────────────────────────────────────
# customers
# ─────────────────────────────────────────────
class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    email: Mapped[str] = mapped_column(VARCHAR(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(VARCHAR(20))
    national_id: Mapped[str | None] = mapped_column(VARCHAR(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    accounts: Mapped[list["Account"]] = relationship(back_populates="customer")
    loans: Mapped[list["Loan"]] = relationship(back_populates="customer")
    support_tickets: Mapped[list["SupportTicket"]] = relationship(back_populates="customer")
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="customer")


# ─────────────────────────────────────────────
# accounts
# ─────────────────────────────────────────────
class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("checking", "savings", "time_deposit", "credit_card", name="account_type"),
        nullable=False,
    )
    balance: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(VARCHAR(3), nullable=False, default="TRY")
    iban: Mapped[str | None] = mapped_column(VARCHAR(34))
    status: Mapped[str] = mapped_column(
        Enum("active", "frozen", "closed", name="account_status"),
        nullable=False,
        default="active",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="account")
    credit_card: Mapped["CreditCard | None"] = relationship(back_populates="account", uselist=False)


# ─────────────────────────────────────────────
# transactions
# ─────────────────────────────────────────────
class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("credit", "debit", name="transaction_type"),
        nullable=False,
    )
    amount: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(VARCHAR(500))
    category: Mapped[str | None] = mapped_column(VARCHAR(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    account: Mapped["Account"] = relationship(back_populates="transactions")


# ─────────────────────────────────────────────
# loans
# ─────────────────────────────────────────────
class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("personal", "mortgage", "vehicle", name="loan_type"),
        nullable=False,
    )
    amount: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    interest_rate: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    monthly_payment: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    remaining_amount: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected", "active", "closed", name="loan_status"),
        nullable=False,
        default="pending",
    )
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    customer: Mapped["Customer"] = relationship(back_populates="loans")


# ─────────────────────────────────────────────
# credit_cards
# ─────────────────────────────────────────────
class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    card_number_masked: Mapped[str] = mapped_column(VARCHAR(19), nullable=False)
    credit_limit: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    available_limit: Mapped[float] = mapped_column(DECIMAL(15, 2), nullable=False)
    billing_date: Mapped[int] = mapped_column(Integer, nullable=False)
    due_date: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "blocked", "expired", name="credit_card_status"),
        nullable=False,
        default="active",
    )

    account: Mapped["Account"] = relationship(back_populates="credit_card")


# ─────────────────────────────────────────────
# support_tickets
# ─────────────────────────────────────────────
class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=False)
    subject: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[str] = mapped_column(TEXT, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("open", "in_progress", "resolved", "closed", name="ticket_status"),
        nullable=False,
        default="open",
    )
    priority: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="ticket_priority"),
        nullable=False,
        default="medium",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    customer: Mapped["Customer"] = relationship(back_populates="support_tickets")


# ─────────────────────────────────────────────
# conversations
# ─────────────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=False)
    mode: Mapped[str] = mapped_column(
        Enum("chat", "voice", name="conversation_mode"),
        nullable=False,
        default="chat",
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    customer: Mapped["Customer"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation")


# ─────────────────────────────────────────────
# messages
# ─────────────────────────────────────────────
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conversations.id"), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("user", "assistant", name="message_role"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(TEXT, nullable=False)
    tool_used: Mapped[str | None] = mapped_column(VARCHAR(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

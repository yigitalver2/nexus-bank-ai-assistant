"""
Run with:  docker exec nexus-backend python database/seed.py
Idempotent — skips if customers table already has data.
"""
import random
from datetime import datetime, timedelta, timezone

import bcrypt
from faker import Faker

from database.connection import SessionLocal
from database.models import (
    Account,
    CreditCard,
    Customer,
    Loan,
    SupportTicket,
    Transaction,
)

fake = Faker("tr_TR")


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

CATEGORIES = [
    "market", "restaurant", "fuel", "online_shopping", "salary",
    "rent", "utilities", "healthcare", "entertainment", "transfer",
    "atm", "education", "travel", "clothing", "subscription",
]

DESCRIPTIONS = {
    "market":          ["Migros", "Carrefour", "BİM", "A101", "Şok", "Metro"],
    "restaurant":      ["McDonald's", "Burger King", "Domino's", "Starbucks", "Simit Sarayı"],
    "fuel":            ["Shell", "BP", "Total", "Opet", "Petrol Ofisi"],
    "online_shopping": ["Trendyol", "Hepsiburada", "Amazon", "N11", "GittiGidiyor"],
    "salary":          ["Maaş Ödemesi"],
    "rent":            ["Kira Ödemesi"],
    "utilities":       ["Elektrik Faturası", "Su Faturası", "Doğalgaz Faturası", "İnternet Faturası"],
    "healthcare":      ["Eczane", "Hastane", "Özel Klinik"],
    "entertainment":   ["Netflix", "Spotify", "Disney+", "BluTV", "Sinema"],
    "transfer":        ["EFT", "Havale"],
    "atm":             ["ATM Para Çekimi"],
    "education":       ["Özel Ders Ücreti", "Kurs Ücreti"],
    "travel":          ["Türk Hava Yolları", "Pegasus", "Airbnb", "Hotels.com"],
    "clothing":        ["LC Waikiki", "Zara", "H&M", "Mango"],
    "subscription":    ["Sigorta Ödemesi", "Kredi Kartı Aidatı"],
}

TICKET_SUBJECTS = [
    "Kart Bloke Talebi",
    "Yanlış İşlem Bildirimi",
    "İnternet Bankacılığı Erişim Sorunu",
    "Kredi Başvurusu Hakkında Bilgi",
    "Hesap Ekstresi Talebi",
    "Şifre Sıfırlama",
    "Kredi Kartı Limit Artırım Talebi",
    "Dolandırıcılık Bildirimi",
    "Hesap Kapatma Talebi",
    "IBAN Bilgisi Güncelleme",
]


def _iban() -> str:
    bank = str(random.randint(1, 99999)).zfill(5)
    acc  = str(random.randint(1, 9999999999999999)).zfill(16)
    return f"TR{random.randint(10, 99)}{bank}0{acc}"


def _tx_date() -> datetime:
    return datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, 180),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(Customer).count() > 0:
            print("Already seeded — skipping.")
            return

        print("Seeding database…")

        # ── Demo user (predictable credentials for testing) ──────────────
        demo = Customer(
            name="Ahmet Yılmaz",
            email="ahmet@nexusbank.com",
            password_hash=_hash("demo1234"),
            phone="05301234567",
            national_id="12345678901",
            father_name="Mehmet",
            birth_place="Ankara",
        )
        db.add(demo)
        db.flush()

        _add_accounts(db, demo.customer_id, is_demo=True)

        # ── 99 random customers ───────────────────────────────────────────
        customers = [demo]
        for _ in range(99):
            c = Customer(
                name=fake.name(),
                email=fake.unique.email(),
                password_hash=_hash("password123"),
                phone=fake.phone_number(),
                national_id=fake.numerify("###########"),
                father_name=fake.first_name_male(),
                birth_place=fake.city(),
            )
            db.add(c)
            customers.append(c)

        db.flush()

        for c in customers[1:]:
            _add_accounts(db, c.customer_id)

        # ── Support tickets (5-10 total, random customers) ────────────────
        num_tickets = random.randint(5, 10)
        for _ in range(num_tickets):
            c = random.choice(customers)
            db.add(SupportTicket(
                customer_id=c.customer_id,
                subject=random.choice(TICKET_SUBJECTS),
                description=fake.paragraph(nb_sentences=3),
                status=random.choice(["open", "in_progress"]),
                priority=random.choice(["low", "medium", "high"]),
            ))

        db.commit()
        print(f"Done — 100 customers seeded, {num_tickets} support tickets created.")
        print("Demo login → email: ahmet@nexusbank.com  password: demo1234")

    finally:
        db.close()


def _add_accounts(db, customer_id, *, is_demo: bool = False) -> None:
    # Regular accounts: checking always, then 1-3 more from savings/time_deposit
    base_types = ["checking"]
    extras = random.sample(["savings", "time_deposit"], k=random.randint(0, 2))
    account_types = base_types + extras

    for acc_type in account_types:
        balance = round(random.uniform(500, 150_000), 2) if not is_demo else round(random.uniform(10_000, 80_000), 2)
        acc = Account(
            customer_id=customer_id,
            type=acc_type,
            balance=balance,
            currency="TRY",
            iban=_iban(),
            status="active",
        )
        db.add(acc)
        db.flush()
        _add_transactions(db, acc.account_id)

    # Credit card for ~60% of customers (always for demo)
    if is_demo or random.random() < 0.6:
        limit = float(random.choice([5_000, 10_000, 15_000, 20_000, 30_000, 50_000]))
        available = round(random.uniform(limit * 0.1, limit), 2)
        cc_acc = Account(
            customer_id=customer_id,
            type="credit_card",
            balance=round(limit - available, 2),
            currency="TRY",
            iban=None,
            status="active",
        )
        db.add(cc_acc)
        db.flush()

        db.add(CreditCard(
            account_id=cc_acc.account_id,
            card_number_masked=f"**** **** **** {random.randint(1000, 9999)}",
            credit_limit=limit,
            available_limit=available,
            billing_date=random.randint(1, 28),
            due_date=random.randint(1, 28),
            status="active",
        ))

    # Loans: 0-2 per customer (1 guaranteed for demo)
    num_loans = 1 if is_demo else random.randint(0, 2)
    for _ in range(num_loans):
        principal = round(random.uniform(10_000, 500_000), 2)
        rate      = round(random.uniform(20, 45), 2)
        months    = random.choice([12, 24, 36, 48, 60])
        monthly   = round(principal * (1 + rate / 100) / months, 2)
        remaining = round(monthly * random.randint(1, months), 2)

        db.add(Loan(
            customer_id=customer_id,
            type=random.choice(["personal", "mortgage", "vehicle"]),
            amount=principal,
            interest_rate=rate,
            monthly_payment=monthly,
            remaining_amount=remaining,
            status="active",
        ))


def _add_transactions(db, account_id) -> None:
    for _ in range(random.randint(20, 50)):
        cat   = random.choice(CATEGORIES)
        descs = DESCRIPTIONS.get(cat, ["İşlem"])
        tx_type = "credit" if cat == "salary" else random.choice(["credit", "debit"])

        db.add(Transaction(
            account_id=account_id,
            type=tx_type,
            amount=round(random.uniform(10, 5_000), 2),
            description=random.choice(descs),
            category=cat,
            created_at=_tx_date(),
        ))


if __name__ == "__main__":
    seed()
    
    
    
    
    

    
    
    
    
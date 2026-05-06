from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.utils import create_access_token, get_current_customer, verify_password
from database.connection import get_db
from database.models import Customer
from database.schemas import CustomerOut, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(
        Customer.email == body.email.lower()
    ).first()

    if not customer or not verify_password(body.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(customer.customer_id, customer.name)
    return TokenResponse(
        access_token=token,
        customer=CustomerOut.model_validate(customer),
    )


@router.get("/me", response_model=CustomerOut)
def me(current_customer: Customer = Depends(get_current_customer)):
    return CustomerOut.model_validate(current_customer)

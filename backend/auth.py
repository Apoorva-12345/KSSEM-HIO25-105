from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from passlib.context import CryptContext
from pydantic import BaseModel

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")


    hashed_pw = pwd_context.hash(user.password)

    new_user = User(
        email=user.email,
        password=hashed_pw,
        name=user.name
    )

    db.add(new_user)
    db.commit()          
    db.refresh(new_user) 

    return {
        "message": "User registered successfully ✅",
        "id": new_user.id,
        "email": new_user.email
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Performance
from schemas import PerformanceCreate, PerformanceOut
from typing import List
import jwt, os

router = APIRouter(prefix="/performance", tags=["Performance"])
JWT_SECRET = os.getenv("JWT_SECRET", "devsecret")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user(request: Request):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    token = token.split(" ")[1]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=PerformanceOut)
def add_performance(data: PerformanceCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    perf = Performance(user_id=user["id"], quiz_id=data.quiz_id, score=data.score, meta=str(data.meta))
    db.add(perf)
    db.commit()
    db.refresh(perf)
    return perf

@router.get("/", response_model=List[PerformanceOut])
def get_performance(db: Session = Depends(get_db), user=Depends(get_user)):
    return db.query(Performance).filter_by(user_id=user["id"]).order_by(Performance.created_at.desc()).all()
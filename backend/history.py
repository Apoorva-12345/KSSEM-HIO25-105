from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from models import History
from schemas import HistoryCreate, HistoryOut
from typing import List
import jwt, os

router = APIRouter(prefix="/history", tags=["History"])
JWT_SECRET = os.getenv("JWT_SECRET", "devsecret")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request):
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=HistoryOut)
def create_history(data: HistoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    hist = History(user_id=user["id"], type=data.type, payload=str(data.payload))
    db.add(hist)
    db.commit()
    db.refresh(hist)
    return hist

@router.get("/", response_model=List[HistoryOut])
def list_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(History).filter_by(user_id=user["id"]).order_by(History.created_at.desc()).all()
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    
    class Config:
        from_attributes = True  



class LoginRequest(BaseModel):
    email: str
    password: str


class HistoryCreate(BaseModel):
    type: str
    payload: Any

class HistoryOut(BaseModel):
    id: int
    type: str
    payload: str
    created_at: datetime

    class Config:
        from_attributes = True


class PerformanceCreate(BaseModel):
    quiz_id: Optional[str]
    score: int
    meta: Optional[Any]

class PerformanceOut(BaseModel):
    id: int
    quiz_id: Optional[str]
    score: int
    meta: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

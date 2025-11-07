from fastapi import APIRouter, Depends, Request, HTTPException
import os, requests, jwt

router = APIRouter(prefix="/gen", tags=["AI Generator"])
AI_API_KEY = os.getenv("AI_API_KEY")

def get_user(request: Request):
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]
    try:
        return jwt.decode(token, os.getenv("JWT_SECRET", "devsecret"), algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/chat")
def chat(request: Request, body: dict, user=Depends(get_user)):
    if not AI_API_KEY:
        return {"response": "AI API key not configured"}
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {AI_API_KEY}"},
            json={"model": "gpt-4o-mini", "messages": body.get("messages", [])},
        )
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

@router.post("/flashcards")
def flashcards(body: dict, user=Depends(get_user)):
    topic = body.get("topic", "General")
    mock = [
        {"front": f"{topic} - concept 1", "back": "Definition 1"},
        {"front": f"{topic} - concept 2", "back": "Definition 2"},
    ]
    return {"flashcards": mock}

@router.post("/quiz")
def quiz(body: dict, user=Depends(get_user)):
    topic = body.get("topic", "General")
    quiz = [{"id": "1", "question": f"What is {topic}?", "options": ["A", "B", "C"], "answer": 0}]
    return {"quiz": quiz}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from models import User, History, Performance 
import auth, history, performance, generator

Base.metadata.create_all(bind=engine)


app = FastAPI(title="AI Virtual Tutor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(performance.router, prefix="/performance", tags=["Performance"])
app.include_router(generator.router, prefix="/generator", tags=["Generator"])

@app.get("/")
def root():
    return {"message": "AI Virtual Tutor Backend is running ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}
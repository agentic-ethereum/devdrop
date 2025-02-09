#schemas.py
from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    role: str  # "human" or "ai"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str

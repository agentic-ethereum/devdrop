from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from .schemas import ChatRequest, ChatResponse
from .service import process_chat, evaluate_contributor, evaluate_all_contributors

router = APIRouter(tags=['AgentQuery'])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Process chat messages using the agent
    """
    return process_chat(request)

@router.get("/evaluate_contributor", response_model=Dict[str, Any])
async def evaluate_contributor_endpoint(repo_name: str, username: str):
    """
    Evaluate a contributor's GitHub activity for a specific repository
    
    Args:
        repo_name: Name of the GitHub repository
        username: GitHub username of the contributor
    
    Returns:
        Dict containing evaluation results or error message
    """
    try:
        result = await evaluate_contributor(repo_name, username)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate_all_contributors", response_model=Dict[str, Any])
async def evaluate_all_contributors_endpoint():
    """
    Evaluate all contributors in the database that haven't been evaluated yet
    
    Returns:
        Dict containing batch evaluation results and progress information
    """
    try:
        result = await evaluate_all_contributors()
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

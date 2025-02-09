#service.py
import os
from langchain_groq import ChatGroq
import json
from typing import Dict, Any
from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from ..tools.github_tool import GitHubTool
from ..tools.twitter_tool import twitter_toolkit
from .schemas import ChatRequest, ChatResponse, Message
from .db import DatabaseOperations
# Load environment variables
load_dotenv()

# Initialize the chat model
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set")

model = ChatGroq(model='llama3-70b-8192', api_key=os.getenv("GROQ_API_KEY"))
twitter_tools = twitter_toolkit.get_tools()
github_tool = GitHubTool()
tools = [github_tool] + twitter_tools
db = DatabaseOperations(os.getenv("DB_URL"))
# Set up a memory checkpointer
memory = MemorySaver()

# Create LangGraph agent
agent_executor = create_react_agent(model, tools, checkpointer=memory)

def process_chat(request: ChatRequest) -> ChatResponse:
    # Convert messages to LangChain format
    chat_history = [{"role": msg.role, "content": msg.content} for msg in request.messages]

    # Invoke agent
    config = {"configurable": {"thread_id": "my_thread"}}
    response = agent_executor.invoke({"messages": chat_history}, config)

    # Extract AI response
    ai_response = response["messages"][-1].content
    return ChatResponse(response=ai_response)


async def evaluate_contributor(repo_name: str, username: str) -> Dict[str, Any]:
        """Evaluate contributor based on stored data"""
        # Get detailed contribution data using GitHub tool
        github_tool = GitHubTool()
        data = github_tool.get_contributor_evaluation(repo_name, username)
        if "error" in data:
            return {"error": data["error"]}

        # Generate evaluation prompt
        prompt = _generate_eval_prompt(repo_name, username, data)
        
        # Get AI evaluation
        response = model.invoke([{
            "role": "system",
            "content": "You MUST respond with a valid JSON object containing exactly two fields: 'total_points' (a float) and 'justification' (a string). Do not include any other text or formatting."
        }, {
            "role": "user",
            "content": prompt
        }])
        
        try:
            # The model response is already an AIMessage object
            evaluation = response.content.strip()
            # Ensure we're working with a clean JSON string
            if not evaluation.startswith('{'):
                evaluation = evaluation[evaluation.find('{'):]
            if not evaluation.endswith('}'):
                evaluation = evaluation[:evaluation.rfind('}')+1]
            # Parse the evaluation
            eval_data = json.loads(evaluation)
            
            # Store evaluation results
            db.store_evaluation(
                repo_name=repo_name,
                username=username,
                reward_points=float(eval_data["total_points"]),
                justification=eval_data["justification"]
            )
            
            return {
                "status": "success",
                "evaluation": eval_data
            }
        except Exception as e:
            return {"error": f"Evaluation failed: {str(e)}"}


def _generate_eval_prompt(repo_name: str, username: str, data: Dict) -> str:
    """Generate a structured evaluation prompt for GitHub contributions."""
    
    return f"""
    You are an AI agent evaluating GitHub contributions for the user **{username}** in the repository **{repo_name}**.

    ## Contribution Data:
    ```json
    {json.dumps(data, indent=2)}
    ```

    ## Evaluation Criteria:
    - **Lines of Code (0-4 points)**  
      - 1-50 lines → 1 point  
      - 51-200 lines → 2 points  
      - 201-500 lines → 3 points  
      - 501+ lines → 4 points  

    - **Files Changed (0-3 points)**  
      - 1-2 files → 1 point  
      - 3-10 files → 2 points  
      - 11+ files → 3 points  

    - **Commit Message Quality (0-3 points)**  
      - Descriptive (2+ words) → 2 points  
      - Basic (1 word) → 1 point  

    - **Issue Reference & Resolution (0-3 points)**  
      - References an issue (e.g., "fixes #123") → +10 point  
      - Closes an issue (e.g., "closes #123") → +20 points  

    - **Special Cases & Adjustments:**  
      - Initial project scaffolding → **Max 3 points**  
      - File deletions only → **Max 2 points**  
      - Single-word commit messages (e.g., "fix", "test") → **Max 2 points**  
      - Test-only commits → **Max 3 points**  

    ## Expected JSON Response Format:
    Please provide your evaluation in **valid JSON format**, ensuring correctness:
    ```json
    {{
        "total_points": float,
        "justification": "Your reasoning for the score"
    }}
    ```
    """

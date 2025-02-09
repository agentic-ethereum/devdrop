from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type
from datetime import datetime
from ..api.db import DatabaseOperations

# Define the input schema using Pydantic for validation
class AirdropStoreInput(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    airdrop_date: str = Field(..., description="Date of the airdrop (YYYY-MM-DD format)")
    total_tokens: int = Field(..., description="Total number of tokens to airdrop")

# Define the custom tool by subclassing BaseTool
class AirdropStoreTool(BaseTool):
    name: str = "store_airdrop"
    description: str = """
    Store airdrop information for a repository in the database.
    Usage: When a user mentions they will airdrop tokens for a repository on a specific date.
    Input should include: repository name, airdrop date (YYYY-MM-DD), and total tokens.
    """
    args_schema: Type[BaseModel] = AirdropStoreInput
    
    def __init__(self, db: DatabaseOperations) -> None:
        super().__init__()
        self._db = db

    def _run(self, repo_name: str, airdrop_date: str, total_tokens: int) -> str:
        try:
            # Convert the date string to a datetime object
            date_obj = datetime.strptime(airdrop_date, "%Y-%m-%d")
            
            # Store the airdrop info into the database
            self._db.store_airdrop_info(repo_name, date_obj, total_tokens)
            
            return f"Successfully stored airdrop information for {repo_name}: {total_tokens} tokens on {airdrop_date}"
            
        except Exception as e:
            return f"Failed to store airdrop information: {str(e)}"

    async def arun(self, repo_name: str, airdrop_date: str, total_tokens: int) -> str:
        # For now, simply delegate to the synchronous _run method.
        return self._run(repo_name, airdrop_date, total_tokens)

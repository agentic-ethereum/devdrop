from langchain.tools import BaseTool
from github import Github, Auth, GithubException
from pydantic import BaseModel, Field, PrivateAttr
import psycopg2
import os
import re
from dotenv import load_dotenv
from typing import Optional, Any, Dict, List, Type

# Extend the input schema to allow extra parameters.
class GitHubToolInput(BaseModel):
    action: str = Field(
        ..., description="The action to perform: list_repos, list_contributors, or get_contributor_evaluation"
    )
    repo_name: Optional[str] = Field(
        None, description="Name of the repository (for listing contributors or evaluation)"
    )
    contributor_login: Optional[str] = Field(
        None, description="Contributor login (for evaluation)"
    )

    class Config:
        extra = "allow"

class GitHubTool(BaseTool):
    name: str = "GitHubTool"
    description: str = (
        "A tool for interacting with GitHub repositories. "
        "Available actions: list_repos, list_contributors, get_contributor_evaluation."
    )
    args_schema: Type[BaseModel] = GitHubToolInput
    db_url: Optional[str] = Field(None, description="Database connection URL")
    tokens: Optional[List[str]] = Field(None, description="List of GitHub tokens")
    
    # Define a private attribute to hold the Github instance.
    _github: Optional[Any] = PrivateAttr()

    def __init__(self) -> None:
        super().__init__()
        load_dotenv()
        self.db_url = os.getenv("DB_URL")
        self.tokens = self.get_github_tokens()
        if self.tokens:
            auth = Auth.Token(self.tokens[0])
            self._github = Github(auth=auth)
        else:
            self._github = None

    def get_db_connection(self):
        return psycopg2.connect(self.db_url)

    def get_github_tokens(self) -> List[str]:
        conn = self.get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT "githubAccessToken" FROM "User";')
        tokens = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return tokens

    def _run(self, action: str, **kwargs) -> Dict[str, Any]:
        if not self._github:
            return {"error": "No GitHub tokens available"}
        if action == "list_repos":
            return self.list_repos()
        elif action == "list_contributors":
            return self.list_contributors(kwargs.get("repo_name"))
        elif action == "get_contributor_evaluation":
            return self.get_contributor_evaluation(
                kwargs.get("repo_name"), kwargs.get("contributor_login")
            )
        else:
            return {"error": f"Unknown action: {action}"}

    def _arun(self, action: str, **kwargs) -> Any:
        raise NotImplementedError("Asynchronous operation is not supported for this tool.")

    def list_repos(self) -> Dict[str, List[str]]:
        repos = [repo.name for repo in self._github.get_user().get_repos()]
        return {"repositories": repos}

    def list_contributors(self, repo_name: Optional[str] = None) -> Dict[str, Any]:
        if repo_name:
            repo = self._find_repo(repo_name)
            if not repo:
                return {"error": f"Repository '{repo_name}' not found"}
            return self._get_repo_contributors(repo)
        return {
            "contributors": {
                repo.name: self._get_repo_contributors(repo)
                for repo in self._github.get_user().get_repos()
            }
        }
    # Fetch the username of the authenticated user
    def get_github_username(self):
        if not self._github:
            return None
        user = self._github.get_user()
        return user.login  # GitHub username

    def get_contributor_evaluation(self, repo_name: str, contributor_login: str) -> Dict[str, Any]:
        """
        Retrieves all commits for a given contributor and returns a JSON object with the following structure:
        
        {
          "GITHUB USERNAME": "username",
          "commits": [
            {
              "commitMessage": "message",
              "linesChanged": X,
              "filesChanged": Y,
              "closesIssue": true/false
            },
            ...
          ]
        }
        """
        repo = self._find_repo(repo_name)
        if not repo:
            return {"error": f"Repository '{repo_name}' not found"}
        try:
            commits = repo.get_commits(author=contributor_login)
        except GithubException as e:
            return {"error": f"Commit fetch error: {str(e)}"}
        commit_data = []
        for commit in commits:
            commit_detail = self._get_commit_details(repo, commit.sha)
            if not commit_detail:
                continue
            # Determine if the commit message includes a closing reference (e.g. "closes #123")
            closes_issue = bool(re.search(r"closes\s+#\d+", commit_detail.commit.message, re.IGNORECASE))
            commit_data.append({
                "commitMessage": commit_detail.commit.message.strip(),
                "linesChanged": (commit_detail.stats.additions or 0) + (commit_detail.stats.deletions or 0),
                "filesChanged": len(list(commit_detail.files)),
                "closesIssue": closes_issue
            })
        return {
            "GITHUB USERNAME": contributor_login,
            "commits": commit_data
        }

    def _find_repo(self, repo_name: str) -> Optional[Any]:
        for repo in self._github.get_user().get_repos():
            if repo.name.lower() == repo_name.lower():
                return repo
        return None

    def _get_commit_details(self, repo, sha: str) -> Optional[Any]:
        try:
            return repo.get_commit(sha)
        except GithubException:
            return None

    def _get_repo_contributors(self, repo) -> Any:
        try:
            return [{
                "login": c.login,
                "contributions": c.contributions,
                "issues": repo.get_issues(creator=c.login).totalCount,
                "pullRequests": repo.get_pulls(state='all').totalCount
            } for c in repo.get_contributors()]
        except GithubException as e:
            return {"error": str(e)}

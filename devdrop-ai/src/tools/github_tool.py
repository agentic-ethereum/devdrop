# tools/github_tool.py
from langchain.tools import BaseTool
from github import Github, Auth, GithubException
from pydantic import BaseModel, Field, PrivateAttr
from typing import Optional, Any, Dict, List, Type
import os
import re
from dotenv import load_dotenv
from ..api.db import DatabaseOperations

class GitHubToolInput(BaseModel):
    action: str = Field(
        ..., 
        description="The action to perform: list_repos, list_contributors, or get_contributor_evaluation"
    )
    repo_name: Optional[str] = Field(
        None, 
        description="Name of the repository (for listing contributors or evaluation)"
    )
    contributor_login: Optional[str] = Field(
        None, 
        description="Contributor login (for evaluation)"
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
    
    _github: Optional[Any] = PrivateAttr()
    _db: Optional[DatabaseOperations] = PrivateAttr()

    def __init__(self) -> None:
        super().__init__()
        load_dotenv()
        
        # Initialize database operations
        self._db = DatabaseOperations(os.getenv("DB_URL"))
        
        # Initialize GitHub client
        tokens = self._db.get_github_tokens()
        if tokens:
            auth = Auth.Token(tokens[0])
            self._github = Github(auth=auth)
        else:
            self._github = None

    def _run(self, action: str, **kwargs) -> Dict[str, Any]:
        """Execute GitHub actions with automatic data storage"""
        if not self._github:
            return {"error": "No GitHub tokens available"}

        try:
            if action == "list_repos":
                return self.list_repos()
            elif action == "list_contributors":
                result = self.list_contributors(kwargs.get("repo_name"))
                # Store contributor data if successful
                if "error" not in result:
                    self._store_contributors_data(kwargs.get("repo_name"), result)
                return result
            elif action == "get_contributor_evaluation":
                result = self.get_contributor_evaluation(
                    kwargs.get("repo_name"),
                    kwargs.get("contributor_login")
                )
                # Store detailed commit data if successful
                if "error" not in result:
                    self._store_contributor_commits(
                        kwargs.get("repo_name"),
                        kwargs.get("contributor_login"),
                        result
                    )
                return result
            return {"error": f"Unknown action: {action}"}
        except Exception as e:
            return {"error": f"Action failed: {str(e)}"}

    def list_repos(self) -> Dict[str, List[str]]:
        """List all accessible repositories"""
        try:
            repos = [repo.name for repo in self._github.get_user().get_repos()]
            return {"repositories": repos}
        except GithubException as e:
            return {"error": str(e)}

    def list_contributors(self, repo_name: Optional[str] = None) -> Dict[str, Any]:
        """List contributors with their basic information"""
        try:
            if repo_name:
                repo = self._find_repo(repo_name)
                if not repo:
                    return {"error": f"Repository '{repo_name}' not found"}
                contributors = self._get_repo_contributors(repo)
                return {"contributors": contributors}
            
            return {
                "contributors": {
                    repo.name: self._get_repo_contributors(repo)
                    for repo in self._github.get_user().get_repos()
                }
            }
        except GithubException as e:
            return {"error": str(e)}

    def get_contributor_evaluation(self, repo_name: str, contributor_login: str) -> Dict[str, Any]:
        """Get detailed commit information for evaluation"""
        try:
            repo = self._find_repo(repo_name)
            if not repo:
                return {"error": f"Repository '{repo_name}' not found"}

            commits = repo.get_commits(author=contributor_login)
            commit_data = []
            
            for commit in commits:
                commit_detail = self._get_commit_details(repo, commit.sha)
                if commit_detail:
                    commit_data.append(self._process_commit(repo, commit_detail))

            return {
                "GITHUB USERNAME": contributor_login,
                "commits": commit_data
            }
        except GithubException as e:
            return {"error": str(e)}

    def _process_commit(self, repo, commit_detail):
        """Process individual commit details"""
        message = commit_detail.commit.message.strip()
        closes_issue = bool(re.search(r"closes\s+#\d+", message, re.IGNORECASE))
        
        issue_numbers = re.findall(r"(?:fixes|closes)\s+#(\d+)", message, re.IGNORECASE)
        labels = []
        for num in issue_numbers:
            try:
                issue = repo.get_issue(int(num))
                labels.extend([label.name for label in issue.labels])
            except GithubException:
                continue

        return {
            "commitMessage": message,
            "linesChanged": (commit_detail.stats.additions or 0) + (commit_detail.stats.deletions or 0),
            "filesChanged": len(list(commit_detail.files)),
            "closesIssue": closes_issue,
            "issueLabels": labels
        }

    def _find_repo(self, repo_name: str) -> Optional[Any]:
        """Find repository by name"""
        for repo in self._github.get_user().get_repos():
            if repo.name.lower() == repo_name.lower():
                return repo
        return None

    def _get_commit_details(self, repo, sha: str) -> Optional[Any]:
        """Get commit details safely"""
        try:
            return repo.get_commit(sha)
        except GithubException:
            return None

    def _get_repo_contributors(self, repo) -> List[Dict[str, Any]]:
        """Get contributor information for a repository"""
        return [{
            "login": c.login,
            "contributions": c.contributions,
            "issues": repo.get_issues(creator=c.login).totalCount,
            "pullRequests": repo.get_pulls(state='all').totalCount
        } for c in repo.get_contributors()]

    def _store_contributors_data(self, repo_name: str, data: Dict[str, Any]) -> None:
        """Store contributor data in database"""
        if "contributors" in data:
            contributors = data["contributors"]
            if isinstance(contributors, dict):
                # Multiple repos
                for repo, repo_contributors in contributors.items():
                    for contributor in repo_contributors:
                        self._db.store_contributor_data(repo, contributor)
            else:
                # Single repo
                for contributor in contributors:
                    self._db.store_contributor_data(repo_name, contributor)

    def _store_contributor_commits(self, repo_name: str, username: str, data: Dict[str, Any]) -> None:
        """Store detailed commit data in database"""
        if "commits" in data:
            self._db.store_contributor_commits(repo_name, username, data["commits"])
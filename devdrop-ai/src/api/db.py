# db/operations.py
import psycopg2
from psycopg2.extras import Json
from typing import Dict, Any, Optional
import json
from datetime import datetime

class DatabaseOperations:
    def __init__(self, db_url: str):
        self.db_url = db_url

    def get_connection(self):
        return psycopg2.connect(self.db_url)

    def get_github_tokens(self) -> list[str]:
        """Fetch GitHub tokens from database"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT "githubAccessToken" FROM "User";')
                return [row[0] for row in cur.fetchall()]

    def store_contributor_data(self, repo_name: str, contributor: Dict[str, Any]) -> None:
        """Store basic contributor information"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO contributor_data 
                    (contributor, repo_name, contributions) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (contributor, repo_name) 
                    DO UPDATE SET 
                        contributions = EXCLUDED.contributions
                """, (  # Removed trailing comma after contributions
                    contributor["login"],
                    repo_name,
                    Json({
                        "basic_info": {
                            "total_contributions": contributor["contributions"],
                            "total_issues": contributor["issues"],
                            "total_prs": contributor["pullRequests"]
                        },
                        "last_updated": datetime.now().isoformat()
                    })
                ))
                conn.commit()

    def store_contributor_commits(self, repo_name: str, username: str, commits: list) -> None:
        """Store detailed commit information"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE contributor_data 
                    SET contributions = jsonb_set(
                        contributions::jsonb,
                        '{detailed_commits}',
                        %s::jsonb,
                        true
                    )
                    WHERE contributor = %s AND repo_name = %s
                """, (  # Removed trailing comma and fixed WHERE clause alignment
                    Json(commits),
                    username,
                    repo_name
                ))
                conn.commit()

    def store_evaluation(self, repo_name: str, username: str, 
                        reward_points: float, justification: str) -> None:
        """Store evaluation results"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO contribution_evaluations 
                    (contributor, repo_name, reward_points, justification)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (contributor, repo_name) 
                    DO UPDATE SET 
                        reward_points = EXCLUDED.reward_points,
                        justification = EXCLUDED.justification,
                        evaluated_at = CURRENT_TIMESTAMP
                """, (username, repo_name, reward_points, justification))
                conn.commit()

    def get_contributor_data(self, repo_name: str, username: str) -> Optional[Dict]:
        """Fetch stored contributor data"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT contributions 
                    FROM contributor_data 
                    WHERE contributor = %s AND repo_name = %s
                """, (username, repo_name))
                result = cur.fetchone()
                return result[0] if result else None
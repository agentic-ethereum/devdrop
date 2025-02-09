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

    def store_airdrop_info(self, repo_name: str, airdrop_date: datetime, total_tokens: int) -> None:
        """Store repository airdrop information"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO repo_airdrops 
                    (repo_name, airdrop_date, total_tokens) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (repo_name) 
                    DO UPDATE SET 
                        airdrop_date = EXCLUDED.airdrop_date,
                        total_tokens = EXCLUDED.total_tokens
                """, (repo_name, airdrop_date, total_tokens))
                conn.commit()

    def get_token_distribution(self, repo_name: str) -> Dict[str, Any]:
        """Calculate token distribution for a repository"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                # Get total tokens for the repository
                cur.execute("""
                    SELECT total_tokens 
                    FROM repo_airdrops 
                    WHERE repo_name = %s
                """, (repo_name,))
                airdrop_info = cur.fetchone()
                if not airdrop_info:
                    return {"error": "No airdrop information found for this repository"}
                
                total_tokens = airdrop_info[0]

                # Calculate total reward points and individual allocations
                cur.execute("""
                    WITH total_points AS (
                        SELECT SUM(reward_points) as sum_points
                        FROM contribution_evaluations
                        WHERE repo_name = %s
                    )
                    SELECT 
                        ce.contributor,
                        ce.reward_points,
                        CAST(ce.reward_points * %s / NULLIF(tp.sum_points, 0) AS NUMERIC(20, 6)) as token_allocation
                    FROM contribution_evaluations ce
                    CROSS JOIN total_points tp
                    WHERE ce.repo_name = %s
                """, (repo_name, total_tokens, repo_name))
                
                distributions = [{
                    "contributor": row[0],
                    "reward_points": float(row[1]),
                    "token_allocation": float(row[2]) if row[2] is not None else 0
                } for row in cur.fetchall()]

                return {
                    "repo_name": repo_name,
                    "total_tokens": total_tokens,
                    "distributions": distributions
                }
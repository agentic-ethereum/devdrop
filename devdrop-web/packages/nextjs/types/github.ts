export interface Contributor {
  login: string;
  contributions: number;
  issues: number;
  pullRequests: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface CommitEvaluation {
  commitMessage: string;
  linesChanged: number;
  filesChanged: number;
  issueReference?: string;
  issueLabel?: string;
  closesIssue: boolean;
}

export interface ContributorEvaluation {
  login: string;
  commits: CommitEvaluation[];
  totalCommits: number;
  averageLinesChanged: number;
  totalIssuesReferenced: number;
}

import { Contributor } from "../types/github";
import { Session } from "next-auth";
import { useFetchEvaluation } from "~~/github";

interface ContributorCardProps {
  contributor: Contributor;
  session: Session;
  repoFullName: string;
}

export const ContributorCard = ({ contributor, session, repoFullName }: ContributorCardProps) => {
  const {
    data: evaluation,
    isLoading: isEvaluating,
    refetch,
  } = useFetchEvaluation(session.accessToken, repoFullName, contributor.login);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">{contributor.login}</h3>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Commits</div>
              <div className="stat-value text-primary">{contributor.contributions}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Issues</div>
              <div className="stat-value text-secondary">{contributor.issues}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">PRs</div>
              <div className="stat-value text-accent">{contributor.pullRequests}</div>
            </div>
          </div>
        </div>
        <button onClick={() => refetch()} className="btn btn-primary mt-4" disabled={isEvaluating || !!evaluation}>
          {isEvaluating ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Evaluating...
            </>
          ) : evaluation ? (
            "Evaluated"
          ) : (
            "Evaluate"
          )}
        </button>
        {evaluation && (
          <div className="mt-4 bg-base-200 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Evaluation Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">Total Commits</p>
                <p className="font-semibold">{evaluation.totalCommits}</p>
              </div>
              <div>
                <p className="text-sm">Avg. Lines Changed</p>
                <p className="font-semibold">{evaluation.averageLinesChanged.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm">Issues Referenced</p>
                <p className="font-semibold">{evaluation.totalIssuesReferenced}</p>
              </div>
              <div>
                <p className="text-sm">Last Commit</p>
                <p className="font-semibold">{evaluation.commits[0]?.commitMessage.slice(0, 30)}...</p>
              </div>
            </div>
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-sm font-semibold">View Details</summary>
                <div className="mt-2 space-y-2">
                  {evaluation.commits.map((commit, index) => (
                    <div key={index} className="text-sm bg-base-100 p-2 rounded">
                      <p className="font-medium">{commit.commitMessage}</p>
                      <div className="grid grid-cols-3 gap-2 mt-1 text-xs opacity-70">
                        <span>Files: {commit.filesChanged}</span>
                        <span>Lines: {commit.linesChanged}</span>
                        {commit.issueReference && (
                          <span>
                            Issue: #{commit.issueReference} ({commit.issueLabel || "unlabeled"})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

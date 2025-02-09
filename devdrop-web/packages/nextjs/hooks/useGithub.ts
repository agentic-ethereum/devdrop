import { CommitEvaluation, Contributor, ContributorEvaluation } from "../types/github";
import { Octokit } from "@octokit/rest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGithub = (accessToken: string | undefined) => {
  const queryClient = useQueryClient();
  const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;

  const { data: userRepos = [] } = useQuery({
    queryKey: ["userRepos"],
    queryFn: async () => {
      if (!octokit) return [];
      const response = await octokit.request("GET /user/repos");
      return Promise.all(
        response.data.map(async (repo: any) => {
          const stats = await octokit.request(`GET /repos/${repo.full_name}/stats/participation`);
          return { ...repo, stats: stats.data };
        }),
      );
    },
    enabled: !!octokit,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: contributors = [],
    isLoading: isLoadingContributors,
    refetch: refetchContributors,
  } = useQuery({
    queryKey: ["contributors", repoFullName],
    queryFn: async () => {
      if (!octokit || !repoFullName) return [];
      const contributorsResponse = await octokit.request(`GET /repos/${repoFullName}/contributors`);
      return Promise.all(
        contributorsResponse.data.map(async (contributor: any) => {
          const [issues, pulls] = await Promise.all([
            octokit.request(`GET /search/issues`, {
              q: `repo:${repoFullName} author:${contributor.login} type:issue`,
            }),
            octokit.request(`GET /search/issues`, {
              q: `repo:${repoFullName} author:${contributor.login} type:pr`,
            }),
          ]);
          return {
            login: contributor.login,
            contributions: contributor.contributions,
            issues: issues.data.total_count,
            pullRequests: pulls.data.total_count,
          };
        }),
      );
    },
    enabled: !!octokit && !!repoFullName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: repoDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["repoDetails", repoFullName],
    queryFn: async () => {
      if (!octokit || !repoFullName) return null;
      const response = await octokit.request(`GET /repos/${repoFullName}`);
      return response.data;
    },
    enabled: !!octokit && !!repoFullName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const evaluateMutation = useMutation({
    mutationKey: ["evaluate", repoFullName],
    mutationFn: async ({
      repoFullName,
      contributorLogin,
    }: {
      repoFullName: string;
      contributorLogin: string;
    }): Promise<ContributorEvaluation | null> => {
      if (!octokit) return null;

      const commits = await octokit.request(`GET /repos/${repoFullName}/commits`, {
        author: contributorLogin,
        per_page: 100,
      });

      const evaluation: ContributorEvaluation = {
        login: contributorLogin,
        commits: [],
        totalCommits: 0,
        averageLinesChanged: 0,
        totalIssuesReferenced: 0,
      };

      for (const commit of commits.data) {
        const commitDetail = await octokit.request(`GET /repos/${repoFullName}/commits/${commit.sha}`);
        const message = commit.commit.message;

        const issueMatch = message.match(/#(\d+)/);
        const closesMatch = message.toLowerCase().match(/closes #(\d+)/);

        let issueLabel;
        if (issueMatch) {
          try {
            const issue = await octokit.request(`GET /repos/${repoFullName}/issues/${issueMatch[1]}`);
            issueLabel = issue.data.labels[0]?.name;
          } catch (e) {
            // Issue might not exist anymore
          }
        }

        const commitEval: CommitEvaluation = {
          commitMessage: message,
          linesChanged: (commitDetail.data.stats?.additions || 0) + (commitDetail.data.stats?.deletions || 0),
          filesChanged: commitDetail.data.files?.length || 0,
          issueReference: issueMatch ? issueMatch[1] : undefined,
          issueLabel,
          closesIssue: !!closesMatch,
        };

        evaluation.commits.push(commitEval);
      }

      evaluation.totalCommits = evaluation.commits.length;
      evaluation.averageLinesChanged =
        evaluation.commits.reduce((acc, curr) => acc + curr.linesChanged, 0) / evaluation.totalCommits;
      evaluation.totalIssuesReferenced = evaluation.commits.filter(c => c.issueReference).length;

      return evaluation;
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(["evaluations", variables.repoFullName, variables.contributorLogin], data);
      }
    },
  });

  const { data: evaluations = {} } = useQuery({
    queryKey: ["evaluations", repoFullName],
    queryFn: () => ({}),
    enabled: !!repoFullName,
  });

  const [repoFullName, setRepoFullName] = useState<string>("");

  const fetchUserRepos = () => {
    return queryClient.refetchQueries({ queryKey: ["userRepos"] });
  };

  const fetchRepoContributors = (fullName: string) => {
    setRepoFullName(fullName);
    return Promise.all([
      queryClient.refetchQueries({ queryKey: ["repoDetails", fullName] }),
      queryClient.refetchQueries({ queryKey: ["contributors", fullName] }),
    ]);
  };

  return {
    userRepos,
    repoDetails,
    contributors,
    evaluations,
    isLoadingDetails,
    isLoadingContributors,
    isEvaluating: evaluateMutation.isLoading,
    fetchUserRepos,
    fetchRepoContributors,
    evaluateContributor: (repoFullName: string, contributorLogin: string) =>
      evaluateMutation.mutate({ repoFullName, contributorLogin }),
    isAuthenticated: !!octokit,
  };
};

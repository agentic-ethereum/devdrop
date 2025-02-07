"use client";

import { Octokit } from "@octokit/rest";
import { useQuery } from "@tanstack/react-query";
import { CommitEvaluation, Contributor, ContributorEvaluation } from "~~/types/github";

export function useUserRepos(accessToken: string | undefined) {
  const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;
  return useQuery({
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
    enabled: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFetchContributors(accessToken: string | undefined, repoFullName: string | null) {
  const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;

  return useQuery<Contributor[]>({
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
}

export function useFetchRepoDetails(accessToken: string | undefined, repoFullName: string | null) {
  const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;

  return useQuery({
    queryKey: ["repoDetails", repoFullName],
    queryFn: async () => {
      if (!octokit || !repoFullName) return null;
      const response = await octokit.request(`GET /repos/${repoFullName}`);
      return response.data;
    },
    enabled: !!octokit && !!repoFullName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFetchEvaluation(accessToken: string | undefined, repoFullName: string, contributorLogin: string) {
  const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;

  return useQuery({
    queryKey: ["evaluation", repoFullName, contributorLogin],
    queryFn: async () => {
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
    enabled: false,
  });
}

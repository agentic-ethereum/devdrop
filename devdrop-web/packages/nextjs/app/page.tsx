"use client";

import { useState } from "react";
import { Octokit } from "@octokit/rest";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

interface Contributor {
  login: string;
  contributions: number;
  issues: number;
  pullRequests: number;
  linesAdded: number;
  linesDeleted: number;
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: session } = useSession();
  const [userRepos, setUserRepos] = useState<any>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [contributors, setContributors] = useState<Contributor[]>([]);

  if (!session) {
    return null;
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  const fetchUserRepos = async () => {
    const response = await octokit.request("GET /user/repos");
    const reposWithStats = await Promise.all(
      response.data.map(async (repo: any) => {
        const stats = await octokit.request(`GET /repos/${repo.full_name}/stats/participation`);
        return {
          ...repo,
          stats: stats.data,
        };
      }),
    );
    setUserRepos(reposWithStats);
  };

  const fetchRepoContributors = async (repoFullName: string) => {
    setUserRepos([]);

    setSelectedRepo(repoFullName);

    const contributorsResponse = await octokit.request(`GET /repos/${repoFullName}/contributors`);

    const detailedContributors = await Promise.all(
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

    setContributors(detailedContributors);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
        </h1>

        <div className="card bg-base-200 shadow-xl p-6 mb-8">
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {session && (
            <div className="flex flex-col items-center mt-4">
              <p className="my-2 font-medium">Signed in as:</p>
              <p className="badge badge-primary">{session.user?.email}</p>
            </div>
          )}

          <button onClick={fetchUserRepos} className="btn btn-primary mt-6 w-full sm:w-auto sm:mx-auto">
            Fetch Repositories
          </button>
        </div>

        <div className="grid gap-4 mt-4">
          {userRepos.map((repo: any) => (
            <div key={repo.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">{repo.name}</h3>
                  <button onClick={() => fetchRepoContributors(repo.full_name)} className="btn btn-secondary btn-sm">
                    View Contributors
                  </button>
                </div>
                <p className="text-sm opacity-70">{repo.description}</p>
                <div className="card-actions justify-start mt-2">
                  <div className="badge badge-outline">⭐ {repo.stargazers_count}</div>
                  <div className="badge badge-outline">🍴 {repo.forks_count}</div>
                  <div className="badge badge-outline">👀 {repo.watchers_count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedRepo && contributors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Contributors for {selectedRepo}</h2>
            <div className="grid gap-4">
              {contributors.map(contributor => (
                <div key={contributor.login} className="card bg-base-100 shadow-xl">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

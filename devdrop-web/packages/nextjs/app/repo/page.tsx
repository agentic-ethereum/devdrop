"use client";

import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { ContributorCard } from "~~/components/ContributorCard";
import { Address } from "~~/components/scaffold-eth";
import { useFetchContributors, useFetchRepoDetails } from "~~/github";

const RepoPage = () => {
  const { data: session, status } = useSession();
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const repoFullName = searchParams.get("link");

  const { data: repoDetails, isLoading: isLoadingDetails } = useFetchRepoDetails(session?.accessToken, repoFullName);
  const { data: contributors, isLoading: isLoadingContributors } = useFetchContributors(
    session?.accessToken,
    repoFullName,
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-lg"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">DevDrop</span>
          </h1>

          <div className="card bg-base-200 shadow-xl p-6 mb-8">
            <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
            <p className="my-2 font-medium text-center">Please sign in to continue</p>
            <button className="btn btn-primary mt-6 w-full sm:w-auto sm:mx-auto" onClick={() => signIn("github")}>
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!repoFullName) {
    return <div>Repository not found</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        {isLoadingDetails ? (
          <div className="card bg-base-100 shadow-xl mb-8 p-8">
            <div className="flex items-center justify-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          </div>
        ) : (
          repoDetails && (
            <div className="card bg-base-100 shadow-xl mb-8">
              <div className="card-body">
                <h1 className="text-3xl font-bold mb-2">{repoDetails.name}</h1>
                <p className="text-lg opacity-70 mb-4">{repoDetails.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Stars</div>
                    <div className="stat-value text-primary">{repoDetails.stargazers_count}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Forks</div>
                    <div className="stat-value text-secondary">{repoDetails.forks_count}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Open Issues</div>
                    <div className="stat-value text-accent">{repoDetails.open_issues_count}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Watchers</div>
                    <div className="stat-value">{repoDetails.subscribers_count}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-bold">Default Branch:</span> {repoDetails.default_branch}
                    </p>
                    <p>
                      <span className="font-bold">Language:</span> {repoDetails.language}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-bold">Created:</span>{" "}
                      {new Date(repoDetails.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-bold">Last Updated:</span>{" "}
                      {new Date(repoDetails.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {repoDetails.topics?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {repoDetails.topics.map((topic: string) => (
                        <span key={topic} className="badge badge-primary">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        <h2 className="text-2xl font-bold mb-6">Contributors</h2>
        {isLoadingContributors ? (
          <div className="flex items-center justify-center p-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {contributors &&
              contributors.map(contributor => (
                <ContributorCard
                  key={contributor.login}
                  contributor={contributor}
                  session={session}
                  repoFullName={repoFullName}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoPage;

"use client";

import Image from "next/image";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useAccount } from "wagmi";
import { RepositoryCard } from "~~/components/RepositoryCard";
import { Address } from "~~/components/scaffold-eth";
import { useUserRepos } from "~~/github";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: session, status } = useSession();
  const { data: userRepos, isLoading, refetch } = useUserRepos(session?.accessToken || "");

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
            <button
              className="btn btn-primary mt-6 w-full sm:w-auto sm:mx-auto"
              onClick={() => signIn("github", { callbackUrl: "/" }, { walletAddress: connectedAddress })}
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFetchClick = async () => {
    refetch();
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">DevDrop</span>
        </h1>

        <div className="card bg-base-200 shadow-xl max-w-lg p-6 mb-8">
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {session && (
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-4 mb-4">
                {session.user?.image && (
                  <div className="avatar">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ""}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center items-baseline">
                  <h3 className="text-xl font-semibold m-0">{session.user?.name}</h3>
                  <p className="text-sm opacity-75 m-0">{session.user?.email}</p>
                </div>
              </div>
              <div className="divider"></div>
            </div>
          )}

          <button
            onClick={() => handleFetchClick()}
            disabled={isLoading}
            className="btn btn-primary mt-6 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Fetching Repositories...
              </>
            ) : (
              "Fetch Repositories"
            )}
          </button>
        </div>

        <div className="grid gap-4 mt-4">
          {userRepos && userRepos.map(repo => <RepositoryCard key={repo.id} repo={repo} />)}
        </div>
      </div>
    </div>
  );
};

export default Home;

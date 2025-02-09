-- CreateTable
CREATE TABLE "ContributorData" (
    "contributor" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "contributions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributorData_pkey" PRIMARY KEY ("contributor","repoName")
);

-- CreateTable
CREATE TABLE "ContributionEvaluations" (
    "contributor" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "rewardPoints" DECIMAL(20,6) NOT NULL,
    "justification" TEXT NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributionEvaluations_pkey" PRIMARY KEY ("contributor","repoName")
);

-- CreateTable
CREATE TABLE "RepoAirdrops" (
    "repoName" TEXT NOT NULL,
    "airdropDate" TIMESTAMP(3) NOT NULL,
    "totalTokens" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoAirdrops_pkey" PRIMARY KEY ("repoName")
);

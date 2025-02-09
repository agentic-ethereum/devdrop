-- CreateTable
CREATE TABLE "tokenAddress" (
    "id" SERIAL NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenClaimAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokenAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokenAddress_tokenAddress_key" ON "tokenAddress"("tokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "tokenAddress_tokenClaimAddress_key" ON "tokenAddress"("tokenClaimAddress");

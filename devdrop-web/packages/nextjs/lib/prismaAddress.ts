"use server";

import { PrismaClient, tokenAddress } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getAddress({ id }: number): Promise<tokenAddress> {
  return await prisma.tokenAddress.findUnique({
    where: {
      id,
    },
  });
}

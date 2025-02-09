"use server";

import { PrismaClient, tokenAddress } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getAddress(id: string): Promise<tokenAddress | null> {
  console.log(id, "id on prisma");
  return await prisma.tokenAddress.findUnique({
    where: {
      id: Number(id),
    },
  });
}

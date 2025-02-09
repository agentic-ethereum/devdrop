import { auth } from "~~/auth";
import Prisma from "~~/lib/prisma/prisma";

export async function POST(request: Request) {
  
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { walletAddress } = await request.json();

  const updatedUser = await Prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress },
  });

  return Response.json({ user: updatedUser });
}

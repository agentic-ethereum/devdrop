import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Prisma from "~~/lib/prisma/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const walletAddress = (account.state as { walletAddress?: string })?.walletAddress || "";

        // Create or update user in database
        const prismaUser = await Prisma.user.create({
          data: {
            githubAccessToken: account.access_token,
            walletAddress: walletAddress,
          },
        });

        token.id = prismaUser.id;
        token.accessToken = account.access_token;
        token.walletAddress = prismaUser.walletAddress || "";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      session.user.walletAddress = token.walletAddress as string;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      walletAddress?: string;
    } & DefaultSession["user"];
  }
}

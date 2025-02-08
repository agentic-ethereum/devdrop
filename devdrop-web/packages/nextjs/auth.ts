import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

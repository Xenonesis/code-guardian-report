import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user:email read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.providerAccountId) return false;

      await prisma.user.upsert({
        where: { githubId: account.providerAccountId },
        update: {
          email: user.email,
          username: user.name,
          avatarUrl: user.image,
        },
        create: {
          githubId: account.providerAccountId,
          email: user.email,
          username: user.name,
          avatarUrl: user.image,
        },
      });

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

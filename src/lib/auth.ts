import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

      try {
        const dbUser = await prisma.user.upsert({
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
        // Store the database user ID for the JWT callback
        (user as any).dbId = dbUser.id;
        return true;
      } catch (error) {
        console.error("Failed to upsert user:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Use the database UUID, not the GitHub provider ID
        token.sub = (user as any).dbId || account.providerAccountId;
        token.githubId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).githubId = (user as any).githubId;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

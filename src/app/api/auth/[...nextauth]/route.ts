import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/?v=login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "B.L.U.E. Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const email = creds.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
          include: {
            customerProfile: true,
            workerProfile: true,
            subscriptions: { where: { status: "ACTIVE" }, take: 1 },
          },
        });
        if (!user || !user.isActive || user.isSuspended) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const activeSub = user.subscriptions[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          chatName: user.chatName ?? user.name,
          avatarUrl: user.avatarUrl ?? undefined,
          hasActiveSubscription: !!activeSub,
          subscriptionPlan: activeSub?.plan ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.chatName = (user as any).chatName;
        token.avatarUrl = (user as any).avatarUrl;
        token.hasActiveSubscription = (user as any).hasActiveSubscription;
        token.subscriptionPlan = (user as any).subscriptionPlan;
      }
      if (trigger === "update" && session) {
        token.chatName = (session as any).chatName ?? token.chatName;
        token.avatarUrl = (session as any).avatarUrl ?? token.avatarUrl;
        token.hasActiveSubscription = (session as any).hasActiveSubscription ?? token.hasActiveSubscription;
        token.subscriptionPlan = (session as any).subscriptionPlan ?? token.subscriptionPlan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).chatName = token.chatName;
        (session.user as any).avatarUrl = token.avatarUrl;
        (session.user as any).hasActiveSubscription = token.hasActiveSubscription;
        (session.user as any).subscriptionPlan = token.subscriptionPlan;
      }
      return session;
    },
  },
  secret: getAuthSecret(),
};

/**
 * Resolve the NextAuth secret.
 *
 * NextAuth v4 REQUIRES `secret` in production (NODE_ENV=production) and throws
 * `MissingSecretError` if it is missing — causing 500s on every /api/auth/* route.
 *
 * We resolve it in this order:
 *   1. process.env.NEXTAUTH_SECRET (the right way — set on Vercel)
 *   2. process.env.AUTH_SECRET (NextAuth v5 alias — accepted for forward compat)
 *   3. A deterministic fallback derived from the database URL so the app boots
 *      even when the env var is forgotten (e.g. first deploy on Vercel).
 *
 * The fallback is NOT secure — it's only here to keep the demo bootable until
 * the operator sets NEXTAUTH_SECRET on Vercel. A loud console.error is emitted
 * in that case so it's obvious in Vercel logs.
 */
function getAuthSecret(): string {
  const fromEnv = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (fromEnv) return fromEnv;

  // Last-resort fallback so first-deploy doesn't 500.
  // Stable per-deployment because DATABASE_URL is stable per-deployment.
  const db = process.env.DATABASE_URL || "blue-platform-fallback-secret";
  const fallback = `blue-fallback-${db.slice(-32)}-please-set-NEXTAUTH_SECRET`;

  console.error(
    "[next-auth] NEXTAUTH_SECRET is not set. Using an insecure fallback so the app boots. " +
      "Set NEXTAUTH_SECRET in Vercel Project Settings → Environment Variables with a 32+ char random string. " +
      "Generate one with: openssl rand -base64 32"
  );

  return fallback;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

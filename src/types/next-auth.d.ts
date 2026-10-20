import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "CUSTOMER" | "WORKER" | "ADMIN" | "CONTRACTOR";
      chatName?: string;
      avatarUrl?: string;
      hasActiveSubscription?: boolean;
      subscriptionPlan?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "WORKER" | "ADMIN" | "CONTRACTOR";
    chatName?: string;
    avatarUrl?: string;
    hasActiveSubscription?: boolean;
    subscriptionPlan?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "WORKER" | "ADMIN" | "CONTRACTOR";
    chatName?: string;
    avatarUrl?: string;
    hasActiveSubscription?: boolean;
    subscriptionPlan?: string | null;
  }
}

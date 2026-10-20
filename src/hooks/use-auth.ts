import { useSyncExternalStore } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export type Role = "CUSTOMER" | "WORKER" | "ADMIN" | "CONTRACTOR";

export function useAuth() {
  const { data: session, status, update } = useSession();
  return {
    session,
    status,
    user: session?.user,
    role: session?.user?.role,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn,
    signOut,
    update,
  };
}

/**
 * Hydration-safe mount hook to avoid SSR/CSR mismatch.
 * Uses useSyncExternalStore so we never call setState directly inside an effect.
 */
const emptySubscribe = () => () => {};
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}

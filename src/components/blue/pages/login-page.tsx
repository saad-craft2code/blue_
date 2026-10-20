"use client";

import { useState } from "react";
import { useRouter } from "@/hooks/use-router";
import { signIn } from "next-auth/react";
import { BlueLogo } from "../logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function LoginPage({ defaultRole = "CUSTOMER" }: { defaultRole?: "CUSTOMER" | "WORKER" }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        toast({
          title: "Sign in failed",
          description: "Check your email and password, then try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Welcome back to B.L.U.E.",
        description: "You're now signed in.",
      });

      // fetch role and route accordingly
      try {
        const s = await fetch("/api/auth/session").then((r) => r.json());
        const role = s?.user?.role ?? defaultRole;
        if (role === "ADMIN") navigate({ name: "admin" });
        else if (role === "WORKER") navigate({ name: "worker-dashboard" });
        else navigate({ name: "customer" });
      } catch {
        navigate({ name: "customer" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col bg-background">
        <div className="container-prose py-6">
          <button
            onClick={() => navigate({ name: "home" })}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to B.L.U.E.
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <BlueLogo size="md" showWordmark={false} />
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Sign in to your B.L.U.E. account to manage jobs, proposals, and
              conversations.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate({ name: "forgot" })}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to B.L.U.E.?{" "}
              <button
                onClick={() => navigate({ name: "register" })}
                className="text-primary font-medium hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-primary to-brand-800 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" aria-hidden />
        <div className="relative">
          <BlueLogo size="lg" tone="light" />
          <h2 className="mt-8 font-display text-3xl font-bold leading-tight text-balance">
            Better Living Unites Everyone.
          </h2>
          <p className="mt-3 text-white/80 max-w-md text-pretty">
            Find trusted help. Manage your work. Move forward. The premium
            marketplace for relocation, service, and everyday work.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Verified workers with trust badges",
              "End-to-end job lifecycle and timelines",
              "Real-time messaging tied to every job",
              "Smart matching on budget, location, and availability",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                  ✓
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { ArrowRight, Mail, Lock, ArrowLeft, Sparkles, User, Wrench, ShieldCheck } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "Customer",
    email: "aisha@example.com",
    password: "blueplatform",
    icon: User,
    desc: "Post requests, compare proposals, manage jobs.",
    color: "bg-primary/10 text-primary",
  },
  {
    role: "Worker",
    email: "daniel@example.com",
    password: "blueplatform",
    icon: Wrench,
    desc: "Receive job requests, submit proposals, earn.",
    color: "bg-success/10 text-success",
  },
  {
    role: "Admin",
    email: "admin@blue.platform",
    password: "blueplatform",
    icon: ShieldCheck,
    desc: "Manage users, verification, and platform health.",
    color: "bg-warning/15 text-warning",
  },
] as const;

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

  const quickFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast({ title: "Demo credentials filled", description: `Signed in as ${demoEmail}` });
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

            {/* Demo credentials */}
            <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Demo credentials — tap to autofill
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Run the seed once to create these accounts, or use them directly after seeding.
              </p>
              <div className="mt-3 space-y-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => quickFill(d.email, d.password)}
                    className="w-full flex items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-left hover:bg-muted/60 transition"
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-lg shrink-0 ${d.color}`}>
                      <d.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{d.role}</p>
                        <span className="text-[10px] text-muted-foreground">tap to fill</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Password for all demo accounts: <code className="rounded bg-muted px-1 py-0.5 text-[10px]">blueplatform</code>
              </p>
            </div>

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

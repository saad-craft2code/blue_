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
import { ArrowRight, Mail, Lock, ArrowLeft, Sparkles, User, Wrench, ShieldCheck, LogIn } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "Customer",
    email: "aisha@example.com",
    password: "blueplatform",
    icon: User,
    desc: "Post requests, compare proposals, manage jobs.",
    color: "bg-primary/10 text-primary",
    route: "customer" as const,
  },
  {
    role: "Worker",
    email: "daniel@example.com",
    password: "blueplatform",
    icon: Wrench,
    desc: "Receive job requests, submit proposals, earn.",
    color: "bg-success/10 text-success",
    route: "worker-dashboard" as const,
  },
  {
    role: "Admin",
    email: "admin@blue.platform",
    password: "blueplatform",
    icon: ShieldCheck,
    desc: "Manage users, verification, and platform health.",
    color: "bg-warning/15 text-warning",
    route: "admin" as const,
  },
] as const;

export function LoginPage({ defaultRole = "CUSTOMER" }: { defaultRole?: "CUSTOMER" | "WORKER" }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const doSignIn = async (signInEmail: string, signInPassword: string, route?: "customer" | "worker-dashboard" | "admin") => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: signInEmail,
        password: signInPassword,
        redirect: false,
      });
      if (!res || res.error) {
        toast({
          title: "Sign in failed",
          description: "Check your email and password, then try again. Run the seed first if demo accounts don't exist yet.",
          variant: "destructive",
        });
        return false;
      }
      toast({
        title: "Welcome back to B.L.U.E.",
        description: `Signed in as ${signInEmail}`,
      });
      // fetch role and route accordingly
      try {
        const s = await fetch("/api/auth/session").then((r) => r.json());
        const role = s?.user?.role ?? defaultRole;
        if (role === "ADMIN") navigate({ name: "admin" });
        else if (role === "WORKER") navigate({ name: "worker-dashboard" });
        else navigate({ name: "customer" });
      } catch {
        navigate(route ? { name: route } : { name: "customer" });
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSignIn(email, password);
  };

  const quickFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast({ title: "Demo credentials filled", description: `Ready to sign in as ${demoEmail}` });
  };

  const quickLogin = async (demoEmail: string, demoPassword: string, role: "customer" | "worker-dashboard" | "admin") => {
    setActiveDemo(demoEmail);
    setEmail(demoEmail);
    setPassword(demoPassword);
    await doSignIn(demoEmail, demoPassword, role);
    setActiveDemo(null);
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

            {/* One-click Quick login — top of form for fast access */}
            <div className="mt-6 rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Quick login — one click, no typing
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap a role to sign in instantly with seeded demo credentials.
              </p>
              <div className="mt-3 grid gap-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    disabled={loading}
                    onClick={() => quickLogin(d.email, d.password, d.route)}
                    className={`w-full flex items-center gap-3 rounded-lg border bg-background p-2.5 text-left transition disabled:opacity-50 ${activeDemo === d.email ? "border-primary ring-2 ring-primary/20" : "border-border hover:bg-muted/60"}`}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-lg shrink-0 ${d.color}`}>
                      <d.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{d.role}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${activeDemo === d.email ? "text-primary" : "text-muted-foreground"}`}>
                          {activeDemo === d.email ? <><LogIn className="h-3 w-3" /> Signing in…</> : <><LogIn className="h-3 w-3" /> One-click login</>}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Password for all demo accounts: <code className="rounded bg-muted px-1 py-0.5 text-[10px]">blueplatform</code>
                <br />
                <span className="text-[10px]">Tip: tap to sign in instantly, or use the form below to fill then sign in manually.</span>
              </p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
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

            {/* Tap-to-fill panel (for manual sign-in) */}
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Or tap to autofill the form
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => quickFill(d.email, d.password)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-muted/60 transition"
                  >
                    <d.icon className="h-3 w-3" />
                    {d.role}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
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

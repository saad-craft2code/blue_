"use client";

import { useState } from "react";
import { useRouter } from "@/hooks/use-router";
import { signIn } from "next-auth/react";
import { BlueLogo } from "../logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ArrowRight, ArrowLeft, Mail, Lock, User, Phone, MapPin, CheckCircle2 } from "lucide-react";

type Role = "CUSTOMER" | "WORKER";

export function RegisterPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    chatName: "",
    phone: "",
    location: "",
    category: "INDIVIDUAL_WORKER",
    title: "",
    bio: "",
    experienceYears: "",
    startingRate: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        chatName: form.chatName || form.name,
        phone: form.phone || undefined,
        location: form.location || undefined,
      };
      if (role === "WORKER") {
        body.category = form.category;
        body.title = form.title || undefined;
        body.bio = form.bio || undefined;
        body.experienceYears = form.experienceYears ? Number(form.experienceYears) : undefined;
        body.startingRate = form.startingRate ? Number(form.startingRate) : undefined;
      }
      await api("/api/blue/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!res || res.error) {
        toast({
          title: "Account created",
          description: "Please sign in to continue.",
        });
        navigate({ name: "login" });
        return;
      }

      toast({
        title: "Welcome to B.L.U.E.",
        description: "Your account is ready.",
      });

      if (role === "WORKER") navigate({ name: "worker-dashboard" });
      else navigate({ name: "customer" });
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err?.message ?? "Please check your input and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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
              Create your B.L.U.E. account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Join B.L.U.E. as a customer or as a worker — find trusted help or
              grow your work.
            </p>

            {/* Step 1: choose role */}
            {step === 1 && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <Label>I want to join as a…</Label>
                <div className="grid gap-3">
                  {([
                    { value: "CUSTOMER", title: "Customer", desc: "Post requests, compare proposals, manage jobs." },
                    { value: "WORKER", title: "Worker", desc: "Receive requests, submit proposals, grow earnings." },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRole(opt.value);
                        setStep(2);
                      }}
                      className={`rounded-xl border p-4 text-left transition ${role === opt.value ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-foreground/30"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                        </div>
                        {role === opt.value && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  You can switch your role later from settings.
                </p>
              </div>
            )}

            {/* Step 2: form */}
            {step === 2 && (
              <form onSubmit={submit} className="mt-8 space-y-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Change role
                </button>

                <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2 text-xs text-primary font-medium">
                  Joining as: <span className="font-semibold">{role === "CUSTOMER" ? "Customer" : "Worker"}</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" required placeholder="Aisha Rahman" className="pl-9" value={form.name} onChange={(e) => set("name")(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" required placeholder="you@example.com" className="pl-9" value={form.email} onChange={(e) => set("email")(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" required minLength={8} placeholder="Min. 8 characters" className="pl-9" value={form.password} onChange={(e) => set("password")(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="+1 …" className="pl-9" value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Location <span className="text-muted-foreground">(optional)</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="location" placeholder="City, State" className="pl-9" value={form.location} onChange={(e) => set("location")(e.target.value)} />
                    </div>
                  </div>
                </div>

                {role === "WORKER" && (
                  <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/30">
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Worker details</Label>
                      <p className="text-xs text-muted-foreground mt-1">Tells customers who you are. You can edit later.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Select value={form.category} onValueChange={set("category")}>
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL_WORKER">Individual Worker</SelectItem>
                          <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          <SelectItem value="CAR_WASHING">Car Washing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="e.g. Senior mover" value={form.title} onChange={(e) => set("title")(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="years">Years of experience</Label>
                        <Input id="years" type="number" min={0} placeholder="5" value={form.experienceYears} onChange={(e) => set("experienceYears")(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rate">Starting rate ($/hr)</Label>
                      <Input id="rate" type="number" min={0} placeholder="22" value={form.startingRate} onChange={(e) => set("startingRate")(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Short bio</Label>
                      <Textarea id="bio" rows={3} placeholder="Tell customers about your skills and approach." value={form.bio} onChange={(e) => set("bio")(e.target.value)} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Creating account…" : "Create account"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By signing up you agree to B.L.U.E.'s Terms and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-primary to-brand-800 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" aria-hidden />
        <div className="relative">
          <BlueLogo size="lg" tone="light" />
          <h2 className="mt-8 font-display text-3xl font-bold leading-tight text-balance">
            Find trusted help. Manage your work. Move forward.
          </h2>
          <p className="mt-3 text-white/80 max-w-md text-pretty">
            Join thousands of customers and workers building better living with B.L.U.E.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "End-to-end job lifecycle with timelines",
              "Verified workforce with trust badges",
              "Real-time messaging tied to every job",
              "Subscription plans for workers starting at $14.99/mo",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

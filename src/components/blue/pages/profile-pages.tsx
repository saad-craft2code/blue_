"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "../avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "../empty-state";
import { useRouter } from "@/hooks/use-router";
import { CheckCircle2, Sparkles } from "lucide-react";

export function ProfilePage({ variant = "customer" }: { variant?: "customer" | "worker" }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<any>("/api/blue/me"),
  });

  const [form, setForm] = useState<any>(null);
  // Initialize form when me loads
  if (me && !form) {
    setForm({
      name: me.name ?? "",
      chatName: me.chatName ?? me.name ?? "",
      phone: me.phone ?? "",
      location: me.location ?? "",
      avatarUrl: me.avatarUrl ?? "",
      // Worker
      title: me.workerProfile?.title ?? "",
      bio: me.workerProfile?.bio ?? "",
      experienceYears: me.workerProfile?.experienceYears ?? 0,
      startingRate: me.workerProfile?.startingRate ?? "",
      isAvailable: me.workerProfile?.isAvailable ?? true,
      services: Array.isArray(me.workerProfile?.services) ? me.workerProfile.services : [],
      // Customer
      address: me.customerProfile?.address ?? "",
      city: me.customerProfile?.city ?? "",
      state: me.customerProfile?.state ?? "",
      zipCode: me.customerProfile?.zipCode ?? "",
    });
  }

  const save = useMutation({
    mutationFn: () => api("/api/blue/me", { method: "PATCH", body: JSON.stringify(form) }),
    onSuccess: async () => {
      toast({ title: "Profile updated" });
      qc.invalidateQueries({ queryKey: ["me"] });
      // Refresh NextAuth session token
      try {
        const res = await fetch("/api/auth/session?update=1");
        if (res.ok) {
          // Trigger NextAuth session refresh
          // @ts-ignore
          if (window.nextauth) window.nextauth.update();
        }
      } catch {}
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <AppShell variant={variant}>
      <PageHeader
        title="Profile"
        description="Manage your personal information and account details."
        action={
          <Button disabled={!form || save.isPending} onClick={() => save.mutate()}>
            Save changes
          </Button>
        }
      />
      {isLoading || !form ? (
        <LoadingState rows={4} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <DashboardCard title="Identity" description="Your name and chat display name">
              <div className="flex items-start gap-4">
                <Avatar name={form.name} src={form.avatarUrl || undefined} verified={me.workerProfile?.verificationStatus === "VERIFIED"} size="xl" />
                <div className="flex-1 grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chatName">Chat display name</Label>
                    <Input id="chatName" value={form.chatName} onChange={(e) => set("chatName", e.target.value)} />
                    <p className="text-xs text-muted-foreground">Shown to other users in conversations.</p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Contact" description="Phone, location, and avatar">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 …" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, State" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input id="avatarUrl" value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…" />
                </div>
              </div>
            </DashboardCard>

            {variant === "worker" && (
              <DashboardCard title="Worker profile" description="Visible to customers in the marketplace">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Senior mover" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rate">Starting rate ($/hr)</Label>
                    <Input id="rate" type="number" min={0} value={form.startingRate} onChange={(e) => set("startingRate", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="years">Years of experience</Label>
                    <Input id="years" type="number" min={0} value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <Label htmlFor="available" className="font-medium">Available</Label>
                    <Switch id="available" checked={form.isAvailable} onCheckedChange={(v) => set("isAvailable", v)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
                  </div>
                </div>
                {me.workerProfile && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Verification</p>
                        <p className="text-sm font-medium capitalize">{me.workerProfile.verificationStatus.toLowerCase()}</p>
                      </div>
                      {me.workerProfile.verificationStatus !== "VERIFIED" && (
                        <Button variant="outline" size="sm" onClick={() => requestVerification(me.id)}>
                          Request verification
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DashboardCard>
            )}

            {variant === "customer" && (
              <DashboardCard title="Address" description="For on-site services">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street address</Label>
                    <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
                  </div>
                </div>
              </DashboardCard>
            )}
          </div>

          <aside className="space-y-6">
            <DashboardCard title="Account" description="Email, role, status">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
                  <dd className="font-medium mt-0.5 break-all">{me.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Role</dt>
                  <dd className="font-medium mt-0.5 capitalize">{me.role.toLowerCase()}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Member since</dt>
                  <dd className="font-medium mt-0.5">{new Date(me.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </DashboardCard>

            <DashboardCard title="Stats">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Active jobs" value={me.stats?.activeJobs ?? 0} />
                <Stat label="Completed" value={me.stats?.completedJobs ?? 0} />
                <Stat label="Proposals" value={me.stats?.pendingProposals ?? 0} />
                <Stat label="Favorites" value={me.stats?.favorites ?? 0} />
              </dl>
            </DashboardCard>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

async function requestVerification(userId: string) {
  // Use the me PATCH to set verification to pending (workers only) - server should enforce
  // For simplicity, we make a dedicated call:
  await fetch("/api/blue/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verificationRequest: true }),
  });
  alert("Verification request submitted. The B.L.U.E. team will review your profile.");
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function SettingsPage({ variant = "customer" }: { variant?: "customer" | "worker" }) {
  return (
    <AppShell variant={variant}>
      <PageHeader title="Settings" description="Account preferences and platform settings." />
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard title="Notifications" description="Choose how you want to be notified">
          <div className="space-y-3">
            <Toggle label="Email notifications" defaultChecked />
            <Toggle label="Push notifications" defaultChecked />
            <Toggle label="Weekly digest" />
          </div>
        </DashboardCard>
        <DashboardCard title="Privacy" description="Control who can see your data">
          <div className="space-y-3">
            <Toggle label="Show profile to workers" defaultChecked />
            <Toggle label="Show completed jobs" defaultChecked />
            <Toggle label="Allow direct messages" defaultChecked />
          </div>
        </DashboardCard>
        <DashboardCard title="Security" description="Account access and safety">
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start">Change password</Button>
            <Button variant="outline" size="sm" className="w-full justify-start">Two-factor authentication</Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-destructive">Sign out all devices</Button>
          </div>
        </DashboardCard>
        <DashboardCard title="Danger zone" description="Account deletion">
          <Button variant="outline" size="sm" className="w-full justify-start text-destructive border-destructive/30">
            Delete account
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">This action is permanent and cannot be undone.</p>
        </DashboardCard>
      </div>
    </AppShell>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

export function SubscriptionPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api<any>("/api/blue/subscription"),
  });

  const subscribe = useMutation({
    mutationFn: (plan: "MONTHLY" | "YEARLY") =>
      api("/api/blue/subscription", { method: "POST", body: JSON.stringify({ action: "subscribe", plan }) }),
    onSuccess: () => {
      toast({ title: "Subscription activated" });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const cancel = useMutation({
    mutationFn: () => api("/api/blue/subscription", { method: "POST", body: JSON.stringify({ action: "cancel" }) }),
    onSuccess: () => {
      toast({ title: "Subscription cancelled" });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  if (isLoading) return <AppShell><LoadingState rows={4} /></AppShell>;

  return (
    <AppShell>
      <PageHeader
        title="Subscription"
        description="Your B.L.U.E. membership. Customers post requests free; workers subscribe for unlimited proposals."
      />

      {data?.active && (
        <DashboardCard className="mb-6 border-primary/15 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Active plan</p>
              <p className="mt-1 font-display text-2xl font-bold capitalize">{data.active.plan.toLowerCase()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ${data.active.amount} / {data.active.interval} · Renews {new Date(data.active.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              Cancel
            </Button>
          </div>
        </DashboardCard>
      )}

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        {[
          {
            key: "MONTHLY",
            name: "Monthly",
            price: "$14.99",
            cadence: "per month",
            desc: "Full access for active workers. Cancel any time.",
            features: ["Unlimited proposals", "Real-time messaging", "Availability calendar", "Earnings dashboard", "Verification eligibility"],
            highlight: false,
          },
          {
            key: "YEARLY",
            name: "Yearly",
            price: "$199.99",
            cadence: "per year",
            desc: "Save 28% versus monthly. Best for full-time professionals.",
            features: ["Everything in Monthly", "Priority placement", "Advanced analytics", "Saved searches", "Priority support"],
            highlight: true,
          },
        ].map((p) => (
          <div
            key={p.key}
            className={`rounded-2xl border bg-card p-7 relative ${p.highlight ? "ring-2 ring-primary shadow-glow" : ""}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                <Sparkles className="h-3 w-3" /> Best value
              </span>
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-3 text-4xl font-bold font-display tracking-tight">{p.price}</p>
            <p className="text-sm text-muted-foreground">{p.cadence}</p>
            <p className="mt-3 text-sm text-muted-foreground text-pretty">{p.desc}</p>
            <ul className="mt-5 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={p.highlight ? "default" : "outline"}
              disabled={subscribe.isPending || data?.active?.plan === p.key}
              onClick={() => subscribe.mutate(p.key as any)}
            >
              {data?.active?.plan === p.key ? "Current plan" : `Choose ${p.name.toLowerCase()}`}
            </Button>
          </div>
        ))}
      </div>

      {data?.history?.length > 0 && (
        <div className="mt-10">
          <DashboardCard title="Billing history">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Plan</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Start</th>
                    <th className="py-2 pr-4">End</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((s: any) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 capitalize">{s.plan.toLowerCase()}</td>
                      <td className="py-2 pr-4 capitalize">{s.status.toLowerCase()}</td>
                      <td className="py-2 pr-4">${s.amount}</td>
                      <td className="py-2 pr-4">{new Date(s.startDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}
    </AppShell>
  );
}

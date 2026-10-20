"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, StatCard, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "../avatar";
import { VerificationBadge, StatusBadge } from "../status-badge";
import { EmptyState, LoadingState } from "../empty-state";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import {
  Users,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Search,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useState } from "react";

export function AdminDashboard() {
  const { data: m, isLoading } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => api<any>("/api/blue/admin?scope=metrics"),
  });

  return (
    <AppShell variant="admin">
      <PageHeader
        title="Admin overview"
        description="B.L.U.E. platform health and activity."
      />
      {isLoading ? (
        <LoadingState rows={2} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total users" value={m?.totalUsers ?? 0} icon={Users} tone="primary" />
            <StatCard label="Customers" value={m?.customers ?? 0} icon={Users} tone="default" />
            <StatCard label="Workers" value={m?.workers ?? 0} icon={Users} tone="default" />
            <StatCard label="Active jobs" value={m?.activeJobs ?? 0} icon={Briefcase} tone="warning" />
            <StatCard label="Completed jobs" value={m?.completedJobs ?? 0} icon={CheckCircle2} tone="success" />
            <StatCard label="Pending verification" value={m?.pendingVerification ?? 0} icon={ShieldCheck} tone="warning" />
            <StatCard label="Active subscriptions" value={m?.activeSubscriptions ?? 0} icon={CreditCard} tone="primary" />
            <StatCard label="Revenue (MRR est.)" value={`$${(m?.revenue ?? 0).toLocaleString()}`} icon={DollarSign} tone="success" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <DashboardCard title="Platform health">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verification queue</span>
                  <StatusBadge variant="warning">{m?.pendingVerification ?? 0} pending</StatusBadge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active subscription rate</span>
                  <span className="font-medium">
                    {m?.workers ? Math.round(((m?.activeSubscriptions ?? 0) / m.workers) * 100) : 0}% of workers
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jobs per customer (avg)</span>
                  <span className="font-medium">
                    {m?.customers ? ((m?.activeJobs ?? 0) + (m?.completedJobs ?? 0)) / m.customers : 0}
                  </span>
                </li>
              </ul>
            </DashboardCard>
            <DashboardCard title="Recent activity">
              <div className="space-y-3 text-sm">
                <ActivityRow icon={Users} label="New users signed up" value={m?.totalUsers ?? 0} tone="primary" />
                <ActivityRow icon={Briefcase} label="Jobs posted" value={(m?.activeJobs ?? 0) + (m?.completedJobs ?? 0)} tone="warning" />
                <ActivityRow icon={CheckCircle2} label="Jobs completed" value={m?.completedJobs ?? 0} tone="success" />
                <ActivityRow icon={CreditCard} label="New subscriptions" value={m?.activeSubscriptions ?? 0} tone="primary" />
              </div>
            </DashboardCard>
          </div>
        </>
      )}
    </AppShell>
  );
}

function ActivityRow({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "primary" | "warning" | "success" }) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${toneCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-foreground/80">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", q, role],
    queryFn: () => api<any>(`/api/blue/admin?scope=users&q=${encodeURIComponent(q)}&role=${role}`),
  });

  return (
    <AdminUsersContent data={data} isLoading={isLoading} q={q} setQ={setQ} role={role} setRole={setRole} />
  );
}

function AdminUsersContent({ data, isLoading, q, setQ, role, setRole }: any) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const suspend = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: "suspend" | "reactivate" }) =>
      api("/api/blue/admin", { method: "PATCH", body: JSON.stringify({ action, userId }) }),
    onSuccess: (_, v) => {
      toast({ title: v.action === "suspend" ? "User suspended" : "User reactivated" });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <AppShell variant="admin">
      <PageHeader title="Users" description="Manage all B.L.U.E. accounts." />
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value="">All roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="WORKER">Workers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState rows={5} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((u: any) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} src={u.avatarUrl ?? undefined} size="sm" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{u.role.toLowerCase()}</td>
                  <td className="p-3">
                    {u.isSuspended ? (
                      <StatusBadge variant="danger">Suspended</StatusBadge>
                    ) : (
                      <StatusBadge variant="success">Active</StatusBadge>
                    )}
                  </td>
                  <td className="p-3 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {u.isSuspended ? (
                      <Button size="sm" variant="ghost" onClick={() => suspend.mutate({ userId: u.id, action: "reactivate" })}>
                        Reactivate
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => suspend.mutate({ userId: u.id, action: "suspend" })}>
                        Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

export function AdminJobsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: () => api<any>("/api/blue/admin?scope=jobs"),
  });

  return (
    <AppShell variant="admin">
      <PageHeader title="All jobs" description="Every job across B.L.U.E." />
      {isLoading ? (
        <LoadingState rows={5} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Briefcase} title="No jobs yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Proposals</th>
                <th className="p-3">Posted</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((j: any) => (
                <tr key={j.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{j.title}</td>
                  <td className="p-3 capitalize">{j.category.replace(/_/g, " ").toLowerCase()}</td>
                  <td className="p-3"><StatusBadge variant="info">{j.status.replace(/_/g, " ").toLowerCase()}</StatusBadge></td>
                  <td className="p-3">{j.customer?.name ?? "—"}</td>
                  <td className="p-3">{j._count?.proposals ?? 0}</td>
                  <td className="p-3 text-xs">{new Date(j.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

export function AdminVerificationPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "verification"],
    queryFn: () => api<any>("/api/blue/admin?scope=verification"),
  });

  const act = useMutation({
    mutationFn: ({ workerId, status }: { workerId: string; status: "VERIFIED" | "REJECTED" }) =>
      api("/api/blue/admin", { method: "PATCH", body: JSON.stringify({ action: "verify", workerId, status }) }),
    onSuccess: (_, v) => {
      toast({ title: v.status === "VERIFIED" ? "Worker verified" : "Worker rejected" });
      qc.invalidateQueries({ queryKey: ["admin", "verification"] });
    },
  });

  return (
    <AppShell variant="admin">
      <PageHeader title="Worker verification" description="Review pending worker verifications." />
      {isLoading ? (
        <LoadingState rows={3} />
      ) : !data?.data?.length ? (
        <EmptyState icon={ShieldCheck} title="No pending verifications" description="Workers requesting verification will appear here." />
      ) : (
        <div className="space-y-3">
          {data.data.map((w: any) => (
            <div key={w.id} className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4">
              <Avatar name={w.user.name} src={w.user.avatarUrl ?? undefined} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{w.user.name}</p>
                    <p className="text-xs text-muted-foreground">{w.user.email}</p>
                    <p className="text-xs text-muted-foreground">{w.user.location ?? "No location"}</p>
                  </div>
                  <VerificationBadge status={w.verificationStatus} />
                </div>
                <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-xs">
                  <div><dt className="text-muted-foreground">Category</dt><dd className="font-medium capitalize">{w.category.replace(/_/g, " ").toLowerCase()}</dd></div>
                  <div><dt className="text-muted-foreground">Experience</dt><dd className="font-medium">{w.experienceYears} years</dd></div>
                  <div><dt className="text-muted-foreground">Rate</dt><dd className="font-medium">${w.startingRate ?? "—"}/hr</dd></div>
                </dl>
                {w.bio && <p className="mt-3 text-sm text-foreground/90">{w.bio}</p>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => act.mutate({ workerId: w.id, status: "REJECTED" })}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => act.mutate({ workerId: w.id, status: "VERIFIED" })}>
                    Approve verification
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function AdminSubscriptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => api<any>("/api/blue/admin?scope=subscriptions"),
  });
  return (
    <AppShell variant="admin">
      <PageHeader title="Subscriptions" description="All B.L.U.E. subscription history." />
      {isLoading ? (
        <LoadingState rows={5} />
      ) : !data?.data?.length ? (
        <EmptyState icon={CreditCard} title="No subscriptions" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Start</th>
                <th className="p-3">Renews</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((s: any) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3">{s.user?.name ?? "—"}</td>
                  <td className="p-3 capitalize">{s.plan.toLowerCase()}</td>
                  <td className="p-3 capitalize">{s.status.toLowerCase()}</td>
                  <td className="p-3">${s.amount}</td>
                  <td className="p-3 text-xs">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

export function AdminReportsPage() {
  return (
    <AppShell variant="admin">
      <PageHeader title="Reports & analytics" description="Aggregate platform insights." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Conversion (visitor → sign-up)" value="3.4%" icon={TrendingUp} tone="primary" delta="Above industry avg" />
        <StatCard label="Worker activation" value="68%" icon={UserCheck} tone="success" delta="Workers w/ ≥1 proposal" />
        <StatCard label="Churn (30-day)" value="2.1%" icon={UserX} tone="warning" />
      </div>
      <DashboardCard title="Coming soon">
        <EmptyState icon={FileText} title="Detailed analytics" description="Granular dashboards for cohort analysis, retention, and revenue tracking are being prepared." />
      </DashboardCard>
    </AppShell>
  );
}

export function AdminSettingsPage() {
  return (
    <AppShell variant="admin">
      <PageHeader title="Platform settings" description="Global B.L.U.E. configuration." />
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard title="General">
          <p className="text-sm text-muted-foreground">Platform name, contact email, and locale.</p>
        </DashboardCard>
        <DashboardCard title="Pricing">
          <p className="text-sm text-muted-foreground">Monthly: $14.99 · Yearly: $199.99</p>
        </DashboardCard>
        <DashboardCard title="Payments">
          <p className="text-sm text-muted-foreground">Payment provider integration point (Stripe / Paddle / RevenueCat).</p>
        </DashboardCard>
        <DashboardCard title="Trust & safety">
          <p className="text-sm text-muted-foreground">Reporting thresholds and moderation rules.</p>
        </DashboardCard>
      </div>
    </AppShell>
  );
}

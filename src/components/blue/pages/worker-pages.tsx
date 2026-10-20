"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, StatCard, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "../avatar";
import { JobStatusBadge, VerificationBadge } from "../status-badge";
import { EmptyState, LoadingState } from "../empty-state";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import {
  Briefcase,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export function WorkerDashboard() {
  const { navigate } = useRouter();
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<any>("/api/blue/me"),
  });
  const { data: jobs } = useQuery({
    queryKey: ["jobs", "available", "dashboard"],
    queryFn: () => api<any>("/api/blue/jobs?scope=available&limit=5"),
  });

  const completionPct = me?.workerProfile
    ? Math.min(
        100,
        Math.round(
          ([
            me.workerProfile.title,
            me.workerProfile.bio,
            me.workerProfile.startingRate,
            me.workerProfile.experienceYears != null,
            me.workerProfile.isAvailable,
            me.workerProfile.verificationStatus !== "UNVERIFIED",
          ].filter(Boolean).length / 6) * 100
        )
      )
    : 0;

  return (
    <AppShell variant="worker">
      <PageHeader
        title={`Hello, ${me?.name?.split(" ")[0] ?? "Worker"}`}
        description="Your worker dashboard — find jobs, track proposals, and grow your earnings."
        action={
          <Button onClick={() => navigate({ name: "worker-jobs" })}>
            Browse available jobs <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Available jobs" value={jobs?.total ?? 0} icon={Briefcase} tone="primary" />
        <StatCard label="Pending proposals" value={me?.stats?.pendingProposals ?? 0} icon={FileText} tone="warning" />
        <StatCard label="Active jobs" value={me?.stats?.activeJobs ?? 0} icon={Clock} tone="info" />
        <StatCard label="Completed" value={me?.stats?.completedJobs ?? 0} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard
            title="Available jobs"
            description="Open requests matching your category"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "worker-jobs" })}>
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            }
          >
            {!jobs?.data?.length ? (
              <EmptyState icon={Briefcase} title="No jobs available" description="New requests in your category will appear here." />
            ) : (
              <div className="space-y-3">
                {jobs.data.map((j: any) => (
                  <button
                    key={j.id}
                    onClick={() => navigate({ name: "worker-job", id: j.id })}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border p-4 hover:bg-muted/30 transition w-full text-left"
                  >
                    <div>
                      <p className="font-medium">{j.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{j.description}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location ?? "Remote"}</span>
                        {j.budgetMin && <span>${j.budgetMin} – ${j.budgetMax}</span>}
                        <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Profile completion">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 grid place-items-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary"
                    strokeDasharray={`${completionPct}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm font-semibold">{completionPct}%</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{completionPct < 100 ? "Almost there" : "Complete!"}</p>
                <p className="text-xs text-muted-foreground">Higher completion improves placement.</p>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate({ name: "worker-profile" })}>
                  Edit profile
                </Button>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Verification">
            {me?.workerProfile ? (
              <div>
                <VerificationBadge status={me.workerProfile.verificationStatus} />
                <p className="mt-3 text-sm text-muted-foreground">
                  Verified workers earn more trust and priority placement.
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate({ name: "worker-profile" })}>
                  Manage verification
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No worker profile.</p>
            )}
          </DashboardCard>
        </div>
      </div>
    </AppShell>
  );
}

export function AvailableJobsPage() {
  const { navigate } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "available"],
    queryFn: () => api<any>("/api/blue/jobs?scope=available&limit=50"),
  });

  return (
    <AppShell variant="worker">
      <PageHeader title="Available Jobs" description="Open customer requests in your category." />
      {isLoading ? (
        <LoadingState rows={4} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Briefcase} title="No available jobs" description="New requests will appear here as customers post them." />
      ) : (
        <div className="space-y-3">
          {data.data.map((j: any) => (
            <button
              key={j.id}
              onClick={() => navigate({ name: "worker-job", id: j.id })}
              className="block w-full text-left rounded-2xl border border-border bg-card p-4 hover:shadow-card transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{j.title}</h3>
                    <JobStatusBadge status={j.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{j.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location ?? "Remote"}</span>
                    {(j.budgetMin || j.budgetMax) && (
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {j.budgetMin ? `$${j.budgetMin}` : "—"} – {j.budgetMax ? `$${j.budgetMax}` : "—"}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function WorkerJobDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api<any>(`/api/blue/jobs/${id}`),
  });

  const [showProposal, setShowProposal] = useState(false);
  const [form, setForm] = useState({
    proposedPrice: "",
    estimatedTime: "",
    availableFrom: "",
    availableTo: "",
    message: "",
    notes: "",
  });

  const submitProposal = useMutation({
    mutationFn: () =>
      api("/api/blue/proposals", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          proposedPrice: Number(form.proposedPrice),
          estimatedTime: form.estimatedTime || undefined,
          availableFrom: form.availableFrom || undefined,
          availableTo: form.availableTo || undefined,
          message: form.message,
          notes: form.notes || undefined,
        }),
      }),
    onSuccess: () => {
      toast({ title: "Proposal submitted" });
      qc.invalidateQueries({ queryKey: ["job", id] });
      setShowProposal(false);
    },
    onError: (e: any) => toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <AppShell variant="worker"><LoadingState rows={4} /></AppShell>;
  if (!job) return <AppShell variant="worker"><EmptyState icon={Briefcase} title="Job not found" /></AppShell>;

  const myProposal = job.proposals?.find((p: any) => p.workerId === job.assignedWorkerId || p.status === "ACCEPTED");

  return (
    <AppShell variant="worker">
      <PageHeader
        title={job.title}
        description={job.description}
        action={
          <div className="flex gap-2">
            <JobStatusBadge status={job.status} />
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <DashboardCard title="Job details">
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Category" value={job.category.replace(/_/g, " ").toLowerCase()} />
              <Row label="Location" value={[job.location, job.city, job.state].filter(Boolean).join(", ") || "—"} />
              <Row label="Preferred date" value={job.preferredDate ? new Date(job.preferredDate).toLocaleString() : "—"} />
              <Row label="Budget" value={job.budgetMin || job.budgetMax ? `$${job.budgetMin ?? "—"} – $${job.budgetMax ?? "—"}` : "—"} />
              <Row label="Posted" value={new Date(job.createdAt).toLocaleString()} />
              <Row label="Proposals" value={String(job.proposals?.length ?? 0)} />
            </dl>
          </DashboardCard>

          {job.assignedWorkerId && job.assignedWorkerId === job.customerId && (
            <DashboardCard title="Active job">
              <p className="text-sm">You've been assigned to this job. Use the chat to coordinate.</p>
              <Button className="mt-3" onClick={() => navigate({ name: "messages" })}>
                Open conversation
              </Button>
            </DashboardCard>
          )}

          {myProposal && !showProposal && (
            <DashboardCard title="Your proposal" description={`Status: ${myProposal.status}`}>
              <p className="text-sm"><strong>${myProposal.proposedPrice}</strong> · {myProposal.estimatedTime ?? "Time TBD"}</p>
              <p className="mt-2 text-sm text-foreground/90">{myProposal.message}</p>
            </DashboardCard>
          )}

          {showProposal ? (
            <DashboardCard title="Submit your proposal">
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Proposed price ($)</Label>
                    <Input id="price" type="number" min={0} value={form.proposedPrice} onChange={(e) => set("proposedPrice", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="time">Estimated time</Label>
                    <Input id="time" placeholder="e.g. 2 hours" value={form.estimatedTime} onChange={(e) => set("estimatedTime", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="from">Available from</Label>
                    <Input id="from" type="datetime-local" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="to">Available to</Label>
                    <Input id="to" type="datetime-local" value={form.availableTo} onChange={(e) => set("availableTo", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="msg">Message to customer</Label>
                  <Textarea id="msg" rows={4} placeholder="Introduce yourself and your approach." value={form.message} onChange={(e) => set("message", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Additional notes <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowProposal(false)}>Cancel</Button>
                  <Button
                    disabled={!form.proposedPrice || form.message.length < 10 || submitProposal.isPending}
                    onClick={() => submitProposal.mutate()}
                  >
                    Submit proposal
                  </Button>
                </div>
              </div>
            </DashboardCard>
          ) : (
            !myProposal && (
              <Button size="lg" onClick={() => setShowProposal(true)}>
                Submit proposal
              </Button>
            )
          )}
        </div>

        <aside>
          <DashboardCard title="Customer">
            <div className="flex items-center gap-3">
              <Avatar name={job.customer.name} src={job.customer.avatarUrl} size="md" />
              <div>
                <p className="font-semibold">{job.customer.name}</p>
                <p className="text-xs text-muted-foreground">{job.customer.location ?? "—"}</p>
              </div>
            </div>
          </DashboardCard>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium mt-0.5">{value}</dd>
    </div>
  );
}

export function WorkerEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "completed"],
    queryFn: () => api<any>("/api/blue/jobs?scope=completed&limit=50"),
  });

  const total = data?.data?.length ?? 0;
  const earnings = data?.data?.reduce((sum: number, j: any) => {
    // Earnings approximation = max budget or midpoint
    const mid = j.budgetMin && j.budgetMax ? (j.budgetMin + j.budgetMax) / 2 : j.budgetMin ?? 0;
    return sum + mid;
  }, 0) ?? 0;

  return (
    <AppShell variant="worker">
      <PageHeader title="Earnings" description="Track revenue from completed jobs." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total earnings" value={`$${earnings.toLocaleString()}`} icon={DollarSign} tone="success" />
        <StatCard label="Jobs completed" value={total} icon={CheckCircle2} tone="primary" />
        <StatCard label="Avg. per job" value={total ? `$${(earnings / total).toFixed(0)}` : "$0"} icon={TrendingUp} tone="default" />
      </div>

      <DashboardCard title="Completed jobs">
        {!data?.data?.length ? (
          <EmptyState icon={CheckCircle2} title="No completed jobs yet" description="Once you complete jobs, your earnings will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Job</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((j: any) => {
                  const mid = j.budgetMin && j.budgetMax ? (j.budgetMin + j.budgetMax) / 2 : j.budgetMin ?? 0;
                  return (
                    <tr key={j.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">{j.title}</td>
                      <td className="py-2 pr-4">{j.completedAt ? new Date(j.completedAt).toLocaleDateString() : "—"}</td>
                      <td className="py-2 pr-4 font-medium">${mid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </AppShell>
  );
}

export function WorkerAvailabilityPage() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api<any>("/api/blue/me") });
  const [available, setAvailable] = useState(me?.workerProfile?.isAvailable ?? true);

  return (
    <AppShell variant="worker">
      <PageHeader title="Availability" description="Control when customers can request you." />
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Status">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="font-medium">{available ? "Available" : "Busy"}</p>
              <p className="text-xs text-muted-foreground">
                {available ? "Customers can request you." : "Hidden from marketplace results."}
              </p>
            </div>
            <Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          </div>
        </DashboardCard>
        <DashboardCard title="Weekly schedule">
          <p className="text-sm text-muted-foreground">Configure your weekly availability hours per day.</p>
          <div className="mt-3 space-y-2 text-sm">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span>{d}</span>
                <span className="text-muted-foreground">9:00 AM – 5:00 PM</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </AppShell>
  );
}

// Minimal switch substitute (the project has shadcn Switch; using it inline to avoid imports)
function Switch({ checked, onChange }: { checked: boolean; onChange: (e: any) => void }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary relative transition">
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </div>
    </label>
  );
}

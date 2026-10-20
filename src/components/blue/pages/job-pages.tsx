"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Avatar } from "../avatar";
import { JobStatusBadge, ProposalStatusBadge } from "../status-badge";
import { EmptyState, LoadingState } from "../empty-state";
import { useRouter } from "@/hooks/use-router";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight, Clock, MapPin, DollarSign, FileText } from "lucide-react";

export function MyJobsPage() {
  const { navigate } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: () => api<any>("/api/blue/jobs?scope=mine&limit=50"),
  });

  return (
    <AppShell variant="customer">
      <PageHeader
        title="My Jobs"
        description="All your requests and their current status."
        action={
          <Button onClick={() => navigate({ name: "customer-new-job" })}>
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        }
      />
      {isLoading ? (
        <LoadingState rows={4} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={FileText}
          title="No jobs yet"
          description="Post your first request to start receiving proposals from verified workers."
          action={<Button onClick={() => navigate({ name: "customer-new-job" })}><Plus className="mr-2 h-4 w-4" /> New request</Button>}
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((j: any) => (
            <button
              key={j.id}
              onClick={() => navigate({ name: "customer-job", id: j.id })}
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
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(j.createdAt).toLocaleDateString()}</span>
                    {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>}
                    {(j.budgetMin || j.budgetMax) && (
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {j.budgetMin ? `$${j.budgetMin}` : "—"} – {j.budgetMax ? `$${j.budgetMax}` : "—"}
                      </span>
                    )}
                    <span>· {j._count?.proposals ?? 0} proposals</span>
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

export function JobDetailPage({ id, variant = "customer" }: { id: string; variant?: "customer" | "worker" | "admin" }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api<any>(`/api/blue/jobs/${id}`),
  });

  const actProposal = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "reject" }) =>
      api(`/api/blue/proposals/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),
    onSuccess: (_, v) => {
      toast({ title: v.action === "accept" ? "Proposal accepted" : "Proposal declined" });
      qc.invalidateQueries({ queryKey: ["job", id] });
    },
    onError: (e: any) => toast({ title: "Action failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <AppShell variant={variant}><LoadingState rows={4} /></AppShell>;
  if (!job) return (
    <AppShell variant={variant}>
      <EmptyState icon={FileText} title="Job not found" />
    </AppShell>
  );

  return (
    <AppShell variant={variant}>
      <PageHeader
        title={job.title}
        description={job.description}
        action={<JobStatusBadge status={job.status} />}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Job meta */}
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

          {/* Timeline */}
          <DashboardCard title="Timeline" description="End-to-end job events">
            <ol className="relative space-y-4 border-l border-border pl-6">
              {job.events?.map((e: any, i: number) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-primary/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <p className="text-sm font-medium">{e.title}</p>
                  {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(e.createdAt).toLocaleString()} · {e.actor?.name ?? "System"}
                  </p>
                </li>
              ))}
              {!job.events?.length && <p className="text-sm text-muted-foreground">No events yet.</p>}
            </ol>
          </DashboardCard>

          {/* Proposals */}
          {variant !== "worker" && (
            <DashboardCard title="Proposals" description={`${job.proposals?.length ?? 0} received`}>
              {!job.proposals?.length ? (
                <EmptyState icon={FileText} title="No proposals yet" description="Proposals will appear here as workers apply." />
              ) : (
                <div className="space-y-3">
                  {job.proposals.map((p: any) => (
                    <div key={p.id} className="rounded-xl border border-border p-4 flex items-start gap-3">
                      <Avatar name={p.worker.name} src={p.worker.avatarUrl} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold">{p.worker.name}</p>
                            <p className="text-xs text-muted-foreground">${p.proposedPrice} · {p.estimatedTime ?? "Time TBD"}</p>
                          </div>
                          <ProposalStatusBadge status={p.status} />
                        </div>
                        <p className="mt-2 text-sm text-foreground/90">{p.message}</p>
                        {p.notes && <p className="mt-1 text-xs text-muted-foreground">Notes: {p.notes}</p>}
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ name: "worker", id: p.worker.id })}
                          >View profile</Button>
                          {p.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actProposal.mutate({ id: p.id, action: "reject" })}
                                disabled={actProposal.isPending}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => actProposal.mutate({ id: p.id, action: "accept" })}
                                disabled={actProposal.isPending}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          {p.status === "ACCEPTED" && (
                            <Button
                              size="sm"
                              onClick={() => navigate({ name: "messages", conversationId: undefined })}
                            >
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          )}
        </div>

        {/* Side */}
        <aside className="space-y-6">
          <DashboardCard title="Customer">
            <div className="flex items-center gap-3">
              <Avatar name={job.customer.name} src={job.customer.avatarUrl} size="md" />
              <div>
                <p className="font-semibold">{job.customer.name}</p>
                <p className="text-xs text-muted-foreground">{job.customer.location ?? "—"}</p>
              </div>
            </div>
            {job.assignedWorkerId && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Assigned worker</p>
                <Button variant="outline" size="sm" onClick={() => navigate({ name: "messages" })}>
                  Message worker
                </Button>
              </div>
            )}
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

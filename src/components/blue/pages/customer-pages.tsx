"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Avatar } from "../avatar";
import { EmptyState, LoadingState } from "../empty-state";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import { Bell, CheckCheck, Heart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<any>("/api/blue/notifications"),
    refetchInterval: 15000,
  });

  const markAll = useMutation({
    mutationFn: () => api("/api/blue/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) }),
    onSuccess: () => {
      toast({ title: "All marked as read" });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOne = useMutation({
    mutationFn: (id: string) =>
      api("/api/blue/notifications", { method: "PATCH", body: JSON.stringify({ id }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <AppShell variant="customer">
      <PageHeader
        title="Notifications"
        description="Recent activity on your account and jobs."
        action={
          data?.unreadCount > 0 ? (
            <Button variant="outline" onClick={() => markAll.mutate()}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          ) : null
        }
      />
      {isLoading ? (
        <LoadingState rows={5} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see proposals, messages, and job updates here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {data.data.map((n: any) => (
            <button
              key={n.id}
              onClick={() => {
                markOne.mutate(n.id);
                if (n.link) {
                  // link is a hash route like #/customer/job/abc
                  const hash = n.link.startsWith("#") ? n.link.slice(1) : n.link;
                  window.location.hash = hash;
                }
              }}
              className={cn(
                "flex items-start gap-3 px-4 py-3 w-full text-left hover:bg-muted/40 transition",
                !n.isRead && "bg-primary/5"
              )}
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground shrink-0">
                <IconForType type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium flex items-center gap-2">
                  {n.title}
                  {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </p>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function FavoritesPage() {
  const { navigate } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api<any>("/api/blue/favorites"),
  });

  return (
    <AppShell variant="customer">
      <PageHeader
        title="Saved Workers"
        description="Workers you've saved for quick access."
      />
      {isLoading ? (
        <LoadingState rows={3} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Save workers from the marketplace to find them quickly later."
          action={<Button onClick={() => navigate({ name: "customer-find" })}>Browse workers</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.data.map((f: any) => (
            <div key={f.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <Avatar name={f.worker.name} src={f.worker.avatarUrl} verified={f.profile?.verificationStatus === "VERIFIED"} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{f.worker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.profile?.title ?? f.profile?.category.replace(/_/g, " ").toLowerCase()}
                </p>
                {f.worker.location && <p className="text-xs text-muted-foreground">{f.worker.location}</p>}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "worker", id: f.worker.id })}>
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function ProposalsListPage({ variant = "customer" }: { variant?: "customer" | "worker" }) {
  const { navigate } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["proposals", variant],
    queryFn: () =>
      api<any>(
        variant === "worker" ? "/api/blue/proposals" : "/api/blue/proposals"
      ),
  });

  return (
    <AppShell variant={variant === "worker" ? "worker" : "customer"}>
      <PageHeader
        title={variant === "worker" ? "My Proposals" : "Proposals"}
        description={variant === "worker" ? "Track proposals you've submitted." : "Review proposals submitted to your jobs."}
      />
      {isLoading ? (
        <LoadingState rows={4} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={FileText}
          title="No proposals yet"
          description={variant === "worker" ? "Browse available jobs and submit your first proposal." : "Proposals appear here once workers apply to your jobs."}
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((p: any) => (
            <button
              key={p.id}
              onClick={() => navigate({ name: variant === "worker" ? "worker-job" : "customer-job", id: p.job.id })}
              className="block w-full text-left rounded-2xl border border-border bg-card p-4 hover:shadow-card transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {variant === "worker" ? p.job.customer?.name ?? "Customer" : p.worker.name} · {p.job.category.replace(/_/g, " ").toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${p.proposedPrice}</p>
                  <ProposalStatusPill status={p.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ProposalStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-info/10 text-info",
    ACCEPTED: "bg-success/10 text-success",
    REJECTED: "bg-destructive/10 text-destructive",
    WITHDRAWN: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

function IconForType({ type }: { type: string }) {
  switch (type) {
    case "NEW_PROPOSAL":
    case "PROPOSAL_ACCEPTED":
    case "PROPOSAL_REJECTED":
      return <FileText className="h-4 w-4" />;
    case "NEW_MESSAGE":
      return <Bell className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

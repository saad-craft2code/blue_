"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, StatCard, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/hooks/use-router";
import { Avatar } from "../avatar";
import { RatingStars } from "../rating-stars";
import { VerificationBadge } from "../status-badge";
import { EmptyState, LoadingState } from "../empty-state";
import {
  Briefcase,
  FileText,
  MessageSquare,
  CheckCircle2,
  Bell,
  Plus,
  Search,
  Users,
  Wrench,
  Car,
  Hammer,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { key: "INDIVIDUAL_WORKER", label: "Individual Worker", icon: Users, color: "bg-primary/10 text-primary" },
  { key: "CONTRACTOR", label: "Contractor", icon: Hammer, color: "bg-warning/15 text-warning" },
  { key: "CAR_WASHING", label: "Car Washing", icon: Car, color: "bg-info/10 text-info" },
];

export function CustomerDashboard() {
  const { navigate } = useRouter();
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<any>("/api/blue/me"),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", "mine", "dashboard"],
    queryFn: () => api<any>("/api/blue/jobs?scope=mine&limit=5"),
  });

  return (
    <AppShell variant="customer">
      <PageHeader
        title={`Welcome back, ${me?.name?.split(" ")[0] ?? ""}`}
        description="Your customer dashboard — manage jobs, review proposals, and message workers."
        action={
          <Button onClick={() => navigate({ name: "customer-new-job" })}>
            <Plus className="mr-2 h-4 w-4" />
            New request
          </Button>
        }
      />

      {/* Quick action */}
      <DashboardCard className="mb-6 bg-gradient-to-br from-primary/5 via-card to-card border-primary/15">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">
              What do you need help with?
            </p>
            <h2 className="mt-1 font-display text-xl font-bold">
              Start a new request
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Pick a category and B.L.U.E. will route your request to the right
              verified workers.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-3 max-w-md">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => navigate({ name: "customer-new-job" })}
                className="rounded-xl border border-border bg-card p-3 text-left hover:shadow-card transition"
              >
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-semibold leading-tight">{c.label}</p>
              </button>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Stats */}
      {meLoading ? (
        <LoadingState rows={1} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard label="Active jobs" value={me?.stats?.activeJobs ?? 0} icon={Briefcase} tone="primary" delta="Open & in-progress" />
          <StatCard label="Pending proposals" value={me?.stats?.pendingProposals ?? 0} icon={FileText} tone="warning" delta="Awaiting your review" />
          <StatCard label="Unread notifications" value={me?.stats?.unreadNotifs ?? 0} icon={Bell} tone="default" delta="Stay in the loop" />
          <StatCard label="Saved workers" value={me?.stats?.favorites ?? 0} icon={CheckCircle2} tone="success" delta="Quick access" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent jobs */}
        <div className="lg:col-span-2">
          <DashboardCard
            title="Recent jobs"
            description="Open and recent requests"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "customer-jobs" })}>
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            }
          >
            {!jobs?.data?.length ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs yet"
                description="Post your first request and start receiving proposals from verified workers."
                action={
                  <Button onClick={() => navigate({ name: "customer-new-job" })}>
                    <Plus className="mr-2 h-4 w-4" /> New request
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {jobs.data.map((j: any) => (
                  <button
                    key={j.id}
                    onClick={() => navigate({ name: "customer-job", id: j.id })}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 hover:bg-muted/30 transition w-full text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{j.title}</p>
                        <StatusPill status={j.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{j.description}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{j._count?.proposals ?? 0} proposals</span>
                        <span>·</span>
                        <span>{j.category.replace(/_/g, " ").toLowerCase()}</span>
                        {j.location && (
                          <>
                            <span>·</span>
                            <span>{j.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Side column: subscription + quick links */}
        <div className="space-y-6">
          <DashboardCard title="Subscription" description="Your B.L.U.E. plan">
            {me?.activeSubscription ? (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold capitalize">{me.activeSubscription.plan.toLowerCase()} plan</p>
                  <span className="rounded-full bg-success/10 text-success text-xs px-2 py-0.5">Active</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Renews {new Date(me.activeSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => navigate({ name: "customer-subscription" })}
                >
                  Manage
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  You're on the free plan. Subscribe for unlimited proposals and priority support.
                </p>
                <Button className="mt-3 w-full" onClick={() => navigate({ name: "customer-subscription" })}>
                  Upgrade
                </Button>
              </div>
            )}
          </DashboardCard>

          <DashboardCard title="Quick actions">
            <div className="grid gap-2">
              <Button variant="ghost" className="justify-start" onClick={() => navigate({ name: "customer-find" })}>
                <Search className="mr-2 h-4 w-4" /> Find help
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate({ name: "customer-proposals" })}>
                <FileText className="mr-2 h-4 w-4" /> Review proposals
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate({ name: "messages" })}>
                <MessageSquare className="mr-2 h-4 w-4" /> Messages
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate({ name: "customer-favorites" })}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Favorites
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </AppShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-info/10 text-info",
    PROPOSAL_RECEIVED: "bg-info/10 text-info",
    ASSIGNED: "bg-primary/10 text-primary",
    IN_PROGRESS: "bg-warning/15 text-warning",
    COMPLETED: "bg-success/10 text-success",
    CANCELLED: "bg-destructive/10 text-destructive",
    DISPUTED: "bg-destructive/10 text-destructive",
  };
  const label = (status || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}

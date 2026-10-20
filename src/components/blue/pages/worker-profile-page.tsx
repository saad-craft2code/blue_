"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader, DashboardCard } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "../avatar";
import { RatingStars } from "../rating-stars";
import { VerificationBadge, StatusBadge } from "../status-badge";
import { EmptyState, LoadingState, ErrorState } from "../empty-state";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import {
  Briefcase,
  MapPin,
  Clock,
  Star,
  Heart,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Wrench,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";

export function WorkerProfilePage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: w, isLoading, error } = useQuery({
    queryKey: ["worker", id],
    queryFn: () => api<any>(`/api/blue/workers/${id}`),
  });

  const [contactMsg, setContactMsg] = useState("");
  const [showContact, setShowContact] = useState(false);

  const startConv = useMutation({
    mutationFn: () =>
      api<any>("/api/blue/conversations", {
        method: "POST",
        body: JSON.stringify({ recipientId: id, subject: `Inquiry about ${w?.title ?? "your services"}` }),
      }),
    onSuccess: (c) => navigate({ name: "messages", conversationId: c.id }),
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const favMut = useMutation({
    mutationFn: (action: "add" | "remove") =>
      action === "add"
        ? api("/api/blue/favorites", { method: "POST", body: JSON.stringify({ workerId: id }) })
        : api(`/api/blue/favorites?workerId=${id}`, { method: "DELETE" }),
    onSuccess: (_, action) => {
      toast({ title: action === "add" ? "Saved" : "Removed" });
      qc.invalidateQueries({ queryKey: ["worker", id] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  if (isLoading) return <AppShell variant="customer"><LoadingState rows={4} /></AppShell>;
  if (error || !w) return (
    <AppShell variant="customer">
      <ErrorState
        title="Worker not found"
        description="This worker may have been removed or is no longer available."
        onRetry={() => navigate({ name: "customer-find" })}
      />
    </AppShell>
  );

  return (
    <AppShell variant="customer">
      <PageHeader
        title={w.name}
        description={w.title ?? w.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => favMut.mutate(w.favorite ? "remove" : "add")}>
              <Heart className={`mr-2 h-4 w-4 ${w.favorite ? "fill-primary text-primary" : ""}`} />
              {w.favorite ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setShowContact((v) => !v)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button onClick={() => navigate({ name: "customer-new-job" })}>
              Request service
            </Button>
          </div>
        }
      />

      {showContact && (
        <DashboardCard className="mb-6 border-primary/20">
          <h3 className="font-semibold mb-2">Start a conversation</h3>
          <Textarea
            placeholder="Hi! Are you available for a 2-hour task this Saturday?"
            rows={3}
            value={contactMsg}
            onChange={(e) => setContactMsg(e.target.value)}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowContact(false)}>Cancel</Button>
            <Button disabled={!contactMsg.trim() || startConv.isPending} onClick={() => startConv.mutate()}>
              {startConv.isPending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </DashboardCard>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* About */}
          <DashboardCard title="About" description={`${w.experienceYears} yrs experience · ${w.completedJobs} jobs completed`}>
            <div className="flex items-start gap-4">
              <Avatar name={w.name} src={w.avatarUrl} verified={w.verificationStatus === "VERIFIED"} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">{w.name}</h2>
                  {w.verificationStatus === "VERIFIED" && <VerificationBadge status="VERIFIED" />}
                </div>
                {w.location && (
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {w.location}
                  </p>
                )}
                <RatingStars value={w.ratingAverage} count={w.ratingCount} size="md" className="mt-2" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge variant={w.isAvailable ? "success" : "neutral"}>
                    {w.isAvailable ? "Available now" : "Currently unavailable"}
                  </StatusBadge>
                  <StatusBadge variant="primary">{w.category.replace(/_/g, " ").toLowerCase()}</StatusBadge>
                </div>
              </div>
            </div>
            {w.bio && (
              <p className="mt-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{w.bio}</p>
            )}
          </DashboardCard>

          {/* Services */}
          {Array.isArray(w.services) && w.services.length > 0 && (
            <DashboardCard title="Services">
              <ul className="grid gap-2 sm:grid-cols-2">
                {w.services.map((s: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                    <span>{typeof s === "string" ? s : s.name ?? JSON.stringify(s)}</span>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          )}

          {/* Portfolio */}
          {w.portfolioUrls?.length > 0 && (
            <DashboardCard title="Portfolio">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {w.portfolioUrls.map((url: string, i: number) => (
                  <img key={i} src={url} alt={`Portfolio ${i + 1}`} className="aspect-square w-full rounded-lg object-cover border border-border" />
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Reviews */}
          <DashboardCard title="Reviews" description={`${w.ratingCount} review${w.ratingCount === 1 ? "" : "s"}`}>
            {!w.reviews?.length ? (
              <EmptyState icon={Star} title="No reviews yet" description="Reviews appear after the first completed job." />
            ) : (
              <div className="space-y-4">
                {w.reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.reviewer.name} src={r.reviewer.avatarUrl} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.reviewer.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <RatingStars value={r.rating} showCount={false} size="xs" />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-foreground/90 text-pretty">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Side */}
        <aside className="space-y-6">
          <DashboardCard title="Pricing & availability">
            {w.startingRate ? (
              <div>
                <p className="text-3xl font-bold font-display">${w.startingRate}<span className="text-base font-normal text-muted-foreground">/hr</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Starting rate</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Rate on request</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge variant={w.isAvailable ? "success" : "neutral"}>{w.isAvailable ? "Available" : "Busy"}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification</span>
                <VerificationBadge status={w.verificationStatus} />
              </div>
              {w.responseTimeHours != null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg response</span>
                  <span className="font-medium">{w.responseTimeHours}h</span>
                </div>
              )}
            </div>
            <Button className="mt-5 w-full" onClick={() => navigate({ name: "customer-new-job" })}>
              <Calendar className="mr-2 h-4 w-4" /> Request service
            </Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => setShowContact(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
          </DashboardCard>

          {w.phone && (
            <DashboardCard title="Contact">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {w.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {w.phone}</div>
              </div>
            </DashboardCard>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

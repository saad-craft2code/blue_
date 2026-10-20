"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "../avatar";
import { RatingStars } from "../rating-stars";
import { VerificationBadge } from "../status-badge";
import { EmptyState, LoadingState } from "../empty-state";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import { Search, SlidersHorizontal, Heart, MapPin, ChevronRight, Star, X } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "INDIVIDUAL_WORKER", label: "Individual Workers" },
  { value: "CONTRACTOR", label: "Contractors" },
  { value: "CAR_WASHING", label: "Car Washing" },
];

const SORTS = [
  { value: "rating", label: "Top rated" },
  { value: "rate_asc", label: "Price: low to high" },
  { value: "rate_desc", label: "Price: high to low" },
  { value: "jobs", label: "Most completed" },
  { value: "recent", label: "Recently joined" },
];

export function FindHelpPage() {
  const { navigate } = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("rating");
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState(200);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce search
  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set("q", debouncedSearch);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (minRating > 0) params.set("minRating", String(minRating));
  if (availableOnly) params.set("available", "true");
  if (maxRate < 300) params.set("maxRate", String(maxRate));
  params.set("limit", "24");

  const { data, isLoading } = useQuery({
    queryKey: ["workers", params.toString()],
    queryFn: () => api<any>(`/api/blue/workers?${params.toString()}`),
    enabled: true,
  });

  return (
    <AppShell variant="customer">
      <PageHeader
        title="Find Help"
        description="Browse verified workers and service providers. Filter by category, availability, rating, and rate."
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Filters</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value || "all"} value={c.value || "all"}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Minimum rating</Label>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    {minRating.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[minRating]}
                  onValueChange={(v) => setMinRating(v[0])}
                  min={0}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Max starting rate</Label>
                  <span className="text-xs text-muted-foreground">${maxRate}/hr</span>
                </div>
                <Slider
                  value={[maxRate]}
                  onValueChange={(v) => setMaxRate(v[0])}
                  min={10}
                  max={300}
                  step={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available only</Label>
                <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setSort("rating");
                  setMinRating(0);
                  setAvailableOnly(false);
                  setMaxRate(200);
                }}
              >
                Reset filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, service, or location…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState rows={4} />
          ) : !data?.data?.length ? (
            <EmptyState
              icon={Search}
              title="No workers found"
              description="Try adjusting your filters or expanding your search radius."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {data.total} worker{data.total === 1 ? "" : "s"} available
              </p>
              {data.data.map((w: any) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  onView={() => navigate({ name: "worker", id: w.userId })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function WorkerCard({ worker, onView }: { worker: any; onView: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const favMut = useMutation({
    mutationFn: (action: "add" | "remove") =>
      action === "add"
        ? api("/api/blue/favorites", { method: "POST", body: JSON.stringify({ workerId: worker.userId }) })
        : api(`/api/blue/favorites?workerId=${worker.userId}`, { method: "DELETE" }),
    onSuccess: (_, action) => {
      toast({ title: action === "add" ? "Saved to favorites" : "Removed from favorites" });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: any) => toast({ title: "Action failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:shadow-card transition flex gap-4">
      <Avatar name={worker.name} src={worker.avatarUrl} verified={worker.verificationStatus === "VERIFIED"} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{worker.name}</h3>
              {worker.verificationStatus === "VERIFIED" && <VerificationBadge status="VERIFIED" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {worker.title ?? worker.category.replace(/_/g, " ").toLowerCase()}
              {worker.location ? ` · ${worker.location}` : ""}
            </p>
            <RatingStars value={worker.ratingAverage} count={worker.ratingCount} size="sm" className="mt-1" />
          </div>
          <button
            onClick={() => favMut.mutate(worker.favorite ? "remove" : "add")}
            className="text-muted-foreground hover:text-primary transition"
            aria-label="Save"
          >
            <Heart className={`h-5 w-5 ${worker.favorite ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>

        {worker.bio && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{worker.bio}</p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{worker.completedJobs} jobs completed</span>
          {worker.experienceYears > 0 && (
            <>
              <span>·</span>
              <span>{worker.experienceYears} yrs exp</span>
            </>
          )}
          {worker.isAvailable && (
            <>
              <span>·</span>
              <span className="text-success font-medium">Available now</span>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm">
            {worker.startingRate ? (
              <>
                <span className="font-semibold">${worker.startingRate}</span>
                <span className="text-muted-foreground">/hr starting</span>
              </>
            ) : (
              <span className="text-muted-foreground">Rate on request</span>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>View profile</Button>
            <Button size="sm" onClick={onView}>Request service <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

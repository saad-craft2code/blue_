"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/hooks/use-router";
import { Check, ArrowRight, ArrowLeft, Users, Hammer, Car, Upload, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "INDIVIDUAL_WORKER", label: "Individual Worker", icon: Users, desc: "Moving, packing, lifting, errands." },
  { value: "CONTRACTOR", label: "Contractor", icon: Hammer, desc: "Renovation, repair, professional projects." },
  { value: "CAR_WASHING", label: "Car Washing", icon: Car, desc: "On-site car wash and detailing." },
];

const STEPS = ["Service", "Description", "Location", "Schedule", "Budget", "Requirements", "Review"];

export function NewJobPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    city: "",
    state: "",
    zipCode: "",
    preferredDate: "",
    budgetMin: "",
    budgetMax: "",
    requirements: [] as string[],
    attachments: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const canNext = () => {
    switch (step) {
      case 0: return !!form.category;
      case 1: return form.title.length >= 4 && form.description.length >= 10;
      case 2: return true; // location optional but recommended
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const job = await api<any>("/api/blue/jobs", {
        method: "POST",
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          description: form.description,
          location: form.location || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipCode: form.zipCode || undefined,
          preferredDate: form.preferredDate || undefined,
          budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
          requirements: form.requirements,
          attachments: form.attachments,
        }),
      });
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Request submitted", description: "Workers can now send proposals." });
      setTimeout(() => navigate({ name: "customer-job", id: job.id }), 1800);
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppShell variant="customer">
        <div className="grid place-items-center py-20">
          <div className="text-center max-w-md">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Your request has been submitted.</h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Workers can now submit proposals. We'll notify you as soon as the first proposal arrives.
            </p>
            <Button className="mt-6" onClick={() => navigate({ name: "customer-jobs" })}>
              Go to my jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell variant="customer">
      <PageHeader
        title="New job request"
        description="Tell us what you need. We'll route your request to verified workers."
      />

      {/* Stepper */}
      <div className="mb-6 overflow-x-auto">
        <ol className="flex items-center gap-1 min-w-max">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={s} className="flex items-center gap-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                    active ? "bg-white/20" : done ? "bg-primary/20" : "bg-muted-foreground/15"
                  }`}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <span className="text-muted-foreground">›</span>}
              </li>
            );
          })}
        </ol>
      </div>

      <Card className="p-6 max-w-2xl">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Select a service</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => set("category", c.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    form.category === c.value
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <c.icon className="h-6 w-6 text-primary" />
                  <p className="mt-2 font-medium text-sm">{c.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Describe what you need</h2>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Help moving 2 bedrooms of furniture"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={5}
                placeholder="Be specific. Include what needs to happen, any constraints, and special considerations."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{form.description.length} characters</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Where is the job?</h2>
            <div className="space-y-2">
              <Label htmlFor="location">Street address <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="location"
                placeholder="123 Main St"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Austin" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="TX" value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" placeholder="78701" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">When do you need it?</h2>
            <div className="space-y-2">
              <Label htmlFor="date">Preferred date & time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={form.preferredDate}
                onChange={(e) => set("preferredDate", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Workers will confirm availability in their proposal.</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Budget</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min">Minimum ($)</Label>
                <Input id="min" type="number" min={0} placeholder="50" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Maximum ($)</Label>
                <Input id="max" type="number" min={0} placeholder="200" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Optional. Helps workers propose realistic rates.</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Additional requirements</h2>
            <div className="space-y-2">
              <Label>Requirements checklist</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Background check", "Owns equipment", "Owns vehicle", "Weekend availability", "Bilingual", "Insurance"].map((req) => {
                  const checked = form.requirements.includes(req);
                  return (
                    <button
                      key={req}
                      onClick={() => {
                        const next = checked
                          ? form.requirements.filter((r) => r !== req)
                          : [...form.requirements, req];
                        set("requirements", next);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className={`grid h-4 w-4 place-items-center rounded border ${checked ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      {req}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attachments <span className="text-muted-foreground">(optional)</span></Label>
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <Upload className="mx-auto h-6 w-6 mb-1" />
                Drag photos or documents here
                <p className="text-xs mt-1">JPG, PNG, PDF up to 10 MB</p>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Review and submit</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Service">{CATEGORIES.find((c) => c.value === form.category)?.label ?? "—"}</Row>
              <Row label="Title">{form.title || "—"}</Row>
              <Row label="Description">
                <span className="text-foreground/80 line-clamp-3">{form.description || "—"}</span>
              </Row>
              <Row label="Location">
                {[form.location, form.city, form.state, form.zipCode].filter(Boolean).join(", ") || "—"}
              </Row>
              <Row label="Preferred date">
                {form.preferredDate ? new Date(form.preferredDate).toLocaleString() : "—"}
              </Row>
              <Row label="Budget">
                {form.budgetMin || form.budgetMax ? `$${form.budgetMin || "0"} – $${form.budgetMax || "—"}` : "—"}
              </Row>
              <Row label="Requirements">{form.requirements.length ? form.requirements.join(", ") : "—"}</Row>
            </dl>
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center justify-between max-w-2xl">
        <Button variant="ghost" onClick={() => (step === 0 ? navigate({ name: "customer" }) : setStep((s) => s - 1))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={submitting} onClick={submit}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground shrink-0 w-24">{label}</dt>
      <dd className="text-sm font-medium text-right flex-1 min-w-0">{children ?? "—"}</dd>
    </div>
  );
}

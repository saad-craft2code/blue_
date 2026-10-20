"use client";

import { PublicLayout } from "../public-layout";
import { useRouter } from "@/hooks/use-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "../avatar";
import { RatingStars } from "../rating-stars";
import { VerificationBadge, StatusBadge } from "../status-badge";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Users,
  MessageSquare,
  CalendarCheck,
  Star,
  HandCoins,
  CheckCircle2,
  Wrench,
  Truck,
  Car,
  Hammer,
  Bell,
  Clock,
  MapPin,
  TrendingUp,
  Quote,
} from "lucide-react";

const CATEGORIES = [
  {
    key: "INDIVIDUAL_WORKER",
    title: "Individual Workers",
    desc: "Reliable help for relocation, packing, lifting, and everyday home tasks.",
    icon: Users,
    starting: 18,
  },
  {
    key: "CONTRACTOR",
    title: "Contractors",
    desc: "Licensed professionals for larger projects, repairs, and renovations.",
    icon: Hammer,
    starting: 45,
  },
  {
    key: "CAR_WASHING",
    title: "Car Washing",
    desc: "On-demand mobile car washing and detailing at your location.",
    icon: Car,
    starting: 25,
  },
];

const STEPS = [
  { title: "Tell us what you need", desc: "Describe the service, your location, and preferred date in minutes." },
  { title: "Receive proposals", desc: "Verified workers submit proposals with pricing, availability, and ratings." },
  { title: "Compare and accept", desc: "Review side-by-side, message workers, and accept the right fit." },
  { title: "Get it done", desc: "Track progress, communicate, and complete with rating and review." },
];

const TRUST = [
  { value: "12k+", label: "Verified workers" },
  { value: "48k+", label: "Jobs completed" },
  { value: "4.9/5", label: "Average rating" },
  { value: "32", label: "States served" },
];

const TESTIMONIALS = [
  {
    name: "Aisha R.",
    role: "Recent relocation",
    body: "B.L.U.E. matched me with two strong workers in under an hour. Loading the truck was effortless — the rating and review system gave me confidence from the start.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Contractor",
    body: "I run a small team. B.L.U.E. gives us a clean pipeline of customer requests with clear budgets, scheduling, and proposal tools. It feels like a proper SaaS for our trade.",
    rating: 5,
  },
  {
    name: "Elena V.",
    role: "Customer",
    body: "We use the car washing service every other week. The worker shows up on time, the pricing is transparent, and the chat keeps everything organized.",
    rating: 5,
  },
];

export function LandingPage() {
  const { navigate } = useRouter();

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div
          className="absolute inset-x-0 -top-32 h-[460px] bg-gradient-to-b from-primary/5 to-transparent"
          aria-hidden
        />
        <div className="container-prose relative pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Now available across 32 U.S. states</span>
              </div>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Better Living Starts With{" "}
                <span className="gradient-text">the Right Help.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
                B.L.U.E. connects customers with trusted workers and service
                providers for relocation and everyday service needs. Find help,
                receive proposals, and manage every job — from request to
                completion — in one polished platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "register" })}
                  className="h-12 px-6 text-base"
                >
                  Find Help
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name: "register" })}
                  className="h-12 px-6 text-base"
                >
                  Join as a Worker
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Verified workers
                </div>
                <div className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  4.9/5 average rating
                </div>
              </div>
            </div>

            {/* Product preview */}
            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-2xl" aria-hidden />
              <div className="relative rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    <Search className="h-3 w-3" />
                    Find help near you…
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">B.L.U.E.</div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-4 border-r border-border p-3 hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Categories</p>
                    <div className="mt-2 space-y-1.5">
                      {CATEGORIES.map((c, i) => (
                        <button
                          key={c.key}
                          className={`w-full text-left rounded-lg px-2.5 py-2 text-xs ${i === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                        >
                          <c.icon className="inline h-3.5 w-3.5 mr-1.5" />
                          {c.title}
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">Filters</p>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded-lg border border-border px-2 py-1.5">
                        <span>Rating</span><span className="text-warning">★ 4.5+</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border px-2 py-1.5">
                        <span>Available</span><span>Today</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-8 p-3 space-y-3">
                    {[
                      { name: "Daniel R.", cat: "Individual Worker", rate: 22, rating: 4.9, jobs: 142, verified: true },
                      { name: "Mariana S.", cat: "Car Washing", rate: 25, rating: 5.0, jobs: 88, verified: true },
                      { name: "Carlos M.", cat: "Contractor", rate: 50, rating: 4.8, jobs: 65, verified: false },
                    ].map((w) => (
                      <div key={w.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition">
                        <Avatar name={w.name} verified={w.verified} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{w.name}</p>
                            {w.verified && <VerificationBadge status="VERIFIED" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{w.cat}</p>
                          <RatingStars value={w.rating} count={w.jobs} size="xs" showCount={false} className="mt-0.5" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${w.rate}<span className="text-xs text-muted-foreground">/hr</span></p>
                          <p className="text-[10px] text-muted-foreground">{w.jobs} jobs</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-primary font-medium">
                      <span>12 more workers match your search</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-border bg-muted/30">
        <div className="container-prose py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TRUST.map((t) => (
              <div key={t.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold font-display text-foreground">
                  {t.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 lg:py-28">
        <div className="container-prose">
          <SectionHeader
            eyebrow="How B.L.U.E. works"
            title="A clear path from request to completion"
            subtitle="Four simple steps. Every job stays organized, transparent, and on the record."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="p-6 hover:shadow-card transition">
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {i + 1}
                  </div>
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 lg:py-24 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Service categories"
            title="Whatever the task, find the right category"
            subtitle="B.L.U.E. organizes the workforce into clear categories — and the architecture is built so new categories can be added without rewriting the platform."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Card key={c.key} className="p-7 hover:shadow-card transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">From ${c.starting}/hr</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-pretty">{c.desc}</p>
                <Button
                  variant="ghost"
                  className="mt-4 px-0 text-primary hover:bg-transparent hover:opacity-80"
                  onClick={() => navigate({ name: "workers" })}
                >
                  Browse {c.title.toLowerCase()} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER + WORKER EXPERIENCE */}
      <section className="py-20 lg:py-24">
        <div className="container-prose grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <SectionHeader
              align="left"
              eyebrow="For customers"
              title="A premium portal for every job"
              subtitle="Post requests, compare proposals, message workers, and track every job through to completion."
            />
            <ul className="mt-8 space-y-4">
              {[
                "Multi-step job request flow with budget, scheduling, and attachments",
                "Side-by-side proposal comparison with ratings and pricing",
                "Real-time messaging with conversation context per job",
                "Saved favorites and saved searches for repeat needs",
                "Job timeline with status transitions and event history",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" />
                  <span className="text-sm text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8" onClick={() => navigate({ name: "for-customers" })}>
              Explore customer experience <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <Card className="p-6 bg-muted/30 border-border">
            <div className="rounded-xl border border-border bg-background p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Your dashboard</p>
                  <p className="font-semibold">Welcome back, Aisha</p>
                </div>
                <StatusBadge variant="success">Subscription active</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Active jobs", value: "2" },
                  { label: "Proposals", value: "5" },
                  { label: "Unread", value: "3" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-lg font-semibold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Upcoming</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">Truck + 2 workers</p>
                    <p className="text-xs text-muted-foreground">Sat, 9:00 AM · Marcus T.</p>
                  </div>
                  <CalendarCheck className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">Car wash — detailing</p>
                    <p className="text-xs text-muted-foreground">Mon, 6:00 PM · Elena V.</p>
                  </div>
                  <CalendarCheck className="h-4 w-4 text-success" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* WORKER EXPERIENCE */}
      <section className="py-20 lg:py-24 border-t border-border bg-muted/30">
        <div className="container-prose grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Card className="p-6 bg-background">
            <div className="rounded-xl border border-border p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name="Marcus T." verified size="md" />
                  <div>
                    <p className="font-semibold">Marcus T.</p>
                    <p className="text-xs text-muted-foreground">Contractor · Verified</p>
                  </div>
                </div>
                <StatusBadge variant="primary">Available</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-2xl font-semibold">$8,240</p>
                  <p className="text-[10px] text-muted-foreground">Total earnings</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-[10px] text-muted-foreground">Completed jobs</p>
                </div>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Available requests</p>
              <div className="mt-2 space-y-2">
                {[
                  { title: "Living room renovation", budget: "$2,000–$3,000", location: "Austin, TX" },
                  { title: "Flooring repair", budget: "$400–$800", location: "Round Rock, TX" },
                ].map((r) => (
                  <div key={r.title} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.title}</p>
                      <HandCoins className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{r.budget}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div>
            <SectionHeader
              align="left"
              eyebrow="For workers"
              title="Grow your work, manage your business"
              subtitle="Receive relevant job requests, submit proposals, manage availability, and track earnings — all from a clean worker portal."
            />
            <ul className="mt-8 space-y-4">
              {[
                "Smart matching on category, radius, budget, and availability",
                "Professional proposal flow with pricing, timing, and notes",
                "Earnings dashboard with completed jobs and revenue trends",
                "Availability calendar to control when you receive requests",
                "Verification system with public trust badge",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8" onClick={() => navigate({ name: "for-workers" })}>
              Explore worker experience <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* MESSAGING PREVIEW */}
      <section className="py-20 lg:py-24">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Messaging"
            title="Every conversation tied to the right job"
            subtitle="Real-time chat with conversation context, file attachments, and read receipts. No more switching between apps and texts."
          />
          <Card className="mt-12 overflow-hidden p-0">
            <div className="grid md:grid-cols-[260px_1fr]">
              <div className="border-r border-border bg-muted/30 p-4 hidden md:block">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Conversations</p>
                <div className="space-y-2">
                  {[
                    { name: "Daniel R.", preview: "Sounds good — I'll be there at 9.", unread: true },
                    { name: "Mariana S.", preview: "Detailing add-on: $30 extra", unread: false },
                    { name: "Carlos M.", preview: "Bid submitted, ready to start", unread: true },
                  ].map((c, i) => (
                    <div key={c.name} className={`rounded-lg p-2.5 text-sm ${i === 0 ? "bg-primary/10" : "hover:bg-muted"}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{c.name}</p>
                        {c.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name="Daniel R." verified size="sm" />
                    <div>
                      <p className="text-sm font-medium">Daniel R.</p>
                      <p className="text-xs text-muted-foreground">Living room move · Job #4f3a</p>
                    </div>
                  </div>
                  <StatusBadge variant="primary">Assigned</StatusBadge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[80%]">
                      Hi Daniel — are you available Saturday morning for a 2-hour move?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-muted text-foreground px-3 py-2 text-sm max-w-[80%]">
                      Yes — 9:00 AM works. I'll bring a dolly and straps.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-muted text-foreground px-3 py-2 text-sm max-w-[80%]">
                      Sounds good — I'll be there at 9.
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Type a message…
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* WHY B.L.U.E. */}
      <section className="py-20 lg:py-24 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Why B.L.U.E."
            title="Built for trust, speed, and clarity"
            subtitle="A platform designed to feel like a serious SaaS — for both customers and the workers who serve them."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified workforce", desc: "Identity verification, background checks, and visible trust badges on every worker profile." },
              { icon: Briefcase, title: "End-to-end job lifecycle", desc: "From draft to completion with deterministic status transitions and a transparent timeline." },
              { icon: MessageSquare, title: "Real-time messaging", desc: "Conversations linked to jobs with read receipts, attachments, and conversation context." },
              { icon: Bell, title: "Smart notifications", desc: "Stay informed on proposals, messages, job updates, and subscriptions — without noise." },
              { icon: Wrench, title: "Flexible categories", desc: "Individual Workers, Contractors, and Car Washing — with an architecture that scales to more." },
              { icon: Clock, title: "Availability-first", desc: "Workers control their calendar; customers see who's actually available when they need help." },
            ].map((c) => (
              <Card key={c.title} className="p-6 hover:shadow-card transition">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{c.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-24">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Voices of B.L.U.E."
            title="What customers and workers say"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <Quote className="h-7 w-7 text-primary/30" />
                <RatingStars value={t.rating} showCount={false} size="sm" className="mt-3" />
                <p className="mt-3 text-sm text-foreground/90 text-pretty">{t.body}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 lg:py-24 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple subscription. Real value."
            subtitle="B.L.U.E. is a membership platform for workers. Customers post requests free."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {[
              {
                name: "Monthly",
                price: "$14.99",
                cadence: "per month",
                desc: "Full access for active workers. Cancel any time.",
                features: ["Unlimited proposals", "Real-time messaging", "Availability calendar", "Earnings dashboard", "Verification eligibility"],
                cta: "Start monthly",
              },
              {
                name: "Yearly",
                price: "$199.99",
                cadence: "per year",
                desc: "Save 28% versus monthly. Best for full-time professionals.",
                features: ["Everything in Monthly", "Priority placement", "Advanced analytics", "Saved searches", "Priority support"],
                cta: "Start yearly",
                highlight: true,
              },
            ].map((p) => (
              <Card key={p.name} className={`p-7 relative ${p.highlight ? "ring-2 ring-primary shadow-glow" : ""}`}>
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
                <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"} onClick={() => navigate({ name: "pricing" })}>
                  {p.cta}
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Customers post requests free. Workers subscribe to receive and submit proposals.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 lg:py-24">
        <div className="container-prose">
          <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-dots opacity-10" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Find trusted help. Manage your work. Move forward.
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-white/80 text-pretty">
                Join thousands of customers and workers building better living with B.L.U.E.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate({ name: "register" })}>
                  Find Help
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate({ name: "register" })}>
                  Join as a Worker
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground text-pretty">{subtitle}</p>
      )}
    </div>
  );
}

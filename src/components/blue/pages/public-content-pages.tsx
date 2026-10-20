"use client";

import { PublicLayout } from "../public-layout";
import { useRouter } from "@/hooks/use-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "../avatar";
import { RatingStars } from "../rating-stars";
import {
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Users,
  MessageSquare,
  CalendarCheck,
  Star,
  HandCoins,
  CheckCircle2,
  Car,
  Hammer,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
  Heart,
  FileText,
  Mail,
  Phone,
  DollarSign,
} from "lucide-react";
import { ReactNode } from "react";

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

function CTASection() {
  const { navigate } = useRouter();
  return (
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
  );
}

// =====================
// HOW IT WORKS
// =====================

export function HowItWorksPage() {
  const { navigate } = useRouter();
  const steps = [
    { n: 1, title: "Tell us what you need", desc: "Describe the service, your location, and preferred date in minutes. Pick a category — Individual Worker, Contractor, or Car Washing — and add budget, scheduling, and requirements.", icon: FileText },
    { n: 2, title: "Receive proposals", desc: "Verified workers in your area receive your request and respond with proposals. Each proposal includes pricing, availability, estimated time, and a personal message.", icon: HandCoins },
    { n: 3, title: "Compare and accept", desc: "Review proposals side-by-side. See worker ratings, completed jobs, verification status, and starting rates. Message workers directly to clarify scope, then accept the right fit.", icon: ShieldCheck },
    { n: 4, title: "Get it done", desc: "A conversation thread opens automatically with your chosen worker. Track progress through the job timeline, communicate in real time, and complete with a rating and review.", icon: CheckCircle2 },
  ];

  const customerFlow = [
    "Post a request in under two minutes with the multi-step wizard.",
    "Receive proposals only from verified workers who match your criteria.",
    "Compare proposals side-by-side with ratings, pricing, and timing.",
    "Message workers before accepting to align on scope and approach.",
    "Track every job through a transparent end-to-end timeline.",
    "Complete with a 5-star rating and written review.",
  ];

  const workerFlow = [
    "Create a worker profile with category, bio, starting rate, and portfolio.",
    "Receive matched job requests based on category and availability.",
    "Submit professional proposals with pricing, timing, and personal notes.",
    "Get notified instantly when a customer accepts your proposal.",
    "Coordinate work via real-time chat tied to the specific job.",
    "Build reputation with verified badge, ratings, and completed-job count.",
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How B.L.U.E. works</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            From request to completion in <span className="gradient-text">four clear steps</span>.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            B.L.U.E. keeps every job organized, transparent, and on the record — for customers, workers, and admins.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-24">
        <div className="container-prose">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <Card key={s.n} className="p-6 hover:shadow-card transition">
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {s.n}
                  </div>
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job lifecycle */}
      <section className="py-16 lg:py-20 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader
            eyebrow="Job lifecycle"
            title="Deterministic status transitions"
            subtitle="Every job moves through the same clearly-defined states, with a transparent event timeline at each step."
          />
          <div className="mt-12">
            <ol className="grid gap-3 md:grid-cols-8 md:gap-0">
              {[
                "Draft",
                "Open",
                "Proposal received",
                "Assigned",
                "In progress",
                "Completed",
                "Cancelled",
                "Disputed",
              ].map((s, i) => (
                <li key={s} className="flex md:flex-col items-center gap-3 md:gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-sm font-medium text-center md:min-h-[3rem] md:flex md:items-center">{s}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Customer + Worker flows */}
      <section className="py-16 lg:py-20">
        <div className="container-prose grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <SectionHeader align="left" eyebrow="For customers" title="A clear path for every request" />
            <ul className="mt-6 space-y-3">
              {customerFlow.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" />
                  <span className="text-sm text-foreground/90 text-pretty">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader align="left" eyebrow="For workers" title="A clear pipeline for your work" />
            <ul className="mt-6 space-y-3">
              {workerFlow.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground/90 text-pretty">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// SERVICES
// =====================

export function ServicesPage() {
  const { navigate } = useRouter();
  const categories = [
    {
      key: "INDIVIDUAL_WORKER",
      title: "Individual Workers",
      icon: Users,
      starting: 18,
      desc: "Reliable help for relocation, packing, lifting, and everyday home tasks. Whether you're moving across town or need an extra set of hands for a few hours, individual workers are matched by category, location, and availability.",
      features: ["Furniture loading & unloading", "Packing & unpacking", "Light lifting & carrying", "Errands & delivery", "Home organization", "Assembly & disassembly"],
    },
    {
      key: "CONTRACTOR",
      title: "Contractors",
      icon: Hammer,
      starting: 45,
      desc: "Licensed professionals for larger projects, repairs, and renovations. B.L.U.E. contractors bring their own tools, insurance, and verified credentials so you can plan bigger jobs with confidence.",
      features: ["Renovation & remodeling", "Flooring & tile work", "Plumbing & electrical", "Roofing & exteriors", "Permits & inspections", "Carpentry & framing"],
    },
    {
      key: "CAR_WASHING",
      title: "Car Washing",
      icon: Car,
      starting: 25,
      desc: "On-demand mobile car washing and detailing at your location. Schedule one-time washes or recurring service with workers who bring eco-friendly products and professional equipment.",
      features: ["Exterior wash", "Interior detailing", "Wax & polish", "Tire & wheel care", "Recurring schedules", "Fleet & multi-car"],
    },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Services</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Whatever the task, find the right category.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            B.L.U.E. organizes the workforce into clear, well-defined categories — and the architecture is built so new categories can be added without rewriting the platform.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-prose space-y-10">
          {categories.map((c) => (
            <Card key={c.key} className="overflow-hidden p-0">
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <c.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight">{c.title}</h2>
                      <p className="text-xs text-muted-foreground">From ${c.starting}/hr</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground text-pretty leading-relaxed">{c.desc}</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {c.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex gap-3">
                    <Button onClick={() => navigate({ name: "register" })}>
                      Find {c.title.toLowerCase()} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate({ name: "pricing" })}>
                      See pricing
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/40 p-8 lg:p-10 flex items-center justify-center">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-soft w-full max-w-sm">
                    <div className="flex items-center justify-between">
                      <Avatar name="Sample worker" verified size="md" />
                      <span className="rounded-full bg-success/10 text-success text-[10px] font-medium px-2 py-0.5">Available</span>
                    </div>
                    <p className="mt-3 font-semibold">Sample {c.title.toLowerCase().replace(/s$/, "")}</p>
                    <p className="text-xs text-muted-foreground">Austin, TX · 5 yrs experience</p>
                    <RatingStars value={4.9} count={42} size="sm" className="mt-1" />
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-2.5">
                      <span className="text-xs text-muted-foreground">Starting rate</span>
                      <span className="font-semibold">${c.starting}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// PRICING
// =====================

export function PricingPage() {
  const { navigate } = useRouter();
  const plans = [
    {
      key: "MONTHLY",
      name: "Monthly",
      price: "$14.99",
      cadence: "per month",
      desc: "Full access for active workers. Cancel any time, no long-term commitment.",
      features: ["Unlimited proposals", "Real-time messaging", "Availability calendar", "Earnings dashboard", "Verification eligibility", "Standard support"],
      highlight: false,
    },
    {
      key: "YEARLY",
      name: "Yearly",
      price: "$199.99",
      cadence: "per year",
      desc: "Save 28% versus monthly. Best for full-time professionals and active contractors.",
      features: ["Everything in Monthly", "Priority placement in search", "Advanced analytics", "Saved searches & alerts", "Priority support", "Verified badge eligibility"],
      highlight: true,
    },
  ];

  const faqs = [
    { q: "Is posting a request free for customers?", a: "Yes. Customers post requests and receive proposals completely free. B.L.U.E. is a membership platform for workers — the people who use B.L.U.E. to grow their business." },
    { q: "Can I switch plans later?", a: "Absolutely. You can upgrade, downgrade, or cancel at any time from your subscription dashboard. Changes take effect at the next billing cycle." },
    { q: "What payment methods are supported?", a: "B.L.U.E. integrates with major payment providers (Stripe, Paddle, RevenueCat). The current architecture marks the integration point clearly and supports standard card payments." },
    { q: "Do workers need to be verified?", a: "Verification is optional but strongly recommended. Verified workers earn a visible trust badge, priority placement in search results, and higher conversion rates from customers." },
    { q: "What happens if I cancel?", a: "You keep access until the end of your current billing period. After that, your account stays active but proposal submission is paused until you re-subscribe." },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Simple subscription. <span className="gradient-text">Real value.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            B.L.U.E. is a membership platform for workers. Customers post requests free.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-prose">
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {plans.map((p) => (
              <Card key={p.key} className={`p-7 relative ${p.highlight ? "ring-2 ring-primary shadow-glow" : ""}`}>
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
                <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"} onClick={() => navigate({ name: "register" })}>
                  Get started with {p.name}
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Customers post requests free. Workers subscribe to receive and submit proposals.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader eyebrow="Pricing FAQ" title="Common questions" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {faqs.map((f) => (
              <Card key={f.q} className="p-5">
                <h3 className="font-semibold text-sm">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// ABOUT
// =====================

export function AboutPage() {
  const { navigate } = useRouter();
  const values = [
    { icon: ShieldCheck, title: "Trust first", desc: "Verification, ratings, and reviews build a marketplace where customers and workers can rely on each other." },
    { icon: TrendingUp, title: "Real opportunity", desc: "Workers turn skills into income. Customers turn tasks into completed work. B.L.U.E. is built for both sides." },
    { icon: Clock, title: "Respect for time", desc: "Every feature reduces friction — fast posting, smart matching, real-time updates, transparent timelines." },
    { icon: Heart, title: "Better living", desc: "Better Living Unites Everyone isn't a slogan. It's the outcome we design for every interaction on the platform." },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About B.L.U.E.</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Better Living Unites Everyone.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            B.L.U.E. is a two-sided marketplace connecting customers with trusted workers and service providers — for relocation, everyday service needs, and the work that moves lives forward.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Our mission</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">
              A trusted platform for the work that keeps life moving.
            </h2>
            <p className="mt-4 text-base text-muted-foreground text-pretty leading-relaxed">
              B.L.U.E. was built to solve a simple problem: finding reliable help for relocation and everyday service needs is harder than it should be. Customers struggle to verify quality. Workers struggle to find consistent work. Both sides end up settling — on quality, on price, on trust.
            </p>
            <p className="mt-4 text-base text-muted-foreground text-pretty leading-relaxed">
              We built B.L.U.E. to be different. A premium SaaS-quality experience for both customers and workers. Verified workers with public trust badges. An end-to-end job lifecycle that keeps every step on the record. Real-time messaging tied to every job. Smart matching on category, location, budget, and availability.
            </p>
            <p className="mt-4 text-base text-muted-foreground text-pretty leading-relaxed">
              The result is a platform where customers find trusted help in minutes, workers grow a real business with consistent work, and every job — from the smallest errand to the largest renovation — moves forward with clarity and confidence.
            </p>
          </div>
          <Card className="p-7 bg-muted/30">
            <h3 className="font-semibold">By the numbers</h3>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {[
                { v: "12k+", l: "Verified workers" },
                { v: "48k+", l: "Jobs completed" },
                { v: "4.9/5", l: "Average rating" },
                { v: "32", l: "States served" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-3xl font-bold font-display">{s.v}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </section>

      <section className="py-16 lg:py-20 border-t border-border bg-muted/30">
        <div className="container-prose">
          <SectionHeader eyebrow="What we stand for" title="Values that shape every decision" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <Card key={v.title} className="p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose">
          <SectionHeader eyebrow="The team" title="Built by people who care about work" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[
              { name: "Engineers", role: "Full-stack, mobile, infrastructure", desc: "Built B.L.U.E. end-to-end on Next.js, TypeScript, Prisma, and modern Postgres." },
              { name: "Design", role: "Product design & brand", desc: "Crafted a clean, premium SaaS-quality experience inspired by Linear, Stripe, and Notion." },
              { name: "Operations", role: "Trust & safety, support", desc: "Verify workers, review disputes, and keep the marketplace healthy for both sides." },
            ].map((t) => (
              <Card key={t.name} className="p-6 text-center">
                <Avatar name={t.name} size="xl" />
                <h3 className="mt-4 font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role}</p>
                <p className="mt-3 text-sm text-muted-foreground text-pretty">{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// CONTACT
// =====================

export function ContactPage() {
  const channels = [
    { icon: Mail, title: "Email", value: "hello@blue.platform", desc: "For general inquiries, partnership requests, and press." },
    { icon: Phone, title: "Phone", value: "+1 (512) 555-2583", desc: "Mon–Fri, 9 AM – 6 PM Central Time." },
    { icon: MapPin, title: "Office", value: "Austin, Texas, USA", desc: "Operating across the United States." },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Contact</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Let's talk.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            Questions, feedback, partnership ideas — we read every message and respond within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold">Reach us directly</h2>
            <div className="mt-6 space-y-4">
              {channels.map((c) => (
                <Card key={c.title} className="p-5 flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.title}</p>
                    <p className="font-semibold mt-0.5">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 text-pretty">{c.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <Card className="p-6 lg:p-8">
            <h2 className="font-display text-2xl font-bold">Send a message</h2>
            <p className="text-sm text-muted-foreground mt-1">We'll get back to you within one business day.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message received — we'll respond by email."); }}>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="First name" required />
                <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Last name" required />
              </div>
              <input type="email" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Email address" required />
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Subject" required />
              <textarea rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="How can we help?" required />
              <Button type="submit" className="w-full h-11">Send message</Button>
            </form>
          </Card>
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// FAQ
// =====================

export function FaqPage() {
  const faqs = [
    { q: "What is B.L.U.E.?", a: "B.L.U.E. — Better Living Unites Everyone — is a two-sided marketplace connecting customers with trusted workers and service providers for relocation and everyday service needs. Customers post requests, workers submit proposals, and the platform manages the entire job lifecycle from request to completion." },
    { q: "How do I sign up?", a: "Click 'Get started' on the homepage, choose to join as a customer or as a worker, fill in your details, and you're in. Customers can post requests immediately. Workers can browse available jobs and submit proposals." },
    { q: "Is B.L.U.E. free for customers?", a: "Yes. Customers post requests, receive proposals, message workers, and complete jobs at no cost. B.L.U.E. is a membership platform for workers who want to grow their business through the marketplace." },
    { q: "How much does it cost for workers?", a: "Workers subscribe for $14.99/month or $199.99/year (saving 28%). Subscriptions unlock unlimited proposals, real-time messaging, the availability calendar, earnings dashboard, and verification eligibility." },
    { q: "How does verification work?", a: "Workers submit a verification request from their profile. The B.L.U.E. team reviews the worker's information, identity, and credentials. Verified workers receive a public trust badge and priority placement in customer search results." },
    { q: "What categories of work does B.L.U.E. support?", a: "Currently: Individual Workers (moving, packing, lifting, errands), Contractors (renovation, repair, professional projects), and Car Washing (mobile wash and detailing). The architecture is built so new categories can be added without rewriting the platform." },
    { q: "How does payment work?", a: "Pricing is agreed between customer and worker in the proposal flow. B.L.U.E. integrates with major payment providers (Stripe, Paddle, RevenueCat) at a clearly-marked integration point. The architecture is production-ready; payment provider configuration is added per deployment." },
    { q: "What if I have a problem with a job?", a: "Every job has a transparent timeline and event log. If something goes wrong, you can open a dispute from the job detail page. The B.L.U.E. team reviews disputes and works with both parties to reach a fair resolution." },
    { q: "Can I message a worker before accepting their proposal?", a: "Yes. Once a worker submits a proposal, you can message them directly from the proposal card to clarify scope, timing, or approach — all within B.L.U.E., no need to share personal contact information." },
    { q: "How are ratings and reviews handled?", a: "After a completed job, both customer and worker can leave a 5-star rating and written review. Reviews are public on worker profiles. Average ratings and review counts are aggregated and displayed prominently." },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Frequently asked questions.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
            Everything you need to know about B.L.U.E. — for customers, workers, and the curious.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose max-w-3xl">
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5 hover:shadow-card transition">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm list-none">
                  {f.q}
                  <span className="ml-3 grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground text-pretty leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </PublicLayout>
  );
}

// =====================
// LEGAL — Privacy & Terms
// =====================

function LegalLayout({ title, lastUpdated, intro, sections }: { title: string; lastUpdated: string; intro: string; sections: { heading: string; body: ReactNode }[] }) {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container-prose py-12 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Legal</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>
      <section className="py-12 lg:py-16">
        <div className="container-prose max-w-3xl">
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{intro}</p>
          <div className="mt-8 space-y-8">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="font-display text-lg font-semibold">{i + 1}. {s.heading}</h2>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3 text-pretty">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="October 2026"
      intro="B.L.U.E. — Better Living Unites Everyone — is committed to protecting your privacy. This policy describes what information we collect, how we use it, and the choices you have. By using B.L.U.E., you agree to the practices described here."
      sections={[
        { heading: "Information we collect", body: <p>We collect account information you provide at registration (name, email, phone, location), profile details (worker bio, services, pricing, availability), job request content, messages between users, and transaction history for subscriptions. We also collect technical data such as IP address, browser type, and usage patterns to keep the platform secure and improve the experience.</p> },
        { heading: "How we use your information", body: <p>We use your information to operate the marketplace: match customers with workers, facilitate communication, process subscriptions, verify workers, prevent fraud, and provide customer support. We do not sell your personal information. Aggregated, de-identified data may be used for analytics and product improvement.</p> },
        { heading: "Sharing your information", body: <p>We share limited information between customers and workers as needed to complete jobs (e.g., name, location, contact details after a proposal is accepted). We may share information with service providers (payment processors, hosting) under strict contractual obligations. We may disclose information when required by law or to protect rights, property, or safety.</p> },
        { heading: "Data security", body: <p>We use industry-standard security practices: encrypted password hashing (bcrypt), role-based access controls, server-side validation, and protected routes. Database access is restricted to authorized personnel. Despite these measures, no system is perfectly secure, and we cannot guarantee absolute security.</p> },
        { heading: "Your rights and choices", body: <p>You can access, update, or export your profile information from your account settings. You can delete your account at any time, which removes your personal data from active use (some data may be retained for legal or operational reasons). You can opt out of marketing communications. Contact us at privacy@blue.platform for any data requests.</p> },
        { heading: "Data retention", body: <p>We retain your information for as long as your account is active. After account deletion, we remove personal data within 30 days, except where retention is required by law (e.g., financial records, fraud prevention). Job records may be retained in anonymized form for analytics.</p> },
        { heading: "Changes to this policy", body: <p>We may update this policy from time to time. We will notify you of material changes by email or in-app notification at least 30 days before they take effect. Continued use of B.L.U.E. after changes take effect constitutes acceptance of the updated policy.</p> },
        { heading: "Contact us", body: <p>For privacy questions or requests, contact us at privacy@blue.platform or by mail at our Austin, Texas office. We aim to respond to all inquiries within 30 days.</p> },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="October 2026"
      intro="These terms govern your use of B.L.U.E. — Better Living Unites Everyone. By creating an account or using the platform, you agree to these terms. Please read them carefully. If you do not agree, you may not use B.L.U.E."
      sections={[
        { heading: "Acceptance of terms", body: <p>By accessing or using B.L.U.E., you agree to be bound by these Terms of Service and our Privacy Policy. If you are using B.L.U.E. on behalf of a company, you represent that you have authority to bind that entity.</p> },
        { heading: "Eligibility", body: <p>You must be at least 18 years old and legally able to enter into contracts to use B.L.U.E. Workers must be authorized to perform the services they offer in their jurisdiction, including any required licenses, permits, or insurance for their category of work.</p> },
        { heading: "Accounts", body: <p>You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate information at registration and keep it updated. We may suspend or terminate accounts that violate these terms or that we determine to be fraudulent or harmful to the community.</p> },
        { heading: "Customer responsibilities", body: <p>Customers post accurate job requests, agree to pricing through the proposal flow, and pay workers directly for completed work. B.L.U.E. is not a party to the customer-worker relationship and is not liable for the quality, timeliness, or outcome of services. Customers must treat workers with respect and follow all applicable laws.</p> },
        { heading: "Worker responsibilities", body: <p>Workers provide accurate profile information, submit honest proposals, complete accepted work professionally, and maintain any required licenses or insurance. Workers pay a subscription fee to submit proposals. Misrepresentation of credentials, experience, or verification status may result in permanent account termination.</p> },
        { heading: "Subscriptions and billing", body: <p>Worker subscriptions are billed monthly ($14.99) or yearly ($199.99) in advance. Subscriptions auto-renew unless cancelled. You can cancel at any time from your subscription dashboard; access continues until the end of the current billing period. Refunds are issued at our discretion for unused portions of yearly plans in cases of platform issues or documented billing errors.</p> },
        { heading: "Prohibited conduct", body: <p>You may not use B.L.U.E. to: violate any law; harass, defraud, or deceive other users; submit false information; circumvent subscription requirements; reverse-engineer or scrape the platform; or interfere with security. We may take action against accounts that engage in prohibited conduct, including suspension, termination, and legal action where appropriate.</p> },
        { heading: "Disputes", body: <p>We provide an in-platform dispute center for issues between customers and workers. We encourage parties to resolve disputes directly first. If resolution is not possible, B.L.U.E. may mediate at our discretion. Our decisions in mediation are final and binding with respect to platform access, but do not limit either party's legal rights.</p> },
        { heading: "Limitation of liability", body: <p>B.L.U.E. is provided 'as is' without warranty of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages, including loss of profits, data, or goodwill. Our total liability for any claim is limited to the amount you paid us in the 12 months preceding the claim.</p> },
        { heading: "Changes to terms", body: <p>We may update these terms from time to time. We will notify you of material changes by email or in-app notification at least 30 days before they take effect. Continued use of B.L.U.E. after changes take effect constitutes acceptance of the updated terms.</p> },
        { heading: "Contact", body: <p>For questions about these terms, contact us at legal@blue.platform. For support requests, use the in-app support center or email support@blue.platform.</p> },
      ]}
    />
  );
}

// =====================
// FOR CUSTOMERS / FOR WORKERS
// =====================

export function ForCustomersPage() {
  const { navigate } = useRouter();
  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For customers</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              A premium portal for every job.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Post requests, compare proposals, message workers, and track every job through to completion — all from a clean, polished customer portal.
            </p>
            <div className="mt-7 flex gap-3">
              <Button onClick={() => navigate({ name: "register" })}>Get started <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => navigate({ name: "how-it-works" })}>See how it works</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: "Multi-step job request", desc: "Post a request in minutes with category, description, location, schedule, budget, requirements, and attachments." },
              { icon: HandCoins, title: "Side-by-side proposal comparison", desc: "Compare proposals from multiple workers with pricing, timing, ratings, and verification in one view." },
              { icon: MessageSquare, title: "Real-time messaging", desc: "Chat with workers directly within B.L.U.E. — every conversation tied to the right job." },
              { icon: Heart, title: "Saved workers & searches", desc: "Save your favorite workers and frequent searches for quick access when needs come up again." },
              { icon: CalendarCheck, title: "Job timeline & status", desc: "Track every job through deterministic status transitions with a transparent event log." },
              { icon: Star, title: "Reviews & ratings", desc: "Rate workers after completion. Build trust in the marketplace through honest feedback." },
            ].map((c) => (
              <Card key={c.title} className="p-6">
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

      <CTASection />
    </PublicLayout>
  );
}

export function ForWorkersPage() {
  const { navigate } = useRouter();
  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="container-prose relative py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For workers</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              Grow your work. Manage your business.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Receive matched job requests, submit professional proposals, control your availability, and track earnings — all from a clean worker portal built for serious professionals.
            </p>
            <div className="mt-7 flex gap-3">
              <Button onClick={() => navigate({ name: "register" })}>Join as a worker <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => navigate({ name: "pricing" })}>See pricing</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-prose">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Briefcase, title: "Smart job matching", desc: "Receive requests matched on category, location, budget, and your availability. No more cold leads." },
              { icon: HandCoins, title: "Professional proposals", desc: "Submit proposals with pricing, estimated time, availability windows, and personal notes." },
              { icon: DollarSign, title: "Earnings dashboard", desc: "Track total earnings, completed jobs, and average per-job revenue over time." },
              { icon: CalendarCheck, title: "Availability calendar", desc: "Control when customers can request you. Set weekly hours, block dates, take breaks." },
              { icon: ShieldCheck, title: "Verification badge", desc: "Get verified and earn a public trust badge that boosts conversion and priority placement." },
              { icon: TrendingUp, title: "Reputation building", desc: "Complete jobs, earn 5-star reviews, and watch your rating, completed-jobs, and earnings climb." },
            ].map((c) => (
              <Card key={c.title} className="p-6">
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

      <CTASection />
    </PublicLayout>
  );
}

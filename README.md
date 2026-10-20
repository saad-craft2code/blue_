# B.L.U.E. — Better Living Unites Everyone

A premium, production-ready web platform built on Next.js 16 + Neon Postgres. B.L.U.E. is a two-sided marketplace connecting customers with trusted workers and service providers for relocation and everyday service needs.

> Find trusted help. Manage your work. Move forward.

## What it is

B.L.U.E. is a serious **relocation, workforce, service marketplace, and job-management platform** with a polished SaaS-quality web experience. It combines:

- a premium SaaS dashboard
- a relocation marketplace
- a service marketplace
- a workforce platform
- a job management system
- a messaging platform
- a customer portal

The interface is designed to feel comparable in quality to Linear, Stripe, Notion, Airbnb, Uber, and Upwork — while being a unique B.L.U.E. product.

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5 (strict)
- **Styling:** Tailwind CSS 4 with shadcn/ui (New York) and Lucide icons
- **Database:** Prisma 6 + PostgreSQL (Neon)
- **Auth:** NextAuth.js v4 (credentials provider, bcrypt hashing, JWT sessions, role-aware)
- **State:** TanStack Query for server state, Zustand for client state
- **Forms:** React Hook Form + Zod
- **Real-time:** Polling-based messaging (Socket.io mini-service ready)

## Features

### Public site
- Premium 14-section landing page (hero, trust bar, how-it-works, categories, customer/worker experience, messaging preview, why-B.L.U.E., testimonials, pricing, final CTA, footer)
- Dedicated pages: How it works, Services, Pricing, About, Contact, FAQ, Privacy, Terms, For customers, For workers
- Responsive navbar with mobile drawer

### Authentication
- Email/password login + multi-step registration (customer/worker)
- Role-aware JWT (CUSTOMER / WORKER / ADMIN / CONTRACTOR-ready)
- Forgot-password / sign-out / protected routes / role-based routing
- Demo credential quick-fill on the login page

### Customer Portal
- Dashboard: quick-action tiles, stats, recent jobs, subscription card, quick links
- Find Help: filter panel + search + premium worker cards with save/contact
- Worker Profile: about, services, portfolio, reviews, pricing/availability, contact, request-service
- 9-step New Job flow (service → description → location → schedule → budget → requirements → attachments → review → submit)
- My Jobs, Job Detail (timeline + proposal accept/reject + customer card)
- Messages: real-time polling conversation list + chat window with composer
- Notifications, Favorites, Proposals, Subscription ($14.99/$199.99 stub), Profile, Settings

### Worker Portal
- Dashboard: available jobs, pending proposals, active/completed, profile-completion ring, verification status
- Available Jobs, Job Detail + Submit Proposal flow
- My Proposals, Active/Completed, Earnings, Availability, Profile (verification request), Settings

### Admin Portal
- Overview: 8 KPIs + platform health + recent activity
- Users (search + suspend/reactivate), Jobs, Verification queue (approve/reject with side-effect notifications), Subscriptions, Reports, Settings

### Data model (Prisma + Neon Postgres)
Users, CustomerProfile, WorkerProfile, Jobs, Proposals, Conversations/Messages, Notifications, Subscriptions, Reviews, Favorites, JobEvents, WorkerAvailability, SavedSearches, Disputes, AuditLog, SupportTickets.

## Getting started

### Prerequisites
- Node.js 20+ (or Bun)
- A Neon Postgres project (or any Postgres instance)
- An NextAuth secret (generate with `openssl rand -base64 32`)

### Install
```bash
bun install
```

### Configure environment
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

### Push database schema
```bash
bun run db:push
```

### Run development server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed demo data
After registering your first user, call `POST /api/blue/seed` from a logged-in browser tab to create demo customers, workers (mixed verification states), and sample jobs.

**Demo credentials (after seeding):**
| Role | Email | Password |
|---|---|---|
| Customer | aisha@example.com | blueplatform |
| Worker | daniel@example.com | blueplatform |
| Admin | admin@blue.platform | blueplatform |

## Scripts

```bash
bun run dev         # Start dev server on port 3000
bun run lint        # Run ESLint
bun run db:push     # Push Prisma schema to database
bun run db:generate # Generate Prisma client
bun run db:migrate  # Create and apply a Prisma migration
bun run build       # Production build
```

## Project structure

```
prisma/
  schema.prisma           # Full B.L.U.E. data model
src/
  app/
    api/
      auth/[...nextauth]/ # NextAuth route handler
      blue/               # Platform API endpoints (workers, jobs, proposals, etc.)
    layout.tsx            # Root layout with auth + query providers
    page.tsx              # SPA router (dispatches hash routes to view components)
  components/
    blue/                 # B.L.U.E. UI: logo, app-shell, status-badge, avatar, etc.
      pages/              # Page components (landing, login, dashboards, admin, public-content)
    providers/            # NextAuth + TanStack Query providers
    ui/                   # shadcn/ui components
  hooks/
    use-auth.ts           # Auth + mounted hook
    use-router.ts         # Hash-based SPA router (typed Route union)
    use-toast.ts          # Toast hook
  lib/
    api.ts                # Fetch wrapper
    db.ts                 # Prisma client singleton
    utils.ts              # Tailwind className merger
  types/
    next-auth.d.ts        # NextAuth type extensions
```

## Architecture notes

- **Single-route SPA:** Per environment constraints, the entire app runs from the `/` route. All sub-pages are dispatched through a typed hash-router (`#/customer/find`, `#/worker-portal/dashboard`, `#/admin/verification`, etc.). This gives multi-page UX while keeping a single Next.js route.
- **Role-based access:** Protected routes are guarded client-side, with server-side RBAC enforced in every API endpoint via `getServerSession`.
- **Real-time messaging:** Built on 3–5s polling for portability; the architecture is ready to be swapped for a Socket.io mini-service.
- **Payment integration point:** `/api/blue/subscription` is structured for Stripe/Paddle/RevenueCat. The current implementation is a stub with proper status transitions and history — no fake payment success.

## License

Proprietary. © B.L.U.E. — Better Living Unites Everyone.

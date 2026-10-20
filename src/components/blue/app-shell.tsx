"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, type Route, type NavigateFn } from "@/hooks/use-router";
import { BlueLogo } from "./logo";
import { Avatar } from "./avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  Heart,
  User,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  DollarSign,
  CalendarClock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type NavItem = {
  label: string;
  icon: any;
  route: Route;
  badge?: number;
};

const CUSTOMER_NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, route: { name: "customer" } },
  { label: "Find Help", icon: Search, route: { name: "customer-find" } },
  { label: "My Jobs", icon: Briefcase, route: { name: "customer-jobs" } },
  { label: "Proposals", icon: FileText, route: { name: "customer-proposals" } },
  { label: "Messages", icon: MessageSquare, route: { name: "messages" } },
  { label: "Favorites", icon: Heart, route: { name: "customer-favorites" } },
  { label: "Notifications", icon: Bell, route: { name: "customer-notifications" } },
  { label: "Subscription", icon: CreditCard, route: { name: "customer-subscription" } } ,
  { label: "Profile", icon: User, route: { name: "customer-profile" } },
  { label: "Settings", icon: Settings, route: { name: "customer-settings" } },
];

const WORKER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, route: { name: "worker-dashboard" } },
  { label: "Available Jobs", icon: Briefcase, route: { name: "worker-jobs" } },
  { label: "My Proposals", icon: FileText, route: { name: "worker-proposals" } },
  { label: "Active Jobs", icon: Wrench, route: { name: "worker-active" } },
  { label: "Completed Jobs", icon: CheckCircle2, route: { name: "worker-completed" } },
  { label: "Messages", icon: MessageSquare, route: { name: "messages" } },
  { label: "Earnings", icon: DollarSign, route: { name: "worker-earnings" } },
  { label: "Availability", icon: CalendarClock, route: { name: "worker-availability" } },
  { label: "Profile", icon: User, route: { name: "worker-profile" } },
  { label: "Settings", icon: Settings, route: { name: "worker-settings" } },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, route: { name: "admin" } },
  { label: "Users", icon: Users, route: { name: "admin-users" } },
  { label: "Jobs", icon: Briefcase, route: { name: "admin-jobs" } },
  { label: "Proposals", icon: FileText, route: { name: "admin-proposals" } },
  { label: "Verification", icon: ShieldCheck, route: { name: "admin-verification" } },
  { label: "Subscriptions", icon: CreditCard, route: { name: "admin-subscriptions" } },
  { label: "Reports", icon: AlertTriangle, route: { name: "admin-reports" } },
  { label: "Settings", icon: Settings, route: { name: "admin-settings" } },
];

export function AppShell({
  children,
  variant = "customer",
}: {
  children: ReactNode;
  variant?: "customer" | "worker" | "admin";
}) {
  const { route, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const nav =
    variant === "worker" ? WORKER_NAV : variant === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  const role = (session?.user?.role ?? "CUSTOMER").toLowerCase();

  const go: NavigateFn = (r) => {
    navigate(r);
    setMobileOpen(false);
  };

  const onSignOut = async () => {
    await signOut({ redirect: false });
    toast({ title: "Signed out", description: "See you soon." });
    navigate({ name: "home" });
  };

  const homeRoute: Route =
    variant === "worker"
      ? { name: "worker-dashboard" }
      : variant === "admin"
      ? { name: "admin" }
      : { name: "customer" };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-sidebar">
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <button onClick={() => go(homeRoute)}>
            <BlueLogo size="sm" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            const active = route.name === item.route.name;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => go(item.route)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition w-full",
                  active
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-primary/15 text-primary text-[10px] font-semibold px-1.5 py-0.5">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (drawer) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80%] bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-up">
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <button onClick={() => go(homeRoute)}>
                <BlueLogo size="sm" />
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-sidebar-border"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {nav.map((item) => {
                const active = route.name === item.route.name;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => go(item.route)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition w-full",
                      active
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-3">
              <button
                onClick={onSignOut}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-border"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => go(homeRoute)} className="lg:hidden">
                <BlueLogo size="sm" showWordmark={false} />
              </button>
              <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {variant === "admin" ? "Admin portal" : variant === "worker" ? "Worker portal" : "Customer portal"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => go({ name: "messages" })}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="ml-1">Messages</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  go(
                    variant === "worker"
                      ? { name: "worker-settings" }
                      : variant === "admin"
                      ? { name: "admin-settings" }
                      : { name: "customer-settings" }
                  )
                }
              >
                <Settings className="h-4 w-4" />
              </Button>
              <UserMenu name={session?.user?.name ?? "User"} role={role} avatarUrl={session?.user?.avatarUrl} onSignOut={onSignOut} />
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

function UserMenu({
  name,
  role,
  avatarUrl,
  onSignOut,
}: {
  name: string;
  role: string;
  avatarUrl?: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background pl-1 pr-2.5 py-1 hover:bg-muted transition"
      >
        <Avatar name={name} src={avatarUrl} size="xs" />
        <span className="text-sm font-medium hidden sm:inline">{name.split(" ")[0]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover shadow-card z-40 animate-scale-in">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-semibold truncate">{name}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <div className="p-1">
              <button
                onClick={onSignOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground text-pretty max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            {title && <h3 className="font-semibold text-foreground">{title}</h3>}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: any;
  tone?: "default" | "primary" | "success" | "warning";
}) {
  const toneCls = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={cn("grid h-9 w-9 place-items-center rounded-lg", toneCls)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight font-display">{value}</p>
      {delta && (
        <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
      )}
    </div>
  );
}

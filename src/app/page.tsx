"use client";

import { useRouter } from "@/hooks/use-router";
import { useAuth, useMounted } from "@/hooks/use-auth";
import { useEffect } from "react";
import { LandingPage } from "@/components/blue/pages/landing-page";
import { LoginPage } from "@/components/blue/pages/login-page";
import { RegisterPage } from "@/components/blue/pages/register-page";
import { CustomerDashboard } from "@/components/blue/pages/customer-dashboard";
import { FindHelpPage } from "@/components/blue/pages/find-help-page";
import { WorkerProfilePage } from "@/components/blue/pages/worker-profile-page";
import { NewJobPage } from "@/components/blue/pages/new-job-page";
import { MyJobsPage, JobDetailPage } from "@/components/blue/pages/job-pages";
import { MessagesPage } from "@/components/blue/pages/messages-page";
import {
  NotificationsPage,
  FavoritesPage,
  ProposalsListPage,
} from "@/components/blue/pages/customer-pages";
import {
  ProfilePage,
  SettingsPage,
  SubscriptionPage,
} from "@/components/blue/pages/profile-pages";
import {
  WorkerDashboard,
  AvailableJobsPage,
  WorkerJobDetailPage,
  WorkerEarningsPage,
  WorkerAvailabilityPage,
} from "@/components/blue/pages/worker-pages";
import {
  AdminDashboard,
  AdminUsersPage,
  AdminJobsPage,
  AdminVerificationPage,
  AdminSubscriptionsPage,
  AdminReportsPage,
  AdminSettingsPage,
} from "@/components/blue/pages/admin-pages";

export default function Home() {
  const { route, navigate } = useRouter();
  const mounted = useMounted();
  const { status, isAuthenticated, user } = useAuth();

  // Route guards
  useEffect(() => {
    if (!mounted || status === "loading") return;
    const name = route.name;

    const publicRoutes = new Set([
      "home", "how-it-works", "services", "workers", "worker", "for-customers", "for-workers",
      "pricing", "about", "contact", "faq", "privacy", "terms", "login", "register", "forgot",
    ]);

    const isProtected = !publicRoutes.has(name);
    if (isProtected && !isAuthenticated) {
      navigate({ name: "login" });
      return;
    }

    // Role-based redirects
    if (isAuthenticated && (name === "login" || name === "register")) {
      if (user?.role === "ADMIN") navigate({ name: "admin" });
      else if (user?.role === "WORKER") navigate({ name: "worker-dashboard" });
      else navigate({ name: "customer" });
      return;
    }

    // Customer-only routes require CUSTOMER role
    const customerRoutes = new Set([
      "customer", "customer-find", "customer-jobs", "customer-job", "customer-new-job",
      "customer-proposals", "customer-favorites", "customer-profile",
      "customer-subscription", "customer-notifications", "customer-settings",
    ]);
    if (customerRoutes.has(name) && user?.role === "WORKER") {
      navigate({ name: "worker-dashboard" });
      return;
    }
    const workerRoutes = new Set([
      "worker-dashboard", "worker-jobs", "worker-job", "worker-proposals",
      "worker-active", "worker-completed", "worker-earnings",
      "worker-availability", "worker-profile", "worker-settings",
    ]);
    if (workerRoutes.has(name) && user?.role === "CUSTOMER") {
      navigate({ name: "customer" });
      return;
    }
    const adminRoutes = new Set([
      "admin", "admin-users", "admin-jobs", "admin-proposals",
      "admin-verification", "admin-subscriptions", "admin-reports", "admin-settings",
    ]);
    if (adminRoutes.has(name) && user?.role !== "ADMIN") {
      navigate({ name: "customer" });
      return;
    }
  }, [route.name, status, mounted, isAuthenticated, user?.role]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg gradient-brand animate-pulse" />
          <p className="text-xs text-muted-foreground">Loading B.L.U.E.…</p>
        </div>
      </div>
    );
  }

  switch (route.name) {
    // Public marketing
    case "home":
      return <LandingPage />;
    case "how-it-works":
    case "services":
    case "for-customers":
    case "for-workers":
    case "pricing":
    case "about":
    case "contact":
    case "faq":
    case "privacy":
    case "terms":
      // Placeholder content pages — return to landing for now
      return <LandingPage />;

    case "login":
      return <LoginPage />;
    case "register":
      return <RegisterPage />;
    case "forgot":
      return <LoginPage defaultRole="CUSTOMER" />;

    // Customer
    case "customer":
      return <CustomerDashboard />;
    case "customer-find":
      return <FindHelpPage />;
    case "customer-jobs":
      return <MyJobsPage />;
    case "customer-job":
      return <JobDetailPage id={route.id} variant="customer" />;
    case "customer-new-job":
      return <NewJobPage />;
    case "customer-proposals":
      return <ProposalsListPage variant="customer" />;
    case "customer-favorites":
      return <FavoritesPage />;
    case "customer-notifications":
      return <NotificationsPage />;
    case "customer-subscription":
      return <SubscriptionPage />;
    case "customer-profile":
      return <ProfilePage variant="customer" />;
    case "customer-settings":
      return <SettingsPage variant="customer" />;

    case "worker":
      // Worker profile (visible to all authed users)
      return <WorkerProfilePage id={route.id} />;

    case "messages":
      return <MessagesPage conversationId={route.conversationId} />;

    // Worker
    case "worker-dashboard":
      return <WorkerDashboard />;
    case "worker-jobs":
      return <AvailableJobsPage />;
    case "worker-job":
      return <WorkerJobDetailPage id={route.id} />;
    case "worker-proposals":
      return <ProposalsListPage variant="worker" />;
    case "worker-active":
    case "worker-completed":
      return <WorkerEarningsPage />;
    case "worker-earnings":
      return <WorkerEarningsPage />;
    case "worker-availability":
      return <WorkerAvailabilityPage />;
    case "worker-profile":
      return <ProfilePage variant="worker" />;
    case "worker-settings":
      return <SettingsPage variant="worker" />;

    // Admin
    case "admin":
      return <AdminDashboard />;
    case "admin-users":
      return <AdminUsersPage />;
    case "admin-jobs":
      return <AdminJobsPage />;
    case "admin-proposals":
      return <AdminJobsPage />;
    case "admin-verification":
      return <AdminVerificationPage />;
    case "admin-subscriptions":
      return <AdminSubscriptionsPage />;
    case "admin-reports":
      return <AdminReportsPage />;
    case "admin-settings":
      return <AdminSettingsPage />;

    default:
      return <LandingPage />;
  }
}

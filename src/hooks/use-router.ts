"use client";

import { useCallback, useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "how-it-works" }
  | { name: "services" }
  | { name: "workers" }
  | { name: "for-customers" }
  | { name: "for-workers" }
  | { name: "pricing" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "faq" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "login" }
  | { name: "register" }
  | { name: "forgot" }
  // Customer portal
  | { name: "customer" }
  | { name: "customer-find" }
  | { name: "worker"; id: string }
  | { name: "customer-jobs" }
  | { name: "customer-job"; id: string }
  | { name: "customer-new-job" }
  | { name: "customer-proposals" }
  | { name: "customer-favorites" }
  | { name: "customer-profile" }
  | { name: "customer-subscription" }
  | { name: "customer-notifications" }
  | { name: "customer-settings" }
  // Worker portal
  | { name: "worker-dashboard" }
  | { name: "worker-jobs" }
  | { name: "worker-job"; id: string }
  | { name: "worker-proposals" }
  | { name: "worker-active" }
  | { name: "worker-completed" }
  | { name: "worker-earnings" }
  | { name: "worker-availability" }
  | { name: "worker-profile" }
  | { name: "worker-settings" }
  // Messaging (shared)
  | { name: "messages"; conversationId?: string }
  // Admin
  | { name: "admin" }
  | { name: "admin-users" }
  | { name: "admin-jobs" }
  | { name: "admin-proposals" }
  | { name: "admin-verification" }
  | { name: "admin-subscriptions" }
  | { name: "admin-reports" }
  | { name: "admin-settings" };

export type NavigateFn = (route: Route) => void;

function parseHash(): Route {
  if (typeof window === "undefined") return { name: "home" };
  const raw = window.location.hash.replace(/^#\/?/, "");
  if (!raw) return { name: "home" };
  const [path, query] = raw.split("?");
  const segments = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  const head = segments[0] ?? "home";

  const id = (s?: string) => (s && s !== "" ? decodeURIComponent(s) : "");

  switch (head) {
    case "home": return { name: "home" };
    case "how-it-works": return { name: "how-it-works" };
    case "services": return { name: "services" };
    case "workers": {
      if (segments[1]) return { name: "worker", id: decodeURIComponent(segments[1]) };
      return { name: "workers" };
    }
    case "for-customers": return { name: "for-customers" };
    case "for-workers": return { name: "for-workers" };
    case "pricing": return { name: "pricing" };
    case "about": return { name: "about" };
    case "contact": return { name: "contact" };
    case "faq": return { name: "faq" };
    case "privacy": return { name: "privacy" };
    case "terms": return { name: "terms" };
    case "login": return { name: "login" };
    case "register": return { name: "register" };
    case "forgot": return { name: "forgot" };

    case "customer": {
      const sub = segments[1];
      if (!sub || sub === "dashboard") return { name: "customer" };
      if (sub === "find") return { name: "customer-find" };
      if (sub === "jobs") return { name: "customer-jobs" };
      if (sub === "job") return { name: "customer-job", id: id(segments[2]) };
      if (sub === "new-job") return { name: "customer-new-job" };
      if (sub === "proposals") return { name: "customer-proposals" };
      if (sub === "favorites") return { name: "customer-favorites" };
      if (sub === "profile") return { name: "customer-profile" };
      if (sub === "subscription") return { name: "customer-subscription" };
      if (sub === "notifications") return { name: "customer-notifications" };
      if (sub === "settings") return { name: "customer-settings" };
      return { name: "customer" };
    }

    case "worker-portal": {
      const sub = segments[1];
      if (!sub || sub === "dashboard") return { name: "worker-dashboard" };
      if (sub === "jobs") return { name: "worker-jobs" };
      if (sub === "job") return { name: "worker-job", id: id(segments[2]) };
      if (sub === "proposals") return { name: "worker-proposals" };
      if (sub === "active") return { name: "worker-active" };
      if (sub === "completed") return { name: "worker-completed" };
      if (sub === "earnings") return { name: "worker-earnings" };
      if (sub === "availability") return { name: "worker-availability" };
      if (sub === "profile") return { name: "worker-profile" };
      if (sub === "settings") return { name: "worker-settings" };
      return { name: "worker-dashboard" };
    }

    case "messages": {
      const cid = params.get("c");
      return { name: "messages", conversationId: cid || undefined };
    }

    case "admin": {
      const sub = segments[1];
      if (!sub || sub === "dashboard") return { name: "admin" };
      if (sub === "users") return { name: "admin-users" };
      if (sub === "jobs") return { name: "admin-jobs" };
      if (sub === "proposals") return { name: "admin-proposals" };
      if (sub === "verification") return { name: "admin-verification" };
      if (sub === "subscriptions") return { name: "admin-subscriptions" };
      if (sub === "reports") return { name: "admin-reports" };
      if (sub === "settings") return { name: "admin-settings" };
      return { name: "admin" };
    }

    default:
      return { name: "home" };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "home": return "#/";
    case "how-it-works": return "#/how-it-works";
    case "services": return "#/services";
    case "workers": return "#/workers";
    case "worker": return `#/workers/${encodeURIComponent(route.id)}`;
    case "for-customers": return "#/for-customers";
    case "for-workers": return "#/for-workers";
    case "pricing": return "#/pricing";
    case "about": return "#/about";
    case "contact": return "#/contact";
    case "faq": return "#/faq";
    case "privacy": return "#/privacy";
    case "terms": return "#/terms";
    case "login": return "#/login";
    case "register": return "#/register";
    case "forgot": return "#/forgot";
    case "customer": return "#/customer/dashboard";
    case "customer-find": return "#/customer/find";
    case "customer-jobs": return "#/customer/jobs";
    case "customer-job": return `#/customer/job/${encodeURIComponent(route.id)}`;
    case "customer-new-job": return "#/customer/new-job";
    case "customer-proposals": return "#/customer/proposals";
    case "customer-favorites": return "#/customer/favorites";
    case "customer-profile": return "#/customer/profile";
    case "customer-subscription": return "#/customer/subscription";
    case "customer-notifications": return "#/customer/notifications";
    case "customer-settings": return "#/customer/settings";
    case "worker-dashboard": return "#/worker-portal/dashboard";
    case "worker-jobs": return "#/worker-portal/jobs";
    case "worker-job": return `#/worker-portal/job/${encodeURIComponent(route.id)}`;
    case "worker-proposals": return "#/worker-portal/proposals";
    case "worker-active": return "#/worker-portal/active";
    case "worker-completed": return "#/worker-portal/completed";
    case "worker-earnings": return "#/worker-portal/earnings";
    case "worker-availability": return "#/worker-portal/availability";
    case "worker-profile": return "#/worker-portal/profile";
    case "worker-settings": return "#/worker-portal/settings";
    case "messages": return route.conversationId ? `#/messages?c=${route.conversationId}` : "#/messages";
    case "admin": return "#/admin/dashboard";
    case "admin-users": return "#/admin/users";
    case "admin-jobs": return "#/admin/jobs";
    case "admin-proposals": return "#/admin/proposals";
    case "admin-verification": return "#/admin/verification";
    case "admin-subscriptions": return "#/admin/subscriptions";
    case "admin-reports": return "#/admin/reports";
    case "admin-settings": return "#/admin/settings";
    default: return "#/";
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(parseHash());
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return { route, navigate };
}

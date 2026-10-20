"use client";

import { useState } from "react";
import { BlueLogo } from "./logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, type Route } from "@/hooks/use-router";
import { Menu, X } from "lucide-react";

const NAV: { label: string; route: Route }[] = [
  { label: "How it works", route: { name: "how-it-works" } },
  { label: "Services", route: { name: "services" } },
  { label: "Pricing", route: { name: "pricing" } },
  { label: "About", route: { name: "about" } },
];

export function PublicNavbar() {
  const { route, navigate } = useRouter();
  const [open, setOpen] = useState(false);

  const go = (r: Route) => {
    navigate(r);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-prose">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => go({ name: "home" })}
            className="transition hover:opacity-90"
            aria-label="B.L.U.E. home"
          >
            <BlueLogo size="sm" />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = route.name === item.route.name;
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.route)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => go({ name: "login" })}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => go({ name: "register" })}>
              Get started
            </Button>
          </div>

          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 animate-fade-in">
            <div className="grid gap-1 pt-2">
              {NAV.map((item) => (
                <button
                  key={item.label}
                  onClick={() => go(item.route)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-left text-sm font-medium",
                    route.name === item.route.name
                      ? "bg-primary/5 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={() => go({ name: "login" })}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => go({ name: "register" })}>
                  Get started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

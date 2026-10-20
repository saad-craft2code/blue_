"use client";

import { BlueLogo } from "./logo";
import { useRouter, type Route } from "@/hooks/use-router";
import { Mail, MapPin } from "lucide-react";

const COLS: { title: string; links: { label: string; route: Route }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "How it works", route: { name: "how-it-works" } },
      { label: "Services", route: { name: "services" } },
      { label: "Pricing", route: { name: "pricing" } },
      { label: "About B.L.U.E.", route: { name: "about" } },
    ],
  },
  {
    title: "For users",
    links: [
      { label: "For customers", route: { name: "for-customers" } },
      { label: "For workers", route: { name: "for-workers" } },
      { label: "FAQ", route: { name: "faq" } },
      { label: "Contact support", route: { name: "contact" } },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About B.L.U.E.", route: { name: "about" } },
      { label: "Privacy", route: { name: "privacy" } },
      { label: "Terms", route: { name: "terms" } },
      { label: "Sign in", route: { name: "login" } },
    ],
  },
];

export function PublicFooter() {
  const { navigate } = useRouter();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container-prose py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <BlueLogo size="md" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
              B.L.U.E. connects customers with trusted workers and service
              providers for relocation and everyday service needs. Find trusted
              help, manage your work, move forward.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@blue.platform" className="hover:text-foreground">
                  hello@blue.platform
                </a>
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Operating across the United States</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.title}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => navigate(l.route)}
                        className="text-sm text-foreground/80 hover:text-foreground transition"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} B.L.U.E. — Better Living Unites Everyone. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate({ name: "privacy" })} className="hover:text-foreground">Privacy</button>
            <button onClick={() => navigate({ name: "terms" })} className="hover:text-foreground">Terms</button>
            <button onClick={() => navigate({ name: "contact" })} className="hover:text-foreground">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

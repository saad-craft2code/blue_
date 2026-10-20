"use client";

import { ReactNode } from "react";
import { PublicNavbar } from "./public-navbar";
import { PublicFooter } from "./public-footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

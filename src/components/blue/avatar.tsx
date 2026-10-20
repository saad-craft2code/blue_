"use client";

import { Avatar as AvatarPrimitive } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function Avatar({
  src,
  name,
  size = "md",
  verified,
  className,
}: {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  className?: string;
}) {
  const sizeCls = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  }[size];

  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative inline-block">
      <AvatarPrimitive className={cn(sizeCls, "ring-1 ring-border", className)}>
        {src ? (
          <img src={src} alt={name || "Avatar"} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-full gradient-brand-soft text-primary font-semibold">
            {initials}
          </div>
        )}
      </AvatarPrimitive>
      {verified && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-background",
            size === "xs" || size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
          title="Verified worker"
        >
          <CheckCircle2 className="h-full w-full text-success" />
        </span>
      )}
    </div>
  );
}

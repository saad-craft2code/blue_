"use client";

import { cn } from "@/lib/utils";

export function BlueLogo({
  className,
  size = "md",
  showWordmark = true,
  tone = "default",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  tone?: "default" | "light" | "dark";
}) {
  const sizes = {
    sm: { mark: "h-6 w-6", text: "text-base" },
    md: { mark: "h-8 w-8", text: "text-lg" },
    lg: { mark: "h-10 w-10", text: "text-xl" },
    xl: { mark: "h-14 w-14", text: "text-3xl" },
  } as const;
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-xl gradient-brand text-white shadow-sm",
          s.mark
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="h-2/3 w-2/3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 5h11.5a6.5 6.5 0 0 1 0 13H11.5v9H6V5Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.12)"
          />
          <circle cx="22.5" cy="22" r="3.5" fill="white" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight font-display",
              s.text,
              tone === "light" ? "text-white" : tone === "dark" ? "text-foreground" : "text-foreground"
            )}
          >
            B.L.U.E.
          </span>
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.18em] mt-0.5",
              tone === "light" ? "text-white/70" : "text-muted-foreground"
            )}
          >
            Better Living Unites Everyone
          </span>
        </div>
      )}
    </div>
  );
}

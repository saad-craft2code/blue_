"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value = 0,
  count,
  size = "sm",
  showCount = true,
  className,
}: {
  value?: number;
  count?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}) {
  const sizeCls = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.floor(rounded);
          const half = !filled && i - 0.5 === rounded;
          return (
            <Star
              key={i}
              className={cn(
                sizeCls,
                filled || half
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted-foreground/50"
              )}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-foreground tabular-nums">
        {value ? value.toFixed(1) : "0.0"}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}

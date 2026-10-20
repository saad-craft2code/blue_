"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, PauseCircle, XCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

type Variant = "default" | "info" | "success" | "warning" | "danger" | "neutral" | "primary";

const styles: Record<Variant, string> = {
  default: "bg-muted text-foreground border-border",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const icons: Partial<Record<Variant, LucideIcon>> = {
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
  info: Clock,
  neutral: PauseCircle,
};

export function StatusBadge({
  children,
  variant = "default",
  className,
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  icon?: LucideIcon;
}) {
  const ResolvedIcon = Icon ?? icons[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {ResolvedIcon && <ResolvedIcon className="h-3 w-3" />}
      {children}
    </span>
  );
}

// Job status helpers
export function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: Variant; label: string }> = {
    DRAFT: { v: "neutral", label: "Draft" },
    OPEN: { v: "info", label: "Open" },
    PROPOSAL_RECEIVED: { v: "info", label: "Proposal received" },
    ASSIGNED: { v: "primary", label: "Assigned" },
    IN_PROGRESS: { v: "warning", label: "In progress" },
    COMPLETED: { v: "success", label: "Completed" },
    CANCELLED: { v: "danger", label: "Cancelled" },
    DISPUTED: { v: "danger", label: "Disputed" },
  };
  const cfg = map[status] ?? { v: "default" as Variant, label: status };
  return <StatusBadge variant={cfg.v}>{cfg.label}</StatusBadge>;
}

export function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, { v: Variant; label: string }> = {
    UNVERIFIED: { v: "neutral", label: "Unverified" },
    PENDING: { v: "warning", label: "Pending review" },
    VERIFIED: { v: "success", label: "Verified" },
    REJECTED: { v: "danger", label: "Rejected" },
  };
  const cfg = map[status] ?? { v: "default" as Variant, label: status };
  return <StatusBadge variant={cfg.v}>{cfg.label}</StatusBadge>;
}

export function ProposalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: Variant; label: string }> = {
    PENDING: { v: "info", label: "Pending" },
    ACCEPTED: { v: "success", label: "Accepted" },
    REJECTED: { v: "danger", label: "Rejected" },
    WITHDRAWN: { v: "neutral", label: "Withdrawn" },
  };
  const cfg = map[status] ?? { v: "default" as Variant, label: status };
  return <StatusBadge variant={cfg.v}>{cfg.label}</StatusBadge>;
}

// ============================================================
// components/ui/SectionHeader.tsx + Skeleton
// ============================================================
import { clsx } from "clsx"
import type { LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Icon size={14} className="text-accent" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-ink-primary">{title}</h2>
          {subtitle && (
            <p className="text-xs text-ink-tertiary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ============================================================
// Composant Skeleton (loading state)
// ============================================================
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-surface-border bg-surface-card p-5",
        className
      )}
    >
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-surface-border bg-surface-card p-5",
        className
      )}
    >
      <div className="skeleton h-3 w-32 mb-5" />
      <div className="skeleton h-48 w-full" />
    </div>
  )
}

// ============================================================
// Indicateur de statut (Win / Loss / Breakeven / Open)
// ============================================================
export function StatusBadge({
  status,
}: {
  status: "Win" | "Loss" | "Breakeven" | "Open"
}) {
  const styles = {
    Win: "bg-profit/10 text-profit border border-profit/20",
    Loss: "bg-loss/10 text-loss border border-loss/20",
    Breakeven: "bg-neutral/10 text-neutral border border-neutral/20",
    Open: "bg-accent/10 text-accent border border-accent/20",
  }

  const dots = {
    Win: "bg-profit",
    Loss: "bg-loss",
    Breakeven: "bg-neutral",
    Open: "bg-accent animate-pulse-slow",
  }

  const labels = {
    Win: "Win",
    Loss: "Loss",
    Breakeven: "BE",
    Open: "Open",
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
        styles[status]
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", dots[status])} />
      {labels[status]}
    </span>
  )
}

"use client"
// ============================================================
// components/ui/KPICard.tsx
// ============================================================
import { clsx } from "clsx"
import type { LucideIcon } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  variant?: "default" | "profit" | "loss" | "accent"
  className?: string
  animDelay?: number
}

export function KPICard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = "default",
  className,
  animDelay = 0,
}: KPICardProps) {
  const variantStyles = {
    default: "border-surface-border",
    profit: "border-profit/25 shadow-profit/10",
    loss: "border-loss/25 shadow-loss/10",
    accent: "border-accent/25 shadow-accent/10",
  }

  const valueStyles = {
    default: "text-ink-primary",
    profit: "text-profit profit-glow",
    loss: "text-loss loss-glow",
    accent: "text-accent",
  }

  const iconBg = {
    default: "bg-surface-elevated text-ink-secondary",
    profit: "bg-profit/10 text-profit",
    loss: "bg-loss/10 text-loss",
    accent: "bg-accent/10 text-accent",
  }

  return (
    <div
      className={clsx(
        "relative rounded-xl border bg-surface-card p-5",
        "shadow-card hover:shadow-card-hover hover:border-accent/15",
        "transition-all duration-200 cursor-default",
        "animate-slide-up opacity-0 [animation-fill-mode:forwards]",
        variantStyles[variant],
        className
      )}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Inner glow subtil */}
      <div className="absolute inset-0 rounded-xl shadow-inner-glow pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-tertiary mb-2">
            {label}
          </p>
          <p
            className={clsx(
              "text-2xl font-semibold tabular-nums leading-none",
              valueStyles[variant]
            )}
          >
            {value}
          </p>
          {subValue && (
            <p className="mt-1.5 text-xs text-ink-secondary">{subValue}</p>
          )}
        </div>

        {Icon && (
          <div
            className={clsx(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              iconBg[variant]
            )}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Indicateur de tendance */}
      {trend && (
        <div className="absolute top-3 right-3">
          <span
            className={clsx(
              "inline-block w-1.5 h-1.5 rounded-full",
              trend === "up" && "bg-profit animate-pulse-slow",
              trend === "down" && "bg-loss animate-pulse-slow",
              trend === "neutral" && "bg-neutral"
            )}
          />
        </div>
      )}
    </div>
  )
}

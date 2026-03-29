"use client"
// ============================================================
// components/ui/Sidebar.tsx
// ============================================================
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TableProperties,
  BarChart3,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    href: "/trades",
    label: "Historique",
    icon: TableProperties,
    description: "Tous les trades",
  },
  {
    href: "/analytics",
    label: "Analytiques",
    icon: BarChart3,
    description: "Stats avancées",
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
    description: "Configuration",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-surface-card border-r border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Zap size={15} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-primary tracking-tight">
            TradeLens
          </p>
          <p className="text-[10px] text-ink-tertiary uppercase tracking-widest">
            Personal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-tertiary">
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-elevated"
              )}
            >
              <Icon
                size={16}
                className={clsx(
                  "flex-shrink-0 transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-ink-tertiary group-hover:text-ink-secondary"
                )}
              />
              <span className="font-medium">{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-border">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary">
          <TrendingUp size={12} className="text-accent/60" />
          <span>Données Notion</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-profit animate-pulse-slow" />
        </div>
      </div>
    </aside>
  )
}

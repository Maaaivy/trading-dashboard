"use client"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { clsx } from "clsx"
import type { Trade } from "@/types/trade"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO,
  addMonths, subMonths,
} from "date-fns"
import { fr } from "date-fns/locale"

interface Props { trades: Trade[] }

export function PnLCalendar({ trades }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Agrège le P&L par jour
  const pnlByDay = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>()
    for (const trade of trades) {
      if (!trade.date) continue
      const day = trade.date.slice(0, 10)
      const existing = map.get(day) ?? { pnl: 0, count: 0 }
      map.set(day, {
        pnl: existing.pnl + trade.resultDollar,
        count: existing.count + 1,
      })
    }
    return map
  }, [trades])

  // Calcule le seuil "très profitable" = top 25% des jours positifs
  const profitThreshold = useMemo(() => {
    const positiveDays = [...pnlByDay.values()]
      .map((d) => d.pnl)
      .filter((p) => p > 0)
      .sort((a, b) => b - a)
    if (positiveDays.length === 0) return 0
    return positiveDays[Math.floor(positiveDays.length * 0.25)] ?? 0
  }, [pnlByDay])

  // Stats du mois courant
  const monthStats = useMemo(() => {
    const monthStart = format(startOfMonth(currentMonth), "yyyy-MM")
    let totalPnL = 0
    let tradingDays = 0
    let profitDays = 0
    let lossDays = 0
    for (const [day, data] of pnlByDay.entries()) {
      if (!day.startsWith(monthStart)) continue
      totalPnL += data.pnl
      tradingDays++
      if (data.pnl > 0) profitDays++
      else if (data.pnl < 0) lossDays++
    }
    return { totalPnL, tradingDays, profitDays, lossDays }
  }, [pnlByDay, currentMonth])

  // Jours à afficher (grille complète semaine)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  function getDayStyle(day: Date): { bg: string; text: string; border: string } {
    const key = format(day, "yyyy-MM-dd")
    const data = pnlByDay.get(key)

    if (!isSameMonth(day, currentMonth)) {
      return { bg: "bg-transparent", text: "text-ink-muted opacity-30", border: "border-surface-border/20" }
    }
    if (!data) {
      return { bg: "bg-surface-elevated/40", text: "text-ink-tertiary", border: "border-surface-border/30" }
    }
    if (data.pnl > profitThreshold && profitThreshold > 0) {
      return { bg: "bg-neutral/10", text: "text-neutral", border: "border-neutral/30" }
    }
    if (data.pnl > 0) {
      return { bg: "bg-profit/10", text: "text-profit", border: "border-profit/25" }
    }
    if (data.pnl < 0) {
      return { bg: "bg-loss/10", text: "text-loss", border: "border-loss/25" }
    }
    return { bg: "bg-surface-elevated", text: "text-ink-secondary", border: "border-surface-border" }
  }

  const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  return (
    <div className="space-y-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg border border-surface-border text-ink-tertiary hover:text-ink-primary hover:border-accent/30 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-ink-primary capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg border border-surface-border text-ink-tertiary hover:text-ink-primary hover:border-accent/30 transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Stats du mois */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "P&L du mois", value: `${monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toFixed(2)}$`, color: monthStats.totalPnL >= 0 ? "text-profit" : "text-loss" },
          { label: "Jours tradés", value: monthStats.tradingDays, color: "text-ink-primary" },
          { label: "Jours profits", value: monthStats.profitDays, color: "text-profit" },
          { label: "Jours pertes", value: monthStats.lossDays, color: "text-loss" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-elevated rounded-lg border border-surface-border p-3 text-center">
            <p className={clsx("text-base font-semibold tabular-nums", color)}>{value}</p>
            <p className="text-[10px] text-ink-tertiary mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {/* Labels jours de la semaine */}
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-ink-tertiary py-1">
            {d}
          </div>
        ))}

        {/* Cellules */}
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const data = pnlByDay.get(key)
          const { bg, text, border } = getDayStyle(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div key={key}
              className={clsx(
                "rounded-lg border p-1.5 min-h-[52px] flex flex-col",
                bg, border,
                isToday && "ring-1 ring-accent/40",
                !isSameMonth(day, currentMonth) && "pointer-events-none"
              )}>
              <span className={clsx("text-[10px] font-medium", isToday ? "text-accent" : text)}>
                {format(day, "d")}
              </span>
              {data && isSameMonth(day, currentMonth) && (
                <>
                  <span className={clsx("text-[11px] font-semibold tabular-nums mt-auto leading-none", text)}>
                    {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}$
                  </span>
                  <span className="text-[9px] text-ink-tertiary">
                    {data.count} trade{data.count > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 pt-1 flex-wrap">
        {[
          { color: "bg-surface-elevated/40 border border-surface-border/30", label: "Pas de trade" },
          { color: "bg-profit/10 border border-profit/25", label: "Profitable" },
          { color: "bg-neutral/10 border border-neutral/30", label: "Très profitable" },
          { color: "bg-loss/10 border border-loss/25", label: "Perdant" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={clsx("w-3 h-3 rounded-sm", color)} />
            <span className="text-[10px] text-ink-tertiary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

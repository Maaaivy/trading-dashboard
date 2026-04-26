"use client"
import { clsx } from "clsx"
import { Clock, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import type { Trade } from "@/types/trade"

interface Props { trades: Trade[] }

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`
}

function calcCurrentDuration(entryDate: string): number {
  const entry = new Date(entryDate).getTime()
  const now = Date.now()
  return (now - entry) / (1000 * 60 * 60)
}

export function OpenPositions({ trades }: Props) {
  const openTrades = trades.filter((t) => t.status === "Open")

  if (openTrades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-ink-tertiary">
        <AlertCircle size={20} />
        <p className="text-sm">Aucune position ouverte</p>
        <p className="text-xs">Les trades sans Exit Date apparaissent ici</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {openTrades.map((trade) => {
        const duration = calcCurrentDuration(trade.entryDate || trade.date)
        const isLong = trade.direction === "Long"

        // Calcul P&L latent si on a les prix
        const hasLatentPnL = trade.entryPrice > 0
        const latentPct = hasLatentPnL
          ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice * 100 * (isLong ? 1 : -1))
          : null

        return (
          <div key={trade.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-surface-border bg-surface-elevated hover:border-accent/20 transition-colors">

            {/* Direction indicator */}
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              isLong ? "bg-profit/10" : "bg-loss/10"
            )}>
              {isLong
                ? <TrendingUp size={15} className="text-profit" />
                : <TrendingDown size={15} className="text-loss" />}
            </div>

            {/* Asset + info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-primary">{trade.asset}</span>
                {trade.timeframe && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-ink-tertiary">
                    {trade.timeframe}
                  </span>
                )}
                {trade.market && (
                  <span className={clsx(
                    "text-[10px] px-1.5 py-0.5 rounded border",
                    trade.market === "Futures"
                      ? "bg-accent/10 border-accent/20 text-accent"
                      : "bg-surface-card border-surface-border text-ink-tertiary"
                  )}>
                    {trade.market}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Entrée : <span className="font-mono text-ink-primary">{trade.entryPrice}</span>
                {trade.stopLoss > 0 && (
                  <span className="ml-2 text-loss/70">SL: {trade.stopLoss}</span>
                )}
                {trade.takeProfit > 0 && (
                  <span className="ml-2 text-profit/70">TP: {trade.takeProfit}</span>
                )}
              </p>
            </div>

            {/* Durée */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-ink-tertiary justify-end">
                <Clock size={11} />
                <span className="text-xs tabular-nums">{formatDuration(duration)}</span>
              </div>
              {trade.setup && (
                <span className="text-[10px] text-ink-tertiary">{trade.setup}</span>
              )}
            </div>

            {/* Indicateur live */}
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow flex-shrink-0" />
          </div>
        )
      })}
    </div>
  )
}
"use client"
// ============================================================
// app/trades/page.tsx — Historique complet des trades
// ============================================================
import useSWR from "swr"
import { TableProperties, AlertTriangle, RefreshCw } from "lucide-react"
import { TradeTable } from "@/components/trades/TradeTable"
import { SectionHeader, SkeletonChart } from "@/components/ui/SectionHeader"
import type { TradesApiResponse } from "@/types/trade"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TradesPage() {
  const { data, error, isLoading, mutate } = useSWR<TradesApiResponse>(
    "/api/trades",
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  )

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            Historique des trades
          </h1>
          <p className="text-sm text-ink-tertiary mt-0.5">
            {data
              ? `${data.trades.length} trades importés depuis Notion`
              : "Chargement…"}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-surface-border rounded-lg text-ink-secondary hover:text-ink-primary hover:border-accent/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
          <AlertTriangle size={16} />
          Erreur lors du chargement des trades. Vérifiez votre connexion Notion.
        </div>
      )}

      {isLoading ? (
        <SkeletonChart className="h-96" />
      ) : data?.trades ? (
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Tous les trades"
            subtitle="Filtrable et triable par colonne"
            icon={TableProperties}
          />
          <TradeTable trades={data.trades} />
        </div>
      ) : null}
    </div>
  )
}

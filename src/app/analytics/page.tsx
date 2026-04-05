"use client"
import useSWR from "swr"
import { BarChart3, AlertTriangle, TrendingUp, Layers } from "lucide-react"
import { SectionHeader, SkeletonChart } from "@/components/ui/SectionHeader"
import { ResultsHisto } from "@/components/charts/ResultsHisto"
import { AssetBreakdown } from "@/components/charts/AssetBreakdown"
import { WinLossPie } from "@/components/charts/WinLossPie"
import type { StatsApiResponse } from "@/types/trade"
import { clsx } from "clsx"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR<StatsApiResponse>(
    "/api/stats",
    fetcher,
    { refreshInterval: 30 * 1000, revalidateOnFocus : true }
  )

  const stats = data?.stats

  // Normalise n'importe quel tableau breakdown vers BreakdownItem[]
  function normalizeBreakdown(
    arr: { asset?: string; setup?: string; session?: string; trades: number; pnl: number; winRate: number }[]
  ) {
    return arr.map((item) => ({
      asset: item.asset ?? item.setup ?? item.session ?? "N/A",
      trades: item.trades,
      pnl: item.pnl,
      winRate: item.winRate,
    }))
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Analytiques</h1>
        <p className="text-sm text-ink-tertiary mt-0.5">
          Statistiques avancées et breakdowns détaillés
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
          <AlertTriangle size={16} />
          Erreur lors du chargement. Vérifiez votre connexion Notion.
        </div>
      )}

      <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
        <SectionHeader
          title="Distribution des résultats"
          subtitle="Fréquence par tranche de P&L"
          icon={BarChart3}
        />
        {isLoading ? (
          <div className="skeleton h-48 w-full" />
        ) : stats ? (
          <ResultsHisto buckets={stats.resultBuckets} />
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Performance par asset"
            subtitle="P&L et winrate par instrument"
            icon={TrendingUp}
          />
          {isLoading ? (
            <div className="skeleton h-48 w-full" />
          ) : stats ? (
            <AssetBreakdown data={normalizeBreakdown(stats.byAsset)} />
          ) : null}
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Performance par setup"
            subtitle="Quelle stratégie fonctionne le mieux ?"
            icon={Layers}
          />
          {isLoading ? (
            <div className="skeleton h-48 w-full" />
          ) : stats ? (
            stats.bySetup.length > 0 ? (
              <AssetBreakdown data={normalizeBreakdown(stats.bySetup)} />
            ) : (
              <p className="text-sm text-ink-tertiary py-8 text-center">
                Renseigne la colonne Setup dans Notion pour voir ce breakdown
              </p>
            )
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Win/Loss global"
            subtitle="Répartition des outcomes"
            icon={BarChart3}
          />
          {isLoading ? (
            <div className="skeleton h-40 w-full" />
          ) : stats ? (
            <WinLossPie stats={stats} />
          ) : null}
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Récapitulatif statistique"
            subtitle="Tous les indicateurs en un coup d'oeil"
            icon={Layers}
          />
          {isLoading ? (
            <div className="skeleton h-40 w-full" />
          ) : stats ? (
            <div className="space-y-1">
              {(
                [
                  { label: "Total trades", value: stats.totalTrades, suffix: "" },
                  { label: "P&L total", value: `${stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}`, suffix: "$", positive: stats.totalPnL >= 0 },
                  { label: "Meilleur trade", value: `+${stats.bestTrade.toFixed(2)}`, suffix: "$", positive: true },
                  { label: "Pire trade", value: stats.worstTrade.toFixed(2), suffix: "$", positive: false },
                  { label: "Profit Factor", value: stats.profitFactor, suffix: "x", positive: stats.profitFactor >= 1 },
                  { label: "Max Drawdown", value: `-${stats.maxDrawdown.toFixed(2)}`, suffix: "$", positive: false },
                  { label: "Pertes consecutives max", value: stats.maxConsecutiveLosses, suffix: "" },
                  { label: "RR moyen realise", value: `${stats.avgRR}`, suffix: "R", positive: stats.avgRR >= stats.minRRForProfitability },
                ] as { label: string; value: string | number; suffix: string; positive?: boolean }[]
              ).map(({ label, value, suffix, positive }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0"
                >
                  <span className="text-xs text-ink-secondary">{label}</span>
                  <span className={clsx(
                    "text-xs font-semibold tabular-nums",
                    positive === true ? "text-profit" : positive === false ? "text-loss" : "text-ink-primary"
                  )}>
                    {value}{suffix}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

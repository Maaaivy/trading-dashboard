"use client"
// ============================================================
// app/page.tsx — Dashboard principal
// ============================================================
import useSWR from "swr"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Activity,
  Award,
  AlertTriangle,
  BarChart2,
} from "lucide-react"
import { KPICard } from "@/components/ui/KPICard"
import { SectionHeader, SkeletonCard, SkeletonChart } from "@/components/ui/SectionHeader"
import { PnLCurve } from "@/components/charts/PnLCurve"
import { WinLossPie } from "@/components/charts/WinLossPie"
import { RRChart } from "@/components/charts/RRChart"
import type { StatsApiResponse } from "@/types/trade"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<StatsApiResponse>(
    "/api/stats",
    fetcher,
    { refreshInterval: 30 * 1000, revalidateOnFocus : true } // refresh toutes les 5 min
  )

  const stats = data?.stats

  if (error) {
    return (
      <div className="p-8 flex items-center gap-3 text-loss">
        <AlertTriangle size={18} />
        <span className="text-sm">
          Erreur de connexion Notion — vérifier vos variables d'environnement.
        </span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">Dashboard</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">
            {data?.lastFetched
              ? `Mis à jour ${new Date(data.lastFetched).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "Chargement…"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-ink-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse-slow" />
          Notion Live
        </div>
      </div>

      {/* KPI Grid — 4 colonnes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : stats ? (
          <>
            <KPICard
              label="P&L Total"
              value={`${stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}$`}
              subValue={`${stats.totalTrades} trades au total`}
              icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
              variant={stats.totalPnL >= 0 ? "profit" : "loss"}
              trend={stats.totalPnL >= 0 ? "up" : "down"}
              animDelay={0}
            />
            <KPICard
              label="Taux de réussite"
              value={`${stats.winRate}%`}
              subValue={`${stats.winCount}W / ${stats.lossCount}L / ${stats.breakevenCount}BE`}
              icon={Target}
              variant={stats.winRate >= 50 ? "profit" : "loss"}
              animDelay={60}
            />
            <KPICard
              label="Gain moyen"
              value={`+${stats.avgWin.toFixed(2)}$`}
              subValue={`Sur ${stats.winCount} trades gagnants`}
              icon={Award}
              variant="profit"
              animDelay={120}
            />
            <KPICard
              label="Perte moyenne"
              value={`${stats.avgLoss.toFixed(2)}$`}
              subValue={`Sur ${stats.lossCount} trades perdants`}
              icon={TrendingDown}
              variant="loss"
              animDelay={180}
            />
            <KPICard
              label="R:R Moyen réel"
              value={`${stats.avgRR}R`}
              subValue={`Min. requis : ${stats.minRRForProfitability}R`}
              icon={BarChart2}
              variant={stats.avgRR >= stats.minRRForProfitability ? "profit" : "loss"}
              animDelay={240}
            />
            <KPICard
              label="Profit Factor"
              value={stats.profitFactor}
              subValue={stats.profitFactor >= 1.5 ? "Excellent" : stats.profitFactor >= 1 ? "Positif" : "À améliorer"}
              icon={Zap}
              variant={stats.profitFactor >= 1 ? "accent" : "loss"}
              animDelay={300}
            />
            <KPICard
              label="Max Drawdown"
              value={`-${stats.maxDrawdown.toFixed(2)}$`}
              subValue={`Pire creux depuis un sommet`}
              icon={Activity}
              variant={stats.maxDrawdown < stats.totalPnL * 0.2 ? "default" : "loss"}
              animDelay={360}
            />
            <KPICard
              label="Pertes consécutives"
              value={stats.maxConsecutiveLosses}
              subValue="Maximum sur la période"
              icon={AlertTriangle}
              variant={stats.maxConsecutiveLosses <= 3 ? "default" : "loss"}
              animDelay={420}
            />
          </>
        ) : null}
      </div>

      {/* Courbe de performance */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
        <SectionHeader
          title="Courbe de performance"
          subtitle="P&L cumulé trade par trade"
          icon={TrendingUp}
        />
        {isLoading ? (
          <div className="skeleton h-52 w-full" />
        ) : stats ? (
          <PnLCurve equityCurve={stats.equityCurve} />
        ) : null}
      </div>

      {/* Win/Loss + Risk/Reward côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Répartition Win / Loss"
            subtitle="Distribution des résultats"
            icon={Target}
          />
          {isLoading ? (
            <div className="skeleton h-40 w-full" />
          ) : stats ? (
            <WinLossPie stats={stats} />
          ) : null}
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5 animate-fade-in">
          <SectionHeader
            title="Analyse Risk / Reward"
            subtitle="Réel vs minimum requis"
            icon={BarChart2}
          />
          {isLoading ? (
            <div className="skeleton h-40 w-full" />
          ) : stats ? (
            <RRChart stats={stats} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

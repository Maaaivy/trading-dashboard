"use client"
// ============================================================
// components/charts/ResultsHisto.tsx
// Distribution des résultats en barres colorées
// ============================================================
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { TradeStats } from "@/types/trade"

interface Props {
  buckets: TradeStats["resultBuckets"]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { value: number; payload: { label: string; pct: number } }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg">
      <p className="text-xs text-ink-tertiary mb-1">{item.payload.label}</p>
      <p className="text-base font-semibold text-ink-primary tabular-nums">
        {item.value} trades
      </p>
      <p className="text-xs text-ink-secondary">{item.payload.pct}%</p>
    </div>
  )
}

export function ResultsHisto({ buckets }: Props) {
  if (!buckets.length) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-tertiary text-sm">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={buckets}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="20%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e2535"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "#4a5568", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#4a5568", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {buckets.map((entry, index) => {
            // Couleur basée sur si le bucket représente des gains ou des pertes
            const isProfit = entry.label.startsWith("-") === false && entry.label !== "0$"
            const isLoss = entry.label.startsWith("-")
            return (
              <Cell
                key={`cell-${index}`}
                fill={
                  isLoss
                    ? "rgba(255,23,68,0.7)"
                    : isProfit
                      ? "rgba(0,230,118,0.7)"
                      : "rgba(255,215,64,0.7)"
                }
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

"use client"
// ============================================================
// components/charts/RRChart.tsx
// Risk/Reward réel vs RR minimum nécessaire pour être rentable
// ============================================================
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import type { TradeStats } from "@/types/trade"

interface Props {
  stats: Pick<TradeStats, "avgRR" | "minRRForProfitability" | "winRate" | "byAsset">
}

export function RRChart({ stats }: Props) {
  const data = [
    {
      label: "RR Moyen réel",
      value: stats.avgRR,
      type: "actual",
    },
    {
      label: "RR Min nécessaire",
      value: stats.minRRForProfitability,
      type: "required",
    },
  ]

  const isAboveTarget = stats.avgRR >= stats.minRRForProfitability

  return (
    <div className="space-y-4">
      {/* Indicateur visuel */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated border border-surface-border">
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isAboveTarget ? "bg-profit" : "bg-loss"
          }`}
        />
        <p className="text-xs text-ink-secondary">
          {isAboveTarget
            ? `Ton RR moyen (${stats.avgRR}) dépasse le minimum requis (${stats.minRRForProfitability}) — tu es rentable structurellement ✓`
            : `Ton RR moyen (${stats.avgRR}) est en-dessous du minimum (${stats.minRRForProfitability}) pour ton winrate de ${stats.winRate}%`}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e2535"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#4a5568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, "dataMax + 0.5"]}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "#8892a4", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          <Tooltip
            formatter={(val: number) => [`${val}`, "Risk/Reward"]}
            contentStyle={{
              background: "#131720",
              border: "1px solid #1e2535",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#8892a4" }}
            itemStyle={{ color: "#e8eaf0" }}
          />
          <ReferenceLine
            x={stats.minRRForProfitability}
            stroke="#ffd740"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.type}
                fill={
                  entry.type === "actual"
                    ? isAboveTarget
                      ? "#00e676"
                      : "#ff1744"
                    : "#ffd740"
                }
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

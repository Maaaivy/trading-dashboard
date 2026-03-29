"use client"
// ============================================================
// components/charts/AssetBreakdown.tsx
// P&L et winrate par asset / setup / session
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

interface BreakdownItem {
  asset: string
  trades: number
  pnl: number
  winRate: number
}

interface Props {
  data: BreakdownItem[]
  title?: string
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: {
    value: number
    payload: BreakdownItem
  }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null
  const d = item.payload

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg min-w-[140px]">
      <p className="text-xs font-medium text-ink-primary mb-2">{d.asset}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-ink-tertiary">P&L</span>
          <span
            className={`font-medium tabular-nums ${
              d.pnl >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {d.pnl >= 0 ? "+" : ""}
            {d.pnl.toFixed(2)}$
          </span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-ink-tertiary">Winrate</span>
          <span className="font-medium text-ink-primary tabular-nums">
            {d.winRate}%
          </span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-ink-tertiary">Trades</span>
          <span className="font-medium text-ink-primary tabular-nums">
            {d.trades}
          </span>
        </div>
      </div>
    </div>
  )
}

export function AssetBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-ink-tertiary text-sm">
        Aucune donnée disponible
      </div>
    )
  }

  // Trier par P&L décroissant
  const sorted = [...data].sort((a, b) => b.pnl - a.pnl).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 36)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 60, left: 0, bottom: 4 }}
        barCategoryGap="25%"
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
          tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}$`}
        />
        <YAxis
          type="category"
          dataKey="asset"
          tick={{ fill: "#8892a4", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pnl >= 0 ? "rgba(0,230,118,0.75)" : "rgba(255,23,68,0.75)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

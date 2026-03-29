"use client"
// ============================================================
// components/charts/WinLossPie.tsx
// Donut chart Win / Loss / Breakeven
// ============================================================
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { TradeStats } from "@/types/trade"

interface Props {
  stats: Pick<TradeStats, "winCount" | "lossCount" | "breakevenCount" | "winRate">
}

const COLORS = {
  Win: "#00e676",
  Loss: "#ff1744",
  Breakeven: "#ffd740",
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { pct: number } }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg">
      <p className="text-xs text-ink-tertiary mb-1">{item.name}</p>
      <p className="text-base font-semibold text-ink-primary tabular-nums">
        {item.value} trades
      </p>
      <p className="text-xs text-ink-secondary">{item.payload.pct}%</p>
    </div>
  )
}

export function WinLossPie({ stats }: Props) {
  const total = stats.winCount + stats.lossCount + stats.breakevenCount
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-tertiary text-sm">
        Aucune donnée
      </div>
    )
  }

  const data = [
    {
      name: "Win",
      value: stats.winCount,
      pct: parseFloat(((stats.winCount / total) * 100).toFixed(1)),
    },
    {
      name: "Loss",
      value: stats.lossCount,
      pct: parseFloat(((stats.lossCount / total) * 100).toFixed(1)),
    },
    ...(stats.breakevenCount > 0
      ? [
          {
            name: "Breakeven",
            value: stats.breakevenCount,
            pct: parseFloat(((stats.breakevenCount / total) * 100).toFixed(1)),
          },
        ]
      : []),
  ]

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
                opacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Légende + winrate au centre */}
      <div className="flex-1 space-y-2">
        {/* Winrate mis en avant */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-ink-primary tabular-nums">
            {stats.winRate}%
          </p>
          <p className="text-xs text-ink-tertiary">Taux de réussite</p>
        </div>

        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: COLORS[entry.name as keyof typeof COLORS] }}
            />
            <span className="text-xs text-ink-secondary flex-1">
              {entry.name}
            </span>
            <span className="text-xs font-medium text-ink-primary tabular-nums">
              {entry.value}
            </span>
            <span className="text-xs text-ink-tertiary w-10 text-right tabular-nums">
              {entry.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

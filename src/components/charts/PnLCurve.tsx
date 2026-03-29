"use client"
// ============================================================
// components/charts/PnLCurve.tsx
// Courbe d'équité cumulative avec gradient sous la courbe
// ============================================================
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { TradeStats } from "@/types/trade"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface Props {
  equityCurve: TradeStats["equityCurve"]
}

// Tooltip personnalisé dark-themed
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; payload: { date: string; trade: number } }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const data = payload[0]
  if (!data) return null

  const isPositive = data.value >= 0

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg">
      <p className="text-xs text-ink-tertiary mb-1">
        Trade #{data.payload.trade}
      </p>
      <p className="text-xs text-ink-secondary mb-1">
        {data.payload.date
          ? format(parseISO(data.payload.date), "dd MMM yyyy", { locale: fr })
          : label}
      </p>
      <p
        className={`text-base font-semibold tabular-nums ${
          isPositive ? "text-profit" : "text-loss"
        }`}
      >
        {isPositive ? "+" : ""}
        {data.value.toFixed(2)}$
      </p>
    </div>
  )
}

export function PnLCurve({ equityCurve }: Props) {
  if (!equityCurve.length) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-tertiary text-sm">
        Aucune donnée disponible
      </div>
    )
  }

  const isPositive =
    (equityCurve[equityCurve.length - 1]?.cumPnL ?? 0) >= 0
  const color = isPositive ? "#00e676" : "#ff1744"
  const gradientId = isPositive ? "profitGrad" : "lossGrad"

  // Labels X — on n'affiche que quelques dates pour éviter la surcharge
  const step = Math.max(1, Math.floor(equityCurve.length / 8))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={equityCurve}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e2535"
          vertical={false}
        />

        <XAxis
          dataKey="trade"
          tick={{ fill: "#4a5568", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val: number) =>
            val % step === 0 ? `#${val}` : ""
          }
        />

        <YAxis
          tick={{ fill: "#4a5568", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}$`}
          width={60}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Ligne de référence à 0 */}
        <ReferenceLine y={0} stroke="#2d3748" strokeDasharray="4 4" />

        <Area
          type="monotone"
          dataKey="cumPnL"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#0d0f14", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

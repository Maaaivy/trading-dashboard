// ============================================================
// lib/calculations.ts — Calculs de tous les KPIs de trading
// ============================================================
import type { Trade, TradeStats } from "@/types/trade"

// ============================================================
// Calcul du Risk/Reward réalisé sur un trade
// ============================================================
export function calcRealizedRR(trade: Trade): number {
  const { entryPrice, stopLoss, exitPrice, direction } = trade
  if (!stopLoss || !entryPrice || !exitPrice) return 0

  const risk = Math.abs(entryPrice - stopLoss)
  if (risk === 0) return 0

  const reward =
    direction === "Long"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice

  return parseFloat((reward / risk).toFixed(2))
}

// ============================================================
// RR minimum nécessaire pour être rentable
// Formule : RR_min = (1 - WR) / WR
// ============================================================
export function calcMinRRForProfitability(winRate: number): number {
  if (winRate <= 0 || winRate >= 100) return 0
  const wr = winRate / 100
  return parseFloat(((1 - wr) / wr).toFixed(2))
}

// ============================================================
// Profit Factor = somme des gains / |somme des pertes|
// ============================================================
export function calcProfitFactor(trades: Trade[]): number {
  const totalGain = trades
    .filter((t) => t.resultDollar > 0)
    .reduce((sum, t) => sum + t.resultDollar, 0)

  const totalLoss = Math.abs(
    trades
      .filter((t) => t.resultDollar < 0)
      .reduce((sum, t) => sum + t.resultDollar, 0)
  )

  if (totalLoss === 0) return totalGain > 0 ? 99.99 : 0
  return parseFloat((totalGain / totalLoss).toFixed(2))
}

// ============================================================
// Drawdown maximum (pire creux depuis un sommet)
// ============================================================
export function calcMaxDrawdown(trades: Trade[]): number {
  let peak = 0
  let cumPnL = 0
  let maxDD = 0

  for (const trade of trades) {
    cumPnL += trade.resultDollar
    if (cumPnL > peak) peak = cumPnL
    const dd = peak - cumPnL
    if (dd > maxDD) maxDD = dd
  }

  return parseFloat(maxDD.toFixed(2))
}

// ============================================================
// Série temporelle pour la courbe d'équité cumulative
// ============================================================
export function buildEquityCurve(
  trades: Trade[]
): TradeStats["equityCurve"] {
  let cumPnL = 0
  return trades.map((trade, i) => {
    cumPnL += trade.resultDollar
    return {
      date: trade.date,
      cumPnL: parseFloat(cumPnL.toFixed(2)),
      trade: i + 1,
    }
  })
}

// ============================================================
// Distribution des résultats (buckets pour histogramme)
// ============================================================
export function buildResultBuckets(
  trades: Trade[]
): TradeStats["resultBuckets"] {
  if (trades.length === 0) return []

  const results = trades.map((t) => t.resultDollar)
  const min = Math.min(...results)
  const max = Math.max(...results)
  const range = max - min

  // 8 buckets dynamiques
  const bucketCount = 8
  const bucketSize = range / bucketCount || 1

  const buckets: Record<string, number> = {}

  for (let i = 0; i < bucketCount; i++) {
    const from = min + i * bucketSize
    const to = from + bucketSize
    const label = `${from.toFixed(0)}$`
    buckets[label] = 0
    // Stocker les bornes pour le remplissage
    ;(buckets as Record<string, unknown>)[`__from_${label}`] = from
    ;(buckets as Record<string, unknown>)[`__to_${label}`] = to
  }

  for (const result of results) {
    for (const label of Object.keys(buckets).filter((k) => !k.startsWith("__"))) {
      const from = (buckets as Record<string, unknown>)[`__from_${label}`] as number
      const to = (buckets as Record<string, unknown>)[`__to_${label}`] as number
      if (result >= from && (result < to || result === max)) {
        buckets[label]++
        break
      }
    }
  }

  return Object.keys(buckets)
    .filter((k) => !k.startsWith("__"))
    .map((label) => ({
      label,
      count: buckets[label] ?? 0,
      pct: parseFloat(
        (((buckets[label] ?? 0) / trades.length) * 100).toFixed(1)
      ),
    }))
}

// ============================================================
// Breakdown par groupe (asset, setup, session)
// ============================================================
function buildBreakdown(
  trades: Trade[],
  key: keyof Pick<Trade, "asset" | "setup" | "session">
): { asset: string; trades: number; pnl: number; winRate: number }[] {
  const map = new Map<
    string,
    { trades: number; wins: number; pnl: number }
  >()

  for (const trade of trades) {
    const val = (trade[key] as string | undefined) ?? "N/A"
    if (!map.has(val)) map.set(val, { trades: 0, wins: 0, pnl: 0 })
    const entry = map.get(val)!
    entry.trades++
    entry.pnl += trade.resultDollar
    if (trade.status === "Win") entry.wins++
  }

  return Array.from(map.entries())
    .map(([name, data]) => ({
      asset: name,
      trades: data.trades,
      pnl: parseFloat(data.pnl.toFixed(2)),
      winRate: parseFloat(((data.wins / data.trades) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.pnl - a.pnl)
}

// ============================================================
// Calcul global de toutes les stats
// ============================================================
export function computeStats(trades: Trade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0, winCount: 0, lossCount: 0, breakevenCount: 0,
      winRate: 0, totalPnL: 0, avgWin: 0, avgLoss: 0, avgRR: 0,
      minRRForProfitability: 0, profitFactor: 0, maxDrawdown: 0,
      maxConsecutiveLosses: 0, avgResultPercent: 0, bestTrade: 0,
      worstTrade: 0, equityCurve: [], resultBuckets: [],
      byAsset: [], bySetup: [], bySession: [],
    }
  }

  const wins = trades.filter((t) => t.status === "Win")
  const losses = trades.filter((t) => t.status === "Loss")
  const breakevens = trades.filter((t) => t.status === "Breakeven")

  const winRate = parseFloat(
    ((wins.length / trades.length) * 100).toFixed(1)
  )

  const totalPnL = parseFloat(
    trades.reduce((s, t) => s + t.resultDollar, 0).toFixed(2)
  )

  const avgWin =
    wins.length > 0
      ? parseFloat(
          (wins.reduce((s, t) => s + t.resultDollar, 0) / wins.length).toFixed(2)
        )
      : 0

  const avgLoss =
    losses.length > 0
      ? parseFloat(
          (losses.reduce((s, t) => s + t.resultDollar, 0) / losses.length).toFixed(2)
        )
      : 0

  // RR moyen réalisé
  const rrValues = trades
    .map(calcRealizedRR)
    .filter((rr) => rr !== 0)
  const avgRR =
    rrValues.length > 0
      ? parseFloat((rrValues.reduce((s, v) => s + v, 0) / rrValues.length).toFixed(2))
      : 0

  // Pire série de pertes consécutives
  let maxConsecutiveLosses = 0
  let currentLosses = 0
  for (const trade of trades) {
    if (trade.status === "Loss") {
      currentLosses++
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
    } else {
      currentLosses = 0
    }
  }

  const avgResultPercent =
    trades.filter((t) => t.resultPercent !== 0).length > 0
      ? parseFloat(
          (
            trades.reduce((s, t) => s + t.resultPercent, 0) / trades.length
          ).toFixed(2)
        )
      : 0

  const results = trades.map((t) => t.resultDollar)

  return {
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    breakevenCount: breakevens.length,
    winRate,
    totalPnL,
    avgWin,
    avgLoss,
    avgRR,
    minRRForProfitability: calcMinRRForProfitability(winRate),
    profitFactor: calcProfitFactor(trades),
    maxDrawdown: calcMaxDrawdown(trades),
    maxConsecutiveLosses,
    avgResultPercent,
    bestTrade: parseFloat(Math.max(...results).toFixed(2)),
    worstTrade: parseFloat(Math.min(...results).toFixed(2)),
    equityCurve: buildEquityCurve(trades),
    resultBuckets: buildResultBuckets(trades),
    byAsset: buildBreakdown(trades, "asset"),
    bySetup: buildBreakdown(trades, "setup"),
    bySession: buildBreakdown(trades, "session"),
  }
}

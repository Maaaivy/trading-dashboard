// ============================================================
// Types principaux de l'application
// ============================================================

/** Un trade tel que stocké dans Notion et consommé par l'app */
export interface Trade {
  id: string
  name: string
  date: string           // ISO 8601
  asset: string
  direction: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number
  resultDollar: number   // P&L en $ (négatif = perte)
  resultPercent: number  // P&L en % du capital risqué
  status: "Win" | "Loss" | "Breakeven"
  session?: string       // "London" | "New York" | "Asian"
  setup?: string         // "Breakout" | "Reversal" | "Trend" | etc.
  notes?: string
}

/** KPIs calculés depuis la liste de trades */
export interface TradeStats {
  totalTrades: number
  winCount: number
  lossCount: number
  breakevenCount: number
  winRate: number          // 0-100
  totalPnL: number
  avgWin: number
  avgLoss: number
  avgRR: number            // Risk/Reward moyen réalisé
  minRRForProfitability: number  // RR min pour être rentable avec ce winrate
  profitFactor: number     // somme gains / somme pertes
  maxDrawdown: number      // drawdown max en $
  maxConsecutiveLosses: number
  avgResultPercent: number
  bestTrade: number
  worstTrade: number
  // Série chronologique pour la courbe cumulative
  equityCurve: { date: string; cumPnL: number; trade: number }[]
  // Distribution pour l'histogramme
  resultBuckets: { label: string; count: number; pct: number }[]
  // Breakdown par asset
  byAsset: { asset: string; trades: number; pnl: number; winRate: number }[]
  // Breakdown par setup
  bySetup: { setup: string; trades: number; pnl: number; winRate: number }[]
  // Breakdown par session
  bySession: { session: string; trades: number; pnl: number; winRate: number }[]
}

/** Réponse de l'API /api/trades */
export interface TradesApiResponse {
  trades: Trade[]
  lastFetched: string
}

/** Réponse de l'API /api/stats */
export interface StatsApiResponse {
  stats: TradeStats
  lastFetched: string
}

/** Filtres appliqués au tableau des trades */
export interface TradeFilters {
  asset?: string
  direction?: "Long" | "Short"
  status?: "Win" | "Loss" | "Breakeven"
  session?: string
  setup?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

/** Ordre de tri du tableau */
export type SortField = keyof Pick<
  Trade,
  "date" | "asset" | "resultDollar" | "resultPercent" | "status" | "direction"
>
export type SortDirection = "asc" | "desc"

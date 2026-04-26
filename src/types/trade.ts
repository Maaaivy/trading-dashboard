// ============================================================
// types/trade.ts — Types mis à jour pour swing/position trading
// ============================================================

export interface Trade {
  id: string
  name: string
  date: string           // Fallback legacy
  entryDate: string      // Nouveau — date+heure d'entrée
  exitDate?: string      // Vide = position encore ouverte
  asset: string
  direction: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number
  resultDollar: number
  resultPercent: number
  status: "Win" | "Loss" | "Breakeven" | "Open"
  timeframe?: string
  market?: "Spot" | "Futures"
  session?: string
  setup?: string
  notes?: string
  // Calculé à la volée
  durationHours?: number
}

export interface TradeStats {
  totalTrades: number
  openTrades: number        // Nouveau
  closedTrades: number      // Nouveau
  winCount: number
  lossCount: number
  breakevenCount: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  avgRR: number
  minRRForProfitability: number
  profitFactor: number
  maxDrawdown: number
  maxConsecutiveLosses: number
  avgResultPercent: number
  bestTrade: number
  worstTrade: number
  avgDurationHours: number  // Nouveau
  // Breakdowns
  equityCurve: { date: string; cumPnL: number; trade: number }[]
  resultBuckets: { label: string; count: number; pct: number }[]
  byAsset: { asset: string; trades: number; pnl: number; winRate: number }[]
  bySetup: { asset: string; trades: number; pnl: number; winRate: number }[]
  bySession: { asset: string; trades: number; pnl: number; winRate: number }[]
  byTimeframe: { asset: string; trades: number; pnl: number; winRate: number }[]  // Nouveau
  byMarket: { asset: string; trades: number; pnl: number; winRate: number }[]     // Nouveau
}

export interface TradesApiResponse {
  trades: Trade[]
  openTrades: Trade[]     // Nouveau — positions ouvertes séparées
  lastFetched: string
}

export interface StatsApiResponse {
  stats: TradeStats
  lastFetched: string
}

export interface TradeFilters {
  asset?: string
  direction?: "Long" | "Short"
  status?: "Win" | "Loss" | "Breakeven" | "Open"
  session?: string
  setup?: string
  timeframe?: string
  market?: "Spot" | "Futures"
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type SortField = keyof Pick<
  Trade,
  "date" | "asset" | "resultDollar" | "resultPercent" | "status" | "direction" | "durationHours"
>;
export type SortDirection = "asc" | "desc"
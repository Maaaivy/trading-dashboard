// ============================================================
// app/api/stats/route.ts — GET /api/stats
// Retourne tous les KPIs calculés depuis les trades Notion
// ============================================================
import { NextResponse } from "next/server"
import { fetchAllTrades } from "@/lib/notion"
import { computeStats } from "@/lib/calculations"
import type { StatsApiResponse } from "@/types/trade"

export const revalidate = 0

export async function GET() {
  try {
    const trades = await fetchAllTrades()
    const stats = computeStats(trades)

    const response: StatsApiResponse = {
      stats,
      lastFetched: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[API /stats] Erreur:", error)

    const message =
      error instanceof Error ? error.message : "Erreur serveur inconnue"

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

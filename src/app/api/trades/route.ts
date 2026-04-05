// ============================================================
// app/api/trades/route.ts — GET /api/trades
// Retourne tous les trades depuis Notion
// ============================================================
import { NextResponse } from "next/server"
import { fetchAllTrades } from "@/lib/notion"
import type { TradesApiResponse } from "@/types/trade"

// Revalidation toutes les 5 minutes côté Vercel (ISR)
export const revalidate = 0

export async function GET() {
  try {
    const trades = await fetchAllTrades()

    const response: TradesApiResponse = {
      trades,
      lastFetched: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        // Cache HTTP de 5 min, révalidation en arrière-plan
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[API /trades] Erreur:", error)

    const message =
      error instanceof Error ? error.message : "Erreur serveur inconnue"

    return NextResponse.json(
      { error: message, trades: [] },
      { status: 500 }
    )
  }
}

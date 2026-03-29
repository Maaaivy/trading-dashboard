// ============================================================
// app/api/notion-test/route.ts — Test de connexion Notion
// ============================================================
import { NextResponse } from "next/server"
import { testNotionConnection } from "@/lib/notion"

export async function GET() {
  const result = await testNotionConnection()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  })
}

import { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Trade } from "@/types/trade"

let _client: Client | null = null

function getNotionClient(): Client {
  if (!_client) {
    const apiKey = process.env.NOTION_API_KEY
    if (!apiKey) throw new Error("NOTION_API_KEY manquant")
    _client = new Client({ auth: apiKey })
  }
  return _client
}

type NotionProperties = PageObjectResponse["properties"]

function getTitle(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "title") return prop.title.map((t) => t.plain_text).join("")
  return ""
}

function getNumber(props: NotionProperties, key: string): number {
  const prop = props[key]
  if (prop?.type === "number") return prop.number ?? 0
  return 0
}

function getSelect(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "select") return prop.select?.name ?? ""
  return ""
}

function getRichText(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("")
  return ""
}

function getDate(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "date") return prop.date?.start ?? ""
  return ""
}

function calcDurationHours(entryDate: string, exitDate?: string): number | undefined {
  if (!entryDate || !exitDate) return undefined
  const entry = new Date(entryDate).getTime()
  const exit = new Date(exitDate).getTime()
  if (isNaN(entry) || isNaN(exit)) return undefined
  return parseFloat(((exit - entry) / (1000 * 60 * 60)).toFixed(1))
}

function pageToTrade(page: PageObjectResponse): Trade {
  const p = page.properties
  const direction = getSelect(p, "Direction") as Trade["direction"]
  const rawStatus = getSelect(p, "Status")
  const entryDate = getDate(p, "Entry Date") || getDate(p, "Date")
  const exitDate = getDate(p, "Exit Date") || undefined

  // Déterminer le statut — position ouverte si pas d'Exit Date
  let status: Trade["status"] = "Open"
  if (rawStatus === "Loss") status = "Loss"
  else if (rawStatus === "Breakeven") status = "Breakeven"
  else if (rawStatus === "Win") status = "Win"


  const market = getSelect(p, "Market")

  return {
    id: page.id,
    name: getTitle(p, "Name"),
    date: getDate(p, "Date"),
    entryDate,
    exitDate,
    asset: getSelect(p, "Asset"),
    direction: direction === "Short" ? "Short" : "Long",
    entryPrice: getNumber(p, "Entry Price"),
    exitPrice: getNumber(p, "Exit Price"),
    stopLoss: getNumber(p, "Stop Loss"),
    takeProfit: getNumber(p, "Take Profit"),
    resultDollar: getNumber(p, "Result ($)"),
    resultPercent: getNumber(p, "Result (%)"),
    status,
    timeframe: getSelect(p, "Timeframe") || undefined,
    market: (market === "Spot" || market === "Futures") ? market : undefined,
    session: getSelect(p, "Session") || undefined,
    setup: getSelect(p, "Setup") || undefined,
    notes: getRichText(p, "Notes") || undefined,
    durationHours: calcDurationHours(entryDate, exitDate),
  }
}

export async function fetchAllTrades(): Promise<Trade[]> {
  const notion = getNotionClient()
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) throw new Error("NOTION_DATABASE_ID manquant")

  const trades: Trade[] = []
  let cursor: string | undefined = undefined

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ property: "Date", direction: "ascending" }],
    })

    for (const page of response.results) {
      if ("properties" in page) {
        const trade = pageToTrade(page as PageObjectResponse)
        if (trade.date || trade.entryDate) {
          trades.push(trade)
        }
      }
    }
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return trades
}

export async function testNotionConnection(): Promise<{
  ok: boolean; databaseTitle?: string; error?: string
}> {
  try {
    const notion = getNotionClient()
    const databaseId = process.env.NOTION_DATABASE_ID ?? ""
    const db = await notion.databases.retrieve({ database_id: databaseId })
    const title = "title" in db
      ? db.title.map((t: { plain_text: string }) => t.plain_text).join("")
      : "Base de données"
    return { ok: true, databaseTitle: title }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" }
  }
}

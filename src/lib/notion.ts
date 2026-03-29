// ============================================================
// lib/notion.ts — Client Notion + transformation des données
// ============================================================
import { Client } from "@notionhq/client"
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { Trade } from "@/types/trade"

// Singleton client — instancié une seule fois côté serveur
let _client: Client | null = null

function getNotionClient(): Client {
  if (!_client) {
    const apiKey = process.env.NOTION_API_KEY
    if (!apiKey) {
      throw new Error(
        "NOTION_API_KEY manquant. Vérifier votre fichier .env.local"
      )
    }
    _client = new Client({ auth: apiKey })
  }
  return _client
}

// ============================================================
// Helpers pour lire les propriétés Notion (typage strict)
// ============================================================

type NotionProperties = PageObjectResponse["properties"]

function getTitle(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("") ?? ""
  }
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
  if (prop?.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("") ?? ""
  }
  return ""
}

function getDate(props: NotionProperties, key: string): string {
  const prop = props[key]
  if (prop?.type === "date") return prop.date?.start ?? ""
  return ""
}

// ============================================================
// Transformation d'une page Notion → objet Trade
// ============================================================

function pageToTrade(page: PageObjectResponse): Trade {
  const p = page.properties

  const direction = getSelect(p, "Direction") as Trade["direction"]
  const status = getSelect(p, "Status") as Trade["status"]

  return {
    id: page.id,
    name: getTitle(p, "Name"),
    date: getDate(p, "Date"),
    asset: getSelect(p, "Asset"),
    direction: direction === "Short" ? "Short" : "Long",
    entryPrice: getNumber(p, "Entry Price"),
    exitPrice: getNumber(p, "Exit Price"),
    stopLoss: getNumber(p, "Stop Loss"),
    takeProfit: getNumber(p, "Take Profit"),
    resultDollar: getNumber(p, "Result ($)"),
    resultPercent: getNumber(p, "Result (%)"),
    status:
      status === "Loss"
        ? "Loss"
        : status === "Breakeven"
          ? "Breakeven"
          : "Win",
    session: getSelect(p, "Session") || undefined,
    setup: getSelect(p, "Setup") || undefined,
    notes: getRichText(p, "Notes") || undefined,
  }
}

// ============================================================
// Fetch de TOUS les trades (pagination automatique)
// ============================================================

export async function fetchAllTrades(): Promise<Trade[]> {
  const notion = getNotionClient()
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID manquant. Vérifier votre fichier .env.local"
    )
  }

  const trades: Trade[] = []
  let cursor: string | undefined = undefined

  // Notion pagine à 100 résultats max — on boucle jusqu'à tout récupérer
  do {
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ property: "Date", direction: "ascending" }],
      // Filtre : uniquement les trades avec une date renseignée
      filter: {
        property: "Date",
        date: { is_not_empty: true },
      },
    })

    for (const page of response.results) {
      // On ne traite que les pages complètes (pas les pages partielles)
      if ("properties" in page) {
        const trade = pageToTrade(page as PageObjectResponse)
        // Ignorer les entrées sans asset ou sans résultat
        if (trade.asset && trade.date) {
          trades.push(trade)
        }
      }
    }

    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return trades
}

// ============================================================
// Test de connexion (utilisé par la page Settings)
// ============================================================

export async function testNotionConnection(): Promise<{
  ok: boolean
  databaseTitle?: string
  error?: string
}> {
  try {
    const notion = getNotionClient()
    const databaseId = process.env.NOTION_DATABASE_ID ?? ""

    const db = await notion.databases.retrieve({ database_id: databaseId })
    const title =
      "title" in db
        ? db.title.map((t: { plain_text: string }) => t.plain_text).join("")
        : "Base de données"

    return { ok: true, databaseTitle: title }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    }
  }
}

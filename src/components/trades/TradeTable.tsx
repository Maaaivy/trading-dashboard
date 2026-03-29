"use client"
// ============================================================
// components/trades/TradeTable.tsx
// Tableau filtrable, triable, paginé des trades
// ============================================================
import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { clsx } from "clsx"
import type { Trade, TradeFilters, SortField, SortDirection } from "@/types/trade"
import { StatusBadge } from "@/components/ui/SectionHeader"

interface Props {
  trades: Trade[]
}

const PAGE_SIZE = 20

export function TradeTable({ trades }: Props) {
  const [filters, setFilters] = useState<TradeFilters>({})
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)

  // Valeurs uniques pour les filtres déroulants
  const assets = useMemo(
    () => [...new Set(trades.map((t) => t.asset))].filter(Boolean).sort(),
    [trades]
  )
  const setups = useMemo(
    () => [...new Set(trades.map((t) => t.setup).filter(Boolean))].sort(),
    [trades]
  )
  const sessions = useMemo(
    () => [...new Set(trades.map((t) => t.session).filter(Boolean))].sort(),
    [trades]
  )

  // Filtrage
  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filters.asset && t.asset !== filters.asset) return false
      if (filters.direction && t.direction !== filters.direction) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.session && t.session !== filters.session) return false
      if (filters.setup && t.setup !== filters.setup) return false
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo && t.date > filters.dateTo) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.asset.toLowerCase().includes(q) &&
          !(t.notes?.toLowerCase().includes(q))
        )
          return false
      }
      return true
    })
  }, [trades, filters])

  // Tri
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [filtered, sortField, sortDir])

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
    setPage(1)
  }

  function updateFilter<K extends keyof TradeFilters>(
    key: K,
    value: TradeFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  function clearFilters() {
    setFilters({})
    setPage(1)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-ink-muted" />
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-accent" />
      : <ChevronDown size={12} className="text-accent" />
  }

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Recherche */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={filters.search ?? ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-surface-elevated border border-surface-border rounded-lg text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent/40 w-40"
          />
        </div>

        {/* Select filtres */}
        {[
          { key: "asset" as const, options: assets, placeholder: "Asset" },
          {
            key: "direction" as const,
            options: ["Long", "Short"],
            placeholder: "Direction",
          },
          {
            key: "status" as const,
            options: ["Win", "Loss", "Breakeven"],
            placeholder: "Statut",
          },
          ...(sessions.length > 0
            ? [{ key: "session" as const, options: sessions as string[], placeholder: "Session" }]
            : []),
          ...(setups.length > 0
            ? [{ key: "setup" as const, options: setups as string[], placeholder: "Setup" }]
            : []),
        ].map(({ key, options, placeholder }) => (
          <select
            key={key}
            value={(filters[key] as string | undefined) ?? ""}
            onChange={(e) => updateFilter(key, e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-elevated border border-surface-border rounded-lg text-ink-secondary focus:outline-none focus:border-accent/40 cursor-pointer"
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-ink-tertiary hover:text-ink-primary border border-surface-border rounded-lg hover:border-accent/30 transition-colors"
          >
            <X size={11} />
            Réinitialiser
          </button>
        )}

        <span className="ml-auto text-xs text-ink-tertiary tabular-nums">
          {filtered.length} trade{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-elevated">
              {(
                [
                  { field: "date", label: "Date" },
                  { field: null, label: "Nom" },
                  { field: null, label: "Asset" },
                  { field: "direction", label: "Dir." },
                  { field: "status", label: "Statut" },
                  { field: "resultDollar", label: "P&L ($)" },
                  { field: "resultPercent", label: "P&L (%)" },
                  { field: null, label: "R:R" },
                  { field: null, label: "Setup" },
                ] as { field: SortField | null; label: string }[]
              ).map(({ field, label }) => (
                <th
                  key={label}
                  onClick={() => field && handleSort(field)}
                  className={clsx(
                    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-tertiary whitespace-nowrap",
                    field && "cursor-pointer hover:text-ink-secondary select-none"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-sm text-ink-tertiary"
                >
                  Aucun trade correspondant aux filtres
                </td>
              </tr>
            ) : (
              paginated.map((trade, i) => {
                const rr =
                  trade.stopLoss && trade.entryPrice && trade.exitPrice
                    ? (() => {
                        const risk = Math.abs(trade.entryPrice - trade.stopLoss)
                        if (risk === 0) return null
                        const reward =
                          trade.direction === "Long"
                            ? trade.exitPrice - trade.entryPrice
                            : trade.entryPrice - trade.exitPrice
                        return (reward / risk).toFixed(2)
                      })()
                    : null

                return (
                  <tr
                    key={trade.id}
                    className={clsx(
                      "border-b border-surface-border/50 transition-colors",
                      "hover:bg-surface-elevated/60",
                      i % 2 === 0 ? "bg-surface-card" : "bg-surface/60"
                    )}
                  >
                    <td className="px-4 py-3 text-xs text-ink-secondary whitespace-nowrap tabular-nums">
                      {trade.date
                        ? format(parseISO(trade.date), "dd MMM yy", { locale: fr })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-primary max-w-[160px] truncate">
                      {trade.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-elevated text-xs font-mono text-accent border border-accent/15">
                        {trade.asset}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "text-xs font-medium",
                          trade.direction === "Long"
                            ? "text-profit"
                            : "text-loss"
                        )}
                      >
                        {trade.direction === "Long" ? "↑ Long" : "↓ Short"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trade.status} />
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          trade.resultDollar > 0
                            ? "text-profit"
                            : trade.resultDollar < 0
                              ? "text-loss"
                              : "text-neutral"
                        }
                      >
                        {trade.resultDollar > 0 ? "+" : ""}
                        {trade.resultDollar.toFixed(2)}$
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums whitespace-nowrap">
                      {trade.resultPercent !== 0 ? (
                        <span
                          className={
                            trade.resultPercent > 0
                              ? "text-profit/80"
                              : "text-loss/80"
                          }
                        >
                          {trade.resultPercent > 0 ? "+" : ""}
                          {trade.resultPercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-secondary tabular-nums">
                      {rr ? (
                        <span
                          className={
                            parseFloat(rr) > 0 ? "text-ink-primary" : "text-loss/70"
                          }
                        >
                          {rr}R
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-tertiary">
                      {trade.setup ?? "—"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ink-tertiary tabular-nums">
            Page {page} / {totalPages} — {filtered.length} résultats
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-surface-border rounded-lg text-ink-secondary hover:text-ink-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Préc.
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    "px-3 py-1.5 text-xs border rounded-lg transition-colors",
                    p === page
                      ? "border-accent/40 text-accent bg-accent/10"
                      : "border-surface-border text-ink-secondary hover:text-ink-primary hover:border-accent/30"
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-surface-border rounded-lg text-ink-secondary hover:text-ink-primary hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

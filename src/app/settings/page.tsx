"use client"
// ============================================================
// app/settings/page.tsx — Configuration et test de connexion
// ============================================================
import { useState } from "react"
import { Settings, CheckCircle, XCircle, Loader2, ExternalLink, Copy, Check } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"

export default function SettingsPage() {
  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [testMessage, setTestMessage] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  async function testConnection() {
    setTestStatus("loading")
    setTestMessage("")
    try {
      const res = await fetch("/api/notion-test")
      const data = (await res.json()) as { ok: boolean; databaseTitle?: string; error?: string }
      if (data.ok) {
        setTestStatus("success")
        setTestMessage(`Connecté à : "${data.databaseTitle}"`)
      } else {
        setTestStatus("error")
        setTestMessage(data.error ?? "Connexion échouée")
      }
    } catch {
      setTestStatus("error")
      setTestMessage("Erreur réseau")
    }
  }

  function copyToClipboard(text: string, key: string) {
    void navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const envVars = [
    {
      key: "NOTION_API_KEY",
      description: "Clé secrète de ton intégration Notion",
      format: "secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      link: "https://www.notion.so/my-integrations",
      linkLabel: "Créer une intégration",
    },
    {
      key: "NOTION_DATABASE_ID",
      description: "ID de ta base de données Notion (dans l'URL)",
      format: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      link: "https://www.notion.so/help/create-linked-databases",
      linkLabel: "Comment trouver l'ID",
    },
  ]

  const steps = [
    {
      n: "01",
      title: "Créer une intégration Notion",
      desc: "Va sur notion.so/my-integrations, crée une nouvelle intégration interne et copie la clé secrète.",
    },
    {
      n: "02",
      title: "Partager la base de données",
      desc: 'Dans ta base de données Notion, clique sur "…" en haut à droite → "Connect to" → sélectionne ton intégration.',
    },
    {
      n: "03",
      title: "Configurer les variables d'env.",
      desc: "Copie .env.example en .env.local et remplis NOTION_API_KEY et NOTION_DATABASE_ID.",
    },
    {
      n: "04",
      title: "Déployer sur Vercel",
      desc: "Dans Vercel → Settings → Environment Variables, ajoute les deux variables. Puis redéploie.",
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[860px]">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Paramètres</h1>
        <p className="text-sm text-ink-tertiary mt-0.5">
          Configuration de la connexion Notion
        </p>
      </div>

      {/* Test de connexion */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5">
        <SectionHeader
          title="Test de connexion Notion"
          subtitle="Vérifie que ton intégration fonctionne"
          icon={Settings}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={testConnection}
            disabled={testStatus === "loading"}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-accent/10 border border-accent/30 text-accent rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {testStatus === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Settings size={14} />
            )}
            {testStatus === "loading" ? "Test en cours…" : "Tester la connexion"}
          </button>

          {testStatus !== "idle" && testStatus !== "loading" && (
            <div
              className={`flex items-center gap-2 text-sm ${
                testStatus === "success" ? "text-profit" : "text-loss"
              }`}
            >
              {testStatus === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {testMessage}
            </div>
          )}
        </div>
      </div>

      {/* Variables d'environnement */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5">
        <SectionHeader
          title="Variables d'environnement"
          subtitle="À configurer dans .env.local et sur Vercel"
          icon={Settings}
        />
        <div className="space-y-4">
          {envVars.map(({ key, description, format, link, linkLabel }) => (
            <div
              key={key}
              className="p-4 rounded-lg bg-surface-elevated border border-surface-border"
            >
              <div className="flex items-center justify-between mb-1">
                <code className="text-sm font-mono text-accent">{key}</code>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(key, key)}
                    className="text-ink-tertiary hover:text-ink-primary transition-colors"
                    title="Copier le nom"
                  >
                    {copied === key ? (
                      <Check size={13} className="text-profit" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ink-tertiary hover:text-accent transition-colors"
                  >
                    {linkLabel}
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <p className="text-xs text-ink-secondary mb-2">{description}</p>
              <code className="text-xs text-ink-tertiary font-mono">{format}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Guide de déploiement */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5">
        <SectionHeader
          title="Guide de déploiement"
          subtitle="4 étapes pour avoir ton dashboard en ligne"
          icon={Settings}
        />
        <ol className="space-y-4">
          {steps.map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-mono font-bold text-accent">
                {n}
              </span>
              <div>
                <p className="text-sm font-medium text-ink-primary">{title}</p>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Colonnes Notion attendues */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5">
        <SectionHeader
          title="Colonnes Notion requises"
          subtitle="Noms exacts attendus par l'API"
          icon={Settings}
        />
        <div className="grid grid-cols-2 gap-2">
          {[
            { col: "Name", type: "Title", req: true },
            { col: "Date", type: "Date", req: true },
            { col: "Asset", type: "Select", req: true },
            { col: "Direction", type: "Select", req: true },
            { col: "Entry Price", type: "Number", req: true },
            { col: "Exit Price", type: "Number", req: true },
            { col: "Stop Loss", type: "Number", req: true },
            { col: "Take Profit", type: "Number", req: true },
            { col: "Result ($)", type: "Number", req: true },
            { col: "Status", type: "Select", req: true },
            { col: "Result (%)", type: "Number", req: false },
            { col: "Session", type: "Select", req: false },
            { col: "Setup", type: "Select", req: false },
            { col: "Notes", type: "Text", req: false },
          ].map(({ col, type, req }) => (
            <div
              key={col}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border/50"
            >
              <code className="text-xs font-mono text-ink-primary">{col}</code>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink-tertiary">{type}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    req
                      ? "bg-loss/10 text-loss"
                      : "bg-surface-card text-ink-tertiary"
                  }`}
                >
                  {req ? "requis" : "optionnel"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

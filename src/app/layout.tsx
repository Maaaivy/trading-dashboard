// ============================================================
// app/layout.tsx — Layout racine (dark mode trading)
// ============================================================
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/ui/Sidebar"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Trading Dashboard",
  description: "Tableau de bord personnel de trading — connecté à Notion",
  themeColor: "#0d0f14",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-surface text-ink-primary antialiased`}
      >
        {/* Grille de fond subtile */}
        <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none z-0" />

        <div className="relative z-10 flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

# TradeLens — Trading Dashboard Personnel

Dashboard de trading personnel connecté à Notion, déployable en 5 minutes sur Vercel.

## Stack technique

- **Next.js 14** (App Router) — framework full-stack
- **TypeScript strict** — typage complet
- **Tailwind CSS** — design system dark mode
- **Recharts** — graphiques (PnL curve, pie chart, histogramme, RR analysis)
- **SWR** — fetching avec cache + revalidation automatique
- **@notionhq/client** — SDK officiel Notion
- **Lucide React** — icônes

## Démarrage rapide

### 1. Cloner et installer

```bash
git clone <ton-repo>
cd trading-dashboard
npm install
```

### 2. Configurer Notion

#### Créer l'intégration
1. Va sur [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crée une nouvelle intégration interne
3. Copie la **clé secrète** (`secret_xxx...`)

#### Partager ta base de données
1. Ouvre ta base de données Notion
2. Clique sur `...` en haut à droite → **Connect to**
3. Sélectionne ton intégration

#### Récupérer le Database ID
L'ID se trouve dans l'URL de ta base :
```
notion.so/{workspace}/{DATABASE_ID}?v=...
```

### 3. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplis `.env.local` :
```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## Colonnes Notion requises

| Colonne | Type Notion | Obligatoire | Notes |
|---------|------------|-------------|-------|
| `Name` | Title | ✅ | Nom du trade |
| `Date` | Date | ✅ | Date d'entrée |
| `Asset` | Select | ✅ | Ex: EURUSD, BTCUSD |
| `Direction` | Select | ✅ | Long ou Short |
| `Entry Price` | Number | ✅ | Prix d'entrée |
| `Exit Price` | Number | ✅ | Prix de sortie |
| `Stop Loss` | Number | ✅ | Niveau du stop |
| `Take Profit` | Number | ✅ | Niveau du TP |
| `Result ($)` | Number | ✅ | P&L en $ (négatif si perte) |
| `Status` | Select | ✅ | Win / Loss / Breakeven |
| `Result (%)` | Number | ⚪ | P&L en % |
| `Session` | Select | ⚪ | London / New York / Asian |
| `Setup` | Select | ⚪ | Breakout / Reversal / Trend |
| `Notes` | Text | ⚪ | Analyse post-trade |

---

## Déploiement Vercel

### Via CLI
```bash
npm i -g vercel
vercel --prod
```

### Via interface Vercel
1. Importe le repo sur [vercel.com](https://vercel.com)
2. Dans **Settings → Environment Variables**, ajoute :
   - `NOTION_API_KEY` = ta clé secrète
   - `NOTION_DATABASE_ID` = l'ID de ta DB
3. Redéploie

---

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx          # Layout dark mode global
│   ├── page.tsx            # Dashboard (KPIs + courbe + win/loss + RR)
│   ├── trades/page.tsx     # Historique filtrable et triable
│   ├── analytics/page.tsx  # Distribution, breakdown par asset/setup
│   ├── settings/page.tsx   # Config + test de connexion
│   └── api/
│       ├── trades/route.ts     # GET tous les trades
│       ├── stats/route.ts      # GET KPIs calculés
│       └── notion-test/route.ts # Test connexion
├── components/
│   ├── ui/
│   │   ├── KPICard.tsx         # Carte de métrique animée
│   │   ├── SectionHeader.tsx   # En-tête de section + skeletons
│   │   └── Sidebar.tsx         # Navigation latérale
│   ├── charts/
│   │   ├── PnLCurve.tsx        # Courbe P&L cumulative (AreaChart)
│   │   ├── WinLossPie.tsx      # Donut Win/Loss/BE
│   │   ├── ResultsHisto.tsx    # Histogramme des résultats
│   │   ├── RRChart.tsx         # Risk/Reward réel vs requis
│   │   └── AssetBreakdown.tsx  # Barres horizontales par asset
│   └── trades/
│       └── TradeTable.tsx      # Tableau filtrable + paginé
├── lib/
│   ├── notion.ts           # Client Notion + transformation
│   └── calculations.ts     # Tous les calculs KPIs
└── types/
    └── trade.ts            # Types TypeScript stricts
```

## KPIs calculés automatiquement

- **P&L total** — somme de tous les résultats
- **Taux de réussite** — % de trades gagnants
- **Gain / Perte moyen** — par trade gagnant/perdant
- **Risk/Reward moyen réel** — calculé depuis Entry/Exit/SL
- **RR minimum nécessaire** — pour être rentable avec ce winrate : `(1 - WR) / WR`
- **Profit Factor** — total gains / total pertes
- **Max Drawdown** — pire creux depuis un sommet
- **Série de pertes max** — nombre de losses consécutives
- **Courbe d'équité** — P&L cumulé trade par trade
- **Breakdown par asset / setup / session**

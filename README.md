<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/credit-card_1f4b3.png" width="80" />
</p>

<h1 align="center">Spend Analyser</h1>

<p align="center">
  <strong>Stop leaving money on the table.</strong><br/>
  The smartest way to squeeze every rupee of rewards from your credit cards.
</p>

<p align="center">
  <a href="https://spend-analyser.lovable.app">Try it live</a>
</p>

---

## The Problem

You own 3 credit cards. Each has different reward rates for different brands and categories. You used your HSBC card at Flipkart when your Axis card gives **5x more cashback** there. You forgot to redeem 3,200 points before they expired. Your annual fee could have been waived if you'd spent ₹18K more.

**Nobody tracks this. We do.**

## What It Does

Spend Analyser connects to your transaction history and tells you — in real time — exactly which card to use, what you're missing, and what's about to expire.

### Home Dashboard
Your financial command center. Total savings, missed rewards, and a feed of time-sensitive actions — all at a glance. One number tells the story: **₹19,700 saved** vs **₹6,400 missed**.

### Card Deep-Dive
Tap any card to see everything: brand-wise and category-wise spend breakdowns, reward caps and utilization, fee waiver progress, lounge access status, milestone tracking, welcome benefit status, and a full fee schedule. The Transactions tab shows the same real transaction data filtered to that specific card.

### Smart Actions
Nudges that actually matter:
- *"3,200 points expiring in 6 days — worth ₹960"*
- *"Spend ₹18,000 more to waive your annual fee"*
- *"Dining rewards maxed out — switch to HSBC Live+"*
- *"₹500 Flipkart voucher unclaimed"*

### Optimize
Brand-by-brand breakdown of where you're using the wrong card. See exactly how much you'd save by switching — with multi-card split strategies when reward caps kick in.

### Best Cards Marketplace
Browse 60+ cards across 11 banks (HDFC, SBI, ICICI, Axis, Kotak, HSBC, IDFC, AU, IndusInd, RBL, Yes Bank). Compare reward rates, annual fees, and features. Found one you like? Apply directly.

### Transaction Log
100+ transactions with per-transaction intelligence. Every row shows what you earned, what you missed, and which card would have been better. Unaccounted transactions from SMS can be categorized via a 3-step flow (category → brand → tag). Four distinct bottom sheet flows when tapping a transaction: best card used, better card available, no reward on brand, and UPI payment.

### Reward Calculator
"What would I earn if I spent ₹5,000 at Amazon?" Pick a brand or category, enter an amount, and see rewards across all your cards side-by-side. Covers 100+ brands across 14 categories.

### Redeem
Points sitting idle are points wasted. See redemption options (miles, vouchers, cashback) with value-per-point comparisons.

## How It Works

```
Gmail / SMS  →  Parse transactions  →  Match to cards  →  Apply reward rules  →  Surface insights
```

1. **Onboarding** — Connect Gmail for automatic enrichment, or fall back to SMS-based import
2. **Building** — Animated progress screen while we crunch 12 months of data
3. **Intelligence** — Every transaction is scored against every card you own
4. **Actions** — Expiring points, unclaimed benefits, and fee deadlines surface automatically

## 3-State Progressive Unlock

The app adapts its entire UI based on how much data the user has connected:

| State | Trigger | Card Names | Features Unlocked |
|-------|---------|-----------|-------------------|
| **SMS Only** | User grants SMS permission only | Masked: "HSBC ••7891" | Transactions (bare), Spend Analysis, Calculator, Basic Actions |
| **Manually Mapped** | User identifies cards via voice/manual flow | Full: "HSBC Travel One" | + Savings gauge, Optimization, Tags, Saved/Missed tracking |
| **Gmail Connected** | User links Gmail account | Full: "HSBC Travel One" | + Points tracking, Fee waivers, Milestones, Redemption, Vouchers |

Every screen enforces these states — locked sections show contextual Gmail nudges explaining what the user gains by connecting. The Optimize screen is fully locked in SMS-only mode. Redeem is locked until Gmail is connected. Benefits tab shows informational content in State 2 but no progress tracking until State 3.

## Routing & Deep Links

The app uses **real URLs** powered by React Router. Every screen has its own path — refresh, share, and bookmark anything.

| Path | Screen |
|------|--------|
| `/` | Onboarding entry |
| `/onboard` | Onboarding flow (phone + OTP + SMS/Gmail) |
| `/building` | "Crunching your data" loader |
| `/home` | Home dashboard |
| `/actions` | Action feed (expiring points, milestones, etc.) |
| `/optimize` | Brand-wise card recommendations |
| `/optimise` | Alias for `/optimize` |
| `/transactions` | Full transaction log with filters |
| `/calculate` | Reward calculator |
| `/redeem` | Redemption marketplace |
| `/cards` | Best Cards marketplace |
| `/cards/:id` | Per-card deep-dive |
| `/profile` | Card management & settings |
| `/gmail` | Gmail consent mock flow |

Browser **Back/Forward** works across all screens. Page **refresh** preserves the current screen.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 (SWC) |
| Routing | React Router v6 (URL-based) |
| Styling | Inline styles (feature screens) + Tailwind CSS v3 (shared/ui components) |
| State | React Context (`AppContext` provider) — hybrid module-level + Provider |
| UI Components | 40+ shadcn/ui components (Radix primitives) |
| Icons | Lucide React |
| Typography | Google Sans (400, 500, 600, 700) |
| Haptics | `web-haptics` for native-feel touch feedback |
| Data | 100 mock transactions, 50+ brands, 60+ cards, 14 spend categories |

## Data Coverage

- **Brands tracked:** Amazon, Flipkart, Swiggy, Zomato, BigBasket, Myntra, MakeMyTrip, Uber, Ola, Shell, Cleartrip, Nykaa, Netflix, BookMyShow, Starbucks, Dominos, and 35+ more
- **Categories:** Shopping, Groceries, Dining, Travel, Fuel, Entertainment, Bills, Insurance, Cab Rides, Health, Education, Fashion, Rent, Subscriptions
- **Banks:** HDFC, SBI, ICICI, Axis, Kotak, HSBC, IDFC, AU, IndusInd, RBL, Yes Bank
- **Card details:** Reward rates, caps, annual fees, waiver criteria, lounge access, milestone benefits, welcome offers, late fee slabs, forex charges

## Quick Start

```bash
bun install
bun dev
```

Open [localhost:5173](http://localhost:5173) and tap through the onboarding flow.

```bash
bun run build      # production build
bun run lint       # eslint
```

## Architecture

```
src/
├── App.tsx                 # Router definition
├── pages/
│   ├── Index.tsx           # Orchestrator: all state, URL ↔ screen sync, sheets
│   └── NotFound.tsx
├── store/
│   └── AppContext.ts       # Hybrid React Context (module-level + Provider)
├── features/
│   ├── onboard/            # Phone + OTP + SMS/Gmail consent
│   ├── building/           # 8-second progress loader
│   ├── new/                # Active home / optimize / transactions (re-exports legacy/)
│   ├── legacy/             # Pixel-perfect implementations
│   │   ├── LegacyHomeScreen.tsx
│   │   ├── LegacyTransactionsScreen.tsx
│   │   ├── LegacyOptimiseScreen.tsx
│   │   └── LegacyShared.tsx      # MerchantLogo, ActionBar, TransactionRow, groupByDate, HeroSection, SpendAnalysis, etc.
│   ├── actions/            # Action feed
│   ├── bestcards/          # Marketplace
│   ├── cardDetail/         # Per-card analytics (4 tabs: Analysis, Transactions, Benefits, Fees)
│   ├── calc/               # Reward calculator
│   ├── redeem/             # Redemption finder
│   ├── profile/            # Settings
│   ├── gmail/              # OAuth mock
│   └── redundant/          # Archived parallel implementations (do not import)
├── components/
│   ├── shared/             # NavBar, TxnRow, Tag, Icon, FontLoader, SortFilter, Circles, Primitives
│   ├── sheets/             # BottomSheets.tsx — all overlay sheets
│   │   └── BottomSheets.tsx  # TxnSheet (4 flows), CatBS (3 steps), FilterSheet, ActSheet, InfoBS, Toast, Gmail nudges, Voice flow
│   └── ui/                 # shadcn primitives (40+ components)
├── data/
│   ├── transactions.ts     # ALL_TXNS (100 mock transactions), brand/icon arrays
│   ├── cards.ts            # CARDS, SEMI_CARDS (user's 3 cards)
│   ├── bestCards.ts        # CARD_CATALOGUE (60+ market cards)
│   ├── cardDetail.ts       # CD array (per-card analytics data)
│   ├── calculator.ts       # CALC_BRANDS, CALC_CATS, CALC_CARDS, CAT_OPTIONS, BRAND_MAP
│   ├── actions.ts          # ACTIONS, ALL_ACTIONS, SMS_ACTIONS
│   └── spend.ts            # SPEND_BRANDS, SPEND_CATS, TOTAL_ACC
├── hooks/
│   ├── use-mobile.tsx      # Mobile viewport detection
│   └── use-toast.ts        # Toast notification hook
└── lib/
    ├── theme.ts            # C (color tokens), FN (font family)
    ├── format.ts           # f() — Indian number formatting
    └── utils.ts            # cn() class merge
```

### State Flow

1. `App.tsx` defines one route per screen, all rendering `<Index/>`.
2. `Index.tsx` owns all state and decides which feature screen to render based on the current `screen` value.
3. A pair of `useEffect`s keep `screen` and `location.pathname` in sync — set state and the URL updates, change the URL and state follows.
4. State is published to children through `<AppContext.Provider>`. Any feature module reads via `useAppContext()`.
5. Bottom sheets and overlays are mounted at the orchestrator level so they can layer above any screen.
6. Three derived flags (`isState1`, `isState2`, `isState3`) control progressive feature unlock across all screens. Context helpers (`getCardDisplayName`, `getCardChips`, `getFilteredActions`) ensure consistent state-aware rendering.

### Bottom Sheets

All mounted by `<BottomSheets/>` component:

| Sheet | Purpose |
|-------|---------|
| TxnSheet | Transaction detail — 4 flows: best card, switch card, no reward, UPI |
| CatBS | Unaccounted transaction categorization — 3 steps: category → brand → tag |
| FilterSheet | Sort/filter — 4 tabs: Sort, Card Used, Categories, Brands |
| ActSheet | Action detail with "why it matters" + CTA |
| InfoBS | Generic info overlay |
| Toast | Top-center notification |
| GmailNudgeBanner | Inline Gmail connect banner |
| GmailNudgePopup/Sheet | Gmail connect prompts |
| LockedSection | Locked/gated content overlay |
| VoiceFlowOverlay | Voice card identification |
| RetroOverlay | Gmail re-linking progress |

### Transaction Data Flow

`ALL_TXNS` (100 transactions) in `data/transactions.ts` is the single source of truth:
- **Home screen**: `filtered` (via `doFilter`/`doSort` in AppContext) → first 4 shown in preview
- **Transactions screen**: Full `filtered` list with sort/filter chips
- **Card Detail**: `ALL_TXNS.filter(t => t.via.includes(card.name))` — card-specific transactions
- **Bottom sheets**: TxnSheet/CatBS receive individual transaction objects on tap

### Active vs Archived Code

| Path | Status |
|------|--------|
| `src/features/new/*` | Active — canonical exports |
| `src/features/legacy/*` | Active — implementation re-exported by `new/` |
| `public/legacy-assets/*` | Active — referenced card art and fonts |
| `public/brands/*` | Active — brand logo PNGs |
| `public/categories/*` | Active — 3D category icon PNGs |
| `src/features/redundant/*` | Archived — not imported |

## Assets

### Brand Logos (`public/brands/`)
`flipkart.png`, `amazon.png`, `swiggy.png`, `zomato.png`, `bb.png` (BigBasket), `myntra.png`, `adiddas.png`, `muscle-blaze.png`

### Category Icons (`public/categories/`)
`shopping.png`, `groceries.png`, `food.png`, `dining.png`, `travel.png`, `bills.png`, `fuel.png`, `entertainment.png`, `cab.png`, `flights.png`, `hotels.png`, `milestones.png`

### Card Art (`public/legacy-assets/cards/`)
`axis-flipkart.png`, `hsbc-travel-one.png`, `hsbc-live.png`, `hdfc-infinia.png`, `idfc select.png`, `Hdfc swiggy.png`, `icici-emeralde.png`, `AU-Zenith.png`, `amex-platinum-travel.png`, `sbi-miles.png`

## Recent Changes (April 2026)

- **3-State Enforcement** — Full progressive unlock system across all screens: SMS Only → Manually Mapped → Gmail Connected. Each state controls card name display, savings visibility, action filtering, feature gating, and contextual Gmail nudges
- **Transaction Bottom Sheet** — 4 distinct flows (best card, switch, no reward, UPI) with staggered animations and frosted glass "You Spent" badge
- **Category Bottom Sheet** — 3-step unaccounted transaction flow with 3D category images, brand logo grids, and "Not a spend" reasons
- **Card Detail Transactions** — Now uses real `ALL_TXNS` filtered by card instead of locally generated data
- **Brand images** — TxnRow and Card Detail now show brand logo PNGs (Flipkart, Amazon, Swiggy, etc.) instead of emoji
- **Date grouping** — Transaction list grouped by descending month: "1 APR - TODAY", "1 MAR - 1 APR", etc.
- **URL-based routing** — every screen has a real path; refresh and back/forward work everywhere
- **AppContext rewritten** — hybrid module-level + Provider, eliminating render-time race conditions

## Deletion Candidates

Safe to delete:
- `dist/` (build output, regenerated by `bun run build`)
- `src/features/redundant/*` (archived; nothing imports them)

Decide before deleting:
- One lockfile family. Keep `bun.lock` **or** `package-lock.json` — not both.

Do **not** delete:
- `src/features/new/*` (canonical import layer)
- `src/features/legacy/*` (powers Home/Optimize/Transactions)
- `public/legacy-assets/*`, `public/brands/*`, `public/categories/*` (actively referenced)

---

<p align="center">
  <sub>Built with <a href="https://lovable.dev">Lovable</a></sub>
</p>

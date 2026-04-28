# Spend Analyser — Project Guide

## Stack
- **React 18** + **Vite 5** (SWC) + **TypeScript** (loose — most feature files use `@ts-nocheck`)
- **React Router v6** — all routes render `<Index />` which reads URL to pick screen
- **State**: Hybrid React Context (`src/store/AppContext.ts`) — module-level `_store` + Provider
- **UI lib**: 40+ shadcn/ui components in `src/components/ui/` (Radix primitives + Tailwind)
- **Styling**: Feature screens use **inline styles** (not Tailwind). Shared components may use Tailwind.
- **Mobile-first**: All screens capped at `maxWidth: 400px`, centered with `margin: "0 auto"`

## Key Paths
```
src/
  main.tsx                       ← Application entry point
  App.tsx                        ← Route definitions
  pages/Index.tsx                ← Master orchestrator (~1500 lines), URL ↔ screen mapping, all state
  features/
    calc/CalcScreen.tsx        ← Calculator (brand select → results + limits tracking)
    new/HomeScreen.tsx          ← Home dashboard (re-exports legacy/)
    new/TransactionsScreen.tsx  ← Transaction list (re-exports legacy/)
    new/OptimizeScreen.tsx      ← Brand-wise card recs (re-exports legacy/)
    legacy/                     ← Pixel-perfect implementations
      LegacyHomeScreen.tsx      ← Home dashboard with hero, actions, tools, transactions
      LegacyTransactionsScreen.tsx ← Full transaction log with filters + sort
      LegacyOptimiseScreen.tsx  ← Brand-by-brand optimization
      LegacyShared.tsx          ← Shared components (MerchantLogo, ActionBar, TransactionRow, groupByDate, HeroSection, SpendAnalysis, TransactionAnalysis, SavingsInfoIcon, SavingsBreakdownSheet, HOOK_CAT_ICON, CAT_IMG, CardPromo, ToolsSection, etc.)
    bestcards/
      BestCardsScreen.tsx            ← Marketplace + floating "Card Portfolio" widget
      CardDetailV2.tsx               ← Per-card detail (4 tabs: How to use / Benefits / Fee / Eligibility, T&C)
    portfolio/
      PortfolioCreateScreen.tsx      ← Pick 3 cards
      PortfolioResultsScreen.tsx     ← Show savings + how-to-spend
    cardDetail/                 ← Individual card detail (8 tabs)
    onboard/                    ← Onboarding flow (phone + OTP + SMS/Gmail)
      CardIdentificationScreen.tsx   ← Card identification (Gmail/manual paths)
      ManualEntryScreen.tsx          ← Manual card selection
      GmailExtraInfoScreen.tsx       ← Gmail linking with extra details
      SpendAnalysisScreen.tsx        ← Spend analysis cinematic
      ToolsIntroScreen.tsx           ← Tools tutorial
      TxnEvalScreen.tsx              ← Transaction evaluation animation
      FinalLoadingScreen.tsx         ← Loading transition to home
    building/                   ← Animated data processing loader
    actions/                    ← Action feed (expiring points, milestones)
    actions/ActionsConsiderScreen.tsx ← New actions flow (USE_NEW_FLOW=true)
    cardDetail/CardAnalysisFigma.tsx ← Card analysis component (brands/categories bars, caps, RP hero)
    profile/                    ← User profile & card management
    redeem/                     ← Points redemption
    gmail/                      ← Gmail OAuth mock flow
    redundant/                  ← Archived parallel implementations (do not import)
  components/
    ui/                         ← shadcn/ui (Card, Button, Dialog, Drawer, Progress, etc.)
    shared/                     ← ActionCard, NavBar, TxnRow, FontLoader, Tag, Icon, SortFilter, Circles, Primitives
    MobileMock.tsx                ← iPhone chrome wrapper (non-intrusive overlay)
    sheets/BottomSheets.tsx     ← All bottom-sheet overlays (TxnSheet, CatBS, FilterSheet, ActSheet, InfoBS, Toast, Gmail nudges, etc.)
  data/
    calculator.ts               ← CALC_BRANDS, CALC_CATS, CALC_CARDS, CAT_OPTIONS, BRAND_MAP
    cards.ts                    ← User card definitions (CARDS, SEMI_CARDS)
    bestCards.ts                ← Market card catalogue (CARD_CATALOGUE)
    transactions.ts             ← ALL_TXNS (100 mock transactions), br/ic arrays, tg() tag generator
    actions.ts                  ← ACTIONS, ALL_ACTIONS, SMS_ACTIONS
    actionsConsider.ts            ← Actions Consider screen data (11 hooks, dynamic from simulation)
    spend.ts                    ← SPEND_BRANDS (top brands), SPEND_CATS, TOTAL_ACC
    cardDetail.ts               ← Card detail tab data
    optimize.ts                 ← Optimization data
    simulation/
      inputs.ts                  ← Spend profile, card portfolio, reward rates, caps
      compute.ts                 ← Core computation engine (savings, transactions, actions, card detail)
      mockApi.ts                 ← Mock /calculate API (per-bucket rewards, caps, lounge)
      legacy.ts                  ← Adapter layer (re-exports computed data as CARDS, CD, ALL_TXNS, SAVINGS_BARS, etc.)
      recommendData.ts           ← Static /recommend_cards API response (market card data)
  hooks/
    use-mobile.tsx              ← Mobile viewport detection hook
    use-toast.ts                ← Toast notification hook
  lib/
    theme.ts                    ← C (color tokens), FN (font family)
    format.ts                   ← f() — Indian number formatting (toLocaleString("en-IN"))
    utils.ts                    ← cn() class merge utility
  store/AppContext.ts            ← Global state (no fixed types, dynamic shape)
```

## Routes
`/` → onboard, `/home`, `/calculate`, `/redeem`, `/optimize`, `/optimise` (alias), `/actions`, `/transactions`, `/profile`, `/cards`, `/cards/:id`, `/portfolio/create`, `/portfolio/results`, `/gmail`, `/building`

All render `<Index />` which uses `useLocation()` to determine active screen.

## Onboarding Flow

Both manual and Gmail paths converge at `txn-eval`:

```
onboard (phone→OTP→SMS)
  → analysis (spend cinematic, 7s countdown)
    → card-id (3 cards revealed, Gmail/Manual choice)
      ├─ Manual: manual-entry (pick 3 cards) → txn-eval
      └─ Gmail:  gmail → gmail-extra (DOB + HSBC digits) → txn-eval
        → txn-eval (3 transaction evaluations, ~18s)
          → tools-intro (3 tool cards, ~13s)
            → final-loading (3 phases, ~6s)
              → home
```

- Every screen has a skip option that jumps to `home`
- `building` screen is NOT part of onboarding — only reachable from Card Detail "Add manually" or Voice flow fallback
- `GmailExtraInfoScreen.handleProceed` sets state directly (hasGmail, userFlag, mappingCompleted, cardMapping) and calls `setScreen("txn-eval")` after 2s — does NOT call `completeGmailLink()`
- `completeGmailLink()` in Index.tsx is only used by BuildingScreen's Gmail button (card detail "Add manually" flow)
- DOB/HSBC logic lives in `GmailExtraInfoScreen.tsx` (preserved from production, not reference repo)

## Design System

### Font
- **Family**: `'Google Sans', system-ui, sans-serif` — imported via `<FL/>` component
- **Weights loaded**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Variable**: `FN` from `@/lib/theme` — use in all `fontFamily` inline styles
- **Serif**: Class `legacy-serif` for decorative headings (Blacklist font via CSS)

### Colors

**Backgrounds**
| Token | Hex | Usage |
|-------|-----|-------|
| Page bg | `#F5F9FA` | Main screen background |
| Card bg | `#FFFFFF` | Card surfaces |
| Golden gradient | `linear-gradient(360deg, #4F2E0B -6.51%, #D78D04 87.99%)` | Calc header (legacy) |
| Purple gradient | `linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)` | Calc header (current) |

**Text**
| Weight/Size | Color | Usage |
|-------------|-------|-------|
| 500 / 16px | `#36405E` | Primary card name (best card) |
| 500 / 14px | `#36405E` | Secondary card names (wallet/market cards) |
| 700 / 9px | `#098039` | Reward labels (uppercase, 0.1em spacing) |
| 700 / 9px | `#68A250` | Cashback rate in TxnSheet card boxes |
| 400 / 11px | `#808387` | Subtle labels (Your Spends, Cashback %) |
| 600 / 12px | `#808387` | Subtle values (₹5,000, 5%) |
| 600 / 12px | `#1C2A33` | Bold labels (Total Savings) |
| 600 / 14px | `#008846` | Green values (₹250 savings) |
| 700 / 10px | `rgba(68, 63, 63, 0.7)` | Section titles (LIMITS AND CAPS) — uppercase, 0.2em spacing |
| 500 / 12px | `#222941` | Subsection headings (Card limit, Reward Cap) |
| 700 / 10px | `#364060` | Info values (₹70,000 / ₹1,20,000) |
| 400 / 10px | `rgba(54, 64, 96, 0.7)` | Info labels (available, remaining, Used, this Txn) |

**Progress Bar Colors**
| Section | Primary (used/earned) | Secondary (this txn) | Legend empty |
|---------|----------------------|---------------------|-------------|
| Card limit | `#14569D` | `#9FB1F8` | `#F1F3F7` |
| Reward Cap | `#149D9D` | `#9FE2F8` | `#F1F3F7` |
| Bookmyshow | `#149D36` | `#9FF8C7` | `#F1F3F7` |
| Annual Fee | `#212121` | `#CCCCCC` | `#F1F3F7` |

### Borders & Shadows
- **Card border**: `1px solid #E8F0F1`
- **Card shadow**: `0px 2px 8px rgba(0, 0, 0, 0.08)`
- **Card radius**: `10px` (main result card), `16px` (brand tiles), `10px` (wallet/market cards)
- **Inner divider**: `0.8px solid rgba(206, 200, 200, 0.4)` — separates card header from content
- **Dashed divider**: SVG `<line>` with `strokeDasharray="2 2"`, stroke color varies per context
- **Diamond divider**: 3 rotated squares (`3x3px, rotate(45deg), #A09784`) + dashed line, `opacity: 0.4`
- **Progress bar bg**: `rgba(123, 142, 178, 0.1)` with `box-shadow: 0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)`
- **Progress bar**: height `16px`, border-radius `4px`
- **Neumorphic button**: `background: #F4F8FF`, multiple layered box-shadows for depth effect

### Card Detail Progress Bars (Limits & Capping)
| Threshold | Color | Inner Shadow |
|-----------|-------|-------------|
| Good (<40%) | `#4DC20D` | `1.5px 1.75px 4px #70FF45 inset` |
| Alert (40-70%) | `#FFE666` (credit) / `#FFA666` (caps) | `1.5px 1.75px 4px #FFCB45 inset` |
| High (>70%) | `#FF7D66` | `1.5px 1.75px 4px #FF5D45 inset` |
All bars share: `0px 2.75px 5px rgba(0,0,0,0.12)` outer + `-2px -2px 3.75px rgba(255,255,255,0.6) inset`

### Card Detail Action Cards
- **Background**: `linear-gradient(270deg, rgba(240,251,255,0.8), rgba(224,236,255,0.8))` (blue tint)
- **Border**: `1px solid #FFFFFF`
- **Shadow**: `0px 0.62px 2px rgba(9,84,171,0.11)`
- **Text**: 12px/600, color `rgba(36,45,74,0.9)`

### Fees Tables
- Left column: `background: #F7F8F9`
- Right column: `background: #FFFFFF`, `border-left: 1px solid #EEEEEE`
- Section headers use diamond divider + uppercase label with `letter-spacing: 0.2em`

### Status Badges
- **Claimed/Waived**: `background: linear-gradient(90deg, #FEFEDD 0%, transparent), linear-gradient(90deg, #E0F9ED 0%, transparent)`, color `#059669`
- **More to spend**: `background: linear-gradient(90deg, #EAF2FC 0%, transparent)`, color `#0EA5E9`
- **Days left**: `background: linear-gradient(90deg, #FCF9EA 0%, transparent)`, color `#D97706`

### Buttons
- **Toggle button** (Track Limits): `background: linear-gradient(90deg, #F5F9FF 0%, #FFFFFF 100%)`, border `1px solid #1733900F`, shadow `0px 1px 2px 0px #0000000F`, radius `6px`, font 11px/600 `#222941`
- **Primary CTA**: `background: linear-gradient(90deg, #222941 0%, #101C43 100%)`, radius `10.17px`, height `48.51px`
- **Filter chip active**: bg `#1f2937`, color `#fff`
- **Filter chip inactive**: bg `#fff`, border `1.31px solid #E2E8EF`, color `#6b7280`

### Transaction Row (Legacy Transactions Screen)
- **Merchant icon container**: `38×39px`, `border-radius: 4px`, `border: 1px solid #EDEDED`, white bg
- **Merchant icon image**: `36×31px`, `object-fit: contain` (use PNG assets from `/brands/`)
- **Merchant name**: 12px / 700 / `#242d4a`
- **Card line** (e.g. "Axis Flipkart | 27 Jan"): 10px / 500 / `#808387`, line-height 140%
- **Saved text**: 9px / 700 / uppercase, letter-spacing `0.1em`, color `#078146` (or `#B56D3C` for ₹0)
- **CTA badge font**: 9px / 700 / uppercase, letter-spacing `0.1em`
- **Dashed divider**: SVG `<line>` with `strokeDasharray="2 2"`, stroke `#D1E3F6`
- **Unaccounted icon**: same 38×39 container with SVG question mark circle (`stroke: #9CA3AF`)
- **Date group labels**: descending by month — "1 APR - TODAY", "1 MAR - 1 APR", "1 FEB - 1 MAR", etc.

### Transaction Bottom Sheet (TxnSheet)
4 distinct flows based on transaction type:

**Case detection:**
```
isUPI       = txnSheet.via === "UPI"
isBest      = cardName === bestCard (for brand)
noReward    = !isBest && !isUPI && saved===0/null && no missed
walletHasBetter = !isBest && !isUPI && !noReward
```

**Background gradients:**
| Case | Gradient |
|------|----------|
| Best card | `linear-gradient(44.22deg, #FFFFFF 64.77%, #FFF4DC 93.92%)` |
| Switch / UPI | `linear-gradient(44.22deg, #FFFFFF 64.77%, #FDF2E9 93.92%)` |
| No reward | `linear-gradient(44.22deg, #FFFFFF 64.77%, #FFE4DC 93.92%)` |

**Card box styles:**
| Section | Background | Border |
|---------|-----------|--------|
| Best / Wallet | `rgba(218,255,217,0.2)` | `1px solid #CFF3CE` |
| Used (switch) | `rgba(255,247,217,0.2)` | `1px solid #F3E2CE` |
| Market | `rgba(217,229,255,0.2)` | `1px solid #CED3F3` |
| Empty wallet / UPI text | `rgba(237,237,237,0.2)` | `1px solid rgba(0,0,0,0.05)` |

**Shared elements:**
- **Sheet radius**: `24px 24px 0 0`
- **Brand name**: 14px / 600 / `#36405E`, line-height 17px
- **Date**: 11px / 500 / `#808387`
- **"You Spent" badge**: frosted glass — `background: rgba(255,255,255,0.65)`, `backdrop-filter: blur(12px)`, neumorphic inset shadows. "You Spent" 11px/400/#808387, amount 14px/600/#364060
- **Section label** (CARD YOU USED, BETTER CARD IN YOUR WALLET, WORTH ADDING): 9.28px / 700 / `#2F374B`, letter-spacing `0.2em`, uppercase, no trailing line
- **Card name in boxes**: 14px / 500 / `#36405E`, line-height 18px
- **Cashback rate**: 9px / 700 / `#68A250`, letter-spacing `0.1em`, uppercase (brown `#B56D3C` for no-reward)
- **Card image**: `70.72×47.15px`, `border-radius: 3.54px`, `border: 0.29px solid rgba(255,255,255,0.2)`, layered box-shadows
- **"Got it" button**: `linear-gradient(90deg, #222941, #101C43)`, `height: 48.51px`, `border-radius: 10.17px`, layered box-shadows
- **Bottom text (best card)**: 12px / 500 / `#395E36` (line 1), 10px / 500 / `rgba(37,37,37,0.5)` (line 2)
- **Star icon**: `/legacy-assets/save star.png` (36×36)
- **Market icon**: `/ui/market-badge.png` (31×37)

**Animation:**
- Sheet slides up 350ms with iOS drawer curve `cubic-bezier(0.32,0.72,0,1)`
- Overlay fades in 200ms with `cubic-bezier(0.23,1,0.32,1)`
- Content staggers fade-up 300ms, delays: 80ms, 160ms, 240ms, 320ms, 400ms
- Button `:active` scale(0.97) with 100ms ease-out

### Category Bottom Sheet (CatBS)
3-step flow for unaccounted transactions:
1. **Category selection** (catStep=1): 3D category image grid (3 cols), search input, "Not a spend" option
2. **Brand selection** (catStep=2): Category dropdown (clickable back), search input, 3-col brand grid with logo PNGs
3. **Not a spend** (catStep=0): Reason list (Loan/EMI, Refund, OTP, Duplicate, Other)

**Category tile**: `101px` wide, `border-radius: 16px`, `border: 1.31px solid #E2E8EF`, `background: #FCFCFC`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
**Category image area**: `93×69px`, `border-radius: 14px`, colored background per category
**Brand tile**: same dimensions as category tile, `#F5F5F5` image background
**Search input**: `border: 1px solid #D3E4FA`, `border-radius: 8px`, `font-size: 14px`
**SMS label**: floating "Original SMS" label positioned absolute `top: -7px`, white background

### Animations (defined in FontLoader.tsx)
| Class | Effect | Duration |
|-------|--------|----------|
| `slide-in` | translateX(40px→0) + fade | 0.2s |
| `expand-down` | translateY(-8px→0) + opacity + max-height | 0.35s |
| `fade-up` | translateY(10px→0) + fade | 0.25s |
| `opt-in` | translateY(30px→0) + fade | 0.35s |

### Legend Pattern (Limits section)
- Dot: `7px × 8px`, border-radius `2px`
- Value: 10px / 700 / `#364060` (or `#008846` for green highlight)
- Label: 10px / 400 / `rgba(54, 64, 96, 0.7)`
- Layout: 3-column flex with `space-between`, first left-aligned, middle centered, last right-aligned

## Data Models

### Transaction (`ALL_TXNS`)
```ts
{ brand, icon, amt, date, via, saved, missed, tag, tagColor, tagBg, card, last4, bank, unaccounted, sms }
```
- 100 mock transactions cycling through 12 brands × 4 cards (Axis Flipkart, HSBC Travel One, HSBC Live+, UPI)
- Every 12th transaction is "Unaccounted" with SMS text
- `tg()` generates tag text/color/bg based on transaction type (best, switch, newcard, needsdata)

### Calculator Card (`CALC_CARDS`)
```ts
{ name: string, type: "Points" | "Auto Cashback" | "Cashback", rates: { default: number, [brand: string]: number } }
```
3 cards: HSBC Travel One, Axis Flipkart, HSBC Live+

### Brand (`CALC_BRANDS`)
```ts
{ [category: string]: Array<{ name: string, icon: string, rate: number }> }
```
Categories: Online Shopping, Food Delivery, Groceries, Travel, Cab & Transport, Bills & Recharges, Fuel, Entertainment, Health & Wellness, Education, Insurance, Fashion & Lifestyle

### User Card (`CARDS`)
```ts
{ name: string, last4: string, color: string, accent: string, headerAccent: string, quality: string, availPts: number | null, ptName: string }
```
- `headerAccent` — radial gradient center color for card detail header
- `ptName` — `"Reward Points"` or `"Cashback"` — determines display format (₹ vs RP suffix)

### User Flags
`"NORMAL" | "PARTIAL" | "DEBIT" | "NTC" | "ENTRY_ELIGIBLE"` — persisted in localStorage

## Simulation Data Layer
The simulation layer (`src/data/simulation/`) computes all rewards, savings, and card analytics from first principles:

**Pipeline**: `inputs.ts` → `mockApi.ts` → `compute.ts` → `legacy.ts` → Screen components

- **inputs.ts**: Spend profile (21 buckets), 3 card definitions with reward rates and caps
- **mockApi.ts**: Builds `/calculate` response per card — per-bucket rewards with cap enforcement
- **compute.ts**: Aggregates into savings bars, transactions (100 deterministic), actions, card details
- **legacy.ts**: Re-exports under old names (CARDS, CD, ALL_TXNS, SAVINGS_BARS, etc.) for screen compatibility

Key computed exports:
| Export | Source | Description |
|--------|--------|-------------|
| `SAVINGS_BARS` | `getSavingsBars()` | bar1 (current), bar2 (optimized), bar3 (ultimate), deltas |
| `ALL_TXNS` | `generateTransactions()` | 100 transactions with computed saved/missed |
| `CD` | `computeCardDetail()` per card | Categories, brands, limits, caps, fees |
| `CALC_CARDS` | Legacy rates mapping | Per-brand rates for calculator screen |
| `CARD_PROMO` | Market card #1 | Name, image, savings, spending_breakdown, milestones |
| `SPEND_DIST` | `computeSpendDistribution()` | Per-card spend/savings for optimize screen |

## Transaction Scenario System

Every transaction is classified into one of 7 scenarios (S1, S2, S3, S4, S5a, S5b, S5c) or fallback S6. The scenario drives both the tag pill in the transaction list and the layout of the bottom sheet (which of `CardYouUsedBlock` / `BetterCardInWalletBlock` / `WorthAddingBlock` are shown).

**Single source of truth**: `src/data/simulation/txnScenario.ts` → `getTransactionScenario(txn)`.

**Full spec, routing rules, visibility matrix, and invariants** (e.g. "S3 hides Worth Adding", "never recommend an owned card"): see [`docs/transaction-scenarios.md`](./docs/transaction-scenarios.md). Update that file whenever scenario routing, tag text, or sheet visibility rules change.

## 3-State System

The app enforces 3 distinct user states that control what each screen renders. State is derived in `Index.tsx` (lines 180-183) and passed via AppContext.

### State Definitions
| State | Condition | Card Display | localStorage |
|-------|-----------|-------------|-------------|
| **State 1 — SMS Only** | `!linkedGmail && !mappingCompleted` | `"HSBC ••7891"` (masked) | `sa:hasGmail=false`, `sa:mappingCompleted=false` |
| **State 2 — Manually Mapped** | `!linkedGmail && mappingCompleted` | `"HSBC Travel One"` (mapped) | `sa:hasGmail=false`, `sa:mappingCompleted=true` |
| **State 3 — Gmail Connected** | `linkedGmail` | `"HSBC Travel One"` (full) | `sa:hasGmail=true`, `sa:userFlag="NORMAL"` |

### Context Helpers (Index.tsx)
| Helper | Purpose |
|--------|---------|
| `isState1`, `isState2`, `isState3` | Boolean flags for current state |
| `getCardDisplayName(i)` | Returns masked/mapped/full card name based on state |
| `isCardMapped(i)` | True if Gmail or manually mapped |
| `getCardChips()` | Returns dynamic filter chip labels (State 1: `["Unaccounted"]` only) |
| `getFilteredActions(actions)` | Filters actions by state (State 1: points+milestone+credit-limit only; State 2: adds all caps; State 3: all) |
| `shouldShowNudge(screenKey)` | Returns false if Gmail connected or nudge dismissed 3+ times |

### Per-Screen State Behavior

#### Home Screen (`LegacyHomeScreen.tsx` + `LegacyShared.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Card strip names | Masked (••7891) + PARTIAL badge | Mapped names | Full names |
| Hero gauge + savings | Hidden — "Identify your cards" text | Shown | Shown |
| "See how to improve" CTA | Hidden | Shown | Shown |
| Gmail nudge banner | "Analyse your spends better" | "Stay on top of your rewards" | Hidden |
| Transaction rows — saved/missed/tags | Hidden (`hideRewards`) | Shown | Shown |
| Transaction card names | Masked | Mapped | Full |
| Transaction bottom nudge | "See what you saved and missed" | Hidden | Hidden |
| CardPromo (HDFC Infinia) | Hidden (replaced by nudge) | Shown | Shown |
| Filter chips | `["Unaccounted"]` only | Dynamic card names | Dynamic card names |

#### Card Detail (`CardDetailScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| PARTIAL chip | Shown | Hidden | Hidden |
| Card identification nudge | Shown | Hidden | Hidden |
| Gmail nudge above tabs | Hidden | Shown | Hidden |
| Tab bar + content | Hidden entirely | All 4 tabs | All 4 tabs |
| Benefits — progress/tracking | N/A | Hidden (`showBenefitProgress=false`) | Shown |
| Benefits — descriptions | N/A | Shown (informational) | Shown |
| Transactions | Bare (brand, amount, date) | Full | Full |

#### Optimize Screen (`LegacyOptimiseScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Screen access | Locked overlay (lock icon + CTAs) | Full access | Full access |
| Upgrade/Optimize sections | N/A | Shown | Shown |
| Claim & Redeem | N/A | GmailNudgeBanner ("Unlock your rewards") | Full benefit cards |

#### Transactions Screen (`LegacyTransactionsScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Saved/missed columns | Hidden | Shown | Shown |
| Recommendation tags | Hidden | Shown | Shown |
| Card name in rows | Masked | Mapped | Full |
| Filter chips | `["Unaccounted"]` only | Dynamic | Dynamic |
| Bottom nudge | "See what you saved and missed" | Hidden | Hidden |

#### Actions Screen (`ActionsScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Actions shown | Points + milestone + credit limit only | + all cap warnings | All types |
| Gmail nudge at top | Shown | Shown | Hidden |

#### Redeem Screen (`RedeemScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Flow | Locked (nudge) | Locked (nudge) | Full redemption flow |

#### Best Cards Screen (`BestCardsScreen.tsx`)
| Element | State 1 | State 2 | State 3 |
|---------|---------|---------|---------|
| Gmail nudge | "These are estimated recommendations" | Hidden | Hidden |
| Recommendations | Generic | Personalized | Fully personalized |

#### Calculator (`CalcScreen.tsx`) — No state changes. Works identically across all states.
#### Profile (`ProfileScreen.tsx`) — Gmail Sync status reflects `hasGmail`. No other state changes.

### Gmail Nudge Copy
| Touchpoint | Line (bold) | Subline |
|-----------|-------------|---------|
| Home — State 1 | Analyse your spends better | Connect Gmail to identify your cards |
| Home — State 2 | Stay on top of your rewards | Connect Gmail to track points, milestones and fee waivers |
| Actions — State 1/2 | Unlock all your action items | Connect Gmail for milestone tracking, fee waivers and vouchers |
| Transactions — State 1 | See what you saved and missed | Identify your cards to evaluate your transactions |
| Card Detail — State 1 | We don't know this card yet | Identify it to unlock benefits, milestones and fee details |
| Card Detail — State 2 | Unlock personalised actions | Connect Gmail to track points, fee waivers and vouchers |
| Redeem — State 1/2 | Your points balance is unknown | Connect Gmail to find your best redemption options |
| Optimize — State 2 | Unlock your rewards | Connect Gmail to track your points and claimed benefits |
| Best Cards — State 1 | These are estimated recommendations | Connect Gmail for advice based on your exact cards |

### Testing States
Use the OnboardScreen state picker (skip button during onboarding → 3 state options) to switch between states. Or set localStorage keys directly:
```js
// State 1
localStorage.setItem("sa:hasGmail", "false");
localStorage.setItem("sa:mappingCompleted", "false");
// State 2
localStorage.setItem("sa:hasGmail", "false");
localStorage.setItem("sa:mappingCompleted", "true");
// State 3
localStorage.setItem("sa:hasGmail", "true");
localStorage.setItem("sa:userFlag", '"NORMAL"');
```

## Number Formatting
Always use `f()` from `@/lib/format` for Indian locale formatting (1,00,000 not 100,000).

## Assets

### Card Images
Located in `public/legacy-assets/cards/` — mapped via `CARD_IMG_MAP` in BottomSheets.tsx:
- `axis-flipkart.png`, `hsbc-travel-one.png`, `hsbc-live.png`
- `hdfc-infinia.png`, `idfc select.png`, `Hdfc swiggy.png`, `icici-emeralde.png`
- `AU-Zenith.png`, `amex-platinum-travel.png`, `sbi-miles.png`, `idfc-select.png`

### Brand Logos
Located in `public/brands/`:
- `flipkart.png`, `amazon.png`, `swiggy.png`, `zomato.png`, `bb.png` (BigBasket)
- `myntra.png`, `adiddas.png` (sic), `muscle-blaze.png`

### 3D Category Icons (legacy PNGs)
Located in `public/categories/`:
| Category | Asset |
|----------|-------|
| Shopping | `shopping.png` |
| Groceries | `groceries.png` |
| Food Ordering | `food.png` |
| Dining | `dining.png` |
| Travel | `travel.png` |
| Bills | `bills.png` |
| Fuel | `fuel.png` |
| Entertainment | `entertainment.png` |
| Cab Rides | `cab.png` |
| Flights | `flights.png` |
| Hotels | `hotels.png` |
| Milestones | `milestones.png` |

### CDN Category WebP Icons (preferred)
Located in `public/cdn/categories/` — 12 high-res webp icons used by SpendAnalysis and onboarding cinematic:
`Bills.webp`, `Dining Out.webp`, `Entertainment.webp`, `Flights.webp`, `Food Ordering.webp`, `Friends and Family.webp`, `Fuel.webp`, `Groceries.webp`, `Hotels.webp`, `Insurance.webp`, `Rent.webp`, `Shopping.webp`

Access via `CAT_IMG(name)` helper from LegacyShared. Simulation category names map: "Dining" → "Dining Out.webp", "Travel" → "Flights.webp".

### Tool Images
Located in `public/tools/`:
- `savings-finder.webp`, `best-cards.webp`, `redeem.webp` (old webp icons)

Located in `public/cdn/`:
- `tool-savings.webp`, `tool-best-cards.webp`, `tool-redeem.webp` (new 3D icons)

### Coin/Decoration Images
Located in `public/ui/`:
- `image 4600.png` — large gold coin (39×63)
- `image 4601.png` — medium gold coin (28×28)
- `image 4602.png` — small gold coin (21×21)

### Onboard Images
Located in `public/onboard/`:
- `1.webp` through `4.webp` — onboarding carousel screens

### UI Assets
Located in `public/ui/`:
- `statusbar.png` — mobile status bar overlay
- `market-badge.png` — "worth adding" market card badge icon
- `lock.png`, `back.png`, `right.png`, `track.png`, `vector.png`, `sf-symbol.png`

### Other Assets
- `/legacy-assets/save star.png` — star badge for "best card" indicator
- `/legacy-assets/opt/cat-*.png` — optimization screen category icons
- `/legacy-assets/opt/axis-logo-*.png` — Axis bank logos

## Bottom Sheets (BottomSheets.tsx)
All overlays mounted by `<BottomSheets/>`:
| Component | Purpose |
|-----------|---------|
| `Toast` | Top-center toast notification |
| `InfoBS` | Generic info sheet (title + desc) |
| `TxnSheet` | Transaction detail (4 flows: best/switch/noReward/UPI) |
| `ActSheet` | Action detail (why it matters + CTA) |
| `GmailNudgeBanner` | Inline Gmail connect banner |
| `GmailNudgePopup` | Full-screen Gmail connect prompt |
| `GmailNudgeSheet` | Bottom sheet Gmail connect prompt |
| `LockedSection` | Locked/gated content overlay |
| `RetroOverlay` | Gmail re-linking progress overlay |
| `VoiceFlowOverlay` | Voice card identification flow |
| `SkipConfirmSheet` | Skip confirmation dialog |
| `CapBS` | Cap/reward details sheet |
| `CatBS` | Unaccounted transaction categorization (3 steps) |
| `FilterSheet` | Sort/filter transactions (4 tabs: Sort, Card Used, Categories, Brands) |

## Card Detail Header
- Background: `radial-gradient(ellipse at 50% 20%, ${card.headerAccent}, #1B1B1B)`
- Bank name: `SEMI_CARDS[ci].bank`, uppercase, `rgba(255,255,255,0.6)`, 11px/600, letterSpacing 2
- Card name: uppercase, white, 16px/700
- Active card: `199x133px`, borderRadius `6.93`, border `0.83px solid rgba(255,255,255,0.2)`, shadow `0px 5px 15px rgba(0,0,0,0.35)`

### Card Detail Tabs
- Labels: "Card Analysis", "Transactions", "Benefits", "Fees"
- Active: `2.5px solid #1a1f36` underline, color `#36405E`
- Tab bar border: `1px dashed rgba(0,0,0,0.1)`

## Best Cards Detail Page
The detail page (`BestCardsScreen.tsx` detail view) has 4 tab-gated sections:
- **How to use**: Spends Distribution (segmented bar + per-card rows), Cards Usage (category picker + table), How to Spend Timeline
- **Benefits**: Welcome Benefits, Milestone Benefits (timeline with claimable/locked), Lounge and Additional
- **Fee**: Fees & Waivers, Additional Bank Fee table, Late Payment Fee table
- **Eligibility and T&C**: Eligibility criteria grid, eligibility check form, Terms

Header uses `linear-gradient(180deg, #010904 -15.07%, #072A4D 112.18%)` with card image from `recommendData.ts`.

### Best Cards List Page Header
Dark green gradient `linear-gradient(360deg, #055B37 0%, #0B2D1C 80.8%)` with glass card showing Annual Spends, Current Savings, You Could Save. Gold coin decorations from `/ui/image 460x.png`.

## HeroSection Notes
The HeroSection has a conditional "Great Job" variant when `bar1 >= 85% of bar2`. Shows positive messaging instead of "missing out".

## CardGenius API Integration

### Architecture
- **User's cards**: Call `/calculate` once per owned card with the spend profile. Returns per-bucket reward breakdown.
- **Market recommendations**: Call `/recommend_cards` once with spend profile. Returns top N market cards with same breakdown structure.
- **MCP access**: CardGenius is available via `mcp__claude_ai_Great_cards__*` tools. Use `recommend_cards` for personalized recs, `get_card_details` for single card info, `list_cards` for browsing.
- **Data priority**: MCP live call >= `data/api response pretty.json` > invented numbers. Never invent reward rates.

### API Response Shape (`/recommend_cards` and `/calculate`)
Both endpoints return the same `spending_breakdown` structure per card:
```
spending_breakdown[bucket] = {
  on, spend (monthly), savings (monthly ₹), savings_type ("points"|"cashback"),
  points_earned, maxCap (number|"Unlimited"), totalMaxCap, maxCapReached (bool),
  explanation[{key,explanation}], conv_rate, spend_conversion
}
```
Top-level fields per card: `total_savings` (monthly), `total_savings_yearly`, `roi`, `total_extra_benefits`, `travel_benefits`, `milestone_benefits[]`, `welcomeBenefits[]`, `redemption_options[]`, `product_usps[]`, `annual_fees`, `annual_fee_spends` (waiver threshold), `image`, `card_bg_image`, `card_bg_gradient`, `cg_network_url`, `ck_store_url`, `invite_only`, `rating`.

### Spend Buckets (21 input + ~10 response-only)
**Monthly buckets**: amazon_spends, flipkart_spends, other_online_spends, other_offline_spends, grocery_spends_online, offline_grocery, online_food_ordering, fuel, dining_or_going_out, mobile_phone_bills, electricity_bills, water_bills, rent
**Annual buckets** (API divides by 12 in response `spend` field): flights_annual, hotels_annual, insurance_health_annual, insurance_car_or_bike_annual, life_insurance, school_fees
**Quarterly counts** (not ₹): domestic_lounge_usage_quarterly, international_lounge_usage_quarterly
**Response-only** (always present, spend=0 for most users): ott_channels, large_electronics_purchase_like_mobile_tv_etc, all_pharmacy, railway_lounge_usage_quarterly, new_monthly_cat_1/2/3, new_cat_1/2/3

flights_annual and hotels_annual are ALWAYS separate buckets — never combine them.

### Lounge Handling
Lounge fields are quarterly visit counts, NOT spend amounts. The API values them internally:
- `travel_benefits.total_travel_benefit_annual` = annual lounge ₹ value (top-level)
- `spending_breakdown[lounge_bucket].savings` = pre-computed monthly value
- Do NOT hand-compute lounge savings by dividing quarterly values. Use the API's returned values.

### Cap Structures
- **Per-bucket cap**: `maxCap` is monthly. If savings exceed it, clamp and set `maxCapReached: true`.
- **Card-level cap**: `totalMaxCap` or `card_max_cap`. Some cards cap total annual RP (e.g., HDFC Diners 75K RP).
- **Shared caps**: Some cards share a single cap across multiple buckets (e.g., HSBC Live+ ₹1K/mo shared across dining + food delivery + grocery). The API handles this internally; for simulation, distribute proportionally.
- **Per-merchant-per-quarter caps**: Some cards cap per merchant per quarter (e.g., Axis Flipkart ₹4K/quarter on Flipkart). Approximate as monthly ÷ 3 for simulation.

### Savings Computation (3 tiers)
- **Current Savings**: For each bucket, take savings from the card the user actually used (from SMS parsing). Sum × 12.
- **Optimized Savings**: For each bucket, take max savings across user's owned cards. Sum × 12.
- **Ultimate Savings**: For each bucket, take max savings across owned cards + #1 recommended. Sum × 12.
- **Deltas**: flow1 = Optimized - Current (reallocation gain). flow2 = Ultimate - Current (total potential). uplift = Ultimate - Optimized (new card gain).

### Per-Transaction Savings
Pro-rate bucket savings to individual transactions: `saved = (txn_amt / bucket_monthly_spend) × bucket_savings`.
Never use hardcoded percentage fallbacks (0.03, 0.05, 0.10, 0.02). Always compute from actual bucket rates.

### Market Card Recommendations
The #1 card from `/recommend_cards` replaces ALL hardcoded market card references (HDFC Infinia, Amex Platinum, etc.) across:
- Optimize screen ultimate card, CardPromo banner, SAVINGS_COMP, CD[].bestCard, TxnSheet market card, tg() tier-3 tag, BestCardsScreen BEST_CARDS array.
- For TxnSheet: show best card for THAT bucket, not always overall #1. Compare `spending_breakdown[bucket].savings` across all recommended cards.

### Card Aliases (for MCP calls)
- HSBC Travel One: `hsbc-travel-one`
- Axis Flipkart: `axis-flipkart-credit-card`
- HSBC Live+: `hsbc-live-plus-credit-card`

### Data Files
- `data/api request.json` — spend profile sent to CardGenius (21 buckets)
- `data/api response pretty.json` — real /recommend_cards response (HDFC Diners Black + Axis Magnus Burgundy)
- `data/DATA_AUDIT.md` — 181-element audit mapping every UI data point to its source
- `data/SIMULATION_TASK.md` — task spec for building the simulation data layer

## Hardcoded Data Locations

### In `src/data/` files (importable):
| File | Exports | Status |
|------|---------|--------|
| `cards.ts` | CARDS, SEMI_CARDS | Mock — replace with simulation |
| `transactions.ts` | ALL_TXNS, br, ic, tg, bestCardFor | Mock — replace with simulation |
| `spend.ts` | SPEND_CATS, SPEND_BRANDS, TOTAL_ACC | Mock — replace with simulation |
| `cardDetail.ts` | CD, CD_BRANDS, CD_CATS, BANK_FEES, LATE_FEES | Mock — replace (keep BANK_FEES/LATE_FEES static) |
| `calculator.ts` | CALC_CARDS, CALC_BRANDS, CALC_CATS, CAT_OPTIONS, BRAND_MAP | Outdated rates — rebuild from CardGenius |
| `actions.ts` | ACTIONS, ALL_ACTIONS, SMS_ACTIONS | Mock — replace with computed actions |
| `optimize.ts` | OPT_BRANDS, SAVINGS_COMP | Mock — replace with simulation |
| `bestCards.ts` | CARD_CATALOGUE | Static bank→card mapping — keep |

### Inline in screen files (NOT importable):
| Data | File | Lines |
|------|------|-------|
| BEST_CARDS (20 cards) | BestCardsScreen.tsx | 38-83 |
| CARD_DET (per-card details) | BestCardsScreen.tsx | 91-96 |
| ACTIONS_DATA (7 actions) | ActionsScreen.tsx | 20-28 |
| BEST_FOR_BRAND mapping | CardDetailScreen.tsx | 81 |
| Hero savings values | LegacyShared.tsx | 700, 707, 711 |
| Transaction analysis bars (3: current/optimized/ultimate) | LegacyShared.tsx | TransactionAnalysis component — uses SAVINGS_BARS.bar1/bar2/bar3 |
| Spend analysis data | LegacyShared.tsx | 327-344, 385 |
| Optimize hero + bars | LegacyOptimiseScreen.tsx | 110, 116-118 |
| Spend distribution rows | LegacyOptimiseScreen.tsx | 355-370 |
| Category card panels | LegacyOptimiseScreen.tsx | 509-546 |
| Redemption data | RedeemScreen.tsx | 13-35 |

### Hardcoded percentage fallbacks to eliminate:
| Location | Value | Should be |
|----------|-------|-----------|
| CardDetailScreen.tsx:89 | `t.amt * 0.03` | actual delta from /calculate |
| BottomSheets.tsx TxnSheet | `txnSheet.amt * 0.05` | wallet savings delta |
| BottomSheets.tsx TxnSheet | `txnSheet.amt * 0.1` | market savings delta |
| BottomSheets.tsx CatBS | `amt * 0.02` | actual bucket rate |

## Conventions
- Feature screens use `@ts-nocheck` and inline styles — follow this pattern, don't introduce CSS modules or styled-components
- Every screen wraps in `<div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto" }}>` and includes `<FL/>` for fonts
- Scrollable containers use `data-scroll="1"` attribute — scrollbar is hidden via CSS
- Card images mapped via `CARD_IMG_MAP` object to `/legacy-assets/cards/` paths
- Brand logos mapped via `imgMap` in MerchantLogo and `merchantIcon` in TxnSheet to `/brands/` paths
- Toggle/expand sections use absolute positioning for the button on the card border line
- Dashed dividers use SVG `<line>` elements, not CSS `border-style: dashed`
- Bottom sheet animations follow Emil Kowalski patterns: iOS drawer curve, ease-out content, staggered reveals

# Legacy Asset Migration Map

All legacy assets required by migrated flows are now served from `public/legacy-assets` and referenced via `/legacy-assets/...`.

## Source to destination

- `Spend Analyser App/assets/cards/*` -> `public/legacy-assets/cards/*`

Canonical card art (use `legacyCardAssetUrl` from `LegacyShared.tsx` so paths are encoded):

- `public/legacy-assets/cards/amex-platinum-travel.png`
- `public/legacy-assets/cards/hdfc-infinia.png`
- `Spend Analyser App/assets/opt/*` -> `public/legacy-assets/opt/*`
- `Spend Analyser App/assets/fonts/*` -> `public/legacy-assets/fonts/*`
- `Spend Analyser App/assets/amex-promo-banner.png` -> `public/legacy-assets/amex-promo-banner.png`
- `Spend Analyser App/assets/promo-bg.png` -> `public/legacy-assets/promo-bg.png`
- `Spend Analyser App/assets/total-spends-bg.png` -> `public/legacy-assets/total-spends-bg.png`

Additional Pixel parity assets copied from `Pixel-Perfect UI Implementation/src/assets/*`:

- `fd0182baaee7bd791ece41153b51bc8d9dde0a30.png` -> `public/legacy-assets/opt/fd0182baaee7.png` (savings strip texture)
- `ed56951fcf6496ecc3767bb4db8265442efde3ac.png` -> `public/legacy-assets/opt/ed56951fcf64.png` (offline groceries category icon)
- `ef45cc01d27d0269dd556a2d0415760fdf21dcc4.png` -> `public/legacy-assets/opt/ef45cc01d27d.png` (food ordering category icon)
- `99d3b93166b2d2ad6cca9918e260df1675640ab6.png` -> `public/legacy-assets/opt/99d3b93166b2.png` (ultimate card tile composite)
- `358c11f4a97c6c0f77ea5d5d5c9ac779d2c1c7d9.png` -> `public/legacy-assets/opt/358c11f4a97c.png` (ultimate card tile composite layer)
- `5f927a55ae8725c3b02d9bb202d3bae16008094f.png` -> `public/legacy-assets/opt/5f927a55ae87.png` (existing-card tile accent)

## Flow usage

- Home flow uses:
  - `/legacy-assets/cards/*`
  - `/legacy-assets/amex-promo-banner.png`
  - `/legacy-assets/fonts/*`
- Transactions flow uses:
  - generated mock transaction data + inline SVG
  - `/legacy-assets/fonts/*`
- Optimisation flow uses:
  - `/legacy-assets/opt/*`
  - `/legacy-assets/cards/*`
  - `/legacy-assets/fonts/*`

No migrated flow references files under `Spend Analyser App`.

# Explore page overrides

Inherits `MASTER.md`.

## Goals
- Documentation landing pattern: search-first catalog
- Reduce time-to-dataset with theme chips + source shortcuts

## Structure
1. Page title + lede
2. Popular themes (quick chips, min 44px)
3. Filters card (search + selects)
4. Result count (aria-live) + source shortcuts
5. Dataset grid
6. Empty state with reset CTA

## Interaction
- Filter pending state: lower opacity + aria-busy
- Cards: pressable scale, hover lift, focus ring
- Touch: chips and buttons ≥ 44px on mobile

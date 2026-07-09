# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Indian Data Guide  
**Category:** Knowledge base / research catalog  
**Style:** Modern dark cinematic + academic catalog craft  
**Design Dials:** Variance 4 · Motion 5 · Density 5

---

## Brand (source of truth)

| Role | Hex | Token |
|------|-----|--------|
| Background / Navy | `#0A2947` | `--background`, `--brand-navy` |
| Foreground / Cream | `#F3E4C9` | `--foreground`, `--brand-cream` |
| Muted / Sage | `#D3D4C0` | `--muted-foreground`, `--brand-sage` |
| Primary / Brown | `#8B5E3C` | `--primary`, `--brand-brown` |
| Accent / Gold | `#C4A574` | `--ring`, `--accent-foreground`, `--brand-gold` |
| Panel | `#0D3152` | `--card` |
| Panel elevated | `#11406A` | `--secondary` |
| Deep | `#071F36` | `--sidebar` |
| Border | `rgba(211,212,192,0.18)` | `--border` |
| Destructive | `#F0A0A0` | `--destructive` |
| Success | `#6EE7A8` | `--success` |

**Do not** replace brand with generic slate/blue. CTA uses brown primary + gold ring/focus.

## Typography

| Role | Font | Notes |
|------|------|--------|
| Display / headings | **Crimson Pro** | Scholarly, editorial |
| Body | **Atkinson Hyperlegible** | Max readability / a11y |
| Mono / codes | **IBM Plex Mono** | Variable names, years, DOIs |

### Type scale
- Page title: `clamp(2.5rem, 6vw, 4.25rem)`, weight 700, tracking -0.03em
- Section title: 1.25rem, weight 600
- Body: 1rem / 1.65 line-height
- Labels / kickers: 0.6875rem, uppercase, tracking 0.16–0.2em

## Spacing (8pt rhythm)

| Token | Value |
|-------|--------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

Touch targets: **min 44×44px**. Gap between targets ≥ 8px.

## Motion

- Duration: 160–280ms micro, ≤400ms section
- Easing enter: `cubic-bezier(0.16, 1, 0.3, 1)` (expo out)
- Press: scale 0.98, no layout shift
- Respect `prefers-reduced-motion: reduce`
- No infinite decorative animation (skeletons only)

## Effects

- Glass header: `backdrop-blur-xl` + translucent navy
- Ambient vault: soft radial cream/brown glows (not pure black)
- Cards: 1px border, optional soft shadow on hover lift (-2px)
- Focus: 2–3px gold ring, visible always for keyboard

## Patterns

1. **Documentation catalog:** search first, then filters, then results
2. **Dataset record:** meta → best-for/limitations → guides → variables → access CTAs
3. **One primary CTA** per view (Open access / Open year)
4. Lucide icons only — no emoji icons

## Anti-patterns

- Cyan/slate leftover tokens mixed with brand
- Hover-only critical actions
- Focus outline removed
- Touch targets &lt; 44px
- Low-contrast muted text (&lt; 3:1 secondary)
- Pure `#000` backgrounds (OLED smear)

## Accessibility checklist

- [x] Skip link
- [ ] Focus rings on all interactive controls
- [ ] Body contrast ≥ 4.5:1
- [ ] Heading hierarchy h1→h2→h3
- [ ] Labels on form fields
- [ ] Reduced motion honored
- [ ] cursor-pointer on clickable elements

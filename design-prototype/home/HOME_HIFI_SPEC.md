# Empira Home: High-fidelity specification

> **Status: LOCKED.** This is the visual source of truth for the Empira MVP. Reusable rules: `/HOME_DESIGN_RULES.md`.

Prototype: `design-prototype/home/index.html` (open it in a browser). Add `?davom=1` to see the returning-teacher state, or `?holat=tanlangan` to see the selected state on 8-sinf (documentation only).
Reference renders: `design-prototype/home/screenshots/`.
Tokens: `EMPIRA_DESIGN_SYSTEM.md` §16. Structure: the approved `EMPIRA_HOME_UX.md`.

This is a design prototype, separate from production code. Links go to `#` placeholders.

---

## 1. Assets used

| Asset | Source | Where |
|---|---|---|
| Full logo (Flask E + "Empira" wordmark) | `brand/logo-flask-e/full-logo-light.svg` | Top bar. Inlined with identical paths so the Sora wordmark renders with the loaded webfont (an `<img>` SVG cannot load web fonts and would fall back to a generic sans). |
| Favicon | `favicon.svg` | Browser tab |
| Touch icon | `png/app-icon-180.png` | iOS home-screen icon |

There's no other imagery: no illustrations, hero images, 3D renders or stock photos.

---

## 2. Page anatomy (desktop ≥ 1024 px)

```
TOP BAR  64 px, white, 1px bottom line
  └ Logo 28 px high (left aligned to the 960 px content column)

CONTENT  max 960 px, centered, 32 px side margin, 48 px top padding
  B  Headline           36/1.15 Sora 700, −0.02em, Lab Ink
     Availability       8 px amber dot + 14/1.4 Sora 500, ink-500      (8 px below)
  E  Continue row       only if returning, 24 px below, full width     (?davom=1)
  ── 48 px ──
  C + D  two columns:   [ Mavzuni tanlash  1fr ] [ yoki 80 px ] [ Kitobni skanerlash 304 px ]
     Section title      20/1.25 Sora 700, −0.015em
     Hint               14/1.45 Sora 500, ink-500                       (4 px below)
     Body               16 px below the hint. Titles, hints and bodies of both columns
                        share grid rows (CSS subgrid), so tiles and scan card always start
                        at the same y.
```

**Total height at 1280×720:** both actions end at ~540 px, so everything is visible without scrolling on a typical projector or laptop, even with browser chrome.

### Class tiles (C)
| Property | Value |
|---|---|
| Grid | 3 columns × 2 rows, gap 16 px |
| Tile | white, 1px `line`, radius 20, height 104 px, whole tile is the link |
| Content | `6` (Sora 700, 40 px, −0.02em, Lab Ink, tabular) + `-sinf` (Sora 600, 20 px, ink-700), centered on one line |
| Hover | `blue-50` fill, 1 px Empira Blue border, number and "-sinf" → Empira Blue (150 ms colour transition) |
| Pressed | `blue-50` fill, `blue-600` border |
| Selected (`aria-current="true"`) | `blue-50` fill, 2 px Empira Blue border (1 px border + 1 px inset ring, no layout shift), blue text |
| Focus | 2 px Empira Blue outline, 2 px offset |
| Accessible name | "6-sinf" (the visible text) |

### "yoki" divider
Desktop: the word "yoki" only (14 px, 500, ink-500), centered in an 80 px gutter and vertically centered on the tile row. There are no rules: the earlier vertical line started at the section titles and was broken unevenly by the word. Mobile and tablet: a horizontal hairline with "yoki" in the middle.

### Scan tile (D)
| Property | Value |
|---|---|
| Size | 304 px wide, stretches to the same height as the tile grid (224 px) |
| Tile | white, 1px `line`, radius 20, padding 24, the whole tile is the link |
| Content (centered, 12 px gaps) | Icon chip 56×56, radius 20, **solid Empira Blue** fill, Lucide `scan-line` 28 px, white, stroke 2 (the page's single solid-blue element) → label "Skanerlash" Sora 600 22 px → note "Kamera yoki rasm yuklash orqali" 14 px ink-500 |
| Hover / pressed / focus | Same as class tiles; on hover the icon chip darkens to `blue-600` |

### Continue row (E), returning teachers only
White, 1px `line`, radius 12, min-height 64, padding 12/16. Label "Davom ettirish" 14/500 ink-500 above "8-sinf · Fizika › Om qonuni" 17/600 Lab Ink. Lucide `chevron-right` 20 px ink-500 on the right. Hover: blue border.

---

## 3. Tablet (640–1023 px)

- Side margin 24 px, headline 32 px.
- Single column: C → horizontal "yoki" divider → D (the approved wireframe order).
- Class tiles 3 × 2, height 96 px, number 36 px.
- Scan tile full width, 96 px high, icon chip + "Skanerlash" in one row, no note.

## 4. Mobile (< 640 px)

- Top bar 56 px. The full logo stays on Home (the symbol-only version is for inner pages).
- Side margin 16 px, top padding 24 px. Headline 28 px, wraps to 2 lines.
- Class tiles **2 × 3**, height 64 px, gap 12 px, number 28 px + "-sinf" 18 px.
- Horizontal "yoki" divider, 24 px above and below.
- Horizontal "yoki" divider: 24 px above and below on mobile, 32 px on tablet.
- Scan tile: full width, 64 px high, solid-blue icon chip 40 px + "Skanerlash" 18 px, in the same visual language as the class tiles.
- **Short phones (height ≤ 700 px, e.g. 375×667):** vertical rhythm tightens only: top padding 16, tiles 60 px, gaps 10–12 px. Everything fits on the first screen.
- Safe areas: top bar respects `safe-area-inset-top`, page bottom respects `safe-area-inset-bottom`.

**Fold check (rendered):**
| Device | Result |
|---|---|
| 390×844 (iPhone 12–15) | Everything visible, including the "Continue" row |
| 375×667 (iPhone SE) | Everything visible, including the full scan tile (with the short-phone rhythm) |

---

## 5. Copy (Uzbek, final for prototype)

| Element | Text | English |
|---|---|---|
| Page title | Empira — 3D laboratoriya | Empira — 3D laboratory |
| Headline | Darslikdagi har bir mavzu — 3D laboratoriya | Every textbook topic — a 3D laboratory |
| Availability | Hozircha: Fizika, 6–11-sinflar | Available now: Physics, grades 6–11 |
| Continue label | Davom ettirish | Continue |
| Section C | **Mavzuni tanlash** | Choose a topic |
| Hint C | Sinfingizni tanlang — yillik reja ochiladi. | Choose your class — the annual plan opens. |
| Tiles | 6-sinf … 11-sinf | Grade 6 … 11 |
| Divider | yoki | or |
| Section D | **Kitobni skanerlash** | Scan the book |
| Hint D | Darslik sahifasini suratga oling — Empira mavzuni topib, laboratoriyani ochadi. | Photograph a textbook page — Empira finds the topic and opens the lab. |
| Scan tile | Skanerlash | Scan |
| Scan note (desktop) | Kamera yoki rasm yuklash orqali | With the camera or by uploading a photo |

Grade numbers use the standard Uzbek ordinal hyphen ("8-sinf").

---

## 6. Color usage on this screen

| Color | Where | Share of screen |
|---|---|---|
| Paper `#F6F7FB` | Page background | most |
| White | Top bar, tiles, scan tile, continue row | large |
| Lab Ink `#0B1026` | Headline, section titles, numbers | text |
| ink-700 / ink-500 | "-sinf", hints, notes | text |
| Line `#D9DCE8` | Tile borders, divider, top-bar border | hairlines |
| Empira Blue `#3B4CFF` | Logo, scan icon chip (solid), all hover/selected/focus states | small at rest |
| blue-50 `#EEF0FF` | Hover / pressed / selected fill | appears on interaction |
| Spark Amber `#FFB21E` | Logo flask liquid + one 8 px "available" dot | tiny |
| Signal Coral | not used (nothing is wrong on Home) | 0 |

The only solid blue at rest is the 56 px scan icon chip (40 px on mobile).

---

## 7. Design decisions

1. **The two actions are named exactly as you asked:** "Mavzuni tanlash" and "Kitobni skanerlash" are the two section titles. A teacher reads two verbs and picks one.
2. **Side by side on desktop, stacked on mobile.** The approved wireframe stacked them. On a 1280×720 projector the stacked version pushed Scan below the fold. Side by side makes both choices visible at once and makes "this *or* that" literal, with "yoki" between them. The order and content match the wireframe; only the arrangement changed on wide screens. Mobile and tablet keep the approved stacked order.
3. **One tile language for everything you can tap.** Class tiles and the scan tile share the same shell: white, hairline border, radius 20, blue on hover. A teacher learns "a white box = something I can press" once. The first draft used a button inside a card for Scan; it looked weaker than the tiles and created a card-in-card, so it was replaced.
4. **One small solid-blue signal.** A full blue Scan button would out-shout the class tiles, so only the scan icon chip is solid Empira Blue. That makes Scan unmistakably an action without adding elements. The main path gets its weight from size (six large tiles), not color.
5. **Big numbers, small unit.** Teachers scan for their number, so "8" is 40 px and "-sinf" is half that. No icons, subject names or counts on tiles.
6. **Amber only twice:** the logo's flask liquid and one 8 px dot meaning "available now". This follows the brand rule that amber is a small "it works" signal.
7. **Hints describe the outcome, not the UI.** "Yillik reja ochiladi" (the annual plan opens) and "mavzuni topib, laboratoriyani ochadi" (finds the topic, opens the lab) tell the teacher what happens next, so neither tap is a leap of faith.
8. **The scan note mentions photo upload** on desktop, because most laptops have no rear camera. Without it a laptop user might assume Scan won't work for them.
9. **No scan button in the top bar on Home**, to avoid two scan entry points on one screen (as approved).
10. **Projector-safe:** all text ≥ 14 px, sentences ≥ 14 px with ≥ 5.5:1 contrast, the main labels 20–40 px, no meaning in light grey.

---

## 8. Not included (as approved)

No subject picker, search, lab catalogue, AI, login/avatar, points, notifications, statistics, marketing, decorative imagery or footer.

---

## 9. Open points

1. **Headline wording.** It's still the suggested line. Swap it if you have an official Uzbek tagline.
2. **"Mavzuni tanlash" vs the first tap being a class.** The section is called "choose a topic" but the first tap is a class. The hint ("Sinfingizni tanlang — yillik reja ochiladi") bridges this, and it matches how teachers think ("I'm picking today's topic"). Confirm you're happy with it.
3. **Fonts load from Google Fonts.** Offline, the prototype falls back to system fonts. For school demos with weak internet, production should self-host Sora.

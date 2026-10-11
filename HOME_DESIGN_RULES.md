# Empira: Home Design Rules (locked source of truth)

The Home page (`design-prototype/home/`) is **locked**. Every future MVP screen reuses the rules below. If a screen needs something not covered here, extend these rules; don't invent a new style.
Where these rules and `EMPIRA_DESIGN_SYSTEM.md` differ, **this file wins**.

## 1. Page frame
- Background **Paper `#F6F7FB`**, light mode only.
- **Top bar:** white, 1 px `#D9DCE8` bottom border, no shadow. 64 px high on desktop, 56 px on mobile. Official Flask E full logo, 28 px high, inlined SVG.
- **Content column:** max **960 px**, centered. Side margins **16 / 24 / 32 px** (mobile / tablet / desktop).
- Top padding: **24 px** on mobile (16 px on phones ≤ 700 px tall), **48 px** on tablet and desktop.
- Breakpoints: mobile < 640, tablet 640–1023, desktop ≥ 1024.

## 2. Typography (Sora only)
| Role | Desktop / tablet / mobile | Weight | Color |
|---|---|---|---|
| Page title | 36 / 32 / 28 px, lh 1.15, −0.02em | 700 | Lab Ink `#0B1026` |
| Section title | 20 px, lh 1.25, −0.015em | 700 | Lab Ink |
| Hint / meta | 14 px, lh 1.45 | 500 | `#5A6285` |
| Tile label | 18–22 px, −0.01em | 600 | Lab Ink |
| Big number | 40 / 36 / 28 px, −0.02em, tabular | 700 | Lab Ink |

- Every section is a **section title + one-line hint that says what happens next**, then the content 16 px below.
- Sentence case, Uzbek Latin with `‘ ’`, and "8-sinf" style ordinals.

## 3. Spacing rhythm
- 4 px base. Title → hint: **4**. Hint → content: **16** (12 on short phones). Between tiles: **12** on mobile, **16** on tablet and desktop.
- Between page blocks: **32** on mobile, **48** on desktop. Around a horizontal "yoki" divider: **24** on mobile, **32** on tablet.
- Prefer whitespace over lines, and lines over cards.

## 4. The tile (the one tappable surface)
Anything a teacher taps to *choose* something is a **tile**:
- **Rest:** white, 1 px `#D9DCE8`, **radius 20**, no shadow, content centered. Keep it minimal.
- **Hover:** fill `blue-50 #EEF0FF`, border Empira Blue `#3B4CFF`, label/number turns blue.
- **Pressed:** fill `blue-50`, border `blue-600 #2F3DE0`.
- **Selected / current:** fill `blue-50`, 2 px Empira Blue border (1 px border + 1 px inset ring, so there's no layout shift), blue text. Mark it up with `aria-current="true"`.
- **Focus:** 2 px Empira Blue outline, 2 px offset. Never removed.
- The whole tile is the link. Heights: **64 / 96 / 104 px** (mobile / tablet / desktop; 60 on short phones).
- List-style rows (e.g. "Davom ettirish") use the same states, with **radius 12**.

## 5. Color budget per screen
- **Empira Blue:** interaction states, the logo, and at most **one small solid-blue element at rest** (on Home, the scan icon chip). No full-width blue slabs or blue backgrounds.
- **Spark Amber:** only the logo and **one 8 px dot** of status. Never text, never fills.
- **Signal Coral:** errors only.
- Text: Lab Ink for titles, `#3A4166` for secondary labels, `#5A6285` for hints. No green, no gradients, no glass.

## 6. Icons
- Lucide outline, rounded joins. 20 px inline, 24–28 px inside an icon chip.
- **Icon chip** (for a key action only): square with radius 12 (40 px) or 20 (56 px), solid Empira Blue with a white icon. **Max one per screen.**
- No icons on tiles that already have a clear text label, on headings, or as decoration.

## 7. Alternatives and layout
- Two alternative paths are separated by the word **"yoki"** (14 px, `#5A6285`):
  - on **desktop**: side by side, with the word alone centered in an 80 px gutter on the content row, no lines
  - on **mobile and tablet**: stacked, with a horizontal hairline divider
- Side-by-side columns share grid rows (subgrid), so titles, hints and tiles align across columns.
- Main path: wide column (`1fr`). Secondary path: **304 px** column.

## 8. Fit and motion
- Each screen's primary choices fit on the first screen at **1280×720, 390×844 and 375×667**.
- Motion: **150 ms** color/border transitions only, and none under `prefers-reduced-motion`. No entrance animations.

## 9. Never on any screen
Extra navigation or menus, sidebars, analytics or stat tiles, AI chat outside the lab, login/avatar/points, notifications, marketing blocks, decorative 3D or illustrations, cards inside cards, more than one solid-blue element at rest, or footers.

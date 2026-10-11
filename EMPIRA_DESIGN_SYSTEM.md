# Empira: Design System (Week 1 MVP)

Sources: `EMPIRA_PRODUCT_CONTEXT.md`, `EMPIRA_INFORMATION_ARCHITECTURE.md`, the logo pack (now copied to `brand/logo-flask-e/`) and the 6 screenshots.
This document **does not redesign the identity**. It turns the existing brand into rules for the product UI.

**Direction:** calm, light and spacious, like a well-made school textbook rather than a SaaS dashboard. One blue for action, a little amber for "the experiment worked", and lots of white space. Every screen should read clearly on a classroom projector.

---

## 1. Brand verification

I checked every hex value in the logo SVGs, `palette.txt`, the logo-exploration HTML, and pixel samples from the screenshots.

| Color | Your value | `palette.txt` | Logo SVGs | Screenshots | Result |
|---|---|---|---|---|---|
| Empira Blue | `#3B4CFF` | ✅ primary | ✅ symbol, wordmark icon, app icon bg | ✅ buttons/sliders (≈`#404BFF` after JPEG compression) | **Match** |
| Spark Amber | `#FFB21E` | ✅ accent | ✅ flask "liquid" in every color version | ✅ status dots, highlight | **Match** |
| Lab Ink | `#0B1026` | ✅ text, dark bg | ✅ wordmark, dark logo bg | ✅ dark website section (exact) | **Match** |
| Paper | `#F6F7FB` | ✅ light bg | ✅ light app icon bg | ✅ page backgrounds (exact) | **Match** |
| Blue 300 | `#8B96FF` | ✅ symbol on dark | ✅ `symbol-dark`, `full-logo-dark` | n/a | **Match** |
| Signal Coral | `#FF6A4D` | ✅ alerts only | not used in logo | not seen | **Match** |

**All six colors are confirmed.** The brand files also contain neutrals that aren't in `palette.txt`. I'm adopting them as the official greys:

| Found in logo-exploration file | Hex | Used there for |
|---|---|---|
| Ink 80 | `#3A4166` | body paragraphs |
| Ink 60 | `#5A6285` | secondary text, captions |
| Line | `#D9DCE8` | 1px borders (inset) |
| Mist | `#EEF0F5` | page / tab background |

**Typography found:** Sora (weights 400–800) is used for **all** text in the brand files: headings, body and labels. IBM Plex Mono is used only for small technical labels. The wordmark is Sora Bold at −0.02em.

**Logo:** use the supplied **Flask E** files as-is. Never redraw, recolor or re-space them.

---

## 2. Colors

### 2.1 Core tokens

| Token | Hex | Role in the product |
|---|---|---|
| `blue-500` **Empira Blue** | `#3B4CFF` | Primary buttons, active/selected states, links, focus, slider fill. **Nothing decorative.** |
| `amber-500` **Spark Amber** | `#FFB21E` | Small accents only: status dots, "lab available" marker, the result/success moment in a lab, AI-assistant dot. Max ~2% of any screen. |
| `ink-900` **Lab Ink** | `#0B1026` | Headings, primary text, icons |
| `ink-700` | `#3A4166` | Body text |
| `ink-500` | `#5A6285` | Secondary text, meta (week, duration), placeholders |
| `line` | `#D9DCE8` | Borders, dividers, input outlines |
| `mist` | `#EEF0F5` | Hover backgrounds, inactive segment, skeleton loaders |
| `paper` **Paper** | `#F6F7FB` | App background |
| `white` | `#FFFFFF` | Surfaces: cards, top bar, panels, inputs |
| `blue-300` **Blue 300** | `#8B96FF` | Logo on dark only; focus ring tint. Not a UI fill. |
| `coral-500` **Signal Coral** | `#FF6A4D` | **Alerts only** (errors, failed scan, no connection) as an icon/border/dot |

### 2.2 Derived tints

These aren't in the brand files. They're the minimum extra values the UI needs, all derived from the brand colors.

| Token | Hex | Use |
|---|---|---|
| `blue-600` | `#2F3DE0` | Primary button hover |
| `blue-700` | `#2632C2` | Primary button pressed |
| `blue-50` | `#EEF0FF` | Selected background (segmented control, selected row) |
| `blue-100` | `#DDE1FF` | Selected border, focus ring fill |
| `amber-50` | `#FFF5DF` | Soft highlight behind a result or scan banner (rare) |
| `coral-50` | `#FFF1EE` | Alert background |
| `coral-700` | `#B93A25` | Alert **text** (coral itself is too light for text) |

### 2.3 Usage rules
- **One solid blue element per view if possible**, namely the main action. Selected states use the light `blue-50` + blue text so they don't compete with the main button.
- **Amber is never text, never a button, never a large fill.** It fails contrast on white (1.8:1). It's always paired with Ink text.
- **No green.** The current app's green "Stolda" states are replaced. "Done / correct / it works" = amber dot + Ink text. This follows the brand idea that amber is the result moment.
- **Coral appears only when something went wrong.**
- **No gradients.** The one exception is the soft glow inside 3D scenes (e.g. a lit bulb), which belongs to the 3D content, not the UI.
- **Light mode only** for the MVP. Lab Ink as a background is reserved for the dark logo version and future marketing, not product screens.

### 2.4 Contrast (WCAG, measured)

| Pair | Ratio | Allowed for |
|---|---|---|
| White on Empira Blue | 5.73 | Button text ✅ |
| Empira Blue on White / Paper | 5.7 / 5.35 | Links, selected text ✅ |
| Empira Blue on `blue-50` | 5.06 | Selected segment text ✅ |
| Lab Ink on White | 18.8 | Everything ✅ |
| `ink-700` on White | 9.87 | Body ✅ |
| `ink-500` on White / Paper | 5.97 / 5.57 | Secondary text ✅ |
| Lab Ink on Amber | 10.4 | Text on an amber badge ✅ |
| Amber on White | 1.8 | ❌ never for text or icons that carry meaning |
| Coral on White | 2.83 | ❌ text, so use `coral-700` (5.1) |

Muted states (e.g. topics without a lab) **keep `ink-500` text** and add a "Tez orada" (Coming soon) label. They are never made pale grey, because projectors wash out low-contrast text.

---

## 3. Typography

### 3.1 Typeface
- **Sora** (Google Fonts) for **all** UI text, as in the brand files. Load weights **400, 500, 600, 700** only. 800 is for marketing.
- **IBM Plex Mono:** not used in the product UI. It stays a brand/marketing detail. In the lab, live numeric values use Sora with `font-variant-numeric: tabular-nums` (if Sora lacks tabular figures, give values a fixed min-width so they don't jump).
- Fallback: `Sora, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **Uzbek Latin:** use `‘` (U+2018) in o‘ and g‘ and `’` for the tutuq belgisi (Sora covers these). Avoid U+02BB, which may fall back to another font. Check the long Uzbek words in layouts ("laboratoriyalari", "o‘zgartiring"): never truncate titles, always wrap.

### 3.2 Type scale

Sizes are desktop / mobile. The line-height is a multiplier.

| Token | Size | Weight | Line height | Tracking | Used for |
|---|---|---|---|---|---|
| `title-xl` | 36 / 28 px | 700 | 1.15 | −0.02em | Home greeting line (only one per app) |
| `title-l` | 28 / 24 px | 700 | 1.2 | −0.02em | Page title: class plan, topic name |
| `title-m` | 22 / 20 px | 700 | 1.25 | −0.015em | Section headings: chapter heading, "Tajriba" |
| `title-s` | 18 / 17 px | 600 | 1.3 | −0.01em | Card titles, topic row title, panel titles |
| `body-l` | 18 / 17 px | 400 | 1.6 | 0 | Topic explanation, AI assistant messages |
| `body` | 16 / 16 px | 400 | 1.55 | 0 | Default text, controls |
| `label` | 16 / 16 px | 600 | 1 | 0 | Buttons, segmented control |
| `meta` | 14 / 14 px | 500 | 1.4 | 0 | Week, duration, breadcrumb, helper text |
| `tag` | 13 / 13 px | 600 | 1 | 0.01em | Small chips ("3D lab", "Tez orada") |
| `value` | 20 / 18 px | 600 | 1 | 0 | Live lab readouts (e.g. **0,85 m**) |

Rules:
- **Minimum size is 13 px**, used for tags only. Anything a teacher must read is ≥ 14 px, and ≥ 16 px for sentences.
- Max **3 sizes per screen** plus meta.
- Headings are Lab Ink, body is `ink-700` and meta is `ink-500`.
- Measure: body text max **68 characters** (~640 px).
- Sentence case everywhere. **No ALL-CAPS labels** (the mono caps style stays on marketing materials).
- Number format follows Uzbek convention: decimal comma (`0,85 m`, `9,8 m/s²`), as in the existing app.

---

## 4. Spacing scale

Base unit: **4 px**.

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon to text gap in tags |
| `space-2` | 8 | Gap inside small groups, chip padding-y |
| `space-3` | 12 | Gap between related lines (title → meta) |
| `space-4` | 16 | Default padding inside components; mobile page margin |
| `space-5` | 24 | Card padding; gap between cards; tablet page margin |
| `space-6` | 32 | Gap between sections on mobile; desktop page margin |
| `space-7` | 48 | Gap between sections on desktop |
| `space-8` | 64 | Top of page → first heading (desktop) |
| `space-9` | 96 | Rare: Home vertical breathing room on large screens |

Whitespace rule: **when in doubt, add space rather than a border or a card.** Group content with spacing first, dividers second, and cards last.

---

## 5. Shape: radii, borders, shadows

### Radii (from the brand files: 6 / 12 / 14 / 20 / 26)
| Token | px | Use |
|---|---|---|
| `radius-s` | 8 | Tags, small chips, tooltips |
| `radius-m` | 12 | Buttons, inputs, list-row hover, segmented control items |
| `radius-l` | 20 | Cards, panels, bottom sheets (top corners), camera frame |
| `radius-full` | 999 | Status dots, avatar-like circles, slider thumb |

### Borders
- Default: **1 px `line` (#D9DCE8)**. The brand files use an inset 1 px; the visual result is the same.
- Dividers between list rows: 1 px `line`, inset to the text start.
- Selected: 1.5 px `blue-500` (or `blue-100` + `blue-50` fill for soft selection).
- Error: 1.5 px `coral-500`.
- No double borders: a bordered card doesn't also get a shadow, except panels that float over the 3D scene.

### Shadows
Only two exist.

| Token | Value | Use |
|---|---|---|
| `shadow-0` | none | Default for everything, including cards (border instead) |
| `shadow-float` | `0 1px 2px rgba(11,16,38,.06), 0 8px 24px rgba(11,16,38,.08)` | Things that float **over** content: AI panel and controls over the 3D scene, bottom sheets, dropdowns, toasts |

There's no glassmorphism and no backdrop blur. The one exception is a white surface at 92% opacity on controls overlaid on the 3D scene, if needed for legibility.

### Focus
`outline: 2px solid #3B4CFF; outline-offset: 2px` on every interactive element (keyboard), never removed.

---

## 6. Buttons

Every button has: Sora 600 16 px, **radius 12**, an icon (optional, 20 px) on the left with an 8 px gap, and no ALL CAPS.

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| **Primary** | `blue-500` → hover `blue-600` → pressed `blue-700` | White | none | The one main action: "Laboratoriyani ochish", capture photo, "Qayta urinish" |
| **Secondary** | White → hover `mist` | Lab Ink | 1 px `line` | Alternatives: "Rasm yuklash", "Qayta skanerlash", "Skanerlash" in top bar, "AI yordamchi" toggle |
| **Ghost / text** | Transparent → hover `mist` | `blue-500` | none | Low-priority links: "Boshqa mavzu?", Previous / Next topic |
| **Icon button** | Transparent → hover `mist` | Lab Ink | none | Back, close panel, camera controls. Always has an `aria-label`; **tooltip on desktop** |

| Size | Height | Padding-x | Use |
|---|---|---|---|
| Large | 56 px | 24 px | Main action on Topic, Scan capture, mobile sticky actions |
| Default | 48 px | 20 px | Everywhere else |
| Small | 40 px | 16 px | Dense lab toolbars (desktop only); **never below 40 px**, and the touch target stays ≥ 48 px with invisible padding |

States: **disabled** = `mist` fill + `ink-500` text (no opacity tricks). **Loading** = spinner replaces the icon, label stays, width stays fixed.
Primary buttons are never full-width on desktop, except inside narrow panels. On mobile, the screen's main action may be full-width and sticky at the bottom.

---

## 7. Cards

Cards are rationed. In the MVP **only three things are cards**:

1. **Class tile** (Home): white, 1 px `line`, `radius-l`, 24 px padding. Contains the class number (`title-xl`) + "sinf" label. Hover: border `blue-500`. No shadow, image or icon.
2. **Scan card** (Home): same shell, contains a short title, one line of text and a secondary button.
3. **Experiment card** (Topic): white, 1 px `line`, `radius-l`, overflow hidden.
   - Top: 3D preview image (16:9, Paper background, the existing 3D render style)
   - Body (24 px): title (`title-s`), one-line goal (`body`), meta "~10 daqiqa" (`meta`), primary button

**Not cards:** topic rows, chapter sections, topic explanation, AI messages, lab controls. These are plain rows, text blocks or panels separated by space and dividers.

Never place a card inside a card.

---

## 8. Navigation components

### 8.1 Top bar
- Height **64 px** on desktop, **56 px** on mobile. White, bottom border 1 px `line`, no shadow. It sticks to the top.
- Left: Back icon button (hidden on Home) → **logo** `full-logo-light.svg` at 28 px height (mobile: `symbol.svg` at 28 px on inner pages, full logo on Home) → breadcrumb.
- Right: **"Skanerlash"** secondary button with a scan icon. On mobile it's an icon-only button with a label tooltip/aria.
- Nothing else goes in the top bar.

### 8.2 Breadcrumb
`meta` size, `ink-500`. Links turn blue on hover and the current item is Lab Ink 600. The separator is a `›` chevron icon at 16 px. On mobile only the current screen name shows (the Back button covers going up).

### 8.3 Subject switcher (segmented control)
- A row of pills in a `mist` track (`radius-m`, 4 px inner padding). Items are 40 px high, `label` text.
- **Selected:** white fill + 1.5 px `blue-500` border + `blue-500` text. Unselected: transparent, `ink-700` text.
- With a single subject (Week 1) it shows one selected pill so the slot is visible and understood.
- This replaces the existing app's black "Barchasi" pill style. Selection is blue, per brand rules.

### 8.4 List rows (topics)
- Min height **64 px**, padding 16 px. Divider between rows.
- Layout: week (`meta`, fixed 72 px column) · title (`title-s`) · right side "3D lab" tag + chevron.
- Hover/pressed: `mist` background, `radius-m`. The whole row is the tap target.
- Row without a lab: no chevron, no hover, "Tez orada" tag, text stays `ink-500`/`ink-700` (readable).

### 8.5 Chapter heading
`title-m`, Lab Ink, with chapter number as meta above ("3-bob"). Sticky under the top bar while scrolling (white background with a bottom divider when stuck).

### 8.6 Previous / Next topic
Ghost buttons at the end of the Topic page and in the lab top bar. Text shows the **topic name**, not just "Next", with a chevron icon.

### 8.7 Tags
- Height 24, padding 0 8, `radius-s`, `tag` text.
- **"3D lab":** `blue-50` fill, `blue-500` text, with a 6 px amber dot before it as the amber accent.
- **"Tez orada":** `mist` fill, `ink-500` text.

---

## 9. Inputs

| Component | Spec |
|---|---|
| **Text input** (AI question) | 48 px high, white, 1 px `line`, `radius-m`, 16 px padding, `body` text, placeholder `ink-500`. Focus: 1.5 px `blue-500` border + 3 px `blue-100` ring. Send button: icon button inside on the right; it turns blue when text is present. |
| **Slider** (lab parameters) | Track 6 px, `line` colour, fill `blue-500`. Thumb 24 px white circle, 1.5 px `blue-500` border, `shadow-float`. Touch area 48 px. Label left (`body`) + live value right (`value`). Optional min/max under the track in `meta`. |
| **Toggle** (if a lab needs on/off) | 44×26 track: `line` off, `blue-500` on; white thumb |
| **File upload** ("Rasm yuklash") | Just a secondary button that opens the file picker. No drag-and-drop zone needed. On desktop, dropping onto the camera area is a bonus. |
| **Error message** | Under the field: `meta`, `coral-700`, with a small coral alert icon |

Labels are always visible (no placeholder-only labels), in `meta` 600 Lab Ink above the field.

---

## 10. Icons

- **Style:** outline, **2 px stroke at 24 px** (1.75 px at 20 px), rounded caps and joins, no fills. This matches the open, rounded line style of the screenshots' small icons. Recommended library: **Lucide** (free, consistent, matches this style).
- **Sizes:** 20 px inline with text and in buttons, 24 px standalone icon buttons. Nothing larger in the UI.
- **Colour:** Lab Ink by default, `ink-500` for secondary, white on primary buttons, `blue-500` only when the icon is part of a selected/active element.
- **Never** use amber or coral icons, except the coral alert icon and the amber status dot (which is a dot, not an icon).

**Allowed set for the MVP** (and nothing else without a reason):

| Meaning | Lucide name |
|---|---|
| Back | `arrow-left` |
| Breadcrumb / row chevron | `chevron-right` |
| Previous / Next topic | `chevron-left` / `chevron-right` |
| Scan | `scan-line` |
| Camera capture | `camera` |
| Upload photo | `image-up` |
| Open lab | none (text is clear enough), or `arrow-right` |
| AI assistant | `sparkles` at 20 px **or** the text label alone with an amber dot (prefer the latter) |
| Send message | `arrow-up` |
| Close panel | `x` |
| Reset lab | `rotate-ccw` |
| Top view / camera | `square` / `move-3d` |
| Full screen (lab, desktop) | `maximize` / `minimize` |
| Alert | `circle-alert` |
| Retry | `refresh-cw` |

No icons on class tiles, chapter headings, topic rows or section titles. No emoji. The **Flask E mark is only the logo**. It's never used as a decorative icon, bullet or watermark.

---

## 11. Imagery and 3D

- Keep the **existing 3D render style**: white/light-grey lab table with a faint grid, dark navy equipment, Empira-blue cables, an amber glow for "on/working" (e.g. a lit bulb). It's already on-brand: blue = structure, amber = result.
- 3D appears in only **two places**: experiment card previews (static render on a Paper background) and the lab itself.
- No decorative 3D objects, illustrations, mascots or stock photos on Home, Class Plan or Scan.
- In the 3D scene, floating value labels (like "L = 0,85 m") are white pills with `shadow-float`, `meta` 600 Ink text, `radius-s`.

---

## 12. Motion

- Durations: 150 ms (hover, press), 200 ms (panel/sheet open), 250 ms (page transitions, if any).
- Easing: `cubic-bezier(.2,.8,.2,1)` (ease-out). No bounce or parallax.
- The single brand moment: when an experiment produces its result (bulb lights up, measurement recorded), a **small amber dot pulses once**.
- Respect `prefers-reduced-motion`: remove all non-essential motion.
- Loading: skeleton blocks in `mist` (no shimmer gradient), or a 20 px blue spinner inside buttons. Lab loading: logo symbol + "Laboratoriya yuklanmoqda…" in `meta`.

---

## 13. Layout and widths

### Breakpoints
| Name | Range | Page margin | Grid |
|---|---|---|---|
| Mobile | < 640 px | 16 px | 4 columns, 16 px gutter |
| Tablet | 640–1023 px | 24 px | 8 columns, 24 px gutter |
| Desktop | 1024–1439 px | 32 px | 12 columns, 24 px gutter |
| Wide / projector | ≥ 1440 px | auto (centred) | 12 columns, 24 px gutter |

### Content widths (max)
| Screen type | Max width | Why |
|---|---|---|
| Home | **960 px** | 6 class tiles + scan card, centred, calm |
| Class Plan | **800 px** | A single reading column; the list never stretches across a projector |
| Topic | **800 px** (text column 640 px) | Readable explanation + one experiment card |
| Scan | **640 px** | Camera frame centred |
| 3D Laboratory | **full viewport** | The 3D scene uses all available space |

There are no sidebars anywhere except the optional AI panel inside the lab.

---

## 14. Desktop behaviour (laptop + classroom projector)

- **Projector-safe:** body ≥ 16 px, key titles ≥ 28 px, contrast ≥ 4.5:1 everywhere, and no meaning carried by light grey or amber alone. Test at 1280×720 (typical projector resolution).
- Hover states on all interactive elements (`mist` background or blue border). The cursor is a pointer on rows/cards.
- **Home:** class tiles in a **3 × 2 grid** (6 · 7 · 8 / 9 · 10 · 11), Scan card below, full width of the 960 column.
- **Class Plan:** a single column; the sticky chapter heading is under the top bar.
- **Topic:** explanation and experiment card stacked in one column (no side-by-side), Prev/Next at the bottom.
- **Lab:**
  - The 3D canvas fills the area below the 56 px compact top bar.
  - Task text and parameter controls float as one white panel (`shadow-float`, `radius-l`) in the **bottom-left**, max 360 px wide.
  - View controls are small icon buttons at the bottom-right.
  - The **AI panel opens on the right at 380 px wide**, pushing (not covering) the canvas, and is closed by default.
  - Keyboard: `Esc` closes the panel; `←` / `→` with a modifier switch topic (optional).
- **Full-screen button** in the lab (icon `maximize`) for projecting.

---

## 15. Mobile behaviour (phone)

- **Touch targets ≥ 48 × 48 px**; 8 px minimum between targets.
- **Home:** class tiles in a **2 × 3 grid** (6 7 / 8 9 / 10 11). The Scan card sits below, full-width, with a full-width secondary button.
- **Class Plan:** the subject switcher scrolls horizontally if there are more subjects later. The chapter jump is a single "Boblar" (Chapters) button that opens a bottom sheet listing chapters. The week column shrinks to a meta line above the title.
- **Topic:** "Laboratoriyani ochish" becomes a **sticky full-width Large button** at the bottom (with safe-area padding) when the experiment card scrolls out of view.
- **Lab:**
  - The top bar shrinks to Back · topic title · AI button (no overflow "⋯" menu); Prev/Next move to the bottom of the controls sheet.
  - The 3D canvas fills the screen. Controls + task sit in a **bottom sheet** (collapsed to a peek height ~120 px showing the task and the main slider; drag up for more).
  - The AI assistant opens as a **full-height bottom sheet** over the lab with a clear close button.
  - Landscape is supported. In landscape the controls move to a side sheet on the right.
- **Scan:** the camera fills the screen with the page-frame guide. Capture button is 72 px, centred at the bottom, with "Rasm yuklash" as a text button next to it.
- Respect iOS/Android safe areas. Disable pinch-to-zoom only inside the 3D canvas (it has its own gestures), never on text pages.

---

## 16. Tokens summary (for implementation)

```css
:root {
  /* Brand */
  --blue-500: #3B4CFF;  --blue-600: #2F3DE0;  --blue-700: #2632C2;
  --blue-300: #8B96FF;  --blue-100: #DDE1FF;  --blue-50:  #EEF0FF;
  --amber-500: #FFB21E; --amber-50: #FFF5DF;
  --coral-500: #FF6A4D; --coral-700: #B93A25; --coral-50: #FFF1EE;
  /* Neutrals (from brand files) */
  --ink-900: #0B1026;  --ink-700: #3A4166;  --ink-500: #5A6285;
  --line: #D9DCE8;  --mist: #EEF0F5;  --paper: #F6F7FB;  --white: #FFFFFF;
  /* Type */
  --font: "Sora", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  /* Space */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px;
  --s6: 32px; --s7: 48px; --s8: 64px; --s9: 96px;
  /* Shape */
  --r-s: 8px; --r-m: 12px; --r-l: 20px; --r-full: 999px;
  --shadow-float: 0 1px 2px rgba(11,16,38,.06), 0 8px 24px rgba(11,16,38,.08);
  /* Motion */
  --ease: cubic-bezier(.2,.8,.2,1); --t-fast: 150ms; --t-base: 200ms;
}
```

---

## 17. Do / Don't checklist

| Do | Don't |
|---|---|
| Paper background, white surfaces, lots of space | Heavy gradients, glassmorphism, blur |
| One solid blue main action per view | Several competing blue buttons |
| Amber as a dot or tiny accent for "it works" | Amber text, amber buttons, amber backgrounds |
| Borders and spacing to group content | Shadows on everything, cards inside cards |
| Plain lists for topics | A card for every topic |
| Icons only from the allowed set | Decorative icons on headings and tiles |
| Light mode | Dark-mode-first or dark dashboards |
| Full-viewport lab, everything else in a narrow column | Big sidebars, analytics widgets, stat tiles |
| 3D only in previews and labs | Decorative 3D objects across pages |
| Uzbek copy with ‘ ’ apostrophes; titles wrap | Truncated titles, ALL-CAPS labels |

---

## 18. Assumptions to confirm

1. **Green removed:** success/"on the table" states use an amber dot + Ink text instead of the current app's green.
2. **Selected = blue** (white + blue border) instead of the current app's black "Barchasi" pill, following your rule that blue marks selection.
3. **Sora for body text too**, as the brand files do, instead of introducing a second UI font.
4. **Light mode only** for Week 1.
5. **Lucide** as the icon library.
6. The open IA questions are still assumed as recommended: muted no-lab topics, hidden future subjects, optional "Continue" row, scan opens the lab directly, AI only in the lab.

# Empira: Home Screen UX Structure (low-fidelity)

Based on `EMPIRA_INFORMATION_ARCHITECTURE.md` (S1 Home) and `EMPIRA_DESIGN_SYSTEM.md`.
This covers structure, priority and behaviour only. It isn't visual design. Copy is in Uzbek with English in brackets.

---

## The 5-second test

| Question the teacher has | Answered by | Where |
|---|---|---|
| What does Empira do? | One headline sentence | Section B |
| How do I choose today's lesson? | "Sinfni tanlang" (Choose your class) + six class tiles | Section C |
| How do I scan a textbook page? | "yoki" (or) + one scan block with its own button | Section D |

The screen asks for exactly **one decision**: *my class* **or** *scan*. Nothing else on it competes for attention.

---

## Wireframe: Desktop / laptop (first visit)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Empira logo]                                                            │  A. Top bar
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                ┌──────────── max 960 px ───────────────┐                 │
│                                                                          │
│                Darslikdagi har bir mavzu — 3D laboratoriya               │  B. What Empira is
│                (Every textbook topic becomes a 3D lab)                   │
│                                                                          │
│                Hozircha: Fizika, 6–11-sinflar                            │  B2. Availability line
│                (Available now: Physics, grades 6–11)                     │
│                                                                          │
│                                                                          │
│                Sinfni tanlang                                            │  C. Choose a class
│                (Choose your class)                                       │
│                                                                          │
│                ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│                │           │  │           │  │           │               │
│                │    6      │  │    7      │  │    8      │               │
│                │   sinf    │  │   sinf    │  │   sinf    │               │
│                │           │  │           │  │           │               │
│                └───────────┘  └───────────┘  └───────────┘               │
│                ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│                │           │  │           │  │           │               │
│                │    9      │  │    10     │  │    11     │               │
│                │   sinf    │  │   sinf    │  │   sinf    │               │
│                │           │  │           │  │           │               │
│                └───────────┘  └───────────┘  └───────────┘               │
│                                                                          │
│                ─────────────────── yoki (or) ───────────────────         │
│                                                                          │
│                ┌────────────────────────────────────────────────┐        │  D. Scan
│                │  Darslik sahifasini skanerlang                 │        │
│                │  (Scan a textbook page)                        │        │
│                │                                                │        │
│                │  Empira mavzuni topib, laboratoriyani ochadi.  │        │
│                │  (Empira finds the topic and opens the lab.)   │        │
│                │                                                │        │
│                │  [ ⌗ Skanerlash ]   (Scan)                     │        │
│                └────────────────────────────────────────────────┘        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Wireframe: Desktop (returning teacher)

The only difference is that **E. Continue** appears between B and C.

```
│                Darslikdagi har bir mavzu — 3D laboratoriya               │  B
│                Hozircha: Fizika, 6–11-sinflar                            │
│                                                                          │
│                ┌────────────────────────────────────────────────┐        │  E. Continue
│                │ Davom ettirish (Continue)                      │        │
│                │ 8-sinf · Fizika › Om qonuni               [ › ]│        │
│                └────────────────────────────────────────────────┘        │
│                                                                          │
│                Sinfni tanlang                                            │  C
│                [ 6 ] [ 7 ] [ 8 ] ...                                     │
```

## Wireframe: Mobile (phone, ~375 × 667)

```
┌─────────────────────────────┐
│ [Empira logo]               │  A  (56 px)
├─────────────────────────────┤
│                             │
│ Darslikdagi har bir         │  B
│ mavzu — 3D laboratoriya     │
│ Hozircha: Fizika, 6–11-sinf │  B2
│                             │
│ Sinfni tanlang              │  C
│ ┌───────────┐ ┌───────────┐ │
│ │  6 sinf   │ │  7 sinf   │ │  tiles ~72 px high
│ └───────────┘ └───────────┘ │
│ ┌───────────┐ ┌───────────┐ │
│ │  8 sinf   │ │  9 sinf   │ │
│ └───────────┘ └───────────┘ │
│ ┌───────────┐ ┌───────────┐ │
│ │ 10 sinf   │ │ 11 sinf   │ │
│ └───────────┘ └───────────┘ │
│                             │
│ ────────── yoki ─────────── │
│                             │
│ Darslik sahifasini          │  D
│ skanerlang                  │
│ ┌─────────────────────────┐ │
│ │     ⌗  Skanerlash       │ │  full-width button
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

Rough height budget on mobile: top bar 56 + headline 100 + label 40 + tiles 3×72 + 2×12 gaps = 240 + divider 48 + scan 130 ≈ **614 px**. So **both paths are visible without scrolling** on a standard phone. To keep that true, the mobile scan block has no description line and no card border; it's just a title and a button.

---

## Sections explained

### A. Top bar
- **What:** the Empira logo only (full logo, links to Home).
- **Why:** brand recognition and a consistent "home" anchor that matches every other screen.
- **Teacher action:** none on this screen.
- **Note:** on every other screen the top bar has a "Skanerlash" (Scan) button. **On Home it's hidden** because Section D already offers scanning; two scan buttons on one screen would make the teacher wonder whether they're different things.
- **Could be removed?** No. It's the anchor that makes every later screen feel like the same product.

### B. What Empira is (headline)
- **What:** one sentence, `title-xl`. Suggested: *"Darslikdagi har bir mavzu — 3D laboratoriya"* (Every textbook topic becomes a 3D lab). It's adapted from the existing website tagline, so it isn't new messaging.
- **Why:** answers question 1 of the 5-second test. Teachers think in textbook topics, so the sentence starts from their world (the textbook) and ends with what Empira adds (a 3D lab).
- **Teacher action:** read once. It also confirms they're in the right place.
- **Could be removed?** Not on first visit. For returning teachers it could shrink to a smaller line, but keeping it constant is simpler. It's one line.

### B2. Availability line
- **What:** small `meta` text: *"Hozircha: Fizika, 6–11-sinflar"* (Available now: Physics, grades 6–11).
- **Why:** subjects aren't chosen on Home (per the IA), so without this line a chemistry or biology teacher would tap a class and only then discover there's only Physics. One line sets expectations honestly. It updates automatically as subjects are added ("Fizika, Kimyo…"), so it supports future subjects with no layout change.
- **Teacher action:** none. It's information only.
- **Could be removed?** **Yes, the most removable item on the screen.** The cost is that non-physics teachers would be surprised one step later. I recommend keeping it for the school demo.

### C. Choose a class (main path, Flow A)
- **What:** label *"Sinfni tanlang"* plus **six large tiles: 6–11**. Each tile shows only the number and "sinf". Desktop is a 3 × 2 grid, mobile 2 × 3.
- **Why:** this is the main teacher flow (Home → class → topic → lab). It sits first and takes the most space because it's what teachers will use daily. Teachers identify by the class they're about to teach, so it's the most natural first question. This is the **only** place classes appear (per the IA).
- **Teacher action:** tap their class. That's **action 1 of 3** to reach a lab.
- **What's deliberately not on the tiles:** subject names, icons, lab counts, progress, colors per grade. Every one of these makes six simple targets into six things to read.
- **Could be removed?** No. This section is the screen.

### Divider "yoki" (or)
- **What:** a thin line with the word *"yoki"* (or).
- **Why:** it tells the teacher that C and D are **alternatives**, not steps 1 and 2. Without it, some teachers might think they must choose a class *and then* scan.
- **Could be removed?** Possibly, if the visual hierarchy alone makes this clear. Test it with teachers. It's cheap to keep.

### D. Scan a textbook page (Flow B)
- **What:** title *"Darslik sahifasini skanerlang"* (Scan a textbook page), one line saying what happens (*"Empira mavzuni topib, laboratoriyani ochadi"*), and a **secondary** button *"Skanerlash"* (Scan) with the scan icon.
- **Why:** answers question 3. The explanation line matters because "scan" alone is vague: scan for what? It promises the outcome (the topic is found, the lab opens). It's below the classes and uses a secondary button because the MVP plan says teachers don't have to scan; it's mainly for students and for the "wow" moment in the demo.
- **Teacher action:** tap Skanerlash → Scan screen (camera, or photo upload on laptop).
- **Could be removed?** The section itself, no; it's a core MVP flow. The **description line** can be dropped on mobile (already done) to keep both paths above the fold.

### E. Continue (returning teachers only, optional)
- **What:** one row: *"Davom ettirish"* (Continue) + the last topic opened on this device (`8-sinf · Fizika › Om qonuni`). It's stored on the device, with no login.
- **Why:** answers "how do I get back to today's lesson?" in **one** tap for a teacher who prepared the topic earlier (e.g. checked it at home, opens it in class). It's never shown on a first visit, so the first-visit screen stays pure.
- **Teacher action:** tap to go straight to that Topic page.
- **Could be removed?** **Yes.** It's the only feature on Home that isn't strictly in the MVP plan. Without it, the teacher needs 2 extra taps (class, topic). This was IA open question #3. **Recommendation: keep it, but build it last.** If Week 1 time is short, drop it.

---

## What the Home screen does NOT have (and why)

| Not included | Reason |
|---|---|
| Subject picker | Subjects live inside the class (IA rule). B2 tells the teacher what's available. |
| Lab catalogue / "popular labs" grid | Duplicates the curriculum path and makes Home a second navigation system |
| Search | Not in the MVP plan. Class → plan is fast enough for 6 grades. Revisit after teacher feedback. |
| AI chat or assistant | AI lives only inside the lab |
| Login, avatar, points, notifications | No accounts or gamification in Week 1 |
| Statistics, progress, recent activity feed | Out of scope; no analytics |
| Marketing (hackathon badge, "how it works", pricing, testimonials) | That belongs on the website. Home is a tool, not a landing page. |
| Decorative 3D illustration or hero image | Slows the 5-second read; 3D is reserved for previews and labs |
| Footer | Nothing useful to put there for Week 1 |

---

## Interaction details

- **Whole tile is the target**, not just the number. Hover: blue border (desktop). Pressed: `mist` fill.
- **Keyboard:** tiles are reachable with Tab in reading order (6 → 11), then Skanerlash. Enter opens.
- **Tile → Class Plan** opens with the subject pre-selected (Fizika in Week 1).
- **Grades with very few labs:** with only 10–15 demo labs across 6 grades, some grades may have 0–2 labs. The tile still works (it opens the full plan with "Tez orada" (Coming soon) on topics without a lab). For the demo, see open question 2 below.
- **Page title** (browser tab): "Empira — 3D laboratoriya".

---

## Open questions

1. **Headline wording:** *"Darslikdagi har bir mavzu — 3D laboratoriya"* is my suggestion, adapted from the website. Do you want to use a specific Uzbek tagline you already have?
2. **Grades without demo labs:** should each tile show a small count like "4 ta laboratoriya" (4 labs) so the presenter knows where the demo labs are? I've left it off for simplicity. It would help the demo, but teachers may read "0" as "broken".
3. **"Continue" row:** keep (build last) or drop?
4. **"yoki" divider:** keep it, or rely on hierarchy alone?

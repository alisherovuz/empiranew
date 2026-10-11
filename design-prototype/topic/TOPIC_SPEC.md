# Empira Topic page (S3): High-fidelity specification

Prototype: `index.html?mavzu=<slug>` (default: `nyutonning-ikkinchi-qonuni`). This is a separate design prototype, not production code.
Follows `HOME_DESIGN_RULES.md` (locked) and `EMPIRA_DESIGN_SYSTEM.md`.

- **Plan order** comes from `../class-plan/data.js`.
- **Topic content** comes from `content.js`: sample text that is physically correct but needs the team's real wording.
- Topics are reached from the Class Plan. Its lab rows and the "Shu hafta" (This week) row now link here.

## Content (top → bottom)
1. **Top bar:** identical to the Class Plan. Back goes to the plan; then the logo; then "Skanerlash" (Scan).
2. **Breadcrumb:** `8-sinf · Fizika › 1-bob. Mexanik harakat`. Both parts link to the plan; the chapter part opens that chapter.
3. **Title** (28 / 32 / 36 px) + the week.
4. **3D laboratoriya:** one lab card per lab, containing:
   - title
   - approximate duration
   - one-line goal
   - "Tajriba savoli" (the question to ask the class)
   - **"3D laboratoriyani ochish"**: the page's only solid-blue button

   Additional labs get a secondary "Ochish" (Open) button.
5. **Qisqacha tushuntirish** (Short explanation): 2 short paragraphs, 17/18 px, max 640 px wide.
6. **Asosiy formula** (Key formula): one white panel with the formula (28/32 px) and a symbol · meaning · unit list.
7. **Oldingi / Keyingi mavzu** (Previous / Next topic): two quiet tiles showing title + week + "3D laboratoriya mavjud" / "Tez orada". They step through **every curriculum topic** in plan order, with no skipping, so the labels match the behaviour. At either end of the year, the tile becomes "Yillik reja" (Annual plan) and links back to the plan.

**Topic without a lab:** breadcrumb, title and week, then one white panel saying "Bu mavzu uchun 3D laboratoriya hali mavjud emas." (This topic doesn't have a 3D lab yet) with a secondary "Yillik rejaga qaytish" (Back to the annual plan) button, which opens the plan at that chapter. Previous/next stay available. There's no explanation, no formula, no sticky button, and **no automatic redirect** to another lab.

## Layout
| Width | Arrangement |
|---|---|
| ≥ 1024 | Explanation and formula on the left (`1fr`). Lab card on the right (336 px), **sticky** under the top bar so the main action never scrolls away. |
| 640–1023 | One column: lab card first (button left-aligned, min 280 px), then explanation, then formula. Previous/next side by side. |
| < 640 | One column, lab card first. Previous/next stacked. After the card's button scrolls off screen, a **sticky bottom bar** with the same button appears (safe-area aware). |

Fit check: the main button is visible on the first screen at 1280×720, 800, 390×844 and 375×667.

## Not included
AI, analytics, progress, points, lab ratings, equipment lists, textbook page numbers, extra metadata.

# Empira Class Plan (S2): High-fidelity specification

Prototype: `index.html`. This is a separate design prototype, not production code. Follows `HOME_DESIGN_RULES.md` (locked) and `EMPIRA_DESIGN_SYSTEM.md`.

Prototype URL options:
| Parameter | Shows |
|---|---|
| `?hafta=22` | Overrides which week is treated as "Shu hafta" for this session |
| `?sinf=6…11` | The grade chosen on Home. Only 8 has mock data; the others show a plain "not in the prototype yet" note with a way back to Home. |
| `?fanlar=3` | Kimyo and Biologiya in the subject switcher (preview of future subjects) |
| `?ochiq=hammasi` | All chapters open |
| `#bob-3` | Opens chapter 3 and scrolls to it |

**Data:** `data.js` holds the **real 8-sinf Fizika plan** from the 2019 textbook: 5 chapters and 60 sections, each with its first page (used by scanning) and an approximate week (2 lessons a week). `lab: true` is set for the **42 topics with labs** (43 labs; §24 has two): every lab work and practical, and every topic with a book experiment. The other 18 (12 problem-solving lessons and 6 theory topics: 25, 28, 30, 31, 38, 56) are "Tez orada". Replace the weeks with the official yearly plan when available.

**"Shu hafta" is a prototype setting, not calendar logic.** It's set with `demoThisWeek` in `data.js` (default 10 → 19-§ Om qonuni), or per session with `?hafta=N`.

## Structure (top → bottom)
1. **Top bar:** Back (to Home) · Flask E logo (full on tablet and desktop; the symbol on mobile) · "Skanerlash" (Scan) secondary button (icon-only on mobile).
2. **Class + subject:** eyebrow "Yillik o‘quv reja" (Annual study plan) → title "8-sinf" → subject switcher (one pill per subject that has content) → summary "5 bob · 28 mavzu · 6 ta 3D laboratoriya" (5 chapters · 28 topics · 6 3D labs).
3. **This-week row:** the Home "Davom ettirish" (Continue) row pattern. It shows "Shu hafta · 7-hafta · Mexanik harakat" (This week · week 7 · chapter), then the topic and its "3D laboratoriya mavjud" / "Tez orada" tag. It always opens the Topic page. It's the page's only amber dot.
4. **"Boblar va mavzular" (Chapters and topics):** section title, hint, and an "Barchasini ochish / yopish" (Open all / Close all) text button.
5. **Chapters:** plain list rows on Paper, separated by hairlines. Each row shows "1-bob · 1–8-hafta", the chapter title (20/22 px, 700), "8 mavzu · 1 ta laboratoriya" (8 topics · 1 lab) and a chevron.
6. **Topics:** one white list panel (radius 20) per open chapter, with rows separated by `mist` hairlines.
   - **Every row is a link** to its Topic page, with a chevron.
   - **Rows with a lab:** title 600 Lab Ink, "3D laboratoriya mavjud" tag (`blue-50` / Empira Blue).
   - **Rows without a lab:** title 500 `#3A4166`, "Tez orada" tag (`mist` / `#5A6285`).
   - Hint: "Mavzuni bosing — mavzu sahifasi ochiladi." (Tap a topic to open its page.)
   - **Current week:** a grey "Shu hafta" chip under the week number.

## Sizes
| Element | Mobile | Tablet / desktop |
|---|---|---|
| Page title | 28 | 32 / 36 |
| Chapter title | 20 | 22 |
| Topic title | 17 | 18 |
| Week, meta, hints | 14 | 14 |
| Tag, chip | 13 | 13 |
| Topic row | min 64 px; title on top, then week + tag | min 64 px; columns: week 112 px · title · tag · chevron |
| Subject pill | 44 px high | 44 px high |

## Blue usage
Blue appears only on:
- the selected subject (`blue-50` fill + 2 px border)
- "3D laboratoriya mavjud" tags
- the "Barchasini ochish" text button
- hover, pressed and focus states

There's no solid-blue element at rest.

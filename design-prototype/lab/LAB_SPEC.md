# Empira 3D Laboratory (S4): High-fidelity specification

Prototype: `index.html?lab=<topic slug>`. This is a separate design prototype, not production code. Follows `HOME_DESIGN_RULES.md` (locked).
**One screen design, three demo labs.** These are mock experiences that show what each lab would feel like. They are not physics engines; the values use the textbook formula.

| `?lab=` | Lab | Scene | Controls | Action | Measured |
|---|---|---|---|---|---|
| `nyutonning-ikkinchi-qonuni` | Aravachaning tezlanishi | Cart on a 1 m track, blue force arrow, weight blocks, amber finish line | F 0,5–4 N · m 0,5–2 kg | "Boshlash" → the cart accelerates | a = F/m, t (1 m) |
| `om-qonuni` | Om qonuni | Board with battery cells (one per 1,5 V), switch, resistor (longer for larger R), ammeter dial, bulb (amber glow ∝ I), blue wires | U 1,5–6 V · R 5–20 Ω | "Zanjirni ulash" → the switch closes, the needle swings, the bulb lights | I = U/R |
| `elastiklik-kuchi-guk-qonuni` | Prujinaning cho‘zilishi | Stand, blue spring, ruler (0–15 sm), weight discs (50 g each), blue pointer at the spring end | m 50–300 g (k = 20 N/m) | "Yukni osish" → the discs move to the hook and the spring stretches and settles | F = m·g, x = F/k |

- Titles, questions and the back link come from the same data as the Topic page and Scanner.
- **3D:** three.js 0.170 + OrbitControls, **bundled locally** in `vendor/three-0.170.0-bundle.js` (classic script, MIT licence in `vendor/three-LICENSE.txt`). No internet is needed, and it works when the prototype is opened straight from disk. Only the Sora webfont still comes from Google Fonts; offline, it falls back to the system font.
- **Prototype URL option:** `&holat=tugadi` shows the state after two measurements (the second doubles the studied quantity).

## Structure
| Area | Contents |
|---|---|
| **Top** (56 / 64 px) | Back (to that lab's Topic page), lab name (17–20 px, 700) + "<topic> · 8-sinf". Desktop only: a full-screen button for projectors. No logo, scan, menus or previous/next. |
| **Stage** (dominant) | The lab's live 3D scene (see the table above). Live value pills, with the studied quantity outlined in blue (a, I or x). The result value shows only after the run. "Aylantirish uchun suring" (drag to rotate) hint, which disappears on first drag. A reset-view button. |
| **Panel** (secondary) | **Tajriba savoli** (experiment question) · **Boshqaruv** (controls: the lab's 1–2 sliders + one primary action) · **Bosqichlar** (3 steps) · **O‘lchovlar** (measurements: last 4 runs) · **Keyingi mavzu** (next topic): one quiet tile at the very end showing the next curriculum topic, its week and "3D laboratoriya mavjud" / "Tez orada". It opens that topic's page. |

Only one solid-blue element: the primary action. Its labels: Boshlash / Harakatlanmoqda… / Qayta boshlash · Zanjirni ulash / Ulanmoqda… / Qayta ulash · Yukni osish / Osilmoqda… / Qayta osish.

## Interactions
- Moving a slider updates the scene immediately (arrow and weights · battery cells and resistor size · discs waiting on the base) and resets the run.
- **Boshlash:** the cart accelerates in real time (x = ½·a·t²). At 1 m the finish line lights amber, t appears, and a row is added to "O‘lchovlar".
- Sliders are locked while the cart moves.
- **Steps progress automatically:**
  1. Done when F is changed (or after a run).
  2. Done after the first run.
  3. Done when two runs have the same m and one has double the F.

  The current step has a blue ring; done steps show a check. There are no points or scores.
- **3D labels** (0 / 0,5 m / 1 m / F) are white pills with bold Lab Ink text (F in Empira Blue). They keep a constant on-screen size: about 4.5 % of the stage height, clamped to 24–36 px. They stay readable on phones, laptops and projectors at any zoom, and they're never hidden behind the cart.
- **Loading:** until the first 3D frame is drawn, the stage shows a blue spinner and "Laboratoriya yuklanmoqda…" (Loading the lab…). If 3D can't start, it shows the fallback message instead.
- **Small stages** (under 420 px tall, i.e. phones): minor scene labels hide to avoid crowding. On the spring lab only "0" and "10 sm" remain.
- Drag rotates the scene (no pan; it can't go under the table); scroll or pinch zooms. The reset button restores the default view.
- The camera framing adapts to any aspect ratio, so the whole track and cart are always in view.

## Layout
| Width | Arrangement |
|---|---|
| ≥ 1440 | Stage fills the viewport, panel 400 px on the right |
| 1024–1439 | Stage fills the viewport, panel 360 px on the right (scrolls if needed) |
| 640–1023 | Stage on top (52 vh); panel below in 2 columns: controls left, question / steps / measurements right |
| < 640 | Stage on top (44 vh, 260–380 px); **controls first**, directly under the scene, then question, steps and measurements. "Boshlash" is visible without scrolling at 375×667. |

## Not included
AI chat, analytics, points or badges, equipment-picking puzzle, multi-step wizard, extra navigation, decorative cards.

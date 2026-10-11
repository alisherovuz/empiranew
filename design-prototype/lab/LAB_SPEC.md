# Empira 3D Laboratory (S4): Specification

Prototype: `index.html?lab=<lab slug>`. **One screen design, 10 labs for 8-sinf Fizika**, one for every lab work and practical in the 2019 textbook. These are mock experiences: the values use the textbook formulas; they are not full physics simulators.

| Files | Role |
|---|---|
| `app.js` | Engine: panel (range + choice controls, steps, measurements), stage, camera framing, loading state, next topic |
| `kit.js` | 3D equipment kit, built once: power supply, cells, switch, lamp, resistor, rheostat, A/mA/V meters, stopwatch, coil + iron core, compass, bar magnets, stand, dynamometer, electrophore machine, candle, wires |
| `labs-8.js` | The 10 lab definitions (controls, physics, steps, table, layout) |
| `vendor/three-0.170.0-bundle.js` | three.js + OrbitControls, local (works offline and from file://) |

| `?lab=` | § | Lab | Controls | Measured |
|---|---|---|---|---|
| `elektr-shamoli` | 6 | Elektr shamolini kuzatish | speed, distance | flame deflection |
| `elektr-zanjir` | 14 | Zanjir yig‘ish (2 lamps in series) | U, ammeter position, voltmeter on L₁/L₂/both | I, U₁, U₂, U |
| `om-qonuni` | 19 | Om qonunini o‘rganish (R = 200 Ω) | U 4–10 V | I (mA), R, Rₒ‘ᵣₜ |
| `reostat` | 20 | Reostat yordamida tok kuchini rostlash (8 V, 6 Ω) | slider position 1–4 | Rᵣ, I |
| `tok-manbalari` | 23 | Tok manbalarini ulash (3 × 1,5 V) | voltmeter on cell 1/2/3/series | U₁, U₂, U₃, Uᵤₘ |
| `ketma-ket-ulash` | 24 | Ketma-ket ulash (100 Ω + 150 Ω) | U, voltmeter on R₁/R₂/AB | I, U₁, U₂, Uᴬᴮ |
| `parallel-ulash` | 24 | Parallel ulash (200 Ω ‖ 300 Ω) | U, ammeter total/R₁/R₂ | I, I₁, I₂ |
| `lampochka-quvvati` | 33 | Lampochka quvvati (3,5 V; 0,26 A lamp) | U | I, P, t, W, Pₒ‘ᵣₜ (3 repeats) |
| `magnitlar-tasiri` | 49 | Doimiy magnitlar ta’siri (dynamometer) | poles, distance | Fₜ, F |
| `elektromagnit` | 58 | Eng oddiy elektromagnit | current, iron core, compass distance | compass deflection |

- **Steps:** each lab's 3 steps follow its textbook procedure and tick off automatically from the measurements.
- **Prototype URL option:** `&holat=tugadi` shows the lab's demo measurements already taken.
- **Archived:** the earlier Newton / Hooke mock labs (7-sinf topics) are in `../_archive-7sinf/`.

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

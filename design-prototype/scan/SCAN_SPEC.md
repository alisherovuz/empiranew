# Empira Scan (S5): High-fidelity specification

Prototype: `index.html`. This is a separate design prototype, not production code. Follows `HOME_DESIGN_RULES.md` (locked).
**Detection is live** on the deployed site: the photo is resized (≤ 1600 px JPEG) and sent to `/api/scan` (Vercel function). There, **Gemini** reads the printed page number, the § label and the heading, and the server matches them to the real 8-sinf curriculum: § number first, then the page range, then fuzzy heading match, with Uzbek apostrophes normalised. The result opens:
- the lab, if the topic has 1 lab
- the topic page, if it has 2 labs ("3D laboratoriyalarni ko‘rish") or none ("Mavzuni ochish")

Opened as a local file, detection is **simulated** (it cycles through the 42 lab topics). `?mavzu=<topic slug>` or presenter mode always uses the chosen mock result. If the service fails, the not-found screen says "Skanerlash xizmati hozir javob bermadi".

**Presenter mode (for live demos, never shown to teachers):**
- Open the scanner once with `?taqdimot=1`. It stays on for that browser session; `?taqdimot=0` turns it off.
- Below the scan actions, behind a dashed divider, a small chooser appears: "Namoyish rejimi · keyingi skan natijasi" (Demo mode · next scan result), with numbered chips **the 9 lab-work and practical topics (6, 14, 19, 20, 23, 24, 33, 49, 58; keys 1–9)**.
- Tap a chip, or press **1 / 2 / 3** on a laptop, before scanning. The next scan then "finds" exactly that topic, so the result matches the page being held up.
- With no choice made, scans cycle through the three topics.

Prototype URL options:
| Parameter | Shows |
|---|---|
| `?holat=kamera` | Webcam state |
| `?holat=aniqlanmoqda` | Detecting state |
| `?holat=natija` | Result state |
| `?holat=topilmadi` | Not-found state |
| `?natija=yoq` | Makes detection fail |

## Frame
- The same top bar as other inner pages, with Back (to Home) and the logo. There's **no** Scan button here.
- One narrow column (max 640 px), centered. Nothing else is on the screen.

## States
| State | Content |
|---|---|
| **1. Ready** | Title "Kitob sahifasini skanerlash" (Scan a textbook page) + one-line framing tip (the topic heading and its picture should be fully in frame). **One dominant tile** (`clamp(260px, 52vh, 400px)` high), with the solid-blue scan chip as the screen's only solid blue element. One secondary button below. |
| **1b. Webcam** (desktop) | The video replaces the tile in the same frame. "Bekor qilish" (Cancel) and "Suratga olish" (Take photo) buttons. |
| **2. Detecting** | "Sahifa aniqlanmoqda…" (Identifying the page) + "Sinf, fan va mavzu qidirilmoqda." (Looking for class, subject and topic). The captured photo shows in the frame under a light veil, with a spinner. |
| **3. Result** | "● Mavzu topildi" (Topic found; the amber dot is the "it worked" moment). One white panel with 4 rows: **Sinf · Fan · Mavzu · Mos 3D laboratoriya** (Class · Subject · Topic · Matching 3D lab), then **"3D laboratoriyani ochish"** (Open the 3D lab), full width. Two quiet text buttons sit below: "Qayta skanerlash" (Scan again) and "Boshqa mavzuni tanlash" (Choose another topic), which opens the detected class's annual plan. |
| **4. Not found** | Coral "Mavzu topilmadi" (Topic not found) label (alerts only), the title "Sahifani yana bir bor skanerlang" (Scan the page once more), one practical tip, a primary "Qayta skanerlash" and a secondary "Sinf bo‘yicha tanlash" (Choose by class → Home). |
| Camera blocked / wrong file | An inline coral message under the tile pointing to upload. Nothing else changes. |

## Device behaviour
**Camera is the primary action on every device.** The main tile is always **"Kamera orqali skanerlash"** (Scan with the camera). The secondary button is always **"Rasm yuklash"** (Upload a photo).

| Input type | What the main tile does | Note under the label |
|---|---|---|
| Touch (phones, tablets) | Opens the device's own camera app (`capture="environment"`) | "Telefon kamerasi ochiladi" (The phone camera opens) |
| Mouse (laptops, desktops) | Opens a live webcam view in the same frame | "Kitob sahifasini kameraga tuting" (Hold the page up to the camera) |

The input type is detected with `hover` + `pointer`. If the camera can't open, an inline coral message points to "Rasm yuklash".

## Responsive
| Width | Behaviour |
|---|---|
| ≥ 1024 | Title 36 px, 640 px column |
| 640–1023 | Title 32 px. Result rows show the label and value side by side (184 px label column). Not-found buttons sit side by side. |
| < 640 | Title 28 px. Result rows stack (label above value). Buttons are full width. Everything fits on 375×667. |

## Not included
Live text overlays, crop or rotate tools, scan history, AI chat, tips carousel, or decorative illustrations.

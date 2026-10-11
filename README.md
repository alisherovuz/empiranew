# Empira — Week 1 MVP design prototype

Empira turns textbook topics into interactive 3D laboratories for school lessons (Physics first; Chemistry, Biology and other subjects later).

This repository contains the Empira **8-sinf Fizika** pilot: the full annual plan from the 2019 textbook, 43 interactive 3D labs (every lab work and practical in the book, plus one lab for every topic with a book experiment: 42 of 60 topics), and live textbook scanning with Gemini.

## Run it

- **Live:** **https://test.empira.uz** (also empiratest.vercel.app). It redeploys automatically on every push to `main`.
- **Laptop, offline:** open `design-prototype/home/index.html` in Chrome or Edge. No install, no server, works offline (only the Sora font needs internet).
- **Phone without the live site (same Wi-Fi as the laptop):**
  ```
  python3 -m http.server 8000 --directory design-prototype
  ```
  then open `http://<laptop-ip>:8000/home/index.html` on the phone (`ipconfig getifaddr en0` shows the IP on macOS).

## What's inside

| Path | Contents |
|---|---|
| `design-prototype/home/` | Home (locked visual source of truth) |
| `design-prototype/class-plan/` | 8-sinf annual plan (chapters → topics, "Shu hafta") |
| `design-prototype/topic/` | Topic page (with lab / "Tez orada") |
| `design-prototype/scan/` | Textbook scanner (mock detection, presenter mode) |
| `design-prototype/lab/` | 43 interactive 3D labs for 8-sinf Fizika (engine `app.js`, equipment `kit.js`, labs `labs-8.js` … `labs-8e.js`; three.js bundled locally) |
| `api/scan.js` | Vercel function: textbook photo → Gemini → matched 8-sinf topic + lab (needs `GEMINI_API_KEY`) |
| `design-prototype/class-plan/data.js`, `topic/content.js` | Real 8-sinf curriculum (5 chapters, 60 topics) and lab-topic content |
| `design-prototype/_simplicity-pass/` | Before/after screenshots of the simplicity pass |
| `EMPIRA_PRODUCT_CONTEXT.md` | What Empira is, MVP scope, constraints |
| `EMPIRA_INFORMATION_ARCHITECTURE.md` | Screens, navigation, flows |
| `EMPIRA_DESIGN_SYSTEM.md`, `HOME_DESIGN_RULES.md` | Visual language (Home rules take precedence) |
| `TEACHER_DEMO_GUIDE.md` | How to run a live teacher demo |
| `TEACHER_TEST.md` | 15-minute usability test + Uzbek feedback form |
| `brand/` | Flask E logo files and palette |

three.js (MIT licence) is included in `design-prototype/lab/vendor/`.

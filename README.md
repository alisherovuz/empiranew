# Empira — Week 1 MVP design prototype

Empira turns textbook topics into interactive 3D laboratories for school lessons (Physics first; Chemistry, Biology and other subjects later).

This repository contains the **design prototype** prepared for teacher demos and usability testing. It is not production code: data is mock, and scanning is simulated.

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
| `design-prototype/lab/` | 3D labs: Nyutonning ikkinchi qonuni, Om qonuni, Guk qonuni (three.js bundled locally) |
| `design-prototype/_simplicity-pass/` | Before/after screenshots of the simplicity pass |
| `EMPIRA_PRODUCT_CONTEXT.md` | What Empira is, MVP scope, constraints |
| `EMPIRA_INFORMATION_ARCHITECTURE.md` | Screens, navigation, flows |
| `EMPIRA_DESIGN_SYSTEM.md`, `HOME_DESIGN_RULES.md` | Visual language (Home rules take precedence) |
| `TEACHER_DEMO_GUIDE.md` | How to run a live teacher demo |
| `TEACHER_TEST.md` | 15-minute usability test + Uzbek feedback form |
| `brand/` | Flask E logo files and palette |

three.js (MIT licence) is included in `design-prototype/lab/vendor/`.

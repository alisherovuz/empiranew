# Empira: Build Plan (from design prototype to working MVP)

For the tech team. It covers **what to build**, **how it connects to the approved design**, and **in what order**.
The schedule follows the 7-day plan in `mvp_plan.docx`. Items marked **[decide]** need a team decision on Day 0.

---

## 0. Starting point

| What exists | Where | Status |
|---|---|---|
| Approved screens and flows | `design-prototype/` · live at **test.empira.uz** | Final UX. Plain HTML/CSS/JS, mock data. |
| Design rules | `HOME_DESIGN_RULES.md` (wins), `EMPIRA_DESIGN_SYSTEM.md` | Final |
| Screens and URL structure | `EMPIRA_INFORMATION_ARCHITECTURE.md` | Final |
| 3 demo labs (Newton 2, Ohm, Hooke) | `design-prototype/lab/app.js` | Working lab engine + 3 scenes (three.js 0.170) |
| Data shapes | `class-plan/data.js`, `topic/content.js` | **These are the API contract** (see §4) |

**Rule for the team:** the prototype is the **visual and behavioural spec**, not the production codebase. We rebuild it as a real app with the **same screens, tokens, copy and states**. Anything the prototype shows is "done" when the real app looks and behaves the same at the 6 test sizes (§7).

---

## 1. What becomes real

| Area | Prototype today | Production MVP |
|---|---|---|
| Curriculum | 8-sinf mock, hard-coded | Grades **6–11 Fizika** from the 6 textbooks, stored in a database |
| Topic content | 3 topics written | Short explanation + formula for every topic that has a lab (at least) |
| "Shu hafta" | `demoThisWeek: 7` | Calculated from a school-calendar start date (+ holidays) |
| Labs | 3 mock labs | **10–15 demo labs**: the 3 existing + 7–12 new, chosen on Day 1 |
| Scanning | Simulated rotation | Photo → **Gemini vision** → match to curriculum → topic + lab |
| AI assistant | Removed from design | **[decide]** see §6 |
| Presenter mode | `?taqdimot=1` | Remove, or keep behind an env flag for sales demos only |
| Hosting | Vercel, test.empira.uz | Vercel, e.g. `app.empira.uz` (keep test.empira.uz as the design reference) |

**Not in scope** (MVP plan §9): accounts or login, admin panel, billing, analytics or statistics, gamification.

---

## 2. Recommended stack **[decide]**

Pick what your team already knows. This is the default if there's no strong preference.

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript** | One codebase for pages + API routes; deploys to the Vercel project you already have |
| Styling | **Plain CSS / CSS Modules with the prototype's tokens** (copy `:root` from any prototype `styles.css`) | Zero translation loss from the design. Avoid adding a UI kit that brings its own look. |
| 3D | **three.js 0.170** (same version), npm package | The lab engine and scenes port directly |
| Database | **Postgres (Supabase or Neon)** | Small relational data (grades → chapters → topics → labs). Free tier is enough. |
| Scanning AI | **Gemini API (vision)**, server-side only | Already named in the MVP plan. The key never reaches the browser. |
| Content entry | **Google Sheet → import script** | Teachers/content people edit a sheet; no admin panel needed (out of scope) |
| Fonts | **Self-host Sora** (`next/font`) | Removes the only external dependency; works on weak school internet |

*Python team?* FastAPI + Postgres for the API works too. Keep Next.js (or plain React) for the frontend so the design port is direct.

---

## 3. Data model (subject-agnostic)

```
Grade        id, number (6–11)
Subject      id, slug ('fizika'), name ('Fizika')                     ← Kimyo / Biologiya later = new rows only
Chapter      id, grade_id, subject_id, number, title
Topic        id, chapter_id, order, slug, title, week, textbook_pages ('34–37'),
             explanation (text[]), formulas (text[]), terms (json: [symbol, name, unit])
Lab          id, topic_id, slug, title, goal, question, minutes,
             engine ('cart' | 'circuit' | 'spring' | …), config (json), status ('ready' | 'soon')
Calendar     id, school_year, start_date, holidays (json)              ← drives "Shu hafta"
ScanEvent    id, created_at, result_topic_id, confidence, latency_ms    ← optional, no photos stored
```

- A topic "has a lab" when it has a `Lab` with `status = 'ready'`. Otherwise the UI shows **"Tez orada"**, exactly as in the prototype.
- `textbook_pages` is what makes scanning reliable (§5). Collect it on Day 1.

**Day 1 content sheet:** one row per topic, with these columns:
`grade · subject · chapter_no · chapter_title · topic_no · topic_title · week · pages · explanation · formula · lab_slug`

---

## 4. API contract (mirrors the prototype's mock data)

The prototype already reads these shapes from `data.js` / `content.js`. The real API returns **the same fields**, so the frontend port is mechanical.

| Endpoint | Returns | Replaces in prototype |
|---|---|---|
| `GET /api/plan?grade=8&subject=fizika` | `{ grade, subjects[], thisWeek, chapters[{ n, title, topics[{ w, t, slug, lab }] }] }` | `window.EMPIRA_PLAN` |
| `GET /api/topics/:slug` | `{ title, week, chapter, explain[], formulas[], terms[], labs[{ slug, title, goal, task, minutes }], prev, next }` | `window.EMPIRA_TOPICS[slug]` + pager logic |
| `GET /api/labs/:slug` | `{ title, topic, question, engine, config }` | `LABS[...]` + `content.js` lookup in `lab/app.js` |
| `POST /api/scan` (image) | `{ status: 'found' \| 'notfound', grade, subject, topic: { slug, title }, lab: { slug, title } \| null, confidence }` | `RESULTS` rotation in `scan/app.js` |

Static content (plan, topics, labs) can be **pre-rendered at build time** (Next.js static generation). The site then stays fast on school Wi-Fi, and only `/api/scan` is a live call.

---

## 5. Scanning pipeline

```
Phone camera / webcam / upload
  → browser resizes to ≤ 1600 px JPEG (keeps uploads small on weak Wi-Fi)
  → POST /api/scan
  → server sends the image to Gemini vision with a strict prompt:
       "Read the page. Return JSON: { page_number, heading, grade_hint }"
  → server matches against the curriculum, in this order:
       1. page_number + grade_hint → Topic.textbook_pages      (most reliable)
       2. heading → fuzzy match on Topic.title (normalise o‘/g‘ apostrophes!)
  → confidence ≥ 0.8 → status 'found'  → result screen (already designed)
    otherwise        → status 'notfound' → "Mavzu topilmadi" (already designed)
```

- **Targets:** under 5 s end to end; at least 9 of 10 demo pages recognised in internal testing (Day 6).
- **Design gap:** the IA describes a "candidates" screen for unsure matches, but it was **not designed**. For Week 1, treat unsure as "not found". **[decide]** whether to design the candidates screen in Week 2.
- **Privacy:** don't store photos. Log only the result, confidence and latency (`ScanEvent`).
- **Webcam:** works only over HTTPS. Vercel provides it.

---

## 6. 3D labs and the AI assistant

**Labs**: reuse the prototype's lab engine (`lab/app.js`), which already separates:
- the **shared stage**: table, lights, camera fitting, value pills, constant-size labels, loading state, "Keyingi mavzu"
- the **lab definition**: controls, readouts, steps, measurement columns, `doubled()` check, camera framing
- the **scene builder**: `buildCart`, `buildCircuit`, `buildSpring`

**Port plan:**
1. Port the stage to a `<LabStage>` React component.
2. Port each lab to `labs/<engine>.ts`.
3. Build a small **equipment library**, so new labs are assembled from existing parts instead of modelled from scratch. Start with: track, cart, weights, battery, wire, switch, resistor, ammeter, voltmeter, bulb, stand, spring, pendulum, ruler, laser, glass block, lens.

New labs are picked on Day 1 from the textbooks. Prioritise the ones teachers ask for (feedback form Q5). One developer can typically build 2–3 labs a day once the equipment library exists.

The MVP plan mentions *Gemini generating 3D equipment*. For Week 1 we recommend **hand-built, reusable equipment** instead, because it's predictable, fast and testable. Gemini can help write lab configs and explanation text.

**AI assistant [decide]:** the MVP plan (Day 5) includes an AI assistant in labs. The approved design removed it to keep the lab focused. Options:
- **A.** Skip it for Week 1 (recommended). The teacher demo is already complete without it.
- **B.** Add it in Week 2 as a closed-by-default "AI yordamchi" panel. It needs a short design pass first (the design system already reserves the space).

---

## 7. How to connect the real app to the design

**Step 1: copy the foundation, not the pages.**
- `:root` tokens → `styles/tokens.css` (colors, spacing, radii, shadow, motion), unchanged.
- The Flask E logo SVGs from `brand/` and `design-prototype/*/assets/`.
- The three.js lab engine (`lab/app.js`).

**Step 2: rebuild each prototype element as a component.**

| Prototype element (file) | Component |
|---|---|
| top bar, back, logo, scan button (all pages) | `TopBar` |
| class tiles, scan tile, Continue row (`home`) | `GradeTile`, `ScanTile`, `ContinueRow` |
| subject pills, "Shu hafta" row, chapter accordion, topic row, tags (`class-plan`) | `SubjectSwitcher`, `ThisWeekRow`, `Chapter`, `TopicRow`, `Tag` |
| breadcrumb, lab card, formula panel, no-lab state, prev/next (`topic`) | `Breadcrumb`, `LabCard`, `FormulaPanel`, `NoLabState`, `Pager` |
| scan tile, webcam view, detecting, result facts, not-found (`scan`) | `ScanCapture`, `ScanDetecting`, `ScanResult`, `ScanNotFound` |
| stage, value pills, panel blocks, steps, measurements, next link (`lab`) | `LabStage`, `Readouts`, `LabPanel`, `Steps`, `Measurements`, `NextTopicLink` |

**Step 3: routes** (from the IA; readable and bookmarkable):

| Prototype | Production route |
|---|---|
| `home/index.html` | `/` |
| `class-plan/index.html?sinf=8` | `/8-sinf/fizika` |
| `topic/index.html?mavzu=om-qonuni` | `/8-sinf/fizika/om-qonuni` |
| `lab/index.html?lab=om-qonuni` | `/8-sinf/fizika/om-qonuni/lab` |
| `scan/index.html` | `/skaner` |

**Step 4: swap the mock data for the API** (§4), one screen at a time. Each screen should look identical before and after the swap.

**Step 5: visual acceptance.** Each screen is accepted when:
- It matches the prototype screenshots (`design-prototype/*/screenshots/`, `_simplicity-pass/after/`) at **1440, 1280, 1280×720, 800, 390 and 375**.
- It passes the same QA checks: no horizontal overflow, no text under 13 px, touch targets ≥ 44 px, loading states present, no console errors.
- The **4 flows** pass end to end:
  1. Home → 8-sinf → Shu hafta → lab
  2. Scanner → result → matching lab
  3. Lab → Keyingi mavzu
  4. "Tez orada" topic → back to the plan

Automate these as **Playwright tests in CI**. The prototype QA was done exactly this way; the scripts can be added to the repo.

**Rule:** any visual change that isn't in the prototype goes back to design first. Don't improvise in code.

---

## 8. 7-day schedule (MVP plan, mapped to the build)

Suggested team: **FE** (frontend), **BE** (backend + scanning), **3D** (1–2 lab developers), **C** (content: a physics teacher or methodologist), **QA/PM** (you).

| Day | MVP plan goal | Build tasks | Done when |
|---|---|---|---|
| **0** | — | Decide stack, AI assistant, lab list owner. Create repo / Next.js app. Vercel project `app.empira.uz`. | Empty app deploys |
| **1** | Curriculum map + demo lab list | **C:** fill the content sheet for the 6 books (grades 6–11), incl. page ranges; pick 10–15 labs. **BE:** schema + import script. **FE:** tokens, TopBar, Home. **3D:** port the lab engine + 3 existing labs. | Sheet imported; Home matches the prototype |
| **2** | Lab equipment ready | **3D:** equipment library, first new labs. **FE:** class plan + topic pages on the API. **C:** explanations + formulas for lab topics. | Grade → chapter → topic works for 6–11 |
| **3** | Dashboard flow | **FE:** lab screen (stage, panel, next link), "Shu hafta" from the calendar, no-lab state. **3D:** more labs. | Flow 1 passes on real data |
| **4** | Scanning connected | **BE:** `/api/scan` with Gemini + page/title matching. **FE:** scanner screens on the real API. **C:** photograph 2–3 pages per lab topic as test images. | Flow 2 passes on real photos |
| **5** | Full demo works | **3D:** finish 10–15 labs. **FE/BE:** loading/error states, self-hosted fonts, performance. *(AI assistant only if decided.)* | All 4 flows pass |
| **6** | Internal testing | **QA:** Playwright at 6 sizes; real phones (Android + iPhone) and a school laptop; weak-Wi-Fi test; scanner accuracy test. Fix only big bugs (MVP plan: no new features after Day 6). | Zero CRITICAL issues |
| **7** | Real teacher demo | Run `TEACHER_DEMO_GUIDE.md` + `TEACHER_TEST.md` with 5–10 teachers | Feedback collected |

**Realism check:** 10–15 polished labs in one week is the riskiest item. Three already exist. If time runs short, ship fewer, polished labs, and mark the rest "Tez orada". The design already handles this honestly.

---

## 9. Definition of done (MVP plan §8)

- [ ] Grades 6–11 visible; every grade shows chapters + the annual topic list
- [ ] Topics linked to their 3D labs; 10–15 demo labs work without errors
- [ ] Scanning opens the matching topic/lab (at least 9/10 test pages)
- [ ] Works on phone and laptop (6 test sizes + real devices)
- [ ] No critical bugs during the demo; all 4 flows pass in CI
- [ ] *(If decided)* AI assistant gives useful explanations in the main labs

## 10. Main risks

| Risk | Mitigation |
|---|---|
| Scanning accuracy on real, angled, poorly lit photos | Page-number matching first; guidance text already in the UI; test with real photos from Day 4 |
| Weak school internet | Static pre-rendering, ≤1600 px uploads, self-hosted font, three.js bundled |
| Old school laptops / cheap phones and WebGL | Keep scenes low-poly (as in the prototype); test on a real school device on Day 6; the fallback message already exists |
| Content volume (6 books) | Sheet-based entry from Day 1; only lab topics need full explanations in Week 1 |
| Uzbek text matching (o‘ g‘ ’ variants) | Normalise apostrophes in import and scan matching |

## 11. Decisions needed on Day 0

1. Stack: the default in §2, or the team's own?
2. AI assistant: skip in Week 1 (A), or Week 2 with a design pass (B)?
3. Who owns content entry (Day 1–2), and who picks the 10–15 labs?
4. Production domain (e.g. `app.empira.uz`) and whether test.empira.uz stays as the design reference.
5. Unsure scan matches: "not found" for Week 1, or design the candidates screen?

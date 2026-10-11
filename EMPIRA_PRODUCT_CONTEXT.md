# Empira: Product Context (Week 1 MVP)

Prepared before any design work. Everything below is taken from the files in this folder. Where I'm interpreting rather than quoting, I say so.

## Sources inspected

| File | Contents |
|---|---|
| `mvp_plan.docx` | "EMPIRA: 1 haftalik MVP reja, maktablar uchun demo" (Uzbek). The main source of truth for scope. |
| `logo.zip` → `Empira Flask E/` | Logo exploration HTML (3 concepts: Flask E, Circuit E, Spark Mark), `EmpiraMark` component, `palette.txt`, and final SVG/PNG exports (symbol, full logo, app icon, favicon, one-color, dark/light) |
| `screenshoots.zip` | 6 screenshots: 2 from the existing app (lab catalog and Pendulum lab, in Uzbek) and 4 from the marketing website (hero, interactive Ohm's law demo, "How it works", "A personal report for every student", in English) |

The folder has **no** separate dashboard concepts, curriculum data, textbook scans, or website source files beyond these.

---

## 1. What Empira is

From the MVP plan: *a platform that turns the static pictures and experiments in textbooks into interactive 3D laboratories.*

- The teacher picks a topic from the **annual curriculum plan**. A student can open any topic or **scan a textbook page**.
- AI (Gemini API) helps generate the 3D lab equipment and gives the student explanations.
- Textbooks are **not** just uploaded as PDFs. For each experiment in each book, the team identifies the required tools, instruments and objects with their names and data. 3D lab objects are built from those, and each lab is linked to a **grade → chapter → topic**.
- The name comes from "empirical": learning through experiment (logo exploration file).
- Website tagline: **"Every textbook topic becomes a hands-on lab."**
- Physics is the launch subject. Long term (your note, plus the "Chemistry · Soon" and "Kimyo" placeholders in the screenshots), Empira is a **multi-subject** platform: Physics, Chemistry, Biology and more.
- Market: schools in **Uzbekistan**, with the interface in **Uzbek**.

## 2. Who the Week 1 MVP is for

- **Primary:** 5–10 school **teachers** who will see a live demo and test it. The plan states the goal is to show them clearly what Empira can do.
- **Secondary:** **students**. The plan describes Scanning Mode as "mainly for the student", and students interact with the 3D lab and AI assistant.
- The audience to convince is **schools**: teachers first, and through them, pilots with schools.
- Success test from the plan: the teacher says *"I'll use this in my lesson tomorrow."*

## 3. What problem it solves for schools

From the plan's "what we must prove to the school" table:

| Value | How Empira proves it | What the demo shows |
|---|---|---|
| **Saves time** | Teacher doesn't physically prepare lab equipment in advance | Pick a topic in the dashboard and the 3D lab opens immediately |
| **Saves budget** | No need to buy real equipment for every experiment | Several different labs on one device |
| **Makes lessons engaging** | Students take part in the experiment themselves | Interactive work with 3D objects |
| **Independent help for students** | AI explains the experiment and guides the student | Real Q&A with the AI assistant |
| **Works anywhere** | Access from phone or laptop | Same topic opened on mobile and laptop |

## 4. Main MVP functionality (the 3 parts)

1. **Physics Content** (internal, built by the team)
   Grades **6–11** physics topics and experiments are linked into the system. 10–15 of the best experiments are chosen for the demo.
2. **Curriculum Dashboard** (mainly for teachers)
   `Physics → Grade 6/7/8/9/10/11 → Chapter → Topic → 3D Lab`
   - The teacher sees the **full annual topic plan**.
   - Each topic shows **which week or section** it belongs to.
   - Inside a topic: **short explanation**, **related experiment(s)**, **interactive 3D lab**, **AI assistant**.
   - Quick switching between topics.
   - Must work well on **phone and laptop**.
   - The teacher never has to scan during a lesson. They open the topic straight from the dashboard.
3. **Scanning Mode** (mainly for students)
   Scan a textbook page or picture → Empira detects grade, chapter and topic → finds the matching experiment or lab → opens the 3D lab automatically → AI explains and guides during the experiment.

**Inside a 3D lab** (from the existing app screenshot; this is current product, not a plan requirement): a selected tool list, live parameter readouts (e.g. L, g, T), a slider control, a task card, a measurements table with "Record measurement" and "Check" buttons, camera controls (Top view / Camera / Reset), a 4-step progress bar (Tools → Experiment → Measure → Conclusion), and an AI chat panel.

## 5. Main user flows

**Flow A: Teacher opens a lab from the curriculum (core flow)**
1. Open Empira, then Physics.
2. Choose a grade (e.g. 8).
3. See the annual plan, with chapters and topics by week or section.
4. Open a topic to see the short explanation and related experiment(s).
5. Launch the 3D lab.
6. (Optional) The AI assistant explains the experiment.
7. Switch quickly to another topic.

**Flow B: Scan a textbook page (mainly students, also shown in the demo)**
1. Tap Scan, then point the camera at a textbook page or picture.
2. Empira identifies the grade, chapter and topic.
3. The matching 3D lab opens automatically.
4. The AI guides the student through the experiment.

**Flow C: The ideal 6-step teacher demo (from the plan)**
1. Choose Grade 8 Physics in the dashboard.
2. Open the needed topic from the annual plan.
3. Launch the linked 3D lab.
4. The AI explains the experiment.
5. Scan the same topic's page in the textbook.
6. Empira automatically finds and opens the same topic and lab.

## 6. Current brand identity

- **Name:** Empira (from "empirical": learning through experiment).
- **Positioning:** "Any textbook topic becomes a hands-on lab." The website also says "3D AI virtual lab for students and an AI assistant for teachers" and "AI-powered virtual labs for students and teachers in Uzbekistan".
- **Logo in use: "Flask E".** An Erlenmeyer flask cut into the letter E. The arms grow longer toward the bottom like graduation marks, and the base is filled with amber "liquid": the experiment in progress. The wordmark is "Empira" in Sora Bold, title case.
  - Exports available: symbol (light/dark/one-color ink/one-color white), full logo (light/dark/one-color), app icon (blue and light), favicon, PNGs at 16–1024 px.
  - On dark backgrounds the symbol uses Blue 300 (#8B96FF) instead of Empira Blue.
- **Brand idea:** each mark pairs "one electric primary with one amber 'result' moment". Amber means *the experiment worked / the result*.
- **Credibility:** the website states "1st place · National AI Hackathon 2026".

## 7. Brand colors

From `palette.txt` (the same values appear in the logo exploration):

| Name | Hex | Role |
|---|---|---|
| **Empira Blue** | `#3B4CFF` | Primary: buttons, links, active states, the logo |
| **Spark Amber** | `#FFB21E` | Accent: the "result" moment, highlights (use sparingly) |
| **Lab Ink** | `#0B1026` | Text and dark backgrounds |
| **Blue 300** | `#8B96FF` | Symbol on dark backgrounds |
| **Signal Coral** | `#FF6A4D` | **Alerts only** |
| **Paper** | `#F6F7FB` | Light backgrounds |

Also seen: `#EEF0F5` (exploration page background). The app screenshots use soft green tints for "on the table" / correct states, which are not in the official palette.

**Typography:** wordmark is **Sora Bold**, letter-spacing −0.02em (Google Fonts). No body or UI font is specified. The screenshots appear to use Sora (or something similar) for headings and a neutral sans for body text.

## 8. Existing visual style

Based on the 6 screenshots:

- **Light, airy, calm.** Off-white Paper backgrounds, white cards, very soft shadows, generous whitespace.
- **Rounded everything.** Large-radius cards (~16–20 px), pill-shaped chips and buttons, rounded app icon (radius 26 on 112).
- **Bold, tight headlines** (Sora-like, heavy weight, slight negative tracking) with grey body text.
- **Blue as the only strong UI color.** Primary buttons are solid blue, secondary buttons are white with an outline, and selected filter pills are solid Lab Ink.
- **Amber used sparingly:** status dots, the "Next:" highlight, the logo liquid, lit bulbs in 3D.
- **3D scenes:** clean white/grey lab tables on a grid, dark navy equipment with blue cables, glowing amber bulbs. Simple low-poly realism, not cartoonish.
- **Cards:** a 3D preview image on top with "3D · 8-sinf" pill tags, then title, a one-line description, metadata ("5 asbob · ~10 daqiqa"), and an "Ochish" (Open) button.
- **Lab screen:** three-column layout (tools and controls | 3D canvas | task, measurements and AI chat) with a stepper on top.
- **Marketing site:** the same palette, with one dark Lab Ink section for contrast, an italic serif accent phrase, and numbered "How it works" steps with small 3D-ish icons.
- **Language:** the product UI is in **Uzbek** (Latin script); the website is in **English**.

## 9. What absolutely must be included

These are the plan's "must be ready by end of Week 1" items, translated into what the design has to support:

1. **Grades 6–11** available in the dashboard.
2. Each grade shows its **chapters and the annual list of topics**, including **which week or section** each topic belongs to.
3. Topics are **linked to their 3D labs** and open in **one click** from the plan.
4. Inside a topic: **short explanation, related experiment(s), 3D lab, AI assistant**.
5. **Fast switching between topics.**
6. **Scanning Mode:** scan a page and land on the matching topic or lab.
7. **AI assistant** gives useful explanations in the main experiments (in Uzbek).
8. **Works on phone and laptop** (responsive, touch-friendly).
9. At least **10–15 demo experiments** that work without errors. The UI must make clear which topics have a working lab.
10. **Brand:** Flask E logo, the palette above, Sora wordmark.
11. Your design principles: **simple, minimal, friendly, usable by a first-time teacher without training.** The structure must also stay **subject-agnostic** so Chemistry, Biology and other subjects can slot in later without a redesign.

## 10. What should NOT be included

From the plan's "what we will NOT do this week", plus your instructions:

- **No admin panel, no billing or pricing, no complex statistics or analytics.**
- **No new features beyond the 3 MVP parts.**
- **No gamification.** The existing app shows a ★ "1 240" points counter in the header. That isn't in the plan and should be removed.
- **No "AI report on every student" or class analytics.** These are promoted on the website (Understanding / Hints used / Independence, "60% struggled with parallel circuits") but are **not** in the MVP plan.
- **No unnecessary dashboards**, e.g. teacher monitoring, student progress or leaderboards.
- **No AI teacher persona.** The plan supports an **AI assistant** that explains and guides inside an experiment. It does not support a standalone AI teacher. (See contradiction #1.)
- **No "AI recommendations"** badges (e.g. "AI tavsiyasi" in the current app). They aren't in the plan.
- **No polishing every lab equally**, and no delaying core flows for visual perfection (the plan says this explicitly).
- **No physics-specific hard-coding** in navigation or branding that would block other subjects later.

## 11. Contradictions and unclear points

1. **AI assistant vs. "no AI teacher".** The MVP plan explicitly requires an AI assistant (Gemini) that explains experiments and answers questions. It is part of the ideal demo and the Week 1 must-haves. However, the existing app labels it **"AI ustoz" (AI teacher)**, and the website says "AI tutor". **Recommendation:** keep it as a small, optional, contextual **helper inside the lab/topic**, called "AI yordamchi" (AI assistant), not "ustoz". *Needs your confirmation.*
2. **Logo: recommended vs. delivered.** The logo exploration **recommends 1b "Circuit E"**, partly because the flask "points to chemistry". But the exported asset folder, the app and the website all use **1a "Flask E"**. Since Empira is meant to be multi-subject, Flask E is arguably fine, but the files disagree. *I'll assume Flask E is final unless you say otherwise.*
3. **Wordmark case.** Flask E uses title case "Empira", while the recommended Circuit E used "EMPIRA" in caps. The plan document title also uses "EMPIRA". The product uses "Empira".
4. **Existing app structure vs. plan structure.** The current app is a **flat lab catalog** ("Fizika laboratoriyalari") with grade filters for **7, 8 and 9 only**. The plan requires a **curriculum hierarchy** (Grade 6–11 → Chapter → Topic, with week or section) as the main entry point. No dashboard concept for that hierarchy exists in the folder.
5. **Who scans?** The plan says Scanning is "mainly for students" and that teachers don't have to scan, yet the teacher demo includes scanning (step 5). It's unclear whether scanning belongs in the teacher's main UI or is a secondary entry point.
6. **Who is the user: teacher, student, or both?** You said the MVP is mainly for teachers. The plan also gives students their own entry points (open any topic, scan). The existing lab screen is written to the student ("put the tools on the table"). It's unclear whether Week 1 needs separate teacher and student modes, or one shared interface. There's no evidence of accounts or roles in the plan.
7. **Lab complexity vs. "understandable without training".** The current lab screen is dense: 3 columns, a 4-step stepper, a tool-picking exercise with a deliberate distractor tool (Ammeter "Ortiqcha"), a measurements table, a check button, camera controls and AI chat. This works for a guided student task, but may overwhelm a first-time teacher who just wants to project the lab in class.
8. **Website vs. plan scope.** The website promises things the MVP doesn't include: AI per-student reports, class summaries, "teachers see every step", a Pricing page, and "AI builds the 3D experiment in seconds". In the plan, the 10–15 demo labs are **prepared in advance by the team** (with Gemini's help), not generated live.
9. **Physics-only plan vs. multi-subject vision.** The plan is entirely physics ("Physics Content", "fizika darslari"). Long-term multi-subject support comes only from your note and the "Kimyo" / "Chemistry · Soon" placeholders. It's unclear whether "coming soon" subjects should be visible in the MVP or hidden.
10. **Language.** The app is in Uzbek and the website in English. The plan is in Uzbek and says the AI speaks Uzbek. It's unclear whether Russian, or Cyrillic Uzbek, is needed for schools.
11. **Header extras in the current app:** a "Demo" badge, an "empira.uz" link, a dark-mode toggle, a user avatar "A", and a floating "DK" AI bubble. None of these are in the plan. Dark mode and avatar or login need a decision. The "DK" bubble's meaning is unknown.
12. **"Week" ambiguity.** The plan uses "week" both for the 7-day build plan and for the curriculum (which school week a topic falls in). The dashboard needs the curriculum meaning. The actual week-by-topic data for grades 6–11 isn't in the folder.
13. **Topic content.** "Short explanation" and "related experiment(s)" per topic are required, but there's no sample content, length guidance, or list of the 10–15 chosen demo experiments. The screenshots show 6: Ohm's law, Parallel circuits, Light refraction, Hooke's law, Pendulum, and a Chemistry acids/bases placeholder.
14. **Non-demo topics.** Grades 6–11 will contain many topics without a working lab in Week 1. How those topics should look and behave (disabled, "coming soon", explanation only) isn't defined.
15. **Typography.** Only the wordmark font (Sora Bold) is specified. The body or UI font is undefined.
16. **Green success color.** The app uses green for "on the table" and correct states, but green isn't in the official palette.

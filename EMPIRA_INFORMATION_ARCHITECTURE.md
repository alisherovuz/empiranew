# Empira: Information Architecture (Week 1 MVP)

Source of truth: `EMPIRA_PRODUCT_CONTEXT.md`. This document covers structure only, with no visual design. UI labels are given in Uzbek with English in brackets. Final wording can be adjusted in the visual phase.

---

## 0. Guiding decisions

1. **Class comes first; subject is a property of the class, not a destination.** Subjects never appear in the main navigation. They appear only as a switcher inside a class. Adding Chemistry or Biology later just adds a switcher option and changes no navigation.
2. **Classes live in exactly one place: Home.** To change class, the teacher goes back to Home. There's no second class menu, no grade filter pills and no class dropdown.
3. **Chapter and topic are shown on the same screen** as one annual plan. The chapter is a heading, not a separate page, so it costs no click.
4. **No menus, sidebars, accounts or settings.** The only persistent controls are the logo (Home), the Scan button and Back.
5. **AI is an assistant inside the laboratory** ("AI yordamchi"). It is not a teacher, a page or a floating global bubble.

### Action count (Flow A)

| # | Meaningful action | Screen |
|---|---|---|
| 1 | Tap **class** (e.g. 8-sinf) | Home |
| (0) | Subject is pre-selected (in Week 1, Physics is the only subject with content). Picking a subject costs 1 tap only when a class has more than one. | Class Plan |
| 2 | Tap **topic** (the chapter is visible as a heading, no tap needed) | Class Plan |
| 3 | Tap **"Laboratoriyani ochish"** (Open laboratory) | Topic |

**Flow A: 3 actions** (4 once a class has several subjects).
**Flow B: 2 actions** (tap Scan, take the photo); the lab then opens automatically.

---

## 1. Main navigation

There's no navigation menu. A minimal top bar is the same on every screen:

| Position | Element | Behaviour |
|---|---|---|
| Left | **Back** (hidden on Home) | Goes one level up the hierarchy, not browser history |
| Left | **Empira logo** | Always returns to Home |
| Centre / left | **Breadcrumb** (from the Class Plan screen down) | e.g. `8-sinf · Fizika › 3-bob › Om qonuni`. Each part is tappable. On mobile it collapses to the current screen's name only. |
| Right | **Skanerlash** (Scan) button | Opens Scan from anywhere |

That's all. The top bar has no login, avatar, points, dark-mode toggle, "Demo" badge or external links.

---

## 2. Screen hierarchy

```
Home
├── Class Plan (one per class; subject switcher inside)
│   └── Topic
│       └── 3D Laboratory
│           └── AI yordamchi (panel inside the lab)
└── Scan
    ├── Scanning… (processing state)
    ├── → Laboratory or Topic (confident match)
    └── Scan Result (unsure match / not found)
```

Data model behind it (subject-agnostic):
`Class → Subject → Chapter → Topic → Experiment(s) → 3D Lab`

URLs, so a teacher can bookmark a page or open it on the classroom screen:
- `/` Home
- `/8-sinf/fizika`: Class Plan
- `/8-sinf/fizika/om-qonuni`: Topic
- `/8-sinf/fizika/om-qonuni/lab`: Laboratory (`/lab/2` if a topic has several experiments)
- `/skaner`: Scan

---

## 3. Exact screens required for the MVP

There are **5 screens** plus their states. Nothing else is built in Week 1.

### S1. Home (Bosh sahifa)
Purpose: start Flow A or Flow B. Nothing else.

Contents, top to bottom:
1. Top bar (logo + Scan button).
2. One short line of text, e.g. *"Sinfni tanlang yoki darslik sahifasini skanerlang"* (Choose a class or scan a textbook page).
3. **Class grid: 6, 7, 8, 9, 10, 11-sinf.** Six large tappable tiles. This is the **only** place classes appear.
4. **Scan card:** one large secondary action, "Darslik sahifasini skanerlash" (Scan a textbook page), with a one-line hint.
5. *(Optional, recommended)* **"Davom ettirish"** (Continue): the last topic opened on this device, as a single row. It's stored on the device only, with no account. It's hidden on first visit.

Not on Home: subject list, lab catalogue, statistics, news, recommendations.

### S2. Class Plan (Sinf rejasi, e.g. "8-sinf · Fizika")
Purpose: the annual plan for one class and subject. Chapter and topic selection both happen here.

Contents:
1. Top bar + breadcrumb `8-sinf · Fizika`.
2. **Subject switcher:** a simple segmented control listing **only subjects that have content for this class**. In Week 1 this is **Fizika** only, shown already selected. It's built so that Kimyo, Biologiya and others appear automatically when their content exists. Subjects without content aren't shown (see Open question 2).
3. **Annual plan:** a single scrolling list.
   - **Chapter heading** (e.g. "3-bob. Elektr toki"), with a sticky header while scrolling.
   - Under each chapter, **topic rows**, each showing:
     - week (e.g. "12-hafta") or section number
     - topic title
     - a **"3D lab"** marker if the topic has a working laboratory
   - Topics without a lab are listed (so the plan is complete) but shown muted and are **not tappable** (label: "Tez orada", Coming soon).
4. *(Mobile/long lists)* A compact **chapter jump** (list of chapter names) at the top that scrolls to the chosen chapter. This only scrolls; it isn't a new page.

Action: tap a topic row → S3.

### S3. Topic (Mavzu)
Purpose: a quick briefing for the teacher, and the launch point for the lab. It's one screen that the teacher reads in seconds.

Contents:
1. Top bar + breadcrumb `8-sinf · Fizika › 3-bob › Om qonuni`.
2. **Topic title** + chapter and week.
3. **Qisqacha tushuntirish** (Short explanation): a few sentences, from the plan.
4. **Tajriba(lar)** (Experiments): one card per linked experiment, each with:
   - preview image
   - name
   - one-line goal
   - approximate duration
   - **primary button "Laboratoriyani ochish"** (Open laboratory)

   Most topics have one experiment, so there's one card and one obvious button.
5. **Previous / Next topic** links at the bottom, for fast switching within the plan (required by the plan).

Action: "Laboratoriyani ochish" → S4.

### S4. 3D Laboratory (Laboratoriya)
Purpose: run the experiment, in class on a projector, on a laptop or on a phone.

Contents:
1. **Compact top bar:** Back (to Topic), topic title, Previous/Next topic, Scan button. On mobile the top bar can be hidden for full screen.
2. **3D scene:** the dominant area.
3. **Task:** one short sentence describing what to do or observe (e.g. "Qarshilik 2 marta oshsa, tok qanday o'zgaradi?", If resistance doubles, how does current change?).
4. **Controls:** only the 1–3 parameters that matter for this experiment (sliders or toggles), with live values next to them.
5. **View controls:** Reset (Qayta), plus top view and rotate if needed. Keep this to 2–3 buttons.
6. **AI yordamchi** (AI assistant): a panel that is **closed by default**, opened from one clearly labelled button. It contains:
   - a short explanation of the experiment
   - a few suggested questions
   - free-text questions in Uzbek
   - a "Maslahat" (Hint) button

   On desktop it's a side panel; on mobile it's a bottom sheet.
7. **Measurements** (optional, only for experiments that genuinely need them): a small "O'lchovlar" (Measurements) table that can be opened. It's not shown by default.

Not in the lab: points, AI recommendations, step-by-step gamified stepper, a tool-picking puzzle with a decoy tool, or teacher/student report saving (see section 5).

### S5. Scan (Skanerlash)
Purpose: go from a textbook page to the right lab with no browsing.

Contents:
1. Top bar (Back / logo).
2. **Camera view** with a page-shaped frame and the hint "Sahifani ramkaga joylang" (Place the page inside the frame).
3. **Capture button** (large).
4. **"Rasm yuklash"** (Upload a photo): needed on laptops, which usually have no rear camera.
5. **Processing state:** "Sahifa aniqlanmoqda…" (Identifying page…).

Then:
- **Confident match:** go **directly** to S4 (Laboratory) if the topic has exactly one lab, otherwise to S3 (Topic). A small banner at the top reads *"Skaner natijasi: 8-sinf · Fizika › 3-bob › Om qonuni"* with a link *"Boshqa mavzu?"* (Different topic?). The breadcrumb is filled in, so the teacher is now inside the normal hierarchy.
- **Unsure match** → **S5b. Scan Result:** up to 3 candidate topics (class · subject › chapter › topic), each tappable, plus "Qayta skanerlash" (Scan again).
- **No match** → **S5b** shows "Mavzu topilmadi" (Topic not found), with "Qayta skanerlash" and "Sinf bo'yicha tanlash" (Choose by class → Home).
- **Matched topic has no lab yet:** open S3 Topic. The experiment area says "Laboratoriya tez orada" (Laboratory coming soon).

### Required states (they're parts of the screens above, not new screens)
- Loading (lab or scan)
- Camera permission denied → offer "Rasm yuklash"
- No internet / lab failed to load → "Qayta urinish" (Try again) + Back
- Topic without a lab (muted in S2, "coming soon" in S3)

---

## 4. User flows between screens

### Flow A: curriculum (teacher, main flow)
```
S1 Home
  └─ tap "8-sinf" ─────────────► S2 Class Plan (8-sinf · Fizika, subject pre-selected)
        └─ tap topic "Om qonuni" ► S3 Topic
              └─ "Laboratoriyani ochish" ► S4 Laboratory
                    ├─ "AI yordamchi" → panel opens (same screen)
                    ├─ Next / Previous topic → S3 of that topic
                    └─ Back → S3 → S2 → S1
```

### Flow B: scan
```
S1 Home (or the Scan button on any screen)
  └─ "Skanerlash" ─► S5 Scan → capture / upload → processing
        ├─ confident, 1 lab ──► S4 Laboratory (with scan banner)
        ├─ confident, 2+ labs ► S3 Topic (with scan banner)
        ├─ unsure ────────────► S5b candidates → tap one → S3 / S4
        └─ not found ─────────► S5b → scan again  |  Home
```

### The ideal 6-step teacher demo, mapped to these screens
1. Home → 8-sinf (S1 → S2)
2. Open the topic from the annual plan (S2 → S3)
3. Launch the lab (S3 → S4)
4. AI explains (S4, assistant panel)
5. Tap Scan, then scan the same topic's textbook page (S4 → S5)
6. The same lab opens automatically (S5 → S4)

### Movement rules
- **Back** always goes up one level: Lab → Topic → Class Plan → Home.
- **Logo** always goes to Home.
- **Scan** is reachable from every screen.
- **Changing class** = Home only.
- **Changing subject** = switcher on Class Plan only.
- **Changing topic** = Prev/Next (S3/S4) or back to Class Plan.

---

## 5. What should be removed (compared with the existing app)

| Existing element | Decision | Reason |
|---|---|---|
| Flat lab catalogue "Fizika laboratoriyalari" as the start page | **Remove.** Replaced by Home → Class Plan. | Plan requires the curriculum hierarchy |
| Grade filter pills (Barchasi / 7 / 8 / 9-sinf) | **Remove** | Classes live only on Home; the pills also missed 6, 10 and 11 |
| ★ points counter ("1 240") | **Remove** | Gamification is out of scope |
| User avatar / login | **Remove** | No accounts in Week 1 |
| Dark-mode toggle | **Remove** | Not needed; fewer controls |
| "Demo" badge, "empira.uz" link in top bar | **Remove** | Noise for teachers |
| Floating "DK" AI bubble | **Remove** | AI lives inside the lab only |
| "AI tavsiyasi" (AI recommendation) badges | **Remove** | Not in plan |
| "AI ustoz" (AI teacher) naming | **Rename** to "AI yordamchi" | Assistant, not teacher |
| Chemistry "Kimyo" placeholder card | **Remove** | Subjects appear only when they have content |
| Lab: "AI tanlagan asboblar" tool-picking step with decoy tool | **Remove from default flow** | Adds a puzzle before the experiment starts. Equipment is just already on the table. |
| Lab: 4-step stepper (Asboblar → Tajriba → O'lchash → Xulosa) | **Remove** | Too much structure for a first-time teacher |
| Lab: always-visible measurements table + "Tekshirish" | **Make optional / collapsed** | Only for labs that need it |
| Lab: always-open AI chat column | **Collapse by default** | Gives the 3D scene the space |
| Website-only ideas: student AI reports, class summary, "every step saved to teacher's report", pricing | **Do not build** | Not in the MVP plan |

---

## 6. Expandability

- A new subject = new content under existing classes. It appears in the S2 subject switcher automatically. Home, navigation and the remaining screens don't change.
- Subjects that cover different classes (e.g. Chemistry from grade 7) work naturally: the switcher shows only the subjects a class actually has.
- Scan is subject-agnostic. It returns class · subject › chapter › topic, so it works for any future subject.
- If classes beyond 6–11 are added later, they're just more tiles on Home.

---

## 7. Open questions (need your decision before visual design)

1. **Topics without a lab:** listed but muted (my recommendation, shows the full plan), or hidden entirely? Hiding them makes the 10–15 demo labs easier to find but makes the plan look incomplete.
2. **Future subjects:** hidden until they have content (my recommendation), or shown as disabled "Tez orada" in the switcher?
3. **"Davom ettirish" (Continue) on Home:** keep it (device-only, no account) or leave it out for maximum simplicity?
4. **Scan, confident match:** jump straight into the lab (matches the plan's "opens automatically"), or always stop on the Topic page first?
5. **AI assistant** only inside the lab (my recommendation), or also on the Topic page?

---

## 8. Sitemap

```
Empira
│
├── Home (/)
│   ├── Classes: 6 · 7 · 8 · 9 · 10 · 11-sinf
│   ├── Scan a textbook page
│   └── Continue (last topic, optional)
│
├── Class Plan (/{class}/{subject})
│   ├── Subject switcher (Fizika; more subjects later)
│   └── Annual plan
│       └── Chapter (heading)
│           └── Topic (week · title · 3D lab marker)
│
├── Topic (/{class}/{subject}/{topic})
│   ├── Short explanation
│   ├── Experiment card(s) → Open laboratory
│   └── Previous / Next topic
│
├── 3D Laboratory (/{class}/{subject}/{topic}/lab)
│   ├── 3D scene + task + controls
│   ├── AI yordamchi (panel, closed by default)
│   ├── Measurements (optional, collapsed)
│   └── Previous / Next topic
│
└── Scan (/skaner)
    ├── Camera / Upload photo
    ├── Processing
    ├── Confident match → Laboratory or Topic
    └── Scan Result: candidates / not found
```

# Empira — next build plan

**Status: Stage 1 audit complete; implementation awaits approval.**

Audited on 12 October 2026: `alisherovuz/empiratest`, branch `main`, commit `d3d43b223ed46ebe6be1f3ea810c5493de46a396`.

This plan improves the existing MVP. The current user request controls scope; repository documents and archived designs are historical context, not authorization to rebuild the product. In particular, the older `EMPIRA_BUILD_PLAN.md` proposal for a new application stack, database, and broader content rollout is not this plan.

Only this document is added to the checkout in Stage 1. No application code, curriculum, brand assets, backend, or deployment configuration has been changed. Audit scripts, results, and baseline screenshots are outside the checkout at `/workspace/empira-audit/`. No commits, pushes, or deployments were made.

## 1. Current project and source of truth

This is a working static HTML/CSS/JavaScript application plus one Vercel scanning function. It is not a React/Next.js application. There is no package manifest, dependency installation, build pipeline, committed automated test suite, database, authentication system, or role-management layer to extend.

| Current path | Responsibility and audit finding |
|---|---|
| `design-prototype/home/index.html`, `styles.css` | Approved Home: grade tiles, scanner entry, URL-controlled demonstration states. |
| `design-prototype/class-plan/data.js` | Complete 8-sinf Physics curriculum: five chapters, 60 sections, textbook page starts, approximate weeks, availability flags. Used by both frontend and scanner backend. |
| `design-prototype/class-plan/app.js`, `index.html`, `styles.css` | Chapter accordion, all topic rows, “Shu hafta,” grade empty states, chapter hash links. |
| `design-prototype/topic/content.js` | Explanations, formulas, questions, duration and lab IDs for 42 topics. One topic has two labs. |
| `design-prototype/topic/app.js`, `index.html`, `styles.css` | Topic resolution, lab cards, previous/next topics, no-lab state, mobile sticky action. |
| `design-prototype/scan/app.js`, `index.html`, `styles.css` | Camera/upload/drop, photo resizing, processing/result/error states, live request, presenter and forced-result modes. |
| `api/scan.js` | Existing Gemini vision integration; requires `GEMINI_API_KEY`, optionally `GEMINI_MODEL`. |
| `api/_lib/curriculum.js` | Loads the same curriculum/content through Node `vm`; matches section number, page range, or heading. |
| `design-prototype/lab/app.js` | Shared ready-lab engine: routing, controls, measurement history, step completion, animation loop, renderer, camera, loading/fallback, next topic. |
| `design-prototype/lab/kit.js` | Procedural Three.js equipment, materials, terminals, labels, board/table, blue wire geometry, instrument updates. |
| `design-prototype/lab/labs-8.js` | Ten practical/lab-work definitions, including the reference `om-qonuni`. |
| `design-prototype/lab/labs-8b.js` | Thirteen electricity/energy demonstrations. |
| `design-prototype/lab/labs-8c.js` | Seven magnetism demonstrations. |
| `design-prototype/lab/labs-8d.js` | Five electrostatics demonstrations. |
| `design-prototype/lab/labs-8e.js` | Eight demonstrations of current in different media. |
| `design-prototype/lab/index.html`, `styles.css` | Existing lab shell, script load order, responsive scene/panel arrangement. |
| `design-prototype/lab/vendor/` | Local Three.js 0.170.0 + OrbitControls bundle and MIT license. No CDN or 3D asset service required. |
| `brand/logo-flask-e/`, page `assets/` folders | Approved Flask E identity, SVGs, PNGs, palette. |
| `HOME_DESIGN_RULES.md`, `EMPIRA_DESIGN_SYSTEM.md` | Existing visual rules; Home rules take precedence where they differ. |
| Screen specifications, teacher guides, IA/product/build documents | Helpful context, but mixed generations. Some passages still describe three old labs or simulated-only scanning. |
| `design-prototype/_archive-7sinf/` | Historical Newton/Hooke/Ohm implementations; not loaded by the current five screens. |
| Screen `screenshots/`, `_simplicity-pass/`, ZIPs, `mvp_plan.docx` | Historical reference material. ZIP inventories and DOCX text were inspected; no archive was installed over the current application. |
| `vercel.json` | Root redirect to Home and scanner function packaging. |

The active source was inspected across all five screens, all five lab-definition files, the full equipment kit, both API files, and the routing/data dependencies. The vendor bundle is an existing third-party dependency, not a proposed edit target. There is no `AGENTS.md` in the discovered workspace checkouts.

## 2. What already works

### Curriculum and topics

| Chapter | All topics retained in data | Topics with available labs | Ready labs |
|---|---:|---:|---:|
| I — Elektr zaryad. Elektr maydon | 8 | 6 | 6 |
| II — Elektr toki | 21 | 15 | 16 |
| III — Elektr tokining ishi va quvvati | 10 | 4 | 4 |
| IV — Turli muhitlarda elektr toki | 9 | 8 | 8 |
| V — Magnit maydon | 12 | 9 | 9 |
| **Total** | **60** | **42** | **43** |

All 42 availability flags agree with topic content and registered lab definitions. All five chapters currently contain a usable lab. Section 24 contains both `ketma-ket-ulash` and `parallel-ulash`, so “topics with labs” and “number of labs” differ.

Manual entry works: Home → 8-sinf → curriculum → Topic → ready laboratory. The topic descriptions/formulas and laboratory titles/questions come from shared data. Chapters expand/collapse, “open all” works, and `#bob-5` opens the requested chapter. Other grades explicitly show an empty state.

### Ready laboratories and existing 3D infrastructure

All **43 registered labs rendered and completed a default run** in the audit browser. They are interactive, formula-driven demonstrations: changing parameters affects calculated measurements and animated instruments. They are not arbitrary physical circuit solvers.

The ready-lab engine already provides a dominant 3D workspace, OrbitControls, responsive camera framing, reset view, loading/error states, instrument readouts, range/choice controls, measurements, and steps derived from recorded runs. Runtime measurements are held in memory; they reset on reload.

`kit.js` creates actual Three.js objects rather than using static preview images. Relevant reusable functions include `powerSupply`, `resistor`, `meter`, `switchK`, `lamp`, `rheostat`, `wire`, `clearWires`, `table`, and `board`. Equipment returns `group` objects and world-position terminal getters such as `a`, `b`, `plus`, and `minus`. These are useful foundations for movement and wiring.

The misleadingly named existing `L.build(kit)` constructs the entire predefined scene at load time. **It is not student Build Mode.** There is no current tool-selection library, object-placement controller, terminal hit-testing, editable circuit graph, or student connection validator. Changing an “ammeter position” radio button in some existing labs chooses predefined layouts; it is not manual circuit assembly.

### Om qonuni reference experiment

Use section **19**, topic slug **`laboratoriya-ishi-om-qonunini-organish`**, lab ID **`om-qonuni`**. Section 17 is a different existing lab, `tok-va-qarshilik`, and must not be conflated with it.

The existing scene has an adjustable power supply, switch, milliammeter, 200 Ω resistor, and voltmeter. The current measurements were verified:

| Supply | Current | Calculated resistance |
|---:|---:|---:|
| 4 V | 20 mA | 200 Ω |
| 6 V | 30 mA | 200 Ω |
| 8 V | 40 mA | 200 Ω |
| 10 V | 50 mA | 200 Ω |

After these four voltages, all three current steps complete and the average resistance appears. Preserve this behavior and its existing ready-lab URL.

### Scanner: real implementation versus demonstrated behavior

- Camera capture, image upload, drag/drop, conversion to JPEG up to 1600 px, and the `/api/scan` request are implemented.
- The backend contains an actual Gemini request and deterministic curriculum matching. It is not merely a timer pretending to recognize a page.
- On HTTP **or** HTTPS, normal scanning attempts the API. A plain Python static server does not execute the Vercel function.
- `file://`, a selected presenter result, explicit `?mavzu=...`, forced `?holat=...`, and `?natija=yoq` support simulated/documentation behavior. Presenter settings live in `sessionStorage`.
- Current result routing: one lab → directly to Lab; multiple labs → Topic; no lab → Topic with unavailable content. The single-lab branch must change for the requested mode choice.
- The local machine has no `GEMINI_API_KEY`. Live photo recognition and deployed-service availability were **not verified**, and no paid API call was made. Local matcher checks and intercepted API responses are explicitly not recognition-accuracy evidence.

### Remaining mock/prototype behavior

- Only 8-sinf has a curriculum. Home’s 6–11 tiles do not mean those grades have implemented content.
- Weeks are approximate; “Shu hafta” is a fixed demo setting, overridable with `?hafta=N`, not calendar integration.
- Home’s “Davom ettirish” is shown only by `?davom=1`; it is not persisted learning progress.
- `?holat=tugadi` injects each lab’s demonstration measurements. The audit’s default-run checks did not use this shortcut.
- Physics is an educational approximation. Formula and rendering checks are not a teacher’s scientific sign-off on every demonstration.
- There is no current AI chat, teacher configuration UI, LMS, analytics, or gamification to integrate.

## 3. What remains untouched

1. Flask E logo, Sora typography, approved palette, existing layout language, radii, spacing, navigation chrome, and Home design.
2. All 60 curriculum records, section/page/week metadata, titles and canonical topic slugs. Filtering must never change the scanner’s page-range source.
3. All 43 ready-lab definitions, their physics, default equipment layouts, measurement tables, controls, and existing direct URLs.
4. Existing Three.js bundle and equipment appearance. Prefer adapters around the current kit; avoid changing its public contracts.
5. Scanner camera/upload/resizing/presenter/error behavior. Change only the result’s route/copy needed to reach the common Topic choice.
6. Backend recognition, API contract, Gemini model, deployment, archives, brand exports, unrelated screens, and the historical documents.
7. Other labs’ construction behavior: only Om qonuni receives a functioning Build Mode in this milestone.

No framework migration, database, paid dependency, new API, accounts, extra dashboard, teacher rule editor, global equipment catalogue, or unrelated refactoring is needed.

## 4. Changes proposed

### A. Filter presentation, retain the curriculum

For the primary list, derive available topics from the existing `lab` flag **and** a nonempty matching `EMPIRA_TOPICS[slug].labs`. A small shared presentation helper can apply the same rule to chapter rows and the current-week row. A regression check must ensure every referenced lab has a registered implementation; listing availability must not be inferred from a title or arbitrary URL fallback.

Do not load the Three.js renderer on the curriculum page. Import only the already-existing lightweight topic content if needed by the predicate. Keep the original plan objects unmodified.

Preserve chapter numbering/order and original week metadata; omit chapters whose derived topic list is empty. Count real lab entries accurately, including section 24’s second lab. If a selected week has no available topic, hide the “Shu hafta” shortcut rather than silently labelling another week as current.

**Stage 2 boundary:** change the curriculum list and its current-week shortcut only. Existing direct links, Topic previous/next navigation, and Lab next-topic navigation still use the full curriculum at that checkpoint. Report that limitation. In Stage 3, make those navigational suggestions use the same available-topic view while retaining the full array for resolving direct/scanned topics. This avoids changing more than curriculum filtering in Stage 2.

### B. One Topic choice shared by manual entry and scanning

Retain the existing Topic page and lab cards. Each lab card exposes:

- Primary: **“Tayyor laboratoriyani ochish”** → current `../lab/index.html?lab=<id>`.
- Secondary: **“Laboratoriyani o‘zingiz quring”** → the construction route for a supported experiment.

Scanner results always lead to `../topic/index.html?mavzu=<canonical-topic-slug>`, using the existing topic ID. The result screen remains the same camera/result experience; its action becomes “Mavzuni ochish” or equivalent concise Topic-entry copy. There is no scanner-specific experiment or second configuration.

Preserve both section-24 lab cards; never silently pick one of its two experiments. Keep the mobile sticky Ready Lab shortcut clearly labelled as such, with the mode choices in the normal Topic flow. Long new labels may wrap within the existing buttons; use scoped CSS rather than shrinking text or changing the global button system.

**Availability decision proposed for approval:** both modes are represented in the Topic UI, but Build is only actionable when a real build configuration is enabled. For the other labs, show the secondary option as unavailable with one short explanation that construction is currently available for Om qonuni only. No large “Tez orada” lists, broken links, or fake builders. During the Stage 3 checkpoint, Om’s Build action also remains unavailable until Stage 4 supplies the workspace. This intermediate state is reported honestly, not presented as the completed milestone.

### C. A modular Build Mode inside the existing product

Recommended route: `design-prototype/lab/build/index.html?lab=om-qonuni`. It is another mode of the same lab, with the same topic/lab IDs, data, kit, and visual language. An additive entry document avoids putting construction state and pointer handling into the engine used by all 43 ready labs.

Use plain JavaScript with the repository’s existing script/global conventions, local Three.js, and the existing kit. No new bundler, physics package, state library, or asset service. Keep compatibility with the existing static-serving workflow and local-file use where supported.

Only three conceptual areas:

1. **Vazifa:** “Tok kuchi va kuchlanishni o‘lchash mumkin bo‘lgan elektr zanjirini yig‘ing.” Keep it short and visible before interaction.
2. **Ish maydoni:** empty equipment board/table at first; the student constructs the circuit. Existing table, lighting, object style, camera, and reset-view conventions remain familiar.
3. **Asboblar:** an experiment-selected library of eight entries. Desktop uses the existing lab’s scene-dominant frame and a compact secondary area. Mobile shows the task, usable canvas, then a visible tool grid in normal document flow; no hidden drawer or extra navigation.

Proposed Om library, using current assets:

| Tool entry | Role | Existing factory |
|---|---|---|
| Tok manbai, 4–10 V | Required adjustable source, matching the current experiment | `powerSupply` |
| Rezistor, 200 Ω | Required load | `resistor` |
| Milliampermetr | Required series current measurement; explicitly labelled in mA | `meter(..., 'mA')` |
| Voltmetr | Required parallel voltage measurement | `meter(..., 'V')` |
| Kalit | Required switch | `switchK` |
| Ulash simi | Reusable connection action; not one fixed physical wire | `wire` |
| Lampochka | Relevant distractor; not part of the target 200 Ω circuit | `lamp` |
| Reostat | Relevant distractor; not part of this fixed-resistance task | `rheostat` |

Do not add a battery asset just to match an example: the current adjustable source supports the verified 4/6/8/10 V workflow. The tool count is eight library choices, not eight required objects or a six-wire inventory restriction.

### D. Small reusable data and interaction model

Keep author-written experiment data separate from the generic UI. A compact shape is sufficient:

```js
experiment = {
  id: 'om-qonuni',
  topicId: 'laboratoriya-ishi-om-qonunini-organish',
  enabled: true, // only when that stage actually works
  task: 'Tok kuchi va kuchlanishni o‘lchash mumkin bo‘lgan elektr zanjirini yig‘ing.',
  tools: [/* tool IDs, role: required/distractor, quantity limits */],
  requiredSteps: [/* required equipment, series path, parallel voltmeter */],
  rules: [/* named rule types + parameters; no expression language */],
  completionCondition: 'all-required-rules',
  messages: {/* concise Uzbek hints and feedback */}
};

tool = {
  id, name, icon,
  factory, // adapter to an existing kit function, not a remote asset URL
  interaction, // placeable equipment or wire action
  terminals: [/* stable ID, label, world-position getter */]
};

buildState = {
  experimentId,
  objects: [/* instance ID, tool ID, board position */],
  connections: [/* from: instance+terminal, to: instance+terminal */],
  selectedObjectId,
  pendingTerminal,
  phase // building | ready | measuring
};
```

The actual implementation can combine small files where that improves clarity. Do not create a plugin system, generic rule language, schema database, curriculum migration, or generalized circuit simulator.

Interaction decisions:

- Tap/click a library item and tap/click a board location to place it. Support direct dragging of placed equipment; tap-select then tap-destination is the touch alternative.
- Keep movement constrained to the tabletop. Use simple bounds/overlap handling so equipment stays reachable; arbitrary 3D rotation and stacking are unnecessary.
- Wire by selecting two labelled terminals. Use enlarged invisible hit targets and clear pending-selection feedback; do not require precision cable dragging on phones.
- Provide a visible way to cancel a pending wire and remove a selected connection/tool. Removing equipment also removes its incident wires. Support keyboard selection/cancellation/removal and accessible equivalents for placement/terminal selection.
- Orbit/pinch remains camera interaction; suspend OrbitControls while an object or terminal gesture owns the pointer. Handle pointer cancellation and orientation changes.
- Keep graph state independent of Three.js coordinates. Moving an object redraws its connected wire endpoints without changing circuit validity.
- Reuse the existing `wire()` material/appearance. It creates static tube geometry, so movement requires endpoint refresh and disposal of replaced geometry. Do not assume wires follow objects automatically.
- The kit owns label and wire collections per scene. Use one kit instance per Build scene, cleanly manage removed/reused objects, and dispose scene resources/listeners on exit. Avoid a broad shared-kit rewrite to solve Build-only lifecycle needs.

### E. Meaningful validation and feedback

Use deterministic local checks over the connection graph. A complete target circuit has one source, switch, milliammeter and 200 Ω resistor in the conducting series loop, and a voltmeter across the resistor. Test topology, not the objects’ screen positions or a single memorized construction order. Equivalent valid ordering in the series loop should pass.

Evaluate committed actions: tool placement/removal, connection add/remove, and explicit measurement/start attempts. Pointer motion, camera orbit, zoom and harmless selection must not trigger correctness popups.

Differentiate **incomplete** from **incorrect**. A half-built circuit is normally incomplete and should remain quiet. Reject malformed connections (same terminal, missing endpoint), prevent duplicates, identify shorts/bypasses and incorrect meter relationships when there is enough graph information, and give a short actionable explanation. A voltmeter must not form the conducting series path; the milliammeter must not shunt the resistor or source. Validate required polarity consistently with the existing meter terminals.

- Error: existing Coral indicator and border/highlight, one brief pulse or small shake, “Noto‘g‘ri ulanish” and a specific sentence such as “Ampermetr zanjirga ketma-ket ulanishi kerak.”
- Success: checkmark, Ink text with a subtle existing-blue outline pulse, “To‘g‘ri!” Only acknowledge a meaningful new valid relationship or completed logical step.
- A single stable feedback region with polite live announcements; no modal, focus stealing, stacked toast stream, sound, confetti, green status system, score or reward loop.
- Deduplicate repeated messages. Cancel obsolete feedback when state changes. Removing a required wire must revoke readiness immediately; reconnecting correctly must recover.
- The requested action feedback is a narrow extension to the old motion guidance. Keep it brief (roughly 150–250 ms) and disable motion under `prefers-reduced-motion`, retaining icon and text.

### F. Completion and continuing the experiment

When all requirements are met, show **“Laboratoriya tayyor!”** and **“O‘lchashni boshlash”**. Keep the student’s assembled layout visible. Do not secretly redirect to the prebuilt scene and discard their work.

After completion, a small Om measurement adapter can consume the existing `EMPIRA_LABS['om-qonuni']` controls/compute/readout/row definitions without invoking its prebuilt `build()` function. This keeps the 200 Ω formula and 4–10 V behavior consistent while applying instrument updates to the student’s objects. The source’s switch remains visually open during assembly; readiness checks evaluate the circuit that will conduct once measurement closes it.

Measurement controls become available after valid construction. Disconnecting/removing a required component returns to building, stops measurement and clears stale live readings; any retained measurement history must be visibly from completed prior runs. No backend persistence or automatic conversion of other labs is required.

## 5. Exact files/components likely affected

These are proposed paths, not files already implemented. Existing ready-lab scene definitions and backend files are not edit targets.

| Stage | Existing files likely changed | New files likely added | Boundary |
|---|---|---|---|
| 1 | None | `EMPIRA_NEXT_BUILD_PLAN.md` | Audit and plan only. |
| 2 | `design-prototype/class-plan/app.js`, `design-prototype/class-plan/index.html` | `design-prototype/shared/availability.js`; small availability regression test if needed | Derived chapter rows/current-week selection, accurate counts and content/helper script loading. No dataset edits. |
| 3 | `design-prototype/topic/app.js`, `topic/index.html`, `topic/styles.css`; `scan/app.js`, `scan/index.html`; navigation block only in `lab/app.js`, plus helper script in `lab/index.html` | `design-prototype/lab/build/experiments.js` with explicit, initially unavailable capability metadata; focused flow checks | Topic modes, scanner convergence, available-topic previous/next links. No changes to lab rendering or physics. |
| 4 | `lab/build/experiments.js` | `lab/build/index.html`, `styles.css`, `app.js`, `scene.js`, `state.js`, `tools.js`; focused state/interaction checks | One generic Build shell/controller with one Om configuration; existing kit and vendor imported unchanged. |
| 5 | Build files above | `lab/build/validation.js`, `feedback.js`, `measurement.js`; graph-rule tests | Educational rules, feedback, readiness and measurement using the assembled circuit. |
| 6 | Only files implicated by demonstrated regressions in Stages 2–5 | QA report/screenshots and focused regression checks | Responsive/accessibility/input fixes, not redesign or expansion. |

Paths abbreviated after the first occurrence are relative to `design-prototype/`. Test candidates: `tests/availability.test.cjs`, `tests/build-state.test.cjs`, `tests/build-validation.test.cjs`, and a browser flow script. Use Node’s built-in test runner and the available browser tooling; do not add an application framework or dependency solely for tests.

`topic/content.js` remains the shared source for topic/lab text. The new Build configuration is keyed by existing IDs; it does not replace or fork that content. A small `experiments.js` can be read by Topic without loading the Build renderer. Missing or unsupported Build IDs must show a clear return path, never silently load another experiment.

## 6. Safest implementation order and approval gates

**Every stage ends with a report and a stop. Approval of this plan does not authorize automatic progression through all stages.**

### Stage 1 — audit and plan (this delivery)

Deliver this document, current behavior evidence, file map, proposed architecture, risks and baseline screenshots. Stop before any product implementation.

### Stage 2 — curriculum filtering only

1. Add the small availability view without mutating the canonical curriculum.
2. Apply it to chapter/topic rows and “Shu hafta.” Preserve chapter numbering and honest week labels.
3. Verify 42 visible topics, 43 represented labs, five retained chapters, no “Tez orada” rows, and unchanged 60-topic/page-range data.
4. Verify a week with mixed availability (e.g. 18), a week with no available lab (e.g. 16), empty-chapter handling using a test fixture, chapter expand/collapse/deep links and other-grade empty states.
5. Verify every listed lab ID exists. Open Om and section 24 through the filtered curriculum.
6. Report files, changes, deliberately deferred navigation/modes, results, risks and before/after screenshots. **Stop.**

### Stage 3 — two mode choices and shared Topic flow

1. Add primary Ready and secondary Build choices using current buttons/type/spacing. Capabilities are data-driven; keep unavailable actions honest at this intermediate checkpoint.
2. Route single/multiple/no-lab scanner results to their same canonical Topic; preserve the scanning interaction.
3. Apply the availability view to Topic pager/Lab next-topic suggestions while resolving scanned/bookmarked topics from full data. Preserve no-lab direct-topic recovery.
4. Verify manual and simulated-scan Om reach the same Topic, Ready still opens the unchanged lab, section 24 retains two experiments, and short mobile labels/sticky CTA remain usable.
5. Test presenter mode, retry, unavailable scanner service and no-lab response paths without paid calls.
6. Report what is live and what Build capability is still unavailable. **Stop.**

### Stage 4 — reusable Om Build foundation

1. Add tool adapters and one configuration before writing experiment-specific UI conditions.
2. Add state, empty 3D board, library rendering, placement/movement, terminal selection, editable wires, removal/cancel/reset, accessible controls and lifecycle cleanup.
3. Enable the Om Build route only after the foundation works; other labs remain unavailable for construction.
4. Test touch and mouse interaction, pointer conflicts, movement with attached wires, remove/re-add, invalid URL recovery, zero initial placed equipment, eight library entries, and correct Back navigation.
5. Recheck ready Om and representative other labs. Structural input guards belong here; pedagogical success/error/completion remains Stage 5.
6. Report the reusable architecture and its remaining validation limitations. **Stop for architecture review.**

### Stage 5 — validation, feedback and completion

1. Add graph rules, separating incomplete, incorrect, correct-step and complete outcomes.
2. Cover a valid circuit constructed in different orders/positions, voltmeter in series, ammeter shunts, direct source short, resistor bypass, missing tools/wires, duplicate/self edges, polarity errors, and distractor substitutions.
3. Add single-region feedback, state-change deduplication, reduced-motion behavior, and recoverability after correcting a mistake.
4. Add readiness and start measurement on the assembled scene. Reuse existing Om calculations; verify the same four measurements and no readiness after deleting a required wire.
5. Verify no feedback during ordinary dragging/orbiting and no repeated completion announcement on every render.
6. Report pass/fail/untested cases with correct/error/completion screenshots. **Stop.**

### Stage 6 — responsive and usability QA

1. Check 1440×900, 1280×800, 1280×720, 800×1024, 390×844 and 375×667; also phone landscape and viewport changes during assembly.
2. Verify task/workspace/library are immediately understandable, long Uzbek labels wrap, target areas are practical for touch, canvas remains dominant, and library/feedback never trap scrolling or cover essential terminals.
3. Exercise mouse, touch, keyboard, focus visibility, reduced motion, repeat assembly, disconnect/reconnect, Back, ready/build switching, and WebGL failure recovery. Verify resource cleanup on repeated entry/exit.
4. Re-run the ready-lab baseline if shared files were touched. Check all ready routes remain valid and the original Om measurement behavior remains unchanged.
5. Browser emulation is useful but is not a real iPhone/Android or school-laptop performance test. Physical-device and teacher observations must be reported separately if unavailable.
6. Report files, fixes, intentional exclusions, results, unresolved issues and screenshots. **Stop. No other labs are converted.**

## 7. Main regression risks and controls

| Risk | Evidence in current code | Control |
|---|---|---|
| Removing curriculum records breaks scanner matching | `api/_lib/curriculum.js` derives page ends from successive topics | Filter a separate frontend view; retain all 60 records and verify page matching. |
| Availability flags drift from implementations | Flags, topic content and lab definitions are separate files | Assert all referenced lab IDs resolve; current 42/43 mapping is consistent. |
| Hidden topics still appear through shortcuts | Current-week, Topic pager and Lab next-topic each select separately | Current-week filtering in Stage 2; consistent navigation suggestions in Stage 3 with full direct-topic resolution. |
| Ohm topic/lab slugs are confused | Section 17, section 19 and legacy `mavzu=om-qonuni` differ | Use canonical section-19 topic slug and existing `lab=om-qonuni`; test both entry paths. |
| Scanner bypasses choice | `showResult()` sends single-lab results straight to Lab | Change only that navigation contract; retain capture and recognition logic. |
| Multi-lab topic loses an experiment | Section 24 has two labs | Preserve its cards and count labs separately from topics. |
| Build changes regress every ready lab | Shared engine/kit used by all 43 | Add a separate Build controller; keep ready definitions and kit contracts unchanged; recheck shared changes. |
| Moving tools leaves disconnected-looking cables | `wire()` snapshots terminal positions into TubeGeometry | Track graph endpoints, refresh connected geometry, dispose replaced meshes. |
| Valid circuits rejected or invalid ones accepted | No existing graph validator to reuse | Test electrical relationships and polarity; accept equivalent construction orders; distinguish incomplete state. |
| Pointer gestures fight the camera or page | Existing OrbitControls owns drag/pinch; stage uses `touch-action: none` | Explicit gesture ownership, tap alternatives, generous hit targets, cancel handling and mobile testing. |
| Memory/performance degrades after repeated edits | Kit tracks labels and owns shared wire materials; scenes animate continuously | Build-scoped lifecycle, bounded equipment count, geometry/material ownership, disposal tests; avoid per-frame UI rebuilds. |
| UI no longer looks like Empira | Repeated existing tokens and narrow 336 px Topic lab column | Reuse tokens/classes, wrap only new long labels, compare screenshots; no global style rewrite. |
| Feedback becomes noisy or inaccessible | Existing UI uses quiet step ticks; there is no educational error layer | Trigger on committed logical actions, one feedback region, text+icon, deduplication and reduced motion. |
| Completion falsely persists | Construction can be edited after a valid setup | Recompute validity and revoke ready/measurement state after relevant edits. |
| Live scanner claims exceed evidence | No local Gemini credential; audit responses are intercepted | Preserve backend and state the limit. Request explicit approval before a future paid recognition test. |

Existing issues recorded, not silently fixed in Stage 1:

- Home’s hidden demonstration Continue link points to `?mavzu=om-qonuni`; Topic silently falls back to **Jismlarning zaryadlanishi** because that is not a current topic slug. The Topic default also names an archived Newton topic. Keep this in the issue list; avoid changing locked Home as part of curriculum filtering.
- Unknown ready-lab IDs silently fall back to the first lab (`elektr-shamoli`). New Build routing must not copy this behavior.
- Week 18 currently selects a no-lab problem-solving topic even though a usable lab is available in the same week. This is directly addressed by Stage 2.
- Chapter II’s current count labels 15 lab-bearing topics as “15 ta laboratoriya,” although it contains 16 labs. Stage 2 can make the count accurate using existing content.
- Some specs/comments are stale: three labs, old Newton/Hooke defaults, mock-only scanning, and a four-row measurement description. The active engine keeps the last five rows. No bulk documentation rewrite is proposed.
- Several lab steps represent “conclude/compare” using measurement completion; they do not validate a written explanation. Build completion will validate construction, not claim assessment of conceptual understanding.

## 8. Audit checks and evidence

The application was served locally from the repository with Python’s static server and checked in installed headless Chromium using Playwright. WebGL used SwiftShader software rendering. No application dependencies were added. External audit scripts are not a committed project test suite.

| Check executed | Outcome | What it establishes |
|---|---|---|
| Syntax checks of all 16 non-vendor JavaScript files, including archived JS | 16 passed | Parseability, not functional correctness. |
| Curriculum → content → registered-lab mapping | 60 topics, 42 available topics, 43 labs; no mismatches | Consistent current availability data. |
| Lab calculation/readout/row checks at defaults and individual control endpoints/options | 216 cases passed | Finite numeric output, callable readouts, matching row/column counts; not full physics validation. |
| Each lab’s documented demo sequence evaluated against its step predicates | 43 sequences satisfy their configured steps | Current configured completion logic; this is separate from live browser runs. |
| Scanner matcher, each section number and each section’s starting page | 120 passed | Deterministic curriculum matching. |
| Additional matcher cases: non-textbook, empty reading, no-lab page, Ohm heading, two-lab page | 5 passed | Representative match/not-found boundaries. |
| Scanner handler without network: GET and unconfigured POST | Expected 405 and 503 | Method handling and missing-key behavior. |
| Every ready lab: initial scene + click Run + completed measurement row | **43/43 passed**, no page exceptions or WebGL fallback | Runtime baseline for all ready labs at default controls in Chromium. |
| Every Topic URL | **60/60 passed**, correct title and lab-card count | Topic coverage, including no-lab states. |
| Home → 8-sinf → current Ohm Topic → ready lab → Back | Passed | Current teacher route. |
| Chapter toggle-all, chapter deep link, five other-grade empty states | Passed | Existing basic navigation behavior. |
| Presenter photo upload, non-image rejection, unavailable-camera message, mocked API failure and retry | Passed | Scanner interaction/error behavior, not physical camera capture. |
| Intercepted API found responses with one, two and zero labs | 3 paths passed | Existing result-routing contract; no Gemini invocation. |
| Home, curriculum, Ohm Topic, scanner result, measured Ohm at four viewport sizes | **20 checks passed**, no document horizontal overflow or page exceptions | Baseline at 1280×720, 800×1024, 390×844, 375×667; Sora loaded. |
| Om 4/6/8/10 V, three completed steps and average resistance at all four sizes | Passed | Core reference measurement behavior. |
| Build Mode | Not present / not testable yet | The requested feature is new work. |
| Live Gemini photo recognition, physical phone cameras, real touch hardware, Safari/WebKit, school-device performance | Not run | Remain explicit validation limits. |

The temporary harness initially needed two corrections: treating optional `compute` functions like the engine does, and fixing a Playwright response-fixture callback signature. The affected checks were rerun successfully. Those harness errors were not application failures.

Current evidence files outside the repository:

- `/workspace/empira-audit/inventory.json` — exact topic/lab inventory and calculation/matcher summary.
- `/workspace/empira-audit/browser-results.json` — per-lab default-run outcomes and 20 screen checks.
- `/workspace/empira-audit/flow-results.json` — navigation/scanner checks and the reproduced legacy Continue issue.
- `/workspace/empira-audit/browser_audit.py`, `flow_audit.py` — reusable audit harnesses for this environment.
- `/workspace/empira-audit/topic-ohm-1280x720.png`, `topic-ohm-390x844.png` — current Topic appearance.
- `/workspace/empira-audit/lab-ohm-1280x720.png`, `lab-ohm-375x667.png` — measured ready-lab baseline.
- `/workspace/empira-audit/curriculum-1280x720.png`, `curriculum-390x844.png` — current unfiltered curriculum.
- `/workspace/empira-audit/scanner-result-1280x720.png`, `scanner-result-390x844.png` — current scanner result state.

## 9. Approval requested

Review this plan, especially the unavailable-Build behavior at the Stage 3 checkpoint and the one-experiment scope. The next authorized unit of work should be **Stage 2: curriculum filtering only**, followed by its tests, report and another stop. No implementation stage has started.

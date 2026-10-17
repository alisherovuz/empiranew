# Public launch: first circuit experience

This change adds an Ohm's law Build Mode inside the existing 8th-grade lab engine. From the dashboard, "Zanjirni o‘zingiz yig‘ing" opens:

/design-prototype/lab/index.html?lab=om-qonuni&mode=build

Students add five instruments, connect terminals by tapping or using keyboard buttons, and receive explanations for incomplete circuits, short circuits, reversed meters and incorrect voltmeter placement. Measurements unlock after a valid assembly. The 3D scene uses the selected connections, then the student measures current and answers a short question. "Tayyor tajriba" restores the original prepared circuit. Selecting "O‘zingiz yig‘ing" again returns to assembly and clears that session's measurements.

This is an ideal DC teaching circuit with a 200 Ω resistor, an ideal ammeter and voltmeter, and a closed switch when measuring. It accepts alternative series component orders. It is not a general circuit simulator. The assembly board is a 2D schematic connected to the existing 3D equipment view; it is not direct 3D drag-and-drop.

Dashboard corrections:
- A clear first-experiment entry for both students and teachers.
- The annual-plan tile opens the existing 8th-grade curriculum.
- "Presentation maker" becomes "Ready lesson" to describe the available feature.
- Unimplemented presentation topics are disabled and labelled upcoming instead of opening Ohm's law.
- Tour copy accurately identifies reports as a sample.

## Validation

38 circuit tests ran successfully in the tool's V8 JavaScript runtime. The tests are also committed for Node:

node design-prototype/lab/build-mode.test.js

Additional in-memory checks verified the 3D kit wiring adapter: default circuit, empty assembly, custom connections and returning to default; and current/resistance calculations at 4, 6, 8 and 10 V. Changed JavaScript and the dashboard's inline script pass V8 syntax checks.

The execution workspace failed to start, and the web reader could not open the live domains. Browser layout, pointer interaction, actual WebGL, authentication, Vercel preview and production traffic capacity have NOT been verified. This change is a draft pending those checks.

## Preview acceptance

- Open the build URL at 390×844, 375×667 and 1280×720. Check readable instrument labels, tappable terminals, scroll access to all controls and a visible keyboard focus.
- Add all five instruments; use the hint to make a correct circuit. Check that missing wires, direct source shorts, reversed ammeter polarity and a series voltmeter block measurement with a helpful explanation.
- Remove/undo a wire and rebuild. Confirm the measurement button immediately reflects validity.
- Run a complete circuit at 4 V: 20 mA, 200 Ω. Change to 8 V: 40 mA. Check the follow-up question, then return to assembly.
- Switch between prepared and assembly modes during and after a run. Ensure measurements clear and no stale readings return.
- Open an unrelated lab: it should retain its existing controls without a Build Mode selector.
- Check a device without WebGL: the fallback should explain the limitation while calculation-based measurements complete.
- Sign in as a student and teacher, open the dashboard challenge and return to the dashboard. No authentication behavior was intentionally changed.

## Next work for the public launch

1. Verify the sign-in/onboarding journey and recovery from Telegram or Google errors on a phone.
2. Measure load time and WebGL stability on a lower-end Android phone. Test realistic simultaneous sign-ins even though visitors are expected gradually over several days.
3. Align public promises with delivered features: the lab home says grades 6–11 while the source curriculum is grade 8; the landing reports section currently promises more than the dashboard delivers.
4. Record lesson completion and quiz answers under the authenticated user, then show real student progress and teacher reports. This patch stores neither quiz results nor long-term progress.
5. Extend Build Mode to another experiment only after the first assembly flow passes real-device testing.

Translation, school administration and a general presentation generator remain separate workstreams.

// Empira — Build Mode ("Zanjirni o‘zingiz yig‘ing") configurations, keyed by the existing lab id.
// Small and DOM-free: the Topic page and the Scanner load this file only to know which labs offer Build Mode.
// Each experiment: task, a tool library (needed tools + plausible wrong ones), the circuit to check (see circuit.js),
// and how the student's own instruments react once measuring starts (same numbers as the ready lab in labs-8.js).
(function (root) {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const ease = (p) => p * p * (3 - 2 * p);
  const on = (p) => (p <= 0.4 ? 0 : ease((p - 0.4) / 0.6));   // same switch-then-rise timing as the ready lab

  // Simple schematic icons (24×24, stroke) — the same symbols as in the textbook's circuit diagrams
  const I = {
    source: '<path d="M10 6v12"/><path d="M14 9v6"/><path d="M3 12h7"/><path d="M14 12h7"/><path d="M5 7h3"/><path d="M6.5 5.5v3"/><path d="M16 7h3"/>',
    switch: '<circle cx="5" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/><path d="M2 15h1.5"/><path d="M20.5 15H22"/><path d="M6.3 14.2 17 8"/>',
    ammeter: '<circle cx="12" cy="12" r="7"/><path d="M9.5 15 12 8.5l2.5 6.5"/><path d="M10.3 13h3.4"/><path d="M2 12h3"/><path d="M19 12h3"/>',
    voltmeter: '<circle cx="12" cy="12" r="7"/><path d="m9.5 8.5 2.5 7 2.5-7"/><path d="M2 12h3"/><path d="M19 12h3"/>',
    resistor: '<rect x="6" y="9" width="12" height="6" rx="1"/><path d="M2 12h4"/><path d="M18 12h4"/>',
    lamp: '<circle cx="12" cy="12" r="6"/><path d="m7.8 7.8 8.4 8.4"/><path d="m16.2 7.8-8.4 8.4"/><path d="M2 12h4"/><path d="M18 12h4"/>',
    rheostat: '<rect x="5" y="10" width="14" height="5" rx="1"/><path d="M2 12.5h3"/><path d="M19 12.5h3"/><path d="M7 19 17 5"/><path d="m14 5h3v3"/>',
    compass: '<circle cx="12" cy="12" r="8"/><path d="m14.5 9.5-1.6 3.4-3.4 1.6 1.6-3.4z"/>',
    stopwatch: '<circle cx="12" cy="14" r="7"/><path d="M12 14V10.5"/><path d="M10 3h4"/><path d="M12 3v4"/>',
    magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 4h3v8a3 3 0 0 0 6 0V4h3"/><path d="M6 8h3"/><path d="M15 8h3"/>'
  };

  // Every other 8-sinf lab gets Build Mode automatically from its ready lab (auto.js + netcheck.js).
  // wired: the student also connects the wires; tools: the student picks the right equipment, then experiments.
  const WIRED = ['elektr-zanjir', 'reostat', 'tok-manbalari', 'ketma-ket-ulash', 'parallel-ulash', 'lampochka-quvvati',
    'elektromagnit', 'elektr-toki-neon', 'volta-elementi', 'kuchlanish-olchash', 'tok-kuchi-olchash', 'qarshilik-sim',
    'potensiometr', 'tok-va-qarshilik', 'ketma-ket-lampalar', 'parallel-lampalar', 'kondensator', 'joul-lens', 'ersted',
    'amper', 'tokli-ramka', 'elektromagnit-kuchi', 'elektr-dvigatel', 'metall-elektronlar', 'suyuqlik-otkazuvchanligi',
    'elektroliz', 'faradey-ikkinchi', 'galvanostegiya', 'vakuum-diod', 'gaz-ionlash', 'razryad-turlari'];
  const TOOLS_ONLY = ['elektr-shamoli', 'magnitlar-tasiri', 'lampochka-energiyasi', 'faza-indikator', 'magnit-kuch-chiziqlari',
    'yer-magnit-maydoni', 'elektrlanish-turlari', 'elektroskop', 'kulon-qonuni', 'chaqmoq-masofasi', 'elektr-maydon-chiziqlari'];
  // 7-sinf (mechanics): the student picks the right equipment for the book's experiment, then measures
  const SEVEN = ['harakat-nisbiyligi', 'yol-va-kochish', 'daryodan-suzib-otish', 'tomizgichli-aravacha', 'havo-pufagi', 'yol-grafigi',
    'oniy-tezlik', 'qiya-aravacha-tezlanish', 'itarilgan-aravacha', 'galiley-novi', 'sharcha-tezlanishi', 'nyuton-nayi', 'tik-otish',
    'aylanuvchi-disk', 'aylanish-davri', 'markazga-intilma-tezlanish', 'kuchlarni-qoshish', 'inersiya', 'aravachalar-inertligi',
    'nyuton-ikkinchi-qonuni', 'tasir-aks-tasir', 'markazga-intilma-kuch', 'guk-qonuni', 'prujina-bikirligi', 'kavendish-tajribasi',
    'ogirlik-kuchi', 'jism-ogirligi', 'liftdagi-tarozi', 'gorizontal-otish', 'suniy-yoldosh', 'tinchlikdagi-ishqalanish',
    'sirpanish-dumalanish', 'ishqalanish-koeffitsiyenti', 'tormozlanish-yoli', 'kuch-impulsi', 'aravachalar-toqnashuvi',
    'reaktiv-harakat', 'mexanik-ish', 'kotarish-va-sudrash', 'potensial-energiya', 'kinetik-energiya', 'energiya-saqlanishi',
    'sharcha-kinetik-energiyasi', 'kotargich-quvvati', 'qiya-tekislik-fik'];
  root.EMPIRA_BUILD_AUTO_LABS = Object.fromEntries([
    ...WIRED.map((id) => [id, { label: 'Zanjirni o‘zingiz yig‘ing', wired: true }]),
    ...TOOLS_ONLY.map((id) => [id, { label: 'Laboratoriyani o‘zingiz yig‘ing', wired: false }]),
    ...SEVEN.map((id) => [id, { label: 'Laboratoriyani o‘zingiz yig‘ing', wired: false }])
  ]);
  // Which Build Mode a lab has (hand-made config wins), or null
  root.EMPIRA_BUILD_FOR = (labId) => (root.EMPIRA_BUILD || {})[labId] || root.EMPIRA_BUILD_AUTO_LABS[labId] || null;

  root.EMPIRA_BUILD = {
    'om-qonuni': {
      label: 'Zanjirni o‘zingiz yig‘ing',
      task: 'Rezistordagi tok kuchi va kuchlanishni o‘lchash uchun elektr zanjirini yig‘ing.',
      board: [0.7, 0.46, 0.03, -0.02],
      camera: { target: [0.04, 0.03, 0], dir: [0.05, 1.15, 1], fitW: 0.86, fitH: 0.56, min: 0.85 },
      // terminals: key → getter on the kit object. Polar tools use '+' / '-'.
      tools: [
        { id: 'ps', name: 'Tok manbai', note: '4–10 V', icon: I.source, need: true, terminals: { '+': 'plus', '-': 'minus' }, make: (k) => k.powerSupply(-0.22, 0.0) },
        { id: 'K', name: 'Kalit', icon: I.switch, need: true, terminals: { a: 'a', b: 'b' }, make: (k) => { const s = k.switchK(-0.06, 0.15); s.set(false); return s; } },
        { id: 'mA', name: 'Milliampermetr', note: 'tok kuchi', icon: I.ammeter, need: true, terminals: { '+': 'a', '-': 'b' }, make: (k) => k.meter(0.14, 0.15, 'mA') },
        { id: 'R', name: 'Rezistor', note: '200 Ω', icon: I.resistor, need: true, terminals: { a: 'a', b: 'b' }, make: (k) => k.resistor(0.14, -0.04, 'R') },
        { id: 'V', name: 'Voltmetr', note: 'kuchlanish', icon: I.voltmeter, need: true, terminals: { '+': 'a', '-': 'b' }, make: (k) => k.meter(0.14, -0.17, 'V') },
        { id: 'lamp', name: 'Lampochka', icon: I.lamp, why: 'Lampochka bu tajribada kerak emas: tok va kuchlanish rezistorda o‘lchanadi.' },
        { id: 'rheo', name: 'Reostat', icon: I.rheostat, why: 'Reostat kerak emas: bu tajribada kuchlanish tok manbaining o‘zida o‘zgartiriladi.' },
        { id: 'compass', name: 'Kompas', icon: I.compass, why: 'Kompas magnit maydonni kuzatish uchun. Om qonuni tajribasida u kerak emas.' },
        { id: 'stopwatch', name: 'Sekundomer', icon: I.stopwatch, why: 'Sekundomer kerak emas: bu tajribada vaqt o‘lchanmaydi.' },
        { id: 'magnet', name: 'Doimiy magnit', icon: I.magnet, why: 'Doimiy magnit elektr zanjirining qismi emas. Bu tajribada u kerak emas.' }
      ],
      circuit: {
        source: { id: 'ps' },
        series: [{ id: 'K' }, { id: 'mA', polar: true }, { id: 'R' }],
        across: [{ id: 'V', polar: true, over: 'R' }]
      },
      // Shown when all measurements are done (what the student just proved)
      finale: (runs) => {
        const avg = runs.reduce((a, r) => a + r.R, 0) / runs.length;
        return `Rₒ‘ᵣₜ = ${fmt(avg, 0)} Ω. Kuchlanish necha marta oshsa, tok kuchi ham shuncha marta oshdi, qarshilik esa o‘zgarmadi. Bu Om qonuni!`;
      },
      // Measurement on the student's own circuit: values come from EMPIRA_LABS['om-qonuni'].compute
      instruments: {
        update(o, v) { o.ps.set(v.U); o.K.set(false); o.mA.set(0, 'mA'); o.V.set(0, 'V'); },
        progress(o, p, v, c) {
          o.K.set(p > 0.3); const f = on(p);
          o.mA.set((c.mA / 60) * f, f > 0.99 ? `${fmt(c.mA, 0)} mA` : 'mA');
          o.V.set((v.U / 12) * f, f > 0.99 ? `${v.U} V` : 'V');
        }
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);

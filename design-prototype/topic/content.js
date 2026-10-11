// 8-sinf Fizika — content for the topics that have a 3D lab (keyed by topic slug).
// Goals, equipment and questions follow the textbook's own lab pages (Fizika 8-sinf, 2019);
// explanations are short classroom summaries. Each lab's `slug` is its id in ../lab/ (?lab=<slug>).
// To be reviewed by a physics teacher before the pilot.

(typeof window !== 'undefined' ? window : globalThis).EMPIRA_TOPICS = {
  'otkazgichlarda-elektr-zaryadlarning-taqsimlanishi': {
    explain: [
      'Zaryadlangan o‘tkazgichda zaryadlar faqat uning sirtida joylashadi. Sirt bo‘ylab ular notekis taqsimlanadi: o‘tkazgichning uchli joylarida zaryad eng zich bo‘ladi.',
      'Uchli joy yonida elektr maydon juda kuchli bo‘lib, havo molekulalarini ionlaydi. Zaryadlangan havo oqimi uchdan uzoqlashadi — bu «elektr shamoli» deyiladi.'
    ],
    formulas: ['E = k · q / r²'],
    terms: [['E', 'elektr maydon kuchlanganligi', 'N/C'], ['q', 'zaryad', 'C (kulon)'], ['r', 'masofa', 'm']],
    labs: [{
      slug: 'elektr-shamoli',
      title: 'Elektr shamolini kuzatish',
      goal: 'Elektrofor mashinasining sharchasiga uchli jism ulab, uning yonidagi sham alangasini kuzating.',
      task: 'Nega sham alangasi uchli jismdan qochadi?',
      minutes: 8
    }]
  },

  'laboratoriya-ishi-elektr-zanjirni-yigish-va-olchash': {
    explain: [
      'Ketma-ket ulangan iste’molchilardan o‘tayotgan tok kuchi zanjirning hamma qismida bir xil bo‘ladi: ampermetrni qayerga ulasak ham, u bir xil qiymatni ko‘rsatadi.',
      'Umumiy kuchlanish esa alohida qismlardagi kuchlanishlar yig‘indisiga teng. Ampermetr zanjirga ketma-ket, voltmetr esa o‘lchanayotgan qismga parallel ulanadi.'
    ],
    formulas: ['I = I₁ = I₂', 'U = U₁ + U₂'],
    terms: [['I', 'tok kuchi', 'A (amper)'], ['U', 'kuchlanish', 'V (volt)'], ['U₁, U₂', 'lampochkalardagi kuchlanish', 'V']],
    labs: [{
      slug: 'elektr-zanjir',
      title: 'Zanjirning turli qismlarida tok va kuchlanish',
      goal: 'Ikki lampochkali zanjir yig‘ib, uning turli qismlaridagi tok kuchi va kuchlanishni o‘lchang.',
      task: 'Ampermetrni boshqa joyga ulasak, tok kuchi o‘zgaradimi?',
      minutes: 10
    }]
  },

  'laboratoriya-ishi-om-qonunini-organish': {
    explain: [
      'Zanjirning bir qismidagi tok kuchi shu qismdagi kuchlanishga to‘g‘ri proporsional, qarshilikka esa teskari proporsional.',
      'Kuchlanishni bir necha marta o‘zgartirib, har safar tok kuchini o‘lchab, o‘tkazgich qarshiligini R = U / I formula bo‘yicha hisoblaymiz va o‘rtacha qiymatini topamiz.'
    ],
    formulas: ['I = U / R', 'R = U / I'],
    terms: [['I', 'tok kuchi', 'A (amper)'], ['U', 'kuchlanish', 'V (volt)'], ['R', 'qarshilik', 'Ω (om)']],
    labs: [{
      slug: 'om-qonuni',
      title: 'Om qonunini o‘rganish',
      goal: 'Rezistordagi kuchlanishni o‘zgartirib, tok kuchini o‘lchang va qarshilikni Om qonuni bo‘yicha hisoblang.',
      task: 'Kuchlanish oshsa, tok kuchi qanday o‘zgaradi?',
      minutes: 10
    }]
  },

  'amaliy-mashgulot-reostat-yordamida-tok-kuchini-rostlash': {
    explain: [
      'Reostat — qarshiligini o‘zgartirish mumkin bo‘lgan asbob. Uning surgichi siljitilganda tok o‘tadigan simning uzunligi, demak qarshiligi ham o‘zgaradi.',
      'Reostat qarshiligi kamaysa, zanjirning umumiy qarshiligi kamayadi va tok kuchi ortadi. Reostat yordamida tok kuchini rostlash mumkin.'
    ],
    formulas: ['I = U / (R + Rᵣ)'],
    terms: [['I', 'tok kuchi', 'A'], ['U', 'manba kuchlanishi', 'V'], ['R', 'rezistor qarshiligi (6 Ω)', 'Ω'], ['Rᵣ', 'reostat qarshiligi', 'Ω']],
    labs: [{
      slug: 'reostat',
      title: 'Reostat yordamida tok kuchini rostlash',
      goal: 'Reostat surgichini siljitib, zanjirdagi tok kuchi qanday o‘zgarishini o‘rganing.',
      task: 'Reostat qarshiligi kamaysa, tok kuchi qanday o‘zgaradi?',
      minutes: 8
    }]
  },

  'amaliy-mashgulot-tok-manbalarini-ulash': {
    explain: [
      'Galvanik elementlar ketma-ket ulanganda (birinchisining musbat qutbi ikkinchisining manfiy qutbiga) ularning kuchlanishlari qo‘shiladi.',
      'Shuning uchun uchta 1,5 V li element ketma-ket ulansa, taxminan 4,5 V kuchlanish hosil bo‘ladi. Voltmetrning «+» qisqichi manbaning musbat qutbiga ulanadi.'
    ],
    formulas: ['U = U₁ + U₂ + U₃'],
    terms: [['U', 'umumiy kuchlanish', 'V'], ['U₁, U₂, U₃', 'har bir element kuchlanishi', 'V']],
    labs: [{
      slug: 'tok-manbalari',
      title: 'Tok manbalarini ketma-ket ulash',
      goal: 'Har bir galvanik elementning kuchlanishini, so‘ng ular ketma-ket ulangandagi umumiy kuchlanishni o‘lchang.',
      task: 'Ketma-ket ulangan elementlarning umumiy kuchlanishi nimaga teng?',
      minutes: 8
    }]
  },

  'laboratoriya-ishi-otkazgichlarni-ketma-ket-va-parallel-ulash': {
    explain: [
      'Ketma-ket ulashda o‘tkazgichlardan bir xil tok o‘tadi, umumiy kuchlanish esa ulardagi kuchlanishlar yig‘indisiga teng.',
      'Parallel ulashda o‘tkazgichlar uchlaridagi kuchlanish bir xil bo‘ladi, umumiy tok esa tarmoqlardagi toklar yig‘indisiga teng.'
    ],
    formulas: ['Ketma-ket: I = I₁ = I₂, U = U₁ + U₂', 'Parallel: U = U₁ = U₂, I = I₁ + I₂'],
    terms: [['I', 'tok kuchi', 'mA'], ['U', 'kuchlanish', 'V'], ['R₁, R₂', 'rezistorlar qarshiligi', 'Ω']],
    labs: [
      {
        slug: 'ketma-ket-ulash',
        title: 'O‘tkazgichlarni ketma-ket ulash',
        goal: 'Ikki rezistorni ketma-ket ulab, ulardagi tok kuchi va kuchlanishni o‘lchang.',
        task: 'Ketma-ket ulashda qaysi kattalik bir xil bo‘ladi?',
        minutes: 10
      },
      {
        slug: 'parallel-ulash',
        title: 'O‘tkazgichlarni parallel ulash',
        goal: 'Ikki rezistorni parallel ulab, umumiy tok va har bir tarmoqdagi tokni o‘lchang.',
        task: 'Parallel ulashda umumiy tok nimaga teng?',
        minutes: 10
      }
    ]
  },

  'laboratoriya-ishi-lampochkaning-elektr-quvvatini-aniqlash': {
    explain: [
      'Iste’molchining quvvati undagi tok kuchi va kuchlanishning ko‘paytmasiga teng. Quvvat 1 sekundda bajarilgan ishni ko‘rsatadi.',
      'Lampochka t vaqt davomida yonib tursa, sarflangan elektr energiya W = I · U · t ga teng bo‘ladi. Tajriba 3 marta takrorlanib, o‘rtacha quvvat topiladi.'
    ],
    formulas: ['P = I · U', 'W = I · U · t', 'Pₒ‘ᵣₜ = (P₁ + P₂ + P₃) / 3'],
    terms: [['P', 'quvvat', 'W (vatt)'], ['W', 'elektr energiya (ish)', 'J = W·s'], ['t', 'vaqt', 's']],
    labs: [{
      slug: 'lampochka-quvvati',
      title: 'Lampochkaning elektr quvvatini aniqlash',
      goal: 'Ampermetr va voltmetr ko‘rsatishlaridan lampochkaning quvvatini, sekundomer bilan sarflangan energiyani aniqlang.',
      task: 'Kuchlanish oshsa, lampochka quvvati qanday o‘zgaradi?',
      minutes: 10
    }]
  },

  'magnit-maydon-doimiy-magnit-va-uning-qutblari': {
    explain: [
      'Magnitning ikki qutbi bor: shimoliy (N) va janubiy (S). Har xil qutbli magnitlar bir-biriga tortiladi, bir xil qutbli magnitlar esa bir-biridan itariladi.',
      'Magnitlar orasidagi o‘zaro ta’sir kuchi ular orasidagi masofa kamayganda keskin ortadi. Bu kuchni dinamometr yordamida baholash mumkin.'
    ],
    formulas: ['F = Fₜ − P'],
    terms: [['F', 'magnitlarning o‘zaro ta’sir kuchi', 'N'], ['Fₜ', 'dinamometr ko‘rsatishi', 'N'], ['P', 'osilgan magnitning og‘irligi', 'N']],
    labs: [{
      slug: 'magnitlar-tasiri',
      title: 'Doimiy magnitlar orasidagi o‘zaro ta’sir kuchi',
      goal: 'Dinamometrga osilgan magnitga ikkinchi magnitni yaqinlashtirib, tortilish va itarilish kuchlarini baholang.',
      task: 'Magnitlar orasidagi masofa kamaysa, o‘zaro ta’sir kuchi qanday o‘zgaradi?',
      minutes: 8
    }]
  },

  'laboratoriya-ishi-eng-oddiy-elektromagnitni-yigish': {
    explain: [
      'Tok o‘tayotgan g‘altak atrofida magnit maydon hosil bo‘ladi — u magnit kabi ikki qutbga ega. Qutblarni kompas yordamida aniqlash mumkin.',
      'G‘altak ichiga temir o‘zak qo‘yilsa, magnit maydon ancha kuchayadi. Tok kuchini reostat bilan oshirsak ham, elektromagnit kuchliroq bo‘ladi.'
    ],
    formulas: ['B ~ I · N'],
    terms: [['B', 'magnit maydon induksiyasi', 'T (tesla)'], ['I', 'g‘altakdagi tok kuchi', 'A'], ['N', 'g‘altak o‘ramlari soni', '—']],
    labs: [{
      slug: 'elektromagnit',
      title: 'Eng oddiy elektromagnitni yig‘ish',
      goal: 'G‘altak, reostat va kalitdan zanjir yig‘ib, kompas yordamida elektromagnitning ta’sirini o‘rganing.',
      task: 'G‘altakka temir o‘zak qo‘yilsa, kompasga ta’sir qanday o‘zgaradi?',
      minutes: 10
    }]
  }
};

// ---------- Batch 2: Chapter II–III topics (demonstration experiments from the textbook) ----------
Object.assign((typeof window !== 'undefined' ? window : globalThis).EMPIRA_TOPICS, {
  'elektr-toki-haqida-tushuncha': {
    explain: [
      'Elektr toki — zaryadli zarralarning tartibli harakati. O‘tkazgichda tok hosil bo‘lishi uchun unda elektr maydon bo‘lishi kerak.',
      'Zaryadlangan jism o‘tkazgich orqali zaryadsizlansa, tok bir zumda o‘tadi. Tok uzluksiz bo‘lishi uchun elektr maydonni doimo saqlab turuvchi manba kerak.'
    ],
    formulas: ['I = q / t'],
    terms: [['I', 'tok kuchi', 'A'], ['q', 'o‘tgan zaryad', 'C'], ['t', 'vaqt', 's']],
    labs: [{ slug: 'elektr-toki-neon', title: 'Elektr tokini neon lampa orqali kuzatish', goal: 'Elektrofor mashinasini aylantirib, neon lampa orqali o‘tkazgichdagi tokni kuzating.', task: 'Nega mashina uzluksiz aylantirilganda lampa uzluksiz yonadi?', minutes: 6 }]
  },
  'tok-manbalari': {
    explain: [
      'Tok manbai zaryadlarni ajratib, zanjirda elektr maydonni saqlab turadi. Galvanik elementda kimyoviy energiya elektr energiyaga aylanadi.',
      'Eng sodda galvanik element (Volta elementi) — kislota eritmasiga tushirilgan rux va mis plastinkalar. Ikki xil metall bo‘lgandagina kuchlanish hosil bo‘ladi.'
    ],
    formulas: ['U ≈ 1 V (Zn – Cu)'],
    terms: [['Zn', 'rux plastinka (manfiy qutb)', '—'], ['Cu', 'mis plastinka (musbat qutb)', '—'], ['U', 'element kuchlanishi', 'V']],
    labs: [{ slug: 'volta-elementi', title: 'Eng sodda galvanik element', goal: 'Kislota eritmasiga rux va mis plastinkalarni tushirib, lampochka va voltmetrni kuzating.', task: 'Ikkala plastinka bir xil metalldan bo‘lsa, tok hosil bo‘ladimi?', minutes: 6 }]
  },
  'elektr-kuchlanish-va-uni-olchash': {
    explain: [
      'Kuchlanish elektr maydonning zaryadni ko‘chirishda bajargan ishini ko‘rsatadi. U voltmetr bilan o‘lchanadi.',
      'Voltmetr o‘lchanayotgan iste’molchiga parallel ulanadi. Ketma-ket ulansa, uning katta qarshiligi tufayli zanjirda tok deyarli bo‘lmaydi.'
    ],
    formulas: ['U = A / q'],
    terms: [['U', 'kuchlanish', 'V (volt)'], ['A', 'maydon bajargan ish', 'J'], ['q', 'zaryad', 'C']],
    labs: [{ slug: 'kuchlanish-olchash', title: 'Kuchlanishni voltmetr bilan o‘lchash', goal: 'Voltmetrni lampochkaga parallel ulab, kuchlanishni o‘lchang. Xato ulash nimaga olib kelishini ko‘ring.', task: 'Voltmetr iste’molchiga qanday ulanadi?', minutes: 6 }]
  },
  'tok-kuchi-va-uni-olchash': {
    explain: [
      'Tok kuchi o‘tkazgich kesimidan 1 sekundda o‘tgan zaryad miqdoriga teng. U ampermetr bilan o‘lchanadi.',
      'Ampermetr zanjirga ketma-ket ulanadi. Manba kuchlanishi oshirilsa, lampochkadan o‘tayotgan tok kuchi ham ortadi.'
    ],
    formulas: ['I = q / t'],
    terms: [['I', 'tok kuchi', 'A (amper), mA'], ['q', 'zaryad', 'C'], ['t', 'vaqt', 's']],
    labs: [{ slug: 'tok-kuchi-olchash', title: 'Tok kuchini ampermetr bilan o‘lchash', goal: 'Milliampermetrni zanjirga ketma-ket ulab, manba kuchlanishi o‘zgarganda tok kuchini o‘lchang.', task: 'Manba kuchlanishi oshsa, lampochkadagi tok kuchi qanday o‘zgaradi?', minutes: 6 }]
  },
  'elektr-qarshilik': {
    explain: [
      'O‘tkazgichning qarshiligi uning uzunligiga to‘g‘ri proporsional, ko‘ndalang kesim yuzasiga teskari proporsional va moddasiga bog‘liq.',
      'Moddaning bu xususiyati solishtirma qarshilik (ρ) bilan ifodalanadi: misniki juda kichik, nikelin va nixromniki ancha katta.'
    ],
    formulas: ['R = ρ · l / S'],
    terms: [['R', 'qarshilik', 'Ω'], ['ρ', 'solishtirma qarshilik', 'Ω·mm²/m'], ['l', 'uzunlik', 'm'], ['S', 'ko‘ndalang kesim yuzasi', 'mm²']],
    labs: [{ slug: 'qarshilik-sim', title: 'Qarshilikning sim o‘lchamlari va moddasiga bog‘liqligi', goal: 'Turli uzunlik, kesim va moddadagi simlarni ulab, tok kuchini solishtiring.', task: 'Sim uzunligi 2 marta ortsa, uning qarshiligi qanday o‘zgaradi?', minutes: 10 }]
  },
  'rezistorlar-reostatlar-potensiometrlar': {
    explain: [
      'Reostatning ikki uchini manbaga, surgichini va bir uchini iste’molchiga ulasak, u potensiometr bo‘ladi.',
      'Surgich surilganda iste’molchidagi kuchlanish noldan manba kuchlanishigacha bir me’yorda o‘zgaradi.'
    ],
    formulas: ['U_L = U · x'],
    terms: [['U_L', 'lampochkadagi kuchlanish', 'V'], ['U', 'manba kuchlanishi (6 V)', 'V'], ['x', 'surgich holati', '0 … 1']],
    labs: [{ slug: 'potensiometr', title: 'Reostatni potensiometr sifatida ulash', goal: 'Surgichni siljitib, lampochkadagi kuchlanishni noldan 6 V gacha rostlang.', task: 'Surgich surilganda lampochka yorug‘ligi qanday o‘zgaradi?', minutes: 6 }]
  },
  'zanjirning-bir-qismi-uchun-om-qonuni': {
    explain: [
      'Kuchlanish o‘zgarmas bo‘lganda tok kuchi o‘tkazgich qarshiligiga teskari proporsional: qarshilik necha marta ortsa, tok shuncha marta kamayadi.',
      'Bu Om qonunining ikkinchi qismi. Birinchi qismi — tok kuchi kuchlanishga to‘g‘ri proporsional ekanligi — 19-§ laboratoriya ishida o‘rganiladi.'
    ],
    formulas: ['I = U / R'],
    terms: [['I', 'tok kuchi', 'A'], ['U', 'kuchlanish (4 V)', 'V'], ['R', 'qarshilik', 'Ω']],
    labs: [{ slug: 'tok-va-qarshilik', title: 'Tok kuchining qarshilikka bog‘liqligi', goal: 'Kuchlanish o‘zgarmas bo‘lganda turli qarshilikli o‘tkazgichlarni ulab, tok kuchini o‘lchang.', task: 'Qarshilik 2 marta ortsa, tok kuchi qanday o‘zgaradi?', minutes: 6 }]
  },
  'istemolchilarni-ketma-ket-ulash': {
    explain: [
      'Ketma-ket ulangan iste’molchilardan bir xil tok o‘tadi, umumiy kuchlanish ulardagi kuchlanishlar yig‘indisiga teng.',
      'Ketma-ket zanjirda bitta iste’molchi uzilsa, zanjir ochiladi va qolganlari ham ishlamay qoladi.'
    ],
    formulas: ['I = I₁ = I₂', 'U = U₁ + U₂', 'R = R₁ + R₂'],
    terms: [['I', 'tok kuchi', 'A'], ['U', 'kuchlanish', 'V'], ['R', 'umumiy qarshilik', 'Ω']],
    labs: [{ slug: 'ketma-ket-lampalar', title: 'Ketma-ket ulangan lampochkalar', goal: 'Ikki lampochkani ketma-ket ulab, kuchlanishlarni o‘lchang va biri burab olinganda nima bo‘lishini kuzating.', task: 'Bitta lampochka burab olinsa, ikkinchisi yonadimi?', minutes: 8 }]
  },
  'istemolchilarni-parallel-ulash': {
    explain: [
      'Parallel ulangan iste’molchilardagi kuchlanish bir xil, umumiy tok esa tarmoqlardagi toklar yig‘indisiga teng.',
      'Bitta tarmoq uzilsa, qolgan iste’molchilar ishlashda davom etadi. Shuning uchun uylardagi asboblar parallel ulanadi.'
    ],
    formulas: ['U = U₁ = U₂', 'I = I₁ + I₂'],
    terms: [['U', 'kuchlanish (4 V)', 'V'], ['I', 'umumiy tok kuchi', 'A'], ['I₁, I₂', 'tarmoqlardagi tok', 'A']],
    labs: [{ slug: 'parallel-lampalar', title: 'Parallel ulangan lampochkalar', goal: 'Ikki lampochkani parallel ulab, umumiy tok va tarmoqlardagi toklarni o‘lchang.', task: 'Bitta lampochka burab olinsa, ikkinchisi yonadimi?', minutes: 8 }]
  },
  'elektr-sigimi-kondensatorlar': {
    explain: [
      'Kondensator — dielektrik bilan ajratilgan ikki o‘tkazgich (qoplama). U elektr zaryadni to‘plash uchun ishlatiladi.',
      'Yassi kondensatorning sig‘imi qoplamalar yuzasiga to‘g‘ri, ular orasidagi masofaga teskari proporsional va orasidagi dielektrikka bog‘liq.'
    ],
    formulas: ['C = ε · ε₀ · S / d'],
    terms: [['C', 'sig‘im', 'F (farad), pF'], ['ε', 'dielektrik singdiruvchanlik', '—'], ['S', 'qoplama yuzasi', 'm²'], ['d', 'qoplamalar orasidagi masofa', 'm']],
    labs: [{ slug: 'kondensator', title: 'Yassi kondensatorning sig‘imi', goal: 'Qoplamalar orasidagi masofani, yuzasini va dielektrikni o‘zgartirib, sig‘imni kuzating.', task: 'Qoplamalar orasidagi masofa kamaysa, sig‘im qanday o‘zgaradi?', minutes: 8 }]
  },
  'elektr-toki-tasirida-otkazgichlarning-qizishi': {
    explain: [
      'Tok o‘tganda o‘tkazgich qiziydi: elektr energiyaning bir qismi issiqlikka aylanadi. Cho‘g‘lanma lampochkada energiyaning katta qismi issiqlikka ketadi.',
      'LED lampochka xuddi shunday yorug‘likni ancha kam quvvat bilan beradi. Sarflangan energiya W = P · t formula bilan hisoblanadi.'
    ],
    formulas: ['W = P · t'],
    terms: [['W', 'sarflangan energiya', 'kW·soat'], ['P', 'quvvat', 'kW'], ['t', 'vaqt', 'soat']],
    labs: [{ slug: 'lampochka-energiyasi', title: 'Cho‘g‘lanma va LED lampochkaning energiya sarfi', goal: '60 W cho‘g‘lanma va 7 W LED lampochka bir xil vaqtda qancha energiya sarflashini solishtiring.', task: 'Qaysi lampochka kamroq energiya sarflaydi va necha marta?', minutes: 5 }]
  },
  'joul-lens-qonunining-amaliy-tatbiqlari': {
    explain: [
      'Tok o‘tayotgan o‘tkazgichdan ajralib chiqadigan issiqlik miqdori tok kuchining kvadratiga, qarshilikka va vaqtga proporsional (Joul–Lens qonuni).',
      'Bu qonun elektr isitgichlar, dazmol va choynaklarda qo‘llaniladi. Ajralgan issiqlikni suv haroratining o‘zgarishidan aniqlash mumkin.'
    ],
    formulas: ['Q = I² · R · t', 'Δt = Q / (c · m)'],
    terms: [['Q', 'issiqlik miqdori', 'J'], ['I', 'tok kuchi', 'A'], ['R', 'spiral qarshiligi', 'Ω'], ['c, m', 'suvning solishtirma issiqlik sig‘imi (4200 J/kg·°C), massasi (0,2 kg)', '—']],
    labs: [{ slug: 'joul-lens', title: 'Joul–Lens qonunini tekshirish', goal: 'Suvga tushirilgan spiraldan tok o‘tkazib, ajralgan issiqlikni harorat o‘zgarishidan aniqlang.', task: 'Tok kuchi 2 marta oshsa, ajralgan issiqlik necha marta oshadi?', minutes: 8 }]
  },
  'xonadonlardagi-elektr-zanjirlar-va-ulashlar': {
    explain: [
      'Xonadon tarmog‘ida ikki sim bor: faza (L) va nol (N). Kuchlanish 220 V — bu hayot uchun xavfli.',
      'Faza simi otvyortka-indikator bilan aniqlanadi: indikator faza simiga tekkizilganda uning lampasi yonadi. Uzib-ulagich doim faza simini uzishi kerak.'
    ],
    formulas: ['U = 220 V'],
    terms: [['L', 'faza simi', '—'], ['N', 'nol simi', '—'], ['U', 'tarmoq kuchlanishi', 'V']],
    labs: [{ slug: 'faza-indikator', title: 'Indikator bilan faza simini aniqlash', goal: 'Otvyortka-indikator yordamida rozetkaning qaysi teshigida faza borligini xavfsiz, virtual tarzda aniqlang.', task: 'Indikator lampasi qaysi simga tekkizilganda yonadi?', minutes: 5 }]
  }
});

// Batch 3 — Chapter V (magnetism) topics with a demonstration lab.
Object.assign((typeof window !== 'undefined' ? window : globalThis).EMPIRA_TOPICS, {
  'magnit-maydonni-xarakterlovchi-parametrlar': {
    explain: [
      'Magnit maydonni magnit kuch chiziqlari bilan tasvirlash mumkin. Magnit strelkalar shu chiziqlarga urinma bo‘ylab joylashadi.',
      'Kuch chiziqlari magnitning shimoliy (N) qutbidan chiqib, janubiy (S) qutbiga kiradi. Ular qutblar yonida zichroq — u yerda maydon kuchliroq.'
    ],
    formulas: ['B = F / (I · l)'],
    terms: [['B', 'magnit induksiya', 'T (tesla)'], ['N', 'shimoliy qutb', '—'], ['S', 'janubiy qutb', '—']],
    labs: [{ slug: 'magnit-kuch-chiziqlari', title: 'Magnit kuch chiziqlarini kuzatish', goal: 'Magnit atrofidagi strelkalar va temir qipig‘i yordamida kuch chiziqlari shaklini ko‘ring.', task: 'Magnit teskari aylantirilsa, strelkalar qanday buriladi?', minutes: 5 }]
  },
  'yerning-magnit-maydoni': {
    explain: [
      'Yer katta magnitga o‘xshaydi. Shuning uchun kompas strelkasining shimoliy uchi doim geografik shimolga qaraydi.',
      'Yerning janubiy magnit qutbi geografik Shimoliy qutb yaqinida joylashgan. Yaqindagi magnit yoki temir buyumlar kompas ko‘rsatishini buzadi.'
    ],
    formulas: ['B ≈ 5 · 10⁻⁵ T'],
    terms: [['B', 'Yer magnit maydonining induksiyasi', 'T'], ['N', 'strelkaning shimoliy uchi', '—']],
    labs: [{ slug: 'yer-magnit-maydoni', title: 'Kompas va Yerning magnit maydoni', goal: 'Stolni burib, kompas strelkasi doim shimolni ko‘rsatishini tekshiring. Yoniga magnit qo‘yib, nima bo‘lishini kuzating.', task: 'Kompas yoniga magnit qo‘yilsa, strelka nima uchun og‘adi?', minutes: 5 }]
  },
  'tokning-magnit-maydoni': {
    explain: [
      'Tokli o‘tkazgich atrofida magnit maydon hosil bo‘ladi. Buni 1820-yilda Ersted kompas strelkasining og‘ishidan aniqlagan.',
      'Tok yo‘nalishi o‘zgarsa, strelka teskari tomonga og‘adi. Tok kuchi ortsa, maydon kuchayadi va og‘ish ortadi.'
    ],
    formulas: ['B ~ I'],
    terms: [['I', 'tok kuchi', 'A'], ['B', 'tok hosil qilgan magnit maydon', 'T']],
    labs: [{ slug: 'ersted', title: 'Ersted tajribasi', goal: 'Kompas ustidan o‘tgan simdan tok o‘tkazib, strelka og‘ishini kuzating.', task: 'Tok yo‘nalishi o‘zgarsa, strelka qaysi tomonga og‘adi?', minutes: 5 }]
  },
  'magnit-maydonning-tokli-otkazgichga-tasiri': {
    explain: [
      'Magnit maydonda turgan tokli o‘tkazgichga kuch ta’sir qiladi — Amper kuchi. U tok kuchiga, o‘tkazgich uzunligiga va magnit induksiyaga proporsional.',
      'Kuch yo‘nalishi chap qo‘l qoidasi bilan aniqlanadi. Tok yo‘nalishi o‘zgarsa, kuch ham teskari tomonga yo‘naladi.'
    ],
    formulas: ['F = B · I · l'],
    terms: [['F', 'Amper kuchi', 'N'], ['B', 'magnit induksiya (0,1 T)', 'T'], ['I', 'tok kuchi', 'A'], ['l', 'o‘tkazgich uzunligi (5 sm)', 'm']],
    labs: [{ slug: 'amper', title: 'Magnit maydonning tokli o‘tkazgichga ta’siri', goal: 'Taqasimon magnit qutblari orasidagi o‘tkazgichdan tok o‘tkazib, uning harakatini kuzating.', task: 'Tok yo‘nalishi o‘zgarsa, o‘tkazgich qayerga harakatlanadi?', minutes: 6 }]
  },
  'bir-jinsli-magnit-maydonda-tokli-ramkaning-aylanma-harakati': {
    explain: [
      'Magnit maydondagi tokli ramkaga juft kuch ta’sir qiladi va u aylanadi. Prujina bu aylanishga qarshilik qiladi.',
      'Burilish burchagi tok kuchiga proporsional. Elektr o‘lchov asboblari — ampermetr va voltmetr — shu tamoyil asosida ishlaydi.'
    ],
    formulas: ['φ ~ I'],
    terms: [['φ', 'ramka (strelka) burilish burchagi', '°'], ['I', 'ramkadagi tok kuchi', 'A']],
    labs: [{ slug: 'tokli-ramka', title: 'Magnit maydonda tokli ramka', goal: 'Ramkadan turli tok o‘tkazib, uning burilish burchagini kuzating.', task: 'Tok kuchi 2 marta ortsa, burilish burchagi qanday o‘zgaradi?', minutes: 5 }]
  },
  'elektromagnitlar-elektromagnit-rele': {
    explain: [
      'Elektromagnit — ichida temir o‘zagi bo‘lgan g‘altak. Tok o‘tganda u magnitga aylanadi, tok uzilganda magnitlik yo‘qoladi.',
      'Elektromagnitning ko‘tarish kuchi tok kuchi va o‘ramlar soni ortishi bilan ortadi. Elektromagnit rele, qo‘ng‘iroq va kranlarda ishlatiladi.'
    ],
    formulas: ['F ~ I · N'],
    terms: [['I', 'tok kuchi', 'A'], ['N', 'o‘ramlar soni', '—'], ['F', 'ko‘tarish kuchi', 'N']],
    labs: [{ slug: 'elektromagnit-kuchi', title: 'Elektromagnitning ko‘tarish kuchi', goal: 'Tok kuchi va o‘ramlar sonini o‘zgartirib, elektromagnit nechta skrepka ko‘tarishini sanang.', task: 'Ko‘tarish kuchi qaysi kattaliklarga bog‘liq?', minutes: 6 }]
  },
  'ozgarmas-tok-elektr-dvigateli': {
    explain: [
      'Elektr dvigatel elektr energiyani mexanik energiyaga aylantiradi. Uning asosiy qismlari: stator (magnit), rotor (ramka), kollektor va cho‘tkalar.',
      'Kollektor tok yo‘nalishini har yarim aylanishda almashtirib, rotorni bir tomonga aylantiradi. Manba qutblari almashtirilsa, dvigatel teskari aylanadi.'
    ],
    formulas: ['P = U · I'],
    terms: [['U', 'kuchlanish', 'V'], ['n', 'aylanish tezligi', 'ayl/min']],
    labs: [{ slug: 'elektr-dvigatel', title: 'O‘zgarmas tok elektr dvigateli', goal: 'Kuchlanishni o‘zgartirib, dvigatel tezligini kuzating. Manba qutblarini almashtirib ko‘ring.', task: 'Dvigatelni teskari aylantirish uchun nima qilish kerak?', minutes: 5 }]
  }
});

// Batch 4 — Chapter I (electrostatics) topics with a demonstration lab.
Object.assign((typeof window !== 'undefined' ? window : globalThis).EMPIRA_TOPICS, {
  'jismlarning-zaryadlanishi': {
    explain: [
      'Ishqalanganda jismlar elektrlanadi (zaryadlanadi): shoyiga ishqalangan shisha musbat, junga ishqalangan ebonit manfiy zaryadlanadi.',
      'Zaryadlarning ikki turi bor. Bir xil ishorali zaryadlar itarishadi, har xil ishoralilar esa tortishadi.'
    ],
    formulas: ['+ va + → itarishadi', '+ va − → tortishadi'],
    terms: [['+', 'musbat zaryad (shisha)', '—'], ['−', 'manfiy zaryad (ebonit)', '—']],
    labs: [{ slug: 'elektrlanish-turlari', title: 'Elektrlanishning ikki turi', goal: 'Ipga osilgan zaryadli tayoqchaga boshqa tayoqchani yaqinlashtirib, ular itarishishini yoki tortishishini kuzating.', task: 'Qanday tayoqchalar itarishadi, qanday tayoqchalar tortishadi?', minutes: 5 }]
  },
  'elektr-zaryad': {
    explain: [
      'Elektr zaryad — jismning elektr ta’sirlashuvga kirishish xususiyatini ifodalovchi kattalik. U q harfi bilan belgilanadi va kulonlarda (Kl) o‘lchanadi.',
      'Elektroskop jismning zaryadlanganligini ko‘rsatadi: zaryad qancha ko‘p bo‘lsa, barglar shuncha ko‘p ochiladi. Barglar zaryad ishorasidan qat’i nazar ochiladi.'
    ],
    formulas: ['q = N · e', 'e = 1,6 · 10⁻¹⁹ Kl'],
    terms: [['q', 'elektr zaryad', 'Kl'], ['e', 'elementar zaryad', 'Kl'], ['N', 'elektronlar soni', '—']],
    labs: [{ slug: 'elektroskop', title: 'Elektroskopni zaryadlash', goal: 'Zaryadli tayoqchani elektroskop sharchasiga bir necha marta tegizib, barglar ochilishini kuzating.', task: 'Zaryad ortsa, barglar orasidagi burchak qanday o‘zgaradi?', minutes: 5 }]
  },
  'zaryadlarning-ozaro-tasiri-kulon-qonuni': {
    explain: [
      'Ikki nuqtaviy zaryadning o‘zaro ta’sir kuchi zaryadlar ko‘paytmasiga to‘g‘ri, ular orasidagi masofaning kvadratiga teskari proporsional (Kulon qonuni).',
      'Kulon bu qonunni buralma tarozi yordamida aniqlagan: sharchalar itarishganda ip buraladi, burish burchagi kuchni ko‘rsatadi.'
    ],
    formulas: ['F = k · q₁ · q₂ / r²', 'k = 9 · 10⁹ N·m²/Kl²'],
    terms: [['F', 'o‘zaro ta’sir kuchi', 'N'], ['q₁, q₂', 'zaryadlar', 'Kl'], ['r', 'zaryadlar orasidagi masofa', 'm']],
    labs: [{ slug: 'kulon-qonuni', title: 'Kulon tajribasi (buralma tarozi)', goal: 'Sharchalar orasidagi masofa va zaryadni o‘zgartirib, ularning o‘zaro ta’sir kuchini o‘lchang.', task: 'Masofa 2 marta ortsa, kuch necha marta kamayadi?', minutes: 7 }]
  },
  'elektr-maydon': {
    explain: [
      'Har bir zaryad atrofida elektr maydon mavjud. Maydon boshqa zaryadlarga kuch bilan ta’sir qiladi.',
      'Maydonni kuch chiziqlari bilan tasvirlash mumkin: ular musbat zaryaddan chiqib, manfiy zaryadga kiradi. Moydagi mayda tolalar shu chiziqlar bo‘ylab tiziladi.'
    ],
    formulas: ['E = F / q', 'E = k · q / r²'],
    terms: [['E', 'maydon kuchlanganligi', 'N/Kl'], ['F', 'zaryadga ta’sir etuvchi kuch', 'N'], ['q', 'sinov zaryadi', 'Kl']],
    labs: [{ slug: 'elektr-maydon-chiziqlari', title: 'Elektr maydon kuch chiziqlari', goal: 'Turli elektrodlar atrofida moydagi tolalar qanday tizilishini kuzating.', task: 'Ikki plastinka orasida kuch chiziqlari qanday joylashadi?', minutes: 5 }]
  },
  'tabiatdagi-elektr-hodisalar': {
    explain: [
      'Chaqmoq — bulutlar orasida yoki bulut bilan Yer orasidagi ulkan uchqun razryadi. Momaqaldiroq — razryad qizdirgan havoning keskin kengayishidan chiqadigan tovush.',
      'Yorug‘lik deyarli bir zumda yetib keladi, tovush esa havoda 340 m/s tezlik bilan tarqaladi. Chaqmoq va momaqaldiroq orasidagi vaqtdan chaqmoqgacha masofani topish mumkin.'
    ],
    formulas: ['d = v · t', 'v = 340 m/s'],
    terms: [['d', 'chaqmoqgacha masofa', 'm'], ['v', 'tovush tezligi', 'm/s'], ['t', 'chaqmoq va momaqaldiroq orasidagi vaqt', 's']],
    labs: [{ slug: 'chaqmoq-masofasi', title: 'Chaqmoqgacha masofani aniqlash', goal: 'Chaqmoq chaqnagandan momaqaldiroq eshitilguncha vaqtni o‘lchab, chaqmoqgacha masofani hisoblang.', task: 'Momaqaldiroq 5 s dan keyin eshitilsa, chaqmoq qancha uzoqda?', minutes: 5 }]
  }
});

// Batch 5 — Chapter IV (current in different media) topics with a demonstration lab.
Object.assign((typeof window !== 'undefined' ? window : globalThis).EMPIRA_TOPICS, {
  'metallarda-elektr-toki': {
    explain: [
      'Metallarda elektr toki — erkin elektronlarning tartibli harakati. Musbat ionlar kristall panjarada o‘z joyida tebranadi.',
      'Tok yo‘nalishi deb musbat zaryadlar harakati yo‘nalishi qabul qilingan, shuning uchun elektronlar tok yo‘nalishiga teskari harakatlanadi.'
    ],
    formulas: ['I = q / t'],
    terms: [['I', 'tok kuchi', 'A'], ['e⁻', 'erkin elektron', '—'], ['+', 'kristall panjara ionlari', '—']],
    labs: [{ slug: 'metall-elektronlar', title: 'Metallda erkin elektronlar harakati', goal: 'Kalitni ulab, kattalashtirilgan metall o‘tkazgichda elektronlar qaysi tomonga harakatlanishini kuzating.', task: 'Elektronlar tok yo‘nalishi bo‘yicha harakatlanadimi yoki teskari?', minutes: 5 }]
  },
  'suyuqliklarda-elektr-toki': {
    explain: [
      'Distillangan suv tokni deyarli o‘tkazmaydi. Unga osh tuzi yoki mis kuporosi solinsa, eritma tok o‘tkaza boshlaydi.',
      'Bunday eritmalar elektrolitlar deyiladi: ularda molekulalar musbat va manfiy ionlarga ajraladi va tokni ana shu ionlar tashiydi. Shakar eritmasi ionlarga ajralmaydi.'
    ],
    formulas: ['NaCl → Na⁺ + Cl⁻'],
    terms: [['Na⁺, Cu²⁺', 'musbat ionlar (katodga boradi)', '—'], ['Cl⁻, SO₄²⁻', 'manfiy ionlar (anodga boradi)', '—']],
    labs: [{ slug: 'suyuqlik-otkazuvchanligi', title: 'Suyuqliklarning elektr o‘tkazuvchanligi', goal: 'Idishga turli suyuqliklar solib, zanjirdagi lampochka yonish-yonmasligini tekshiring.', task: 'Qaysi suyuqliklar tok o‘tkazadi va nima uchun?', minutes: 5 }]
  },
  'elektroliz-faradeyning-birinchi-qonuni': {
    explain: [
      'Elektroliz — elektrolitdan tok o‘tganda elektrodlarda modda ajralib chiqishi. Mis kuporosi eritmasida katodda sof mis o‘tiradi.',
      'Faradeyning birinchi qonuni: ajralgan modda massasi elektrolitdan o‘tgan zaryad miqdoriga proporsional.'
    ],
    formulas: ['m = k · q = k · I · t'],
    terms: [['m', 'ajralgan modda massasi', 'kg'], ['k', 'elektrokimyoviy ekvivalent (mis: 0,33 mg/Kl)', 'kg/Kl'], ['I', 'tok kuchi', 'A'], ['t', 'vaqt', 's']],
    labs: [{ slug: 'elektroliz', title: 'Mis kuporosi eritmasining elektrolizi', goal: 'Tok kuchi va vaqtni o‘zgartirib, katodda ajralgan mis massasini o‘lchang.', task: 'Tok kuchi 2 marta ortsa, ajralgan mis massasi qanday o‘zgaradi?', minutes: 7 }]
  },
  'faradeyning-ikkinchi-qonuni': {
    explain: [
      'Ketma-ket ulangan vannalardan bir xil zaryad o‘tadi, lekin ularda turli massadagi moddalar ajraladi.',
      'Faradeyning ikkinchi qonuni: elektrokimyoviy ekvivalent moddaning molyar massasiga to‘g‘ri, valentligiga teskari proporsional.'
    ],
    formulas: ['k = M / (F · n)', 'F = 96 500 Kl/mol'],
    terms: [['M', 'molyar massa (Cu: 64, Ag: 108 g/mol)', 'kg/mol'], ['n', 'valentlik (Cu: 2, Ag: 1)', '—'], ['F', 'Faradey doimiysi', 'Kl/mol']],
    labs: [{ slug: 'faradey-ikkinchi', title: 'Ketma-ket ulangan ikki elektrolitik vanna', goal: 'Mis va kumush eritmali vannalardan bir xil zaryad o‘tkazib, ajralgan massalarni solishtiring.', task: 'Nima uchun kumush misdan taxminan 3,4 marta ko‘p ajraladi?', minutes: 7 }]
  },
  'elektrolizdan-turmushda-va-texnikada-foydalanish': {
    explain: [
      'Galvanostegiya — buyumlarni elektroliz yordamida metallning yupqa qatlami bilan qoplash (nikellash, kumushlash, oltin suvi berish).',
      'Qoplanadigan buyum katod qilib, qoplama metali esa anod qilib olinadi. Qoplama qalinligi tok kuchi va vaqtga bog‘liq.'
    ],
    formulas: ['m = k · I · t', 'd = m / (ρ · S)'],
    terms: [['d', 'qoplama qalinligi', 'm'], ['ρ', 'metall zichligi', 'kg/m³'], ['S', 'buyum yuzasi (20 sm²)', 'm²']],
    labs: [{ slug: 'galvanostegiya', title: 'Qoshiqni metall bilan qoplash', goal: 'Qoshiqni mis, nikel yoki kumush bilan qoplab, qoplama qalinligini hisoblang.', task: 'Qoplash vaqti 3 marta ortsa, qatlam qalinligi qanday o‘zgaradi?', minutes: 6 }]
  },
  'vakuumda-elektr-toki': {
    explain: [
      'Vakuumda zaryad tashuvchilar yo‘q, shuning uchun tok o‘tmaydi. Katod qizdirilsa, undan elektronlar uchib chiqadi — termoelektron emissiya.',
      'Elektronlar faqat anod musbat bo‘lganda unga tortiladi. Shuning uchun vakuumli diod tokni faqat bir yo‘nalishda o‘tkazadi.'
    ],
    formulas: ['katod (qizdirilgan) → anod (+)'],
    terms: [['K', 'katod (qizdiriladigan sim)', '—'], ['A', 'anod', '—'], ['I', 'anod toki', 'mA']],
    labs: [{ slug: 'vakuum-diod', title: 'Edison tajribasi: vakuumli diod', goal: 'Katodni qizdirib va anod qutbini o‘zgartirib, vakuumdan tok o‘tish shartlarini aniqlang.', task: 'Qanday holatda vakuumli lampadan tok o‘tadi?', minutes: 5 }]
  },
  'gazlarda-elektr-toki': {
    explain: [
      'Oddiy sharoitda havo dielektrik: zaryadlangan elektrometr uzoq vaqt zaryadsizlanmaydi.',
      'Alanga, ultrabinafsha yoki rentgen nurlari havo molekulalarini ionlashtiradi. Ionlar paydo bo‘lgach, havo tok o‘tkaza boshlaydi va elektrometr tez zaryadsizlanadi.'
    ],
    formulas: ['molekula → ion⁺ + e⁻'],
    terms: [['ionlashish', 'neytral molekuladan elektron ajralishi', '—'], ['ionizator', 'alanga, nurlar', '—']],
    labs: [{ slug: 'gaz-ionlash', title: 'Alanga havoni ionlashtiradi', goal: 'Zaryadlangan elektrometrga ulangan plastinkalar orasiga sham qo‘yib, nima bo‘lishini kuzating.', task: 'Nima uchun sham qo‘yilganda elektrometr zaryadsizlanadi?', minutes: 5 }]
  },
  'elektr-razryadlarning-turlari-va-ulardan-foydalanish': {
    explain: [
      'Gazdagi mustaqil razryadning turlari: uchqun (juda yuqori kuchlanishda), elektr yoyi (katta tok va cho‘g‘langan elektrodlar) va miltillama razryad (past bosimdagi gazda).',
      'Uchqun razryadi — chaqmoq va dvigatel shamlarida, elektr yoyi — payvandlashda, miltillama razryad — reklama va kunduzgi yorug‘lik lampalarida uchraydi.'
    ],
    formulas: ['U(uchqun) ≈ 30 kV/sm havoda'],
    terms: [['uchqun', 'qisqa, yorqin razryad', '—'], ['yoy', 'uzluksiz, juda issiq razryad', '—'], ['miltillama', 'siyrak gazdagi nurlanish', '—']],
    labs: [{ slug: 'razryad-turlari', title: 'Elektr razryadlarining turlari', goal: 'Uchqun, elektr yoyi va miltillama razryadni navbatma-navbat kuzating.', task: 'Har bir razryad turi qayerda qo‘llaniladi?', minutes: 5 }]
  }
});

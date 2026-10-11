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

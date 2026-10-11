// Prototype sample data: 8-sinf annual plan.
// NOT the official curriculum. The structure (class → subject → chapter → topic, with week and lab link)
// follows the MVP plan; titles are realistic placeholders until the team's Day-1 curriculum map is ready.
// `lab: true` ONLY where a demo lab screen exists in ../lab/ (3 labs). Everything else is "Tez orada".

window.EMPIRA_PLAN = {
  grade: 8,
  // PROTOTYPE SETTING, not calendar logic: which week the demo treats as "Shu hafta".
  // Change it here, or override per session with ?hafta=22 on the Class Plan URL.
  demoThisWeek: 7,
  subjects: [
    { id: 'fizika', name: 'Fizika', available: true },
    // Shown only with ?fanlar=3 to preview how more subjects slot in later
    { id: 'kimyo', name: 'Kimyo', available: false },
    { id: 'biologiya', name: 'Biologiya', available: false }
  ],
  chapters: [
    {
      n: 1, title: 'Mexanik harakat',
      topics: [
        { w: 1, t: 'Mexanik harakat va uning nisbiyligi' },
        { w: 2, t: 'Tekis harakat. Tezlik' },
        { w: 3, t: 'Notekis harakat. O‘rtacha tezlik' },
        { w: 4, t: 'Tezlanish' },
        { w: 5, t: 'Jismlarning erkin tushishi' },
        { w: 6, t: 'Nyutonning birinchi qonuni' },
        { w: 7, t: 'Nyutonning ikkinchi qonuni', lab: true },
        { w: 8, t: 'Nyutonning uchinchi qonuni' }
      ]
    },
    {
      n: 2, title: 'Tabiatdagi kuchlar',
      topics: [
        { w: 9,  t: 'Elastiklik kuchi. Guk qonuni', lab: true },
        { w: 10, t: 'Ishqalanish kuchi' },
        { w: 11, t: 'Butun olam tortishish qonuni' },
        { w: 12, t: 'Og‘irlik kuchi va jism vazni' }
      ]
    },
    {
      n: 3, title: 'Mexanik tebranishlar va to‘lqinlar',
      topics: [
        { w: 13, t: 'Tebranma harakat' },
        { w: 14, t: 'Matematik mayatnik' },
        { w: 15, t: 'Prujinali mayatnik' },
        { w: 16, t: 'Mexanik to‘lqinlar' },
        { w: 17, t: 'Tovush va uning xususiyatlari' }
      ]
    },
    {
      n: 4, title: 'Elektr toki',
      topics: [
        { w: 18, t: 'Elektr zaryadi va elektr maydoni' },
        { w: 19, t: 'Elektr toki. Tok kuchi' },
        { w: 20, t: 'Elektr kuchlanishi' },
        { w: 21, t: 'Elektr qarshiligi' },
        { w: 22, t: 'Om qonuni', lab: true },
        { w: 23, t: 'O‘tkazgichlarni ketma-ket ulash' },
        { w: 24, t: 'O‘tkazgichlarni parallel ulash' }
      ]
    },
    {
      n: 5, title: 'Yorug‘lik hodisalari',
      topics: [
        { w: 25, t: 'Yorug‘likning to‘g‘ri chiziq bo‘ylab tarqalishi' },
        { w: 26, t: 'Yorug‘likning qaytishi. Yassi ko‘zgu' },
        { w: 27, t: 'Yorug‘likning sinishi' },
        { w: 28, t: 'Linzalar. Linzada tasvir yasash' }
      ]
    }
  ]
};

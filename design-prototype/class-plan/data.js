// 8-sinf Fizika annual plan — from the real textbook:
//   P. Habibullayev, A. Boydedayev, A. Bahromov, K. Suyarov, J. Usarov, M. Yuldasheva.
//   Fizika. 8-sinf. Toshkent: «O‘qituvchi», 2019 (5 chapters, 60 sections).
// Fields per topic: n = § number, t = title, p = first textbook page (used by scanning), w = week, lab = has a 3D lab.
// Weeks are APPROXIMATE (2 lessons a week, in book order) until the official yearly plan (taqvim-mavzu reja) is added.
// `lab: true` only for the 10 lab works / practicals that have a 3D lab in ../lab/. Everything else shows "Tez orada".
// Works in the browser (window) and on the server (api/scan.js reads this file).

(typeof window !== 'undefined' ? window : globalThis).EMPIRA_PLAN = {
  grade: 8,
  book: 'Fizika. 8-sinf. «O‘qituvchi», 2019',
  // PROTOTYPE SETTING, not calendar logic: which week the demo treats as "Shu hafta".
  // Change it here, or override per session with ?hafta=N on the Class Plan URL.
  demoThisWeek: 10,
  subjects: [
    { id: 'fizika', name: 'Fizika', available: true },
    // Shown only with ?fanlar=3 to preview how more subjects slot in later
    { id: 'kimyo', name: 'Kimyo', available: false },
    { id: 'biologiya', name: 'Biologiya', available: false }
  ],
  chapters: [
    {
      n: 1, title: 'Elektr zaryad. Elektr maydon',
      topics: [
        { n: 1, p: 4, w: 1, t: 'Jismlarning zaryadlanishi', lab: true },
        { n: 2, p: 9, w: 1, t: 'Elektr zaryad', lab: true },
        { n: 3, p: 12, w: 2, t: 'Zaryadlarning o‘zaro ta’siri. Kulon qonuni', lab: true },
        { n: 4, p: 15, w: 2, t: 'Masalalar yechish (Kulon qonuni)' },
        { n: 5, p: 18, w: 3, t: 'Elektr maydon', lab: true },
        { n: 6, p: 22, w: 3, t: 'O‘tkazgichlarda elektr zaryadlarning taqsimlanishi', lab: true },
        { n: 7, p: 25, w: 4, t: 'Masalalar yechish (elektr maydon)' },
        { n: 8, p: 27, w: 4, t: 'Tabiatdagi elektr hodisalar', lab: true }
      ]
    },
    {
      n: 2, title: 'Elektr toki',
      topics: [
        { n: 9, p: 32, w: 5, t: 'Elektr toki haqida tushuncha' , lab: true },
        { n: 10, p: 34, w: 5, t: 'Tok manbalari' , lab: true },
        { n: 11, p: 39, w: 6, t: 'Elektr kuchlanish va uni o‘lchash' , lab: true },
        { n: 12, p: 42, w: 6, t: 'Tok kuchi va uni o‘lchash' , lab: true },
        { n: 13, p: 45, w: 7, t: 'Masalalar yechish (tok kuchi va kuchlanish)' },
        { n: 14, p: 46, w: 7, t: 'Laboratoriya ishi. Elektr zanjirni yig‘ish va o‘lchash', lab: true },
        { n: 15, p: 47, w: 8, t: 'Elektr qarshilik' , lab: true },
        { n: 16, p: 52, w: 8, t: 'Rezistorlar. Reostatlar. Potensiometrlar' , lab: true },
        { n: 17, p: 56, w: 9, t: 'Zanjirning bir qismi uchun Om qonuni' , lab: true },
        { n: 18, p: 60, w: 9, t: 'Masalalar yechish (Om qonuni)' },
        { n: 19, p: 61, w: 10, t: 'Laboratoriya ishi. Om qonunini o‘rganish', lab: true },
        { n: 20, p: 63, w: 10, t: 'Amaliy mashg‘ulot. Reostat yordamida tok kuchini rostlash', lab: true },
        { n: 21, p: 64, w: 11, t: 'Iste’molchilarni ketma-ket ulash' , lab: true },
        { n: 22, p: 67, w: 11, t: 'Iste’molchilarni parallel ulash' , lab: true },
        { n: 23, p: 71, w: 12, t: 'Amaliy mashg‘ulot. Tok manbalarini ulash', lab: true },
        { n: 24, p: 72, w: 12, t: 'Laboratoriya ishi. O‘tkazgichlarni ketma-ket va parallel ulash', lab: true },
        { n: 25, p: 75, w: 13, t: 'Iste’molchilarni aralash ulash' },
        { n: 26, p: 76, w: 13, t: 'Masalalar yechish (ulash usullari)' },
        { n: 27, p: 78, w: 14, t: 'Elektr sig‘imi. Kondensatorlar' , lab: true },
        { n: 28, p: 82, w: 14, t: 'Kondensatorlarni parallel va ketma-ket ulash' },
        { n: 29, p: 84, w: 15, t: 'Masalalar yechish (kondensatorlar)' }
      ]
    },
    {
      n: 3, title: 'Elektr tokining ishi va quvvati',
      topics: [
        { n: 30, p: 88, w: 15, t: 'Elektr tokining ishi' },
        { n: 31, p: 90, w: 16, t: 'Elektr tokining quvvati' },
        { n: 32, p: 94, w: 16, t: 'Masalalar yechish (ish va quvvat)' },
        { n: 33, p: 96, w: 17, t: 'Laboratoriya ishi. Lampochkaning elektr quvvatini aniqlash', lab: true },
        { n: 34, p: 97, w: 17, t: 'Elektr toki ta’sirida o‘tkazgichlarning qizishi' , lab: true },
        { n: 35, p: 100, w: 18, t: 'Masalalar yechish (Joul–Lens qonuni)' },
        { n: 36, p: 102, w: 18, t: 'Joul–Lens qonunining amaliy tatbiqlari' , lab: true },
        { n: 37, p: 104, w: 19, t: 'Xonadonlardagi elektr zanjirlar va ulashlar' , lab: true },
        { n: 38, p: 108, w: 19, t: 'Elektr xavfsizlik choralari' },
        { n: 39, p: 111, w: 20, t: 'Masalalar yechish (III bob)' }
      ]
    },
    {
      n: 4, title: 'Turli muhitlarda elektr toki',
      topics: [
        { n: 40, p: 115, w: 20, t: 'Metallarda elektr toki', lab: true },
        { n: 41, p: 117, w: 21, t: 'Suyuqliklarda elektr toki', lab: true },
        { n: 42, p: 120, w: 21, t: 'Elektroliz. Faradeyning birinchi qonuni', lab: true },
        { n: 43, p: 123, w: 22, t: 'Faradeyning ikkinchi qonuni', lab: true },
        { n: 44, p: 125, w: 22, t: 'Masalalar yechish (elektroliz)' },
        { n: 45, p: 127, w: 23, t: 'Elektrolizdan turmushda va texnikada foydalanish', lab: true },
        { n: 46, p: 129, w: 23, t: 'Vakuumda elektr toki', lab: true },
        { n: 47, p: 131, w: 24, t: 'Gazlarda elektr toki', lab: true },
        { n: 48, p: 133, w: 24, t: 'Elektr razryadlarning turlari va ulardan foydalanish', lab: true }
      ]
    },
    {
      n: 5, title: 'Magnit maydon',
      topics: [
        { n: 49, p: 139, w: 25, t: 'Magnit maydon. Doimiy magnit va uning qutblari', lab: true },
        { n: 50, p: 143, w: 25, t: 'Magnit maydonni xarakterlovchi parametrlar', lab: true },
        { n: 51, p: 145, w: 26, t: 'Yerning magnit maydoni', lab: true },
        { n: 52, p: 146, w: 26, t: 'Tokning magnit maydoni', lab: true },
        { n: 53, p: 149, w: 27, t: 'Magnit maydonning tokli o‘tkazgichga ta’siri', lab: true },
        { n: 54, p: 151, w: 27, t: 'Masalalar yechish (magnit maydon)' },
        { n: 55, p: 153, w: 28, t: 'Bir jinsli magnit maydonda tokli ramkaning aylanma harakati', lab: true },
        { n: 56, p: 155, w: 28, t: 'Magnit maydonda zaryadli zarraning harakati' },
        { n: 57, p: 157, w: 29, t: 'Elektromagnitlar. Elektromagnit rele', lab: true },
        { n: 58, p: 161, w: 29, t: 'Laboratoriya ishi. Eng oddiy elektromagnitni yig‘ish', lab: true },
        { n: 59, p: 162, w: 30, t: 'O‘zgarmas tok elektr dvigateli', lab: true },
        { n: 60, p: 165, w: 30, t: 'Masalalar yechish (V bob)' }
      ]
    }
  ]
};

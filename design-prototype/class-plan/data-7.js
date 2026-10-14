// 7-sinf Fizika annual plan — from the real textbook:
//   P. Habibullayev, A. Boydedayev, A. Bahromov, S. Burxonov. Fizika. 7-sinf.
//   Toshkent: «O‘zbekiston milliy ensiklopediyasi», 2017 (7 chapters, 46 sections, 5 laboratoriya ishlari).
// Same fields as data.js (8-sinf): n = § number, t = title, p = first textbook page (used by scanning), w = week, lab = has a 3D lab.
// Weeks are APPROXIMATE (in book order over 34 weeks) until the official yearly plan (taqvim-mavzu reja) is added.
// Every topic except §2 (Fazo va vaqt: nothing to measure) has a 3D lab (see ../topic/content-7.js and ../lab/labs-7*.js).
// Load after data.js. Works in the browser (window) and on the server (api/scan.js reads this file).
(function (root) {
  root.EMPIRA_PLANS = root.EMPIRA_PLANS || {};
  root.EMPIRA_PLANS[7] = {
    grade: 7,
    book: 'Fizika. 7-sinf. «O‘zbekiston milliy ensiklopediyasi», 2017',
    lastPage: 170,
    demoThisWeek: 10,
    subjects: [
      { id: 'fizika', name: 'Fizika', available: true },
      { id: 'kimyo', name: 'Kimyo', available: false },
      { id: 'biologiya', name: 'Biologiya', available: false }
    ],
    chapters: [
      {
        n: 1, title: 'Mexanik harakat haqida umumiy ma’lumotlar',
        topics: [
          { n: 1, p: 8, w: 1, t: 'Jismlarning harakati', lab: true },
          { n: 2, p: 11, w: 1, t: 'Fazo va vaqt' },
          { n: 3, p: 14, w: 2, t: 'Kinematikaning asosiy tushunchalari', lab: true },
          { n: 4, p: 18, w: 3, t: 'Skalyar va vektor kattaliklar hamda ular ustida amallar', lab: true }
        ]
      },
      {
        n: 2, title: 'To‘g‘ri chiziqli harakat',
        topics: [
          { n: 5, p: 26, w: 3, t: 'To‘g‘ri chiziqli tekis harakat haqida tushuncha', lab: true },
          { n: 6, p: 28, w: 4, t: 'To‘g‘ri chiziqli tekis harakat tezligi', lab: true },
          { n: 7, p: 32, w: 5, t: 'To‘g‘ri chiziqli tekis harakatning grafik tasviri', lab: true },
          { n: 8, p: 34, w: 6, t: 'Notekis harakatda tezlik', lab: true },
          { n: 9, p: 37, w: 6, t: 'Tekis o‘zgaruvchan harakatda tezlanish', lab: true },
          { n: 10, p: 40, w: 7, t: 'Tekis o‘zgaruvchan harakat tezligi', lab: true },
          { n: 11, p: 44, w: 8, t: 'Tekis o‘zgaruvchan harakatda bosib o‘tilgan yo‘l', lab: true },
          { n: 12, p: 47, w: 9, t: 'Laboratoriya ishi. Tekis tezlanuvchan harakatlanayotgan jism tezlanishini aniqlash', lab: true },
          { n: 13, p: 48, w: 9, t: 'Jismlarning erkin tushishi', lab: true },
          { n: 14, p: 50, w: 10, t: 'Yuqoriga tik otilgan jismning harakati', lab: true }
        ]
      },
      {
        n: 3, title: 'Tekis aylanma harakat',
        topics: [
          { n: 15, p: 56, w: 11, t: 'Jismning tekis aylanma harakati', lab: true },
          { n: 16, p: 59, w: 12, t: 'Aylanma harakatni tavsiflaydigan kattaliklar orasidagi munosabatlar', lab: true },
          { n: 17, p: 62, w: 12, t: 'Markazga intilma tezlanish', lab: true }
        ]
      },
      {
        n: 4, title: 'Harakat qonunlari',
        topics: [
          { n: 18, p: 69, w: 13, t: 'Jismlarning o‘zaro ta’siri. Kuch', lab: true },
          { n: 19, p: 72, w: 14, t: 'Nyutonning birinchi qonuni — inersiya qonuni', lab: true },
          { n: 20, p: 76, w: 15, t: 'Jism massasi', lab: true },
          { n: 21, p: 78, w: 15, t: 'Nyutonning ikkinchi qonuni', lab: true },
          { n: 22, p: 82, w: 16, t: 'Nyutonning uchinchi qonuni', lab: true },
          { n: 23, p: 86, w: 17, t: 'Harakat qonunlarining aylanma harakatga tatbiqi', lab: true },
          { n: 24, p: 88, w: 18, t: 'Elastiklik kuchi', lab: true },
          { n: 25, p: 93, w: 18, t: 'Laboratoriya ishi. Prujina bikirligini aniqlash', lab: true }
        ]
      },
      {
        n: 5, title: 'Tashqi kuchlar ta’sirida jismlarning harakati',
        topics: [
          { n: 26, p: 97, w: 19, t: 'Butun olam tortishish qonuni', lab: true },
          { n: 27, p: 100, w: 20, t: 'Og‘irlik kuchi', lab: true },
          { n: 28, p: 102, w: 20, t: 'Jismning og‘irligi', lab: true },
          { n: 29, p: 105, w: 21, t: 'Yuklama va vaznsizlik', lab: true },
          { n: 30, p: 108, w: 22, t: 'Yerning tortish kuchi ta’sirida jismlarning harakati', lab: true },
          { n: 31, p: 112, w: 23, t: 'Yerning sun’iy yo‘ldoshlari', lab: true },
          { n: 32, p: 115, w: 23, t: 'Ishqalanish kuchi. Tinchlikdagi ishqalanish', lab: true },
          { n: 33, p: 118, w: 24, t: 'Sirpanish ishqalanish. Dumalanish ishqalanish', lab: true },
          { n: 34, p: 122, w: 25, t: 'Laboratoriya ishi. Sirpanish ishqalanish koeffitsiyentini aniqlash', lab: true },
          { n: 35, p: 123, w: 26, t: 'Tabiatda va texnikada ishqalanish', lab: true }
        ]
      },
      {
        n: 6, title: 'Impulsning saqlanish qonuni',
        topics: [
          { n: 36, p: 130, w: 26, t: 'Impuls', lab: true },
          { n: 37, p: 135, w: 27, t: 'Impulsning saqlanish qonuni', lab: true },
          { n: 38, p: 140, w: 28, t: 'Reaktiv harakat', lab: true }
        ]
      },
      {
        n: 7, title: 'Ish va energiya. Energiyaning saqlanish qonuni',
        topics: [
          { n: 39, p: 147, w: 29, t: 'Mexanik ish', lab: true },
          { n: 40, p: 151, w: 29, t: 'Laboratoriya ishi. Jismni ko‘tarishda va shu masofaga gorizontal ko‘chirishda bajarilgan ishni hisoblash', lab: true },
          { n: 41, p: 152, w: 30, t: 'Potensial energiya', lab: true },
          { n: 42, p: 155, w: 31, t: 'Kinetik energiya', lab: true },
          { n: 43, p: 157, w: 32, t: 'Mexanik energiyaning saqlanish qonuni', lab: true },
          { n: 44, p: 162, w: 32, t: 'Laboratoriya ishi. Jism kinetik energiyasining uning tezligi va massasiga bog‘liqligini aniqlash', lab: true },
          { n: 45, p: 163, w: 33, t: 'Quvvat', lab: true },
          { n: 46, p: 166, w: 34, t: 'Tabiatda energiyaning saqlanishi. Foydali ish koeffitsiyenti', lab: true }
        ]
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

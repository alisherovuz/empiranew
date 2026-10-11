// Prototype sample content for the 3 topics that have a demo lab (keyed by topic slug).
// Physics is correct, but wording is placeholder until the team writes the real Day-1/Day-5 content.
// The plan order (chapters, weeks) comes from ../class-plan/data.js.

window.EMPIRA_TOPICS = {
  'nyutonning-ikkinchi-qonuni': {
    explain: [
      'Jismning tezlanishi unga ta’sir etayotgan kuchga to‘g‘ri proporsional, jism massasiga esa teskari proporsional.',
      'Kuch qancha katta bo‘lsa, jism shuncha tez tezlanadi. Massa qancha katta bo‘lsa, tezlanish shuncha kichik bo‘ladi. Tezlanish har doim kuch yo‘nalishida bo‘ladi.'
    ],
    formulas: ['F = m · a'],
    terms: [['F', 'kuch', 'N (nyuton)'], ['m', 'massa', 'kg'], ['a', 'tezlanish', 'm/s²']],
    labs: [{
      title: 'Aravachaning tezlanishi',
      goal: 'Aravachaga turli kuch qo‘yib va yuk qo‘shib, tezlanish qanday o‘zgarishini kuzating.',
      task: 'Kuch 2 marta oshsa, tezlanish qanday o‘zgaradi?',
      minutes: 10
    }]
  },
  'elastiklik-kuchi-guk-qonuni': {
    explain: [
      'Jism cho‘zilganda yoki siqilganda unda elastiklik kuchi paydo bo‘ladi.',
      'Kichik deformatsiyalarda elastiklik kuchi jismning uzayishiga to‘g‘ri proporsional. Proporsionallik koeffitsienti k bikrlik deb ataladi.'
    ],
    formulas: ['F = k · x'],
    terms: [['F', 'elastiklik kuchi', 'N'], ['k', 'bikrlik', 'N/m'], ['x', 'uzayish', 'm']],
    labs: [{
      title: 'Prujinaning cho‘zilishi',
      goal: 'Prujinaga yuk osib, kuch va cho‘zilish orasidagi bog‘liqlikni toping.',
      task: 'Yuk 2 marta oshsa, prujinaning uzayishi qanday o‘zgaradi?',
      minutes: 10
    }]
  },
  'om-qonuni': {
    explain: [
      'Zanjir qismidagi tok kuchi shu qismdagi kuchlanishga to‘g‘ri proporsional, qarshilikka esa teskari proporsional.',
      'Kuchlanish oshsa, tok kuchi ham oshadi. Qarshilik oshsa, tok kuchi kamayadi.'
    ],
    formulas: ['I = U / R'],
    terms: [['I', 'tok kuchi', 'A (amper)'], ['U', 'kuchlanish', 'V (volt)'], ['R', 'qarshilik', 'Ω (om)']],
    labs: [{
      title: 'Om qonuni',
      goal: 'Zanjir yig‘ib, qarshilik va tok kuchi orasidagi bog‘liqlikni toping.',
      task: 'Qarshilik 2 marta oshsa, tok kuchi qanday o‘zgaradi?',
      minutes: 10
    }]
  },
};

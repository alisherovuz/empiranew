// 7-sinf Fizika — content for every topic (keyed by topic slug), added to EMPIRA_TOPICS from content.js.
// Explanations, formulas and terms follow the textbook (Fizika 7-sinf, 2017); each lab's goal and question follow the
// book's own experiment or laboratoriya ishi. Each lab's `slug` is its id in ../lab/labs-7*.js (?lab=<slug>).
// To be reviewed by a physics teacher before the pilot. Load after content.js.
(function (root) {
  root.EMPIRA_TOPICS = root.EMPIRA_TOPICS || {};
  Object.assign(root.EMPIRA_TOPICS, {

    /* 1-§ Jismlarning harakati */
    'jismlarning-harakati': {
      explain: ['Jismning mexanik harakati deb uning boshqa jismlarga nisbatan fazodagi vaziyatining vaqt o‘tishi bilan o‘zgarishiga aytiladi. Harakat ham, tinch turish ham nisbiy: qayiqda o‘tirgan odam qayiqqa nisbatan tinch, daryo qirg‘og‘iga nisbatan esa harakatda bo‘ladi.', 'Harakat qaysi jismga nisbatan kuzatilsa, o‘sha jism sanoq jism deyiladi. Sanoq jism, unga bog‘langan koordinatalar sistemasi va vaqt sanog‘i birgalikda sanoq sistemasini tashkil etadi. Masalan, Yerga nisbatan 10 m/s tezlikda ketayotgan platformada shu yo‘nalishda 1 m/s tezlik bilan yurgan odamning tezligi platformaga nisbatan 1 m/s, Yerga nisbatan esa 11 m/s bo‘ladi.'],
      formulas: [],
      terms: [['υ', 'tezlik', 'm/s'], ['s', 'bosib o‘tilgan masofa', 'm'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'harakat-nisbiyligi',
        title: 'Harakatning nisbiyligi',
        goal: 'Harakatlanayotgan aravacha ustidagi o‘yinchoq tezligini aravachaga va stolga nisbatan o‘lchab, natijalarni solishtiring.',
        task: 'Bir jismning tezligi turli sanoq jismlarga nisbatan bir xil bo‘ladimi?',
        minutes: 8
      }]
    },
    /* 2-§ Fazo va vaqt */
    'fazo-va-vaqt': {
      explain: ['Olamdagi barcha narsalar fazoda joylashgan: fazo materiya bilan ajralmas, cheksiz va uch o‘lchamli. Yorug‘lik 1 s da 300 000 km yo‘l bosadi, lekin eng yaqin yulduz (Sentavr) nuri bizga 4 yilda yetib keladi, ya’ni u bizdan taxminan 37,9 trillion km uzoqda.', 'To‘g‘ri yo‘ldagi avtomobil harakati bir o‘lchamli, tekislikdagi harakat ikki o‘lchamli, samolyot yoki qush parvozi esa uch o‘lchamli koordinatalarda tasvirlanadi. Vaqt hodisalarning ketma-ketligini va davomiyligini ifodalaydi, u o‘tmishdan kelajakka o‘sib boruvchi bir o‘lchamli kattalik bo‘lib, XBS da sekundlarda o‘lchanadi.'],
      formulas: ['s = υ·t'],
      terms: [['s', 'masofa', 'm'], ['υ', 'tezlik (yorug‘lik tezligi)', 'm/s'], ['t', 'vaqt', 's']],
      labs: []
    },
    /* 3-§ Kinematikaning asosiy tushunchalari */
    'kinematikaning-asosiy-tushunchalari': {
      explain: ['Kinematika jism harakatini uning massasi va harakatga keltiruvchi sabablarni hisobga olmasdan o‘rganadi, uning asosiy vazifasi jismning istalgan vaqtdagi koordinatalarini aniqlashdir. Muayyan sharoitda o‘lchami va shakli hisobga olinmasa ham bo‘ladigan jism moddiy nuqta deyiladi: 10 km yo‘l bosayotgan 4 m li avtomobilni moddiy nuqta deb olish mumkin, gimnastika qilayotgan o‘quvchini esa mumkin emas.', 'Moddiy nuqta bosib o‘tgan nuqtalarni birlashtiruvchi chiziq trayektoriya, trayektoriya uzunligi esa yo‘l (s) deyiladi; boshlang‘ich va oxirgi vaziyatni tutashtiruvchi yo‘nalishli kesma ko‘chish deb ataladi. Ko‘l bo‘yidagi so‘qmoqdan A dan B ga 100 m yo‘l yurilsa, ko‘chish atigi 40 m bo‘ladi; jismning hamma nuqtalari bir xil ko‘chsa, bunday harakat ilgarilanma harakat deyiladi.'],
      formulas: [],
      terms: [['s', 'yo‘l', 'm'], ['|s|', 'ko‘chish moduli', 'm']],
      labs: [{
        slug: 'yol-va-kochish',
        title: 'Yo‘l va ko‘chish',
        goal: 'O‘yinchoq mashinani turli marshrutlarda yurgizib, bosib o‘tilgan yo‘l va ko‘chishni o‘lchang.',
        task: 'Qachon yo‘l ko‘chishdan katta bo‘ladi va qachon ular teng bo‘ladi?',
        minutes: 8
      }]
    },
    /* 4-§ Skalyar va vektor kattaliklar hamda ular ustida amallar */
    'skalyar-va-vektor-kattaliklar-hamda-ular-ustida-amallar': {
      explain: ['Faqat son qiymati bilan aniqlanadigan kattaliklar (hajm, vaqt, yo‘l, massa, energiya) skalyar kattaliklar deyiladi va ular ustida amallar sonlar kabi bajariladi: 8 kg + 4 kg = 12 kg. Son qiymati va yo‘nalishi bilan aniqlanadigan kattaliklar (kuch, tezlik, ko‘chish) vektor kattaliklar deyiladi; ularni yozishda harf ustiga strelka qo‘yiladi.', 'Vektorlar uchburchak qoidasi bilan qo‘shiladi: birinchi vektorning oxiriga ikkinchisining boshi qo‘yiladi, shuning uchun 4 m va 3 m li ko‘chishlar yig‘indisi 7 m emas, 5 m bo‘lishi mumkin. Vektor musbat songa ko‘paytirilsa, uning kattaligi shu son marta ortadi, yo‘nalishi esa o‘zgarmaydi; aravachani burchak ostida tortayotgan 5 N kuchning harakat yo‘nalishidagi proyeksiyasi 3 N, vertikal proyeksiyasi esa 4 N bo‘lishi mumkin.'],
      formulas: ['s = s₁ + s₂', 'c = a + b', 'b = c − a'],
      terms: [['F', 'kuch (vektor)', 'N'], ['υ', 'tezlik (vektor)', 'm/s'], ['s', 'ko‘chish (vektor)', 'm'], ['m', 'massa (skalyar)', 'kg']],
      labs: [{
        slug: 'daryodan-suzib-otish',
        title: 'Daryodan suzib o‘tish: tezliklarni qo‘shish',
        goal: 'Oqimli novdan o‘tayotgan qayiq modelining qirg‘oqqa nisbatan tezligi va ko‘chishini o‘lchang.',
        task: 'Qayiqning qirg‘oqqa nisbatan tezligi uning o‘z tezligi bilan oqim tezligining oddiy yig‘indisiga tengmi?',
        minutes: 8
      }]
    },
    /* 5-§ To‘g‘ri chiziqli tekis harakat haqida tushuncha */
    'togri-chiziqli-tekis-harakat-haqida-tushuncha': {
      explain: [
      'Agar jism ixtiyoriy teng vaqtlar oralig‘ida bir xil yo‘lni bosib o‘tsa, uning harakati tekis harakat deyiladi. Trayektoriyasi to‘g‘ri chiziqdan iborat harakat esa to‘g‘ri chiziqli harakatdir. Ikkala shart birga bajarilsa, harakat to‘g‘ri chiziqli tekis harakat bo‘ladi.',
      'Tomizg‘ichli aravacha tajribasida tomchilar orasidagi masofa bir xil bo‘lsa, aravacha tekis harakat qilgan bo‘ladi, masofalar har xil bo‘lsa, notekis. Soat millari uchi tekis harakat qiladi, lekin trayektoriyasi aylana bo‘lgani uchun bu to‘g‘ri chiziqli tekis harakat emas. Ko‘tarilish, pasayish va burilishlarsiz yo‘lda tezligini o‘zgartirmay ketayotgan avtomobil to‘g‘ri chiziqli tekis harakatga misoldir.',
    ],
      formulas: [],
      terms: [['s', 'yo‘l', 'm'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'tomizgichli-aravacha',
        title: 'Tomizg‘ichli aravacha: tekis va notekis harakat',
        goal: 'Osilgan yukni o‘zgartirib, tomchilar orasidagi masofani o‘lchang va harakat tekis yoki notekis ekanini aniqlang.',
        task: 'Qanday holda aravacha teng vaqtlarda teng yo‘l bosib o‘tadi?',
        minutes: 8
      }]
    },
    /* 6-§ To‘g‘ri chiziqli tekis harakat tezligi */
    'togri-chiziqli-tekis-harakat-tezligi': {
      explain: [
      'Tekis harakatda tezlik jism bosib o‘tgan yo‘lning shu yo‘lni o‘tish uchun ketgan vaqtga nisbatiga teng. Tezlik son jihatdan jismning vaqt birligida bosib o‘tgan yo‘liga teng: tezligi 6 m/s bo‘lgan jism har sekundda 6 m o‘tadi.',
      'XBSda tezlik birligi m/s, amalda km/soat, km/min, km/s, sm/s ham ishlatiladi: 1 m/s = 3,6 km/soat. Masalan, 10 m/s = 36 km/soat, 90 km/soat = 25 m/s. Avtomobil tezligi spidometr bilan o‘lchanadi: g‘ildirak aylana uzunligi 2 m bo‘lib, sekundiga 10 marta aylansa, tezlik 20 m/s, ya’ni 72 km/soat bo‘ladi.',
    ],
      formulas: ['υ = s / t', '1 m/s = 3,6 km/soat'],
      terms: [['υ', 'tezlik', 'm/s'], ['s', 'yo‘l', 'm'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'havo-pufagi',
        title: 'Suvli naydagi havo pufagining tezligi',
        goal: 'Suv to‘ldirilgan nayda havo pufagining turli masofalarni o‘tish vaqtini o‘lchab, uning tezligini hisoblang.',
        task: 'Havo pufagi nay bo‘ylab qanday tezlik bilan harakatlanadi va bu tezlik yo‘lning har bir qismida bir xilmi?',
        minutes: 8
      }]
    },
    /* 7-§ To‘g‘ri chiziqli tekis harakatning grafik tasviri */
    'togri-chiziqli-tekis-harakatning-grafik-tasviri': {
      explain: [
      'Tezlik ma’lum bo‘lsa, tekis harakatda bosib o‘tilgan yo‘l s = υ·t, harakat vaqti esa t = s / υ formuladan topiladi. Masalan, 8 m/s tezlikdagi jism 10 s da 80 m o‘tadi, 12 m/s tezlikdagi jism 60 m ni 5 s da o‘tadi.',
      'Tekis harakatda tezlik grafigi vaqt o‘qiga parallel to‘g‘ri chiziq bo‘lib, uning ostidagi to‘g‘ri to‘rtburchak yuzi son jihatdan yo‘lga teng. Yo‘l grafigi esa koordinata boshidan chiquvchi to‘g‘ri chiziq: tezlik qancha katta bo‘lsa, grafik vaqt o‘qiga nisbatan shuncha tik joylashadi.',
    ],
      formulas: ['s = υ · t', 't = s / υ'],
      terms: [['s', 'yo‘l', 'm'], ['υ', 'tezlik', 'm/s'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'yol-grafigi',
        title: 'Ikki aravachaning yo‘l grafigi',
        goal: 'Ikki xil tezlikda tekis yurayotgan aravachalarning 1 m yo‘lni o‘tish vaqtini o‘lchab, ularning yo‘l grafiklarini solishtiring.',
        task: 'Tezroq harakatlanayotgan jismning yo‘l grafigi sekinroq jismnikidan qanday farq qiladi?',
        minutes: 8
      }]
    },
    /* 8-§ Notekis harakatda tezlik */
    'notekis-harakatda-tezlik': {
      explain: [
      'Harakat davomida tezligining son qiymati o‘zgarib turadigan harakat notekis harakat deyiladi. Notekis harakatda o‘rtacha tezlik butun bosib o‘tilgan yo‘lning shu yo‘lga ketgan butun vaqtga nisbatiga teng: yarim soatda 35 km yurgan avtomobilning o‘rtacha tezligi 70 km/soat.',
      'O‘rtacha tezlik yo‘lning har bir nuqtasidagi tezlikni bildirmaydi. Jismning muayyan paytdagi yoki trayektoriyaning ma’lum nuqtasidagi tezligi oniy tezlik deyiladi; uni taqriban topish uchun shu nuqta atrofida kichik Δt vaqtda o‘tilgan Δs yo‘l olinadi: Δs = 3 m, Δt = 0,3 s bo‘lsa, υ ≈ 10 m/s = 36 km/soat.',
    ],
      formulas: ['υo‘rt = (s₁ + s₂ + … + sₙ) / (t₁ + t₂ + … + tₙ)', 's = υo‘rt · t', 'υ ≈ Δs / Δt'],
      terms: [['υo‘rt', 'o‘rtacha tezlik', 'm/s'], ['υ', 'oniy tezlik', 'm/s'], ['Δs', 'kichik yo‘l oralig‘i', 'm'], ['Δt', 'kichik vaqt oralig‘i', 's']],
      labs: [{
        slug: 'oniy-tezlik',
        title: 'O‘rtacha va oniy tezlik',
        goal: 'Qiya yo‘lkadan tushayotgan aravachaning butun yo‘ldagi o‘rtacha tezligini va tanlangan nuqtadagi oniy tezligini o‘lchang.',
        task: 'Notekis harakatda o‘rtacha tezlik bilan ma’lum nuqtadagi oniy tezlik bir-biriga tengmi?',
        minutes: 10
      }]
    },
    /* 9-§ Tekis o‘zgaruvchan harakatda tezlanish */
    'tekis-ozgaruvchan-harakatda-tezlanish': {
      explain: [
      'Ixtiyoriy teng vaqtlar oralig‘ida tezligi bir xil kattalikka o‘zgarib boradigan harakat tekis o‘zgaruvchan harakat deyiladi; tezlik tekis ortsa, harakat tekis tezlanuvchan, tekis kamaysa, tekis sekinlanuvchan bo‘ladi. Bunday harakatni tezlanish tavsiflaydi: tezlanish tezlik o‘zgarishining shu o‘zgarish sodir bo‘lgan vaqtga nisbatiga teng.',
      'Tezlanish birligi m/s²: bunda tezlik har 1 s da 1 m/s ga o‘zgaradi. Tezlanuvchan harakatda a > 0, sekinlanuvchan harakatda a < 0; masalan, tezlik 10 s da 20 m/s dan 5 m/s gacha kamaysa, a = –1,5 m/s². Tezlanish vektor kattalik: tezlikning moduli o‘zgarganda ham, faqat yo‘nalishi o‘zgarganda ham tezlanish bo‘ladi.',
    ],
      formulas: ['a = (υ – υ₀) / t', '1 m/s² = 100 sm/s²'],
      terms: [['a', 'tezlanish', 'm/s²'], ['υ₀', 'boshlang‘ich tezlik', 'm/s'], ['υ', 'oxirgi tezlik', 'm/s'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'qiya-aravacha-tezlanish',
        title: 'Qiya tekislikdagi aravachaning tezlanishi',
        goal: 'Qiya tekislikdan tushayotgan aravacha qoldirgan tomchilar orasidagi masofalarni o‘lchab, uning tezlanishini hisoblang.',
        task: 'Qiya tekislikdan tushayotgan aravachaning tezligi har 0,5 s da qanchaga ortadi va uning tezlanishi nimaga teng?',
        minutes: 8
      }]
    },
    /* 10-§ Tekis o‘zgaruvchan harakat tezligi */
    'tekis-ozgaruvchan-harakat-tezligi': {
      explain: [
      'Boshlang‘ich tezlik υ₀ va tezlanish a ma’lum bo‘lsa, istalgan t paytdagi tezlik υ = υ₀ + a·t formuladan topiladi; tinch holatdan boshlanganda υ = a·t. Tekis o‘zgaruvchan harakatning tezlik grafigi vaqt o‘qiga burchak ostidagi to‘g‘ri chiziq bo‘lib, υ₀ ≠ 0 bo‘lsa, u υ₀ = 0 holdagi chiziqqa parallel ravishda yuqoriga suriladi.',
      'Sekinlanuvchan harakatda (a < 0) chiziq pastga tushib, vaqt o‘qini kesgan joyda jism to‘xtaydi: υ₀ = 15 m/s, a = –1 m/s² bo‘lsa, jism 15 s da to‘xtaydi. Tekis o‘zgaruvchan harakatning o‘rtacha tezligi boshlang‘ich va oxirgi tezliklarning o‘rta arifmetigiga teng: υ₀ = 4 m/s, υ = 13 m/s bo‘lsa, υo‘rt = 8,5 m/s.',
    ],
      formulas: ['υ = υ₀ + a · t', 'υo‘rt = (υ₀ + υ) / 2', 'υo‘rt = υ₀ + a · t / 2'],
      terms: [['υ', 'tezlik', 'm/s'], ['υ₀', 'boshlang‘ich tezlik', 'm/s'], ['a', 'tezlanish', 'm/s²'], ['υo‘rt', 'o‘rtacha tezlik', 'm/s']],
      labs: [{
        slug: 'itarilgan-aravacha',
        title: 'Qiyalikka itarilgan aravacha',
        goal: 'Qiya yo‘lka bo‘ylab yuqoriga itarilgan aravacha tezligining vaqt bo‘yicha o‘zgarishini kuzatib, tezlanish va to‘xtash vaqtini toping.',
        task: 'Sekinlanuvchan harakatda tezlik vaqt o‘tishi bilan qanday o‘zgaradi va aravacha qachon to‘xtaydi?',
        minutes: 8
      }]
    },
    /* 11-§ Tekis o‘zgaruvchan harakatda bosib o‘tilgan yo‘l */
    'tekis-ozgaruvchan-harakatda-bosib-otilgan-yol': {
      explain: [
      'Tekis o‘zgaruvchan harakatda bosib o‘tilgan yo‘l tezlik grafigi ostidagi shakl yuziga teng. Tinch holatdan boshlanganda bu uchburchak yuzi bo‘lib, s = a·t² / 2; boshlang‘ich tezlik bo‘lsa, unga to‘g‘ri to‘rtburchak yuzi υ₀·t qo‘shiladi: s = υ₀·t + a·t² / 2.',
      'Tinch holatdan tekis tezlanuvchan harakatning yo‘l grafigi parabola bo‘ladi: a = 2 m/s² da 1; 2; 3; 4; 5 s ga 1; 4; 9; 16; 25 m to‘g‘ri keladi, ya’ni yo‘l vaqtning kvadratiga proporsional ortadi. Birinchi sekundda jism tezlanishning yarmiga teng yo‘l o‘tadi, shuning uchun shu yo‘ldan tezlanishni topish mumkin.',
    ],
      formulas: ['s = υ₀ · t + a · t² / 2', 's = a · t² / 2', 's = υo‘rt · t'],
      terms: [['s', 'yo‘l', 'm'], ['υ₀', 'boshlang‘ich tezlik', 'm/s'], ['a', 'tezlanish', 'm/s²'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'galiley-novi',
        title: 'Galiley novi: yo‘l va vaqt kvadrati',
        goal: 'Novdan dumalayotgan sharchaning har sekundda qayerda bo‘lganini belgilab, bosib o‘tilgan yo‘l vaqtning kvadratiga proporsional ekanini tekshiring.',
        task: 'Tinch holatdan dumalagan sharchaning 2, 3, 4 sekundda o‘tgan yo‘li 1-sekunddagi yo‘lidan necha marta katta?',
        minutes: 8
      }]
    },
    /* 12-§ Laboratoriya ishi. Tekis tezlanuvchan harakatlanayotgan jism tezlanishini aniqlash */
    'laboratoriya-ishi-tekis-tezlanuvchan-harakatlanayotgan-jism-tezlanishini-aniqlash': {
      explain: [
      'Tinch holatdan qiya novdan dumalab tushayotgan sharcha tekis tezlanuvchan harakat qiladi, shuning uchun uning bosib o‘tgan yo‘li s = a·t² / 2. Bundan a = 2s / t²: yo‘l uzunligini o‘lchov tasmasi bilan, harakat vaqtini sekundomer bilan o‘lchab, tezlanishni hisoblash mumkin.',
      'O‘lchash xatoliklarini kamaytirish uchun vaqt 3 marta o‘lchanadi va tezlanishning o‘rtacha qiymati, absolyut va nisbiy xatoligi hisoblanadi. Tajriba novning uch xil qiyaligida takrorlanadi: qiyalik oshgan sari sharchaning tezlanishi ham oshib boradi.',
    ],
      formulas: ['a = 2s / t²', 'ao‘rt = (a₁ + a₂ + a₃) / 3', 'ε = (Δao‘rt / ao‘rt) · 100%'],
      terms: [['s', 'yo‘l', 'm'], ['t', 'vaqt', 's'], ['a', 'tezlanish', 'm/s²'], ['ε', 'nisbiy xatolik', '%']],
      labs: [{
        slug: 'sharcha-tezlanishi',
        title: 'Qiya novdagi sharcha tezlanishini aniqlash',
        goal: 'Qiya novdan dumalab tushayotgan sharchaning yo‘li va harakat vaqtini o‘lchab, uning tezlanishini aniqlang.',
        task: 'Qiya novdan dumalab tushayotgan sharchaning tezlanishi nimaga teng va u novning qiyaligiga qanday bog‘liq?',
        minutes: 12
      }]
    },
    /* 13-§ Jismlarning erkin tushishi */
    'jismlarning-erkin-tushishi': {
      explain: [
      'Aristotel og‘ir jismlar yengil jismlardan oldin tushadi, deb hisoblagan; Galiley Piza minorasidan po‘lat va tosh sharlarni tashlab, ular bir vaqtda yerga tushishini ko‘rsatdi. Havosi so‘rib olingan shisha nayda po‘lat sharcha va qush pati bir vaqtda tushadi, demak tushish vaqtidagi farqqa havoning qarshiligi sabab bo‘ladi. Jismning havosiz joyda faqat Yerning tortishi ta’siridagi harakati erkin tushish deyiladi.',
      'Erkin tushish to‘g‘ri chiziqli tekis tezlanuvchan harakat bo‘lib, uning tezlanishi g = 9,81 m/s² ga teng va doim tik pastga yo‘nalgan: tezlik har sekundda taxminan 9,8 m/s ga ortadi. Qutbda g = 9,83 m/s², ekvatorda 9,78 m/s², chunki Yer aniq shar shaklida emas. Erkin tushish formulalari tekis o‘zgaruvchan harakat formulalaridan a ni g ga, s ni h ga almashtirib olinadi: masalan, 5 s tushgan jism 125 m balandlikdan tushgan va yerga 50 m/s tezlik bilan urilgan (g = 10 m/s²).',
    ],
      formulas: ['υ = g · t', 'h = g · t² / 2', 'h = υ₀ · t + g · t² / 2'],
      terms: [['g', 'erkin tushish tezlanishi', 'm/s²'], ['h', 'balandlik', 'm'], ['υ', 'tezlik', 'm/s'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'nyuton-nayi',
        title: 'Nyuton nayi: havoli va havosiz tushish',
        goal: 'Nay ichidagi havo miqdorini o‘zgartirib, po‘lat sharcha va qush patining tushish vaqtini o‘lchang.',
        task: 'Havo bo‘lmasa, og‘ir sharcha va yengil pat bir xil vaqtda tushadimi?',
        minutes: 6
      }]
    },
    /* 14-§ Yuqoriga tik otilgan jismning harakati */
    'yuqoriga-tik-otilgan-jismning-harakati': {
      explain: [
      'Yuqoriga tik otilgan jism tekis sekinlanuvchan harakat qiladi: uning tezlanishi –g ga teng, shuning uchun tezligi υ = υ₀ – g·t, balandligi h = υ₀·t – g·t² / 2 formulalar bilan topiladi. Eng yuqori nuqtada tezlik nolga teng bo‘ladi, bundan ko‘tarilish vaqti t = υ₀ / g.',
      'Jism qancha vaqt yuqoriga ko‘tarilsa, shuncha vaqtda otilgan nuqtaga qaytib tushadi va u yerga otilgandagi tezlik bilan qaytadi. Masalan, 20 m/s tezlik bilan otilgan jism 2 s da 20 m balandlikka ko‘tariladi, yana 2 s da qaytib tushadi va 20 m/s tezlikka erishadi (g = 10 m/s²).',
    ],
      formulas: ['υ = υ₀ – g · t', 'h = υ₀ · t – g · t² / 2', 't = υ₀ / g'],
      terms: [['υ₀', 'boshlang‘ich tezlik', 'm/s'], ['υ', 'tezlik', 'm/s'], ['h', 'ko‘tarilish balandligi', 'm'], ['g', 'erkin tushish tezlanishi', 'm/s²']],
      labs: [{
        slug: 'tik-otish',
        title: 'Tik otilgan sharcha',
        goal: 'Prujinali otish qurilmasi bilan sharchani tik yuqoriga otib, uning ko‘tarilish balandligini va ko‘tarilish hamda tushish vaqtlarini o‘lchang.',
        task: 'Tik otilgan jismning ko‘tarilish vaqti tushish vaqtiga tengmi?',
        minutes: 8
      }]
    },
    /* 15-§ Jismning tekis aylanma harakati */
    'jismning-tekis-aylanma-harakati': {
      explain: ['Moddiy nuqta aylana bo‘ylab ixtiyoriy teng vaqtlar orasida teng uzunlikdagi yoylarni bosib o‘tsa, bunday harakat tekis aylanma harakat deyiladi; soat mili uchi, ventilyator parragi, bir xil tezlikda ketayotgan velosiped g‘ildiragi shunday harakatlanadi. Aylanish o‘qidan turli uzoqlikdagi nuqtalar bir xil vaqtda turli uzunlikdagi yoylarni o‘tadi, shuning uchun ularning chiziqli tezligi υ = Δs/Δt har xil bo‘ladi.', 'Δt vaqtda radius Δφ burchakka buriladi; bu burilish burchagi aylanayotgan jismning barcha nuqtalari uchun bir xil bo‘lib, radian yoki graduslarda o‘lchanadi (1 rad ≈ 57°, π rad = 180°). Burilish burchagining vaqtga nisbati burchak tezlik ω deyiladi: masalan, 24 s da bir marta aylanadigan charxpalakda ω ≈ 0,26 rad/s, o‘qdan 1,5 m uzoqlikdagi chelakchaning chiziqli tezligi esa υ ≈ 0,4 m/s.'],
      formulas: ['υ = Δs / Δt', 'Δφ = Δs / R', 'ω = Δφ / Δt'],
      terms: [['υ', 'chiziqli tezlik', 'm/s'], ['Δs', 'yoy uzunligi', 'm'], ['Δφ', 'burilish burchagi', 'rad'], ['ω', 'burchak tezlik', 'rad/s'], ['R', 'aylana radiusi', 'm']],
      labs: [{
        slug: 'aylanuvchi-disk',
        title: 'Aylanayotgan diskdagi nuqtalar tezligi',
        goal: 'Aylanayotgan diskdagi o‘qdan turli uzoqlikdagi nuqtalarning burilish burchagi va bosib o‘tgan yoyini o‘lchang.',
        task: 'Aylanayotgan diskning barcha nuqtalari bir xil tezlikda harakatlanadimi?',
        minutes: 8
      }]
    },
    /* 16-§ Aylanma harakatni tavsiflaydigan kattaliklar orasidagi munosabatlar */
    'aylanma-harakatni-tavsiflaydigan-kattaliklar-orasidagi-munosabatlar': {
      explain: ['Tekis aylanma harakatda chiziqli tezlik burchak tezlik bilan υ = ω·R munosabatda bog‘langan: burchak tezlik bir xil bo‘lsa, aylanish o‘qidan uzoqroqdagi nuqta tezroq harakatlanadi. Jismning bir marta aylanishiga ketgan vaqt aylanish davri T, vaqt birligidagi aylanishlar soni esa aylanish chastotasi ν deyiladi va ular T = 1/ν bilan bog‘langan.', 'Ipga bog‘langan sharcha 8 s da 20 marta aylansa, uning aylanish davri T = 0,4 s, chastotasi ν = 2,5 1/s bo‘ladi. Davr yoki chastotani bilgan holda chiziqli va burchak tezlikni topish mumkin: υ = 2πR/T, ω = 2π/T = 2πν; masalan, 90 km/soat tezlikda ketayotgan «Neksiya»ning 40 sm radiusli g‘ildiragi uchun T ≈ 0,1 s, ν = 10 1/s, ω = 62,8 rad/s.'],
      formulas: ['υ = ω·R', 'T = Δt / n', 'ν = n / Δt'],
      terms: [['T', 'aylanish davri', 's'], ['ν', 'aylanish chastotasi', '1/s'], ['n', 'aylanishlar soni', '—'], ['ω', 'burchak tezlik', 'rad/s'], ['υ', 'chiziqli tezlik', 'm/s']],
      labs: [{
        slug: 'aylanish-davri',
        title: 'Aylanish davri va chastotasi',
        goal: 'Ipga bog‘langan sharchaning n marta aylanish vaqtini o‘lchab, aylanish davri, chastotasi, chiziqli va burchak tezligini hisoblang.',
        task: 'Aylanish davri va chastotasi bilan chiziqli va burchak tezlik qanday bog‘langan?',
        minutes: 8
      }]
    },
    /* 17-§ Markazga intilma tezlanish */
    'markazga-intilma-tezlanish': {
      explain: ['Tekis aylanma harakatda tezlik son jihatdan o‘zgarmaydi, lekin uning yo‘nalishi uzluksiz o‘zgaradi: har bir nuqtada tezlik aylanaga urinma, ya’ni radiusga perpendikulyar yo‘nalgan bo‘ladi. Buni pichoq charxlash diskidan uchayotgan uchqunlar va avtomobil g‘ildiraklaridan sachrayotgan loy-suv yo‘nalishida ko‘rish mumkin.', 'Tezlik vektori o‘zgargani uchun aylanma harakatda tezlanish mavjud; u radius bo‘ylab aylana markaziga yo‘nalgan va markazga intilma tezlanish deyiladi: a = υ²/R. Aylana radiusi qancha kichik bo‘lsa, tezlanish shuncha katta bo‘ladi: masalan, 25 m radiusli aylanma yo‘lda 10 m/s tezlikda ketayotgan velosipedchining markazga intilma tezlanishi 4 m/s².'],
      formulas: ['a = (υ₂ − υ₁) / Δt', 'a = υ² / R'],
      terms: [['a', 'markazga intilma tezlanish', 'm/s²'], ['υ', 'chiziqli tezlik', 'm/s'], ['R', 'aylana radiusi', 'm']],
      labs: [{
        slug: 'markazga-intilma-tezlanish',
        title: 'Markazga intilma tezlanish',
        goal: 'Ipga bog‘langan sharchani turli radius va chastotada aylantirib, markazga intilma tezlanishni hisoblang va ip qo‘yib yuborilganda sharcha qaysi tomonga uchishini kuzating.',
        task: 'Markazga intilma tezlanish aylana radiusi va chiziqli tezlikka qanday bog‘liq?',
        minutes: 8
      }]
    },
    /* 18-§ Jismlarning o‘zaro ta’siri. Kuch */
    'jismlarning-ozaro-tasiri-kuch': {
      explain: ['Jism boshqa jismlar bilan o‘zaro ta’sirlashgandagina harakatga keladi, to‘xtaydi yoki harakat yo‘nalishini o‘zgartiradi. Bu ta’sir jismlar bevosita tegib turganda (tortish, itarish, prujinani cho‘zish) yoki maydon orqali (magnit maydoni, Yerning tortishi) yuz beradi. Bir jismning boshqa jismga ta’sirini tavsiflovchi va jismning tezlanish olishiga sabab bo‘luvchi fizik kattalik kuch deb ataladi.', 'Kuch vektor kattalik: uning son qiymati, yo‘nalishi va qo‘yilish nuqtasi ko‘rsatiladi; kuch dinamometr bilan o‘lchanadi, birligi nyuton (N). Bir to‘g‘ri chiziq bo‘ylab bir tomonga yo‘nalgan kuchlar qo‘shiladi, qarama-qarshi yo‘nalganlari ayiriladi: 3 N va 5 N li kuchlarning natijaviy kuchi 8 N yoki 2 N bo‘ladi. Natijaviy kuch nolga teng bo‘lsa, jism muvozanatda turadi.'],
      formulas: ['1 N = 1000 mN;  1 kN = 1000 N', 'F = F₁ + F₂', 'F = F₂ − F₁'],   // 2-formula: kuchlar bir tomonga (59-rasm); 3-formula: qarama-qarshi (58-rasm), kattaliklar bo‘yicha
      terms: [['F', 'kuch', 'N (nyuton)'], ['F₁, F₂', 'jismga ta’sir etayotgan kuchlar', 'N'], ['F₁₂', 'teng ta’sir etuvchi (natijaviy) kuch', 'N']],
      labs: [{
        slug: 'kuchlarni-qoshish',
        title: 'Kuchlarni qo‘shish',
        goal: 'Aravachaga ikki ip orqali kuch qo‘yib, natijaviy kuchni dinamometr bilan o‘lchang.',
        task: 'Bir to‘g‘ri chiziq bo‘ylab ta’sir etayotgan ikki kuchning natijaviy kuchi qanday topiladi?',
        minutes: 8
      }]
    },
    /* 19-§ Nyutonning birinchi qonuni — inersiya qonuni */
    'nyutonning-birinchi-qonuni-inersiya-qonuni': {
      explain: ['Jismning tezligi o‘z-o‘zidan o‘zgarmaydi: tezlikning miqdori yoki yo‘nalishi faqat boshqa jismlar ta’sirida o‘zgaradi. Jismning boshqa jismlar ta’siri bo‘lmaganda o‘zining tinch yoki to‘g‘ri chiziqli tekis harakatini saqlash xossasi inersiya deyiladi. Nyutonning birinchi qonuni: jismga kuch ta’sir etib, uni tinch yoki to‘g‘ri chiziqli tekis harakat holatidan chiqarmaguncha, u shu holatini saqlaydi.', 'Harakatga qarshilik qancha kam bo‘lsa, jism tezligi shuncha kam o‘zgaradi: qumsiz sirtda aravacha ancha uzoqqa borib to‘xtaydi. Inersiya tufayli to‘siqqa urilgan velosipedchi oldinga uchadi, avtobus birdan yurib ketsa, yo‘lovchi orqaga tisariladi, avtomobil esa birdaniga to‘xtay olmaydi (tormozlanish masofasi). Kuchlar muvozanatda, ya’ni ularning vektor yig‘indisi nolga teng bo‘lganda ham jism tinch yoki to‘g‘ri chiziqli tekis harakatini saqlaydi.'],
      formulas: ['F₁ + F₂ = 0  ⇒  υ = const'],   // kitobda so‘z bilan berilgan (63-rasm, 75-bet); alohida formula yo‘q
      terms: [['υ', 'tezlik', 'm/s'], ['υ₀', 'boshlang‘ich tezlik', 'm/s'], ['a', 'tezlanish', 'm/s²'], ['F', 'kuch', 'N']],
      labs: [{
        slug: 'inersiya',
        title: 'Inersiya: aravacha qayerda to‘xtaydi?',
        goal: 'Qiyalikdan tushgan aravachaning turli sirtlarda to‘xtash masofasini o‘lchang.',
        task: 'Harakatga qarshilik kamaysa, aravacha qayerda to‘xtaydi?',
        minutes: 8
      }]
    },
    /* 20-§ Jism massasi */
    'jism-massasi': {
      explain: ['Ikkita bir xil aravachani elastik plastinka itarib yuborsa, ular bir xil tezlanish oladi; aravachalardan biriga yuk qo‘yilsa, yuklisi kichikroq tezlanish oladi. Jismning tinch yoki to‘g‘ri chiziqli tekis harakat holatini saqlash xossasi inertlik deyiladi, uni tavsiflovchi fizik kattalik esa massa deb ataladi va m harfi bilan belgilanadi. Massa birligi kilogramm: platina va iridiy qotishmasidan yasalgan 1 kg li silindr massa etaloni deb qabul qilingan.', 'Inertligi katta jismning tezligini o‘zgartirish qiyin: gantelni shtangaga qaraganda, o‘yinchoq mashinani haqiqiy mashinaga qaraganda harakatga keltirish oson. Jism massasi u qayerda bo‘lishidan qat’i nazar o‘zgarmaydi va tarozida o‘lchanadi. Massa skalyar kattalik: jismlar sistemasining massasi jismlar massalarining yig‘indisiga teng.'],
      formulas: ['m = m₁ + m₂', 'm = m₁ + m₂ + m₃ + … + mₙ'],
      terms: [['m', 'massa', 'kg (kilogramm)'], ['m₁, m₂, …, mₙ', 'sistemadagi jismlar massalari', 'kg'], ['a₁, a₂', 'aravachalar olgan tezlanishlar', 'm/s²']],
      labs: [{
        slug: 'aravachalar-inertligi',
        title: 'Qaysi aravacha inertroq?',
        goal: 'Plastinka itarib yuborgan ikki aravachaning bir xil vaqtda bosib o‘tgan yo‘llarini o‘lchab, ularning inertligini solishtiring.',
        task: 'Aravacha massasi ortsa, bir xil ta’sir natijasida u oladigan tezlanish qanday o‘zgaradi?',
        minutes: 8
      }]
    },
    /* 21-§ Nyutonning ikkinchi qonuni */
    'nyutonning-ikkinchi-qonuni': {
      explain: ['Jism tezlanish olishi uchun unga kuch ta’sir etishi kerak. Tajriba ko‘rsatadiki, massasi o‘zgarmas aravachaga ta’sir etuvchi kuch necha marta ortsa, tezlanish ham shuncha marta ortadi (a ~ F), kuch o‘zgarmasa va massa necha marta ortsa, tezlanish shuncha marta kamayadi (a ~ 1/m). Nyutonning ikkinchi qonuni: jismning tezlanishi unga ta’sir etayotgan kuchga to‘g‘ri proporsional, massasiga esa teskari proporsional.', 'Qonundan F = m · a kelib chiqadi: 1 N bu 1 kg massali jismga 1 m/s² tezlanish beradigan kuch. Birinchi qonun ikkinchi qonunning F = 0 dagi xususiy holi: kuch ta’sir etmasa, tezlanish ham bo‘lmaydi. Masalan, muz ustidagi 50 g li shaybaga 100 N kuch bilan zarb berilsa, u 2000 m/s² tezlanish oladi.'],
      formulas: ['a = 2s / t²', 'a = F / m', 'F = m · a'],
      terms: [['F', 'kuch', 'N (nyuton)'], ['m', 'massa', 'kg'], ['a', 'tezlanish', 'm/s²'], ['s', 'bosib o‘tilgan yo‘l', 'm'], ['t', 'vaqt', 's']],
      labs: [{
        slug: 'nyuton-ikkinchi-qonuni',
        title: 'Tezlanish kuch va massaga qanday bog‘liq?',
        goal: 'Aravachaga turli kuch qo‘yib va uning massasini o‘zgartirib, tezlanishni o‘lchang.',
        task: 'Aravachaning tezlanishi unga ta’sir etuvchi kuchga va uning massasiga qanday bog‘liq?',
        minutes: 10
      }]
    },
    /* 22-§ Nyutonning uchinchi qonuni */
    'nyutonning-uchinchi-qonuni': {
      explain: ['Tabiatda ta’sir hech qachon bir tomonlama bo‘lmaydi: bir jism ikkinchisiga ta’sir etsa, ikkinchisi ham birinchisiga ta’sir etadi. Nyutonning uchinchi qonuni: o‘zaro ta’sirlashuvchi ikki jism bir-biriga miqdor jihatdan teng va bir to‘g‘ri chiziq bo‘yicha qarama-qarshi yo‘nalgan kuchlar bilan ta’sir etadi. Bu kuchlardan biri ta’sir kuchi, ikkinchisi aks ta’sir kuchi deyiladi; ular turli jismlarga qo‘yilgan.', 'Kuchlar teng bo‘lgani uchun m₁ · a₁ = m₂ · a₂: o‘zaro ta’sirlashgan jismlarning tezlanishlari va olgan tezliklari massalariga teskari proporsional hamda qarama-qarshi yo‘nalgan. Bir-biriga ulangan ikki dinamometr qarama-qarshi tomonga tortilsa, ikkalasi bir xil kuchni ko‘rsatadi. 50 kg li bola 200 kg li qayiqdan 10 m/s tezlik bilan qirg‘oqqa sakrasa, qayiq qarama-qarshi tomonga 2,5 m/s tezlik oladi.'],
      formulas: ['F₁ = −F₂', 'm₁ · a₁ = m₂ · a₂', 'υ₁ / υ₂ = m₂ / m₁'],
      terms: [['F₁, F₂', 'ta’sir va aks ta’sir kuchlari', 'N'], ['m₁, m₂', 'o‘zaro ta’sirlashuvchi jismlar massalari', 'kg'], ['a₁, a₂', 'jismlar olgan tezlanishlar', 'm/s²'], ['υ₁, υ₂', 'jismlar olgan tezliklar', 'm/s']],
      labs: [{
        slug: 'tasir-aks-tasir',
        title: 'Ta’sir va aks ta’sir: magnit va temir',
        goal: 'Magnit va temir o‘rnatilgan aravachalarning bir-biriga ta’sir kuchlarini ikki dinamometr bilan o‘lchang.',
        task: 'O‘zaro ta’sirlashayotgan ikki jism bir-biriga qanday kattalikdagi va qanday yo‘nalishdagi kuchlar bilan ta’sir etadi?',
        minutes: 8
      }]
    },
    /* 23-§ Harakat qonunlarining aylanma harakatga tatbiqi */
    'harakat-qonunlarining-aylanma-harakatga-tatbiqi': {
      explain: ['Aylana bo‘ylab bir xil tezlikda harakatlanayotgan jismning tezligi yo‘nalishini doim o‘zgartiradi, shuning uchun u markazga intilma tezlanish oladi: aᵢ = υ²/R. Har qanday tezlanishni kuch yuzaga keltiradi: jismni aylanma harakat qildiruvchi va doimo aylana markaziga yo‘nalgan kuch markazga intilma kuch deyiladi, Fᵢ = mυ²/R. Bu kuch bo‘lmasa, jism to‘g‘ri chiziqli tekis harakatini davom ettiradi.', 'Ipga bog‘langan sharchani ip markazga tortib turadi, sharchaning chiziqli tezligi esa aylanaga urinma bo‘ylab, kuchga perpendikulyar yo‘nalgan. Nyutonning uchinchi qonuniga ko‘ra markazga intilma kuchga miqdor jihatdan teng va qarama-qarshi yo‘nalgan markazdan qochma kuch Fq mavjud. Undan kir quritish barabanida va sut separatorida foydalaniladi; boshimiz uzra tez aylantirilgan chelakchadagi suv to‘kilmaydi.'],
      formulas: ['aᵢ = υ² / R', 'Fᵢ = m · υ² / R', 'Fᵢ = −Fq'],   // kitobda Fq = mυ²/R ham alohida (3) formula
      terms: [['Fᵢ', 'markazga intilma kuch', 'N'], ['Fq', 'markazdan qochma kuch', 'N'], ['aᵢ', 'markazga intilma tezlanish', 'm/s²'], ['υ', 'chiziqli tezlik', 'm/s'], ['R', 'aylanish radiusi', 'm'], ['m', 'massa', 'kg']],
      labs: [{
        slug: 'markazga-intilma-kuch',
        title: 'Markazga intilma kuch',
        goal: 'Ipga bog‘langan sharchani gorizontal aylana bo‘ylab aylantirib, markazga intilma kuchni dinamometr bilan o‘lchang.',
        task: 'Markazga intilma kuch sharcha massasiga, aylanish tezligiga va radiusga qanday bog‘liq?',
        minutes: 8
      }]
    },
    /* 24-§ Elastiklik kuchi */
    'elastiklik-kuchi': {
      explain: ['Tashqi kuch ta’sirida jismlar shakli va o‘lchamining o‘zgarishi deformatsiya deyiladi: jism cho‘zilishi, siqilishi, egilishi, siljishi yoki buralishi mumkin. Kuch to‘xtagach jism avvalgi holatiga qaytsa, deformatsiya elastik (prujina, rezina, chizg‘ich), qaytmasa, plastik (plastilin) bo‘ladi. Deformatsiyalangan jismda vujudga kelib, tashqi kuchga qarshilik ko‘rsatadigan va unga qarama-qarshi yo‘nalgan kuch elastiklik kuchi deyiladi.', 'Guk qonuni: elastiklik kuchi absolyut uzayishga to‘g‘ri proporsional, Fₑₗ = −k · Δl, bunda k prujinaning bikirligi (N/m). Prujina elastiklik kuchi yukning og‘irlik kuchiga tenglashganda cho‘zilishdan to‘xtaydi; yuk ikki marta ortsa, uzayish ham ikki marta ortadi. Guk qonuni faqat kichik deformatsiyalarda, elastiklik chegarasigacha bajariladi.'],
      formulas: ['Fₑₗ = −k · Δl', 'k = Fₑₗ / Δl', 'k = E · S / l'],
      terms: [['Fₑₗ', 'elastiklik kuchi', 'N'], ['Fₜ', 'tashqi kuch', 'N'], ['Δl', 'absolyut uzayish (absolyut deformatsiya), Δl = l − l₀', 'm'], ['k', 'bikirlik', 'N/m'], ['E', 'elastiklik moduli (Yung moduli)', 'N/m² (kitobda birligi berilmagan)'], ['S', 'ko‘ndalang kesim yuzasi', 'm²']],
      labs: [{
        slug: 'guk-qonuni',
        title: 'Guk qonuni va elastiklik chegarasi',
        goal: 'Prujinaga yuklar osib, uning uzayishini o‘lchang va yuk olingach prujina avvalgi uzunligiga qaytishini tekshiring.',
        task: 'Prujinaning uzayishi osilgan yukka qanday bog‘liq va qachon prujina avvalgi holatiga qaytmay qoladi?',
        minutes: 8
      }]
    },
    /* 25-§ Laboratoriya ishi. Prujina bikirligini aniqlash */
    'laboratoriya-ishi-prujina-bikirligini-aniqlash': {
      explain: ['Laboratoriya ishida eng oddiy dinamometr prujinasiga massalari ma’lum yuklar osilib, prujinaning uzayishi millimetrli qog‘ozda o‘lchanadi. Har bir yuk uchun tashqi kuch Fₜ = mg bo‘yicha hisoblanadi, bikirlik esa Guk qonunidan k = Fₜ/Δl formula bilan topiladi.', 'Uchta o‘lchashda olingan k₁, k₂, k₃ qiymatlari deyarli bir xil chiqadi, chunki bikirlik yukka emas, prujinaning o‘ziga bog‘liq. O‘rtacha qiymat ko‘rt, absolyut va nisbiy xatoliklar hisoblanib, o‘lchash aniqligi baholanadi.'],
      formulas: ['Fₜ = m · g', 'k = Fₜ / Δl', 'ε = (Δko‘rt / ko‘rt) · 100%'],
      terms: [['Fₜ', 'tashqi kuch (yukning og‘irlik kuchi)', 'N'], ['m', 'yuk massasi', 'kg'], ['g', 'erkin tushish tezlanishi', 'm/s² (g = 10 m/s²)'], ['Δl', 'prujinaning uzayishi', 'm'], ['k', 'prujina bikirligi', 'N/m'], ['ε', 'nisbiy xatolik', '%']],
      labs: [{
        slug: 'prujina-bikirligi',
        title: 'Prujina bikirligini aniqlash',
        goal: 'Dinamometr prujinasiga turli yuklar osib, uning bikirligini va o‘lchash xatoligini aniqlang.',
        task: 'Dinamometr prujinasining bikirligi nimaga teng va u osilgan yukka bog‘liqmi?',
        minutes: 12
      }]
    },
    /* 26-§ Butun olam tortishish qonuni */
    'butun-olam-tortishish-qonuni': {
      explain: [
      'Olamdagi barcha jismlar bir-birini tortadi. Ikki jismning o‘zaro tortishish kuchi ularning massalari ko‘paytmasiga to‘g‘ri proporsional va ular orasidagi masofa kvadratiga teskari proporsional: bu butun olam tortishish qonuni.',
      'Gravitatsiya doimiysi G juda kichik, shuning uchun odamlar yoki stol-stullar orasidagi tortishish sezilmaydi. Yer va Oy kabi ulkan jismlarda esa bu kuch katta: u Oyni orbitada ushlab turadi, Oyning tortishi esa dengiz va okeanlarda suvni bir necha metrga ko‘taradi.'
    ],
      formulas: ['F = G · m₁ · m₂ / r²', 'G = 6,67 · 10⁻¹¹ N·m²/kg²'],
      terms: [['F', 'gravitatsiya tortish kuchi', 'N'], ['G', 'gravitatsiya doimiysi', 'N·m²/kg²'], ['m₁, m₂', 'ta’sirlashayotgan jismlar massalari', 'kg'], ['r', 'jismlar (massa markazlari) orasidagi masofa', 'm']],
      labs: [{
        slug: 'kavendish-tajribasi',
        title: 'Kavendish tajribasi: sharlarning tortishishi',
        goal: 'Buralma tarozidagi kichik sharga katta qo‘rg‘oshin sharni yaqinlashtirib, ular orasidagi tortishish kuchini o‘lchang.',
        task: 'Masofa ikki marta ortsa, tortishish kuchi necha marta kamayadi?',
        minutes: 8
      }]
    },
    /* 27-§ Og‘irlik kuchi */
    'ogirlik-kuchi': {
      explain: [
      'Yer sirtidagi har bir jism Yerga tortiladi. Butun olam tortishish qonunidan 1 kg massali jism va Yer bir-birini 9,8 N kuch bilan tortishi kelib chiqadi; jismning Yerga tortilish kuchi og‘irlik kuchi deyiladi.',
      'Nyutonning ikkinchi qonuniga ko‘ra, bu kuch massasidan qat’i nazar har qanday jismga bir xil 9,8 m/s² tezlanish beradi: bu erkin tushish tezlanishi g. Shuning uchun og‘irlik kuchi Fog‘ = mg formula bilan topiladi va N hisobidagi qiymati kg hisobidagi massadan 9,8 marta katta.'
    ],
      formulas: ['F = G · m · M / r²', 'a = F / m', 'Fog‘ = m · g'],
      terms: [['Fog‘', 'og‘irlik kuchi', 'N'], ['m', 'jism massasi', 'kg'], ['g', 'erkin tushish tezlanishi', 'm/s²'], ['M', 'Yer massasi', 'kg'], ['r', 'Yer radiusi', 'm']],
      labs: [{
        slug: 'ogirlik-kuchi',
        title: 'Og‘irlik kuchi massaga bog‘liqmi?',
        goal: 'Turli massali yuklarning og‘irlik kuchini o‘lchang, so‘ng ularni bir balandlikdan tashlab, tushish vaqtini solishtiring.',
        task: 'Og‘ir yuk Yerga kuchliroq tortilsa, nega u tezroq tushmaydi?',
        minutes: 8
      }]
    },
    /* 28-§ Jismning og‘irligi */
    'jismning-ogirligi': {
      explain: [
      'Yerga tortilgani uchun jism o‘z tayanchini bosadi yoki osmasini tortadi. Shu kuch jismning og‘irligi deyiladi va P harfi bilan belgilanadi; tinch turgan jism uchun P = mg.',
      'Og‘irlik kuchi jismning o‘ziga, og‘irlik esa tayanch yoki osmaga qo‘yilgan kuchdir. Og‘irlik kuchi ma’lum joyda o‘zgarmaydi, og‘irlik esa faqat jism tinch turganda yoki vertikal tekis harakatlanganda o‘zgarmas bo‘ladi.'
    ],
      formulas: ['P = m · g', 'P = Fₑₗ = Fog‘'],
      terms: [['P', 'jismning og‘irligi', 'N'], ['Fog‘', 'og‘irlik kuchi', 'N'], ['Fₑₗ', 'prujinaning elastiklik kuchi', 'N'], ['m', 'massa', 'kg'], ['g', 'erkin tushish tezlanishi', 'm/s²']],
      labs: [{
        slug: 'jism-ogirligi',
        title: 'Osilgan va tayanchdagi jism og‘irligi',
        goal: 'Yukni prujinaga osib va prujinali tayanch ustiga qo‘yib, muvozanat holatidagi og‘irligini o‘lchang.',
        task: 'Jism osilganda va tayanchga qo‘yilganda uning og‘irligi og‘irlik kuchiga teng bo‘ladimi?',
        minutes: 7
      }]
    },
    /* 29-§ Yuklama va vaznsizlik */
    'yuklama-va-vaznsizlik': {
      explain: [
      'Jism yuqoriga a tezlanish bilan harakatlansa, uning og‘irligi ma ga ortadi: P = m(g + a). Bu yuklama deyiladi; lift ko‘tarila boshlaganda yoki raketa uchirilganda odam polga odatdagidan kuchliroq bosadi.',
      'Pastga a tezlanish bilan harakatlanganda og‘irlik ma ga kamayadi: P = m(g − a). a = g bo‘lganda og‘irlik nolga teng, jism vaznsizlik holatida bo‘ladi; orbitadagi kosmonavt ham shu holatda suzib yuradi, lekin og‘irlik kuchi nolga teng emas.'
    ],
      formulas: ['P = m · (g + a)', 'P = m · (g − a)', 'n = (g + a) / g'],
      terms: [['P', 'jismning og‘irligi', 'N'], ['a', 'jismning vertikal tezlanishi', 'm/s²'], ['g', 'erkin tushish tezlanishi', 'm/s²'], ['n', 'yuklama', '—'], ['m', 'massa', 'kg']],
      labs: [{
        slug: 'liftdagi-tarozi',
        title: 'Liftda og‘irlik qanday o‘zgaradi?',
        goal: 'Lift ichidagi tarozida turgan bolaning og‘irligini lift tezlanish bilan ko‘tarilganda, tushganda va erkin tushganda o‘lchang.',
        task: 'Lift qanday harakatlanganda bolaning og‘irligi ortadi, qachon nolga teng bo‘ladi?',
        minutes: 8
      }]
    },
    /* 30-§ Yerning tortish kuchi ta’sirida jismlarning harakati */
    'yerning-tortish-kuchi-tasirida-jismlarning-harakati': {
      explain: [
      'Gorizontal otilgan jism bir vaqtda ikki harakatda qatnashadi: gorizontal bo‘ylab o‘zgarmas υ₀ tezlik bilan tekis harakatlanadi va vertikal bo‘ylab erkin tushadi. Shuning uchun u shu balandlikdan boshlang‘ich tezliksiz tashlangan jism bilan bir vaqtda yerga tushadi va s = υ₀t masofaga borib tushadi.',
      'Boshlang‘ich tezlik qanchalik katta bo‘lsa, jism shunchalik uzoqqa tushadi. Yer sirti yaqinida 7,9 km/s tezlik bilan gorizontal otilgan jism Yerga qaytib tushmaydi, aylana orbita bo‘ylab aylanadi: bu birinchi kosmik tezlik.'
    ],
      formulas: ['h = g · t² / 2', 's = υ₀ · t', 'υ₁² = g · r'],
      terms: [['h', 'otilish balandligi', 'm'], ['t', 'tushish vaqti', 's'], ['υ₀', 'gorizontal boshlang‘ich tezlik', 'm/s'], ['s', 'uchish uzoqligi', 'm'], ['υ₁', 'birinchi kosmik tezlik (7,9 km/s)', 'm/s'], ['r', 'Yer radiusi', 'm']],
      labs: [{
        slug: 'gorizontal-otish',
        title: 'Gorizontal otilgan jismning harakati',
        goal: 'Minoradan ikki sharni bir vaqtda tik tashlab va gorizontal otib, tushish vaqti va uchish uzoqligini o‘lchang.',
        task: 'Gorizontal otilgan shar tik tashlangan shardan keyin yerga tushadimi?',
        minutes: 8
      }]
    },
    /* 31-§ Yerning sun’iy yo‘ldoshlari */
    'yerning-suniy-yoldoshlari': {
      explain: [
      'Inson tomonidan fazoga uchirilib, Yerning yo‘ldoshiga aylantirilgan raketa va kosmik kemalar Yerning sun’iy yo‘ldoshlari deyiladi. Havoda qizib yonib ketmasligi uchun ular kamida 300 km balandlikka chiqariladi va u yerda kamida 7,7 km/s tezlik beriladi.',
      'Tezlik ortgan sari orbita aylanadan ellipsga, so‘ng parabolaga o‘tadi. 11,2 km/s (ikkinchi kosmik tezlik) da jism Yerni tark etib Quyoshning yo‘ldoshiga aylanadi, 16,7 km/s (uchinchi kosmik tezlik) da esa Quyosh sistemasidan chiqib ketadi.'
    ],
      formulas: ['gₕ = G · M / (r + h)²', 'υ₁² = gₕ · (r + h)'],
      terms: [['υ₁', 'h balandlikdagi aylanma orbita tezligi', 'km/s'], ['gₕ', 'h balandlikdagi erkin tushish tezlanishi', 'm/s²'], ['h', 'orbita balandligi', 'm'], ['r', 'Yer radiusi', 'm'], ['υII', 'ikkinchi kosmik tezlik (11,2 km/s)', 'km/s'], ['υIII', 'uchinchi kosmik tezlik (16,7 km/s)', 'km/s']],
      labs: [{
        slug: 'suniy-yoldosh',
        title: 'Sun’iy yo‘ldoshni orbitaga chiqarish',
        goal: 'Yo‘ldoshni turli balandliklarga chiqarib, unga gorizontal tezlik bering va aylana orbita uchun zarur tezlikni toping.',
        task: 'Yo‘ldosh qanchalik baland uchsa, unga kerakli tezlik ortadimi yoki kamayadimi?',
        minutes: 8
      }]
    },
    /* 32-§ Ishqalanish kuchi. Tinchlikdagi ishqalanish */
    'ishqalanish-kuchi-tinchlikdagi-ishqalanish': {
      explain: [
      'Jism boshqa jism yuzasi bo‘ylab harakatlanganda harakatga qarshi yo‘nalgan ishqalanish kuchi paydo bo‘ladi. Uning birinchi sababi sirtlarning g‘adir-budurligi, ikkinchi sababi bir-biriga tegib turgan sirtlar molekulalarining o‘zaro tortishishidir.',
      'Tinchlikdagi ishqalanish kuchi jismni joyida ushlab turadi: u tortish kuchiga teng va unga qarama-qarshi yo‘nalgan. Tortish kuchi ma’lum eng katta qiymatga yetgandagina jism joyidan qo‘zg‘aladi; yurishimiz ham, transportyor tasmasidagi yukning sirpanmasligi ham shu kuch tufayli.'
    ],
      formulas: ['|Fᵢ| = |F|'],
      terms: [['Fᵢ(t)', 'tinchlikdagi ishqalanish kuchi', 'N'], ['F', 'jismga ta’sir etayotgan (tortish) kuchi', 'N']],
      labs: [{
        slug: 'tinchlikdagi-ishqalanish',
        title: 'Tinchlikdagi ishqalanish kuchi',
        goal: 'Brusokni dinamometr bilan asta-sekin kuchayib boruvchi kuch bilan tortib, uni joyidan qo‘zg‘atuvchi eng katta kuchni o‘lchang.',
        task: 'Brusok qo‘zg‘almay turganda ishqalanish kuchi nimaga teng?',
        minutes: 7
      }]
    },
    /* 33-§ Sirpanish ishqalanish. Dumalanish ishqalanish */
    'sirpanish-ishqalanish-dumalanish-ishqalanish': {
      explain: [
      'Jism sirt bo‘ylab tekis sirpanganda dinamometr ko‘rsatgan kuch sirpanish ishqalanish kuchiga teng; u tinchlikdagi eng katta ishqalanish kuchidan kichik. Sirpanish ishqalanish kuchi tayanchning reaksiya kuchi N ga proporsional: Fᵢ(s) = μN, bunda μ sirtlar materiali va silliqligiga bog‘liq.',
      'Jism sirpanmasdan dumalaganda dumalanish ishqalanish hosil bo‘ladi; u sirpanish ishqalanishdan ancha kichik, shuning uchun og‘ir yuklar qadimdan g‘o‘la va g‘ildiraklarda tashiladi. Dumalanish ishqalanish kuchi jism og‘irligiga to‘g‘ri, dumalayotgan jism radiusiga teskari proporsional.'
    ],
      formulas: ['Fᵢ(s) = μ · N = μ · m · g', 'μ = Fᵢ(s) / (m · g)', 'Fᵢ(d) = μd · P / r'],
      terms: [['Fᵢ(s)', 'sirpanish ishqalanish kuchi', 'N'], ['μ', 'sirpanish ishqalanish koeffitsiyenti', '—'], ['N', 'tayanchning reaksiya kuchi', 'N'], ['Fᵢ(d)', 'dumalanish ishqalanish kuchi', 'N'], ['μd', 'dumalanish ishqalanish koeffitsiyenti', 'm (kitobda mm)'], ['r', 'dumalayotgan jism radiusi', 'm']],
      labs: [{
        slug: 'sirpanish-dumalanish',
        title: 'Sirpanish va dumalanish ishqalanish',
        goal: 'Aravachani g‘ildiraklari qulflangan va erkin holatda dinamometr bilan tekis tortib, sirpanish va dumalanish ishqalanish kuchlarini solishtiring.',
        task: 'Bir xil yukni sudrash osonmi yoki g‘ildirakda dumalatishmi, necha marta?',
        minutes: 8
      }]
    },
    /* 34-§ Laboratoriya ishi. Sirpanish ishqalanish koeffitsiyentini aniqlash */
    'laboratoriya-ishi-sirpanish-ishqalanish-koeffitsiyentini-aniqlash': {
      explain: [
      'Taxtachani dinamometr bilan chizg‘ich bo‘ylab tekis sirpantirsak, tortish kuchi sirpanish ishqalanish kuchiga teng bo‘ladi. Taxtachaning og‘irligi P = mg ni bilgan holda sirpanish ishqalanish koeffitsiyenti μ = Fᵢ(s) / P formula bilan topiladi.',
      'Taxtacha ustiga 100 g va 200 g li toshlar qo‘yilganda ishqalanish kuchi ortadi, lekin μ deyarli o‘zgarmaydi: u yukka emas, sirtlar materiali va silliqligiga bog‘liq. Uch tajribadan μ ning o‘rtacha qiymati hisoblanadi; yog‘och bilan yog‘och uchun u 0,4 atrofida bo‘ladi.'
    ],
      formulas: ['P = m · g', 'μ = Fᵢ(s) / P', 'μₒ‘ᵣₜ = (μ₁ + μ₂ + μ₃) / 3'],
      terms: [['m', 'taxtacha (va toshlar) massasi', 'kg'], ['P', 'og‘irlik', 'N'], ['Fᵢ(s)', 'sirpanish ishqalanish kuchi', 'N'], ['μ', 'sirpanish ishqalanish koeffitsiyenti', '—'], ['μₒ‘ᵣₜ', 'koeffitsiyentning o‘rtacha qiymati', '—']],
      labs: [{
        slug: 'ishqalanish-koeffitsiyenti',
        title: 'Sirpanish ishqalanish koeffitsiyentini aniqlash',
        goal: 'Taxtachani dinamometr bilan yog‘och chizg‘ich bo‘ylab tekis sirpantirib, sirpanish ishqalanish koeffitsiyentini aniqlang.',
        task: 'Taxtacha ustiga yuk qo‘yilsa, ishqalanish koeffitsiyenti o‘zgaradimi?',
        minutes: 10
      }]
    },
    /* 35-§ Tabiatda va texnikada ishqalanish */
    'tabiatda-va-texnikada-ishqalanish': {
      explain: [
      'Ishqalanish foydali ham, zararli ham bo‘lishi mumkin. Usiz biz yura olmas, avtomobil joyidan qo‘zg‘alolmas va to‘xtay olmas edi; shuning uchun shinalar sirti bo‘rttirib ishlanadi, muzli yo‘llarga qum, tuz yoki tuproq sepiladi.',
      'Mashinalarning harakatlanuvchi qismlarida ishqalanish ularni qizdiradi va yeyadi, shuning uchun sirtlar silliqlanadi, moylanadi va podshipniklar qo‘llaniladi. Sharikli va rolikli podshipniklarda ishqalanish sirpanish podshipniklaridagidan 20–30 marta kam; avtomobilning tormozlanish yo‘li esa tezlik kvadratiga to‘g‘ri, ishqalanish kuchiga teskari proporsional.'
    ],
      formulas: ['s ~ υ₀² / Fᵢ'],
      terms: [['s', 'tormozlanish yo‘li', 'm'], ['υ₀', 'tormozlanish boshidagi tezlik', 'm/s'], ['Fᵢ', 'ishqalanish kuchi', 'N']],
      labs: [{
        slug: 'tormozlanish-yoli',
        title: 'Avtomobilning tormozlanish yo‘li',
        goal: 'Model avtomobilni turli tezlikda va turli yo‘l qoplamasida tormozlab, tormozlanish yo‘lini o‘lchang.',
        task: 'Tezlik ikki marta ortsa, tormozlanish yo‘li necha marta ortadi?',
        minutes: 8
      }]
    },
    /* 36-§ Impuls */
    'impuls': {
      explain: ['Jismlar o‘zaro ta’sirining natijasi faqat kuchning kattaligiga emas, balki uning qancha vaqt ta’sir etishiga ham bog‘liq. Shuning uchun kuch impulsi kiritilgan: u kuchning ta’sir etish vaqtiga ko‘paytmasiga teng va yo‘nalishi kuch yo‘nalishi bilan bir xil.', 'Jism impulsi (harakat miqdori) massa bilan tezlikning ko‘paytmasiga teng: massasi yoki tezligi katta jismning zarbi kuchliroq bo‘ladi. Kuch impulsi jism impulsining o‘zgarishiga teng, shuning uchun bir xil natijaga qisqa vaqtda katta kuch bilan ham, uzoq vaqtda kichik kuch bilan ham erishish mumkin.'],
      formulas: ['I = F · t', 'p = m · υ', 'F · t = m · υ − m · υ₀'],
      terms: [['I', 'kuch impulsi', 'N·s'], ['p', 'jism impulsi (harakat miqdori)', 'kg·m/s'], ['F', 'kuch', 'N'], ['t', 'kuchning ta’sir vaqti', 's'], ['m', 'massa', 'kg'], ['υ', 'tezlik', 'm/s']],
      labs: [{
        slug: 'kuch-impulsi',
        title: 'Kuch impulsi va aravacha tezligi',
        goal: 'Aravachaga turli kuch va vaqt bilan ta’sir etib, kuch impulsi jism impulsining o‘zgarishiga teng ekanini tekshiring.',
        task: 'Katta kuchni qisqa vaqt va kichik kuchni uzoq vaqt ta’sir ettirganda aravacha bir xil tezlik olishi mumkinmi?',
        minutes: 8
      }]
    },
    /* 37-§ Impulsning saqlanish qonuni */
    'impulsning-saqlanish-qonuni': {
      explain: ['Faqat bir-biri bilan ta’sirlashadigan, tashqi kuchlari esa o‘zaro muvozanatlashgan jismlar guruhi yopiq sistema deyiladi. Yopiq sistemada jismlar impulslarining vektor yig‘indisi ularning o‘zaro ta’siri va vaqt o‘tishidan qat’i nazar o‘zgarmaydi.', 'To‘qnashganda aravachalarga teng va qarama-qarshi kuchlar ta’sir etadi, shuning uchun biri qancha impuls olsa, ikkinchisi shuncha impuls yo‘qotadi. Noelastik to‘qnashuvda jismlar bir-biriga yopishib, birga harakatlanadi; elastik to‘qnashuvda esa qanday tezlikda yaqinlashgan bo‘lsa, shunday tezlikda uzoqlashadi.'],
      formulas: ['m₁ · υ₁ + m₂ · υ₂ = m₁ · υ₁′ + m₂ · υ₂′', 'υ = (m₁ · υ₁ + m₂ · υ₂) / (m₁ + m₂)'],
      terms: [['m₁, m₂', 'jismlarning massalari', 'kg'], ['υ₁, υ₂', 'to‘qnashishgacha tezliklar', 'm/s'], ['υ₁′, υ₂′', 'to‘qnashishdan keyingi tezliklar', 'm/s'], ['p', 'impuls', 'kg·m/s']],
      labs: [{
        slug: 'aravachalar-toqnashuvi',
        title: 'Aravachalar to‘qnashuvi',
        goal: 'Aravachalarni to‘qnashtirib, to‘qnashishdan oldingi va keyingi impulslar yig‘indisini taqqoslang.',
        task: 'Aravachalar to‘qnashganda ularning impulslari yig‘indisi o‘zgaradimi?',
        minutes: 10
      }]
    },
    /* 38-§ Reaktiv harakat */
    'reaktiv-harakat': {
      explain: ['Yopiq sistemaning bir qismi biror tezlik bilan otilib chiqsa, sistemaning qolgan qismi qarama-qarshi yo‘nalishda harakatga keladi: bu reaktiv harakat. U impulsning saqlanish qonuniga asoslanadi: otilishdan oldin impulslar yig‘indisi nolga teng bo‘lsa, keyin ham nolga teng bo‘lib qoladi.', 'Og‘zi bog‘lanmagan havo shari, tiqini otilgan probirkali aravacha, Segner parragi va raketa shu tarzda harakatlanadi. Raketa soplosidan gaz katta tezlik bilan otilib chiqadi, raketa esa qarama-qarshi tomonga reaktiv tezlik oladi: raketa massasi qancha kichik bo‘lsa, uning tezligi shuncha katta bo‘ladi.'],
      formulas: ['0 = m₁ · υ₁′ + m₂ · υ₂′', 'υ₂′ = −m₁ · υ₁′ / m₂', 'υR = −mG · υG / mR'],
      terms: [['m₁', 'otilib chiqqan qism (tiqin) massasi', 'kg'], ['m₂', 'qolgan qism (aravacha) massasi', 'kg'], ['υ₁′, υ₂′', 'otilishdan keyingi tezliklar', 'm/s'], ['mG', 'soplodan chiqqan gaz massasi', 'kg'], ['υG', 'gazning chiqish tezligi', 'm/s'], ['mR', 'raketa massasi', 'kg'], ['υR', 'raketaning reaktiv tezligi', 'm/s']],
      labs: [{
        slug: 'reaktiv-harakat',
        title: 'Tiqin otilishi va aravachaning orqaga harakati',
        goal: 'Probirkadan tiqin otilganda aravacha qanday tezlik olishini o‘lchab, impulslar yig‘indisi nolga tengligini tekshiring.',
        task: 'Tiqin bir tomonga otilganda aravacha qaysi tomonga va qanday tezlik bilan harakatlanadi?',
        minutes: 8
      }]
    },
    /* 39-§ Mexanik ish */
    'mexanik-ish': {
      explain: ['Mexanik ish bajarilishi uchun jismga kuch ta’sir etishi va jism shu kuch ta’sirida ma’lum masofaga ko‘chishi kerak. Mexanik ish kuch bilan shu kuch yo‘nalishida bosib o‘tilgan yo‘lning ko‘paytmasiga teng, skalyar kattalik bo‘lib, joul (J) da o‘lchanadi.', 'Kuch harakat yo‘nalishida bo‘lsa, ish musbat, qarama-qarshi bo‘lsa (masalan, ishqalanish kuchi) manfiy bo‘ladi. Kuch burchak ostida ta’sir etsa, uning ko‘chish yo‘nalishiga proyeksiyasi olinadi; kuch ko‘chishga perpendikulyar bo‘lsa yoki jism qo‘zg‘almasa, ish bajarilmaydi.'],
      formulas: ['A = F · s', 'A = −F · s', 'A = Fₚᵣ · s'],
      terms: [['A', 'mexanik ish', 'J'], ['F', 'kuch', 'N'], ['s', 'ko‘chish (bosib o‘tilgan yo‘l)', 'm'], ['Fₚᵣ', 'kuchning ko‘chish yo‘nalishiga proyeksiyasi', 'N']],
      labs: [{
        slug: 'mexanik-ish',
        title: 'Kuch yo‘nalishi va bajarilgan ish',
        goal: 'Aravachani turli burchak ostida tortib, kuchning ko‘chish yo‘nalishidagi tashkil etuvchisi va bajarilgan ishni toping.',
        task: 'Kuch yo‘nalishi bilan harakat yo‘nalishi orasidagi burchak ortganda bajarilgan ish qanday o‘zgaradi?',
        minutes: 8
      }]
    },
    /* 40-§ Laboratoriya ishi. Jismni ko‘tarishda va shu masofaga gorizontal ko‘chirishda bajarilgan ishni hisoblash */
    'laboratoriya-ishi-jismni-kotarishda-va-shu-masofaga-gorizontal-kochirishda-bajarilgan-ishni-hisoblash': {
      explain: ['Jismni tekis ko‘tarishda og‘irlik kuchini yengish uchun ish bajariladi: Aₕ = Fog‘ · h. Shu jismni gorizontal sirt bo‘ylab tekis sudrashda esa og‘irlik kuchi emas, balki ishqalanish kuchi yengiladi: Aₜₑₖ = Fᵢₛₕ · s.', 'Balandlik va gorizontal yo‘l bir xil bo‘lsa ham, ishqalanish kuchi og‘irlik kuchidan ancha kichik bo‘lgani uchun ko‘tarishda bajarilgan ish katta chiqadi. Brusokka yuk osilgan sari ikkala ish ham ortadi.'],
      formulas: ['Aₕ = Fog‘ · h', 'Aₜₑₖ = Fᵢₛₕ · s'],
      terms: [['Aₕ', 'jismni ko‘tarishda bajarilgan ish', 'J'], ['Aₜₑₖ', 'gorizontal ko‘chirishda bajarilgan ish', 'J'], ['Fog‘', 'og‘irlik kuchi', 'N'], ['Fᵢₛₕ', 'ishqalanish (tortish) kuchi', 'N'], ['h', 'ko‘tarish balandligi', 'm'], ['s', 'gorizontal yo‘l', 'm']],
      labs: [{
        slug: 'kotarish-va-sudrash',
        title: 'Ko‘tarish va sudrashda bajarilgan ish',
        goal: 'Brusokni h balandlikka ko‘tarish va shu masofaga gorizontal sudrashda bajarilgan ishlarni o‘lchab, taqqoslang.',
        task: 'Jismni ko‘tarishda ko‘proq ish bajariladimi yoki uni shuncha masofaga gorizontal sudrashdami?',
        minutes: 10
      }]
    },
    /* 41-§ Potensial energiya */
    'potensial-energiya': {
      explain: ['Jismning o‘z vaziyatini o‘zgartirishi natijasida bajara olishi mumkin bo‘lgan ishi energiya deyiladi; u ish kabi joul (J) da o‘lchanadi. O‘zaro ta’sirlashuvchi jismlarning yoki jism qismlarining bir-biriga nisbatan vaziyatiga bog‘liq energiya potensial energiya deyiladi: h balandlikda turgan m massali jism uchun Eₚ = m · g · h.', 'Ko‘tarilgan soat toshlari, siqilgan yoki buralgan prujina ish bajarish qobiliyatini uzoq vaqt saqlaydi. Jism h₁ balandlikdan h₂ balandlikka tushganda og‘irlik kuchi musbat ish bajaradi va bu ish potensial energiyaning kamayishiga teng; jismni ko‘tarishda esa potensial energiya ortadi.'],
      formulas: ['Eₚ = m · g · h', 'A = Eₚ₁ − Eₚ₂ = m · g · (h₁ − h₂)'],
      terms: [['Eₚ', 'potensial energiya', 'J'], ['m', 'massa', 'kg'], ['g', 'erkin tushish tezlanishi', 'm/s²'], ['h', 'balandlik', 'm'], ['A', 'og‘irlik kuchining ishi', 'J']],
      labs: [{
        slug: 'potensial-energiya',
        title: 'Ko‘tarilgan yuk qoziqni qoqadi',
        goal: 'Yukni turli balandlikdan tashlab, uning potensial energiyasi qoziqni qanchalik chuqur qoqishini o‘lchang.',
        task: 'Yukning ish bajara olish qobiliyati uning massasi va balandligiga qanday bog‘liq?',
        minutes: 8
      }]
    },
    /* 42-§ Kinetik energiya */
    'kinetik-energiya': {
      explain: ['Tinch turgan m massali jismni υ tezlikka erishtirish uchun bajarilgan ish m · υ² / 2 ga teng; bu kattalik jismning kinetik energiyasidir. Kinetik energiya jismning harakati tufayli ega bo‘lgan energiya bo‘lib, massa bilan tezlik kvadrati ko‘paytmasining yarmiga teng.', 'Jism tezligi υ₁ dan υ₂ ga o‘zgarganda bajarilgan ish kinetik energiyaning o‘zgarishiga teng. Tezlik 2 marta ortsa, kinetik energiya 4 marta ortadi: masalan, 2 t li avtomobil tezligini 36 km/soat dan 90 km/soat ga oshirishi uchun motor 525 kJ ish bajaradi.'],
      formulas: ['Eₖ = m · υ² / 2', 'A = Eₖ₂ − Eₖ₁'],
      terms: [['Eₖ', 'kinetik energiya', 'J'], ['m', 'massa', 'kg'], ['υ', 'tezlik', 'm/s'], ['A', 'bajarilgan ish', 'J']],
      labs: [{
        slug: 'kinetik-energiya',
        title: 'Kuch ishi va kinetik energiya',
        goal: 'Aravachani doimiy kuch bilan s masofaga tortib, bajarilgan ish F · s uning kinetik energiyasiga tengligini tekshiring.',
        task: 'Bajarilgan ish 4 marta ortsa, aravachaning tezligi necha marta ortadi?',
        minutes: 8
      }]
    },
    /* 43-§ Mexanik energiyaning saqlanish qonuni */
    'mexanik-energiyaning-saqlanish-qonuni': {
      explain: ['Erkin tushayotgan jismning potensial energiyasi kamayib, kinetik energiyasi esa shuncha ortadi; ularning yig‘indisi, ya’ni to‘liq mexanik energiya o‘zgarmaydi. Masalan, 45 m balandlikdan tushayotgan 1 kg li jism uchun har bir nuqtada Eₚ + Eₖ = 450 J.', 'Yopiq sistemaning to‘liq mexanik energiyasi sistema qismlarining har qanday harakatida o‘zgarmay qoladi; bu prujina va jismdan iborat sistemaga ham tegishli. Ishqalanish bo‘lsa, mexanik energiyaning bir qismi issiqlik energiyasiga aylanadi.'],
      formulas: ['Eₖ₁ + Eₚ₁ = Eₖ₂ + Eₚ₂', 'Eₖ₂ − Eₖ₁ = −(Eₚ₂ − Eₚ₁)', 'Eₚ = k · x² / 2'],
      terms: [['Eₖ', 'kinetik energiya', 'J'], ['Eₚ', 'potensial energiya', 'J'], ['k', 'prujinaning bikirligi', 'N/m'], ['x', 'prujinaning cho‘zilishi', 'm']],
      labs: [{
        slug: 'energiya-saqlanishi',
        title: 'Erkin tushishda energiyaning aylanishi',
        goal: 'Tushayotgan sharchaning turli balandliklardagi potensial va kinetik energiyasini o‘lchab, ularning yig‘indisi o‘zgarmasligini tekshiring.',
        task: 'Jism tushayotganda uning potensial va kinetik energiyalari yig‘indisi o‘zgaradimi?',
        minutes: 8
      }]
    },
    /* 44-§ Laboratoriya ishi. Jism kinetik energiyasining uning tezligi va massasiga bog‘liqligini aniqlash */
    'laboratoriya-ishi-jism-kinetik-energiyasining-uning-tezligi-va-massasiga-bogliqligini-aniqlash': {
      explain: ['Nov bo‘ylab dumalab tushgan sharcha brusokka urilib, ishqalanish kuchini yengadi va uni Δl masofaga siljitadi: sharchaning kinetik energiyasi qancha katta bo‘lsa, bajarilgan ish va brusokning siljishi shuncha katta bo‘ladi. Sharcha novning yuqoriroq joyidan qo‘yib yuborilsa, uning tezligi va brusokning siljishi ortadi.', 'Massasi katta sharcha o‘sha joydan qo‘yib yuborilganda brusokni uzoqroqqa suradi, demak kinetik energiya massaga ham bog‘liq. Sharchaning urilish paytidagi tezligi o‘lchangan masofa va vaqtdan topilgan tezlanish orqali aniqlanadi.'],
      formulas: ['Eₖ = m · υ² / 2', 's = a · t² / 2', 'υ = a · t'],
      terms: [['Eₖ', 'kinetik energiya', 'J'], ['m', 'sharcha massasi', 'kg'], ['υ', 'sharchaning brusokka urilish paytidagi tezligi', 'm/s'], ['a', 'tezlanish', 'm/s²'], ['Δl', 'brusokning siljishi', 'm']],
      labs: [{
        slug: 'sharcha-kinetik-energiyasi',
        title: 'Sharcha kinetik energiyasining tezlik va massaga bog‘liqligi',
        goal: 'Turli massali sharchalarni novning turli joyidan qo‘yib yuborib, ularning kinetik energiyasini va brusokning siljishini o‘lchang.',
        task: 'Sharchaning kinetik energiyasi uning tezligi va massasiga qanday bog‘liq?',
        minutes: 12
      }]
    },
    /* 45-§ Quvvat */
    'quvvat': {
      explain: ['Quvvat bajarilgan ishning shu ishni bajarish uchun sarflangan vaqtga nisbatiga teng, ya’ni ish bajarish tezligini ko‘rsatadi. Bir xil ishni qisqaroq vaqtda bajargan mashina quvvatliroq bo‘ladi; quvvat birligi vatt (W), 1 ot kuchi ≈ 736 W.', 'O‘zgarmas tezlik bilan harakatlanayotgan transport uchun N = F · υ: quvvat o‘zgarmas bo‘lsa, tezlik qancha katta bo‘lsa, tortish kuchi shuncha kichik bo‘ladi. Shuning uchun avtomobil tepalikka chiqishda tortish kuchini oshirish uchun tezligini kamaytiradi.'],
      formulas: ['N = A / t', 'A = N · t', 'N = F · υ'],
      terms: [['N', 'quvvat', 'W'], ['A', 'ish', 'J'], ['t', 'vaqt', 's'], ['F', 'tortish kuchi', 'N'], ['υ', 'tezlik', 'm/s']],
      labs: [{
        slug: 'kotargich-quvvati',
        title: 'Ko‘targichning quvvati',
        goal: 'Yukni turli tezlikda ko‘tarib, ko‘targichning quvvatini N = A / t va N = F · υ formulalari bilan hisoblang.',
        task: 'Bir xil yukni ikki marta tezroq ko‘targan mexanizmning quvvati qanday o‘zgaradi?',
        minutes: 8
      }]
    },
    /* 46-§ Tabiatda energiyaning saqlanishi. Foydali ish koeffitsiyenti */
    'tabiatda-energiyaning-saqlanishi-foydali-ish-koeffitsiyenti': {
      explain: ['Tabiatda energiya hech vaqt bordan yo‘q bo‘lmaydi va yo‘qdan bor bo‘lmaydi: u faqat bir turdan boshqa turga yoki bir jismdan boshqa jismga o‘tadi. Masalan, Quyosh energiyasi suvni bug‘latadi, to‘g‘ondan tushayotgan daryo suvining energiyasi gidroelektrstansiyada elektr energiyaga, u esa chiroqda yorug‘likka aylanadi.', 'Har qanday mashinada ishqalanish tufayli sarflangan energiyaning bir qismi issiqlikka aylanib isrof bo‘ladi, shuning uchun foydali ish to‘liq ishdan kichik. Buni foydali ish koeffitsiyenti (FIK) ko‘rsatadi; FIK hech qachon 100 % dan katta bo‘la olmaydi.'],
      formulas: ['η = Af / At · 100 %'],
      terms: [['η', 'foydali ish koeffitsiyenti (FIK)', '%'], ['Af', 'foydali ish', 'J'], ['At', 'sarflangan to‘liq ish', 'J']],
      labs: [{
        slug: 'qiya-tekislik-fik',
        title: 'Qiya tekislikning FIK',
        goal: 'Brusokni qiya tekislik bo‘ylab tekis tortib chiqarib, qiya tekislikning foydali ish koeffitsiyentini aniqlang.',
        task: 'Nima uchun qiya tekislikning FIK 100 % dan kichik va uni qanday oshirish mumkin?',
        minutes: 8
      }]
    }

  });
})(typeof window !== 'undefined' ? window : globalThis);

/* Empira — short post-experiment quiz (DTM-style).
   Shows 2 questions after a lab is finished, gives instant feedback, and saves
   each answer to empira_quiz_answers so teachers get real class reports.
   Bank is keyed by lab slug; labs without an entry simply skip the quiz. */
(function () {
  // a=index of the correct option; ex=one-line explanation shown after answering
  var BANK = {
    'om-qonuni': { q: [
      { q: 'Qarshilik o‘zgarmasa, kuchlanish 2 barobar oshsa, tok kuchi qanday o‘zgaradi?',
        o: ['2 barobar kamayadi', 'O‘zgarmaydi', '2 barobar ortadi', '4 barobar ortadi'], a: 2,
        ex: 'Om qonuni: I = U / R. Kuchlanish 2 barobar ortsa, tok ham 2 barobar ortadi.' },
      { q: 'Kuchlanish o‘zgarmasa, qarshilik 2 barobar oshsa, tok kuchi qanday bo‘ladi?',
        o: ['2 barobar ortadi', '2 barobar kamayadi', 'O‘zgarmaydi', 'Nolga tushadi'], a: 1,
        ex: 'Tok qarshilikka teskari proporsional: R oshsa, I shuncha kamayadi.' } ] },
    'elektr-zanjir': { q: [
      { q: 'Ketma-ket ulangan zanjirda ampermetrni boshqa joyga ulasak, tok kuchi qanday bo‘ladi?',
        o: ['Ortadi', 'Kamayadi', 'Hamma joyda bir xil bo‘ladi', 'Nolga teng bo‘ladi'], a: 2,
        ex: 'Ketma-ket zanjirda tok kuchi hamma qismda bir xil: I = I₁ = I₂.' },
      { q: 'Ikki lampochkadagi kuchlanishlar yig‘indisi nimaga teng?',
        o: ['Umumiy kuchlanishga', 'Bitta lampochka kuchlanishiga', 'Tok kuchiga', 'Nolga'], a: 0,
        ex: 'Ketma-ket ulanishda U = U₁ + U₂.' } ] },
    'elektr-shamoli': { q: [
      { q: 'Zaryadlangan o‘tkazgichda zaryad eng zich qayerda to‘planadi?',
        o: ['Tekis joyda', 'Uchli joyda', 'Ichida', 'Hamma joyda teng'], a: 1,
        ex: 'Zaryad o‘tkazgich sirtida, eng zich esa uchli joylarda bo‘ladi.' },
      { q: 'Sham alangasi nega uchli jismdan qochadi?',
        o: ['Issiqlik tufayli', 'Uch yonida ionlangan havo oqimi (elektr shamoli) alangani itaradi', 'Shamol tufayli', 'Tortishish tufayli'], a: 1,
        ex: 'Uch yonida maydon kuchli — havo ionlanadi va undan uchayotgan oqim alangani itaradi.' } ] },
    'reostat': { q: [
      { q: 'Reostat qarshiligi kamaysa, zanjirdagi tok kuchi qanday o‘zgaradi?',
        o: ['Ortadi', 'Kamayadi', 'O‘zgarmaydi', 'Nolga tushadi'], a: 0,
        ex: 'I = U / (R + Rᵣ). Rᵣ kamaysa, umumiy qarshilik kamayadi, tok ortadi.' },
      { q: 'Reostat nima uchun ishlatiladi?',
        o: ['Kuchlanish hosil qilish', 'Tok kuchini rostlash', 'Zaryad to‘plash', 'Issiqlikni o‘lchash'], a: 1,
        ex: 'Reostat — qarshiligini o‘zgartirib tok kuchini rostlaydigan asbob.' } ] },
    'yol-va-kochish': { q: [
      { q: 'Yo‘l va ko‘chish qachon bir-biriga teng bo‘ladi?',
        o: ['Jism aylana bo‘ylab harakatlanganda', 'Jism to‘g‘ri chiziq bo‘ylab bir tomonga harakatlanganda', 'Jism orqaga qaytganda', 'Hech qachon'], a: 1,
        ex: 'To‘g‘ri chiziqda bir tomonga harakatda yo‘l = ko‘chish moduli.' },
      { q: 'Yo‘l ko‘chishga nisbatan qanday bo‘ladi?',
        o: ['Har doim kichik', 'Har doim katta yoki teng', 'Har doim teng', 'Har doim 0'], a: 1,
        ex: 'Yo‘l — bosib o‘tilgan to‘liq masofa, u ko‘chishdan kichik bo‘la olmaydi.' } ] },
    'yol-grafigi': { q: [
      { q: 'Tezroq harakatlanayotgan jismning yo‘l-vaqt grafigi qanday bo‘ladi?',
        o: ['Yotiqroq (burchagi kichik)', 'Tikroq (burchagi katta)', 'Gorizontal', 'Bir xil'], a: 1,
        ex: 's = υ·t. Tezlik katta bo‘lsa, grafik tikroq (nishabi katta) bo‘ladi.' },
      { q: 'Yo‘l-vaqt grafigi gorizontal (yotiq chiziq) bo‘lsa, jism nima qiladi?',
        o: ['Tezlashmoqda', 'Tinch turibdi', 'Sekinlashmoqda', 'Orqaga qaytmoqda'], a: 1,
        ex: 'Yo‘l o‘zgarmasa, jism joyidan siljimaydi — tinch holatda.' } ] },
    'oniy-tezlik': { q: [
      { q: 'Notekis harakatda o‘rtacha tezlik va oniy tezlik qanday bog‘liq?',
        o: ['Har doim teng', 'Odatda teng emas', 'Oniy tezlik har doim kichik', 'O‘rtacha tezlik har doim 0'], a: 1,
        ex: 'Notekis harakatda tezlik o‘zgarib turadi, shuning uchun ular odatda teng emas.' },
      { q: 'Avtomobil spidometri qanday tezlikni ko‘rsatadi?',
        o: ['O‘rtacha tezlikni', 'Oniy tezlikni', 'Maksimal tezlikni', 'Yo‘lni'], a: 1,
        ex: 'Spidometr ayni vaqtdagi — oniy tezlikni ko‘rsatadi.' } ] },
    'guk-qonuni': { q: [
      { q: 'Elastiklik chegarasida yuk 2 barobar og‘irlashsa, prujina uzayishi qanday o‘zgaradi?',
        o: ['O‘zgarmaydi', '2 barobar ortadi', '2 barobar kamayadi', '4 barobar ortadi'], a: 1,
        ex: 'Guk qonuni: uzayish kuchga to‘g‘ri proporsional, Fₑₗ = k·Δl.' },
      { q: 'Prujina avvalgi holatiga qachon qaytmay qoladi?',
        o: ['Yuk yengil bo‘lsa', 'Elastiklik chegarasidan oshib ketganda', 'Sovuganda', 'Hech qachon'], a: 1,
        ex: 'Elastiklik chegarasidan oshsa, deformatsiya qoldiq (plastik) bo‘lib qoladi.' } ] },
    'prujina-bikirligi': { q: [
      { q: 'Prujinaning bikirligi k osilgan yukka bog‘liqmi?',
        o: ['Ha, yuk ortsa k ortadi', 'Yo‘q, u prujinaning o‘z xususiyati', 'Ha, yuk ortsa k kamayadi', 'Faqat haroratga bog‘liq'], a: 1,
        ex: 'k = F/Δl nisbati o‘zgarmas — u prujinaning xossasi, yukka bog‘liq emas.' },
      { q: 'Bir xil kuch ta’sirida qaysi prujina kamroq uzayadi?',
        o: ['Bikirligi kichik', 'Bikirligi katta', 'Uzunroq', 'Ikkalasi teng'], a: 1,
        ex: 'Δl = F/k. k katta bo‘lsa, uzayish kichik bo‘ladi.' } ] },
    'suniy-yoldosh': { q: [
      { q: 'Yo‘ldosh qanchalik baland uchsa, unga kerakli birinchi kosmik tezlik qanday o‘zgaradi?',
        o: ['Ortadi', 'Kamayadi', 'O‘zgarmaydi', 'Nolga tushadi'], a: 1,
        ex: 'Balandlikda tortishish gₕ kamayadi, shuning uchun kerakli tezlik ham kamayadi.' },
      { q: 'Yo‘ldoshni orbitada nima ushlab turadi?',
        o: ['Havo bosimi', 'Yer tortishish kuchi', 'Quyosh nuri', 'Magnit maydon'], a: 1,
        ex: 'Yerning tortishish kuchi markazga intilma kuch vazifasini bajaradi.' } ] },
    'tormozlanish-yoli': { q: [
      { q: 'Avtomobil tezligi 2 barobar ortsa, tormozlanish yo‘li necha marta ortadi?',
        o: ['2 marta', '3 marta', '4 marta', 'O‘zgarmaydi'], a: 2,
        ex: 'Tormozlanish yo‘li tezlik kvadratiga proporsional: s ~ υ². 2² = 4.' },
      { q: 'Tormozlanish yo‘li nimaga eng kuchli bog‘liq?',
        o: ['Tezlikning kvadratiga', 'Rangiga', 'Yo‘lovchilar soniga', 'Vaqtga'], a: 0,
        ex: 's ~ υ₀² — shuning uchun tezlik ozgina ortsa ham yo‘l keskin ortadi.' } ] }
  };

  var SAVED = false;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function ensureStyle(){
    if (document.getElementById('empira-quiz-css')) return;
    var st = document.createElement('style'); st.id='empira-quiz-css';
    st.textContent =
    '.eq-ov{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(11,16,38,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}'+
    '.eq-card{width:100%;max-width:460px;background:#fff;border-radius:22px;box-shadow:0 24px 70px rgba(11,16,38,.3);padding:24px;font-family:Sora,system-ui,sans-serif;color:#0B1026;animation:eqpop .25s cubic-bezier(.2,.7,.2,1)}'+
    '@keyframes eqpop{from{transform:translateY(10px) scale(.98);opacity:0}to{transform:none;opacity:1}}'+
    '@media(prefers-reduced-motion:reduce){.eq-card{animation:none}}'+
    '.eq-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}'+
    '.eq-kick{font-size:12.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#3B4CFF}'+
    '.eq-step{font-size:13px;color:#5A6285;font-weight:600}'+
    '.eq-q{font-size:19px;font-weight:700;line-height:1.35;margin:4px 0 16px}'+
    '.eq-opts{display:flex;flex-direction:column;gap:9px}'+
    '.eq-opt{appearance:none;text-align:left;border:1.5px solid #D9DCE8;background:#fff;border-radius:13px;padding:13px 15px;font:600 15px Sora,system-ui,sans-serif;color:#0B1026;cursor:pointer;transition:border-color .12s,background .12s}'+
    '.eq-opt:hover{border-color:#8B96FF}'+
    '.eq-opt.is-correct{border-color:#1E9E6A;background:rgba(30,158,106,.1);color:#13784f}'+
    '.eq-opt.is-wrong{border-color:#D64533;background:rgba(214,69,51,.08);color:#b5362a}'+
    '.eq-opt:disabled{cursor:default}'+
    '.eq-ex{margin-top:14px;font-size:14px;line-height:1.55;color:#3A4166;border-left:3px solid #FFB21E;padding-left:12px}'+
    '.eq-foot{margin-top:18px;display:flex;justify-content:flex-end;gap:10px}'+
    '.eq-btn{appearance:none;border:0;background:#3B4CFF;color:#fff;border-radius:12px;padding:12px 20px;font:600 15px Sora,system-ui,sans-serif;cursor:pointer}'+
    '.eq-btn:disabled{opacity:.4;cursor:not-allowed}'+
    '.eq-btn.ghost{background:#fff;color:#0B1026;border:1.5px solid #D9DCE8}'+
    '.eq-score{text-align:center;padding:6px 0 2px}'+
    '.eq-score .n{font-size:40px;font-weight:800;color:#3B4CFF}'+
    '.eq-score p{margin:8px 0 0;color:#3A4166;font-size:15px}'+
    '.eq-saving{font-size:12.5px;color:#5A6285;margin-top:10px;text-align:center;min-height:16px}';
    document.head.appendChild(st);
  }

  function has(labId){ return !!BANK[labId]; }

  function start(labId, topicSlug, grade, go){
    var set = BANK[labId]; if(!set) return false;
    ensureStyle();
    var qs = set.q, idx = 0, results = [];
    var ov = document.createElement('div'); ov.className='eq-ov';
    ov.innerHTML = '<div class="eq-card" role="dialog" aria-modal="true" aria-label="Tajriba savoli"></div>';
    document.body.appendChild(ov);
    var card = ov.querySelector('.eq-card');

    function renderQ(){
      var it = qs[idx]; var answered = false;
      card.innerHTML =
        '<div class="eq-top"><span class="eq-kick">Tajriba savoli</span><span class="eq-step">'+(idx+1)+' / '+qs.length+'</span></div>'+
        '<div class="eq-q">'+esc(it.q)+'</div>'+
        '<div class="eq-opts">'+it.o.map(function(o,i){ return '<button class="eq-opt" data-i="'+i+'">'+esc(o)+'</button>'; }).join('')+'</div>'+
        '<div class="eq-ex" hidden></div>'+
        '<div class="eq-foot"><button class="eq-btn" data-next disabled>'+(idx<qs.length-1?'Keyingisi':'Yakunlash')+'</button></div>';
      var opts = card.querySelectorAll('.eq-opt'), ex = card.querySelector('.eq-ex'), next = card.querySelector('[data-next]');
      opts.forEach(function(b){ b.addEventListener('click', function(){
        if(answered) return; answered = true;
        var chosen = +b.dataset.i, correct = chosen === it.a;
        results.push({ question_idx: idx, correct: correct, chosen: chosen });
        opts.forEach(function(x){ x.disabled = true;
          var xi=+x.dataset.i;
          if(xi===it.a) x.classList.add('is-correct');
          else if(xi===chosen) x.classList.add('is-wrong');
        });
        ex.textContent = (correct?'To‘g‘ri! ':'')+it.ex; ex.hidden=false;
        next.disabled=false; next.focus();
      }); });
      next.addEventListener('click', function(){
        if(idx<qs.length-1){ idx++; renderQ(); } else { finishQuiz(); }
      });
    }

    function finishQuiz(){
      var correct = results.filter(function(r){return r.correct;}).length, total = qs.length;
      save(labId, topicSlug, grade, results);
      var line = correct===total ? 'Ajoyib! Hammasini to‘g‘ri topdingiz.' : correct===0 ? 'Zarari yo‘q — tajribani qayta ko‘rib chiqing.' : 'Yaxshi! Yana bir bor ko‘rib chiqsangiz, to‘liq bo‘ladi.';
      card.innerHTML =
        '<div class="eq-score"><div class="n">'+correct+' / '+total+'</div><p>'+line+'</p></div>'+
        '<div class="eq-saving" data-save></div>'+
        '<div class="eq-foot">'+
          '<button class="eq-btn ghost" data-close>Yopish</button>'+
          (go && go.href ? '<button class="eq-btn" data-go>'+esc(go.label||'Davom etish')+'</button>' : '')+
        '</div>';
      card.querySelector('[data-close]').addEventListener('click', close);
      var g = card.querySelector('[data-go]'); if(g) g.addEventListener('click', function(){ location.href = go.href; });
    }

    function close(){ try{ document.body.removeChild(ov); }catch(e){} }
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    renderQ();
    return true;
  }

  function save(labId, topicSlug, grade, results){
    try{
      var sb = window.EMPIRA_SB, sess = window.EMPIRA_SESSION;
      var note = document.querySelector('[data-save]');
      if(!sb || !sess || !sess.user){ if(note) note.textContent='Natija shu qurilmada (hisobga ulanmagan).'; return; }
      var uid = sess.user.id;
      var rows = results.map(function(r){ return {
        student_id: uid, class_id: null, lab_id: labId,
        topic_slug: topicSlug || null, grade: grade || null,
        question_idx: r.question_idx, correct: r.correct, chosen: r.chosen
      }; });
      sb.from('empira_quiz_answers').insert(rows).then(function(res){
        if(note) note.textContent = res && res.error ? 'Hozircha hisobga saqlanmadi.' : 'Natija o‘qituvchingizga yuborildi ✓';
      }).catch(function(){ if(note) note.textContent='Hozircha hisobga saqlanmadi.'; });
    }catch(e){}
  }

  window.EMPIRA_QUIZ = { has: has, start: start };
})();

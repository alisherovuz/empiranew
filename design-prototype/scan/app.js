// Empira — Scanner.
// LIVE (https, e.g. test.empira.uz): the photo is resized and sent to /api/scan → Gemini reads the page → matched to 8-sinf.
// OFFLINE (opened as a local file): detection is simulated, cycling through the topics that have a 3D lab.
// Presenter mode or ?mavzu= always uses the chosen mock result (safe for live demos).
// Prototype URL options: ?holat=kamera|aniqlanmoqda|natija|topilmadi shows a state directly;
// ?mavzu=<topic slug> fixes the mock result (e.g. ?holat=natija&mavzu=om-qonuni); ?natija=yoq makes detection fail.
// PRESENTER MODE: ?taqdimot=1 (remembered for the browser session, ?taqdimot=0 to leave) shows a small chooser for the
// next result, so the mock matches the page actually being scanned. Number keys 1–9 also choose it.
(function () {
  const page = document.querySelector('[data-state]');
  const q = new URLSearchParams(location.search);
  const $ = (sel) => document.querySelector(sel);

  const drop = $('[data-drop]');
  const camera = $('[data-camera]');
  const video = $('[data-video]');
  const preview = $('[data-preview]');
  const alertEl = $('[data-alert]');
  let stream = null;
  let previewUrl = null;

  // Mock results = exactly the topics that have a demo lab (same data as Class Plan, Topic and Lab)
  const plan = window.EMPIRA_PLAN;
  const content = window.EMPIRA_TOPICS;
  const slug = (s) => s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const RESULTS = plan.chapters.flatMap((c) => c.topics)
    .filter((t) => t.lab && content[slug(t.t)])
    .map((t) => ({ n: t.n, slug: slug(t.t), topic: t.t, labs: content[slug(t.t)].labs.map((l) => ({ slug: l.slug, title: l.title })) }));
  // Presenter chooser: only the book's lab works / practicals (keys 1–9), not every lab topic
  const PICKS = RESULTS.filter((r) => [6, 14, 19, 20, 23, 24, 33, 49, 58].includes(r.n));
  const LIVE = /^https?:$/.test(location.protocol);

  // Presenter mode (session-wide, hidden from teachers)
  if (q.get('taqdimot') === '1') sessionStorage.setItem('empira-presenter', '1');
  if (q.get('taqdimot') === '0') { sessionStorage.removeItem('empira-presenter'); sessionStorage.removeItem('empira-scan-pick'); }
  const presenter = sessionStorage.getItem('empira-presenter') === '1';

  function renderPresenter() {
    const pick = sessionStorage.getItem('empira-scan-pick');
    $('[data-presenter-chips]').innerHTML = PICKS.map((r, i) => `
      <button class="chip" type="button" role="radio" aria-checked="${r.slug === pick}" data-pick="${r.slug}">
        <span class="chip__key">${i + 1}</span>${r.topic}
      </button>`).join('');
  }
  function pick(slugValue) {
    sessionStorage.setItem('empira-scan-pick', slugValue);
    renderPresenter();
  }
  if (presenter) {
    $('[data-presenter]').hidden = false;
    renderPresenter();
    $('[data-presenter-chips]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (b) pick(b.dataset.pick);
    });
    document.addEventListener('keydown', (e) => {
      const r = PICKS[Number(e.key) - 1];
      if (r && !e.metaKey && !e.ctrlKey && !e.altKey) pick(r.slug);
    });
  }

  function nextMatch() {
    const fixed = RESULTS.find((r) => r.slug === q.get('mavzu'));
    if (fixed) return fixed;
    const chosen = presenter && RESULTS.find((r) => r.slug === sessionStorage.getItem('empira-scan-pick'));
    if (chosen) return chosen;
    const n = Number(sessionStorage.getItem('empira-scan-n') || 0);   // rotate through the demo topics
    sessionStorage.setItem('empira-scan-n', String(n + 1));
    return RESULTS[n % RESULTS.length];
  }

  // m = { slug, topic, labs: [{ slug, title }] }
  function showResult(m) {
    const cta = $('.result__cta');
    $('[data-r-class]').textContent = `${plan.grade}-sinf`;
    $('[data-r-subject]').textContent = plan.subjects[0].name;
    $('[data-r-topic]').textContent = m.topic;
    $('[data-r-lab]').textContent = m.labs.length ? m.labs.map((l) => l.title).join(' · ') : 'Bu mavzu uchun laboratoriya yo‘q';
    // One lab with a Build Mode: offer both ways right here (ready lab, or build it yourself)
    const buildCfg = m.labs.length === 1 && window.EMPIRA_BUILD_FOR && window.EMPIRA_BUILD_FOR(m.labs[0].slug);
    const buildBtn = $('[data-r-build]');
    buildBtn.hidden = !buildCfg;
    if (buildCfg) { buildBtn.href = `../lab/build/index.html?lab=${m.labs[0].slug}`; buildBtn.textContent = buildCfg.label; }
    if (m.labs.length === 1) { cta.href = `../lab/index.html?lab=${m.labs[0].slug}`; cta.textContent = buildCfg ? 'Tayyor laboratoriya' : '3D laboratoriyani ochish'; }
    else if (m.labs.length > 1) { cta.href = `../topic/index.html?mavzu=${m.slug}`; cta.textContent = '3D laboratoriyalarni ko‘rish'; }
    else {
      // No lab for this topic: say so plainly and open the annual plan (lab topics only) at the same chapter
      const t = window.EMPIRA_AVAIL && window.EMPIRA_AVAIL.findTopic(m.slug);
      cta.href = `../class-plan/index.html?sinf=${plan.grade}${t ? `#bob-${t.chapter.n}` : ''}`;
      cta.textContent = 'Yillik rejani ochish';
    }
    $('[data-r-other]').href = `../class-plan/index.html?sinf=${plan.grade}`;
  }

  // Resize the photo (≤ 1600 px, JPEG) before upload: small and fast on school Wi-Fi
  function toJpegBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  const nfHint = $('.view--notfound .hint');
  const nfHintDefault = nfHint.textContent;
  function notFound(reason) {
    nfHint.textContent = reason === 'error'
      ? 'Skanerlash xizmati hozir javob bermadi. Internetni tekshirib, qayta urinib ko‘ring yoki sinf bo‘yicha tanlang.'
      : nfHintDefault;
    setState('notfound');
  }

  async function recognise(imageUrl) {
    const started = Date.now();
    try {
      const image = await toJpegBase64(imageUrl);
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image, mime: 'image/jpeg' }) });
      const data = await res.json().catch(() => ({}));
      await new Promise((r) => setTimeout(r, Math.max(0, 900 - (Date.now() - started))));   // keep the loading state readable
      if (data.status === 'found') { showResult({ slug: data.topic.slug, topic: data.topic.title, labs: data.labs }); return setState('result'); }
      if (data.status === 'notfound') return notFound('notfound');
      console.error('scan error', res.status, data);
      return notFound('error');
    } catch (err) {
      console.error('scan failed', err);
      return notFound('error');
    }
  }

  function setState(state) {
    page.dataset.state = state;
    window.scrollTo(0, 0);
    const heading = page.querySelector(`.view--${state === 'camera' ? 'capture' : state} .title`);
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  function showAlert(text) {
    $('[data-alert-text]').textContent = text;
    alertEl.hidden = !text;
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    camera.hidden = true;
    drop.hidden = false;
    if (page.dataset.state === 'camera') page.dataset.state = 'idle';
  }

  function detect(imageUrl) {
    stopCamera();
    showAlert('');
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    previewUrl = imageUrl || null;
    if (previewUrl) preview.src = previewUrl; else preview.removeAttribute('src');
    setState('processing');

    const mockChosen = q.get('mavzu') || (presenter && sessionStorage.getItem('empira-scan-pick'));
    if (LIVE && !mockChosen && q.get('natija') !== 'yoq') return recognise(imageUrl);

    setTimeout(() => {
      if (q.get('natija') === 'yoq') return notFound('notfound');
      showResult(nextMatch());
      setState('result');
    }, 1600);
  }

  function fromFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showAlert('Faqat rasm faylini yuklang (JPG yoki PNG).');
    detect(URL.createObjectURL(file));
  }

  /* ---------- Inputs ---------- */
  document.querySelectorAll('[data-input-camera], [data-input-upload]').forEach((input) => {
    input.addEventListener('change', () => { fromFile(input.files[0]); input.value = ''; });
  });

  /* ---------- Drag & drop (desktop) ---------- */
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => fromFile(e.dataTransfer.files[0]));

  /* ---------- Camera: the primary action ---------- */
  // Mouse devices (laptops) get a live webcam view; touch devices use their own camera app (sharper, more reliable).
  const isLaptop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  $('[data-camera-start]').addEventListener('click', () => {
    if (isLaptop) openWebcam();
    else $('[data-input-camera]').click();
  });

  async function openWebcam() {
    showAlert('');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = stream;
      drop.hidden = true;
      camera.hidden = false;
      page.dataset.state = 'camera';
    } catch (err) {
      showAlert('Kamera ochilmadi. «Rasm yuklash» orqali davom eting.');
    }
  }
  $('[data-camera-cancel]').addEventListener('click', stopCamera);
  $('[data-camera-shot]').addEventListener('click', () => {
    const c = document.createElement('canvas');
    c.width = video.videoWidth || 1280;
    c.height = video.videoHeight || 720;
    c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
    detect(c.toDataURL('image/jpeg', 0.85));
  });

  /* ---------- Result / retry ---------- */
  document.querySelectorAll('[data-rescan]').forEach((b) => b.addEventListener('click', () => setState('idle')));

  /* ---------- Prototype: jump to a state ---------- */
  const forced = { kamera: 'camera', aniqlanmoqda: 'processing', natija: 'result', topilmadi: 'notfound' }[q.get('holat')];
  if (forced === 'camera') { drop.hidden = true; camera.hidden = false; page.dataset.state = 'camera'; }
  else if (forced) {
    if (forced === 'result') showResult(RESULTS.find((r) => r.slug === q.get('mavzu')) || RESULTS[0]);
    page.dataset.state = forced;
  }
})();

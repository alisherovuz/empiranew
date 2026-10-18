// node --test tests/*.cjs  — scanner matching for the two books (api/_lib/curriculum.js)
const test = require('node:test');
const assert = require('node:assert');
const C = require('../api/_lib/curriculum');

const hit = (reading, hint) => {
  const r = C.match(reading, hint);
  return r.status === 'found' ? { grade: r.grade, n: r.topic.n, slug: r.topic.slug, method: r.method } : { status: r.status };
};

test('both books are loaded, each ending at its last page', () => {
  const L = C.load();
  assert.deepStrictEqual(C.grades(), [7, 8]);
  assert.strictEqual(L.grades[7].topics.length, 46);
  assert.strictEqual(L.grades[8].topics.length, 60);
  assert.strictEqual(L.grades[7].topics.at(-1).pEnd, 170);
  assert.strictEqual(L.grades[8].topics.at(-1).pEnd, 170);
  // older callers: plan / topics are still the 8-sinf book
  assert.strictEqual(L.plan.grade, 8);
  assert.strictEqual(L.topics.length, 60);
});

test('7-sinf: § 25 → prujina bikirligi lab work', () => {
  assert.deepStrictEqual(hit({ grade: 7, paragraph: 25 }), { grade: 7, n: 25, slug: 'laboratoriya-ishi-prujina-bikirligini-aniqlash', method: 'paragraph' });
});

test('7-sinf: page 93 with a 7 hint → § 25', () => {
  const r = hit({ page_number: 93 }, 7);
  assert.strictEqual(r.grade, 7); assert.strictEqual(r.n, 25); assert.strictEqual(r.method, 'page');
});

test('the same page number with no grade at all is read in the 8-sinf book', () => {
  const r = hit({ page_number: 93 });
  assert.strictEqual(r.grade, 8); assert.strictEqual(r.n, 31);
});

test('heading from the other book wins over the hint: «Impulsning saqlanish qonuni» → 7-sinf § 37', () => {
  const r = hit({ heading: 'Impulsning saqlanish qonuni' }, 8);
  assert.deepStrictEqual(r, { grade: 7, n: 37, slug: 'impulsning-saqlanish-qonuni', method: 'heading' });
});

test('8-sinf heading scanned from a 7-sinf page still finds Om qonuni', () => {
  const r = hit({ heading: 'Zanjirning bir qismi uchun Om qonuni' }, 7);
  assert.strictEqual(r.grade, 8); assert.strictEqual(r.n, 17);
});

test('reading.grade wins over the hint', () => {
  assert.strictEqual(hit({ grade: 7, page_number: 93 }, 8).n, 25);
  assert.strictEqual(hit({ grade: 8, page_number: 93 }, 7).n, 31);
  assert.strictEqual(hit({ grade: '7', paragraph: 37 }, 8).grade, 7);   // Gemini may answer "7" as a string
});

test('an invalid grade or hint falls back to 8-sinf', () => {
  assert.strictEqual(hit({ grade: 9, paragraph: 19 }, 11).grade, 8);
  assert.strictEqual(hit({ grade: null, paragraph: 19 }, 'x').n, 19);
});

test('8-sinf cases unchanged', () => {
  assert.deepStrictEqual(hit({ paragraph: 19, page_number: 61 }), { grade: 8, n: 19, slug: 'laboratoriya-ishi-om-qonunini-organish', method: 'paragraph' });
  assert.strictEqual(hit({ page_number: 61 }).n, 19);
  assert.strictEqual(hit({ heading: 'Eng oddiy elektromagnitni yig‘ish' }).n, 58);
  // § number inconsistent with the page → the page decides
  assert.strictEqual(hit({ paragraph: 58, page_number: 61 }).n, 19);
  assert.deepStrictEqual(hit({ is_textbook_page: false }), { status: 'notfound' });
  assert.deepStrictEqual(hit({ heading: 'Kimyo darsligi' }), { status: 'notfound' });
});

test('a found result carries labs from the right grade', () => {
  const r = C.match({ grade: 7, paragraph: 25 });
  assert.strictEqual(r.subject, 'Fizika');
  assert.ok(r.labs.length >= 1);
  assert.strictEqual(C.match({ grade: 7, paragraph: 2 }).labs.length, 0);   // § 2 Fazo va vaqt: no lab
});

test('section lists per book for the Gemini prompt', () => {
  assert.match(C.sectionList(7), /^1-§ \(pages 8–10\): Jismlarning harakati/);
  assert.match(C.sectionList(7), /46-§ \(pages 166–170\)/);
  assert.match(C.sectionList(), /^1-§ \(pages 4–8\): Jismlarning zaryadlanishi/);
  assert.strictEqual(C.sectionList(8), C.sectionList());
});

// api/scan.js end to end with a fake Gemini answer: the grade hint and reading.grade reach the matcher
test('POST /api/scan passes the grade hint and returns reading.grade', async () => {
  const { loadHandler } = require('./helpers.cjs');
  const sb={auth:{getUser:async()=>({data:{user:{id:'test-user'}}})},rpc:async()=>({data:true})};
  const handler=loadHandler('api/scan.js',sb,(...args)=>globalThis.fetch(...args));
  const realFetch = globalThis.fetch, key = process.env.GEMINI_API_KEY, log = console.log;
  let sentPrompt = '';
  process.env.GEMINI_API_KEY = 'test';
  console.log = () => {};
  const call = async (geminiReading, body) => {
    globalThis.fetch = async (url, opts) => {
      sentPrompt = JSON.parse(opts.body).contents[0].parts[0].text;
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(geminiReading) }] } }] }) };
    };
    let out;
    const res = { setHeader() {}, status(code) { return { json: (d) => { out = { code, ...d }; } }; } };
    await handler({ method: 'POST', headers:{authorization:'Bearer test-token'}, body: { image: 'AAAA', mime: 'image/jpeg', ...body } }, res);
    return out;
  };
  try {
    const a = await call({ is_textbook_page: true, grade: null, page_number: 93, paragraph: null, heading: null }, { grade: 7 });
    assert.strictEqual(a.code, 200); assert.strictEqual(a.grade, 7); assert.strictEqual(a.topic.n, 25);
    assert.deepStrictEqual(a.reading, { grade: null, page_number: 93, paragraph: null });
    const b = await call({ is_textbook_page: true, grade: 8, page_number: 93, paragraph: null, heading: null }, { grade: 7 });
    assert.strictEqual(b.grade, 8); assert.strictEqual(b.reading.grade, 8);
    const c = await call({ is_textbook_page: true, grade: null, page_number: 93 }, {});
    assert.strictEqual(c.grade, 8);
    assert.match(sentPrompt, /"grade": 7\|8\|null/);
    assert.match(sentPrompt, /Fizika\. 7-sinf" \(2017\)/);
    assert.match(sentPrompt, /37-§ \(pages \d+–\d+\): Impulsning saqlanish qonuni/);
    assert.match(sentPrompt, /19-§ \(pages 61–\d+\): Laboratoriya ishi\. Om qonunini o‘rganish/);
  } finally {
    globalThis.fetch = realFetch; console.log = log;
    if (key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = key;
  }
});

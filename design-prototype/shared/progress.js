/* Account-scoped drafts. Local first; Supabase sync is best-effort and visible. */
(function (root) {
  let userId = null, client = null, rows = {}, ready = false, timer = null, writing = false;
  const dirty = new Set();
  const key = () => 'empira.progress.v1.' + userId;
  const valid = (r) => r && /^[a-z0-9-]{1,100}$/.test(r.lab_id) && ['ready','build'].includes(r.mode) && r.snapshot && r.snapshot.version === 1 && Number.isFinite(Date.parse(r.updated_at));
  const id = (lab, mode) => lab + ':' + mode;
  function announce(message) {
    root.dispatchEvent(new CustomEvent('empira:progress', { detail: message }));
    document.querySelectorAll('[data-save-status]').forEach((el) => { el.textContent = message; });
  }
  function persist() {
    try { localStorage.setItem(key(), JSON.stringify(rows)); return true; }
    catch (_) { announce('Bu brauzerda saqlash imkoni yo‘q.'); return false; }
  }
  async function init(uid, sb) {
    userId = uid; client = sb; rows = {}; ready = false; dirty.clear(); clearTimeout(timer);
    if (!uid) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key()) || '{}');
      Object.values(saved).filter(valid).forEach((r) => { rows[id(r.lab_id, r.mode)] = r; });
    } catch (_) {}
    if (sb) {
      try {
        const result = await Promise.race([
          sb.from('lab_progress').select('lab_id,mode,snapshot,updated_at').eq('user_id', uid),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
        ]);
        if (uid !== userId) return;
        if (result.error) throw result.error;
        const remote = {};
        (result.data || []).filter(valid).forEach((r) => {
          const k = id(r.lab_id, r.mode); remote[k] = r;
          if (!rows[k] || Date.parse(r.updated_at) > Date.parse(rows[k].updated_at)) rows[k] = r;
        });
        Object.entries(rows).forEach(([k,r]) => { if (!remote[k] || Date.parse(r.updated_at) > Date.parse(remote[k].updated_at)) dirty.add(k); });
        persist();
      } catch (_) { announce('Natijalar shu qurilmada. Hisobga sinxronlash keyinroq qayta uriniladi.'); }
    }
    if(uid!==userId)return;
    ready = true;
    if (dirty.size) schedule();
  }
  function get(lab, mode) { return rows[id(lab, mode)]?.snapshot || null; }
  function save(lab, mode, snapshot) {
    if (!ready || !userId || !/^[a-z0-9-]{1,100}$/.test(lab) || !['ready','build'].includes(mode)) return;
    const k = id(lab, mode), data = JSON.parse(JSON.stringify({ ...snapshot, version: 1 }));
    if (JSON.stringify(rows[k]?.snapshot) === JSON.stringify(data)) return;
    rows[k] = { lab_id: lab, mode, snapshot: data, updated_at: new Date().toISOString() };
    dirty.add(k);
    if (persist()) announce('Shu qurilmada saqlandi');
    schedule();
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(flush, 1200); }
  async function flush() {
    if (!client || !userId || writing || !dirty.size) return;
    writing = true;
    const uid = userId, keys = [...dirty], batch = keys.map((k) => ({ ...rows[k], user_id: uid }));
    try {
      const r = await client.from('lab_progress').upsert(batch, { onConflict: 'user_id,lab_id,mode' });
      if (r.error) throw r.error;
      if (userId === uid) {
        keys.forEach((k,i) => { if (rows[k]?.updated_at === batch[i].updated_at) dirty.delete(k); });
        announce(dirty.size ? 'Shu qurilmada saqlandi' : 'Hisobingizga saqlandi');
      }
    } catch (_) { announce('Shu qurilmada saqlandi. Internet tiklanganda sinxronlanadi.'); }
    finally { writing = false; if(uid!==userId && dirty.size)schedule(); }
  }
  function recent() { return Object.values(rows).filter(valid).sort((a,b) => Date.parse(b.updated_at)-Date.parse(a.updated_at)); }
  function values(controls, saved) {
    return Object.fromEntries(controls.map((c) => {
      let v = saved?.[c.key];
      if (c.type === 'choice') { if (!c.options.some((o) => o.v === v)) v = c.value; }
      else if (typeof v !== 'number' || !Number.isFinite(v) || v < c.min || v > c.max) v = c.value;
      return [c.key, v];
    }));
  }
  root.addEventListener('online', flush);
  root.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  root.EMPIRA_PROGRESS = { init, get, save, recent, values, flush };
})(window);

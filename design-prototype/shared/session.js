/* Page access is UX gating; database RLS and API authentication enforce data access. */
(function () {
  document.documentElement.classList.add('empira-auth-pending');
  const onDOM = () => document.readyState === 'loading' ? new Promise((r) => document.addEventListener('DOMContentLoaded', r, {once:true})) : Promise.resolve();
  const deadline = (p) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))]);
  window.EMPIRA_READY = (async () => {
    try {
      if (!window.supabase) throw new Error('auth_unavailable');
      const sb = window.supabase.createClient('https://bxxpukjszidkcbuewbcf.supabase.co', 'sb_publishable_OxQzGLAdRWcCX06JnzEN7A_cRrRyMBM');
      window.EMPIRA_SB = sb;
      const result = await deadline(sb.auth.getSession());
      if (result.error) throw result.error;
      const session = result.data.session;
      if (!session) {
        location.replace('/dashboard?next=' + encodeURIComponent(location.pathname + location.search));
        return null;
      }
      const p = await deadline(sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle());
      if (p.error) throw p.error;
      if (!p.data || !(p.data.onboarded || p.data.school || p.data.role==='admin')) {
        location.replace('/dashboard?next=' + encodeURIComponent(location.pathname + location.search));
        return null;
      }
      window.EMPIRA_SESSION = session;
      await window.EMPIRA_PROGRESS.init(session.user.id, sb);
      sb.auth.onAuthStateChange((event, current) => {
        if (event === 'SIGNED_OUT' || (current && current.user.id !== session.user.id)) location.replace('/dashboard');
        if (current) window.EMPIRA_SESSION = current;
      });
      await onDOM();
      const header = document.querySelector('.topbar__inner, .labbar, header');
      if (header) {
        const nav = document.createElement('nav'); nav.className = 'empira-nav'; nav.setAttribute('aria-label','Hisob va laboratoriyalar');
        nav.innerHTML = '<a href="/dashboard">Bosh sahifa</a><a href="/dashboard?account=1">Hisobim</a>';
        header.appendChild(nav);
      }
      document.documentElement.classList.remove('empira-auth-pending');
      return session;
    } catch (_) {
      await onDOM();
      document.body.innerHTML = '<main class="empira-recovery"><h1>Ulanishni tiklaylik</h1><p>Hisobingiz yuklanmadi. Internetni tekshirib, qayta urinib ko‘ring.</p><button type="button" id="empira-retry">Qayta urinish</button><a href="/dashboard">Kirish sahifasi</a></main>';
      document.getElementById('empira-retry').onclick = () => location.reload();
      document.documentElement.classList.remove('empira-auth-pending');
      return null;
    }
  })();
})();

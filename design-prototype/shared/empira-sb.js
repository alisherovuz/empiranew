/* Empira drop-in replacement for @supabase/supabase-js (the subset the app uses).
 * Exposes window.supabase.createClient() returning a client with:
 *   .auth: getSession, setSession, signInWithOAuth(google), signOut, onAuthStateChange, getUser
 *   .from(table): select/insert/update/upsert + .eq()/.maybeSingle()/.single()
 *   .rpc(fn, args)
 * All backed by same-origin /api endpoints (no Supabase, no cross-origin). */
(function () {
  'use strict';
  var STORE = 'empira.auth.v1';

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (_) { return null; }
  }
  function writeStore(s) {
    try { s ? localStorage.setItem(STORE, JSON.stringify(s)) : localStorage.removeItem(STORE); } catch (_) {}
  }
  async function api(path, body, token) {
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var r = await fetch(path, { method: 'POST', headers: headers, body: JSON.stringify(body || {}) });
    var data = null; try { data = await r.json(); } catch (_) {}
    return { status: r.status, ok: r.ok, data: data };
  }

  function createClient() {
    var session = null;        // { access_token, refresh_token, expires_at, user }
    var listeners = [];
    var ready = hydrate();     // promise resolved once initial session is known

    function emit(event) { listeners.forEach(function (cb) { try { cb(event, session); } catch (_) {} }); }

    // Build a session object from stored tokens, validating/refreshing against the server.
    async function validate(stored) {
      if (!stored || !stored.access_token) return null;
      var u = await api('/api/auth/user', { access_token: stored.access_token });
      if (u.ok && u.data && u.data.user) {
        return { access_token: stored.access_token, refresh_token: stored.refresh_token,
                 expires_at: stored.expires_at, user: u.data.user };
      }
      if (stored.refresh_token) {
        var rf = await api('/api/auth/refresh', { refresh_token: stored.refresh_token });
        if (rf.ok && rf.data && rf.data.session) return rf.data.session;
      }
      return null;
    }

    // On load: capture tokens from the OAuth return fragment, else validate stored session.
    async function hydrate() {
      try {
        var fromUrl = parseHash();
        if (fromUrl) {
          session = await validate(fromUrl);
          writeStore(session);
          cleanHash();
          emit('SIGNED_IN');
          return;
        }
        session = await validate(readStore());
        writeStore(session);
      } catch (_) { session = null; }
    }

    function parseHash() {
      if (!location.hash || location.hash.indexOf('access_token') < 0) return null;
      var p = new URLSearchParams(location.hash.replace(/^#/, ''));
      var at = p.get('access_token');
      if (!at) return null;
      return { access_token: at, refresh_token: p.get('refresh_token'),
               expires_at: Number(p.get('expires_at')) || 0 };
    }
    function cleanHash() {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
    }

    var auth = {
      getSession: async function () {
        await ready;
        return { data: { session: session }, error: null };
      },
      getUser: async function () {
        await ready;
        return { data: { user: session ? session.user : null }, error: null };
      },
      setSession: async function (tokens) {
        session = await validate(tokens);
        writeStore(session);
        emit('SIGNED_IN');
        return { data: { session: session }, error: session ? null : { message: 'invalid_session' } };
      },
      signInWithOAuth: async function (opts) {
        var provider = opts && opts.provider;
        if (provider !== 'google') return { data: null, error: { message: 'unsupported_provider' } };
        var next = (opts && opts.options && opts.options.redirectTo) || (location.pathname + location.search);
        try { var u = new URL(next); next = u.pathname + u.search; } catch (_) {}
        location.href = '/api/auth/google/start?next=' + encodeURIComponent(next);
        return { data: { provider: 'google', url: null }, error: null };
      },
      signOut: async function () {
        var t = session && session.access_token;
        session = null; writeStore(null);
        try { await api('/api/auth/signout', { access_token: t }); } catch (_) {}
        emit('SIGNED_OUT');
        return { error: null };
      },
      onAuthStateChange: function (cb) {
        listeners.push(cb);
        ready.then(function () { if (session) { try { cb('INITIAL_SESSION', session); } catch (_) {} } });
        return { data: { subscription: { unsubscribe: function () {
          var i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1);
        } } } };
      }
    };

    function token() { return session && session.access_token; }

    // ---- data query builder (thenable) ----
    function from(table) {
      var st = { table: table, action: 'select', columns: '*', values: null, filters: {}, single: false, write: false };
      var builder = {
        // select() after a write (insert/update/upsert) means "return the row", not a read.
        select: function (cols) { st.columns = cols || '*'; if (!st.write) st.action = 'select'; return builder; },
        insert: function (rows) { st.action = 'insert'; st.values = rows; st.write = true; return builder; },
        update: function (vals) { st.action = 'update'; st.values = vals; st.write = true; return builder; },
        upsert: function (rows) { st.action = 'upsert'; st.values = rows; st.write = true; return builder; },
        delete: function () { st.action = 'delete'; st.write = true; return builder; },
        eq: function (col, val) { st.filters[col] = val; return builder; },
        maybeSingle: function () { st.single = true; return builder; },
        single: function () { st.single = true; return builder; },
        order: function () { return builder; },
        limit: function () { return builder; },
        then: function (resolve, reject) {
          return api('/api/db', st, token()).then(function (r) {
            resolve(r.data || { data: null, error: { message: 'request_failed' } });
          }, reject);
        },
        catch: function (fn) { return this.then(function (v) { return v; }, fn); }
      };
      return builder;
    }

    async function rpc(fn, args) {
      var r = await api('/api/rpc', { fn: fn, args: args || {} }, token());
      return r.data || { data: null, error: { message: 'request_failed' } };
    }

    // Storage is used only server-side in this app; stub to avoid crashes if referenced.
    var storage = { from: function () { return {
      upload: async function () { return { data: null, error: { message: 'unsupported' } }; },
      getPublicUrl: function () { return { data: { publicUrl: '' } }; }
    }; } };

    return { auth: auth, from: from, rpc: rpc, storage: storage };
  }

  window.supabase = { createClient: createClient };
})();

/* Empira — stars: a light reward for completed experiments.
   Per-device for now (keyed by signed-in user); cross-device sync comes with the offline/sync phase. */
(function (root) {
  var PER_LAB = 3;
  function uid() {
    try { return (root.EMPIRA_SESSION && root.EMPIRA_SESSION.user && root.EMPIRA_SESSION.user.id) || 'anon'; }
    catch (_) { return 'anon'; }
  }
  function keyFor() { return 'empira.completed.v1.' + uid(); }
  function list() {
    try { var v = JSON.parse(localStorage.getItem(keyFor()) || '[]'); return Array.isArray(v) ? v : []; }
    catch (_) { return []; }
  }
  function store(v) { try { localStorage.setItem(keyFor(), JSON.stringify(v)); } catch (_) {} }
  root.EMPIRA_STARS = {
    PER_LAB: PER_LAB,
    completedCount: function () { return list().length; },
    total: function () { return list().length * PER_LAB; },
    has: function (labId) { return list().indexOf(labId) !== -1; },
    // Marks a lab completed (once per lab) and returns the stars for this finish + the running total.
    award: function (labId) {
      if (!labId) return { total: this.total(), isNew: false, stars: PER_LAB };
      var l = list(), isNew = l.indexOf(labId) === -1;
      if (isNew) { l.push(labId); store(l); }
      return { total: this.total(), isNew: isNew, stars: PER_LAB };
    }
  };
})(window);

/* Empira: guided circuit assembly for the Ohm's law lab.
   Ideal DC components: wires, switch and ammeter have zero resistance;
   the voltmeter has infinite resistance. This is not a general circuit solver. */
(function (root) {
  'use strict';
  const parts = [
    { id: 'source', name: 'Tok manbai', symbol: '+ −', x: 17, y: 25, ports: ['sp', 'sn'] },
    { id: 'switch', name: 'Kalit', symbol: 'K', x: 50, y: 25, ports: ['ka', 'kb'] },
    { id: 'ammeter', name: 'Ampermetr', symbol: 'mA', x: 83, y: 25, ports: ['ap', 'an'] },
    { id: 'resistor', name: 'Rezistor', symbol: '200 Ω', x: 66, y: 73, ports: ['rp', 'rn'] },
    { id: 'voltmeter', name: 'Voltmetr', symbol: 'V', x: 25, y: 73, ports: ['vp', 'vn'] }
  ];
  const portLabels = { sp:'Manba +', sn:'Manba −', ka:'Kalit 1', kb:'Kalit 2', ap:'Ampermetr +', an:'Ampermetr −', rp:'Rezistor 1', rn:'Rezistor 2', vp:'Voltmetr +', vn:'Voltmetr −' };
  const ports = Object.keys(portLabels);
  const messages = {
    parts: 'Avval tok manbai, kalit, ampermetr, rezistor va voltmetrni stendga qo‘shing.',
    invalid: 'Ulanish topilmadi. Simni olib tashlab, qayta ulang.',
    short: 'Qisqa tutashuv: tok rezistordan o‘tmasdan manbaga qaytyapti. Manba qutblarini bevosita ulamang.',
    bypass: 'Jihozning ikki uchi bir sim bilan tutashgan. Bu simni olib tashlang.',
    series: 'Manba, kalit, ampermetr va rezistor bitta yopiq ketma-ket zanjir hosil qilishi kerak.',
    polarity: 'Ampermetr qutblari teskari: tok uning + uchidan kirishi kerak.',
    voltmeter: 'Voltmetrni rezistorning ikki uchiga parallel ulang. Uning + uchi manbaning + tomoniga qarasin.',
    ready: 'Zanjir tayyor! Kuchlanishni tanlang va kalitni ulang.'
  };
  function validate(selected, wires) {
    const result = (code) => ({ ok: code === 'ready', code, message: messages[code] });
    if (!Array.isArray(selected) || !parts.every(p => selected.includes(p.id))) return result('parts');
    if (!Array.isArray(wires)) return result('invalid');
    const parent = Object.fromEntries(ports.map(p => [p,p]));
    const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const join = (a,b) => { parent[find(a)] = find(b); };
    const seen = new Set();
    for (const w of wires) {
      if (!Array.isArray(w) || w.length !== 2 || !ports.includes(w[0]) || !ports.includes(w[1]) || w[0] === w[1]) return result('invalid');
      const key = w.slice().sort().join(':');
      if (seen.has(key)) return result('invalid');
      seen.add(key); join(w[0], w[1]);
    }
    // Detect a zero-resistance return path before checking the requested topology.
    const nets = Object.fromEntries(ports.map(p => [p,find(p)]));
    const ideal = { ...parent };
    join('ka','kb'); join('ap','an');
    if (find('sp') === find('sn')) return result('short');
    Object.assign(parent, ideal);
    if (parts.some(p => nets[p.ports[0]] === nets[p.ports[1]])) return result('bypass');
    const edges = [
      { id:'source', a:nets.sp, b:nets.sn },
      { id:'switch', a:nets.ka, b:nets.kb },
      { id:'ammeter', a:nets.ap, b:nets.an },
      { id:'resistor', a:nets.rp, b:nets.rn }
    ];
    const adjacency = {};
    edges.forEach(e => {
      (adjacency[e.a] ||= []).push(e);
      (adjacency[e.b] ||= []).push(e);
    });
    if (Object.values(adjacency).some(es => es.length !== 2)) return result('series');
    let node = nets.sp;
    const used = new Set(['source']);
    let resistorEntry = null, resistorExit = null;
    for (let i=0; i<3; i++) {
      const candidates = (adjacency[node] || []).filter(e => !used.has(e.id));
      if (candidates.length !== 1) return result('series');
      const e = candidates[0];
      if (e.id === 'ammeter' && node !== nets.ap) return result('polarity');
      const next = e.a === node ? e.b : e.a;
      if (e.id === 'resistor') { resistorEntry = node; resistorExit = next; }
      used.add(e.id); node = next;
    }
    if (node !== nets.sn || used.size !== 4) return result('series');
    if (nets.vp !== resistorEntry || nets.vn !== resistorExit) return result('voltmeter');
    return result('ready');
  }

  function create(container, onChange) {
    let selected = [], wires = [], active = null;
    container.innerHTML = '<div class="build-head"><p class="label">Om qonuni · Yig‘ish</p><h2>Zanjirni o‘zingiz quring</h2><p>Jihozlarni qo‘shing. Sim ulash uchun ikkita uchni navbat bilan bosing.</p></div><div class="build-palette" aria-label="Jihozlar"></div><div class="build-board" aria-label="Elektr zanjirini yig‘ish stendi"><svg class="build-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg></div><div class="build-tools"><button type="button" data-build-undo>Oxirgi simni olish</button><button type="button" data-build-hint>Yordam</button><button type="button" data-build-clear>Boshidan</button></div><p class="build-status" role="status" aria-live="polite"></p><ul class="build-connections" aria-label="Ulangan simlar"></ul>';
    const $ = s => container.querySelector(s);
    const palette = $('.build-palette'), board = $('.build-board'), svg = $('.build-wires'), status = $('.build-status');
    const coords = {};
    parts.forEach(p => p.ports.forEach((port,i) => { coords[port] = [p.x + (i ? 8 : -8), p.y + 12]; }));
    const buttons = {};
    parts.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'build-part'; b.textContent = '+ ' + p.name;
      b.setAttribute('aria-pressed','false');
      b.addEventListener('click', () => {
        if (selected.includes(p.id)) return;
        selected.push(p.id); draw(); onChange();
      });
      palette.appendChild(b); buttons[p.id] = b;
      const item = document.createElement('div'); item.className = 'build-equipment'; item.dataset.part = p.id; item.hidden = true;
      item.style.left = p.x + '%'; item.style.top = p.y + '%';
      const mark = document.createElement('strong'); mark.textContent = p.symbol;
      const label = document.createElement('span'); label.textContent = p.name;
      item.append(mark,label); board.appendChild(item);
      p.ports.forEach((port,i) => {
        const terminal = document.createElement('button'); terminal.type='button'; terminal.className='build-port'; terminal.dataset.port=port; terminal.hidden=true;
        terminal.style.left=coords[port][0]+'%'; terminal.style.top=coords[port][1]+'%';
        terminal.textContent = ['sp','ap','vp'].includes(port) ? '+' : ['sn','an','vn'].includes(port) ? '−' : String(i+1);
        terminal.setAttribute('aria-label',portLabels[port]); terminal.setAttribute('aria-pressed','false');
        terminal.addEventListener('click',() => {
          if (active === port) { active=null; draw(); return; }
          if (!active) { active=port; draw('Endi simning ikkinchi uchini bosing.'); return; }
          if (wires.some(w => w.includes(active) && w.includes(port))) { active=null; draw('Bu ikki uch allaqachon ulangan.'); return; }
          if (wires.length >= 12) { active=null; draw('Keraksiz simlarni olib tashlang.'); return; }
          wires.push([active,port]); active=null; draw(); onChange();
        });
        board.appendChild(terminal);
      });
    });
    function draw(message) {
      const checked = validate(selected,wires);
      parts.forEach(p => {
        const added=selected.includes(p.id);
        buttons[p.id].setAttribute('aria-pressed',String(added));
        buttons[p.id].textContent=(added?'✓ ':'+ ')+p.name;
        $('[data-part="'+p.id+'"]').hidden=!added;
        p.ports.forEach(port => {
          const b=$('[data-port="'+port+'"]'); b.hidden=!added; b.setAttribute('aria-pressed',String(active===port));
        });
      });
      svg.replaceChildren();
      wires.forEach(w => {
        const a=coords[w[0]], b=coords[w[1]];
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d','M '+a[0]+' '+a[1]+' C '+a[0]+' '+(a[1]+12)+', '+b[0]+' '+(b[1]+12)+', '+b[0]+' '+b[1]);
        path.setAttribute('vector-effect','non-scaling-stroke'); svg.appendChild(path);
      });
      status.textContent=message||checked.message; status.dataset.state=checked.ok?'ready':'pending';
      $('[data-build-undo]').disabled=wires.length===0;
      const list=$('.build-connections'); list.replaceChildren();
      wires.forEach((w,i) => {
        const li=document.createElement('li'), b=document.createElement('button'); b.type='button';
        b.textContent=portLabels[w[0]]+' ↔ '+portLabels[w[1]]+' ×';
        b.setAttribute('aria-label',portLabels[w[0]]+' va '+portLabels[w[1]]+' orasidagi simni olish');
        b.addEventListener('click',() => { wires.splice(i,1); active=null; draw(); onChange(); });
        li.appendChild(b); list.appendChild(li);
      });
    }
    $('[data-build-undo]').addEventListener('click',() => { wires.pop(); active=null; draw(); onChange(); });
    $('[data-build-clear]').addEventListener('click',() => { selected=[]; wires=[]; active=null; draw(); onChange(); });
    $('[data-build-hint]').addEventListener('click',() => {
      draw('Manba + → kalit → ampermetr +; ampermetr − → rezistor 1; rezistor 2 → manba −. Voltmetr + → rezistor 1; voltmetr − → rezistor 2.');
    });
    container.addEventListener('keydown',e => { if(e.key==='Escape') { active=null; draw(); } });
    draw();
    return { check:()=>validate(selected,wires), connections:()=>wires.map(w=>w.slice()), show:()=>{container.hidden=false;}, hide:()=>{container.hidden=true;} };
  }
  root.EMPIRA_BUILD = { validate, create };
})(typeof window === 'undefined' ? globalThis : window);

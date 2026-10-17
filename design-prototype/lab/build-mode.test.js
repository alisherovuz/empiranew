/* Run with: node design-prototype/lab/build-mode.test.js */
(function () {
  'use strict';
  if (typeof require === 'function') require('./build-mode.js');
  const validate = globalThis.EMPIRA_BUILD.validate;
  const parts = ['source','switch','ammeter','resistor','voltmeter'];
  const circuit = [['sp','ka'],['kb','ap'],['an','rp'],['rn','sn'],['vp','rp'],['vn','rn']];
  let count = 0;
  function check(name, selected, wires, expected) {
    const result = validate(selected,wires);
    if (expected === true ? !result.ok : expected === false ? result.ok : result.code !== expected) {
      throw new Error(name + ': ' + JSON.stringify(result));
    }
    count++;
  }
  check('complete circuit',parts,circuit,true);
  check('wire direction and entry order are immaterial',parts,circuit.slice().reverse().map(w=>w.slice().reverse()),true);
  check('switch can be reversed',parts,circuit.map(w=>w.map(p=>p==='ka'?'kb':p==='kb'?'ka':p)),true);
  check('resistor can be reversed',parts,circuit.map(w=>w.map(p=>p==='rp'?'rn':p==='rn'?'rp':p)),true);
  check('ammeter can appear after resistor',parts,[['sp','rp'],['rn','ap'],['an','ka'],['kb','sn'],['vp','rp'],['vn','rn']],true);
  parts.forEach(p=>check('missing '+p,parts.filter(x=>x!==p),circuit,'parts'));
  circuit.forEach((_,i)=>check('missing wire '+i,parts,circuit.filter((_,j)=>i!==j),false));
  check('direct supply short',parts,[...circuit,['sp','sn']],'short');
  check('short through ideal ammeter',parts,[['sp','ap'],['an','sn']],'short');
  check('short through closed switch',parts,[['sp','ka'],['kb','sn']],'short');
  check('resistor bypass',parts,[...circuit,['rp','rn']],'short');
  check('switch bypass',parts,[...circuit,['ka','kb']],false);
  check('ammeter reversed',parts,circuit.map(w=>w.map(p=>p==='ap'?'an':p==='an'?'ap':p)),'polarity');
  check('voltmeter reversed',parts,circuit.map(w=>w.map(p=>p==='vp'?'vn':p==='vn'?'vp':p)),'voltmeter');
  check('voltmeter across switch',parts,[...circuit.slice(0,4),['vp','ka'],['vn','kb']],'voltmeter');
  check('voltmeter in series',parts,[['sp','ka'],['kb','ap'],['an','vp'],['vn','rp'],['rn','sn']],false);
  check('self connection',parts,[...circuit,['rp','rp']],'invalid');
  check('unknown terminal',parts,[...circuit,['rp','unknown']],'invalid');
  check('duplicate reverse edge',parts,[...circuit,['ka','sp']],'invalid');
  check('invalid wires shape',parts,null,'invalid');
  check('invalid part selection',null,circuit,'parts');
  check('malformed edge',parts,[...circuit,['rp']],'invalid');
  check('empty board',[],[],'parts');
  // All permutations of series components should work with correct meter polarity.
  const components = [['ka','kb'],['ap','an'],['rp','rn']];
  function permutations(xs) { return xs.length ? xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(p=>[x,...p])) : [[]]; }
  permutations(components).forEach((order,i)=>{
    const wires=[['sp',order[0][0]],[order[0][1],order[1][0]],[order[1][1],order[2][0]],[order[2][1],'sn'],['vp','rp'],['vn','rn']];
    check('series permutation '+i,parts,wires,true);
  });
  console.log(count + ' circuit checks passed');
})();

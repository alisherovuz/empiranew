const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {loadHandler,call}=require('./helpers.cjs');
const privateStart={message:{text:'/start login',from:{id:123,first_name:'Student'},chat:{id:123,type:'private'}}};
const header={'x-telegram-bot-api-secret-token':'webhook-test'};
test('webhook rejects missing/wrong secrets before any database or Telegram call',async()=>{
  let touched=false;const sb={rpc:async()=>{touched=true;throw Error('unexpected');}};
  const handler=loadHandler('api/telegram/bot.js',sb,async()=>{touched=true;});
  for(const headers of [{},{'x-telegram-bot-api-secret-token':'wrong'}]){
    assert.equal((await call(handler,{headers,body:privateStart})).status,401);
  }
  assert.equal(touched,false);
});
test('webhook fails closed when secret is not configured',async()=>{
  const handler=loadHandler('api/telegram/bot.js',{},null,{TELEGRAM_WEBHOOK_SECRET:''});
  assert.equal((await call(handler,{headers:header,body:privateStart})).status,503);
});
test('webhook ignores mismatched identities and group chats',async()=>{
  const handler=loadHandler('api/telegram/bot.js',{rpc:()=>{throw Error('unexpected');}},null);
  for(const chat of [{id:999,type:'private'},{id:123,type:'group'}]){
    assert.equal((await call(handler,{headers:header,body:{message:{...privateStart.message,chat}}})).status,200);
  }
});
test('verified private start stores a six digit code before sending it',async()=>{
  const order=[];let stored,delivered;
  const sb={rpc:async(name,args)=>{order.push(name);if(name==='empira_issue_telegram_code')stored=args;return {data:true};}};
  const handler=loadHandler('api/telegram/bot.js',sb,async(url,opts)=>{order.push('send');delivered=JSON.parse(opts.body);return {ok:true,json:async()=>({ok:true})};});
  const out=await call(handler,{headers:header,body:privateStart});
  assert.equal(out.status,200);assert.match(stored.p_code,/^[0-9]{6}$/);assert.equal(delivered.chat_id,123);
  assert.ok(delivered.text.includes(stored.p_code));assert.equal(order.at(-1),'send');
});
test('code storage and delivery failures are retryable',async()=>{
  let sent=false;
  const handler=loadHandler('api/telegram/bot.js',{rpc:async(n)=>n==='empira_take_rate_limit'?{data:true}:{error:{message:'offline'}}},async()=>{sent=true;});
  assert.equal((await call(handler,{headers:header,body:privateStart})).status,503);assert.equal(sent,false);
});
test('OTP accepts only exactly six digits and enforces rate limits',async()=>{
  let consumed=false;
  const handler=loadHandler('api/telegram/verify.js',{rpc:async(n)=>{if(n.includes('consume'))consumed=true;return {data:false};}},null);
  for(const code of ['','12345','1234567','abcdef'])assert.equal((await call(handler,{body:{code}})).status,400);
  assert.equal((await call(handler,{body:{code:'123456'}})).status,429);assert.equal(consumed,false);
});
test('concurrent OTP verification issues only one session',async()=>{
  let available=true,signins=0;
  const sb={rpc:async(n)=>{if(n==='empira_take_rate_limit')return {data:true};const row=available?{telegram_id:123,first_name:'Student'}:null;available=false;return {data:row};},
    auth:{signInWithPassword:async()=>{signins++;return {data:{session:{access_token:'access',refresh_token:'refresh'}}};}},
    from:()=>({upsert:async()=>({})})};
  const handler=loadHandler('api/telegram/verify.js',sb,null);
  const replies=await Promise.all([call(handler,{body:{code:'123456'}}),call(handler,{body:{code:'123456'}})]);
  assert.deepEqual(replies.map(r=>r.status).sort(),[200,400]);assert.equal(signins,1);
});
test('scanner rejects malformed JSON and unauthenticated requests without calling Gemini',async()=>{
  let sent=false;const handler=loadHandler('api/scan.js',{},async()=>{sent=true;});
  assert.equal((await call(handler,{body:'{'})).status,400);
  assert.equal((await call(handler,{body:{image:'AAAA'}})).status,401);
  assert.equal(sent,false);
});
test('scanner rejects expired authentication and exhausted quota',async()=>{
  const request={headers:{authorization:'Bearer expired'},body:{image:'AAAA'}};
  let sent=false;
  const invalid=loadHandler('api/scan.js',{auth:{getUser:async()=>({error:{message:'expired'}})}},async()=>{sent=true;});
  assert.equal((await call(invalid,request)).status,401);
  const quota=loadHandler('api/scan.js',{auth:{getUser:async()=>({data:{user:{id:'u'}}})},rpc:async()=>({data:false})},async()=>{sent=true;});
  assert.equal((await call(quota,request)).status,429);assert.equal(sent,false);
});
function progressFixture(storage=new Map()){
  const handlers={},messages=[];
  const root={addEventListener(name,fn){handlers[name]=fn;},dispatchEvent(e){messages.push(e.detail);}};
  const sandbox={window:root,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{querySelectorAll:()=>[],addEventListener(){}},CustomEvent:class{constructor(type,o){this.detail=o.detail;}},setTimeout:()=>1,clearTimeout(){}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../design-prototype/shared/progress.js'),'utf8'),sandbox);
  return {p:root.EMPIRA_PROGRESS,storage,messages};
}
test('progress is isolated by account and survives a reload',async()=>{
  const {p,storage}=progressFixture();
  await p.init('student-a',null);p.save('om-qonuni','build',{placed:['battery'],wires:[],bestStars:2});
  await p.init('student-b',null);assert.equal(p.get('om-qonuni','build'),null);
  const second=progressFixture(storage).p;await second.init('student-a',null);
  assert.equal(second.get('om-qonuni','build').placed[0],'battery');
});
test('progress snapshots do not alias mutable lab arrays',async()=>{
  const {p,storage}=progressFixture();await p.init('student-a',null);
  const wires=[];p.save('om-qonuni','build',{wires});
  wires.push(['a','b']);p.save('om-qonuni','build',{wires});
  const saved=JSON.parse([...storage.values()][0]);assert.equal(saved['om-qonuni:build'].snapshot.wires.length,1);
});
test('failed remote save keeps local progress and can retry',async()=>{
  let attempts=0;
  const sb={from:()=>({select:()=>({eq:async()=>({data:[]})}),upsert:async()=>++attempts===1?{error:{message:'offline'}}:{}})};
  const {p,storage}=progressFixture();await p.init('a',sb);p.save('om-qonuni','ready',{runs:[{R:10}]});
  await p.flush();assert.ok(storage.size);await p.flush();assert.equal(attempts,2);
});
test('stored controls are validated before being used in an experiment',()=>{
  const {p}=progressFixture();
  const v=p.values([{key:'R',min:1,max:10,value:5},{key:'mode',type:'choice',value:'a',options:[{v:'a'},{v:'b'}]}],{R:Infinity,mode:'invalid'});
  assert.equal(v.R,5);assert.equal(v.mode,'a');
});

test('public catalogue counts come from both deployed curricula',async()=>{
  const handler=require('../api/catalog.js');
  const result=await call(handler,{method:'GET'});
  assert.equal(result.status,200);assert.equal(result.body.labs,88);
  assert.equal(result.body.topics,87);assert.deepEqual(result.body.grades,[7,8]);
});

test('offline reload queues saved drafts for sync when the connection recovers',async()=>{
  const original=progressFixture();await original.p.init('student-a',null);
  original.p.save('om-qonuni','build',{placed:['battery']});
  let saved=0;
  const sb={from:()=>({select:()=>({eq:async()=>({error:{message:'offline'}})}),upsert:async()=>{saved++;return {};}})};
  const resumed=progressFixture(original.storage);await resumed.p.init('student-a',sb);
  await resumed.p.flush();assert.equal(saved,1);
});

test('missing Preview environment returns a setup error without initializing a client',async()=>{
  for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_KEY','SUPABASE_ANON_KEY']){
    const handler=loadHandler('api/telegram/verify.js',{},null,{[key]:''});
    const out=await call(handler,{body:{code:'123456'}});
    assert.equal(out.status,503);assert.equal(out.body.code,'AUTH_NOT_CONFIGURED');
  }
});
test('missing OTP migration returns an actionable storage error',async()=>{
  const handler=loadHandler('api/telegram/verify.js',{rpc:async()=>({error:{code:'PGRST202'}})},null);
  const out=await call(handler,{body:{code:'123456'}});
  assert.equal(out.status,503);assert.equal(out.body.code,'AUTH_STORAGE_UNAVAILABLE');
  assert.equal(out.body.error.includes('PGRST'),false);
});

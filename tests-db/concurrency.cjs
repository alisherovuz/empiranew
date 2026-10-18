const test=require('node:test'),assert=require('node:assert/strict');
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile);
const sql=async(s)=>(await run('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-c',s])).stdout.trim();
test('database consumes a code only once under concurrent requests',async()=>{
  await sql("select public.empira_issue_telegram_code('987654',456,null,'Concurrency');");
  const rows=await Promise.all(Array.from({length:8},()=>sql("select public.empira_consume_telegram_code('987654') is not null;")));
  assert.equal(rows.filter(x=>x==='t').length,1);
});
test('database rate limiter is atomic under concurrent requests',async()=>{
  const rows=await Promise.all(Array.from({length:12},()=>sql("select public.empira_take_rate_limit('concurrent-test',3,60);")));
  assert.equal(rows.filter(x=>x==='t').length,3);
});

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
function loadHandler(file, sb, fetch, env={}) {
  const full=path.resolve(__dirname,'..',file), realRequire=createRequire(full);
  const sandbox={module:{exports:{}},exports:{},Buffer,AbortSignal,URL,setTimeout,clearTimeout,
    process:{env:{SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_KEY:'test-service',SUPABASE_ANON_KEY:'test-anon',TELEGRAM_WEBHOOK_SECRET:'webhook-test',TELEGRAM_BOT_TOKEN:'bot-test',APP_SECRET:'password-test',GEMINI_API_KEY:'test',...env}},
    console:{log(){},error(){}},fetch,
    require:(id)=>id==='@supabase/supabase-js'?{createClient:()=>sb}:realRequire(id)};
  // security reads process.env at invocation, so run it in the same isolated environment.
  const securityModule={exports:{}};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../api/_lib/security.js'),'utf8'),{...sandbox,module:securityModule,require:realRequire});
  sandbox.require=(id)=>id==='@supabase/supabase-js'?{createClient:()=>sb}:id.endsWith('/security')?securityModule.exports:realRequire(id);
  vm.runInNewContext(fs.readFileSync(full,'utf8'),sandbox,{filename:file});
  return sandbox.module.exports;
}
async function call(handler, req={}) {
  const out={headers:{}};
  const res={setHeader(k,v){out.headers[k]=v;},status(n){out.status=n;return this;},json(x){out.body=x;return this;},end(){return this;},send(x){out.body=x;return this;}};
  await handler({method:'POST',headers:{},...req},res);return out;
}
module.exports={loadHandler,call};

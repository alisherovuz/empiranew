// Read-only probes: never submit a login code or print credentials/response bodies.
(async()=>{
  const targets=[
    ['production','https://test.empira.uz/api/telegram/verify'],
    ['preview','https://empiranew-git-codex-integrate-8dcbb3-nurbeks-projects-055693d9.vercel.app/api/telegram/verify'],
    ['auth-library','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/dist/umd/supabase.js']
  ];
  for(const [name,url]of targets){
    try{
      const r=await fetch(url,{method:'GET',signal:AbortSignal.timeout(15000)});
      const text=await r.text();
      console.log(JSON.stringify({probe:name,status:r.status,type:r.headers.get('content-type'),vercelError:r.headers.get('x-vercel-error'),functionFailure:/FUNCTION_INVOCATION_FAILED|FUNCTION_NOT_FOUND|FUNCTION_INVOCATION_TIMEOUT/.test(text)}));
    }catch(e){console.log(JSON.stringify({probe:name,error:e.name}));}
  }
})().catch(()=>{process.exitCode=1;});

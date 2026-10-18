const {test,expect}=require('@playwright/test');
async function auth(page,{signedIn=true,profileError=false}={}){
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',r=>r.fulfill({contentType:'application/javascript',body:`
    window.supabase={createClient:()=>{
      const session=${JSON.stringify(signedIn)}?{user:{id:'student-one',email:'test@example.com',user_metadata:{full_name:'Test student'}},access_token:'test-token'}:null;
      const profile={id:'student-one',role:'student',onboarded:true,school:'Test school',full_name:'Test student'};
      return {auth:{getSession:async()=>({data:{session}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({}),signInWithOAuth:async()=>({})},
        from:(table)=>{
          const query={select(){return this;},eq(){return this;},maybeSingle:async()=>${JSON.stringify(profileError)}?{error:{message:'offline'}}:{data:profile},
            then(resolve,reject){return Promise.resolve({data:[]}).then(resolve,reject);},upsert:async()=>({}),update(){return this;}};
          return query;
        }};
    }};
  `}));
}
test('student dashboard opens searchable real catalogue without another home screen',async({page})=>{
  await auth(page);await page.goto('/dashboard');
  await expect(page.locator('#student-catalog')).toBeVisible();
  await page.locator('#student-catalog input').fill('Om qonuni');
  await expect(page.locator('.empira-results a').first()).toContainText('Om qonuni');
  await expect(page.locator('#tile-prez')).toBeHidden();
});
test('profile errors show retry instead of onboarding',async({page})=>{
  await auth(page,{profileError:true});await page.goto('/dashboard');
  await expect(page.locator('#sc-auth-error')).toBeVisible();
  await expect(page.locator('#sc-reg-student')).not.toBeVisible();
});
test('direct lab URL without session returns to login with destination',async({page})=>{
  await auth(page,{signedIn:false});await page.goto('/design-prototype/lab/index.html?lab=om-qonuni');
  await expect(page).toHaveURL(/dashboard\?next=/);
  await expect(page.locator('#sc-role')).toBeVisible();
});
test('invalid grade 7 lab URL displays a recovery screen',async({page})=>{
  await auth(page);await page.goto('/design-prototype/lab/index.html?lab=missing&sinf=7');
  await expect(page.getByRole('heading',{name:'Tajriba topilmadi'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Mavzularni ochish'})).toBeVisible();
});
test('failed 3D initialization disables Run and offers retry',async({page})=>{
  await auth(page);
  await page.route('**/vendor/three-0.170.0-bundle.js',r=>r.abort());
  await page.goto('/design-prototype/lab/index.html?lab=om-qonuni');
  await expect(page.locator('[data-fallback]')).toBeVisible();
  await expect(page.locator('[data-run]')).toBeDisabled();
  await expect(page.getByRole('button',{name:'Qayta urinish'})).toBeVisible();
});
test('build assembly survives reload and Continue points to the saved lab',async({page})=>{
  await auth(page);await page.goto('/design-prototype/lab/build/index.html?lab=om-qonuni');
  const start=page.locator('[data-coach-go]');
  await expect(start).toBeVisible();await start.click();
  await expect(page.locator('[data-tool]').first()).toBeVisible();
  for(let i=0;i<await page.locator('[data-tool]').count()&&!await page.locator('[data-tool].is-placed').count();i++)await page.locator('[data-tool]').nth(i).click();
  await expect(page.locator('[data-tool].is-placed').first()).toBeVisible();
  const placed=await page.locator('[data-tool].is-placed').first().getAttribute('data-tool');
  await page.reload();
  await expect(page.locator('[data-tool="'+placed+'"]')).toHaveClass(/is-placed/);
  await page.goto('/dashboard');
  await expect(page.locator('[data-resume]')).toHaveAttribute('href',/lab\/build\/index.html\?lab=om-qonuni/);
});
test('mobile catalogue fits the viewport and account is reachable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await auth(page);await page.goto('/dashboard');
  await expect(page.locator('#student-catalog')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.locator('.who[role=button]').press('Enter');
  await expect(page.locator('#sc-account')).toBeVisible();
});

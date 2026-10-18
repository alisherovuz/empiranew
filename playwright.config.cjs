const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests-ui',timeout:45000,retries:0,workers:2,
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',
    launchOptions:{args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']}},
  webServer:{command:'node tests-ui/server.cjs',port:4173,reuseExistingServer:false}
});

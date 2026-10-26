(async function browserCheck(){
const fs=require('node:fs'),assert=require('node:assert/strict');
const {default:puppeteer}=await import('puppeteer-core');
const binary=process.env.CHROME_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
if(!binary)throw new Error('Install Chrome/Edge or set CHROME_PATH to run the browser check.');
const origin=process.env.MEMBERSHIP_TEST_ORIGIN || 'http://127.0.0.1:3100';
const browser=await puppeteer.launch({executablePath:binary,headless:true,args:['--no-sandbox','--disable-gpu']});
try{
 const page=await browser.newPage(),errors=[];await page.setCacheEnabled(false);page.on('pageerror',error=>errors.push(error.message));
 const routes=['/member/register','/member/login?error=unauthenticated','/member/forgot-password','/member/reset-password'];
 let screens=0;
 for(const width of [320,390,1440]){
  await page.setViewport({width,height:900});
  for(const route of routes){
   const response=await page.goto(origin+route,{waitUntil:'networkidle0',timeout:45000});
   assert.equal(response.status(),200,route);
   const dom=await page.evaluate(()=>({main:document.querySelectorAll('main').length,h1:document.querySelectorAll('h1').length,width:document.documentElement.scrollWidth,viewport:innerWidth,publicHeader:document.querySelectorAll('header').length}));
   assert.equal(dom.main,1,route+' main landmark');assert.equal(dom.h1,1,route+' page title');
   assert.ok(dom.width<=dom.viewport,route+' horizontal overflow at '+width);
   assert.equal(dom.publicHeader,0,route+' must not overlap public navigation');
   screens++;
  }
 }
 await page.goto(origin+'/member/register',{waitUntil:'networkidle0'});
 await page.type('#first-name','Integration');await page.type('#last-name','Test');
 await page.type('#register-email','nobody@example.invalid');await page.type('#register-password','short');
 await page.$eval('form',form=>{form.noValidate=true;});
 await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.querySelector('[role=alert]')?.textContent?.includes('8'),{timeout:15000});
 assert.equal(await page.$eval('button[type=submit]',button=>button.disabled),false);
 for(const route of ['/member','/member/membership','/member/profile','/admin/members']){
  const response=await fetch(origin+route,{redirect:'manual'});
  assert.ok([303,307,308].includes(response.status),route+' should redirect');
  assert.match(response.headers.get('location'),/\/(?:member|admin)\/login/);
 }
 const denied=await fetch(origin+'/api/certificate/ASAM-2026-000001/pdf');
 assert.equal(denied.status,401);assert.equal(denied.headers.get('cache-control'),'private, no-store');
 const bad=await fetch(origin+'/api/certificate/x/pdf');assert.equal(bad.status,404);
 fs.mkdirSync('artifacts',{recursive:true});
 await page.setViewport({width:390,height:844});await page.goto(origin+'/member/register',{waitUntil:'networkidle0'});
 await page.screenshot({path:'artifacts/member-registration-mobile.png',fullPage:true});
 await page.setViewport({width:1440,height:900});await page.screenshot({path:'artifacts/member-registration-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({screensChecked:screens,serverValidation:'passed without creating an account',protectedRedirects:4,anonymousPdf:denied.status,clientErrors:errors,screenshots:['artifacts/member-registration-mobile.png','artifacts/member-registration-desktop.png']},null,2));
}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

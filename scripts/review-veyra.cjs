/* Local browser QA. Use an existing Playwright installation; no site dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname,'..');
const out = process.env.VEYRA_REVIEW_OUTPUT || '/private/tmp/tandish-journey-review/after';
fs.mkdirSync(out,{recursive:true});
const errors = [], checks = [], metrics = [];
const check = (name, value) => {assert.ok(value,name);checks.push(name);};
async function route(request) {
  const url = new URL(request.request().url());
  if (url.hostname !== 'website.test') return request.fulfill({status:204,body:''});
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/veyra') return request.fulfill({status:307,headers:{location:'/veyra/'}});
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root,'.'+pathname);
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file)) {
    errors.push('Missing local resource: '+pathname);
    return request.fulfill({status:404,body:'Not found'});
  }
  const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon','.json':'application/json'};
  return request.fulfill({status:200,body:fs.readFileSync(file),contentType:types[path.extname(file)] || 'text/plain'});
}
async function context(browser, options={}) {
  const ctx = await browser.newContext(options);
  await ctx.route('**/*',route);
  ctx.on('page', page => {
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  });
  return ctx;
}
async function load(page,url='/veyra/') {
  await page.goto('http://website.test'+url);
  await page.evaluate(()=>document.fonts.ready);
}
async function structure(page) {
  return page.evaluate(()=>{
    const ids = [...document.querySelectorAll('[id]')].map(el=>el.id);
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(el=>JSON.parse(el.textContent));
    return {
      h1:document.querySelectorAll('h1').length,
      duplicateIds:ids.filter((id,index)=>ids.indexOf(id)!==index),
      missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(el=>el.hash.slice(1)).filter(id=>id&&!document.getElementById(id)),
      missingARIA:[...document.querySelectorAll('[aria-labelledby],[aria-controls]')].flatMap(el=>['aria-labelledby','aria-controls'].flatMap(attr=>(el.getAttribute(attr)||'').split(' '))).filter(id=>id&&!document.getElementById(id)),
      canonical:document.querySelector('link[rel="canonical"]').href,
      schemas,
      faq:[...document.querySelectorAll('.faq-list details')].map(el=>({question:el.querySelector('summary').textContent,answer:el.querySelector('p').textContent.trim()}))
    };
  });
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
 try {
  const ctx=await context(browser);const page=await ctx.newPage();
  await load(page);const result=await structure(page);
  check('Valid headings, IDs, anchors and ARIA',result.h1===1&&!result.duplicateIds.length&&!result.missingAnchors.length&&!result.missingARIA.length);
  check('Canonical trailing slash',result.canonical==='https://tandish.com/veyra/');
  const faq=result.schemas.find(s=>s['@type']==='FAQPage');
  check('FAQ schema matches visible answers',faq.mainEntity.every((q,i)=>q.name===result.faq[i].question&&q.acceptedAnswer.text===result.faq[i].answer));
  check('Separate page and FAQ identities',result.schemas.some(s=>s['@type']==='WebPage'&&s['@id']!==faq['@id']));
  check('Seven narrative chapters including hero',await page.locator('main>section').count()===7);
  check('Public commercial matrix removed',!/(Starter|Professional|Enterprise|plan-card)/.test(fs.readFileSync(path.join(root,'veyra/index.html'),'utf8')));
  check('FAQ collapsed by default',await page.locator('.faq-list details[open]').count()===0);
  for(const width of [1440,1280,1024,768,390,375]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
   const m=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));metrics.push(m);check('No overflow '+width,m.scrollWidth===width);
   await page.screenshot({path:path.join(out,'veyra-'+width+'.png'),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const id of ['platform','real-estate','integration','domains','faq','walkthrough']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.locator('#'+id).screenshot({path:path.join(out,id+'.png')});}
  const tabs=page.locator('.estate-system [role=tab]');await tabs.nth(0).click();await page.locator('[data-example=house]').click();
  const property=await page.locator('.selected-property').textContent();await tabs.nth(1).click();check('Persistent selected property',property===await page.locator('.selected-property').textContent());
  check('Recommendation context updates',await page.locator('[data-alt-name]').textContent()==='Another Karen family home');
  await tabs.nth(1).focus();await page.keyboard.press('ArrowRight');check('Keyboard tabs',await tabs.nth(2).getAttribute('aria-selected')==='true');
  check('Price context updates',await page.locator('[data-price-context]').textContent()==='Karen · 4 bedrooms');
  await page.locator('.faq-list summary').first().click();check('Native FAQ interaction',await page.locator('.faq-list details[open]').count()===1);
  await page.locator('#theme-toggle').click();check('Theme control',await page.locator('html').getAttribute('data-theme')==='light');
  await page.waitForTimeout(600);await page.screenshot({path:path.join(out,'light-1440.png'),fullPage:true});
  await load(page,'/');check('Homepage Veyra entity',await page.evaluate(()=>[...document.querySelectorAll('script[type="application/ld+json"]')].some(e=>JSON.parse(e.textContent)['@id']==='https://tandish.com/#veyra')));
  await ctx.close();
  for(const [name,options] of [['reduced',{reducedMotion:'reduce'}],['no-js',{javaScriptEnabled:false}]]){
   const c=await context(browser,{...options,viewport:{width:390,height:844}});const p=await c.newPage();await load(p);
   check(name+' no overflow',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
   check(name+' no sticky mobile',await p.locator('.chapter-anchor').evaluate(e=>getComputedStyle(e).position)==='static');
   if(name==='no-js')check('All panels readable without JS',await p.locator('.tab-panel:visible').count()===7);
   else{check('Reduced motion disables animations',await p.locator('.tab-panel').first().evaluate(e=>getComputedStyle(e).animationName)==='none');await p.setViewportSize({width:1440,height:900});check('Reduced motion disables sticky desktop',await p.locator('.chapter-anchor').evaluate(e=>getComputedStyle(e).position)==='static');}
   await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});await c.close();
  }
  const fallback=await context(browser);await fallback.addInitScript(()=>{window.IntersectionObserver=undefined;Element.prototype.animate=undefined;});const f=await fallback.newPage();await load(f);await f.locator('.estate-system [role=tab]').nth(1).click();check('Observer and animation API fallback',await f.locator('.estate-system [role=tabpanel]:visible').count()===1);await fallback.close();
  if(errors.length)console.error(errors);check('No browser console or page errors',errors.length===0);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log(JSON.stringify({checks:checks.length,metrics,errors},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

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
      faq:[...document.querySelectorAll('.product-faq-item')].map(el=>({question:el.querySelector('.product-faq-question').textContent,answer:el.querySelector('.faq-panel').textContent.trim()}))
    };
  });
}
(async()=>{
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {})});
  try {
    // Rasterize the code-native social asset at its exact publication size.
    const socialContext = await context(browser,{viewport:{width:1200,height:630},deviceScaleFactor:1});
    const social = await socialContext.newPage();
    await load(social,'/assets/images/veyra-og.svg');
    await social.screenshot({path:path.join(root,'assets/images/veyra-og.png')});
    await socialContext.close();

    const reduced = await context(browser,{reducedMotion:'reduce'});
    const page = await reduced.newPage();
    for (const [name,url,widths] of [['home','/',[1440,390,375]],['veyra','/veyra/',[1440,1280,1024,768,390,375]]]) {
      await load(page,url);
      const result = await structure(page);
      check(name+': one H1 and valid anchors/ARIA',result.h1===1&&!result.duplicateIds.length&&!result.missingAnchors.length&&!result.missingARIA.length);
      if(name==='home') check('Homepage defines referenced Veyra entity',result.schemas.some(schema=>schema['@id']==='https://tandish.com/#veyra'));
      else {
        check('Canonical uses trailing slash',result.canonical==='https://tandish.com/veyra/');
        check('Separate WebPage and FAQPage IDs',result.schemas.some(schema=>schema['@type']==='WebPage'&&schema['@id'].endsWith('#webpage'))&&result.schemas.some(schema=>schema['@type']==='FAQPage'&&schema['@id'].endsWith('#faq')));
        const faq = result.schemas.find(schema=>schema['@type']==='FAQPage').mainEntity;
        check('Schema FAQs exactly match visible HTML',faq.length===result.faq.length&&faq.every((item,index)=>item.name===result.faq[index].question&&item.acceptedAnswer.text===result.faq[index].answer));
      }
      for(const width of widths) {
        await page.setViewportSize({width,height:1000});
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:path.join(out,`${name}-${width}-reduced.png`),fullPage:true});
        const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>el.className)}));
        metrics.push({name,...layout});
        check(`${name} ${width}: no overflow`,layout.scrollWidth===width&&!layout.overflow.length);
      }
      await page.setViewportSize({width:1440,height:1000});
      const selectors=name==='home'?['#product-veyra']:['#hero','#platform','#real-estate','#story','#recommendations','#price-intelligence','#how-it-works','#integration','#deployment','#plans','#domains','#walkthrough'];
      for(const selector of selectors) await page.locator(selector).screenshot({path:path.join(out,name+'-'+selector.slice(1)+'-desktop.png'),style:'.veyra-header,.company-header,.back-to-top,.veyra-skip,.skip-link{visibility:hidden!important}'});
    }
    check('Reduced motion starts no content animations',await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length===0));
    await load(page);
    await page.keyboard.press('Tab');
    check('Keyboard reaches skip link first',await page.evaluate(()=>document.activeElement.classList.contains('veyra-skip')));
    await page.keyboard.press('Enter');
    check('Skip link focuses main',await page.evaluate(()=>document.activeElement.id==='top'));
    await page.locator('[data-example="house"]').click();
    check('Demo updates criteria and preference',await page.locator('#demoQuery').innerText().then(text=>text.includes('Karen'))&&await page.locator('#demoPreference').innerText()==='None specified');
    check('Recommendation and price context follow selected example',await page.locator('#recommendationSource').innerText().then(text=>text.includes('Karen'))&&await page.locator('#priceContext').innerText().then(text=>text.includes('Karen')));
    await page.locator('[data-example="apartment"]').click();
    check('Apartment retains balcony preference',await page.locator('#demoPreference').innerText()==='Balcony');
    await page.locator('#faq-question-4').click();
    check('FAQ expands',await page.locator('#faq-question-4').getAttribute('aria-expanded')==='true');
    await page.locator('.integration-details summary').first().click();
    check('Native disclosure opens',await page.locator('.integration-details').first().getAttribute('open')!==null);
    await page.locator('#themeToggle').click();
    check('Theme toggles',await page.locator('html').getAttribute('data-theme')==='light');
    await page.setViewportSize({width:375,height:1000});
    await page.locator('#platform').screenshot({path:path.join(out,'platform-mobile-light.png'),animations:'disabled',style:'.veyra-header,.back-to-top,.veyra-skip{visibility:hidden!important}'});
    await reduced.close();

    for(const width of [1440,375]) {
      const motion = await context(browser,{viewport:{width,height:1000},reducedMotion:'no-preference'});
      const active = await motion.newPage();
      await load(active);
      await active.evaluate(()=>{window.motionCLS=0;new PerformanceObserver(list=>list.getEntries().forEach(entry=>{if(!entry.hadRecentInput)window.motionCLS+=entry.value;})).observe({type:'layout-shift',buffered:false});});
      await active.locator('.domain-equation').scrollIntoViewIfNeeded();
      await active.waitForTimeout(100);
      check(`Motion ${width}: current stage marker activates`,await active.locator('.journey-node').first().evaluate(el=>el.hasAttribute('data-passed')));
      check(`Motion ${width}: composition activates`,await active.locator('[data-journey-played]').count()>0);
      await active.screenshot({path:path.join(out,`platform-${width}-in-motion.png`)});
      // Native scroll through the complete story so one-time stages reach their final state.
      const height=await active.evaluate(()=>document.documentElement.scrollHeight);
      for(let y=0;y<height;y+=700){await active.evaluate(y=>window.scrollTo(0,y),y);await active.waitForTimeout(50);}
      await active.waitForTimeout(1400);
      check(`Motion ${width}: all groups reached`,await active.locator('[data-journey]:not([data-journey-played])').count()===0);
      const cls=await active.evaluate(()=>window.motionCLS);
      metrics.push({motionWidth:width,cls});
      check(`Motion ${width}: no animation-induced layout shift`,cls<.01);
      check(`Motion ${width}: trace reaches final stage`,await active.locator('.site-current__trace').evaluate(el=>Number(el.style.strokeDashoffset)===0));
      for(const selector of ['#platform','#deployment','#plans','#domains']) {
        await active.locator(selector).scrollIntoViewIfNeeded();
        await active.waitForTimeout(700);
        await active.locator(selector).screenshot({path:path.join(out,`${selector.slice(1)}-${width}-settled.png`),animations:'disabled',style:'.veyra-header,.back-to-top,.veyra-skip{visibility:hidden!important}'});
      }
      await active.emulateMedia({reducedMotion:'reduce'});
      await active.waitForFunction(()=>document.getAnimations().filter(animation=>animation.playState==='running').length===0);
      check(`Motion ${width}: preference change cancels all motion`,await active.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length===0));
      await motion.close();
    }
    for(const mode of ['no-js','no-observer','no-waapi']) {
      const fallback=await context(browser,{javaScriptEnabled:mode!=='no-js',viewport:{width:375,height:1000},reducedMotion:'no-preference'});
      if(mode==='no-observer') await fallback.addInitScript(()=>{window.IntersectionObserver=undefined;delete window.IntersectionObserver;});
      if(mode==='no-waapi') await fallback.addInitScript(()=>{Element.prototype.animate=undefined;});
      const staticPage=await fallback.newPage();await load(staticPage);
      check(mode+': content visible',await staticPage.locator('#platform-title').isVisible()&&await staticPage.locator('#plans-title').isVisible()&&await staticPage.locator('#domains-title').isVisible());
      check(mode+': no clipped or hidden essential text',await staticPage.locator('.domain-current').evaluate(el=>getComputedStyle(el).opacity==='1'));
      await staticPage.locator('#domains').screenshot({path:path.join(out,mode+'-domains.png'),animations:'disabled',style:'.veyra-header,.back-to-top,.veyra-skip{visibility:hidden!important}'});
      await fallback.close();
    }
    check('No JavaScript errors or missing local resources',errors.length===0);
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors},null,2));
    console.log(JSON.stringify({passed:checks.length,metrics,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

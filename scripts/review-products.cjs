/* Local browser QA. Use an existing Playwright installation; no site dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname,'..');
const out = process.env.GALLERY_REVIEW_OUTPUT || '/private/tmp/tandish-gallery-review/after';
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
  await ctx.addInitScript(() => {
    window.reviewCLS = 0;
    if (typeof PerformanceObserver === 'function') new PerformanceObserver(list => list.getEntries().forEach(entry => { if (!entry.hadRecentInput) window.reviewCLS += entry.value; })).observe({type:'layout-shift',buffered:true});
  });
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
 try{
  const ctx=await context(browser);const page=await ctx.newPage();await load(page,'/');
  const result=await structure(page);
  check('Valid homepage semantics and anchors',result.h1===1&&!result.duplicateIds.length&&!result.missingAnchors.length&&!result.missingARIA.length);
  check('Company and product structured data retained',result.schemas.some(s=>s['@type']==='Organization')&&result.schemas.some(s=>s['@type']==='WebSite')&&result.schemas.some(s=>s['@id']==='https://tandish.com/#veyra')&&JSON.stringify(result.schemas).includes('https://tandish.com/#saelis'));
  check('Expanded product chapters removed',await page.locator('.product-chapter,.hero-product-grid').count()===0);
  check('Only real products shipped',await page.locator('[data-product]').count()===2);
  check('Veyra status is active development',await page.locator('#product-veyra .status').textContent()==='Active development');
  check('Approach has three explorable stages',await page.locator('.approach-stage').count()===3);
  check('First approach stage readable on arrival',await page.locator('.approach-stage').first().getAttribute('open')!==null);
  for(let i=1;i<3;i++){
   const stage=page.locator('.approach-stage').nth(i);
   await stage.locator('summary').focus();await page.keyboard.press('Enter');
   check('Approach stage opens by keyboard '+i,await stage.locator('.stage-body').isVisible());
   await page.keyboard.press('Enter');check('Approach stage closes by keyboard '+i,!(await stage.locator('.stage-body').isVisible()));
  }
  await page.locator('#approach').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  check('Navigation reflects current section',await page.locator('.company-nav-links a[href="#approach"]').getAttribute('aria-current')==='location');
  check('Contact offers relevant routes',await page.locator('.contact-route').count()===3);

  for(const width of [1440,1280,1024,768,390,375,320]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
   const metric=await page.evaluate(()=>({width:innerWidth,height:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,cls:window.reviewCLS}));metrics.push(metric);
   check('No overflow '+width,metric.width===metric.scrollWidth);check('No layout shift '+width,metric.cls<.01);
   await page.screenshot({path:path.join(out,'home-'+width+'.png'),fullPage:true});
  }
  for(const width of [1440,390,375]){
   await page.setViewportSize({width,height:900});await page.locator('#products').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
   await page.locator('#products').screenshot({path:path.join(out,'gallery-'+width+'.png'),style:'.company-header,.skip-link,#scrollTop{visibility:hidden!important}'});
   const trigger=page.locator('[data-open-product]').first();await trigger.click();await page.waitForTimeout(650);
   check('Modal visible '+width,await page.locator('dialog').evaluate(d=>d.open&&d.matches(':modal')));
   const dimensions=await page.locator('dialog').boundingBox();check('Drawer anchored right '+width,Math.abs(dimensions.x+dimensions.width-width)<2);check('Drawer size '+width,width>760?dimensions.width/width>=.55&&dimensions.width/width<=.7:Math.abs(dimensions.width-width)<20);
   check('Persistent product CTA '+width,await page.locator('.drawer-cta').isVisible()&&(await page.locator('.drawer-cta').getAttribute('href')).includes('/veyra/'));
   check('Drawer starts at top '+width,await page.locator('.drawer-content').evaluate(e=>e.scrollTop===0));
   check('Close receives opening focus '+width,await page.locator('.drawer-close').evaluate(e=>e===document.activeElement));
   await page.screenshot({path:path.join(out,'veyra-drawer-'+width+'.png')});
   await page.locator('[data-detail-next]').click();await page.waitForTimeout(350);
   check('Next switches directly to Saelis '+width,(await page.locator('#drawer-title').textContent()).includes('shared interest'));
   await page.screenshot({path:path.join(out,'saelis-drawer-'+width+'.png')});
   await page.locator('[data-detail-next]').click();check('Last product wraps to first '+width,(await page.locator('#drawer-title').textContent()).includes('intelligence'));
   await page.locator('[data-detail-prev]').click();check('Previous wraps to last '+width,(await page.locator('.drawer-count').textContent())==='02 / 02');
   for(let i=0;i<12;i++){await page.keyboard.press('Tab');check('Modal retains keyboard focus '+width+' '+i,await page.evaluate(()=>!!document.activeElement.closest('dialog')));}
   await page.keyboard.press('Escape');await page.waitForTimeout(100);check('Escape closes '+width,await page.locator('dialog').evaluate(d=>!d.open));
   check('Focus restored to card '+width,await trigger.evaluate(e=>e===document.activeElement));
   check('Page scroll restored '+width,await page.evaluate(()=>!document.documentElement.classList.contains('product-modal-open')));
  }
  await page.setViewportSize({width:1440,height:900});await page.locator('[data-open-product]').first().focus();await page.keyboard.press('End');await page.waitForTimeout(500);
  check('Gallery End key selects last card',await page.locator('[data-open-product]').last().evaluate(e=>e===document.activeElement));
  check('Both desktop products fit',await page.locator('#product-track').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
  check('Desktop hides unnecessary gallery controls',await page.locator('.gallery-controls').isHidden());
  check('Products separated from contact',await page.locator('#products').evaluate(e=>getComputedStyle(e).borderBottomWidth==='1px'&&getComputedStyle(e).borderBottomStyle==='solid'));
  check('Products remain third section',await page.locator('main>section').evaluateAll(sections=>sections[2].id==='products'&&sections[3].id==='contact'));
  await page.locator('[data-open-product]').last().click();await page.waitForTimeout(650);await page.mouse.click(20,400);check('Backdrop closes modal',await page.locator('dialog').evaluate(d=>!d.open));
  await page.setViewportSize({width:390,height:900});await page.waitForTimeout(150);
  await page.locator('[data-gallery-prev]').click();await page.waitForTimeout(500);check('Gallery previous button returns first',await page.locator('.gallery-count').textContent()==='01 / 02');
  await page.locator('[data-gallery-next]').click();await page.waitForTimeout(500);check('Gallery next button reaches last',await page.locator('.gallery-count').textContent()==='02 / 02');
  await page.locator('[data-gallery-prev]').click();await page.waitForTimeout(500);await page.locator('#product-track').hover();await page.mouse.wheel(400,0);await page.waitForTimeout(500);check('Native horizontal wheel movement',await page.locator('#product-track').evaluate(e=>e.scrollLeft>0));
  await page.locator('#themeToggle').click();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'light-home.png'),fullPage:true});
  await page.locator('[data-open-product]').first().click();await page.waitForTimeout(650);await page.screenshot({path:path.join(out,'light-drawer.png')});await page.keyboard.press('Escape');
  await ctx.close();
  for(const [name,options] of [['no-js',{javaScriptEnabled:false}],['reduced',{reducedMotion:'reduce'}],['no-dialog',{}]]){
   const c=await context(browser,{...options,viewport:{width:390,height:844}});
   if(name==='no-dialog')await c.addInitScript(()=>{HTMLDialogElement.prototype.showModal=undefined;Element.prototype.animate=undefined;window.IntersectionObserver=undefined;});
   const p=await c.newPage();await load(p,'/');
   if(name==='reduced'){await p.locator('[data-open-product]').first().click();check('Reduced motion opens immediately',await p.locator('dialog').evaluate(e=>getComputedStyle(e).animationName)==='none');await p.locator('[data-detail-next]').click();check('Reduced motion switches immediately',await p.locator('.drawer-content .product-detail-body').evaluate(e=>getComputedStyle(e).animationName)==='none');}
   else{check(name+' native approach works',await p.locator('.approach-stage').count()===3);await p.locator('.approach-stage').nth(1).locator('summary').click();check(name+' approach content readable',await p.locator('.approach-stage').nth(1).locator('.stage-body').isVisible());check(name+' cards keep canonical CTA',await p.locator('[data-open-product]').first().getAttribute('href')==='/veyra/');check(name+' native details available',await p.locator('[data-product-detail]:visible').count()===2);await p.locator('.product-fallback summary').first().click();check(name+' detail readable',await p.locator('.product-fallback[open] .detail-model').isVisible());}
   await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});await c.close();
  }
  // Temporary fixture-only products verify growth without publishing fake products.
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const cards=html.match(/<article class="gallery-product"[\s\S]*?<\/article>/g);const base=cards[0];
  for(const total of [1,3,4,8,12]){
   let fixture=total===1?html.replace(cards[1],''):html;
   let extra='';
   for(let i=3;i<=total;i++){
    const name=i===total?'A longer future product name':'Fixture '+i;
    extra+=base.replaceAll('product-veyra','product-fixture-'+i).replaceAll('card-veyra-title','card-fixture-title-'+i).replace('data-product="veyra"','data-product="fixture-'+i+'"').replace('data-product-name="Veyra"','data-product-name="'+name+'"').replace('>Veyra<span','>'+name+'<span');
   }
   fixture=fixture.replace('</div><p class="gallery-hint">',extra+'</div><p class="gallery-hint">');
   const c=await context(browser,{viewport:{width:1280,height:900},reducedMotion:'reduce'});
   await c.route('http://website.test/',r=>r.fulfill({contentType:'text/html',body:fixture}));const p=await c.newPage();await load(p,'/');
   check('Scale '+total+' products configured',await p.locator('[data-product]').count()===total);
   if(total===1){
    check('Single product needs no gallery controls',await p.locator('.gallery-toolbar').isHidden());
    await p.locator('[data-open-product]').first().click();
    check('Single product drawer navigation disabled',await p.locator('[data-detail-next]').isDisabled()&&await p.locator('[data-detail-prev]').isDisabled());
    await c.close();continue;
   }
   await p.locator('[data-open-product]').first().focus();await p.keyboard.press('End');await p.waitForTimeout(150);
   check('Scale '+total+' keyboard/count',await p.locator('.gallery-count').textContent()===String(total-1).padStart(2,'0')+'–'+String(total).padStart(2,'0')+' / '+String(total).padStart(2,'0'));
   check('Scale '+total+' last next disabled',await p.locator('[data-gallery-next]').isDisabled());
   await p.locator('[data-gallery-prev]').click();await p.waitForTimeout(150);check('Scale '+total+' previous moves',!(await p.locator('[data-gallery-next]').isDisabled()));
   await p.locator('[data-open-product]').last().click();await p.locator('[data-detail-next]').click();check('Scale '+total+' drawer wraps',await p.locator('.drawer-count').textContent()==='01 / '+String(total).padStart(2,'0'));
   await p.locator('[data-detail-prev]').click();check('Scale '+total+' reverse wrap',await p.locator('.drawer-count').textContent()===String(total).padStart(2,'0')+' / '+String(total).padStart(2,'0'));
   await p.keyboard.press('Escape');
   await p.locator('[data-gallery-view]').click();
   check('Scale '+total+' all-products state',await p.locator('[data-gallery-view]').getAttribute('aria-expanded')==='true');
   check('Scale '+total+' all cards fit in rows',await p.locator('#product-track').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
   check('Scale '+total+' gallery arrows hidden in grid',await p.locator('.gallery-controls').isHidden());
   const positions=await p.locator('.gallery-product').evaluateAll(items=>items.map(e=>e.getBoundingClientRect().top));
   check('Scale '+total+' desktop has two columns',Math.abs(positions[0]-positions[1])<2&&positions[2]>positions[0]);
   for(const width of [390,320]){
    await p.setViewportSize({width,height:844});
    check('Scale '+total+' mobile grid fits '+width,await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
    const rows=await p.locator('.gallery-product').evaluateAll(items=>items.map(e=>e.getBoundingClientRect().top));
    check('Scale '+total+' mobile single column '+width,rows.every((top,i)=>i===0||top>rows[i-1]));
   }
   await p.locator('[data-open-product]').last().focus();await p.keyboard.press('Enter');
   check('Scale '+total+' grid opens correct drawer',await p.locator('.drawer-count').textContent()===String(total).padStart(2,'0')+' / '+String(total).padStart(2,'0'));
   await p.keyboard.press('Escape');check('Scale '+total+' grid focus restored',await p.locator('[data-open-product]').last().evaluate(e=>e===document.activeElement));
   await p.locator('[data-gallery-view]').click();
   check('Scale '+total+' carousel restored',await p.locator('[data-gallery-view]').getAttribute('aria-expanded')==='false');
   await p.locator('[data-open-product]').first().focus();await p.keyboard.press('End');await p.waitForTimeout(150);
   check('Scale '+total+' mobile reaches last product',await p.locator('.gallery-count').textContent()===String(total).padStart(2,'0')+' / '+String(total).padStart(2,'0'));
   check('Scale '+total+' no viewport overflow',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await c.close();
  }
  if(errors.length)console.error(errors);check('No browser errors',errors.length===0);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log(JSON.stringify({checks:checks.length,metrics,errors},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

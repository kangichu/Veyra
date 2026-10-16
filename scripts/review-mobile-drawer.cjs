/* Verify controls are inside the viewport and clickable, not just display:visible.
   PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE can point to existing local installs. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.DRAWER_REVIEW_OUTPUT || '/private/tmp/tandish-mobile-drawer';
fs.mkdirSync(out, { recursive: true });
const errors = [], checks = [];
const controls = ['.drawer-cta', '[data-detail-prev]', '[data-detail-next]'];
async function checkControls(page, label) {
  for (const selector of controls) {
    const state = await page.locator(selector).evaluate(el => {
      const r = el.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const left = viewport?.offsetLeft || 0;
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return {
        inside: r.top >= top && r.left >= left && r.bottom <= top + (viewport?.height || innerHeight) + 1 && r.right <= left + (viewport?.width || innerWidth) + 1,
        clickable: el === hit || el.contains(hit),
        height: r.height
      };
    });
    assert(state.inside && state.clickable && state.height >= 44, `${label}: ${selector} is fully visible and reachable`);
  }
  checks.push(label);
}
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE});
  try {
    for (const legacyViewport of [false, true]) {
      const context = await browser.newContext({viewport: {width: 390, height: 664}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname !== 'website.test') return route.fulfill({status: 204, body: ''});
        const file = path.resolve(root, '.' + (url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname));
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({status: 404, body: ''});
        let body = fs.readFileSync(file);
        // Simulate engines without dynamic viewport units: invalid declarations are ignored.
        if (legacyViewport && file.endsWith('.css')) body = Buffer.from(body.toString().replaceAll('100dvh', '100unsupported'));
        const contentType = {'.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'}[path.extname(file)] || 'application/octet-stream';
        return route.fulfill({body, contentType});
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://website.test/');
      await page.evaluate(() => document.fonts.ready);
      for (const [width, height] of [[390, 664], [320, 568], [844, 390], [1440, 900]]) {
        await page.setViewportSize({width, height});
        await page.locator('[data-open-product]').first().click();
        const label = `${legacyViewport ? 'fallback' : 'dynamic'} ${width}x${height}`;
        await checkControls(page, label + ' Veyra');
        assert((await page.locator('.drawer-cta').getAttribute('href')).endsWith('/veyra/'));
        await page.locator('.drawer-content').evaluate(el => { el.scrollTop = el.scrollHeight; });
        await checkControls(page, label + ' scrolled');
        await page.locator('[data-detail-next]').click();
        assert((await page.locator('.drawer-cta').textContent()).includes('Ask about Saelis'));
        assert((await page.locator('.drawer-cta').getAttribute('href')).startsWith('mailto:hello@tandish.com'));
        await checkControls(page, label + ' Saelis');
        if (width === 390) await page.screenshot({path: path.join(out, `saelis-${legacyViewport ? 'fallback' : 'dynamic'}.png`)});
        // Browser bars appearing or disappearing must not move controls off screen.
        await page.setViewportSize({width, height: height - 100});
        await checkControls(page, label + ' resized while open');
        await page.locator('[data-detail-prev]').click();
        assert((await page.locator('.drawer-cta').textContent()).includes('Explore Veyra'));
        await checkControls(page, label + ' previous');
        // Exercise the product action itself without sending a message or making a request.
        await page.locator('.drawer-cta').click();
        await page.waitForURL('**/veyra/');
        await page.goto('http://website.test/');
      }
      await context.close();
    }
    assert.equal(errors.length, 0, errors.join('\n'));
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({checks, errors}, null, 2));
    console.log(JSON.stringify({checks: checks.length, errors, out}));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

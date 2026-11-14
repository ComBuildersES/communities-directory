// App local: node --test tests/browser/ctaPreferences.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const es = JSON.parse(readFileSync(new URL('../../src/i18n/locales/es.json', import.meta.url)));
const base = 'http://127.0.0.1:4173';
for (const width of [1440, 390, 320]) {
  test(`tarjeta persistente, filtro y reapertura desde mapa (${width}px)`, { timeout: 90000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.goto(`${base}/es/?t=python&s=active,inactive&hv=true`, { waitUntil: 'networkidle' });
      const card = page.locator('.cta-panel');
      await card.waitFor();
      // El recuento de pendientes va interpolado en el propio texto del enlace.
      const review = card.locator('.cta-panel__note a');
      assert.match(await review.getAttribute('href'), /hv=false/);
      await review.click();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('hv') === 'false');
      let params = new URL(page.url()).searchParams;
      assert.equal(params.get('t'), 'python');
      assert.equal(params.get('s'), null);
      const data = await (await page.request.get(`${base}/data/communities.json`)).json();
      const expected = data.filter(c => !c.hidden && c.humanValidated === false && c.status === 'active' && (c.matchesAllTags || c.tags.includes('python'))).length;
      assert.equal(Number(await page.locator('.results-count strong').innerText()), expected);
      await card.getByRole('button', { name: es.addCommunityCTA.later }).click();
      assert.equal(await card.count(), 0);
      const reopen = page.locator('.heading-reopen-community-cta');
      assert.equal(await reopen.count(), 1);
      assert.equal(await reopen.evaluate(el => el.nextElementSibling.classList.contains('heading-action-btn--guide')), true);
      const closeFocus = width === 1440 ? reopen : page.locator('.heading-hamburger');
      assert.equal(await closeFocus.evaluate(el => el === document.activeElement), true);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await card.count(), 0);
      await reopen.waitFor({ state: 'attached' });
      if (!(await reopen.isVisible())) await page.locator('.heading-hamburger').click();
      await page.screenshot({ path: `/tmp/cta-closed-${width}.png` });
      await reopen.click();
      await card.waitFor();
      assert.equal(await card.locator('.cta-panel__title').evaluate(el => el === document.activeElement), true);
      assert.equal(await reopen.count(), 0);
      await page.reload({ waitUntil: 'networkidle' });
      await card.waitFor();
      await page.screenshot({ path: `/tmp/cta-open-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await card.getByRole('button', { name: es.addCommunityCTA.later }).click();
      await page.locator('.results-bar__controls').getByRole('button', { name: /Mapa/ }).click();
      await page.locator('.map-add-community').waitFor();
      if (!(await reopen.isVisible())) await page.locator('.heading-hamburger').click();
      await reopen.click();
      await card.waitFor();
      assert.equal(await page.locator('.map-add-community').count(), 0);
      params = new URL(page.url()).searchParams;
      assert.equal(params.get('hv'), 'false');
      assert.equal(params.get('t'), 'python');
    } finally { await browser.close(); }
  });
}

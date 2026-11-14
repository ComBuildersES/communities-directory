// App local: node --test tests/browser/ctaRefinement.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const locales = Object.fromEntries(['es', 'en'].map(locale => [locale, JSON.parse(readFileSync(new URL(`../../src/i18n/locales/${locale}.json`, import.meta.url)))]));
const base = 'http://127.0.0.1:4173';
for (const [locale, width] of [['es', 1900], ['es', 900], ['es', 390], ['en', 390]]) {
  test(`una invitación, alta principal y búsqueda secundaria (${locale}, ${width}px)`, { timeout: 90000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: 1050 } });
      const copy = locales[locale].addCommunityCTA;
      await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' });
      const panel = page.locator('.cta-panel');
      await panel.waitFor();
      assert.equal(await page.locator('.cta-bar').count(), 0);
      assert.equal(await panel.count(), 1);
      const insertion = await panel.evaluate(el => {
        const grid = el.parentElement;
        return { index: [...grid.children].indexOf(el), columns: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length };
      });
      assert.ok(insertion.index >= 24 && insertion.index < 24 + insertion.columns);
      assert.equal(insertion.index % insertion.columns, 0);
      const primary = panel.getByRole('link', { name: copy.add, exact: true });
      const secondary = panel.getByRole('button', { name: copy.findMine, exact: true });
      assert.match(await primary.getAttribute('href'), /\?contribute=new$/);
      assert.equal(await page.getByRole('button', { name: copy.findMine, exact: true }).count(), 1);
      assert.equal(await panel.locator('.cta-panel__lead strong').innerText(), locale === 'es' ? 'Estos datos son abiertos' : 'This data is open');
      assert.ok((await panel.locator('.cta-panel__lead').innerText()).includes(locale === 'es' ? 'sus datos están incompletos o desactualizados, puede no aparecer en las búsquedas.' : 'its details are incomplete or out of date, it may not appear in searches.'));
      await panel.scrollIntoViewIfNeeded();
      const primaryRect = await primary.boundingBox();
      const secondaryRect = await secondary.boundingBox();
      assert.ok(secondaryRect.y >= primaryRect.y + primaryRect.height);
      assert.ok(Math.abs(primaryRect.width - secondaryRect.width) < 1);
      if (width >= 900) {
        const box = await panel.boundingBox();
        assert.ok(box.x + box.width - primaryRect.x - primaryRect.width < 40);
      }
      assert.deepEqual(await primary.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color })), { bg: 'rgb(36, 92, 155)', color: 'rgb(255, 255, 255)' });
      assert.deepEqual(await secondary.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderStyle })), { bg: 'rgb(255, 255, 255)', border: 'solid' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `/tmp/cta-single-${locale}-${width}.png` });
      await secondary.click();
      assert.equal(await page.locator('.tag-search-input').evaluate(el => el === document.activeElement), true);
      await panel.getByRole('button', { name: copy.later }).click();
      assert.equal(await panel.count(), 0);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await panel.count(), 0);
      const reopen = page.locator('.heading-reopen-community-cta');
      await reopen.waitFor({ state: 'attached' });
      if (!(await reopen.isVisible())) await page.locator('.heading-hamburger').click();
      await reopen.click();
      await panel.waitFor();
      assert.equal(await panel.locator('h2').evaluate(el => el === document.activeElement), true);
      await page.goto(`${base}/${locale}/?t=generative-ai`, { waitUntil: 'networkidle' });
      await panel.waitFor();
      assert.equal(await panel.locator('h2').innerText(), copy.panel.title.filtered);
      assert.equal(await panel.locator('.cta-panel__lead').getByRole('button').count(), 0);
      assert.equal(await panel.locator('.cta-panel__lead').innerText(), copy.panel.leadFiltered);
      const url = page.url();
      await secondary.click();
      assert.equal(await page.locator('.tag-search-input').evaluate(el => el === document.activeElement), true);
      assert.equal(page.url(), url);
      await primary.click();
      await page.locator('.contribution-shell').waitFor();
    } finally { await browser.close(); }
  });
}

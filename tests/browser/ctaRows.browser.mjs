// App local: node --test tests/browser/ctaRows.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('el panel completa filas al redimensionar la ventana y el contenedor', { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1900, height: 1000 } });
    await page.goto('http://127.0.0.1:4173/es/', { waitUntil: 'networkidle' });
    const panel = page.locator('.cta-panel');
    await panel.waitFor();
    const checkFullRow = async () => {
      await page.waitForFunction(() => {
        const panel = document.querySelector('.cta-panel');
        const grid = panel?.parentElement;
        if (!grid?.classList.contains('communitieslist')) return false;
        const columns = getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length;
        const count = [...grid.children].indexOf(panel);
        return count >= 24 && count < 24 + columns && count % columns === 0;
      });
      assert.equal(await panel.count(), 1);
      const geometry = await panel.evaluate(el => {
        const grid = el.parentElement;
        const last = el.previousElementSibling.getBoundingClientRect();
        const box = grid.getBoundingClientRect();
        return { lastRight: last.right, gridRight: box.right };
      });
      assert.ok(Math.abs(geometry.lastRight - geometry.gridRight) < 2);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    };
    for (const width of [1900, 1774, 1450, 1208, 1100, 900, 699, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await checkFullRow();
      if ([1774, 1208, 390].includes(width)) {
        await panel.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `/tmp/cta-rows-${width}.png` });
      }
    }
    await page.setViewportSize({ width: 1450, height: 1000 });
    await checkFullRow();
    const gridWidth = await panel.evaluate(el => el.parentElement.clientWidth);
    await page.locator('.results-bar__controls').getByRole('button', { name: /Filtros/ }).click();
    await page.locator('.filter-panel--open').waitFor();
    await checkFullRow();
    await page.locator('.communitieslist-container').evaluate(el => { el.style.maxWidth = '1100px'; });
    await page.waitForFunction(oldWidth => document.querySelector('.communitieslist-container .communitieslist').clientWidth !== oldWidth, gridWidth);
    await checkFullRow();
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({ path: '/tmp/cta-rows-sidebar.png' });
  } finally { await browser.close(); }
});

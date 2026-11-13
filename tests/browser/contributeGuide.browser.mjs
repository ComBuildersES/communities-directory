// Ejecutar con la app local arrancada: node --test tests/browser/contributeGuide.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

for (const width of [1440, 390]) {
  test(`chips, contadores y tooltip del mapa a ${width}px`, { timeout: 90000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 } });
      await page.goto('http://127.0.0.1:4173/es/?s=active,inactive&ot=collaborations', { waitUntil: 'domcontentloaded' });
      const openGuide = async () => {
        if (width === 390) {
          const menu = page.getByRole('button', { name: /menú/i });
          if (await menu.count() && !(await page.getByRole('button', { name: 'Qué puedes hacer aquí', exact: true }).isVisible())) await menu.first().click();
        }
        await page.getByRole('button', { name: 'Qué puedes hacer aquí', exact: true }).click();
        await page.getByRole('button', { name: /Aportar a una comunidad/ }).click();
      };
      await openGuide();
      const dialog = page.getByRole('dialog');
      const originalUrl = page.url();
      const chips = dialog.locator('.guide-contribute-chip');
      assert.equal(await chips.count(), 7);
      assert.equal(await dialog.getByRole('combobox').count(), 0);
      assert.equal(await dialog.locator('.guide-contribute-choice-trigger').count(), 0);
      const notes = dialog.getByRole('complementary', { name: 'Ten en cuenta' });
      assert.match(await notes.innerText(), /dato nuevo/);
      assert.match(await notes.innerText(), /te animamos a contactar/);
      assert.ok(await notes.evaluate(el => el.getBoundingClientRect().bottom < el.nextElementSibling.getBoundingClientRect().top));
      for (const chip of await chips.all()) {
        const count = Number(await chip.locator('.guide-contribute-chip-count').innerText());
        assert.equal(await chip.isDisabled(), count === 0);
      }
      assert.equal(page.url(), originalUrl);
      const coorganize = dialog.getByRole('button', { name: /^Ayudando a dinamizar la comunidad:/ });
      const expectedCount = Number(await coorganize.locator('.guide-contribute-chip-count').innerText());
      assert.ok(expectedCount > 0);
      await coorganize.focus();
      await page.getByRole('tooltip').waitFor();
      assert.match(await page.getByRole('tooltip').innerText(), /organiza/);
      await page.keyboard.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'detached' });
      assert.equal(await dialog.count(), 1);
      await page.screenshot({ path: `/tmp/combuilder-contribute-chips-${width}.png`, fullPage: true });
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));
      await coorganize.click();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('ot') === 'co-organisers');
      assert.equal(new URL(page.url()).searchParams.get('s'), new URL(originalUrl).searchParams.get('s'));
      assert.equal(Number(await page.locator('.results-count strong').innerText()), expectedCount);
      await page.waitForFunction(() => document.activeElement?.classList.contains('filter-panel'));
      await openGuide();
      await dialog.getByRole('button', { name: /Afina y explora/ }).click();
      await dialog.getByRole('img', { name: /Panel de filtros/ }).waitFor();
      const map = dialog.getByRole('button', { name: 'Explorar el mapa', exact: true });
      assert.match(await map.getAttribute('class'), /opendata-footer-btn/);
      await map.hover();
      await page.getByRole('tooltip').waitFor();
      assert.match(await page.getByRole('tooltip').innerText(), /Solo aparecen las comunidades/);
      await map.click();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('view') === 'map');
      assert.equal(await dialog.count(), 0);
      assert.equal(new URL(page.url()).searchParams.get('ot'), 'co-organisers');
    } finally {
      await browser.close();
    }
  });
}

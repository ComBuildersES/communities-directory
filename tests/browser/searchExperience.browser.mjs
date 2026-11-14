// App local: node --test tests/browser/searchExperience.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = 'http://127.0.0.1:4173';
const captures = new URL('../../node_modules/.cache/search-review/', import.meta.url).pathname;
mkdirSync(captures, { recursive: true });
async function ready(page, query = '') {
  await page.goto(`${base}/es/${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Number(document.querySelector('.results-count strong')?.textContent) > 0);
  return page.locator('.tag-search-input');
}
async function usingBrowser(options, run) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await run(page);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}

test('Intro filtra nombres completos, conserva facetas y sobrevive a recarga; los parciales se separan', { timeout: 60000 }, async () => {
  await usingBrowser({}, async page => {
    const input = await ready(page, '?t=python');
    await input.fill('gdg almer');
    assert.equal(await page.locator('.tag-search-group--communities').count(), 0);
    assert.ok(await page.locator('.tag-search-group--related .tag-search-option').count() > 3);
    await page.screenshot({ path: `${captures}partial.png` });
    await input.press('Enter');
    await page.waitForFunction(() => new URL(location.href).searchParams.get('q') === 'gdg almer');
    assert.equal(new URL(page.url()).searchParams.get('t'), 'python');
    assert.equal(await page.locator('.results-count strong').innerText(), '0');
    assert.equal(await page.locator('.tag-search-dropdown').count(), 0);
    assert.equal(await page.locator('.results-summary').evaluate(el => el === document.activeElement), true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.results-chips')?.textContent.includes('gdg almer'));
    assert.equal(await page.locator('.results-count strong').innerText(), '0');
    await page.getByRole('button', { name: 'Quitar filtro gdg almer', exact: true }).click();
    await page.waitForFunction(() => Number(document.querySelector('.results-count strong')?.textContent) > 0);
    assert.equal(new URL(page.url()).searchParams.get('t'), 'python');
    await input.fill('gdg madrid');
    await input.press('Enter');
    await page.waitForFunction(() => new URL(location.href).searchParams.get('q') === 'gdg madrid');
    const data = await (await page.request.get(`${base}/data/communities.json`)).json();
    const expected = data.filter(c => !c.hidden && c.status === 'active' && (c.matchesAllTags || c.tags?.includes('python')) && /gdg/i.test(c.name) && /madrid/i.test(c.name));
    assert.equal(Number(await page.locator('.results-count strong').innerText()), expected.length);
  });
});

test('se aprovecha la altura; flechas, Intro y Tab activan fichas y temáticas', { timeout: 60000 }, async () => {
  await usingBrowser({}, async page => {
    const input = await ready(page);
    await input.fill('gdg');
    const options = page.locator('.tag-search-group--communities .tag-search-option');
    assert.ok(await options.count() > 3);
    assert.equal(await page.locator('.tag-search-show-more').count(), 0);
    const box = await page.locator('.tag-search-dropdown').boundingBox();
    assert.ok(box.height > 500);
    assert.ok(box.y + box.height <= 900);
    await page.screenshot({ path: `${captures}desktop.png` });
    const first = await options.first().locator('.tag-option-label').innerText();
    await input.press('ArrowDown');
    assert.ok(await input.getAttribute('aria-activedescendant'));
    await input.press('Enter');
    await page.locator('.community-modal-name').waitFor();
    assert.equal(await page.locator('.community-modal-name').innerText(), first);
    await page.keyboard.press('Escape');
    await input.fill('C');
    const c = page.locator('.tag-search-group--topics .tag-search-option');
    assert.equal(await c.count(), 1);
    assert.equal(await c.locator('.tag-option-label').innerText(), 'C');
    await c.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => new URL(location.href).searchParams.get('t') === 'c');
    assert.equal(await page.locator('.tag-search-dropdown').count(), 0);
    await input.fill('zzzzzzzzzz');
    assert.match(await page.locator('.tag-search-dropdown').innerText(), /Sin coincidencias/);
    await input.press('Escape');
    assert.equal(await page.locator('.tag-search-dropdown').count(), 0);
    assert.equal(await input.inputValue(), 'zzzzzzzzzz');
  });
});

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
  test(`vista dedicada, cierre, foco y toque (${viewport.width} × ${viewport.height})`, { timeout: 60000 }, async () => {
    await usingBrowser({ viewport, hasTouch: true, isMobile: true }, async page => {
      const input = await ready(page);
      await input.tap();
      const dialog = page.locator('.tag-search-bar--dedicated');
      await dialog.waitFor();
      await input.fill('gdg');
      const box = await dialog.boundingBox();
      assert.ok(box.y >= 0 && box.y < 2);
      assert.ok(Math.abs(box.height - viewport.height) < 2);
      assert.equal(await page.locator('.results-bar').evaluate(el => el.inert), true);
      assert.equal(await dialog.evaluate(el => Number(getComputedStyle(el).zIndex) > Number(getComputedStyle(document.querySelector('#title')).zIndex)), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `${captures}mobile-${viewport.width}.png` });
      // Simula la reducción del viewport visual al desplegarse el teclado virtual.
      await page.evaluate(() => {
        Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: 300 });
        window.visualViewport.dispatchEvent(new Event('resize'));
      });
      await page.waitForFunction(() => document.querySelector('.tag-search-bar--dedicated').getBoundingClientRect().height === 300);
      assert.equal(await input.inputValue(), 'gdg');
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      await page.evaluate(() => {
        delete window.visualViewport.height;
        window.visualViewport.dispatchEvent(new Event('resize'));
      });
      const last = page.locator('.tag-search-option').last();
      await last.focus();
      await page.keyboard.press('Tab');
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      await page.getByRole('button', { name: 'Cerrar búsqueda' }).tap();
      assert.equal(await dialog.count(), 0);
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      assert.equal(await page.locator('.results-bar').evaluate(el => el.inert), false);
      await input.tap();
      await input.fill('C');
      await page.locator('.tag-search-group--topics .tag-search-option').tap();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('t') === 'c');
      assert.equal(await dialog.count(), 0);
      assert.equal(await page.locator('.results-bar').evaluate(el => el.inert), false);
      await input.tap();
      await input.fill('gdg');
      await page.locator('.tag-search-submit').tap();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('q') === 'gdg');
      assert.equal(await dialog.count(), 0);
      await input.tap();
      await input.fill('gdg');
      await page.locator('.tag-search-group--communities .tag-search-option').first().tap();
      await page.locator('.community-modal-name').waitFor();
      assert.equal(await dialog.count(), 0);
      assert.equal(await page.locator('.results-bar').evaluate(el => el.inert), false);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('.community-modal-overlay'));
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    });
  });
}

test('resaltado literal con acentos, coincidencias parciales y selección por teclado', { timeout: 60000 }, async () => {
  await usingBrowser({}, async page => {
    const input = await ready(page);
    await input.fill('cordoba');
    const cordoba = page.locator('.tag-search-group--communities .tag-search-option').filter({ has: page.locator('.tag-option-label', { hasText: 'GDG Córdoba' }) });
    assert.deepEqual(await cordoba.locator('mark').allTextContents(), ['Córdoba']);
    await input.fill('gdg almer');
    const alicante = page.locator('.tag-search-group--related .tag-search-option').filter({ has: page.locator('.tag-option-label', { hasText: 'GDG Alicante' }) });
    assert.deepEqual(await alicante.locator('mark').allTextContents(), ['GDG']);
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await input.fill('');
      await input.fill('gdg cord');
      await input.press('ArrowDown');
      const selected = page.locator('.tag-search-option--selected');
      assert.deepEqual(await selected.locator('mark').allTextContents(), ['GDG', 'Córd']);
      assert.equal(await selected.locator('.tag-option-label').innerText(), 'GDG Córdoba');
      assert.equal(await selected.locator('mark').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 240, 168)');
      await page.screenshot({ path: `${captures}highlight-${viewport.width}.png` });
    }
    await input.press('Enter');
    await page.locator('.community-modal-name').waitFor();
    assert.equal(await page.locator('.community-modal-name').innerText(), 'GDG Córdoba');
  });
});

for (const width of [1440, 390]) {
  test(`recupera inactivas y ofrece erratas sin cambiar la consulta (${width}px)`, { timeout: 60000 }, async () => {
    await usingBrowser({ viewport: { width, height: 900 } }, async page => {
      let input = await ready(page, '?langs=es');
      await input.fill('webma');
      await input.press('Enter');
      const notice = page.locator('.empty-results-inactive');
      await notice.waitFor();
      assert.match(await notice.innerText(), /Hay 2 comunidades inactivas/);
      assert.equal(await page.locator('.empty-results-alternative').count(), 0);
      await page.screenshot({ path: `${captures}inactive-${width}.png` });
      await page.getByRole('button', { name: 'Incluir inactivas', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.results-count strong').textContent === '2');
      let params = new URL(page.url()).searchParams;
      assert.equal(params.get('s'), 'active,inactive');
      assert.equal(params.get('q'), 'webma');
      assert.equal(params.get('langs'), 'es');

      input = await ready(page, '?langs=es');
      await input.fill('webam');
      assert.equal(await page.locator('.tag-search-group--communities').count(), 0);
      assert.ok(await page.locator('.tag-search-group--related .tag-search-option').count() >= 2);
      await input.press('Enter');
      const alternatives = page.locator('.empty-results-alternative');
      await alternatives.first().waitFor();
      assert.equal(await alternatives.count(), 2);
      assert.equal(await page.locator('.results-count strong').innerText(), '0');
      assert.equal(await page.locator('.empty-results-inactive').count(), 0);
      for (const link of await alternatives.all()) {
        assert.match(await link.innerText(), /Inactiva/);
        assert.match(await link.innerText(), /Fuera del filtro de estado/);
        const path = new URL(await link.getAttribute('href'), base);
        assert.equal(path.searchParams.get('q'), 'webam');
        assert.equal(path.searchParams.get('langs'), 'es');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `${captures}typo-${width}.png` });
      const name = await alternatives.first().locator('.empty-results-alternative-name').innerText();
      await alternatives.first().focus();
      await page.keyboard.press('Enter');
      await page.locator('.community-modal-name').waitFor();
      assert.equal(await page.locator('.community-modal-name').innerText(), name);
      params = new URL(page.url()).searchParams;
      assert.equal(params.get('q'), 'webam');
      assert.equal(params.get('s'), null);
      await page.keyboard.press('Escape');
      await alternatives.first().waitFor();
      assert.equal(await page.locator('.results-count strong').innerText(), '0');
    });
  });
}

test('el aviso de inactivas respeta la temática y coincide con el resultado al incluirlas', { timeout: 60000 }, async () => {
  await usingBrowser({}, async page => {
    const input = await ready(page, '?t=python');
    await input.fill('webma');
    await input.press('Enter');
    await page.locator('.empty-results-inactive').waitFor();
    assert.match(await page.locator('.empty-results-inactive').innerText(), /Hay 1 comunidad inactiva/);
    await page.getByRole('button', { name: 'Incluir inactivas', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.results-count strong').textContent === '1');
    assert.equal(new URL(page.url()).searchParams.get('t'), 'python');
    assert.equal(new URL(page.url()).searchParams.get('q'), 'webma');
  });
});

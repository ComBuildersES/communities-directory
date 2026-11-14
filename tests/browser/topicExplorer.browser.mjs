// App local: node --test tests/browser/topicExplorer.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = 'http://127.0.0.1:4173';
const captures = new URL('../../node_modules/.cache/search-review/', import.meta.url).pathname;
mkdirSync(captures, { recursive: true });
const chosen = page => page.locator('.topic-explorer-selection .topic-explorer-selected-chip');
const applyButton = page => page.locator('.topic-explorer-footer .button');
const buttonCount = async page => Number((await applyButton(page).innerText()).match(/\d+/)[0]);
const expected = (data, selected, all = false) => data.filter(c => !c.hidden && c.status === 'active' && c.langs?.includes('es')
  && (!selected.length || c.matchesAllTags || (all ? selected.every(id => c.tags?.includes(id)) : selected.some(id => c.tags?.includes(id))))).length;
async function usingPage(viewport, run) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport, hasTouch: viewport.width < 701 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/es/?langs=es`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Number(document.querySelector('.results-count strong')?.textContent) > 0);
    const data = await (await page.request.get(`${base}/data/communities.json`)).json();
    await run(page, data);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
const open = async page => {
  await page.getByRole('button', { name: 'Explorar temáticas y públicos', exact: true }).click();
  await page.getByRole('dialog', { name: 'Explorar temáticas y públicos' }).waitFor();
};

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
  test(`categorías, selección global, modos y URL (${viewport.width} × ${viewport.height})`, { timeout: 90000 }, async () => {
    await usingPage(viewport, async (page, data) => {
      const initialCount = Number(await page.locator('.results-count strong').innerText());
      await open(page);
      const dialog = page.locator('.topic-explorer');
      assert.equal(await page.locator('.topic-explorer-category').count(), 17);
      assert.equal(await page.getByRole('radio', { name: 'Cualquiera', exact: true }).isChecked(), true);
      assert.equal(await page.getByRole('searchbox', { name: 'Buscar temáticas' }).evaluate(el => el === document.activeElement), true);
      await page.screenshot({ path: `${captures}topics-categories-${viewport.width}.png` });
      await dialog.getByRole('button', { name: /Lenguajes de programación/ }).click();
      await dialog.getByRole('button', { name: 'Python', exact: true }).click();
      assert.equal(await dialog.getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true');
      assert.equal(await chosen(page).count(), 1);
      assert.equal(await buttonCount(page), expected(data, ['python']));
      assert.equal(new URL(page.url()).searchParams.get('t'), null);
      await dialog.getByRole('button', { name: 'Todas las categorías', exact: true }).click();
      await dialog.getByRole('button', { name: /Frameworks, Librerías y Stacks/ }).click();
      await dialog.getByRole('button', { name: 'React', exact: true }).click();
      assert.equal(await chosen(page).count(), 2);
      assert.equal(await buttonCount(page), expected(data, ['python', 'react']));
      await page.getByRole('radio', { name: 'Todas', exact: true }).check();
      assert.equal(await buttonCount(page), expected(data, ['python', 'react'], true));
      const search = page.getByRole('searchbox', { name: 'Buscar temáticas' });
      await search.fill('ECMAScript');
      assert.equal(await dialog.getByRole('button', { name: 'JavaScript', exact: true }).count(), 1);
      assert.equal(await chosen(page).count(), 2);
      await search.fill('');
      assert.match(await page.locator('.topic-explorer-section-title').innerText(), /Frameworks/);
      await page.mouse.move(1, 1);
      await page.screenshot({ path: `${captures}topics-selected-${viewport.width}.png` });
      const box = await dialog.boundingBox();
      assert.ok(box.y >= 0 && box.y + box.height <= viewport.height + 1);
      const footer = await page.locator('.topic-explorer-footer').boundingBox();
      assert.ok(footer.y >= 0 && footer.y + footer.height <= viewport.height + 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(Number(await page.locator('.results-count strong').innerText()), initialCount);
      const preview = await buttonCount(page);
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(count => Number(document.querySelector('.results-count strong').textContent) === count, preview);
      let params = new URL(page.url()).searchParams;
      assert.equal(params.get('tm'), 'all');
      assert.equal(params.get('t'), 'python,react');
      assert.equal(params.get('langs'), 'es');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.results-chips')?.textContent.includes('Todas'));
      assert.equal(Number(await page.locator('.results-count strong').innerText()), preview);
      await open(page);
      assert.equal(await chosen(page).count(), 2);
      assert.equal(await page.getByRole('radio', { name: 'Todas', exact: true }).isChecked(), true);
      const help = page.getByRole('button', { name: 'Cómo se combinan las temáticas', exact: true });
      await help.focus();
      await page.locator('.topic-explorer [role="tooltip"]').waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 1);
      assert.equal(await dialog.locator('[role="tooltip"]').count(), 0);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.getByRole('button', { name: 'Explorar temáticas y públicos', exact: true }).evaluate(el => el === document.activeElement), true);
      await open(page);
      await dialog.getByRole('button', { name: 'Borrar selección', exact: true }).click();
      assert.equal(await chosen(page).count(), 0);
      assert.equal(await buttonCount(page), initialCount);
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('t'));
      params = new URL(page.url()).searchParams;
      assert.equal(params.get('tm'), null);
      assert.equal(params.get('langs'), 'es');
      assert.equal(Number(await page.locator('.results-count strong').innerText()), initialCount);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    });
  });
}

test('cerrar no aplica borradores y el modo desaparece al quitar la última temática', { timeout: 60000 }, async () => {
  await usingPage({ width: 1440, height: 900 }, async page => {
    await open(page);
    const search = page.getByRole('searchbox', { name: 'Buscar temáticas' });
    await search.fill('C');
    assert.equal(await page.locator('.topic-explorer-chip').count(), 1);
    await page.getByRole('button', { name: 'C', exact: true }).click();
    await page.getByRole('radio', { name: 'Todas', exact: true }).check();
    await page.getByRole('button', { name: 'Cerrar explorador de temáticas y públicos', exact: true }).click();
    assert.equal(new URL(page.url()).searchParams.get('t'), null);
    await open(page);
    assert.equal(await chosen(page).count(), 0);
    await search.fill('C');
    await page.getByRole('button', { name: 'C', exact: true }).click();
    await page.getByRole('radio', { name: 'Todas', exact: true }).check();
    await applyButton(page).click();
    await page.locator('.topic-explorer').waitFor({ state: 'detached' });
    await page.waitForFunction(() => new URL(location.href).searchParams.get('tm') === 'all');
    await page.getByRole('button', { name: 'Quitar filtro C', exact: true }).click();
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('t'));
    assert.equal(new URL(page.url()).searchParams.get('tm'), null);
  });
});

test('viewport visual, búsqueda sin opciones y cero resultados conservan el contexto', { timeout: 60000 }, async () => {
  await usingPage({ width: 390, height: 844 }, async (page, data) => {
    await open(page);
    const dialog = page.locator('.topic-explorer');
    const search = page.getByRole('searchbox', { name: 'Buscar temáticas' });
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: 400 });
      window.visualViewport.dispatchEvent(new Event('resize'));
    });
    await page.waitForFunction(() => document.querySelector('.topic-explorer').getBoundingClientRect().height === 400);
    await search.fill('zzzzzzzzzzzz');
    assert.equal(await page.locator('.topic-explorer-chip').count(), 0);
    assert.match(await page.locator('.topic-explorer-empty').innerText(), /No hay temáticas/);
    assert.equal(await buttonCount(page), expected(data, []));
    await search.fill('python');
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    const chip = await page.getByRole('button', { name: 'Python', exact: true }).boundingBox();
    const body = await page.locator('.topic-explorer-body').boundingBox();
    assert.ok(chip.y >= body.y && chip.y + chip.height <= body.y + body.height + 1);
    await page.evaluate(() => {
      delete window.visualViewport.height;
      window.visualViewport.dispatchEvent(new Event('resize'));
    });
    await page.getByRole('button', { name: 'Cerrar explorador de temáticas y públicos', exact: true }).click();
    assert.equal(new URL(page.url()).searchParams.get('t'), null);
    await page.goto(`${base}/es/?langs=es&q=zzzzzzzzzzzz`, { waitUntil: 'domcontentloaded' });
    await page.locator('.empty-results').waitFor();
    await open(page);
    await search.fill('python');
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    assert.equal(await buttonCount(page), 0);
    assert.equal(await applyButton(page).isDisabled(), true);
    assert.equal(new URL(page.url()).searchParams.get('q'), 'zzzzzzzzzzzz');
    assert.equal(new URL(page.url()).searchParams.get('langs'), 'es');
    await page.getByRole('button', { name: 'Cerrar explorador de temáticas y públicos', exact: true }).click();
    assert.equal(await dialog.count(), 0);
  });
});

for (const width of [1440, 390, 320]) {
  test(`añade una categoría y prepara propuestas sin publicar issues (${width}px)`, { timeout: 90000 }, async () => {
    await usingPage({ width, height: 900 }, async (page, data) => {
      const tags = await (await page.request.get(`${base}/data/tags.json`)).json();
      const languageIds = tags.filter(tag => tag.category === 'Lenguajes de programación').map(tag => tag.id);
      await page.evaluate(() => {
        window.__topicIssueOpens = [];
        window.open = (...args) => { window.__topicIssueOpens.push(args); return null; };
      });
      await open(page);
      const dialog = page.locator('.topic-explorer');
      await dialog.getByRole('button', { name: /Frameworks, Librerías y Stacks/ }).click();
      await dialog.getByRole('button', { name: 'React', exact: true }).click();
      await dialog.getByRole('button', { name: 'Todas las categorías', exact: true }).click();
      await dialog.getByRole('button', { name: /Lenguajes de programación/ }).click();
      await dialog.getByRole('button', { name: 'Python', exact: true }).click();
      await dialog.getByRole('button', { name: 'Añadir todas', exact: true }).click();
      assert.equal(await chosen(page).count(), languageIds.length + 1);
      assert.equal(await dialog.getByRole('button', { name: 'Todas añadidas', exact: true }).isDisabled(), true);
      assert.equal(await buttonCount(page), expected(data, [...languageIds, 'react']));
      assert.equal(new URL(page.url()).searchParams.get('t'), null);
      await dialog.getByRole('button', { name: 'Python', exact: true }).click();
      assert.equal(await chosen(page).count(), languageIds.length);
      await dialog.getByRole('button', { name: 'Añadir todas', exact: true }).click();
      assert.equal(await chosen(page).count(), languageIds.length + 1);
      await page.getByRole('radio', { name: 'Todas', exact: true }).check();
      const preview = await buttonCount(page);
      assert.equal(preview, expected(data, [...languageIds, 'react'], true));
      await page.mouse.move(1, 1);
      await page.screenshot({ path: `${captures}topics-bulk-${width}.png` });
      await page.getByRole('button', { name: 'Sugerir temáticas', exact: true }).click();
      const names = page.getByRole('textbox', { name: 'Temáticas que faltan', exact: true });
      const category = page.getByRole('combobox', { name: 'Categoría', exact: true });
      const submit = page.getByRole('button', { name: 'Continuar en GitHub', exact: true });
      assert.equal(await names.evaluate(el => el === document.activeElement), true);
      assert.equal(await category.inputValue(), 'Lenguajes de programación');
      assert.equal(await submit.isDisabled(), true);
      await names.fill('Etiqueta de prueba Alfa, Etiqueta de prueba Beta, python, Etiqueta de prueba Alfa');
      assert.match(await page.locator('.topic-explorer-existing').innerText(), /Python/);
      assert.equal(await submit.isDisabled(), false);
      await page.screenshot({ path: `${captures}topics-proposal-${width}.png` });
      await submit.click();
      const calls = await page.evaluate(() => window.__topicIssueOpens);
      assert.equal(calls.length, 1);
      const issue = new URL(calls[0][0]);
      assert.equal(issue.pathname, '/ComBuildersES/communities-directory/issues/new');
      assert.equal(issue.searchParams.get('template'), 'proponer-tematicas.md');
      assert.match(issue.searchParams.get('body'), /- Etiqueta de prueba Alfa\n- Etiqueta de prueba Beta/);
      assert.match(issue.searchParams.get('body'), /Lenguajes de programación/);
      assert.doesNotMatch(issue.searchParams.get('body'), /- python/i);
      assert.equal(calls[0][1], '_blank');
      assert.equal(calls[0][2], 'noopener,noreferrer');
      assert.equal(new URL(page.url()).searchParams.get('t'), null);
      await page.getByRole('button', { name: 'Volver a explorar', exact: true }).click();
      assert.equal(await chosen(page).count(), languageIds.length + 1);
      assert.equal(await page.getByRole('radio', { name: 'Todas', exact: true }).isChecked(), true);
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(count => Number(document.querySelector('.results-count strong').textContent) === count, preview);
      assert.equal(new URL(page.url()).searchParams.get('tm'), 'all');
      assert.equal(new URL(page.url()).searchParams.get('langs'), 'es');
      assert.deepEqual(new Set(new URL(page.url()).searchParams.get('t').split(',')), new Set([...languageIds, 'react']));

      await open(page);
      await page.getByRole('searchbox', { name: 'Buscar temáticas' }).fill('Etiqueta de prueba Gamma');
      await page.getByRole('button', { name: 'Sugerir temáticas', exact: true }).click();
      assert.equal(await names.inputValue(), 'Etiqueta de prueba Gamma');
      assert.equal(await category.inputValue(), '');
      assert.equal(await submit.isDisabled(), true);
      await category.selectOption('undecided');
      await submit.click();
      const undecided = new URL((await page.evaluate(() => window.__topicIssueOpens))[1][0]);
      assert.match(undecided.searchParams.get('body'), /Por decidir/);
      assert.match(undecided.searchParams.get('body'), /Etiqueta de prueba Gamma/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: 'Explorar temáticas y públicos', exact: true }).waitFor();
      assert.equal(await chosen(page).count(), languageIds.length + 1);
      await page.getByRole('button', { name: 'Cerrar explorador de temáticas y públicos', exact: true }).click();
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    });
  });
}

const expectedBoth = (data, topics, topicAll, audiences, audienceAll) => data.filter(c => !c.hidden && c.status === 'active' && c.langs?.includes('es')
  && (!topics.length || c.matchesAllTags || (topicAll ? topics.every(id => c.tags?.includes(id)) : topics.some(id => c.tags?.includes(id))))
  && (!audiences.length || c.matchesAllAudience || (audienceAll ? audiences.every(id => c.targetAudience?.includes(id)) : audiences.some(id => c.targetAudience?.includes(id))))).length;

for (const width of [1440, 390, 320]) {
  test(`temáticas y públicos conservan selección, modos y resultados combinados (${width}px)`, { timeout: 90000 }, async () => {
    await usingPage({ width, height: 900 }, async (page, data) => {
      await open(page);
      const dialog = page.locator('.topic-explorer');
      const topicsTab = page.getByRole('tab', { name: 'Temáticas', exact: true });
      const audienceTab = page.getByRole('tab', { name: 'Públicos', exact: true });
      await dialog.getByRole('button', { name: /Lenguajes de programación/ }).click();
      await dialog.getByRole('button', { name: 'Python', exact: true }).click();
      await page.getByRole('radio', { name: 'Todas', exact: true }).check();
      await topicsTab.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await audienceTab.getAttribute('aria-selected'), 'true');
      assert.equal(await audienceTab.evaluate(el => el === document.activeElement), true);
      assert.equal(await page.locator('.topic-explorer-category').count(), 10);
      await page.mouse.move(1, 1);
      await page.screenshot({ path: `${captures}audience-categories-${width}.png` });
      await dialog.getByRole('button', { name: /Etapa profesional/ }).click();
      await dialog.getByRole('button', { name: 'Student / Estudiante', exact: true }).click();
      await dialog.getByRole('button', { name: 'Junior / Early-career', exact: true }).click();
      assert.equal(await chosen(page).count(), 2);
      assert.equal(await buttonCount(page), expectedBoth(data, ['python'], true, ['student', 'junior-developer'], false));
      await page.getByRole('radio', { name: 'Todos', exact: true }).check();
      const combinedCount = await buttonCount(page);
      assert.equal(combinedCount, expectedBoth(data, ['python'], true, ['student', 'junior-developer'], true));
      const search = page.getByRole('searchbox', { name: 'Buscar públicos', exact: true });
      await search.fill('backend');
      assert.equal(await dialog.getByRole('button', { name: 'Backend Developer', exact: true }).count(), 1);
      assert.equal(await chosen(page).count(), 2);
      await search.fill('');
      await topicsTab.click();
      assert.equal(await chosen(page).count(), 1);
      assert.equal(await dialog.getByRole('button', { name: 'Python', exact: true }).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByRole('radio', { name: 'Todas', exact: true }).isChecked(), true);
      await audienceTab.click();
      assert.equal(await chosen(page).count(), 2);
      assert.equal(await page.getByRole('radio', { name: 'Todos', exact: true }).isChecked(), true);
      await page.mouse.move(1, 1);
      await page.screenshot({ path: `${captures}audience-selected-${width}.png` });
      const footer = await page.locator('.topic-explorer-footer').boundingBox();
      assert.ok(footer.y + footer.height <= 901);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(count => Number(document.querySelector('.results-count strong').textContent) === count, combinedCount);
      let params = new URL(page.url()).searchParams;
      assert.equal(params.get('t'), 'python');
      assert.equal(params.get('tm'), 'all');
      assert.equal(params.get('ta'), 'student,junior-developer');
      assert.equal(params.get('am'), 'all');
      assert.equal(params.get('langs'), 'es');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.results-chips')?.textContent.includes('Todos'));
      assert.equal(Number(await page.locator('.results-count strong').innerText()), combinedCount);
      await open(page);
      await audienceTab.click();
      assert.equal(await chosen(page).count(), 2);
      assert.equal(await page.getByRole('radio', { name: 'Todos', exact: true }).isChecked(), true);
      await dialog.getByRole('button', { name: 'Borrar selección', exact: true }).click();
      assert.equal(await buttonCount(page), expectedBoth(data, ['python'], true, [], false));
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('ta'));
      params = new URL(page.url()).searchParams;
      assert.equal(params.get('am'), null);
      assert.equal(params.get('t'), 'python');
      assert.equal(params.get('tm'), 'all');
      await open(page);
      await audienceTab.click();
      await dialog.getByRole('button', { name: /Etapa profesional/ }).click();
      await dialog.getByRole('button', { name: 'Añadir todos', exact: true }).click();
      assert.equal(await chosen(page).count(), 7);
      assert.equal(await dialog.getByRole('button', { name: 'Todos añadidos', exact: true }).isDisabled(), true);
      await page.getByRole('radio', { name: 'Todos', exact: true }).check();
      const selectedIds = (await (await page.request.get(`${base}/data/audience.json`)).json()).filter(item => item.category === 'Etapa profesional').map(item => item.id);
      const bulkCount = await buttonCount(page);
      assert.equal(bulkCount, expectedBoth(data, ['python'], true, selectedIds, true));
      await applyButton(page).click();
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(() => new URL(location.href).searchParams.has('ta'));
      assert.equal(Number(await page.locator('.results-count strong').innerText()), bulkCount);
      const labels = (await (await page.request.get(`${base}/data/audience.json`)).json()).filter(item => selectedIds.includes(item.id)).map(item => item.label);
      for (const label of labels) await page.getByRole('button', { name: `Quitar filtro ${label}`, exact: true }).click();
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('ta'));
      assert.equal(new URL(page.url()).searchParams.get('am'), null);
      assert.equal(new URL(page.url()).searchParams.get('tm'), 'all');
    });
  });
}

test('las propuestas de públicos se preparan para su catálogo y conservan el borrador de temáticas', { timeout: 60000 }, async () => {
  await usingPage({ width: 390, height: 844 }, async page => {
    await page.evaluate(() => { window.__audienceIssues = []; window.open = url => { window.__audienceIssues.push(url); return null; }; });
    await open(page);
    await page.getByRole('searchbox', { name: 'Buscar temáticas', exact: true }).fill('Python');
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    await page.getByRole('tab', { name: 'Públicos', exact: true }).click();
    await page.locator('.topic-explorer').getByRole('button', { name: /Etapa profesional/ }).click();
    await page.getByRole('button', { name: 'Student / Estudiante', exact: true }).click();
    await page.getByRole('button', { name: 'Sugerir públicos', exact: true }).click();
    await page.getByRole('textbox', { name: 'Públicos que faltan', exact: true }).fill('Perfil de prueba Alfa, junior');
    assert.equal(await page.getByRole('combobox', { name: 'Categoría', exact: true }).inputValue(), 'Etapa profesional');
    assert.match(await page.locator('.topic-explorer-existing').innerText(), /Junior/);
    await page.screenshot({ path: `${captures}audience-proposal-390.png` });
    await page.getByRole('button', { name: 'Continuar en GitHub', exact: true }).click();
    const urls = await page.evaluate(() => window.__audienceIssues);
    assert.equal(urls.length, 1);
    const issue = new URL(urls[0]);
    assert.equal(issue.searchParams.get('template'), 'proponer-publicos.md');
    assert.equal(issue.searchParams.get('title'), '[Públicos] Perfil de prueba Alfa');
    assert.match(issue.searchParams.get('body'), /## Catálogo\n\nPúblicos/);
    assert.match(issue.searchParams.get('body'), /## Públicos propuestos/);
    assert.doesNotMatch(issue.searchParams.get('body'), /- junior/i);
    assert.equal(new URL(page.url()).searchParams.get('t'), null);
    await page.getByRole('button', { name: 'Volver a explorar', exact: true }).click();
    assert.equal(await chosen(page).count(), 1);
    await page.getByRole('tab', { name: 'Temáticas', exact: true }).click();
    assert.equal(await chosen(page).count(), 1);
    assert.equal(await page.getByRole('searchbox', { name: 'Buscar temáticas', exact: true }).inputValue(), 'Python');
  });
});

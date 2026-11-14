// Ejecutar con la app local arrancada: node --test tests/browser/organizeGuide.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const es = JSON.parse(readFileSync(new URL('../../src/i18n/locales/es.json', import.meta.url)));
for (const width of [1440, 390]) {
  test(`contenido compartido de Community Builders y colaboraciones a ${width}px`, { timeout: 90000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 } });
      // Captura el texto copiado sin depender de permisos del portapapeles del sistema.
      await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async text => { window.copiedText = text; } }, configurable: true,
      }));
      await page.goto('http://127.0.0.1:4173/es/?s=active,inactive&ot=co-organisers', { waitUntil: 'domcontentloaded' });
      const openGuide = async () => {
        const guide = page.getByRole('button', { name: 'Qué puedes hacer aquí', exact: true });
        if (!(await guide.isVisible())) await page.getByRole('button', { name: /menú/i }).first().click();
        await guide.click();
        await page.getByRole('button', { name: /Descubrir a otras personas que dinamizan/ }).click();
      };
      await openGuide();
      let dialog = page.getByRole('dialog');
      const initialUrl = page.url();
      assert.equal(await dialog.locator('.guide-accordion-trigger').count(), 2);
      assert.equal(page.url(), initialUrl);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await dialog.getByRole('button', { name: 'Descargar y reutilizar los datos', exact: true }).evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Tab');
      assert.equal(await dialog.locator('.opendata-modal-close').evaluate(el => el === document.activeElement), true);
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));
      await page.screenshot({ path: `/tmp/combuilder-organize-connect-${width}.png`, fullPage: true, animations: 'disabled' });
      await dialog.getByRole('button', { name: /Conectar con Community Builders/ }).click();
      assert.equal(await dialog.getByRole('tab').count(), 4);
      assert.ok((await dialog.innerText()).includes(es.builders.whoLead));
      assert.equal(await dialog.getByRole('link', { name: es.builders.joinCta }).count(), 1);
      for (const tab of Object.values(es.builders.tabs)) await dialog.getByRole('tab', { name: tab, exact: true }).click();
      const who = dialog.getByRole('tab', { name: es.builders.tabs.who, exact: true });
      await who.focus();
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowRight');
      assert.equal(await dialog.getByRole('tab', { name: es.builders.tabs.what, exact: true }).getAttribute('aria-selected'), 'true');
      await who.click();
      assert.equal(page.url(), initialUrl);
      assert.equal(await dialog.getByRole('button', { name: /Quiero montar una comunidad/ }).count(), 0);
      assert.equal(await dialog.getByRole('button', { name: 'Mejorar este directorio', exact: true }).count(), 0);
      await dialog.getByRole('button', { name: /Colaborar con otra comunidad/ }).click();
      assert.equal(page.url(), initialUrl);
      const panel = dialog.locator('#guide-section-panel-organize-collaborate');
      await panel.getByRole('img').waitFor();
      const note = panel.getByRole('complementary');
      const action = panel.getByRole('button', { name: /^Ver comunidades abiertas a colaborar/ });
      const count = Number((await action.innerText()).match(/\((\d+)\)/)[1]);
      assert.equal(await action.isDisabled(), count === 0);
      assert.ok(await note.evaluate(el => el.getBoundingClientRect().bottom < el.nextElementSibling.getBoundingClientRect().top));
      assert.equal(await panel.getByRole('combobox').locator('option').count(), 5);
      await panel.getByRole('combobox').focus();
      await page.keyboard.press('Tab');
      assert.equal(await panel.locator('.guide-data-url input').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await panel.getByRole('combobox').evaluate(el => el === document.activeElement), true);
      await panel.getByRole('button', { name: 'Copiar URL', exact: true }).click();
      assert.equal(await page.evaluate(() => window.copiedText), 'https://directory.communitybuilders.dev/llms.txt');
      const checkPrompt = async (container, key) => {
        const block = container.locator('.opendata-copyblock').filter({ hasText: es.openData.prompts[key].label });
        await block.locator('.opendata-copy-btn').click();
        const copied = await page.evaluate(() => window.copiedText);
        const rules = es.openData.prompts.rules.replaceAll('{{tagsUrl}}', 'https://directory.communitybuilders.dev/data/tags.json').replaceAll('{{audienceUrl}}', 'https://directory.communitybuilders.dev/data/audience.json').replaceAll('{{indexUrl}}', 'https://directory.communitybuilders.dev/llms.txt');
        const expected = es.openData.prompts[key].text.replaceAll('{{dataUrl}}', 'https://directory.communitybuilders.dev/data/communities.json').replaceAll('{{indexUrl}}', 'https://directory.communitybuilders.dev/llms.txt').replaceAll('{{rules}}', rules);
        assert.equal(copied, expected);
        assert.ok(!copied.includes('{{'));
      };
      await checkPrompt(panel, 'synergies');
      await page.screenshot({ path: `/tmp/combuilder-organize-collaborate-${width}.png`, fullPage: true, animations: 'disabled' });
      if (count > 0) {
        await action.click();
        await page.waitForFunction(() => new URL(location.href).searchParams.get('ot') === 'collaborations');
        assert.equal(Number(await page.locator('.results-count strong').innerText()), count);
      } else {
        await panel.getByRole('button', { name: 'Abrir filtros', exact: true }).click();
        assert.equal(new URL(page.url()).searchParams.get('ot'), 'co-organisers');
      }
      assert.equal(new URL(page.url()).searchParams.get('s'), 'active,inactive');
      await page.waitForFunction(() => document.activeElement?.classList.contains('filter-panel'));
      await openGuide();
      await dialog.getByRole('button', { name: 'Volver al menú' }).click();
      await dialog.getByRole('button', { name: /Descubrir a otras personas que dinamizan/ }).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
    } finally { await browser.close(); }
  });
}

test('colaboración declarada: contador, contexto y Escape antes del modal', { timeout: 60000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const communities = JSON.parse(readFileSync(new URL('../../public/data/communities.json', import.meta.url)));
    const candidate = communities.find(c => c.status === 'active' && c.tags?.length && c.langs?.length && !c.hidden);
    candidate.openTo = ['collaborations'];
    await page.route('**/data/communities.json', route => route.fulfill({ json: communities }));
    const query = new URLSearchParams({ s: 'active', ot: 'co-organisers', t: candidate.tags[0], langs: candidate.langs[0] });
    await page.goto(`http://127.0.0.1:4173/es/?${query}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Qué puedes hacer aquí', exact: true }).click();
    await page.getByRole('button', { name: /Descubrir a otras personas que dinamizan/ }).click();
    const original = new URL(page.url());
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Colaborar con otra comunidad/ }).click();
    assert.equal(page.url(), original.href);
    const action = dialog.getByRole('button', { name: /^Ver comunidades abiertas a colaborar/ });
    assert.equal(await action.isDisabled(), false);
    await action.focus();
    await page.getByRole('tooltip').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('tooltip').waitFor({ state: 'detached' });
    assert.equal(await dialog.count(), 1);
    const count = Number((await action.innerText()).match(/\((\d+)\)/)[1]);
    await action.click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('ot') === 'collaborations');
    assert.equal(Number(await page.locator('.results-count strong').innerText()), count);
    const result = new URL(page.url());
    for (const key of ['s', 't', 'langs']) assert.equal(result.searchParams.get(key), original.searchParams.get(key));
    assert.equal(await dialog.count(), 0);
    await page.waitForFunction(() => document.activeElement?.classList.contains('filter-panel'));
  } finally { await browser.close(); }
});

test('perfiles, historias y modal original comparten comportamiento', { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:4173/es/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /menú/i }).first().click();
    await page.getByRole('button', { name: 'Qué puedes hacer aquí', exact: true }).click();
    await page.getByRole('button', { name: /Descubrir a otras personas que dinamizan/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Conectar con Community Builders/ }).click();
    const face = dialog.getByRole('button', { name: /^Ver comunidades de @/ }).first();
    await face.hover();
    await face.focus();
    await page.getByRole('tooltip').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('tooltip').waitFor({ state: 'detached' });
    assert.equal(await dialog.count(), 1);
    const handle = (await face.getAttribute('aria-label')).split('@')[1].toLowerCase();
    await face.click();
    await page.waitForFunction(value => new URL(location.href).searchParams.get('cb') === value, handle);
    assert.equal(await dialog.count(), 0);
    await page.getByRole('button', { name: /menú/i }).first().click();
    await page.getByRole('button', { name: new RegExp(es.heading.about) }).click();
    await page.getByRole('button', { name: /Dinamizas una comunidad tech/ }).click();
    await dialog.getByRole('tab', { name: es.builders.tabs.who, exact: true }).waitFor();
    assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));
    const originalFace = dialog.getByRole('button', { name: /^Ver comunidades de @/ }).first();
    await originalFace.hover();
    await originalFace.focus();
    await page.getByRole('tooltip').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('tooltip').waitFor({ state: 'detached' });
    assert.equal(await dialog.count(), 1);
    await dialog.getByRole('tab', { name: es.builders.tabs.stories, exact: true }).click();
    const firstStory = await dialog.locator('.cb-story-title').innerText();
    await dialog.getByRole('button', { name: es.builders.next, exact: true }).click();
    assert.notEqual(await dialog.locator('.cb-story-title').innerText(), firstStory);
    for (const tab of Object.values(es.builders.tabs)) await dialog.getByRole('tab', { name: tab, exact: true }).click();
    await page.screenshot({ path: '/tmp/combuilder-builders-original-390.png', animations: 'disabled' });
    assert.equal(await dialog.getByRole('link', { name: es.builders.joinCta }).count(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.matches('.heading-hamburger')), true);
  } finally { await browser.close(); }
});

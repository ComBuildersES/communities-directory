// Con la app en 127.0.0.1:4173: node --test tests/browser/uiCompletion.browser.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const labels = Object.fromEntries(['es', 'en'].map(locale => [locale, JSON.parse(readFileSync(new URL(`../../src/i18n/locales/${locale}.json`, import.meta.url)))]));
const base = 'http://127.0.0.1:4173';
async function headerAction(page, name, t) {
  const action = page.getByRole('button', { name, exact: true });
  if (!(await action.isVisible())) await page.getByRole('button', { name: t.heading.openMenu, exact: true }).click();
  await action.click();
}
for (const locale of ['es', 'en']) for (const width of [1440, 390]) {
  test(`recorridos, invitación y alta (${locale}, ${width}px)`, { timeout: 120000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copiedText = text; } } });
        // Verifica el flujo sin abrir GitHub ni enviar propuestas.
        window.open = url => { window.externalProposal = url; return null; };
      });
      const t = labels[locale];
      await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' });
      const panel = page.locator('.cta-panel');
      await panel.waitFor();
      assert.equal(await page.locator('.cta-bar').count(), 0);
      assert.equal(await panel.count(), 1);
      await panel.getByRole('button', { name: t.addCommunityCTA.findMine }).click();
      assert.equal(await page.locator('.tag-search-input').evaluate(el => el === document.activeElement), true);
      for (const entry of ['find', 'contribute', 'organize', 'improve', 'build']) {
        await headerAction(page, t.heading.guideCta, t);
        const dialog = page.locator('.directory-guide');
        await dialog.getByRole('button', { name: new RegExp(`^${t.directoryGuide[entry].title}`) }).click();
        const triggers = dialog.locator('.guide-accordion-trigger');
        assert.ok(await triggers.count());
        assert.equal(await dialog.locator('.guide-accordion-trigger[aria-expanded="true"]').count(), 0);
        for (const trigger of await triggers.all()) {
          await trigger.click();
          assert.equal(await dialog.locator('.guide-accordion-trigger[aria-expanded="true"]').count(), 1);
          for (const img of await dialog.locator('.guide-screenshot:visible').all()) {
            await img.scrollIntoViewIfNeeded();
            await img.evaluate(el => el.decode());
            assert.ok((await img.getAttribute('src')).endsWith(`-${locale}.webp`));
          }
          assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), true);
        }
        assert.doesNotMatch(await dialog.innerText(), /directoryGuide\.|openData\./);
        await page.screenshot({ path: `/tmp/ui-${entry}-${locale}-${width}.png` });
        await page.keyboard.press('Escape');
        assert.equal(await dialog.count(), 0);
        const expected = width === 390 ? t.heading.openMenu : t.heading.guideCta;
        assert.equal(await page.getByRole('button', { name: expected, exact: true }).evaluate(el => el === document.activeElement), true);
      }
      await headerAction(page, t.heading.about, t);
      const about = page.locator('.heading-support-popover');
      assert.equal(await about.locator('.builders-invitation').count(), 0);
      const inviteButton = about.getByRole('button', { name: t.builders.cta, exact: true });
      assert.equal(await inviteButton.getAttribute('class'), 'heading-support-help-btn');
      await inviteButton.click();
      const builders = page.locator('.cb-modal');
      await builders.waitFor();
      assert.equal(await builders.getByRole('tab').count(), 4);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await builders.locator('a').last().evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await builders.count(), 0);
      const returnButton = width === 390 ? page.locator('.heading-hamburger') : page.getByRole('button', { name: t.heading.about, exact: true });
      assert.equal(await returnButton.evaluate(el => el === document.activeElement), true);
      await page.locator('.cta-panel__primary').click();
      await page.locator('.contribution-shell').waitFor();
      assert.equal(await page.locator('.contribution-shell .builders-invitation').count(), 0);
      await page.locator('#community-name').fill('Comunidad de prueba');
      await page.locator('#community-location').fill('Madrid');
      await page.locator('#community-thumbnail').fill('https://example.org/logo.png');
      await page.locator('#community-url').fill('https://example.org/');
      await page.locator('.contribution-submit-button[type="submit"]').click();
      assert.match(await page.evaluate(() => window.externalProposal), /^https:\/\/github.com\//);
      assert.equal(await page.locator('.contribution-shell [role="status"]').filter({ hasText: t.contribution.submit.externalPending }).count(), 1);
      await page.locator('.contribution-shell .builders-invitation button').click();
      await builders.waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.contribution-shell .builders-invitation button').evaluate(el => el === document.activeElement), true);
      await page.screenshot({ path: `/tmp/ui-proposal-${locale}-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    } finally { await browser.close(); }
  });
}
for (const [locale, width] of [["es", 1440], ["es", 390], ["es", 320], ["en", 390]]) {
  test(`mapa, alta y ausencia de solapamiento (${locale}, ${width}px)`, { timeout: 120000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.goto(`${base}/${locale}/`, { waitUntil: 'networkidle' });
      await page.locator(".cta-panel").waitFor();
      await page.locator('.results-bar__controls').getByRole('button', { name: locale === 'es' ? /Mapa/ : /Map/ }).click();
      const add = page.locator('.map-add-community');
      await add.waitFor();
      await page.waitForFunction(() => {
        const view = document.querySelector('arcgis-map')?.view;
        return view?.ready && view.stationary &&
          Number(document.querySelector('.map-results-note strong')?.textContent) > 0 &&
          view.map.layers.toArray().some(layer => layer.source?.length && layer.featureReduction?.type === 'cluster');
      }, null, { timeout: 60000 });
      await page.waitForFunction(() => !document.querySelector('arcgis-map').view.updating, null, { timeout: 60000 });
      await page.locator('arcgis-map').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const canvas = await page.locator('.map-canvas').boundingBox();
      const rect = await add.boundingBox();
      assert.ok(rect.x >= canvas.x && rect.x + rect.width <= canvas.x + canvas.width + 1);
      assert.ok(Math.abs(rect.x - canvas.x - 12) < 1);
      assert.ok(Math.abs(rect.y - canvas.y - 12) < 1);
      for (const control of await page.locator('.map-legend:visible, .map-legend-toggle:visible, .esri-search:visible').all()) {
        const other = await control.boundingBox();
        if (other) assert.ok(rect.x + rect.width <= other.x || other.x + other.width <= rect.x || rect.y + rect.height <= other.y || other.y + other.height <= rect.y, 'alta separada de controles');
      }
      await page.screenshot({ path: `/tmp/ui-map-${locale}-${width}.png` });
      await add.click();
      await page.locator('.contribution-shell').waitFor();
      assert.match(page.url(), /contribute=new/);
    } finally { await browser.close(); }
  });
}

test('propuestas de edición y correo: invitación sin confirmar publicación', { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
    await page.addInitScript(() => {
      window.open = url => { window.externalProposal = url; return null; };
      document.addEventListener('click', event => {
        if (event.target.closest('a[href^="mailto:"]')) event.preventDefault();
      }, true);
    });
    const communities = await (await page.request.get(`${base}/data/communities.json`)).json();
    const community = communities.find(c => c.id && !c.hidden && c.status === 'active' && c.communityUrl && c.location && c.eventFormat === 'in-person');
    await page.goto(`${base}/es/?edit=${community.id}`, { waitUntil: 'networkidle' });
    await page.locator('.contribution-shell').waitFor();
    assert.equal(await page.locator('.contribution-shell .builders-invitation').count(), 0);
    await page.locator('.contribution-submit-button[type="submit"]').click();
    assert.match(await page.evaluate(() => window.externalProposal), /^https:\/\/github.com\//);
    await page.locator('.contribution-shell .builders-invitation').waitFor();
    assert.equal(await page.getByRole('status').filter({ hasText: labels.es.contribution.submit.externalPending }).count(), 1);
    await page.locator('.contribution-delete-toggle').click();
    await page.locator('input[name="deletion-reason"][value="never-existed"]').check();
    await page.locator('.contribution-delete-actions button').click();
    assert.equal(await page.locator('.contribution-shell .builders-invitation').count(), 0);
    await page.goto(`${base}/en/?contribute=new`, { waitUntil: 'networkidle' });
    await page.locator('.contribution-shell').waitFor();
    const email = page.locator('.contribution-submit-row a[href^="mailto:"]');
    await email.click();
    assert.equal(await page.locator('.contribution-shell .builders-invitation').count(), 0);
    await page.locator('#community-name').fill('Community test');
    await page.locator('#community-location').fill('Madrid');
    await page.locator('#community-thumbnail').fill('https://example.org/logo.png');
    await page.locator('#community-url').fill('https://example.org/');
    await email.click();
    await page.locator('.contribution-shell .builders-invitation').waitFor();
    assert.equal(await page.getByRole('status').filter({ hasText: labels.en.contribution.submit.externalPending }).count(), 1);
  } finally { await browser.close(); }
});

test('inglés: copia de recursos y prompts con catálogos ingleses', { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async text => { window.copiedText = text; } }, configurable: true,
    }));
    const t = labels.en;
    await page.goto(`${base}/en/`, { waitUntil: 'networkidle' });
    await page.locator('.cta-panel').waitFor();
    for (const entry of ['find', 'contribute']) {
      await headerAction(page, t.heading.guideCta, t);
      const dialog = page.locator('.directory-guide');
      await dialog.getByRole('button', { name: new RegExp(`^${t.directoryGuide[entry].title}`) }).click();
      const directoryTab = dialog.getByRole('tab', { name: t.directoryGuide.tabs.directory, exact: true });
      await directoryTab.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await dialog.getByRole('tab', { name: t.directoryGuide.tabs.ai, exact: true }).getAttribute('aria-selected'), 'true');
      const picker = dialog.locator('.guide-data-source');
      assert.equal(await picker.locator('option').count(), 5);
      await picker.locator('select').selectOption('data/communities.geojson');
      await picker.getByRole('button').click();
      assert.equal(await page.evaluate(() => window.copiedText), 'https://directory.communitybuilders.dev/data/communities.geojson');
      for (const block of await dialog.locator('.opendata-copyblock').all()) {
        await block.locator('.opendata-copy-btn').click();
        const text = await page.evaluate(() => window.copiedText);
        assert.match(text, /data\/tags.en.json/);
        assert.match(text, /data\/audience.en.json/);
        assert.doesNotMatch(text, /{{|CC BY|data\/tags.json/);
      }
      assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), true);
      await page.screenshot({ path: `/tmp/ui-ai-${entry}-en-390.png` });
      await page.keyboard.press('Escape');
    }
  } finally { await browser.close(); }
});

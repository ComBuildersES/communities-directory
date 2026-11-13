import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';
import { DirectoryGuideModal } from '../src/components/DirectoryGuideModal/DirectoryGuideModal.jsx';
import { FilterPanel } from '../src/components/FilterPanel.jsx';
import { FindCommunityAiGuide } from '../src/components/DirectoryGuideModal/FindCommunityAiGuide.jsx';
import { ContributeCommunityGuide } from '../src/components/DirectoryGuideModal/ContributeCommunityGuide.jsx';
import { FindCommunityGuide } from '../src/components/DirectoryGuideModal/FindCommunityGuide.jsx';
import { BuildDataGuide } from '../src/components/DirectoryGuideModal/BuildDataGuide.jsx';
import { ImproveDirectoryGuide } from '../src/components/DirectoryGuideModal/ImproveDirectoryGuide.jsx';
import { OrganizeCommunityGuide } from '../src/components/DirectoryGuideModal/OrganizeCommunityGuide.jsx';

const state = vi.hoisted(() => ({ locale: 'es' }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, vars = {}) => {
    const value = key.split('.').reduce((data, part) => data?.[part], state.locale === 'es' ? es : en)
      ?? key.split('.').reduce((data, part) => data?.[part], es) ?? key;
    return typeof value === 'string' ? value.replace(/{{(\w+)}}/g, (_, name) => vars[name] ?? '') : value;
  }, i18n: { resolvedLanguage: state.locale } }),
}));
vi.mock('../src/stores/sidebar.store.js', () => ({
  useSideBarVisible: () => true,
  useSidebarActions: () => ({ setSidebarVisibility: vi.fn() }),
}));

afterEach(() => { state.locale = 'es'; });

describe('descubrir a otras personas que dinamizan (español)', () => {
  it('integra Community Builders y conserva solo el recorrido de colaboración', () => {
    const builders = vi.fn();
    const filters = vi.fn();
    const html = renderToStaticMarkup(<OrganizeCommunityGuide onSelectMember={builders} onFilters={filters} />);
    expect(html).toContain(es.builders.title);
    expect(html).toContain(es.builders.whoLead);
    for (const label of Object.values(es.builders.tabs)) expect(html).toContain(label);
    expect(html).toContain(es.builders.joinCta);
    expect((html.match(/class="guide-accordion-trigger"/g) ?? []).length).toBe(2);
    expect(html).toContain('aria-labelledby="guide-section-organize-connect" hidden=""');
    expect(html).toContain('aria-labelledby="guide-section-organize-collaborate" hidden=""');
    expect(html).not.toContain('guide-section-organize-found');
    expect(html).toContain(es.directoryGuide.organize.availability);
    expect(html).toContain(es.openData.prompts.synergies.label);
    for (const key of ['umbrella', 'gaps']) expect(html).not.toContain(es.openData.prompts[key].label);
    expect(html).not.toContain(es.directoryGuide.improve.title);
    expect(html).toContain('images/guide/filters-es.webp');
    expect(html).not.toContain('directoryGuide.');
    expect(builders).not.toHaveBeenCalled();
    expect(filters).not.toHaveBeenCalled();
  });
});

describe.each([{ locale: 'es', data: es }, { locale: 'en', data: en }])('tour ligero ($locale)', ({ locale, data }) => {
  it('muestra seis objetivos sin aplicar criterios ni adelantar las herramientas', () => {
    state.locale = locale;
    const close = vi.fn();
    const map = vi.fn();
    const html = renderToStaticMarkup(<DirectoryGuideModal onClose={close} onShowMap={map} />);
    expect((html.match(/class="guide-entry"/g) ?? []).length).toBe(6);
    for (const id of ['find', 'contribute', 'organize', 'improve', 'build', 'other']) {
      expect(html).toContain((data.directoryGuide[id] ?? es.directoryGuide[id]).title);
    }
    expect(html).toContain(data.directoryGuide.reuse);
    expect(html).not.toContain('role="tabpanel"');
    expect(html).not.toContain('opendata-copyblock');
    expect(close).not.toHaveBeenCalled();
    expect(map).not.toHaveBeenCalled();
  });

  it('presenta los tres bloques cerrados al entrar', () => {
    state.locale = locale;
    const html = renderToStaticMarkup(<FindCommunityGuide />);
    expect((html.match(/class="guide-accordion-trigger"/g) ?? []).length).toBe(3);
    expect((html.match(/class="guide-accordion-trigger"[^>]*aria-expanded="true"/g) ?? []).length).toBe(0);
    for (const id of ['search', 'filters', 'map']) {
      expect(html).toContain(`aria-controls="guide-section-panel-${id}"`);
      expect(html).toContain(data.directoryGuide.find[`${id}Hint`]);
      expect(html).toContain(`aria-labelledby="guide-section-${id}" hidden=""`);
    }
  });

  it('coloca las capturas entre la explicación y la acción sin las secciones obvias', () => {
    state.locale = locale;
    const html = renderToStaticMarkup(<FindCommunityGuide />);
    const guide = data.directoryGuide;
    expect(html.indexOf(guide.find.search)).toBeLessThan(html.indexOf(guide.actions.search));
    expect(html.indexOf(guide.find.filters)).toBeLessThan(html.indexOf(guide.actions.filters));
    expect(html.indexOf(guide.find.map)).toBeLessThan(html.indexOf(guide.actions.map));
    for (const id of ['search', 'filters']) {
      const imagePath = `images/guide/${id}-${locale}.webp`;
      expect(html.indexOf(guide.find[id])).toBeLessThan(html.indexOf(imagePath));
      expect(html.indexOf(imagePath)).toBeLessThan(html.indexOf(guide.actions[id]));
      expect(html).toContain(guide.find[`${id}ImageAlt`]);
      const asset = readFileSync(new URL(`../public/${imagePath}`, import.meta.url));
      expect(asset.toString('ascii', 8, 12)).toBe('WEBP');
    }
    expect(html).not.toContain('guide-section-results');
    expect(html).not.toContain('guide-section-profile');
    expect(html).not.toContain('guide-types');
    expect(html).toContain('<ul class="guide-tips">');
    expect(html).toContain(guide.find.openTo);
    expect(html).toContain(guide.find.mapNote);
    expect(html).toContain('aria-labelledby="guide-tab-directory"');
    expect(html).toContain('aria-controls="guide-find-panel"');
    expect(html).not.toContain('directoryGuide.');
  });

  it('ofrece la ayuda de los siete tipos directamente en el panel de filtros', () => {
    state.locale = locale;
    const html = renderToStaticMarkup(<FilterPanel />);
    for (const type of Object.keys(data.sidebar.communityTypeDescriptions)) {
      expect(html).toContain(data.openTo.info.replace('{{option}}', data.communityType[type]));
    }
    expect(html).toContain(data.sidebar.communityTypeHelp);
    expect(html).not.toContain('sidebar.communityTypeDescriptions.');
  });

  it('presenta formatos y URLs antes de los prompts, sin instrucciones básicas ni roadmap', () => {
    state.locale = locale;
    const html = renderToStaticMarkup(<FindCommunityAiGuide />);
    const guide = data.directoryGuide.find;
    expect(html).toContain(guide.ai);
    expect(html).toContain(guide.dataIntro);
    expect(html).toContain('https://directory.communitybuilders.dev/llms.txt');
    for (const path of ['llms.txt', 'llms-full.txt', 'data/communities.json', 'data/communities.csv', 'data/communities.geojson']) {
      expect(html).toContain(`<option value="${path}"`);
    }
    expect((html.match(/<option /g) ?? []).length).toBe(5);
    expect(html).not.toContain('<option value="data/schema.json"');
    expect(html).not.toContain('<option value="data/tags.json"');
    expect(html).not.toContain('<option value="data/audience.json"');
    if (locale === 'es') {
      for (const label of Object.values(guide.dataSources)) expect(html).toContain(`>${label}</option>`);
    }
    expect(html.indexOf(guide.dataIntro)).toBeLessThan(html.indexOf(guide.promptsIntro));
    expect(html.indexOf(guide.promptsIntro)).toBeLessThan(html.indexOf('class="guide-ai-prompt-list"'));
    expect(html).toContain(data.openData.prompts.tribe.label);
    expect(html).toContain(data.openData.prompts.types.label);
    expect(html).not.toContain(data.openData.attend.note);
    expect(html).not.toContain(data.openData.attend.lead.replace(/"/g, '&quot;'));
    expect(html).not.toContain('/issues/344');
    expect(html).not.toContain('/issues/194');
  });

});

describe('aportar a una comunidad (español)', () => {
  it('presenta las siete aportaciones con ayuda y límites antes de contactar', () => {
    const html = renderToStaticMarkup(<ContributeCommunityGuide />);
    for (const label of Object.values(es.directoryGuide.contribute.options)) expect(html).toContain(label);
    expect((html.match(/class="guide-contribute-chip"/g) ?? []).length).toBe(7);
    expect(html).not.toContain("<select");
    expect(html).toContain(es.directoryGuide.contribute.contact);
    expect(html).toContain(es.directoryGuide.contribute.coverage);
    expect(html.indexOf(es.directoryGuide.contribute.coverage)).toBeLessThan(html.indexOf(es.directoryGuide.contribute.chipsPrefix));
    expect(html).not.toContain("conserva los demás filtros");
    expect(html).toContain(`<aside class="guide-contribute-notes" aria-label="${es.directoryGuide.contribute.notesTitle}">`);
    expect(html).not.toContain(es.directoryGuide.find.mapNote);
    expect(html).toContain(`class="opendata-footer-btn" aria-label="${es.directoryGuide.actions.map}"`);
    expect(html).toContain(es.directoryGuide.contribute.chipCount.replace('{{action}}', es.directoryGuide.contribute.options.speakers).replace('{{count}}', '0'));
    expect((html.match(/class="guide-contribute-chip-count"/g) ?? []).length).toBe(7);
    expect(html).not.toContain(es.openTo.descriptions.speakers);
    expect(html).toContain('images/guide/filters-es.webp');
    expect(html).toContain('aria-controls="guide-section-panel-contribute-refine"');
    expect((html.match(/aria-expanded="true"/g) ?? []).length).toBe(0);
    expect(html).not.toContain('directoryGuide.');
  });

  it('no ofrece filtrar por disponibilidades que nadie ha declarado', () => {
    const html = renderToStaticMarkup(<ContributeCommunityGuide />);

    expect(html).toMatch(/<button type="button" disabled=""/);
  });
});


describe('cierre de fase 2 (español)', () => {
  it('ofrece alta y búsqueda explícitas, revisión y los cuatro aspectos de mantenimiento', () => {
    const search = vi.fn();
    const add = vi.fn();
    const html = renderToStaticMarkup(<ImproveDirectoryGuide onSearch={search} onAdd={add} />);
    expect((html.match(/class="guide-accordion-trigger"/g) ?? []).length).toBe(4);
    expect(html).toContain('aria-labelledby="guide-section-improve-propose" hidden=""');
    expect(html).toContain('aria-labelledby="guide-section-improve-maintain" hidden=""');
    expect(html).not.toContain('aria-expanded="true"');
    for (const n of [1, 2, 3, 4]) expect(html).toContain(es.openData.organizers[`step${n}Title`]);
    expect(html).toContain(es.directoryGuide.improve.review);
    expect(html).toContain(es.directoryGuide.improve.ai);
    for (const url of ['https://opentechevents.org/', 'https://reader.opentechevents.org/', 'https://eventos.wiki/', 'https://t.me/+bUyya_Rzv6cxYmE0', 'https://groups.google.com/g/community-builders-es']) expect(html).toContain(url);
    for (const name of ['search', 'edit', 'assist']) {
      const path = `images/guide/${name}-es.webp`;
      expect(html).toContain(path);
      expect(readFileSync(new URL(`../public/${path}`, import.meta.url)).toString('ascii', 8, 12)).toBe('WEBP');
    }
    expect(html.indexOf('images/guide/search-es.webp')).toBeLessThan(html.indexOf(es.directoryGuide.improve.add));
    expect(html).not.toContain('directoryGuide.');
    expect(search).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });

  it('conserva todos los formatos, licencia, código e instrucciones sin adelantar herramientas', () => {
    const more = vi.fn();
    const html = renderToStaticMarkup(<BuildDataGuide onMore={more} />);
    expect(html).not.toContain('aria-expanded="true"');
    expect((html.match(/class="guide-accordion-trigger"/g) ?? []).length).toBe(3);
    expect((html.match(/<option /g) ?? []).length).toBe(5);
    for (const path of ['llms.txt', 'llms-full.txt', 'data/communities.json', 'data/communities.csv', 'data/communities.geojson', 'data/schema.json', 'data/tags.json', 'data/tags.en.json', 'data/audience.json', 'data/audience.en.json', 'robots.txt']) expect(html).toContain(`href="/${path}"`);
    expect(html).toContain('https://creativecommons.org/licenses/by/4.0/deed.es');
    expect(html).toContain(es.openData.license);
    expect(html).toContain('/blob/master/docs/DATA.md');
    expect(html).toContain('/blob/master/AGENTS.md');
    for (const label of ['curl + jq', 'JavaScript', 'Python / pandas', 'Open Tech Events', es.openData.prompts.onboarding.label, es.openData.agents.instructionsLabel]) expect(html).toContain(label);
    expect(html).toContain(es.openData.agents.noMcp);
    expect(html).not.toContain('directoryGuide.');
    expect(more).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';
import { Heading } from '../src/components/Heading.jsx';
import { ResultsBar } from '../src/components/ResultsBar.jsx';

const state = vi.hoisted(() => ({ locale: 'es', filters: {} }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, vars = {}) => {
      const value = key.split('.').reduce((data, part) => data?.[part], state.locale === 'es' ? es : en) ?? key;
      return typeof value === 'string'
        ? value.replace(/{{(\w+)}}/g, (_, name) => vars[name] ?? '')
        : value;
    },
    i18n: { resolvedLanguage: state.locale },
  }),
}));
vi.mock('../src/components/LanguageSwitcher.jsx', () => ({
  LanguageSwitcher: () => <div>ES EN</div>,
}));
vi.mock('../src/stores/community.store.js', () => ({
  useFilters: () => state.filters,
  useAllCommunities: () => [{ id: 1 }, { id: 2 }, { id: 3 }],
  useNumberOfCommunities: () => 2,
  useNumberOFOnSiteCommunities: () => 1,
  useTags: () => [{ id: 'javascript', label: 'JavaScript' }],
  useAudience: () => [],
  useChildrenByParentId: () => new Map(),
  useCommunityActions: () => ({ filterComunities: vi.fn() }),
}));
vi.mock('../src/stores/sidebar.store.js', () => ({
  useSidebarActions: () => ({ toggleSidebar: vi.fn() }),
  useSideBarVisible: () => false,
}));

afterEach(() => {
  state.filters = {};
  state.locale = 'es';
  vi.unstubAllGlobals();
});

describe('cabecera y resultados', () => {
  it.each(['es', 'en'])('conserva la marca y simplifica las acciones de cabecera (%s)', (locale) => {
    state.locale = locale;
    vi.stubGlobal('window', { navigator: { userAgent: 'test' } });
    const labels = locale === 'es' ? es : en;
    const html = renderToStaticMarkup(<Heading goToHome={() => {}} />);
    expect(html).toContain(labels.heading.title);
    expect(html).toContain(labels.heading.subtitle);
    expect(html).toContain(labels.heading.guideCta);
    expect(html).toContain(labels.heading.about);
    expect(html).toContain('ES EN');
    expect(html).not.toContain(labels.heading.openDataCta);
    expect(html).not.toContain(labels.heading.addCommunity);
    expect(html).not.toContain('heading-github-stars');
    expect(html).not.toContain('heading-action-btn--builders');
  });

  it.each(['list', 'map'])('agrupa criterios y recuento, manteniendo controles (%s)', (view) => {
    state.filters = { status: ['active'], tags: ['javascript'] };
    const html = renderToStaticMarkup(<ResultsBar view={view} toggleView={() => {}} />);
    const summary = html.slice(html.indexOf('class="results-summary"'), html.indexOf('class="results-bar__controls"'));
    expect(summary).toContain(`<strong>${view === 'map' ? 1 : 2}</strong>`);
    expect(summary).toContain('de 3');
    expect(summary).toContain('JavaScript');
    expect(summary).toContain('Activa');
    expect(summary).toContain('aria-label="Quitar filtro JavaScript"');
    expect(html).toContain(es.resultsBar.filters);
    expect(html).toContain('fa-sliders');
  });
});

/* eslint-disable react/prop-types */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';
import { CommunitiesList } from '../src/components/CommunitiesList.jsx';
import { BuildersInvitation } from '../src/components/CommunityBuildersModal/BuildersInvitation.jsx';
const state = vi.hoisted(() => ({ locale: 'es', communities: [{ id: 1, name: 'Comunidad' }] }));
const lookup = key => key.split('.').reduce((v, k) => v?.[k], state.locale === 'es' ? es : en) ?? key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: lookup }),
  // El panel usa <Trans>; aquí basta con el contenido de la traducción.
  Trans: ({ i18nKey }) => <>{lookup(i18nKey)}</>,
}));
vi.mock('../src/stores/community.store.js', () => ({
  useIsLoading: () => false, useIsError: () => null,
  useFilters: () => ({ status: ["active"] }), useCommunityActions: () => ({ setFilters: vi.fn() }),
  useCommunitiesFiltered: () => state.communities, useCBMemberIds: () => new Set(),
  useDataCoverage: () => ({ total: 2, active: { total: 2, reviewed: 1 } }),
}));
vi.mock('../src/components/CommunityCard.jsx', () => ({ CommunityCard: ({ community }) => <div className="test-community" data-community-id={community.id}>{community.name}</div> }));
vi.mock('../src/components/EmptyResults.jsx', () => ({ EmptyResults: () => <p>Sin resultados</p> }));
afterEach(() => { state.communities = [{ id: 1, name: 'Comunidad' }]; state.locale = 'es'; vi.unstubAllGlobals(); });

describe.each(['es', 'en'])('cierre de UI (%s)', locale => {
  it('mantiene una sola invitación con alta destacada y búsqueda secundaria', () => {
    state.locale = locale;
    vi.stubGlobal('window', { location: { pathname: `/${locale}/` } });
    const labels = locale === 'es' ? es : en;
    const html = renderToStaticMarkup(<CommunitiesList />);
    expect(html).not.toContain('class="cta-bar"');
    expect(html.match(/class="cta-panel"/g)).toHaveLength(1);
    expect(html.indexOf('test-community')).toBeLessThan(html.indexOf('cta-panel'));
    expect(html.match(new RegExp(labels.addCommunityCTA.findMine, 'g'))).toHaveLength(1);
    expect(html).toContain(labels.addCommunityCTA.add);
    expect(html).toContain(labels.addCommunityCTA.panel.leadFiltered);
    expect(html).not.toContain(labels.addCommunityCTA.panel.lead.split("{{total}}")[0]);
    expect(html.indexOf('cta-panel__primary')).toBeLessThan(html.indexOf('cta-panel__secondary'));
    expect(html).toContain(`href="/${locale}/?contribute=new"`);
    expect(html).toContain(`href="/${locale}/?hv=false"`);
    expect(html).toContain(labels.addCommunityCTA.later);
  });

  it('mantiene el acceso al alta cuando no hay resultados', () => {
    state.locale = locale; state.communities = [];
    vi.stubGlobal('window', { location: { pathname: `/${locale}/` } });
    const html = renderToStaticMarkup(<CommunitiesList />);
    // Sin resultados manda EmptyResults, y el panel queda debajo.
    expect(html).not.toContain('class="cta-bar"');
    expect(html.match(/class="cta-panel"/g)).toHaveLength(1);
    expect(html.indexOf('Sin resultados')).toBeLessThan(html.indexOf('cta-panel'));
  });
  it('explica el propósito de la invitación y abre el modal solo bajo demanda', () => {
    state.locale = locale;
    const labels = locale === 'es' ? es : en;
    const html = renderToStaticMarkup(<BuildersInvitation onSelectMember={() => {}} />);
    expect(html).toContain(labels.builders.invitation);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('role="dialog"');
  });
});

it('completa las claves inglesas de la guía, los prompts y las nuevas invitaciones', () => {
  function check(source, translated, path) {
    for (const [key, value] of Object.entries(source)) {
      expect(translated, `${path}.${key}`).toHaveProperty(key);
      if (typeof value === 'object') check(value, translated[key], `${path}.${key}`);
      else {
        expect(translated[key], `${path}.${key}`).toBeTruthy();
        expect((translated[key].match(/{{\w+}}/g) ?? []).sort()).toEqual((value.match(/{{\w+}}/g) ?? []).sort());
      }
    }
  }
  for (const key of ['directoryGuide', 'addCommunityCTA']) check(es[key], en[key], key);
});


it('usa la referencia de 24 fichas antes de medir el grid en el navegador', () => {
  state.communities = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Comunidad ${i + 1}` }));
  vi.stubGlobal('window', { location: { pathname: '/es/' } });
  const html = renderToStaticMarkup(<CommunitiesList />);
  expect(html.match(/class="cta-panel"/g)).toHaveLength(1);
  expect(html.indexOf('data-community-id="24"')).toBeLessThan(html.indexOf('class="cta-panel"'));
  expect(html.indexOf('class="cta-panel"')).toBeLessThan(html.indexOf('data-community-id="25"'));
  expect(html.match(/class="test-community"/g)).toHaveLength(30);
});

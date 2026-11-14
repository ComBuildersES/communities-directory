import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import es from '../src/i18n/locales/es.json';
import { OPEN_TO_OPTIONS } from '../src/lib/communityOpenTo.js';
import { OpenToFilters, OpenToOptions } from '../src/components/OpenToOptions.jsx';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, vars = {}) => {
    const value = key.split('.').reduce((data, part) => data?.[part], es) ?? key;
    return value.replace('{{option}}', vars.option ?? '');
  } }),
}));
vi.mock('../src/stores/community.store.js', () => ({
  useAllCommunities: () => [{ name: 'Community Builders', openTo: ['volunteers', 'co-organisers'] }],
  useFilters: () => ({}),
  useCommunityActions: () => ({ filterComunities: vi.fn() }),
}));

const render = (selected = []) => renderToStaticMarkup(<OpenToOptions selected={selected} onToggle={() => {}} />);

describe('selector openTo', () => {
  it('ofrece un desplegable completo, sin checkboxes ni explicaciones antes de seleccionar', () => {
    const html = render();
    expect(html).toContain('<select');
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain('Más información:');
    expect([...html.matchAll(/<option value="([^"]+)"/g)].map(match => match[1])).toEqual(OPEN_TO_OPTIONS);
  });

  it('muestra chips con ayuda y botón de quitar, sin repetirlos en el desplegable', () => {
    const html = render(['volunteers', 'speakers']);
    expect(html).toContain('Más información: Ponentes');
    expect(html).toContain('Quitar Ponentes');
    expect(html).toContain('Quitar Voluntariado');
    expect(html).not.toContain('<option value="speakers"');
    expect(html).not.toContain('<option value="volunteers"');
    expect(html.indexOf('Más información: Ponentes')).toBeLessThan(html.indexOf('Más información: Voluntariado'));
  });

  it('deshabilita el desplegable si ya están todas seleccionadas', () => {
    expect(render(OPEN_TO_OPTIONS)).toContain('disabled=""');
    expect(render(OPEN_TO_OPTIONS)).toContain('Todas las opciones añadidas');
  });

  it('solo ofrece facetas con comunidades y las muestra en el nuevo orden', () => {
    const html = renderToStaticMarkup(<OpenToFilters />);
    expect([...html.matchAll(/role="switch"[^>]+aria-label="([^"]+)"/g)].map(match => match[1]))
      .toEqual(['Personas coorganizadoras', 'Voluntariado']);
    expect(html).not.toContain('Ponentes');
  });
});

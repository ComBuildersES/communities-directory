import { describe, expect, it } from 'vitest';
import {
  ADD_COMMUNITY_CTA_DISMISS_DAYS,
  ADD_COMMUNITY_CTA_VARIANTS,
  isCtaDismissed,
  resolveAddCommunityCTAVariant,
  resolveCtaPanelPlacement,
  serializeCtaDismissal,
} from '../src/lib/addCommunityCTA.js';

describe('variante de la invitación a contribuir', () => {
  it('pregunta en general cuando el listado no está acotado', () => {
    expect(resolveAddCommunityCTAVariant({ filters: { status: ['active'] }, resultCount: 10, totalCount: 10 }))
      .toBe(ADD_COMMUNITY_CTA_VARIANTS.DEFAULT);
  });

  it('devuelve su propio recorte a quien ha filtrado', () => {
    expect(resolveAddCommunityCTAVariant({ filters: { status: ['active'] }, resultCount: 4, totalCount: 10 }))
      .toBe(ADD_COMMUNITY_CTA_VARIANTS.FILTERED);
  });

  it('no le ofrece repasar pendientes a quien ya está viendo las pendientes', () => {
    expect(resolveAddCommunityCTAVariant({ filters: { humanValidated: ['false'] }, resultCount: 4, totalCount: 10 }))
      .toBe(ADD_COMMUNITY_CTA_VARIANTS.REVIEWING);
  });

  it('con los dos valores de revisión marcados el filtro no acota nada', () => {
    expect(resolveAddCommunityCTAVariant({ filters: { humanValidated: ['false', 'true'] }, resultCount: 10, totalCount: 10 }))
      .toBe(ADD_COMMUNITY_CTA_VARIANTS.DEFAULT);
  });

  it('sin resultados no inventa un recorte: manda el estado vacío', () => {
    expect(resolveAddCommunityCTAVariant({ filters: {}, resultCount: 0, totalCount: 10 }))
      .toBe(ADD_COMMUNITY_CTA_VARIANTS.DEFAULT);
  });
});

describe('cierre temporal de la invitación', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.parse('2026-11-14T10:00:00Z');

  it('silencia la pieza un mes, no para siempre', () => {
    const stored = serializeCtaDismissal(now);
    expect(isCtaDismissed(stored, now + DAY)).toBe(true);
    expect(isCtaDismissed(stored, now + (ADD_COMMUNITY_CTA_DISMISS_DAYS - 1) * DAY)).toBe(true);
    expect(isCtaDismissed(stored, now + (ADD_COMMUNITY_CTA_DISMISS_DAYS + 1) * DAY)).toBe(false);
  });

  it('sin valor guardado la invitación se muestra', () => {
    expect(isCtaDismissed(null, now)).toBe(false);
    expect(isCtaDismissed('false', now)).toBe(false);
  });

  it('caduca el "true" sin fecha de la versión anterior', () => {
    // No se puede saber si ese cierre fue ayer o hace un año, y quien cerró la caja de
    // entonces no cerró esta: ni dice lo mismo ni está en el mismo sitio.
    expect(isCtaDismissed('true', now)).toBe(false);
  });
});

it('el estado de inicio no se anuncia como un recorte', () => {
  // Arranca con `status=active`: las 444 activas de un dataset de 660 son el listado
  // entero, no un filtro que alguien haya puesto.
  expect(resolveAddCommunityCTAVariant({ filters: { status: ['active'] }, resultCount: 444, totalCount: 444 }))
    .toBe(ADD_COMMUNITY_CTA_VARIANTS.DEFAULT);
});

describe('posición del panel de contribución', () => {
  it.each([0, 1, 23, 24])('se queda al final con %i resultados', async resultCount => {
    const { resolveCtaPanelPlacement } = await import('../src/lib/addCommunityCTA.js');
    expect(resolveCtaPanelPlacement({ resultCount })).toEqual({ atEnd: true });
  });
  it.each([25, 100, 444])('se intercala tras 24 fichas con %i resultados', async resultCount => {
    const { resolveCtaPanelPlacement } = await import('../src/lib/addCommunityCTA.js');
    expect(resolveCtaPanelPlacement({ resultCount })).toEqual({ afterIndex: 24 });
  });
});


describe('posición según las columnas reales del grid', () => {
  it.each([[1, 24], [2, 24], [3, 24], [7, 28], [8, 24], [9, 27], [13, 26], [14, 28], [30, 30]])(
    'completa una fila de %i columnas tras %i fichas', (columnCount, afterIndex) => {
      expect(resolveCtaPanelPlacement({ resultCount: 444, columnCount })).toEqual({ afterIndex });
    },
  );
  it.each([25, 26])('deja el panel al final con %i resultados si completar la fila requiere 26', resultCount => {
    expect(resolveCtaPanelPlacement({ resultCount, columnCount: 13 })).toEqual({ atEnd: true });
  });
  it('se intercala cuando queda al menos otra ficha después de la fila completa', () => {
    expect(resolveCtaPanelPlacement({ resultCount: 27, columnCount: 13 })).toEqual({ afterIndex: 26 });
  });
});

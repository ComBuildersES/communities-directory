import { describe, expect, it } from 'vitest';
import { buildProposalSummary, loadSummaryCatalogs } from '../scripts/lib/proposal-summary.js';

const catalogs = {
  enums: {
    status: { active: 'Activa' },
    communityType: { 'collaborative-group': 'Grupo colaborativo' },
    eventFormat: { hybrid: 'Híbridos' },
    geographicScope: { national: 'Nacional (España)' },
    language: { es: 'Español' },
  },
  tags: { 'women-in-tech': 'Women in tech', stem: 'STEM' },
  audience: { mentor: 'Mentoras y mentores' },
};

const payload = {
  id: null,
  name: 'Women4TT',
  status: 'active',
  communityType: 'collaborative-group',
  eventFormat: 'hybrid',
  location: 'Madrid',
  geographicScope: 'national',
  langs: ['es'],
  shortDescription: 'Impulsa la participación de mujeres como ponentes.',
  tags: ['women-in-tech', 'stem'],
  targetAudience: ['mentor'],
  communityUrl: 'https://www.women4tt.com/',
  urls: { linkedin: 'https://linkedin.com/company/w4tt', youtube: '' },
  thumbnailUrl: 'https://media.example.com/logo.png',
  displayOnMap: true,
  humanValidated: true,
};

describe('buildProposalSummary', () => {
  it('resuelve ids de taxonomía y enums a labels legibles en una alta', () => {
    const summary = buildProposalSummary({ mode: 'create', payload, catalogs });

    expect(summary).toContain('### 📋 Propuesta — Women4TT');
    expect(summary).toContain('| Estado | Activa |');
    expect(summary).toContain('| Tipo | Grupo colaborativo |');
    expect(summary).toContain('| Ámbito geográfico | Nacional (España) |');
    expect(summary).toContain('| Idiomas | Español |');
    expect(summary).toContain('| Etiquetas | Women in tech · STEM |');
    expect(summary).toContain('| Público objetivo | Mentoras y mentores |');
    expect(summary).not.toContain('women-in-tech');
  });

  it('previsualiza el logo solo cuando es una URL remota', () => {
    expect(buildProposalSummary({ mode: 'create', payload, catalogs }))
      .toContain('<img src="https://media.example.com/logo.png"');
    // Una ruta relativa todavía no existe en master: no se puede renderizar.
    expect(buildProposalSummary({
      mode: 'create',
      payload: { ...payload, thumbnailUrl: 'images/women4tt.webp' },
      catalogs,
    })).toContain('`images/women4tt.webp`');
  });

  it('omite las claves de urls sin valor y escapa pipes en las celdas', () => {
    const summary = buildProposalSummary({
      mode: 'create',
      payload: { ...payload, shortDescription: 'uno | dos' },
      catalogs,
    });

    expect(summary).toContain('- **linkedin**: https://linkedin.com/company/w4tt');
    expect(summary).not.toContain('**youtube**');
    expect(summary).toContain('uno \\| dos');
  });

  it('en una edición lista solo los campos que cambian, antes y después', () => {
    const existing = {
      ...payload,
      id: 632,
      status: 'active',
      location: 'Barcelona',
      tags: ['stem'],
      urls: { linkedin: 'https://linkedin.com/company/old' },
    };
    const summary = buildProposalSummary({ mode: 'edit', payload: { ...payload, id: 632 }, existing, catalogs });

    expect(summary).toContain('### ✏️ Cambios propuestos — Women4TT');
    expect(summary).toContain('| Campo | Antes | Ahora |');
    expect(summary).toContain('| Ubicación | Barcelona | Madrid |');
    expect(summary).toContain('| Etiquetas | STEM | Women in tech · STEM |');
    expect(summary).toContain('| urls.linkedin | https://linkedin.com/company/old | https://linkedin.com/company/w4tt |');
    // `status` no cambia: no debe aparecer como fila de diff.
    expect(summary).not.toContain('| Estado |');
  });

  /**
   * Con pares (#478) un mismo `kind` puede repetirse: el Meetup de un GDG y su encuentro
   * anual son los dos `eventsUrl`. Si el diff emparejase por clave, añadir el segundo se
   * leería como "el Meetup ha cambiado de dirección", que es un cambio que nadie hizo.
   */
  it('con dos canales del mismo kind, añadir uno es un alta y no una modificación', () => {
    const existing = {
      ...payload,
      id: 632,
      urls: [{ kind: 'eventsUrl', url: 'https://www.meetup.com/gdgZaragoza/' }],
    };
    const proposed = {
      ...payload,
      id: 632,
      urls: [
        { kind: 'eventsUrl', url: 'https://www.meetup.com/gdgZaragoza/' },
        { kind: 'eventsUrl', url: 'https://gdgzaragoza.es/devfest', label: 'DevFest Zaragoza' },
      ],
    };
    const summary = buildProposalSummary({ mode: 'edit', payload: proposed, existing, catalogs });

    expect(summary).toContain('| urls.eventsUrl | — | https://gdgzaragoza.es/devfest |');
    expect(summary).not.toContain('https://www.meetup.com/gdgZaragoza/ | https://gdgzaragoza.es/devfest');
  });

  it('la etiqueta propia de un canal se lista con su nombre, no con el de la plataforma', () => {
    const summary = buildProposalSummary({
      mode: 'create',
      payload: {
        ...payload,
        urls: [
          { kind: 'eventsUrl', url: 'https://gdgzaragoza.es/devfest', label: 'DevFest Zaragoza' },
        ],
      },
      catalogs,
    });

    expect(summary).toContain('**DevFest Zaragoza (eventsUrl)**: https://gdgzaragoza.es/devfest');
  });

  it('avisa cuando una edición no cambia nada en lugar de dejar la tabla vacía', () => {
    const existing = { ...payload, id: 632 };
    const summary = buildProposalSummary({ mode: 'edit', payload: { ...payload, id: 632 }, existing, catalogs });

    expect(summary).toContain('no cambia ningún campo');
    expect(summary).not.toContain('| Campo | Antes | Ahora |');
  });

  it('en una baja muestra el motivo', () => {
    const summary = buildProposalSummary({
      mode: 'delete',
      payload: { name: 'Women4TT', removalReason: 'Sin actividad desde 2023' },
      catalogs,
    });

    expect(summary).toContain('### 🗑️ Baja propuesta — Women4TT');
    expect(summary).toContain('**Motivo:** Sin actividad desde 2023');
  });

  it('carga los catálogos reales del repo', () => {
    const real = loadSummaryCatalogs();

    expect(real.enums.communityType['tech-meetup']).toBeTruthy();
    expect(Object.keys(real.tags).length).toBeGreaterThan(50);
    expect(Object.keys(real.audience).length).toBeGreaterThan(10);
  });
});

describe('ruido en la ficha', () => {
  it('oculta los flags "vale para cualquier…" cuando están en falso', () => {
    const base = { name: 'X', matchesAllTags: false, matchesAllAudience: false };

    expect(buildProposalSummary({ mode: 'create', payload: base, catalogs }))
      .not.toContain('Vale para cualquier');
    expect(buildProposalSummary({ mode: 'create', payload: { ...base, matchesAllTags: true }, catalogs }))
      .toContain('| Vale para cualquier etiqueta | Sí |');
  });
});

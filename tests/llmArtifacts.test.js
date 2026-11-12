import { describe, expect, it } from 'vitest';
import {
  SITE_URL,
  buildCsv,
  buildLlmsFull,
  buildLlmsIndex,
  buildSchema,
  buildSitemap,
  escapeCsvValue,
  meaningfulText,
  publishableCommunities,
} from '../scripts/generate-llm-artifacts.js';

const TAGS = [
  { id: 'python', label: 'Python', category: 'Programming Languages', synonyms: ['py'] },
  { id: 'cybersecurity', label: 'Cybersecurity', category: 'Cybersecurity', synonyms: [] },
];

const AUDIENCE = [{ id: 'junior-developer', label: 'Junior / Early-career', synonyms: [] }];

function community(overrides = {}) {
  return {
    id: 1,
    name: 'Python Valencia',
    status: 'active',
    communityType: 'tech-meetup',
    eventFormat: 'in-person',
    location: 'Valencia, Comunidad Valenciana',
    geographicScope: 'local',
    langs: ['es'],
    tags: ['python'],
    targetAudience: ['junior-developer'],
    contactInfo: 'hola@example.org',
    communityUrl: 'https://example.org',
    urls: { eventsUrl: 'https://www.meetup.com/python-valencia/' },
    thumbnailUrl: 'images/python-valencia.webp',
    latLon: { lat: 39.47, lon: -0.37 },
    displayOnMap: true,
    humanValidated: true,
    ...overrides,
  };
}

describe('meaningfulText', () => {
  it('descarta los marcadores heredados que equivalen a vacío', () => {
    expect(meaningfulText('n/a')).toBeNull();
    expect(meaningfulText(' N/A ')).toBeNull();
    expect(meaningfulText('-')).toBeNull();
    expect(meaningfulText('')).toBeNull();
    expect(meaningfulText(undefined)).toBeNull();
    expect(meaningfulText('Valencia')).toBe('Valencia');
  });
});

describe('publishableCommunities', () => {
  it('excluye las comunidades hidden y ordena por nombre', () => {
    const list = publishableCommunities([
      community({ id: 2, name: 'Zaragoza Tech' }),
      community({ id: 3, name: 'Oculta', hidden: true }),
      community({ id: 1, name: 'A Industriosa' }),
    ]);

    expect(list.map((c) => c.name)).toEqual(['A Industriosa', 'Zaragoza Tech']);
  });
});

describe('escapeCsvValue', () => {
  it('une los arrays con | y escapa comas, comillas y saltos de línea', () => {
    expect(escapeCsvValue(['python', 'django'])).toBe('python|django');
    expect(escapeCsvValue('Valencia, España')).toBe('"Valencia, España"');
    expect(escapeCsvValue('Dice "hola"')).toBe('"Dice ""hola"""');
    expect(escapeCsvValue(null)).toBe('');
  });
});

describe('buildCsv', () => {
  it('emite una cabecera y una fila por comunidad publicable', () => {
    const csv = buildCsv([community(), community({ id: 2, name: 'Oculta', hidden: true })]);
    const lines = csv.trim().split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('id,slug,name');
    expect(lines[1]).toContain('python-valencia');
    expect(lines[1]).toContain(`${SITE_URL}/es/?community=python-valencia`);
  });
});

describe('buildLlmsFull', () => {
  it('resuelve los ids de tags y audiencia a etiquetas legibles', () => {
    const markdown = buildLlmsFull([community()], { tags: TAGS, audience: AUDIENCE });

    expect(markdown).toContain('## Python Valencia');
    expect(markdown).toContain('Topics: Python');
    expect(markdown).toContain('Audience: Junior / Early-career');
    expect(markdown).not.toContain('junior-developer');
  });

  it('marca las comunidades generalistas en vez de dejarlas sin temática', () => {
    const markdown = buildLlmsFull([community({ tags: [], matchesAllTags: true })], {
      tags: TAGS,
      audience: AUDIENCE,
    });

    expect(markdown).toContain('Topics: Generalist (any topic)');
  });

  it('omite los marcadores vacíos heredados en vez de emitir "n/a"', () => {
    const markdown = buildLlmsFull([community({ location: 'n/a', contactInfo: '-' })], {
      tags: TAGS,
      audience: AUDIENCE,
    });

    expect(markdown).not.toContain('n/a');
    expect(markdown).not.toContain('Contact:');
  });

  it('avisa cuando el registro no lo ha revisado una persona', () => {
    const markdown = buildLlmsFull([community({ humanValidated: false })], {
      tags: TAGS,
      audience: AUDIENCE,
    });

    expect(markdown).toContain('not yet checked by a person');
  });

  it('no publica las comunidades hidden', () => {
    const markdown = buildLlmsFull([community({ name: 'Oculta', hidden: true })], {
      tags: TAGS,
      audience: AUDIENCE,
    });

    expect(markdown).not.toContain('Oculta');
  });
});

describe('buildLlmsIndex', () => {
  it('cuenta solo las activas y lista las categorías de la taxonomía', () => {
    const index = buildLlmsIndex(
      [community(), community({ id: 2, name: 'Vieja', status: 'inactive' })],
      { tags: TAGS, audience: AUDIENCE, deleted: [] }
    );

    expect(index).toContain('directory of 2 technology communities');
    expect(index).toContain('1 of them are currently active');
    expect(index).toContain('Cybersecurity');
    expect(index).toContain('CC BY 4.0');
  });

  it('singulariza el recuento de bajas', () => {
    const one = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [{}] });
    const two = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [{}, {}] });

    expect(one).toContain('1 record removed');
    expect(two).toContain('2 records removed');
  });
});

describe('buildSchema', () => {
  it('documenta cada valor de enum, no solo la lista', () => {
    const schema = buildSchema({ tags: TAGS, audience: AUDIENCE });

    expect(schema.properties.communityType.enum).toContain('umbrella-org');
    expect(schema.properties.communityType['x-enumDescriptions']['umbrella-org']).toMatch(/coordinates/);
    expect(schema.properties.tags.description).toContain('2 tags');
    expect(schema.properties.targetAudience.description).toContain('1 profiles');
  });
});

describe('buildSitemap', () => {
  it('publica cada comunidad activa en los dos locales y escapa el XML', () => {
    const sitemap = buildSitemap([community(), community({ id: 2, name: 'Vieja', status: 'inactive' })]);

    expect(sitemap).toContain(`${SITE_URL}/es/?community=python-valencia`);
    expect(sitemap).toContain(`${SITE_URL}/en/?community=python-valencia`);
    expect(sitemap).not.toContain('community=vieja');
    expect(sitemap).not.toMatch(/[^&]&[^a]/);
  });
});

describe('codificación de los .txt', () => {
  /**
   * GitHub Pages sirve los `.txt` sin `charset`, y entonces el navegador los decodifica con
   * la codificación local: un `—` se lee "â€”". `llms.txt` es el fichero que la gente abre
   * a mano, así que se mantiene ASCII puro y el problema no existe.
   */
  it('llms.txt es ASCII puro, para que ningún navegador lo decodifique mal', () => {
    const index = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [] });
    const nonAscii = [...index].filter((char) => char.codePointAt(0) > 127);

    expect(nonAscii).toEqual([]);
  });

  it('llms-full.txt abre con BOM, porque sus acentos son inevitables', () => {
    const markdown = buildLlmsFull([community({ name: 'Málaga Tech' })], {
      tags: TAGS,
      audience: AUDIENCE,
    });

    expect(markdown.codePointAt(0)).toBe(0xfeff);
  });
});

describe('cobertura declarada en llms.txt', () => {
  /**
   * Un campo vacío en este dataset significa "nadie lo ha rellenado", no "la comunidad no
   * trata de eso". Sin ese aviso el modelo descarta comunidades en silencio.
   */
  it('cuenta cuántas activas traen cada campo flojo', () => {
    const index = buildLlmsIndex(
      [community(), community({ id: 2, name: 'Sin Temas', tags: [], targetAudience: [], geographicScope: undefined })],
      { tags: TAGS, audience: AUDIENCE, deleted: [] }
    );

    expect(index).toContain('Of the 2 active communities, 1 have `tags`');
    expect(index).toContain('1 have `targetAudience`');
    expect(index).toContain('1 have `geographicScope`');
  });

  it('avisa de que lastReviewed no mide actividad', () => {
    const index = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [] });

    expect(index).toMatch(/`lastReviewed`[\s\S]*not\*\* an activity signal/);
    // Desde #478 el feed no es `urls.ote` sino la entrada de `urls` con ese kind. Lo que el
    // índice no puede dejar de hacer es apuntar al feed como única señal de actividad.
    expect(index).toMatch(/`urls` entry whose `kind` is `ote`/);
  });

  /**
   * El directorio lee el feed; mantenerlo al día es de la comunidad. Con la redacción
   * anterior ("the only field that evidences live activity"), un agente concluía que una
   * ficha con feed está viva sin haber abierto el feed.
   */
  it('no deja deducir actividad de que el campo del feed exista', () => {
    const index = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [] });

    expect(index).toMatch(/says nothing about what is in it/);
    expect(index).toMatch(/Read the dates inside the feed/);
  });

  /**
   * `urls` dejó de ser un objeto por plataforma (#478). Si el índice no lo dice, un agente
   * busca `urls.telegram`, no lo encuentra y concluye que la comunidad no tiene Telegram.
   */
  it('explica que urls es una lista de pares y que el kind puede repetirse', () => {
    const index = buildLlmsIndex([community()], { tags: TAGS, audience: AUDIENCE, deleted: [] });

    expect(index).toMatch(/`urls` is a \*\*list\*\*/);
    expect(index).toContain('`{ url, kind?, label? }`');
    expect(index).toMatch(/same `kind` can appear more than once/);
  });
});

/**
 * Autoría de encuentros recurrentes (issue #475). Un campo que no está en schema.json es un
 * campo que un agente interpreta adivinando, y `organizedBy` es de los que se malinterpretan
 * solos: leerlo como la lista completa de organizadores es falso.
 */
describe('organizedBy en los artefactos', () => {
  const gdgMalaga = community({ id: 11, name: 'GDG Málaga' });
  const biznaga = community({
    id: 12,
    name: 'Biznaga Fest',
    communityType: 'conference',
    organizedBy: [11],
  });

  it('el schema documenta el campo y lo distingue de parentId y mergedIntoId', () => {
    const { properties } = buildSchema({ tags: TAGS, audience: AUDIENCE });

    expect(properties.organizedBy.type).toBe('array');
    expect(properties.organizedBy.description).toContain('parentId');
    expect(properties.organizedBy.description).toContain('mergedIntoId');
  });

  it('el índice avisa de que no es la lista completa de organizadores', () => {
    const index = buildLlmsIndex([gdgMalaga, biznaga], { tags: TAGS, audience: AUDIENCE });

    expect(index).toContain('`organizedBy`');
    expect(index).toMatch(/sponsors/);
  });

  it('el CSV trae la columna, con los ids separados por |', () => {
    // Partir por comas a pelo no sirve: `location` viaja entrecomillada y desplaza las
    // columnas siguientes.
    const splitCsvRow = (row) =>
      (row.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? [])
        .slice(0, -1)
        .map((cell) => cell.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));

    const csv = buildCsv([gdgMalaga, biznaga]);
    const [header, ...rows] = csv.trim().split('\n');
    const columns = splitCsvRow(header);
    const biznagaRow = splitCsvRow(rows.find((row) => row.includes('Biznaga Fest')));

    expect(columns).toContain('organizedBy');
    expect(biznagaRow[columns.indexOf('organizedBy')]).toBe('11');
  });

  it('llms-full.txt emite nombres, no ids: un id suelto no le dice nada a quien lee prosa', () => {
    const full = buildLlmsFull([gdgMalaga, biznaga], { tags: TAGS, audience: AUDIENCE });

    expect(full).toContain('- Organised by: GDG Málaga');
    // La ficha de la comunidad organizadora no repite la relación: es derivada.
    expect(full.split('## GDG Málaga')[1].split('##')[0]).not.toContain('Organised by');
  });
});

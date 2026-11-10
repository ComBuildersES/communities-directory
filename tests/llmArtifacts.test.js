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
    expect(index).toContain('`urls.ote`');
  });
});

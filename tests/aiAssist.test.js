import { describe, expect, it } from 'vitest';
import {
  ASSIST_KEYS,
  ASSIST_PROVIDERS,
  buildAssistChatUrl,
  buildAssistPrompt,
  extractJsonObject,
  normalizeAssistUrls,
  parseAssistedCommunityJson,
  SCHEMA_URL,
  TAGS_URL,
} from '../src/lib/aiAssist.js';

const CATALOGUES = {
  knownTagIds: ['python', 'django', 'cybersecurity'],
  knownAudienceIds: ['junior-developer'],
};

describe('extractJsonObject', () => {
  it('acepta JSON pelado', () => {
    expect(extractJsonObject('{"name":"A"}')).toEqual({ name: 'A' });
  });

  it('acepta JSON dentro de una valla de código', () => {
    expect(extractJsonObject('```json\n{"name":"A"}\n```')).toEqual({ name: 'A' });
  });

  it('acepta JSON con texto del modelo alrededor', () => {
    const raw = 'Claro, aquí tienes la ficha:\n\n{"name":"A"}\n\nAvísame si quieres ajustarla.';
    expect(extractJsonObject(raw)).toEqual({ name: 'A' });
  });

  it('devuelve null con texto sin JSON, con un array o con JSON roto', () => {
    expect(extractJsonObject('no hay nada aquí')).toBeNull();
    expect(extractJsonObject('[1, 2, 3]')).toBeNull();
    expect(extractJsonObject('{"name": }')).toBeNull();
    expect(extractJsonObject('')).toBeNull();
  });
});

describe('parseAssistedCommunityJson', () => {
  it('se queda con los campos conocidos y descarta los inventados', () => {
    const { community, error } = parseAssistedCommunityJson(
      JSON.stringify({
        name: '  Python Valencia  ',
        status: 'active',
        communityType: 'tech-meetup',
        eventFormat: 'in-person',
        locations: ['Valencia', { name: 'Gandía', latLon: { lat: 1, lon: 2 } }, 'n/a', 'valencia'],
        communityUrl: 'https://example.org',
        rating: 5,
        internalNotes: 'lo que sea',
      }),
      CATALOGUES
    );

    expect(error).toBeNull();
    expect(community).toEqual({
      name: 'Python Valencia',
      status: 'active',
      communityType: 'tech-meetup',
      eventFormat: 'in-person',
      // Sólo nombres: las coordenadas que traiga la IA se descartan, igual que los marcadores
      // y las repetidas.
      locations: [{ name: 'Valencia' }, { name: 'Gandía' }],
      communityUrl: 'https://example.org',
    });
  });

  it('rechaza valores de enum que no existen y avisa', () => {
    const { community, warnings } = parseAssistedCommunityJson(
      JSON.stringify({ name: 'A', communityType: 'congreso', status: 'active' }),
      CATALOGUES
    );

    expect(community.communityType).toBeUndefined();
    expect(community.status).toBe('active');
    expect(warnings).toContain('enum:communityType:congreso');
  });

  it('descarta los tags que la IA se haya inventado', () => {
    const { community, warnings } = parseAssistedCommunityJson(
      JSON.stringify({ name: 'A', tags: ['python', 'pitón', 'django', 'python'] }),
      CATALOGUES
    );

    expect(community.tags).toEqual(['python', 'django']);
    expect(warnings).toContain('unknown:tags:pitón');
  });

  it('descarta las claves de urls que no existen', () => {
    const { community, warnings } = parseAssistedCommunityJson(
      JSON.stringify({
        name: 'A',
        urls: { web: 'https://a.dev', inventada: 'https://a.dev/x', github: '' },
      }),
      CATALOGUES
    );

    expect(community.urls).toEqual({ web: 'https://a.dev' });
    expect(warnings).toContain('unknown:urls:inventada');
  });

  /**
   * El prompt enlaza `schema.json` y le pide al modelo que se ciña a él. Cuando la lista de
   * claves que acepta el parser se mantenía a mano, se quedó atrás respecto al esquema: el
   * modelo devolvía una URL de Meetup siguiendo lo que había leído y el formulario la tiraba
   * sin decir nada. Ahora ambas salen de `URL_KINDS`.
   */
  it('acepta las claves de plataforma que el esquema le ofrece al modelo', () => {
    const { community, warnings } = parseAssistedCommunityJson(
      JSON.stringify({
        name: 'A',
        urls: { meetup: 'https://meetup.com/a', luma: 'https://lu.ma/a', eventbrite: 'https://eventbrite.es/e/1' },
      }),
      CATALOGUES
    );

    expect(community.urls).toEqual({
      meetup: 'https://meetup.com/a',
      luma: 'https://lu.ma/a',
      eventbrite: 'https://eventbrite.es/e/1',
    });
    expect(warnings.some((w) => w.startsWith('unknown:urls'))).toBe(false);
  });

  it('conserva los flags de generalista solo si son booleanos', () => {
    const { community } = parseAssistedCommunityJson(
      JSON.stringify({ name: 'A', matchesAllTags: true, matchesAllAudience: 'sí' }),
      CATALOGUES
    );

    expect(community.matchesAllTags).toBe(true);
    expect(community.matchesAllAudience).toBeUndefined();
  });

  it('nunca deja que la IA marque la ficha como validada por humano', () => {
    const { community } = parseAssistedCommunityJson(
      JSON.stringify({ name: 'A', humanValidated: true, id: 999 }),
      CATALOGUES
    );

    expect(community.humanValidated).toBeUndefined();
    expect(community.id).toBeUndefined();
  });

  it('informa del error en vez de lanzarlo', () => {
    expect(parseAssistedCommunityJson('lo siento, no puedo', CATALOGUES).error).toBe('invalidJson');
    expect(parseAssistedCommunityJson('{"foo":"bar"}', CATALOGUES).error).toBe('noFields');
  });

  it('sin catálogo cargado no descarta tags: el formulario aún no tiene los datos', () => {
    const { community } = parseAssistedCommunityJson(
      JSON.stringify({ name: 'A', tags: ['python', 'loquesea'] }),
      { knownTagIds: [], knownAudienceIds: [] }
    );

    expect(community.tags).toEqual(['python', 'loquesea']);
  });
});

describe('buildAssistPrompt', () => {
  it('enlaza el esquema y los catálogos en vez de incrustarlos', () => {
    const prompt = buildAssistPrompt({ communityUrl: 'https://a.dev' });

    expect(prompt).toContain(SCHEMA_URL);
    expect(prompt).toContain(TAGS_URL);
    expect(prompt).toContain('https://a.dev');
    // El prompt viaja en una query string (`claude.ai/new?q=`), así que el tope es un
    // guardarraíl contra el truncado, no un límite del navegador. Subió de 3000 al añadir
    // la traducción de la descripción (`shortDescriptionI18n`).
    expect(prompt.length).toBeLessThan(3200);
  });

  it('avisa de las dos trampas del modelo de datos', () => {
    const prompt = buildAssistPrompt({ communityUrl: 'https://a.dev' });

    expect(prompt).toMatch(/eventsUrl/);
    expect(prompt).toMatch(/geographicScope/);
  });

  it('cambia de idioma con el locale', () => {
    expect(buildAssistPrompt({ locale: 'en' })).toContain('tech communities');
    expect(buildAssistPrompt({ locale: 'es' })).toContain('comunidades tecnológicas');
  });

  it('incluye lo que ya hay en el borrador para que la IA no lo rehaga', () => {
    const prompt = buildAssistPrompt({
      communityUrl: 'https://a.dev',
      draft: { name: 'Python Valencia', locations: [{ name: 'Valencia' }, { name: 'Gandía' }] },
    });

    expect(prompt).toContain('Python Valencia');
    expect(prompt).toContain('- Ubicación: Valencia, Gandía');
  });

  it('el prompt pide exactamente las claves que el parser acepta (ASSIST_KEYS)', () => {
    for (const locale of ['es', 'en']) {
      const prompt = buildAssistPrompt({ locale });
      expect(prompt).toContain(ASSIST_KEYS.join(', '));
      expect(prompt).not.toMatch(/"location" /);
    }
    const sample = {
      name: 'A', status: 'active', communityType: 'tech-meetup', eventFormat: 'in-person',
      locations: ['Madrid'], geographicScope: 'local', shortDescription: 'x',
      shortDescriptionI18n: { en: 'x' }, langs: ['es'], tags: [], targetAudience: [], openTo: ['speakers'],
      contactInfo: 'a@b.c', communityUrl: 'https://a.dev', urls: { github: 'https://github.com/a' },
      matchesAllTags: true, matchesAllAudience: true,
    };
    expect(Object.keys(sample).sort()).toEqual([...ASSIST_KEYS].sort());
    const { community } = parseAssistedCommunityJson(JSON.stringify(sample), CATALOGUES);
    const accepted = Object.keys(community);
    // `tags` y `targetAudience` vacíos no se emiten; el resto de claves pedidas sí llegan.
    expect(ASSIST_KEYS.filter((key) => !['tags', 'targetAudience'].includes(key) && !accepted.includes(key))).toEqual([]);
  });
});

describe('normalizeAssistUrls', () => {
  it('acepta una URL suelta o una lista, y limpia vacíos y duplicados', () => {
    expect(normalizeAssistUrls('https://a.dev')).toEqual(['https://a.dev']);
    expect(normalizeAssistUrls(['https://a.dev', '  ', 'https://a.dev', 'https://b.dev'])).toEqual([
      'https://a.dev',
      'https://b.dev',
    ]);
    expect(normalizeAssistUrls([''])).toEqual([]);
  });
});

describe('buildAssistPrompt con varias URLs', () => {
  it('lista todas las fuentes y pide cruzarlas', () => {
    const prompt = buildAssistPrompt({
      communityUrl: ['https://a.dev', 'https://www.meetup.com/a', 'https://github.com/a'],
    });

    expect(prompt).toContain('- https://a.dev');
    expect(prompt).toContain('- https://www.meetup.com/a');
    expect(prompt).toContain('- https://github.com/a');
    expect(prompt).toMatch(/Crúzalos/);
  });

  it('sin URLs deja una indicación en vez de una lista vacía', () => {
    const prompt = buildAssistPrompt({ communityUrl: [] });

    expect(prompt).toContain('Enlaces de la comunidad:');
    expect(prompt).not.toContain('- http');
  });

  it('el prompt sigue cabiendo en una query string con varias fuentes', () => {
    const prompt = buildAssistPrompt({
      communityUrl: Array.from({ length: 8 }, (_, i) => `https://example.org/channel-${i}`),
    });

    expect(encodeURIComponent(prompt).length).toBeLessThan(8000);
  });
});

describe('buildAssistChatUrl', () => {
  it('codifica el prompt en la query de cada proveedor', () => {
    const url = buildAssistChatUrl('claude', 'hola mundo & más');

    expect(url.startsWith('https://claude.ai/new?q=')).toBe(true);
    expect(url).toContain(encodeURIComponent('hola mundo & más'));
  });

  it('cubre todos los proveedores declarados y rechaza los desconocidos', () => {
    ASSIST_PROVIDERS.forEach((provider) => {
      expect(buildAssistChatUrl(provider.id, 'x')).toContain('?q=x');
    });
    expect(buildAssistChatUrl('gemini', 'x')).toBeNull();
  });
});

describe("vínculos entre fichas", () => {
  it("descarta organizedBy: un id solo significa algo dentro del dataset, y el modelo lo adivinaría", () => {
    const { community, warnings } = parseAssistedCommunityJson(
      JSON.stringify({ name: "Biznaga Fest", organizedBy: [11], parentId: 10 }),
      { knownTagIds: [], knownAudienceIds: [] }
    );

    expect(community.name).toBe("Biznaga Fest");
    expect("organizedBy" in community).toBe(false);
    expect("parentId" in community).toBe(false);
    expect(warnings).toBeInstanceOf(Array);
  });
});

describe('sedes desde la IA (code review)', () => {
  it('acepta una sola ciudad como texto', () => {
    const { community } = parseAssistedCommunityJson('{"name":"A","locations":"Madrid"}', CATALOGUES);
    expect(community.locations).toEqual([{ name: 'Madrid' }]);
  });

  it('avisa en vez de callar si el modelo manda el campo viejo `location`', () => {
    const { community, warnings } = parseAssistedCommunityJson('{"name":"A","location":"Madrid"}', CATALOGUES);
    expect(community).not.toHaveProperty('locations');
    expect(warnings).toContain('unknown:location:Madrid');
  });
});

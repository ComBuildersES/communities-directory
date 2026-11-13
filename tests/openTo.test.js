import { describe, expect, it } from 'vitest';
import { OPEN_TO_OPTIONS, availableOpenToOptions, countOpenToOptions, normalizeOpenTo, validateOpenTo } from '../src/lib/communityOpenTo.js';
import { buildCommunityPayload, buildDirectoryFilterPath, getCommunityDraft, getEmptyCommunityDraft, parseDirectoryFilters } from '../src/lib/communitySubmission.js';
import { dropEmptyArchivedUrls, normalizePayload } from '../scripts/process-community-issue.js';
import { parseAssistedCommunityJson, buildAssistPrompt } from '../src/lib/aiAssist.js';
import { buildInverseIndex } from '../src/data/invertedindex.js';
import { searchFaceted } from '../src/data/searchFaceted.js';
import { buildSchema, buildCsv, buildLlmsIndex } from '../scripts/generate-llm-artifacts.js';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';

describe('openTo (#464)', () => {
  it('ofrece las siete opciones traducidas, incluyendo Ponentes y Mentores', () => {
    expect(OPEN_TO_OPTIONS).toEqual(['speakers', 'co-organisers', 'mentors', 'volunteers', 'venues', 'collaborations', 'sponsors']);
    for (const locale of [es, en]) for (const id of OPEN_TO_OPTIONS) {
      expect(locale.openTo.labels[id]).toBeTruthy();
      expect(locale.openTo.descriptions[id]).toBeTruthy();
    }
    expect(es.openTo.labels.speakers).toBe('Ponentes');
    expect(es.openTo.labels.mentors).toBe('Mentores / Mentoras');
    expect(es.openTo.labels.venues).toBe('Espacio');
  });
  it('oculta las facetas sin comunidades y conserva el orden solicitado', () => {
    expect(availableOpenToOptions([
      { openTo: ['volunteers', 'co-organisers'] },
      { openTo: ['mentors'], hidden: true },
      { openTo: [] },
      {},
    ])).toEqual(['co-organisers', 'volunteers']);
    expect(availableOpenToOptions([])).toEqual([]);
  });
  it('mantiene sin información las fichas antiguas y no añade claves vacías', () => {
    expect(getCommunityDraft({ name: 'Antigua' }).openTo).toEqual([]);
    expect(buildCommunityPayload(getEmptyCommunityDraft())).not.toHaveProperty('openTo');
    expect(normalizePayload({ name: 'Antigua' })).not.toHaveProperty('openTo');
  });
  it('conserva la selección durante el ciclo de propuesta y permite retirarla', () => {
    const original = { name: 'Comunidad', openTo: ['speakers', 'mentors'] };
    const draft = getCommunityDraft(original);
    const payload = buildCommunityPayload(draft, original);
    expect(normalizePayload(payload).openTo).toEqual(original.openTo);
    const cleared = buildCommunityPayload({ ...draft, openTo: [] }, original);
    expect(cleared.openTo).toEqual([]);
    expect(dropEmptyArchivedUrls({ ...original, ...normalizePayload(cleared) })).not.toHaveProperty('openTo');
  });
  it('rechaza valores no canónicos, tipos inválidos y duplicados', () => {
    expect(validateOpenTo(undefined)).toBeNull();
    expect(validateOpenTo([])).toBeNull();
    expect(validateOpenTo(OPEN_TO_OPTIONS)).toBeNull();
    for (const value of [null, 'speakers', ['inventado'], ['speakers', 'speakers']]) expect(validateOpenTo(value)).toBeTruthy();
    expect(normalizeOpenTo(['speakers', 'inventado', 'speakers'])).toEqual(['speakers']);
  });
  it('se comparte por URL', () => {
    const filters = { openTo: ['speakers', 'mentors'] };
    expect(buildDirectoryFilterPath({ pathname: '/es/', filters })).toBe('/es/?ot=speakers,mentors');
    expect(parseDirectoryFilters('?ot=speakers,mentors')).toEqual(filters);
    expect(parseDirectoryFilters('?openTo=speakers,mentors')).toEqual(filters);
  });
  it('combina opciones con OR y otras facetas con AND, sin incluir fichas sin datos', () => {
    const data = [{ id: 1, status: 'active', openTo: ['speakers'] }, { id: 2, status: 'active', openTo: ['mentors'] }, { id: 3, status: 'inactive', openTo: ['speakers'] }, { id: 4, status: 'active' }];
    expect(searchFaceted(data, buildInverseIndex(data), { openTo: ['speakers', 'mentors'], status: ['active'] }).map(c => c.id)).toEqual([1, 2]);
  });
  it('filtra la respuesta de IA y exige evidencia en ambos idiomas', () => {
    const result = parseAssistedCommunityJson(JSON.stringify({ openTo: ['speakers', 'inventado', 'mentors', 'speakers'] }));
    expect(result.community.openTo).toEqual(['speakers', 'mentors']);
    expect(result.warnings).toContain('unknown:openTo:inventado');
    for (const locale of ['es', 'en']) {
      const prompt = buildAssistPrompt({ locale });
      expect(prompt).toContain('openTo');
      expect(prompt).toContain('mentors');
      expect(prompt).toMatch(/eviden/);
    }
  });
  it('publica el esquema y el CSV', () => {
    const field = buildSchema().properties.openTo;
    expect(field.items.enum).toEqual(OPEN_TO_OPTIONS);
    expect(field.uniqueItems).toBe(true);
    expect(buildLlmsIndex([])).toContain('Empty or absent means unknown, not refusal');
    expect(field.description).toContain('unknown');
    expect(buildCsv([{ id: 1, name: 'Comunidad', openTo: ['speakers', 'mentors'] }])).toContain('speakers|mentors');
  });
});


describe('recuentos de aportaciones', () => {
  it('cuenta comunidades con declaración explícita una vez y excluye las ocultas', () => {
    const counts = countOpenToOptions([
      { openTo: ['speakers', 'speakers', 'mentors', 'inventado'] },
      { openTo: ['speakers'] },
      { openTo: ['mentors'], hidden: true },
      { communityType: 'tech-meetup' },
      { openTo: [] },
    ]);
    expect(counts).toEqual({ speakers: 2, 'co-organisers': 0, mentors: 1, volunteers: 0, venues: 0, collaborations: 0, sponsors: 0 });
  });

  it('coincide con los resultados al sustituir openTo, conservando las demás facetas', () => {
    const data = [
      { id: 1, status: 'active', tags: ['python'], openTo: ['speakers'] },
      { id: 2, status: 'active', tags: ['python'], openTo: ['mentors'] },
      { id: 3, status: 'inactive', tags: ['python'], openTo: ['speakers'] },
      { id: 4, status: 'active', tags: ['javascript'], openTo: ['speakers'] },
      { id: 5, status: 'active', tags: ['python'] },
    ];
    const index = buildInverseIndex(data);
    const context = { status: ['active'], tags: ['python'] };
    const counts = countOpenToOptions(searchFaceted(data, index, context));
    expect(counts.speakers).toBe(1);
    expect(counts.mentors).toBe(1);
    for (const option of OPEN_TO_OPTIONS) {
      expect(counts[option]).toBe(searchFaceted(data, index, { ...context, openTo: [option] }).length);
    }
  });
});

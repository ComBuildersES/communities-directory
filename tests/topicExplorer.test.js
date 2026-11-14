import { describe, expect, it } from 'vitest';
import { groupTopics, searchTopics, withTopicSelection, withExplorerSelection } from '../src/lib/topicExplorer.js';
import { buildDirectoryStatePath, parseDirectoryFilters } from '../src/lib/communitySubmission.js';
import tags from '../public/data/tags.json';
import audience from '../public/data/audience.json';

describe('explorador de públicos', () => {
  it('agrupa los 43 públicos en sus diez categorías y busca en todo el catálogo', () => {
    const groups = groupTopics(audience, 'audience');
    expect(groups).toHaveLength(10);
    expect(groups.flatMap(group => group.items)).toHaveLength(43);
    expect(searchTopics(audience, 'estudiante').length).toBeGreaterThan(0);
  });

  it('combina los dos borradores conservando las demás facetas y sus modos independientes', () => {
    const filters = { status: ['active'], nameQuery: ['gdg'], langs: ['es'], tags: ['ruby'], targetAudience: ['other'] };
    const result = withExplorerSelection(filters, {
      topics: { selected: ['python', 'react'], mode: 'all' },
      audience: { selected: ['students', 'junior'], mode: 'any' },
    });
    expect(result).toEqual({ ...filters, tags: ['python', 'react'], tagMatch: ['all'], targetAudience: ['students', 'junior'] });
    const cleared = withTopicSelection({ ...result, audienceMatch: ['all'] }, [], 'all', 'audience');
    expect(cleared.tags).toEqual(['python', 'react']);
    expect(cleared.tagMatch).toEqual(['all']);
    expect(cleared).not.toHaveProperty('targetAudience');
    expect(cleared).not.toHaveProperty('audienceMatch');
  });

  it('serializa los dos modos sin interpretar valores inválidos o huérfanos', () => {
    const filters = { tags: ['python', 'react'], tagMatch: ['all'], targetAudience: ['students', 'junior'], audienceMatch: ['all'], langs: ['es'] };
    const path = buildDirectoryStatePath({ pathname: '/es/', filters });
    expect(path).toContain('am=all');
    expect(parseDirectoryFilters(path.slice(path.indexOf('?')))).toEqual(filters);
    expect(parseDirectoryFilters('?am=all')).toEqual({});
    expect(parseDirectoryFilters('?ta=students&am=invalid')).toEqual({ targetAudience: ['students'] });
    expect(buildDirectoryStatePath({ pathname: '/es/', filters: { audienceMatch: ['all'] } })).toBe('/es/');
  });
});

describe('catálogo de temáticas', () => {
  it('agrupa todo el catálogo una sola vez y usa ejemplos de su propia categoría', () => {
    const groups = groupTopics(tags);
    expect(groups).toHaveLength(17);
    expect(groups.flatMap(group => group.items.map(tag => tag.id)).sort()).toEqual(tags.map(tag => tag.id).sort());
    for (const group of groups) {
      expect(group.examples.length).toBeGreaterThan(0);
      expect(group.examples.every(example => group.items.some(tag => tag.label === example))).toBe(true);
    }
    expect(groups.find(group => group.category === 'Lenguajes de programación').examples).toContain('Python');
  });

  it('busca globalmente por etiqueta, descripción y sinónimos, también C', () => {
    expect(searchTopics(tags, 'ECMAScript').map(tag => tag.id)).toContain('javascript');
    expect(searchTopics(tags, 'C').map(tag => tag.id)).toEqual(['c']);
    expect(searchTopics(tags, 'zzzzzzzzzzzz')).toEqual([]);
  });

  it('cambia únicamente las temáticas y el modo, sin duplicar etiquetas', () => {
    const filters = { status: ['active'], langs: ['es'], nameQuery: ['gdg'], tags: ['ruby'] };
    const next = withTopicSelection(filters, ['python', 'react', 'python'], 'all');
    expect(next).toEqual({ ...filters, tags: ['python', 'react'], tagMatch: ['all'] });
    expect(filters.tags).toEqual(['ruby']);
    expect(withTopicSelection(next, [], 'all')).toEqual({ status: ['active'], langs: ['es'], nameQuery: ['gdg'] });
    expect(withTopicSelection(next, ['python'], 'any')).not.toHaveProperty('tagMatch');
  });
});

describe('modo de combinación en URL', () => {
  it('conserva etiquetas y Todas al compartir, también con otros filtros', () => {
    const filters = { tags: ['python', 'react'], tagMatch: ['all'], langs: ['es'], nameQuery: ['tech'] };
    const path = buildDirectoryStatePath({ pathname: '/es/', filters });
    expect(path).toContain('tm=all');
    expect(parseDirectoryFilters(path.slice(path.indexOf('?')))).toEqual(filters);
  });

  it('conserva Cualquiera como defecto y no interpreta modos inválidos ni huérfanos', () => {
    expect(parseDirectoryFilters('?t=python,react')).toEqual({ tags: ['python', 'react'] });
    expect(parseDirectoryFilters('?t=python&tm=any')).toEqual({ tags: ['python'] });
    expect(parseDirectoryFilters('?t=python&tm=invalid')).toEqual({ tags: ['python'] });
    expect(parseDirectoryFilters('?tm=all')).toEqual({});
    expect(buildDirectoryStatePath({ pathname: '/es/', filters: { tagMatch: ['all'] } })).toBe('/es/');
  });
});

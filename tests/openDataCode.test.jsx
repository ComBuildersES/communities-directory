import { describe, expect, it } from 'vitest';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';
import { getCodeSnippets } from '../src/lib/openDataCode.js';

const community = (name, extra = {}) => ({ name, status: 'active', eventFormat: 'in-person', location: 'Madrid', communityUrl: 'https://example.org', tags: ['python'], ...extra });
const rows = [
  community('Temática'),
  community('Generalista', { tags: [], matchesAllTags: true }),
  community('Oculta', { hidden: true }),
  community('Inactiva', { status: 'inactive' }),
  community('Otra temática', { tags: ['java'] }),
];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

describe.each([{ locale: 'es', data: es }, { locale: 'en', data: en }])('ejemplos reutilizables de datos ($locale)', ({ data }) => {
  const snippets = getCodeSnippets(key => key.split('.').reduce((value, part) => value?.[part], data) ?? key);
  const example = key => snippets.find(item => item.key === key).text;
  it('JavaScript incluye generalistas y excluye fichas ocultas e inactivas', async () => {
    const output = [];
    const fetch = async url => ({ json: async () => url.endsWith('tags.json') || url.endsWith('tags.en.json') ? [{ id: 'python', label: 'Python' }] : rows });
    await new AsyncFunction('fetch', 'console', example('js'))(fetch, { log: (...args) => output.push(args) });
    expect(output.map(args => args[0])).toEqual(['Temática', 'Generalista']);
    expect(output[0].at(-1)).toBe('Python');
  });

  it('el agregador omite fichas ocultas y tolera feeds que no responden', async () => {
    const data = [
      community('Con feed', { urls: [{ kind: 'ote', url: 'https://example.org/feed' }] }),
      community('Oculta', { hidden: true, urls: [{ kind: 'ote', url: 'https://example.org/hidden' }] }),
      community('Sin feed'),
      community('Feed caído', { urls: [{ kind: 'ote', url: 'https://example.org/broken' }] }),
    ];
    const requested = [];
    const output = [];
    const fetch = async url => {
      requested.push(url);
      if (url.endsWith('/broken')) throw new Error('CORS');
      return { json: async () => url.endsWith('communities.json') ? data : { events: [{ title: 'Encuentro' }] } };
    };
    await new AsyncFunction('fetch', 'console', example('events'))(fetch, { log: value => output.push(value) });
    expect(requested).not.toContain('https://example.org/hidden');
    expect(output).toEqual([[{ community: 'Con feed', title: 'Encuentro' }]]);
  });
});

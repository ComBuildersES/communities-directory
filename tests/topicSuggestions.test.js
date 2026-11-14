import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildTopicSuggestionIssueUrl, classifySuggestedTopics, parseSuggestedTopics, TOPIC_ISSUE_TEMPLATE, AUDIENCE_ISSUE_TEMPLATE, UNDECIDED_TOPIC_CATEGORY } from '../src/lib/topicSuggestions.js';

describe('propuestas de temáticas', () => {
  it('identifica el catálogo de públicos y usa su propia plantilla', () => {
    const url = new URL(buildTopicSuggestionIssueUrl({ names: ['Nuevo público'], category: 'Etapa profesional', catalog: 'audience' }));
    expect(url.searchParams.get('template')).toBe(AUDIENCE_ISSUE_TEMPLATE);
    expect(url.searchParams.get('title')).toBe('[Públicos] Nuevo público');
    expect(url.searchParams.get('body')).toContain('## Catálogo\n\nPúblicos');
    expect(url.searchParams.get('body')).toContain('## Públicos propuestos');
    const template = readFileSync(new URL(`../.github/ISSUE_TEMPLATE/${AUDIENCE_ISSUE_TEMPLATE}`, import.meta.url), 'utf8');
    expect(template).toContain('name: Proponer públicos');
  });
  it('acepta comas o saltos de línea, limpia vacíos y evita duplicados sin perder los nombres', () => {
    expect(parseSuggestedTopics('  Nueva temática, , NUEVA TEMATICA\nC++, C#\nOtra   temática, C++ ')).toEqual(['Nueva temática', 'C++', 'C#', 'Otra temática']);
    expect(parseSuggestedTopics(' ,\n ')).toEqual([]);
  });

  it('reconoce etiquetas, IDs y sinónimos exactos, sin descartar una temática solo por parecerse', () => {
    const tags = [{ id: 'javascript', label: 'JavaScript', synonyms: ['JS', 'ECMAScript'] }];
    const result = classifySuggestedTopics('JS, javascript, ECMAScript, JavaScripto, Nueva', tags);
    expect(result.existing).toEqual(tags);
    expect(result.proposed).toEqual(['JavaScripto', 'Nueva']);
  });

  it('prepara un único issue con los nombres y la categoría, codificando los caracteres especiales', () => {
    const url = new URL(buildTopicSuggestionIssueUrl({ names: ['Nueva & otra', 'Prueba #1', 'Nueva & otra'], category: 'Datos, IA y Analítica' }));
    expect(url.origin + url.pathname).toBe('https://github.com/ComBuildersES/communities-directory/issues/new');
    expect(url.searchParams.get('template')).toBe(TOPIC_ISSUE_TEMPLATE);
    expect(url.searchParams.get('title')).toBe('[Temáticas] Nueva & otra, Prueba #1');
    expect(url.searchParams.get('body')).toContain('- Nueva & otra\n- Prueba #1');
    expect(url.searchParams.get('body')).toContain('Datos, IA y Analítica');
    expect(url.searchParams.has('labels')).toBe(false);
  });

  it('permite delegar la categoría y no prepara una propuesta vacía', () => {
    expect(new URL(buildTopicSuggestionIssueUrl({ names: ['Nueva'], category: UNDECIDED_TOPIC_CATEGORY })).searchParams.get('body')).toContain('Por decidir');
    expect(buildTopicSuggestionIssueUrl({ names: [], category: 'DevTools' })).toBe('');
    expect(buildTopicSuggestionIssueUrl({ names: ['Nueva'], category: '' })).toBe('');
  });

  it('incluye la plantilla referenciada sin habilitar los issues en blanco', () => {
    const template = readFileSync(new URL(`../.github/ISSUE_TEMPLATE/${TOPIC_ISSUE_TEMPLATE}`, import.meta.url), 'utf8');
    expect(template).toContain('name: Proponer temáticas');
    expect(template).toContain('## Categoría propuesta');
    const config = readFileSync(new URL('../.github/ISSUE_TEMPLATE/config.yml', import.meta.url), 'utf8');
    expect(config).toContain('blank_issues_enabled: false');
  });
});

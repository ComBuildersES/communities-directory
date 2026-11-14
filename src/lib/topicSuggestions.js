import { normalize } from './fuzzyMatch.js';

export const TOPIC_ISSUE_TEMPLATE = 'proponer-tematicas.md';
export const AUDIENCE_ISSUE_TEMPLATE = 'proponer-publicos.md';
export const UNDECIDED_TOPIC_CATEGORY = 'undecided';

export function parseSuggestedTopics(text = '') {
  const seen = new Set();
  return text.split(/[,\n]+/).map(name => name.trim().replace(/\s+/g, ' ')).filter(name => {
    const key = normalize(name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Solo coincidencias exactas: una semejanza no demuestra que la temática ya exista. */
export function classifySuggestedTopics(text, tags) {
  const known = new Map();
  for (const tag of tags) {
    for (const name of [tag.label, tag.id]) known.set(normalize(name), tag);
  }
  for (const tag of tags) {
    for (const synonym of tag.synonyms ?? []) {
      if (!known.has(normalize(synonym))) known.set(normalize(synonym), tag);
    }
  }
  const proposed = [];
  const existing = new Map();
  for (const name of parseSuggestedTopics(text)) {
    const match = known.get(normalize(name));
    if (match) existing.set(match.id, match);
    else proposed.push(name);
  }
  return { proposed, existing: [...existing.values()] };
}

export function buildTopicSuggestionIssueUrl({ names = [], category = '', catalog = 'topics' }) {
  const topics = parseSuggestedTopics(names.join(', '));
  if (topics.length === 0 || !category.trim()) return '';
  const url = new URL('https://github.com/ComBuildersES/communities-directory/issues/new');
  const audience = catalog === 'audience';
  url.searchParams.set('template', audience ? AUDIENCE_ISSUE_TEMPLATE : TOPIC_ISSUE_TEMPLATE);
  url.searchParams.set('title', `[${audience ? 'Públicos' : 'Temáticas'}] ${topics.join(', ')}`.slice(0, 120));
  url.searchParams.set('body', [
    '## Catálogo', '', audience ? 'Públicos' : 'Temáticas', '',
    audience ? '## Públicos propuestos' : '## Temáticas propuestas', '', ...topics.map(name => `- ${name}`), '',
    '## Categoría propuesta', '', category === UNDECIDED_TOPIC_CATEGORY ? 'Por decidir' : category.trim(), '',
    '## Contexto', '', 'Propuesta preparada desde el explorador de temáticas y públicos del directorio.',
  ].join('\n'));
  return url.toString();
}

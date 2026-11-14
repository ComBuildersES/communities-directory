import { scoreItem } from './fuzzyMatch.js';

export const TAG_CATEGORY_ORDER = [
  'Web y Frontend', 'Frameworks, Librerías y Stacks', 'Lenguajes de programación',
  'Tech for Social Good', 'Datos, IA y Analítica', 'DevOps, Cloud e Infraestructura',
  'Arquitectura y Paradigmas', 'Startups, Negocio y Producto', 'Bases de Datos y Almacenamiento',
  'Ciberseguridad', 'Mobile y Sistemas Operativos', 'Hardware, IoT y Maker', 'DevTools',
  'CMS', 'Tecnologías Descentralizadas', 'Realidad Extendida y 3D', 'Videojuegos',
];

export const AUDIENCE_CATEGORY_ORDER = [
  'Etapa profesional', 'Desarrollo de software', 'Datos e inteligencia artificial',
  'Plataforma, cloud y operaciones', 'Calidad, seguridad y arquitectura', 'Liderazgo, producto y delivery',
  'Diseño, experiencia y contenido', 'Negocio, comunidad e impacto', 'Hardware, sistemas y robótica',
  'Investigación, educación y academia',
];

export const EXPLORER_FACETS = {
  topics: { key: 'tags', modeKey: 'tagMatch' },
  audience: { key: 'targetAudience', modeKey: 'audienceMatch' },
};

export function groupTopics(tags, catalog = 'topics') {
  const categoryOrder = catalog === 'audience' ? AUDIENCE_CATEGORY_ORDER : TAG_CATEGORY_ORDER;
  const groups = new Map();
  for (const tag of tags) {
    const category = tag.category || (catalog === 'audience' ? 'Otros públicos' : 'Otras temáticas');
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(tag);
  }
  return [...groups].map(([category, items]) => {
    const preferred = category === 'Lenguajes de programación' ? ['python', 'javascript', 'go'] : [];
    const examples = [...items].sort((left, right) => {
      const position = id => preferred.includes(id) ? preferred.indexOf(id) : preferred.length;
      return position(left.id) - position(right.id);
    }).slice(0, 3).map(tag => tag.label);
    return { category, items, examples };
  }).sort((left, right) => {
    const position = category => categoryOrder.includes(category) ? categoryOrder.indexOf(category) : categoryOrder.length;
    return position(left.category) - position(right.category) || left.category.localeCompare(right.category, 'es');
  });
}

export function searchTopics(tags, query) {
  return tags.map(tag => ({ tag, score: scoreItem(query, tag) }))
    .filter(({ score }) => score !== null)
    .sort((left, right) => right.score - left.score || left.tag.label.localeCompare(right.tag.label, 'es'))
    .map(({ tag }) => tag);
}

/** Sustituye únicamente la faceta elegida y su forma de combinación. */
export function withTopicSelection(filters, selected, mode, catalog = 'topics') {
  const { key, modeKey } = EXPLORER_FACETS[catalog];
  const next = { ...filters };
  delete next[key];
  delete next[modeKey];
  const tags = [...new Set(selected)];
  if (tags.length > 0) {
    next[key] = tags;
    if (mode === 'all') next[modeKey] = ['all'];
  }
  return next;
}

export function withExplorerSelection(filters, drafts) {
  return Object.keys(EXPLORER_FACETS).reduce((current, catalog) =>
    withTopicSelection(current, drafts[catalog].selected, drafts[catalog].mode, catalog), filters);
}

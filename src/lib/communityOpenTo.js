/** Disponibilidad declarada, nunca inferida. Vacío o ausente significa «sin información». */
export const OPEN_TO_OPTIONS = [
  'speakers', 'co-organisers', 'mentors', 'volunteers', 'venues', 'collaborations', 'sponsors',
];

export function normalizeOpenTo(value) {
  if (!Array.isArray(value)) return [];
  return OPEN_TO_OPTIONS.filter((option) => value.includes(option));
}

export function validateOpenTo(value) {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return 'openTo debe ser un array.';
  if (value.some((item) => !OPEN_TO_OPTIONS.includes(item))) {
    return `openTo solo admite: ${OPEN_TO_OPTIONS.join(', ')}.`;
  }
  if (new Set(value).size !== value.length) return 'openTo no admite valores duplicados.';
  return null;
}

/** Disponibilidad en todo el directorio visible, independiente de los filtros activos. */
export function availableOpenToOptions(communities) {
  const declared = new Set(communities
    .filter((community) => community.hidden !== true)
    .flatMap((community) => normalizeOpenTo(community.openTo)));
  return OPEN_TO_OPTIONS.filter((option) => declared.has(option));
}

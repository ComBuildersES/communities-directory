/** Disponibilidad declarada, nunca inferida. Vacío o ausente significa «sin información». */
export const OPEN_TO_OPTIONS = [
  'volunteers', 'collaborations', 'co-organisers', 'speakers', 'sponsors', 'venues', 'mentors',
];

export function normalizeOpenTo(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => OPEN_TO_OPTIONS.includes(item)))];
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

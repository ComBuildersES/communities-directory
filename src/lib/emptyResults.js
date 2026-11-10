/**
 * Qué mensaje toca cuando los filtros no devuelven ninguna comunidad.
 *
 * Es una función pura y no un puñado de ternarios dentro del componente porque las tres
 * situaciones se confunden con facilidad y la equivocada dice lo contrario de la verdad:
 * pedir las pendientes y no obtener ninguna es haber terminado la zona, no una búsqueda
 * fallida.
 */

export const EMPTY_RESULTS_VARIANTS = {
  /** Cero resultados a secas: los filtros no cuadran con nada. */
  GENERIC: "generic",
  /** Se pidió "solo revisadas" y aún no hay ninguna, pero sí pendientes que ofrecer. */
  PENDING_OFFER: "pending-offer",
  /** Se pidió "solo pendientes" y no queda ninguna: aquí ya está todo repasado. */
  ALL_REVIEWED: "all-reviewed",
};

export function resolveEmptyResultsVariant({ filters = {}, reviewed = 0, pending = 0 } = {}) {
  const reviewFilter = filters.humanValidated ?? [];
  // Con los dos valores marcados el filtro no acota nada: no hay historia de revisión que
  // contar, solo que la búsqueda no encontró nada.
  const isReviewedOnly = reviewFilter.includes("true") && !reviewFilter.includes("false");
  const isPendingOnly = reviewFilter.includes("false") && !reviewFilter.includes("true");

  if (isPendingOnly && pending === 0 && reviewed > 0) {
    return EMPTY_RESULTS_VARIANTS.ALL_REVIEWED;
  }

  if (isReviewedOnly && pending > 0) {
    return EMPTY_RESULTS_VARIANTS.PENDING_OFFER;
  }

  return EMPTY_RESULTS_VARIANTS.GENERIC;
}

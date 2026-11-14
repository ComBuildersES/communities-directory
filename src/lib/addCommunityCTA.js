/**
 * Qué le toca decir a la invitación a contribuir, y hasta cuándo se calla.
 *
 * Las dos decisiones viven aquí y no dentro del componente por el mismo motivo que en
 * `emptyResults.js`: la variante equivocada dice lo contrario de la verdad. Ofrecerle
 * "repasa una pendiente" a quien ya está mirando justo las pendientes es ruido, y
 * enseñarle el recuento del directorio entero a quien ha filtrado por su ciudad
 * desperdicia el único momento en el que la pregunta va de verdad con esa persona.
 */

export const ADD_COMMUNITY_CTA_VARIANTS = {
  /** Sin acotar: la pregunta general sobre si su comunidad sale cuando alguien la busca. */
  DEFAULT: "default",
  /** La persona ha acotado el listado: se le devuelve su propio recorte. */
  FILTERED: "filtered",
  /** Ya está viendo las pendientes: no se le vuelve a ofrecer lo que ya está haciendo. */
  REVIEWING: "reviewing",
};

/**
 * El filtro de revisión en "solo pendientes" es la lista de trabajo de quien ya ha venido
 * a repasar. Los dos valores marcados no acotan nada (ver `resolveEmptyResultsVariant`).
 */
function isPendingOnly(filters = {}) {
  const review = filters.humanValidated ?? [];
  return review.includes("false") && !review.includes("true");
}

/**
 * `totalCount` son las comunidades activas, no el dataset entero: el listado arranca con
 * `status=active`, así que contra el total la pantalla de inicio se anunciaría a sí misma
 * como un recorte.
 */
export function resolveAddCommunityCTAVariant({ filters = {}, resultCount = 0, totalCount = 0 } = {}) {
  if (isPendingOnly(filters)) return ADD_COMMUNITY_CTA_VARIANTS.REVIEWING;
  // Sin resultados manda `EmptyResults`, que ya cuenta su propia historia.
  if (resultCount > 0 && totalCount > 0 && resultCount < totalCount) {
    return ADD_COMMUNITY_CTA_VARIANTS.FILTERED;
  }
  return ADD_COMMUNITY_CTA_VARIANTS.DEFAULT;
}

/**
 * Cerrar la invitación la silencia un mes, no para siempre.
 *
 * El aspa de una caja con borde de color se pulsa por reflejo, antes de leer nada: tratar
 * ese clic como "no me lo enseñes nunca más" gasta para siempre la única superficie que
 * recluta, a cambio de un gesto que no fue una decisión.
 */
export const ADD_COMMUNITY_CTA_DISMISS_DAYS = 30;
const DISMISS_MS = ADD_COMMUNITY_CTA_DISMISS_DAYS * 24 * 60 * 60 * 1000;

export function serializeCtaDismissal(now = Date.now()) {
  return String(now);
}

/**
 * `true` a secas es lo que guardaba la versión anterior, sin fecha. No se puede saber si
 * fue ayer o hace un año, así que se deja caducar: quien cerró la caja de entonces no
 * cerró esta, que no dice lo mismo ni está en el mismo sitio.
 */
export function isCtaDismissed(raw, now = Date.now()) {
  if (!raw || raw === "false") return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return now - dismissedAt < DISMISS_MS;
}

/** Mantener 24 fichas como referencia y completar la fila real antes de insertar el panel. */
export function resolveCtaPanelPlacement({ resultCount, columnCount = 1 }) {
  const columns = Number.isFinite(columnCount) ? Math.max(1, Math.floor(columnCount)) : 1;
  const afterIndex = Math.ceil(24 / columns) * columns;
  return resultCount <= afterIndex ? { atEnd: true } : { afterIndex };
}

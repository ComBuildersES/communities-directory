/**
 * Cobertura del dataset: cuántas fichas ha revisado una persona y cuántas traen cada campo
 * flojo.
 *
 * Vive aquí, y no en el script que genera `llms.txt`, porque las dos superficies que lo
 * cuentan tienen que contar lo mismo: la barra de progreso del popover "Sobre el proyecto" y
 * la sección "How to read a community record" del índice para agentes. Con dos cálculos, la
 * web y el fichero que leen los modelos se contradicen en el primer cambio de criterio, y
 * entonces la transparencia pasa a ser una cifra que nadie se cree.
 *
 * Recibe una lista ya publicable (sin comunidades pendientes de id): quien llama sabe si está
 * en el build o en el navegador, esta función no.
 */

import { toLegacyUrlMap } from "./communityUrls.js";

const STATUSES = ["active", "inactive", "unknown"];

const hasTags = (community) => Boolean(community.tags?.length || community.matchesAllTags);
const hasAudience = (community) =>
  Boolean(community.targetAudience?.length || community.matchesAllAudience);
const hasScope = (community) =>
  Boolean(community.geographicScope && community.geographicScope !== "unknown");
// `urls` es un array de pares desde #478, así que "¿tiene feed OTE?" no es un acceso por
// clave: se pregunta al helper, que entiende los dos formatos.
const hasOte = (community) => Boolean(toLegacyUrlMap(community.urls).ote);

/** Porcentaje entero, redondeado hacia abajo: 89 de 657 es un 13%, no un 14%. */
export const percentage = (part, whole) => (whole > 0 ? Math.floor((part / whole) * 100) : 0);

export function buildCoverage(communities = []) {
  const list = Array.isArray(communities) ? communities : [];
  const reviewed = list.filter((community) => Boolean(community.humanValidated));
  const active = list.filter((community) => community.status === "active");

  const byStatus = {};
  STATUSES.forEach((status) => {
    const inStatus = list.filter((community) => community.status === status);
    byStatus[status] = {
      total: inStatus.length,
      reviewed: inStatus.filter((community) => Boolean(community.humanValidated)).length,
    };
  });

  return {
    total: list.length,
    reviewed: reviewed.length,
    reviewedPercent: percentage(reviewed.length, list.length),
    byStatus,
    /**
     * Los campos se miden solo sobre las activas: la cobertura de una comunidad parada no
     * dice nada sobre lo que alguien va a consultar hoy.
     */
    active: {
      total: active.length,
      reviewed: byStatus.active.reviewed,
      reviewedPercent: percentage(byStatus.active.reviewed, active.length),
      withTags: active.filter(hasTags).length,
      withAudience: active.filter(hasAudience).length,
      withScope: active.filter(hasScope).length,
      withOte: active.filter(hasOte).length,
    },
  };
}

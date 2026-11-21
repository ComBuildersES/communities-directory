/**
 * Enlace directo a la ficha de una comunidad.
 *
 * Vivía incrustado en `CommunityModal`, donde era `?community=${community.id}`. Una
 * comunidad recién propuesta todavía no tiene id (nace con `id: null` y se le asigna ya en
 * `master`), así que ese enlace era `?community=null`: compartirla llevaba al directorio sin
 * ficha abierta. `resolveCommunityFromIdentifier` acepta id **o** slug, y el slug existe
 * desde el primer día, así que es lo que se usa cuando no hay id.
 */
import { slugifyCommunityName } from "./communitySubmission.js";

export const APP_URL = "https://directory.communitybuilders.dev/";

export function resolveCommunityIdentifier(community) {
  if (!community) return "";
  if (community.id !== null && community.id !== undefined && community.id !== "") {
    return String(community.id);
  }
  return slugifyCommunityName(community.name || "");
}

export function buildCommunityShareUrl(community, baseUrl = APP_URL) {
  const identifier = resolveCommunityIdentifier(community);
  if (!identifier) return baseUrl;
  return `${baseUrl}?community=${encodeURIComponent(identifier)}`;
}

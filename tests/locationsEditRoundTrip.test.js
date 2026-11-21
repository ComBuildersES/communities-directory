import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readCommunities, stableStringify } from "../scripts/lib/communities-store.js";
import { normalizePayload, resolveCoordinates } from "../scripts/process-community-issue.js";
import { getDisplayLocations } from "../src/lib/communityLocations.js";
import {
  EVENT_FORMATS_WITH_LOCATION,
  buildCommunityPayload,
  getCommunityDraft,
} from "../src/lib/communitySubmission.js";

/**
 * Abrir una ficha en el formulario y enviarla sin tocar nada no puede mover sus sedes: el
 * formulario siembra filas, las vuelve a convertir en sedes, y el procesado del issue las
 * vuelve a normalizar y a resolver coordenadas. Cualquier diferencia en esa cadena es un
 * cambio que nadie pidió.
 *
 * Quedan fuera, a propósito, las fichas en las que el primer envío **sí** corrige algo: un
 * paraguas o una comunidad online (pasan a `[]`) y las que aún llevan un marcador como
 * `n/a` (se descarta). Ese es el comportamiento acordado, no una deriva.
 */
function editsWithoutChanges(community) {
  return EVENT_FORMATS_WITH_LOCATION.includes(community.eventFormat)
    && community.communityType !== "umbrella-org"
    && getDisplayLocations(community).length === community.locations.length;
}

describe("editar una ficha sin tocar nada no cambia sus sedes", () => {
  // Nada de red: una sede que intentase geocodificar se vería como coordenadas perdidas o
  // cambiadas, que es justo lo que este test busca.
  const fetchMock = vi.fn().mockRejectedValue(new Error("sin red en los tests"));
  beforeEach(() => vi.stubGlobal("fetch", fetchMock));
  afterEach(() => vi.unstubAllGlobals());

  const communities = readCommunities().filter(editsWithoutChanges);

  it("hay fichas que comprobar", () => {
    expect(communities.length).toBeGreaterThan(400);
  });

  it("locations sale idéntico, sin pedir nada a Nominatim", async () => {
    const changed = [];
    for (const community of communities) {
      const payload = buildCommunityPayload(getCommunityDraft(community), community);
      const normalized = normalizePayload(JSON.parse(JSON.stringify(payload)));
      const locations = await resolveCoordinates(normalized, community, { delayMs: 0 });
      const trimmed = community.locations.map((l) => ({ ...l, name: l.name.trim() }));
      if (stableStringify(locations) !== stableStringify(trimmed)) {
        changed.push({ name: community.name, before: community.locations, after: locations });
      }
    }
    expect(changed).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("displayOnMap tampoco cambia", () => {
    const changed = communities
      .filter((community) => {
        const payload = buildCommunityPayload(getCommunityDraft(community), community);
        return payload.displayOnMap !== community.displayOnMap;
      })
      .map((community) => community.name);
    expect(changed).toEqual([]);
  });
});

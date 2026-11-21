import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolveCoordinates,
  shouldRegeocodeLocation,
} from "../scripts/process-community-issue.js";

const BARCELONA = { lat: 41.387917, lon: 2.1699187 };
const MADRID = { lat: 40.4167, lon: -3.7033 };
const MALLORCA = { lat: 39.6378, lon: 2.6446 };
const NULL = { lat: null, lon: null };

function payloadOf(overrides = {}) {
  return {
    name: "No cON Name",
    communityType: "conference",
    locations: [{ name: "Barcelona", latLon: { ...BARCELONA } }],
    displayOnMap: true,
    ...overrides,
  };
}

function existingOf(overrides = {}) {
  return {
    id: 364,
    name: "No cON Name",
    locations: [{ name: "Barcelona", latLon: { ...BARCELONA } }],
    displayOnMap: true,
    ...overrides,
  };
}

function stubNominatim(...responses) {
  const fetchMock = vi.fn();
  for (const results of responses) {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => results });
  }
  fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const run = (payload, existing) => resolveCoordinates(payload, existing, { delayMs: 0 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shouldRegeocodeLocation", () => {
  const existing = existingOf().locations;

  it("regeocodifica una sede renombrada que arrastra las coordenadas heredadas", () => {
    expect(shouldRegeocodeLocation({ name: "Parc Bit, Mallorca", latLon: BARCELONA }, existing)).toBe(true);
  });

  it("no regeocodifica si el nombre no cambia (sin distinguir mayúsculas ni espacios)", () => {
    expect(shouldRegeocodeLocation({ name: "  barcelona ", latLon: BARCELONA }, existing)).toBe(false);
  });

  it("respeta las coordenadas puestas a mano", () => {
    expect(shouldRegeocodeLocation({ name: "Parc Bit, Mallorca", latLon: MALLORCA }, existing)).toBe(false);
  });

  it("no aplica en altas (sin ficha previa)", () => {
    expect(shouldRegeocodeLocation({ name: "Barcelona", latLon: BARCELONA }, [])).toBe(false);
  });
});

describe("resolveCoordinates", () => {
  it("devuelve undefined si la propuesta no trae sedes: la edición conserva las de la ficha", async () => {
    const payload = payloadOf();
    delete payload.locations;
    expect(await run(payload, existingOf())).toBeUndefined();
  });

  it("recalcula la sede renombrada (PR #457)", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await run(
      payloadOf({ locations: [{ name: "Parc Bit, Mallorca", latLon: { ...BARCELONA } }] }),
      existingOf(),
    );
    expect(result).toEqual([{ name: "Parc Bit, Mallorca", latLon: MALLORCA }]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent("Parc Bit, Mallorca"));
  });

  it("no llama a Nominatim si ninguna sede ha cambiado", async () => {
    const fetchMock = stubNominatim();
    expect(await run(payloadOf(), existingOf())).toEqual(existingOf().locations);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("geocodifica sólo la sede nueva y conserva la que ya estaba", async () => {
    const fetchMock = stubNominatim([{ lat: "40.4167", lon: "-3.7033" }]);
    const result = await run(
      payloadOf({
        locations: [
          { name: "Barcelona", latLon: { ...BARCELONA } },
          { name: "Madrid", latLon: { ...NULL } },
        ],
      }),
      existingOf(),
    );
    expect(result).toEqual([
      { name: "Barcelona", latLon: BARCELONA },
      { name: "Madrid", latLon: MADRID },
    ]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("una sede existente que llega sin coordenadas hereda las suyas", async () => {
    const fetchMock = stubNominatim();
    const result = await run(
      payloadOf({ locations: [{ name: "barcelona", latLon: { ...NULL } }] }),
      existingOf(),
    );
    expect(result).toEqual([{ name: "barcelona", latLon: BARCELONA }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("conserva las coordenadas heredadas si la geocodificación no devuelve resultados", async () => {
    stubNominatim([]);
    const result = await run(
      payloadOf({ locations: [{ name: "Ubicación inexistente", latLon: { ...BARCELONA } }] }),
      existingOf(),
    );
    expect(result[0].latLon).toEqual(BARCELONA);
  });

  it("conserva las coordenadas heredadas si Nominatim falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const result = await run(
      payloadOf({ locations: [{ name: "Parc Bit, Mallorca", latLon: { ...BARCELONA } }] }),
      existingOf(),
    );
    expect(result[0].latLon).toEqual(BARCELONA);
  });

  it("geocodifica cada sede de un alta, una petición por sede", async () => {
    const fetchMock = stubNominatim(
      [{ lat: "41.387917", lon: "2.1699187" }],
      [{ lat: "40.4167", lon: "-3.7033" }],
    );
    const result = await run(
      payloadOf({
        locations: [
          { name: "Barcelona", latLon: { ...NULL } },
          { name: "Madrid", latLon: { ...NULL } },
        ],
      }),
      undefined,
    );
    expect(result.map((l) => l.latLon)).toEqual([BARCELONA, MADRID]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deja sin coordenadas lo que no se muestra en el mapa", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await run(
      payloadOf({ displayOnMap: false, locations: [{ name: "Parc Bit, Mallorca", latLon: { ...BARCELONA } }] }),
      existingOf(),
    );
    expect(result).toEqual([{ name: "Parc Bit, Mallorca", latLon: NULL }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

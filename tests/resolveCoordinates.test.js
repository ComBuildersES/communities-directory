import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolveCoordinates,
  shouldRegeocodeLocation,
} from "../scripts/process-community-issue.js";

const BARCELONA = { lat: 41.387917, lon: 2.1699187 };
const MALLORCA = { lat: 39.6378, lon: 2.6446 };

function payloadOf(overrides = {}) {
  return {
    name: "No cON Name",
    communityType: "conference",
    location: "Barcelona",
    latLon: { ...BARCELONA },
    displayOnMap: true,
    ...overrides,
  };
}

function existingOf(overrides = {}) {
  return {
    id: 364,
    name: "No cON Name",
    location: "Barcelona",
    latLon: { ...BARCELONA },
    ...overrides,
  };
}

function stubNominatim(results) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => results,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shouldRegeocodeLocation", () => {
  it("regeocodifica cuando la edición cambia la ubicación y arrastra las coordenadas heredadas", () => {
    const payload = payloadOf({ location: "Parc Bit, Mallorca" });
    expect(shouldRegeocodeLocation(payload, existingOf())).toBe(true);
  });

  it("no regeocodifica si la ubicación no cambia", () => {
    expect(shouldRegeocodeLocation(payloadOf(), existingOf())).toBe(false);
  });

  it("ignora diferencias de mayúsculas y espacios en la ubicación", () => {
    const payload = payloadOf({ location: "  barcelona " });
    expect(shouldRegeocodeLocation(payload, existingOf())).toBe(false);
  });

  it("respeta las coordenadas puestas a mano junto al cambio de ubicación", () => {
    const payload = payloadOf({ location: "Parc Bit, Mallorca", latLon: { ...MALLORCA } });
    expect(shouldRegeocodeLocation(payload, existingOf())).toBe(false);
  });

  it("no aplica en altas (sin ficha previa)", () => {
    expect(shouldRegeocodeLocation(payloadOf(), undefined)).toBe(false);
  });
});

describe("resolveCoordinates", () => {
  it("recalcula las coordenadas cuando la edición mueve la ubicación (PR #457)", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await resolveCoordinates(
      payloadOf({ location: "Parc Bit, Mallorca" }),
      existingOf()
    );

    expect(result).toEqual(MALLORCA);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent("Parc Bit, Mallorca"));
  });

  it("no llama a Nominatim si la ubicación no ha cambiado", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await resolveCoordinates(payloadOf(), existingOf());

    expect(result).toEqual(BARCELONA);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("conserva las coordenadas heredadas si la geocodificación no devuelve resultados", async () => {
    stubNominatim([]);
    const result = await resolveCoordinates(
      payloadOf({ location: "Ubicación inexistente" }),
      existingOf()
    );

    expect(result).toEqual(BARCELONA);
  });

  it("conserva las coordenadas heredadas si Nominatim falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const result = await resolveCoordinates(
      payloadOf({ location: "Parc Bit, Mallorca" }),
      existingOf()
    );

    expect(result).toEqual(BARCELONA);
  });

  it("geocodifica un alta sin coordenadas", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await resolveCoordinates(
      payloadOf({ location: "Parc Bit, Mallorca", latLon: { lat: null, lon: null } }),
      undefined
    );

    expect(result).toEqual(MALLORCA);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("deja sin coordenadas lo que no se muestra en el mapa", async () => {
    const fetchMock = stubNominatim([{ lat: "39.6378", lon: "2.6446" }]);
    const result = await resolveCoordinates(
      payloadOf({ location: "Parc Bit, Mallorca", displayOnMap: false }),
      existingOf()
    );

    expect(result).toEqual({ lat: null, lon: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

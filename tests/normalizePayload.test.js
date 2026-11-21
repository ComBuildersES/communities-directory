import { describe, it, expect } from "vitest";
import { normalizePayload } from "../scripts/process-community-issue.js";

const base = {
  name: "Test Community",
  status: "active",
  communityType: "tech-meetup",
  eventFormat: "in-person",
  locations: [{ name: "Madrid", latLon: { lat: null, lon: null } }],
  shortDescription: "",
  topics: "",
  langs: ["es"],
  tags: [],
  targetAudience: [],
  contactInfo: "",
  communityUrl: "https://example.com",
  urls: {},
  thumbnailUrl: "",
  displayOnMap: false,
  humanValidated: false,
};

describe("normalizePayload", () => {
  it("incluye shortDescription cuando se proporciona", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "Una comunidad de tecnología en Madrid",
    });
    expect(result.shortDescription).toBe("Una comunidad de tecnología en Madrid");
  });

  it("shortDescription vacío se normaliza a cadena vacía", () => {
    const result = normalizePayload({ ...base, shortDescription: "" });
    expect(result.shortDescription).toBe("");
  });

  it("shortDescription ausente se normaliza a cadena vacía", () => {
    const withoutDesc = { ...base };
    delete withoutDesc.shortDescription;
    const result = normalizePayload(withoutDesc);
    expect(result.shortDescription).toBe("");
  });

  it("recorta espacios en shortDescription", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "  descripción con espacios  ",
    });
    expect(result.shortDescription).toBe("descripción con espacios");
  });

  it("preserva el resto de campos al incluir shortDescription", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "Mi descripción",
    });
    expect(result.name).toBe("Test Community");
    expect(result.communityUrl).toBe("https://example.com");
    expect(result.tags).toEqual([]);
  });

  it("status por defecto es unknown si no se proporciona", () => {
    const result = normalizePayload({ ...base, status: "" });
    expect(result.status).toBe("unknown");
  });

  it("filtra tags duplicados y vacíos", () => {
    const result = normalizePayload({
      ...base,
      tags: ["react", "react", "", "javascript"],
    });
    expect(result.tags).toEqual(["react", "javascript"]);
  });

  it("normaliza langs con fallback a español", () => {
    expect(normalizePayload({ ...base, langs: ["en", "en", "es"] }).langs).toEqual(["en", "es"]);
    expect(normalizePayload({ ...base, langs: [] }).langs).toEqual(["es"]);
    expect(normalizePayload({ ...base, langs: undefined }).langs).toEqual(["es"]);
  });

  it("normaliza humanValidated a booleano", () => {
    expect(normalizePayload({ ...base, humanValidated: true }).humanValidated).toBe(true);
    expect(normalizePayload({ ...base, humanValidated: false }).humanValidated).toBe(false);
    expect(normalizePayload({ ...base, humanValidated: undefined }).humanValidated).toBe(false);
  });

  it("matchesAllTags solo aparece en el resultado cuando es true", () => {
    expect(normalizePayload({ ...base, matchesAllTags: true }).matchesAllTags).toBe(true);
    expect(normalizePayload({ ...base, matchesAllTags: false })).not.toHaveProperty("matchesAllTags");
    expect(normalizePayload({ ...base })).not.toHaveProperty("matchesAllTags");
  });

  it("matchesAllAudience solo aparece en el resultado cuando es true", () => {
    expect(normalizePayload({ ...base, matchesAllAudience: true }).matchesAllAudience).toBe(true);
    expect(normalizePayload({ ...base, matchesAllAudience: false })).not.toHaveProperty("matchesAllAudience");
    expect(normalizePayload({ ...base })).not.toHaveProperty("matchesAllAudience");
  });

  describe("locations (issue #45)", () => {
    it("sin la clave, no la emite: la edición conserva las sedes de la ficha", () => {
      const payload = { ...base };
      delete payload.locations;
      expect(normalizePayload(payload)).not.toHaveProperty("locations");
    });

    it("[] se conserva: es vaciar las sedes", () => {
      expect(normalizePayload({ ...base, locations: [] }).locations).toEqual([]);
    });

    it("descarta los marcadores de la lista cerrada y deduplica", () => {
      const result = normalizePayload({
        ...base,
        locations: [{ name: "n/a" }, { name: " Madrid " }, { name: "madrid" }, { name: "NA" }],
      });
      expect(result.locations).toEqual([
        { name: "Madrid", latLon: { lat: null, lon: null } },
        { name: "NA", latLon: { lat: null, lon: null } },
      ]);
    });

    it("lee coordenadas escritas como texto en un issue editado a mano", () => {
      const result = normalizePayload({
        ...base,
        locations: [{ name: "Madrid", latLon: { lat: "40.41", lon: "-3.70" } }],
      });
      expect(result.locations[0].latLon).toEqual({ lat: 40.41, lon: -3.7 });
    });

    it("no emite los campos viejos", () => {
      const result = normalizePayload({ ...base, location: "Madrid", latLon: { lat: 1, lon: 2 } });
      expect(result).not.toHaveProperty("location");
      expect(result).not.toHaveProperty("latLon");
    });

    it("displayOnMap ausente no se emite; un paraguas nunca va al mapa", () => {
      const payload = { ...base };
      delete payload.displayOnMap;
      expect(normalizePayload(payload)).not.toHaveProperty("displayOnMap");
      expect(normalizePayload({ ...base, displayOnMap: true, communityType: "umbrella-org" }).displayOnMap).toBe(false);
    });
  });

  it("no escribe removalReason vacío en una edición", () => {
    expect(normalizePayload({ ...base, removalReason: "" })).not.toHaveProperty("removalReason");
    expect(normalizePayload({ ...base, removalReason: "cerró" }).removalReason).toBe("cerró");
  });
});

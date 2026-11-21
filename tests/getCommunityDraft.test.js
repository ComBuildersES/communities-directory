import { describe, it, expect } from "vitest";
import { buildCommunityPayload, getCommunityDraft } from "../src/lib/communitySubmission.js";
import { makeLocationRow } from "../src/lib/communityLocations.js";

const baseCommunity = {
  id: 1,
  name: "Test",
  status: "active",
  communityType: "tech-meetup",
  eventFormat: "in-person",
  locations: [{ name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } }],
  shortDescription: "Una comunidad tech",
  topics: "",
  langs: ["es", "en"],
  tags: ["javascript"],
  targetAudience: ["frontend-developer"],
  contactInfo: "",
  communityUrl: "https://example.com",
  urls: {},
  thumbnailUrl: "",
  displayOnMap: true,
  humanValidated: true,
};

describe("getCommunityDraft", () => {
  it("siembra una fila con identidad por sede, con sus coordenadas", () => {
    const draft = getCommunityDraft({
      ...baseCommunity,
      locations: [
        { name: "Barcelona", latLon: { lat: 41.38, lon: 2.17 } },
        { name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } },
      ],
    }, null);
    expect(draft.locations.map(({ name, latLon }) => ({ name, latLon }))).toEqual([
      { name: "Barcelona", latLon: { lat: 41.38, lon: 2.17 } },
      { name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } },
    ]);
    const ids = draft.locations.map((row) => row._rowId);
    expect(new Set(ids).size).toBe(2);
    expect(draft).not.toHaveProperty("location");
    expect(draft).not.toHaveProperty("latLon");
  });

  it("una ficha sin sedes deja una fila vacía donde escribir", () => {
    const draft = getCommunityDraft({ ...baseCommunity, locations: [] }, null);
    expect(draft.locations).toHaveLength(1);
    expect(draft.locations[0].name).toBe("");
  });

  it("normaliza humanValidated a booleano", () => {
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: true }, null).humanValidated).toBe(true);
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: false }, null).humanValidated).toBe(false);
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: undefined }, null).humanValidated).toBe(false);
  });

  it("inicializa tags como array vacío si no existen", () => {
    const draft = getCommunityDraft({ ...baseCommunity, tags: undefined }, null);
    expect(draft.tags).toEqual([]);
  });

  it("preserva tags existentes", () => {
    const draft = getCommunityDraft(baseCommunity, null);
    expect(draft.tags).toEqual(["javascript"]);
  });

  it("preserva langs existentes", () => {
    const draft = getCommunityDraft(baseCommunity, null);
    expect(draft.langs).toEqual(["es", "en"]);
  });

  it("inicializa langs con español si faltan", () => {
    const draft = getCommunityDraft({ ...baseCommunity, langs: undefined }, null);
    expect(draft.langs).toEqual(["es"]);
  });

  it("devuelve draft vacío si no se pasa comunidad", () => {
    const draft = getCommunityDraft(null, 42);
    expect(draft.id).toBe(42);
    expect(draft.name).toBe("");
    expect(draft.langs).toEqual(["es"]);
  });
});

describe("buildCommunityPayload: sedes (issue #45)", () => {
  const rows = [
    { ...makeLocationRow({ name: " Barcelona " }), provinceId: "barcelona" },
    makeLocationRow({ name: "" }),
    { ...makeLocationRow({ name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } }), provinceId: "madrid" },
  ];
  const draftOf = (overrides = {}) => ({ ...getCommunityDraft(null), name: "X", locations: rows, ...overrides });

  it("emite las sedes sin filas vacías ni campos del borrador, y una provincia por sede", () => {
    const payload = buildCommunityPayload(draftOf());
    expect(payload.locations).toEqual([
      { name: "Barcelona", latLon: { lat: null, lon: null } },
      { name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } },
    ]);
    expect(payload.provinceIds).toEqual(["barcelona", "madrid"]);
    expect(payload.displayOnMap).toBe(true);
    expect(payload).not.toHaveProperty("location");
    expect(payload).not.toHaveProperty("latLon");
  });

  it("paraguas y online emiten [] y no van al mapa (antes \"n/a\" y \"\")", () => {
    for (const overrides of [{ communityType: "umbrella-org" }, { eventFormat: "online" }]) {
      const payload = buildCommunityPayload(draftOf(overrides));
      expect(payload.locations).toEqual([]);
      expect(payload.provinceIds).toEqual([]);
      expect(payload.displayOnMap).toBe(false);
    }
  });

  it("\"Itinerante\" se guarda pero no pone la comunidad en el mapa", () => {
    const payload = buildCommunityPayload(draftOf({ locations: [makeLocationRow({ name: "Itinerante" })] }));
    expect(payload.locations).toEqual([{ name: "Itinerante", latLon: { lat: null, lon: null } }]);
    expect(payload.displayOnMap).toBe(false);
  });

  it("una edición que añade una sede a una ficha fuera del mapa la mete en el mapa", () => {
    const existing = { ...baseCommunity, displayOnMap: false };
    const draft = getCommunityDraft(existing);
    draft.locations = [...draft.locations, makeLocationRow({ name: "Toledo" })];
    expect(buildCommunityPayload(draft, existing).displayOnMap).toBe(true);
    expect(buildCommunityPayload(getCommunityDraft(existing), existing).displayOnMap).toBe(false);
  });
});

describe("buildCommunityPayload: formatos sin campo de sedes (code review)", () => {
  const existing = {
    ...baseCommunity,
    eventFormat: "unknown",
    locations: [{ name: "Madrid", latLon: { lat: 40.4, lon: -3.7 } }],
    displayOnMap: true,
  };

  it("una edición que no cambia el formato conserva sedes, coordenadas y pin", () => {
    const draft = { ...getCommunityDraft(existing), communityUrl: "https://nueva.example" };
    const payload = buildCommunityPayload(draft, existing);
    expect(payload.locations).toEqual(existing.locations);
    expect(payload.displayOnMap).toBe(true);
  });

  it("si la edición pasa la ficha a online, las sedes sí se vacían", () => {
    const presencial = { ...existing, eventFormat: "in-person" };
    const draft = { ...getCommunityDraft(presencial), eventFormat: "online" };
    expect(buildCommunityPayload(draft, presencial).locations).toEqual([]);
  });
});

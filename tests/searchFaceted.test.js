import { describe, expect, it } from "vitest";
import { searchFaceted } from "../src/data/searchFaceted.js";
import { buildInverseIndex } from "../src/data/invertedindex.js";

const makeCommunity = (overrides) => ({
  id: overrides.id,
  status: "active",
  tags: [],
  targetAudience: [],
  matchesAllTags: false,
  matchesAllAudience: false,
  ...overrides,
});

const data = [
  makeCommunity({ id: 1, tags: ["javascript", "react"], targetAudience: ["developers"] }),
  makeCommunity({ id: 2, tags: ["python"], targetAudience: ["students"] }),
  makeCommunity({ id: 3, tags: [], matchesAllTags: true }),
  makeCommunity({ id: 4, tags: [], matchesAllTags: true, status: "inactive" }),
  makeCommunity({ id: 5, targetAudience: [], matchesAllAudience: true }),
  makeCommunity({ id: 6, targetAudience: [], matchesAllAudience: true, status: "inactive" }),
];

const index = buildInverseIndex(data);

describe("searchFaceted — matchesAllTags", () => {
  it("la comunidad generalista aparece al filtrar por cualquier tag", () => {
    const result = searchFaceted(data, index, { tags: ["javascript"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(1); // tiene el tag
    expect(ids).toContain(3); // matchesAllTags
    expect(ids).not.toContain(2); // no tiene el tag y no es generalista
  });

  it("la comunidad generalista aparece al filtrar por un tag que no existe aún en el índice", () => {
    const result = searchFaceted(data, index, { tags: ["rust"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(3);
    expect(ids).not.toContain(1);
    expect(ids).not.toContain(2);
  });

  it("los filtros distintos de tags siguen aplicándose sobre comunidades generalistas", () => {
    const result = searchFaceted(data, index, {
      tags: ["javascript"],
      status: ["active"],
    });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(3);    // activa + generalista → aparece
    expect(ids).not.toContain(4); // generalista pero inactiva → no aparece
  });

  it("sin filtros de tags, el comportamiento no cambia", () => {
    const result = searchFaceted(data, index, { status: ["active"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(ids).not.toContain(4);
  });
});

describe("searchFaceted — matchesAllAudience", () => {
  it("la comunidad abierta aparece al filtrar por cualquier perfil de audiencia", () => {
    const result = searchFaceted(data, index, { targetAudience: ["developers"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(1); // tiene el perfil
    expect(ids).toContain(5); // matchesAllAudience
    expect(ids).not.toContain(2); // perfil distinto, no es abierta
  });

  it("la comunidad abierta aparece al filtrar por un perfil que no existe aún en el índice", () => {
    const result = searchFaceted(data, index, { targetAudience: ["designers"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(5);
    expect(ids).not.toContain(1);
    expect(ids).not.toContain(2);
  });

  it("los filtros distintos de targetAudience siguen aplicándose sobre comunidades abiertas", () => {
    const result = searchFaceted(data, index, {
      targetAudience: ["developers"],
      status: ["active"],
    });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(5);    // activa + abierta → aparece
    expect(ids).not.toContain(6); // abierta pero inactiva → no aparece
  });

  it("sin filtros de targetAudience, el comportamiento no cambia", () => {
    const result = searchFaceted(data, index, { status: ["active"] });
    const ids = result.map((c) => c.id);
    expect(ids).toContain(5);
    expect(ids).not.toContain(6);
  });
});

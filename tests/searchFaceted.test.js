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

describe('públicos y temáticas con modos independientes', () => {
  const communities = [
    makeCommunity({ id: 1, tags: ['python', 'react'], targetAudience: ['students', 'junior'] }),
    makeCommunity({ id: 2, tags: ['python'], targetAudience: ['students'] }),
    makeCommunity({ id: 3, tags: ['python'], matchesAllAudience: true }),
    makeCommunity({ id: 4, matchesAllTags: true, targetAudience: ['students', 'junior'] }),
    makeCommunity({ id: 5, matchesAllTags: true, matchesAllAudience: true }),
    makeCommunity({ id: 6, tags: ['python'] }),
    makeCommunity({ id: 7, status: 'inactive', tags: ['python', 'react'], targetAudience: ['students', 'junior'] }),
  ];
  const combinedIndex = buildInverseIndex(communities);

  it('Todos exige cada público y Cualquiera sigue siendo OR, respetando la temática', () => {
    const filters = { status: ['active'], tags: ['python'], targetAudience: ['students', 'junior'] };
    expect(searchFaceted(communities, combinedIndex, filters).map(c => c.id)).toEqual([1, 2, 3, 4, 5]);
    expect(searchFaceted(communities, combinedIndex, { ...filters, audienceMatch: ['all'] }).map(c => c.id)).toEqual([1, 3, 4, 5]);
  });

  it('cruza las dos facetas y solo aplica los indicadores declarados de cobertura completa', () => {
    const filters = { status: ['active'], tags: ['python', 'react'], tagMatch: ['all'], targetAudience: ['students', 'junior'], audienceMatch: ['all'] };
    expect(searchFaceted(communities, combinedIndex, filters).map(c => c.id)).toEqual([1, 4, 5]);
    expect(searchFaceted(communities, combinedIndex, { status: ['active'], tags: ['python'], targetAudience: ['missing'], audienceMatch: ['all'] }).map(c => c.id)).toEqual([3, 5]);
  });

  it('no muta el índice ni trata el modo como una faceta independiente', () => {
    const initial = [...combinedIndex.targetAudience.students];
    searchFaceted(communities, combinedIndex, { targetAudience: ['students'], audienceMatch: ['all'] });
    expect([...combinedIndex.targetAudience.students]).toEqual(initial);
    expect(searchFaceted(communities, combinedIndex, { audienceMatch: ['all'] })).toEqual(communities);
  });
});

describe("búsqueda por nombre", () => {
  const communities = [
    makeCommunity({ id: 1, name: "GDG Almería", tags: ["python"] }),
    makeCommunity({ id: 2, name: "GDG Alicante", tags: ["python"] }),
    makeCommunity({ id: 3, name: "GDG Almería Cloud", status: "inactive", tags: ["python"] }),
    makeCommunity({ id: 4, name: "GDG Almería Web", tags: ["javascript"] }),
  ];
  const searchIndex = buildInverseIndex(communities);

  it("Intro no devuelve comunidades que solo coinciden con GDG y conserva las otras facetas", () => {
    const result = searchFaceted(communities, searchIndex, { status: ["active"], tags: ["python"], nameQuery: ["almeria gdg"] });
    expect(result.map((community) => community.id)).toEqual([1]);
  });

  it("una consulta sin coincidencias devuelve cero, sin ampliar a resultados parciales", () => {
    expect(searchFaceted(communities, searchIndex, { nameQuery: ["gdg inexistente"] })).toEqual([]);
  });

  it("no confunde dos propuestas con ID nulo al buscar por nombre", () => {
    const proposals = communities.slice(0, 2).map((community) => ({ ...community, id: null }));
    const results = searchFaceted(proposals, buildInverseIndex(proposals), { status: ["active"], nameQuery: ["almeria"] });
    expect(results.map((community) => community.name)).toEqual(["GDG Almería"]);
  });
});

describe("searchFaceted — matchesAllTags", () => {
  it('Todas exige cada etiqueta y sigue incluyendo generalistas, con las otras facetas', () => {
    expect(searchFaceted(data, index, { status: ['active'], tags: ['javascript', 'react'], tagMatch: ['all'] }).map(c => c.id)).toEqual([1, 3]);
    expect(searchFaceted(data, index, { status: ['active'], tags: ['javascript', 'python'], tagMatch: ['all'] }).map(c => c.id)).toEqual([3]);
    expect(searchFaceted(data, index, { status: ['active'], tags: ['javascript', 'rust'], tagMatch: ['all'] }).map(c => c.id)).toEqual([3]);
  });

  it('Cualquiera conserva OR; una ficha vacía no se convierte en generalista', () => {
    const any = searchFaceted(data, index, { status: ['active'], tags: ['javascript', 'python'] }).map(c => c.id);
    expect(any).toEqual([1, 2, 3]);
    expect(any).not.toContain(5);
    const all = searchFaceted(data, index, { status: ['active'], tags: ['javascript', 'python'], tagMatch: ['all'] }).map(c => c.id);
    expect(all).not.toContain(5);
  });

  it('el modo no actúa como una faceta ni filtra si no se eligen etiquetas', () => {
    expect(searchFaceted(data, index, { status: ['active'], tagMatch: ['all'] })).toEqual(searchFaceted(data, index, { status: ['active'] }));
    expect(searchFaceted(data, index, { tagMatch: ['all'] })).toEqual(data);
  });

  it('no añade generalistas al índice original cuando Todas contiene una sola temática', () => {
    const cleanIndex = buildInverseIndex(data);
    const initial = [...cleanIndex.tags.javascript];
    searchFaceted(data, cleanIndex, { tags: ['javascript'], tagMatch: ['all'] });
    expect([...cleanIndex.tags.javascript]).toEqual(initial);
  });
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

import { describe, expect, it } from "vitest";
import { buildCoverage, percentage } from "../src/lib/dataCoverage.js";
import { buildLlmsIndex } from "../scripts/generate-llm-artifacts.js";

const community = (overrides = {}) => ({
  id: 1,
  name: "Comunidad",
  status: "active",
  humanValidated: false,
  tags: [],
  targetAudience: [],
  urls: {},
  ...overrides,
});

describe("buildCoverage", () => {
  it("cuenta las fichas revisadas sobre el total y por estado", () => {
    const coverage = buildCoverage([
      community({ id: 1, humanValidated: true }),
      community({ id: 2 }),
      community({ id: 3, status: "inactive", humanValidated: true }),
      community({ id: 4, status: "unknown" }),
    ]);

    expect(coverage.total).toBe(4);
    expect(coverage.reviewed).toBe(2);
    expect(coverage.byStatus.active).toEqual({ total: 2, reviewed: 1 });
    expect(coverage.byStatus.inactive).toEqual({ total: 1, reviewed: 1 });
    expect(coverage.byStatus.unknown).toEqual({ total: 1, reviewed: 0 });
  });

  it("mide la cobertura de campos solo sobre las activas", () => {
    const coverage = buildCoverage([
      community({ id: 1, tags: ["python"], geographicScope: "national" }),
      community({ id: 2, status: "inactive", tags: ["go"], geographicScope: "local" }),
    ]);

    expect(coverage.active.total).toBe(1);
    expect(coverage.active.withTags).toBe(1);
    expect(coverage.active.withScope).toBe(1);
  });

  it("cuenta como cubierta la comunidad generalista, que trae el array vacío a propósito", () => {
    const coverage = buildCoverage([
      community({ id: 1, matchesAllTags: true }),
      community({ id: 2, matchesAllAudience: true }),
    ]);

    expect(coverage.active.withTags).toBe(1);
    expect(coverage.active.withAudience).toBe(1);
  });

  it("no cuenta geographicScope: unknown como dato", () => {
    const coverage = buildCoverage([community({ geographicScope: "unknown" })]);

    expect(coverage.active.withScope).toBe(0);
  });

  it("redondea el porcentaje hacia abajo y aguanta el dataset vacío", () => {
    expect(percentage(89, 657)).toBe(13);
    expect(percentage(0, 0)).toBe(0);
    expect(buildCoverage([]).total).toBe(0);
    expect(buildCoverage().reviewedPercent).toBe(0);
  });
});

describe("llms.txt y la web cuentan lo mismo", () => {
  /**
   * El riesgo real de esta superficie no es equivocarse en un número: es que la barra de
   * progreso de la web y el índice que leen los modelos digan cifras distintas.
   */
  it("el índice emite los recuentos que calcula buildCoverage", () => {
    const communities = [
      community({ id: 1, humanValidated: true, tags: ["python"] }),
      community({ id: 2 }),
      community({ id: 3, status: "inactive", humanValidated: true }),
    ];
    const coverage = buildCoverage(communities);
    const index = buildLlmsIndex(communities, { tags: [], audience: [], deleted: [] });

    expect(index).toContain(
      `Only ${coverage.active.reviewed} of the active communities have been reviewed by a person, and ${coverage.reviewed} of all ${coverage.total} records.`
    );
    expect(index).toContain(`${coverage.active.withTags} have \`tags\``);
  });
});

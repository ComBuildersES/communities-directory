import { describe, expect, it } from "vitest";
import {
  buildMergedFromMap,
  findMergeTarget,
  isMergedCommunity,
  validateMergedReferences,
} from "../src/lib/mergedCommunities.js";

const murciaTech = { id: 631, name: "MurciaTech", status: "active" };
const makers = { id: 336, name: "Makers of Murcia", status: "merged", mergedIntoId: 631 };
const gamedev = { id: 657, name: "GameDev Murcia", status: "merged", mergedIntoId: 631 };
const murciaDev = { id: 359, name: "murcia dev", status: "merged", mergedIntoId: 631 };
const murcia = [murciaTech, makers, gamedev, murciaDev];

describe("isMergedCommunity", () => {
  it("solo es true con status merged", () => {
    expect(isMergedCommunity(makers)).toBe(true);
    expect(isMergedCommunity(murciaTech)).toBe(false);
    expect(isMergedCommunity({ status: "inactive" })).toBe(false);
    expect(isMergedCommunity(undefined)).toBe(false);
  });
});

describe("findMergeTarget", () => {
  it("resuelve la comunidad en la que continúa", () => {
    expect(findMergeTarget(makers, murcia)).toBe(murciaTech);
  });

  it("devuelve null si la comunidad no está fusionada", () => {
    expect(findMergeTarget(murciaTech, murcia)).toBeNull();
  });

  it("devuelve null si el destino no está en el listado", () => {
    expect(findMergeTarget(makers, [makers])).toBeNull();
  });
});

describe("buildMergedFromMap", () => {
  it("deriva la cara inversa de la fusión", () => {
    const map = buildMergedFromMap(murcia);

    expect(map.get(631)).toEqual([makers, gamedev, murciaDev]);
    expect(map.has(336)).toBe(false);
  });

  it("ignora fusionadas sin destino", () => {
    expect(buildMergedFromMap([{ id: 1, name: "X", status: "merged" }]).size).toBe(0);
  });
});

describe("validateMergedReferences", () => {
  it("acepta el caso real de Murcia", () => {
    expect(validateMergedReferences(murcia)).toEqual([]);
  });

  it("rechaza status merged sin mergedIntoId", () => {
    const errors = validateMergedReferences([{ id: 1, name: "X", status: "merged" }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/exige mergedIntoId/);
  });

  it("rechaza un destino inexistente", () => {
    const errors = validateMergedReferences([{ id: 1, name: "X", status: "merged", mergedIntoId: 999 }]);
    expect(errors[0]).toMatch(/no corresponde a ninguna comunidad/);
  });

  it("rechaza la autorreferencia", () => {
    const errors = validateMergedReferences([{ id: 1, name: "X", status: "merged", mergedIntoId: 1 }]);
    expect(errors[0]).toMatch(/propia comunidad/);
  });

  it("rechaza cadenas de fusiones", () => {
    const errors = validateMergedReferences([
      { id: 1, name: "A", status: "merged", mergedIntoId: 2 },
      { id: 2, name: "B", status: "merged", mergedIntoId: 3 },
      { id: 3, name: "C", status: "active" },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/también está fusionada/);
  });

  it("rechaza mergedIntoId en una comunidad que no está fusionada", () => {
    const errors = validateMergedReferences([
      { id: 1, name: "A", status: "active", mergedIntoId: 2 },
      { id: 2, name: "B", status: "active" },
    ]);

    expect(errors[0]).toMatch(/solo tiene sentido con status/);
  });
});

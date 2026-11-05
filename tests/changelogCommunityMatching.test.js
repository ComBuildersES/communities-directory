import { describe, expect, it } from "vitest";

import { getChangedCommunities } from "../scripts/generate-changelog.js";

// Regresión: el id se asigna después del merge, así que en el commit del alta la comunidad
// todavía tiene `id: null` y solo el slug la identifica. Pero una edición puede renombrarla,
// y entonces solo el id la sigue identificando. Hacen falta las dos claves.
describe("getChangedCommunities", () => {
  it("detecta un alta cuando la comunidad aún no tiene id", () => {
    const before = [{ id: 1, name: "Una" }];
    const after = [{ id: 1, name: "Una" }, { id: null, name: "Nueva" }];

    const { added, changed, removed } = getChangedCommunities(before, after);

    expect(added.map((c) => c.name)).toEqual(["Nueva"]);
    expect(changed).toEqual([]);
    expect(removed).toEqual([]);
  });

  it("detecta una edición que renombra la comunidad como cambio, no como alta+baja", () => {
    const before = [{ id: 124, name: "Data Saturdays" }];
    const after = [{ id: 124, name: "Data Saturdays Global" }];

    const { added, changed, removed } = getChangedCommunities(before, after);

    expect(added).toEqual([]);
    expect(removed).toEqual([]);
    expect(changed.map((c) => c.name)).toEqual(["Data Saturdays Global"]);
  });

  it("detecta una baja", () => {
    const before = [{ id: 1, name: "Una" }, { id: 2, name: "Otra" }];
    const after = [{ id: 1, name: "Una" }];

    const { added, changed, removed } = getChangedCommunities(before, after);

    expect(removed.map((c) => c.id)).toEqual([2]);
    expect(added).toEqual([]);
    expect(changed).toEqual([]);
  });

  it("no marca cambio cuando solo difiere el orden de las claves", () => {
    const before = [{ id: 1, name: "Una", urls: { web: "https://a", twitter: "https://b" } }];
    const after = [{ urls: { twitter: "https://b", web: "https://a" }, name: "Una", id: 1 }];

    const { added, changed, removed } = getChangedCommunities(before, after);

    expect([added, changed, removed]).toEqual([[], [], []]);
  });
});

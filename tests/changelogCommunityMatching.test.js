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

import { describeCommunityChanges, isNoiseCommitSubject } from "../scripts/generate-changelog.js";

describe("describeCommunityChanges", () => {
  const noDeletions = { added: [], changed: [], removed: [] };

  it("da una línea por comunidad cuando un commit toca varias", () => {
    const labels = describeCommunityChanges({
      activeChanges: {
        added: [{ id: 700, name: "Nueva" }],
        changed: [{ id: 1, name: "Una" }, { id: 2, name: "Otra" }],
        removed: [],
      },
      deletedChanges: noDeletions,
      prNumber: 42,
    });

    expect(labels).toHaveLength(3);
    expect(labels[0]).toContain("Añadida Nueva");
    expect(labels[1]).toContain("Actualizada Una");
    expect(labels[2]).toContain("Actualizada Otra");
    labels.forEach((label) => expect(label).toContain("PR #42"));
  });

  it("enlaza cada comunidad a su ficha del directorio", () => {
    const [label] = describeCommunityChanges({
      activeChanges: { added: [], changed: [{ id: 94, name: "Codemotion" }], removed: [] },
      deletedChanges: noDeletions,
    });

    expect(label).toContain("https://directory.communitybuilders.dev/?community=94");
  });

  it("solo llama baja a lo que queda registrado como baja", () => {
    const activeChanges = { added: [], changed: [], removed: [{ id: 5, name: "Se fue" }] };

    // Sin registro en deleted-communities: desapareció por otro motivo, no es una baja.
    expect(describeCommunityChanges({ activeChanges, deletedChanges: noDeletions })).toEqual([]);

    const conRegistro = describeCommunityChanges({
      activeChanges,
      deletedChanges: { added: [{ id: 5 }], changed: [], removed: [] },
    });
    expect(conRegistro[0]).toContain("Eliminada Se fue");
  });

  it("no inventa entradas cuando no cambió nada", () => {
    expect(describeCommunityChanges({ activeChanges: noDeletions, deletedChanges: noDeletions })).toEqual([]);
  });
});

describe("isNoiseCommitSubject", () => {
  it("descarta el mantenimiento del propio changelog y de los ficheros de bots", () => {
    expect(isNoiseCommitSubject("docs: update changelog [skip ci]")).toBe(true);
    expect(isNoiseCommitSubject("update changelog [skip ci]")).toBe(true);
    expect(isNoiseCommitSubject("docs: update README.md [skip ci]")).toBe(true);
    expect(isNoiseCommitSubject("update .all-contributorsrc [skip ci]")).toBe(true);
    expect(isNoiseCommitSubject("chore(data): asignar IDs de comunidad (1 nueva) [skip ci]")).toBe(true);
  });

  it("no descarta cambios reales que hablen del changelog", () => {
    expect(isNoiseCommitSubject("feat(changelog): agrupar por comunidad")).toBe(false);
    expect(isNoiseCommitSubject("docs: explicar cómo se genera el changelog")).toBe(false);
    expect(isNoiseCommitSubject("fix: no romper el README al generarlo")).toBe(false);
  });
});

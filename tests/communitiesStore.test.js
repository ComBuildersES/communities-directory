import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  assignMissingIds,
  communityFileSlug,
  compileBundle,
  compileDeletedBundle,
  readCommunities,
  readDeletedCommunities,
  removeCommunity,
  slugifyCommunityName,
  stableStringify,
  writeCommunities,
  writeCommunity,
  writeDeletedCommunities,
  writeDeletedCommunity,
} from "../scripts/lib/communities-store.js";
import { slugifyCommunityName as slugifyInApp } from "../src/lib/communitySubmission.js";

// El store resuelve rutas relativas al cwd, así que cada test corre en un directorio aislado.
let tmpDir;
let previousCwd;

function makeCommunity(overrides = {}) {
  return {
    id: 1,
    name: "Comunidad Uno",
    status: "active",
    lastReviewed: "01/01/2026",
    communityType: "tech-meetup",
    eventFormat: "in-person",
    location: "Madrid",
    tags: [],
    targetAudience: [],
    contactInfo: "",
    communityUrl: "https://example.org/uno",
    urls: {},
    thumbnailUrl: "",
    latLon: { lat: null, lon: null },
    displayOnMap: true,
    humanValidated: true,
    ...overrides,
  };
}

beforeEach(() => {
  previousCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "communities-store-"));
  fs.mkdirSync(path.join(tmpDir, "public", "data"), { recursive: true });
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(previousCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("slugifyCommunityName", () => {
  it("coincide con la implementación del frontend", () => {
    // Los deep links por slug dependen de que ambas funciones produzcan lo mismo.
    const names = [
      "Geoinquietos Almería",
      "WordPress Sevilla para Desarrolladores",
      "Café & Código",
      "  espacios  raros  ",
      "Ñandú Tech",
    ];

    for (const name of names) {
      expect(slugifyCommunityName(name)).toBe(slugifyInApp(name));
    }
  });
});

describe("communityFileSlug", () => {
  it("desambigua nombres que colapsan al mismo slug", () => {
    const taken = new Set(["python-madrid"]);
    expect(communityFileSlug({ name: "Python Madrid" }, { taken })).toBe("python-madrid-2");

    taken.add("python-madrid-2");
    expect(communityFileSlug({ name: "Python Madrid" }, { taken })).toBe("python-madrid-3");
  });

  it("recurre al id cuando el nombre no produce slug", () => {
    expect(communityFileSlug({ id: 42, name: "***" })).toBe("community-42");
  });
});

describe("writeCommunity / readCommunities", () => {
  it("escribe un fichero por comunidad y los relee ordenados por id", () => {
    writeCommunity(makeCommunity({ id: 2, name: "Segunda" }));
    writeCommunity(makeCommunity({ id: 1, name: "Primera" }));

    expect(fs.readdirSync("data/communities").sort()).toEqual(["primera.json", "segunda.json"]);
    expect(readCommunities().map((community) => community.id)).toEqual([1, 2]);
  });

  it("renombra el fichero cuando cambia el nombre, sin duplicar la comunidad", () => {
    writeCommunity(makeCommunity({ id: 7, name: "Nombre Viejo" }));
    writeCommunity(makeCommunity({ id: 7, name: "Nombre Nuevo" }));

    expect(fs.readdirSync("data/communities")).toEqual(["nombre-nuevo.json"]);
    expect(readCommunities()).toHaveLength(1);
  });
});

describe("writeCommunities", () => {
  it("elimina los ficheros de las comunidades que ya no están en la lista", () => {
    writeCommunities([
      makeCommunity({ id: 1, name: "Una" }),
      makeCommunity({ id: 2, name: "Otra" }),
    ]);

    writeCommunities([makeCommunity({ id: 1, name: "Una" })]);

    expect(fs.readdirSync("data/communities")).toEqual(["una.json"]);
  });
});

describe("removeCommunity", () => {
  it("borra el fichero fuente de la comunidad indicada", () => {
    writeCommunities([
      makeCommunity({ id: 1, name: "Una" }),
      makeCommunity({ id: 2, name: "Otra" }),
    ]);

    expect(removeCommunity(2)).toBe("otra");
    expect(readCommunities().map((community) => community.id)).toEqual([1]);
  });
});

describe("compileBundle", () => {
  it("no publica comunidades sin id asignado", () => {
    writeCommunities([
      makeCommunity({ id: 1, name: "Publicada" }),
      makeCommunity({ id: null, name: "Pendiente" }),
    ]);

    const bundled = compileBundle();

    expect(bundled.map((community) => community.name)).toEqual(["Publicada"]);
    const onDisk = JSON.parse(fs.readFileSync("public/data/communities.json", "utf-8"));
    expect(onDisk).toHaveLength(1);
  });
});

describe("assignMissingIds", () => {
  it("asigna ids consecutivos por encima del máximo conocido", () => {
    writeCommunities([
      makeCommunity({ id: 10, name: "Existente" }),
      makeCommunity({ id: null, name: "Beta Nueva" }),
      makeCommunity({ id: null, name: "Alpha Nueva" }),
    ]);

    const { assigned, nextCommunityId } = assignMissingIds();

    // Orden por slug para que la asignación sea determinista.
    expect(assigned.map((entry) => entry.slug)).toEqual(["alpha-nueva", "beta-nueva"]);
    expect(assigned.map((entry) => entry.id)).toEqual([11, 12]);
    expect(nextCommunityId).toBe(13);
    expect(readCommunities().every((community) => Number.isInteger(community.id))).toBe(true);
  });

  it("no reutiliza ids de comunidades dadas de baja", () => {
    fs.writeFileSync(
      "public/data/deleted-communities.json",
      JSON.stringify([{ id: 99, name: "Dada de baja" }], null, 2),
    );
    writeCommunities([makeCommunity({ id: null, name: "Nueva" })]);

    const { assigned } = assignMissingIds();

    expect(assigned[0].id).toBe(100);
  });

  it("es idempotente", () => {
    writeCommunities([makeCommunity({ id: null, name: "Nueva" })]);

    assignMissingIds();
    const second = assignMissingIds();

    expect(second.assigned).toEqual([]);
  });

  it("con dryRun no toca los ficheros", () => {
    writeCommunities([makeCommunity({ id: null, name: "Nueva" })]);

    const { assigned } = assignMissingIds({ dryRun: true });

    expect(assigned).toHaveLength(1);
    expect(readCommunities()[0].id).toBeNull();
  });
});

describe("stableStringify", () => {
  it("ignora el orden de las claves", () => {
    // Sin esto, normalizar el orden de claves al escribir marcaría todas las comunidades
    // como modificadas en los comparadores de check-urls y validate-community-data.
    const a = { id: 1, name: "X", urls: { web: "https://a", twitter: "https://b" } };
    const b = { urls: { twitter: "https://b", web: "https://a" }, name: "X", id: 1 };

    expect(stableStringify(a)).toBe(stableStringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("distingue contenidos realmente distintos", () => {
    expect(stableStringify({ id: 1 })).not.toBe(stableStringify({ id: 2 }));
  });
});

describe("comunidades dadas de baja", () => {
  function makeDeleted(overrides = {}) {
    return {
      id: 5,
      name: "Cerrada",
      communityUrl: "https://example.org/cerrada",
      deletedAt: "01/01/2026",
      removalReason: "duplicada",
      deletedFromIssue: 42,
      ...overrides,
    };
  }

  it("escribe un fichero por baja", () => {
    writeDeletedCommunity(makeDeleted({ id: 5, name: "Cerrada Una" }));
    writeDeletedCommunity(makeDeleted({ id: 6, name: "Cerrada Otra" }));

    expect(fs.readdirSync("data/deleted-communities").sort()).toEqual([
      "cerrada-otra.json",
      "cerrada-una.json",
    ]);
    expect(readDeletedCommunities().map((entry) => entry.id)).toEqual([5, 6]);
  });

  it("no sobrescribe una baja previa con el mismo nombre", () => {
    // Dos comunidades distintas pueden haberse llamado igual en momentos distintos.
    writeDeletedCommunity(makeDeleted({ id: 5, name: "Mismo Nombre" }));
    writeDeletedCommunity(makeDeleted({ id: 9, name: "Mismo Nombre" }));

    expect(fs.readdirSync("data/deleted-communities").sort()).toEqual([
      "mismo-nombre-2.json",
      "mismo-nombre.json",
    ]);
    expect(readDeletedCommunities().map((entry) => entry.id)).toEqual([5, 9]);
  });

  it("compila el bundle de bajas", () => {
    writeDeletedCommunities([makeDeleted()]);

    compileDeletedBundle();

    const onDisk = JSON.parse(fs.readFileSync("public/data/deleted-communities.json", "utf-8"));
    expect(onDisk).toHaveLength(1);
    expect(onDisk[0].id).toBe(5);
  });

  it("evita reutilizar el id de una baja al asignar nuevos ids", () => {
    writeDeletedCommunity(makeDeleted({ id: 77, name: "Cerrada" }));
    writeCommunities([makeCommunity({ id: null, name: "Nueva" })]);

    const { assigned } = assignMissingIds();

    expect(assigned[0].id).toBe(78);
  });
});

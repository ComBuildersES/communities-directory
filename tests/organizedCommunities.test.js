import { describe, expect, it } from "vitest";
import {
  buildOrganizedByMap,
  findOrganizers,
  hasOrganizers,
  normalizeOrganizedBy,
  validateOrganizedByReferences,
} from "../src/lib/organizedCommunities.js";
import {
  buildCommunityPayload,
  getCommunityDraft,
  getEmptyCommunityDraft,
} from "../src/lib/communitySubmission.js";
import { dropEmptyArchivedUrls, normalizePayload } from "../scripts/process-community-issue.js";

const baseDraft = {
  ...getEmptyCommunityDraft(1),
  name: "Biznaga Fest",
  location: "Málaga",
  communityUrl: "https://biznaga.fest",
};

const gdgSpain = { id: 10, name: "GDG Spain", status: "active", communityType: "umbrella-org" };
const gdgMalaga = { id: 11, name: "GDG Málaga", status: "active", parentId: 10 };
const geekscat = { id: 20, name: "GeeksCAT", status: "active" };
const biznaga = {
  id: 12,
  name: "Biznaga Fest",
  status: "active",
  communityType: "conference",
  organizedBy: [11],
};
const geekscatConf = {
  id: 21,
  name: "GeeksCAT Conf",
  status: "active",
  communityType: "conference",
  organizedBy: [20],
};
// CommitConf no tiene comunidad detrás que mantenga canales activos: por eso `organizedBy`
// es opcional y nadie tiene que decidir qué va antes, el huevo o la gallina.
const commitConf = { id: 30, name: "CommitConf", status: "active", communityType: "conference" };
const directory = [gdgSpain, gdgMalaga, geekscat, biznaga, geekscatConf, commitConf];

describe("normalizeOrganizedBy", () => {
  it("descarta valores no enteros, duplicados y la propia comunidad", () => {
    expect(normalizeOrganizedBy([11, 11, null, "20", "x", 12], { selfId: 12 })).toEqual([11, 20]);
  });

  it("devuelve lista vacía si no hay array", () => {
    expect(normalizeOrganizedBy(undefined)).toEqual([]);
    expect(normalizeOrganizedBy(null)).toEqual([]);
    expect(normalizeOrganizedBy(11)).toEqual([]);
  });
});

describe("hasOrganizers", () => {
  it("distingue una ficha vinculada de una sin vínculo", () => {
    expect(hasOrganizers(biznaga)).toBe(true);
    expect(hasOrganizers(commitConf)).toBe(false);
    expect(hasOrganizers({ organizedBy: [] })).toBe(false);
    expect(hasOrganizers(undefined)).toBe(false);
  });
});

describe("findOrganizers", () => {
  it("resuelve las comunidades organizadoras", () => {
    expect(findOrganizers(biznaga, directory)).toEqual([gdgMalaga]);
  });

  it("admite varias organizadoras y conserva el orden declarado", () => {
    const hackathon = { id: 40, name: "Hackathon conjunto", organizedBy: [20, 11] };
    expect(findOrganizers(hackathon, directory)).toEqual([geekscat, gdgMalaga]);
  });

  it("descarta ids que no están en el listado en vez de inventar una ficha", () => {
    expect(findOrganizers({ id: 40, organizedBy: [999] }, directory)).toEqual([]);
  });

  it("devuelve lista vacía cuando la ficha no declara autoría", () => {
    expect(findOrganizers(commitConf, directory)).toEqual([]);
  });

  it("resuelve una organizadora que ya no está activa: el vínculo se pinta igual", () => {
    const dormida = { id: 50, name: "Asociación dormida", status: "inactive" };
    const conf = { id: 51, name: "Su conferencia", status: "active", organizedBy: [50] };
    expect(findOrganizers(conf, [dormida, conf])).toEqual([dormida]);
  });
});

describe("buildOrganizedByMap", () => {
  it("deriva la cara inversa de la autoría", () => {
    const map = buildOrganizedByMap(directory);

    expect(map.get(11)).toEqual([biznaga]);
    expect(map.get(20)).toEqual([geekscatConf]);
    expect(map.has(30)).toBe(false);
  });

  it("agrupa varios encuentros bajo la misma organizadora", () => {
    const hackathon = { id: 41, name: "Hack Night", organizedBy: [20] };
    const map = buildOrganizedByMap([...directory, hackathon]);

    expect(map.get(20)).toEqual([geekscatConf, hackathon]);
  });
});

describe("validateOrganizedByReferences", () => {
  it("acepta el directorio coherente", () => {
    expect(validateOrganizedByReferences(directory)).toEqual([]);
  });

  it("acepta la cadena paraguas -> comunidad -> encuentro", () => {
    // GDG Spain es paraguas de GDG Málaga (parentId) y GDG Málaga organiza el Biznaga Fest:
    // son dos relaciones distintas y cada salto lleva a una ficha viva.
    expect(validateOrganizedByReferences([gdgSpain, gdgMalaga, biznaga])).toEqual([]);
  });

  it("rechaza una organizadora que no está en el directorio", () => {
    const [error] = validateOrganizedByReferences([
      { id: 60, name: "Conf huérfana", organizedBy: [999] },
    ]);

    expect(error).toContain("999");
    expect(error).toContain("Conf huérfana");
  });

  it("rechaza apuntar a la propia comunidad", () => {
    const errors = validateOrganizedByReferences([{ id: 61, name: "Autoconf", organizedBy: [61] }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("la propia comunidad");
  });

  it("rechaza ids repetidos", () => {
    const errors = validateOrganizedByReferences([
      geekscat,
      { id: 62, name: "Repe", organizedBy: [20, 20] },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("repite el id 20");
  });

  it("rechaza un valor que no es un id entero", () => {
    const errors = validateOrganizedByReferences([{ id: 63, name: "Texto", organizedBy: ["GDG Málaga"] }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("ids enteros");
  });

  it("rechaza organizedBy que no es un array", () => {
    const errors = validateOrganizedByReferences([{ id: 64, name: "Mal tipo", organizedBy: 20 }]);
    expect(errors).toEqual(["Mal tipo: organizedBy debe ser un array de ids de comunidades."]);
  });

  it("rechaza autoría recíproca, y la reporta una sola vez", () => {
    const errors = validateOrganizedByReferences([
      { id: 70, name: "A", organizedBy: [71] },
      { id: 71, name: "B", organizedBy: [70] },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("la una de la otra");
  });
});

describe("buildCommunityPayload con organizedBy", () => {
  it("omite la clave cuando el encuentro no lo organiza nadie del directorio", () => {
    const payload = buildCommunityPayload({ ...baseDraft, name: "CommitConf", organizedBy: [] });

    expect("organizedBy" in payload).toBe(false);
  });

  it("normaliza la selección y descarta la propia comunidad", () => {
    const payload = buildCommunityPayload({ ...baseDraft, id: 12, organizedBy: [11, 11, 12, "20"] });

    expect(payload.organizedBy).toEqual([11, 20]);
  });

  it("deja viajar el array vacío si la ficha tenía organizadoras: es lo que dice que se quitaron todas", () => {
    const payload = buildCommunityPayload(
      { ...baseDraft, id: 12, organizedBy: [] },
      { id: 12, name: "Biznaga Fest", organizedBy: [11] }
    );

    expect(payload.organizedBy).toEqual([]);
  });
});

describe("getCommunityDraft con organizedBy", () => {
  it("siembra el borrador con las organizadoras publicadas", () => {
    const draft = getCommunityDraft({ id: 12, name: "Biznaga Fest", organizedBy: [11] });
    expect(draft.organizedBy).toEqual([11]);
  });

  it("una ficha sin la clave arranca con lista vacía", () => {
    expect(getCommunityDraft({ id: 30, name: "CommitConf" }).organizedBy).toEqual([]);
  });
});

describe("normalizePayload con organizedBy", () => {
  const payloadBase = {
    name: "Biznaga Fest",
    status: "active",
    communityType: "conference",
    eventFormat: "in-person",
    location: "Málaga",
    langs: ["es"],
    tags: [],
    targetAudience: [],
    urls: {},
    latLon: { lat: null, lon: null },
  };

  it("conserva las organizadoras de la propuesta", () => {
    expect(normalizePayload({ ...payloadBase, id: 12, organizedBy: [11] }).organizedBy).toEqual([11]);
  });

  it("no añade la clave si la propuesta no la trae", () => {
    expect("organizedBy" in normalizePayload(payloadBase)).toBe(false);
  });

  it("descarta basura y la propia comunidad", () => {
    expect(
      normalizePayload({ ...payloadBase, id: 12, organizedBy: [11, 12, null, "x"] }).organizedBy
    ).toEqual([11]);
  });

  it("dropEmptyArchivedUrls no escribe organizedBy: [] en el fichero", () => {
    const written = dropEmptyArchivedUrls(normalizePayload({ ...payloadBase, organizedBy: [] }));
    expect("organizedBy" in written).toBe(false);
  });
});

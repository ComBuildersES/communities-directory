import { describe, it, expect } from "vitest";
import {
  buildCommunityPayload,
  findArchivedUrlMatches,
  getCommunityDraft,
  getEmptyCommunityDraft,
  inferUrlPlatformKey,
  normalizeArchivedUrls,
} from "../src/lib/communitySubmission.js";
import { dropEmptyArchivedUrls, normalizePayload } from "../scripts/process-community-issue.js";

const baseDraft = {
  ...getEmptyCommunityDraft(1),
  name: "Comunidad Test",
  location: "Madrid",
  communityUrl: "https://example.com",
};

describe("normalizeArchivedUrls", () => {
  it("limpia, deduplica y descarta valores vacíos", () => {
    expect(
      normalizeArchivedUrls([
        " https://twitter.com/zombie ",
        "https://twitter.com/zombie/",
        "",
        null,
        "https://t.me/zombie",
      ])
    ).toEqual(["https://twitter.com/zombie", "https://t.me/zombie"]);
  });

  it("devuelve [] cuando el valor no es un array", () => {
    expect(normalizeArchivedUrls(undefined)).toEqual([]);
    expect(normalizeArchivedUrls("https://example.com")).toEqual([]);
  });
});

describe("buildCommunityPayload con canales archivados", () => {
  it("omite la clave cuando no hay nada archivado ni lo hubo", () => {
    const payload = buildCommunityPayload(baseDraft);
    expect("archivedUrls" in payload).toBe(false);
  });

  it("incluye los canales archivados del borrador", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      archivedUrls: ["https://twitter.com/zombie", "https://twitter.com/zombie"],
    });
    expect(payload.archivedUrls).toEqual(["https://twitter.com/zombie"]);
  });

  it("desarchiva una URL que vuelve a estar activa", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: { twitter: "https://twitter.com/zombie" },
      archivedUrls: ["https://twitter.com/zombie/", "https://t.me/zombie"],
    });
    expect(payload.archivedUrls).toEqual(["https://t.me/zombie"]);
  });

  it("envía un array vacío cuando la comunidad tenía canales archivados y se han quitado todos", () => {
    const payload = buildCommunityPayload(
      { ...baseDraft, archivedUrls: [] },
      { id: 1, archivedUrls: ["https://twitter.com/zombie"] }
    );
    expect(payload.archivedUrls).toEqual([]);
  });
});

describe("getCommunityDraft", () => {
  it("normaliza los canales archivados de la comunidad existente", () => {
    const draft = getCommunityDraft({
      id: 1,
      name: "Test",
      archivedUrls: [" https://twitter.com/zombie ", "https://twitter.com/zombie"],
    });
    expect(draft.archivedUrls).toEqual(["https://twitter.com/zombie"]);
  });

  it("deja el borrador vacío con una lista vacía", () => {
    expect(getCommunityDraft(null).archivedUrls).toEqual([]);
  });
});

describe("findArchivedUrlMatches", () => {
  const communities = [
    { id: 1, name: "Con zombie", archivedUrls: ["https://twitter.com/zombie"] },
    { id: 2, name: "Sin archivados", urls: { twitter: "https://twitter.com/activa" } },
  ];

  it("detecta una URL archivada aunque difiera en www o barra final", () => {
    const matches = findArchivedUrlMatches({
      communities,
      urls: ["https://www.twitter.com/zombie/"],
    });
    expect(matches).toHaveLength(1);
    expect(matches[0].community.id).toBe(1);
    expect(matches[0].url).toBe("https://twitter.com/zombie");
  });

  it("no avisa de URLs activas ni de listas vacías", () => {
    expect(findArchivedUrlMatches({ communities, urls: ["https://twitter.com/activa"] })).toEqual([]);
    expect(findArchivedUrlMatches({ communities, urls: [] })).toEqual([]);
  });
});

describe("inferUrlPlatformKey", () => {
  it("reconoce las plataformas conocidas", () => {
    expect(inferUrlPlatformKey("https://twitter.com/foo")).toBe("twitter");
    expect(inferUrlPlatformKey("https://x.com/foo")).toBe("twitter");
    expect(inferUrlPlatformKey("https://t.me/foo")).toBe("telegram");
    expect(inferUrlPlatformKey("https://www.meetup.com/foo/")).toBe("eventsUrl");
  });

  it("cae a web con dominios propios y a null con valores inválidos", () => {
    expect(inferUrlPlatformKey("https://comunidad.dev")).toBe("web");
    expect(inferUrlPlatformKey("comunidad.dev")).toBe(null);
    expect(inferUrlPlatformKey("")).toBe(null);
  });
});

describe("normalizePayload (procesado del issue)", () => {
  const base = {
    name: "Test",
    communityUrl: "https://example.com",
    urls: { twitter: "https://twitter.com/activa" },
    langs: ["es"],
    tags: [],
    targetAudience: [],
    latLon: { lat: null, lon: null },
    displayOnMap: false,
  };

  it("omite la clave cuando la propuesta no la trae", () => {
    expect("archivedUrls" in normalizePayload(base)).toBe(false);
  });

  it("deduplica y descarta los canales que la propuesta publica como activos", () => {
    const result = normalizePayload({
      ...base,
      archivedUrls: [" https://t.me/zombie ", "https://t.me/zombie", "https://twitter.com/activa"],
    });
    expect(result.archivedUrls).toEqual(["https://t.me/zombie"]);
  });

  it("mantiene el array vacío para poder vaciar la lista en una edición", () => {
    expect(normalizePayload({ ...base, archivedUrls: [] }).archivedUrls).toEqual([]);
  });
});

describe("dropEmptyArchivedUrls", () => {
  it("quita la clave vacía antes de escribir la ficha", () => {
    expect(dropEmptyArchivedUrls({ id: 1, archivedUrls: [] })).toEqual({ id: 1 });
  });

  it("deja intactas las fichas con canales archivados o sin la clave", () => {
    expect(dropEmptyArchivedUrls({ id: 1, archivedUrls: ["https://t.me/zombie"] }))
      .toEqual({ id: 1, archivedUrls: ["https://t.me/zombie"] });
    expect(dropEmptyArchivedUrls({ id: 1 })).toEqual({ id: 1 });
  });
});

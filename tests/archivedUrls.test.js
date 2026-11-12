import { describe, it, expect } from "vitest";
import {
  buildCommunityPayload,
  findArchivedUrlMatches,
  getCommunityDraft,
  getEmptyCommunityDraft,
  normalizeArchivedUrls,
} from "../src/lib/communitySubmission.js";
import { toUrlEntries } from "../src/lib/communityUrls.js";
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

/**
 * El formulario edita `urls` como lista de filas (#478). Cada fila lleva un `_rowId` que es
 * identidad local de React —la URL cambia en cada pulsación, así que no sirve de clave— y que
 * **no puede acabar en el fichero de la comunidad**.
 */
describe("buildCommunityPayload con urls como filas", () => {
  it("no deja escapar el _rowId de la fila al payload", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: [
        { _rowId: "url-row-1", url: "https://t.me/comunidad" },
        { _rowId: "url-row-2", kind: "ote", url: "https://comunidad.dev/events/feed.json" },
      ],
    });

    expect(payload.urls).toEqual([
      { url: "https://t.me/comunidad" },
      { kind: "ote", url: "https://comunidad.dev/events/feed.json" },
    ]);
    expect(JSON.stringify(payload)).not.toContain("_rowId");
  });

  it("descarta las filas vacías: quien pulsa «+» y no escribe no añade un canal", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: [
        { _rowId: "url-row-1", url: "https://t.me/comunidad" },
        { _rowId: "url-row-2", url: "" },
        { _rowId: "url-row-3", url: "   " },
      ],
    });

    expect(payload.urls).toEqual([{ url: "https://t.me/comunidad" }]);
  });

  it("admite dos canales del mismo kind distinguidos por su etiqueta", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: [
        { _rowId: "url-row-1", url: "https://www.meetup.com/gdg-barcelona/" },
        { _rowId: "url-row-2", kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" },
      ],
    });

    expect(payload.urls).toEqual([
      { url: "https://www.meetup.com/gdg-barcelona/" },
      { kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" },
    ]);
  });

  it("sigue aceptando un borrador guardado antes del cambio, por clave", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: { telegram: "https://t.me/comunidad", blog: "https://comunidad.dev/blog" },
    });

    expect(payload.urls).toEqual([
      { url: "https://t.me/comunidad" },
      { kind: "blog", url: "https://comunidad.dev/blog" },
    ]);
  });

  it("recupera los urlExtras de un borrador de la fase intermedia", () => {
    // `urlExtras` fue el andamio de cuando el formulario aún no editaba pares: un borrador a
    // medias en localStorage no puede perder esos canales.
    const payload = buildCommunityPayload({
      ...baseDraft,
      urls: { telegram: "https://t.me/comunidad" },
      urlExtras: [{ kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" }],
    });

    expect(payload.urls).toEqual([
      { url: "https://t.me/comunidad" },
      { kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" },
    ]);
  });
});

/**
 * `getCommunityDraft` abre la ficha existente en el formulario. Si no devolviese las entradas
 * tal cual, editar una comunidad le borraría canales en silencio.
 */
describe("getCommunityDraft con urls como pares", () => {
  it("abre la ficha con todas sus entradas, etiquetas incluidas", () => {
    const draft = getCommunityDraft({
      id: 613,
      name: "GDG Barcelona",
      urls: [
        { url: "https://www.meetup.com/gdg-barcelona/" },
        { kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" },
      ],
    });

    // Las filas llevan además su `_rowId`, que es identidad local y no sale al fichero.
    expect(draft.urls.map((row) => toUrlEntries([row])[0])).toEqual([
      { url: "https://www.meetup.com/gdg-barcelona/" },
      { kind: "eventsUrl", url: "https://gdg.barcelona", label: "DevFest Barcelona" },
    ]);
    expect(draft.urls.every((row) => row._rowId)).toBe(true);
  });

  it("una ficha sin canales abre sin filas, no con 24 campos vacíos", () => {
    expect(getCommunityDraft({ id: 1, name: "Comunidad" }).urls).toEqual([]);
  });
});

/**
 * Regresión: al abrir una ficha existente, `getCommunityDraft` devolvía las entradas **sin**
 * `_rowId`. Todas las filas valían `undefined`, así que darle a quitar en una las borraba
 * todas, porque `filter(row => row._rowId !== undefined)` no dejaba ninguna.
 */
describe("identidad de las filas de urls", () => {
  const community = {
    id: 613,
    name: "GDG Barcelona",
    urls: [
      { url: "https://www.instagram.com/gdg_barcelona/" },
      { kind: "mailingList", url: "https://groups.google.com/g/gdg-barcelona" },
      { kind: "eventsUrl", url: "https://gdg.barcelona/", label: "DevFest Barcelona" },
    ],
  };

  it("toda fila abre con su _rowId, y distinto del de las demás", () => {
    const { urls } = getCommunityDraft(community);

    expect(urls).toHaveLength(3);
    expect(urls.every((row) => typeof row._rowId === "string" && row._rowId)).toBe(true);
    expect(new Set(urls.map((row) => row._rowId)).size).toBe(3);
  });

  it("quitar una fila por su id deja exactamente las demás", () => {
    const { urls } = getCommunityDraft(community);
    const quitada = urls[1];
    const quedan = urls.filter((row) => row._rowId !== quitada._rowId);

    expect(quedan).toHaveLength(2);
    expect(quedan.map((row) => row.url)).toEqual([
      "https://www.instagram.com/gdg_barcelona/",
      "https://gdg.barcelona/",
    ]);
  });

  it("dos borradores de la misma ficha no comparten ids", () => {
    const a = getCommunityDraft(community).urls.map((row) => row._rowId);
    const b = getCommunityDraft(community).urls.map((row) => row._rowId);

    expect(a.some((id) => b.includes(id))).toBe(false);
  });
});

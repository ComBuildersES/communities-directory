import { describe, expect, it } from "vitest";

import {
  applyMatches,
  buildMatchReport,
  buildOteFeedUrl,
  collectOrganizers,
  isNameContained,
  matchOrganizer,
  parseArgs,
  selectApplicableEntries,
} from "../scripts/match-eventos-wiki.js";

const catalog = {
  events: [
    {
      name: "PyConES 2026",
      organizers: [{ name: "Python España", url: "https://eventos.wiki/organizations/python-espana", type: "organization" }],
    },
    {
      name: "PyDay",
      organizers: [{ name: "Python España", url: "https://eventos.wiki/organizations/python-espana" }],
    },
    {
      name: "Codemotion Madrid 2027",
      organizers: [{ name: "Codemotion", url: "https://eventos.wiki/organizations/codemotion" }],
    },
    { name: "Sin organizador", organizers: [] },
  ],
};

const communities = [
  { id: 404, name: "Python España", urls: { web: "https://es.python.org" } },
  { id: 94, name: "Codemotion Madrid", urls: {} },
];

describe("collectOrganizers", () => {
  it("deduplica por URL y cuenta los eventos que respaldan el match", () => {
    const organizers = collectOrganizers(catalog);

    expect(organizers).toHaveLength(2);
    expect(organizers[0]).toMatchObject({ name: "Python España", eventCount: 2 });
  });

  it("ignora organizadores sin nombre o sin URL", () => {
    const organizers = collectOrganizers({
      events: [{ organizers: [{ name: "Sin URL" }, { url: "https://eventos.wiki/organizations/x" }] }],
    });

    expect(organizers).toEqual([]);
  });
});

describe("buildOteFeedUrl", () => {
  it("cuelga events.json de la página del organizador", () => {
    expect(buildOteFeedUrl("https://eventos.wiki/organizations/python-espana"))
      .toBe("https://eventos.wiki/organizations/python-espana/events.json");
  });

  it("no duplica la barra final", () => {
    expect(buildOteFeedUrl("https://eventos.wiki/organizations/python-espana/"))
      .toBe("https://eventos.wiki/organizations/python-espana/events.json");
  });
});

describe("matchOrganizer", () => {
  it("empareja por nombre exacto ignorando mayúsculas y tildes", () => {
    const match = matchOrganizer({ name: "python espana", url: "https://eventos.wiki/organizations/python-espana" }, communities);

    expect(match.confidence).toBe("exact");
    expect(match.candidates.map((c) => c.id)).toEqual([404]);
  });

  it("marca como parcial el nombre corto del organizador", () => {
    const match = matchOrganizer({ name: "Codemotion", url: "https://eventos.wiki/organizations/codemotion" }, communities);

    expect(match.confidence).toBe("partial");
    expect(match.candidates.map((c) => c.id)).toEqual([94]);
  });

  it("prioriza la URL ya presente en la ficha sobre el nombre", () => {
    const linked = [{ id: 7, name: "Otro nombre", urls: { eventosWiki: "https://eventos.wiki/organizations/python-espana" } }];
    const match = matchOrganizer({ name: "Python España", url: "https://eventos.wiki/organizations/python-espana" }, linked);

    expect(match.confidence).toBe("url");
  });

  it("no inventa match cuando la comunidad no está en el directorio", () => {
    const match = matchOrganizer({ name: "GDG Aranjuez", url: "https://eventos.wiki/organizations/gdg-aranjuez" }, communities);

    expect(match).toEqual({ confidence: "none", candidates: [] });
  });
});

describe("isNameContained", () => {
  it("exige prefijo, no subcadena suelta", () => {
    expect(isNameContained("BilboStack Conference", "BilboStack")).toBe(true);
    expect(isNameContained("Women in Flutter", "Flutter")).toBe(false);
  });

  it("descarta nombres demasiado cortos para ser discriminantes", () => {
    expect(isNameContained("GDG Madrid", "GDG")).toBe(false);
  });
});

describe("selectApplicableEntries", () => {
  const report = buildMatchReport(catalog, communities);

  it("solo aplica matches exactos por defecto", () => {
    const applicable = selectApplicableEntries(report);

    expect(applicable.map((entry) => entry.organizer)).toEqual(["Python España"]);
  });

  it("incluye los parciales cuando se pide expresamente", () => {
    const applicable = selectApplicableEntries(report, { includeFuzzy: true });

    expect(applicable.map((entry) => entry.organizer)).toEqual(["Python España", "Codemotion"]);
  });

  it("descarta los matches ambiguos", () => {
    const ambiguous = buildMatchReport(catalog, [
      { id: 1, name: "Python España", urls: {} },
      { id: 2, name: "Python Espana", urls: {} },
    ]);

    expect(selectApplicableEntries(ambiguous)).toEqual([]);
  });

  it("no reintroduce un canal archivado (issue #353)", () => {
    const archived = buildMatchReport(catalog, [
      {
        id: 404,
        name: "Python España",
        urls: {},
        archivedUrls: ["https://eventos.wiki/organizations/python-espana"],
      },
    ]);

    expect(selectApplicableEntries(archived)).toEqual([]);
  });
});

describe("applyMatches", () => {
  it("rellena solo las claves que faltan y deja el resto intacto", () => {
    const report = buildMatchReport(catalog, communities);
    const { communities: next, changed } = applyMatches(communities, selectApplicableEntries(report));

    expect(changed).toEqual([
      {
        id: 404,
        name: "Python España",
        additions: {
          eventosWiki: "https://eventos.wiki/organizations/python-espana",
          ote: "https://eventos.wiki/organizations/python-espana/events.json",
        },
      },
    ]);
    // `urls` se escribe como lista de pares (#478). El kind de la página de eventos.wiki se
    // omite porque el dominio ya lo delata; el de `web` y el de `ote` no, así que viajan.
    expect(next.find((c) => c.id === 404).urls).toEqual([
      { kind: "web", url: "https://es.python.org" },
      { url: "https://eventos.wiki/organizations/python-espana" },
      { kind: "ote", url: "https://eventos.wiki/organizations/python-espana/events.json" },
    ]);
    expect(next.find((c) => c.id === 94)).toBe(communities[1]);
  });

  it("no toca una comunidad que ya tiene ambas URLs", () => {
    const linked = [{
      id: 404,
      name: "Python España",
      urls: {
        eventosWiki: "https://eventos.wiki/organizations/python-espana",
        ote: "https://eventos.wiki/organizations/python-espana/events.json",
      },
    }];
    const report = buildMatchReport(catalog, linked);
    const { changed } = applyMatches(linked, selectApplicableEntries(report));

    expect(changed).toEqual([]);
  });
});

describe("parseArgs", () => {
  it("lee las opciones de línea de comandos", () => {
    expect(parseArgs(["--apply", "--include-fuzzy", "--input", "dump.json"])).toMatchObject({
      apply: true,
      includeFuzzy: true,
      input: "dump.json",
    });
  });
});

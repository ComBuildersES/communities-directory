import { describe, expect, it } from "vitest";

import {
  buildOteReaderUrl,
  getEventLocationLabel,
  getFeedAttribution,
  parseOteDate,
  resolveCfpCoverage,
  resolveCfpState,
  resolveEventDateNoteKey,
  selectEventsToShow,
  selectCarouselEvents,
} from "../src/components/CommunityModal/oteEvents.js";

const now = new Date("2026-11-06T10:00:00Z");

const events = [
  { id: "a", name: "Pasado lejano", startDate: "2025-01-10T18:00" },
  { id: "b", name: "Pasado reciente", startDate: "2026-10-01T18:00" },
  { id: "c", name: "Próximo", startDate: "2026-11-20T18:00" },
  { id: "d", name: "Siguiente", startDate: "2026-12-01T18:00" },
  { id: "e", name: "Cancelado", startDate: "2026-11-10T18:00", status: "cancelled" },
  { id: "f", name: "Sin fecha" },
];

describe("selectEventsToShow", () => {
  it("devuelve los próximos eventos ordenados y descarta los cancelados", () => {
    const { upcoming, past } = selectEventsToShow(events, { now });

    expect(upcoming.map((event) => event.id)).toEqual(["c", "d"]);
    expect(past).toBeNull();
  });

  it("limita el número de eventos y cuenta los que no se muestran", () => {
    const { upcoming, hiddenCount } = selectEventsToShow(events, { now, limit: 1 });

    expect(upcoming.map((event) => event.id)).toEqual(["c"]);
    expect(hiddenCount).toBe(1);
  });

  it("cae al último evento celebrado cuando no queda ninguno por venir", () => {
    const { upcoming, past } = selectEventsToShow(
      events.filter((event) => !["c", "d", "e"].includes(event.id)),
      { now }
    );

    expect(upcoming).toEqual([]);
    expect(past.id).toBe("b");
  });

  it("tolera un feed sin eventos", () => {
    expect(selectEventsToShow(undefined)).toEqual({ upcoming: [], past: null });
  });
});

describe("getFeedAttribution", () => {
  it("atribuye al dominio que publica el feed", () => {
    expect(getFeedAttribution(
      { url: "https://eventos.wiki/organizations/python-espana" },
      "https://eventos.wiki/organizations/python-espana/events.json"
    )).toEqual({
      label: "eventos.wiki",
      url: "https://eventos.wiki/organizations/python-espana",
    });
  });

  it("usa la URL del feed cuando el propio feed no declara la suya", () => {
    expect(getFeedAttribution({}, "https://mi-comunidad.github.io/eventos/events.json")).toEqual({
      label: "mi-comunidad.github.io",
      url: "https://mi-comunidad.github.io",
    });
  });

  it("no atribuye nada si la URL no es válida", () => {
    expect(getFeedAttribution({}, "no-es-una-url")).toEqual({ label: null, url: null });
  });
});

describe("parseOteDate", () => {
  it("acepta fechas locales sin zona", () => {
    expect(parseOteDate("2026-11-20T18:00")).toBeInstanceOf(Date);
  });

  it("descarta valores no utilizables", () => {
    expect(parseOteDate("")).toBeNull();
    expect(parseOteDate("mañana")).toBeNull();
    expect(parseOteDate(undefined)).toBeNull();
  });
});

describe("getEventLocationLabel", () => {
  it("prefiere el nombre del lugar y cae a la región", () => {
    expect(getEventLocationLabel({ location: { venue: "La Nave", address: { region: "Madrid" } } })).toBe("La Nave");
    expect(getEventLocationLabel({ location: { address: { region: "Madrid" } } })).toBe("Madrid");
    expect(getEventLocationLabel({})).toBeNull();
  });
});

describe("buildOteReaderUrl", () => {
  it("suscribe el feed en el lector de OTE sin escapar la URL", () => {
    expect(buildOteReaderUrl("https://combuilderses.github.io/events/feed.json"))
      .toBe("https://reader.opentechevents.org/?subscribe=https://combuilderses.github.io/events/feed.json");
  });

  it("no devuelve enlace sin feed", () => {
    expect(buildOteReaderUrl("")).toBeNull();
    expect(buildOteReaderUrl(undefined)).toBeNull();
  });
});

describe("selectCarouselEvents", () => {
  it("permite recorrer todos los próximos eventos sin truncarlos a tres", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({ id: String(i), name: `Evento ${i}`, startDate: `2027-01-0${i + 1}T18:00` }));
    const result = selectCarouselEvents([...many].reverse(), { now });
    expect(result.upcoming).toBe(true);
    expect(result.events.map(event => event.id)).toEqual(many.map(event => event.id));
  });

  it("permite recorrer los últimos eventos en orden descendente, sin cancelados ni fechas inválidas", () => {
    const result = selectCarouselEvents([
      ...events.filter(event => !['c', 'd', 'e'].includes(event.id)),
      { name: 'Cancelado pasado', startDate: '2026-11-01T18:00', status: 'cancelled' },
      { name: 'Fecha incorrecta', startDate: 'no-es-una-fecha' },
    ], { now });
    expect(result.upcoming).toBe(false);
    expect(result.events.map(event => event.id)).toEqual(['b', 'a']);
  });

  it("tolera feeds vacíos y eventos nulos", () => {
    expect(selectCarouselEvents(undefined, { now })).toEqual({ events: [], upcoming: false });
    expect(selectCarouselEvents([null, {}], { now })).toEqual({ events: [], upcoming: false });
  });
});

describe("resolveEventDateNoteKey", () => {
  it("marca el evento anunciado sin fecha confirmada", () => {
    expect(resolveEventDateNoteKey({ status: "tentative" })).toBe("tentative");
  });

  it("marca el evento aplazado, porque la fecha que se muestra es la vieja", () => {
    expect(resolveEventDateNoteKey({ status: "postponed" })).toBe("postponed");
  });

  it("tolera mayúsculas y espacios de un feed descuidado", () => {
    expect(resolveEventDateNoteKey({ status: " Tentative " })).toBe("tentative");
  });

  it("no marca nada cuando la fecha del feed es firme", () => {
    expect(resolveEventDateNoteKey({ status: "scheduled" })).toBeNull();
    expect(resolveEventDateNoteKey({})).toBeNull();
    expect(resolveEventDateNoteKey(null)).toBeNull();
  });

  it("no marca rescheduled ni moved-online: la fecha mostrada ya es la buena", () => {
    expect(resolveEventDateNoteKey({ status: "rescheduled" })).toBeNull();
    expect(resolveEventDateNoteKey({ status: "moved-online" })).toBeNull();
  });
});

describe("el último celebrado nunca es un evento cancelado", () => {
  it("salta el cancelado y devuelve el que de verdad ocurrió", () => {
    const soloPasados = [
      { id: "p1", name: "Se celebró", startDate: "2026-09-01T18:00" },
      { id: "p2", name: "Se canceló", startDate: "2026-10-20T18:00", status: "cancelled" },
    ];

    expect(selectEventsToShow(soloPasados, { now }).past.id).toBe("p1");
  });
});

describe("resolveCfpState", () => {
  const futuro = { name: "Edición futura", startDate: "2027-05-10T09:00" };
  const pasado = { name: "Edición pasada", startDate: "2026-05-10T09:00" };

  it("enseña el plazo de un CFP abierto", () => {
    const cfp = { url: "https://ej.org/c4p", closesAt: "2027-01-31T23:59:59+01:00" };

    expect(resolveCfpState({ ...futuro, cfp }, { now })).toEqual({
      url: "https://ej.org/c4p",
      state: "open",
      at: new Date("2027-01-31T23:59:59+01:00"),
      covers: [],
    });
  });

  it("no enseña un CFP cuyo plazo ya venció", () => {
    const cfp = { url: "https://ej.org/c4p", closesAt: "2026-10-15T23:59:59+02:00" };

    expect(resolveCfpState({ ...futuro, cfp }, { now })).toBeNull();
  });

  it("avisa de cuándo abre el que todavía no acepta propuestas", () => {
    const cfp = {
      url: "https://ej.org/c4p",
      opensAt: "2026-12-01T09:00:00+01:00",
      closesAt: "2027-02-01T23:59:59+01:00",
    };

    expect(resolveCfpState({ ...futuro, cfp }, { now })).toMatchObject({ state: "opens" });
  });

  it("enseña sin plazo el CFP de un evento futuro que no declara closesAt", () => {
    const cfp = { url: "https://lechazoconf.com/c4p.html" };

    expect(resolveCfpState({ ...futuro, cfp }, { now })).toEqual({
      url: "https://lechazoconf.com/c4p.html",
      state: "undated",
      at: null,
      covers: [],
    });
  });

  it("descarta el CFP sin plazo de una edición ya celebrada", () => {
    const cfp = { url: "https://ej.org/c4p" };

    expect(resolveCfpState({ ...pasado, cfp }, { now })).toBeNull();
  });

  it("usa el startsAt ya parseado que le pasa el carrusel", () => {
    const evento = { name: "X", startsAt: new Date("2026-05-10T09:00"), cfp: { url: "https://ej.org/c4p" } };

    expect(resolveCfpState(evento, { now })).toBeNull();
  });

  it("no inventa nada sin url, que es el único campo obligatorio del CFP", () => {
    expect(resolveCfpState({ ...futuro, cfp: { closesAt: "2027-01-31T23:59:59+01:00" } }, { now })).toBeNull();
    expect(resolveCfpState({ ...futuro, cfp: { url: "  " } }, { now })).toBeNull();
    expect(resolveCfpState(futuro, { now })).toBeNull();
    expect(resolveCfpState(null, { now })).toBeNull();
  });

  it("ignora un closesAt ilegible en vez de romper la ficha", () => {
    const cfp = { url: "https://ej.org/c4p", closesAt: "pronto" };

    expect(resolveCfpState({ ...futuro, cfp }, { now })).toMatchObject({ state: "undated" });
  });
});

describe("resolveCfpCoverage", () => {
  it("devuelve los dos datos cuando el CFP los declara", () => {
    expect(resolveCfpCoverage({ coversTravel: true, coversAccommodation: true })).toEqual([
      { key: "travel", covered: true },
      { key: "accommodation", covered: true },
    ]);
  });

  it("no afirma nada del campo ausente: en OTE la ausencia es 'no se sabe'", () => {
    expect(resolveCfpCoverage({ coversTravel: false })).toEqual([{ key: "travel", covered: false }]);
    expect(resolveCfpCoverage({})).toEqual([]);
    expect(resolveCfpCoverage(null)).toEqual([]);
  });

  it("ignora un valor que no es booleano", () => {
    expect(resolveCfpCoverage({ coversTravel: "sí", coversAccommodation: 1 })).toEqual([]);
  });

  it("viaja dentro del CFP que pinta la ficha", () => {
    const evento = {
      startDate: "2027-05-10T09:00",
      cfp: { url: "https://ej.org/c4p", closesAt: "2027-01-31T23:59:59+01:00", coversTravel: true },
    };

    expect(resolveCfpState(evento, { now }).covers).toEqual([{ key: "travel", covered: true }]);
  });
});

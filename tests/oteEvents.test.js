import { describe, expect, it } from "vitest";

import {
  buildOteReaderUrl,
  getEventLocationLabel,
  getFeedAttribution,
  parseOteDate,
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

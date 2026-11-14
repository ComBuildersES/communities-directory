/**
 * Lectura de un feed de eventos en formato Open Tech Events (OTE, https://opentechevents.org).
 *
 * El directorio no guarda eventos: los pide al feed que publica la propia comunidad
 * (issues #57 y #349). Así la agenda la mantiene quien organiza, no este repo.
 */

/** Las fechas OTE son locales al evento (`2026-11-06T15:30`, sin zona). */
export function parseOteDate(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Atribución pedida en el issue #402: el dominio que sirve los datos. Un feed OTE puede
 * estar alojado en cualquier sitio (eventos.wiki, GitHub Pages, la web de la comunidad),
 * así que se deriva del propio feed en vez de asumir eventos.wiki.
 */
export function getFeedAttribution(feed, feedUrl) {
  const sourceUrl = typeof feed?.url === "string" && feed.url.trim() ? feed.url : feedUrl;

  try {
    const { hostname, protocol, origin } = new URL(sourceUrl);
    return {
      label: hostname.replace(/^www\./, ""),
      url: protocol === "http:" || protocol === "https:" ? (feed?.url?.trim() || origin) : null,
    };
  } catch {
    return { label: null, url: null };
  }
}

/**
 * Próximos eventos ordenados de más cercano a más lejano. Si no queda ninguno por venir,
 * devuelve el último celebrado: para una comunidad con poca actividad reciente es más
 * informativo que una sección vacía.
 */
export function selectEventsToShow(events, { now = new Date(), limit = 3 } = {}) {
  if (!Array.isArray(events)) return { upcoming: [], past: null };

  const dated = events
    .map((event) => ({ event, startsAt: parseOteDate(event?.startDate) }))
    .filter(({ event, startsAt }) => startsAt && event?.name);

  const upcoming = dated
    .filter(({ event, startsAt }) => startsAt >= now && event.status !== "cancelled")
    .sort((a, b) => a.startsAt - b.startsAt);

  if (upcoming.length > 0) {
    return {
      upcoming: upcoming.slice(0, limit).map(({ event, startsAt }) => ({ ...event, startsAt })),
      hiddenCount: Math.max(0, upcoming.length - limit),
      past: null,
    };
  }

  const past = dated
    .filter(({ startsAt }) => startsAt < now)
    .sort((a, b) => b.startsAt - a.startsAt)[0];

  return {
    upcoming: [],
    hiddenCount: 0,
    past: past ? { ...past.event, startsAt: past.startsAt } : null,
  };
}

/** Todos los eventos navegables: próximos en orden cronológico o últimos del más reciente al más antiguo. */
export function selectCarouselEvents(events, { now = new Date() } = {}) {
  const { upcoming } = selectEventsToShow(events, { now, limit: Infinity });
  if (upcoming.length) return { events: upcoming, upcoming: true };
  const past = (Array.isArray(events) ? events : [])
    .map((event) => ({ ...event, startsAt: parseOteDate(event?.startDate) }))
    .filter((event) => event.name && event.startsAt && event.startsAt < now && event.status !== "cancelled")
    .sort((a, b) => b.startsAt - a.startsAt);
  return { events: past, upcoming: false };
}

const OTE_READER_URL = "https://reader.opentechevents.org/";

/**
 * Lector de OTE: muestra el evento completo tal y como lo publica la comunidad (C4P,
 * precios, ponentes…), no solo lo poco que cabe en la ficha. Lo que se vea depende de los
 * campos que traiga cada feed.
 */
export function buildOteReaderUrl(feedUrl) {
  if (typeof feedUrl !== "string" || !feedUrl.trim()) return null;

  const url = new URL(OTE_READER_URL);
  url.searchParams.set("subscribe", feedUrl.trim());
  // El lector espera la URL del feed legible, no escapada como parámetro opaco.
  return `${url.origin}${url.pathname}?subscribe=${feedUrl.trim()}`;
}

export async function fetchOteFeed(feedUrl, { signal } = {}) {
  const response = await fetch(feedUrl, { signal, headers: { Accept: "application/ote+json, application/json" } });

  if (!response.ok) {
    throw new Error(`OTE feed responded ${response.status}`);
  }

  return response.json();
}

export function formatEventDate(startsAt, locale) {
  if (!startsAt) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(startsAt);
}

export function getEventLocationLabel(event) {
  const address = event?.location?.address ?? {};
  return [event?.location?.venue, address.region].filter(Boolean)[0] ?? null;
}

/**
 * Canales de una comunidad como pares (issue #478). La forma de una entrada está en
 * `schema.json`; aquí, por qué es así.
 *
 * `eventsUrl` era una clave única y en los GDG ya estaba ocupada por el Meetup, así que no
 * había dónde decir "y además organizan este encuentro anual, aquí".
 *
 * Tres decisiones que el código no explica solo:
 *
 * - **`kind` se omite cuando el dominio lo delata.** Se escribe cuando el dominio no puede
 *   decirlo —hay kinds que viven en cualquier dominio, y `ote` es un formato de feed, no un
 *   sitio— o cuando lo contradice. Sin eso, esos kinds serían indistinguibles entre sí.
 * - **`label` sólo cuando el nombre de la plataforma no es lo que hay que leer.** Es lo que
 *   permite que un grupo tenga su Meetup *y además* su encuentro anual con nombre propio.
 * - **El formato antiguo (objeto `{ clave: url }`) se sigue leyendo**: es lo que traen los
 *   issues abiertos antes del cambio y los borradores a medias en `localStorage`. La
 *   conversión es reversible, y hay un test que lo comprueba sobre el dataset entero: es lo
 *   que permitió migrar 510 fichas con un script en vez de a mano.
 */


/**
 * Los `kind` son exactamente las claves que tenía `urls` antes de la migración. Se conservan
 * porque son la información semántica que el dominio no da: que una URL sea el blog y otra el
 * foro no se deduce de `example.org`.
 *
 * `group` es lo que agrupa los enlaces en la ficha; `icon`, el de Font Awesome. `hintKey` es
 * opcional y solo lo usa el desplegable del formulario: lo llevan los kinds cuyo nombre a
 * secas no basta para elegir bien ("Eventos" al lado de Meetup, Eventbrite y Luma).
 */
export const URL_KINDS = [
  { kind: "web", labelKey: "communityModal.url.web", icon: "fas fa-globe", group: "community", hintKey: "contribution.urls.kindHint.web" },
  { kind: "linkAggregator", labelKey: "communityModal.url.linkAggregator", icon: "fas fa-link", group: "community", hintKey: "contribution.urls.kindHint.linkAggregator" },
  { kind: "github", labelKey: "communityModal.url.github", icon: "fab fa-github", group: "community" },
  // Las plataformas concretas van **antes** que el genérico: con "Eventos" encabezando el
  // grupo, quien tiene un Meetup elegía el genérico por orden de aparición.
  { kind: "meetup", labelKey: "communityModal.url.meetup", icon: "fab fa-meetup", group: "events" },
  { kind: "eventbrite", labelKey: "communityModal.url.eventbrite", icon: "fas fa-ticket", group: "events" },
  { kind: "luma", labelKey: "communityModal.url.luma", icon: "fas fa-calendar-day", group: "events" },
  { kind: "eventsUrl", labelKey: "communityModal.url.events", icon: "fas fa-calendar-days", group: "events", hintKey: "contribution.urls.kindHint.eventsUrl" },
  { kind: "eventosWiki", labelKey: "communityModal.url.eventosWiki", icon: "fas fa-calendar-check", group: "events", hintKey: "contribution.urls.kindHint.eventosWiki" },
  { kind: "ote", labelKey: "communityModal.url.ote", icon: "fas fa-calendar-plus", group: "events", hintKey: "contribution.urls.kindHint.ote" },
  { kind: "blog", labelKey: "communityModal.url.blog", icon: "fas fa-pen-nib", group: "content" },
  { kind: "rss", labelKey: "communityModal.url.rss", icon: "fas fa-rss", group: "content" },
  { kind: "forum", labelKey: "communityModal.url.forum", icon: "fas fa-comments", group: "content" },
  { kind: "mailingList", labelKey: "communityModal.url.mailingList", icon: "fas fa-envelope", group: "content", hintKey: "contribution.urls.kindHint.mailingList" },
  { kind: "discord", labelKey: "communityModal.url.discord", icon: "fab fa-discord", group: "chat" },
  { kind: "telegram", labelKey: "communityModal.url.telegram", icon: "fab fa-telegram", group: "chat" },
  { kind: "whatsapp", labelKey: "communityModal.url.whatsapp", icon: "fab fa-whatsapp", group: "chat" },
  { kind: "slack", labelKey: "communityModal.url.slack", icon: "fab fa-slack", group: "chat" },
  { kind: "youtube", labelKey: "communityModal.url.youtube", icon: "fab fa-youtube", group: "social" },
  { kind: "linkedin", labelKey: "communityModal.url.linkedin", icon: "fab fa-linkedin", group: "social" },
  { kind: "twitter", labelKey: "communityModal.url.twitter", icon: "fab fa-x-twitter", group: "social" },
  { kind: "tiktok", labelKey: "communityModal.url.tiktok", icon: "fab fa-tiktok", group: "social" },
  { kind: "instagram", labelKey: "communityModal.url.instagram", icon: "fab fa-instagram", group: "social" },
  { kind: "facebook", labelKey: "communityModal.url.facebook", icon: "fab fa-facebook", group: "social" },
  { kind: "mastodon", labelKey: "communityModal.url.mastodon", icon: "fab fa-mastodon", group: "social" },
  { kind: "bluesky", labelKey: "communityModal.url.bluesky", icon: "fas fa-cloud", group: "social" },
  { kind: "twitch", labelKey: "communityModal.url.twitch", icon: "fab fa-twitch", group: "social" },
  { kind: "flickr", labelKey: "communityModal.url.flickr", icon: "fab fa-flickr", group: "social" },
];

export const URL_KIND_BY_KEY = Object.fromEntries(URL_KINDS.map((k) => [k.kind, k]));

/** Orden de los grupos en la ficha. El icono y la etiqueta del grupo, aquí. */
export const URL_GROUPS = [
  { group: "community", labelKey: "communityModal.urlGroup.community", icon: "fas fa-globe" },
  { group: "events", labelKey: "communityModal.urlGroup.events", icon: "fas fa-calendar-days" },
  { group: "content", labelKey: "communityModal.urlGroup.content", icon: "fas fa-newspaper" },
  { group: "chat", labelKey: "communityModal.urlGroup.chat", icon: "fas fa-comments" },
  { group: "social", labelKey: "communityModal.urlGroup.social", icon: "fas fa-share-nodes" },
];

/** Grupo de quien llega sin `kind` reconocible: un enlace con etiqueta propia y nada más. */
export const FALLBACK_GROUP = "community";
export const FALLBACK_ICON = "fas fa-link";

/**
 * Dominio → `kind`. Solo entra aquí lo que el dominio identifica **sin ambigüedad**: si una
 * plataforma puede ser el blog de una comunidad y el foro de otra, no se infiere.
 *
 * Que una inferencia falte no pierde datos: la migración escribe el `kind` explícito cuando
 * el dominio no lo confirma. Lo que sí importa es no inferir de más.
 */
const DOMAIN_KINDS = [
  [/(^|\.)(twitter\.com|x\.com)$/, "twitter"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)github\.(com|io)$/, "github"],
  [/(^|\.)(discord\.gg|discord\.com|discordapp\.com)$/, "discord"],
  [/(^|\.)(t\.me|telegram\.me|telegram\.org)$/, "telegram"],
  [/(^|\.)whatsapp\.com$/, "whatsapp"],
  [/(^|\.)slack\.com$/, "slack"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)bsky\.app$/, "bluesky"],
  [/(^|\.)twitch\.tv$/, "twitch"],
  [/(^|\.)flickr\.com$/, "flickr"],
  [/(^|\.)(linktr\.ee|linktree\.com|bio\.link|beacons\.ai)$/, "linkAggregator"],
  [/(^|\.)meetup\.com$/, "meetup"],
  [/(^|\.)eventbrite\.[a-z.]+$/, "eventbrite"],
  [/(^|\.)(lu\.ma|luma\.com)$/, "luma"],
  // `eventsUrl` queda como la plataforma de eventos genérica: donde la comunidad publica sus
  // convocatorias pero no es ninguna de las tres de arriba.
  [/(^|\.)(gdg\.community\.dev|community\.cncf\.io|sessionize\.com)$/, "eventsUrl"],
  [/(^|\.)eventos\.wiki$/, "eventosWiki"],
  [/(^|\.)groups\.google\.com$/, "mailingList"],
];

function hostnameOf(url) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * `kind` que el dominio delata, o `null`. Mastodon se queda fuera a propósito: vive en miles
 * de instancias con dominio propio, así que su `kind` no se puede deducir y siempre viaja
 * explícito.
 */
export function inferKindFromUrl(url) {
  const hostname = hostnameOf(url);
  if (!hostname) return null;
  for (const [pattern, kind] of DOMAIN_KINDS) {
    if (pattern.test(hostname)) return kind;
  }
  return null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Normaliza `urls` a array de entradas, acepte el formato que acepte.
 *
 * Es el único sitio que sabe que existió el formato de objeto: el resto del código recibe
 * siempre entradas. Descarta lo que no tenga URL en vez de romper, porque esto corre también
 * sobre lo que llega de un issue de GitHub.
 */
export function toUrlEntries(urls) {
  if (!urls) return [];

  if (Array.isArray(urls)) {
    return urls
      .map((entry) => {
        if (isNonEmptyString(entry)) return { url: entry.trim() };
        if (!entry || typeof entry !== "object") return null;
        if (!isNonEmptyString(entry.url)) return null;
        const normalized = { url: entry.url.trim() };
        const kind = isNonEmptyString(entry.kind) ? entry.kind.trim() : null;
        // El kind redundante se cae venga como venga la entrada: si el dominio ya lo dice,
        // escribirlo deja dos formas de representar lo mismo en el dataset. La inferencia
        // crece con el tiempo (Meetup y Luma llegaron después), así que esto se recalcula.
        if (kind && URL_KIND_BY_KEY[kind] && inferKindFromUrl(normalized.url) !== kind) {
          normalized.kind = kind;
        }
        if (isNonEmptyString(entry.label)) normalized.label = entry.label.trim();
        return normalized;
      })
      .filter(Boolean);
  }

  if (typeof urls !== "object") return [];

  return Object.entries(urls)
    .filter(([kind, url]) => URL_KIND_BY_KEY[kind] && isNonEmptyString(url))
    .map(([kind, url]) => {
      const trimmed = url.trim();
      // El `kind` se omite cuando el dominio lo dice: es lo que hace que la ficha migrada no
      // repita "twitter" al lado de una URL de x.com.
      return inferKindFromUrl(trimmed) === kind ? { url: trimmed } : { kind, url: trimmed };
    });
}

/**
 * Entradas → objeto `{ clave: url }` del formato antiguo.
 *
 * Existe por dos motivos: los consumidores que solo quieren "¿cuál es el Telegram?" siguen
 * preguntándolo igual, y es la mitad de ida y vuelta que demuestra que la migración no pierde
 * nada. Es **lossy por construcción** cuando hay dos entradas del mismo `kind` (el Meetup y
 * el DevFest de un GDG): gana la primera, que es la que estaba antes de la migración.
 */
export function toLegacyUrlMap(urls) {
  const map = {};
  for (const entry of toUrlEntries(urls)) {
    const kind = entry.kind || inferKindFromUrl(entry.url);
    if (!kind || !URL_KIND_BY_KEY[kind]) continue;
    if (map[kind]) continue;
    map[kind] = entry.url;
  }
  return map;
}

/**
 * Entrada → lo que hay que pintar. `translate` es la `t` de i18next; sin ella devuelve la
 * clave, que es lo que hacen los scripts de Node (no tienen i18n y solo quieren el `kind`).
 */
export function resolveUrlEntry(entry, translate) {
  const url = typeof entry === "string" ? entry : entry?.url;
  const explicitLabel = typeof entry === "object" && isNonEmptyString(entry?.label)
    ? entry.label.trim()
    : null;
  const kind = (typeof entry === "object" && entry?.kind) || inferKindFromUrl(url);
  const known = kind ? URL_KIND_BY_KEY[kind] : null;
  const t = typeof translate === "function" ? translate : (key) => key;

  return {
    url,
    kind: known ? kind : null,
    // La etiqueta propia manda sobre la de la plataforma: quien escribe "DevFest Zaragoza"
    // quiere leer eso, no "Eventos".
    label: explicitLabel || (known ? t(known.labelKey) : hostnameOf(url) || url),
    icon: known ? known.icon : FALLBACK_ICON,
    group: known ? known.group : FALLBACK_GROUP,
    hasCustomLabel: Boolean(explicitLabel),
  };
}

/** Entradas agrupadas en el orden de `URL_GROUPS`, sin los grupos vacíos. */
export function groupUrlEntries(urls, translate) {
  const resolved = toUrlEntries(urls).map((entry) => resolveUrlEntry(entry, translate));
  return URL_GROUPS.map(({ group, labelKey, icon }) => ({
    group,
    labelKey,
    icon,
    entries: resolved.filter((entry) => entry.group === group),
  })).filter(({ entries }) => entries.length > 0);
}

/**
 * Reparte las entradas en lo que el formulario sabe editar y lo que tiene que **conservar
 * tal cual**.
 *
 * El formulario trabaja con un campo por plataforma (`urls.telegram`), que es una casilla por
 * `kind`. Con pares eso ya no cubre todo: una ficha puede traer dos `eventsUrl` (el Meetup del
 * grupo y su encuentro anual con etiqueta propia), y si la edición solo devolviese el mapa por
 * clave, la segunda desaparecería sin que nadie se diese cuenta. Eso es exactamente la pérdida
 * de datos que esta migración tiene que evitar, así que lo que no cabe en una casilla viaja
 * aparte y se vuelve a pegar al construir el payload.
 *
 * - `primary`: la primera entrada de cada `kind` conocido y sin etiqueta propia.
 * - `extras`: todo lo demás (kind repetido, etiqueta propia, o sin kind reconocible).
 */
export function splitDraftUrls(urls) {
  const primary = {};
  const extras = [];

  for (const entry of toUrlEntries(urls)) {
    const kind = entry.kind || inferKindFromUrl(entry.url);
    const fitsASlot = kind && URL_KIND_BY_KEY[kind] && !entry.label && !primary[kind];
    if (fitsASlot) {
      primary[kind] = entry.url;
    } else {
      extras.push(entry);
    }
  }

  return { primary, extras };
}

/**
 * La vuelta de `splitDraftUrls`: mapa por clave + extras → entradas.
 *
 * Los extras van **detrás** para que el orden de las casillas del formulario siga mandando en
 * la ficha, y se descartan los que hayan vuelto a aparecer como campo del formulario: si
 * alguien pega la URL del encuentro anual en la casilla de eventos, no puede acabar dos veces.
 */
export function mergeDraftUrls(primary, extras = []) {
  const entries = toUrlEntries(primary);
  const taken = new Set(entries.map((entry) => entry.url.trim().toLowerCase()));

  for (const extra of toUrlEntries(extras)) {
    const key = extra.url.trim().toLowerCase();
    if (taken.has(key)) continue;
    taken.add(key);
    entries.push(extra);
  }

  return entries;
}

/**
 * Qué guardar cuando alguien escribe en el campo "¿qué es?" de una fila del formulario.
 *
 * Es el único control que decide entre `kind` y `label`, y equivocarse aquí no da un error:
 * da una ficha que parece correcta y en la que el feed de eventos ha dejado de detectarse.
 * De ahí que sea una función pura con test en vez de lógica dentro del componente.
 *
 * - Texto vacío → se quitan los dos. La fila vuelve a depender solo del dominio.
 * - Texto que **coincide con una plataforma conocida** (por su nombre traducido o por el id)
 *   → `kind`. Y se omite si el dominio ya decía eso mismo, para no escribir lo redundante.
 *   Esto es lo que permite elegir `web`, `ote`, `blog`, `rss`, `forum` y `mastodon`, que no
 *   se pueden inferir nunca.
 * - Cualquier otro texto → `label`, el nombre que hay que leer en la ficha.
 *
 * `undefined` significa "quita esta clave", no "guarda undefined": quien aplica el patch
 * borra las claves que llegan así.
 */
export function resolveKindOrLabelInput({ text, url, kindLabels = [] } = {}) {
  const trimmed = typeof text === "string" ? text.trim() : "";

  if (!trimmed) {
    return { kind: undefined, label: undefined };
  }

  const matched = kindLabels.find(
    (option) =>
      option.kind === trimmed ||
      (typeof option.label === "string" && option.label.toLowerCase() === trimmed.toLowerCase()),
  );

  if (matched) {
    return {
      kind: inferKindFromUrl(url) === matched.kind ? undefined : matched.kind,
      label: undefined,
    };
  }

  return { label: trimmed };
}

/**
 * Identidad local de una fila del formulario.
 *
 * Mientras alguien teclea, la URL cambia en cada pulsación, así que no sirve de clave de
 * React ni para decir "quita esta fila". `toUrlEntries` filtra a `{ url, kind, label }` al
 * construir el payload, así que `_rowId` nunca llega al fichero de la comunidad.
 *
 * Vive aquí y no en el componente porque **todos** los caminos que siembran el borrador
 * tienen que pasar por él. Cuando `getCommunityDraft` no lo hacía, editar una ficha dejaba
 * todas las filas con `_rowId: undefined`, y darle a quitar en una borraba las demás.
 */
let urlRowSeq = 0;

export function makeUrlRow(entry = {}) {
  urlRowSeq += 1;
  return { ...entry, _rowId: `url-row-${urlRowSeq}` };
}

export function toUrlRows(urls) {
  return toUrlEntries(urls).map((entry) => makeUrlRow(entry));
}

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  URL_KINDS,
  URL_KIND_BY_KEY,
  groupUrlEntries,
  inferKindFromUrl,
  mergeDraftUrls,
  resolveKindOrLabelInput,
  resolveUrlEntry,
  splitDraftUrls,
  toLegacyUrlMap,
  toUrlEntries,
} from "../src/lib/communityUrls.js";

const SOURCE_DIR = path.join(process.cwd(), "data", "communities");

function readSourceCommunities() {
  return fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      slug: file.replace(/\.json$/, ""),
      data: JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), "utf8")),
    }));
}

describe("inferKindFromUrl", () => {
  it("reconoce las plataformas cuyo dominio las identifica sin ambigüedad", () => {
    expect(inferKindFromUrl("https://x.com/GDGZaragoza")).toBe("twitter");
    expect(inferKindFromUrl("https://twitter.com/BiznagaFest")).toBe("twitter");
    expect(inferKindFromUrl("https://www.youtube.com/@GDGGirona")).toBe("youtube");
    expect(inferKindFromUrl("https://t.me/+0bblMyCHdvQwMjlk")).toBe("telegram");
    expect(inferKindFromUrl("https://linktr.ee/gdgcordoba")).toBe("linkAggregator");
    expect(inferKindFromUrl("https://www.meetup.com/gdgZaragoza/")).toBe("meetup");
    expect(inferKindFromUrl("https://lu.ma/algo")).toBe("luma");
    expect(inferKindFromUrl("https://www.eventbrite.es/e/1")).toBe("eventbrite");
    // `eventsUrl` queda para la plataforma de eventos que no es ninguna de las tres.
    expect(inferKindFromUrl("https://gdg.community.dev/gdg-jaen/")).toBe("eventsUrl");
    expect(inferKindFromUrl("https://community.cncf.io/madrid/")).toBe("eventsUrl");
    expect(inferKindFromUrl("https://eventos.wiki/organizations/gdg-malaga")).toBe("eventosWiki");
  });

  it("no infiere Mastodon: vive en miles de instancias con dominio propio", () => {
    expect(inferKindFromUrl("https://mastodon.social/@alguien")).toBeNull();
    expect(inferKindFromUrl("https://floss.social/@comunidad")).toBeNull();
  });

  it("no infiere nada de un dominio propio: ahí el kind tiene que viajar explícito", () => {
    expect(inferKindFromUrl("https://gdgzaragoza.es/devfest")).toBeNull();
    expect(inferKindFromUrl("https://www.biznagafest.com/")).toBeNull();
  });

  it("devuelve null sin romperse ante una URL inválida o vacía", () => {
    expect(inferKindFromUrl("")).toBeNull();
    expect(inferKindFromUrl("no-es-una-url")).toBeNull();
    expect(inferKindFromUrl(null)).toBeNull();
    expect(inferKindFromUrl(undefined)).toBeNull();
  });
});

describe("toUrlEntries", () => {
  it("omite el kind cuando el dominio lo delata", () => {
    expect(toUrlEntries({ twitter: "https://x.com/GDGZaragoza" })).toEqual([
      { url: "https://x.com/GDGZaragoza" },
    ]);
  });

  it("conserva el kind cuando el dominio no lo confirma", () => {
    // blog, rss, forum y mailingList pueden vivir en cualquier dominio: sin el kind serían
    // indistinguibles entre sí.
    expect(toUrlEntries({ blog: "https://ejemplo.org/blog" })).toEqual([
      { kind: "blog", url: "https://ejemplo.org/blog" },
    ]);
    expect(toUrlEntries({ ote: "https://ejemplo.org/events/feed.json" })).toEqual([
      { kind: "ote", url: "https://ejemplo.org/events/feed.json" },
    ]);
  });

  it("conserva el kind cuando el dominio dice otra cosa", () => {
    // La home de la comunidad vive en su Meetup: el dominio diría eventsUrl, pero la clave
    // original era web y es la que manda.
    expect(toUrlEntries({ web: "https://www.meetup.com/una-comunidad/" })).toEqual([
      { kind: "web", url: "https://www.meetup.com/una-comunidad/" },
    ]);
  });

  it("quita el kind redundante también cuando la entrada ya venía como par", () => {
    // La inferencia crece con el tiempo (Meetup y Luma llegaron después de la migración), así
    // que un kind escrito antes puede haberse vuelto redundante. Dos formas de escribir lo
    // mismo en el dataset es justo lo que no queremos.
    expect(toUrlEntries([{ kind: "eventsUrl", url: "https://community.cncf.io/madrid/" }])).toEqual([
      { url: "https://community.cncf.io/madrid/" },
    ]);
    expect(toUrlEntries([{ kind: "meetup", url: "https://www.meetup.com/foo/" }])).toEqual([
      { url: "https://www.meetup.com/foo/" },
    ]);
  });

  it("acepta ya el formato de array y es idempotente", () => {
    const entries = [
      { url: "https://x.com/GDGZaragoza" },
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
    ];
    expect(toUrlEntries(entries)).toEqual(entries);
    expect(toUrlEntries(toUrlEntries(entries))).toEqual(entries);
  });

  it("admite varias entradas del mismo kind, que es la razón del cambio", () => {
    const entries = toUrlEntries([
      { kind: "eventsUrl", url: "https://www.meetup.com/gdgZaragoza/" },
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
    ]);
    expect(entries).toHaveLength(2);
  });

  it("descarta basura en vez de romper, porque esto corre sobre lo que llega de un issue", () => {
    expect(toUrlEntries(null)).toEqual([]);
    expect(toUrlEntries(undefined)).toEqual([]);
    expect(toUrlEntries({ twitter: "" })).toEqual([]);
    expect(toUrlEntries({ claveInventada: "https://ejemplo.org" })).toEqual([]);
    expect(toUrlEntries([{ label: "sin url" }, null, 42])).toEqual([]);
    expect(toUrlEntries([{ url: "https://ejemplo.org", kind: "inventado" }])).toEqual([
      { url: "https://ejemplo.org" },
    ]);
  });

  it("recorta los espacios de la URL y de la etiqueta", () => {
    expect(toUrlEntries([{ url: "  https://ejemplo.org  ", label: "  Hola  " }])).toEqual([
      { url: "https://ejemplo.org", label: "Hola" },
    ]);
  });
});

describe("toLegacyUrlMap", () => {
  it("reconstruye el objeto del formato antiguo", () => {
    const legacy = { twitter: "https://x.com/GDGZaragoza", blog: "https://ejemplo.org/blog" };
    expect(toLegacyUrlMap(toUrlEntries(legacy))).toEqual(legacy);
  });

  it("con dos entradas del mismo kind gana la primera", () => {
    const map = toLegacyUrlMap([
      { kind: "eventsUrl", url: "https://www.meetup.com/gdgZaragoza/" },
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
    ]);
    expect(map.eventsUrl).toBe("https://www.meetup.com/gdgZaragoza/");
  });

  it("ignora la entrada sin kind reconocible: en el formato antiguo no tenía dónde ir", () => {
    expect(toLegacyUrlMap([{ url: "https://ejemplo.org", label: "Algo" }])).toEqual({});
  });
});

describe("ida y vuelta sobre el dataset entero", () => {
  // Es la prueba que permite migrar 660 fichas con un script en vez de a mano: si convertir a
  // pares y volver no reproduce el objeto original tal cual, la migración pierde información.
  const communities = readSourceCommunities();

  it("lee el dataset de verdad", () => {
    expect(communities.length).toBeGreaterThan(600);
  });

  it("convertir a pares y volver reproduce `urls` exactamente, ficha a ficha", () => {
    const perdidas = [];

    for (const { slug, data } of communities) {
      const original = data.urls;
      if (!original || Array.isArray(original)) continue;

      const esperado = Object.fromEntries(
        Object.entries(original).filter(
          ([kind, url]) => URL_KIND_BY_KEY[kind] && typeof url === "string" && url.trim(),
        ),
      );
      const reconstruido = toLegacyUrlMap(toUrlEntries(original));

      if (JSON.stringify(esperado) !== JSON.stringify(reconstruido)) {
        perdidas.push({ slug, esperado, reconstruido });
      }
    }

    expect(perdidas).toEqual([]);
  });

  it("toda clave usada en el dataset existe en URL_KINDS", () => {
    const desconocidas = new Set();
    for (const { data } of communities) {
      if (!data.urls || Array.isArray(data.urls)) continue;
      for (const kind of Object.keys(data.urls)) {
        if (!URL_KIND_BY_KEY[kind]) desconocidas.add(kind);
      }
    }
    expect([...desconocidas]).toEqual([]);
  });
});

describe("resolveUrlEntry", () => {
  it("la etiqueta propia manda sobre la de la plataforma", () => {
    const resolved = resolveUrlEntry(
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
      (key) => key,
    );
    expect(resolved.label).toBe("DevFest Zaragoza");
    expect(resolved.hasCustomLabel).toBe(true);
    expect(resolved.icon).toBe("fas fa-calendar-days");
    expect(resolved.group).toBe("events");
  });

  it("sin etiqueta propia usa la de la plataforma inferida por dominio", () => {
    const resolved = resolveUrlEntry({ url: "https://x.com/GDGZaragoza" }, (key) => key);
    expect(resolved.kind).toBe("twitter");
    expect(resolved.label).toBe("communityModal.url.twitter");
    expect(resolved.icon).toBe("fab fa-x-twitter");
  });

  it("sin kind ni etiqueta cae al dominio y al icono genérico, nunca a la URL cruda", () => {
    const resolved = resolveUrlEntry({ url: "https://www.gdglleida.com/algo?x=1" }, (key) => key);
    expect(resolved.label).toBe("gdglleida.com");
    expect(resolved.icon).toBe("fas fa-link");
    expect(resolved.kind).toBeNull();
  });
});

describe("groupUrlEntries", () => {
  it("agrupa en el orden declarado y sin grupos vacíos", () => {
    const groups = groupUrlEntries(
      {
        twitter: "https://x.com/GDGZaragoza",
        eventsUrl: "https://www.meetup.com/gdgZaragoza/",
        web: "https://gdgzaragoza.es",
      },
      (key) => key,
    );
    expect(groups.map((g) => g.group)).toEqual(["community", "events", "social"]);
    expect(groups.every((g) => g.entries.length > 0)).toBe(true);
  });

  it("el enlace con etiqueta propia y sin kind acaba en un grupo, no desaparece", () => {
    const groups = groupUrlEntries([{ url: "https://ejemplo.org", label: "Algo" }], (key) => key);
    expect(groups).toHaveLength(1);
    expect(groups[0].entries[0].label).toBe("Algo");
  });

  it("cada kind declara un grupo que existe", () => {
    const grupos = new Set(["community", "events", "content", "chat", "social"]);
    for (const { kind, group } of URL_KINDS) {
      expect(grupos.has(group), `${kind} declara el grupo ${group}`).toBe(true);
    }
  });
});

describe("splitDraftUrls / mergeDraftUrls", () => {
  it("lo que cabe en una casilla del formulario va a primary", () => {
    const { primary, extras } = splitDraftUrls({
      twitter: "https://x.com/GDGZaragoza",
      eventsUrl: "https://www.meetup.com/gdgZaragoza/",
    });
    expect(primary).toEqual({
      twitter: "https://x.com/GDGZaragoza",
      eventsUrl: "https://www.meetup.com/gdgZaragoza/",
    });
    expect(extras).toEqual([]);
  });

  it("la segunda entrada del mismo kind va a extras, no se pierde", () => {
    const { primary, extras } = splitDraftUrls([
      { kind: "eventsUrl", url: "https://www.meetup.com/gdgZaragoza/" },
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
    ]);
    expect(primary).toEqual({ eventsUrl: "https://www.meetup.com/gdgZaragoza/" });
    expect(extras).toEqual([
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
    ]);
  });

  it("la entrada con etiqueta propia nunca ocupa una casilla: la etiqueta se perdería", () => {
    const { primary, extras } = splitDraftUrls([
      { kind: "blog", url: "https://ejemplo.org/blog", label: "Nuestro diario" },
    ]);
    expect(primary).toEqual({});
    expect(extras).toHaveLength(1);
  });

  it("la entrada sin kind reconocible va a extras", () => {
    const { primary, extras } = splitDraftUrls([{ url: "https://ejemplo.org", label: "Algo" }]);
    expect(primary).toEqual({});
    expect(extras).toEqual([{ url: "https://ejemplo.org", label: "Algo" }]);
  });

  it("repartir y volver a juntar no pierde ni reordena nada", () => {
    // Las entradas van ya en forma canónica: `meetup.com` implica `eventsUrl`, así que ese
    // kind no se escribe. Un kind redundante en la entrada se cae al juntar, que es
    // canonicalización y no pérdida (el dominio lo sigue diciendo), pero entonces esto no
    // sería una ida y vuelta exacta y lo que queremos comprobar aquí es justo eso.
    const original = [
      { url: "https://x.com/GDGZaragoza" },
      { url: "https://www.meetup.com/gdgZaragoza/" },
      { kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" },
      { url: "https://ejemplo.org", label: "Algo" },
    ];
    const { primary, extras } = splitDraftUrls(original);
    expect(mergeDraftUrls(primary, extras)).toEqual(original);
  });

  it("el kind redundante se cae al juntar, pero el dominio lo sigue delatando", () => {
    const merged = mergeDraftUrls({ meetup: "https://www.meetup.com/gdgZaragoza/" }, []);
    expect(merged).toEqual([{ url: "https://www.meetup.com/gdgZaragoza/" }]);
    expect(resolveUrlEntry(merged[0], (key) => key).kind).toBe("meetup");
  });

  it("si el extra se pega en una casilla del formulario, no acaba dos veces", () => {
    const merged = mergeDraftUrls(
      { eventsUrl: "https://gdgzaragoza.es/devfest" },
      [{ kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest", label: "DevFest Zaragoza" }],
    );
    expect(merged).toEqual([{ kind: "eventsUrl", url: "https://gdgzaragoza.es/devfest" }]);
  });
});

/**
 * El campo "¿qué es?" de cada fila del formulario (#478). Es el único control que decide
 * entre `kind` y `label`, y el fallo que importa no da error: deja la ficha con pinta de
 * correcta y el feed de eventos sin detectar.
 */
describe("resolveKindOrLabelInput", () => {
  const kindLabels = [
    { kind: "telegram", label: "Telegram" },
    { kind: "ote", label: "Eventos (OTE)" },
    { kind: "eventsUrl", label: "Eventos" },
    { kind: "web", label: "Web" },
  ];

  it("vacío quita kind y label: la fila vuelve a depender del dominio", () => {
    expect(resolveKindOrLabelInput({ text: "", url: "https://t.me/foo", kindLabels })).toEqual({
      kind: undefined,
      label: undefined,
    });
    expect(resolveKindOrLabelInput({ text: "   ", url: "https://t.me/foo", kindLabels })).toEqual({
      kind: undefined,
      label: undefined,
    });
  });

  it("deja elegir los kinds que el dominio NO puede inferir", () => {
    // Es la razón de ser del combobox: sin esto, un feed OTE se guardaría como label libre,
    // sin kind, y `OteEvents` dejaría de encontrarlo.
    expect(
      resolveKindOrLabelInput({
        text: "Eventos (OTE)",
        url: "https://comunidad.dev/events/feed.json",
        kindLabels,
      }),
    ).toEqual({ kind: "ote", label: undefined });

    expect(
      resolveKindOrLabelInput({ text: "Web", url: "https://comunidad.dev", kindLabels }),
    ).toEqual({ kind: "web", label: undefined });
  });

  it("omite el kind redundante cuando el dominio ya lo decía", () => {
    expect(
      resolveKindOrLabelInput({ text: "Telegram", url: "https://t.me/foo", kindLabels }),
    ).toEqual({ kind: undefined, label: undefined });
  });

  it("guarda el kind cuando contradice al dominio", () => {
    // La home de una comunidad alojada en su propio Meetup es `web`, no `eventsUrl`.
    expect(
      resolveKindOrLabelInput({ text: "Web", url: "https://www.meetup.com/una/", kindLabels }),
    ).toEqual({ kind: "web", label: undefined });
  });

  it("cualquier otro texto es una etiqueta propia", () => {
    expect(
      resolveKindOrLabelInput({
        text: "DevFest Barcelona",
        url: "https://gdg.barcelona",
        kindLabels,
      }),
    ).toEqual({ label: "DevFest Barcelona" });
  });

  it("acepta el id del kind además de su nombre traducido", () => {
    expect(
      resolveKindOrLabelInput({ text: "ote", url: "https://comunidad.dev/feed.json", kindLabels }),
    ).toEqual({ kind: "ote", label: undefined });
  });

  it("no distingue mayúsculas ni espacios de sobra", () => {
    expect(
      resolveKindOrLabelInput({ text: "  telegram  ", url: "https://ejemplo.org", kindLabels }),
    ).toEqual({ kind: "telegram", label: undefined });
  });
});

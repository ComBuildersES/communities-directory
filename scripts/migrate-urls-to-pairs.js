#!/usr/bin/env node
/**
 * Migra `urls` del objeto `{ clave: url }` al array de pares (#478).
 *
 * Es un script y no una edición a mano porque eran 510 fichas, y una migración hecha a ojo
 * pierde información sin que nadie se entere hasta meses después. Antes de escribir comprueba
 * **ficha a ficha** que volver atrás reproduce el objeto original tal cual; si una sola no
 * cuadra, no escribe nada.
 *
 * Idempotente **por contenido**, no sólo por formato: una ficha ya migrada puede traer un
 * `kind` que el dominio implica, porque la inferencia crece con el tiempo. Dejarlo sería
 * tener dos formas de escribir lo mismo en el dataset.
 */
import {
  readCommunities,
  stableStringify,
  writeCommunities,
} from "./lib/communities-store.js";
import {
  URL_KIND_BY_KEY,
  toLegacyUrlMap,
  toUrlEntries,
} from "../src/lib/communityUrls.js";

function parseArgs(argv) {
  const options = { dryRun: false, verbose: false };
  for (const arg of argv) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--verbose") options.verbose = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else {
      console.error(`Argumento no reconocido: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

/**
 * Lo que la ficha tenía, filtrado igual que lo filtra `toUrlEntries`: claves soportadas con
 * una URL no vacía. Es contra esto contra lo que se compara la vuelta, no contra el objeto
 * crudo — si una ficha traía `twitter: ""`, perder ese vacío es el objetivo, no un fallo.
 */
function expectedLegacyMap(urls) {
  return Object.fromEntries(
    Object.entries(urls).filter(
      ([kind, url]) => URL_KIND_BY_KEY[kind] && typeof url === "string" && url.trim(),
    ),
  );
}

/** Claves que se van a descartar: ni soportadas ni con valor. Se avisa, no se callan. */
function droppedKeys(urls) {
  return Object.entries(urls)
    .filter(([kind, url]) => !URL_KIND_BY_KEY[kind] || typeof url !== "string" || !url.trim())
    .map(([kind, url]) => ({ kind, url }));
}

export function migrateCommunityUrls(community) {
  const { urls } = community;

  // Una ficha ya en formato de pares no se da por terminada sin más: puede traer un `kind`
  // explícito que el dominio ya implica, porque la inferencia creció después de escribirla.
  // Dejarlo sería tener dos formas de escribir lo mismo en el dataset.
  if (Array.isArray(urls)) {
    const canonical = toUrlEntries(urls);
    if (stableStringify(canonical) === stableStringify(urls)) {
      return { status: "already-migrated", community };
    }
    if (stableStringify(toLegacyUrlMap(urls)) !== stableStringify(toLegacyUrlMap(canonical))) {
      return { status: "lossy", community, detail: { esperado: toLegacyUrlMap(urls), reconstruido: toLegacyUrlMap(canonical) } };
    }
    return { status: "canonicalized", community: { ...community, urls: canonical }, dropped: [], entries: canonical };
  }
  if (!urls || typeof urls !== "object" || Object.keys(urls).length === 0) {
    return { status: "skipped", community };
  }

  const entries = toUrlEntries(urls);
  const esperado = expectedLegacyMap(urls);
  const reconstruido = toLegacyUrlMap(entries);

  if (stableStringify(esperado) !== stableStringify(reconstruido)) {
    return {
      status: "lossy",
      community,
      detail: { esperado, reconstruido },
    };
  }

  return {
    status: "migrated",
    community: { ...community, urls: entries },
    dropped: droppedKeys(urls),
    entries,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log("Uso: npm run migrate-urls-to-pairs -- [--dry-run] [--verbose]");
    return;
  }

  const communities = readCommunities();
  const results = communities.map(migrateCommunityUrls);

  const lossy = results.filter((r) => r.status === "lossy");
  const migrated = results.filter((r) => r.status === "migrated" || r.status === "canonicalized");
  const canonicalized = results.filter((r) => r.status === "canonicalized");
  const already = results.filter((r) => r.status === "already-migrated");
  const skipped = results.filter((r) => r.status === "skipped");
  const dropped = migrated.filter((r) => r.dropped.length > 0);

  console.log(`Comunidades leídas: ${communities.length}`);
  console.log(`  a migrar:      ${migrated.length - canonicalized.length}`);
  console.log(`  a canonicalizar: ${canonicalized.length}`);
  console.log(`  ya migradas:   ${already.length}`);
  console.log(`  sin urls:      ${skipped.length}`);

  if (dropped.length > 0) {
    console.log(`\n⚠️  ${dropped.length} ficha(s) con claves que se descartan:`);
    for (const { community, dropped: keys } of dropped) {
      for (const { kind, url } of keys) {
        console.log(`   - ${community.name}: ${kind} = ${JSON.stringify(url)}`);
      }
    }
  }

  if (lossy.length > 0) {
    console.error(
      `\n❌ ${lossy.length} ficha(s) no sobreviven la ida y vuelta. No se escribe nada:`,
    );
    for (const { community, detail } of lossy) {
      console.error(`   - ${community.name} (id ${community.id})`);
      console.error(`     antes:   ${JSON.stringify(detail.esperado)}`);
      console.error(`     después: ${JSON.stringify(detail.reconstruido)}`);
    }
    process.exit(1);
  }

  if (options.verbose) {
    for (const { community, entries } of migrated) {
      console.log(`\n${community.name}:`);
      for (const entry of entries) {
        const kind = entry.kind ? `${entry.kind} ` : "";
        console.log(`   ${kind}${entry.url}`);
      }
    }
  }

  if (options.dryRun) {
    console.log("\n(dry run: no se ha escrito nada)");
    return;
  }

  if (migrated.length === 0) {
    console.log("\nNada que migrar.");
    return;
  }

  writeCommunities(results.map((r) => r.community));
  console.log(`\n✔ ${migrated.length} ficha(s) migradas al formato de pares.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

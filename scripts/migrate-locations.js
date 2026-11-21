#!/usr/bin/env node
/**
 * Migra `location` (string) + `latLon` (un punto) a `locations: [{ name, latLon }]` (#45).
 *
 * Es un **envoltorio literal**: no se parte ningún string ni se limpia ningún nombre. Trocear
 * "Madrid, Valencia, Barcelona" o descartar marcadores como `n/a` es trabajo de revisión
 * humana y va en commits aparte; mezclarlo aquí haría imposible comprobar que la migración no
 * pierde nada.
 *
 * Antes de escribir comprueba **ficha a ficha** que la proyección inversa reproduce los dos
 * campos originales. Si una sola no cuadra, no escribe nada.
 *
 * Excepciones, las dos deliberadas:
 * - `location: ""` sin coordenadas → `locations: []`. Envolverla como `[{ name: "" }]`
 *   incumpliría la regla "nombres no vacíos" del validador y rompería el build. La vuelta
 *   sigue cuadrando (`[]` ↔ `""` + `latLon` nulo).
 * - `haskellmad`: `location: ""` pero con las coordenadas de Madrid y `displayOnMap: true`.
 *   El nombre que faltaba es obvio, y sin él la ficha no podría tener sede con pin.
 */
import {
  readCommunities,
  stableStringify,
  writeCommunities,
} from "./lib/communities-store.js";

/** Nombres que se corrigen a propósito: la vuelta no puede reproducir el original. */
export const NAME_OVERRIDES = {
  haskellmad: "Madrid",
};

const NULL_LAT_LON = { lat: null, lon: null };

function slugOf(community) {
  return String(community?.name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasCoordinates(latLon) {
  return Boolean(latLon) && latLon.lat !== null && latLon.lon !== null;
}

/**
 * Lo que dirían `location` y `latLon` a partir de `locations`. Es la proyección con la que se
 * comprueba la migración, no un adaptador para el código: después de esto nadie lee los
 * campos viejos.
 */
export function projectLegacyLocation(locations) {
  const [primary] = Array.isArray(locations) ? locations : [];
  return {
    location: primary?.name ?? "",
    latLon: primary?.latLon ?? NULL_LAT_LON,
  };
}

export function migrateCommunityLocation(community) {
  if (Array.isArray(community.locations) && !("location" in community) && !("latLon" in community)) {
    return { status: "already-migrated", community };
  }

  const { location, latLon, ...rest } = community;

  if (typeof location !== "string" || !latLon || typeof latLon !== "object") {
    return { status: "invalid", community, detail: { location, latLon } };
  }

  const override = NAME_OVERRIDES[slugOf(community)];
  const name = override ?? location;
  const locations = name.trim() === "" && !hasCoordinates(latLon)
    ? []
    : [{ name, latLon: { lat: latLon.lat, lon: latLon.lon } }];

  const projected = projectLegacyLocation(locations);
  const expected = { location: override ?? location, latLon };

  if (stableStringify(projected) !== stableStringify(expected)) {
    return { status: "lossy", community, detail: { expected, projected } };
  }

  return {
    status: "migrated",
    overridden: Boolean(override),
    community: { ...rest, locations },
  };
}

function parseArgs(argv) {
  const options = { dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else {
      console.error(`Argumento no reconocido: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Uso: node scripts/migrate-locations.js [--dry-run]");
    return;
  }

  const communities = readCommunities();
  const results = communities.map(migrateCommunityLocation);

  const failed = results.filter((r) => r.status === "lossy" || r.status === "invalid");
  const migrated = results.filter((r) => r.status === "migrated");
  const already = results.filter((r) => r.status === "already-migrated");
  const empty = migrated.filter((r) => r.community.locations.length === 0);
  const overridden = migrated.filter((r) => r.overridden);

  console.log(`Comunidades leídas: ${communities.length}`);
  console.log(`  a migrar:            ${migrated.length}`);
  console.log(`  ya migradas:         ${already.length}`);
  console.log(`  sin sede ([]):       ${empty.length} (${empty.map((r) => slugOf(r.community)).join(", ")})`);
  console.log(`  con nombre corregido: ${overridden.length} (${overridden.map((r) => slugOf(r.community)).join(", ")})`);

  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} ficha(s) no cuadran. No se escribe nada:`);
    for (const { community, status, detail } of failed) {
      console.error(`   - ${community.name} (id ${community.id}) [${status}]: ${JSON.stringify(detail)}`);
    }
    process.exit(1);
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
  console.log(`\n✔ ${migrated.length} ficha(s) migradas a \`locations\`.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

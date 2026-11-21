import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { classifyCommit } from "../scripts/generate-changelog.js";
import { buildCsv } from "../scripts/generate-llm-artifacts.js";
import { readCommunitiesAtRef } from "../scripts/lib/communities-git.js";

/** Último commit con `location` + `latLon`, y el que aplicó la migración (ver migrateLocations.test.js). */
const PRE_MIGRATION_REF = "cca3255";
const MIGRATION_REF = "f0409cd";
const MIGRATION_SUBJECT = "feat(data): migra las 663 fichas de `location` + `latLon` a `locations`";

/** Columnas que la migración cambió a propósito: el resto tiene que salir igual. */
const LOCATION_COLUMNS = new Set(["location", "lat", "lon", "locations"]);

function refExists(ref) {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}^{commit}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** CSV mínimo: comillas dobles con `""` escapado y saltos de línea dentro de comillas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** Filas por id, sólo con las columnas que no son de ubicación. */
function nonLocationCells(csv) {
  const [header, ...rows] = parseCsv(csv);
  const keep = header.map((column, index) => [column, index]).filter(([column]) => !LOCATION_COLUMNS.has(column));
  const idIndex = header.indexOf("id");
  return {
    columns: keep.map(([column]) => column),
    rows: new Map(rows.map((cells) => [cells[idIndex], keep.map(([, index]) => cells[index]).join("\u0000")])),
  };
}

describe("el changelog no desglosa la migración", () => {
  it("el asunto del commit de datos se clasifica como Features, no como Data", () => {
    expect(classifyCommit(MIGRATION_SUBJECT)).toBe("Features");
  });
});

describe.skipIf(!refExists(PRE_MIGRATION_REF) || !refExists(MIGRATION_REF))(
  "el CSV publicado sólo cambia en las columnas de ubicación",
  () => {
    // El generador de antes de la migración, ejecutado tal cual: comparar contra el código
    // nuevo sobre datos viejos no probaría nada, porque los dos leerían lo mismo.
    // Fuera de `scripts/`: ahí lo vería `noLegacyLocation.test.js` si corren a la vez. Los
    // imports relativos se reescriben a absolutos para que sigan resolviendo.
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "legacy-llm-artifacts-"));
    const legacyPath = path.join(tmpDir, "generate-llm-artifacts.js");
    const scriptsUrl = pathToFileURL(path.resolve("scripts")).href;
    const rootUrl = pathToFileURL(path.resolve(".")).href;
    let legacyBuildCsv;

    beforeAll(async () => {
      const source = execFileSync("git", ["show", `${PRE_MIGRATION_REF}:scripts/generate-llm-artifacts.js`], {
        encoding: "utf8",
      });
      const rewritten = source
        .replace(/from '\.\.\//g, `from '${rootUrl}/`)
        .replace(/from '\.\//g, `from '${scriptsUrl}/`);
      fs.writeFileSync(legacyPath, rewritten);
      ({ buildCsv: legacyBuildCsv } = await import(pathToFileURL(legacyPath).href));
    });

    afterAll(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("mismas columnas no de ubicación, mismas filas y mismo contenido", () => {
      const before = nonLocationCells(legacyBuildCsv(readCommunitiesAtRef(PRE_MIGRATION_REF)));
      const after = nonLocationCells(buildCsv(readCommunitiesAtRef(MIGRATION_REF)));

      expect(before.rows.size).toBeGreaterThan(400);
      expect(after.columns).toEqual(before.columns);
      expect([...after.rows.keys()]).toEqual([...before.rows.keys()]);
      const changed = [...before.rows].filter(([id, cells]) => after.rows.get(id) !== cells).map(([id]) => id);
      expect(changed).toEqual([]);
    });
  },
);

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * `location` + `latLon` se migraron a `locations` (issue #45) sin código de transición: lo
 * que siga leyendo los campos viejos no falla, devuelve `undefined` y pinta una ficha vacía o
 * un mapa sin pins. Este test lo caza antes que nadie.
 *
 * Busca accesos a los campos viejos **sobre un registro** (`community.location`,
 * `payload.latLon`…). `location.latLon` sobre una sede es el modelo nuevo y no cuenta.
 */
const ROOTS = ["src", "scripts", "public/viewer"];
const RECORD_NAMES = ["community", "c", "payload", "draft", "existing", "existingCommunity", "proposalDraft", "storedPayload", "baseDraft", "rawPayload", "record"];
const LEGACY_ACCESS = new RegExp(`\\b(?:${RECORD_NAMES.join("|")})\\??\\.(?:location|latLon)\\b`);

/** Adaptadores declarados: el script de migración es lo único que lee los campos viejos. */
const ALLOWED = new Set(["scripts/migrate-locations.js"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(m?jsx?|html)$/.test(entry.name) ? [full] : [];
  });
}

describe("nadie lee `location` / `latLon` de un registro", () => {
  it("no quedan accesos fuera de los adaptadores declarados", () => {
    const offenders = ROOTS.flatMap(walk)
      .filter((file) => !ALLOWED.has(file))
      .flatMap((file) =>
        fs.readFileSync(file, "utf-8")
          .split("\n")
          .map((line, index) => ({ file, line: index + 1, text: line.trim() }))
          .filter(({ text }) => LEGACY_ACCESS.test(text) && !/window\.location|document\.location/.test(text)),
      )
      .map(({ file, line, text }) => `${file}:${line}  ${text}`);

    expect(offenders).toEqual([]);
  });
});

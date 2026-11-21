import { describe, expect, it } from "vitest";

import en from "../src/i18n/locales/en.json";
import es from "../src/i18n/locales/es.json";

/**
 * El explorador de temáticas se publicó sin su bloque en `en.json`, y nadie se enteró: los
 * componentes llamaban a `t()` con un `defaultValue` en castellano, así que una clave que
 * faltaba se veía perfecta en `/es/` y salía en castellano dentro de `/en/` sin romper nada.
 *
 * Esto convierte ese silencio en un test que falla.
 */
const PLURAL_SUFFIXES = new Set(["zero", "one", "two", "few", "many", "other"]);

function flatten(value, prefix = "") {
  return Object.entries(value).flatMap(([key, entry]) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? flatten(entry, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

/** `title_one` y `title_other` son la misma cadena traducible en dos idiomas con reglas de plural distintas. */
function baseKey(key) {
  const [stem, suffix] = [key.slice(0, key.lastIndexOf("_")), key.slice(key.lastIndexOf("_") + 1)];
  return stem && PLURAL_SUFFIXES.has(suffix) ? stem : key;
}

const esKeys = new Set(flatten(es).map(baseKey));
const enKeys = new Set(flatten(en).map(baseKey));

describe("paridad entre locales", () => {
  it("cada clave del castellano existe en inglés", () => {
    expect([...esKeys].filter((key) => !enKeys.has(key)).sort()).toEqual([]);
  });

  it("cada clave del inglés existe en castellano", () => {
    expect([...enKeys].filter((key) => !esKeys.has(key)).sort()).toEqual([]);
  });

  it("ninguna cadena del inglés se quedó con el texto castellano", () => {
    // Los nombres propios y las siglas coinciden a propósito ("Community Builders", "ES").
    const shared = flatten(es).filter((key) => {
      const value = read(en, key);
      return typeof value === "string" && value === read(es, key) && value.split(" ").length > 3;
    });

    expect(shared).toEqual([]);
  });
});

function read(source, key) {
  return key.split(".").reduce((node, part) => (node == null ? node : node[part]), source);
}

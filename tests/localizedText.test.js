import { describe, expect, it } from "vitest";

import {
  DESCRIPTION_I18N_KEY,
  describedLangs,
  dropEmptyDescriptionTranslations,
  inferCanonicalDescriptionLang,
  normalizeDescriptionTranslations,
  resolveDescriptionTranslationLangs,
  resolveShortDescription,
} from "../src/lib/localizedText.js";

describe("normalizeDescriptionTranslations", () => {
  it("descarta idiomas fuera del catálogo y textos vacíos", () => {
    expect(normalizeDescriptionTranslations({
      en: "  An English description  ",
      english: "ignored",
      ca: "   ",
      es: 42,
    })).toEqual({ en: "An English description" });
  });

  it("acepta cualquier cosa que no sea un mapa sin romperse", () => {
    expect(normalizeDescriptionTranslations(null)).toEqual({});
    expect(normalizeDescriptionTranslations(["en"])).toEqual({});
    expect(normalizeDescriptionTranslations("en")).toEqual({});
  });
});

describe("inferCanonicalDescriptionLang", () => {
  it("prefiere el castellano cuando la comunidad también trabaja en castellano", () => {
    expect(inferCanonicalDescriptionLang({ langs: ["ca", "es"] })).toBe("es");
  });

  it("usa el primer idioma soportado cuando no hay castellano", () => {
    expect(inferCanonicalDescriptionLang({ langs: ["en"] })).toBe("en");
  });

  it("cae al castellano sin langs", () => {
    expect(inferCanonicalDescriptionLang({})).toBe("es");
  });
});

describe("resolveShortDescription", () => {
  const community = {
    langs: ["es"],
    shortDescription: "Comunidad de Python en Madrid.",
    [DESCRIPTION_I18N_KEY]: { en: "Python community in Madrid." },
  };

  it("devuelve la traducción cuando existe en el locale pedido", () => {
    expect(resolveShortDescription(community, "en")).toEqual({
      text: "Python community in Madrid.",
      lang: "en",
      isFallback: false,
    });
  });

  it("devuelve el texto canónico en su propio locale", () => {
    expect(resolveShortDescription(community, "es")).toEqual({
      text: "Comunidad de Python en Madrid.",
      lang: "es",
      isFallback: false,
    });
  });

  /**
   * El caso que justifica devolver `lang`: en `/en/` hay que marcar el párrafo como
   * castellano o un lector de pantalla en inglés lo destroza.
   */
  it("marca como fallback el texto que no está en el idioma pedido", () => {
    expect(resolveShortDescription({ langs: ["es"], shortDescription: "Solo en castellano." }, "en"))
      .toEqual({ text: "Solo en castellano.", lang: "es", isFallback: true });
  });

  it("usa una traducción cuando no hay texto canónico", () => {
    expect(resolveShortDescription(
      { langs: ["es"], shortDescription: "", [DESCRIPTION_I18N_KEY]: { en: "Only translated." } },
      "ca",
    )).toEqual({ text: "Only translated.", lang: "en", isFallback: true });
  });

  it("no rompe sin descripción de ningún tipo", () => {
    expect(resolveShortDescription({ langs: ["es"] }, "es")).toEqual({
      text: "",
      lang: null,
      isFallback: false,
    });
  });

  it("ignora la región del locale (en-GB se resuelve como en)", () => {
    expect(resolveShortDescription(community, "en-GB").lang).toBe("en");
  });

  /**
   * GeeksCAT: la descripción canónica está en catalán aunque `langs` incluya castellano, y
   * la deducción diría "es". Guardar el texto en `shortDescriptionI18n.ca` es lo que lo
   * arregla, así que la traducción tiene que ganarle a la deducción.
   */
  it("la traducción manda sobre el idioma deducido del canónico", () => {
    const geekscat = {
      langs: ["ca", "es"],
      shortDescription: "Associació sense ànim de lucre.",
      [DESCRIPTION_I18N_KEY]: { ca: "Associació sense ànim de lucre.", es: "Asociación sin ánimo de lucro." },
    };

    expect(resolveShortDescription(geekscat, "es").text).toBe("Asociación sin ánimo de lucro.");
    expect(resolveShortDescription(geekscat, "ca").isFallback).toBe(false);
  });
});

describe("describedLangs", () => {
  it("cuenta el canónico y las traducciones", () => {
    expect(describedLangs({
      langs: ["es"],
      shortDescription: "Hola.",
      [DESCRIPTION_I18N_KEY]: { en: "Hi." },
    })).toEqual(["en", "es"]);
  });

  it("no cuenta nada sin descripción", () => {
    expect(describedLangs({ langs: ["es"] })).toEqual([]);
  });
});

describe("resolveDescriptionTranslationLangs", () => {
  it("ofrece el otro locale de la interfaz y no el idioma del canónico", () => {
    expect(resolveDescriptionTranslationLangs({ langs: ["es"] })).toEqual(["en"]);
  });

  it("añade los idiomas en los que trabaja la comunidad", () => {
    expect(resolveDescriptionTranslationLangs({ langs: ["es", "gl"] })).toEqual(["en", "gl"]);
  });

  /** En una edición, esconder un texto guardado es perderlo sin avisar. */
  it("mantiene un idioma que ya tiene traducción, aunque sea el del canónico", () => {
    expect(resolveDescriptionTranslationLangs({
      langs: ["es"],
      [DESCRIPTION_I18N_KEY]: { es: "Texto guardado." },
    })).toEqual(["es", "en"]);
  });
});

describe("dropEmptyDescriptionTranslations", () => {
  it("devuelve undefined cuando no queda ninguna, para no sembrar un {} en 663 ficheros", () => {
    expect(dropEmptyDescriptionTranslations({ en: "   " })).toBeUndefined();
    expect(dropEmptyDescriptionTranslations({})).toBeUndefined();
  });

  it("devuelve el mapa normalizado cuando hay algo", () => {
    expect(dropEmptyDescriptionTranslations({ en: " Hi. " })).toEqual({ en: "Hi." });
  });
});

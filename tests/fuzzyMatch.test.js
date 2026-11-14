import { describe, it, expect } from "vitest";
import { normalize, scoreItem, scoreCommunity, matchesCommunityName, scoreRelatedCommunity } from "../src/lib/fuzzyMatch.js";

describe("normalize", () => {
  it("removes diacritics and lowercases", () => {
    expect(normalize("Estándares")).toBe("estandares");
    expect(normalize("Índice")).toBe("indice");
    expect(normalize("Ñoño")).toBe("nono");
    expect(normalize("JavaScript")).toBe("javascript");
  });

  it("handles null/undefined", () => {
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
    expect(normalize("")).toBe("");
  });
});

describe("scoreCommunity", () => {
  it("tolera invertir letras, añadirlas o borrarlas al escribir un prefijo", () => {
    const name = 'Asociación de Webmasters de Málaga';
    for (const query of ['webam', 'webmster', 'webmx', 'webmaas']) {
      expect(scoreCommunity(query, name), query).not.toBeNull();
      expect(matchesCommunityName(query, name), query).toBe(false);
    }
    expect(scoreCommunity('wbeams', name)).toBeNull();
    expect(scoreCommunity('webam inexistente', name)).toBeNull();
  });

  it("no aproxima términos cortos ni confunde la coincidencia literal con una errata", () => {
    expect(scoreCommunity('wbe', 'Web Madrid')).toBeNull();
    expect(scoreCommunity('C', 'CSS Madrid')).toBeNull();
    expect(scoreRelatedCommunity('webam', 'Asociación de Webmasters de Málaga')).not.toBeNull();
    expect(scoreRelatedCommunity('webma', 'Asociación de Webmasters de Málaga')).toBeNull();
  });
  it("no acepta solo la primera palabra de una consulta compuesta", () => {
    expect(scoreCommunity("gdg almer", "GDG A Coruña")).toBeNull();
    expect(scoreCommunity("gdg almer", "GDG Almería")).not.toBeNull();
    expect(scoreCommunity("  almeria   gdg ", "GDG Almería")).not.toBeNull();
  });

  it("separa erratas y coincidencias parciales de los nombres con todas las palabras", () => {
    expect(matchesCommunityName("gdg almeria", "GDG Almería")).toBe(true);
    expect(matchesCommunityName("gdg almeria", "GDG Alicante")).toBe(false);
    expect(matchesCommunityName("gdg madird", "GDG Madrid")).toBe(false);
    expect(scoreRelatedCommunity("gdg almeria", "GDG Alicante")).not.toBeNull();
    expect(scoreRelatedCommunity("gdg madrd", "GDG Madrid")).not.toBeNull();
    expect(scoreRelatedCommunity("gdg madrid", "GDG Madrid")).toBeNull();
    expect(scoreRelatedCommunity("gdg almeria", "Python Madrid")).toBeNull();
  });
  it("matches exact name", () => {
    expect(scoreCommunity("WebMadrid", "WebMadrid")).not.toBeNull();
  });

  it("matches by substring", () => {
    expect(scoreCommunity("madrid", "WebMadrid")).not.toBeNull();
  });

  it("matches with diacritic normalization", () => {
    expect(scoreCommunity("estandares", "Estándares web")).not.toBeNull();
  });

  it("matches multi-token query (word order agnostic)", () => {
    expect(scoreCommunity("web stand", "Estándares web")).not.toBeNull();
  });

  it("ranks exact match higher than substring", () => {
    const exact = scoreCommunity("WebMadrid", "WebMadrid");
    const partial = scoreCommunity("Web", "WebMadrid");
    expect(exact).toBeGreaterThan(partial);
  });

  it("returns null for no match", () => {
    expect(scoreCommunity("python", "WebMadrid")).toBeNull();
  });

  it("typo tolerance: 1 character change", () => {
    // "jascript" → "javascript" (1 deletion) — token "jascript" vs word "javascript"
    // "jascript" length 8 >= 4, levenshtein("jascript","javascript") = 1 (missing 'a' → actually 2)
    // Let's test a clear 1-edit case: "javscript" → "javascript"
    expect(scoreCommunity("javscript", "JavaScript Madrid")).not.toBeNull();
  });
});

describe("scoreItem", () => {
  it("permite temáticas de una letra sin sugerir cualquier palabra que la contenga", () => {
    expect(scoreItem("C", { label: "C" })).toBe(7);
    expect(scoreItem("R", { label: "R" })).toBe(7);
    expect(scoreItem("c", { label: "C++", description: "Lenguaje C" })).toBeNull();
    expect(scoreItem("r", { label: "React" })).toBeNull();
    expect(scoreItem("c", { label: "Otro", synonyms: ["C"] })).not.toBeNull();
  });

  it("no acepta solo la primera palabra tampoco en descripciones o sinónimos", () => {
    expect(scoreItem("python inexistente", { label: "Python", description: "Python para datos", synonyms: ["python3"] })).toBeNull();
  });
  const tag = {
    id: "web-standards",
    label: "Estándares web",
    description: "Especificaciones y estándares para la web como HTML, CSS y APIs del navegador",
    category: "Frontend",
    synonyms: ["web standards", "W3C", "especificaciones web"],
  };

  it("matches by label (diacritic normalization)", () => {
    expect(scoreItem("estandares", tag)).not.toBeNull();
  });

  it("matches by label (multi-token)", () => {
    expect(scoreItem("web stand", tag)).not.toBeNull();
  });

  it("matches by synonym", () => {
    expect(scoreItem("w3c", tag)).not.toBeNull();
  });

  it("matches by description", () => {
    expect(scoreItem("html css", tag)).not.toBeNull();
  });

  it("label match ranks higher than description match", () => {
    const labelScore = scoreItem("estandares", tag); // matches label "Estándares web"
    const descScore = scoreItem("html", tag); // only matches description
    expect(labelScore).toBeGreaterThan(descScore);
  });

  it("returns null for no match", () => {
    expect(scoreItem("python", tag)).toBeNull();
  });

  it("matches 'javascript' tag correctly", () => {
    const jsTag = {
      id: "javascript",
      label: "JavaScript",
      description: "Lenguaje de programación interpretado de alto nivel",
      category: "Lenguajes de programación",
      synonyms: ["JS", "ECMAScript", "ES6"],
    };
    expect(scoreItem("javascript", jsTag)).not.toBeNull();
    expect(scoreItem("js", jsTag)).not.toBeNull(); // synonym
    expect(scoreItem("ecmascript", jsTag)).not.toBeNull(); // synonym
    // Typo tolerance
    expect(scoreItem("javscript", jsTag)).not.toBeNull(); // 1 transposition
  });

  it("exact label match scores higher than starts-with", () => {
    const item = { id: "x", label: "Python", description: "", synonyms: [] };
    const exact = scoreItem("Python", item);
    const prefix = scoreItem("Pyt", item);
    expect(exact).toBeGreaterThan(prefix);
  });
});

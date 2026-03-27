import { describe, it, expect } from "vitest";
import { normalize, scoreItem, scoreCommunity } from "../src/lib/fuzzyMatch.js";

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

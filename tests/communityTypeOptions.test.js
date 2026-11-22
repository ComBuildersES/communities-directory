import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { COMMUNITY_TYPE_OPTIONS } from "../src/lib/communitySubmission.js";
import { CANONICAL_COMMUNITY_TYPES } from "../scripts/validate-community-data.js";
import { ORGANIZED_BY_EXPECTED_TYPES } from "../src/lib/organizedCommunities.js";
import { parseAssistedCommunityJson } from "../src/lib/aiAssist.js";
import { buildSchema } from "../scripts/generate-llm-artifacts.js";
import es from "../src/i18n/locales/es.json";
import en from "../src/i18n/locales/en.json";

const LOCALES = { es, en };

function camelCase(type) {
  return type.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * El issue #477 no era sólo que faltase `hackathon`: era que cada superficie llevaba su propia
 * copia de la lista de tipos y se quedaba atrás. Lo que vigila este fichero es la paridad, no
 * el valor nuevo.
 */
describe("catálogo de communityType", () => {
  it("incluye hackathon para la familia de hackathones, jams y datatones", () => {
    expect(COMMUNITY_TYPE_OPTIONS).toContain("hackathon");
  });

  it("el validador acepta exactamente los tipos que ofrece el formulario", () => {
    expect([...CANONICAL_COMMUNITY_TYPES].sort()).toEqual([...COMMUNITY_TYPE_OPTIONS].sort());
  });

  it("espera el campo de autoría en conferencias y hackathones", () => {
    expect([...ORGANIZED_BY_EXPECTED_TYPES].sort()).toEqual(["conference", "hackathon"]);
  });

  it("el alta asistida no descarta ningún tipo del catálogo", () => {
    for (const communityType of COMMUNITY_TYPE_OPTIONS) {
      const { community } = parseAssistedCommunityJson(JSON.stringify({ communityType }));
      expect(community.communityType).toBe(communityType);
    }
  });

  it("schema.json describe cada tipo para quien lea el dataset sin preguntar", () => {
    const schema = buildSchema({ communities: [], tags: [], audience: [] });
    const { enum: values, "x-enumDescriptions": descriptions } = schema.properties.communityType;
    expect([...values].sort()).toEqual([...COMMUNITY_TYPE_OPTIONS].sort());
    for (const type of COMMUNITY_TYPE_OPTIONS) {
      expect(descriptions[type]).toBeTruthy();
    }
  });

  it.each(Object.keys(LOCALES))("%s traduce etiqueta, dinámica y ayuda de cada tipo", (locale) => {
    const data = LOCALES[locale];
    for (const type of COMMUNITY_TYPE_OPTIONS) {
      expect(data.communityType[type]).toBeTruthy();
      expect(data.sidebar.communityTypeDescriptions[type]).toBeTruthy();
      expect(data.contribution.fieldHelp.communityType[camelCase(type)]).toBeTruthy();
    }
  });

  it.each([
    "src/components/SideBar.jsx",
    "src/components/FilterPanel.jsx",
    "src/components/Map/Map.jsx",
  ])("%s ofrece los ocho tipos", (file) => {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const type of COMMUNITY_TYPE_OPTIONS) {
      expect(source).toContain(type);
    }
  });
});

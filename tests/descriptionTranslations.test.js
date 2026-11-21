import { describe, expect, it } from "vitest";

import {
  buildCommunityPayload,
  getCommunityDraft,
  getEmptyCommunityDraft,
} from "../src/lib/communitySubmission.js";
import { DESCRIPTION_I18N_KEY } from "../src/lib/localizedText.js";
import { dropEmptyArchivedUrls, normalizePayload } from "../scripts/process-community-issue.js";
import { parseAssistedCommunityJson } from "../src/lib/aiAssist.js";

const baseDraft = {
  ...getEmptyCommunityDraft(1),
  name: "Comunidad Test",
  location: "Madrid",
  communityUrl: "https://example.com",
  shortDescription: "Comunidad de prueba.",
};

describe("buildCommunityPayload con traducciones de la descripción", () => {
  it("omite la clave cuando no hay traducciones ni las hubo", () => {
    expect(DESCRIPTION_I18N_KEY in buildCommunityPayload(baseDraft)).toBe(false);
  });

  it("las incluye normalizadas", () => {
    const payload = buildCommunityPayload({
      ...baseDraft,
      [DESCRIPTION_I18N_KEY]: { en: " Test community. ", english: "nope", ca: "" },
    });

    expect(payload[DESCRIPTION_I18N_KEY]).toEqual({ en: "Test community." });
  });

  /**
   * Mismo criterio que `archivedUrls`: el objeto vacío es lo único que distingue "no se
   * tocó" de "se han borrado todas", y el procesado del issue lo necesita para vaciarlas.
   */
  it("manda un objeto vacío cuando la ficha tenía traducciones y se han quitado", () => {
    const payload = buildCommunityPayload(
      { ...baseDraft, [DESCRIPTION_I18N_KEY]: {} },
      { [DESCRIPTION_I18N_KEY]: { en: "Was here." } },
    );

    expect(payload[DESCRIPTION_I18N_KEY]).toEqual({});
  });
});

describe("getCommunityDraft", () => {
  it("siembra el borrador con las traducciones de la ficha", () => {
    const draft = getCommunityDraft({
      name: "X",
      langs: ["es"],
      [DESCRIPTION_I18N_KEY]: { en: "Hi.", bogus: "no" },
    });

    expect(draft[DESCRIPTION_I18N_KEY]).toEqual({ en: "Hi." });
  });

  it("deja el mapa vacío cuando la ficha no trae la clave", () => {
    expect(getCommunityDraft({ name: "X", langs: ["es"] })[DESCRIPTION_I18N_KEY]).toEqual({});
  });
});

describe("normalizePayload", () => {
  it("conserva las traducciones del issue", () => {
    const normalized = normalizePayload({
      name: "X",
      langs: ["es"],
      [DESCRIPTION_I18N_KEY]: { en: "Hi." },
    });

    expect(normalized[DESCRIPTION_I18N_KEY]).toEqual({ en: "Hi." });
  });

  it("no inventa la clave cuando el issue no la trae (issues anteriores al campo)", () => {
    expect(DESCRIPTION_I18N_KEY in normalizePayload({ name: "X", langs: ["es"] })).toBe(false);
  });

  it("dropEmptyArchivedUrls quita el objeto vacío antes de escribir el fichero", () => {
    const community = dropEmptyArchivedUrls(
      normalizePayload({ name: "X", langs: ["es"], [DESCRIPTION_I18N_KEY]: {} }),
    );

    expect(DESCRIPTION_I18N_KEY in community).toBe(false);
  });
});

describe("parseAssistedCommunityJson", () => {
  it("acepta las traducciones y avisa de los idiomas que descarta", () => {
    const { community, warnings } = parseAssistedCommunityJson(JSON.stringify({
      name: "X",
      [DESCRIPTION_I18N_KEY]: { en: "Hi.", english: "no" },
    }));

    expect(community[DESCRIPTION_I18N_KEY]).toEqual({ en: "Hi." });
    expect(warnings).toContain(`unknown:${DESCRIPTION_I18N_KEY}:english`);
  });

  it("ignora un valor que no sea un mapa", () => {
    const { community } = parseAssistedCommunityJson(JSON.stringify({
      name: "X",
      [DESCRIPTION_I18N_KEY]: "Hi.",
    }));

    expect(DESCRIPTION_I18N_KEY in community).toBe(false);
  });
});

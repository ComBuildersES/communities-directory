import { describe, expect, it } from "vitest";

import {
  GEOGRAPHIC_SCOPE_OPTIONS,
  buildCommunityPayload,
  buildDirectoryFilterPath,
  getCommunityDraft,
  getEmptyCommunityDraft,
  parseDirectoryFilters,
} from "../src/lib/communitySubmission.js";
import { normalizePayload } from "../scripts/process-community-issue.js";

describe("ámbito geográfico (issue #402)", () => {
  it("ofrece los seis niveles canónicos", () => {
    expect(GEOGRAPHIC_SCOPE_OPTIONS).toEqual([
      "unknown",
      "local",
      "provincial",
      "regional",
      "national",
      "international",
    ]);
  });

  it("arranca como desconocido en una propuesta nueva", () => {
    expect(getEmptyCommunityDraft().geographicScope).toBe("unknown");
  });

  it("asume desconocido en las fichas anteriores al campo", () => {
    const draft = getCommunityDraft({ name: "Comunidad antigua", urls: {} });

    expect(draft.geographicScope).toBe("unknown");
  });

  it("conserva el valor de la comunidad al editarla", () => {
    const draft = getCommunityDraft({ name: "Women4TT", geographicScope: "national", urls: {} });

    expect(draft.geographicScope).toBe("national");
  });

  it("viaja en el payload del issue", () => {
    const payload = buildCommunityPayload({
      ...getEmptyCommunityDraft(1),
      name: "Women4TT",
      geographicScope: "national",
    });

    expect(payload.geographicScope).toBe("national");
  });

  it("cae a desconocido cuando la propuesta no lo trae", () => {
    expect(normalizePayload({ name: "Sin ámbito" }).geographicScope).toBe("unknown");
    expect(normalizePayload({ name: "Con ámbito", geographicScope: " regional " }).geographicScope).toBe("regional");
  });

  it("es filtrable por URL con la clave corta gs", () => {
    const path = buildDirectoryFilterPath({
      filters: { geographicScope: ["national", "regional"] },
      pathname: "/es/",
    });

    expect(path).toBe("/es/?gs=national,regional");
    expect(parseDirectoryFilters("?gs=national,regional")).toEqual({
      geographicScope: ["national", "regional"],
    });
  });
});

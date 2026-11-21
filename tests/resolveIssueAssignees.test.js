import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveIssueAssignees } from "../scripts/resolve-issue-assignees.js";

const communityBuilders = JSON.parse(
  fs.readFileSync(new URL("../public/data/community-builders-members.json", import.meta.url), "utf8"),
);

describe("resolveIssueAssignees", () => {
  it("asigna los Community Builders asociados a la comunidad y conserva el fallback territorial", () => {
    const result = resolveIssueAssignees({
      body: "```json\n{\"id\":137}\n```",
      ownersConfig: { defaults: { assignees: ["hhkaos"] }, provinces: {} },
      communityBuilders,
    });

    expect(result.communityAssignees).toEqual(["guldoe", "NeoVasili"]);
    expect(result.assignees).toEqual(["guldoe", "NeoVasili", "hhkaos"]);
    expect(result.fallbackReason).toBe("province-unresolved");
  });

  it("suma los Community Builders al responsable provincial cuando existe", () => {
    const result = resolveIssueAssignees({
      body: "```json\n{\"id\":137,\"provinceId\":\"madrid\"}\n```",
      ownersConfig: { provinces: { madrid: { assignees: ["area-owner"] } } },
      communityBuilders,
    });

    expect(result.assignees).toEqual(["guldoe", "NeoVasili", "area-owner"]);
    expect(result.usedFallback).toBe(false);
  });

  describe("varias sedes (issue #45)", () => {
    const ownersConfig = {
      defaults: { assignees: ["hhkaos"] },
      provinces: {
        madrid: { assignees: ["owner-madrid"] },
        barcelona: { assignees: ["owner-bcn"] },
        soria: { assignees: [] },
      },
    };
    const bodyOf = (payload) => `\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``;

    it("asigna a los responsables de todas las provincias, la principal primero", () => {
      const result = resolveIssueAssignees({
        body: bodyOf({ locations: [{ name: "Madrid" }, { name: "Barcelona" }] }),
        ownersConfig,
      });
      expect(result.provinceIds).toEqual(["madrid", "barcelona"]);
      expect(result.provinceId).toBe("madrid");
      expect(result.assignees).toEqual(["owner-madrid", "owner-bcn"]);
      expect(result.usedFallback).toBe(false);
    });

    it("si una provincia no tiene responsable, añade los de defecto y needs-area-owner", () => {
      const result = resolveIssueAssignees({
        body: bodyOf({ provinceIds: ["madrid", "soria"], locations: [{ name: "Madrid" }, { name: "Soria" }] }),
        ownersConfig,
      });
      expect(result.assignees).toEqual(["owner-madrid", "hhkaos"]);
      expect(result.labels).toEqual(["needs-area-owner"]);
      expect(result.fallbackReason).toBe("province-without-owner");
      expect(result.provincesWithoutOwner).toEqual(["soria"]);
    });

    it("lo que mandó el navegador manda: el nombre sólo suma si coincide exacto con un alias", () => {
      const result = resolveIssueAssignees({
        body: bodyOf({ provinceIds: ["madrid"], locations: [{ name: "San Sebastián de los Reyes" }] }),
        ownersConfig,
      });
      expect(result.provinceIds).toEqual(["madrid"]);
      expect(result.usedFallback).toBe(false);
    });

    it("sin provincias declaradas, se infiere por el nombre", () => {
      const result = resolveIssueAssignees({ body: bodyOf({ locations: [{ name: "Barcelona, España" }] }), ownersConfig });
      expect(result.provinceIds).toEqual(["barcelona"]);
    });

    it("no cuenta los marcadores como sede", () => {
      const result = resolveIssueAssignees({ body: bodyOf({ locations: [{ name: "n/a" }] }), ownersConfig });
      expect(result.provinceIds).toEqual([]);
      expect(result.fallbackReason).toBe("province-unresolved");
    });
  });
});

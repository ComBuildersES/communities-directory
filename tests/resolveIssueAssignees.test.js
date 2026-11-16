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
});
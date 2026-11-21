import { describe, expect, it } from "vitest";
import { buildCommunityShareUrl, resolveCommunityIdentifier, APP_URL } from "../src/lib/communityShare.js";
import { resolveCommunityFromIdentifier } from "../src/lib/communitySubmission.js";

describe("buildCommunityShareUrl", () => {
  it("usa el id cuando la comunidad ya lo tiene", () => {
    expect(buildCommunityShareUrl({ id: 42, name: "Step4ward" })).toBe(`${APP_URL}?community=42`);
  });

  it("cae al slug mientras la comunidad no tiene id asignado", () => {
    expect(buildCommunityShareUrl({ id: null, name: "Step4ward" })).toBe(`${APP_URL}?community=step4ward`);
  });

  it("el enlace que genera lo resuelve el propio deep link", () => {
    const communities = [{ id: null, name: "Comunidad Ñandú" }];
    const url = new URL(buildCommunityShareUrl(communities[0]));
    const identifier = url.searchParams.get("community");
    expect(resolveCommunityFromIdentifier(communities, identifier)).toBe(communities[0]);
  });

  it("sin comunidad devuelve el directorio, no un enlace roto", () => {
    expect(buildCommunityShareUrl(null)).toBe(APP_URL);
    expect(resolveCommunityIdentifier(undefined)).toBe("");
  });
});

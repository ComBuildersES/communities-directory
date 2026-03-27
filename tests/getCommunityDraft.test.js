import { describe, it, expect } from "vitest";
import { getCommunityDraft } from "../src/lib/communitySubmission.js";

const baseCommunity = {
  id: 1,
  name: "Test",
  status: "active",
  communityType: "tech-meetup",
  eventFormat: "in-person",
  location: "Madrid",
  shortDescription: "Una comunidad tech",
  topics: "",
  tags: ["javascript"],
  targetAudience: ["frontend-developer"],
  contactInfo: "",
  communityUrl: "https://example.com",
  urls: {},
  thumbnailUrl: "",
  latLon: { lat: 40.4, lon: -3.7 },
  displayOnMap: true,
  humanValidated: true,
};

describe("getCommunityDraft", () => {
  it("normaliza location a n/a para Organización paraguas", () => {
    const community = {
      ...baseCommunity,
      communityType: "umbrella-org",
      location: "España",
    };
    const draft = getCommunityDraft(community, null);
    expect(draft.location).toBe("n/a");
  });

  it("no modifica la location para otros tipos de comunidad", () => {
    const draft = getCommunityDraft(baseCommunity, null);
    expect(draft.location).toBe("Madrid");
  });

  it("preserva location n/a si ya estaba en Organización paraguas", () => {
    const community = {
      ...baseCommunity,
      communityType: "umbrella-org",
      location: "n/a",
    };
    const draft = getCommunityDraft(community, null);
    expect(draft.location).toBe("n/a");
  });

  it("normaliza humanValidated a booleano", () => {
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: true }, null).humanValidated).toBe(true);
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: false }, null).humanValidated).toBe(false);
    expect(getCommunityDraft({ ...baseCommunity, humanValidated: undefined }, null).humanValidated).toBe(false);
  });

  it("inicializa tags como array vacío si no existen", () => {
    const draft = getCommunityDraft({ ...baseCommunity, tags: undefined }, null);
    expect(draft.tags).toEqual([]);
  });

  it("preserva tags existentes", () => {
    const draft = getCommunityDraft(baseCommunity, null);
    expect(draft.tags).toEqual(["javascript"]);
  });

  it("devuelve draft vacío si no se pasa comunidad", () => {
    const draft = getCommunityDraft(null, 42);
    expect(draft.id).toBe(42);
    expect(draft.name).toBe("");
  });
});

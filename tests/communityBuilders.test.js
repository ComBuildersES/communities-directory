import { describe, expect, it } from "vitest";
import {
  BUILDER_STORIES,
  buildBuilderProfiles,
  builderFilters,
  displayLocation,
  parseCopyLinks,
  shuffle,
  visibleFaces,
} from "../src/lib/communityBuilders.js";
import { buildInverseIndex } from "../src/data/invertedindex.js";
import { searchFaceted } from "../src/data/searchFaceted.js";
import { buildDirectoryStatePath, parseDirectoryFilters } from "../src/lib/communitySubmission.js";

const communities = [
  { id: 1, name: "One", status: "active", cbMembers: ["hhkaos", "hhkaos"] },
  { id: 2, name: "Two", status: "inactive", cbMembers: ["HHKaos", "another"] },
  { id: 3, name: "Hidden", hidden: true, cbMembers: ["hhkaos"] },
  { id: 4, name: "Unassigned" },
];

describe("Community Builders profiles", () => {
  it("shows every visible community once, including inactive ones, regardless of handle casing", () => {
    const profiles = buildBuilderProfiles(communities);
    expect(profiles.get("hhkaos").communities.map(({ id }) => id)).toEqual([1, 2]);
    expect(profiles.get("another").communities.map(({ id }) => id)).toEqual([2]);
    expect(profiles.has("gabriel")).toBe(false);
  });

  it("avatar selection replaces conflicting facets and uses the existing inverted index", () => {
    const visible = communities.filter((community) => !community.hidden).map((community) => ({
      ...community, cbMembers: community.cbMembers?.map((handle) => handle.toLowerCase()) ?? [],
    }));
    const index = buildInverseIndex(visible);
    const previousFilters = { status: ["active"], cbMembers: ["another"] };
    expect(searchFaceted(visible, index, previousFilters)).toEqual([]);
    const nextFilters = builderFilters(" HHKaos ");
    expect(nextFilters.cbMembers).toEqual(["hhkaos"]);
    expect(searchFaceted(visible, index, nextFilters).map(({ id }) => id)).toEqual([1, 2]);
    const path = buildDirectoryStatePath({ pathname: "/es/", filters: nextFilters });
    const restored = parseDirectoryFilters(path.slice(path.indexOf("?")));
    expect(restored.status).toContain("inactive");
    expect(searchFaceted(visible, index, restored).map(({ id }) => id)).toEqual([1, 2]);
  });
});

describe("Community Builders modal data", () => {
  it("hides placeholder locations instead of printing them as a fact", () => {
    expect(displayLocation("Madrid")).toBe("Madrid");
    expect(displayLocation(" n/a ")).toBe("");
    expect(displayLocation("Sin completar")).toBe("");
    expect(displayLocation(undefined)).toBe("");
  });

  it("shuffles without losing or duplicating anyone", () => {
    const handles = ["a", "b", "c", "d", "e"];
    const shuffled = shuffle(handles, () => 0.99);
    expect([...shuffled].sort()).toEqual(handles);
    expect(handles).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("rotates a window over the list and keeps it full", () => {
    const handles = ["a", "b", "c", "d", "e"];
    expect(visibleFaces(handles, 3, 0)).toEqual(["a", "b", "c"]);
    // Da la vuelta sin dejar huecos: la fila no puede encogerse al llegar al final.
    expect(visibleFaces(handles, 3, 4)).toEqual(["e", "a", "b"]);
    expect(visibleFaces(["a", "b"], 3, 7)).toEqual(["a", "b"]);
    expect(visibleFaces([], 3, 1)).toEqual([]);
  });

  it("gives every story at least one side with faces", () => {
    for (const story of BUILDER_STORIES) {
      expect(story.askers.length + story.helpers.length).toBeGreaterThan(0);
    }
  });
});

describe("enlaces dentro del copy", () => {
  it("reparte el texto en trozos y marca como externo solo lo que sale del directorio", () => {
    const parts = parseCopyLinks("Salió de [los open spaces](https://example.com) y de [Cádiz GameDev](?community=71).");
    expect(parts.map(({ type }) => type)).toEqual(["text", "link", "text", "link", "text"]);
    expect(parts[1]).toMatchObject({ value: "los open spaces", href: "https://example.com", external: true });
    // Un enlace interno abre en la misma pestaña: no es salir a ninguna parte.
    expect(parts[3]).toMatchObject({ href: "?community=71", external: false });
    expect(parts.map(({ value }) => value).join("")).toBe("Salió de los open spaces y de Cádiz GameDev.");
  });

  it("deja el texto intacto cuando no hay enlaces o están mal escritos", () => {
    expect(parseCopyLinks("Sin enlaces")).toEqual([{ type: "text", value: "Sin enlaces" }]);
    expect(parseCopyLinks("[roto(https://example.com)")).toEqual([{ type: "text", value: "[roto(https://example.com)" }]);
    expect(parseCopyLinks(undefined)).toEqual([]);
  });
});

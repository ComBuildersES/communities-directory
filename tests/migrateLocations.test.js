import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { readCommunitiesAtRef } from "../scripts/lib/communities-git.js";
import { stableStringify } from "../scripts/lib/communities-store.js";
import {
  NAME_OVERRIDES,
  migrateCommunityLocation,
  projectLegacyLocation,
} from "../scripts/migrate-locations.js";

/**
 * Último commit con `location` + `latLon` en las fichas. Fijado, no `origin/master`: la
 * garantía de que la migración no perdió nada tiene que seguir comprobándose cuando master
 * ya no tenga los campos viejos.
 */
const PRE_MIGRATION_REF = "cca3255";

function refExists(ref) {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}^{commit}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function base(overrides = {}) {
  return {
    id: 1,
    name: "Comunidad",
    location: "Málaga",
    latLon: { lat: 36.72, lon: -4.42 },
    displayOnMap: true,
    ...overrides,
  };
}

describe("migrateCommunityLocation", () => {
  it("envuelve location + latLon en una sola sede, sin tocar el nombre", () => {
    const { status, community } = migrateCommunityLocation(base());
    expect(status).toBe("migrated");
    expect(community.locations).toEqual([{ name: "Málaga", latLon: { lat: 36.72, lon: -4.42 } }]);
    expect(community).not.toHaveProperty("location");
    expect(community).not.toHaveProperty("latLon");
  });

  it("no parte cadenas con varias ciudades: eso es revisión humana", () => {
    const { community } = migrateCommunityLocation(base({ location: "Madrid, Valencia, Barcelona" }));
    expect(community.locations).toHaveLength(1);
    expect(community.locations[0].name).toBe("Madrid, Valencia, Barcelona");
  });

  it("conserva espacios finales (\"Jaén \") en vez de hacer trim en silencio", () => {
    const { community } = migrateCommunityLocation(base({ location: "Jaén " }));
    expect(community.locations[0].name).toBe("Jaén ");
  });

  it("deja los marcadores como están: se limpian en un commit aparte", () => {
    const { community } = migrateCommunityLocation(
      base({ location: "n/a", latLon: { lat: null, lon: null }, displayOnMap: false }),
    );
    expect(community.locations).toEqual([{ name: "n/a", latLon: { lat: null, lon: null } }]);
  });

  it("una ubicación vacía sin coordenadas pasa a []", () => {
    const { community } = migrateCommunityLocation(
      base({ location: "", latLon: { lat: null, lon: null }, displayOnMap: false }),
    );
    expect(community.locations).toEqual([]);
  });

  it("haskellmad recibe el nombre que le faltaba", () => {
    const { community, overridden } = migrateCommunityLocation(
      base({ name: "HaskellMAD", location: "", latLon: { lat: 40.4167047, lon: -3.7035825 } }),
    );
    expect(overridden).toBe(true);
    expect(community.locations).toEqual([
      { name: "Madrid", latLon: { lat: 40.4167047, lon: -3.7035825 } },
    ]);
  });

  it("es idempotente", () => {
    const once = migrateCommunityLocation(base()).community;
    expect(migrateCommunityLocation(once).status).toBe("already-migrated");
  });

  it("rechaza fichas con una forma inesperada en vez de adivinar", () => {
    expect(migrateCommunityLocation(base({ latLon: null })).status).toBe("invalid");
  });
});

describe.skipIf(!refExists(PRE_MIGRATION_REF))("migración sobre el dataset completo", () => {
  const before = readCommunitiesAtRef(PRE_MIGRATION_REF);

  it("hay datos que comprobar", () => {
    expect(before.length).toBeGreaterThan(600);
  });

  it("cada ficha sobrevive la ida y vuelta, salvo las correcciones listadas", () => {
    const failures = [];
    for (const community of before) {
      const result = migrateCommunityLocation(community);
      if (result.status !== "migrated") {
        failures.push({ name: community.name, status: result.status });
        continue;
      }
      const projected = projectLegacyLocation(result.community.locations);
      const expected = { location: community.location, latLon: community.latLon };
      if (result.overridden) continue;
      if (stableStringify(projected) !== stableStringify(expected)) {
        failures.push({ name: community.name, projected, expected });
      }
    }
    expect(failures).toEqual([]);
  });

  it("las correcciones de nombre son exactamente las declaradas", () => {
    const overridden = before
      .map(migrateCommunityLocation)
      .filter((r) => r.overridden)
      .map((r) => r.community.locations[0].name);
    expect(overridden).toEqual(Object.values(NAME_OVERRIDES));
  });

  it("ninguna sede sale con nombre vacío", () => {
    const empty = before
      .map((c) => migrateCommunityLocation(c).community)
      .filter((c) => c.locations.some((l) => l.name.trim() === ""))
      .map((c) => c.name);
    expect(empty).toEqual([]);
  });
});

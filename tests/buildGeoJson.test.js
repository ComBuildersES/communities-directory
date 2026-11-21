import { describe, expect, it } from "vitest";

import { buildGeoJson } from "../scripts/compile-communities.js";

const base = {
  id: 433,
  name: "Step4ward",
  status: "active",
  displayOnMap: true,
  locations: [
    { name: "Barcelona", latLon: { lat: 41.38, lon: 2.17 } },
    { name: "Madrid", latLon: { lat: 40.41, lon: -3.7 } },
  ],
};

describe("buildGeoJson (issue #45)", () => {
  it("emite una feature por sede, con el nombre de su sede", () => {
    const { features } = buildGeoJson([base]);
    expect(features).toHaveLength(2);
    expect(features.map((f) => f.properties.location)).toEqual(["Barcelona", "Madrid"]);
    expect(features.map((f) => f.properties.id)).toEqual([433, 433]);
    expect(features[1].geometry.coordinates).toEqual([-3.7, 40.41]);
  });

  it("salta las sedes sin coordenadas", () => {
    const { features } = buildGeoJson([
      { ...base, locations: [base.locations[0], { name: "Soria", latLon: { lat: null, lon: null } }] },
    ]);
    expect(features).toHaveLength(1);
  });

  it("no emite nada de lo que no va al mapa ni de lo oculto", () => {
    expect(buildGeoJson([{ ...base, displayOnMap: false }]).features).toEqual([]);
    expect(buildGeoJson([{ ...base, hidden: true }]).features).toEqual([]);
  });
});

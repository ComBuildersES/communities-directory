import { describe, expect, it } from "vitest";

import {
  buildMapLocations,
  dropPlaceholderLocations,
  formatLocationNames,
  getDisplayLocationNames,
  getMappableLocations,
  inferProvinceIdsFromLocations,
  isLocationPlaceholder,
  looksLikeLocationPlaceholder,
  normalizeLocations,
  provincesInLocationName,
  resolveMissingLocationReason,
  uniqueCommunitiesById,
} from "../src/lib/communityLocations.js";
import { validateLocations } from "../scripts/validate-community-data.js";

const BCN = { name: "Barcelona", latLon: { lat: 41.38, lon: 2.17 } };
const MAD = { name: "Madrid", latLon: { lat: 40.41, lon: -3.7 } };
const NO_COORDS = { name: "Soria", latLon: { lat: null, lon: null } };

function validate(community) {
  const issues = { errors: [], warnings: [] };
  validateLocations(community, "X", issues);
  return {
    errors: issues.errors.map((i) => i.message),
    warnings: issues.warnings.map((i) => i.message),
  };
}

describe("marcadores", () => {
  it("la lista cerrada no incluye NA: sería borrar Navarra", () => {
    expect(isLocationPlaceholder("NA")).toBe(false);
    expect(isLocationPlaceholder("n/a")).toBe(true);
    expect(isLocationPlaceholder(" Sin completar ")).toBe(true);
  });

  it("las pistas sólo sirven para ocultar al pintar", () => {
    expect(looksLikeLocationPlaceholder("?")).toBe(true);
    expect(isLocationPlaceholder("?")).toBe(false);
  });

  it("dropPlaceholderLocations sólo descarta la lista cerrada", () => {
    const list = [{ name: "n/a" }, { name: "NA" }, BCN];
    expect(dropPlaceholderLocations(list)).toEqual([{ name: "NA" }, BCN]);
  });
});

describe("lectura de sedes", () => {
  it("los nombres para pintar no traen marcadores ni espacios", () => {
    const community = { locations: [{ name: "Jaén ", latLon: null }, { name: "n/a" }, { name: "?" }] };
    expect(getDisplayLocationNames(community)).toEqual(["Jaén"]);
  });

  it("sólo llevan pin las sedes con coordenadas", () => {
    expect(getMappableLocations({ locations: [BCN, NO_COORDS, MAD] })).toEqual([BCN, MAD]);
  });

  it("formatLocationNames une con el separador pedido", () => {
    expect(formatLocationNames({ locations: [BCN, MAD] }, "|")).toBe("Barcelona|Madrid");
    expect(formatLocationNames({ locations: [] })).toBe("");
  });

  it("una ficha sin `locations` se lee como []", () => {
    expect(getDisplayLocationNames({})).toEqual([]);
  });
});

describe("normalizeLocations", () => {
  it("recorta, descarta marcadores y deduplica sin distinguir acentos", () => {
    expect(
      normalizeLocations([{ name: " Málaga " }, { name: "malaga" }, { name: "n/a" }, "Madrid"]),
    ).toEqual([
      { name: "Málaga", latLon: { lat: null, lon: null } },
      { name: "Madrid", latLon: { lat: null, lon: null } },
    ]);
  });

  it("conserva coordenadas válidas y anula las a medias", () => {
    expect(normalizeLocations([BCN, { name: "Lugo", latLon: { lat: 43, lon: null } }])).toEqual([
      BCN,
      { name: "Lugo", latLon: { lat: null, lon: null } },
    ]);
  });
});

describe("resolveMissingLocationReason", () => {
  it("no hay motivo si alguna sede se puede enseñar", () => {
    expect(resolveMissingLocationReason({ locations: [BCN] })).toBeNull();
  });

  it("distingue paraguas, online y dato pendiente", () => {
    expect(resolveMissingLocationReason({ locations: [], communityType: "umbrella-org" })).toBe("umbrella");
    expect(resolveMissingLocationReason({ locations: [{ name: "n/a" }], eventFormat: "online" })).toBe("online");
    expect(resolveMissingLocationReason({ locations: [], eventFormat: "in-person" })).toBe("pending");
  });
});

describe("provincias por sede", () => {
  it("infiere una por sede, en orden: sobre el texto unido salía barcelona primero", () => {
    expect(inferProvinceIdsFromLocations([MAD, BCN])).toEqual(["madrid", "barcelona"]);
  });

  it("no repite ni cuenta marcadores", () => {
    expect(inferProvinceIdsFromLocations([MAD, { name: "Madrid" }, { name: "n/a" }])).toEqual(["madrid"]);
  });

  it("'Vigo, Galicia' es una provincia; 'Madrid, Barcelona' son dos", () => {
    expect(provincesInLocationName("Vigo, Galicia")).toHaveLength(1);
    expect(provincesInLocationName("Madrid, Barcelona")).toEqual(["madrid", "barcelona"]);
  });
});

describe("validateLocations", () => {
  it("acepta sedes válidas y []", () => {
    expect(validate({ locations: [BCN, MAD], displayOnMap: true })).toEqual({ errors: [], warnings: [] });
    expect(validate({ locations: [], displayOnMap: false })).toEqual({ errors: [], warnings: [] });
  });

  it("rechaza los campos viejos aunque la ficha traiga también locations", () => {
    const { errors } = validate({ locations: [BCN], location: "Barcelona", latLon: BCN.latLon });
    expect(errors).toHaveLength(2);
  });

  it("exige locations", () => {
    expect(validate({}).errors).toHaveLength(1);
  });

  it("rechaza nombres vacíos, duplicados y coordenadas a medias", () => {
    const { errors } = validate({
      locations: [{ name: "", latLon: { lat: null, lon: null } }, BCN, { ...BCN, name: "barcelona" }, { name: "Lugo", latLon: { lat: 43, lon: null } }],
    });
    expect(errors.some((e) => e.includes("no vacío"))).toBe(true);
    expect(errors.some((e) => e.includes("repetida"))).toBe(true);
    expect(errors.some((e) => e.includes("o los dos a null"))).toBe(true);
  });

  it("displayOnMap exige al menos una sede con coordenadas", () => {
    expect(validate({ locations: [NO_COORDS], displayOnMap: true }).errors).toHaveLength(1);
    expect(validate({ locations: [NO_COORDS, BCN], displayOnMap: true }).errors).toHaveLength(0);
  });

  it("avisa, sin error, de varias provincias en una sede y de marcadores fuera de la lista", () => {
    const { errors, warnings } = validate({
      locations: [{ name: "Madrid, Barcelona", latLon: { lat: null, lon: null } }, { name: "?", latLon: { lat: null, lon: null } }],
    });
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(2);
  });

  it("no avisa de los marcadores de la lista cerrada: se limpian en bloque", () => {
    expect(validate({ locations: [{ name: "n/a", latLon: { lat: null, lon: null } }] }).warnings).toEqual([]);
  });
});

describe("mapa: pins por sede, comunidades únicas", () => {
  const two = { id: 1, locations: [BCN, NO_COORDS, MAD] };
  const one = { id: 2, locations: [BCN] };

  it("un pin por sede con coordenadas", () => {
    const points = buildMapLocations([two, one]);
    expect(points.map((p) => [p.community.id, p.location.name])).toEqual([
      [1, "Barcelona"],
      [1, "Madrid"],
      [2, "Barcelona"],
    ]);
  });

  it("dos sedes en el extent son una comunidad en la lista", () => {
    const visible = buildMapLocations([two, one]).map((p) => p.community);
    expect(uniqueCommunitiesById(visible).map((c) => c.id)).toEqual([1, 2]);
  });
});

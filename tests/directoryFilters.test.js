import { describe, expect, it } from "vitest";
import {
  buildDirectoryStatePath,
  parseDirectoryFilters,
} from "../src/lib/communitySubmission.js";

describe("directory langs filters", () => {
  it("serializa langs en la URL usando la clave larga", () => {
    const path = buildDirectoryStatePath({
      pathname: "/es/",
      filters: {
        status: ["active"],
        langs: ["es", "en"],
      },
    });

    expect(path).toBe("/es/?langs=es,en");
  });

  it("parsea langs desde la query string", () => {
    expect(parseDirectoryFilters("?langs=es,en")).toEqual({
      langs: ["es", "en"],
    });
  });
});

describe("filtro de revisión humana", () => {
  it("serializa humanValidated con la clave corta hv", () => {
    const path = buildDirectoryStatePath({
      pathname: "/es/",
      filters: { status: ["active"], humanValidated: ["true"] },
    });

    expect(path).toBe("/es/?hv=true");
  });

  it("parsea hv desde la query string", () => {
    expect(parseDirectoryFilters("?hv=false")).toEqual({
      humanValidated: ["false"],
    });
  });

  /**
   * Es el enlace que necesita un responsable provincial: lo que le queda por revisar.
   * Si la clave no viaja en la URL, ese listado no se puede compartir.
   */
  it("convive con el resto de filtros en la URL", () => {
    const path = buildDirectoryStatePath({
      pathname: "/es/",
      filters: { status: ["active"], tags: ["python"], humanValidated: ["false"] },
    });

    expect(parseDirectoryFilters(path.slice(path.indexOf("?")))).toEqual({
      tags: ["python"],
      humanValidated: ["false"],
    });
  });
});

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

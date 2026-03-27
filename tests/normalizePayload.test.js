import { describe, it, expect } from "vitest";
import { normalizePayload } from "../scripts/process-community-issue.js";

const base = {
  name: "Test Community",
  status: "active",
  communityType: "tech-meetup",
  eventFormat: "in-person",
  location: "Madrid",
  shortDescription: "",
  topics: "",
  tags: [],
  targetAudience: [],
  contactInfo: "",
  communityUrl: "https://example.com",
  urls: {},
  thumbnailUrl: "",
  latLon: { lat: null, lon: null },
  displayOnMap: false,
  humanValidated: false,
};

describe("normalizePayload", () => {
  it("incluye shortDescription cuando se proporciona", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "Una comunidad de tecnología en Madrid",
    });
    expect(result.shortDescription).toBe("Una comunidad de tecnología en Madrid");
  });

  it("shortDescription vacío se normaliza a cadena vacía", () => {
    const result = normalizePayload({ ...base, shortDescription: "" });
    expect(result.shortDescription).toBe("");
  });

  it("shortDescription ausente se normaliza a cadena vacía", () => {
    const { shortDescription: _, ...withoutDesc } = base;
    const result = normalizePayload(withoutDesc);
    expect(result.shortDescription).toBe("");
  });

  it("recorta espacios en shortDescription", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "  descripción con espacios  ",
    });
    expect(result.shortDescription).toBe("descripción con espacios");
  });

  it("preserva el resto de campos al incluir shortDescription", () => {
    const result = normalizePayload({
      ...base,
      shortDescription: "Mi descripción",
    });
    expect(result.name).toBe("Test Community");
    expect(result.communityUrl).toBe("https://example.com");
    expect(result.tags).toEqual([]);
  });

  it("status por defecto es unknown si no se proporciona", () => {
    const result = normalizePayload({ ...base, status: "" });
    expect(result.status).toBe("unknown");
  });

  it("filtra tags duplicados y vacíos", () => {
    const result = normalizePayload({
      ...base,
      tags: ["react", "react", "", "javascript"],
    });
    expect(result.tags).toEqual(["react", "javascript"]);
  });

  it("normaliza humanValidated a booleano", () => {
    expect(normalizePayload({ ...base, humanValidated: true }).humanValidated).toBe(true);
    expect(normalizePayload({ ...base, humanValidated: false }).humanValidated).toBe(false);
    expect(normalizePayload({ ...base, humanValidated: undefined }).humanValidated).toBe(false);
  });
});

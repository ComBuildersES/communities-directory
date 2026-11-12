import { describe, expect, it } from "vitest";
import { communityInitials } from "../src/components/CommunityCard.jsx";

/**
 * Una comunidad sin logo ya no tira de una imagen de relleno alojada en bulma.io: se pinta su
 * inicial. Es lo único que distingue una celda vacía de otra en la cuadrícula.
 */
describe("communityInitials", () => {
  it("toma la inicial de las dos primeras palabras con contenido", () => {
    expect(communityInitials("GDG Córdoba")).toBe("GC");
    expect(communityInitials("Python España")).toBe("PE");
  });

  it("se salta artículos y conectores, que no identifican nada", () => {
    expect(communityInitials("Asociación de Webmasters de Granada")).toBe("AW");
    expect(communityInitials("The Things Network Madrid")).toBe("TN");
  });

  it("con una sola palabra da una sola letra", () => {
    expect(communityInitials("Betabeers")).toBe("B");
  });

  it("ignora la puntuación y los separadores", () => {
    expect(communityInitials("rockndroid - Madrid")).toBe("RM");
    expect(communityInitials("¡Hola! Tech")).toBe("HT");
  });

  it("no se rompe con un nombre vacío o solo de símbolos", () => {
    expect(communityInitials("")).toBe("?");
    expect(communityInitials("   ")).toBe("?");
    expect(communityInitials("///")).toBe("?");
    expect(communityInitials(undefined)).toBe("?");
  });
});

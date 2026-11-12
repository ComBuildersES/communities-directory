import { describe, expect, it } from "vitest";
import { requiresBranding } from "../scripts/validate-community-data.js";

/**
 * A una comunidad inactiva no se le pide logo ni URL: no hay nadie a quien pedírselos, y su
 * ficha existe para que quien busque el grupo sepa que ya no organiza nada. Eran 95 de las 119
 * advertencias de cada validación, y un aviso que nadie va a atender esconde los que sí.
 */
describe("requiresBranding", () => {
  it("no pide logo ni URL a una comunidad inactiva", () => {
    expect(requiresBranding({ status: "inactive" })).toBe(false);
  });

  it("se los sigue pidiendo a una comunidad activa", () => {
    expect(requiresBranding({ status: "active" })).toBe(true);
  });

  it("se los sigue pidiendo con el estado desconocido: ahí la comunidad puede estar viva", () => {
    expect(requiresBranding({ status: "unknown" })).toBe(true);
  });

  it("se los sigue pidiendo a una fusionada: su ficha lleva a la comunidad viva", () => {
    expect(requiresBranding({ status: "merged" })).toBe(true);
  });

  it("sin estado no deja de pedirlos: la falta de dato no es una exención", () => {
    expect(requiresBranding({})).toBe(true);
    expect(requiresBranding(null)).toBe(true);
  });
});

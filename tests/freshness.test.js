import { describe, expect, it } from "vitest";
import {
  FRESH_DATA_MIN_INTERVAL_MS,
  shouldRevalidateFreshData,
} from "../src/lib/freshness.js";

const NOW = 1_700_000_000_000;
const confirmed = { isOnline: true, hasFreshData: true, lastFreshAt: NOW, now: NOW };

describe("shouldRevalidateFreshData", () => {
  it("no revalida dos veces seguidas: volver a la pestaña dentro del intervalo no pide datos", () => {
    expect(
      shouldRevalidateFreshData({ ...confirmed, now: NOW + FRESH_DATA_MIN_INTERVAL_MS - 1 })
    ).toBe(false);
  });

  it("revalida cuando el intervalo ya ha pasado", () => {
    expect(
      shouldRevalidateFreshData({ ...confirmed, now: NOW + FRESH_DATA_MIN_INTERVAL_MS })
    ).toBe(true);
  });

  it("sin conexión no intenta nada", () => {
    expect(shouldRevalidateFreshData({ ...confirmed, isOnline: false, now: NOW + 10 ** 6 })).toBe(false);
  });

  it("no solapa dos revalidaciones", () => {
    expect(
      shouldRevalidateFreshData({ ...confirmed, isRefreshing: true, now: NOW + 10 ** 6 })
    ).toBe(false);
  });

  it("con el formulario de edición abierto no recarga el suelo bajo lo que se escribe", () => {
    expect(shouldRevalidateFreshData({ ...confirmed, isEditing: true, now: NOW + 10 ** 6 })).toBe(false);
  });

  it("si nunca se confirmó la última versión, reintenta aunque sea inmediato: es lo que desbloquea la edición", () => {
    expect(
      shouldRevalidateFreshData({ ...confirmed, hasFreshData: false, lastFreshAt: null, now: NOW })
    ).toBe(true);
  });

  it("revalida en el primer arranque sin marca de tiempo", () => {
    expect(shouldRevalidateFreshData({ ...confirmed, lastFreshAt: null })).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  EMPTY_RESULTS_VARIANTS,
  resolveEmptyResultsVariant,
} from "../src/lib/emptyResults.js";

describe("resolveEmptyResultsVariant", () => {
  it("sin filtro de revisión, el vacío es un vacío", () => {
    expect(resolveEmptyResultsVariant({ filters: { tags: ["python"] }, reviewed: 0, pending: 0 }))
      .toBe(EMPTY_RESULTS_VARIANTS.GENERIC);
  });

  it("pidiendo solo revisadas, ofrece las pendientes que hay en ese recorte", () => {
    expect(
      resolveEmptyResultsVariant({
        filters: { humanValidated: ["true"] },
        reviewed: 0,
        pending: 39,
      })
    ).toBe(EMPTY_RESULTS_VARIANTS.PENDING_OFFER);
  });

  it("pidiendo solo revisadas sin pendientes que ofrecer, no promete nada", () => {
    expect(
      resolveEmptyResultsVariant({
        filters: { humanValidated: ["true"] },
        reviewed: 0,
        pending: 0,
      })
    ).toBe(EMPTY_RESULTS_VARIANTS.GENERIC);
  });

  /**
   * El caso que hace que esto sea una función con test: con el mensaje genérico, terminar una
   * zona se leería como una búsqueda fallida.
   */
  it("pidiendo solo pendientes y sin ninguna, es que la zona está terminada", () => {
    expect(
      resolveEmptyResultsVariant({
        filters: { humanValidated: ["false"] },
        reviewed: 12,
        pending: 0,
      })
    ).toBe(EMPTY_RESULTS_VARIANTS.ALL_REVIEWED);
  });

  it("sin nada revisado tampoco canta victoria", () => {
    expect(
      resolveEmptyResultsVariant({
        filters: { humanValidated: ["false"] },
        reviewed: 0,
        pending: 0,
      })
    ).toBe(EMPTY_RESULTS_VARIANTS.GENERIC);
  });

  it("con los dos valores marcados el filtro no acota, así que no hay historia que contar", () => {
    expect(
      resolveEmptyResultsVariant({
        filters: { humanValidated: ["true", "false"] },
        reviewed: 5,
        pending: 39,
      })
    ).toBe(EMPTY_RESULTS_VARIANTS.GENERIC);
  });

  it("aguanta la llamada sin argumentos", () => {
    expect(resolveEmptyResultsVariant()).toBe(EMPTY_RESULTS_VARIANTS.GENERIC);
  });
});

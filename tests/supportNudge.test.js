import { describe, expect, it } from 'vitest';
import { resolveNudgeDelay, resolveNudgeTrigger } from '../src/components/SupportFab/useSupportNudge.js';

/**
 * El aviso del botón de soporte apareció y desapareció en mitad de un scroll: el peor
 * momento, porque nadie está mirando esa esquina mientras se desplaza. Ahora espera a que
 * la página se quede quieta.
 */
describe('resolveNudgeDelay', () => {
  it('muestra de inmediato si no ha habido scroll', () => {
    expect(resolveNudgeDelay({ lastScrollAt: 0, now: 10_000 })).toBe(0);
  });

  it('espera lo que falte si la persona acaba de hacer scroll', () => {
    expect(resolveNudgeDelay({ lastScrollAt: 9_800, now: 10_000, quietMs: 900 })).toBe(700);
  });

  it('muestra en cuanto el scroll lleva parado el tiempo de silencio', () => {
    expect(resolveNudgeDelay({ lastScrollAt: 9_100, now: 10_000, quietMs: 900 })).toBe(0);
    expect(resolveNudgeDelay({ lastScrollAt: 5_000, now: 10_000, quietMs: 900 })).toBe(0);
  });

  it('nunca devuelve una espera negativa', () => {
    expect(resolveNudgeDelay({ lastScrollAt: 1_000, now: 10_000 })).toBe(0);
  });

  it('un scroll continuo lo pospone una y otra vez, sin perderlo', () => {
    let now = 10_000;
    let lastScrollAt = now;
    let waits = 0;

    // Scroll cada 100 ms durante dos segundos: siempre toca esperar.
    for (let i = 0; i < 20; i += 1) {
      const wait = resolveNudgeDelay({ lastScrollAt, now });
      if (wait > 0) waits += 1;
      now += 100;
      lastScrollAt = now;
    }

    expect(waits).toBe(20);

    // Al parar, se muestra.
    expect(resolveNudgeDelay({ lastScrollAt, now: lastScrollAt + 1_000 })).toBe(0);
  });
});

/**
 * El botón flotante dejó de ser soporte y pasó a pedir apoyo para la iniciativa. Pedirlo
 * a los 7 s a alguien que acaba de llegar es pedir antes de haber dado nada: ahora el
 * aviso espera a que el directorio haya servido para algo (una ficha abierta, la búsqueda
 * o los filtros, o una pantalla leída) y, si no llega ninguna señal, al techo de tiempo.
 */
describe('resolveNudgeTrigger', () => {
  const engaged = { hasOpenedDialog: true };

  it('no avisa antes del suelo de tiempo, aunque haya señal de valor', () => {
    const { show, retryInMs } = resolveNudgeTrigger({ elapsedMs: 3_000, ...engaged });
    expect(show).toBe(false);
    expect(retryInMs).toBe(4_000);
  });

  it('avisa pasado el suelo si ya ha abierto una ficha', () => {
    expect(resolveNudgeTrigger({ elapsedMs: 8_000, ...engaged }).show).toBe(true);
  });

  it('cuenta usar la búsqueda o los filtros como señal de valor', () => {
    expect(resolveNudgeTrigger({ elapsedMs: 8_000, hasUsedControls: true }).show).toBe(true);
  });

  it('cuenta haber leído más de una pantalla', () => {
    expect(resolveNudgeTrigger({ elapsedMs: 8_000, scrolledPx: 1_000, viewportHeight: 800 }).show).toBe(true);
    expect(resolveNudgeTrigger({ elapsedMs: 8_000, scrolledPx: 200, viewportHeight: 800 }).show).toBe(false);
  });

  it('sin ninguna señal espera, pero no descarta el aviso', () => {
    const pending = resolveNudgeTrigger({ elapsedMs: 20_000 });
    expect(pending.show).toBe(false);
    expect(pending.retryInMs).toBeGreaterThan(0);

    // Al llegar al techo se avisa igual: leer un minuto también es usar el directorio.
    expect(resolveNudgeTrigger({ elapsedMs: 61_000 }).show).toBe(true);
  });

  it('nunca avisa con un diálogo delante', () => {
    expect(resolveNudgeTrigger({ elapsedMs: 90_000, isDialogOpen: true, ...engaged }).show).toBe(false);
  });

  it('respeta el silencio de scroll aunque todo lo demás esté listo', () => {
    const now = 100_000;
    const { show, retryInMs } = resolveNudgeTrigger({
      elapsedMs: 30_000,
      lastScrollAt: now - 200,
      now,
      ...engaged,
    });
    expect(show).toBe(false);
    expect(retryInMs).toBe(700);
  });
});

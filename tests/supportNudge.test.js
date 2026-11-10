import { describe, expect, it } from 'vitest';
import { resolveNudgeDelay } from '../src/components/SupportFab/useSupportNudge.js';

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

import { useEffect, useState } from "react";

/**
 * Llamada de atención del botón de soporte: pasados unos segundos, un rebote corto, un
 * clic muy suave y el tooltip abierto. El directorio es una pared de logos de colores y
 * un botón azul en una esquina se pierde dentro.
 *
 * Reglas para que no sea intrusivo:
 * - Una sola vez por persona (`localStorage`), no en cada visita.
 * - Nunca si ya ha abierto el panel, ni si hay un modal abierto por encima.
 * - Sin rebote si el sistema pide movimiento reducido.
 * - Si la persona está haciendo scroll justo en ese momento, el aviso espera: aparecer y
 *   desaparecer en mitad de un desplazamiento es el peor momento posible.
 * - El sonido es opcional por definición: los navegadores bloquean el audio hasta que la
 *   persona ha interactuado con la página. Se abre un `AudioContext` en el primer gesto
 *   (clic, tecla o toque) y se reutiliza para el clic del aviso. Si el aviso llega antes
 *   de cualquier gesto, no suena, y no pasa nada: el mensaje son el rebote y el tooltip.
 */
const STORAGE_KEY = "support-fab-nudge-seen";
const DELAY_MS = 7000;
const VISIBLE_MS = 7000;
/** Cuánto silencio hace falta tras el último scroll para considerar que ha parado. */
const SCROLL_QUIET_MS = 900;

export function hasSeenSupportNudge() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Sin localStorage (modo privado, cookies bloqueadas) se avisa una vez por carga.
    return false;
  }
}

function markSupportNudgeSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Que no se pueda recordar no es motivo para romper nada.
  }
}

/**
 * ¿Toca enseñar el aviso ya, o hay que esperar a que pare el scroll?
 *
 * Función pura para poder probarla sin DOM: devuelve 0 si se puede mostrar y, si no, los
 * milisegundos que faltan para reintentar.
 */
export function resolveNudgeDelay({ lastScrollAt = 0, now = Date.now(), quietMs = SCROLL_QUIET_MS } = {}) {
  if (!lastScrollAt) return 0;

  const sinceScroll = now - lastScrollAt;
  return sinceScroll >= quietMs ? 0 : quietMs - sinceScroll;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * `AudioContext` abierto en el primer gesto de la persona. Crearlo antes no sirve: nace
 * `suspended` y el navegador no lo deja sonar.
 */
let unlockedContext = null;

export function unlockNudgeAudio() {
  if (unlockedContext) return unlockedContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    const context = new AudioContextClass();
    context.resume?.();
    unlockedContext = context;
    return context;
  } catch {
    return null;
  }
}

export function releaseNudgeAudio() {
  unlockedContext?.close?.();
  unlockedContext = null;
}

/**
 * Un clic corto sintetizado, sin fichero de audio que descargar. Volumen muy bajo y 60 ms:
 * la idea es que se note, no que sobresalte.
 */
export function playNudgeClick() {
  const context = unlockedContext ?? unlockNudgeAudio();
  if (!context) return false;

  try {
    // Sigue bloqueado: no ha habido gesto todavía. Se abandona en silencio en vez de
    // encolar un sonido que saltaría más tarde sin venir a cuento.
    if (context.state === "suspended") return false;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.06);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.07);

    return true;
  } catch {
    return false;
  }
}

export function useSupportNudge({ isPanelOpen, enabled = true }) {
  const [isNudging, setIsNudging] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);

  // Se abre el audio en cuanto haya un gesto, aunque el aviso aún no toque: es la única
  // ventana en la que el navegador lo permite.
  useEffect(() => {
    if (!enabled || hasSeenSupportNudge()) return undefined;

    const unlock = () => unlockNudgeAudio();
    const events = ["pointerdown", "keydown", "touchstart"];

    events.forEach((type) => window.addEventListener(type, unlock, { once: true, passive: true }));

    return () => {
      events.forEach((type) => window.removeEventListener(type, unlock));
      releaseNudgeAudio();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || isPanelOpen || hasSeenSupportNudge()) return undefined;

    let lastScrollAt = 0;
    let timer = null;

    const noteScroll = () => {
      lastScrollAt = Date.now();
    };

    const show = () => {
      // Si mientras tanto se ha abierto una ficha o el modal de datos, el aviso estorbaría.
      if (document.querySelector('[role="dialog"]')) return;

      // En mitad de un scroll no se ve: se reintenta cuando la página esté quieta.
      const wait = resolveNudgeDelay({ lastScrollAt });
      if (wait > 0) {
        timer = setTimeout(show, wait);
        return;
      }

      markSupportNudgeSeen();
      setIsNudging(true);
      setShouldBounce(!prefersReducedMotion());
      playNudgeClick();
    };

    window.addEventListener('scroll', noteScroll, { passive: true });
    timer = setTimeout(show, DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', noteScroll);
    };
  }, [enabled, isPanelOpen]);

  /**
   * El tooltip se retira solo, o cuando la persona toca algo. **No** con el scroll: seguir
   * leyendo la página no es haber visto el aviso, y ocultarlo mientras se desplaza hace que
   * desaparezca justo cuando nadie está mirando esa esquina.
   */
  useEffect(() => {
    if (!isNudging) return undefined;

    const dismiss = () => setIsNudging(false);
    const timer = setTimeout(dismiss, VISIBLE_MS);

    window.addEventListener("pointerdown", dismiss, { once: true });
    window.addEventListener("keydown", dismiss, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [isNudging]);

  /**
   * Quien ya ha abierto el panel ha encontrado el botón: avisarle después sería insistir
   * sobre algo que ya sabe. Se marca como visto para que no vuelva a saltar.
   */
  useEffect(() => {
    if (!isPanelOpen) return;

    setIsNudging(false);
    markSupportNudgeSeen();
  }, [isPanelOpen]);

  return { isNudging, shouldBounce, dismissNudge: () => setIsNudging(false) };
}

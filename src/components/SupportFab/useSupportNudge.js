import { useEffect, useState } from "react";

/**
 * Llamada de atención del botón flotante: pasado un rato, un rebote corto, un clic muy
 * suave y el tooltip abierto. El directorio es una pared de logos de colores y un botón
 * en una esquina se pierde dentro.
 *
 * Reglas para que no sea intrusivo:
 * - **Solo después de que el directorio haya servido para algo.** El botón pide ayuda
 *   para la iniciativa: pedírsela a alguien que acaba de llegar y aún no ha visto nada es
 *   mendigar antes de dar. Cuentan como señal de valor abrir una ficha o cualquier
 *   diálogo, usar la búsqueda o los filtros, y leer hacia abajo más de una pantalla.
 * - Hay además un suelo de tiempo (`MIN_MS`) y un techo (`FALLBACK_MS`): quien se queda
 *   un minuto leyendo sin tocar nada también está usando el directorio.
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
/** Suelo: ni con señal de valor inmediata se avisa antes de esto. */
const MIN_MS = 7000;
/** Techo: sin ninguna señal, a partir de aquí se avisa igual. */
const FALLBACK_MS = 60000;
const VISIBLE_MS = 7000;
/** Cada cuánto se vuelve a mirar si ya toca. */
const TICK_MS = 1000;
/** Pantallas leídas que cuentan como "ha mirado el directorio". */
const SCROLL_DEPTH_RATIO = 1.2;
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

/**
 * ¿Toca avisar ya? Función pura para poder probar el disparador sin DOM ni temporizadores.
 *
 * Devuelve `{ show, retryInMs }`: si `show` es `false`, `retryInMs` dice cuándo volver a
 * preguntar. Nunca devuelve "no, y no vuelvas a preguntar": el aviso se pospone, no se
 * descarta, porque la señal de valor puede llegar en cualquier momento.
 */
export function resolveNudgeTrigger({
  elapsedMs = 0,
  isDialogOpen = false,
  hasOpenedDialog = false,
  hasUsedControls = false,
  scrolledPx = 0,
  viewportHeight = 0,
  lastScrollAt = 0,
  now = Date.now(),
  minMs = MIN_MS,
  fallbackMs = FALLBACK_MS,
  quietMs = SCROLL_QUIET_MS,
  tickMs = TICK_MS,
} = {}) {
  // Con una ficha o el modal de datos delante, el aviso estorba y además no se ve.
  if (isDialogOpen) return { show: false, retryInMs: tickMs };

  if (elapsedMs < minMs) return { show: false, retryInMs: minMs - elapsedMs };

  const hasReadEnough = viewportHeight > 0 && scrolledPx >= viewportHeight * SCROLL_DEPTH_RATIO;
  const hasValueSignal = hasOpenedDialog || hasUsedControls || hasReadEnough;

  // Sin señal, se espera al techo: quien lleva un minuto en la página también está usando
  // el directorio, aunque no haya tocado nada.
  if (!hasValueSignal && elapsedMs < fallbackMs) {
    return { show: false, retryInMs: Math.min(tickMs, fallbackMs - elapsedMs) };
  }

  const quietWait = resolveNudgeDelay({ lastScrollAt, now, quietMs });
  if (quietWait > 0) return { show: false, retryInMs: quietWait };

  return { show: true, retryInMs: 0 };
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

    const startedAt = Date.now();
    let lastScrollAt = 0;
    let scrolledPx = 0;
    let hasOpenedDialog = false;
    let hasUsedControls = false;
    let timer = null;

    const noteScroll = () => {
      lastScrollAt = Date.now();
      scrolledPx = Math.max(scrolledPx, window.scrollY || 0);
    };

    // Escribir en la búsqueda o mover un filtro es la señal más clara de que alguien está
    // usando el directorio de verdad, y llega antes que el scroll en pantallas grandes.
    const noteControls = () => {
      hasUsedControls = true;
    };

    const tick = () => {
      const isDialogOpen = Boolean(document.querySelector('[role="dialog"]'));
      if (isDialogOpen) hasOpenedDialog = true;

      const { show, retryInMs } = resolveNudgeTrigger({
        elapsedMs: Date.now() - startedAt,
        isDialogOpen,
        hasOpenedDialog,
        hasUsedControls,
        scrolledPx,
        viewportHeight: window.innerHeight || 0,
        lastScrollAt,
      });

      if (!show) {
        timer = setTimeout(tick, Math.max(retryInMs, 50));
        return;
      }

      markSupportNudgeSeen();
      setIsNudging(true);
      setShouldBounce(!prefersReducedMotion());
      playNudgeClick();
    };

    window.addEventListener('scroll', noteScroll, { passive: true });
    window.addEventListener('change', noteControls, { passive: true, capture: true });
    window.addEventListener('input', noteControls, { passive: true, capture: true });
    timer = setTimeout(tick, MIN_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', noteScroll);
      window.removeEventListener('change', noteControls, { capture: true });
      window.removeEventListener('input', noteControls, { capture: true });
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

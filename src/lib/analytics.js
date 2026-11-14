/**
 * Carga de Google Tag Manager, siempre por detrás del consentimiento.
 *
 * El contenedor **no se carga hasta que alguien dice que sí**: así, para quien rechaza
 * o no responde, no hay ni una petición a Google, no sólo cookies de menos. Lo único
 * que mide a todo el mundo es LibreCounter (el icono del pie), que no usa cookies ni
 * identifica a nadie: cuenta visitas por dominio y publica el total.
 *
 * El `dataLayer` y el `consent default: denied` se declaran en `index.html`, antes de
 * que arranque React: Consent Mode exige que el estado por defecto llegue antes que
 * cualquier etiqueta, y aquí sólo se sube a "granted".
 */

export const GTM_CONTAINER_ID = "GTM-MT4LP53K";
const GTM_SCRIPT_ID = "gtm-script";

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

/**
 * gtag.js lee la cola esperando objetos `arguments`, no arrays. Por eso esta función
 * usa `arguments` tal cual en vez de los parámetros con nombre.
 */
function pushArgs() {
  const win = getWindow();
  if (!win) return;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(arguments);
}

/** Sube el consentimiento de analítica. Idempotente: repetirlo no mide dos veces. */
export function grantAnalyticsStorage() {
  pushArgs("consent", "update", {
    analytics_storage: "granted",
  });
}

/** Carga `gtm.js` una sola vez, aunque se llame en cada render o tras un reintento. */
export function loadGtm(containerId = GTM_CONTAINER_ID) {
  const win = getWindow();
  if (!win || typeof document === "undefined") return false;
  if (document.getElementById(GTM_SCRIPT_ID)) return false;

  const script = document.createElement("script");
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
  return true;
}

/** Lo que se ejecuta al conceder el consentimiento: subirlo y, entonces, cargar GTM. */
export function enableAnalytics(containerId = GTM_CONTAINER_ID) {
  grantAnalyticsStorage();
  return loadGtm(containerId);
}

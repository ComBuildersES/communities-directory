/**
 * Abrir el botón flotante desde fuera.
 *
 * El popover "Sobre el proyecto" de la cabecera ya no explica cómo colaborar: ese contenido
 * vive ahora en la vista "Quiero ayudar" del FAB, y el popover solo lleva allí. Cabecera y
 * FAB son hermanos colgando de `App`, así que o se sube el estado y se baja por props a
 * través de todo `Heading`, o se avisa por un evento. Lo segundo deja el estado del panel
 * donde vive (dentro del propio FAB) y no obliga a que nada intermedio sepa de esto.
 */
const EVENT = "support-fab:open";

/** @param {"help"|"give"|null} intent Vista con la que abrir; `null` deja la pregunta inicial. */
export function openSupportFab(intent = null) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { intent } }));
}

export function subscribeToSupportFabOpen(handler) {
  const listener = (event) => handler(event.detail?.intent ?? null);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

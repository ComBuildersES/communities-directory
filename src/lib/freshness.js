/**
 * Revalidación silenciosa del listado.
 *
 * Volver a la pestaña vuelve a pedir `communities.json` para no mostrar datos viejos. Antes
 * esa comprobación bloqueaba la lectura: mientras corría, la ficha abierta se cerraba y en su
 * hueco aparecía un aviso. Alt-tab era suficiente para perder el detalle que estabas leyendo.
 *
 * Ahora la comprobación es silenciosa y solo la **edición** espera a confirmar la última
 * versión: una propuesta construida sobre datos viejos pisa cambios ajenos, mientras que leer
 * una ficha diez minutos desactualizada no hace daño a nadie.
 */

/** Dos vueltas a la pestaña seguidas no vuelven a pedir los datos. */
export const FRESH_DATA_MIN_INTERVAL_MS = 60_000;

/**
 * ¿Toca revalidar el listado?
 *
 * Función pura para poder testear el throttle sin montar la app.
 */
export function shouldRevalidateFreshData({
  isOnline = true,
  isRefreshing = false,
  isEditing = false,
  hasFreshData = false,
  lastFreshAt = null,
  now = Date.now(),
  minIntervalMs = FRESH_DATA_MIN_INTERVAL_MS,
} = {}) {
  if (!isOnline) return false;
  if (isRefreshing) return false;
  // Con el formulario abierto, recargar los datos movería el suelo bajo lo que se está
  // escribiendo. La edición ya espera a tener datos frescos antes de montarse.
  if (isEditing) return false;
  // Nunca llegamos a confirmar la última versión: reintentar es justo lo que desbloquea la
  // edición, así que aquí el throttle no aplica.
  if (!hasFreshData) return true;
  if (lastFreshAt == null) return true;
  return now - lastFreshAt >= minIntervalMs;
}

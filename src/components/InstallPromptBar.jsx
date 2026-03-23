import { useEffect, useMemo, useState } from "react";
import {
  getInstallBannerState,
  isIosDevice,
  isStandaloneMode,
  setInstallBannerState,
} from "../lib/pwa";

const DISMISSED_STATE = "dismissed";
const INSTALLED_STATE = "installed";

export function InstallPromptBar () {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const isIos = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    if (getInstallBannerState() || isStandaloneMode()) {
      return;
    }

    setIsVisible(true);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallAvailable(true);
    };

    const handleInstalled = () => {
      setInstallBannerState(INSTALLED_STATE);
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      setIsInstallAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (!isVisible || isInstalled) {
    return null;
  }

  const dismissBanner = () => {
    setInstallBannerState(DISMISSED_STATE);
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallBannerState(INSTALLED_STATE);
      setIsVisible(false);
    } else {
      setInstallBannerState(DISMISSED_STATE);
      setIsVisible(false);
    }

    setDeferredPrompt(null);
    setIsInstallAvailable(false);
  };

  return (
    <section className="install-prompt-bar" role="status" aria-live="polite">
      <div className="install-prompt-bar__content">
        <div>
          <p className="install-prompt-bar__eyebrow">Instálala en tu móvil</p>
          <p className="install-prompt-bar__text">
            Guarda el directorio en la pantalla de inicio para abrirlo como una app y volver más rápido.
          </p>
        </div>
        <div className="install-prompt-bar__actions">
          {isInstallAvailable && (
            <button type="button" className="button is-primary is-small" onClick={handleInstall}>
              Instalar app
            </button>
          )}
          {!isInstallAvailable && isIos && (
            <p className="install-prompt-bar__hint">
              En Safari: Compartir <span aria-hidden="true">→</span> Añadir a pantalla de inicio
            </p>
          )}
          {!isInstallAvailable && !isIos && (
            <p className="install-prompt-bar__hint">
              Si tu navegador lo permite, verás la opción de instalarla desde el menú.
            </p>
          )}
          <button
            type="button"
            className="install-prompt-bar__dismiss"
            onClick={dismissBanner}
            aria-label="Cerrar aviso de instalación"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

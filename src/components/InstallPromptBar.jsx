import { useEffect, useMemo, useState } from "react";
import {
  getInstallBannerState,
  isIosDevice,
  isStandaloneMode,
  setInstallBannerState,
  shouldShowInstallPrompt,
} from "../lib/pwa";

const DISMISSED_STATE = "dismissed";
const INSTALLED_STATE = "installed";

export function InstallPromptBar () {
  const isIos = useMemo(() => isIosDevice(), []);
  const [isVisible, setIsVisible] = useState(() => isIos);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    if (getInstallBannerState() || isStandaloneMode() || !shouldShowInstallPrompt()) {
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallAvailable(true);
      setIsVisible(true);
    };

    const handleInstalled = () => {
      setInstallBannerState(INSTALLED_STATE);
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      setIsInstallAvailable(false);
    };

    if (isIos) {
      setIsVisible(true);
    }

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
        <p className="install-prompt-bar__text">
          Guarda esta web como app para abrir el directorio más rápido desde tu móvil.
        </p>
        <div className="install-prompt-bar__actions">
          {isInstallAvailable && (
            <button type="button" className="button is-primary is-small install-prompt-bar__button" onClick={handleInstall}>
              Instalar
            </button>
          )}
          {!isInstallAvailable && isIos && (
            <p className="install-prompt-bar__hint">
              Safari: Compartir <span aria-hidden="true">→</span> Añadir a pantalla de inicio
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

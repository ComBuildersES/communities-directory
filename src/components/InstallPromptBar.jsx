import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  applyServiceWorkerUpdate,
  getInstallBannerState,
  isIosDevice,
  isStandaloneMode,
  setInstallBannerState,
  shouldShowInstallPrompt,
  subscribeToServiceWorkerUpdate,
} from "../lib/pwa";

const DISMISSED_STATE = "dismissed";
const INSTALLED_STATE = "installed";

export function InstallPromptBar () {
  const { t } = useTranslation();
  const isIos = useMemo(() => isIosDevice(), []);
  const [isVisible, setIsVisible] = useState(() => isIos);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isReloadingUpdate, setIsReloadingUpdate] = useState(false);

  useEffect(() => {
    let hasReloadedForUpdate = false;

    const unsubscribe = subscribeToServiceWorkerUpdate(() => {
      setIsUpdateAvailable(true);
      setIsVisible(true);
    });

    const handleControllerChange = () => {
      if (hasReloadedForUpdate) {
        return;
      }

      hasReloadedForUpdate = true;
      window.location.reload();
    };

    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      unsubscribe();
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

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
  }, [isIos]);

  if (!isVisible || (isInstalled && !isUpdateAvailable)) {
    return null;
  }

  const dismissBanner = () => {
    if (isUpdateAvailable) {
      setIsVisible(false);
      return;
    }

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

  const handleUpdate = () => {
    const hasSentUpdateSignal = applyServiceWorkerUpdate();

    if (!hasSentUpdateSignal) {
      window.location.reload();
      return;
    }

    setIsReloadingUpdate(true);
  };

  return (
    <section className="install-prompt-bar" role="status" aria-live="polite">
      <div className="install-prompt-bar__content">
        <p className="install-prompt-bar__text">
          {isUpdateAvailable
            ? t("installPromptBar.updateAvailable")
            : t("installPromptBar.installHint")}
        </p>
        <div className="install-prompt-bar__actions">
          {isUpdateAvailable && (
            <button
              type="button"
              className="button is-primary is-small install-prompt-bar__button"
              onClick={handleUpdate}
              disabled={isReloadingUpdate}
            >
              {isReloadingUpdate ? t("installPromptBar.updating") : t("installPromptBar.reload")}
            </button>
          )}
          {isInstallAvailable && (
            <button type="button" className="button is-primary is-small install-prompt-bar__button" onClick={handleInstall}>
              {t("installPromptBar.install")}
            </button>
          )}
          {!isUpdateAvailable && !isInstallAvailable && isIos && (
            <p className="install-prompt-bar__hint">
              {t("installPromptBar.iosHintPrefix")} <span aria-hidden="true">→</span> {t("installPromptBar.iosHintSuffix")}
            </p>
          )}
          {!isUpdateAvailable && (
            <button
              type="button"
              className="install-prompt-bar__dismiss"
              onClick={dismissBanner}
              aria-label={t("installPromptBar.closeAriaLabel")}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

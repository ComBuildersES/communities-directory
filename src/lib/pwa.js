const INSTALL_BANNER_STORAGE_KEY = "pwa-install-banner-v1";
const SW_UPDATE_EVENT = "community-builders:sw-update";

let currentWaitingWorker = null;

function emitServiceWorkerUpdate(worker) {
  if (!worker) {
    return;
  }

  currentWaitingWorker = worker;
  window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT));
}

function watchServiceWorkerRegistration(registration) {
  if (registration.waiting) {
    emitServiceWorkerUpdate(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const installingWorker = registration.installing;

    if (!installingWorker) {
      return;
    }

    installingWorker.addEventListener("statechange", () => {
      if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
        emitServiceWorkerUpdate(installingWorker);
      }
    });
  });
}

export function registerServiceWorker () {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        watchServiceWorkerRegistration(registration);
      })
      .catch((error) => {
        console.error("No se pudo registrar el service worker", error);
      });
  });
}

export function subscribeToServiceWorkerUpdate(callback) {
  const handler = () => callback();

  window.addEventListener(SW_UPDATE_EVENT, handler);

  if (currentWaitingWorker) {
    callback();
  }

  return () => window.removeEventListener(SW_UPDATE_EVENT, handler);
}

export function applyServiceWorkerUpdate () {
  if (!currentWaitingWorker) {
    return false;
  }

  currentWaitingWorker.postMessage({ type: "SKIP_WAITING" });
  return true;
}

export function isStandaloneMode () {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function isIosDevice () {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function shouldShowInstallPrompt () {
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const isMobileViewport = window.matchMedia("(max-width: 1023px)").matches;

  return isTouchDevice || isMobileViewport || isIosDevice();
}

export function getInstallBannerState () {
  return window.localStorage.getItem(INSTALL_BANNER_STORAGE_KEY);
}

export function setInstallBannerState (value) {
  window.localStorage.setItem(INSTALL_BANNER_STORAGE_KEY, value);
}

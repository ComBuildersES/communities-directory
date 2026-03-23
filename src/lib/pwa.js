const INSTALL_BANNER_STORAGE_KEY = "pwa-install-banner-v1";

export function registerServiceWorker () {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}

export function isStandaloneMode () {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function isIosDevice () {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function getInstallBannerState () {
  return window.localStorage.getItem(INSTALL_BANNER_STORAGE_KEY);
}

export function setInstallBannerState (value) {
  window.localStorage.setItem(INSTALL_BANNER_STORAGE_KEY, value);
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { registerServiceWorker } from "./lib/pwa";
import { SUPPORTED_LOCALES } from "./i18n/index.js";

// Ensure the URL always has a valid locale path prefix.
// e.g. /communities-directory/ → /communities-directory/es/
// This runs after the index.html path-restore snippet, so deep links
// like /communities-directory/en/ are already correct at this point.
(function redirectToLocale() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname;
  const afterBase = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname;
  const firstSegment = afterBase.split("/").filter(Boolean)[0];

  if (!SUPPORTED_LOCALES.includes(firstSegment)) {
    // Detect locale directly — do not rely on i18n.resolvedLanguage timing.
    // Mirrors the i18next-browser-languagedetector order: localStorage → navigator.
    const locale = (function detectLocale() {
      const stored = localStorage.getItem("preferred-locale");
      if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

      const langs = navigator.languages?.length
        ? navigator.languages
        : [navigator.language || "es"];
      for (const lang of langs) {
        const code = lang.split("-")[0].toLowerCase();
        if (SUPPORTED_LOCALES.includes(code)) return code;
      }

      return "es";
    })();

    window.history.replaceState(
      null,
      "",
      `${base}/${locale}/${window.location.search}${window.location.hash}`
    );
  }
})();

registerServiceWorker();

createRoot(document.getElementById("search_app")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

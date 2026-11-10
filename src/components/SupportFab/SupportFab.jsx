import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSupportNudge } from "./useSupportNudge.js";
import "./SupportFab.css";

/**
 * Grupo de Telegram de soporte. **Es el único sitio donde hay que ponerlo**: en cuanto
 * tenga valor, aparece como primera opción del botón flotante; mientras esté vacío, el
 * botón ofrece los canales que ya existen en vez de enlazar a ninguna parte.
 */
const TELEGRAM_GROUP_URL = "https://t.me/+bUyya_Rzv6cxYmE0";

const GITHUB_ISSUES_URL = "https://github.com/ComBuildersES/communities-directory/issues";
const MAILING_LIST_URL = "https://groups.google.com/g/community-builders-es";
const LINKTREE_URL = "https://linktr.ee/ComBuilders_ES";

export function SupportFab() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { isNudging, shouldBounce, dismissNudge } = useSupportNudge({ isPanelOpen: isOpen });

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const channels = [
    TELEGRAM_GROUP_URL && {
      key: "telegram",
      href: TELEGRAM_GROUP_URL,
      icon: "fa-brands fa-telegram",
      label: t("support.telegram"),
      hint: t("support.telegramHint"),
    },
    {
      key: "github",
      href: GITHUB_ISSUES_URL,
      icon: "fa-brands fa-github",
      label: t("support.github"),
      hint: t("support.githubHint"),
    },
    {
      key: "mailingList",
      href: MAILING_LIST_URL,
      icon: "fas fa-envelope",
      label: t("support.mailingList"),
      hint: t("support.mailingListHint"),
    },
    {
      key: "linktree",
      href: LINKTREE_URL,
      icon: "fas fa-link",
      label: t("support.linktree"),
      hint: t("support.linktreeHint"),
    },
  ].filter(Boolean);

  return (
    <div className="support-fab" ref={containerRef}>
      {isOpen && (
        <div className="support-fab-panel" role="dialog" aria-label={t("support.title")}>
          <p className="support-fab-title">{t("support.title")}</p>
          <p className="support-fab-copy">{t("support.copy")}</p>
          <ul className="support-fab-channels">
            {channels.map(({ key, href, icon, label, hint }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="support-fab-channel">
                  <i className={icon}></i>
                  <span>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isNudging && !isOpen && (
        <div className="support-fab-tooltip" role="status">
          {t("support.title")}
          <button
            type="button"
            className="support-fab-tooltip-close"
            onClick={dismissNudge}
            aria-label={t("support.close")}
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      )}

      <button
        type="button"
        className={[
          "support-fab-button",
          isOpen ? "support-fab-button--open" : "",
          shouldBounce && isNudging && !isOpen ? "support-fab-button--nudge" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? t("support.close") : t("support.title")}
        title={t("support.title")}
      >
        <i className={`fas ${isOpen ? "fa-xmark" : "fa-comments"}`}></i>
        {!isOpen && <span className="support-fab-button-label">{t("support.fabLabel")}</span>}
      </button>
    </div>
  );
}

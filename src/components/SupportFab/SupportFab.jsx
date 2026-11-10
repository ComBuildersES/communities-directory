/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildShareLinks } from "../../lib/shareLinks.js";
import { subscribeToSupportFabOpen } from "../../lib/supportFab.js";
import { useSupportNudge } from "./useSupportNudge.js";
import "./SupportFab.css";

/**
 * Grupo de Telegram. **Es el único sitio donde hay que ponerlo**: en cuanto tenga valor,
 * hablar por Telegram es la llamada principal de las dos vistas del panel; mientras esté
 * vacío, el panel cae a los canales que quedan en vez de enlazar a ninguna parte.
 */
const TELEGRAM_GROUP_URL = "https://t.me/+bUyya_Rzv6cxYmE0";

const GITHUB_ISSUES_URL = "https://github.com/ComBuildersES/communities-directory/issues";
const MAILING_LIST_URL = "https://groups.google.com/g/community-builders-es";
const LINKTREE_URL = "https://linktr.ee/ComBuilders_ES";
const CONTRIBUTING_URL = "https://github.com/ComBuildersES/communities-directory/blob/master/CONTRIBUTING.md";
/** Issue abierto pidiendo responsables provinciales: es la necesidad más concreta que hay. */
const PROVINCIAL_MAINTAINERS_URL = "https://github.com/ComBuildersES/communities-directory/issues/53";

function Channel({ icon, label, hint, href, onClick }) {
  const content = (
    <>
      <i className={icon}></i>
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="support-fab-channel">
        {content}
      </a>
    );
  }

  return (
    <button type="button" className="support-fab-channel" onClick={onClick}>
      {content}
    </button>
  );
}

/**
 * Botón flotante. Lo primero que hace es **preguntar**: quien llega puede necesitar ayuda
 * o querer darla, y son dos conversaciones distintas. Mezclarlas obligaba a que una de las
 * dos fuera el titular y la otra se leyera como letra pequeña.
 *
 * - "Necesito ayuda" es el panel de soporte de siempre: dudas, datos mal, dar de alta.
 * - "Quiero ayudar" es apoyo a la iniciativa, y ahí la vía preferente es hablar: cada
 *   persona puede ayudar en algo distinto y eso no se resuelve con una lista de enlaces.
 */
export function SupportFab({ onAddCommunity }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // null = la pregunta inicial. "help" | "give" = una de las dos vistas.
  const [intent, setIntent] = useState(null);
  const containerRef = useRef(null);
  const { isNudging, shouldBounce, dismissNudge } = useSupportNudge({ isPanelOpen: isOpen });
  const shareLinks = useMemo(() => buildShareLinks(t), [t]);

  const closePanel = () => {
    setIsOpen(false);
    setIntent(null);
  };

  // Alguien pide abrirlo desde fuera (hoy, el popover "Sobre el proyecto").
  useEffect(() => subscribeToSupportFabOpen((requestedIntent) => {
    setIntent(requestedIntent);
    setIsOpen(true);
  }), []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) closePanel();
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      // Escape vuelve a la pregunta antes de cerrar: perder el panel entero por querer
      // cambiar de opción obliga a empezar de cero.
      if (intent) setIntent(null);
      else closePanel();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, intent]);

  const goToRecord = () => {
    closePanel();
    onAddCommunity?.();
  };

  const helpChannels = [
    TELEGRAM_GROUP_URL && {
      key: "telegram",
      href: TELEGRAM_GROUP_URL,
      icon: "fa-brands fa-telegram",
      label: t("support.help.telegram"),
      hint: t("support.help.telegramHint"),
    },
    onAddCommunity && {
      key: "record",
      icon: "fas fa-id-card",
      label: t("support.help.record"),
      hint: t("support.help.recordHint"),
      onClick: goToRecord,
    },
    {
      key: "github",
      href: GITHUB_ISSUES_URL,
      icon: "fa-brands fa-github",
      label: t("support.help.github"),
      hint: t("support.help.githubHint"),
    },
    {
      key: "mailingList",
      href: MAILING_LIST_URL,
      icon: "fas fa-envelope",
      label: t("support.help.mailingList"),
      hint: t("support.help.mailingListHint"),
    },
    {
      key: "linktree",
      href: LINKTREE_URL,
      icon: "fas fa-link",
      label: t("support.help.linktree"),
      hint: t("support.help.linktreeHint"),
    },
  ].filter(Boolean);

  const giveChannels = [
    onAddCommunity && {
      key: "record",
      icon: "fas fa-id-card",
      label: t("support.give.record"),
      hint: t("support.give.recordHint"),
      onClick: goToRecord,
    },
    {
      key: "github",
      href: GITHUB_ISSUES_URL,
      icon: "fa-brands fa-github",
      label: t("support.give.github"),
      hint: t("support.give.githubHint"),
    },
    {
      key: "contributing",
      href: CONTRIBUTING_URL,
      icon: "fas fa-book",
      label: t("support.give.contributing"),
      hint: t("support.give.contributingHint"),
    },
    {
      key: "mailingList",
      href: MAILING_LIST_URL,
      icon: "fas fa-envelope",
      label: t("support.give.mailingList"),
      hint: t("support.give.mailingListHint"),
    },
  ].filter(Boolean);

  return (
    <div className="support-fab" ref={containerRef}>
      {isOpen && (
        <div className="support-fab-panel" role="dialog" aria-label={t("support.title")}>
          {!intent && (
            <>
              <p className="support-fab-title">{t("support.title")}</p>
              <div className="support-fab-chooser">
                <button
                  type="button"
                  className="support-fab-choice"
                  onClick={() => setIntent("help")}
                >
                  <i className="fas fa-life-ring"></i>
                  <span>
                    <strong>{t("support.chooser.help")}</strong>
                    <small>{t("support.chooser.helpHint")}</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="support-fab-choice support-fab-choice--give"
                  onClick={() => setIntent("give")}
                >
                  <i className="fas fa-hand-holding-heart"></i>
                  <span>
                    <strong>{t("support.chooser.give")}</strong>
                    <small>{t("support.chooser.giveHint")}</small>
                  </span>
                </button>
              </div>
            </>
          )}

          {intent && (
            <>
              <button type="button" className="support-fab-back" onClick={() => setIntent(null)}>
                <i className="fas fa-arrow-left"></i> {t("support.back")}
              </button>
              <p className="support-fab-title">{t(`support.${intent}.title`)}</p>
              <p className="support-fab-copy">{t(`support.${intent}.copy`)}</p>
            </>
          )}

          {intent === "give" && (
            <>
              {TELEGRAM_GROUP_URL && (
                <a
                  href={TELEGRAM_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-fab-cta"
                >
                  <i className="fa-brands fa-telegram"></i>
                  <span>
                    <strong>{t("support.give.talk")}</strong>
                    <small>{t("support.give.talkHint")}</small>
                  </span>
                </a>
              )}

              <div className="support-fab-need">
                <p className="support-fab-need-title">
                  <i className="fas fa-map-location-dot"></i> {t("support.give.needTitle")}
                </p>
                <p className="support-fab-need-copy">{t("support.give.needCopy")}</p>
                <a
                  href={PROVINCIAL_MAINTAINERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-fab-need-link"
                >
                  {t("support.give.needCta")} <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              <p className="support-fab-ways-title">{t("support.give.waysTitle")}</p>

              <div className="support-fab-share">
                <p className="support-fab-share-label">
                  <i className="fas fa-bullhorn"></i> {t("support.give.share")}
                </p>
                <div className="support-fab-share-buttons">
                  {shareLinks.map(({ label, icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-fab-share-btn"
                      title={t("support.give.shareOn", { platform: label })}
                      aria-label={t("support.give.shareOn", { platform: label })}
                    >
                      <i className={icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {intent && (
            <ul className="support-fab-channels">
              {(intent === "help" ? helpChannels : giveChannels).map((channel) => (
                <li key={channel.key}>
                  <Channel {...channel} />
                </li>
              ))}
            </ul>
          )}
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
        onClick={() => (isOpen ? closePanel() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? t("support.close") : t("support.title")}
        title={t("support.title")}
      >
        <i className={`fas ${isOpen ? "fa-xmark" : "fa-comments"}`}></i>
      </button>
    </div>
  );
}

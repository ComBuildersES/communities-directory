/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OpenDataModal } from "../OpenDataModal/OpenDataModal.jsx";
import { ContributeCommunityGuide } from "./ContributeCommunityGuide.jsx";
import { FindCommunityGuide } from "./FindCommunityGuide.jsx";
import { OrganizeCommunityGuide } from "./OrganizeCommunityGuide.jsx";
import { openSupportFab } from "../../lib/supportFab.js";
import { useSidebarActions } from "../../stores/sidebar.store.js";
import "./DirectoryGuideModal.css";

const ENTRIES = [
  { id: "find", icon: "fa-magnifying-glass" },
  { id: "contribute", icon: "fa-hand-holding-heart" },
  { id: "organize", icon: "fa-people-group" },
  { id: "improve", icon: "fa-pen-to-square" },
  { id: "build", icon: "fa-code" },
  { id: "other", icon: "fa-circle-question" },
];
// Se conserva el contenido actual mientras se revisa cada recorrido de la fase 2.
const EXISTING_TABS = { improve: "organizers", build: "build", reuse: "build" };

export function DirectoryGuideModal({ onClose, onAddCommunity, onShowMap, onSelectMember, returnFocusRef }) {
  const { t } = useTranslation();
  const [screen, setScreen] = useState("menu");
  const boxRef = useRef(null);
  const headingRef = useRef(null);
  const { setSidebarVisibility } = useSidebarActions();
  const legacyTab = EXISTING_TABS[screen];

  useEffect(() => {
    const returnTarget = returnFocusRef?.current ?? document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      returnTarget?.focus();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    if (legacyTab) return;
    boxRef.current?.scrollTo(0, 0);
    headingRef.current?.focus();
    const handleKeyDown = (event) => {
      // La ayuda contextual se cierra antes que el recorrido que la contiene.
      if (event.key === "Escape" && !document.querySelector('[role="tooltip"]')) onClose();
      if (event.key !== "Tab") return;
      const controls = [...boxRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], summary, [tabindex="0"]')]
        .filter((el) => el.getClientRects().length && el.tabIndex >= 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [legacyTab, screen, onClose]);

  const openEntry = (id) => {
    if (id === "other") {
      onClose();
      openSupportFab();
    } else setScreen(id);
  };
  const leaveFor = (action) => { onClose(); requestAnimationFrame(action); };
  const focusSearch = () => {
    const input = document.querySelector(".tag-search-input");
    input?.scrollIntoView({ block: "center", behavior: "instant" });
    input?.focus({ preventScroll: true });
  };

  if (legacyTab) return (
    <OpenDataModal
      key={screen}
      initialTab={legacyTab}
      onClose={onClose}
      onBack={() => setScreen("menu")}
      onAddCommunity={onAddCommunity}
    />
  );

  return (
    <div className="opendata-modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="opendata-modal-box directory-guide" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="directory-guide-title">
        <button type="button" className="opendata-modal-close" onClick={onClose} aria-label={t("openData.close")}><i className="fas fa-xmark" aria-hidden="true"></i></button>
        {screen !== "menu" && <button type="button" className="opendata-footer-btn guide-back" onClick={() => setScreen("menu")}><i className="fas fa-arrow-left" aria-hidden="true"></i>{t("directoryGuide.back")}</button>}
        <header className="opendata-modal-header">
          <h2 id="directory-guide-title" ref={headingRef} tabIndex={-1} className="opendata-modal-title">{t(screen === "menu" ? "heading.guideCta" : `directoryGuide.${screen}.title`)}</h2>
          {screen === "menu" && <p className="opendata-modal-subtitle">{t("directoryGuide.intro")} <strong>open data</strong>.</p>}
          {screen !== "menu" && <p className="opendata-modal-subtitle">{t(`directoryGuide.${screen}.lead`)}</p>}
        </header>
        {screen === "menu" ? (
          <div className="guide-menu">
            {ENTRIES.map(({ id, icon }) => (
              <button type="button" className="guide-entry" key={id} onClick={() => openEntry(id)}>
                <i className={`fas ${icon}`} aria-hidden="true"></i>
                <span><strong>{t(`directoryGuide.${id}.title`)}</strong><small>{t(`directoryGuide.${id}.hint`)}</small></span>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
              </button>
            ))}
          </div>
        ) : screen === "organize" ? (
          <OrganizeCommunityGuide onSelectMember={handle => leaveFor(() => onSelectMember(handle))}
            onFilters={() => leaveFor(() => {
              setSidebarVisibility(true);
              requestAnimationFrame(() => document.querySelector(".filter-panel")?.focus());
            })} />
        ) : screen === "contribute" ? (
          <ContributeCommunityGuide onViewCommunities={() => leaveFor(() => {
            setSidebarVisibility(true);
            requestAnimationFrame(() => document.querySelector(".filter-panel")?.focus());
          })} onMap={() => leaveFor(onShowMap)} />
        ) : (
          <FindCommunityGuide
            onSearch={() => leaveFor(focusSearch)}
            onFilters={() => leaveFor(() => {
              setSidebarVisibility(true);
              requestAnimationFrame(() => {
                const panel = document.querySelector(".filter-panel");
                panel?.scrollIntoView({ block: "center", behavior: "instant" });
                panel?.focus({ preventScroll: true });
              });
            })}
            onMap={() => leaveFor(onShowMap)}
            onContribute={() => openEntry("contribute")}
          />
        )}
        <footer className="opendata-modal-footer">
          <button type="button" className="guide-inline-link" onClick={() => setScreen("reuse")}>{t("directoryGuide.reuse")}</button>
        </footer>
      </div>
    </div>
  );
}

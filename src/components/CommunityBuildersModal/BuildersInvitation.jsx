/* eslint-disable react/prop-types */
import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./CommunityBuildersModal.css";
const CommunityBuildersModal = lazy(() => import("./CommunityBuildersModal.jsx").then(m => ({ default: m.CommunityBuildersModal })));

export function BuildersInvitation({ onSelectMember, onOpenChange }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef(null);
  const close = useCallback(() => { onOpenChange?.(false); setIsOpen(false); }, [onOpenChange]);
  return <aside className="builders-invitation">
    <p>{t("builders.invitation")}</p>
    <button type="button" className="button is-light" ref={trigger} onClick={() => { onOpenChange?.(true); setIsOpen(true); }} aria-haspopup="dialog">
      <i className="fas fa-people-group" aria-hidden="true" /> {t("builders.cta")}
    </button>
    {isOpen && <Suspense fallback={null}><CommunityBuildersModal onClose={close} onSelectMember={onSelectMember} returnFocusRef={trigger} /></Suspense>}
  </aside>;
}

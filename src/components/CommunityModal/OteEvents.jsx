import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildOteReaderUrl,
  fetchOteFeed,
  formatEventDate,
  getEventLocationLabel,
  getFeedAttribution,
  selectEventsToShow,
} from "./oteEvents.js";

const OTE_ABOUT_URL = "https://opentechevents.org/";

/**
 * Próximos eventos de la comunidad leídos de su feed OTE (issues #57, #349).
 *
 * Un feed puede estar alojado en cualquier dominio y no todos sirven CORS: si la carga
 * falla, la sección se queda en el enlace al feed en vez de mostrar un error alarmante.
 */
/* eslint-disable react/prop-types */
export function OteEvents({ feedUrl, fallbackUrl = null }) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ status: "loading", feed: null });

  useEffect(() => {
    if (!feedUrl) return undefined;

    const controller = new AbortController();
    setState({ status: "loading", feed: null });

    fetchOteFeed(feedUrl, { signal: controller.signal })
      .then((feed) => setState({ status: "ready", feed }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", feed: null });
      });

    return () => controller.abort();
  }, [feedUrl]);

  if (!feedUrl) return null;

  const { feed, status } = state;
  const { upcoming, past, hiddenCount = 0 } = selectEventsToShow(feed?.events);
  const attribution = status === "ready" ? getFeedAttribution(feed, feedUrl) : { label: null, url: null };
  const viewAllUrl = attribution.url ?? fallbackUrl ?? feedUrl;
  const readerUrl = buildOteReaderUrl(feedUrl);
  const events = upcoming.length > 0 ? upcoming : past ? [past] : [];
  const sectionLabel = upcoming.length > 0
    ? t("communityModal.oteEvents.upcoming")
    : t("communityModal.oteEvents.past");

  return (
    <div className="community-modal-section community-modal-ote">
      <h3 className="community-modal-section-title">
        <i className="fas fa-calendar-days"></i> {t("communityModal.oteEvents.title")}
        <a
          className="community-modal-ote-about"
          href={OTE_ABOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("communityModal.oteEvents.aboutOte")}
        </a>
      </h3>

      {status === "loading" && (
        <p className="community-modal-ote-note">{t("communityModal.oteEvents.loading")}</p>
      )}

      {status === "error" && (
        <p className="community-modal-ote-note">{t("communityModal.oteEvents.error")}</p>
      )}

      {status === "ready" && events.length === 0 && (
        <p className="community-modal-ote-note">{t("communityModal.oteEvents.empty")}</p>
      )}

      {events.length > 0 && (
        <>
          <p className="community-modal-ote-label">{sectionLabel}</p>
          <ul className="community-modal-ote-list">
            {events.map((event) => {
              const place = getEventLocationLabel(event);

              return (
                <li key={event.id ?? event.url ?? event.name} className="community-modal-ote-item">
                  <span className="community-modal-ote-date">
                    {formatEventDate(event.startsAt, i18n.resolvedLanguage)}
                  </span>
                  {event.url ? (
                    <a href={event.url} target="_blank" rel="noopener noreferrer">{event.name}</a>
                  ) : (
                    <span>{event.name}</span>
                  )}
                  {place && <span className="community-modal-ote-place">{place}</span>}
                </li>
              );
            })}
          </ul>
          {hiddenCount > 0 && (
            <p className="community-modal-ote-note">
              {t("communityModal.oteEvents.moreCount", { count: hiddenCount })}
            </p>
          )}
        </>
      )}

      <p className="community-modal-ote-footer">
        <a href={viewAllUrl} target="_blank" rel="noopener noreferrer">
          {t("communityModal.oteEvents.viewAll")}
        </a>
        {readerUrl && (
          <a href={readerUrl} target="_blank" rel="noopener noreferrer">
            {t("communityModal.oteEvents.openReader")}
          </a>
        )}
        {attribution.label && (
          <span className="community-modal-ote-attribution">
            {t("communityModal.oteEvents.attribution", { source: attribution.label })}
          </span>
        )}
      </p>
    </div>
  );
}

export default OteEvents;

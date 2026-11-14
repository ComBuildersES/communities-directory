import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildOteReaderUrl,
  fetchOteFeed,
  formatEventDate,
  getEventLocationLabel,
  getFeedAttribution,
  selectCarouselEvents,
} from "./oteEvents.js";

const OTE_ABOUT_URL = "https://opentechevents.org/";

/** Feed de la comunidad; si no admite CORS, quedan disponibles sus enlaces. */
/* eslint-disable react/prop-types */
export function OteEvents({ feedUrl }) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ status: "loading", feed: null });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!feedUrl) return undefined;
    const controller = new AbortController();
    setState({ status: "loading", feed: null });
    setActiveIndex(0);
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
  const { events, upcoming } = selectCarouselEvents(feed?.events);
  const attribution = status === "ready" ? getFeedAttribution(feed, feedUrl) : { label: null, url: null };
  const readerUrl = buildOteReaderUrl(feedUrl);
  const index = Math.min(activeIndex, Math.max(0, events.length - 1));
  const event = events[index];
  const place = event ? getEventLocationLabel(event) : null;
  const title = t(`communityModal.oteEvents.${events.length ? (upcoming ? 'upcoming' : 'past') : 'title'}`);
  const move = (direction) => setActiveIndex(Math.max(0, Math.min(events.length - 1, index + direction)));

  return (
    <section className="community-modal-section community-modal-ote" aria-label={title}>
      <div className="community-modal-ote-header">
        <h3 className="community-modal-section-title">
          <i className="fas fa-calendar-days" aria-hidden="true"></i> {title}
        </h3>
        {events.length > 1 && <div className="community-modal-ote-controls">
          <button type="button" onClick={() => move(-1)} disabled={index === 0}
            aria-label={t("communityModal.oteEvents.previous")}>&lt;</button>
          <span className="community-modal-ote-position">{index + 1} / {events.length}</span>
          <button type="button" onClick={() => move(1)} disabled={index === events.length - 1}
            aria-label={t("communityModal.oteEvents.next")}>&gt;</button>
        </div>}
      </div>

      {status === "loading" && <p className="community-modal-ote-note">{t("communityModal.oteEvents.loading")}</p>}
      {status === "error" && <p className="community-modal-ote-note">{t("communityModal.oteEvents.error")}</p>}
      {status === "ready" && !event && <p className="community-modal-ote-note">{t("communityModal.oteEvents.empty")}</p>}

      {event && <div className="community-modal-ote-carousel" role="region"
        aria-roledescription={t("communityModal.oteEvents.carousel")} aria-label={title}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            move(e.key === 'ArrowLeft' ? -1 : 1);
          }
        }}>
        <div className="community-modal-ote-item" role="group" aria-live="polite" aria-atomic="true"
          aria-label={t("communityModal.oteEvents.position", { current: index + 1, total: events.length })}>
          <div className="community-modal-ote-meta">
            <time className="community-modal-ote-date" dateTime={event.startDate}>
              {formatEventDate(event.startsAt, i18n.resolvedLanguage)}
            </time>
            {place && <span className="community-modal-ote-place">{place}</span>}
          </div>
          {event.url ? <a href={event.url} target="_blank" rel="noopener noreferrer">{event.name}</a> : <span>{event.name}</span>}
        </div>
      </div>}

      <p className="community-modal-ote-footer">
        {attribution.label && <>
          <a href={attribution.url ?? feedUrl} target="_blank" rel="noopener noreferrer" className="community-modal-ote-attribution">
            {t("communityModal.oteEvents.attribution", { source: attribution.label })}
          </a>
          <span aria-hidden="true">|</span>
        </>}
        <a href={feedUrl} target="_blank" rel="noopener noreferrer">{t("communityModal.oteEvents.feed")}</a>
        <span aria-hidden="true">|</span>
        <a href={OTE_ABOUT_URL} target="_blank" rel="noopener noreferrer">{t("communityModal.oteEvents.aboutOte")}</a>
        {readerUrl && <>
          <span aria-hidden="true">|</span>
          <a href={readerUrl} target="_blank" rel="noopener noreferrer">{t("communityModal.oteEvents.openReader")}</a>
        </>}
      </p>
    </section>
  );
}

export default OteEvents;

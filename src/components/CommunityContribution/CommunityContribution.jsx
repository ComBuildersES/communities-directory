import { TAG_CATEGORY_ORDER, AUDIENCE_CATEGORY_ORDER } from '../../lib/topicExplorer.js';
import { BuildersInvitation } from "../CommunityBuildersModal/BuildersInvitation.jsx";
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildCommunityPayload,
  buildCommunityDeletionIssueUrl,
  buildContributionPath,
  buildGitHubIssueUrl,
  buildSubmissionEmailUrl,
  clearContributionDraft,
  COMMUNITY_STATUS_OPTIONS,
  COMMUNITY_TYPE_OPTIONS,
  EVENT_FORMAT_OPTIONS,
  EVENT_FORMATS_WITH_LOCATION,
  areCommunityNamesSimilar,
  findArchivedUrlMatches,
  getComparableCommunityUrls,
  getCommunityDraft,
  getContributionDraftStorageKey,
  getNextCommunityId,
  loadContributionDraft,
  normalizeUrlForComparison,
  saveContributionDraft,
  SHORT_DESCRIPTION_MAX_LENGTH,
  toggleSelection,
  GEOGRAPHIC_SCOPE_OPTIONS,
} from "../../lib/communitySubmission";
import {
  FALLBACK_ICON,
  URL_KINDS,
  URL_KIND_BY_KEY,
  inferKindFromUrl,
  isOteRow,
  makeUrlRow,
  resolveKindOrLabelInput,
  toUrlEntries,
  toUrlRows,
} from "../../lib/communityUrls.js";
import { OpenToOptions } from "../OpenToOptions.jsx";
import { OteSection } from "./OteSection.jsx";
import { UrlKindCombobox } from "./UrlKindCombobox.jsx";
import { MERGED_STATUS } from "../../lib/mergedCommunities.js";
import {
  COMMUNITY_LANGUAGE_OPTIONS,
  normalizeCommunityLangs,
} from "../../lib/communityLanguages.js";
import { inferProvinceIdFromNominatim } from "../../lib/provinceNormalization";
import { AiAssistPanel } from "./AiAssistPanel.jsx";
import { scoreItem } from "../../lib/fuzzyMatch";
import "./CommunityContribution.css";

function getFieldHelp(t) {
  return {
    geographicScope: {
      title: t("contribution.fieldHelp.geographicScope.title"),
      description: t("contribution.fieldHelp.geographicScope.description"),
      bullets: [
        t("contribution.fieldHelp.geographicScope.bullet0"),
        t("contribution.fieldHelp.geographicScope.bullet1"),
        t("contribution.fieldHelp.geographicScope.bullet2"),
        t("contribution.fieldHelp.geographicScope.bullet3"),
        t("contribution.fieldHelp.geographicScope.bullet4"),
      ],
    },
    status: {
      title: t("contribution.fieldHelp.status.title"),
      description: t("contribution.fieldHelp.status.description"),
      bullets: [
        t("contribution.fieldHelp.status.bullet0"),
        t("contribution.fieldHelp.status.bullet1"),
        t("contribution.fieldHelp.status.bullet2"),
        t("contribution.fieldHelp.status.bullet3"),
      ],
    },
    communityType: {
      title: t("contribution.fieldHelp.communityType.title"),
      description: t("contribution.fieldHelp.communityType.description"),
      items: [
        {
          label: t("communityType.tech-meetup"),
          detail: t("contribution.fieldHelp.communityType.techMeetup"),
          examples: [
            { name: "/dev/null talks", url: "https://devnulltalks.github.io/" },
            { name: "Arcasiles Community Madrid", url: "https://arcasiles.com/" },
            { name: "AiBirras", url: "https://aibirras.com/" },
          ],
        },
        {
          label: t("communityType.conference"),
          detail: t("contribution.fieldHelp.communityType.conference"),
          examples: [
            { name: "Lareira Conf", url: "https://www.lareiraconf.es/" },
            { name: "CommitConf", url: "https://commit-conf.com/" },
            { name: "TRGCON", url: "https://trgcon.com/" },
          ],
        },
        {
          label: t("communityType.umbrella-org"),
          detail: t("contribution.fieldHelp.communityType.umbrellaOrg"),
          examples: [
            { name: "GDG Spain", url: "https://gdg.es/" },
            { name: "Python España", url: "https://es.python.org" },
            { name: "Sysarmy", url: "https://sysarmy.com/" },
          ],
        },
        {
          label: t("communityType.hacklab"),
          detail: t("contribution.fieldHelp.communityType.hacklab"),
          examples: [
            { name: "A Industriosa", url: "https://www.meetup.com/es-ES/AIndustriosa/" },
            { name: "AKASHA Hub", url: "https://akasha.barcelona/" },
            { name: "BricoLabs", url: "https://bricolabs.cc/" },
          ],
        },
        {
          label: t("communityType.collaborative-group"),
          detail: t("contribution.fieldHelp.communityType.collaborativeGroup"),
          examples: [
            { name: "Adopta un Junior", url: "https://adoptaunjunior.es/" },
            { name: "Asociación Atlantics", url: "https://asociacionatlantics.org/" },
            { name: "Aula de Software Libre Córdoba", url: "https://www.uco.es/aulasoftwarelibre/" },
          ],
        },
        {
          label: t("communityType.meta-community"),
          detail: t("contribution.fieldHelp.communityType.metaCommunity"),
          examples: [
            { name: "Community Builders", url: "https://linktr.ee/ComBuilders_ES" },
            { name: "Granada Tech", url: "https://www.granadatech.org/" },
            { name: "SVQTech", url: "https://svqtech.com/" },
          ],
        },
        {
          label: t("communityType.mutual-aid"),
          detail: t("contribution.fieldHelp.communityType.mutualAid"),
          examples: [
            { name: "BCN Engineering", url: "https://bcneng.org/" },
            { name: "Midudev", url: "https://discord.com/invite/midudev" },
            { name: "Mouredev", url: "https://discord.com/invite/mouredev" },
          ],
        },
      ],
    },
    eventFormat: {
      title: t("contribution.fieldHelp.eventFormat.title"),
      description: t("contribution.fieldHelp.eventFormat.description"),
      bullets: [
        t("contribution.fieldHelp.eventFormat.bullet0"),
        t("contribution.fieldHelp.eventFormat.bullet1"),
        t("contribution.fieldHelp.eventFormat.bullet2"),
        t("contribution.fieldHelp.eventFormat.bullet3"),
      ],
    },
    location: {
      title: t("contribution.fieldHelp.location.title"),
      description: t("contribution.fieldHelp.location.description"),
      bullets: [
        t("contribution.fieldHelp.location.bullet0"),
        t("contribution.fieldHelp.location.bullet1"),
        t("contribution.fieldHelp.location.bullet2"),
      ],
    },
    shortDescription: {
      title: t("contribution.fieldHelp.shortDescription.title"),
      description: t("contribution.fieldHelp.shortDescription.description"),
      bullets: [
        t("contribution.fieldHelp.shortDescription.bullet0"),
        t("contribution.fieldHelp.shortDescription.bullet1"),
        t("contribution.fieldHelp.shortDescription.bullet2"),
        t("contribution.fieldHelp.shortDescription.bullet3"),
      ],
    },
    parentOrg: {
      title: t("contribution.fieldHelp.parentOrg.title"),
      description: t("contribution.fieldHelp.parentOrg.description"),
      bullets: [],
    },
    mergedInto: {
      title: t("contribution.fieldHelp.mergedInto.title"),
      description: t("contribution.fieldHelp.mergedInto.description"),
      bullets: [],
    },
    organizedBy: {
      title: t("contribution.fieldHelp.organizedBy.title"),
      description: t("contribution.fieldHelp.organizedBy.description"),
      bullets: [],
    },
  };
}

const NOT_TECH_DISCUSSION_URL = "https://github.com/ComBuildersES/communities-directory/issues/62";

function getDeletionReasonOptions(t) {
  return [
    { value: "duplicate",     label: t("contribution.deletion.reasonDuplicate") },
    { value: "never-existed", label: t("contribution.deletion.reasonNeverExisted") },
    { value: "not-tech",      label: t("contribution.deletion.reasonNotTech") },
    { value: "other",         label: t("contribution.deletion.reasonOther") },
  ];
}

function buildDeletionReason({
  reasonType,
  duplicateCommunity,
  duplicateCommunityEditUrl,
  otherReason,
  t,
}) {
  if (reasonType === "duplicate" && duplicateCommunity) {
    return t("contribution.deletion.reasonDuplicateMsg", { name: duplicateCommunity.name, url: duplicateCommunityEditUrl });
  }

  if (reasonType === "never-existed") {
    return t("contribution.deletion.reasonNeverExistedMsg");
  }

  if (reasonType === "not-tech") {
    return t("contribution.deletion.reasonNotTechMsg", { url: NOT_TECH_DISCUSSION_URL });
  }

  if (reasonType === "other") {
    return otherReason.trim();
  }

  return "";
}

function FieldHelp({ content, isOpen, onToggle, onClose }) {
  return (
    <div className={`contribution-field-help ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="contribution-field-help-trigger"
        aria-label={content.title}
        aria-expanded={isOpen}
        onClick={onToggle}
        onBlur={() => {
          if (isOpen) onClose();
        }}
      >
        <i className="fas fa-circle-info" aria-hidden="true"></i>
      </button>
      {isOpen && (
        <div className="contribution-field-help-popover">
          <strong>{content.title}</strong>
          <p>{content.description}</p>
          <ul>
            {content.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RequiredMark() {
  return <span className="contribution-required-mark" aria-hidden="true">*</span>;
}

function FieldHelpModal({ content, isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="contribution-help-modal-overlay" onClick={onClose}>
      <div
        className="contribution-help-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
      >
        <div className="contribution-help-modal-header">
          <div>
            <h4>{content.title}</h4>
            <p>{content.description}</p>
          </div>
          <button type="button" className="contribution-help-modal-close" onClick={onClose} aria-label={t("contribution.closeHelp")}>
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div className="contribution-help-modal-body">
          <ul className="contribution-help-modal-list">
            {content.items.map((item) => (
              <li key={item.label} className="contribution-help-modal-list-item">
                <strong>{item.label}:</strong> <span>{item.detail}</span>
                {item.examples?.length > 0 && (
                  <span className="contribution-help-modal-examples">
                    {" "}{t("contribution.examples")}{" "}
                    {item.examples.map((example, index) => (
                      <span key={example.name}>
                        <a href={example.url} target="_blank" rel="noopener noreferrer">
                          {example.name}
                        </a>
                        {index < item.examples.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    .
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function GroupChip({ label, items }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipText = items.map((i) => i.label).join(", ");

  return (
    <span
      className="contribution-matches-all-group-chip"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
    >
      {label} ({items.length})
      {isVisible && (
        <span className="contribution-matches-all-group-tooltip" role="tooltip">
          {tooltipText}
        </span>
      )}
    </span>
  );
}

function TaxonomyTooltip({ item, delay = 0, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const clearTooltipTimer = () => {
    if (!timeoutRef.current) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const showTooltip = () => {
    clearTooltipTimer();

    if (!item.description) return;

    if (delay <= 0) {
      setIsVisible(true);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      timeoutRef.current = null;
    }, delay);
  };

  const hideTooltip = () => {
    clearTooltipTimer();
    setIsVisible(false);
  };

  useEffect(() => () => clearTooltipTimer(), []);

  return (
    <span
      className="contribution-taxonomy-tooltip"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {item.description && isVisible && (
        <span className="contribution-taxonomy-tooltip-bubble" role="tooltip">
          <strong>{item.label}</strong>
          <span>{item.description}</span>
        </span>
      )}
    </span>
  );
}

function TaxonomyPicker({
  title,
  description,
  items,
  selectedValues,
  onToggle,
  searchValue,
  onSearchChange,
  groupByCategory = false,
  defaultExpanded = false,
  collapsibleGroups = false,
  collapseGroupsByDefault = false,
  categoryOrder = [],
  suggestionCta = null,
  matchesAllToggle = null,
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(defaultExpanded);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const hasSearch = searchValue.trim().length > 0;
    if (hasSearch) {
      setIsExpanded(true);
      return;
    }

    setIsExpanded(isManuallyExpanded);
  }, [isManuallyExpanded, searchValue]);

  const visibleItems = useMemo(() => {
    const q = searchValue.trim();
    if (!q) return items;

    return items
      .map((item) => ({ item, score: scoreItem(q, item) }))
      .filter(({ score }) => score !== null)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [items, searchValue]);

  const groupedItems = useMemo(() => {
    if (!groupByCategory) {
      return [{ label: "", items: visibleItems }];
    }

    const groups = new Map();
    visibleItems.forEach((item) => {
      const category = item.category || t("contribution.taxonomy.noCategory");
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });

    return Array.from(groups.entries()).map(([label, groupItems]) => ({
      label,
      items: groupItems,
    }));
  }, [groupByCategory, visibleItems, t]);

  const orderedGroupedItems = useMemo(() => {
    if (!groupByCategory || categoryOrder.length === 0) return groupedItems;

    const orderMap = new Map(categoryOrder.map((label, index) => [label, index]));

    return [...groupedItems].sort((left, right) => {
      const leftOrder = orderMap.get(left.label) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = orderMap.get(right.label) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.label.localeCompare(right.label, "es", { sensitivity: "base" });
    });
  }, [categoryOrder, groupByCategory, groupedItems]);

  const allGroupedItems = useMemo(
    () => orderedGroupedItems.filter((group) => group.items.length > 0),
    [orderedGroupedItems]
  );

  const itemsMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  );

  const hasActiveSearch = searchValue.trim().length > 0;

  return (
    <section className="contribution-card">
      <div className="contribution-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {!matchesAllToggle?.checked && (
          <button
            type="button"
            className="button is-light contribution-collapse-toggle"
            onClick={() => {
              const nextExpanded = !isExpanded;
              setIsManuallyExpanded(nextExpanded);
              setIsExpanded(nextExpanded);
            }}
            aria-expanded={isExpanded}
          >
            {isExpanded ? t("contribution.taxonomy.showLess") : t("contribution.taxonomy.showAll")}
          </button>
        )}
      </div>

      {!matchesAllToggle?.checked && (
        <>
          <label className="label" htmlFor={`${title}-search`}>{t("contribution.taxonomy.searchLabel")}</label>
          <input
            id={`${title}-search`}
            className="input"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("contribution.taxonomy.searchPlaceholder")}
          />
        </>
      )}

      <div className="contribution-taxonomy-summary" style={matchesAllToggle?.checked ? { display: "none" } : undefined}>
        {selectedValues.length > 0 ? (
          <div className="contribution-selected-pills contribution-selected-pills--summary">
            {selectedValues.map((selectedId) => {
              const item = itemsMap.get(selectedId);
              return (
                <TaxonomyTooltip key={selectedId} item={item ?? { id: selectedId, label: selectedId }} delay={1400}>
                  <button
                    type="button"
                    className="contribution-pill"
                    onClick={() => {
                      onToggle(selectedId);
                      if (!isManuallyExpanded) {
                        onSearchChange("");
                        setIsExpanded(false);
                      }
                    }}
                  >
                    {item?.label || selectedId}
                    <span aria-hidden="true">×</span>
                  </button>
                </TaxonomyTooltip>
              );
            })}
          </div>
        ) : (
          <p>{t("contribution.taxonomy.noneSelected")}</p>
        )}
      </div>

      {matchesAllToggle && (
        <label className="contribution-matches-all-label">
          <input
            type="checkbox"
            checked={matchesAllToggle.checked}
            onChange={(e) => matchesAllToggle.onChange(e.target.checked)}
          />
          <span>{matchesAllToggle.label}</span>
        </label>
      )}

      {matchesAllToggle?.checked && (
        <div className="contribution-matches-all-notice">
          <p>{matchesAllToggle.notice}</p>
          {allGroupedItems.length > 0 && (
            <div className="contribution-matches-all-groups">
              {allGroupedItems.map((group) => (
                <GroupChip key={group.label || "ungrouped"} label={group.label} items={group.items} />
              ))}
            </div>
          )}
          <p className="contribution-matches-all-warning">{matchesAllToggle.warning}</p>
        </div>
      )}

      {isExpanded && !matchesAllToggle?.checked && (
        <>
          <div className="contribution-taxonomy-list">
            {allGroupedItems.map((group) => {
              const ITEMS_DEFAULT = 5;
              const isGroupExpanded = expandedGroups[group.label];
              const visibleGroupItems = isGroupExpanded ? group.items : group.items.slice(0, ITEMS_DEFAULT);
              const hiddenCount = group.items.length - ITEMS_DEFAULT;
              const unselectedItems = group.items.filter((item) => !selectedValues.includes(item.id));

              return (
                <div key={group.label || "all"} className="contribution-taxonomy-group">
                  {group.label && (
                    <div className="contribution-taxonomy-group-header">
                      <h4>{group.label}</h4>
                      {unselectedItems.length > 0 && (
                        <button
                          type="button"
                          className="button is-small is-light contribution-taxonomy-add-all"
                          onClick={() => unselectedItems.forEach((item) => onToggle(item.id))}
                        >
                          {t("contribution.taxonomy.addAll")}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="contribution-check-grid">
                    {visibleGroupItems.map((item) => {
                      const isSelected = selectedValues.includes(item.id);
                      return (
                        <TaxonomyTooltip key={item.id} item={item}>
                          <button
                            type="button"
                            className="contribution-check-item"
                            aria-pressed={isSelected}
                            onClick={() => onToggle(item.id)}
                          >
                            <span className="contribution-check-item-label">{item.label}</span>
                            <span className="contribution-check-item-action" aria-hidden="true">{isSelected ? "−" : "+"}</span>
                          </button>
                        </TaxonomyTooltip>
                      );
                    })}
                  </div>
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className="contribution-taxonomy-show-more"
                      onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                    >
                      {isGroupExpanded
                        ? t("contribution.taxonomy.showLess")
                        : t("contribution.taxonomy.showMoreGroup", { count: hiddenCount })}
                    </button>
                  )}
                </div>
              );
            })}

            {searchValue.trim() && suggestionCta && (
              <div className="contribution-taxonomy-suggestion">
                <p>{suggestionCta.text}</p>
                <a
                  className="button is-small is-light"
                  href={suggestionCta.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {suggestionCta.label}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Una fila = icono + un campo para decir qué es + la URL (issue #478).
 *
 * El campo del medio hace **dos trabajos con un control**, y es la parte que no es obvia:
 *
 * - Si el dominio delata la plataforma, se rellena solo con su nombre y no se guarda nada:
 *   `kind` se deduce de la URL.
 * - Si el texto coincide con una plataforma conocida, se guarda `kind`. Esto es
 *   imprescindible, no cosmético: `web`, `ote`, `blog`, `rss`, `forum` y `mastodon` **no se
 *   pueden inferir nunca** por dominio. Sin poder elegirlos, alguien pegaría su feed OTE con
 *   la etiqueta "Eventos", se guardaría sin `kind`, y la sección de próximos eventos de la
 *   ficha se apagaría en silencio.
 * - Cualquier otro texto se guarda como `label`. Es lo que permite que un GDG tenga su Meetup
 *   *y además* su "DevFest Barcelona", los dos `eventsUrl`.
 *
 * Es un `<input list>` con `<datalist>` a propósito: texto libre y sugerencias sin dependencia
 * ninguna, y el navegador ya lo hace accesible.
 */
function UrlRow({ row, index, onChange, onRemove, onArchive, helpContent, isHelpOpen, onToggleHelp, onCloseHelp }) {
  const { t } = useTranslation();
  const url = row.url ?? "";
  const inferredKind = inferKindFromUrl(url);
  const kind = row.kind || inferredKind;
  const known = kind ? URL_KIND_BY_KEY[kind] : null;
  const icon = known ? known.icon : FALLBACK_ICON;
  const kindLabels = useMemo(
    () => URL_KINDS.map(({ kind: key }) => ({ kind: key, label: t(`communityModal.url.${key}`, { defaultValue: key }) })),
    [t]
  );

  // Lo que se ve en el campo: la etiqueta propia si la hay, y si no el nombre de la
  // plataforma. Vacío solo cuando no hay ni una ni otra, que es cuando el placeholder pide
  // que alguien lo escriba.
  const fieldValue = row.label ?? (known ? t(`communityModal.url.${kind}`, { defaultValue: kind }) : "");

  const handleKindOrLabelChange = (value) => {
    onChange(resolveKindOrLabelInput({ text: value, url, kindLabels }));
  };

  return (
    <div className="contribution-url-row">
      <span className="contribution-url-row-icon" aria-hidden="true">
        <i className={icon}></i>
      </span>

      <div className="contribution-url-row-kind">
        <UrlKindCombobox
          value={fieldValue}
          onChange={handleKindOrLabelChange}
          placeholder={t("contribution.urls.row.kindPlaceholder")}
          ariaLabel={t("contribution.urls.row.kindLabel")}
        />
      </div>

      <div className="contribution-url-row-url">
        <input
          className="input"
          type="url"
          value={url}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="https://..."
          aria-label={t("contribution.urls.row.urlLabel", { position: index + 1 })}
        />
      </div>

      <div className="contribution-url-row-actions">
        {helpContent && (
          <FieldHelp
            content={helpContent}
            isOpen={isHelpOpen}
            onToggle={onToggleHelp}
            onClose={onCloseHelp}
          />
        )}
        {url.trim() && (
          <button
            type="button"
            className="button is-small is-light"
            onClick={onArchive}
            title={t("contribution.urls.archive.buttonHelp")}
          >
            {t("contribution.urls.archive.button")}
          </button>
        )}
        <button
          type="button"
          className="button is-small is-light contribution-url-row-remove"
          onClick={onRemove}
          title={t("contribution.urls.row.remove")}
          aria-label={t("contribution.urls.row.remove")}
        >
          <i className="fas fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

function UrlFields({
  primaryUrl,
  onPrimaryUrlChange,
  urls = [],
  onUrlRowChange,
  onAddUrlRow,
  onRemoveUrlRow,
  onArchiveUrlRow,
  archivedUrls = [],
  onRestoreArchivedUrl,
  onRemoveArchivedUrl,
}) {
  const { t } = useTranslation();
  const [isPrimaryHelpOpen, setIsPrimaryHelpOpen] = useState(false);
  const [openRowHelp, setOpenRowHelp] = useState(null);
  const platformHelpContent = {
    web:            { title: t("contribution.urlHelp.web.title"),            description: t("contribution.urlHelp.web.description"),            bullets: [t("contribution.urlHelp.web.bullet0"),            t("contribution.urlHelp.web.bullet1")] },
    eventosWiki:    { title: t("contribution.urlHelp.eventosWiki.title"),    description: t("contribution.urlHelp.eventosWiki.description"),    bullets: [t("contribution.urlHelp.eventosWiki.bullet0")] },
    ote:            { title: t("contribution.urlHelp.ote.title"),            description: t("contribution.urlHelp.ote.description"),            bullets: [t("contribution.urlHelp.ote.bullet0")] },
    blog:           { title: t("contribution.urlHelp.blog.title"),           description: t("contribution.urlHelp.blog.description"),           bullets: [t("contribution.urlHelp.blog.bullet0")] },
    rss:            { title: t("contribution.urlHelp.rss.title"),            description: t("contribution.urlHelp.rss.description"),            bullets: [t("contribution.urlHelp.rss.bullet0")] },
    forum:          { title: t("contribution.urlHelp.forum.title"),          description: t("contribution.urlHelp.forum.description"),          bullets: [t("contribution.urlHelp.forum.bullet0")] },
    eventsUrl:      { title: t("contribution.urlHelp.eventsUrl.title"),      description: t("contribution.urlHelp.eventsUrl.description"),      bullets: [t("contribution.urlHelp.eventsUrl.bullet0"),      t("contribution.urlHelp.eventsUrl.bullet1")] },
    linkAggregator: { title: t("contribution.urlHelp.linkAggregator.title"), description: t("contribution.urlHelp.linkAggregator.description"), bullets: [t("contribution.urlHelp.linkAggregator.bullet0"), t("contribution.urlHelp.linkAggregator.bullet1")] },
    mailingList:    { title: t("contribution.urlHelp.mailingList.title"),    description: t("contribution.urlHelp.mailingList.description"),    bullets: [t("contribution.urlHelp.mailingList.bullet0"),    t("contribution.urlHelp.mailingList.bullet1")] },
    github:         { title: t("contribution.urlHelp.github.title"),         description: t("contribution.urlHelp.github.description"),         bullets: [t("contribution.urlHelp.github.bullet0")] },
    discord:        { title: t("contribution.urlHelp.discord.title"),        description: t("contribution.urlHelp.discord.description"),        bullets: [t("contribution.urlHelp.discord.bullet0")] },
    telegram:       { title: t("contribution.urlHelp.telegram.title"),       description: t("contribution.urlHelp.telegram.description"),       bullets: [t("contribution.urlHelp.telegram.bullet0")] },
    whatsapp:       { title: t("contribution.urlHelp.whatsapp.title"),       description: t("contribution.urlHelp.whatsapp.description"),       bullets: [t("contribution.urlHelp.whatsapp.bullet0")] },
    slack:          { title: t("contribution.urlHelp.slack.title"),          description: t("contribution.urlHelp.slack.description"),          bullets: [t("contribution.urlHelp.slack.bullet0")] },
    youtube:        { title: t("contribution.urlHelp.youtube.title"),        description: t("contribution.urlHelp.youtube.description"),        bullets: [t("contribution.urlHelp.youtube.bullet0")] },
    linkedin:       { title: t("contribution.urlHelp.linkedin.title"),       description: t("contribution.urlHelp.linkedin.description"),       bullets: [t("contribution.urlHelp.linkedin.bullet0")] },
    twitter:        { title: t("contribution.urlHelp.twitter.title"),        description: t("contribution.urlHelp.twitter.description"),        bullets: [t("contribution.urlHelp.twitter.bullet0")] },
    tiktok:         { title: t("contribution.urlHelp.tiktok.title"),         description: t("contribution.urlHelp.tiktok.description"),         bullets: [t("contribution.urlHelp.tiktok.bullet0")] },
    instagram:      { title: t("contribution.urlHelp.instagram.title"),      description: t("contribution.urlHelp.instagram.description"),      bullets: [t("contribution.urlHelp.instagram.bullet0")] },
    facebook:       { title: t("contribution.urlHelp.facebook.title"),       description: t("contribution.urlHelp.facebook.description"),       bullets: [t("contribution.urlHelp.facebook.bullet0")] },
    mastodon:       { title: t("contribution.urlHelp.mastodon.title"),       description: t("contribution.urlHelp.mastodon.description"),       bullets: [t("contribution.urlHelp.mastodon.bullet0")] },
    bluesky:        { title: t("contribution.urlHelp.bluesky.title"),        description: t("contribution.urlHelp.bluesky.description"),        bullets: [t("contribution.urlHelp.bluesky.bullet0")] },
    twitch:         { title: t("contribution.urlHelp.twitch.title"),         description: t("contribution.urlHelp.twitch.description"),         bullets: [t("contribution.urlHelp.twitch.bullet0")] },
  };

  return (
    <section className="contribution-card">
      <div className="contribution-card-header">
        <div>
          <h3>{t("contribution.urls.title")}</h3>
          <p>{t("contribution.urls.description")}</p>
        </div>
      </div>

      <div className="field contribution-grid-span-2">
        <label className="label contribution-label-with-help" htmlFor="community-url">
          <span>{t("contribution.urls.primaryLabel")} <RequiredMark /></span>
          <FieldHelp
            content={{
              title: t("contribution.urls.primaryHelp.title"),
              description: t("contribution.urls.primaryHelp.description"),
              bullets: [
                t("contribution.urls.primaryHelp.bullet0"),
                t("contribution.urls.primaryHelp.bullet1"),
                t("contribution.urls.primaryHelp.bullet2"),
              ],
            }}
            isOpen={isPrimaryHelpOpen}
            onToggle={() => setIsPrimaryHelpOpen((current) => !current)}
          />
        </label>
        <div className="control">
          <input
            id="community-url"
            className="input"
            type="url"
            value={primaryUrl}
            onChange={(event) => onPrimaryUrlChange(event.target.value)}
            placeholder="https://..."
            required
          />
        </div>
      </div>

      <div className="contribution-url-rows contribution-grid-span-2">
        {urls.every((row) => isOteRow(row)) && (
          <p className="contribution-url-rows-empty">{t("contribution.urls.row.empty")}</p>
        )}

        {/*
          El feed de eventos se queda fuera de la lista: lo edita su tarjeta propia, justo
          debajo, que es donde se explica qué es (OteSection.jsx).
        */}
        {urls.filter((row) => !isOteRow(row)).map((row, index) => {
          const kind = row.kind || inferKindFromUrl(row.url ?? "");
          return (
            <UrlRow
              key={row._rowId ?? index}
              row={row}
              index={index}
              onChange={(patch) => onUrlRowChange?.(row._rowId, patch)}
              onRemove={() => onRemoveUrlRow?.(row._rowId)}
              onArchive={() => onArchiveUrlRow?.(row._rowId)}
              helpContent={kind ? platformHelpContent[kind] : null}
              isHelpOpen={openRowHelp === row._rowId}
              onToggleHelp={() => setOpenRowHelp((current) => (current === row._rowId ? null : row._rowId))}
              onCloseHelp={() => setOpenRowHelp(null)}
            />
          );
        })}

        <button
          type="button"
          className="button is-small contribution-url-add"
          onClick={() => onAddUrlRow?.()}
        >
          <i className="fas fa-plus" aria-hidden="true"></i>
          <span>{t("contribution.urls.row.add")}</span>
        </button>
      </div>

      {archivedUrls.length > 0 && (
        <div className="contribution-archived-urls contribution-grid-span-2">
          <h4>{t("contribution.urls.archive.title")}</h4>
          <p className="contribution-archived-urls-note">{t("contribution.urls.archive.description")}</p>
          <ul className="contribution-archived-url-list">
            {archivedUrls.map((url) => (
              <li key={url}>
                <span className="contribution-archived-url">{url}</span>
                <span className="contribution-archived-url-actions">
                  <button
                    type="button"
                    className="button is-small is-light"
                    onClick={() => onRestoreArchivedUrl?.(url)}
                  >
                    {t("contribution.urls.archive.restore")}
                  </button>
                  <button
                    type="button"
                    className="button is-small is-light"
                    onClick={() => onRemoveArchivedUrl?.(url)}
                  >
                    {t("contribution.urls.archive.remove")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </section>
  );
}

function DuplicateWarning({ matches, emptyMessage }) {
  if (!matches.length) return null;

  return (
    <div className="contribution-inline-warning" role="status" aria-live="polite">
      <p>{emptyMessage}</p>
      <ul className="contribution-inline-list">
        {matches.map((community) => (
          <li key={community.id}>
            <a href={buildContributionPath({ mode: "edit", identifier: community.id })}>
              {community.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchivedUrlWarning({ matches }) {
  const { t } = useTranslation();

  if (!matches.length) return null;

  return (
    <div className="contribution-inline-warning" role="status" aria-live="polite">
      <p>{t("contribution.urls.archive.warning")}</p>
      <ul className="contribution-inline-list">
        {matches.map(({ community, url }) => (
          <li key={`${community.id ?? community.name}-${url}`}>
            <span className="contribution-archived-url">{url}</span>
            {" — "}
            <a href={buildContributionPath({ mode: "edit", identifier: community.id ?? community.name })}>
              {community.name}
            </a>
          </li>
        ))}
      </ul>
      <p>
        {t("contribution.urls.archive.warningIssuePrefix")}{" "}
        <a
          href="https://github.com/ComBuildersES/communities-directory/issues"
          target="_blank"
          rel="noreferrer"
        >
          {t("contribution.urls.openIssue")}
        </a>
        {t("contribution.urls.archive.warningIssueSuffix")}
      </p>
    </div>
  );
}

function buildCommunityBaselineSignature(community) {
  return JSON.stringify(community ?? null);
}

function buildDatasetSignature(communities = []) {
  return JSON.stringify(
    communities.map((community) => ({
      id: community.id,
      name: community.name,
      lastReviewed: community.lastReviewed,
      updatedCommunityUrl: community.communityUrl,
    }))
  );
}

function buildEditableDraftSignature(draft) {
  if (!draft) return JSON.stringify(null);

  return JSON.stringify({
    name: draft.name,
    status: draft.status,
    communityType: draft.communityType,
    eventFormat: draft.eventFormat,
    location: draft.location,
    geographicScope: draft.geographicScope,
    shortDescription: draft.shortDescription,
    topics: draft.topics,
    langs: draft.langs,
    tags: draft.tags,
    targetAudience: draft.targetAudience,
    openTo: draft.openTo,
    contactInfo: draft.contactInfo,
    communityUrl: draft.communityUrl,
    urls: draft.urls,
    archivedUrls: draft.archivedUrls,
    organizedBy: draft.organizedBy,
    thumbnailUrl: draft.thumbnailUrl,
    replaceThumbnail: draft.replaceThumbnail,
    latLon: draft.latLon,
    displayOnMap: draft.displayOnMap,
    matchesAllTags: draft.matchesAllTags,
    matchesAllAudience: draft.matchesAllAudience,
  });
}

/**
 * Un borrador guardado (localStorage, o el `proposal` de la URL) puede traer `urls` en
 * cualquiera de los dos formatos: lista de entradas si lo escribió el formulario actual, u
 * objeto por clave si viene de antes de #478. `toUrlRows` acepta los dos.
 *
 * `urlExtras` fue el andamio de la fase anterior, cuando el formulario aún no editaba pares:
 * se sigue leyendo para no tirar un borrador que quedase a medias en localStorage.
 */
function adoptDraftUrls(source, baseDraft) {
  if (!source || source.urls === undefined) {
    return { urls: baseDraft.urls };
  }

  return {
    urls: toUrlRows([
      ...toUrlEntries(source.urls),
      ...(Array.isArray(source.urlExtras) ? toUrlEntries(source.urlExtras) : []),
    ]),
  };
}

function mergeDraftWithProposal(baseDraft, proposalDraft) {
  if (!proposalDraft || typeof proposalDraft !== "object") {
    return baseDraft;
  }

  return {
    ...baseDraft,
    ...proposalDraft,
    langs: Array.isArray(proposalDraft.langs) ? normalizeCommunityLangs(proposalDraft.langs) : baseDraft.langs,
    tags: Array.isArray(proposalDraft.tags) ? proposalDraft.tags : baseDraft.tags,
    targetAudience: Array.isArray(proposalDraft.targetAudience) ? proposalDraft.targetAudience : baseDraft.targetAudience,
    ...adoptDraftUrls(proposalDraft, baseDraft),
    archivedUrls: Array.isArray(proposalDraft.archivedUrls)
      ? proposalDraft.archivedUrls
      : baseDraft.archivedUrls,
    latLon: {
      lat: proposalDraft.latLon?.lat ?? baseDraft.latLon?.lat ?? "",
      lon: proposalDraft.latLon?.lon ?? baseDraft.latLon?.lon ?? "",
    },
    replaceThumbnail: false,
  };
}

function getInitialContributionDraft(existingCommunity, nextId, proposalDraft) {
  const draft = mergeDraftWithProposal(getCommunityDraft(existingCommunity, nextId), proposalDraft);

  if (existingCommunity) return draft;

  return {
    ...draft,
    replaceThumbnail: true,
  };
}

function hashDraftSignature(value = "") {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function formatDraftSavedAt(savedAt) {
  if (!savedAt) return null;

  const parsedDate = new Date(savedAt);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export function CommunityContribution({
  communities,
  allTags,
  allAudience,
  existingCommunity,
  proposalDraft,
  onDirtyChange,
  onIssueOpenedChange,
  onDraftActionsChange,
  onSelectMember,
}) {
  const { t } = useTranslation();
  const FIELD_HELP = useMemo(() => getFieldHelp(t), [t]);
  const DELETION_REASON_OPTIONS = useMemo(() => getDeletionReasonOptions(t), [t]);
  const formRef = useRef(null);
  const nextId = useMemo(() => getNextCommunityId(communities), [communities]);
  const umbrellaOrgs = useMemo(
    () => communities.filter((c) => c.communityType === "umbrella-org").sort((a, b) => a.name.localeCompare(b.name)),
    [communities]
  );
  // Destinos posibles de una fusión: comunidades vivas, nunca la que se está editando ni
  // otra ya fusionada (una cadena de fusiones deja a la persona sin comunidad a la que ir).
  const mergeTargets = useMemo(
    () => communities
      .filter((c) => c.status !== MERGED_STATUS && c.id != null && c.id !== existingCommunity?.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [communities, existingCommunity?.id]
  );
  // Candidatas a organizadoras (issue #475): comunidades vivas del directorio, nunca la que
  // se está editando. Una fusionada no se ofrece —ya no organiza nada por separado—, pero si
  // la ficha la traía declarada se sigue mostrando como chip.
  const organizerCandidates = useMemo(
    () => communities
      .filter((c) => c.status !== MERGED_STATUS && c.id != null && c.id !== existingCommunity?.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [communities, existingCommunity?.id]
  );
  const isEditMode = Boolean(existingCommunity);
  const groupedAudience = useMemo(
    () => allAudience.map((item) => ({
      ...item,
      category: item.category || t("contribution.taxonomy.otherProfiles"),
    })),
    [allAudience, t]
  );
  const hasExternalProposal = Boolean(proposalDraft && typeof proposalDraft === "object");
  const proposalSignature = useMemo(
    () => hasExternalProposal ? hashDraftSignature(buildEditableDraftSignature(proposalDraft)) : "base",
    [hasExternalProposal, proposalDraft]
  );
  const storageKey = useMemo(
    () => getContributionDraftStorageKey({
      mode: isEditMode ? "edit" : "new",
      identifier: hasExternalProposal
        ? `${existingCommunity?.id ?? "new"}:${proposalSignature}`
        : (existingCommunity?.id ?? null),
    }),
    [existingCommunity?.id, hasExternalProposal, isEditMode, proposalSignature]
  );
  const [draft, setDraft] = useState(() => getInitialContributionDraft(existingCommunity, nextId, proposalDraft));
  const [tagQuery, setTagQuery] = useState("");
  const [audienceQuery, setAudienceQuery] = useState("");
  const [parentOrgQuery, setParentOrgQuery] = useState(
    () => communities.find((c) => c.id === existingCommunity?.parentId)?.name ?? ""
  );
  const [organizedByQuery, setOrganizedByQuery] = useState("");
  const [mergedIntoQuery, setMergedIntoQuery] = useState(
    () => communities.find((c) => c.id === existingCommunity?.mergedIntoId)?.name ?? ""
  );
  const languageOptions = useMemo(
    () => COMMUNITY_LANGUAGE_OPTIONS.map((code) => ({
      id: code,
      label: t(`language.${code}`),
    })),
    [t]
  );
  const [openHelpField, setOpenHelpField] = useState(null);
  const [isCommunityTypeModalOpen, setIsCommunityTypeModalOpen] = useState(false);
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const [hasOpenedIssue, setHasOpenedIssue] = useState(false);
  const [hasPreparedContribution, setHasPreparedContribution] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [restoredDraftMeta, setRestoredDraftMeta] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isDeletionFormVisible, setIsDeletionFormVisible] = useState(false);
  const [deletionReasonType, setDeletionReasonType] = useState("");
  const [duplicateTargetId, setDuplicateTargetId] = useState("");
  const [duplicateTargetQuery, setDuplicateTargetQuery] = useState("");
  const [otherDeletionReason, setOtherDeletionReason] = useState("");
  const [thumbnailAspectWarning, setThumbnailAspectWarning] = useState(false);
  const inferredProvinceIdRef = useRef("");
  const datasetSignature = useMemo(() => buildDatasetSignature(communities), [communities]);
  const latestBaseDraft = useMemo(
    () => getInitialContributionDraft(existingCommunity, nextId, proposalDraft),
    [existingCommunity, nextId, proposalDraft]
  );
  const currentCommunityBaselineSignature = useMemo(
    () => buildCommunityBaselineSignature(existingCommunity),
    [existingCommunity]
  );

  useEffect(() => {
    const baseDraft = latestBaseDraft;
    const storedDraft = loadContributionDraft(storageKey);

    if (storedDraft) {
      const storedPayload = storedDraft.draft ?? storedDraft;
      const storedSavedAt = storedDraft.savedAt ?? null;
      const datasetChanged = Boolean(
        storedDraft.datasetSignature &&
        storedDraft.datasetSignature !== datasetSignature
      );
      const communityChanged = Boolean(
        storedDraft.baselineCommunitySignature &&
        storedDraft.baselineCommunitySignature !== currentCommunityBaselineSignature
      );

      setDraft({
        ...baseDraft,
        ...storedPayload,
        langs: Array.isArray(storedPayload.langs) ? normalizeCommunityLangs(storedPayload.langs) : baseDraft.langs,
        tags: Array.isArray(storedPayload.tags) ? storedPayload.tags : baseDraft.tags,
        targetAudience: Array.isArray(storedPayload.targetAudience) ? storedPayload.targetAudience : baseDraft.targetAudience,
        ...adoptDraftUrls(storedPayload, baseDraft),
        archivedUrls: Array.isArray(storedPayload.archivedUrls)
          ? storedPayload.archivedUrls
          : baseDraft.archivedUrls,
        latLon: {
          lat: storedPayload.latLon?.lat ?? baseDraft.latLon.lat,
          lon: storedPayload.latLon?.lon ?? baseDraft.latLon.lon,
        },
      });
      setHasRestoredDraft(true);
      setRestoredDraftMeta({
        savedAt: storedSavedAt,
        datasetChanged,
        communityChanged,
        isLegacyDraft: !storedDraft.draft,
      });
    } else {
      setDraft(baseDraft);
      setHasRestoredDraft(false);
      setRestoredDraftMeta(null);
    }

    setHasOpenedIssue(false);
    setHasPreparedContribution(false);
    setHasUserInteracted(false);
    setIsDeletionFormVisible(false);
    setDeletionReasonType("");
    setDuplicateTargetId("");
    setDuplicateTargetQuery("");
    setOtherDeletionReason("");
  }, [currentCommunityBaselineSignature, datasetSignature, latestBaseDraft, nextId, storageKey]);

  useEffect(() => {
    if (draft.communityType !== "umbrella-org") return;
    if (draft.location === "n/a") return;

    setDraft((current) => ({
      ...current,
      location: "n/a",
    }));
  }, [draft.communityType, draft.location]);

  useEffect(() => {
    if (draft.communityType === "umbrella-org") return;
    if (EVENT_FORMATS_WITH_LOCATION.includes(draft.eventFormat)) return;
    if (!draft.location) return;

    setDraft((current) => ({
      ...current,
      location: "",
    }));
  }, [draft.communityType, draft.eventFormat, draft.location]);

  const sharePath = buildContributionPath({
    mode: isEditMode ? "edit" : "new",
    identifier: isEditMode ? existingCommunity.id : null,
  });
  const shareUrl = `${window.location.origin}${sharePath}`;

  const payload = useMemo(
    () => buildCommunityPayload(draft, existingCommunity, { allTags, allAudience }),
    [allAudience, allTags, draft, existingCommunity]
  );
  const shouldShowLocationField = (
    EVENT_FORMATS_WITH_LOCATION.includes(draft.eventFormat) &&
    draft.communityType !== "umbrella-org"
  );
  const previewThumbnailUrl = draft.replaceThumbnail
    ? draft.thumbnailUrl
    : (existingCommunity?.thumbnailUrl ?? draft.thumbnailUrl);
  const shouldWarnAboutThumbnailAspect = Boolean(draft.thumbnailUrl) && (!isEditMode || draft.replaceThumbnail);

  useEffect(() => {
    if (!shouldWarnAboutThumbnailAspect) {
      setThumbnailAspectWarning(false);
      return;
    }

    setThumbnailAspectWarning(false);
  }, [draft.thumbnailUrl, draft.replaceThumbnail, shouldWarnAboutThumbnailAspect]);

  const githubIssueUrl = useMemo(
    () => buildGitHubIssueUrl({ payload, mode: isEditMode ? "edit" : "new", shareUrl }),
    [isEditMode, payload, shareUrl]
  );
  const submissionEmailUrl = useMemo(
    () => buildSubmissionEmailUrl({ payload, mode: isEditMode ? "edit" : "new", shareUrl }),
    [isEditMode, payload, shareUrl]
  );
  const duplicateCandidates = useMemo(
    () => communities
      .filter((community) => !existingCommunity || community.id !== existingCommunity.id)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name, "es")),
    [communities, existingCommunity]
  );
  const duplicateTargetCommunity = useMemo(
    () => duplicateCandidates.find((community) => String(community.id) === String(duplicateTargetId)) ?? null,
    [duplicateCandidates, duplicateTargetId]
  );
  const filteredDuplicateCandidates = useMemo(() => {
    const normalizedQuery = duplicateTargetQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return duplicateCandidates.slice(0, 12);
    }

    return duplicateCandidates
      .filter((community) => {
        const haystack = [
          community.name,
          community.location,
          community.communityUrl,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [duplicateCandidates, duplicateTargetQuery]);
  const deletionReason = useMemo(
    () => buildDeletionReason({
      reasonType: deletionReasonType,
      duplicateCommunity: duplicateTargetCommunity,
      duplicateCommunityEditUrl: duplicateTargetCommunity
        ? `${window.location.origin}${buildContributionPath({
          mode: "edit",
          identifier: duplicateTargetCommunity.id,
        })}`
        : "",
      otherReason: otherDeletionReason,
      t,
    }),
    [deletionReasonType, duplicateTargetCommunity, otherDeletionReason, t]
  );
  const deletionIssueUrl = useMemo(
    () => buildCommunityDeletionIssueUrl({
      community: existingCommunity,
      reason: deletionReason,
    }),
    [deletionReason, existingCommunity]
  );
  const isDeletionRequestValid = Boolean(
    deletionReasonType &&
    (deletionReasonType !== "duplicate" || duplicateTargetCommunity) &&
    (deletionReasonType !== "other" || otherDeletionReason.trim())
  );

  const duplicates = useMemo(() => {
    const comparableName = payload.name.trim();
    const comparableUrls = new Set([
      normalizeUrlForComparison(payload.communityUrl),
      ...Object.values(payload.urls ?? {}).map((url) => normalizeUrlForComparison(url)),
    ].filter(Boolean));

    if (!comparableName && comparableUrls.size === 0) {
      return {
        byName: [],
        byUrl: [],
        combined: [],
      };
    }

    const byName = [];
    const byUrl = [];

    communities.forEach((community) => {
      if (existingCommunity && community.id === existingCommunity.id) return;

      const sameName = comparableName && areCommunityNamesSimilar(community.name, comparableName);
      const communityUrls = getComparableCommunityUrls(community);
      const sameUrl = communityUrls.some((url) => comparableUrls.has(url));

      if (sameName) byName.push(community);
      if (sameUrl) byUrl.push(community);
    });

    const combined = Array.from(new Map([...byName, ...byUrl].map((community) => [community.id, community])).values())
      .slice(0, 5);

    return {
      byName: byName.slice(0, 5),
      byUrl: byUrl.slice(0, 5),
      combined,
    };
  }, [communities, existingCommunity, payload.name, payload.communityUrl, payload.urls]);

  // Incluye la propia comunidad: el caso típico es reintroducir un canal que su equipo
  // anterior dejó zombie, y el aviso debe aparecer también ahí.
  const archivedUrlMatches = useMemo(
    () => findArchivedUrlMatches({
      communities: existingCommunity
        ? [existingCommunity, ...communities.filter((community) => community.id !== existingCommunity.id)]
        : communities,
      urls: [payload.communityUrl, ...toUrlEntries(payload.urls).map((entry) => entry.url)],
    }),
    [communities, existingCommunity, payload.communityUrl, payload.urls]
  );

  const baseDraftSignature = useMemo(
    () => buildEditableDraftSignature(latestBaseDraft),
    [latestBaseDraft]
  );
  const currentDraftSignature = useMemo(() => buildEditableDraftSignature(draft), [draft]);

  useEffect(() => {
    inferredProvinceIdRef.current = draft.provinceId;
  }, [draft.provinceId]);

  useEffect(() => {
    const normalizedLocation = draft.location.trim();
    const supportsLocation = EVENT_FORMATS_WITH_LOCATION.includes(draft.eventFormat);
    const isUmbrellaOrganization = draft.communityType === "umbrella-org";

    if (!supportsLocation || isUmbrellaOrganization || normalizedLocation.length < 3) {
      if (inferredProvinceIdRef.current) {
        setDraft((current) => current.provinceId ? { ...current, provinceId: "" } : current);
      }
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: normalizedLocation,
          format: "jsonv2",
          limit: "1",
          addressdetails: "1",
          "accept-language": "es",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const results = await response.json();
        const provinceId = inferProvinceIdFromNominatim(results?.[0]);

        setDraft((current) => {
          const nextProvinceId = provinceId ?? "";
          return current.provinceId === nextProvinceId
            ? current
            : { ...current, provinceId: nextProvinceId };
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setDraft((current) => current.provinceId ? { ...current, provinceId: "" } : current);
        }
      }
    }, 1200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [draft.communityType, draft.eventFormat, draft.location]);
  const isDirty = hasUserInteracted && currentDraftSignature !== baseDraftSignature;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    onIssueOpenedChange?.(hasOpenedIssue);
  }, [hasOpenedIssue, onIssueOpenedChange]);

  useEffect(() => {
    onDraftActionsChange?.({
      saveDraft: () => saveContributionDraft(storageKey, {
        savedAt: new Date().toISOString(),
        draft,
        datasetSignature,
        baselineCommunitySignature: currentCommunityBaselineSignature,
      }),
      clearDraft: () => clearContributionDraft(storageKey),
    });

    return () => {
      onDraftActionsChange?.({
        saveDraft: null,
        clearDraft: null,
      });
    };
  }, [currentCommunityBaselineSignature, datasetSignature, draft, onDraftActionsChange, storageKey]);

  useEffect(() => {
    if (!isDirty || hasOpenedIssue) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasOpenedIssue, isDirty]);

  /**
   * Aplica una ficha propuesta por IA sobre el borrador. Solo toca las claves que vengan
   * en la propuesta: lo que la persona ya haya escrito a mano no se pierde salvo que la
   * IA traiga un valor para ese mismo campo.
   *
   * `humanValidated` se queda como está: una propuesta de IA no se valida sola, la valida
   * quien la revisa y le da a enviar.
   */
  const handleAiAssistApply = (community) => {
    setHasUserInteracted(true);
    setDraft((current) => {
      const next = { ...current };

      Object.entries(community).forEach(([key, value]) => {
        if (key === "urls") {
          // La IA devuelve el objeto por clave (así se lo pide el prompt: un modelo acierta
          // más con "pon la URL en su clave" que emitiendo pares). Se añaden como filas
          // nuevas las URLs que no estuviesen ya, sin tocar lo que la persona escribió.
          const existing = new Set(
            toUrlEntries(current.urls).map((entry) => entry.url.trim().toLowerCase())
          );
          const incoming = toUrlEntries(value).filter(
            (entry) => !existing.has(entry.url.trim().toLowerCase())
          );
          next.urls = [...(current.urls ?? []), ...incoming.map((entry) => makeUrlRow(entry))];
          return;
        }
        next[key] = value;
      });

      return next;
    });
  };

  const handleFieldChange = (key, value) => {
    setHasUserInteracted(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateUrlRows = (updater) => {
    setHasUserInteracted(true);
    setDraft((current) => ({ ...current, urls: updater(current.urls ?? []) }));
  };

  const handleUrlRowChange = (rowId, patch) => {
    if (rowId == null) return;
    updateUrlRows((rows) =>
      rows.map((row) => {
        if (row._rowId !== rowId) return row;
        const next = { ...row, ...patch };
        // `undefined` en el patch significa "quita esta clave", no "guarda undefined": es
        // como el campo del medio borra un kind o un label que ya no aplican.
        for (const key of Object.keys(patch)) {
          if (patch[key] === undefined) delete next[key];
        }
        return next;
      })
    );
  };

  const handleAddUrlRow = () => {
    updateUrlRows((rows) => [...rows, makeUrlRow({ url: "" })]);
  };

  /**
   * El campo de la tarjeta del feed de eventos escribe en la lista de canales: el feed se
   * guarda como un canal más con `kind: "ote"`, no como un campo aparte del modelo.
   *
   * Vaciar el campo **quita la fila**. Dejarla con la URL en blanco la devolvería a la lista
   * de canales como una fila vacía sin plataforma, que es exactamente el ruido que esta
   * tarjeta viene a evitar.
   */
  const handleOteFeedChange = (url) => {
    updateUrlRows((rows) => {
      const existing = rows.find((row) => isOteRow(row));
      if (!existing) return url.trim() ? [...rows, makeUrlRow({ url, kind: "ote" })] : rows;
      if (!url.trim()) return rows.filter((row) => row !== existing);
      return rows.map((row) => (row === existing ? { ...row, url, kind: "ote" } : row));
    });
  };

  const handleRemoveUrlRow = (rowId) => {
    // Sin la guarda, un `rowId` nulo casaría con toda fila que tampoco lo tenga y vaciaría
    // la lista entera. Es el bug que tuvo el editor al abrir una ficha ya existente.
    if (rowId == null) return;
    updateUrlRows((rows) => rows.filter((row) => row._rowId !== rowId));
  };

  // Archivar mueve la URL de la fila a `archivedUrls`: deja de mostrarse en la ficha, pero el
  // directorio sigue sabiendo que existió (issue #353).
  const handleArchiveUrl = (rowId) => {
    if (rowId == null) return;
    setHasUserInteracted(true);
    setDraft((current) => {
      const rows = current.urls ?? [];
      const row = rows.find((candidate) => candidate._rowId === rowId);
      const url = (row?.url ?? "").trim();
      if (!url) return current;

      const alreadyArchived = (current.archivedUrls ?? []).some(
        (archived) => normalizeUrlForComparison(archived) === normalizeUrlForComparison(url)
      );

      return {
        ...current,
        urls: rows.filter((candidate) => candidate._rowId !== rowId),
        archivedUrls: alreadyArchived
          ? current.archivedUrls
          : [...(current.archivedUrls ?? []), url],
      };
    });
  };

  const handleRemoveArchivedUrl = (url) => {
    setHasUserInteracted(true);
    setDraft((current) => ({
      ...current,
      archivedUrls: (current.archivedUrls ?? []).filter((archived) => archived !== url),
    }));
  };

  // Restaurar es añadir una fila: el kind lo deduce el dominio, y si no lo deduce la fila
  // queda pidiendo el nombre. Antes había que buscarle un hueco libre entre 24 campos fijos.
  const handleRestoreArchivedUrl = (url) => {
    setHasUserInteracted(true);
    setDraft((current) => ({
      ...current,
      urls: [...(current.urls ?? []), makeUrlRow({ url })],
      archivedUrls: (current.archivedUrls ?? []).filter((archived) => archived !== url),
    }));
  };

  const handleReplaceThumbnailToggle = () => {
    setHasUserInteracted(true);
    setDraft((current) => ({
      ...current,
      replaceThumbnail: !current.replaceThumbnail,
      thumbnailUrl: current.replaceThumbnail ? (existingCommunity?.thumbnailUrl ?? current.thumbnailUrl) : "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current?.reportValidity()) {
      return;
    }

    clearContributionDraft(storageKey);
    setHasOpenedIssue(true);
    setHasPreparedContribution(true);
    setHasRestoredDraft(false);
    window.open(githubIssueUrl, "_blank", "noopener,noreferrer");
  };

  const handleDiscardRestoredDraft = () => {
    clearContributionDraft(storageKey);
    setDraft(latestBaseDraft);
    setHasRestoredDraft(false);
    setRestoredDraftMeta(null);
    setHasOpenedIssue(false);
    setHasPreparedContribution(false);
    setHasUserInteracted(false);
  };
  const handleDeletionReasonTypeChange = (value) => {
    setDeletionReasonType(value);

    if (value !== "duplicate") {
      setDuplicateTargetId("");
      setDuplicateTargetQuery("");
    }

    if (value !== "other") {
      setOtherDeletionReason("");
    }
  };
  const handleOpenDeletionIssue = () => {
    if (!isDeletionRequestValid) return;

    setHasOpenedIssue(true);
    setHasPreparedContribution(false);
    window.open(deletionIssueUrl, "_blank", "noopener,noreferrer");
  };
  const handleDuplicateTargetSelect = (community) => {
    setDuplicateTargetId(String(community.id));
    setDuplicateTargetQuery(community.name);
  };

  const restoredDraftSavedAt = formatDraftSavedAt(restoredDraftMeta?.savedAt);
  const hasDatasetChangesSinceDraft = Boolean(
    restoredDraftMeta?.datasetChanged || restoredDraftMeta?.communityChanged
  );

  return (
    <form ref={formRef} className="contribution-shell" onSubmit={handleSubmit}>
      <FieldHelpModal
        content={FIELD_HELP.communityType}
        isOpen={isCommunityTypeModalOpen}
        onClose={() => setIsCommunityTypeModalOpen(false)}
      />

      <section className="contribution-hero">
        <div>
          <p className="contribution-eyebrow">{t("contribution.hero.eyebrow")}</p>
          <p>
            {isEditMode
              ? t("contribution.hero.descriptionEdit")
              : t("contribution.hero.descriptionNew")}
          </p>
        </div>
      </section>

      <AiAssistPanel
        draft={draft}
        allTags={allTags}
        allAudience={allAudience}
        onApply={handleAiAssistApply}
      />

      {hasExternalProposal && !hasRestoredDraft && (
        <article className="message is-info contribution-message">
          <div className="message-body">
            {t("contribution.proposal.loaded")}
          </div>
        </article>
      )}

      {hasRestoredDraft && (
        <article className="message is-info contribution-message">
          <div className="message-body">
            <p>
              {t("contribution.draft.restoredPrefix")}
              {restoredDraftSavedAt ? t("contribution.draft.restoredSavedAt", { date: restoredDraftSavedAt }) : ""}.
            </p>
            <p>
              {hasDatasetChangesSinceDraft
                ? t("contribution.draft.datasetChanged")
                : t("contribution.draft.datasetUnchanged")}
            </p>
            {restoredDraftMeta?.isLegacyDraft && (
              <p>{t("contribution.draft.legacyWarning")}</p>
            )}
            <div className="contribution-restored-draft-actions">
              <button type="button" className="button is-light is-small" onClick={handleDiscardRestoredDraft}>
                {t("contribution.draft.discard")}
              </button>
            </div>
          </div>
        </article>
      )}

      {duplicates.combined.length > 0 && (
        <article className="message is-warning contribution-message">
          <div className="message-body">
            {t("contribution.duplicate.warning")}
            <ul className="contribution-inline-list">
              {duplicates.combined.map((community) => (
                <li key={community.id}>
                  <a href={buildContributionPath({ mode: "edit", identifier: community.id })}>
                    {community.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </article>
      )}

      <section className="contribution-card">
        <div className="contribution-card-header">
          <div>
            <h3>{t("contribution.form.baseDataTitle")}</h3>
            <p>{t("contribution.form.baseDataDescription")}</p>
          </div>
          <div className="contribution-metadata">
            <span>ID {payload.id ?? t("contribution.form.pendingId")}</span>
            <span>{isEditMode ? t("contribution.form.editMode") : t("contribution.form.newMode")}</span>
            {isEditMode && (
              <button
                type="button"
                className={`contribution-delete-toggle${isDeletionFormVisible ? " is-active" : ""}`}
                onClick={() => setIsDeletionFormVisible((current) => !current)}
              >
                <i className="fas fa-trash-can" aria-hidden="true"></i>
                <span>{t("contribution.form.requestDeletion")}</span>
              </button>
            )}
          </div>
        </div>

        {isEditMode && isDeletionFormVisible && (
          <div className="contribution-delete-panel">
            <p className="contribution-delete-note">
              {t("contribution.deletion.notActiveNote")}
            </p>

            <div className="contribution-delete-reasons" role="radiogroup" aria-label={t("contribution.deletion.reasonGroupLabel")}>
              {DELETION_REASON_OPTIONS.map((option) => (
                <label key={option.value} className="contribution-delete-reason-option">
                  <input
                    type="radio"
                    name="deletion-reason"
                    value={option.value}
                    checked={deletionReasonType === option.value}
                    onChange={(event) => handleDeletionReasonTypeChange(event.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            {deletionReasonType === "duplicate" && (
              <div className="field contribution-delete-field">
                <label className="label" htmlFor="duplicate-community-target">{t("contribution.deletion.canonicalCommunityLabel")}</label>
                <div className="control">
                  <input
                    id="duplicate-community-target"
                    className="input"
                    type="search"
                    value={duplicateTargetQuery}
                    onChange={(event) => {
                      setDuplicateTargetQuery(event.target.value);
                      setDuplicateTargetId("");
                    }}
                    placeholder={t("contribution.deletion.searchPlaceholder")}
                    autoComplete="off"
                  />
                </div>
                <div className="contribution-duplicate-results" role="listbox" aria-label={t("contribution.deletion.resultsLabel")}>
                  {filteredDuplicateCandidates.length > 0 ? (
                    filteredDuplicateCandidates.map((community) => (
                      <button
                        key={community.id}
                        type="button"
                        className={`contribution-duplicate-result${duplicateTargetId === String(community.id) ? " is-selected" : ""}`}
                        onClick={() => handleDuplicateTargetSelect(community)}
                      >
                        <span className="contribution-duplicate-result-name">{community.name}</span>
                        <span className="contribution-duplicate-result-meta">
                          ID {community.id}
                          {community.location ? ` · ${community.location}` : ""}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="contribution-delete-field-note">
                      {t("contribution.deletion.noMatches")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {deletionReasonType === "not-tech" && (
              <p className="contribution-delete-field-note">
                {t("contribution.deletion.notTechNote")}{" "}
                <a href={NOT_TECH_DISCUSSION_URL} target="_blank" rel="noreferrer">
                  issue #62
                </a>
                .
              </p>
            )}

            {deletionReasonType === "other" && (
              <div className="field contribution-delete-field">
                <label className="label" htmlFor="other-deletion-reason">{t("contribution.deletion.otherReasonLabel")}</label>
                <div className="control">
                  <textarea
                    id="other-deletion-reason"
                    className="textarea"
                    rows={3}
                    value={otherDeletionReason}
                    onChange={(event) => setOtherDeletionReason(event.target.value)}
                    placeholder={t("contribution.deletion.otherReasonPlaceholder")}
                    required
                  />
                </div>
              </div>
            )}

            <div className="contribution-delete-actions">
              <button
                type="button"
                className="button is-danger is-light"
                onClick={handleOpenDeletionIssue}
                disabled={!isDeletionRequestValid}
              >
                {t("contribution.deletion.openIssue")}
              </button>
              <p className="contribution-delete-helper">
                {t("contribution.deletion.helper")}
              </p>
            </div>
          </div>
        )}

        <div className="contribution-grid">
          <div className="field">
            <label className="label" htmlFor="community-name">{t("contribution.form.nameLabel")} <RequiredMark /></label>
            <div className="control">
              <input
                id="community-name"
                className="input"
                type="text"
                value={draft.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                placeholder={t("contribution.form.namePlaceholder")}
                required
              />
            </div>
            <DuplicateWarning
              matches={duplicates.byName}
              emptyMessage={t("contribution.duplicate.byNameWarning")}
            />
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-status">
              <span>{t("contribution.form.statusLabel")} <RequiredMark /></span>
              <FieldHelp
                content={FIELD_HELP.status}
                isOpen={openHelpField === "status"}
                onToggle={() => setOpenHelpField((current) => current === "status" ? null : "status")}
                onClose={() => setOpenHelpField(null)}
              />
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="community-status"
                  value={draft.status}
                  onChange={(event) => handleFieldChange("status", event.target.value)}
                  required
                >
                  {COMMUNITY_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{t(`status.${option}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {draft.status === MERGED_STATUS && (
            <div className="field">
              <label className="label contribution-label-with-help" htmlFor="merged-into-input">
                <span>{t("contribution.form.mergedIntoLabel")} <RequiredMark /></span>
                <FieldHelp
                  content={FIELD_HELP.mergedInto}
                  isOpen={openHelpField === "mergedInto"}
                  onToggle={() => setOpenHelpField((current) => current === "mergedInto" ? null : "mergedInto")}
                  onClose={() => setOpenHelpField(null)}
                />
              </label>
              <div className="control">
                <input
                  id="merged-into-input"
                  className="input"
                  type="text"
                  list="merge-targets-datalist"
                  value={mergedIntoQuery}
                  placeholder={t("contribution.form.mergedIntoPlaceholder")}
                  required
                  onChange={(e) => {
                    const query = e.target.value;
                    setMergedIntoQuery(query);
                    const match = mergeTargets.find((c) => c.name === query);
                    handleFieldChange("mergedIntoId", match ? match.id : null);
                  }}
                />
                <datalist id="merge-targets-datalist">
                  {mergeTargets.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              {draft.mergedIntoId == null && (
                <p className="help is-italic" style={{ color: "#888" }}>
                  {t("contribution.form.mergedIntoNone")}
                </p>
              )}
            </div>
          )}

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-type">
              <span>{t("contribution.form.communityTypeLabel")} <RequiredMark /></span>
              <button
                type="button"
                className="contribution-field-help-trigger contribution-field-help-trigger--button"
                aria-label={FIELD_HELP.communityType.title}
                onClick={() => setIsCommunityTypeModalOpen(true)}
              >
                <i className="fas fa-circle-info" aria-hidden="true"></i>
              </button>
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="community-type"
                  value={draft.communityType}
                  onChange={(event) => handleFieldChange("communityType", event.target.value)}
                  required
                >
                  {COMMUNITY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{t(`communityType.${option}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {draft.communityType !== "umbrella-org" && (
            <div className="field">
              <label className="label contribution-label-with-help" htmlFor="parent-org-input">
                <span>{t("contribution.form.parentOrgLabel")}</span>
                <FieldHelp
                  content={FIELD_HELP.parentOrg}
                  isOpen={openHelpField === "parentOrg"}
                  onToggle={() => setOpenHelpField((current) => current === "parentOrg" ? null : "parentOrg")}
                  onClose={() => setOpenHelpField(null)}
                />
              </label>
              <div className="control">
                <input
                  id="parent-org-input"
                  className="input"
                  type="text"
                  list="umbrella-orgs-datalist"
                  value={parentOrgQuery}
                  placeholder={t("contribution.form.parentOrgPlaceholder")}
                  onChange={(e) => {
                    const query = e.target.value;
                    setParentOrgQuery(query);
                    const match = umbrellaOrgs.find((c) => c.name === query);
                    handleFieldChange("parentId", match ? match.id : null);
                  }}
                />
                <datalist id="umbrella-orgs-datalist">
                  {umbrellaOrgs.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              {!draft.parentId && (
                <p className="help is-italic" style={{ color: "#888" }}>
                  {t("contribution.form.parentOrgNone")}
                </p>
              )}
            </div>
          )}

          {/*
            Autoría (issue #475): quién organiza este encuentro. Va justo detrás de la
            organización paraguas porque las dos se confunden, y leídas seguidas se
            distinguen: paraguas = pertenece a una red; organizada por = alguien monta el
            encuentro y las dos fichas siguen vivas.
          */}
          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="organized-by-input">
              <span>{t("contribution.form.organizedByLabel")}</span>
              <FieldHelp
                content={FIELD_HELP.organizedBy}
                isOpen={openHelpField === "organizedBy"}
                onToggle={() => setOpenHelpField((current) => current === "organizedBy" ? null : "organizedBy")}
                onClose={() => setOpenHelpField(null)}
              />
            </label>
            {draft.organizedBy?.length > 0 && (
              <div className="contribution-organizers">
                {draft.organizedBy.map((organizerId) => {
                  const organizer = communities.find((c) => c.id === organizerId);
                  const name = organizer?.name ?? `#${organizerId}`;

                  return (
                    <span key={organizerId} className="contribution-organizer-chip">
                      {name}
                      <button
                        type="button"
                        aria-label={t("contribution.form.organizedByRemove", { name })}
                        onClick={() => handleFieldChange(
                          "organizedBy",
                          draft.organizedBy.filter((id) => id !== organizerId)
                        )}
                      >
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="control">
              <input
                id="organized-by-input"
                className="input"
                type="text"
                list="organizers-datalist"
                value={organizedByQuery}
                placeholder={t("contribution.form.organizedByPlaceholder")}
                onChange={(e) => {
                  const query = e.target.value;
                  const match = organizerCandidates.find((c) => c.name === query);

                  if (match && !(draft.organizedBy ?? []).includes(match.id)) {
                    handleFieldChange("organizedBy", [...(draft.organizedBy ?? []), match.id]);
                    setOrganizedByQuery("");
                    return;
                  }

                  setOrganizedByQuery(query);
                }}
              />
              <datalist id="organizers-datalist">
                {organizerCandidates
                  .filter((c) => !(draft.organizedBy ?? []).includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
              </datalist>
            </div>
            {!(draft.organizedBy?.length > 0) && (
              <p className="help is-italic" style={{ color: "#888" }}>
                {t("contribution.form.organizedByNone")}
              </p>
            )}
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-format">
              <span>{t("contribution.form.formatLabel")} <RequiredMark /></span>
                <FieldHelp
                  content={FIELD_HELP.eventFormat}
                  isOpen={openHelpField === "eventFormat"}
                  onToggle={() => setOpenHelpField((current) => current === "eventFormat" ? null : "eventFormat")}
                  onClose={() => setOpenHelpField(null)}
                />
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="community-format"
                  value={draft.eventFormat}
                  onChange={(event) => handleFieldChange("eventFormat", event.target.value)}
                  required
                >
                  {EVENT_FORMAT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{t(`eventFormat.${option}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-geographic-scope">
              <span>{t("contribution.form.geographicScopeLabel")}</span>
              <FieldHelp
                content={FIELD_HELP.geographicScope}
                isOpen={openHelpField === "geographicScope"}
                onToggle={() => setOpenHelpField((current) => current === "geographicScope" ? null : "geographicScope")}
                onClose={() => setOpenHelpField(null)}
              />
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="community-geographic-scope"
                  value={draft.geographicScope ?? "unknown"}
                  onChange={(event) => handleFieldChange("geographicScope", event.target.value)}
                >
                  {GEOGRAPHIC_SCOPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{t(`geographicScope.${option}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <fieldset className="field open-to-field contribution-grid-span-2">
            <legend className="label">{t("openTo.title")}</legend>
            <p className="open-to-note">{t("openTo.note")}</p>
            <OpenToOptions selected={draft.openTo ?? []}
              onToggle={(option) => handleFieldChange("openTo", toggleSelection(draft.openTo ?? [], option))} />
          </fieldset>

          {shouldShowLocationField && (
            <div className="field">
              <label className="label contribution-label-with-help" htmlFor="community-location">
                <span>{t("contribution.form.locationLabel")} <RequiredMark /></span>
                <FieldHelp
                  content={FIELD_HELP.location}
                  isOpen={openHelpField === "location"}
                  onToggle={() => setOpenHelpField((current) => current === "location" ? null : "location")}
                  onClose={() => setOpenHelpField(null)}
                />
              </label>
              <div className="control">
                <input
                  id="community-location"
                  className="input"
                  type="text"
                  value={draft.location}
                  onChange={(event) => handleFieldChange("location", event.target.value)}
                  placeholder={t("contribution.form.locationPlaceholder")}
                  required
                />
              </div>
            </div>
          )}

          <div className="field contribution-grid-span-2">
            <label className="label contribution-label-with-help" htmlFor="community-short-description">
              <span>{t("contribution.form.shortDescriptionLabel")}</span>
              <FieldHelp
                content={FIELD_HELP.shortDescription}
                isOpen={openHelpField === "shortDescription"}
                onToggle={() => setOpenHelpField((current) => current === "shortDescription" ? null : "shortDescription")}
                onClose={() => setOpenHelpField(null)}
              />
            </label>
            <div className="control">
              <textarea
                id="community-short-description"
                className="textarea"
                value={draft.shortDescription ?? ""}
                onChange={(event) => handleFieldChange("shortDescription", event.target.value.slice(0, SHORT_DESCRIPTION_MAX_LENGTH))}
                placeholder={t("contribution.form.shortDescriptionPlaceholder")}
                maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                rows={3}
              />
            </div>
            <p className="contribution-field-note">
              {t("contribution.form.shortDescriptionExample")}
            </p>
            <p className="contribution-field-counter">
              {(draft.shortDescription ?? "").length}/{SHORT_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div className="field contribution-grid-span-2">
            <label className="label" htmlFor="community-langs">
              {t("contribution.form.langsLabel")} <RequiredMark />
            </label>
            <div id="community-langs" className="contribution-check-grid" role="group" aria-label={t("contribution.form.langsLabel")}>
              {languageOptions.map((option) => {
                const isSelected = draft.langs.includes(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className="contribution-check-item"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setHasUserInteracted(true);
                      setDraft((current) => {
                        const nextLangs = toggleSelection(current.langs, option.id);
                        return {
                          ...current,
                          langs: nextLangs.length > 0 ? nextLangs : ["es"],
                        };
                      });
                    }}
                  >
                    <span className="contribution-check-item-label">{option.label}</span>
                    <span className="contribution-check-item-action">
                      {isSelected ? t("contribution.form.langSelected") : t("contribution.taxonomy.add")}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="contribution-field-note">
              {t("contribution.form.langsHelp")}
            </p>
          </div>

          <div className="field">
            <label className="label" htmlFor="community-contact">{t("contribution.form.contactLabel")}</label>
            <div className="control">
              <input
                id="community-contact"
                className="input"
                type="text"
                value={draft.contactInfo}
                onChange={(event) => handleFieldChange("contactInfo", event.target.value)}
                placeholder={t("contribution.form.contactPlaceholder")}
              />
            </div>
          </div>

          <div className="field contribution-grid-span-2">
            <label className="label" htmlFor="community-thumbnail">{t("contribution.form.thumbnailLabel")} <RequiredMark /></label>
            <div className="contribution-thumbnail-field">
              {previewThumbnailUrl ? (
                <div className="contribution-thumbnail-preview">
                  <img
                    src={previewThumbnailUrl}
                    alt={t("contribution.form.thumbnailAlt", { name: draft.name || "" })}
                    onLoad={(event) => {
                      if (!shouldWarnAboutThumbnailAspect) {
                        setThumbnailAspectWarning(false);
                        return;
                      }

                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (!naturalWidth || !naturalHeight) {
                        setThumbnailAspectWarning(false);
                        return;
                      }

                      const aspectRatio = naturalWidth / naturalHeight;
                      setThumbnailAspectWarning(aspectRatio < 0.75 || aspectRatio > 1.4);
                    }}
                    onError={() => setThumbnailAspectWarning(false)}
                  />
                </div>
              ) : null}

              {isEditMode && (
                <button
                  type="button"
                  className="button is-light is-small"
                  onClick={handleReplaceThumbnailToggle}
                >
                  {draft.replaceThumbnail ? t("contribution.form.keepImage") : t("contribution.form.replaceImage")}
                </button>
              )}

              {(!isEditMode || draft.replaceThumbnail) && (
                <>
                  <p className="contribution-thumbnail-help">
                    {t("contribution.form.thumbnailHelp")}
                  </p>
                  <div className="control contribution-thumbnail-control">
                    <input
                      id="community-thumbnail"
                      className="input"
                      type="url"
                      value={draft.thumbnailUrl}
                      onChange={(event) => handleFieldChange("thumbnailUrl", event.target.value)}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  {!thumbnailAspectWarning && (
                    <p className="help contribution-thumbnail-hint">{t("contribution.form.thumbnailHint")}</p>
                  )}
                  {thumbnailAspectWarning && (
                    <p className="help contribution-thumbnail-aspect-warning" role="status">
                      <span aria-hidden="true">⚠️ </span>
                      {t("contribution.form.thumbnailAspectWarning")}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </section>

      <UrlFields
        primaryUrl={draft.communityUrl}
        onPrimaryUrlChange={(value) => handleFieldChange("communityUrl", value)}
        urls={draft.urls}
        onUrlRowChange={handleUrlRowChange}
        onAddUrlRow={handleAddUrlRow}
        onRemoveUrlRow={handleRemoveUrlRow}
        onArchiveUrlRow={handleArchiveUrl}
        archivedUrls={draft.archivedUrls ?? []}
        onRestoreArchivedUrl={handleRestoreArchivedUrl}
        onRemoveArchivedUrl={handleRemoveArchivedUrl}
      />

      <OteSection urls={draft.urls ?? []} onChange={handleOteFeedChange} />

      <ArchivedUrlWarning matches={archivedUrlMatches} />

      <DuplicateWarning
        matches={duplicates.byUrl}
        emptyMessage={t("contribution.duplicate.byUrlWarning")}
      />

      <TaxonomyPicker
        title={t("contribution.tags.title")}
        description={t("contribution.tags.description")}
        items={allTags}
        selectedValues={draft.tags}
        onToggle={(value) => {
          setHasUserInteracted(true);
          setDraft((current) => ({ ...current, tags: toggleSelection(current.tags, value) }));
        }}
        searchValue={tagQuery}
        onSearchChange={setTagQuery}
        groupByCategory
        defaultExpanded={false}
        collapsibleGroups={isEditMode}
        collapseGroupsByDefault={isEditMode}
        categoryOrder={TAG_CATEGORY_ORDER}
        suggestionCta={{
          text: t("contribution.tags.suggestionText"),
          label: t("contribution.tags.openIssue"),
          href: "https://github.com/ComBuildersES/communities-directory/issues/new",
        }}
        matchesAllToggle={{
          checked: Boolean(draft.matchesAllTags),
          onChange: (checked) => {
            setHasUserInteracted(true);
            setDraft((current) => ({ ...current, matchesAllTags: checked }));
          },
          label: t("contribution.tags.matchesAllLabel"),
          notice: t("contribution.tags.matchesAllNotice"),
          warning: t("contribution.tags.matchesAllWarning"),
        }}
      />

      <TaxonomyPicker
        title={t("contribution.audience.title")}
        description={t("contribution.audience.description")}
        items={groupedAudience}
        selectedValues={draft.targetAudience}
        onToggle={(value) => {
          setHasUserInteracted(true);
          setDraft((current) => ({
            ...current,
            targetAudience: toggleSelection(current.targetAudience, value),
          }));
        }}
        searchValue={audienceQuery}
        onSearchChange={setAudienceQuery}
        groupByCategory
        defaultExpanded={false}
        categoryOrder={AUDIENCE_CATEGORY_ORDER}
        suggestionCta={{
          text: t("contribution.audience.suggestionText"),
          label: t("contribution.audience.openIssue"),
          href: "https://github.com/ComBuildersES/communities-directory/issues/new",
        }}
        matchesAllToggle={{
          checked: Boolean(draft.matchesAllAudience),
          onChange: (checked) => {
            setHasUserInteracted(true);
            setDraft((current) => ({ ...current, matchesAllAudience: checked }));
          },
          label: t("contribution.audience.matchesAllLabel"),
          notice: t("contribution.audience.matchesAllNotice"),
          warning: t("contribution.audience.matchesAllWarning"),
        }}
      />

      <section className="contribution-card">
        <div className="contribution-card-header">
          <div>
            <h3>{t("contribution.json.title")}</h3>
            <p>{t("contribution.json.description")}</p>
          </div>
          <button
            type="button"
            className="button is-light contribution-collapse-toggle"
            onClick={() => setIsJsonExpanded((current) => !current)}
            aria-expanded={isJsonExpanded}
          >
            {isJsonExpanded ? t("contribution.json.hide") : t("contribution.json.show")}
          </button>
        </div>

        {isJsonExpanded && (
          <pre className="contribution-json-preview">
            <code>{JSON.stringify(payload, null, 2)}</code>
          </pre>
        )}

        <div className="contribution-submit-row">
          <button type="submit" className="button is-primary is-medium contribution-submit-button">
            {isEditMode ? t("contribution.submit.edit") : t("contribution.submit.new")}
          </button>
          {!isEditMode && (
            <a
              className="button is-light is-medium contribution-submit-button"
              href={submissionEmailUrl}
              onClick={event => {
                if (!formRef.current?.reportValidity()) { event.preventDefault(); return; }
                setHasOpenedIssue(true);
                setHasPreparedContribution(true);
              }}
            >
              {t("contribution.submit.email")}
            </a>
          )}
          <p className="contribution-submit-note">
            {isEditMode ? t("contribution.submit.note") : t("contribution.submit.noteWithEmail")}
          </p>
        </div>
        {hasOpenedIssue && hasPreparedContribution && <>
          <p className="contribution-submit-note" role="status">{t("contribution.submit.externalPending")}</p>
          <BuildersInvitation onSelectMember={onSelectMember} />
        </>}
      </section>
    </form>
  );
}

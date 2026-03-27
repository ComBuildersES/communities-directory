/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildCommunityPayload,
  buildCommunityDeletionIssueUrl,
  buildContributionPath,
  buildGitHubIssueUrl,
  clearContributionDraft,
  COMMUNITY_STATUS_OPTIONS,
  COMMUNITY_TYPE_OPTIONS,
  EVENT_FORMAT_OPTIONS,
  EVENT_FORMATS_WITH_LOCATION,
  areCommunityNamesSimilar,
  getComparableCommunityUrls,
  getCommunityDraft,
  getContributionDraftStorageKey,
  getNextCommunityId,
  loadContributionDraft,
  normalizeUrlForComparison,
  saveContributionDraft,
  SHORT_DESCRIPTION_MAX_LENGTH,
  toggleSelection,
  URL_PLATFORM_OPTIONS,
} from "../../lib/communitySubmission";
import {
  COMMUNITY_LANGUAGE_OPTIONS,
  normalizeCommunityLangs,
} from "../../lib/communityLanguages.js";
import { inferProvinceIdFromNominatim } from "../../lib/provinceNormalization";
import "./CommunityContribution.css";

function getFieldHelp(t) {
  return {
    status: {
      title: t("contribution.fieldHelp.status.title"),
      description: t("contribution.fieldHelp.status.description"),
      bullets: [
        t("contribution.fieldHelp.status.bullet0"),
        t("contribution.fieldHelp.status.bullet1"),
        t("contribution.fieldHelp.status.bullet2"),
      ],
    },
    communityType: {
      title: t("contribution.fieldHelp.communityType.title"),
      description: t("contribution.fieldHelp.communityType.description"),
      items: [
        {
          label: "Tech Meetup",
          detail: t("contribution.fieldHelp.communityType.techMeetup"),
          examples: [
            { name: "/dev/null talks", url: "https://devnulltalks.github.io/" },
            { name: "Arcasiles Community Madrid", url: "https://arcasiles.com/" },
            { name: "AiBirras", url: "https://aibirras.com/" },
          ],
        },
        {
          label: "Conferencia",
          detail: t("contribution.fieldHelp.communityType.conference"),
          examples: [
            { name: "Lareira Conf", url: "https://www.lareiraconf.es/" },
            { name: "CommitConf", url: "https://commit-conf.com/" },
            { name: "TRGCON", url: "https://trgcon.com/" },
          ],
        },
        {
          label: "Organización paraguas",
          detail: t("contribution.fieldHelp.communityType.umbrellaOrg"),
          examples: [
            { name: "GDG Spain", url: "https://gdg.es/" },
            { name: "Python España", url: "https://es.python.org" },
            { name: "Sysarmy", url: "https://sysarmy.com/" },
          ],
        },
        {
          label: "Hacklab",
          detail: t("contribution.fieldHelp.communityType.hacklab"),
          examples: [
            { name: "A Industriosa", url: "https://www.meetup.com/es-ES/AIndustriosa/" },
            { name: "AKASHA Hub", url: "https://akasha.barcelona/" },
            { name: "BricoLabs", url: "https://bricolabs.cc/" },
          ],
        },
        {
          label: "Grupo colaborativo",
          detail: t("contribution.fieldHelp.communityType.collaborativeGroup"),
          examples: [
            { name: "Adopta un Junior", url: "https://adoptaunjunior.es/" },
            { name: "Asociación Atlantics", url: "https://asociacionatlantics.org/" },
            { name: "Aula de Software Libre Córdoba", url: "https://www.uco.es/aulasoftwarelibre/" },
          ],
        },
        {
          label: "Meta comunidad",
          detail: t("contribution.fieldHelp.communityType.metaCommunity"),
          examples: [
            { name: "Community Builders", url: "https://linktr.ee/ComBuilders_ES" },
            { name: "Granada Tech", url: "https://www.granadatech.org/" },
            { name: "SVQTech", url: "https://svqtech.com/" },
          ],
        },
        {
          label: "Grupo de ayuda mutua",
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
  };
}

const TAG_CATEGORY_ORDER = [
  "Web y Frontend",
  "Frameworks, Librerías y Stacks",
  "Lenguajes de programación",
  "Tech for Social Good",
  "Datos, IA y Analítica",
  "DevOps, Cloud e Infraestructura",
  "Arquitectura y Paradigmas",
  "Startups, Negocio y Producto",
  "Bases de Datos y Almacenamiento",
  "Ciberseguridad",
  "Mobile y Sistemas Operativos",
  "Hardware, IoT y Maker",
  "DevTools",
  "CMS",
  "Tecnologías Descentralizadas",
  "Realidad Extendida y 3D",
  "Videojuegos",
];

const AUDIENCE_CATEGORY_ORDER = [
  "Etapa profesional",
  "Desarrollo de software",
  "Datos e inteligencia artificial",
  "Plataforma, cloud y operaciones",
  "Calidad, seguridad y arquitectura",
  "Liderazgo, producto y delivery",
  "Diseño, experiencia y contenido",
  "Negocio, comunidad e impacto",
  "Hardware, sistemas y robótica",
  "Investigación, educación y academia",
];

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
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(defaultExpanded);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    const hasSearch = searchValue.trim().length > 0;
    if (hasSearch) {
      setIsExpanded(true);
      return;
    }

    setIsExpanded(isManuallyExpanded);
  }, [isManuallyExpanded, searchValue]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const haystack = [
        item.label,
        item.description,
        item.category,
        ...(item.synonyms ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
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

  const availableGroupedItems = useMemo(
    () => orderedGroupedItems
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !selectedValues.includes(item.id)),
      }))
      .filter((group) => group.items.length > 0),
    [orderedGroupedItems, selectedValues]
  );

  const itemsMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  );

  useEffect(() => {
    if (!collapsibleGroups || !groupByCategory) return;

    setCollapsedGroups((current) => {
      const nextState = { ...current };

      availableGroupedItems.forEach((group) => {
        if (!(group.label in nextState)) {
          nextState[group.label] = collapseGroupsByDefault;
        }
      });

      return nextState;
    });
  }, [availableGroupedItems, collapseGroupsByDefault, collapsibleGroups, groupByCategory]);

  const hasActiveSearch = searchValue.trim().length > 0;
  const useCollapsibleGroups = collapsibleGroups && groupByCategory && !hasActiveSearch;

  return (
    <section className="contribution-card">
      <div className="contribution-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
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
      </div>

      <label className="label" htmlFor={`${title}-search`}>{t("contribution.taxonomy.searchLabel")}</label>
      <input
        id={`${title}-search`}
        className="input"
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("contribution.taxonomy.searchPlaceholder")}
      />

      <div className="contribution-taxonomy-summary">
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

      {isExpanded && (
        <>
          <div className="contribution-taxonomy-list">
            {availableGroupedItems.map((group) => (
              <div key={group.label || "all"} className="contribution-taxonomy-group">
                {group.label && useCollapsibleGroups ? (
                  <button
                    type="button"
                    className="contribution-taxonomy-group-toggle"
                    onClick={() => {
                      setCollapsedGroups((current) => ({
                        ...current,
                        [group.label]: !current[group.label],
                      }));
                    }}
                    aria-expanded={!collapsedGroups[group.label]}
                  >
                    <span className="contribution-taxonomy-group-toggle-label">{group.label}</span>
                    <span className="contribution-taxonomy-group-toggle-meta">
                      {group.items.length}
                      <i
                        className={`fas ${collapsedGroups[group.label] ? "fa-chevron-down" : "fa-chevron-up"}`}
                        aria-hidden="true"
                      ></i>
                    </span>
                  </button>
                ) : (
                  group.label && <h4>{group.label}</h4>
                )}
                {(!useCollapsibleGroups || !collapsedGroups[group.label]) && (
                  <div className="contribution-check-grid">
                    {group.items.map((item) => (
                      <TaxonomyTooltip key={item.id} item={item}>
                        <button
                          type="button"
                          className="contribution-check-item"
                          onClick={() => {
                            onToggle(item.id);
                            if (!isManuallyExpanded) {
                              onSearchChange("");
                              setIsExpanded(false);
                            }
                          }}
                        >
                          <span className="contribution-check-item-label">{item.label}</span>
                          <span className="contribution-check-item-action">{t("contribution.taxonomy.add")}</span>
                        </button>
                      </TaxonomyTooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}

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

function UrlFields({ primaryUrl, onPrimaryUrlChange, urls, onUrlChange }) {
  const { t } = useTranslation();
  const [expandedPlatforms, setExpandedPlatforms] = useState([]);
  const [isPrimaryHelpOpen, setIsPrimaryHelpOpen] = useState(false);
  const [openPlatformHelp, setOpenPlatformHelp] = useState(null);
  const platformHelpContent = {
    web:            { title: t("contribution.urlHelp.web.title"),            description: t("contribution.urlHelp.web.description"),            bullets: [t("contribution.urlHelp.web.bullet0"),            t("contribution.urlHelp.web.bullet1")] },
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
  const localizedPlatformOptions = useMemo(
    () => URL_PLATFORM_OPTIONS.map(({ key }) => ({
      key,
      label: t(`communityModal.url.${key}`, { defaultValue: key }),
    })),
    [t]
  );
  const visiblePlatforms = useMemo(
    () => localizedPlatformOptions.filter(({ key }) => (urls[key] ?? "").trim() || expandedPlatforms.includes(key)),
    [expandedPlatforms, localizedPlatformOptions, urls]
  );
  const hiddenPlatforms = useMemo(
    () => localizedPlatformOptions.filter(({ key }) => !visiblePlatforms.some((platform) => platform.key === key)),
    [localizedPlatformOptions, visiblePlatforms]
  );

  useEffect(() => {
    const filledPlatforms = localizedPlatformOptions
      .filter(({ key }) => (urls[key] ?? "").trim())
      .map(({ key }) => key);

    setExpandedPlatforms((current) => [...new Set([...current, ...filledPlatforms])]);
  }, [localizedPlatformOptions, urls]);

  const showPlatform = (key) => {
    setExpandedPlatforms((current) => [...new Set([...current, key])]);
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

      <div className="contribution-grid contribution-grid--compact">
        {visiblePlatforms.map(({ key, label }) => (
          <div className="field" key={key}>
            <label className="label contribution-label-with-help" htmlFor={`url-${key}`}>
              <span>{label}</span>
              {platformHelpContent[key] && (
                <FieldHelp
                  content={platformHelpContent[key]}
                  isOpen={openPlatformHelp === key}
                  onToggle={() => setOpenPlatformHelp((current) => current === key ? null : key)}
                  onClose={() => setOpenPlatformHelp(null)}
                />
              )}
            </label>
            <div className="control">
              <input
                id={`url-${key}`}
                className="input"
                type="url"
                value={urls[key] ?? ""}
                onChange={(event) => onUrlChange(key, event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
      </div>

      {hiddenPlatforms.length > 0 && (
        <div className="contribution-extra-platforms">
          <p>{t("contribution.urls.addMoreProfiles")}</p>
          <div className="contribution-extra-platform-list">
            {hiddenPlatforms.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="button is-small is-light contribution-extra-platform-button"
                onClick={() => showPlatform(key)}
              >
                + {label}
              </button>
            ))}
          </div>
          <p className="contribution-extra-platform-note">
            {t("contribution.urls.missingPlatformNote")}{" "}
            <a
              href="https://github.com/ComBuildersES/communities-directory/issues"
              target="_blank"
              rel="noreferrer"
            >
              {t("contribution.urls.openIssue")}
            </a>{" "}
            {t("contribution.urls.missingPlatformNoteSuffix")}
          </p>
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
    shortDescription: draft.shortDescription,
    topics: draft.topics,
    langs: draft.langs,
    tags: draft.tags,
    targetAudience: draft.targetAudience,
    contactInfo: draft.contactInfo,
    communityUrl: draft.communityUrl,
    urls: draft.urls,
    thumbnailUrl: draft.thumbnailUrl,
    replaceThumbnail: draft.replaceThumbnail,
    latLon: draft.latLon,
    displayOnMap: draft.displayOnMap,
  });
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
    urls: proposalDraft.urls ?? baseDraft.urls,
    latLon: {
      lat: proposalDraft.latLon?.lat ?? baseDraft.latLon?.lat ?? "",
      lon: proposalDraft.latLon?.lon ?? baseDraft.latLon?.lon ?? "",
    },
    replaceThumbnail: false,
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
}) {
  const { t } = useTranslation();
  const FIELD_HELP = useMemo(() => getFieldHelp(t), [t]);
  const DELETION_REASON_OPTIONS = useMemo(() => getDeletionReasonOptions(t), [t]);
  const formRef = useRef(null);
  const nextId = useMemo(() => getNextCommunityId(communities), [communities]);
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
  const [draft, setDraft] = useState(() => mergeDraftWithProposal(getCommunityDraft(existingCommunity, nextId), proposalDraft));
  const [tagQuery, setTagQuery] = useState("");
  const [audienceQuery, setAudienceQuery] = useState("");
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
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [restoredDraftMeta, setRestoredDraftMeta] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isDeletionFormVisible, setIsDeletionFormVisible] = useState(false);
  const [deletionReasonType, setDeletionReasonType] = useState("");
  const [duplicateTargetId, setDuplicateTargetId] = useState("");
  const [duplicateTargetQuery, setDuplicateTargetQuery] = useState("");
  const [otherDeletionReason, setOtherDeletionReason] = useState("");
  const inferredProvinceIdRef = useRef("");
  const datasetSignature = useMemo(() => buildDatasetSignature(communities), [communities]);
  const latestBaseDraft = useMemo(
    () => mergeDraftWithProposal(getCommunityDraft(existingCommunity, nextId), proposalDraft),
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
        urls: storedPayload.urls ?? baseDraft.urls,
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
    () => buildCommunityPayload(draft, existingCommunity),
    [draft, existingCommunity]
  );
  const shouldShowLocationField = (
    EVENT_FORMATS_WITH_LOCATION.includes(draft.eventFormat) &&
    draft.communityType !== "umbrella-org"
  );
  const previewThumbnailUrl = draft.replaceThumbnail
    ? draft.thumbnailUrl
    : (existingCommunity?.thumbnailUrl ?? draft.thumbnailUrl);

  const githubIssueUrl = useMemo(
    () => buildGitHubIssueUrl({ payload, mode: isEditMode ? "edit" : "new", shareUrl }),
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

  const handleFieldChange = (key, value) => {
    setHasUserInteracted(true);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleUrlChange = (key, value) => {
    setHasUserInteracted(true);
    setDraft((current) => ({
      ...current,
      urls: {
        ...current.urls,
        [key]: value,
      },
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
    setHasRestoredDraft(false);
    window.open(githubIssueUrl, "_blank", "noopener,noreferrer");
  };

  const handleDiscardRestoredDraft = () => {
    clearContributionDraft(storageKey);
    setDraft(latestBaseDraft);
    setHasRestoredDraft(false);
    setRestoredDraftMeta(null);
    setHasOpenedIssue(false);
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
            <label className="label" htmlFor="community-thumbnail">{t("contribution.form.thumbnailLabel")}</label>
            <div className="contribution-thumbnail-field">
              {previewThumbnailUrl ? (
                <div className="contribution-thumbnail-preview">
                  <img src={previewThumbnailUrl} alt={t("contribution.form.thumbnailAlt", { name: draft.name || "" })} />
                </div>
              ) : (
                <p className="contribution-thumbnail-empty">{t("contribution.form.thumbnailEmpty")}</p>
              )}

              <button
                type="button"
                className="button is-light is-small"
                onClick={handleReplaceThumbnailToggle}
              >
                {draft.replaceThumbnail ? t("contribution.form.keepImage") : t("contribution.form.replaceImage")}
              </button>

              {draft.replaceThumbnail && (
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
        onUrlChange={handleUrlChange}
      />

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
          <p className="contribution-submit-note">
            {t("contribution.submit.note")}
          </p>
        </div>
      </section>
    </form>
  );
}

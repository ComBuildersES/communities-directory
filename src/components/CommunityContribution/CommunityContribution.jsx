/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCommunityPayload,
  buildContributionPath,
  buildGitHubIssueUrl,
  COMMUNITY_STATUS_OPTIONS,
  COMMUNITY_TYPE_OPTIONS,
  EVENT_FORMAT_OPTIONS,
  EVENT_FORMATS_WITH_LOCATION,
  getCommunityDraft,
  getNextCommunityId,
  SHORT_DESCRIPTION_MAX_LENGTH,
  toggleSelection,
  URL_PLATFORM_OPTIONS,
} from "../../lib/communitySubmission";
import "./CommunityContribution.css";

const FIELD_HELP = {
  status: {
    title: "Cómo elegir el estado",
    description: "Usa el estado según la actividad reciente de la comunidad.",
    bullets: [
      "Activa: hay personas dinamizando la comunidad y ha tenido actividad recientemente.",
      "Inactiva: en meetups suele aplicarse si lleva más de un año sin actividad; en conferencias, si ha superado su cadencia habitual.",
      "Desconocido: úsalo si no está claro.",
    ],
  },
  communityType: {
    title: "Cómo elegir el tipo",
    description: "Elige el tipo principal que mejor describe cómo funciona la comunidad.",
    items: [
      {
        label: "Tech Meetup",
        detail: "Encuentros periódicos, normalmente en formato charla y tamaño contenido.",
        examples: [
          { name: "/dev/null talks", url: "https://devnulltalks.github.io/" },
          { name: "Arcasiles Community Madrid", url: "https://arcasiles.com/" },
          { name: "AiBirras", url: "https://aibirras.com/" },
        ],
      },
      {
        label: "Conferencia",
        detail: "Evento normalmente anual, más grande y con varias ponencias o tracks.",
        examples: [
          { name: "Lareira Conf", url: "https://www.lareiraconf.es/" },
          { name: "CommitConf", url: "https://commit-conf.com/" },
          { name: "TRGCON", url: "https://trgcon.com/" },
        ],
      },
      {
        label: "Organización paraguas",
        detail: "Agrupa comunidades locales bajo una marca o estructura común.",
        examples: [
          { name: "GDG Spain", url: "https://gdg.es/" },
          { name: "Python España", url: "https://es.python.org" },
          { name: "Sysarmy", url: "https://sysarmy.com/" },
        ],
      },
      {
        label: "Hacklab",
        detail: "Comunidad maker con espacio físico y recursos compartidos.",
        examples: [
          { name: "A Industriosa", url: "https://www.meetup.com/es-ES/AIndustriosa/" },
          { name: "AKASHA Hub", url: "https://akasha.barcelona/" },
          { name: "BricoLabs", url: "https://bricolabs.cc/" },
        ],
      },
      {
        label: "Grupo colaborativo",
        detail: "Personas que colaboran en proyectos, eventos, contenidos u otras iniciativas comunes.",
        examples: [
          { name: "Adopta un Junior", url: "https://adoptaunjunior.es/" },
          { name: "Asociación Atlantics", url: "https://asociacionatlantics.org/" },
          { name: "Aula de Software Libre Córdoba", url: "https://www.uco.es/aulasoftwarelibre/" },
        ],
      },
      {
        label: "Meta comunidad",
        detail: "Organización que agrupa a personas que dinamizan o representan otras comunidades.",
        examples: [
          { name: "Community Builders", url: "https://linktr.ee/ComBuilders_ES" },
          { name: "Granada Tech", url: "https://www.granadatech.org/" },
          { name: "SVQTech", url: "https://svqtech.com/" },
        ],
      },
      {
        label: "Grupo de ayuda mutua",
        detail: "La prioridad es ayudarse mutuamente mediante foros, chats, listas u otros canales.",
        examples: [
          { name: "BCN Engineering", url: "https://bcneng.org/" },
          { name: "Midudev", url: "https://discord.com/invite/midudev" },
          { name: "Mouredev", url: "https://discord.com/invite/mouredev" },
        ],
      },
    ],
  },
  eventFormat: {
    title: "Cómo elegir el formato",
    description: "Piensa en cómo ocurre habitualmente la actividad principal de la comunidad.",
    bullets: [
      "Presencial: hacen encuentros en persona y no suelen retransmitirlos en directo.",
      "Online: su actividad es principalmente en línea.",
      "Híbridos: hay encuentros presenciales y además suelen retransmitirse.",
      "Desconocido: si no tienes suficiente contexto.",
    ],
  },
  location: {
    title: "Cómo indicar la localización",
    description: "Indica la referencia geográfica más útil para entender dónde ocurre la actividad.",
    bullets: [
      "Usa ciudad o región principal con un formato tipo `Ciudad, País`, por ejemplo `Barcelona, España`.",
      "Usa `Itinerante` cuando la comunidad cambia de ciudad o sede según la edición o el evento.",
      "Si no tienes claro qué valor poner, mejor abre un issue para comentarlo antes de enviarlo.",
    ],
  },
  shortDescription: {
    title: "Cómo escribir la descripción breve",
    description: "Resume en una frase qué hace especial a esta comunidad.",
    bullets: [
      "Prioriza qué ofrece, su enfoque o su propuesta de valor.",
      "Evita repetir solo etiquetas, tecnologías o público objetivo que ya hayas marcado arriba.",
      "Una longitud ideal suele estar entre 140 y 220 caracteres.",
    ],
  },
};

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
          <button type="button" className="contribution-help-modal-close" onClick={onClose} aria-label="Cerrar ayuda">
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
                    {" "}Ejemplos:{" "}
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
  suggestionCta = null,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(defaultExpanded);

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
      const category = item.category || "Sin categoría";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });

    return Array.from(groups.entries()).map(([label, groupItems]) => ({
      label,
      items: groupItems,
    }));
  }, [groupByCategory, visibleItems]);

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
          {isExpanded ? "Mostrar menos" : "Mostrar todos"}
        </button>
      </div>

      <label className="label" htmlFor={`${title}-search`}>Buscar</label>
      <input
        id={`${title}-search`}
        className="input"
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Filtra por nombre, descripción o sinónimos"
      />

      <div className="contribution-taxonomy-summary">
        {selectedValues.length > 0 ? (
          <div className="contribution-selected-pills contribution-selected-pills--summary">
            {selectedValues.map((selectedId) => {
              const item = items.find((entry) => entry.id === selectedId);
              return (
                <button
                  key={selectedId}
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
              );
            })}
          </div>
        ) : (
          <p>Todavía no has seleccionado ninguna.</p>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="contribution-taxonomy-list">
            {groupedItems.map((group) => (
              <div key={group.label || "all"} className="contribution-taxonomy-group">
                {group.label && <h4>{group.label}</h4>}
                <div className="contribution-check-grid">
                  {group.items.map((item) => (
                    <label key={item.id} className="contribution-check-item">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(item.id)}
                        onChange={() => {
                          onToggle(item.id);
                          if (!isManuallyExpanded) {
                            onSearchChange("");
                            setIsExpanded(false);
                          }
                        }}
                      />
                      <span>
                        <strong>{item.label}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                    </label>
                  ))}
                </div>
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
  const [expandedPlatforms, setExpandedPlatforms] = useState([]);
  const [isPrimaryHelpOpen, setIsPrimaryHelpOpen] = useState(false);
  const visiblePlatforms = useMemo(
    () => URL_PLATFORM_OPTIONS.filter(({ key }) => (urls[key] ?? "").trim() || expandedPlatforms.includes(key)),
    [expandedPlatforms, urls]
  );
  const hiddenPlatforms = useMemo(
    () => URL_PLATFORM_OPTIONS.filter(({ key }) => !visiblePlatforms.some((platform) => platform.key === key)),
    [visiblePlatforms]
  );

  useEffect(() => {
    const filledPlatforms = URL_PLATFORM_OPTIONS
      .filter(({ key }) => (urls[key] ?? "").trim())
      .map(({ key }) => key);

    setExpandedPlatforms((current) => [...new Set([...current, ...filledPlatforms])]);
  }, [urls]);

  const showPlatform = (key) => {
    setExpandedPlatforms((current) => [...new Set([...current, key])]);
  };

  return (
    <section className="contribution-card">
      <div className="contribution-card-header">
        <div>
          <h3>URLs</h3>
          <p>Añade la URL principal y, si quieres, más perfiles o enlaces relevantes de la comunidad.</p>
        </div>
      </div>

      <div className="field contribution-grid-span-2">
        <label className="label contribution-label-with-help" htmlFor="community-url">
          <span>URL principal <RequiredMark /></span>
          <FieldHelp
            content={{
              title: "Cómo elegir la URL principal",
              description: "Usa como URL principal la referencia más estable de la comunidad a largo plazo.",
              bullets: [
                "Prioriza una web propia o landing estable frente a enlaces más efímeros.",
                "Si no existe web propia, usa el enlace que mejor represente a la comunidad y tenga menos probabilidad de expirar.",
                "El resto de perfiles pueden añadirse como URLs adicionales.",
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
            <label className="label" htmlFor={`url-${key}`}>{label}</label>
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
          <p>¿Quieres añadir más perfiles?</p>
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
        </div>
      )}
    </section>
  );
}

export function CommunityContribution({
  communities,
  allTags,
  allAudience,
  existingCommunity,
}) {
  const formRef = useRef(null);
  const nextId = useMemo(() => getNextCommunityId(communities), [communities]);
  const [draft, setDraft] = useState(() => getCommunityDraft(existingCommunity, nextId));
  const [tagQuery, setTagQuery] = useState("");
  const [audienceQuery, setAudienceQuery] = useState("");
  const [openHelpField, setOpenHelpField] = useState(null);
  const [isCommunityTypeModalOpen, setIsCommunityTypeModalOpen] = useState(false);
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);

  useEffect(() => {
    setDraft(getCommunityDraft(existingCommunity, nextId));
  }, [existingCommunity, nextId]);

  useEffect(() => {
    if (draft.communityType !== "Organización paraguas") return;
    if (draft.location === "n/a") return;

    setDraft((current) => ({
      ...current,
      location: "n/a",
    }));
  }, [draft.communityType, draft.location]);

  useEffect(() => {
    if (draft.communityType === "Organización paraguas") return;
    if (EVENT_FORMATS_WITH_LOCATION.includes(draft.eventFormat)) return;
    if (!draft.location) return;

    setDraft((current) => ({
      ...current,
      location: "",
    }));
  }, [draft.communityType, draft.eventFormat, draft.location]);

  const isEditMode = Boolean(existingCommunity);
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
    draft.communityType !== "Organización paraguas"
  );
  const previewThumbnailUrl = draft.replaceThumbnail
    ? draft.thumbnailUrl
    : (existingCommunity?.thumbnailUrl ?? draft.thumbnailUrl);

  const githubIssueUrl = useMemo(
    () => buildGitHubIssueUrl({ payload, mode: isEditMode ? "edit" : "new", shareUrl }),
    [isEditMode, payload, shareUrl]
  );

  const duplicateMatches = useMemo(() => {
    if (isEditMode) return [];

    const normalizedName = payload.name.trim().toLowerCase();
    const normalizedUrl = payload.communityUrl.trim().toLowerCase();
    if (!normalizedName && !normalizedUrl) return [];

    return communities
      .filter((community) => {
        const sameName = normalizedName && community.name?.trim().toLowerCase() === normalizedName;
        const sameUrl = normalizedUrl && community.communityUrl?.trim().toLowerCase() === normalizedUrl;
        return sameName || sameUrl;
      })
      .slice(0, 5);
  }, [communities, isEditMode, payload.communityUrl, payload.name]);

  const handleFieldChange = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleUrlChange = (key, value) => {
    setDraft((current) => ({
      ...current,
      urls: {
        ...current.urls,
        [key]: value,
      },
    }));
  };

  const handleReplaceThumbnailToggle = () => {
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

    window.open(githubIssueUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <form ref={formRef} className="contribution-shell" onSubmit={handleSubmit}>
      <FieldHelpModal
        content={FIELD_HELP.communityType}
        isOpen={isCommunityTypeModalOpen}
        onClose={() => setIsCommunityTypeModalOpen(false)}
      />

      <section className="contribution-hero">
        <div>
          <p className="contribution-eyebrow">Gracias por contribuir 💛</p>
          <p>
            {isEditMode
              ? 'Actualiza los datos de esta comunidad en el formulario y dale al botón "Actualizar" para crear un issue en el repositorio.'
              : 'Completa los datos de la nueva comunidad en el formulario y dale al botón "Sugerir nueva comunidad" para crear un issue en el repositorio.'}
          </p>
        </div>
      </section>

      {duplicateMatches.length > 0 && (
        <article className="message is-warning contribution-message">
          <div className="message-body">
            Hay comunidades con nombre o URL coincidente. Quizá te interese abrir una edición sobre una existente en lugar de crear otra nueva:
            <ul className="contribution-inline-list">
              {duplicateMatches.map((community) => (
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
            <h3>Datos base</h3>
            <p>Campos principales que componen cada comunidad del directorio.</p>
          </div>
          <div className="contribution-metadata">
            <span>ID {payload.id ?? "pendiente"}</span>
            <span>{isEditMode ? "Edición" : "Alta nueva"}</span>
          </div>
        </div>

        <div className="contribution-grid">
          <div className="field">
            <label className="label" htmlFor="community-name">Nombre <RequiredMark /></label>
            <div className="control">
              <input
                id="community-name"
                className="input"
                type="text"
                value={draft.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                placeholder="Ejemplo: Geo Developers"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-status">
              <span>Estado <RequiredMark /></span>
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
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-type">
              <span>Tipo de comunidad <RequiredMark /></span>
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
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label contribution-label-with-help" htmlFor="community-format">
              <span>Formato <RequiredMark /></span>
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
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {shouldShowLocationField && (
            <div className="field">
              <label className="label contribution-label-with-help" htmlFor="community-location">
                <span>Localización <RequiredMark /></span>
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
                  placeholder="Madrid, España o Itinerante"
                  required
                />
              </div>
            </div>
          )}

          <div className="field contribution-grid-span-2">
            <label className="label contribution-label-with-help" htmlFor="community-short-description">
              <span>Descripción breve</span>
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
                placeholder="Describe en una frase qué ofrece esta comunidad, su enfoque o propuesta de valor. Evita repetir las etiquetas o el público objetivo ya seleccionados."
                maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                rows={3}
              />
            </div>
            <p className="contribution-field-note">
              Ejemplo: “Comunidad local que organiza encuentros mensuales para compartir experiencias reales de producto digital y liderazgo técnico.”
            </p>
            <p className="contribution-field-counter">
              {(draft.shortDescription ?? "").length}/{SHORT_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div className="field">
            <label className="label" htmlFor="community-contact">Contacto público</label>
            <div className="control">
              <input
                id="community-contact"
                className="input"
                type="text"
                value={draft.contactInfo}
                onChange={(event) => handleFieldChange("contactInfo", event.target.value)}
                placeholder="email@comunidad.org o URL de contacto"
              />
            </div>
          </div>

          <div className="field contribution-grid-span-2">
            <label className="label" htmlFor="community-thumbnail">Thumbnail o logo</label>
            <div className="contribution-thumbnail-field">
              {previewThumbnailUrl ? (
                <div className="contribution-thumbnail-preview">
                  <img src={previewThumbnailUrl} alt={`Thumbnail de ${draft.name || "la comunidad"}`} />
                </div>
              ) : (
                <p className="contribution-thumbnail-empty">No hay imagen configurada actualmente.</p>
              )}

              <button
                type="button"
                className="button is-light is-small"
                onClick={handleReplaceThumbnailToggle}
              >
                {draft.replaceThumbnail ? "Mantener imagen actual" : "Reemplazar imagen"}
              </button>

              {draft.replaceThumbnail && (
                <>
                  <p className="contribution-thumbnail-help">
                    Para reemplazar la imagen necesitas una URL pública. Si prefieres, abre el issue, sube allí la imagen manualmente y comenta que se use esa.
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

      <TaxonomyPicker
        title="Etiquetas"
        description="Selecciona las etiquetas del catálogo para mejorar descubrimiento y filtros."
        items={allTags}
        selectedValues={draft.tags}
        onToggle={(value) => setDraft((current) => ({ ...current, tags: toggleSelection(current.tags, value) }))}
        searchValue={tagQuery}
        onSearchChange={setTagQuery}
        groupByCategory
        defaultExpanded={false}
        suggestionCta={{
          text: "¿Echas en falta alguna etiqueta o quieres proponer una mejora en la taxonomía?",
          label: "Abrir issue",
          href: "https://github.com/ComBuildersES/communities-directory/issues/new",
        }}
      />

      <TaxonomyPicker
        title="Público objetivo"
        description="Indica a quién va especialmente dirigida la comunidad."
        items={allAudience}
        selectedValues={draft.targetAudience}
        onToggle={(value) => setDraft((current) => ({
          ...current,
          targetAudience: toggleSelection(current.targetAudience, value),
        }))}
        searchValue={audienceQuery}
        onSearchChange={setAudienceQuery}
        defaultExpanded={false}
      />

      <section className="contribution-card">
        <div className="contribution-card-header">
          <div>
            <h3>JSON generado</h3>
            <p>Este es el bloque que viajará dentro del issue de GitHub.</p>
          </div>
          <button
            type="button"
            className="button is-light contribution-collapse-toggle"
            onClick={() => setIsJsonExpanded((current) => !current)}
            aria-expanded={isJsonExpanded}
          >
            {isJsonExpanded ? "Ocultar" : "Mostrar JSON"}
          </button>
        </div>

        {isJsonExpanded && (
          <pre className="contribution-json-preview">
            <code>{JSON.stringify(payload, null, 2)}</code>
          </pre>
        )}

        <div className="contribution-submit-row">
          <button type="submit" className="button is-primary is-medium contribution-submit-button">
            {isEditMode ? "Actualizar" : "Sugerir nueva comunidad"}
          </button>
          <p className="contribution-submit-note">
            Se abrirá GitHub con el título y el cuerpo del issue precargados.
          </p>
        </div>
      </section>
    </form>
  );
}

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllCommunities } from "../../stores/community.store.js";
import { getCodeSnippets } from "../../lib/openDataCode.js";
import "./OpenDataModal.css";

const SITE_URL = "https://directory.communitybuilders.dev";
const REPO_URL = "https://github.com/ComBuildersES/communities-directory";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/deed.es";
const DATA_DOC_URL = `${REPO_URL}/blob/master/docs/DATA.md`;
const ISSUES_URL = `${REPO_URL}/issues`;
const MAILING_LIST_URL = "https://groups.google.com/g/community-builders-es";
const OTE_URL = "https://opentechevents.org/";
const OTE_READER_URL = "https://reader.opentechevents.org/";
const EVENTOS_WIKI_URL = "https://eventos.wiki/";
// Mismo grupo que ofrece el botón flotante de soporte (`SupportFab.jsx`).
const TELEGRAM_GROUP_URL = "https://t.me/+bUyya_Rzv6cxYmE0";

/** Los catálogos existen en los dos idiomas, con los mismos IDs. */
const CATALOGUE_URLS = {
  tagsUrl: `${SITE_URL}/data/tags.json`,
  audienceUrl: `${SITE_URL}/data/audience.json`,
  tagsEnUrl: `${SITE_URL}/data/tags.en.json`,
  audienceEnUrl: `${SITE_URL}/data/audience.en.json`,
};

/**
 * Los enlaces de descarga son relativos al despliegue: así funcionan también en local,
 * donde `npm run dev` ya genera los artefactos. Los prompts, en cambio, llevan la URL
 * absoluta de producción: un chatbot no puede entrar en tu `localhost`.
 */
function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

/**
 * Ficheros publicados, en el orden en que tiene sentido descubrirlos: primero por dónde
 * empezar (`llms.txt`), luego el dataset, luego lo que explica el dataset.
 */
const DATA_FILES = [
  { key: "llms", path: "llms.txt", icon: "fa-wand-magic-sparkles" },
  { key: "communities", path: "data/communities.json", icon: "fa-database" },
  { key: "csv", path: "data/communities.csv", icon: "fa-table" },
  { key: "geojson", path: "data/communities.geojson", icon: "fa-map-location-dot" },
  { key: "schema", path: "data/schema.json", icon: "fa-list-check" },
  // Las taxonomías se publican en los dos idiomas, con los mismos IDs: el chip ofrece
  // ambas en vez de esconder la versión inglesa en una nota al pie.
  {
    key: "tags",
    icon: "fa-tags",
    variants: [
      { lang: "es", path: "data/tags.json" },
      { lang: "en", path: "data/tags.en.json" },
    ],
  },
  {
    key: "audience",
    icon: "fa-users",
    variants: [
      { lang: "es", path: "data/audience.json" },
      { lang: "en", path: "data/audience.en.json" },
    ],
  },
  { key: "llmsFull", path: "llms-full.txt", icon: "fa-file-lines" },
];

/**
 * Las pestañas van por persona, no por herramienta. Antes mezclaban los dos ejes —tres
 * pestañas por herramienta (chatbot, código, agentes) y una por persona (organizo una
 * comunidad)— y obligaban a quien llega a preguntarse si es una herramienta o una persona.
 * "Construyo con los datos" fusiona código y agentes porque ahí persona y herramienta son
 * la misma cosa: quien construye.
 */
const TABS = [
  { id: "attend", icon: "fa-user-group" },
  { id: "organizers", icon: "fa-bullhorn" },
  { id: "found", icon: "fa-seedling" },
  { id: "build", icon: "fa-code" },
];

/**
 * Bloque copiable plegado por defecto: con cinco prompts abiertos el modal se volvía una
 * pared de texto. El botón de copiar funciona sin desplegar, que es el caso de uso
 * habitual — la gente copia, no lee.
 */
function CopyBlock({ text, label, hint }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles, desplegar es lo único que deja copiar a mano.
      setIsOpen(true);
    }
  };

  return (
    <div className={`opendata-copyblock${isOpen ? " opendata-copyblock--open" : ""}`}>
      <div className="opendata-copyblock-head">
        <button
          type="button"
          className="opendata-copyblock-toggle"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <i aria-hidden="true" className="fas fa-chevron-right opendata-copyblock-caret"></i>
          <span className="opendata-copyblock-label">{label}</span>
          {hint && <span className="opendata-copyblock-hint">{hint}</span>}
        </button>
        <button
          type="button"
          className={`opendata-copy-btn${copied ? " opendata-copy-btn--done" : ""}`}
          onClick={copy}
        >
          <i aria-hidden="true" className={`fas ${copied ? "fa-check" : "fa-copy"}`}></i>
          <span>{copied ? t("openData.copied") : t("openData.copy")}</span>
        </button>
      </div>
      {isOpen && <pre className="opendata-copyblock-body">{text}</pre>}
    </div>
  );
}

/**
 * Prompts pensados para lo que el directorio **no** sabe hacer todavía (issue #299):
 * cruzar el dataset consigo mismo, entender las diferencias entre tipos de comunidad,
 * detectar huecos o buscar sinergias. "Comunidades de Python en Valencia" se resuelve mejor
 * y más rápido con los filtros de la propia web, así que eso se dice arriba en vez de
 * ofrecer un prompt para ello.
 *
 * El bloque de reglas del dataset vive una sola vez en `openData.prompts.rules` y cada
 * prompt lo interpola con `{{rules}}`: repetido ocho veces se desincronizaba en el primer
 * cambio, y es justo lo que evita que el modelo se invente lo que el dato no dice.
 */
function usePrompts(keys) {
  const { t, i18n } = useTranslation();
  const catalogueSuffix = i18n.resolvedLanguage === "en" ? ".en" : "";

  return useMemo(() => {
    const promptUrls = {
      dataUrl: `${SITE_URL}/data/communities.json`,
      indexUrl: `${SITE_URL}/llms.txt`,
      schemaUrl: `${SITE_URL}/data/schema.json`,
      ...CATALOGUE_URLS,
      tagsUrl: `${SITE_URL}/data/tags${catalogueSuffix}.json`,
      audienceUrl: `${SITE_URL}/data/audience${catalogueSuffix}.json`,
    };
    const rules = t("openData.prompts.rules", promptUrls);

    return keys.map((key) => ({
      key,
      label: t(`openData.prompts.${key}.label`),
      hint: t(`openData.prompts.${key}.hint`),
      text: t(`openData.prompts.${key}.text`, { ...promptUrls, rules }),
    }));
  }, [t, keys, catalogueSuffix]);
}

export function PromptList({ keys }) {
  const prompts = usePrompts(keys);

  return prompts.map(({ key, label, hint, text }) => (
    <CopyBlock key={key} text={text} label={label} hint={hint} />
  ));
}

/** Los cuatro prompts de quien va a comunidades: encajar, entender, hablar, arrimar. */
const ATTEND_PROMPTS = ["tribe", "types", "speaker", "volunteer"];

function AttendTab() {
  const { t } = useTranslation();

  return (
    <>
      <p className="opendata-lead">{t("openData.attend.lead")}</p>
      <p className="opendata-callout">
        <i aria-hidden="true" className="fas fa-magnifying-glass"></i> {t("openData.attend.useTheSearch")}
      </p>
      <PromptList keys={ATTEND_PROMPTS} />
      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-circle-info"></i> {t("openData.attend.note")}
      </p>
      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-lightbulb"></i> {t("openData.attend.roadmap")}{" "}
        <a href={`${ISSUES_URL}/344`} target="_blank" rel="noopener noreferrer">
          #344
        </a>{" "}
        ·{" "}
        <a href={`${ISSUES_URL}/194`} target="_blank" rel="noopener noreferrer">
          #194
        </a>
      </p>
    </>
  );
}

const FOUND_PROMPTS = ["umbrella", "gaps"];

/**
 * Quien se plantea montar una comunidad llega sin saber que puede no hacer falta montarla:
 * puede sumarse a algo que ya existe, buscar un paraguas que le acoja o reactivar algo
 * parado. Por eso "quién me puede acoger" va antes que "qué hueco hay".
 */
function FoundTab() {
  const { t } = useTranslation();

  return (
    <>
      <p className="opendata-lead">{t("openData.found.lead")}</p>
      <PromptList keys={FOUND_PROMPTS} />
      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-triangle-exclamation"></i> {t("openData.found.note")}
      </p>
      <HelpBlock title={t("openData.found.helpTitle")} copy={t("openData.found.helpCopy")} />
    </>
  );
}


export function CodeSnippets() {
  const { t } = useTranslation();
  return getCodeSnippets(t).map(({ key, label, hint, text }) => (
    <CopyBlock key={key} text={text} label={label} hint={hint} />
  ));
}

export function AgentInstructions() {
  const { t } = useTranslation();

  const instructions = `# Community Builders Directory — datos de comunidades tech de España

Fuente de datos: ${SITE_URL}/llms.txt (empieza por aquí; indexa el resto)
Dataset: ${SITE_URL}/data/communities.json
Significado de cada campo: ${SITE_URL}/data/schema.json

Reglas al usar estos datos:
- "tags" y "targetAudience" son IDs: cruzarlos con tags.json / audience.json.
- matchesAllTags y matchesAllAudience amplían solo su faceta (temáticas o público),
  aunque el array correspondiente esté vacío; no anulan los demás filtros.
- "location" es dónde se celebran los eventos; "geographicScope" es el territorio
  al que da servicio. No son lo mismo.
- Excluir hidden: true y status != "active" antes de recomendar comunidades.
- No inferir cercanía a partir de "location": solo coincidencia textual exacta.
- "organizedBy" son ids de comunidades DEL DIRECTORIO que organizan esa ficha
  (una comunidad y su conferencia anual son dos fichas vivas). No es la lista
  completa de organizadores: empresas y patrocinadores no están aquí.
- "openTo" indica disponibilidad declarada para aportaciones, no búsqueda urgente.
  Vacío o ausente significa sin información, no rechazo. No inferirlo.
- Nunca proponer URLs de "archivedUrls": son canales muertos.
- humanValidated: false significa dato sin revisar por una persona. Decirlo.
- "urls" es una lista de canales: { url, kind?, label? }. El kind se omite
  cuando el dominio ya lo dice, y puede repetirse con labels distintas.
- El directorio no almacena eventos: los publica cada comunidad en el canal
  con kind "ote", en formato Open Tech Events (${OTE_URL}).
- Si falta una comunidad o hay un dato mal, proponer abrir un issue en
  ${ISSUES_URL}.`;

  return (
    <>
      <p className="opendata-lead">{t("openData.agents.lead")}</p>
      <CopyBlock
        text={instructions}
        label={t("openData.agents.instructionsLabel")}
        hint={t("openData.agents.instructionsHint")}
      />
      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-circle-info"></i> {t("openData.agents.noMcp")}
      </p>
      <ul className="opendata-linklist">
        <li>
          <a href={assetUrl("llms.txt")} target="_blank" rel="noopener noreferrer">
            llms.txt
          </a>{" "}
          — {t("openData.agents.llms")}
        </li>
        <li>
          <a href={`${REPO_URL}/blob/master/AGENTS.md`} target="_blank" rel="noopener noreferrer">
            AGENTS.md
          </a>{" "}
          — {t("openData.agents.agentsMd")}
        </li>
        <li>
          <a href={assetUrl("robots.txt")} target="_blank" rel="noopener noreferrer">
            robots.txt
          </a>{" "}
          — {t("openData.agents.robots")}
        </li>
      </ul>
    </>
  );
}

/**
 * Los chips de ficheros vivían sobre las pestañas, antes de que nadie hubiera dicho a qué
 * venía: para quien busca una comunidad eran nueve enlaces técnicos ocupando el primer
 * pantallazo. Aquí los encuentra quien los necesita, y encima sin explicación previa.
 */
export function DataFiles() {
  const { t } = useTranslation();

  return (
    <div className="opendata-files">
      {DATA_FILES.map(({ key, path, icon, variants }) =>
        variants ? (
          <span
            key={key}
            className="opendata-file opendata-file--multi"
            title={t(`openData.files.${key}`)}
          >
            <i aria-hidden="true" className={`fas ${icon}`}></i>
            <span>{t(`openData.files.${key}Short`)}</span>
            <span className="opendata-file-langs">
              {variants.map(({ lang, path: variantPath }) => (
                <a
                  key={lang}
                  href={assetUrl(variantPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={variantPath}
                >
                  {lang.toUpperCase()}
                </a>
              ))}
            </span>
          </span>
        ) : (
          <a
            key={key}
            className="opendata-file"
            href={assetUrl(path)}
            target="_blank"
            rel="noopener noreferrer"
            title={t(`openData.files.${key}`)}
          >
            <i aria-hidden="true" className={`fas ${icon}`}></i>
            <span>{t(`openData.files.${key}Short`)}</span>
          </a>
        )
      )}
    </div>
  );
}

const BUILD_PROMPTS = ["onboarding"];

/**
 * Para quien construye, persona y herramienta son la misma cosa, así que ficheros, código y
 * agentes van juntos. El orden es el del camino real: qué hay, cómo empezar sin meter la
 * pata, ejemplos, y las reglas para el agente.
 */
function BuildTab() {
  const { t } = useTranslation();

  return (
    <>
      <p className="opendata-lead">{t("openData.code.lead")}</p>

      <p className="opendata-section-title">{t("openData.build.filesTitle")}</p>
      <DataFiles />

      <p className="opendata-section-title">{t("openData.build.promptTitle")}</p>
      <PromptList keys={BUILD_PROMPTS} />

      <p className="opendata-section-title">{t("openData.build.snippetsTitle")}</p>
      <CodeSnippets />
      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-triangle-exclamation"></i> {t("openData.code.gotcha")}{" "}
        <a href={assetUrl("data/schema.json")} target="_blank" rel="noopener noreferrer">
          schema.json
        </a>
        .
      </p>

      <p className="opendata-section-title">{t("openData.build.agentsTitle")}</p>
      <AgentInstructions />
    </>
  );
}

/**
 * El bloque de "pregúntanos" es el mismo en dos pestañas con copy distinto: quien organiza
 * pregunta por el feed o las etiquetas, quien va a montar algo pregunta por dónde empezar.
 */
export function HelpBlock({ title, copy }) {
  const { t } = useTranslation();

  return (
    <div className="opendata-help">
      <p className="opendata-help-title">{title}</p>
      <p className="opendata-help-copy">{copy}</p>
      <div className="opendata-help-links">
        <a
          href={TELEGRAM_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="opendata-footer-btn opendata-footer-btn--cta"
        >
          <i aria-hidden="true" className="fa-brands fa-telegram"></i> {t("openData.organizers.helpTelegram")}
        </a>
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="opendata-footer-btn">
          <i aria-hidden="true" className="fa-brands fa-github"></i> {t("openData.organizers.helpIssues")}
        </a>
        <a
          href={MAILING_LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="opendata-footer-btn"
        >
          <i aria-hidden="true" className="fas fa-envelope"></i> {t("openData.organizers.helpMailingList")}
        </a>
      </div>
    </div>
  );
}

const ORGANIZER_STEPS = ["step1", "step2", "step3", "step4"];
const ORGANIZER_PROMPTS = ["synergies"];

/**
 * Los cuatro pasos van de uno en uno, no apilados. Son cuatro párrafos densos: puestos en
 * lista se leen como un muro y nadie llega al cuarto, que es el que más cuesta explicar.
 */
function OrganizersTab() {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const step = ORGANIZER_STEPS[stepIndex];
  const isLast = stepIndex === ORGANIZER_STEPS.length - 1;

  return (
    <>
      <p className="opendata-lead">{t("openData.organizers.lead")}</p>

      <ol className="opendata-stepper" aria-label={t("openData.organizers.lead")}>
        {ORGANIZER_STEPS.map((key, index) => (
          <li key={key}>
            <button
              type="button"
              className={`opendata-stepper-step${index === stepIndex ? " opendata-stepper-step--active" : ""}${index < stepIndex ? " opendata-stepper-step--done" : ""}`}
              onClick={() => setStepIndex(index)}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span className="opendata-stepper-number">{index + 1}</span>
              <span className="opendata-stepper-label">{t(`openData.organizers.${key}Title`)}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="opendata-step-body">
        <p className="opendata-step-count">
          {t("openData.organizers.stepOf", { current: stepIndex + 1, total: ORGANIZER_STEPS.length })}
        </p>
        <p className="opendata-step-title">{t(`openData.organizers.${step}Title`)}</p>
        <p className="opendata-step-copy">{t(`openData.organizers.${step}`)}</p>

        {isLast && (
          <div className="opendata-step-links">
            <a href={OTE_URL} target="_blank" rel="noopener noreferrer">
              opentechevents.org
            </a>
            <a href={OTE_READER_URL} target="_blank" rel="noopener noreferrer">
              {t("openData.organizers.oteReader")}
            </a>
            <a href={EVENTOS_WIKI_URL} target="_blank" rel="noopener noreferrer">
              eventos.wiki
            </a>
          </div>
        )}

        <div className="opendata-step-nav">
          <button
            type="button"
            className="opendata-step-nav-btn"
            onClick={() => setStepIndex((current) => current - 1)}
            disabled={stepIndex === 0}
          >
            <i aria-hidden="true" className="fas fa-arrow-left"></i> {t("openData.organizers.prevStep")}
          </button>
          <button
            type="button"
            className="opendata-step-nav-btn"
            onClick={() => setStepIndex((current) => current + 1)}
            disabled={isLast}
          >
            {t("openData.organizers.nextStep")} <i aria-hidden="true" className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <p className="opendata-note">
        <i aria-hidden="true" className="fas fa-circle-info"></i> {t("openData.organizers.note")}
      </p>

      <p className="opendata-section-title">{t("openData.organizers.promptsTitle")}</p>
      <PromptList keys={ORGANIZER_PROMPTS} />

      <HelpBlock
        title={t("openData.organizers.helpTitle")}
        copy={t("openData.organizers.helpCopy")}
      />
    </>
  );
}

export function OpenDataModal({ onClose, onAddCommunity, initialTab = "attend", onBack }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  // El total del dataset, no el filtrado: el modal habla del dataset completo.
  const total = useAllCommunities().length;
  const boxRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="opendata-modal-overlay"
      onClick={(event) => {
        if (!boxRef.current?.contains(event.target)) onClose();
      }}
    >
      <div
        className="opendata-modal-box"
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("openData.title")}
      >
        <button
          type="button"
          className="opendata-modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label={t("openData.close")}
        >
          <i aria-hidden="true" className="fas fa-xmark"></i>
        </button>

        {onBack && (
          <button type="button" className="opendata-footer-btn guide-back" onClick={onBack}>
            <i aria-hidden="true" className="fas fa-arrow-left"></i> {t("directoryGuide.back")}
          </button>
        )}

        <header className="opendata-modal-header">
          <h2 className="opendata-modal-title">
            <i aria-hidden="true" className="fas fa-wand-magic-sparkles"></i> {t("openData.title")}
          </h2>
          <p className="opendata-modal-subtitle">{t("openData.subtitle", { total })}</p>
          <p className="opendata-modal-license">
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </a>{" "}
            — {t("openData.license")}
          </p>
        </header>

        <div className="opendata-tabs" role="tablist">
          {TABS.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-label={t(`openData.tabs.${id}`)}
              className={`opendata-tab${activeTab === id ? " opendata-tab--active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <i aria-hidden="true" className={`fas ${icon}`}></i>
              <span>{t(`openData.tabs.${id}`)}</span>
            </button>
          ))}
        </div>

        <div className="opendata-panel" role="tabpanel">
          {activeTab === "attend" && <AttendTab />}
          {activeTab === "organizers" && <OrganizersTab />}
          {activeTab === "found" && <FoundTab />}
          {activeTab === "build" && <BuildTab />}
        </div>

        <footer className="opendata-modal-footer">
          <p className="opendata-modal-footer-copy">{t("openData.footer")}</p>
          <div className="opendata-modal-footer-actions">
            <a
              className="opendata-footer-btn"
              href={DATA_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i aria-hidden="true" className="fas fa-book"></i> {t("openData.footerDocs")}
            </a>
            <button
              type="button"
              className="opendata-footer-btn opendata-footer-btn--cta"
              onClick={() => {
                onClose();
                onAddCommunity?.();
              }}
            >
              <i aria-hidden="true" className="fas fa-plus"></i> {t("openData.footerContribute")}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

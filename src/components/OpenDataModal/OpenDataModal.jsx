/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllCommunities } from "../../stores/community.store.js";
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

const TABS = [
  { id: "chat", icon: "fa-comments" },
  { id: "code", icon: "fa-code" },
  { id: "agents", icon: "fa-robot" },
  { id: "organizers", icon: "fa-bullhorn" },
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
          <i className="fas fa-chevron-right opendata-copyblock-caret"></i>
          <span className="opendata-copyblock-label">{label}</span>
          {hint && <span className="opendata-copyblock-hint">{hint}</span>}
        </button>
        <button
          type="button"
          className={`opendata-copy-btn${copied ? " opendata-copy-btn--done" : ""}`}
          onClick={copy}
        >
          <i className={`fas ${copied ? "fa-check" : "fa-copy"}`}></i>
          <span>{copied ? t("openData.copied") : t("openData.copy")}</span>
        </button>
      </div>
      {isOpen && <pre className="opendata-copyblock-body">{text}</pre>}
    </div>
  );
}

/**
 * Prompts pensados para lo que el directorio **no** sabe hacer todavía (issue #299):
 * cruzar el dataset consigo mismo, detectar huecos, buscar C4Ps o sinergias. "Comunidades
 * de Python en Valencia" se resuelve mejor y más rápido con los filtros de la propia web,
 * así que eso se dice arriba en vez de ofrecer un prompt para ello.
 */
function useChatPrompts() {
  const { t } = useTranslation();
  const dataUrl = `${SITE_URL}/data/communities.json`;
  const indexUrl = `${SITE_URL}/llms.txt`;

  return useMemo(
    () =>
      ["tribe", "speaker", "volunteer", "synergies", "gaps"].map((key) => ({
        key,
        label: t(`openData.chat.prompts.${key}.label`),
        hint: t(`openData.chat.prompts.${key}.hint`),
        text: t(`openData.chat.prompts.${key}.text`, {
          dataUrl,
          indexUrl,
          ...CATALOGUE_URLS,
        }),
      })),
    [t, dataUrl, indexUrl]
  );
}

function ChatTab({ total }) {
  const { t } = useTranslation();
  const prompts = useChatPrompts();

  return (
    <>
      <p className="opendata-lead">{t("openData.chat.lead", { total })}</p>
      <p className="opendata-callout">
        <i className="fas fa-magnifying-glass"></i> {t("openData.chat.useTheSearch")}
      </p>
      {prompts.map(({ key, label, hint, text }) => (
        <CopyBlock key={key} text={text} label={label} hint={hint} />
      ))}
      <p className="opendata-note">
        <i className="fas fa-circle-info"></i> {t("openData.chat.note")}
      </p>
      <p className="opendata-note">
        <i className="fas fa-lightbulb"></i> {t("openData.chat.roadmap")}{" "}
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

function CodeTab() {
  const { t } = useTranslation();

  const snippets = [
    {
      key: "shell",
      label: "curl + jq",
      hint: t("openData.code.hintShell"),
      text: `# Comunidades activas de ciberseguridad con eventos presenciales
curl -s ${SITE_URL}/data/communities.json \\
  | jq '[.[] | select(.status == "active" and .eventFormat == "in-person")
         | select(.tags | index("cybersecurity"))
         | {name, location, communityUrl}]'`,
    },
    {
      key: "js",
      label: "JavaScript",
      hint: t("openData.code.hintJs"),
      text: `const [communities, tags] = await Promise.all([
  fetch("${SITE_URL}/data/communities.json").then((r) => r.json()),
  fetch("${SITE_URL}/data/tags.json").then((r) => r.json()),
]);

const labelById = Object.fromEntries(tags.map((tag) => [tag.id, tag.label]));

// Ojo: matchesAllTags marca comunidades generalistas; su array de tags
// está vacío a propósito y deben contar como coincidencia.
const matching = communities.filter(
  (c) => c.status === "active" && (c.matchesAllTags || c.tags.includes("python"))
);

for (const c of matching) {
  console.log(c.name, "—", c.location, "—", c.tags.map((id) => labelById[id]).join(", "));
}`,
    },
    {
      key: "python",
      label: "Python / pandas",
      hint: t("openData.code.hintPython"),
      text: `import pandas as pd

df = pd.read_csv("${SITE_URL}/data/communities.csv")
df["tags"] = df["tags"].fillna("").str.split("|")

activas = df[df["status"] == "active"]
print(activas.groupby("geographicScope").size())`,
    },
    {
      key: "events",
      label: "Open Tech Events",
      hint: t("openData.code.hintEvents"),
      text: `// El directorio no guarda eventos: los publica cada comunidad en su feed OTE.
const communities = await fetch("${SITE_URL}/data/communities.json").then((r) => r.json());
const withFeed = communities.filter((c) => c.urls?.ote);

const events = await Promise.all(
  withFeed.map(async (c) => {
    try {
      const feed = await fetch(c.urls.ote).then((r) => r.json());
      return (feed.events ?? []).map((event) => ({ community: c.name, ...event }));
    } catch {
      // No todos los dominios sirven CORS; un feed caído no debe tumbar el resto.
      return [];
    }
  })
);

console.log(events.flat());
// Spec del formato: ${OTE_URL}`,
    },
  ];

  return (
    <>
      <p className="opendata-lead">{t("openData.code.lead")}</p>
      {snippets.map(({ key, label, hint, text }) => (
        <CopyBlock key={key} text={text} label={label} hint={hint} />
      ))}
      <p className="opendata-note">
        <i className="fas fa-triangle-exclamation"></i> {t("openData.code.gotcha")}{" "}
        <a href={assetUrl("data/schema.json")} target="_blank" rel="noopener noreferrer">
          schema.json
        </a>
        .
      </p>
    </>
  );
}

function AgentsTab() {
  const { t } = useTranslation();

  const instructions = `# Community Builders Directory — datos de comunidades tech de España

Fuente de datos: ${SITE_URL}/llms.txt (empieza por aquí; indexa el resto)
Dataset: ${SITE_URL}/data/communities.json
Significado de cada campo: ${SITE_URL}/data/schema.json

Reglas al usar estos datos:
- "tags" y "targetAudience" son IDs: cruzarlos con tags.json / audience.json.
  Los mismos catálogos están en inglés (tags.en.json, audience.en.json) con los
  mismos IDs y las etiquetas traducidas.
- matchesAllTags o matchesAllAudience = la comunidad encaja con cualquier filtro,
  aunque su array esté vacío.
- "location" es dónde se celebran los eventos; "geographicScope" es el territorio
  al que da servicio. No son lo mismo.
- Filtrar status != "active" antes de recomendar una comunidad a alguien.
- Nunca proponer URLs de "archivedUrls": son canales muertos.
- humanValidated: false significa dato sin revisar por una persona. Decirlo.
- El directorio no almacena eventos: los publica cada comunidad en su feed
  "urls.ote", en formato Open Tech Events (${OTE_URL}).
- Licencia CC BY 4.0: citar Community Builders y enlazar ${SITE_URL}.
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
        <i className="fas fa-circle-info"></i> {t("openData.agents.noMcp")}
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

function OrganizersTab() {
  const { t } = useTranslation();

  return (
    <>
      <p className="opendata-lead">{t("openData.organizers.lead")}</p>
      <ol className="opendata-steps">
        <li>{t("openData.organizers.step1")}</li>
        <li>{t("openData.organizers.step2")}</li>
        <li>{t("openData.organizers.step3")}</li>
        <li>
          {t("openData.organizers.step4")}{" "}
          <a href={OTE_URL} target="_blank" rel="noopener noreferrer">
            opentechevents.org
          </a>
          {" · "}
          <a href={OTE_READER_URL} target="_blank" rel="noopener noreferrer">
            {t("openData.organizers.oteReader")}
          </a>
          {" · "}
          <a href={EVENTOS_WIKI_URL} target="_blank" rel="noopener noreferrer">
            eventos.wiki
          </a>
        </li>
      </ol>
      <p className="opendata-note">
        <i className="fas fa-circle-info"></i> {t("openData.organizers.note")}
      </p>
      <div className="opendata-help">
        <p className="opendata-help-title">{t("openData.organizers.helpTitle")}</p>
        <p className="opendata-help-copy">{t("openData.organizers.helpCopy")}</p>
        <div className="opendata-help-links">
          <a
            href={TELEGRAM_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="opendata-footer-btn opendata-footer-btn--cta"
          >
            <i className="fa-brands fa-telegram"></i> {t("openData.organizers.helpTelegram")}
          </a>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="opendata-footer-btn">
            <i className="fa-brands fa-github"></i> {t("openData.organizers.helpIssues")}
          </a>
          <a
            href={MAILING_LIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="opendata-footer-btn"
          >
            <i className="fas fa-envelope"></i> {t("openData.organizers.helpMailingList")}
          </a>
        </div>
      </div>
    </>
  );
}

export function OpenDataModal({ onClose, onAddCommunity }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("chat");
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
          <i className="fas fa-xmark"></i>
        </button>

        <header className="opendata-modal-header">
          <h2 className="opendata-modal-title">
            <i className="fas fa-wand-magic-sparkles"></i> {t("openData.title")}
          </h2>
          <p className="opendata-modal-subtitle">{t("openData.subtitle", { total })}</p>
          <p className="opendata-modal-license">
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </a>{" "}
            — {t("openData.license")}
          </p>
        </header>

        <div className="opendata-files">
          {DATA_FILES.map(({ key, path, icon, variants }) =>
            variants ? (
              <span key={key} className="opendata-file opendata-file--multi" title={t(`openData.files.${key}`)}>
                <i className={`fas ${icon}`}></i>
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
                <i className={`fas ${icon}`}></i>
                <span>{t(`openData.files.${key}Short`)}</span>
              </a>
            )
          )}
        </div>

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
              <i className={`fas ${icon}`}></i>
              <span>{t(`openData.tabs.${id}`)}</span>
            </button>
          ))}
        </div>

        <div className="opendata-panel" role="tabpanel">
          {activeTab === "chat" && <ChatTab total={total} />}
          {activeTab === "code" && <CodeTab />}
          {activeTab === "agents" && <AgentsTab />}
          {activeTab === "organizers" && <OrganizersTab />}
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
              <i className="fas fa-book"></i> {t("openData.footerDocs")}
            </a>
            <button
              type="button"
              className="opendata-footer-btn opendata-footer-btn--cta"
              onClick={() => {
                onClose();
                onAddCommunity?.();
              }}
            >
              <i className="fas fa-plus"></i> {t("openData.footerContribute")}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ASSIST_PROVIDERS,
  buildAssistChatUrl,
  buildAssistPrompt,
  normalizeAssistUrls,
  parseAssistedCommunityJson,
} from "../../lib/aiAssist";

/**
 * Alta asistida: abre Claude o ChatGPT con un prompt preparado y acepta de vuelta el JSON
 * que devuelvan, para rellenar el borrador sin teclear veinte campos.
 *
 * El panel nace plegado. Quien ya sabe lo que hace rellena el formulario directamente, y
 * esto no le estorba; quien no, encuentra la puerta abierta.
 */
/**
 * Un ejemplo distinto por campo: es lo que deja claro que va **una URL por campo** y no
 * una lista separada por comas, y de paso sugiere qué fuentes merece la pena pegar. A
 * partir del quinto campo se repite el último; quien llega ahí ya lo ha entendido.
 */
const URL_PLACEHOLDERS = [
  "contribution.aiAssist.urlPlaceholder1",
  "contribution.aiAssist.urlPlaceholder2",
  "contribution.aiAssist.urlPlaceholder3",
  "contribution.aiAssist.urlPlaceholder4",
  "contribution.aiAssist.urlPlaceholder5",
];

export function AiAssistPanel({ draft, allTags, allAudience, onApply }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // Varias fuentes dan mejor ficha que una: la web dice de qué va, el Meetup si sigue
  // viva, el GitHub qué publican. Se arranca con lo que ya haya en el borrador.
  const [urls, setUrls] = useState(() => {
    const seeded = normalizeAssistUrls([
      draft?.communityUrl,
      ...Object.values(draft?.urls ?? {}),
    ]);
    return seeded.length > 0 ? [...seeded, ""] : [""];
  });
  const [response, setResponse] = useState("");
  const [result, setResult] = useState(null);

  const prompt = useMemo(
    () =>
      buildAssistPrompt({
        communityUrl: urls,
        locale: i18n.resolvedLanguage,
        draft,
      }),
    [urls, i18n.resolvedLanguage, draft]
  );

  const filledUrlCount = normalizeAssistUrls(urls).length;

  const handleUrlChange = (index, value) => {
    setUrls((current) => {
      const next = [...current];
      next[index] = value;
      // Siempre queda una línea vacía al final: añadir otra URL no cuesta un clic extra.
      if (value.trim() && index === next.length - 1) next.push("");
      return next;
    });
  };

  const handleRemoveUrl = (index) => {
    setUrls((current) => {
      const next = current.filter((_, position) => position !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const knownTagIds = useMemo(() => allTags.map((tag) => tag.id), [allTags]);
  const knownAudienceIds = useMemo(() => allAudience.map((item) => item.id), [allAudience]);

  const handleApply = () => {
    const parsed = parseAssistedCommunityJson(response, { knownTagIds, knownAudienceIds });
    setResult(parsed);

    if (parsed.community) {
      onApply(parsed.community);
    }
  };

  const describeWarning = (warning) => {
    const [kind, field, detail] = warning.split(":");

    if (kind === "enum") {
      return t("contribution.aiAssist.warningEnum", { field, value: detail });
    }
    return t("contribution.aiAssist.warningUnknown", { field, values: detail });
  };

  return (
    <section className={`ai-assist${isOpen ? " ai-assist--open" : ""}`}>
      <button
        type="button"
        className="ai-assist-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="ai-assist-toggle-icon">
          <i className="fas fa-wand-magic-sparkles"></i>
        </span>
        <span className="ai-assist-toggle-text">
          <strong>{t("contribution.aiAssist.title")}</strong>
          <span>{t("contribution.aiAssist.subtitle")}</span>
        </span>
        <i className={`fas fa-chevron-${isOpen ? "up" : "down"} ai-assist-toggle-caret`}></i>
      </button>

      {isOpen && (
        <div className="ai-assist-body">
          <ol className="ai-assist-steps">
            <li>
              <p className="ai-assist-step-title">{t("contribution.aiAssist.step1Title")}</p>
              <p className="ai-assist-step-copy">{t("contribution.aiAssist.urlsCopy")}</p>
              <div className="ai-assist-urls">
                {urls.map((url, index) => (
                  <div className="ai-assist-url-row" key={`url-${index}`}>
                    <input
                      type="url"
                      className="input"
                      value={url}
                      placeholder={t(URL_PLACEHOLDERS[Math.min(index, URL_PLACEHOLDERS.length - 1)])}
                      onChange={(event) => handleUrlChange(index, event.target.value)}
                      aria-label={t("contribution.aiAssist.urlLabelNumbered", { number: index + 1 })}
                    />
                    {urls.length > 1 && (
                      <button
                        type="button"
                        className="ai-assist-url-remove"
                        onClick={() => handleRemoveUrl(index)}
                        aria-label={t("contribution.aiAssist.removeUrl")}
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="ai-assist-providers">
                {ASSIST_PROVIDERS.map((provider) => (
                  <a
                    key={provider.id}
                    className="ai-assist-provider"
                    href={buildAssistChatUrl(provider.id, prompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`fas ${provider.icon}`}></i>
                    {t("contribution.aiAssist.openIn", { provider: provider.label })}
                  </a>
                ))}
                <button
                  type="button"
                  className="ai-assist-provider ai-assist-provider--ghost"
                  onClick={() => navigator.clipboard?.writeText(prompt)}
                >
                  <i className="fas fa-copy"></i>
                  {t("contribution.aiAssist.copyPrompt")}
                </button>
              </div>
              {filledUrlCount > 0 && (
                <p className="ai-assist-url-count">
                  {t("contribution.aiAssist.urlCount", { count: filledUrlCount })}
                </p>
              )}
            </li>

            <li>
              <p className="ai-assist-step-title">{t("contribution.aiAssist.step2Title")}</p>
              <p className="ai-assist-step-copy">{t("contribution.aiAssist.step2Copy")}</p>
              <textarea
                className="textarea ai-assist-textarea"
                rows={5}
                value={response}
                placeholder='{ "name": "..." }'
                onChange={(event) => setResponse(event.target.value)}
                aria-label={t("contribution.aiAssist.responseLabel")}
              />
              <div className="ai-assist-apply-row">
                <button
                  type="button"
                  className="button is-link is-small"
                  onClick={handleApply}
                  disabled={!response.trim()}
                >
                  <i className="fas fa-arrow-down-to-line"></i>
                  <span>{t("contribution.aiAssist.apply")}</span>
                </button>
              </div>
            </li>
          </ol>

          {result?.error && (
            <p className="ai-assist-feedback ai-assist-feedback--error">
              <i className="fas fa-circle-exclamation"></i>{" "}
              {t(`contribution.aiAssist.error.${result.error}`)}
            </p>
          )}

          {result?.community && (
            <p className="ai-assist-feedback ai-assist-feedback--ok">
              <i className="fas fa-circle-check"></i>{" "}
              {t("contribution.aiAssist.applied", { count: result.fieldCount })}
            </p>
          )}

          {result?.warnings?.length > 0 && (
            <ul className="ai-assist-warnings">
              {result.warnings.map((warning) => (
                <li key={warning}>{describeWarning(warning)}</li>
              ))}
            </ul>
          )}

          <p className="ai-assist-disclaimer">
            <i className="fas fa-triangle-exclamation"></i> {t("contribution.aiAssist.disclaimer")}
          </p>
        </div>
      )}
    </section>
  );
}

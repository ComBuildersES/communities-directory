import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PromptList } from "../OpenDataModal/OpenDataModal.jsx";

const FIND_PROMPTS = ["tribe", "types"];
const DATA_SOURCES = [
  { path: "llms.txt", label: "agentIndex" },
  { path: "llms-full.txt", label: "fullDirectory" },
  { path: "data/communities.json", label: "communitiesJson" },
  { path: "data/communities.csv", label: "communitiesCsv" },
  { path: "data/communities.geojson", label: "communitiesGeojson" },
];
// Estas URLs se comparten con agentes que no pueden acceder al servidor local.
const SITE_URL = "https://directory.communitybuilders.dev";

export function DataSourcePicker() {
  const { t } = useTranslation();
  const formatId = useId();
  const [path, setPath] = useState(DATA_SOURCES[0].path);
  const [copied, setCopied] = useState(false);
  const urlRef = useRef(null);
  const url = `${SITE_URL}/${path}`;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      urlRef.current?.focus();
      urlRef.current?.select();
    }
  };

  return (
    <div className="guide-data-source">
      <label htmlFor={formatId}>{t("directoryGuide.find.dataFormat")}</label>
      <select id={formatId} value={path} onChange={(event) => { setPath(event.target.value); setCopied(false); }}>
        {DATA_SOURCES.map((item) => <option key={item.path} value={item.path}>{t(`directoryGuide.find.dataSources.${item.label}`)}</option>)}
      </select>
      <div className="guide-data-url">
        <input ref={urlRef} aria-label={t("directoryGuide.find.dataUrl")} readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
        <button type="button" className="opendata-copy-btn" onClick={copy}>
          <i className={`fas ${copied ? "fa-check" : "fa-copy"}`} aria-hidden="true"></i>
          <span aria-live="polite">{copied ? t("openData.copied") : t("directoryGuide.find.copyUrl")}</span>
        </button>
      </div>
    </div>
  );
}

export function FindCommunityAiGuide() {
  const { t } = useTranslation();
  return (
    <div className="guide-ai">
      <p className="opendata-lead">{t("directoryGuide.find.ai")}</p>
      <p className="opendata-note guide-data-intro">{t("directoryGuide.find.dataIntro")}</p>
      <DataSourcePicker />
      <div className="guide-ai-prompts">
        <p>{t("directoryGuide.find.promptsIntro")}</p>
        <div className="guide-ai-prompt-list"><PromptList keys={FIND_PROMPTS} /></div>
      </div>
    </div>
  );
}

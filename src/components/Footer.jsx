import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mi-footer is-hidden-mobile">
      <div className="content has-text-centered">
        <p>
         {t("footer.maintainedWith")}&nbsp;<a href="https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors" target="_blank">
         {t("footer.byCommunity")}
          </a>
          &nbsp; | {t("footer.codeUnder")} <a href="https://github.com/ComBuildersES/communities-directory/#licencias">Apache License 2.0</a> {t("footer.dataUnder")} <a href="https://github.com/ComBuildersES/communities-directory/#licencias">CC BY 4.0</a>
        </p>
      </div>
    </footer>
  );
}

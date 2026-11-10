/**
 * Enlaces de "comparte el directorio", compartidos entre el popover "Sobre el proyecto"
 * de la cabecera y el panel del botón flotante. Vivían sueltos en `Heading.jsx`; están
 * aquí porque difundir es ahora una de las formas de ayudar que ofrece el FAB, y dos
 * copias del mismo intent de compartir se desincronizan en el primer cambio de texto.
 */
export const APP_URL = "https://directory.communitybuilders.dev/";

function shareText(handle, t) {
  return t("heading.shareText", { handle, url: APP_URL });
}

export function buildShareLinks(t) {
  return [
    {
      label: "X / Twitter",
      icon: "fa-brands fa-x-twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText("@ComBuilders_ES", t))}`,
    },
    {
      label: "Bluesky",
      icon: "fa-brands fa-bluesky",
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText("@communitybuilders.bsky.social", t))}`,
    },
    {
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
    },
    {
      label: "WhatsApp",
      icon: "fa-brands fa-whatsapp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText("Community Builders", t))}`,
    },
    {
      label: "Telegram",
      icon: "fa-brands fa-telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(shareText("Community Builders", t))}`,
    },
  ];
}

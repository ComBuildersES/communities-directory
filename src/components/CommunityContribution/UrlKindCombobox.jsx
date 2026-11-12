/* eslint-disable react/prop-types */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { URL_GROUPS, URL_KIND_PICKER_OPTIONS } from "../../lib/communityUrls.js";

/**
 * El campo "¿qué es?" de una fila de canal (issue #478).
 *
 * Hace **dos trabajos con un control**: elegir una plataforma conocida (se guarda como
 * `kind`) o escribir un nombre propio (se guarda como `label`).
 *
 * Empezó siendo un `<input list>` + `<datalist>` nativo y no aguantó el crecimiento: el
 * desplegable del navegador no admite ni iconos ni agrupar, y la lista dejó de leerse de un
 * vistazo. Las opciones van en **los mismos grupos que la ficha** para que buscar aquí se
 * parezca a mirar allí.
 *
 * El texto libre es de primera clase, no un `<select>` disfrazado: de ahí el pie del panel,
 * sin el cual algo con aspecto de lista cerrada esconde la mitad de lo que el campo hace.
 */


/** Sin acentos y en minúsculas: quien escribe "telegram" espera encontrar "Telegram". */
function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function UrlKindCombobox({ value, onChange, placeholder, ariaLabel }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Lo que se teclea solo filtra mientras el panel está abierto: con el panel cerrado, el
  // campo enseña el valor de verdad (el nombre de la plataforma o la etiqueta propia).
  const [query, setQuery] = useState(null);
  const containerRef = useRef(null);
  const listboxId = useId();

  const options = useMemo(
    () =>
      URL_KIND_PICKER_OPTIONS.map(({ kind, labelKey, icon, group, hintKey }) => ({
        kind,
        icon,
        group,
        label: t(labelKey, { defaultValue: kind }),
        // Solo algunos: lo llevan los que no se distinguen por el nombre. Filtrar "even"
        // devuelve cuatro etiquetas casi iguales, y sin esta línea no hay forma de elegir.
        hint: hintKey ? t(hintKey, { defaultValue: "" }) : "",
      })),
    [t]
  );

  const filter = normalize(query ?? "");
  const matches = useMemo(() => {
    if (!filter) return options;
    return options.filter(
      (option) =>
        normalize(option.label).includes(filter) ||
        normalize(option.kind).includes(filter) ||
        normalize(option.hint).includes(filter)
    );
  }, [filter, options]);

  // Agrupadas para pintar, y en plano para moverse con el teclado: el orden tiene que ser el
  // mismo en los dos sitios o la flecha abajo salta a otro sitio del que se ve resaltado.
  const groups = useMemo(
    () =>
      URL_GROUPS.map(({ group, labelKey, icon }) => ({
        group,
        icon,
        label: t(labelKey, { defaultValue: group }),
        options: matches.filter((option) => option.group === group),
      })).filter(({ options: groupOptions }) => groupOptions.length > 0),
    [matches, t]
  );
  const flat = useMemo(() => groups.flatMap(({ options: groupOptions }) => groupOptions), [groups]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  });

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(null);
  }

  function open() {
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function pick(option) {
    onChange(option.label);
    close();
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        open();
        return;
      }
      if (flat.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + step;
        if (next < 0) return flat.length - 1;
        if (next >= flat.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      // Solo se traga el Enter si hay una opción resaltada: si no, el formulario sigue
      // comportándose como siempre.
      if (isOpen && activeIndex >= 0 && flat[activeIndex]) {
        event.preventDefault();
        pick(flat[activeIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      if (isOpen) {
        event.stopPropagation();
        close();
      }
      return;
    }

    if (event.key === "Tab") close();
  };

  const activeOption = activeIndex >= 0 ? flat[activeIndex] : null;

  return (
    <div className="url-kind-combobox" ref={containerRef}>
      <div className="url-kind-combobox-control">
        <input
          className="input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? `${listboxId}-${activeOption.kind}` : undefined}
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={query ?? value ?? ""}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            if (!isOpen) setIsOpen(true);
            onChange(event.target.value);
          }}
          onFocus={open}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="url-kind-combobox-toggle"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => (isOpen ? close() : open())}
        >
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="url-kind-combobox-panel">
          <ul className="url-kind-combobox-list" id={listboxId} role="listbox" aria-label={ariaLabel}>
            {groups.map(({ group, label, icon, options: groupOptions }) => (
              <li key={group} role="group" aria-label={label}>
                <p className="url-kind-combobox-group">
                  <i className={icon} aria-hidden="true"></i> {label}
                </p>
                <ul>
                  {groupOptions.map((option) => {
                    const isActive = activeOption?.kind === option.kind;
                    const isSelected = normalize(option.label) === normalize(value);
                    return (
                      <li key={option.kind}>
                        <button
                          type="button"
                          id={`${listboxId}-${option.kind}`}
                          role="option"
                          aria-selected={isSelected}
                          className={`url-kind-combobox-option${isActive ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                          // `mousedown` y no `click`: el click llega después del blur, y para
                          // entonces el panel ya se ha cerrado y no hay nada que pulsar.
                          onMouseDown={(event) => {
                            event.preventDefault();
                            pick(option);
                          }}
                          onMouseEnter={() => setActiveIndex(flat.indexOf(option))}
                        >
                          <i className={option.icon} aria-hidden="true"></i>
                          <span className="url-kind-combobox-option-text">
                            <span>{option.label}</span>
                            {option.hint && (
                              <span className="url-kind-combobox-option-hint">{option.hint}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}

            {groups.length === 0 && (
              <li className="url-kind-combobox-empty">
                {t("contribution.urls.row.kindNoMatch", { query: query ?? "" })}
              </li>
            )}
          </ul>

          <p className="url-kind-combobox-hint">{t("contribution.urls.row.kindHint")}</p>
        </div>
      )}
    </div>
  );
}

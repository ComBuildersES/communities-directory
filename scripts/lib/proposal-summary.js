/* eslint-env node */
import fs from 'fs';

/**
 * Ficha legible de una propuesta de comunidad para el cuerpo de la PR automática
 * (issue #436). El JSON ya viaja en el issue; lo que el revisor necesita es ver los
 * valores resueltos (labels en lugar de ids, enlaces clicables, logo) y, en una edición,
 * solo lo que cambia respecto a lo publicado.
 */

const DEFAULT_LOCALE_PATH = './src/i18n/locales/es.json';
const DEFAULT_TAGS_PATH = './public/data/tags.json';
const DEFAULT_AUDIENCE_PATH = './public/data/audience.json';

// Orden de lectura humano: identidad → clasificación → alcance → contenido.
const FIELD_DEFS = [
  { key: 'name', label: 'Nombre' },
  { key: 'status', label: 'Estado', enumGroup: 'status' },
  { key: 'communityType', label: 'Tipo', enumGroup: 'communityType' },
  { key: 'eventFormat', label: 'Formato', enumGroup: 'eventFormat' },
  { key: 'location', label: 'Ubicación' },
  { key: 'provinceId', label: 'Provincia' },
  { key: 'geographicScope', label: 'Ámbito geográfico', enumGroup: 'geographicScope' },
  { key: 'langs', label: 'Idiomas', enumGroup: 'language', list: true },
  { key: 'shortDescription', label: 'Descripción corta' },
  { key: 'topics', label: 'Temas (texto libre)' },
  { key: 'tags', label: 'Etiquetas', catalog: 'tags', list: true },
  { key: 'targetAudience', label: 'Público objetivo', catalog: 'audience', list: true },
  // Los flags "vale para cualquier…" solo se listan cuando están activos: en falso son el
  // caso normal y añadirían dos filas de ruido a cada ficha.
  { key: 'matchesAllTags', label: 'Vale para cualquier etiqueta', boolean: true, onlyWhenTrue: true },
  { key: 'matchesAllAudience', label: 'Vale para cualquier público', boolean: true, onlyWhenTrue: true },
  { key: 'contactInfo', label: 'Contacto' },
  { key: 'communityUrl', label: 'URL principal', url: true },
  { key: 'parentId', label: 'Comunidad madre (parentId)' },
  { key: 'displayOnMap', label: 'Mostrar en el mapa', boolean: true },
  { key: 'humanValidated', label: 'Validado por humano', boolean: true },
];

function readJsonFile(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function buildCatalogLabels(entries) {
  if (!Array.isArray(entries)) return {};

  return entries.reduce((labels, entry) => {
    const id = typeof entry?.id === 'string' ? entry.id.trim() : '';
    if (id) labels[id] = typeof entry?.label === 'string' && entry.label.trim() ? entry.label.trim() : id;
    return labels;
  }, {});
}

export function loadSummaryCatalogs({
  localePath = DEFAULT_LOCALE_PATH,
  tagsPath = DEFAULT_TAGS_PATH,
  audiencePath = DEFAULT_AUDIENCE_PATH,
} = {}) {
  const locale = readJsonFile(localePath, {});

  return {
    enums: {
      status: locale.status ?? {},
      communityType: locale.communityType ?? {},
      eventFormat: locale.eventFormat ?? {},
      geographicScope: locale.geographicScope ?? {},
      language: locale.language ?? {},
    },
    tags: buildCatalogLabels(readJsonFile(tagsPath, [])),
    audience: buildCatalogLabels(readJsonFile(audiencePath, [])),
  };
}

function escapeTableCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n+/g, ' ');
}

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === '';
}

function formatValue(def, value, catalogs) {
  if (def.boolean) return value ? 'Sí' : 'No';
  if (isEmptyValue(value)) return '—';

  if (def.list) {
    const labels = def.catalog ? catalogs[def.catalog] ?? {} : null;
    const enumLabels = def.enumGroup ? catalogs.enums[def.enumGroup] ?? {} : null;
    return (Array.isArray(value) ? value : [value])
      .map((item) => labels?.[item] ?? enumLabels?.[item] ?? item)
      .join(' · ');
  }

  if (def.enumGroup) {
    return catalogs.enums[def.enumGroup]?.[value] ?? value;
  }

  if (def.url) return `<${value}>`;

  return value;
}

/**
 * Los enlaces se listan aparte de la tabla: `urls` sólo trae las claves con valor y
 * meterlas en filas haría la tabla ilegible en cuanto una comunidad tenga ocho canales.
 */
function formatUrlsList(urls = {}) {
  return Object.entries(urls)
    .filter(([, value]) => typeof value === 'string' && value.trim() !== '')
    .map(([key, value]) => `- **${key}**: ${value.trim()}`);
}

function formatThumbnail(thumbnailUrl) {
  const value = typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : '';
  if (!value) return [];
  // Sólo las URLs remotas se pueden previsualizar: una ruta `images/foo.webp` todavía no
  // existe en master cuando se abre la PR, así que GitHub no la resolvería.
  if (/^https?:\/\//i.test(value)) {
    return [`<img src="${value}" alt="Logo propuesto" height="88" />`, ''];
  }
  return [`🖼️ Logo propuesto: \`${value}\``, ''];
}

function serializeForComparison(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function buildFieldRows(payload, catalogs) {
  return FIELD_DEFS
    .filter((def) => (def.onlyWhenTrue ? Boolean(payload[def.key]) : def.boolean || !isEmptyValue(payload[def.key])))
    .map((def) => `| ${def.label} | ${escapeTableCell(formatValue(def, payload[def.key], catalogs))} |`);
}

function buildDiffRows(payload, existing, catalogs) {
  return FIELD_DEFS
    .filter((def) => serializeForComparison(payload[def.key]) !== serializeForComparison(existing[def.key]))
    .map((def) => [
      '|',
      def.label,
      '|',
      escapeTableCell(formatValue(def, existing[def.key], catalogs)),
      '|',
      escapeTableCell(formatValue(def, payload[def.key], catalogs)),
      '|',
    ].join(' '));
}

function buildUrlDiffRows(payload, existing) {
  const payloadUrls = payload.urls ?? {};
  const existingUrls = existing.urls ?? {};
  const keys = [...new Set([...Object.keys(existingUrls), ...Object.keys(payloadUrls)])].sort();

  return keys
    .filter((key) => serializeForComparison(existingUrls[key]) !== serializeForComparison(payloadUrls[key]))
    .map((key) => `| urls.${key} | ${escapeTableCell(existingUrls[key] || '—')} | ${escapeTableCell(payloadUrls[key] || '—')} |`);
}

export function buildProposalSummary({ mode, payload, existing = null, catalogs }) {
  const resolvedCatalogs = catalogs ?? loadSummaryCatalogs();
  const name = typeof payload?.name === 'string' && payload.name.trim() ? payload.name.trim() : 'Sin nombre';
  const lines = [];

  if (mode === 'delete') {
    lines.push(`### 🗑️ Baja propuesta — ${name}`, '');
    const reason = typeof payload?.removalReason === 'string' ? payload.removalReason.trim() : '';
    lines.push(`**Motivo:** ${reason || '—'}`);
    return lines.join('\n');
  }

  if (mode === 'edit' && existing) {
    const rows = [...buildDiffRows(payload, existing, resolvedCatalogs), ...buildUrlDiffRows(payload, existing)];
    lines.push(`### ✏️ Cambios propuestos — ${name}`, '');

    if (rows.length === 0) {
      // Pasa cuando la propuesta sólo reconfirma datos: sin esta rama la tabla saldría
      // vacía y el revisor no sabría si falló el cálculo o si de verdad no cambia nada.
      lines.push('_La propuesta no cambia ningún campo respecto a lo publicado (solo actualiza `lastReviewed`)._');
      return lines.join('\n');
    }

    lines.push('| Campo | Antes | Ahora |', '| --- | --- | --- |', ...rows);
    return lines.join('\n');
  }

  lines.push(`### 📋 Propuesta — ${name}`, '');
  lines.push(...formatThumbnail(payload?.thumbnailUrl));
  lines.push('| Campo | Valor |', '| --- | --- |', ...buildFieldRows(payload ?? {}, resolvedCatalogs));

  const urlLines = formatUrlsList(payload?.urls);
  if (urlLines.length > 0) {
    lines.push('', '**Otros enlaces:**', ...urlLines);
  }

  return lines.join('\n');
}

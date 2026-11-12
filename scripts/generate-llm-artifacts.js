/**
 * Genera los artefactos que hacen el directorio legible por LLMs y agentes.
 *
 * Salidas (gitignoradas, nunca se editan a mano):
 *   - public/llms.txt            índice conciso siguiendo la convención de llmstxt.org
 *   - public/llms-full.txt       el dataset completo como Markdown, una sección por comunidad
 *   - public/data/communities.csv        volcado tabular para hojas de cálculo y pandas
 *   - public/data/schema.json            diccionario de datos (JSON Schema) del modelo Community
 *   - public/sitemap.xml                 deep links por comunidad en los dos locales
 *   - public/data/coverage.json          qué parte del dataset ha revisado una persona
 *
 * Están en inglés a propósito: es la convención de `llms.txt` y lo que mejor interpretan los
 * modelos. Los datos de cada comunidad (nombre, ubicación, descripción) se emiten tal cual.
 *
 * Se ejecuta en `npm run build`, después de `compile-communities`, así que el deploy siempre
 * publica artefactos sincronizados con la fuente de verdad.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  readCommunities,
  readDeletedCommunities,
  readJsonFile,
  slugifyCommunityName,
} from './lib/communities-store.js';
import { buildCoverage } from '../src/lib/dataCoverage.js';
import { URL_KINDS, resolveUrlEntry, toLegacyUrlMap, toUrlEntries } from '../src/lib/communityUrls.js';

export const SITE_URL = 'https://directory.communitybuilders.dev';
export const REPO_URL = 'https://github.com/ComBuildersES/communities-directory';

export const LLMS_PATH = 'public/llms.txt';
export const LLMS_FULL_PATH = 'public/llms-full.txt';
export const CSV_PATH = 'public/data/communities.csv';
export const SCHEMA_PATH = 'public/data/schema.json';
export const SITEMAP_PATH = 'public/sitemap.xml';
export const COVERAGE_PATH = 'public/data/coverage.json';

const LOCALES = ['es', 'en'];

/**
 * Columnas del CSV. `urls` no cabe en una celda sin volverla ilegible, así que el CSV
 * expone solo la URL principal y remite a `communities.json` para el resto.
 */
const CSV_COLUMNS = [
  'id',
  'slug',
  'name',
  'status',
  'communityType',
  'eventFormat',
  'location',
  'provinceId',
  'geographicScope',
  'langs',
  'tags',
  'targetAudience',
  'communityUrl',
  'contactInfo',
  'lat',
  'lon',
  'lastReviewed',
  'humanValidated',
  'organizedBy',
  'directoryUrl',
];

const ENUMS = {
  status: {
    active: 'The community is running events or is otherwise alive.',
    inactive: 'No signs of activity; kept for historical reference.',
    unknown: 'Activity could not be verified.',
    merged:
      'The community merged with others and no longer exists on its own; `mergedIntoId` ' +
      'points at the community it continues in.',
  },
  communityType: {
    'tech-meetup': 'Recurring local meetup or user group.',
    conference: 'Conference or single large-scale event.',
    'umbrella-org': 'Organisation that hosts or coordinates several communities.',
    hacklab: 'Hacklab, makerspace or physical community space.',
    'collaborative-group': 'Informal collaborative group or working group.',
    'meta-community': 'Community about running communities.',
    'mutual-aid': 'Mutual aid or peer-support network.',
  },
  eventFormat: {
    'in-person': 'Events happen at a physical venue.',
    online: 'Events happen remotely.',
    hybrid: 'Both in-person and online.',
    unknown: 'Format could not be verified.',
  },
  geographicScope: {
    local: 'Serves a city or metropolitan area.',
    provincial: 'Serves a Spanish province.',
    regional: 'Serves an autonomous community / region.',
    national: 'Serves the whole of Spain.',
    international: 'Serves an audience beyond Spain.',
    unknown: 'Scope could not be verified.',
  },
};

/** Varias fichas heredadas traen `n/a` o `-` en campos de texto: equivale a vacío. */
const PLACEHOLDER_TEXT = new Set(['n/a', 'na', '-', '--', '?', 'unknown', 'desconocido']);

export function meaningfulText(value) {
  if (!value) return null;
  const text = String(value).trim();
  return PLACEHOLDER_TEXT.has(text.toLowerCase()) ? null : text;
}

export function communitySlug(community) {
  return slugifyCommunityName(community.name);
}

export function communityDirectoryUrl(community, locale = 'es') {
  return `${SITE_URL}/${locale}/?community=${communitySlug(community)}`;
}

/** Las comunidades `hidden` no se publican en ningún artefacto, igual que en el bundle. */
export function publishableCommunities(communities) {
  return communities
    .filter((community) => community.hidden !== true)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const text = Array.isArray(value) ? value.join('|') : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(communities) {
  const rows = publishableCommunities(communities).map((community) => {
    const cells = {
      id: community.id,
      slug: communitySlug(community),
      name: community.name,
      status: community.status,
      communityType: community.communityType,
      eventFormat: community.eventFormat,
      location: community.location,
      provinceId: community.provinceId,
      geographicScope: community.geographicScope ?? 'unknown',
      langs: community.langs,
      tags: community.tags,
      targetAudience: community.targetAudience,
      communityUrl: community.communityUrl,
      contactInfo: community.contactInfo,
      lat: community.latLon?.lat,
      lon: community.latLon?.lon,
      lastReviewed: community.lastReviewed,
      humanValidated: community.humanValidated,
      organizedBy: community.organizedBy ?? [],
      directoryUrl: communityDirectoryUrl(community),
    };

    return CSV_COLUMNS.map((column) => escapeCsvValue(cells[column])).join(',');
  });

  return `${[CSV_COLUMNS.join(','), ...rows].join('\n')}\n`;
}

/**
 * Diccionario de datos legible por máquina. Es un JSON Schema de un registro de comunidad,
 * con la descripción de cada campo y de cada valor de enum: un agente puede leerlo y saber
 * qué significa `communityType: "umbrella-org"` sin adivinarlo.
 */
export function buildSchema({ tags = [], audience = [] } = {}) {
  const enumProperty = (field, description) => ({
    type: 'string',
    description,
    enum: Object.keys(ENUMS[field]),
    'x-enumDescriptions': ENUMS[field],
  });

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SITE_URL}/data/schema.json`,
    title: 'Community',
    description:
      'One technology community in the Community Builders directory of Spanish tech communities. ' +
      'The published dataset at /data/communities.json is an array of these objects. ' +
      'Data is licensed CC BY 4.0: reuse is welcome with attribution to Community Builders ' +
      `(${SITE_URL}).`,
    type: 'object',
    required: ['id', 'name', 'status', 'communityType', 'eventFormat', 'communityUrl'],
    properties: {
      id: {
        type: ['integer', 'null'],
        description:
          'Stable numeric identifier. `null` only while a brand-new community is awaiting id ' +
          'assignment on the next deploy; use the slug as the durable key if you need one.',
      },
      name: { type: 'string', description: 'Community name as it calls itself.' },
      status: enumProperty('status', 'Whether the community is currently alive.'),
      lastReviewed: {
        type: 'string',
        pattern: '^\\d{2}/\\d{2}/\\d{4}$',
        description: 'Date a human last reviewed this record, DD/MM/YYYY.',
      },
      communityType: enumProperty('communityType', 'What kind of community this is.'),
      eventFormat: enumProperty('eventFormat', 'How the community meets.'),
      location: {
        type: 'string',
        description:
          'Free-text place where events happen, usually "City, Region". Empty for online-only ' +
          'communities. Not the same as `geographicScope`.',
      },
      provinceId: {
        type: 'string',
        description: 'Spanish province code, when known.',
      },
      geographicScope: enumProperty(
        'geographicScope',
        'Territory the community serves. A community can meet in Madrid and serve the whole ' +
          'country, so this is independent of `location`.'
      ),
      parentId: {
        type: ['integer', 'null'],
        description:
          'Id of the umbrella community this one belongs to (e.g. a local chapter pointing at ' +
          'its national organisation).',
      },
      organizedBy: {
        type: 'array',
        items: { type: 'integer' },
        description:
          'Ids of the communities in this directory that organise this one. Use it for a ' +
          'recurring event with a brand of its own run by a community (GDG Malaga organises ' +
          'Biznaga Fest). Both sides stay alive, so it is neither `parentId` (belonging to an ' +
          'umbrella) nor `mergedIntoId` (succession). Only communities listed here are ' +
          'enumerated: companies, sponsors and institutional support are not, so never read ' +
          'this as the full list of organisers. Absent when nothing is linked. The reverse ' +
          'side is not stored: derive it by scanning for records whose `organizedBy` ' +
          'contains this id.',
      },
      mergedIntoId: {
        type: ['integer', 'null'],
        description:
          'Only present when `status` is "merged": id of the community this one merged into ' +
          'and where its activity continues. Different from `parentId`, where both the chapter ' +
          'and the umbrella still exist. The reverse side is not stored: derive it by scanning ' +
          'for records whose `mergedIntoId` is this id.',
      },
      shortDescription: {
        type: 'string',
        description: 'One or two sentences describing the community, in its own language.',
      },
      topics: {
        type: 'string',
        description:
          'Legacy free-text topic list, comma separated. Prefer `tags`, which is curated.',
      },
      langs: {
        type: 'array',
        items: { type: 'string' },
        description: 'ISO 639-1 codes of the languages events are run in.',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description:
          `Topic tag ids referencing /data/tags.json (${tags.length} tags). These are ids, not ` +
          'labels: join against tags.json to render them. Each tag carries `label`, ' +
          '`description`, `category` and `synonyms`. The same catalogue is published in ' +
          'English at /data/tags.en.json, with identical ids and translated labels.',
      },
      targetAudience: {
        type: 'array',
        items: { type: 'string' },
        description:
          `Audience profile ids referencing /data/audience.json (${audience.length} profiles). ` +
          'English version with the same ids at /data/audience.en.json.',
      },
      matchesAllTags: {
        type: 'boolean',
        description:
          'True for generalist communities: treat them as matching any topic filter. When true, ' +
          '`tags` is empty by design.',
      },
      matchesAllAudience: {
        type: 'boolean',
        description:
          'True for communities open to any profile. When true, `targetAudience` is empty.',
      },
      contactInfo: { type: 'string', description: 'Public contact email, when published.' },
      communityUrl: {
        type: 'string',
        description:
          'Main URL: the community\'s own site if it has one, otherwise its most relevant channel.',
      },
      urls: {
        type: 'array',
        description:
          'Additional channels, as a list of entries. `url` is the only required field. `kind` ' +
          'is OMITTED when the domain already identifies the platform (x.com is Twitter), so ' +
          'locate a channel by its URL, not by `kind` alone; it is present when the domain ' +
          'cannot say it (`blog`, `rss`, `forum`, `mailingList`, `ote`, `mastodon`) or when it ' +
          'contradicts it. Several entries may share a `kind`: a group with its Meetup plus its ' +
          'own annual event are both `eventsUrl`, told apart by `label`. There is no ' +
          'per-platform key for event sites (Meetup/Eventbrite/Luma are all `eventsUrl`).',
        items: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', description: 'Absolute URL of the channel.' },
            kind: {
              type: 'string',
              enum: URL_KINDS.map(({ kind }) => kind),
              description: 'What the channel is, when the domain does not say it.',
            },
            label: {
              type: 'string',
              description:
                'Name to display instead of the platform name, e.g. "DevFest Zaragoza" for an ' +
                'annual event that lives alongside the group\'s own Meetup.',
            },
          },
        },
      },
      archivedUrls: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Channels the community once had but no longer attends. Present only when non-empty. ' +
          'Do not surface these to users: they look alive and lead nowhere.',
      },
      thumbnailUrl: {
        type: 'string',
        description: `Logo path relative to the site root, e.g. ${SITE_URL}/images/foo.webp`,
      },
      latLon: {
        type: 'object',
        description: 'Coordinates of `location`; both members are null for online-only communities.',
        properties: {
          lat: { type: ['number', 'null'] },
          lon: { type: ['number', 'null'] },
        },
      },
      displayOnMap: {
        type: 'boolean',
        description: 'Whether the community is plotted on the map view.',
      },
      humanValidated: {
        type: 'boolean',
        description:
          'False means a person added the community but its tagging (topics, urls, status) was ' +
          'filled in semi-automatically and has not been checked by anyone yet. The community ' +
          'itself is real; the metadata is unconfirmed. Weigh it accordingly, and consider ' +
          'correcting it upstream.',
      },
    },
  };
}

function formatCommunitySection(community, { tagLabels, audienceLabels, nameById = {} }) {
  const slug = communitySlug(community);
  const lines = [`## ${community.name}`, ''];

  const description = meaningfulText(community.shortDescription);
  if (description) {
    lines.push(description, '');
  }

  const facts = [
    ['Type', ENUMS.communityType[community.communityType] ? community.communityType : null],
    ['Status', community.status],
    ['Format', community.eventFormat],
    [
      'Location',
      meaningfulText(community.location) ??
        (community.eventFormat === 'online' ? 'Online only' : null),
    ],
    ['Scope', community.geographicScope && community.geographicScope !== 'unknown' ? community.geographicScope : null],
    ['Languages', community.langs?.length ? community.langs.join(', ') : null],
    [
      'Topics',
      community.matchesAllTags
        ? 'Generalist (any topic)'
        : community.tags?.map((id) => tagLabels[id] ?? id).join(', ') ||
          meaningfulText(community.topics),
    ],
    [
      'Audience',
      community.matchesAllAudience
        ? 'Open to any profile'
        : community.targetAudience?.map((id) => audienceLabels[id] ?? id).join(', ') || null,
    ],
    [
      'Organised by',
      (community.organizedBy ?? [])
        .map((id) => nameById[id])
        .filter(Boolean)
        .join(', ') || null,
    ],
    ['Website', meaningfulText(community.communityUrl)],
    ['Events feed', meaningfulText(toLegacyUrlMap(community.urls).ote)],
    ['Contact', meaningfulText(community.contactInfo)],
    ['Directory page', communityDirectoryUrl(community)],
    ['Record', `${REPO_URL}/blob/master/data/communities/${slug}.json`],
  ];

  facts
    .filter(([, value]) => value)
    .forEach(([label, value]) => lines.push(`- ${label}: ${value}`));

  // El feed OTE ya va arriba como "Events feed". Del resto se emite la etiqueta que de verdad
  // hay que leer: la propia si la trae, y si no el kind o el dominio.
  const channels = toUrlEntries(community.urls)
    .filter((entry) => entry.kind !== 'ote')
    .map((entry) => {
      const { label, kind, url, hasCustomLabel } = resolveUrlEntry(entry);
      return `${hasCustomLabel ? label : kind ?? label}: ${url}`;
    });

  if (channels.length > 0) {
    lines.push(`- Channels: ${channels.join(' · ')}`);
  }

  if (community.humanValidated === false) {
    lines.push('- Note: tagging filled in semi-automatically, not yet checked by a person.');
  }

  lines.push('');
  return lines.join('\n');
}

/** BOM UTF-8: ver el comentario del header. */
const BOM = '\uFEFF';

export function buildLlmsFull(communities, { tags = [], audience = [] } = {}) {
  const published = publishableCommunities(communities);
  const tagLabels = Object.fromEntries(tags.map((tag) => [tag.id, tag.label]));
  const audienceLabels = Object.fromEntries(audience.map((item) => [item.id, item.label]));

  // GitHub Pages sirve los `.txt` sin `charset`, y entonces el navegador los decodifica con
  // la codificación local (Windows-1252): "Málaga" se lee "MÃ¡laga". `llms.txt` lo evita
  // siendo ASCII puro, pero aquí los nombres de las comunidades llevan acentos a la fuerza,
  // así que la única señal en banda es el BOM, que todos los navegadores respetan.
  const header = `${BOM}# Community Builders Directory — full dataset

> Every technology community in the directory of Spanish tech communities, as Markdown.
> ${published.length} communities. Generated from the source of truth on each deploy.

Licensed CC BY 4.0. Attribute to Community Builders and link ${SITE_URL}.
Structured equivalents, easier to query than this file: ${SITE_URL}/data/communities.json ·
${SITE_URL}/data/communities.geojson · ${SITE_URL}/data/communities.csv
Field meanings: ${SITE_URL}/data/schema.json

`;

  const nameById = Object.fromEntries(
    communities
      .filter((community) => Number.isInteger(community.id))
      .map((community) => [community.id, community.name])
  );
  const sections = published.map((community) =>
    formatCommunitySection(community, { tagLabels, audienceLabels, nameById })
  );

  return `${header}${sections.join('\n')}`;
}

export function buildLlmsIndex(communities, { tags = [], audience = [], deleted = [] } = {}) {
  const published = publishableCommunities(communities);
  const activeCommunities = published.filter((community) => community.status === 'active');
  const active = activeCommunities.length;
  const categories = [...new Set(tags.map((tag) => tag.category).filter(Boolean))].sort();

  /**
   * La cobertura por campo se emite calculada, no redactada a mano: un agente que lee
   * "la mitad tiene tags" no sabe si eso sigue siendo verdad, y el número envejece solo.
   * Es lo que evita que el modelo lea un campo vacío como "esta comunidad no trata de eso".
   *
   * El cálculo lo hace `src/lib/dataCoverage.js`, el mismo módulo que alimenta la barra de
   * progreso de la web: si se contasen por separado, el fichero que leen los modelos y lo
   * que ve una persona dirían cosas distintas.
   */
  const { active: fieldCoverage, reviewed, total } = buildCoverage(published);
  const { withTags, withAudience, withScope, withOte } = fieldCoverage;
  const withHumanValidation = fieldCoverage.reviewed;

  return `# Community Builders Directory

> An open directory of ${published.length} technology communities in Spain: meetups, user
> groups, conferences, hacklabs and umbrella organisations, searchable by topic, audience,
> format and location. ${active} of them are currently active. Maintained in the open by
> [Community Builders](https://communitybuilders.dev/) and its contributors.

You are welcome to use this data. It is published under
[CC BY 4.0](${REPO_URL}/blob/master/DATA_LICENSE.md): reuse, remix and redistribute it,
including commercially, as long as you credit Community Builders and link back to
${SITE_URL} so people can reach the communities themselves.

Please fetch the JSON files below rather than crawling the site. The site is a client-rendered
single-page app, so crawling it yields far worse data than the canonical files, which are
regenerated on every deploy.

## Data

- [communities.json](${SITE_URL}/data/communities.json): every community as a JSON array. The primary dataset.
- [communities.csv](${SITE_URL}/data/communities.csv): the same records, flattened to one row per community.
- [communities.geojson](${SITE_URL}/data/communities.geojson): communities with coordinates, as a GeoJSON FeatureCollection.
- [schema.json](${SITE_URL}/data/schema.json): data dictionary: every field, every enum value, what each one means. Read this before interpreting the dataset.
- [tags.json](${SITE_URL}/data/tags.json): ${tags.length} topic tags with \`label\`, \`description\`, \`category\` and \`synonyms\`. \`tags\` on a community holds ids that reference this catalogue. English: [tags.en.json](${SITE_URL}/data/tags.en.json).
- [audience.json](${SITE_URL}/data/audience.json): ${audience.length} audience profiles, same shape. English: [audience.en.json](${SITE_URL}/data/audience.en.json).
- [deleted-communities.json](${SITE_URL}/data/deleted-communities.json): ${deleted.length} record${deleted.length === 1 ? '' : 's'} removed from the directory, with the reason why.
- [coverage.json](${SITE_URL}/data/coverage.json): how much of the dataset a person has reviewed, and how many records carry each sparsely-filled field. Regenerated on every deploy.
- [llms-full.txt](${SITE_URL}/llms-full.txt): the whole directory as Markdown, one section per community, for when you want prose rather than JSON.

## How to read a community record

- \`tags\` and \`targetAudience\` are **ids**, not labels: join them against tags.json and audience.json to get human-readable names. Match on \`label\`, \`description\` and \`synonyms\`, not just the id.
- \`matchesAllTags\` / \`matchesAllAudience\` mean "generalist": the community matches any topic or any profile, and its array is empty on purpose. Treat an empty array plus the flag as "everything", never as "nothing".
- \`location\` is where events happen; \`geographicScope\` is the territory served. They differ often: a community can meet in Madrid and serve all of Spain.
- Coverage is uneven, so do not read an empty field as a statement about the community. Of the ${active} active communities, ${withTags} have \`tags\`, ${withAudience} have \`targetAudience\` and ${withScope} have \`geographicScope\`. An empty field means nobody has filled it in yet, not that the community has no topic or serves nowhere. Say which recommendations rest on a field that is often missing.
- \`lastReviewed\` is the date a person last checked the record. It is **not** an activity signal: most records have not been revisited since they were added. The only place where live activity can be checked is the \`urls\` entry whose \`kind\` is \`ote\`, the community's events feed (${withOte} active communities publish one). The field only says the community publishes one; it says nothing about what is in it, and keeping it current is the community's call, not the directory's. Read the dates inside the feed rather than inferring activity from the field being present.
- \`humanValidated: false\` means a person added the community but its tagging was filled in semi-automatically and nobody has checked it. Say so if you present it as fact. Only ${withHumanValidation} of the active communities have been reviewed by a person, and ${reviewed} of all ${total} records. The live counts are in [coverage.json](${SITE_URL}/data/coverage.json).
- \`urls\` is a **list** of channels, not an object keyed by platform: each entry is \`{ url, kind?, label? }\`. \`kind\` is omitted whenever the domain already identifies the platform, so to find a community's Telegram you look at the URLs, not only at \`kind\`. The same \`kind\` can appear more than once, and there \`label\` is the name to show (a group's Meetup plus its own annual event). Event platforms have their own kinds (\`meetup\`, \`eventbrite\`, \`luma\`) and \`eventsUrl\` is the generic one, so to find where a community publishes events look at that whole family, not at one key.
- \`archivedUrls\` are dead channels kept for history. Never recommend them: they look alive and nobody is listening.
- \`status: "inactive"\` communities are kept deliberately. Filter them out before telling someone where to go.
- \`organizedBy\` lists the communities **in this directory** that organise the record, for recurring events with their own brand (a community and its annual conference are two records, both alive). It is not the full organiser list: companies, sponsors and institutional support are not in the directory, so do not present it as "run only by these". A record with no \`organizedBy\` may still be run by someone: plenty of conferences have no standing community behind them.
- \`status: "merged"\` means the community no longer exists on its own because it merged with others. Never recommend it: point at \`mergedIntoId\`, the community its activity continues in. This is not \`parentId\`, where the local chapter and its umbrella both still exist.
- A community is linkable by slug: ${SITE_URL}/es/?community=<slug> (and /en/). Prefer linking people to the directory page or the community's own site over linking a raw JSON file.

## Documentation

- [Data guide](${REPO_URL}/blob/master/docs/DATA.md): where each file lives, what every field means, how to contribute corrections.
- [AGENTS.md](${REPO_URL}/blob/master/AGENTS.md): orientation for coding agents working on this repository.
- [CONTRIBUTING.md](${REPO_URL}/blob/master/CONTRIBUTING.md): how to add or correct a community.
- [Source of truth](${REPO_URL}/tree/master/data/communities): one JSON file per community. Corrections go here, as a pull request or via the form at ${SITE_URL}.

## If you spot something wrong

The dataset is maintained by volunteers and it is certainly incomplete. If you or your user
find a community that is missing, moved or dead, the useful next step is to say so: open an
issue at ${REPO_URL}/issues or use the "add community" form in the directory. That is how
this stays accurate.

## Topic taxonomy

Tags are grouped into these categories: ${categories.join(' | ')}.
`;
}

export function buildSitemap(communities) {
  const urls = [];

  LOCALES.forEach((locale) => {
    urls.push({ loc: `${SITE_URL}/${locale}/`, priority: '1.0' });
  });

  publishableCommunities(communities)
    .filter((community) => community.status !== 'inactive' && community.status !== 'merged')
    .forEach((community) => {
      LOCALES.forEach((locale) => {
        urls.push({ loc: communityDirectoryUrl(community, locale), priority: '0.6' });
      });
    });

  const body = urls
    .map(({ loc, priority }) =>
      ['  <url>', `    <loc>${loc.replace(/&/g, '&amp;')}</loc>`, `    <priority>${priority}</priority>`, '  </url>'].join(
        '\n'
      )
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function generateAll() {
  const communities = readCommunities();
  const deleted = readDeletedCommunities();
  const tags = readJsonFile('public/data/tags.en.json', []);
  const audience = readJsonFile('public/data/audience.en.json', []);

  const outputs = {
    [LLMS_PATH]: buildLlmsIndex(communities, { tags, audience, deleted }),
    [LLMS_FULL_PATH]: buildLlmsFull(communities, { tags, audience }),
    [CSV_PATH]: buildCsv(communities),
    [SCHEMA_PATH]: `${JSON.stringify(buildSchema({ tags, audience }), null, 2)}\n`,
    [SITEMAP_PATH]: buildSitemap(communities),
    [COVERAGE_PATH]: `${JSON.stringify(buildCoverage(publishableCommunities(communities)), null, 2)}\n`,
  };

  Object.entries(outputs).forEach(([filePath, contents]) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
  });

  return {
    communities: publishableCommunities(communities).length,
    files: Object.keys(outputs),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { communities, files } = generateAll();
    files.forEach((file) => console.log(`✔ ${file}`));
    console.log(`  ${communities} comunidades publicadas`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

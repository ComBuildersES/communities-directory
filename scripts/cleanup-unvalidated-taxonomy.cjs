#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const COMMUNITIES_PATH = path.join(ROOT, "public/data/communities.json");
const TAGS_PATH = path.join(ROOT, "public/data/tags.json");
const AUDIENCE_PATH = path.join(ROOT, "public/data/audience.json");

const argv = new Set(process.argv.slice(2));
const shouldWrite = argv.has("--write");
const verbose = argv.has("--verbose");

const GENERIC_HOSTS = new Set([
  "meetup.com",
  "www.meetup.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "linkedin.com",
  "www.linkedin.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "t.me",
  "discord.gg",
  "github.com",
  "www.github.com",
  "github.io",
  "wordpress.com",
  "www.wordpress.com",
  "tumblr.com",
  "www.tumblr.com",
  "netlify.app",
  "carrd.co",
  "web.archive.org",
  "medium.com",
  "substack.com",
]);

const URL_SEGMENT_BLACKLIST = new Set([
  "www",
  "com",
  "org",
  "net",
  "es",
  "io",
  "app",
  "dev",
  "community",
  "communities",
  "events",
  "event",
  "about",
  "home",
  "watch",
  "playlist",
  "channel",
  "company",
  "groups",
  "group",
  "chapters",
  "chapter",
  "profile",
  "in",
  "web",
  "status",
  "videos",
  "posts",
  "en",
  "es-es",
  "en-au",
  "it-it",
]);

const DROP_AUTO_TAGS = new Set(["growth", "innovation", "networking"]);

const EXTRA_TAG_ALIASES = {
  "r-lang": [
    "r users",
    "r user",
    "r user group",
    "r group",
    "usuarios de r",
    "grupo de usuarios de r",
    "asociacion de usuarios de r",
    "barcelona r",
    "sevilla r",
    "almeria r",
    "grupo r",
  ],
  csharp: ["dotnet", ".net", "dot net", "dotnetters", "dot netters", "net foundation"],
  aspnet: ["asp.net", "aspnet"],
  vbnet: ["vb.net", "visual basic .net", "visual basic"],
  javascript: ["javascript", "nodejs", "node.js", "node js", "js"],
  typescript: ["typescript"],
  php: ["php"],
  python: ["python", "pydata"],
  go: ["golang", "go lang"],
  angular: ["angular"],
  react: ["react"],
  vue: ["vue", "vuejs"],
  flutter: ["flutter"],
  django: ["django"],
  rails: ["rails", "ruby on rails"],
  symfony: ["symfony"],
  wordpress: ["wordpress"],
  woocommerce: ["woocommerce"],
  drupal: ["drupal"],
  prestashop: ["prestashop"],
  joomla: ["joomla"],
  liferay: ["liferay"],
  "software-craftsmanship": [
    "software craftsmanship",
    "software crafters",
    "software crafter",
    "swcraft",
    "crafters barcelona",
    "crafters vigo",
  ],
  "software-architecture": ["software architecture", "arquitectura de software"],
  "design-patterns": ["design patterns", "patrones de diseno", "patterns"],
  "clean-code": ["clean code"],
  ddd: ["ddd", "domain driven design", "domain-driven design"],
  bdd: ["bdd", "behavior driven development", "behaviour driven development"],
  tdd: ["tdd", "test driven development"],
  "functional-programming": ["functional programming", "programacion funcional"],
  oop: ["oop", "object oriented programming", "programacion orientada a objetos"],
  microservices: ["microservices", "microservicios"],
  "event-driven": ["event driven", "event-driven"],
  "distributed-systems": ["distributed systems", "sistemas distribuidos"],
  aws: ["aws", "amazon web services"],
  azure: ["azure"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  docker: ["docker", "cloud native", "cncf"],
  kubernetes: ["kubernetes", "k8s", "cloud native", "cncf"],
  terraform: ["terraform"],
  "ci-cd": ["ci cd", "ci/cd", "continuous integration", "continuous delivery"],
  jenkins: ["jenkins"],
  networking: ["networking"],
  sysadmin: ["sysadmin", "system administration", "administracion de sistemas"],
  bash: ["bash"],
  git: ["git"],
  vscode: ["vscode", "visual studio code"],
  github: ["github"],
  "data-warehouse": ["data warehouse"],
  "data-lake": ["data lake"],
  "data-pipelines": ["data pipelines", "data pipeline", "etl"],
  "data-science": ["data science", "datascience", "pydata"],
  statistics: ["statistics", "estadistica"],
  "data-engineering": ["data engineering"],
  "big-data": ["big data"],
  "data-visualization": ["data visualization", "dataviz", "power bi", "grafana"],
  "machine-learning": ["machine learning", "artificial intelligence", "inteligencia artificial", "ai"],
  "deep-learning": ["deep learning"],
  nlp: ["nlp", "natural language processing"],
  "business-intelligence": ["business intelligence", "power bi", "fabric"],
  mlops: ["mlops"],
  "generative-ai": ["generative ai", "genai", "ia generativa"],
  llm: ["llm", "large language model"],
  rag: ["rag", "retrieval augmented generation"],
  "vector-databases": ["vector databases", "vector db"],
  cybersecurity: ["cybersecurity", "ciberseguridad", "security"],
  "ethical-hacking": ["ethical hacking", "hacking", "hacking etico"],
  pentesting: ["pentesting", "pentest"],
  "cloud-security": ["cloud security"],
  "web-security": ["web security", "owasp"],
  "digital-forensics": ["digital forensics", "forensics"],
  arduino: ["arduino"],
  "raspberry-pi": ["raspberry pi"],
  iot: ["iot", "internet of things"],
  sensors: ["sensors"],
  robotics: ["robotics", "robotica"],
  "3d-printing": ["3d printing", "impresion 3d"],
  makerspace: ["makerspace", "maker space", "fablab", "fablab", "medialab", "hackerspace", "hackspace"],
  "open-hardware": ["open hardware", "hardware"],
  "3d-modeling": ["3d modeling", "modelado 3d"],
  android: ["android"],
  ios: ["ios"],
  linux: ["linux"],
  windows: ["windows"],
  macos: ["macos"],
  "virtual-reality": ["virtual reality"],
  "augmented-reality": ["augmented reality"],
  "mixed-reality": ["mixed reality"],
  "game-development": ["game development", "gamedev", "videojuegos"],
  "game-design": ["game design"],
  "indie-games": ["indie games"],
  unity: ["unity"],
  "unreal-engine": ["unreal engine"],
  tech4good: ["tech4good", "tech for good"],
  "digital-activism": ["digital activism", "activismo tecnologico", "activismo digital"],
  "tech-ethics": ["tech ethics", "ethics", "etica"],
  diversity: ["diversity", "diversidad", "inclusion", "inclusion"],
  "women-in-tech": ["women in tech", "girls in stem", "female empowerment"],
  healthtech: ["healthtech", "medicina", "medical", "salud", "sanitario"],
  stem: ["stem"],
  mentoring: ["mentoring", "mentoria", "mentor"],
  "free-software": ["free software", "software libre"],
  "open-data": ["open data", "datos abiertos"],
  "open-source": ["open source", "opensource", "codigo abierto"],
  startups: ["startups", "startup"],
  "product-management": ["product management", "product manager", "product owner"],
  growth: [],
  "lean-startup": ["lean startup"],
  innovation: [],
  seo: ["seo"],
  "digital-marketing": ["digital marketing", "marketing digital", "ecommerce"],
  blockchain: ["blockchain"],
  cryptocurrencies: ["cryptocurrencies", "crypto"],
  ethereum: ["ethereum"],
  web3: ["web3"],
  accessibility: ["accessibility", "accesibilidad", "a11y", "inclusive design"],
};

const EXTRA_AUDIENCE_ALIASES = {
  "junior-developer": ["junior", "early career", "primer empleo"],
  student: ["student", "estudiante", "universitario", "campus", "students"],
  "career-changer": ["career changer", "career switcher", "cambio de carrera"],
  mentee: ["mentee"],
  mentor: ["mentor", "mentoring"],
  "frontend-developer": ["frontend", "front end", "front-end"],
  "backend-developer": ["backend", "back end", "back-end"],
  "fullstack-developer": ["fullstack", "full stack", "full-stack"],
  "mobile-developer": ["mobile developer", "desarrollador movil"],
  "game-developer": ["game developer", "gamedev", "videojuegos"],
  "embedded-iot-engineer": ["embedded", "firmware", "iot developer"],
  "robotics-engineer": ["robotics engineer", "robotica"],
  "data-engineer": ["data engineer"],
  "data-scientist": ["data scientist"],
  "ml-engineer": ["ml engineer", "ai engineer"],
  "data-analyst": ["data analyst"],
  "devops-engineer": ["devops", "platform engineer"],
  "cloud-engineer": ["cloud engineer"],
  sre: ["sre", "site reliability engineering", "site reliability engineer"],
  sysadmin: ["sysadmin", "system administrator"],
  "cybersecurity-engineer": ["cybersecurity engineer", "security engineer", "ciberseguridad"],
  pentester: ["pentester", "pentesting"],
  "qa-engineer": ["qa engineer", "quality assurance"],
  "test-automation-engineer": ["test automation engineer"],
  "software-architect": ["software architect", "arquitecto de software"],
  "tech-lead": ["tech lead"],
  "product-manager": ["product manager", "product owner"],
  "project-manager": ["project manager"],
  "agile-practitioner": ["agile", "scrum", "kanban"],
  "ux-designer": ["ux designer", "ux"],
  "ui-designer": ["ui designer", "ui"],
  "digital-marketer": ["digital marketer", "marketing digital"],
  "community-manager": ["community manager"],
  entrepreneur: ["entrepreneur", "startup founder", "founder", "emprendedor", "emprendedora"],
  "business-innovation-manager": [
    "business innovation manager",
    "innovation manager",
    "business and innovation manager",
  ],
  researcher: ["researcher", "investigacion", "research"],
  educator: ["educator", "teacher", "profesor", "educacion"],
  "phd-doctoral": ["phd", "doctoral", "doctorado"],
  maker: ["maker", "makerspace", "fablab", "medialab"],
  "open-source-contributor": ["open source", "software libre"],
  "data-journalist": ["data journalist"],
  minors: ["kids", "children", "menores"],
};

const MANUAL_KEEP = {
  0: {
    tags: ["csharp"],
  },
  2: {
    tags: ["cybersecurity", "ethical-hacking", "cloud-security", "web-security"],
    audience: ["cybersecurity-engineer"],
  },
  5: {
    tags: ["makerspace", "3d-modeling", "robotics", "arduino"],
  },
  21: {
    tags: ["digital-activism", "tech4good", "open-hardware"],
  },
  134: {
    tags: ["digital-marketing"],
  },
  173: {
    tags: ["digital-marketing", "seo"],
    audience: ["digital-marketer"],
  },
  598: {
    tags: ["accessibility", "diversity", "tech4good", "tech-ethics"],
    audience: ["frontend-developer", "ux-designer", "ui-designer"],
  },
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/%[0-9A-F]{2}/gi, " ")
    .replace(/c#/gi, "csharp")
    .replace(/\.net/gi, " dotnet ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(value) {
  const normalized = normalizeText(value);
  return normalized ? ` ${normalized} ` : " ";
}

function readCommunitiesAsExpression() {
  const source = fs.readFileSync(COMMUNITIES_PATH, "utf8");
  return {
    source,
    data: Function(`"use strict"; return (${source});`)(),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function tryParseUrl(raw) {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function extractArchivedUrl(raw) {
  const parsed = tryParseUrl(raw);
  if (!parsed || !/web\.archive\.org$/i.test(parsed.hostname)) return raw;

  const match = parsed.pathname.match(/\/web\/\d+\/(https?:\/\/.+)$/i);
  return match ? match[1] : raw;
}

function extractUrlEvidence(raw) {
  const resolved = extractArchivedUrl(raw);
  const url = tryParseUrl(resolved);
  if (!url) return [];

  const host = url.hostname.toLowerCase();
  const pieces = [];

  if (host.endsWith("github.io") || host.endsWith("wordpress.com") || host.endsWith("tumblr.com") || host.endsWith("netlify.app") || host.endsWith("carrd.co")) {
    const first = host.split(".")[0];
    if (first && !URL_SEGMENT_BLACKLIST.has(first)) pieces.push(first);
  } else if (GENERIC_HOSTS.has(host)) {
    const pathBits = url.pathname
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !URL_SEGMENT_BLACKLIST.has(part.toLowerCase()));
    pieces.push(...pathBits);
  } else {
    const hostBits = host
      .split(".")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !URL_SEGMENT_BLACKLIST.has(part.toLowerCase()));
    const pathBits = url.pathname
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !URL_SEGMENT_BLACKLIST.has(part.toLowerCase()));

    pieces.push(...hostBits, ...pathBits);
  }

  return pieces.map(normalizeText).filter(Boolean);
}

function buildMatcherIndex(catalog, extraAliases) {
  return new Map(
    catalog.map((entry) => {
      if (DROP_AUTO_TAGS.has(entry.id)) {
        return [entry.id, []];
      }

      const terms = new Set();
      const rawTerms = [entry.label, ...(entry.synonyms || []), ...(extraAliases[entry.id] || [])];

      for (const term of rawTerms) {
        const normalized = normalizeText(term);
        if (!normalized) continue;
        if (normalized.length < 2) continue;
        terms.add(normalized);
      }

      return [entry.id, Array.from(terms)];
    })
  );
}

function evidenceText(community) {
  const pieces = [community.name, community.topics];

  if (community.communityUrl) pieces.push(...extractUrlEvidence(community.communityUrl));
  for (const url of Object.values(community.urls || {})) {
    pieces.push(...extractUrlEvidence(url));
  }

  return wrapText(pieces.filter(Boolean).join(" "));
}

function matchesAny(evidence, terms) {
  return terms.some((term) => new RegExp(`(^| )${escapeRegExp(term)}( |$)`, "i").test(evidence));
}

function intersectWithEvidence(values, index, evidence) {
  return values.filter((value) => {
    const terms = index.get(value) || [];
    return terms.length > 0 && matchesAny(evidence, terms);
  });
}

function unique(values) {
  return Array.from(new Set(values));
}

function withManualKeep(values, manual = []) {
  if (!manual.length) return values;
  return unique([...values, ...manual.filter(Boolean)]);
}

function sameArray(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function main() {
  const { data: communities } = readCommunitiesAsExpression();
  const tagsCatalog = readJson(TAGS_PATH);
  const audienceCatalog = readJson(AUDIENCE_PATH);

  const tagIndex = buildMatcherIndex(tagsCatalog, EXTRA_TAG_ALIASES);
  const audienceIndex = buildMatcherIndex(audienceCatalog, EXTRA_AUDIENCE_ALIASES);

  let changed = 0;
  let touchedTags = 0;
  let touchedAudience = 0;

  for (const community of communities) {
    if (community.humanValidated !== false) continue;

    const evidence = evidenceText(community);
    const manual = MANUAL_KEEP[community.id] || {};
    const originalTags = Array.isArray(community.tags) ? community.tags : [];
    const originalAudience = Array.isArray(community.targetAudience) ? community.targetAudience : [];

    const nextTags = withManualKeep(
      intersectWithEvidence(originalTags, tagIndex, evidence),
      manual.tags
    );
    const nextAudience = withManualKeep(
      intersectWithEvidence(originalAudience, audienceIndex, evidence),
      manual.audience
    );

    const tagsChanged = !sameArray(originalTags, nextTags);
    const audienceChanged = !sameArray(originalAudience, nextAudience);

    if (tagsChanged) {
      community.tags = nextTags;
      touchedTags += 1;
    }

    if (audienceChanged) {
      community.targetAudience = nextAudience;
      touchedAudience += 1;
    }

    if (tagsChanged || audienceChanged) {
      changed += 1;
    }

    if (verbose && (tagsChanged || audienceChanged)) {
      console.log(`- [${community.id}] ${community.name}`);
      if (tagsChanged) {
        console.log(`  tags: ${JSON.stringify(originalTags)} -> ${JSON.stringify(nextTags)}`);
      }
      if (audienceChanged) {
        console.log(`  audience: ${JSON.stringify(originalAudience)} -> ${JSON.stringify(nextAudience)}`);
      }
    }
  }

  console.log(`Comunidades false revisadas: ${communities.filter((c) => c.humanValidated === false).length}`);
  console.log(`Comunidades tocadas: ${changed}`);
  console.log(`Cambios en tags: ${touchedTags}`);
  console.log(`Cambios en targetAudience: ${touchedAudience}`);

  if (shouldWrite) {
    fs.writeFileSync(COMMUNITIES_PATH, `${JSON.stringify(communities, null, 2)}\n`, "utf8");
    console.log(`Escrito: ${COMMUNITIES_PATH}`);
  } else {
    console.log("Dry-run completado. Usa --write para aplicar los cambios.");
  }
}

main();

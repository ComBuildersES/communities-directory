import fs from "fs";

const COMMUNITIES_PATH = "./public/data/communities.json";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const communities = JSON.parse(fs.readFileSync(COMMUNITIES_PATH, "utf-8"));

const EVENTS_URL_RE = /\b(meetup\.com|eventbrite\.(com|es)|lu\.ma|gdg\.community\.dev|community\.cncf\.io|trailblazercommunitygroups\.com|wordcamp\.org|meetups\.mulesoft\.com|saraos\.tech)\b/i;
const LINK_AGGREGATOR_RE = /\b(linktr\.ee|beacons\.ai|campsite\.bio|bio\.link|lnk\.bio|solo\.to|taplink\.cc|allmylinks\.com)\b/i;
const FACEBOOK_RE = /\bfacebook\.com\b/i;
const TWITCH_RE = /\btwitch\.tv\b/i;
const MAILING_LIST_RE = /\b(substack\.com|buttondown\.email|mailchimp\.com|tinyletter\.com|groups\.google\.com|googlegroups\.com|groups\.io)\b/i;
const MASTODON_RE = /(mastodon|fosstodon|hachyderm|infosec\.exchange|social\.coop|\/@[\w.-]+)/i;

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isMatch(value, regex) {
  return typeof value === "string" && regex.test(value.trim());
}

function toMailingListValue(contactInfo) {
  if (typeof contactInfo !== "string") return "";
  const match = contactInfo
    .split(";")
    .map((item) => item.trim())
    .find((item) => MAILING_LIST_RE.test(item));
  return match ?? "";
}

function moveUrl(urls, fromKey, toKey) {
  const value = cleanString(urls[fromKey]);
  if (!value) return false;

  if (!cleanString(urls[toKey])) {
    urls[toKey] = value;
  }

  delete urls[fromKey];
  return true;
}

let changed = 0;

const migrated = communities.map((community) => {
  const next = {
    ...community,
    urls: { ...(community.urls ?? {}) },
  };
  const before = JSON.stringify(next);

  moveUrl(next.urls, "meetup", "eventsUrl");

  if (isMatch(next.communityUrl, LINK_AGGREGATOR_RE) && !cleanString(next.urls.linkAggregator)) {
    next.urls.linkAggregator = cleanString(next.communityUrl);
  }

  if (isMatch(next.communityUrl, EVENTS_URL_RE) && !cleanString(next.urls.eventsUrl)) {
    next.urls.eventsUrl = cleanString(next.communityUrl);
  }

  if (isMatch(next.urls.mastodon, EVENTS_URL_RE) && !cleanString(next.urls.eventsUrl)) {
    next.urls.eventsUrl = cleanString(next.urls.mastodon);
    delete next.urls.mastodon;
  }

  if (isMatch(next.communityUrl, FACEBOOK_RE) && !cleanString(next.urls.facebook)) {
    next.urls.facebook = cleanString(next.communityUrl);
  }

  if (isMatch(next.communityUrl, TWITCH_RE) && !cleanString(next.urls.twitch)) {
    next.urls.twitch = cleanString(next.communityUrl);
  }

  if (isMatch(next.contactInfo, MAILING_LIST_RE) && !cleanString(next.urls.mailingList)) {
    next.urls.mailingList = toMailingListValue(next.contactInfo);
  }

  if (isMatch(next.contactInfo, MASTODON_RE) && !cleanString(next.urls.mastodon)) {
    next.urls.mastodon = cleanString(next.contactInfo);
  }

  if (isMatch(next.urls.web, FACEBOOK_RE)) {
    moveUrl(next.urls, "web", "facebook");
  }

  if (isMatch(next.urls.web, TWITCH_RE)) {
    moveUrl(next.urls, "web", "twitch");
  }

  if (isMatch(next.urls.web, EVENTS_URL_RE)) {
    moveUrl(next.urls, "web", "eventsUrl");
  }

  if (isMatch(next.urls.web, LINK_AGGREGATOR_RE)) {
    moveUrl(next.urls, "web", "linkAggregator");
  }

  next.urls = Object.fromEntries(
    Object.entries(next.urls)
      .map(([key, value]) => [key, cleanString(value)])
      .filter(([, value]) => value)
  );

  if (JSON.stringify(next) !== before) {
    changed += 1;
  }

  return next;
});

if (!dryRun) {
  fs.writeFileSync(COMMUNITIES_PATH, JSON.stringify(migrated, null, 2), "utf-8");
}

console.log(`${dryRun ? "[DRY RUN] " : ""}Migradas ${changed} comunidades.`);

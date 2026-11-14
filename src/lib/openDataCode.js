const SITE_URL = "https://directory.communitybuilders.dev";
const OTE_URL = "https://opentechevents.org/";

export function getCodeSnippets(t) {
  return [
    {
      key: "shell",
      label: "curl + jq",
      hint: t("openData.code.hintShell"),
      text: `${t("openData.code.commentShell")}
curl -s ${SITE_URL}/data/communities.json \\
  | jq '[.[] | select(.hidden != true and .status == "active" and .eventFormat == "in-person")
         | select(.matchesAllTags == true or (.tags | index("cybersecurity")))
         | {name, location, communityUrl}]'`,
    },
    {
      key: "js",
      label: "JavaScript",
      hint: t("openData.code.hintJs"),
      text: `const [communities, tags] = await Promise.all([
  fetch("${SITE_URL}/data/communities.json").then((r) => r.json()),
  fetch("${SITE_URL}/data/${t("openData.code.tagsFile")}").then((r) => r.json()),
]);

const labelById = Object.fromEntries(tags.map((tag) => [tag.id, tag.label]));

${t("openData.code.commentGeneralist")}
const matching = communities.filter(
  (c) => !c.hidden && c.status === "active" && (c.matchesAllTags || c.tags.includes("python"))
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

visibles = ~df["hidden"].fillna(False).astype(bool)
activas = df[visibles & (df["status"] == "active")]
print(activas.groupby("geographicScope").size())`,
    },
    {
      key: "events",
      label: "Open Tech Events",
      hint: t("openData.code.hintEvents"),
      text: `${t("openData.code.commentEvents")}
const communities = await fetch("${SITE_URL}/data/communities.json").then((r) => r.json());

${t("openData.code.commentChannels")}
const withFeed = communities
  .filter((c) => !c.hidden)
  .map((c) => ({ community: c, feed: (c.urls ?? []).find((u) => u.kind === "ote")?.url }))
  .filter(({ feed }) => Boolean(feed));

const events = await Promise.all(
  withFeed.map(async ({ community, feed: feedUrl }) => {
    try {
      const feed = await fetch(feedUrl).then((r) => r.json());
      return (feed.events ?? []).map((event) => ({ community: community.name, ...event }));
    } catch {
      ${t("openData.code.commentFeedFailure")}
      return [];
    }
  })
);

console.log(events.flat());
${t("openData.code.commentSpec")} ${OTE_URL}`,
    },
  ];

}

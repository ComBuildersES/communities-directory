/* eslint-env node */
import fs from "node:fs";
import process from "node:process";
import { normalizeCommunityLangs } from "../src/lib/communityLanguages.js";

const COMMUNITIES_PATH = "public/data/communities.json";
const dryRun = process.argv.includes("--dry-run");

function readCommunities() {
  return JSON.parse(fs.readFileSync(COMMUNITIES_PATH, "utf-8"));
}

function areArraysEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function main() {
  const communities = readCommunities();
  let changedCount = 0;

  const updatedCommunities = communities.map((community) => {
    const nextLangs = normalizeCommunityLangs(community.langs);
    const currentLangs = Array.isArray(community.langs) ? community.langs : [];

    if (areArraysEqual(currentLangs, nextLangs)) {
      return community;
    }

    changedCount += 1;
    return {
      ...community,
      langs: nextLangs,
    };
  });

  console.log(JSON.stringify({
    dryRun,
    totalCommunities: communities.length,
    changedCommunities: changedCount,
  }, null, 2));

  if (dryRun || changedCount === 0) {
    return;
  }

  fs.writeFileSync(COMMUNITIES_PATH, `${JSON.stringify(updatedCommunities, null, 2)}\n`);
}

main();

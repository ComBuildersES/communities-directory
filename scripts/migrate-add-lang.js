/* eslint-env node */
import process from "node:process";
import { normalizeCommunityLangs } from "../src/lib/communityLanguages.js";
// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { readCommunities, writeCommunities } from "./lib/communities-store.js";

const dryRun = process.argv.includes("--dry-run");

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

  writeCommunities(updatedCommunities);
}

main();

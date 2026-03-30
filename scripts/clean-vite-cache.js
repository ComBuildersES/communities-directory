/* eslint-env node */
import fs from "node:fs";
import path from "node:path";

const cacheDirs = [
  path.resolve("node_modules/.vite"),
  path.resolve(".vite"),
];

let removedCount = 0;

for (const dir of cacheDirs) {
  if (!fs.existsSync(dir)) {
    continue;
  }

  fs.rmSync(dir, { recursive: true, force: true });
  removedCount += 1;
  console.log(`Removed Vite cache: ${dir}`);
}

if (removedCount === 0) {
  console.log("No Vite cache directories found.");
}

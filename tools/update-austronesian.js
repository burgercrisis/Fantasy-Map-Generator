"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function isAustronesianEntry(entry) {
  if (!entry) return false;
  if (entry.category === "Austronesian") return true;

  const fam = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && fam === "austronesian") return true;

  return false;
}

function normalizeAustronesianEntry(entry) {
  let changed = false;

  if (!entry.category) {
    entry.category = "Austronesian";
    changed = true;
  }

  if (!entry.region) {
    // Treat Austronesian as broadly Pacific when missing; we do not
    // override existing Asia/region values.
    entry.region = "Pacific";
    changed = true;
  }

  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Austronesian";
    changed = true;
  }

  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  let updated = 0;

  for (const entry of mixes) {
    if (!isAustronesianEntry(entry)) continue;
    if (normalizeAustronesianEntry(entry)) updated++;
  }

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  writeJson("config/language-mixes.json", mixes);
  console.log("Austronesian entries updated:", updated);
}

if (require.main === module) main();

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

function isDravidianEntry(entry) {
  if (!entry) return false;
  if (entry.category === "Dravidian") return true;

  const fam = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && fam === "dravidian") return true;

  return false;
}

function normalizeDravidianEntry(entry) {
  let changed = false;

  if (!entry.category) {
    entry.category = "Dravidian";
    changed = true;
  }

  if (!entry.region) {
    entry.region = "Asia";
    changed = true;
  }

  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Dravidian";
    changed = true;
  }

  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  let updated = 0;

  for (const entry of mixes) {
    if (!isDravidianEntry(entry)) continue;
    if (normalizeDravidianEntry(entry)) updated++;
  }

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  writeJson("config/language-mixes.json", mixes);
  console.log("Dravidian entries updated:", updated);
}

if (require.main === module) main();

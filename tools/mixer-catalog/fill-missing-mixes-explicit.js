"use strict";

// Fill remaining ISOs that are present in language-mixer-map.json
// but missing from language-mixes.json, using an explicit mapping
// of categories and regions so they show up in the Language Mixer.

const fs = require("fs");
const path = require("path");
const {META} = require("../mixer-meta/_meta-fill-missing-mixes");

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

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const missing = Object.keys(META).filter(iso => mapIsos.has(iso) && !mixIsos.has(iso));

  let added = 0;

  for (const iso of missing) {
    const meta = META[iso];
    if (!meta) continue;
    const entry = {
      name: meta.name,
      iso,
      category: meta.category,
      region: meta.region
    };
    if (meta.tags && meta.tags.length) entry.tags = meta.tags.slice();
    mixes.push(entry);
    added++;
  }

  if (!added) {
    console.log("No missing ISO entries from META to add.");
  } else {
    console.log("Added", added, "missing ISO entries.");
  }

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  writeJson("config/language-mixes.json", mixes);
}

if (require.main === module) main();

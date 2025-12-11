"use strict";

// Ensure that *all* ISO codes present in language-mixer-map.json
// have a corresponding catalog entry in language-mixes.json so that
// every mapped language can appear in the Language Mixer dropdown.

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

function titleFromIso(iso) {
  return iso
    .split("-")
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
    .replace(/\s+Fam(ily)?$/i, " family");
}

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const missing = [...mapIsos].filter(iso => !mixIsos.has(iso)).sort();

  if (!missing.length) {
    console.log("No ISO codes in map are missing from catalog.");
    return;
  }

  console.log("Missing ISO codes to add:", missing.join(", "));

  let added = 0;

  for (const iso of missing) {
    const meta = META[iso] || {};
    const name = meta.name || titleFromIso(iso);
    const category = meta.category || (iso.endsWith("-family") ? "Family" : "Other");
    const region = meta.region || "Misc";

    const entry = {name, iso, category, region};
    if (meta.tags && meta.tags.length) entry.tags = meta.tags.slice();
    mixes.push(entry);
    added++;
  }

  console.log("Added", added, "catalog entries for previously missing ISOs.");

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  const finalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalMixIsos) {
    if (!finalMixIsos.has(iso)) {
      console.error(
        "[fill-all-missing-mixes] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
}

if (require.main === module) main();

"use strict";

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

const mixes = readJson("config/language-mixes.json");
const map = readJson("config/language-mixer-map.json");

const mixByIso = new Map();
for (const lang of mixes) {
  if (!lang || !lang.iso) continue;
  mixByIso.set(String(lang.iso), lang);
}

const baseToIsos = new Map(); // baseIndex => Set(iso)

for (const entry of map) {
  if (!entry || !entry.iso) continue;
  const iso = String(entry.iso);
  const lang = mixByIso.get(iso) || null;
  const tags = lang && Array.isArray(lang.tags) ? lang.tags : [];
  if (tags.includes("family")) continue; // skip family-macro catalog entries
  if (tags.includes("subset")) continue;
  if (lang && lang.status === "skipped") continue;

  const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
  if (!basesSource.length) continue;

  const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
    b => !Number.isNaN(b)
  );
  if (!uniqueBases.length) continue;

  for (const base of uniqueBases) {
    let set = baseToIsos.get(base);
    if (!set) {
      set = new Set();
      baseToIsos.set(base, set);
    }
    set.add(iso);
  }
}

const isoHasUniqueBase = new Set();
for (const isos of baseToIsos.values()) {
  if (isos.size === 1) {
    const onlyIso = isos.values().next().value;
    isoHasUniqueBase.add(onlyIso);
  }
}

const noUniqBase = [];
for (const entry of map) {
  const iso = String(entry.iso);
  const lang = mixByIso.get(iso) || null;
  const tags = lang && Array.isArray(lang.tags) ? lang.tags : [];
  if (tags.includes("family")) continue;
  if (tags.includes("subset")) continue;
  if (lang && lang.status === "skipped") continue;

  if (!isoHasUniqueBase.has(iso)) {
    noUniqBase.push(iso);
  }
}

console.log(JSON.stringify(noUniqBase.slice(0, 10), null, 2));

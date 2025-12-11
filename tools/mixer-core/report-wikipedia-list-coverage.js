"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadList(fileArg) {
  if (!fileArg) {
    throw new Error("Expected a path to a JSON file describing a Wikipedia language list");
  }
  const full = path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);

  if (Array.isArray(data)) {
    return { title: path.basename(full), source: "", items: data };
  }

  if (!data || !Array.isArray(data.items)) {
    throw new Error("List JSON must be an array or an object with an 'items' array");
  }

  return {
    title: String(data.title || path.basename(full)),
    source: String(data.source || ""),
    items: data.items
  };
}

function buildIndexes(mixes, map) {
  const byIso = new Map();
  const byNameLower = new Map();

  for (const m of mixes) {
    if (!m || !m.iso) continue;
    const iso = String(m.iso);
    byIso.set(iso, m);
    const name = m.name ? String(m.name).toLowerCase() : "";
    if (name) {
      const arr = byNameLower.get(name) || [];
      arr.push(m);
      byNameLower.set(name, arr);
    }
  }

  const mapIsos = new Set(map.map(e => String(e.iso)));

  return { byIso, byNameLower, mapIsos };
}

function buildIsoHasUniqueBaseMap(mixes, map) {
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

  const isoHasUniqueBase = new Map();
  for (const isos of baseToIsos.values()) {
    if (isos.size === 1) {
      const onlyIso = isos.values().next().value;
      isoHasUniqueBase.set(onlyIso, true);
    }
  }

  return isoHasUniqueBase;
}

function computeNonuniqueBases(results, isoHasUniqueBase) {
  let considered = 0;
  let withUniqueBase = 0;

  for (const r of results) {
    if (r.status === "skipped") continue;
    considered++;

    const iso = r.iso != null ? String(r.iso) : null;
    if (iso && isoHasUniqueBase.get(iso)) {
      withUniqueBase++;
    }
  }

  return considered - withUniqueBase;
}

function resolveItem(item, indexes) {
  const { byIso, byNameLower, mapIsos } = indexes;

  const skip = !!item.skip;
  const name = item.name ? String(item.name) : "";
  const isoRaw = item.iso != null ? String(item.iso) : "";

  if (skip) {
    return {
      name,
      iso: isoRaw || null,
      status: "skipped"
    };
  }

  let iso = null;

  if (isoRaw) {
    iso = isoRaw;
  } else if (name) {
    const candidates = byNameLower.get(name.toLowerCase()) || [];
    if (candidates.length === 1) {
      iso = String(candidates[0].iso);
    } else if (candidates.length > 1) {
      return {
        name,
        iso: null,
        status: "ambiguous",
        detail: `Name matches ${candidates.length} catalog entries; specify 'iso' in the list JSON`
      };
    }
  }

  if (!iso) {
    return {
      name,
      iso: null,
      status: "unmatched",
      detail: "No iso provided and name did not match any catalog entry"
    };
  }

  const inCatalog = byIso.has(iso);
  const inMap = mapIsos.has(iso);

  if (inCatalog && inMap) {
    return { name, iso, status: "full" };
  }

  if (!inCatalog && !inMap) {
    return {
      name,
      iso,
      status: "missing-both",
      detail: "Missing from both catalog and mixer map"
    };
  }

  if (!inCatalog) {
    return {
      name,
      iso,
      status: "missing-catalog",
      detail: "Present in mixer map but missing from catalog"
    };
  }

  return {
    name,
    iso,
    status: "missing-map",
    detail: "Present in catalog but missing from mixer map"
  };
}

function summarizeResults(listMeta, results, nonuniqueBases) {
  const total = results.length;
  let skipped = 0;
  let full = 0;
  let missingCatalog = 0;
  let missingMap = 0;
  let missingBoth = 0;
  let unmatched = 0;
  let ambiguous = 0;

  for (const r of results) {
    switch (r.status) {
      case "skipped":
        skipped++;
        break;
      case "full":
        full++;
        break;
      case "missing-catalog":
        missingCatalog++;
        break;
      case "missing-map":
        missingMap++;
        break;
      case "missing-both":
        missingBoth++;
        break;
      case "unmatched":
        unmatched++;
        break;
      case "ambiguous":
        ambiguous++;
        break;
    }
  }

  const considered = total - skipped;
  const pct = considered > 0 ? ((full / considered) * 100).toFixed(1) : "0.0";

  console.log(`List title: ${listMeta.title}`);
  if (listMeta.source) console.log(`Source: ${listMeta.source}`);
  console.log(`Total items: ${total}`);
  console.log(`  considered: ${considered}`);
  console.log(`  skipped:    ${skipped}`);
  console.log("");
  console.log("Coverage summary (considered items only):");
  console.log(`  fully wired:       ${full} (${pct}% of considered)`);
  console.log(`  missing catalog:   ${missingCatalog}`);
  console.log(`  missing map:       ${missingMap}`);
  console.log(`  missing both:      ${missingBoth}`);
  console.log(`  unmatched name:    ${unmatched}`);
  console.log(`  ambiguous matches: ${ambiguous}`);
  if (typeof nonuniqueBases === "number") {
    console.log(`  Nonunique Bases:   ${nonuniqueBases}`);
  }

  const sections = [
    { label: "Missing from catalog", key: "missing-catalog" },
    { label: "Missing from mixer map", key: "missing-map" },
    { label: "Missing from both", key: "missing-both" },
    { label: "Unmatched items (no iso / name not found)", key: "unmatched" },
    { label: "Ambiguous name matches", key: "ambiguous" }
  ];

  for (const section of sections) {
    const subset = results.filter(r => r.status === section.key);
    if (!subset.length) continue;
    console.log("");
    console.log(section.label + ":");
    for (const r of subset) {
      const namePart = r.name ? `${r.name}` : "(no name)";
      const isoPart = r.iso ? ` [iso=${r.iso}]` : "";
      const detail = r.detail ? ` – ${r.detail}` : "";
      console.log(`  - ${namePart}${isoPart}${detail}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node tools/mixer-core/report-wikipedia-list-coverage.js path/to/list.json");
    console.log("");
    console.log("The list JSON should be either:");
    console.log("  - an array of items, or");
    console.log("  - an object { title, source, items } where items is an array.");
    console.log("Each item may contain:");
    console.log("  - name: human-readable name from the Wikipedia list");
    console.log("  - iso: optional explicit ISO / internal key matching language-mixes.json");
    console.log("  - skip: optional boolean to exclude the item from coverage calculations.");
    process.exit(0);
  }

  const listPathArg = args[0];
  const baseName = path.basename(listPathArg);
  if (/seed|major|subset/i.test(baseName)) {
    console.warn(
      "WARNING: This JSON looks like a seed/subset/major snapshot (" +
        baseName +
        "). Per project rules, coverage decisions should be based on the canonical full-list JSON instead."
    );
  }

  const listMeta = loadList(listPathArg);
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");
  const indexes = buildIndexes(mixes, map);

  const results = listMeta.items.map(item => resolveItem(item || {}, indexes));
  const isoHasUniqueBase = buildIsoHasUniqueBaseMap(mixes, map);
  const nonuniqueBases = computeNonuniqueBases(results, isoHasUniqueBase);
  summarizeResults(listMeta, results, nonuniqueBases);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while reporting Wikipedia list coverage:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

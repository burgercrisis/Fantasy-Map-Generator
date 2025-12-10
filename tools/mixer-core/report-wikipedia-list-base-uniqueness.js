"use strict";

// Report base-set uniqueness for languages in a given Wikipedia-derived
// list JSON, intersecting with the global Language Mixer map.
//
// For each list item, this script reuses the same ISO/name resolution
// rules as `report-wikipedia-list-coverage.js`, then:
//   - restricts attention to items with status `full` (present in both
//     catalog and mixer map), and
//   - determines whether each such language has a globally unique
//     `bases[]` set in `config/language-mixer-map.json` (ignoring
//     family-macro catalog entries tagged with `"family"`).
//
// Output is a small summary you can paste alongside the coverage legend
// in DEVplans/Languages-Status.md §8.x entries:
//   - unique bases: N
//   - clustered bases: M
// plus an optional per-language dump of clustered entries.
//
// Usage (from project root):
//   node tools/mixer-core/report-wikipedia-list-base-uniqueness.js path/to/list.json
//
// This is a **read-only** helper and does not modify any files.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.isAbsolute(relPath) ? relPath : path.join(root, relPath);
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

function buildBaseClusters(mixes, map) {
  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const clusters = new Map(); // key => { bases, members: [meta] }

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue; // map entry not present in catalog

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    const isFamilyMacro = tags.includes("family");
    if (isFamilyMacro) continue; // mirror base-cluster tooling: skip family macros

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue; // nothing to cluster on

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
      b => !Number.isNaN(b)
    );
    if (!uniqueBases.length) continue;

    const bases = uniqueBases.sort((a, b) => a - b);
    const key = bases.join(",");

    if (!clusters.has(key)) {
      clusters.set(key, { bases, members: [] });
    }
    clusters.get(key).members.push({ iso, name: lang.name || "" });
  }

  const isoToClusterSize = new Map();
  for (const { members } of clusters.values()) {
    const size = members.length;
    for (const m of members) {
      isoToClusterSize.set(m.iso, size);
    }
  }

  return { clusters, isoToClusterSize };
}

function main() {
  const args = process.argv.slice(2);
  const fileArg = args[0];

  if (!fileArg) {
    console.error(
      "Usage: node tools/mixer-core/report-wikipedia-list-base-uniqueness.js path/to/list.json"
    );
    process.exitCode = 1;
    return;
  }

  const list = loadList(fileArg);
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const indexes = buildIndexes(mixes, map);
  const { isoToClusterSize } = buildBaseClusters(mixes, map);

  let totalItems = 0;
  let skipped = 0;
  let full = 0;
  let missingCatalog = 0;
  let missingMap = 0;
  let missingBoth = 0;
  let unmatched = 0;
  let ambiguous = 0;

  let uniqueBases = 0;
  let clusteredBases = 0;

  const clusteredDetails = [];

  for (const item of list.items) {
    const res = resolveItem(item, indexes);

    if (res.status === "skipped") {
      skipped++;
      continue;
    }

    totalItems++;

    switch (res.status) {
      case "full": {
        full++;
        const iso = String(res.iso);
        const clusterSize = isoToClusterSize.get(iso) || 0;

        if (clusterSize <= 1) {
          uniqueBases++;
        } else {
          clusteredBases++;
          clusteredDetails.push({ iso, name: res.name || "", clusterSize });
        }
        break;
      }
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
      default:
        break;
    }
  }

  console.log("=== Wikipedia list base-uniqueness summary ===");
  console.log("List:", list.title || "(no title)");
  if (list.source) console.log("Source:", list.source);
  console.log("List items (excluding explicit skip):", totalItems);
  if (skipped) console.log("Skipped items:", skipped);
  console.log("");

  console.log("Wiring status (same categories as report-wikipedia-list-coverage.js):");
  console.log("  full:", full);
  console.log("  missing-catalog:", missingCatalog);
  console.log("  missing-map:", missingMap);
  console.log("  missing-both:", missingBoth);
  console.log("  unmatched:", unmatched);
  console.log("  ambiguous:", ambiguous);
  console.log("");

  console.log("Base-set uniqueness among full items:");
  console.log("  unique bases:", uniqueBases);
  console.log("  clustered bases:", clusteredBases);
  console.log("");

  if (clusteredDetails.length) {
    console.log("Clustered full items (share their bases[] with at least one other catalog language):");
    console.log("  iso | name | clusterSize");
    clusteredDetails
      .slice()
      .sort((a, b) => a.iso.localeCompare(b.iso))
      .forEach(entry => {
        console.log(
          "  " + entry.iso + " | " + (entry.name || "(no name)") + " | " + entry.clusterSize
        );
      });
  } else {
    console.log("All full items from this list currently have globally unique base sets.");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting Wikipedia list base-set uniqueness:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}

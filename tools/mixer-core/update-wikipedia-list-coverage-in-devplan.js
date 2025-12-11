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

function computeCounts(results) {
  const counts = {
    total: results.length,
    skipped: 0,
    full: 0,
    missingCatalog: 0,
    missingMap: 0,
    missingBoth: 0,
    unmatched: 0,
    ambiguous: 0
  };

  for (const r of results) {
    switch (r.status) {
      case "skipped": counts.skipped++; break;
      case "full": counts.full++; break;
      case "missing-catalog": counts.missingCatalog++; break;
      case "missing-map": counts.missingMap++; break;
      case "missing-both": counts.missingBoth++; break;
      case "unmatched": counts.unmatched++; break;
      case "ambiguous": counts.ambiguous++; break;
    }
  }

  return counts;
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

function updateDevplanSnapshot(listPathArg, counts, nonuniqueBases, devplanRel) {
  const devplanPath = path.join(root, devplanRel);
  const devplanRaw = fs.readFileSync(devplanPath, "utf8");
  const lines = devplanRaw.split(/\r?\n/);

  const fullListPath = path.isAbsolute(listPathArg) ? listPathArg : path.join(root, listPathArg);
  const relFromRoot = path.relative(root, fullListPath).replace(/\\/g, "/");
  const jsonLineNeedle = `- **JSON file:** \`${relFromRoot}\``;

  const jsonLineIndex = lines.findIndex(l => l.trim() === jsonLineNeedle);
  if (jsonLineIndex === -1) {
    throw new Error(`Could not find JSON file line '${jsonLineNeedle}' in ${devplanRel}`);
  }

  const snapshotIndex = lines.findIndex((l, idx) => idx > jsonLineIndex && l.trim().startsWith("- **Snapshot from last run (all list items):"));
  if (snapshotIndex === -1) {
    throw new Error(`Could not find snapshot header after JSON file line for '${relFromRoot}'`);
  }

  let endIndex = snapshotIndex + 1;
  while (endIndex < lines.length && lines[endIndex].startsWith("  - ")) {
    endIndex++;
  }

  const newBlock = [
    `  - \`fully wired:\` ${counts.full}`,
    `  - \`missing catalog:\` ${counts.missingCatalog}`,
    `  - \`missing map:\` ${counts.missingMap}`,
    `  - \`missing both:\` ${counts.missingBoth}`,
    `  - \`unmatched:\` ${counts.unmatched}`,
    `  - \`ambiguous:\` ${counts.ambiguous}`,
    `  - \`Nonunique Bases:\` ${nonuniqueBases}`
  ];

  const updatedLines = [
    ...lines.slice(0, snapshotIndex + 1),
    ...newBlock,
    ...lines.slice(endIndex)
  ];

  fs.writeFileSync(devplanPath, updatedLines.join("\n"), "utf8");
  console.log("Updated snapshot in", devplanRel, "for", relFromRoot);
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js <list-json-rel-path> [DEVPLAN_REL]");
    console.log("");
    console.log("Example:");
    console.log("  node tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js tools/mixer-meta/wikipedia-languages-of-africa-full.json");
    process.exit(0);
  }

  const listPathArg = args[0];
  const devplanRel = args[1] || "DEVplans/Languages-Status.md";

  const baseName = path.basename(listPathArg);
  if (/seed|major|subset/i.test(baseName)) {
    throw new Error(
      "Per project rules, devplan snapshots must be driven by canonical full-list JSONs, not seed/subset/major snapshots: " +
        baseName
    );
  }

  const listMeta = loadList(listPathArg);
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");
  const indexes = buildIndexes(mixes, map);
  const results = listMeta.items.map(item => resolveItem(item || {}, indexes));
  const counts = computeCounts(results);

  const isoHasUniqueBase = buildIsoHasUniqueBaseMap(mixes, map);
  const nonuniqueBases = computeNonuniqueBases(results, isoHasUniqueBase);

  updateDevplanSnapshot(listPathArg, counts, nonuniqueBases, devplanRel);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while updating devplan snapshot:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

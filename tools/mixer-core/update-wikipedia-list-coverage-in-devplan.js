"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(s);
}

function loadList(fileArg) {
  if (!fileArg) {
    throw new Error("Expected a path to a JSON file describing a Wikipedia language list");
  }
  const full = path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  const data = JSON.parse(s);

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
    if (!m?.iso) continue;
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
    if (!lang?.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const baseToIsos = new Map(); // baseIndex => Set(iso)

  for (const entry of map) {
    if (!entry?.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso) || null;
    const tags = Array.isArray(lang?.tags) ? lang.tags : [];
    if (tags.includes("family")) continue; // skip family-macro catalog entries
    if (tags.includes("subset")) continue;

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

function buildBaseClusters(mixes, map) {
  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang?.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const clusters = new Map(); // key => { bases, members: [iso] }

  for (const entry of map) {
    if (!entry?.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) continue;
    if (tags.includes("subset")) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
      b => !Number.isNaN(b)
    );
    if (!uniqueBases.length) continue;

    const bases = uniqueBases.sort((a, b) => a - b);
    const key = bases.join(",");
    if (!clusters.has(key)) {
      clusters.set(key, { bases, members: [] });
    }
    clusters.get(key).members.push(iso);
  }

  const isoToClusterSize = new Map();
  for (const { members } of clusters.values()) {
    const size = members.length;
    for (const iso of members) {
      isoToClusterSize.set(iso, size);
    }
  }

  return { isoToClusterSize };
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

function computeBaseSetUniquenessStats(results, isoToClusterSize) {
  let uniqueBases = 0;
  let clusteredBases = 0;
  const clustered = []; // { iso, clusterSize }

  for (const r of results) {
    if (!r || r.status !== "full" || !r.iso) continue;
    const iso = String(r.iso);
    const clusterSize = isoToClusterSize.get(iso) || 0;
    if (clusterSize <= 1) {
      uniqueBases++;
    } else {
      clusteredBases++;
      clustered.push({ iso, clusterSize });
    }
  }

  const histogram = { size2: 0, size3: 0, size4plus: 0 };
  for (const c of clustered) {
    if (c.clusterSize === 2) histogram.size2++;
    else if (c.clusterSize === 3) histogram.size3++;
    else if (c.clusterSize >= 4) histogram.size4plus++;
  }

  clustered.sort((a, b) => b.clusterSize - a.clusterSize || a.iso.localeCompare(b.iso));
  const clusteredIsoText = clustered.length
    ? clustered.map(c => `${c.iso}(${c.clusterSize})`).join(", ")
    : "(none)";

  return {
    uniqueBases,
    clusteredBases,
    clusteredFullItems: clusteredBases,
    histogram,
    clusteredIsoText
  };
}

function updateDevplanSnapshot(listPathArg, counts, nonuniqueBases, baseUniq, devplanRel) {
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

  const entryEndIndex = (() => {
    for (let i = jsonLineIndex + 1; i < lines.length; i++) {
      const t = lines[i].trim();
      if (/^#{3,4}\s+/.test(t)) return i;
    }
    return lines.length;
  })();

  const considered = counts.total - counts.skipped;
  const pct = considered > 0 ? ((counts.full / considered) * 100).toFixed(1) : "0.0";

  const snapshotHeaderIndex = (() => {
    for (let i = jsonLineIndex + 1; i < entryEndIndex; i++) {
      if (lines[i].trim().startsWith("- **Snapshot from last run")) return i;
    }
    return -1;
  })();

  const desiredSnapshotHeader = counts.skipped
    ? "- **Snapshot from last run (considered items only):**"
    : "- **Snapshot from last run (all list items):**";

  const snapshotHeaderLine = desiredSnapshotHeader;
  const isConsideredSnapshot = counts.skipped > 0;

  const snapshotBullets = [
    `  - \`fully wired:\` ${counts.full}${isConsideredSnapshot ? ` (${pct}%)` : ""}`,
    `  - \`missing catalog:\` ${counts.missingCatalog}`,
    `  - \`missing map:\` ${counts.missingMap}`,
    `  - \`missing both:\` ${counts.missingBoth}`,
    `  - \`unmatched:\` ${counts.unmatched}`,
    `  - \`ambiguous:\` ${counts.ambiguous}`
  ];
  if (isConsideredSnapshot || counts.skipped) {
    snapshotBullets.push(`  - \`skipped:\` ${counts.skipped}`);
  }
  snapshotBullets.push(`  - \`Nonunique Bases:\` ${nonuniqueBases}`);

  let working = lines;
  const entryEndWorking = entryEndIndex;

  if (snapshotHeaderIndex === -1) {
    const insertAt = entryEndWorking;
    const prefix = working.slice(0, insertAt);
    if (prefix.length && prefix[prefix.length - 1].trim() !== "") {
      prefix.push("");
    }

    working = [
      ...prefix,
      snapshotHeaderLine,
      ...snapshotBullets,
      "",
      ...working.slice(insertAt)
    ];
  } else {
    let blockEnd = snapshotHeaderIndex + 1;
    while (blockEnd < entryEndWorking && working[blockEnd].startsWith("  - ")) blockEnd++;
    working = [
      ...working.slice(0, snapshotHeaderIndex),
      snapshotHeaderLine,
      ...snapshotBullets,
      ...working.slice(blockEnd)
    ];
  }

  const jsonLineNeedle2 = `- **JSON file:** \`${relFromRoot}\``;
  const jsonLineIndex2 = working.findIndex(l => l.trim() === jsonLineNeedle2);
  if (jsonLineIndex2 === -1) {
    throw new Error(`Internal error: lost JSON file line '${jsonLineNeedle2}' while updating ${devplanRel}`);
  }

  const entryEndIndex2 = (() => {
    for (let i = jsonLineIndex2 + 1; i < working.length; i++) {
      const t = working[i].trim();
      if (/^#{3,4}\s+/.test(t)) return i;
    }
    return working.length;
  })();

  const baseHeaderIndex = (() => {
    for (let i = jsonLineIndex2 + 1; i < entryEndIndex2; i++) {
      if (working[i].trim().startsWith("- **Base-set uniqueness")) return i;
    }
    return -1;
  })();

  const baseHeaderLine = baseHeaderIndex === -1 ? "- **Base-set uniqueness details (full items):**" : working[baseHeaderIndex];
  const baseBullets = [
    `  - \`unique bases:\` ${baseUniq.uniqueBases}`,
    `  - \`clustered bases:\` ${baseUniq.clusteredBases}`,
    `  - \`clustered full items:\` ${baseUniq.clusteredFullItems}`,
    `  - \`cluster size histogram:\` size2=${baseUniq.histogram.size2}, size3=${baseUniq.histogram.size3}, size4+=${baseUniq.histogram.size4plus}`,
    `  - \`clustered isos:\` ${baseUniq.clusteredIsoText}`
  ];

  if (baseHeaderIndex === -1) {
    const snapHeaderIndex2 = (() => {
      for (let i = jsonLineIndex2 + 1; i < entryEndIndex2; i++) {
        if (working[i].trim().startsWith("- **Snapshot from last run")) return i;
      }
      return -1;
    })();

    let insertAt = entryEndIndex2;
    if (snapHeaderIndex2 !== -1) {
      insertAt = snapHeaderIndex2 + 1;
      while (insertAt < entryEndIndex2 && working[insertAt].startsWith("  - ")) insertAt++;
      if (insertAt < entryEndIndex2 && working[insertAt].trim() === "") insertAt++;
    }

    const prefix = working.slice(0, insertAt);
    if (prefix.length && prefix[prefix.length - 1].trim() !== "") {
      prefix.push("");
    }
    working = [
      ...prefix,
      baseHeaderLine,
      ...baseBullets,
      "",
      ...working.slice(insertAt)
    ];
  } else {
    let blockEnd = baseHeaderIndex + 1;
    while (blockEnd < entryEndIndex2 && working[blockEnd].startsWith("  - ")) blockEnd++;
    working = [
      ...working.slice(0, baseHeaderIndex),
      baseHeaderLine,
      ...baseBullets,
      ...working.slice(blockEnd)
    ];
  }

  fs.writeFileSync(devplanPath, working.join("\n"), "utf8");
  console.log("Updated devplan stats in", devplanRel, "for", relFromRoot);
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

  const { isoToClusterSize } = buildBaseClusters(mixes, map);
  const baseUniq = computeBaseSetUniquenessStats(results, isoToClusterSize);

  updateDevplanSnapshot(listPathArg, counts, nonuniqueBases, baseUniq, devplanRel);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while updating devplan snapshot:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

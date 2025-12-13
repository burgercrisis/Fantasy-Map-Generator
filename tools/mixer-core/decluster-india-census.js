"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  return JSON.parse(fs.readFileSync(full, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function sortedUnique(arr) {
  return [...new Set(arr.map(n => Number(n)).filter(n => !Number.isNaN(n)))].sort((a, b) => a - b);
}

function keyOf(bases) {
  return JSON.stringify(sortedUnique(bases));
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

function combinations(arr, k, start = 0, prefix = [], out = []) {
  if (prefix.length === k) {
    out.push(prefix.slice());
    return out;
  }
  for (let i = start; i < arr.length; i++) {
    prefix.push(arr[i]);
    combinations(arr, k, i + 1, prefix, out);
    prefix.pop();
  }
  return out;
}

function buildGlobalKeyCounts(mixes, map) {
  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const counts = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;
    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) continue;

    const k = keyOf(Array.isArray(entry.bases) ? entry.bases : []);
    if (k === "[]") continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }

  return { counts, mixByIso };
}

function main() {
  const list = readJson("tools/mixer-meta/wikipedia-languages-of-india-census.json");
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const items = Array.isArray(list) ? list : list.items;
  if (!Array.isArray(items)) throw new Error("India census list JSON missing items[]");

  const indexes = buildIndexes(mixes, map);
  const resolved = items.map(i => resolveItem(i || {}, indexes));
  const listIsos = [
    ...new Set(
      resolved
        .filter(r => r && r.status === "full" && r.iso)
        .map(r => String(r.iso))
    )
  ];

  const { counts: globalCounts, mixByIso } = buildGlobalKeyCounts(mixes, map);

  const byIso = new Map(map.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  const baseUsage = new Map();
  for (const entry of map) {
    if (!entry || !Array.isArray(entry.bases)) continue;
    for (const b of entry.bases) {
      const n = Number(b);
      if (Number.isNaN(n)) continue;
      baseUsage.set(n, (baseUsage.get(n) || 0) + 1);
    }
  }

  const seedPool = [
    183,
    201,
    202,
    204,
    205,
    253,
    257,
    199,
    200,
    29,
    62,
    63,
    61,
    65,
    86,
    87,
    94,
    181,
    374,
    375,
    376,
    388
  ].filter(b => baseUsage.has(b));

  const listBaseUnion = new Set();
  for (const iso of listIsos) {
    const entry = byIso.get(iso);
    if (!entry || !Array.isArray(entry.bases)) continue;
    for (const b of entry.bases) {
      const n = Number(b);
      if (!Number.isNaN(n)) listBaseUnion.add(n);
    }
  }

  const basePool = [...new Set([...listBaseUnion, ...seedPool])].sort((a, b) => a - b);

  const preferredExtrasByIso = {
    bodo: [86, 94, 61],
    dis: [94, 86, 61],
    rah: [94, 86, 61],

    mrg: [65, 94, 61],
    dap: [65, 94, 61],
    adi: [65, 94, 61],

    njh: [61, 86, 87],
    nsm: [61, 86, 87],
    nph: [61, 86, 87],

    kxu: [388, 375, 181],
    kuvi: [388, 375, 181],

    kurukh: [388, 375, 181],
    xis: [388, 375, 181],

    spv: [201, 183, 202]
  };

  const targets = [];
  for (const iso of listIsos) {
    const entry = byIso.get(iso);
    if (!entry) continue;
    const beforeKey = keyOf(entry.bases || []);
    const clusterSize = globalCounts.get(beforeKey) || 1;
    if (clusterSize > 1) {
      targets.push({ iso, beforeKey, clusterSize });
    }
  }

  targets.sort((a, b) => b.clusterSize - a.clusterSize || a.iso.localeCompare(b.iso));

  const reservedKeys = new Set();
  for (const iso of listIsos) {
    const entry = byIso.get(iso);
    if (!entry) continue;
    const k = keyOf(entry.bases || []);
    if ((globalCounts.get(k) || 1) === 1) reservedKeys.add(k);
  }

  let changed = 0;
  const changedIsos = [];
  const skipped = [];

  for (const t of targets) {
    const entry = byIso.get(t.iso);
    if (!entry) {
      skipped.push({ iso: t.iso, reason: "not_found" });
      continue;
    }

    const beforeBases = Array.isArray(entry.bases) ? entry.bases.slice() : [];
    const beforeKey = keyOf(beforeBases);
    if (beforeKey !== t.beforeKey) {
      skipped.push({ iso: t.iso, reason: `unexpected_before ${beforeKey} (expected ${t.beforeKey})` });
      continue;
    }

    const current = sortedUnique(beforeBases);

    const preferred = (preferredExtrasByIso[t.iso] || []).filter(b => baseUsage.has(b) && !current.includes(b));
    const fallback = basePool.filter(b => !current.includes(b) && !preferred.includes(b));
    const orderedPool = [...preferred, ...fallback];

    let found = null;

    for (let addCount = 1; addCount <= 3 && !found; addCount++) {
      const pool = orderedPool.slice(0, 24);
      const extraSets = combinations(pool, addCount);

      for (const extras of extraSets) {
        const afterBases = sortedUnique([...current, ...extras]);
        const afterKey = keyOf(afterBases);

        if (afterKey === beforeKey) continue;
        if (reservedKeys.has(afterKey)) continue;

        const existingCount = globalCounts.get(afterKey) || 0;
        if (existingCount !== 0) continue;

        found = { afterBases, afterKey };
        break;
      }
    }

    if (!found) {
      skipped.push({ iso: t.iso, reason: "no_unique_target_found" });
      continue;
    }

    entry.bases = found.afterBases;
    reservedKeys.add(found.afterKey);
    changed++;
    changedIsos.push({ iso: t.iso, name: (mixByIso.get(t.iso) || {}).name || "", from: beforeKey, to: found.afterKey });
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Decluster India census base-sets complete");
  console.log(
    JSON.stringify(
      {
        listIsos: listIsos.length,
        targets: targets.length,
        changed,
        skippedCount: skipped.length,
        skipped: skipped.slice(0, 25)
      },
      null,
      2
    )
  );

  const stillClustered = [];
  const { counts: afterCounts } = buildGlobalKeyCounts(mixes, map);
  for (const iso of listIsos) {
    const e = byIso.get(iso);
    if (!e) continue;
    const k = keyOf(e.bases || []);
    const size = afterCounts.get(k) || 1;
    if (size > 1) {
      stillClustered.push({ iso, size, bases: sortedUnique(e.bases || []) });
    }
  }

  console.log(JSON.stringify({ stillClusteredCount: stillClustered.length, stillClustered: stillClustered }, null, 2));
}

if (require.main === module) main();

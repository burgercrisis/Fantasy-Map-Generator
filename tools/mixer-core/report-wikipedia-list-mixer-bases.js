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

function buildCatalogIndexes(mixes) {
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

  return { byIso, byNameLower };
}

function resolveItemToIso(item, indexes) {
  const { byIso, byNameLower } = indexes;

  const skip = !!item.skip;
  const name = item.name ? String(item.name) : "";
  const isoRaw = item.iso != null ? String(item.iso) : "";

  if (skip) {
    return { name, iso: null, status: "skipped" };
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

  if (!byIso.has(iso)) {
    return {
      name,
      iso,
      status: "missing-catalog",
      detail: "Present in mixer map but missing from catalog"
    };
  }

  return { name, iso, status: "ok" };
}

function buildMapByIso(map) {
  const byIso = new Map();
  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    byIso.set(String(entry.iso), entry);
  }
  return byIso;
}

function buildGlobalSignatureClusters(map) {
  const clusters = new Map(); // key -> { bases, isos: Set }

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
      b => !Number.isNaN(b)
    );
    if (!uniqueBases.length) continue;

    const sortedBases = uniqueBases.slice().sort((a, b) => a - b);
    const key = sortedBases.join(",");

    let cluster = clusters.get(key);
    if (!cluster) {
      cluster = { bases: sortedBases, isos: new Set() };
      clusters.set(key, cluster);
    }
    cluster.isos.add(iso);
  }

  return clusters;
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node tools/mixer-core/report-wikipedia-list-mixer-bases.js path/to/list.json");
    console.log("");
    console.log("For each resolved list item, prints its ISO, name, mixer bases[] signature, and global cluster size.");
    process.exit(0);
  }

  const listPathArg = args[0];
  const listMeta = loadList(listPathArg);
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIndexes = buildCatalogIndexes(mixes);
  const mapByIso = buildMapByIso(map);
  const globalClusters = buildGlobalSignatureClusters(map);

  console.log(`List title: ${listMeta.title}`);
  if (listMeta.source) console.log(`Source: ${listMeta.source}`);
  console.log("");
  console.log("ISO\tStatus\tClusterSize\tBases\tName\tClusterMembers");

  for (const item of listMeta.items) {
    const resolved = resolveItemToIso(item || {}, catalogIndexes);
    const name = resolved.name || "";

    if (resolved.status !== "ok") {
      const status = resolved.status || "error";
      console.log(`${resolved.iso || "-"}\t${status}\t-\t-\t${name}`);
      continue;
    }

    const iso = resolved.iso;
    const mapEntry = mapByIso.get(iso) || null;
    const basesSource = mapEntry && Array.isArray(mapEntry.bases) ? mapEntry.bases : [];

    let signature = "";
    let clusterSize = 0;
    let clusterMembers = [];

    if (basesSource.length) {
      const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
        b => !Number.isNaN(b)
      );
      const sortedBases = uniqueBases.slice().sort((a, b) => a - b);
      signature = `[${sortedBases.join(",")}]`;
      const key = sortedBases.join(",");
      const cluster = globalClusters.get(key) || null;
      if (cluster) {
        clusterSize = cluster.isos.size;
        clusterMembers = Array.from(cluster.isos).sort();
      }
    } else {
      signature = "[]";
      clusterSize = 0;
      clusterMembers = [];
    }

    const clusterSummary = clusterMembers.length
      ? clusterMembers.join(",")
      : "";

    console.log(`${iso}\tfull\t${clusterSize}\t${signature}\t${name}\t${clusterSummary}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting Wikipedia list mixer bases:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}

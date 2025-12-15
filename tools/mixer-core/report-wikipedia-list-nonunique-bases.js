"use strict";

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
    return {title: path.basename(full), source: "", items: data};
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

  return {byIso, byNameLower, mapIsos};
}

function buildIsoHasUniqueBaseMap(mixes, map) {
  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const baseToIsos = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso) || null;
    const tags = lang && Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) continue;
    if (tags.includes("subset")) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(b => !Number.isNaN(b));
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
  const {byIso, byNameLower, mapIsos} = indexes;

  const skip = !!item.skip;
  const name = item.name ? String(item.name) : "";
  const isoRaw = item.iso != null ? String(item.iso) : "";

  if (skip) {
    return {name, iso: isoRaw || null, status: "skipped"};
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
    return {name, iso: null, status: "unmatched", detail: "No iso provided and name did not match any catalog entry"};
  }

  const inCatalog = byIso.has(iso);
  const inMap = mapIsos.has(iso);

  if (inCatalog && inMap) return {name, iso, status: "full"};
  if (!inCatalog && !inMap) {
    return {name, iso, status: "missing-both", detail: "Missing from both catalog and mixer map"};
  }
  if (!inCatalog) {
    return {name, iso, status: "missing-catalog", detail: "Present in mixer map but missing from catalog"};
  }
  return {name, iso, status: "missing-map", detail: "Present in catalog but missing from mixer map"};
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (!args.length || args.includes("--help") || args.includes("-h")) {
    return {help: true, fileArg: null, limit: 200, includeNotFull: false, base: null};
  }

  const fileArg = args.find(a => a && !a.startsWith("-")) || null;
  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.slice("--limit=".length), 10) : 200;
  const includeNotFull = args.includes("--include-not-full");
  const baseArg = args.find(a => a.startsWith("--base="));
  const base = baseArg ? Number(baseArg.slice("--base=".length)) : null;

  return {
    help: false,
    fileArg,
    limit: Number.isFinite(limit) ? limit : 200,
    includeNotFull,
    base: Number.isFinite(base) ? base : null
  };
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    console.log("Usage: node tools/mixer-core/report-wikipedia-list-nonunique-bases.js path/to/list.json [options]");
    console.log("");
    console.log("Options:");
    console.log("  --base=N              Only include NO_UNIQ_BASE rows that include base N");
    console.log("  --limit=N             Max rows to print (default: 200)");
    console.log("  --include-not-full     Include missing/unmatched/ambiguous items in output");
    process.exitCode = parsed.fileArg ? 0 : 1;
    return;
  }

  const list = loadList(parsed.fileArg);
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const indexes = buildIndexes(mixes, map);
  const isoHasUniqueBase = buildIsoHasUniqueBaseMap(mixes, map);

  const mapByIso = new Map();
  for (const row of map) {
    if (!row || !row.iso) continue;
    mapByIso.set(String(row.iso), row);
  }

  const rows = [];
  for (const item of list.items || []) {
    const res = resolveItem(item || {}, indexes);
    if (res.status === "skipped") continue;

    if (res.status !== "full") {
      if (!parsed.includeNotFull) continue;
      rows.push({
        iso: res.iso ? String(res.iso) : "",
        name: res.name || "",
        status: res.status,
        region: "",
        category: "",
        family: "",
        bases: ""
      });
      continue;
    }

    const iso = String(res.iso);
    if (isoHasUniqueBase.get(iso)) continue;

    const mix = indexes.byIso.get(iso) || null;
    const mapEntry = mapByIso.get(iso) || null;
    const bases = mapEntry && Array.isArray(mapEntry.bases) ? mapEntry.bases.slice().sort((a, b) => a - b) : [];

    if (parsed.base != null && !bases.includes(parsed.base)) continue;

    rows.push({
      iso,
      name: (mix && mix.name) || res.name || "",
      status: "NO_UNIQ_BASE",
      region: (mix && mix.region) || "",
      category: (mix && mix.category) || "",
      family: (mix && mix.family) || "",
      bases: bases.join(",")
    });
  }

  rows.sort((a, b) =>
    a.category.localeCompare(b.category) || a.family.localeCompare(b.family) || a.iso.localeCompare(b.iso)
  );

  console.log("=== Wikipedia list items lacking a globally-unique base index ===");
  console.log("List:", list.title || "(no title)");
  if (list.source) console.log("Source:", list.source);
  console.log("");

  const toPrint = rows.slice(0, Math.max(0, parsed.limit));
  for (const r of toPrint) {
    console.log(`${r.iso} | ${r.name} | ${r.status} | ${r.region} | ${r.category} | ${r.family} | bases=[${r.bases}]`);
  }

  console.log("");
  console.log("Total lacking unique base (or non-full if --include-not-full):", rows.length);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

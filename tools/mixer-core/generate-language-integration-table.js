"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {root, readText, readJson, writeText, writeJson, toTsv} = require("./_report-utils");

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    includeUnregisteredMeta: args.includes("--include-unregistered-meta")
  };
}

function discoverAllWikiMetaJsonPaths() {
  const dirRel = "tools/mixer-meta";
  const dirFull = path.join(root, dirRel);
  if (!fs.existsSync(dirFull)) return [];

  const names = fs.readdirSync(dirFull);
  const out = [];

  for (const name of names) {
    if (!/^wikipedia.*\.json$/i.test(name)) continue;
    out.push(`${dirRel}/${name}`);
  }

  return out.sort((a, b) => a.localeCompare(b));
}

function normalizeLabel(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensFromLabel(input) {
  const t = normalizeLabel(input);
  if (!t) return [];
  return t.split(/\s+/g).filter(Boolean);
}

function listSearchText(listMeta, relPath) {
  return normalizeLabel([listMeta.title, listMeta.source, relPath].filter(Boolean).join(" "));
}

function parseWikiListPathsFromDevplan(devplanRelPath) {
  const src = readText(devplanRelPath);
  const re = /- \*\*JSON file:\*\* `([^`]+\.json)`/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    out.push(m[1]);
  }
  return Array.from(new Set(out));
}

function readUtf8Clean(fullPath) {
  const buf = fs.readFileSync(fullPath);
  return buf
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "");
}

function loadWikiList(fileArg) {
  const full = path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg);
  let data;
  try {
    data = JSON.parse(readUtf8Clean(full));
  } catch (err) {
    console.warn(
      "Skipping malformed wiki list JSON:",
      fileArg,
      "-",
      err && err.message ? err.message : err
    );
    return null;
  }

  if (Array.isArray(data)) {
    return {title: path.basename(full), source: "", items: data};
  }

  if (!data || !Array.isArray(data.items)) {
    console.warn("Skipping wiki list JSON with unexpected structure (missing items[]):", fileArg);
    return null;
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

  for (const mix of mixes) {
    if (!mix || !mix.iso) continue;
    const iso = String(mix.iso);
    if (!byIso.has(iso)) byIso.set(iso, mix);

    const name = mix.name ? String(mix.name).trim() : "";
    if (!name) continue;

    const key = name.toLowerCase();
    const arr = byNameLower.get(key) || [];
    arr.push(mix);
    byNameLower.set(key, arr);
  }

  return {byIso, byNameLower};
}

function loadValidBaseIndices() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const indices = new Set();
  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const idx = Number(m[2]);
      if (!Number.isNaN(idx)) indices.add(idx);
    }
  }

  return indices;
}

function loadDefaultNameBases() {
  const sandbox = {window: {}};
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; expected modules/namebases-all.js to set window.defaultNameBases");
  }

  return bases;
}

function buildBaseIndexMap(bases) {
  const map = new Map();
  for (const base of bases) {
    if (!base || typeof base.i !== "number") continue;
    if (!map.has(base.i)) map.set(base.i, base);
  }
  return map;
}

const CLICKS = "\u001b\u001b\u001b\u001b";

function analyzeCharProfile(text) {
  const src = String(text || "");
  let asciiOnly = true;
  let hasExtended = false;
  let hasClicks = false;
  let hasApostrophe = false;
  let hasHyphen = false;
  let hasSpace = false;
  let hasCombiningMarks = false;
  let hasNonLatin = false;

  const nonLatinRe = /[\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0E00-\u0E7F\u0E80-\u0EFF\u1000-\u109F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF]/;

  for (const ch of src) {
    if (ch === ",") continue;

    const code = ch.charCodeAt(0);
    if (code > 127) {
      asciiOnly = false;
      hasExtended = true;
    }

    if (CLICKS.includes(ch)) hasClicks = true;
    if (ch === "'") hasApostrophe = true;
    if (ch === "-") hasHyphen = true;
    if (ch === " ") hasSpace = true;

    if (code >= 0x0300 && code <= 0x036f) hasCombiningMarks = true;
    if (nonLatinRe.test(ch)) hasNonLatin = true;
  }

  return {
    asciiOnly,
    hasExtended,
    hasClicks,
    hasApostrophe,
    hasHyphen,
    hasSpace,
    hasCombiningMarks,
    hasNonLatin
  };
}

function buildAutoTagsForIso(iso, mix, validBases, baseByIndex) {
  const tags = new Set();
  if (!validBases.length) return [];

  let combined = "";
  for (const idx of validBases) {
    const base = baseByIndex.get(idx);
    if (!base || !base.b) continue;
    combined += combined ? "," + base.b : String(base.b);
  }

  const profile = analyzeCharProfile(combined);

  if (profile.hasClicks) tags.add("clicks");
  if (profile.hasApostrophe) tags.add("apostrophe");
  if (profile.hasHyphen) tags.add("hyphen");
  if (profile.hasSpace) tags.add("space");
  if (profile.hasCombiningMarks) tags.add("combining_marks");

  if (profile.hasNonLatin) {
    tags.add("non_latin");
  } else if (profile.hasExtended) {
    tags.add("diacritics");
  }

  const name = mix && mix.name ? String(mix.name).toLowerCase() : "";
  const isoLower = String(iso || "").toLowerCase();
  if (name.includes("whistled") || isoLower.includes("whistled")) tags.add("whistled");

  if (profile.hasClicks && (profile.hasExtended || profile.hasCombiningMarks)) tags.add("clicktones");

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
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

function resolveWikiItemToIso(item, indexes) {
  const {byIso, byNameLower} = indexes;

  const skip = !!item.skip;
  const name = item && item.name != null ? String(item.name) : "";
  const isoRaw = item && item.iso != null ? String(item.iso) : "";

  if (skip) {
    return {name, iso: isoRaw || null, status: "skipped"};
  }

  if (isoRaw) {
    return {name, iso: isoRaw, status: byIso.has(isoRaw) ? "direct" : "direct"};
  }

  if (!name) {
    return {name, iso: null, status: "unmatched", detail: "Missing name"};
  }

  const candidates = byNameLower.get(name.toLowerCase()) || [];
  if (candidates.length === 1) {
    return {name, iso: String(candidates[0].iso), status: "direct"};
  }

  if (candidates.length > 1) {
    return {
      name,
      iso: null,
      status: "ambiguous",
      detail: `Name matches ${candidates.length} catalog entries; specify 'iso' in the list JSON`
    };
  }

  return {name, iso: null, status: "unmatched", detail: "No iso provided and name did not match any catalog entry"};
}

function inferWikiListsForMix(mix, lists) {
  if (!mix) return {paths: [], reasons: []};

  const reasons = [];
  const inferredPaths = new Set();

  const props = [
    {key: "category", value: mix.category},
    {key: "family", value: mix.family},
    {key: "region", value: mix.region}
  ];

  for (const {relPath, meta} of lists) {
    const hayTokens = new Set(tokensFromLabel(listSearchText(meta, relPath)));

    for (const {key, value} of props) {
      if (!value) continue;
      const propTokens = tokensFromLabel(value);
      if (!propTokens.length) continue;

      const ok = propTokens.every(t => hayTokens.has(t));
      if (!ok) continue;

      inferredPaths.add(relPath);
      reasons.push(`${key}:${value}`);
    }
  }

  return {paths: Array.from(inferredPaths).sort(), reasons: Array.from(new Set(reasons)).sort()};
}

function main() {
  const opts = parseArgs(process.argv);

  const mixes = readJson("config/language-mixes.json");
  const mixerMap = readJson("config/language-mixer-map.json");

  const {byIso: catalogByIso, byNameLower} = buildCatalogIndexes(mixes);
  const mapByIso = new Map();
  for (const entry of mixerMap) {
    if (!entry || !entry.iso) continue;
    if (!mapByIso.has(entry.iso)) mapByIso.set(entry.iso, entry);
  }

  const devplanWikiPaths = parseWikiListPathsFromDevplan("DEVplans/Languages-Status.md");
  const wikiLists = [];
  for (const relPath of devplanWikiPaths) {
    const full = path.join(root, relPath);
    if (!fs.existsSync(full)) {
      console.warn("Missing wiki list file:", relPath);
      continue;
    }
    const meta = loadWikiList(relPath);
    if (!meta) continue;
    wikiLists.push({relPath, meta});
  }

  const wikiOnlyPaths = discoverAllWikiMetaJsonPaths();
  const wikiOnlyLists = [];
  for (const relPath of wikiOnlyPaths) {
    const full = path.join(root, relPath);
    if (!fs.existsSync(full)) continue;
    const meta = loadWikiList(relPath);
    if (!meta) continue;
    wikiOnlyLists.push({relPath, meta});
  }

  const validBaseIndices = loadValidBaseIndices();
  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const isoHasUniqueBase = buildIsoHasUniqueBaseMap(mixes, mixerMap);

  const wikiDirectByIso = new Map();
  const unregisteredWikiMeta = [];
  const wikiOnlyRows = [];

  const indexes = {byIso: catalogByIso, byNameLower};

  for (const {relPath, meta} of wikiOnlyLists) {
    for (const item of meta.items || []) {
      const resolved = resolveWikiItemToIso(item, indexes);
      if (resolved.status === "skipped") continue;

      if (!resolved.iso) {
        if (opts.includeUnregisteredMeta) {
          unregisteredWikiMeta.push({
            list: relPath,
            list_title: meta.title,
            name: resolved.name,
            status: resolved.status,
            detail: resolved.detail || ""
          });
        }

        wikiOnlyRows.push({
          list: relPath,
          list_title: meta.title,
          list_source: meta.source,
          name: resolved.name,
          iso: "",
          status: resolved.status,
          detail: resolved.detail || "",
          candidates: "",
          in_catalog: false,
          in_mixer_map: false
        });
        continue;
      }

      const iso = String(resolved.iso);

      const inCatalog = catalogByIso.has(iso);
      const inMap = mapByIso.has(iso);

      // Wikipedia item refers to an ISO we don't have in the app catalog.
      // Keep it in a dedicated "wiki-only" output for backlogging.
      if (!inCatalog) {
        wikiOnlyRows.push({
          list: relPath,
          list_title: meta.title,
          list_source: meta.source,
          name: resolved.name,
          iso,
          status: "missing-catalog",
          detail: inMap ? "Present in mixer map but missing from catalog" : "Missing from both catalog and mixer map",
          candidates: "",
          in_catalog: false,
          in_mixer_map: inMap
        });
        continue;
      }
    }
  }

  for (const {relPath, meta} of wikiLists) {
    for (const item of meta.items || []) {
      const resolved = resolveWikiItemToIso(item, indexes);
      if (resolved.status === "skipped") continue;
      if (!resolved.iso) continue;

      const iso = String(resolved.iso);
      if (!catalogByIso.has(iso)) continue;

      let arr = wikiDirectByIso.get(iso);
      if (!arr) {
        arr = [];
        wikiDirectByIso.set(iso, arr);
      }
      arr.push({
        relPath,
        title: meta.title,
        source: meta.source,
        name: resolved.name
      });
    }
  }

  const allIsos = new Set();
  for (const iso of catalogByIso.keys()) allIsos.add(iso);
  for (const iso of mapByIso.keys()) allIsos.add(iso);
  for (const iso of wikiDirectByIso.keys()) allIsos.add(iso);

  const isoList = Array.from(allIsos).sort((a, b) => a.localeCompare(b));

  const rows = [];

  for (const iso of isoList) {
    const mix = catalogByIso.get(iso) || null;
    const mapEntry = mapByIso.get(iso) || null;

    const inCatalog = !!mix;
    const inMap = !!mapEntry;

    const basesSource = mapEntry && Array.isArray(mapEntry.bases) ? mapEntry.bases : [];
    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(b => !Number.isNaN(b));
    const validBases = uniqueBases.filter(b => validBaseIndices.has(b));
    const invalidBases = uniqueBases.filter(b => !validBaseIndices.has(b));

    const isFamilyMacro = !!(mix && Array.isArray(mix.tags) && mix.tags.includes("family"));

    const baseSetKey = validBases.slice().sort((a, b) => a - b).join(",");

    const direct = wikiDirectByIso.get(iso) || [];
    const directPaths = Array.from(new Set(direct.map(d => d.relPath))).sort();

    const inferred = inferWikiListsForMix(mix, wikiLists);
    const inferredPaths = inferred.paths.filter(p => !directPaths.includes(p));

    const allWikiPaths = Array.from(new Set([...directPaths, ...inferredPaths])).sort();

    const wikiTitles = [];
    const wikiSources = [];
    for (const p of allWikiPaths) {
      const found = wikiLists.find(w => w.relPath === p);
      if (!found) continue;
      wikiTitles.push(found.meta.title);
      if (found.meta.source) wikiSources.push(found.meta.source);
    }

    const wikiNames = Array.from(new Set(direct.map(d => d.name).filter(Boolean))).sort();

    const tagsCatalog = mix && Array.isArray(mix.tags) ? mix.tags.map(t => String(t)) : [];
    const tagsAuto = buildAutoTagsForIso(iso, mix, validBases, baseByIndex);
    const tagsAll = Array.from(new Set([...tagsCatalog, ...tagsAuto])).sort((a, b) => a.localeCompare(b));

    const mixerReady =
      inCatalog &&
      inMap &&
      !isFamilyMacro &&
      validBases.length > 0 &&
      invalidBases.length === 0;

    rows.push({
      iso,
      name: mix && mix.name ? String(mix.name) : "",
      region: mix && mix.region ? String(mix.region) : "",
      category: mix && mix.category ? String(mix.category) : "",
      family: mix && mix.family ? String(mix.family) : "",
      tags: tagsAll.join(";"),
      tags_catalog: tagsCatalog.join(";"),
      tags_auto: tagsAuto.join(";"),
      has_catalog_wikipedia_url: !!(mix && mix.wikipedia),
      in_catalog: inCatalog,
      in_mixer_map: inMap,
      mixer_ready: mixerReady,
      bases: validBases.slice().sort((a, b) => a - b).join(","),
      base_count: validBases.length,
      has_invalid_bases: invalidBases.length > 0,
      invalid_bases: invalidBases.slice().sort((a, b) => a - b).join(","),
      has_unique_base: !!isoHasUniqueBase.get(iso),
      base_set_key: baseSetKey,
      base_set_cluster_size: 0,
      wiki_lists: allWikiPaths.join(";"),
      wiki_lists_direct: directPaths.join(";"),
      wiki_lists_inferred: inferredPaths.join(";"),
      wiki_inferred_by: inferred.reasons.join(";"),
      wiki_titles: wikiTitles.join(";"),
      wiki_sources: wikiSources.join(";"),
      wiki_names: wikiNames.join(";"),
      wiki_items_count: direct.length
    });
  }

  const clusterCounts = new Map();
  for (const r of rows) {
    if (!r.base_set_key) continue;

    const mix = catalogByIso.get(r.iso) || null;
    const isFamilyMacro = !!(mix && Array.isArray(mix.tags) && mix.tags.includes("family"));
    if (isFamilyMacro) continue;
    const isSubsetAlias = !!(mix && Array.isArray(mix.tags) && mix.tags.includes("subset"));
    if (isSubsetAlias) continue;

    clusterCounts.set(r.base_set_key, (clusterCounts.get(r.base_set_key) || 0) + 1);
  }

  for (const r of rows) {
    r.base_set_cluster_size = r.base_set_key ? clusterCounts.get(r.base_set_key) || 0 : 0;
  }

  const columns = [
    "iso",
    "name",
    "region",
    "category",
    "family",
    "tags",
    "tags_catalog",
    "tags_auto",
    "has_catalog_wikipedia_url",
    "in_catalog",
    "in_mixer_map",
    "mixer_ready",
    "bases",
    "base_count",
    "has_invalid_bases",
    "invalid_bases",
    "has_unique_base",
    "base_set_key",
    "base_set_cluster_size",
    "wiki_lists",
    "wiki_lists_direct",
    "wiki_lists_inferred",
    "wiki_inferred_by",
    "wiki_titles",
    "wiki_sources",
    "wiki_names",
    "wiki_items_count"
  ];

  writeText("tools/mixer-diagnostics/language-integration-table.tsv", toTsv(rows, columns));
  writeJson("tools/mixer-diagnostics/language-integration-table.json", {rows, columns, unregisteredWikiMeta});

  const wikiOnlyColumns = [
    "list",
    "list_title",
    "list_source",
    "name",
    "iso",
    "status",
    "detail",
    "candidates",
    "in_catalog",
    "in_mixer_map"
  ];

  writeText("tools/mixer-diagnostics/wiki-only-language-items.tsv", toTsv(wikiOnlyRows, wikiOnlyColumns));
  writeJson("tools/mixer-diagnostics/wiki-only-language-items.json", {rows: wikiOnlyRows, columns: wikiOnlyColumns});
}

main();

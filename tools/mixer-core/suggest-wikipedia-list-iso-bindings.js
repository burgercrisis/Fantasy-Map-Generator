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
  if (!fileArg) throw new Error("Expected a path to a JSON file describing a Wikipedia language list");
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

function normalizeName(value) {
  const s = String(value || "");
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’ʻʼ]/g, "'")
    .replace(/&/g, " and ")
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildCatalogIndex(mixes) {
  const byNormName = new Map();
  const byNameLower = new Map();
  const catalog = [];

  for (const m of mixes) {
    if (!m || !m.iso || !m.name) continue;
    const iso = String(m.iso);
    const name = String(m.name);

    const exactKey = name.toLowerCase();
    if (exactKey) {
      const exactArr = byNameLower.get(exactKey) || [];
      exactArr.push({iso, name});
      byNameLower.set(exactKey, exactArr);
    }

    const k = normalizeName(m.name);
    if (!k) continue;
    const arr = byNormName.get(k) || [];
    arr.push({iso, name});
    byNormName.set(k, arr);
    catalog.push({iso, name, norm: k, tokens: new Set(k.split(" ").filter(Boolean))});
  }

  return {byNormName, byNameLower, catalog};
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter++;
  }
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function tokenSimilarity(a, b) {
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter++;
  }
  const minSize = Math.min(a.size, b.size);
  const overlap = minSize ? inter / minSize : 0;
  const jac = jaccard(a, b);
  return Math.max(jac, overlap);
}

function main() {
  const argv = process.argv.slice(2);
  const listPath = argv[0];
  if (!listPath || listPath.startsWith("--")) {
    console.error(
      "Usage: node tools/mixer-core/suggest-wikipedia-list-iso-bindings.js <LIST_JSON_PATH> [--limit=N] [--json] [--only-unresolved] [--fuzzy] [--fuzzy-min=0.75] [--fuzzy-margin=0.10] [--require-map]"
    );
    process.exitCode = 1;
    return;
  }

  const limitArg = argv.find(a => a.startsWith("--limit="));
  const limit = limitArg ? Math.max(0, Number(limitArg.slice("--limit=".length)) || 0) : 50;
  const asJson = argv.includes("--json");
  const onlyUnresolved = argv.includes("--only-unresolved");
  const fuzzy = argv.includes("--fuzzy");
  const fuzzyMinArg = argv.find(a => a.startsWith("--fuzzy-min="));
  const fuzzyMin = fuzzyMinArg
    ? Math.max(0, Math.min(1, Number(fuzzyMinArg.slice("--fuzzy-min=".length)) || 0))
    : 0.75;
  const fuzzyMarginArg = argv.find(a => a.startsWith("--fuzzy-margin="));
  const fuzzyMargin = fuzzyMarginArg
    ? Math.max(0, Math.min(1, Number(fuzzyMarginArg.slice("--fuzzy-margin=".length)) || 0))
    : 0.1;
  const requireMap = argv.includes("--require-map");

  const list = loadList(listPath);
  const mixes = readJson("config/language-mixes.json");
  const mapIsos = requireMap || fuzzy ? new Set(readJson("config/language-mixer-map.json").map(e => String(e.iso))) : null;

  const {byNormName, byNameLower, catalog} = buildCatalogIndex(mixes);

  const existingIsos = new Set();
  for (const it of list.items) {
    if (!it || it.skip) continue;
    if (!it.iso) continue;
    existingIsos.add(String(it.iso));
  }

  const suggestions = [];
  const ambiguous = [];
  const fuzzySuggestions = [];

  for (const it of list.items) {
    if (!it || it.skip) continue;
    if (it.iso) continue;
    if (!it.name) continue;

    if (onlyUnresolved) {
      const exactCandidates = byNameLower.get(String(it.name).toLowerCase()) || [];
      if (exactCandidates.length === 1) continue;
    }

    const k = normalizeName(it.name);
    if (!k) continue;

    const candidates = byNormName.get(k) || [];
    if (candidates.length === 1) {
      if (existingIsos.has(candidates[0].iso)) continue;
      if (mapIsos && !mapIsos.has(candidates[0].iso)) continue;
      suggestions.push({name: String(it.name), iso: candidates[0].iso, catalogName: candidates[0].name});
    } else if (candidates.length > 1) {
      ambiguous.push({name: String(it.name), candidates: candidates.map(c => ({iso: c.iso, name: c.name}))});
    } else if (fuzzy) {
      const tokens = new Set(k.split(" ").filter(Boolean));
      let best = null;
      let bestScore = 0;
      let secondScore = 0;

      for (const c of catalog) {
        if (mapIsos && !mapIsos.has(c.iso)) continue;
        const score = tokenSimilarity(tokens, c.tokens);
        if (score > bestScore) {
          secondScore = bestScore;
          bestScore = score;
          best = c;
        } else if (score > secondScore) {
          secondScore = score;
        }
      }

      if (best && bestScore >= fuzzyMin && bestScore - secondScore >= fuzzyMargin && !existingIsos.has(best.iso)) {
        fuzzySuggestions.push({
          name: String(it.name),
          iso: best.iso,
          catalogName: best.name,
          score: Number(bestScore.toFixed(3))
        });
      }
    }
  }

  if (asJson) {
    const out = limit ? suggestions.slice(0, limit) : suggestions;
    const outFuzzy = limit ? fuzzySuggestions.slice(0, limit) : fuzzySuggestions;
    process.stdout.write(JSON.stringify({title: list.title, suggestions: out, fuzzy: outFuzzy, ambiguous}, null, 2) + "\n");
    return;
  }

  console.log(`List: ${list.title}`);
  if (list.source) console.log(`Source: ${list.source}`);
  console.log("");
  const label = onlyUnresolved ? "High-confidence ISO suggestions for unresolved items" : "High-confidence ISO suggestions";
  console.log(`${label} (unique normalized name match): ${suggestions.length}`);

  const out = limit ? suggestions.slice(0, limit) : suggestions;
  for (const s of out) {
    console.log(`- ${s.name} => ${s.iso} (catalog: ${s.catalogName})`);
  }

  if (limit && suggestions.length > limit) {
    console.log("");
    console.log(`(truncated; re-run with --limit=0 to show all)`);
  }

  if (ambiguous.length) {
    console.log("");
    console.log(`Ambiguous normalized matches (need manual iso in list JSON): ${ambiguous.length}`);
  }

  if (fuzzy) {
    console.log("");
    console.log(`Fuzzy suggestions (token Jaccard >= ${fuzzyMin}, margin >= ${fuzzyMargin}): ${fuzzySuggestions.length}`);
    const outFuzzy = limit ? fuzzySuggestions.slice(0, limit) : fuzzySuggestions;
    for (const s of outFuzzy) {
      console.log(`- ${s.name} => ${s.iso} (catalog: ${s.catalogName}, score=${s.score})`);
    }
  }
}

main();

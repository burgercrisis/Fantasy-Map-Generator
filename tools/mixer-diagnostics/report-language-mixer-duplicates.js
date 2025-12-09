"use strict";

// Scan the Language Mixer catalog for potentially non-unique languages.
//
// This is a **read-only** helper:
//   - Reads:  config/language-mixes.json
//   - Writes: nothing
//
// It looks for:
//   - Duplicate ISO codes
//   - Clusters of entries that normalize to the same language name,
//     excluding groups where **all** members are clearly higher-level
//     families / clusters (e.g. "X languages", "X family").
//
// Usage (from project root):
//   node tools/report-language-mixer-duplicates.js
//
// The output is a console report to guide manual cleanup.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function isHigherLevel(meta) {
  if (!meta) return false;

  if (Array.isArray(meta.tags) && meta.tags.includes("family")) return true;

  const iso = String(meta.iso || "").toLowerCase();
  if (iso.endsWith("-family")) return true;

  const name = String(meta.name || "").toLowerCase();
  const higherTokens = [" languages", " language family", " family", " group", " cluster", " branch", " dialects"];
  if (higherTokens.some(t => name.includes(t))) return true;

  return false;
}

function normalizeName(name) {
  if (!name) return "";
  let s = String(name).toLowerCase();

  // Drop parenthetical qualifiers like "(Chad)", "(Congo)", etc. These
  // are still useful to *inspect* in the report, but we normalize without
  // them to detect overlaps.
  s = s.replace(/\s*\([^)]*\)/g, "");

  // Normalize dashes and whitespace.
  s = s.replace(/[-–—]+/g, "-");

  // Drop very generic trailing descriptors.
  s = s.replace(/\b(language|languages|dialect|dialects|group|cluster)\b/g, "");

  // Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

function summarizeIsoDuplicates(mixes) {
  const byIso = new Map();
  const dupIsos = new Map();

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    const iso = String(lang.iso);
    if (!byIso.has(iso)) {
      byIso.set(iso, lang);
    } else {
      if (!dupIsos.has(iso)) dupIsos.set(iso, [byIso.get(iso)]);
      dupIsos.get(iso).push(lang);
    }
  }

  console.log("=== ISO duplicates ===");
  if (!dupIsos.size) {
    console.log("No duplicate ISO codes found.\n");
    return;
  }

  for (const [iso, entries] of dupIsos.entries()) {
    console.log(`ISO: ${iso} (count=${entries.length})`);
    for (const e of entries) {
      console.log(
        `  - name=${e.name || ""}, region=${e.region || ""}, family=${e.family || ""}, category=${
          e.category || ""
        }, tags=${Array.isArray(e.tags) ? e.tags.join(",") : ""}`
      );
    }
    console.log("");
  }
  console.log("");
}

function summarizeNameClusters(mixes) {
  const clusters = new Map();

  for (const lang of mixes) {
    if (!lang) continue;
    const keySource = lang.name || lang.iso;
    if (!keySource) continue;

    const norm = normalizeName(keySource);
    if (!norm) continue;

    if (!clusters.has(norm)) clusters.set(norm, []);
    clusters.get(norm).push(lang);
  }

  const interesting = [];

  for (const [norm, entries] of clusters.entries()) {
    if (entries.length < 2) continue;

    const hasNonHigherLevel = entries.some(e => !isHigherLevel(e));
    const allHigherLevel = entries.every(e => isHigherLevel(e));

    // Skip clusters where *all* entries are clearly higher-level pseudo-languages.
    if (allHigherLevel) continue;

    // Focus on clusters that actually have at least one concrete language.
    if (!hasNonHigherLevel) continue;

    interesting.push({norm, entries});
  }

  // Sort clusters by key for stable output.
  interesting.sort((a, b) => a.norm.localeCompare(b.norm));

  console.log("=== Normalized-name clusters (excluding purely higher-level families) ===");
  if (!interesting.length) {
    console.log("No overlapping normalized-name clusters found.\n");
    return;
  }

  for (const {norm, entries} of interesting) {
    console.log(`Key: "${norm}" (entries=${entries.length})`);
    for (const e of entries) {
      const hl = isHigherLevel(e) ? "[HIGHER]" : "       ";
      console.log(
        `  ${hl} iso=${e.iso || ""}, name=${e.name || ""}, region=${e.region || ""}, family=${
          e.family || ""
        }, category=${e.category || ""}, tags=${Array.isArray(e.tags) ? e.tags.join(",") : ""}`
      );
    }
    console.log("");
  }
  console.log("");
}

function main() {
  const mixes = readJson(path.join("config", "language-mixes.json"));

  console.log("Total catalog entries:", mixes.length);
  console.log("");

  summarizeIsoDuplicates(mixes);
  summarizeNameClusters(mixes);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting language mixer duplicates:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}

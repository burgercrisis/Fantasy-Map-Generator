"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

const list = readJson("tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json");
const catalog = readJson("config/language-mixes.json");
const map = readJson("config/language-mixer-map.json");

function resolveIso(item) {
  if (item.iso) return item.iso;
  const matches = catalog.filter(e => e.name === item.name);
  if (matches.length === 1) return matches[0].iso;
  // Ambiguous or unmatched: report and skip for uniqueness purposes
  console.log(`WARN: could not uniquely resolve ISO for "${item.name}", candidates: ${matches.map(e => e.iso).join(", ")}`);
  return null;
}

const items = Array.isArray(list.items) ? list.items : list;
const isoSet = new Set();

for (const it of items) {
  const iso = resolveIso(it);
  if (iso) isoSet.add(iso);
}

function baseKey(bases) {
  return (bases || []).slice().sort((a, b) => a - b).join(",");
}

const global = new Map();
for (const entry of map) {
  const key = baseKey(entry.bases);
  if (!global.has(key)) global.set(key, []);
  global.get(key).push(entry.iso);
}

const issues = [];
for (const entry of map) {
  if (!isoSet.has(entry.iso)) continue;
  const key = baseKey(entry.bases);
  const cluster = global.get(key) || [];
  if (cluster.length > 1) {
    issues.push({iso: entry.iso, bases: key, cluster: cluster.slice()});
  }
}

if (!issues.length) {
  console.log("All institutional languages have globally unique bases[] sets.");
} else {
  console.log("Institutional languages with non-unique bases[] (cluster includes other ISOs using the same sorted bases set):\n");
  for (const issue of issues) {
    const others = issue.cluster.filter(iso => iso !== issue.iso);
    console.log(`- ${issue.iso}  bases=[${issue.bases}]  also used by: ${others.join(", ")}`);
  }
}

const fs = require("node:fs");
const path = require("node:path");
const L = require("./namebase-lib");

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const all = L.loadAll().flatMap(f => f.entries);
const map = readBracketArray("config/language-mixer-map.js");
const catalog = readBracketArray("config/language-mixes-all.js");
const isoName = new Map();
for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const byIndex = new Map();
for (const e of all) {
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}
const mapByIndex = new Map();
for (const row of map) for (const b of row.bases || []) {
  if (!mapByIndex.has(b)) mapByIndex.set(b, []);
  mapByIndex.get(b).push(row);
}

const targets = [857, 1705, 202381, 202384, 202388, 202393, 202547, 202549, 202550, 202551];
for (const i of targets) {
  const claimants = byIndex.get(i) || [];
  const rows = mapByIndex.get(i) || [];
  console.log(`\ni=${i}  rows=${rows.length}  isos=${rows.map(r => r.iso).join(",") || "(none)"}`);
  for (const row of rows) {
    console.log(`   catalog name for ${row.iso}: ${JSON.stringify(isoName.get(row.iso))} -> norm "${norm(isoName.get(row.iso))}"`);
  }
  for (const c of claimants) {
    console.log(`   claimant ${c.__continent}:${c.name}  norm "${norm(c.name)}"  seeds=${L.seedCount(c)}`);
  }
}

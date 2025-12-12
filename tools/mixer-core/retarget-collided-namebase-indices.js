"use strict";

// Retarget mappings that relied on historically-collided namebase indices.
// This script is intentionally conservative: it only rewrites the specific
// collided indices where we now have definitive, collision-free targets.

const fs = require("fs");
const path = require("path");

const root = __dirname ? path.resolve(__dirname, "..", "..") : process.cwd();

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  const raw = fs.readFileSync(full, "utf8");
  const clean = raw.replace(/^\uFEFF/, "");
  return JSON.parse(clean);
}

function writeJson(relativePath, data) {
  const full = path.join(root, relativePath);
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(full, json, "utf8");
}

function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const v of arr) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const metaByIso = new Map(mixes.filter(m => m && m.iso).map(m => [String(m.iso), m]));

  // New collision-free indices (post-fix):
  // - Zhuang: 530
  // - Shan: 532
  // - Kam-Sui: 533
  // - Tiwi: 534
  const NEW = {
    zhuang: 530,
    shan: 532,
    kamSui: 533,
    tiwi: 534
  };

  const changes = [];

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    if (!Array.isArray(entry.bases) || !entry.bases.length) continue;

    const iso = String(entry.iso);
    const meta = metaByIso.get(iso) || {};
    const category = meta.category || "";
    const family = meta.family || "";

    let bases = entry.bases.slice();
    let changed = false;

    // Fix base 399 collision (Tok Pisin vs Shan). Also fix Tiwi which currently used 399.
    if (bases.includes(399)) {
      bases = bases.map(b => {
        if (b !== 399) return b;
        if (iso === "shan") return NEW.shan;
        if (iso === "tiwi") return NEW.tiwi;
        // Default: keep Tok Pisin (real base index 399)
        return 399;
      });
      changed = true;
    }

    // Fix base 316 collision (South Slavic BCS vs Kam-Sui fantasy).
    // Keep 316 for Slavic category; migrate Tai-Kadai away.
    if (bases.includes(316)) {
      bases = bases.map(b => {
        if (b !== 316) return b;
        if (String(category).toLowerCase() === "slavic") return 316;
        if (String(family).toLowerCase() === "kam-sui") return NEW.kamSui;
        if (String(category).toLowerCase() === "tai-kadai") return NEW.zhuang;
        // Unknown: do not rewrite
        return 316;
      });
      changed = true;
    }

    // Fix base 314 collision (Lechitic vs Zhuang fantasy historically).
    // Only migrate Tai-Kadai away from 314.
    if (bases.includes(314)) {
      if (String(category).toLowerCase() === "tai-kadai") {
        bases = bases.map(b => (b === 314 ? NEW.zhuang : b));
        changed = true;
      }
    }

    // Sanity: if a Kam-Sui family language does not include the Kam-Sui base after the above,
    // inject it to ensure the family anchor is present.
    if (String(family).toLowerCase() === "kam-sui") {
      if (!bases.includes(NEW.kamSui)) {
        bases = bases.concat([NEW.kamSui]);
        changed = true;
      }
    }

    bases = uniq(bases);

    if (changed) {
      const before = entry.bases;
      entry.bases = bases;
      if (JSON.stringify(before) !== JSON.stringify(bases)) {
        changes.push({iso, before, after: bases});
      }
    }
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Updated mappings:", changes.length);
  if (changes.length) {
    for (const c of changes.slice(0, 50)) {
      console.log(` - ${c.iso}: ${JSON.stringify(c.before)} -> ${JSON.stringify(c.after)}`);
    }
    if (changes.length > 50) console.log(`... and ${changes.length - 50} more`);
  }
}

if (require.main === module) main();

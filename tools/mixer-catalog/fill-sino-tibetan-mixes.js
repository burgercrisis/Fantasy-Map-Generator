"use strict";

// Ensure that all Sino-Tibetan iso codes present in config/language-mixer-map.json
// have corresponding catalog entries in config/language-mixes.json, with
// category "Sino-Tibetan" so they show under the Sino-Tibetan filter in
// the Language Mixer UI.
//
// Run from project root:
//   node tools/fill-sino-tibetan-mixes.js
// Then regenerate the JS bundle:
//   node tools/generate-language-mixer.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function titleFromIso(iso) {
  return iso
    .split("-")
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
    .replace(/\s+/g, " ");
}

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));

  const proto = map.find(e => e.iso === "proto-sino-tibetan");
  if (!proto || !Array.isArray(proto.bases)) {
    console.error("Cannot find proto-sino-tibetan in language-mixer-map.json");
    process.exit(1);
  }

  const stBases = new Set(proto.bases);
  const stIsos = new Set();

  // Any entry whose bases are all within the proto-sino-tibetan base set is
  // considered Sino-Tibetan for catalog purposes.
  for (const entry of map) {
    if (!Array.isArray(entry.bases) || !entry.bases.length) continue;
    let allIn = true;
    for (const b of entry.bases) {
      if (!stBases.has(b)) {
        allIn = false;
        break;
      }
    }
    if (allIn) stIsos.add(entry.iso);
  }

  const DEFAULT_REGION = "Sino-Tibetan region";
  let added = 0;
  let updated = 0;

  for (const iso of stIsos) {
    const isProto = iso.startsWith("proto-");
    const existing = mixesByIso.get(iso);

    if (existing) {
      if (existing.category !== "Sino-Tibetan") {
        existing.category = "Sino-Tibetan";
        updated++;
      }
      if (!existing.region) existing.region = DEFAULT_REGION;
      if (isProto) {
        const tags = Array.isArray(existing.tags) ? existing.tags : [];
        if (!tags.includes("extinct")) tags.push("extinct");
        if (!tags.includes("unclassified")) tags.push("unclassified");
        existing.tags = tags;
      }
    } else {
      const name = titleFromIso(iso);
      const entry = {
        name,
        iso,
        region: DEFAULT_REGION,
        category: "Sino-Tibetan"
      };
      if (isProto) {
        entry.tags = ["extinct", "unclassified"];
      }
      mixes.push(entry);
      mixesByIso.set(iso, entry);
      added++;
    }
  }

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  const finalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalMixIsos) {
    if (!finalMixIsos.has(iso)) {
      console.error(
        "[fill-sino-tibetan-mixes] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log(`Sino-Tibetan ISO entries ensured: ${stIsos.size}, added ${added}, updated ${updated}`);
}

if (require.main === module) main();

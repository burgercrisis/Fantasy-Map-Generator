"use strict";

// Fill remaining ISOs that are present in language-mixer-map.json
// but missing from language-mixes.json, using an explicit mapping
// of categories and regions so they show up in the Language Mixer.

const fs = require("fs");
const path = require("path");
const {META} = require("../mixer-meta/_meta-fill-missing-mixes");

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

function main() {
  const args = process.argv.slice(2);
  const multiAgentSafe = args.includes("--multi-agent-safe");
  if (multiAgentSafe) {
    console.log("[multi-agent-safe] Read-only mode enabled: will not write config/language-mixes.json");
  }

  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const missing = Object.keys(META).filter(iso => mapIsos.has(iso) && !mixIsos.has(iso));

  let added = 0;

  for (const iso of missing) {
    const meta = META[iso];
    if (!meta) continue;
    const entry = {
      name: meta.name,
      iso,
      category: meta.category,
      region: meta.region
    };
    if (meta.tags && meta.tags.length) entry.tags = meta.tags.slice();
    mixes.push(entry);
    added++;
  }

  if (!added) {
    console.log("No missing ISO entries from META to add.");
  } else {
    console.log("Added", added, "missing ISO entries.");
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
        "[fill-missing-mixes-explicit] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  if (multiAgentSafe) {
    console.log("[multi-agent-safe] Not writing config/language-mixes.json (dry-run)");
    return;
  }

  writeJson("config/language-mixes.json", mixes);
}

if (require.main === module) main();

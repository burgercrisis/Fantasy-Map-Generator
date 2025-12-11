"use strict";

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

function isHmongMienEntry(entry) {
  if (!entry) return false;
  if (entry.category === "Hmong-Mien") return true;
  const fam = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && fam === "hmong-mien") return true;
  return false;
}

function normalizeHmongMienEntry(entry) {
  let changed = false;
  if (!entry.category || entry.category === "Other" || entry.category === "Unclassified") {
    entry.category = "Hmong-Mien";
    changed = true;
  }
  if (!entry.region) {
    entry.region = "East Asia";
    changed = true;
  }
  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Hmong-Mien";
    changed = true;
  }
  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  let updated = 0;
  for (const entry of mixes) {
    if (!isHmongMienEntry(entry)) continue;
    if (normalizeHmongMienEntry(entry)) updated++;
  }
  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });
  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  const finalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalMixIsos) {
    if (!finalMixIsos.has(iso)) {
      console.error(
        "[update-hmong-mien] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Hmong-Mien entries updated:", updated);
}

if (require.main === module) main();

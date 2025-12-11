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

function isIndoAryanEntry(entry) {
  if (!entry) return false;

  if (entry.category === "Indo-Aryan") return true;

  const fam = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && fam.includes("indo-aryan")) return true;

  return false;
}

function normalizeIndoAryanEntry(entry) {
  let changed = false;

  if (!entry.category) {
    entry.category = "Indo-Aryan";
    changed = true;
  }

  if (!entry.region) {
    entry.region = "Asia";
    changed = true;
  }

  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Indo-Aryan";
    changed = true;
  }

  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  let updated = 0;

  for (const entry of mixes) {
    if (!isIndoAryanEntry(entry)) continue;
    if (normalizeIndoAryanEntry(entry)) updated++;
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
        "[update-indo-aryan] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Indo-Aryan entries updated:", updated);
}

if (require.main === module) main();

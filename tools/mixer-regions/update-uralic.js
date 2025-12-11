"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const clean = raw.replace(/^\uFEFF/, "");
  return JSON.parse(clean);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function isUralicEntry(entry) {
  if (!entry) return false;
  if (entry.category === "Uralic") return true;

  const family = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && family) {
    if (
      family.includes("uralic") ||
      family.includes("finnic") ||
      family.includes("sami") ||
      family.includes("saami") ||
      family.includes("khanty") ||
      family.includes("mansi") ||
      family.includes("nenets") ||
      family.includes("nganasan") ||
      family.includes("selkup") ||
      family.includes("enets") ||
      family.includes("mari") ||
      family.includes("mordvin") ||
      family.includes("erzya") ||
      family.includes("moksha") ||
      family.includes("komi") ||
      family.includes("udmurt") ||
      family.includes("karelian") ||
      family.includes("veps") ||
      family.includes("votic") ||
      family.includes("livonian") ||
      family.includes("hungarian")
    ) {
      return true;
    }
  }

  return false;
}

function normalizeUralicEntry(entry) {
  let changed = false;

  if (!entry.category) {
    entry.category = "Uralic";
    changed = true;
  }

  if (!entry.region) {
    entry.region = "Eurasia";
    changed = true;
  }

  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Uralic";
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

  let updatedCount = 0;

  for (const entry of mixes) {
    if (!isUralicEntry(entry)) continue;
    if (normalizeUralicEntry(entry)) updatedCount++;
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
        "[update-uralic] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Uralic entries updated:", updatedCount);
}

if (require.main === module) main();

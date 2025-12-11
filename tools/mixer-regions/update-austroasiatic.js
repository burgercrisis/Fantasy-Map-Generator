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

function isAustroasiaticEntry(entry) {
  if (!entry) return false;
  if (entry.category === "Austroasiatic") return true;

  const family = entry.family ? String(entry.family).toLowerCase() : "";
  if (!entry.category && family) {
    if (
      family === "austroasiatic" ||
      family === "aslian" ||
      family === "munda" ||
      family === "bahnaric" ||
      family === "katuic" ||
      family === "nicobarese" ||
      family === "pearic" ||
      family === "khmeric" ||
      family === "khmuic" ||
      family === "pakanic" ||
      family === "khasic"
    ) {
      return true;
    }
  }

  return false;
}

function normalizeAustroasiaticEntry(entry) {
  let changed = false;

  if (!entry.category) {
    entry.category = "Austroasiatic";
    changed = true;
  }

  if (!entry.region) {
    entry.region = "Asia";
    changed = true;
  }

  if (!entry.family || entry.family === "Other" || entry.family === "Unclassified") {
    entry.family = "Austroasiatic";
    changed = true;
  }

  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  let updatedCount = 0;

  for (const entry of mixes) {
    if (!isAustroasiaticEntry(entry)) continue;
    if (normalizeAustroasiaticEntry(entry)) updatedCount++;
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
        "[update-austroasiatic] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Austroasiatic entries updated:", updatedCount);
}

if (require.main === module) main();

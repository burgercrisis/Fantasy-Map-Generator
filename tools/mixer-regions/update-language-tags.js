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

function ensureTag(entry, tag) {
  if (!tag) return false;
  let tags = entry.tags;
  if (!Array.isArray(tags)) {
    tags = [];
    entry.tags = tags;
  }
  if (!tags.includes(tag)) {
    tags.push(tag);
    return true;
  }
  return false;
}

function normalizeTags(entry) {
  if (!entry || typeof entry !== "object") return false;
  let changed = false;

  const name = entry.name || "";
  const iso = entry.iso || "";
  const lowerName = String(name).toLowerCase();
  const lowerIso = String(iso).toLowerCase();

  if (
    (/family$/i.test(name) || /languages$/i.test(name) ||
      /-family$/i.test(iso) || /-languages$/i.test(iso)) &&
    !(Array.isArray(entry.tags) && entry.tags.includes("family"))
  ) {
    if (ensureTag(entry, "family")) changed = true;
  }

  if (/(dialect|dialects)/i.test(name)) {
    if (ensureTag(entry, "dialect")) changed = true;
  }

  if (lowerName.startsWith("proto-") || lowerName.startsWith("proto ") || lowerIso.startsWith("proto-")) {
    if (ensureTag(entry, "proto")) changed = true;
    if (ensureTag(entry, "historical")) changed = true;
  }

  if (/^(old |middle |classical |ancient )/i.test(name)) {
    if (ensureTag(entry, "historical")) changed = true;
  }

  if (/judaeo|judeo/.test(lowerName) || lowerIso.startsWith("judaeo-") || lowerIso.startsWith("judeo-")) {
    if (ensureTag(entry, "judeo")) changed = true;
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
    if (normalizeTags(entry)) updated++;
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
        "[update-language-tags] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Entries with tags updated:", updated);
}

if (require.main === module) main();

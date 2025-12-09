"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadLanguageMixerCatalogFromAllJs(relPath) {
  const full = path.join(root, relPath);
  const src = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(src, context, { filename: relPath });

  const catalog = context.window.languageMixerCatalog;
  if (!Array.isArray(catalog)) {
    throw new Error("language-mixes-all.js did not define window.languageMixerCatalog as an array");
  }
  return catalog;
}

function keyOf(entry) {
  if (!entry || (entry.iso == null && entry.name == null)) return null;
  return String(entry.iso || entry.name);
}

function main() {
  const jsonMixes = readJson("config/language-mixes.json");
  const allMixes = loadLanguageMixerCatalogFromAllJs("config/language-mixes-all.js");

  const jsonByKey = new Map();
  for (const e of jsonMixes) {
    const k = keyOf(e);
    if (!k) continue;
    if (!jsonByKey.has(k)) jsonByKey.set(k, e);
  }

  const allByKey = new Map();
  for (const e of allMixes) {
    const k = keyOf(e);
    if (!k) continue;
    if (!allByKey.has(k)) allByKey.set(k, e);
  }

  const familiesOnlyInAll = [];
  const familiesOnlyInJson = [];
  const familiesDiffer = [];

  for (const [key, allEntry] of allByKey.entries()) {
    const jsonEntry = jsonByKey.get(key) || null;
    const allFamily = allEntry.family;
    const jsonFamily = jsonEntry ? jsonEntry.family : undefined;

    if (allFamily && !jsonEntry) {
      familiesOnlyInAll.push({
        key,
        iso: allEntry.iso,
        name: allEntry.name,
        allFamily,
        jsonFamily: null,
        reason: "present only in language-mixes-all.js (no matching JSON entry)"
      });
    } else if (allFamily && !jsonFamily) {
      familiesOnlyInAll.push({
        key,
        iso: allEntry.iso,
        name: allEntry.name,
        allFamily,
        jsonFamily: null,
        reason: "family set only in language-mixes-all.js"
      });
    } else if (allFamily && jsonFamily && allFamily !== jsonFamily) {
      familiesDiffer.push({
        key,
        iso: allEntry.iso,
        name: allEntry.name,
        allFamily,
        jsonFamily
      });
    }
  }

  for (const [key, jsonEntry] of jsonByKey.entries()) {
    const allEntry = allByKey.get(key) || null;
    const jsonFamily = jsonEntry.family;
    const allFamily = allEntry ? allEntry.family : undefined;

    if (jsonFamily && !allFamily) {
      familiesOnlyInJson.push({
        key,
        iso: jsonEntry.iso,
        name: jsonEntry.name,
        jsonFamily,
        allFamily: null
      });
    }
  }

  console.log("Total entries in JSON:", jsonMixes.length);
  console.log("Total entries in language-mixes-all.js:", allMixes.length);
  console.log("");

  console.log("Entries where family is only in language-mixes-all.js or JSON is missing entry:", familiesOnlyInAll.length);
  if (familiesOnlyInAll.length) {
    for (const e of familiesOnlyInAll) {
      console.log(` - ${e.key} (iso=${e.iso || ""}, name=${e.name || ""}) all.js family=${e.allFamily}, JSON family=${e.jsonFamily} - ${e.reason}`);
    }
  }

  console.log("");
  console.log("Entries where family is only in JSON (no family in language-mixes-all.js):", familiesOnlyInJson.length);
  if (familiesOnlyInJson.length) {
    for (const e of familiesOnlyInJson) {
      console.log(` - ${e.key} (iso=${e.iso || ""}, name=${e.name || ""}) JSON family=${e.jsonFamily}, all.js family=${e.allFamily}`);
    }
  }

  console.log("");
  console.log("Entries where family differs between JSON and language-mixes-all.js:", familiesDiffer.length);
  if (familiesDiffer.length) {
    for (const e of familiesDiffer) {
      console.log(` - ${e.key} (iso=${e.iso || ""}, name=${e.name || ""}) all.js family=${e.allFamily}, JSON family=${e.jsonFamily}`);
    }
  }

  if (!familiesOnlyInAll.length && !familiesDiffer.length) {
    console.log("\nOK: No family values exist only in language-mixes-all.js, and no mismatches versus JSON.");
  }
}

if (require.main === module) main();

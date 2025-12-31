"use strict";

const fs = require("fs");
const path = require("path");

const {loadLanguageModBundles, mergeLanguageData} = require("./softmod-language-loader");

function readJson(rootDir, relPath) {
  const abs = path.join(rootDir, relPath);
  const raw = fs.readFileSync(abs, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

function loadCoreLanguageData(rootDir) {
  const catalog = readJson(rootDir, "config/language-mixes.json");
  const mixerMap = readJson(rootDir, "config/language-mixer-map.json");
  return {catalog, mixerMap};
}

function main() {
  const rootDir = path.resolve(__dirname, "../..");

  const core = loadCoreLanguageData(rootDir);

  const {bundles, warnings: loaderWarnings} = loadLanguageModBundles(rootDir, {
    explicitMods: ["arcana-unearthed", "blue-rose"]
  });

  if (!bundles.length) {
    console.error(
      "No language bundles loaded. Ensure mods/arcana-unearthed/languages-*.js and " +
        "mods/blue-rose/languages-*.js exist and are valid."
    );
    process.exitCode = 1;
    return;
  }

  const merged = mergeLanguageData(core, bundles);

  const coreIsos = new Set(
    (core.catalog || [])
      .map(l => l && l.iso)
      .filter(Boolean)
  );
  const mergedIsos = new Set(
    (merged.catalog || [])
      .map(l => l && l.iso)
      .filter(Boolean)
  );

  const modIsoSet = new Set();
  bundles.forEach(bundle => {
    (bundle.languagesCatalog || []).forEach(lang => {
      if (lang && lang.iso) modIsoSet.add(lang.iso);
    });
    (bundle.languagesMap || []).forEach(entry => {
      if (entry && entry.iso) modIsoSet.add(entry.iso);
    });
  });

  const modIsos = Array.from(modIsoSet).sort();
  const newIsos = modIsos.filter(iso => !coreIsos.has(iso));

  const mapIsoSet = new Set(
    (merged.mixerMap || [])
      .map(entry => entry && entry.iso)
      .filter(Boolean)
  );

  const newWithMap = newIsos.filter(iso => mapIsoSet.has(iso));
  const newWithoutMap = newIsos.filter(iso => !mapIsoSet.has(iso));

  console.log("Softmod sandbox – language loading preview (no changes to live app)\n");

  console.log(`Core catalog entries:   ${core.catalog ? core.catalog.length : 0}`);
  console.log(`Merged catalog entries: ${merged.catalog ? merged.catalog.length : 0}`);
  console.log(`Core mixer-map entries:   ${core.mixerMap ? core.mixerMap.length : 0}`);
  console.log(`Merged mixer-map entries: ${merged.mixerMap ? merged.mixerMap.length : 0}`);
  console.log("");

  console.log("Mod language isos:");
  console.log("  " + (modIsos.length ? modIsos.join(", ") : "(none)"));
  console.log("");

  console.log("New language isos (not in core catalog):");
  console.log("  " + (newIsos.length ? newIsos.join(", ") : "(none)"));
  console.log("");

  console.log("New isos with mixer-map entries:");
  console.log("  " + (newWithMap.length ? newWithMap.join(", ") : "(none)"));
  console.log("New isos missing mixer-map entries:");
  console.log("  " + (newWithoutMap.length ? newWithoutMap.join(", ") : "(none)"));
  console.log("");

  const postMixed = merged.postMixedLanguages || [];
  console.log("Post-mixed languages from mods:");
  if (!postMixed.length) {
    console.log("  (none)");
  } else {
    postMixed.forEach(lang => {
      const parts = [];
      if (lang.name) parts.push(lang.name);
      if (lang.id) parts.push(`id=${lang.id}`);
      if (lang.baseIso) parts.push(`baseIso=${lang.baseIso}`);
      if (lang.modId) parts.push(`mod=${lang.modId}`);
      console.log("  - " + parts.join(" "));
    });
  }
  console.log("");

  const allWarnings = [];
  if (loaderWarnings && loaderWarnings.length) allWarnings.push(...loaderWarnings);
  if (merged.warnings && merged.warnings.length) allWarnings.push(...merged.warnings);

  if (allWarnings.length) {
    console.log("Warnings:");
    allWarnings.forEach(w => console.log("  - " + w));
  } else {
    console.log("No loader or merge warnings.");
  }
}

if (require.main === module) {
  main();
}

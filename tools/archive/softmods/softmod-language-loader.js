"use strict";

const fs = require("fs");
const path = require("path");

// Reuse mods config loader from the race softmod loader
const {loadModsConfig} = require("./softmod-race-loader");

function normalizeLanguageBundle(raw, modId) {
  if (!raw || typeof raw !== "object") {
    return {
      modId,
      languagesCatalog: [],
      languagesMap: [],
      postMixedLanguages: [],
      modMetadata: {id: modId}
    };
  }

  const languagesCatalog =
    raw.languagesCatalog || raw.languageCatalogEntries || raw.catalog || [];
  const languagesMap = raw.languagesMap || raw.languageMixerMapEntries || raw.map || [];
  const postMixedLanguages = raw.postMixedLanguages || [];
  const modMetadata = raw.modMetadata || raw.auModMetadata || {id: modId};

  return {
    modId,
    languagesCatalog,
    languagesMap,
    postMixedLanguages,
    modMetadata
  };
}

function loadLanguageModBundles(rootDir, options) {
  const explicitMods = options && options.explicitMods;
  const useExplicit = Array.isArray(explicitMods) && explicitMods.length > 0;

  const configInfo = useExplicit ? {enabled: explicitMods, path: null} : loadModsConfig(rootDir);
  const enabledIds = configInfo.enabled || [];

  const bundles = [];
  const warnings = [];

  enabledIds.forEach(modId => {
    const modDir = path.join(rootDir, "mods", modId);

    let stat;
    try {
      stat = fs.existsSync(modDir) && fs.statSync(modDir);
    } catch (error) {
      stat = null;
    }

    if (!stat || !stat.isDirectory()) {
      warnings.push(`Mod directory not found or not a directory: ${modDir}`);
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(modDir, {withFileTypes: true});
    } catch (error) {
      warnings.push(`Failed to read mod directory for ${modId}: ${error.message}`);
      return;
    }

    const languageFiles = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => /^languages.*\.js$/i.test(name));

    if (!languageFiles.length) {
      // It is valid for a mod to have no language bundles; just record a note.
      warnings.push(`No languages*.js bundle found for mod ${modId} in ${modDir}`);
      return;
    }

    languageFiles.forEach(fileName => {
      const languageFile = path.join(modDir, fileName);
      try {
        const raw = require(languageFile);
        bundles.push(normalizeLanguageBundle(raw, modId));
      } catch (error) {
        warnings.push(
          `Failed to load language bundle for mod ${modId} from ${fileName}: ${error.message}`
        );
      }
    });
  });

  return {bundles, warnings, configInfo};
}

function buildCatalogIndex(catalog) {
  const byIso = new Map();
  const ordered = [];

  if (!Array.isArray(catalog)) return {byIso, ordered};

  catalog.forEach(entry => {
    if (!entry || !entry.iso) return;
    if (byIso.has(entry.iso)) return;
    byIso.set(entry.iso, entry);
    ordered.push(entry);
  });

  return {byIso, ordered};
}

function buildMapIndex(mapEntries) {
  const byIso = new Map();
  if (!Array.isArray(mapEntries)) return byIso;

  mapEntries.forEach(entry => {
    if (!entry || !entry.iso) return;
    if (!Array.isArray(entry.bases)) return;
    if (!byIso.has(entry.iso)) byIso.set(entry.iso, entry);
  });

  return byIso;
}

function mergeLanguageData(core, bundles) {
  const coreCatalog = Array.isArray(core.catalog) ? core.catalog : [];
  const coreMixerMap = Array.isArray(core.mixerMap) ? core.mixerMap : [];

  const {byIso: catalogByIso, ordered: catalogOrder} = buildCatalogIndex(coreCatalog);
  const mapByIso = buildMapIndex(coreMixerMap);

  const mergedPostMixed = Array.isArray(core.postMixedLanguages)
    ? core.postMixedLanguages.slice()
    : [];

  const warnings = [];

  bundles.forEach(bundle => {
    const modId = bundle.modId;

    (bundle.languagesCatalog || []).forEach(lang => {
      if (!lang || !lang.iso) return;
      if (catalogByIso.has(lang.iso)) {
        warnings.push(
          `Mod ${modId} defines catalog entry for existing iso '${lang.iso}' – keeping core value`
        );
        return;
      }
      catalogByIso.set(lang.iso, lang);
      catalogOrder.push(lang);
    });

    (bundle.languagesMap || []).forEach(entry => {
      if (!entry || !entry.iso || !Array.isArray(entry.bases)) return;
      if (mapByIso.has(entry.iso)) {
        warnings.push(
          `Mod ${modId} defines mixer-map entry for existing iso '${entry.iso}' – keeping core value`
        );
        return;
      }
      mapByIso.set(entry.iso, entry);
    });

    if (Array.isArray(bundle.postMixedLanguages) && bundle.postMixedLanguages.length) {
      bundle.postMixedLanguages.forEach(lang => {
        if (!lang) return;
        const withMod = Object.assign({modId}, lang);
        mergedPostMixed.push(withMod);
      });
    }
  });

  const mergedCatalog = catalogOrder.slice();
  const mergedMixerMap = Array.from(mapByIso.values());

  return {
    catalog: mergedCatalog,
    mixerMap: mergedMixerMap,
    postMixedLanguages: mergedPostMixed,
    warnings
  };
}

module.exports = {
  normalizeLanguageBundle,
  loadLanguageModBundles,
  mergeLanguageData
};

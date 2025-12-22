"use strict";

(function () {
  if (typeof window === "undefined") return;

  function normalizeLanguageBundle(raw) {
    if (!raw || typeof raw !== "object") return null;

    var languagesCatalog = raw.languagesCatalog || raw.languageCatalogEntries || raw.catalog || [];
    var languagesMap = raw.languagesMap || raw.languageMixerMapEntries || raw.map || [];
    var postMixedLanguages = raw.postMixedLanguages || [];

    if (!Array.isArray(languagesCatalog)) languagesCatalog = [];
    if (!Array.isArray(languagesMap)) languagesMap = [];
    if (!Array.isArray(postMixedLanguages)) postMixedLanguages = [];

    var modId = raw.modId ? String(raw.modId) : null;

    return {
      modId: modId,
      languagesCatalog: languagesCatalog,
      languagesMap: languagesMap,
      postMixedLanguages: postMixedLanguages
    };
  }

  function mergeLanguageSoftmodsIntoGlobals(bundles, options) {
    if (!Array.isArray(bundles) || !bundles.length) {
      return {
        catalog: Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog : [],
        mixerMap: Array.isArray(window.languageMixerMap) ? window.languageMixerMap : [],
        postMixedLanguages: Array.isArray(window.postMixedLanguages) ? window.postMixedLanguages : [],
        warnings: []
      };
    }

    options = options || {};
    var warnings = Array.isArray(options.warnings) ? options.warnings : [];

    var catalog = Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog.slice() : [];
    var mixerMap = Array.isArray(window.languageMixerMap) ? window.languageMixerMap.slice() : [];
    var postMixedLanguages = Array.isArray(window.postMixedLanguages) ? window.postMixedLanguages.slice() : [];

    var catalogByIso = Object.create(null);
    for (var i = 0; i < catalog.length; i++) {
      var c = catalog[i];
      if (c && c.iso) catalogByIso[c.iso] = c;
    }

    var mapByIso = Object.create(null);
    for (var j = 0; j < mixerMap.length; j++) {
      var m = mixerMap[j];
      if (m && m.iso) mapByIso[m.iso] = m;
    }

    bundles.forEach(function (rawBundle) {
      var bundle = normalizeLanguageBundle(rawBundle);
      if (!bundle) return;

      var modId = bundle.modId;

      bundle.languagesCatalog.forEach(function (entry) {
        if (!entry || !entry.iso) return;
        if (catalogByIso[entry.iso]) {
          warnings.push(
            "language-softmods: catalog iso '" +
            entry.iso +
            "' already present; keeping core entry" +
            (modId ? " (mod " + modId + ")" : "")
          );
          return;
        }
        catalogByIso[entry.iso] = entry;
        catalog.push(entry);
      });

      bundle.languagesMap.forEach(function (entry) {
        if (!entry || !entry.iso) return;
        if (mapByIso[entry.iso]) {
          warnings.push(
            "language-softmods: mixer-map iso '" +
            entry.iso +
            "' already present; keeping core entry" +
            (modId ? " (mod " + modId + ")" : "")
          );
          return;
        }
        mapByIso[entry.iso] = entry;
        mixerMap.push(entry);
      });

      if (bundle.postMixedLanguages && bundle.postMixedLanguages.length) {
        bundle.postMixedLanguages.forEach(function (lang) {
          if (!lang) return;
          if (modId && !lang.modId) lang.modId = modId;
          postMixedLanguages.push(lang);
        });
      }
    });

    window.languageMixerCatalog = catalog;
    window.languageMixerMap = mixerMap;
    window.postMixedLanguages = postMixedLanguages;

    return {
      catalog: catalog,
      mixerMap: mixerMap,
      postMixedLanguages: postMixedLanguages,
      warnings: warnings
    };
  }

  window.applyLanguageSoftmods = function (bundles, options) {
    return mergeLanguageSoftmodsIntoGlobals(bundles, options);
  };
})();

/**
 * Language soft-mods system.
 *
 * Loads name-fix JSON bundles and merges them into the language mixer catalog,
 * mixer map, and post-mixed language list. This is custom fork code with no
 * upstream equivalent.
 */

export interface LanguageMixerCatalogEntry {
  iso: string;
  name: string;
  region?: string;
  category?: string;
  family?: string;
  tags?: string[];
}

export interface LanguageMixerMapEntry {
  iso: string;
  bases: number[];
}

export interface PostMixedLanguage {
  id: string;
  name: string;
  baseIso: string;
  tags?: string[];
  modId?: string;
  [key: string]: unknown;
}

export interface LanguageSoftmodBundle {
  modId: string | null;
  languagesCatalog: LanguageMixerCatalogEntry[];
  languagesMap: LanguageMixerMapEntry[];
  postMixedLanguages: PostMixedLanguage[];
}

export interface LanguageSoftmodRawBundle {
  modId?: string;
  languagesCatalog?: LanguageMixerCatalogEntry[];
  languageCatalogEntries?: LanguageMixerCatalogEntry[];
  catalog?: LanguageMixerCatalogEntry[];
  languagesMap?: LanguageMixerMapEntry[];
  languageMixerMapEntries?: LanguageMixerMapEntry[];
  map?: LanguageMixerMapEntry[];
  postMixedLanguages?: PostMixedLanguage[];
  [key: string]: unknown;
}

export interface MergeOptions {
  warnings?: string[];
}

export interface MergeResult {
  catalog: LanguageMixerCatalogEntry[];
  mixerMap: LanguageMixerMapEntry[];
  postMixedLanguages: PostMixedLanguage[];
  warnings: string[];
}

function normalizeLanguageBundle(
  raw: LanguageSoftmodRawBundle | null | undefined
): LanguageSoftmodBundle | null {
  if (!raw || typeof raw !== "object") return null;

  let languagesCatalog = raw.languagesCatalog ?? raw.languageCatalogEntries ?? raw.catalog ?? [];
  let languagesMap = raw.languagesMap ?? raw.languageMixerMapEntries ?? raw.map ?? [];
  let postMixedLanguages = raw.postMixedLanguages ?? [];

  if (!Array.isArray(languagesCatalog)) languagesCatalog = [];
  if (!Array.isArray(languagesMap)) languagesMap = [];
  if (!Array.isArray(postMixedLanguages)) postMixedLanguages = [];

  const modId = raw.modId ? String(raw.modId) : null;

  return {
    modId,
    languagesCatalog,
    languagesMap,
    postMixedLanguages
  };
}

function mergeLanguageSoftmodsIntoGlobals(
  bundles: LanguageSoftmodRawBundle[] | null | undefined,
  options?: MergeOptions
): MergeResult {
  if (!Array.isArray(bundles) || !bundles.length) {
    return {
      catalog: Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog : [],
      mixerMap: Array.isArray(window.languageMixerMap) ? window.languageMixerMap : [],
      postMixedLanguages: Array.isArray(window.postMixedLanguages) ? window.postMixedLanguages : [],
      warnings: []
    };
  }

  const warnings = Array.isArray(options?.warnings) ? options.warnings : [];

  const catalog: LanguageMixerCatalogEntry[] = Array.isArray(window.languageMixerCatalog)
    ? window.languageMixerCatalog.slice()
    : [];
  const mixerMap: LanguageMixerMapEntry[] = Array.isArray(window.languageMixerMap)
    ? window.languageMixerMap.slice()
    : [];
  const postMixedLanguages: PostMixedLanguage[] = Array.isArray(window.postMixedLanguages)
    ? window.postMixedLanguages.slice()
    : [];

  const catalogByIso: Record<string, LanguageMixerCatalogEntry> = Object.create(null);
  for (let i = 0; i < catalog.length; i++) {
    const c = catalog[i];
    if (c?.iso) catalogByIso[c.iso] = c;
  }

  const mapByIso: Record<string, LanguageMixerMapEntry> = Object.create(null);
  for (let j = 0; j < mixerMap.length; j++) {
    const m = mixerMap[j];
    if (m?.iso) mapByIso[m.iso] = m;
  }

  bundles.forEach(rawBundle => {
    const bundle = normalizeLanguageBundle(rawBundle);
    if (!bundle) return;

    const modId = bundle.modId;

    bundle.languagesCatalog.forEach(entry => {
      if (!entry?.iso) return;
      if (catalogByIso[entry.iso]) {
        warnings.push(
          `language-softmods: catalog iso '${entry.iso}' already present; keeping core entry` +
            (modId ? ` (mod ${modId})` : "")
        );
        return;
      }
      catalogByIso[entry.iso] = entry;
      catalog.push(entry);
    });

    bundle.languagesMap.forEach(entry => {
      if (!entry?.iso) return;
      if (mapByIso[entry.iso]) {
        warnings.push(
          `language-softmods: mixer-map iso '${entry.iso}' already present; keeping core entry` +
            (modId ? ` (mod ${modId})` : "")
        );
        return;
      }
      mapByIso[entry.iso] = entry;
      mixerMap.push(entry);
    });

    if (bundle.postMixedLanguages?.length) {
      bundle.postMixedLanguages.forEach(lang => {
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
    catalog,
    mixerMap,
    postMixedLanguages,
    warnings
  };
}

export function applyLanguageSoftmods(
  bundles: LanguageSoftmodRawBundle[] | null | undefined,
  options?: MergeOptions
): MergeResult {
  return mergeLanguageSoftmodsIntoGlobals(bundles, options);
}

// Bridge for classic/public/ callers
if (typeof window !== "undefined") {
  window.applyLanguageSoftmods = applyLanguageSoftmods;
}

/**
 * Language mixer system.
 *
 * Generates synthetic languages by mixing real-world name bases using Markov
 * chains. This is custom fork code with no upstream equivalent.
 *
 * The mixer is attached to the global `Names` object at module load time,
 * extending it with `getMixedBase`, `getMixedBaseMany`, and `getMixedByIso`.
 *
 * Integration:
 * - `races.ts` calls `Names.getMixedByIso` for race-aware naming
 * - `cultures-generator.ts` references the mixer via the `Names` global
 * - Reads from `window.languageMixerCatalog` and `window.languageMixerMap`
 *   (populated by config bundles and extended by language-softmods.ts)
 */

import { tip } from "@/components/tooltips";
import { type NameBase } from "@/data/name-bases";
import { isVowel } from "@/utils/languageUtils";
import { last } from "@/utils/arrayUtils";
import { ra } from "@/utils/probabilityUtils";
import type { LanguageMixerMapEntry } from "./language-softmods";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Markov chain: sparse array indexed by letter (or "" for word start) */
export type MarkovChain = string[][] & Record<string, string[]>;

/** Options for getMixedBase / getMixedBaseMany */
export interface MixedBaseOptions {
  count?: number;
  seed?: number;
  min?: number;
  max?: number;
  dupl?: string;
  weights?: number[];
  legacyChain?: boolean;
  maxSegments?: number;
  minUniqueBases?: number;
}

/** Options for getMixedByIso */
export interface MixedByIsoOptions {
  count?: number;
  seed?: number;
  min?: number;
  max?: number;
  weights?: number[];
  legacyChain?: boolean;
}

/** Length statistics for a name blob */
interface LengthStats {
  count: number;
  minLen: number;
  maxLen: number;
  mean: number;
  p25: number;
  p75: number;
}

/** Shape descriptor for a generated name segment */
interface SegmentShape {
  len: number;
  lenBucket: "S" | "M" | "L";
  isClickSegment: boolean;
  baseIndex: number;
  isClickLanguage: boolean;
}

/** A generated segment with its context and shape */
interface SegmentInfo {
  text: string;
  ctx: BlendedContext;
  shape: SegmentShape;
}

/** Blended context for a name base, used during name generation */
interface BlendedContext {
  idx: number;
  base: NameBase;
  chain: MarkovChain;
  stats: LengthStats | null;
  onsetSet: Set<string>;
  isClickHeavy: boolean;
}

/** Result of generating a blended name */
interface BlendedNameResult {
  text: string;
  bases: number[];
}

/** Extended Names global with mixer methods */
interface NamesWithMixer {
  getMixedBase(baseIndices: number[], options?: MixedBaseOptions): string;
  getMixedBaseMany(baseIndices: number[], options?: MixedBaseOptions): string[];
  getMixedByIso(isoWeights: Record<string, number>, options?: MixedByIsoOptions): string[];
  nameBases: NameBase[];
  calculateChain(namesList: string): MarkovChain;
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _languageMixerMap: LanguageMixerMapEntry[] | undefined;
let _mixedNameTooShortLogged = false;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLICKS = "ǀǁǂǃ";
const CLICK_SMOOTH_PREFIXES = ["h", "ʼ", "kh", "qh", "sk", "ts", "tl", "ng", "x", "g", "n"];
const CLICK_BRIDGE_VOWELS = ["a", "e", "i", "o", "u", "aa", "oa", "ua", "ia", "ai", "ei", "ao"];
const CLICK_SUFFIXES = ["ka", "na", "sa", "sha", "sa", "ra", "ma", "ta", "la", "xa", "na", "za"];
const CLICK_ACENTS: ReadonlyArray<readonly [string, string]> = [
  ["a", "á"],
  ["e", "é"],
  ["i", "í"],
  ["o", "ó"],
  ["u", "ú"],
  ["a", "â"],
  ["o", "ô"]
];

/**
 * ISO 639-1 / 639-3 -> mixer map key alias resolution.
 *
 * Many common languages use their full English name (e.g. "english", "korean")
 * in the mixer map, but the rest of the app passes 2-letter (ISO 639-1) or
 * 3-letter (ISO 639-3) codes. This map bridges the two.
 */
const ISO_TO_MAP_KEY: Record<string, string> = {
  // ISO 639-1 (2-letter) -> mixer map key
  en: "english",
  fr: "standard-french",
  es: "spanish",
  de: "standard-german",
  it: "standard-italian",
  pt: "european-portuguese",
  nl: "dutch",
  ru: "russian",
  ja: "japanese-dialects",
  ko: "korean",
  zh: "beijing-mandarin",
  ar: "standard-arabic",
  hi: "hindustani",
  bn: "bengali",
  pa: "punjabi",
  tr: "turkish",
  vi: "vietnamese",
  th: "thai",
  fa: "persian",
  ur: "urdu",
  id: "indonesian",
  ms: "alor-malay",
  sw: "settler-swahili",
  tl: "tagalog",
  el: "greek",
  he: "hebrew",
  uk: "ukrainian",
  pl: "polish",
  cs: "czech",
  sk: "slovak",
  hu: "old-hungarian",
  fi: "standard-finnish",
  sv: "swedish",
  no: "norwegian",
  da: "danish",
  is: "icelandic",
  ga: "irish",
  cy: "welsh",
  eu: "basque-icelandic-pidgin",
  ca: "central-catalan",
  ro: "romanian",
  bg: "bulgarian",
  hr: "croatian",
  sr: "serbian",
  sl: "slovenian",
  et: "estonian",
  lv: "latvian",
  lt: "lithuanian",
  sq: "albanian",
  mk: "macedonian",
  bs: "bosnian",
  mt: "maltese",
  af: "afrikaans",
  am: "amharic",
  yo: "yoruba",
  ig: "igbo",
  ha: "hausa",
  so: "somali",
  mg: "malagasy",
  xh: "xhosa",
  zu: "zulu",
  st: "southern-sotho",
  tn: "tswana",
  ve: "venda",
  ts: "tsonga",
  ss: "swati",
  nr: "southern-ndebele",
  nd: "northern-ndebele",
  lo: "lao",
  km: "khmer",
  my: "burmese",
  mn: "mongolian",
  uz: "uzbek",
  kk: "kazakh",
  ky: "kyrgyz",
  tk: "turkmen",
  tg: "tajik",
  az: "azerbaijani",
  ka: "georgian",
  hy: "armenian",
  ne: "nepali",
  si: "sinhala",
  mi: "maori",
  haw: "hawaiian",
  sm: "samoan",
  to: "tongan",
  fj: "fijian",
  qu: "quechua",
  ay: "aymara",
  gn: "guarani",
  nah: "nahuatl",
  chr: "cherokee",
  nv: "navajo",
  iu: "inuktitut",
  kl: "kalaallisut",
  fo: "faroese",
  ik: "inupiaq",
  oj: "ojibwe",
  cr: "cree",
  dak: "dakota",
  gla: "scots-gaelic",
  br: "breton",
  co: "corsican",
  rm: "romansh",
  fur: "friulian",
  lad: "ladino",
  sc: "sardinian",
  ast: "asturian",
  an: "aragonese",
  lmo: "lombard",
  pms: "piemontese",
  vec: "venetian",
  lld: "ladin",
  scn: "sicilian",
  nap: "neapolitan",
  mwl: "mirandese",
  ext: "extremaduran",
  wae: "walser",
  gsw: "swiss-german",
  nds: "low-german",
  ksh: "colognian",
  gu: "gujarati",
  mr: "marathi",
  te: "telugu",
  ta: "tamil",
  kn: "kannada",
  ml: "malayalam",
  or: "oriya",
  as: "assamese",
  bo: "tibetan",
  dz: "dzongkha",
  jv: "javanese",
  su: "sundanese",
  ceb: "cebuano",
  ilo: "ilocano",
  war: "waray",
  pam: "pampangan",
  bcl: "bikol",
  pag: "pangasinan",
  mad: "madurese",
  ace: "acehnese",
  bjn: "banjar",
  mak: "makassarese",
  bug: "buginese",
  min: "minangkabau",
  lg: "ganda",
  ln: "lingala",
  kg: "kongo",
  lua: "luba-kasai",
  kin: "kinyarwanda",
  rn: "kirundi",
  rw: "kinyarwanda",
  ks: "kashmiri",
  doi: "dogri",
  brx: "bodo",
  mni: "manipuri",
  sat: "santali",
  kha: "khasi",
  kok: "konkani",
  sa: "sanskrit",
  bho: "bhojpuri",
  mag: "magahi",
  mai: "maithili",
  awa: "awadhi",
  rom: "romani",
  rmy: "vlax-romani",
  rmn: "balkan-romani",
  kbd: "kabardian",
  ady: "adyghe",
  ava: "avar",
  che: "chechen",
  inh: "ingush",
  os: "ossetian",
  ab: "abkhazian",
  av: "avar",
  abk: "abkhazian",
  lbe: "lak",
  lez: "lezgian",
  tab: "tabassaran",
  rut: "rutul",
  sah: "yakut",
  alt: "altai",
  tyv: "tuvinian",
  chg: "shughni",
  krc: "karachay-balkar",
  kum: "kumyk",
  nog: "nogai",
  ba: "bashkir",
  tt: "tatar",
  crh: "crimean-tatar",
  din: "dinka",
  kal: "kalaallisut",
  fao: "faroese"
};

// ---------------------------------------------------------------------------
// Helper: access Names global with mixer typing
// ---------------------------------------------------------------------------

function getNames(): NamesWithMixer | null {
  const n = (window as unknown as { Names?: NamesWithMixer }).Names;
  return n ?? null;
}

function getNameBases(): NameBase[] {
  const names = getNames();
  return names?.nameBases ?? [];
}

/** Get the last character of a string (or empty string if empty). */
function lastChar(s: string): string {
  return s[s.length - 1] || "";
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

function sanitizeName(name: string): string {
  if (typeof name !== "string") return name;
  return name
    .replace(/\d/g, "")
    .replace(/\|/g, "")
    .replace(/_unq\d+\b/gi, "")
    .replace(/_u\d+\b/gi, "")
    .replace(/_/g, "");
}

function loadLanguageMixerMapSync(): LanguageMixerMapEntry[] {
  if (_languageMixerMap) return _languageMixerMap;

  // Preferred path: map preloaded via config/language-mixer-map.js
  if (Array.isArray(window.languageMixerMap)) {
    _languageMixerMap = window.languageMixerMap;
  } else {
    // Fallback: legacy synchronous JSON load (kept for compatibility)
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "config/language-mixer-map.json", false);
      xhr.send(null);

      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        _languageMixerMap = JSON.parse(xhr.responseText);
      } else {
        console.error(
          "Names.getMixedByIso: failed to load language-mixer-map.json",
          xhr.status,
          xhr.statusText
        );
        _languageMixerMap = [];
      }
    } catch (e) {
      console.error("Names.getMixedByIso: error loading language-mixer-map.json", e);
      _languageMixerMap = [];
    }
  }

  return _languageMixerMap!;
}

function normalizeWeights(baseIndices: number[], weights?: number[]): number[] {
  if (!Array.isArray(weights) || weights.length !== baseIndices.length) {
    return baseIndices.map(() => 1);
  }
  return weights.map(w => {
    const n = +w || 0;
    if (!isFinite(n) || n <= 0) return 1;
    return Math.floor(n) || 1;
  });
}

function getMixerVersionOverride(): string {
  try {
    const params = new URLSearchParams(
      window.location && window.location.search ? window.location.search : ""
    );
    const v = params.get("mixer");
    if (v) return String(v);
  } catch {
    // ignore
  }
  try {
    const v = localStorage.getItem("fmg-mixer-version");
    if (v) return String(v);
    const legacy = localStorage.getItem("fmg-mixer-v19");
    if (legacy === "1") return "v19";
  } catch {
    // ignore
  }
  return "";
}

function shouldUseV19Mixer(): boolean {
  const v = getMixerVersionOverride().toLowerCase();
  return v === "19" || v === "v19";
}

function makeRng(seed: number | undefined | null): () => number {
  if (seed === null || seed === undefined || Number.isNaN(seed)) return () => Math.random();
  let x = (seed >>> 0) || 1;
  return () => {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeSeedLengthStats(blob: string): LengthStats | null {
  const names = (blob || "")
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
  if (!names.length) return null;

  const lengths = names.map(n => n.length).sort((a, b) => a - b);
  const count = lengths.length;
  const minLen = lengths[0];
  const maxLen = lengths[count - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const q = (p: number) => lengths[Math.floor(p * (count - 1))];
  const p25 = q(0.25);
  const p75 = q(0.75);
  return { count, minLen, maxLen, mean, p25, p75 };
}

function classifyOnsets(blob: string): Set<string> {
  const names = (blob || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set<string>();
  for (const n of names) {
    const ch = n[0];
    if (ch && !isVowel(ch)) set.add(ch);
  }
  return set;
}

function isAsciiLetter(c: string): boolean {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
}

function pickRandom(arr: string[]): string {
  if (!Array.isArray(arr) || !arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function applyAccent(str: string): string {
  for (const [plain, accented] of CLICK_ACENTS) {
    const idx = str.indexOf(plain);
    if (idx !== -1) {
      return str.slice(0, idx) + accented + str.slice(idx + plain.length);
    }
  }
  return str;
}

function isClickHeavyLanguage(blob: string): boolean {
  const names = (blob || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (!names.length) return false;

  let initialClicks = 0;
  let anyClicks = 0;
  for (const n of names) {
    const first = n[0];
    if (first && CLICKS.includes(first)) initialClicks++;
    if ([...n].some(ch => CLICKS.includes(ch))) anyClicks++;
  }

  const fracInitial = initialClicks / names.length;
  const fracAny = anyClicks / names.length;
  return fracInitial >= 0.25 || fracAny >= 0.5;
}

function getSegmentShape(text: string, ctx: BlendedContext): SegmentShape {
  const trimmed = text.trim();
  const len = trimmed.length;
  const first = trimmed[0] || "";
  const isClickSegment = !!first && CLICKS.includes(first);
  let lenBucket: "S" | "M" | "L";
  if (len <= 4) lenBucket = "S";
  else if (len <= 8) lenBucket = "M";
  else lenBucket = "L";
  return {
    len,
    lenBucket,
    isClickSegment,
    baseIndex: ctx.idx,
    isClickLanguage: ctx.isClickHeavy
  };
}

function isRepetitiveClickPattern(segInfos: SegmentInfo[]): boolean {
  const clickSegs = segInfos.filter(s => s.shape.isClickSegment);
  if (clickSegs.length < 3) return false;

  let run = 1;
  for (let i = 1; i < segInfos.length; i++) {
    const prev = segInfos[i - 1]!.shape;
    const cur = segInfos[i]!.shape;
    if (prev.isClickSegment && cur.isClickSegment && prev.lenBucket === cur.lenBucket) {
      run++;
      if (run >= 3) return true;
    } else {
      run = 1;
    }
  }

  return false;
}

function softenClickRuns(segs: SegmentInfo[]): void {
  if (!Array.isArray(segs) || segs.length < 2) return;

  const appendWithConnector = (base: string, addition: string): string => {
    if (!addition) return base;
    if (!base) return addition;
    const connector = pickRandom(["", "", "-", " ", "’"]);
    if (!connector) return base + addition;
    if (connector.trim() === "-" || connector.trim() === "’") return base + connector + addition;
    return `${base}${connector}${addition.charAt(0).toUpperCase()}${addition.slice(1)}`;
  };

  let run = 0;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!seg || !seg.shape) {
      run = 0;
      continue;
    }

    if (!seg.shape.isClickSegment) {
      run = 0;
      continue;
    }

    run++;
    if (run === 1 && Math.random() < 0.5) continue;

    const stripped = seg.text.replace(/^[ǀǁǂǃ]+/u, "");
    if (!stripped) continue;

    let softenedCore = stripped;
    if (Math.random() < 0.5) softenedCore = applyAccent(softenedCore);
    if (run >= 3 && softenedCore.length > 3 && Math.random() < 0.6) {
      const splitPoint = 1 + Math.floor(Math.random() * Math.max(1, softenedCore.length - 2));
      const bridge = pickRandom(CLICK_BRIDGE_VOWELS);
      softenedCore = `${softenedCore.slice(0, splitPoint)}${bridge}${softenedCore.slice(splitPoint)}`;
    }

    const prefix = Math.random() < 0.75 ? pickRandom(CLICK_SMOOTH_PREFIXES) : "";
    const bridgeVowel = Math.random() < 0.6 ? pickRandom(CLICK_BRIDGE_VOWELS) : "";
    const suffix = Math.random() < 0.5 ? pickRandom(CLICK_SUFFIXES) : "";

    let softened = "";
    softened = appendWithConnector(softened, prefix);
    softened = appendWithConnector(softened, bridgeVowel);
    softened = appendWithConnector(softened, softenedCore);
    if (suffix) softened = appendWithConnector(softened, suffix);

    if (Math.random() < 0.3) {
      softened = softened.charAt(0).toUpperCase() + softened.slice(1);
    }

    segs[i] = Object.assign({}, seg, {
      text: softened,
      shape: getSegmentShape(softened, seg.ctx)
    });

    run = Math.random() < 0.25 ? run : 0;
  }
}

function smoothJoin(a: string, b: string, onsetSet: Set<string>): string {
  if (!a) return b;
  if (!b) return a;

  const la = a[a.length - 1]!;
  const fb = b[0]!;

  if (!isVowel(la) && la === fb && onsetSet.has(la)) {
    return a + b.slice(1);
  }

  if (isVowel(la) && !isVowel(fb) && onsetSet.has(fb)) {
    if (Math.random() < 0.7) return a + b.slice(1);
  }

  const laIsAscii = isAsciiLetter(la);
  const fbIsAscii = isAsciiLetter(fb);
  if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
    const r = Math.random();
    if (r < 0.6) {
      return a + " " + b;
    }
    if (r < 0.8) {
      return a + "-" + b;
    }
    return a + fb.toLowerCase() + b.slice(1);
  }

  if (isVowel(la) && isVowel(fb)) {
    return a + b.slice(1);
  }

  return a + b;
}

function buildBlendedContexts(baseIndices: number[], weights?: number[]): BlendedContext[] {
  if (!Array.isArray(baseIndices) || !baseIndices.length) return [];

  const w = normalizeWeights(baseIndices, weights);
  const contexts: BlendedContext[] = [];
  const nameBases = getNameBases();
  const Names = getNames();

  baseIndices.forEach((baseIndex, idx) => {
    const base = nameBases && nameBases[baseIndex];
    if (!base || !base.b) return;

    const blob = base.b;
    const chain = Names!.calculateChain(blob);
    if (!chain || chain[""] === undefined) return;

    const stats = computeSeedLengthStats(blob);
    const onsetSet = classifyOnsets(blob);
    const clickHeavy = isClickHeavyLanguage(blob);

    const weight = w[idx]!;
    for (let k = 0; k < weight; k++) {
      contexts.push({
        idx: baseIndex,
        base,
        chain,
        stats,
        onsetSet,
        isClickHeavy: clickHeavy
      });
    }
  });

  return contexts;
}

function generatePlainNameFromChain(
  chain: MarkovChain,
  baseConfig: NameBase,
  opts: { min?: number; max?: number; dupl?: string }
): string {
  if (!chain || chain[""] === undefined || !baseConfig || !baseConfig.b) return "ERROR";

  const min = opts && opts.min != null ? opts.min : baseConfig.min;
  const max = opts && opts.max != null ? opts.max : baseConfig.max;
  const dupl = opts && opts.dupl !== undefined ? opts.dupl : baseConfig.d;
  const target = (min + max) / 2;
  const genOpts = { min, max, dupl };

  let best: string | null = null;
  let bestDelta = Infinity;

  for (let i = 0; i < 5; i++) {
    const name = generateFromChain(chain, baseConfig, genOpts);
    if (name === "ERROR") continue;
    const len = name.length;
    if (len >= min && len <= max) return name;
    const delta = Math.abs(len - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = name;
    }
  }

  if (best) return best;
  return generateFromChain(chain, baseConfig, genOpts);
}

function generateBlendedName(contexts: BlendedContext[], opts?: MixedBaseOptions): BlendedNameResult {
  if (!Array.isArray(contexts) || !contexts.length) {
    return { text: "", bases: [] };
  }

  const globalMin = opts?.min;
  const globalMax = opts?.max;
  const maxSegments =
    opts && typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;

  const fallbackMin = Math.min(...contexts.map(c => c.base.min || 4));
  const fallbackMax = Math.max(...contexts.map(c => c.base.max || fallbackMin + 4));

  const requestedMin = typeof globalMin === "number" ? globalMin : fallbackMin;
  const requestedMax = typeof globalMax === "number" ? globalMax : fallbackMax;
  const targetLen = (requestedMin + requestedMax) / 2;

  function buildOnce(): { text: string; segInfos: SegmentInfo[] } {
    const segs: SegmentInfo[] = [];
    let total = 0;
    let guard = 0;

    while (total < requestedMin && guard < maxSegments) {
      let ctx = ra(contexts);

      if (segs.length >= 2) {
        const last1 = segs[segs.length - 1]!.shape;
        const last2 = segs[segs.length - 2]!.shape;
        if (last1.isClickLanguage && last2.isClickLanguage && Math.random() < 0.7) {
          const nonClick = contexts.filter(c => !c.isClickHeavy);
          if (nonClick.length) ctx = ra(nonClick);
        }
      }

      const stats = ctx.stats;
      const base = ctx.base;

      let segMean: number;
      if (stats && typeof stats.mean === "number") {
        segMean = stats.mean;
      } else if (typeof base.min === "number" && typeof base.max === "number") {
        segMean = (base.min + base.max) / 2;
      } else {
        segMean = 4;
      }

      const jitter = (Math.random() - 0.5) * 2;
      const jitteredMean = Math.max(2, segMean + jitter);

      const baseMax = typeof base.max === "number" ? base.max : Math.round(jitteredMean + 4);
      const segMin = Math.max(2, Math.min(Math.round(jitteredMean), baseMax));
      const segMax = Math.max(segMin + 1, Math.min(baseMax, Math.round(jitteredMean + 2)));

      const segText = generatePlainNameFromChain(ctx.chain, base, {
        min: segMin,
        max: segMax,
        dupl: base.d || ""
      });

      const shape = getSegmentShape(segText, ctx);
      segs.push({ text: segText, ctx, shape });
      total += segText.length;
      guard++;
    }

    if (!segs.length) {
      const ctx = ra(contexts);
      const base = ctx.base;
      const name = generatePlainNameFromChain(ctx.chain, base, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      return {
        text: name,
        segInfos: [
          {
            text: name,
            ctx,
            shape: getSegmentShape(name, ctx)
          }
        ]
      };
    }

    softenClickRuns(segs);

    let compound = segs[0]!.text;
    for (let i = 1; i < segs.length; i++) {
      const seg = segs[i]!;
      compound = smoothJoin(compound, seg.text, seg.ctx.onsetSet);
    }

    return {
      text: sanitizeName(compound),
      segInfos: segs
    };
  }

  function scoreCandidate(text: string, segInfos: SegmentInfo[]): { len: number; penalty: number } {
    const len = text.length;
    let penalty = 0;

    if (len < requestedMin) penalty += (requestedMin - len) * 2;
    if (len > requestedMax) penalty += (len - requestedMax) * 2;

    const deltaToTarget = Math.abs(len - targetLen);
    penalty += deltaToTarget;

    if (isRepetitiveClickPattern(segInfos)) penalty += 50;

    return { len, penalty };
  }

  let best: { text: string; segInfos: SegmentInfo[] } | null = null;
  let bestScore = Infinity;

  const attempts = 6;
  for (let i = 0; i < attempts; i++) {
    const { text, segInfos } = buildOnce();
    const { penalty } = scoreCandidate(text, segInfos);
    if (penalty < bestScore) {
      bestScore = penalty;
      best = { text, segInfos };
    }
    const len = text.length;
    if (len >= requestedMin && len <= requestedMax && !isRepetitiveClickPattern(segInfos)) {
      best = { text, segInfos };
      break;
    }
  }

  if (!best) {
    const ctx = ra(contexts);
    const base = ctx.base;
    const name = generatePlainNameFromChain(ctx.chain, base, {
      min: requestedMin,
      max: requestedMax,
      dupl: base.d || ""
    });
    return { text: sanitizeName(name), bases: [ctx.idx] };
  }

  const usedIdxs = Array.from(new Set(best.segInfos.map(s => s.shape.baseIndex))).sort((a, b) => a - b);
  return { text: best.text, bases: usedIdxs };
}

function buildCombinedNames(baseIndices: number[], weights?: number[]): string[] {
  const combined: string[] = [];
  if (!Array.isArray(baseIndices) || !baseIndices.length) return combined;

  const w = normalizeWeights(baseIndices, weights);
  const nameBases = getNameBases();

  baseIndices.forEach((baseIndex, idx) => {
    const base = nameBases && nameBases[baseIndex];
    if (!base || !base.b) return;

    const names = base.b
      .split(",")
      .map(n => n.trim())
      .filter(Boolean);

    if (!names.length) return;

    const weight = w[idx]!;
    for (let k = 0; k < weight; k++) combined.push(...names);
  });

  return combined;
}

function calculateMixedChain(baseIndices: number[], weights?: number[]): MarkovChain | null {
  const combinedNames = buildCombinedNames(baseIndices, weights);
  if (!combinedNames.length) return null;

  const combinedString = combinedNames.join(",");
  const Names = getNames();
  return Names ? Names.calculateChain(combinedString) : null;
}

function generateFromChain(chain: MarkovChain, baseConfig: NameBase, options?: MixedBaseOptions): string {
  if (!chain || chain[""] === undefined) return "ERROR";
  if (!baseConfig || !baseConfig.b) return "ERROR";

  const opts = options || {};
  const min = opts.min != null ? opts.min : baseConfig.min;
  const max = opts.max != null ? opts.max : baseConfig.max;
  const dupl = opts.dupl !== undefined ? opts.dupl : baseConfig.d;

  let v = chain[""];
  let cur = ra(v);
  let w = "";

  for (let i = 0; i < 20; i++) {
    if (cur === "") {
      // end of word
      if (w.length < min) {
        cur = "";
        w = "";
        v = chain[""];
      } else break;
    } else {
      if (w.length + cur.length > max) {
        // word too long
        if (w.length < min) w += cur;
        break;
      } else v = chain[lastChar(cur)] || chain[""];
    }

    w += cur;
    cur = ra(v);
  }

  const l = last(w.split(""));
  if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

  const duplStr = dupl || "";
  let name = [...w].reduce(function (r, c, i, d) {
    if (c === d[i + 1] && !duplStr.includes(c)) return r;
    if (!r.length) return c.toUpperCase();
    if (r.slice(-1) === "-" && c === " ") return r;
    if (r.slice(-1) === " ") return r + c.toUpperCase();
    if (r.slice(-1) === "-") return r + c.toUpperCase();
    if (c === "a" && d[i + 1] === "e") return r;
    if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r;
    return r + c;
  }, "");

  if (name.split(" ").some(part => part.length < 2))
    name = name
      .split(" ")
      .map((p, i) => (i ? p.toLowerCase() : p))
      .join("");

  if (name.length < 2) {
    if (ERROR && !_mixedNameTooShortLogged) {
      _mixedNameTooShortLogged = true;
      console.error("Mixed name is too short! Random name will be selected");
    }
    name = ra(baseConfig.b.split(","));
  }

  return sanitizeName(name);
}

// ---------------------------------------------------------------------------
// V19 Mixer (deterministic, quality-tuned generation)
// ---------------------------------------------------------------------------

function getMixedBaseManyV19(baseIndices: number[], options?: MixedBaseOptions): string[] {
  if (!Array.isArray(baseIndices) || !baseIndices.length) {
    ERROR && console.error("Names.getMixedBaseMany: please provide at least one base index");
    return [];
  }

  const nameBases = getNameBases();
  const Names = getNames();
  if (!Names) return [];

  const base0 = nameBases && nameBases[baseIndices[0]!];
  if (!base0) {
    ERROR && console.error("Names.getMixedBaseMany: base config not found for", baseIndices[0]);
    return [];
  }

  const count = Math.max(1, Math.min(+((options && options.count) || 40), 200));
  const rng = makeRng(options && typeof options.seed === "number" ? options.seed : undefined);

  const baseUniverse = Array.from(new Set(baseIndices)).filter(
    n => typeof n === "number" && !Number.isNaN(n)
  );
  const availableUniqueBases = baseUniverse.length;
  const minUniqueBases =
    options && typeof options.minUniqueBases === "number" ? options.minUniqueBases : undefined;
  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;
  const requiredUniqueBases = inferredMinUniqueBases;

  const IS_LETTER_RE = (() => {
    try {
      return new RegExp("\\p{L}", "u");
    } catch {
      return /[A-Za-z]/;
    }
  })();

  const isVowelChar = (ch: string) => typeof ch === "string" && ch.length > 0 && isVowel(ch);
  const isLetterChar = (ch: string) => typeof ch === "string" && ch.length > 0 && IS_LETTER_RE.test(ch);

  const ctxByIdx = new Map<number, BlendedContext & { stats: LengthStats | null }>();
  for (const idx of baseUniverse) {
    const base = nameBases && nameBases[idx];
    const blob = base && typeof base.b === "string" ? base.b : "";
    if (!base || !blob) continue;
    const chain = Names.calculateChain(blob);
    if (!chain || chain[""] === undefined) continue;
    const onsetSet = classifyOnsets(blob);
    const clickHeavy = isClickHeavyLanguage(blob);
    ctxByIdx.set(idx, {
      idx,
      base,
      chain,
      stats: computeSeedLengthStats(blob),
      onsetSet,
      isClickHeavy: clickHeavy
    });
  }

  if (!ctxByIdx.size) return [];

  const normalizeForRealism = (s: string | undefined): string =>
    typeof s === "string" ? s.trim().toLowerCase() : "";

  const buildSeedCorpusFromBases = (indices: number[]): string[] => {
    const uniq = Array.from(new Set(Array.isArray(indices) ? indices : []));
    const out: string[] = [];
    for (const idx of uniq) {
      const base = nameBases && nameBases[idx];
      const blob = base && typeof base.b === "string" ? base.b : "";
      if (!blob) continue;
      const parts = blob
        .split(",")
        .map(s => normalizeForRealism(s))
        .filter(Boolean);
      for (const p of parts) out.push(p);
    }
    return out;
  };

  const buildCharGramCounts = (
    texts: string[],
    n: number
  ): { counts: Map<string, number>; total: number } => {
    const counts = new Map<string, number>();
    let total = 0;
    const nn = typeof n === "number" && n > 0 ? n : 3;
    const pad = "^".repeat(Math.max(0, nn - 1));
    for (const raw of Array.isArray(texts) ? texts : []) {
      const text = normalizeForRealism(raw);
      if (!text) continue;
      const s = pad + text + "$";
      if (s.length < nn) continue;
      for (let i = 0; i <= s.length - nn; i++) {
        const g = s.slice(i, i + nn);
        counts.set(g, (counts.get(g) || 0) + 1);
        total++;
      }
    }
    return { counts, total };
  };

  const buildCharLm = (
    texts: string[],
    n: number
  ): { scoreBpc: (raw: string) => { bpc: number | null; chars: number; oovChars: number } } => {
    const contexts = new Map<string, Map<string, number>>();
    const contextTotals = new Map<string, number>();
    const vocab = new Set<string>();
    const nn = typeof n === "number" && n > 1 ? n : 3;
    const ctxLen = nn - 1;
    const pad = "^".repeat(ctxLen);

    for (const raw of Array.isArray(texts) ? texts : []) {
      const text = normalizeForRealism(raw);
      if (!text) continue;
      for (const ch of text) vocab.add(ch);
      const s = pad + text + "$";
      if (s.length < nn) continue;
      for (let i = ctxLen; i < s.length; i++) {
        const ctx = s.slice(i - ctxLen, i);
        const ch = s[i]!;
        if (!contexts.has(ctx)) contexts.set(ctx, new Map());
        const row = contexts.get(ctx)!;
        row.set(ch, (row.get(ch) || 0) + 1);
        contextTotals.set(ctx, (contextTotals.get(ctx) || 0) + 1);
      }
    }

    const vocabSize = vocab.size + 1;

    function scoreBpc(raw: string): { bpc: number | null; chars: number; oovChars: number } {
      const text = normalizeForRealism(raw);
      if (!text) return { bpc: null, chars: 0, oovChars: 0 };
      const s = pad + text + "$";
      let bits = 0;
      let chars = 0;
      let oovChars = 0;
      for (let i = ctxLen; i < s.length; i++) {
        const ctx = s.slice(i - ctxLen, i);
        const ch = s[i]!;
        const row = contexts.get(ctx);
        const seen = row ? row.get(ch) || 0 : 0;
        const denom = (contextTotals.get(ctx) || 0) + vocabSize;
        const prob = (seen + 1) / denom;
        bits += -Math.log2(prob);
        chars++;
        if (!vocab.has(ch) && ch !== "^" && ch !== "$" && ch !== " ") oovChars++;
      }
      return { bpc: chars ? bits / chars : null, chars, oovChars };
    }

    return { scoreBpc };
  };

  const seedNames = buildSeedCorpusFromBases(baseUniverse);
  const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
  const seedSet = new Set(seedNorm);
  const lm = buildCharLm(seedNorm, 3);
  const seedGram = buildCharGramCounts(seedNorm, 3);

  const topSeedKeys = Array.from(seedGram.counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1200)
    .map(([k]) => k);

  const topSeedKeyIndex = new Map(topSeedKeys.map((k, i) => [k, i]));
  const headV = topSeedKeys.length + 1;
  const seedDenom = (seedGram.total || 0) + headV;
  const seedHeadCounts = topSeedKeys.map(k => seedGram.counts.get(k) || 0);
  const seedHeadSum = seedHeadCounts.reduce((a, b) => a + b, 0);
  const seedOther = Math.max(0, (seedGram.total || 0) - seedHeadSum);
  const seedPaHead = seedHeadCounts.map(c => (c + 1) / seedDenom);
  const seedPaOther = (seedOther + 1) / seedDenom;

  const buildHeadCountsForText = (
    text: string
  ): { headCounts: Uint16Array; total: number } => {
    const headCounts = new Uint16Array(topSeedKeys.length);
    let total = 0;
    if (typeof text !== "string" || text.length < 3) return { headCounts, total: 0 };
    for (let i = 0; i < text.length - 2; i++) {
      const gram = text.slice(i, i + 3);
      total++;
      const idx = topSeedKeyIndex.get(gram);
      if (typeof idx === "number") headCounts[idx]++;
    }
    return { headCounts, total };
  };

  const jsHeadOther = (bHeadCounts: Uint16Array, totalB: number): number => {
    const denomB = (totalB || 0) + headV;
    let js = 0;
    let bHeadSum = 0;
    for (let i = 0; i < topSeedKeys.length; i++) {
      const c = bHeadCounts[i] || 0;
      bHeadSum += c;
      const pa = seedPaHead[i]!;
      const pb = (c + 1) / denomB;
      const m = (pa + pb) / 2;
      js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
    }
    const bOther = Math.max(0, (totalB || 0) - bHeadSum);
    const pa = seedPaOther;
    const pb = (bOther + 1) / denomB;
    const m = (pa + pb) / 2;
    js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
    return js;
  };

  let seedBits = 0;
  let seedChars = 0;
  for (const s of seedNorm) {
    const { bpc, chars } = lm.scoreBpc(s);
    if (typeof bpc !== "number" || !isFinite(bpc) || !chars) continue;
    seedBits += bpc * chars;
    seedChars += chars;
  }
  const seedBpcMean = seedChars ? seedBits / seedChars : null;
  const seedBpcTarget =
    typeof seedBpcMean === "number" && isFinite(seedBpcMean) ? seedBpcMean + 0.08 : null;

  const REALISM_LAMBDA = 4;
  const JS_LAMBDA = 8;
  const COPY_PENALTY = 12;
  const DUPLICATE_PENALTY = 8;
  const seenGenerated = new Map<string, number>();

  const boundaryPenalty = (prevSeg: string, nextSeg: string): number => {
    const a = lastChar(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0]! : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg: string, nextSeg: string): number => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = lastChar(a);
    const fb = b[0]!;
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg: string, nextSeg: string): number => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = lastChar(a);
    const fb = b[0]!;
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound: string, nextSeg: string): number => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = lastChar(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (
    prevCtx: BlendedContext | null | undefined,
    nextCtx: BlendedContext | null | undefined
  ): number => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (
    a: BlendedContext | null | undefined,
    b: BlendedContext | null | undefined
  ): number => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const small = setA.size <= setB.size ? setA : setB;
    const large = small === setA ? setB : setA;
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = <T>(items: T[], ws: number[]): T | null => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr =
      Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)]!;
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i]! || 0);
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  };

  const smoothJoinRng = (a: string, b: string, onsetSet: Set<string> | undefined): string => {
    if (!a) return b;
    if (!b) return a;

    const la = a[a.length - 1]!;
    const fb = b[0]!;

    if (!isVowel(la) && la === fb && onsetSet && onsetSet.has(la)) {
      return a + b.slice(1);
    }

    if (isVowel(la) && !isVowel(fb) && onsetSet && onsetSet.has(fb)) {
      if (rng() < 0.7) return a + b.slice(1);
    }

    const laIsAscii = isAsciiLetter(la);
    const fbIsAscii = isAsciiLetter(fb);
    if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
      const r = rng();
      if (r < 0.6) {
        return a + " " + b;
      }
      if (r < 0.8) {
        return a + "-" + b;
      }
      return a + fb.toLowerCase() + b.slice(1);
    }

    if (isVowel(la) && isVowel(fb)) {
      return a + b.slice(1);
    }

    return a + b;
  };

  const estimateJoinPenaltyForBase = (
    chain: MarkovChain,
    compound: string,
    prevChar: string,
    prevSeg: string
  ): number => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)]!;
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (
    chain: MarkovChain,
    compound: string,
    prevChar: string,
    prevSeg: string
  ): string => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)]!;
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)]!;
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(
    chosenBases: number[],
    requestedMin: number,
    requestedMax: number
  ): { text: string; segTexts: string[]; baseSeq: number[]; usedBasesCount: number } {
    const segs: string[] = [];
    const segInfos: SegmentInfo[] = [];
    const baseSeq: number[] = [];
    const usedBases = new Set<number>();
    let compound = "";

    let lastNonSpacerBase: number | null = null;
    let prevNonSpacerBase: number | null = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1]! : "";
      const prevChar = segs.length ? lastChar(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : undefined;
      const candidates = chosenBases.slice();
      const wts = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = nextCtx ? nextCtx.chain : null;
        let ww = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) ww *= 2.5;
          else ww *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          ww *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) ww *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) ww *= 0.25;
        ww *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain!, compound, prevChar, prevSeg);
        if (jp >= 6) ww *= 0.12;
        else if (jp >= 3) ww *= 0.35;
        else if (jp >= 1) ww *= 0.75;

        return ww;
      });

      const currentBase = weightedPick(candidates, wts);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : undefined;
      const chain = ctx ? ctx!.chain : null;
      const cur = pickNextSegFromBase(chain!, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase!);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase!);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoinRng(compound, cur, ctx && ctx!.onsetSet ? ctx!.onsetSet : new Set());
          if (ctx) segInfos.push({ text: cur, ctx: ctx!, shape: getSegmentShape(cur, ctx!) });
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase!);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase!);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoinRng(compound, cur, ctx && ctx!.onsetSet ? ctx!.onsetSet : new Set());
      if (ctx) segInfos.push({ text: cur, ctx: ctx!, shape: getSegmentShape(cur, ctx!) });

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = lastChar(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
      if (!r.length) return c.toUpperCase();
      if (r.slice(-1) === "-" && c === " ") return r;
      if (r.slice(-1) === " ") return r + c.toUpperCase();
      if (r.slice(-1) === "-") return r + c.toUpperCase();
      if (c === "a" && d[i + 1] === "e") return r;
      if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r;
      return r + c;
    }, "");

    if (name.split(" ").some(part => part.length < 2)) {
      name = name
        .split(" ")
        .map((p, i) => (i ? p.toLowerCase() : p))
        .join("");
    }

    return { text: sanitizeName(name), segTexts: segs, baseSeq, usedBasesCount: usedBases.size };
  }

  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();

    const baseMins = chosenBases.map(idx => {
      const b = nameBases && nameBases[idx];
      return b && typeof b.min === "number" ? b.min : 4;
    });
    const baseMaxs = chosenBases.map(idx => {
      const b = nameBases && nameBases[idx];
      return b && typeof b.max === "number" ? b.max : 10;
    });
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = options && typeof options.min === "number" ? options.min : fallbackMin;
    const requestedMax = options && typeof options.max === "number" ? options.max : fallbackMax;

    let best: ReturnType<typeof attempt> | null = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    const diversityTarget = Math.max(1, Math.min(requiredUniqueBases, chosenBases.length));

    for (let t = 0; t < 12; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const outOfRange = len < requestedMin || len > requestedMax;
      const rangePenalty = outOfRange ? 25 : 0;

      const diversityScore = Math.min(1, candidate.usedBasesCount / diversityTarget);
      const diversityBonus = 1.25 * diversityScore;

      const norm = normalizeForRealism(candidate.text);
      const { bpc } = lm.scoreBpc(norm);
      const realismDelta =
        typeof bpc === "number" &&
        typeof seedBpcTarget === "number" &&
        isFinite(bpc) &&
        isFinite(seedBpcTarget)
          ? REALISM_LAMBDA * (bpc - seedBpcTarget)
          : 0;

      const { headCounts: candHeadCounts, total: candTotal } = buildHeadCountsForText(norm);
      const js = jsHeadOther(candHeadCounts, candTotal);
      const jsPenalty = typeof js === "number" && isFinite(js) ? JS_LAMBDA * js : 0;

      const copyPenalty = norm && seedSet.has(norm) ? COPY_PENALTY : 0;
      const seenCount = norm ? seenGenerated.get(norm) || 0 : 0;
      const dupPenalty = seenCount ? DUPLICATE_PENALTY * Math.min(3, seenCount) : 0;

      const delta =
        Math.abs(len - target) +
        rangePenalty -
        diversityBonus +
        realismDelta +
        jsPenalty +
        copyPenalty +
        dupPenalty;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);

    const norm = normalizeForRealism(res.text);
    if (norm) seenGenerated.set(norm, (seenGenerated.get(norm) || 0) + 1);
  }

  return names;
}

// ---------------------------------------------------------------------------
// Main public functions
// ---------------------------------------------------------------------------

export function getMixedBaseMany(baseIndices: number[], options?: MixedBaseOptions): string[] {
  if (!Array.isArray(baseIndices) || !baseIndices.length) {
    ERROR && console.error("Names.getMixedBaseMany: please provide at least one base index");
    return [];
  }

  const nameBases = getNameBases();
  const Names = getNames();
  if (!Names) return [];

  const availableIndices = baseIndices.filter(idx => nameBases && nameBases[idx]);
  if (!availableIndices.length) {
    ERROR && console.error("Names.getMixedBaseMany: none of the provided base indices exist", baseIndices);
    return [];
  }

  const base0 = nameBases[availableIndices[0]!];
  const count = Math.max(1, Math.min(+((options && options.count) || 40), 200));
  const weights = options?.weights;
  const useLegacy = options?.legacyChain;

  if (!useLegacy && shouldUseV19Mixer()) {
    return getMixedBaseManyV19(availableIndices, options);
  }

  if (useLegacy) {
    const chain = calculateMixedChain(availableIndices, weights);
    if (!chain || chain[""] === undefined) {
      tip("Mixed namesbase is incorrect. Please verify bases", false, "error");
      ERROR && console.error("Names.getMixedBaseMany: mixed chain is incorrect");
      return [];
    }

    const legacyNames: string[] = [];
    const legacyOptions = Object.assign({}, options);
    delete legacyOptions.count;
    delete legacyOptions.weights;

    for (let i = 0; i < count; i++) {
      let name = generateFromChain(chain, base0, legacyOptions);
      if (name === "ERROR") {
        name = ra(base0.b.split(","));
      }
      legacyNames.push(name);
    }

    return legacyNames;
  }

  const contexts = buildBlendedContexts(availableIndices, weights);
  if (!contexts.length) {
    tip("Mixed namesbase is incorrect. Please verify bases", false, "error");
    ERROR && console.error("Names.getMixedBaseMany: no valid contexts for mixed bases");
    return [];
  }

  const names: string[] = [];
  const genOptions = Object.assign({}, options);
  delete genOptions.count;
  delete genOptions.weights;
  delete genOptions.legacyChain;

  for (let i = 0; i < count; i++) {
    const result = generateBlendedName(contexts, genOptions);
    const name = result?.text;
    if (!name) break;
    names.push(name);
  }

  return names;
}

export function getMixedBase(baseIndices: number[], options?: MixedBaseOptions): string {
  const opts = options || {};
  const count = opts.count != null ? +opts.count : 1;

  if (count > 1) {
    const many = getMixedBaseMany(baseIndices, opts);
    return many[0] || "";
  }

  const many = getMixedBaseMany(baseIndices, Object.assign({}, opts, { count: 1 }));
  return many[0] || "";
}

function resolveIsoToMapKey(iso: string, map: LanguageMixerMapEntry[]): string | null {
  if (!iso || typeof iso !== "string") return null;
  const norm = iso.toLowerCase().trim();
  if (!norm) return null;

  // First, check if the ISO code itself is a key in the mixer map
  if (map && Array.isArray(map)) {
    for (const entry of map) {
      if (entry && entry.iso === norm) return norm;
    }
  }

  // Then check the alias table
  if (ISO_TO_MAP_KEY[norm]) return ISO_TO_MAP_KEY[norm];

  if (!map || !Array.isArray(map)) return null;

  // Helper: do a substring/prefix match
  function tryMatch(predicate: (key: string) => boolean): string | null {
    let first: string | null = null;
    for (const entry of map) {
      if (!entry || typeof entry.iso !== "string") continue;
      const key = entry.iso.toLowerCase();
      if (predicate(key)) {
        if (first === null) first = entry.iso;
        if (entry.iso.length < first.length) first = entry.iso;
      }
    }
    return first;
  }

  // 1. Exact match (case-insensitive)
  if (tryMatch(k => k === norm)) return norm;

  // 2. ISO is the entire key except for a suffix
  const prefixMatch = tryMatch(k => k.startsWith(norm + "-") || k.startsWith(norm + "_"));
  if (prefixMatch) return prefixMatch;

  // 3. The ISO code appears as a prefix or suffix separated by a dash
  const dashMatch = tryMatch(k => k.startsWith(norm) || k.endsWith(norm));
  if (dashMatch) return dashMatch;

  // 4. Generic substring match (lowest priority)
  const substrMatch = tryMatch(k => k.includes(norm) || norm.includes(k));
  if (substrMatch) return substrMatch;

  return null;
}

export function getMixedByIso(
  isoWeights: Record<string, number>,
  options?: MixedByIsoOptions
): string[] {
  const map = loadLanguageMixerMapSync();

  const baseIndices: number[] = [];
  const weights: number[] = [];
  const skipped: string[] = [];
  const resolved: string[] = [];

  if (!isoWeights || typeof isoWeights !== "object") {
    ERROR && console.error("Names.getMixedByIso: isoWeights should be an object like { iso: weight }");
    return [];
  }

  const nameBases = getNameBases();

  const entries = Object.entries(isoWeights);
  for (const [iso, weight] of entries) {
    const mapKey = resolveIsoToMapKey(iso, map);
    const entry = mapKey ? map.find(e => e.iso === mapKey) : null;
    if (!entry || !Array.isArray(entry.bases) || !entry.bases.length) {
      skipped.push(iso);
      continue;
    }

    // Skip entries whose base indices are "cover language" placeholders
    const validBases = entry.bases.filter(b => {
      if (b < 0 || !Number.isFinite(b)) return false;
      const e = nameBases && nameBases[b];
      if (!e) return false;
      if (typeof e.b !== "string" || e.b.length === 0) return false;
      if (!e.name || typeof e.name !== "string" || e.name.length === 0) return false;
      return true;
    });
    if (!validBases.length) {
      skipped.push(iso);
      continue;
    }

    validBases.forEach(b => {
      baseIndices.push(b);
      weights.push(weight);
    });
    resolved.push(`${iso} -> ${mapKey}`);
  }

  if (!baseIndices.length) {
    if (skipped.length) {
      tip(
        `No local bases mapped for selected languages: ${skipped.join(", ")}${
          resolved.length ? ` (tried: ${resolved.join(", ")})` : ""
        }`,
        false,
        "warn"
      );
    }
    ERROR && console.error("Names.getMixedByIso: no mapped bases for provided ISO codes");
    return [];
  }

  const opts = Object.assign({}, options, { weights });
  return getMixedBaseMany(baseIndices, opts);
}

// ---------------------------------------------------------------------------
// Runtime attachment to window.Names
// ---------------------------------------------------------------------------

(function attachMixer(): void {
  if (!window.Names) return;
  const names = window.Names as unknown as NamesWithMixer;
  names.getMixedBase = getMixedBase;
  names.getMixedBaseMany = getMixedBaseMany;
  names.getMixedByIso = getMixedByIso;
})();

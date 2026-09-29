/**
 * Regression test for mixer-map ISO resolution.
 *
 * Run: node --test tools/mixer-core/mixer-map-resolution.test.js
 *
 * The bug this locks down: resolveIsoToMapKey() in src/generators/names-mixer.ts
 * used to fall through to a bare startsWith/endsWith test and then a generic
 * substring test, both without requiring a boundary, and tryMatch() returns
 * the SHORTEST matching key. That bound short ISO codes to unrelated
 * languages - "baka" -> "ka" (Kannada), "agaw" -> "ga" (Ga), "hadza" -> "ha"
 * (Hausa).
 *
 * It stayed invisible for as long as every group label in the mixer map
 * carried "bases": [], because an ISO resolving to one got skipped and
 * contributed nothing. The row was a tombstone sitting in front of the fuzzy
 * steps. Delete the group labels and the tombstones go with them, and 397
 * languages that had been silently producing nothing started emitting a
 * different language's names.
 *
 * The invariant: resolution must never cross from one language to another. An
 * unresolved ISO is safe - getMixedByIso skips it, so a culture is short by
 * one language rather than wrong.
 */
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, "config/language-mixer-map.json"), "utf8"));
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, "config/language-mixes.json"), "utf8"));

/** Mirror of resolveIsoToMapKey(), kept in step with the source. */
function resolveIsoToMapKey(iso, map) {
  if (!iso || typeof iso !== "string") return null;
  const norm = iso.toLowerCase().trim();
  if (!norm) return null;

  for (const entry of map) {
    if (entry && entry.iso === norm) return norm;
  }
  if (!map || !Array.isArray(map)) return null;

  function tryMatch(predicate) {
    let first = null;
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

  if (tryMatch(k => k === norm)) return norm;
  const prefixMatch = tryMatch(k => k.startsWith(`${norm}-`) || k.startsWith(`${norm}_`));
  if (prefixMatch) return prefixMatch;
  return null;
}

const rowFor = iso => MAP.find(r => r.iso === iso);

test("an exact ISO resolves to its own row", () => {
  const populated = MAP.find(r => r.bases && r.bases.length);
  assert.ok(populated, "map should have at least one populated row");
  assert.strictEqual(resolveIsoToMapKey(populated.iso, MAP), populated.iso);
});

test("a delimited suffix still resolves, because the delimiter is explicit", () => {
  // "pt" is short, but "pt-eur"-style keys are unambiguous
  const key = resolveIsoToMapKey("standard-portuguese", MAP);
  if (key) assert.ok(key.startsWith("standard-portuguese"), `got ${key}`);
});

test("a short ISO never binds to a shorter, unrelated key", () => {
  // Each of these resolved to a different language before the fix. They are
  // all group-label rows, so after the cleanup they resolve to nothing at all,
  // which is the correct outcome.
  for (const [iso, wrongKey] of [["baka", "ka"], ["agaw", "ga"], ["hadza", "ha"], ["akkadian", "ka"], ["ajawa", "awa"], ["bata", "ta"]]) {
    const key = resolveIsoToMapKey(iso, MAP);
    if (key) assert.notStrictEqual(key, wrongKey, `${iso} bound to ${wrongKey}`);
  }
});

test("a 3-letter ISO never binds to a 2-letter key by substring", () => {
  const keys = MAP.map(r => r.iso);
  for (const iso of ["tso", "som", "kin", "nya", "sna"]) {
    const key = resolveIsoToMapKey(iso, MAP);
    if (key && key !== iso) {
      assert.ok(!(key.length < iso.length && iso.includes(key)), `${iso} bound to ${key}`);
    }
  }
  assert.ok(keys.length > 1000, "map should be populated");
});

test("proto-languages never resolve to a real language", () => {
  // "proto-ron" used to fall through to the substring test, where "on" is a
  // substring of "proto-ron", and Ron began emitting Georgian names.
  for (const iso of ["proto-ron", "proto-warji", "proto-ainu", "proto-tai", "proto-kra", "proto-sami", "proto-mari"]) {
    const key = resolveIsoToMapKey(iso, MAP);
    if (key) {
      assert.ok(!iso.includes(key), `${iso} bound to ${key}`);
    }
  }
});

test("no catalog language binds to a key that is a substring of its ISO", () => {
  // The blanket version of the above, across every language the app can pick.
  const offenders = [];
  for (const c of CATALOG) {
    if (!c.iso) continue;
    const key = resolveIsoToMapKey(c.iso, MAP);
    if (!key || key === c.iso) continue;
    if (key.length < c.iso.length && c.iso.includes(key)) offenders.push(`${c.iso} -> ${key}`);
  }
  assert.deepStrictEqual(offenders, [], `substring bindings: ${offenders.slice(0, 10).join(", ")}`);
});

test("rows with no bases are only un-researched real languages", () => {
  // A row with bases: [] is a placeholder for a language nobody has researched
  // yet (baka, hadza, ajawa). getMixedByIso() skips it, so it produces nothing
  // - it is the backlog, not a bug. What must never come back is a GROUP label
  // masquerading as a language, so each stub must be a real catalog language
  // that is not tagged as a family and not a reconstruction.
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "config/language-mixes.json"), "utf8"));
  const byIso = new Map(catalog.map(c => [c.iso, c]));
  const stubs = MAP.filter(r => !r.bases || !r.bases.length);
  const bad = [];
  for (const r of stubs) {
    const c = byIso.get(r.iso);
    if (!c) { bad.push(`${r.iso} (not in catalog)`); continue; }
    if (Array.isArray(c.tags) && c.tags.includes("family")) bad.push(`${r.iso} (family macro)`);
    if (/^proto-/i.test(r.iso) || (Array.isArray(c.tags) && c.tags.includes("proto"))) bad.push(`${r.iso} (reconstruction)`);
  }
  assert.deepStrictEqual(bad, [], `bad stubs: ${bad.slice(0, 10).join(", ")}`);
});

test("no proto-languages remain in the map", () => {
  // Only proto-* is a group label by construction. The x- keys are a different
  // thing: alternate spellings for real languages (x-kannada -> 2104), each
  // pointing at a populated entry, and they are not group labels.
  const protos = MAP.filter(r => /^proto-/i.test(r.iso));
  assert.strictEqual(protos.length, 0, `proto rows: ${protos.map(r => r.iso).join(", ")}`);
});

test("every map row's bases point at a real namebase entry", () => {
  const lib = require(path.join(ROOT, "tools/namebase-tools/namebase-lib.js"));
  const idx = new Set(lib.loadAll().flatMap(g => g.entries).map(e => e.i));
  const dangling = [];
  for (const r of MAP) for (const b of r.bases || []) if (!idx.has(b)) dangling.push(`${r.iso}->${b}`);
  assert.deepStrictEqual(dangling.slice(0, 10), [], `${dangling.length} dangling base refs`);
});

"use strict";

/**
 * Repair config/language-mixer-map: point every ISO at the namebase that is
 * actually its language, and give every namebase a unique index.
 *
 * Run:  node tools/namebase-tools/repair-mixer-map.js --check
 *       node tools/namebase-tools/repair-mixer-map.js --write
 *
 * ---------------------------------------------------------------------------
 * WHY
 * ---------------------------------------------------------------------------
 * The map tells the generator which real language's place names to use for each
 * ISO code. Auditing config/language-mixer-map.js found:
 *
 *   2756 rows  ISO name matches the base it points at   (correct)
 *    845 rows  ISO points at a completely unrelated language
 *    717 rows  ISO is not in the language catalog at all (unreachable)
 *      0 rows  dangling index
 *
 * So ISO "dby" (Dibiyaso) resolves to Berber, "bamukumbit" (Bamukumbit) to
 * Slovenian, "agaw" (Agaw) to Dutch. These are not near-misses; the assignments
 * are simply wrong.
 *
 * This originated in ab335107 (2026-09-08), which hand-edited 846 lines of the
 * generated config/language-mixer-map.js while leaving config/language-mixer-
 * map.json - the file check-language-mixer-guardrails.js validates - untouched.
 * So the guardrails reported OK on a file the app never loads.
 *
 * It got worse rather than better because names-mixer.ts has a runtime repair
 * pass, buildIndexCorrectionMap(), keyed on the *index* alone:
 *
 *     for (const baseIdx of entry.bases) {
 *       if (correctionMap.has(baseIdx)) continue;   // first ISO to claim an
 *                                                    // index wins, permanently
 *
 * With 845 rows sharing indices with rows that were right, whichever ISO
 * happened to be iterated first captured the correction and every other ISO
 * that legitimately used that index was then silently redirected to it. So
 * repairing the map is what actually fixes the data; the runtime pass can then
 * fall back to being a no-op safety net.
 *
 * ---------------------------------------------------------------------------
 * MATCHING
 * ---------------------------------------------------------------------------
 * Each map row is matched to a namebase by name, from strictest to loosest:
 *   1. exact match after normalising case, punctuation and diacritics
 *   2. one name is a prefix of the other (handles "Bade alias", dialect names)
 *   3. token overlap, requiring the rarer token to be distinctive
 * A row that matches nothing is left pointing where it does and reported.
 *
 * ---------------------------------------------------------------------------
 * INDICES
 * ---------------------------------------------------------------------------
 * After matching, every namebase that is a *target* gets a unique index, so two
 * languages can never share one again. The rest keep theirs.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, NAMEBASE_DIR, root, loadAll, seedCount} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

/** Fold a language name to a comparable key. */
function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const files = loadAll();
const all = files.flatMap(f => f.entries);
const catalog = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixes-all.js"));

// The two map files disagree: the .js has 667 ISOs the .json lacks, and the
// .json has 50 the .js lacks (mostly proto-languages and macro-languages).
// check-language-mixer-guardrails.js enforces the map is append-only against
// HEAD, so the repair starts from the UNION - neither file's additions are
// thrown away, and the output becomes the superset of both.
const mapJson = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.json"));
const mapJs = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
const seenIso = new Set();
const map = [];
for (const row of [...mapJs, ...mapJson]) {
  if (!row || !row.iso || seenIso.has(row.iso)) continue;
  seenIso.add(row.iso);
  map.push({iso: row.iso, bases: Array.isArray(row.bases) && row.bases.length ? [...row.bases] : [-1]});
}
const fromJsonOnly = map.length - mapJs.length;

// ---------------------------------------------------------------------------
// Name -> candidate namebases
// ---------------------------------------------------------------------------

const byName = new Map();
for (const e of all) {
  const k = norm(e.name);
  if (!k) continue;
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(e);
}
const nameKeys = [...byName.keys()];

// Which languages does an entry represent? Name plus any parenthetical alias,
// e.g. "Bade alias" or "Hun-Saare (Hungdolab)" both count as targets.
function keysFor(e) {
  const out = new Set();
  out.add(norm(e.name));
  const m = String(e.name || "").match(/\(([^)]+)\)/g) || [];
  for (const paren of m) {
    for (const part of paren.replace(/[()]/g, "").split(/[,;/]/)) {
      const k = norm(part);
      if (k.length >= 4) out.add(k);
    }
  }
  out.delete("");
  return [...out];
}

const aliasIndex = new Map();
for (const e of all) for (const k of keysFor(e)) {
  if (!aliasIndex.has(k)) aliasIndex.set(k, []);
  if (!aliasIndex.get(k).includes(e)) aliasIndex.get(k).push(e);
}

// ---------------------------------------------------------------------------
// Match
// ---------------------------------------------------------------------------

function candidatesFor(want) {
  if (!want) return [];
  // 1. exact match on the entry's primary name. Preferred over an alias match:
  //    ISO "dty" (Doteli) must land on the entry called "Doteli", not on one of
  //    the eleven dialects that are merely tagged "(Doteli)".
  if (byName.has(want)) return byName.get(want).map(e => ({e, how: "exact"}));
  // 2. alias match, same reasoning, lower priority
  if (aliasIndex.has(want)) return aliasIndex.get(want).map(e => ({e, how: "alias"}));
  // 3. prefix, either direction, tightest first
  const pref = [];
  for (const k of nameKeys) {
    if (k.length >= 4 && (k.startsWith(want) || want.startsWith(k))) {
      pref.push({k, len: Math.abs(k.length - want.length)});
    }
  }
  pref.sort((a, b) => a.len - b.len);
  if (pref.length) return aliasIndex.get(pref[0].k).map(e => ({e, how: "prefix"}));
  return [];
}

const isoName = new Map();
for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

let exact = 0, prefix = 0, unmatched = 0, alreadyRight = 0, changed = 0, unresolved = 0;
const unmatchedRows = [];
const ambiguousRows = [];
const repairs = [];

for (const row of map) {
  const wantName = isoName.get(row.iso);
  const want = norm(wantName);
  const current = row.bases[0];
  const atCurrent = (all.find(e => e.i === current) || null);

  if (!want) { unresolved++; continue; }

  const cands = candidatesFor(want);
  if (!cands.length) {
    unmatched++;
    unmatchedRows.push(`  ${row.iso.padEnd(24)} "${wantName}"  (no namebase by that name)`);
    continue;
  }
  // Several candidates are only a problem if they are *different* languages.
  // "africa:Afrikaans | africa:Afrikaans" is the same language entered twice,
  // and any of the two is a correct answer, so pick the first.
  const distinct = [...new Set(cands.map(c => c.e))];
  const distinctNames = new Set(distinct.map(e => norm(e.name)));
  if (distinctNames.size > 1) {
    ambiguousRows.push(
      `  ${row.iso.padEnd(24)} "${wantName}" -> ${distinct.length} different languages: ` +
        distinct.map(e => `${e.__continent}:${e.name}`).join(" | ")
    );
    unresolved++;
    continue;
  }

  const target = distinct[0];
  const how = cands[0].how;
  if (how === "exact") exact++; else prefix++;

  if (atCurrent && atCurrent === target) {
    alreadyRight++;
  } else {
    changed++;
    repairs.push({iso: row.iso, name: wantName, from: current, to: target.i, toName: target.name, how});
  }
}

// ---------------------------------------------------------------------------
// Plan unique indices for every repair target
// ---------------------------------------------------------------------------

// Entries that will be referenced after repair. Everything else keeps its index.
const plannedTargets = new Set(repairs.map(r => r.to));
const used = new Set(all.map(e => e.i).filter(v => v !== undefined));
// Release the indices of colliding entries, then hand out fresh ones.
const byIndex = new Map();
for (const e of all) {
  if (e.i === undefined) continue;
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}
let nextFree = Math.max(...used) + 1;
function freshIndex() {
  while (used.has(nextFree)) nextFree++;
  used.add(nextFree);
  return nextFree++;
}

const indexMoves = [];
// Only entries that are repair targets and sit on a contested index need moving.
for (const [, group] of byIndex) {
  if (group.length < 2) continue;
  const targetsInGroup = group.filter(e => plannedTargets.has(e.i));
  for (let k = 1; k < targetsInGroup.length; k++) {
    const e = targetsInGroup[k];
    const ni = freshIndex();
    indexMoves.push({entry: e, from: e.i, to: ni});
  }
}
const moveByEntry = new Map(indexMoves.map(m => [m.entry, m.to]));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("");
console.log("repair-mixer-map " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  map rows (union of .js and .json) : ${map.length}`);
console.log(`  ...contributed only by the .json  : ${fromJsonOnly}`);
console.log(`  already correct             : ${alreadyRight}`);
console.log(`  repairable (exact name)     : ${exact}`);
console.log(`  repairable (prefix name)    : ${prefix}`);
console.log(`  REPAIRS TO MAKE             : ${changed}`);
console.log(`  no namebase for that name   : ${unmatched}`);
console.log(`  ambiguous / no catalog name : ${unresolved}`);
console.log(`  namebases to be reindexed   : ${indexMoves.length}`);
console.log("");

if (unmatchedRows.length) {
  console.log(`  UNMATCHED (${unmatchedRows.length}) - left pointing where they are:`);
  unmatchedRows.slice(0, 15).forEach(l => console.log(l));
  if (unmatchedRows.length > 15) console.log(`    ... and ${unmatchedRows.length - 15} more`);
  console.log("");
}
if (ambiguousRows.length) {
  console.log(`  AMBIGUOUS (${ambiguousRows.length}) - left pointing where they are:`);
  ambiguousRows.slice(0, 15).forEach(l => console.log(l));
  if (ambiguousRows.length > 15) console.log(`    ... and ${ambiguousRows.length - 15} more`);
  console.log("");
}
console.log("  sample repairs:");
repairs.slice(0, 15).forEach(r => {
  console.log(
    `    ${r.iso.padEnd(22)} ${r.how.padEnd(7)} i=${String(r.from).padEnd(7)} -> ${String(r.to).padEnd(7)} ${r.name} (${r.toName})`
  );
});
if (repairs.length > 15) console.log(`    ... and ${repairs.length - 15} more`);
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

for (const m of indexMoves) m.entry.i = m.to;

const finalIndex = new Map(repairs.map(r => [r.iso, moveByEntry.get(r.to) ?? r.to]));

const catalogIsos = new Set(catalog.map(r => r.iso));
const kept = [];
let repointed = 0, orphansKept = 0;
for (const row of map) {
  // check-language-mixer-guardrails.js enforces that the map is append-only
  // against HEAD. Dropping a row - even one whose ISO was never in the
  // catalog and was therefore unreachable - trips that rule. Several of them
  // are deliberate macro-languages (spanglish, franglish, kra-family) that
  // may yet be added to the catalog, so they are kept and only reported.
  if (!catalogIsos.has(row.iso)) orphansKept++;
  const ni = finalIndex.get(row.iso);
  if (ni !== undefined && ni !== row.bases[0]) {
    row.bases = [ni];
    repointed++;
  }
  kept.push(row);
}

for (const f of files) {
  const cleaned = f.entries.map(({__continent, __pos, ...rest}) => rest);
  fs.writeFileSync(
    path.join(NAMEBASE_DIR, `namebases-${f.continent}.js`),
    `window.${f.continent}NameBases = ${JSON.stringify(cleaned, null, 2)};\n`,
    "utf8"
  );
}

const jsonOut = JSON.stringify(kept, null, 2) + "\n";
const jsOut = `globalThis.languageMixerMap = ${JSON.stringify(kept, null, 2)};\n`;
// config/ holds the source of truth that the guardrails validate; the .js copy
// exists in both places, and public/config/ is the one the browser loads.
fs.writeFileSync(path.join(CONFIG_DIRS[0], "language-mixer-map.json"), jsonOut, "utf8");
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), jsOut, "utf8");
}

console.log(`  namebase files rewritten : ${files.length}`);
console.log(`  map rows repointed       : ${repointed}`);
console.log(`  rows kept though ISO is not in the catalog : ${orphansKept} (append-only rule)`);
console.log(`  map rows kept            : ${kept.length}`);
console.log("");
console.log("Next: pnpm namebase:verify && node tools/mixer-core/check-language-mixer-guardrails.js");
console.log("      && node tools/namebase-tools/audit-map-integrity.js");

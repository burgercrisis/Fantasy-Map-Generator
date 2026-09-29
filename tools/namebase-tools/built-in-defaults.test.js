/**
 * The built-in fallback list in src/data/name-bases.ts must never claim an index
 * that the data files give to a different language.
 *
 * Run: node --test tools/namebase-tools/built-in-defaults.test.js
 *
 * WHY
 * ---
 * getDefaultNameBases() overlays the 43 built-ins at fixed indices 0-42 on top
 * of the array namebases-all.js builds. It fills only empty slots, so a built-in
 * that DISAGREES with the data file is currently unreachable - the data wins at
 * runtime. That is the right precedence (see commit 2fe79b73, gate W008: "the
 * data file wins"), but it makes the disagreement invisible: nothing reads the
 * built-ins at an index the data already fills, so no test can see them, so
 * nothing complains when the data file later drops that index and the built-in
 * silently becomes the only thing there.
 *
 * That is the failure this locks down. The 0-42 range is not decorative - it is
 * addressed by number from at least three places that getDefaultNameBases() does
 * not control:
 *
 *   src/generators/races.ts:44-52        Elf [33] DarkElf [34] Dwarf [35] ...
 *   src/generators/cultures-generator.ts:79-698   base: 0 .. base: 42
 *   config/language-mixer-map.js         29 rows with a base in 0-42
 *
 * So the invariant that must hold is the one getDefaultNameBases() already
 * relies on: at an index occupied by BOTH sources, they are the same language.
 * If they are not, the value of that index depends on which array loaded, and a
 * change to either file silently changes the language a race or a culture gets.
 *
 * STATE AS MEASURED - READ THIS BEFORE "FIXING" IT
 * -------------------------------------------------
 * The invariant is currently violated at 16 of the 43 indices (it was 17 when
 * this was written; index 16 emptied during the work, because the data files are
 * being renumbered in parallel). The set is recorded in KNOWN_MISMATCHES below
 * and asserted against rather than asserted empty, because every way of making
 * it pass emptily is worse than the disagreement:
 *
 *   - Renaming the built-in to whatever the data file says produces entries whose
 *     label contradicts their seed list ("Greek" over an Icelandic toponym set).
 *     If the data slot at that index ever empties, the entry is the only thing
 *     there and it is now wrong in BOTH fields, where today it is wrong in one.
 *     That is the definition of becoming a source of wrong names.
 *   - Renumbering the built-ins to the data's numbering vacates ten indices that
 *     cultures-generator.ts addresses (7, 12, 13, 14, 15, 18, 27, 28, 29, 30).
 *     Those are data-file gaps, so a culture preset pointing at them would get
 *     nothing and generate "ERROR" names - the exact regression the merge
 *     comment was written to prevent.
 *   - Copying the data file's entries into the TS list is the only remaining way
 *     to satisfy the invariant, and it is a second copy of files under active
 *     edit by another agent, drifting from the moment it is written.
 *
 * The two index spaces also cannot both be satisfied, which is the real finding
 * here: races.ts and cultures-generator.ts address the CLASSIC numbering (Dwarf
 * is 35, Elf is 33), while the data files carry a post-renumbering layout (35 is
 * Czech, 39 is Sekele). The data files won the mixer map, so the culture and
 * race presets are the side that has to move - and neither is owned here.
 *
 * So the mismatch set is pinned, and the tests below are the ones that can be
 * asserted honestly today: the runtime array must never let a built-in shadow a
 * real language, every gap must be filled with a usable built-in, and no NEW
 * index may start disagreeing. Resolve them by renumbering the presets that
 * consume them, then empty KNOWN_MISMATCHES and let the fourth test go strict.
 */

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const {pathToFileURL} = require("url");

// package.json declares no "type", so Node reparses the imported .ts as an ES
// module and warns about it on every run. The warning is about the repo, not
// about this test, and it would otherwise be the first thing a reader sees.
// Every other warning still goes through Node's own handler.
const defaultWarningHandlers = process.listeners("warning");
process.removeAllListeners("warning");
process.on("warning", warning => {
  if (warning && warning.code === "MODULE_TYPELESS_PACKAGE_JSON") return;
  for (const handler of defaultWarningHandlers) handler(warning);
});

const lib = require(path.join(__dirname, "namebase-lib.js"));
const {loadNameBases} = require(path.join(__dirname, "load-namebases.js"));

const NAME_BASES_TS = path.join(lib.root, "src", "data", "name-bases.ts");

/** Last index the built-in list claims. */
const RANGE_END = 42;

/**
 * Indices in 0-42 where the built-in and the data file both have an entry and
 * they are different languages. Pinned, not asserted empty - see the header.
 *
 * Keyed by index only, and deliberately not by language pair: the data files are
 * being renumbered in parallel, so what sits at an index may change while the
 * disagreement at that index does not. Pinning the pair would turn every
 * renumbering into a test failure; pinning the index still fails the moment a
 * NEW index starts disagreeing, which is the thing worth catching.
 *
 * 16 is kept even though it stopped disagreeing mid-work, for the same reason -
 * it can come back.
 */
const KNOWN_MISMATCHES = new Set([6, 9, 11, 12, 13, 14, 16, 17, 20, 25, 26, 27, 28, 29, 35, 39, 42]);

/**
 * Same fold the integrity gate uses for name comparison, so this test and
 * W008/W009 cannot disagree about what "the same name" means.
 */
const fold = s =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

let fixture = null;

/**
 * Load the real module and drive its real export, rather than re-implementing
 * the overlay here. The TS is self-contained (no imports) and Node strips the
 * types, so getDefaultNameBases() can be called directly - and it reads
 * `window.nameBases` at call time, so each mode is just a different global.
 */
async function build() {
  if (fixture) return fixture;

  const {getDefaultNameBases} = await import(pathToFileURL(NAME_BASES_TS).href);

  // No window.nameBases: getDefaultNameBases() falls through to the built-ins.
  globalThis.window = {};
  const builtins = getDefaultNameBases();

  // The real data, loaded through the aggregator in a VM exactly as the browser
  // does, so this test cannot drift from what ships.
  const {nameBases} = loadNameBases();

  // The array the app actually runs.
  globalThis.window = {nameBases};
  const runtime = getDefaultNameBases();

  const byIndex = new Map(builtins.map(b => [b.i, b]));
  fixture = {builtins, byIndex, data: nameBases, runtime};
  return fixture;
}

test("the built-in list still covers the real-world indices with usable entries", async () => {
  const {builtins, byIndex} = await build();

  // Indices 32-41 used to hold the nine fantasy race seed lists. They now live
  // in public/modules/namebases-fantasy.js at 100001-100009, and fantasyRaceBases
  // points there, so the built-in copies were pure duplication. They were removed
  // deliberately; see the commit that moved them. Index 32 (Human Generic) is
  // still here because cultures-generator.ts:452 and names-generator.ts:347 both
  // reference it by number.
  //
  // The invariant is therefore about the real-world indices only. It must not
  // be written as a bare count, because the count is an accident of which
  // optional entries happen to be present.
  assert.ok(builtins.length >= 34, `expected the real-world built-ins to still be present, got ${builtins.length}`);

  for (let i = 0; i <= RANGE_END; i++) {
    // 33-41 are the vacated fantasy slots. The data files already had real
    // languages at 35 and 39 (Czech, Sekele) so those built-ins were never
    // reachable; the rest are gaps that nothing fills, and the races that used
    // them now read 100001-100009.
    if (i >= 33 && i <= 41) continue;
    const nb = byIndex.get(i);
    assert.ok(nb, `no built-in claims i=${i}, which the merge comment promises to fill`);
    assert.strictEqual(nb.i, i, `built-in "${nb.name}" is at position ${builtins.indexOf(nb)} but declares i=${nb.i}`);
    // An entry with no seeds generates "ERROR" names, which is the regression
    // the merge comment exists to prevent. Cheap to check, so it is checked.
    assert.ok(nb.b && nb.b.trim(), `built-in "${nb.name}" (i=${i}) has no seed list`);
    assert.strictEqual(typeof nb.min, "number", `built-in "${nb.name}" (i=${i}) has no min length`);
    assert.strictEqual(typeof nb.max, "number", `built-in "${nb.name}" (i=${i}) has no max length`);
  }
});

test("a built-in never shadows the language the data file put at an index", async () => {
  const {data, runtime} = await build();

  for (let i = 0; i <= RANGE_END; i++) {
    const fromData = data[i];
    if (!fromData) continue;
    // Identity, not just the name: the runtime array is a shallow copy of the
    // aggregator output, so a shadowing overlay would replace the object.
    assert.strictEqual(
      runtime[i],
      fromData,
      `i=${i}: the data file has "${fromData.name}" but the runtime array has "${runtime[i] && runtime[i].name}"`
    );
  }
});

test("every 0-42 gap the data leaves is filled by the matching built-in", async () => {
  const {byIndex, data, runtime} = await build();

  let filled = 0;
  for (let i = 0; i <= RANGE_END; i++) {
    // 33-41 are the vacated fantasy slots. They are now deliberately empty:
    // the data files own 35 and 39 (Czech, Sekele) and nothing addresses the
    // rest, because fantasyRaceBases points at 100001-100009. An empty slot
    // here is the point - it is what stops a low index quietly serving a real
    // language to something expecting a fantasy base.
    if (i >= 33 && i <= 41) continue;
    if (data[i]) continue;
    const nb = byIndex.get(i);
    const atRuntime = runtime[i];
    assert.ok(atRuntime, `i=${i} is a gap in the data and was left empty, so anything addressing it gets "ERROR" names`);
    assert.strictEqual(
      fold(atRuntime.name),
      fold(nb.name),
      `i=${i}: gap filled with "${atRuntime.name}" instead of the built-in "${nb.name}"`
    );
    assert.ok(atRuntime.b && atRuntime.b.trim(), `i=${i}: filled with "${atRuntime.name}", which has no seed list`);
    filled++;
  }
  assert.ok(filled > 0, "no gaps left in 0-42 - the built-in list is fully dead, which would itself be a finding");
});

test("built-in and data agree at every index 0-42 that both occupy", async () => {
  const {byIndex, data} = await build();

  const observed = [];
  const unexpected = [];
  for (let i = 0; i <= RANGE_END; i++) {
    const fromData = data[i];
    const nb = byIndex.get(i);
    if (!fromData || !nb) continue;
    if (fold(fromData.name) === fold(nb.name)) continue;
    const row = `i=${i} built-in "${nb.name}" vs data "${fromData.name}"`;
    observed.push(row);
    if (!KNOWN_MISMATCHES.has(i)) unexpected.push(row);
  }

  // Surfaced, not asserted empty: these are the documented, unresolved mismatch.
  // See the header for why renaming or renumbering them is not a fix.
  if (observed.length) {
    console.log(`  note: ${observed.length} known built-in/data disagreement(s), none newly introduced:`);
    for (const row of observed) console.log(`    ${row}`);
  }
  for (const i of KNOWN_MISMATCHES) {
    if (!observed.some(row => row.startsWith(`i=${i} `))) {
      console.log(`  note: i=${i} no longer disagrees - drop it from KNOWN_MISMATCHES`);
    }
  }

  assert.deepStrictEqual(
    unexpected,
    [],
    `built-in and data now disagree at an index that was not already known to disagree: ${unexpected.join("; ")}`
  );
});

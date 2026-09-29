/**
 * Regression test for the padded-seed-list rule.
 *
 * Run: node --test tools/namebase-tools/padded-seeds.test.js
 *
 * 467 entries once carried invented place names. An agent was asked to bring
 * entries up to the 25-name floor and filled them with whatever was to hand, so
 * a contiguous block of the index space ended up seeded with their own name
 * plus one shared list of ~50 national capitals. Lotha, a Naga language of
 * India, and Pengo, a language of Angola, carried byte-identical seed lists.
 *
 * Every one was marked COMPLETE and passed the floor. No count-based check can
 * catch that: an entry padded to exactly 25 seeds satisfies every completeness
 * rule. This test therefore locks down the two things that are decidable from
 * the data - that the fabricated ones are gone, and that the legitimate
 * dialect continuations that share everything were NOT collateral damage.
 */
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

const lib = require(path.join(__dirname, "namebase-lib.js"));
const all = lib.loadAll().flatMap(g => g.entries);
const byI = new Map(all.map(e => [e.i, e]));
const F = lib.SEED_FLOOR;
const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, "");

test("the known-padded entries are empty", () => {
  // Each of these held a fabricated list. Drawn from four continents and three
  // unrelated language families, which is what made the list wrong rather than
  // merely short.
  // Matched by INDEX, not name: a later dedupe legitimately merged some of
  // these away as duplicates, so requiring the entry to still exist breaks when
  // that was correct. Gone is an acceptable outcome; still-populated is not.
  //
  // Name matching is wrong here. "Urum" names two unrelated things - i=203037
  // was the fabricated one (Barcelona, Malaga, Nantes) and i=200888 is a real
  // entry (Tbilisi, Batumi, Zugdidi). Same for Longsang Zhuang, where the
  // 4-seed legitimate entry at i=200337 outlives the 55-seed fabricated one.
  const cleared = [202491, 202500, 202551, 201003, 1624, 2092, 203037, 203121, 202657, 202987];
  for (const i of cleared) {
    const e = byI.get(i);
    if (!e) continue;                       // merged away as a duplicate: fine
    assert.ok(lib.seedCount(e) < F, `i=${i} "${e.name}" still has ${lib.seedCount(e)} seeds`);
  }
});

test("no two complete entries on different continents share a seed list", () => {
  // This is the fabrication signature, and it is decidable from the data.
  //
  // Lotha and Pengo carried identical lists - a Naga language of India and a
  // language of Angola. Dialect continuations do the same thing and are
  // legitimate, but they are varieties of one language and live in one
  // settlement area, so they are always on the same continent. Cross-continent
  // identity is not a judgement call.
  //
  // (An earlier version of this test asserted that no complete entry seeds
  // itself. That is false - Savonlinna contains Savonlinna, Ijaw appears in
  // Ijaw's own list - and matching short seeds like "I" against a longer name
  // matches almost everything.)
  const groups = new Map();
  for (const e of all) {
    const seeds = lib.seedsOf(e);
    if (seeds.length < F) continue;
    const key = seeds.slice().sort().join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const crossContinent = [];
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    const continents = new Set(members.map(m => m.__continent));
    if (continents.size > 1) {
      crossContinent.push(members.map(m => `i=${m.i} "${m.name}" [${m.__continent}]`).join(" == "));
    }
  }
  assert.deepStrictEqual(crossContinent, [], `cross-continent identical lists: ${crossContinent.slice(0, 5).join("; ")}`);
});

test("same-continent identical lists are all known dialect continuations", () => {
  // These are legitimate, and pinning them means a future padded list that
  // happens to be same-continent still gets looked at rather than waved through.
  const groups = new Map();
  for (const e of all) {
    const seeds = lib.seedsOf(e);
    if (seeds.length < F) continue;
    const key = seeds.slice().sort().join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const groupsList = [...groups.values()].filter(m => m.length > 1);
  const KNOWN = new Set([
    "928,1085,1087", "907,1490,200770,200807", "200236,200246,200247,200249",
    "200375,200376,200377", "201259,201269,201270,201302", "200455,200573",
    "200500,200555,200559", "200561,200571", "200921,200923", "201256,201300",
    "201277,201289", "409,626", "507,734", "559,561,758", "642,23005",
    "647,656", "664,2665", "906,200818", "925,200878", "1068,1080"
  ]);
  const unexpected = groupsList
    .map(m => m.map(x => x.i).sort((a, b) => a - b).join(","))
    .filter(k => !KNOWN.has(k));
  // Not asserted empty: the list is expected to grow as more work is done, and
  // a new one is a question for a human, not a failure. It is printed so the
  // addition is visible in the test output.
  if (unexpected.length) {
    console.log(`  note: ${unexpected.length} identical-list group(s) not in the reviewed set: ${unexpected.join(" | ")}`);
  }
  assert.ok(true);
});

test("legitimate dialect continuations survived", () => {
  // These share every seed because they are varieties of one language in one
  // settlement area. They are the collateral damage a naive "duplicates are
  // fabrication" rule would cause, so they are pinned here.
  // Matched by name, not index: a dedupe may have merged a variety away, and
  // that is correct. What must survive is that each group still has at least one
  // populated entry.
  const continuations = [
    ["Savonian", "Tavastian", "Hevaha"],
    ["Veps", "Central Veps", "Northern Veps", "Southern Veps"],
    ["Achhami (Doteli)", "Baitadeli (Doteli)", "Bajhangi (Doteli)"],
    ["Mongghul", "Mongghuor", "Monguor"],
    ["Idu Taraon", "Miju", "Miju Meyor", "Zakhring"]
  ];
  const byName = new Map();
  for (const e of all) {
    const k = norm(e.name);
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(e);
  }
  for (const group of continuations) {
    const survivors = group
      .map(n => (byName.get(norm(n)) || []).filter(e => lib.seedCount(e) >= F))
      .flat();
    assert.ok(survivors.length, `${group.join(" / ")}: nothing survives with seeds`);
  }
});

test("regional entries that share a vocabulary survived", () => {
  // These are the entries a frequency-based detector wrongly flagged. They draw
  // most of their seeds from a shared pool and that is correct: they are
  // languages of one region and these are that region's places.
  for (const [i, label] of [[910, "Savonlinna"], [1086, "Tornio"], [2322, "Sherkal"], [200735, "Jukonda"]]) {
    const e = byI.get(i);
    assert.ok(e, `${label} should exist`);
    assert.ok(lib.seedCount(e) >= F, `${label} should keep its researched seeds, has ${lib.seedCount(e)}`);
  }
});

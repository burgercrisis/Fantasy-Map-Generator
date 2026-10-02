"use strict";

// Audit whether each namebase entry sits in the continent its language belongs to.
//
// History, because the paths here were all wrong at once:
//   * d3ba700a "Restructure namebase files into regional organization" split
//     modules/namebases-real.js into the per-continent files. The tool kept
//     reading realWorldNameBases, which no longer exists anywhere, so every run
//     died on MODULE_NOT_FOUND.
//   * The region data lives in tools/mixer-meta/, but this tool sits in
//     tools/namebase-tools/ and looked for ./mixer-meta/ - a directory that does
//     not exist. All 15 files were present one level up the whole time.
//   * It also read ../modules/namebases-*.js, a CWD-relative path into the inert
//     repo-root tree that 6fe42a66 removed from the build, not the tree
//     public/modules/ that the app actually loads.
//
// Entries are parsed rather than eval'd: the files are `window.xNameBases = [...]`,
// and eval on repository data is a needless way to break when a stray character
// appears in a seed.

const fs = require("node:fs");
const path = require("node:path");

const REPO = path.resolve(__dirname, "..", "..");
const META = path.join(REPO, "tools", "mixer-meta");
const CATALOG = path.join(REPO, "config", "language-mixes.json");
const MAPFILE = path.join(REPO, "config", "language-mixer-map.json");
const CONTINENTS = ["africa", "asia", "europe", "northAmerica", "southAmerica", "oceania"];

// Wikipedia region lists, most specific first: the first list to name a language
// wins, so the country censuses outrank the continental overviews.
const REGIONS = [
	{ name: "bangladesh", continent: "asia", file: "wikipedia-languages-of-bangladesh.json" },
	{ name: "china", continent: "asia", file: "wikipedia-languages-of-china-spoken-languages.json" },
	{ name: "india", continent: "asia", file: "wikipedia-languages-of-india-census.json" },
	{ name: "nepal", continent: "asia", file: "wikipedia-languages-of-nepal-census.json" },
	{ name: "pakistan", continent: "asia", file: "wikipedia-languages-of-pakistan-established.json" },
	{ name: "south-asia", continent: "asia", file: "wikipedia-languages-of-south-asia.json" },
	{ name: "southeast-asia", continent: "asia", file: "wikipedia-languages-of-southeast-asia.json" },
	{ name: "west-asia", continent: "asia", file: "wikipedia-languages-of-west-asia.json" },
	{ name: "east-asia", continent: "asia", file: "wikipedia-east-asian-languages-classifications.json" },
	{ name: "africa", continent: "africa", file: "wikipedia-languages-of-africa-full.json" },
	{ name: "asia-official", continent: "asia", file: "wikipedia-languages-of-asia-official-languages.json" },
	{ name: "europe", continent: "europe", file: "wikipedia-languages-of-europe.json" },
	{ name: "north-america", continent: "northAmerica", file: "wikipedia-languages-of-north-america.json" },
	{ name: "oceania", continent: "oceania", file: "wikipedia-languages-of-oceania.json" },
	// Spans the WHOLE Americas, so it cannot be attributed to one continent.
	// Listing it as southAmerica - which the name invites - made it indict every
	// North American indigenous language: Nahuatl, Cherokee, Inuktitut, Zuni and
	// a hundred more were reported as "should be southAmerica". It is therefore
	// claimed against both continents and never used to place an entry.
	{ name: "americas-indigenous", continent: "northAmerica,southAmerica", file: "wikipedia-indigenous-languages-of-the-americas.json" }
];

// ---- inputs -------------------------------------------------------------------
const missing = [];
for (const r of REGIONS) {
	if (!fs.existsSync(path.join(META, r.file))) missing.push(`tools/mixer-meta/${r.file}  (region "${r.name}")`);
}
for (const p of [CATALOG, MAPFILE]) if (!fs.existsSync(p)) missing.push(path.relative(REPO, p));
for (const c of CONTINENTS) {
	const p = path.join(REPO, "public", "modules", `namebases-${c}.js`);
	if (!fs.existsSync(p)) missing.push(`public/modules/namebases-${c}.js`);
}
if (missing.length) {
	console.error("check-continent-assignments: cannot run - required input missing\n");
	for (const m of missing) console.error(`  missing: ${m}`);
	console.error("");
	process.exit(1);
}

// ---- region lists -------------------------------------------------------------
// Case-fold and strip punctuation, but do NOT strip diacritics. Collapsing them
// merges distinct languages that differ only by them: Estonia's "Võro" and
// Nigeria's "Voro" both reduce to "voro", and Samoa / Sao Tome likewise. The
// original normaliser avoided this by accident and the behaviour is load-bearing.
const normalizeName = (n) => String(n || "").toLowerCase().replace(/[^a-z]/g, "");

// A language can legitimately be listed for several regions - English, French,
// Malay and Spanish all appear in the India, China and Pakistan censuses. Record
// every continent that claims a name, not just the first, so the audit can tell a
// genuinely misplaced language from a transcontinental one.
const continentsOf = new Map();
for (const region of REGIONS) {
	const data = JSON.parse(fs.readFileSync(path.join(META, region.file), "utf8"));
	for (const item of data.items || []) {
		const norm = normalizeName(item.name);
		if (!norm) continue;
		if (!continentsOf.has(norm)) continentsOf.set(norm, new Set());
		// a region may claim several continents, e.g. the whole-Americas list
		for (const c of region.continent.split(",")) continentsOf.get(norm).add(c.trim());
	}
}

// ---- catalog: iso -> declared region ------------------------------------------
const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const catalogRows = Array.isArray(catalog) ? catalog : catalog.languages || [];
const declaredRegion = new Map();
for (const row of catalogRows) {
	if (row && row.iso) declaredRegion.set(row.iso, row.region);
}

// map row iso -> namebase index
const map = JSON.parse(fs.readFileSync(MAPFILE, "utf8"));
const baseOfIso = new Map();
for (const row of map) {
	if (!row || !row.iso) continue;
	const b = (row.bases || [])[0];
	if (typeof b === "number") baseOfIso.set(row.iso, b);
}

// ---- live entries --------------------------------------------------------------
function readEntries(continent) {
	const p = path.join(REPO, "public", "modules", `namebases-${continent}.js`);
	const text = fs.readFileSync(p, "utf8");
	const out = [];
	for (const chunk of text.split(/\n {2}\{/)) {
		const im = chunk.match(/"i":\s*(\d+)/);
		const nm = chunk.match(/"name":\s*"([^"]*)"/);
		if (!im || !nm) continue;
		const bm = chunk.match(/"b":\s*"((?:[^"\\]|\\.)*)"/);
		out.push({
			i: +im[1],
			name: nm[1].trim(),
			seeds: bm && bm[1] ? bm[1].split(",").map((s) => s.trim()).filter(Boolean).length : 0
		});
	}
	return out;
}

const all = [];
for (const c of CONTINENTS) {
	const entries = readEntries(c);
	console.log(`${c}: ${entries.length} languages`);
	for (const e of entries) all.push({ ...e, continent: c });
}
console.log(`Total languages: ${all.length}\n`);

// index -> the isos that resolve to it
const isosOfBase = new Map();
for (const [iso, base] of baseOfIso) {
	if (!isosOfBase.has(base)) isosOfBase.set(base, []);
	isosOfBase.get(base).push(iso);
}

// ---- audit --------------------------------------------------------------------
const wrong = [];
const transcontinental = [];
const unassigned = [];
for (const e of all) {
	const norm = normalizeName(e.name);
	const claims = continentsOf.get(norm);
	if (!claims) {
		unassigned.push(`${e.name} [${e.continent} i=${e.i}]`);
		continue;
	}
	if (claims.size > 1) {
		if (!claims.has(e.continent)) {
			transcontinental.push(`${e.name}: in ${e.continent}; lists claim ${[...claims].join(", ")}`);
		}
		continue;
	}
	const expected = [...claims][0];
	if (expected !== e.continent) {
		wrong.push({
			language: e.name,
			i: e.i,
			seeds: e.seeds,
			current: e.continent,
			expected,
			isos: isosOfBase.get(e.i) || []
		});
	}
}

console.log(`Entries placed in a continent no other region list claims them for: ${wrong.length}`);
for (const w of wrong.sort((a, b) => a.expected.localeCompare(b.expected))) {
	const tag = w.isos.length ? `  isos: ${w.isos.join(", ")}` : "";
	console.log(`  ${w.language} (i=${w.i}, ${w.seeds} seeds): in ${w.current}, should be ${w.expected}${tag}`);
}

console.log(`\nTranscontinental names, not flagged (listed for more than one continent): ${transcontinental.length}`);
for (const t of transcontinental.slice(0, 10)) console.log(`  ${t}`);
if (transcontinental.length > 10) console.log(`  ... and ${transcontinental.length - 10} more`);

console.log(`\nEntries no region list names: ${unassigned.length}`);
for (const u of unassigned.slice(0, 15)) console.log(`  ${u}`);
if (unassigned.length > 15) console.log(`  ... and ${unassigned.length - 15} more`);

// A cross-check the old version lost: the catalog's own declared region, which
// several passes have had to correct by hand.
console.log("\nCatalog region vs the file the entry lives in:");
let regionMismatch = 0;
// Only unambiguous region values belong here. This map used to hold six keys, so
// the check could compare 53% of the catalog and printed "(none)" for the other
// 47% as if it had cleared them. Six misfiled entries were found sitting inside
// that blind spot while this gate reported it green: Tangwang in oceania with 100%
// Asian seeds, Vedda and Mingrelian in europe, Javindo and Pidgin Hawaiian in the
// wrong continents.
//
// Deliberately NOT mapped, because each of these spans continents and mapping it
// would manufacture false positives rather than find real ones:
//   Pacific      Malay and Malayo-Chamic are Asian; Malayo-Polynesian is not.
//   Eurasia      spans Europe and Asia outright.
//   Americas     spans North and South America.
//   Indian Ocean / Atlantic  span Africa, Asia and the Americas.
//   Misc         carries no geographic meaning at all - it is the bucket a row
//                lands in when nobody assigned it a region, so 123 rows are
//                unplaceable rather than misplaced.
const REGION_TO_CONTINENT = {
	africa: "africa",
	asia: "asia",
	europe: "europe",
	"north america": "northAmerica",
	"south america": "southAmerica",
	oceania: "oceania",
	// sub-regions that name exactly one continent
	"east asia": "asia",
	"southeast asia": "asia",
	"south asia": "asia",
	"central asia": "asia",
	"west asia": "asia",
	"middle east": "asia",
	"ancient mesopotamia": "asia",
	// The Caucasus maps to ASIA. The project already draws its own line a little
	// north of it: the sixteen North Caucasus entries all carry catalog region
	// "Europe" (Lezgian, Avar, Ossetian, Ingush, Chechen, Circassian, Kabardian,
	// Adyghe, Abaza, Abkhaz, Lak, Svan, Tabasaran, Rutul, Archi, Karachay-Balkar,
	// and Mingrelian, Karata and Kumyk), while the South Caucasus - Georgian,
	// Adjaran Georgian, Judaeo-Georgian, Armazic, Laz, Armenian, Bats, Bzyb -
	// carries "Caucasus" and sits in asia. Mapping it to europe would flag those
	// eight correctly-placed South Caucasus entries.
	caucasus: "asia",
	siberia: "asia",
	"sino-tibetan region": "asia",
	"north africa": "africa",
	"horn of africa": "africa",
	"upper guinea": "africa",
	"gulf of guinea": "africa",
	australia: "oceania",
	mesoamerica: "northAmerica",
	"central america": "northAmerica",
	caribbean: "northAmerica"
};

// Count how much of the catalog this section can actually judge, so a clean run
// cannot be mistaken for full coverage.
const regionIncomparable = new Map();
let regionJudged = 0;
let regionUnjudged = 0;
for (const e of all) {
	for (const iso of isosOfBase.get(e.i) || []) {
		const reg = declaredRegion.get(iso);
		const mapped = reg ? REGION_TO_CONTINENT[String(reg).toLowerCase()] : null;
		if (!mapped) {
			regionUnjudged++;
			const key = reg ? String(reg) : "(no region)";
			regionIncomparable.set(key, (regionIncomparable.get(key) || 0) + 1);
			continue;
		}
		regionJudged++;
		if (mapped !== e.continent) {
			regionMismatch++;
			console.log(`  ${iso} "${e.name}": catalog region "${reg}" but the entry is in ${e.continent}`);
		}
	}
}
console.log(regionMismatch ? `  (${regionMismatch} mismatch${regionMismatch > 1 ? "es" : ""})` : "  (none)");

const judgedTotal = regionJudged + regionUnjudged;
console.log(
	`  coverage: ${regionJudged} row(s) judged, ${regionUnjudged} not comparable` +
		` (${Math.round((regionJudged / Math.max(1, judgedTotal)) * 100)}%)`
);
if (regionIncomparable.size) {
	const parts = [...regionIncomparable.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`);
	console.log(`  not comparable, by region: ${parts.join(", ")}`);
}

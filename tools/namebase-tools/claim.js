"use strict";

/**
 * Work-claim lock for namebase files.
 *
 *   node tools/namebase-tools/claim.js --list
 *   node tools/namebase-tools/claim.js asia "Afade + 30 low-seed entries" --agent agent-7
 *   node tools/namebase-tools/claim.js --release asia --agent agent-7
 *   node tools/namebase-tools/claim.js --release asia --force      # break a stale lock
 *   node tools/namebase-tools/claim.js --stale-hours 12            # set expiry
 *
 * WHY: several verification agents ran against public/modules/namebases-africa.js
 * at the same time. Every one of them read the file, researched, then wrote the
 * whole array back. Whichever finished last silently discarded the other
 * agents' seed additions, and the commit message described work that was no
 * longer in the tree. Nothing errored - the writes just overwrote each other.
 *
 * A claim is advisory in the sense that nothing enforces it at the OS level.
 * It exists so that an agent announces "I am working on asia" and a second
 * agent can see that and pick a different continent, or wait. A stale claim
 * (older than --stale-hours, default 8) can be broken with --force so a dead
 * agent cannot block the work forever.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, root} = require("./namebase-lib");

const CLAIMS_PATH = path.join(root, "docs", "verification", "claims.json");
const DEFAULT_STALE_HOURS = 8;

function load() {
  if (!fs.existsSync(CLAIMS_PATH)) return {staleHours: DEFAULT_STALE_HOURS, claims: {}};
  try {
    const data = JSON.parse(fs.readFileSync(CLAIMS_PATH, "utf8"));
    if (!data.claims) data.claims = {};
    if (!data.staleHours) data.staleHours = DEFAULT_STALE_HOURS;
    return data;
  } catch {
    return {staleHours: DEFAULT_STALE_HOURS, claims: {}};
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(CLAIMS_PATH), {recursive: true});
  fs.writeFileSync(CLAIMS_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function ageHours(iso) {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

const argv = process.argv.slice(2);
const flag = name => {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
};
const has = name => argv.includes(name);

const store = load();
if (flag("--stale-hours")) {
  store.staleHours = Number(flag("--stale-hours")) || DEFAULT_STALE_HOURS;
  save(store);
  console.log(`stale threshold set to ${store.staleHours}h`);
  process.exit(0);
}

if (has("--list") || argv.length === 0) {
  const now = Date.now();
  const rows = Object.entries(store.claims).map(([c, v]) => ({
    continent: c,
    agent: v.agent,
    task: v.task,
    ageH: Math.round(ageHours(v.claimedAt) * 10) / 10,
    stale: ageHours(v.claimedAt) > store.staleHours
  }));
  if (!rows.length) {
    console.log("no active claims - all continents free");
  } else {
    console.log(`stale threshold: ${store.staleHours}h`);
    for (const r of rows) {
      console.log(
        `  ${r.continent.padEnd(14)} ${String(r.ageH).padStart(6)}h  ` +
          `${r.stale ? "STALE " : "      "}${r.agent}  ${r.task}`
      );
    }
  }
  process.exit(0);
}

// Flags can appear before the continent ("--release asia --agent x") or after
// it, so take the positional arguments rather than fixed indices. A token is
// positional only if it is neither a flag itself nor the value of one.
const positional = argv.filter(
  (a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--"))
);

if (has("--release")) {
  // The continent is this flag's value, not a positional arg.
  const continent = flag("--release");
  if (!continent) {
    console.error("usage: claim.js --release <continent> [--agent <name>] [--force]");
    process.exit(1);
  }
  const agent = flag("--agent");
  if (!store.claims[continent]) {
    console.log(`${continent} is not claimed`);
    process.exit(0);
  }
  const holder = store.claims[continent];
  if (holder.agent !== agent && !has("--force")) {
    console.error(
      `refusing to release ${continent}: held by ${holder.agent} since ${holder.claimedAt}. ` +
        `Use --force only if that agent is gone.`
    );
    process.exit(1);
  }
  delete store.claims[continent];
  save(store);
  console.log(`released ${continent} (was ${holder.agent})`);
  process.exit(0);
}

// Acquire.
const continent = positional[0];
const task = positional[1] || "(no task given)";
const agent = flag("--agent") || process.env.KILO_AGENT_ID || `pid-${process.pid}`;

if (!CONTINENTS.includes(continent)) {
  console.error(`unknown continent "${continent}". Expected one of: ${CONTINENTS.join(", ")}`);
  process.exit(1);
}

const existing = store.claims[continent];
if (existing) {
  const h = ageHours(existing.claimedAt);
  if (existing.agent === agent) {
    console.log(`${continent} already claimed by you (${agent}) - continuing`);
    process.exit(0);
  }
  if (h > store.staleHours) {
    console.error(
      `refusing to claim ${continent}: stale claim by ${existing.agent} ` +
        `(${h.toFixed(1)}h old, threshold ${store.staleHours}h). ` +
        `Release it first with --release ${continent} --force if that agent is gone.`
    );
    process.exit(1);
  }
  console.error(
    `refusing to claim ${continent}: held by ${existing.agent} for ${h.toFixed(1)}h - "${existing.task}". ` +
      `Pick another continent, or wait.`
  );
  process.exit(1);
}

store.claims[continent] = {agent, task, claimedAt: new Date().toISOString()};
save(store);
console.log(`claimed ${continent} for ${agent} - "${task}"`);
console.log(`Release it when done: node tools/namebase-tools/claim.js --release ${continent} --agent ${agent}`);

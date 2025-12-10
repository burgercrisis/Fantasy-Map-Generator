"use strict";

// Scan git history for config/language-mixes.json and
// config/language-mixer-map.json, collect all ISOs ever seen in those files,
// and compare against the current working copy. This is a *count-only* audit;
// it does not list individual ISO codes.
//
// Output: writes a JSON summary to
//   tools/mixer-diagnostics/_language-history-totals.json
// and prints a short human-readable summary to stdout.

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function run(cmd) {
  return cp.execSync(cmd, {cwd: root, encoding: "utf8"});
}

function readJsonAtRevision(rev, relPath) {
  const repoPath = relPath.replace(/\\/g, "/");
  const cmd = `git show ${rev}:${repoPath}`;
  try {
    const raw = run(cmd).replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    // File may not exist or may not be JSON at that revision; skip.
    return null;
  }
}

function readCurrentJson(relPath) {
  const full = path.join(root, relPath);
  try {
    const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function collectIsosFromArray(arr) {
  const set = new Set();
  if (!Array.isArray(arr)) return set;
  for (const entry of arr) {
    if (!entry || !entry.iso) continue;
    set.add(String(entry.iso));
  }
  return set;
}

function unionInto(target, source) {
  for (const v of source) target.add(v);
}

function main() {
  // Get all commits that ever touched the catalog or map JSON files.
  let logOutput;
  try {
    logOutput = run("git log --format=%H -- config/language-mixes.json config/language-mixer-map.json");
  } catch (e) {
    console.error("Failed to read git log:", e && e.message ? e.message : e);
    process.exitCode = 1;
    return;
  }

  const commits = Array.from(new Set(logOutput.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));

  const historyMixIsos = new Set();
  const historyMapIsos = new Set();

  for (const sha of commits) {
    const mixes = readJsonAtRevision(sha, "config/language-mixes.json");
    const map = readJsonAtRevision(sha, "config/language-mixer-map.json");

    if (mixes) {
      const s = collectIsosFromArray(mixes);
      unionInto(historyMixIsos, s);
    }
    if (map) {
      const s = collectIsosFromArray(map);
      unionInto(historyMapIsos, s);
    }
  }

  const historyAllIsos = new Set(historyMixIsos);
  unionInto(historyAllIsos, historyMapIsos);

  const currentMixes = readCurrentJson("config/language-mixes.json") || [];
  const currentMap = readCurrentJson("config/language-mixer-map.json") || [];

  const currentMixIsos = collectIsosFromArray(currentMixes);
  const currentMapIsos = collectIsosFromArray(currentMap);
  const currentAllIsos = new Set(currentMixIsos);
  unionInto(currentAllIsos, currentMapIsos);

  function diffCount(a, b) {
    // count of items in a that are not in b
    let count = 0;
    for (const v of a) {
      if (!b.has(v)) count++;
    }
    return count;
  }

  const summary = {
    repoRoot: root,
    commitsScanned: commits.length,
    history: {
      mixTotal: historyMixIsos.size,
      mapTotal: historyMapIsos.size,
      allTotal: historyAllIsos.size,
    },
    current: {
      mixTotal: currentMixIsos.size,
      mapTotal: currentMapIsos.size,
      allTotal: currentAllIsos.size,
    },
    losses: {
      fromMix: diffCount(historyMixIsos, currentMixIsos),
      fromMap: diffCount(historyMapIsos, currentMapIsos),
      fromAll: diffCount(historyAllIsos, currentAllIsos),
    },
  };

  const outDir = path.join(root, "tools", "mixer-diagnostics");
  fs.mkdirSync(outDir, {recursive: true});
  const outPath = path.join(outDir, "_language-history-totals.json");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log("Wrote", path.relative(root, outPath).replace(/\\/g, "/"));
  console.log("Commits scanned:", summary.commitsScanned);
  console.log("History totals:");
  console.log("  catalog ISOs:", summary.history.mixTotal);
  console.log("  map ISOs:", summary.history.mapTotal);
  console.log("  all ISOs:", summary.history.allTotal);
  console.log("Current totals:");
  console.log("  catalog ISOs:", summary.current.mixTotal);
  console.log("  map ISOs:", summary.current.mapTotal);
  console.log("  all ISOs:", summary.current.allTotal);
  console.log("Loss counts (history minus current):");
  console.log("  from catalog:", summary.losses.fromMix);
  console.log("  from map:", summary.losses.fromMap);
  console.log("  from all:", summary.losses.fromAll);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while reporting language history totals:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

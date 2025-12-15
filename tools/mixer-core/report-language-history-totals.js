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

const {root, writeJson} = require("./_report-utils");

function run(cmd, opts) {
  const silentStderr = !!(opts && opts.silentStderr);
  return cp.execSync(cmd, {
    cwd: root,
    encoding: "utf8",
    stdio: silentStderr ? ["ignore", "pipe", "ignore"] : undefined,
  });
}

function readJsonAtRevision(rev, relPath) {
  const repoPath = relPath.replace(/\\/g, "/");
  const cmd = `git show ${rev}:${repoPath}`;
  try {
    const raw = run(cmd, {silentStderr: true}).replace(/^\uFEFF/, "");
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
  const args = process.argv.slice(2);

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

  const commitRank = new Map();
  for (let i = 0; i < commits.length; i++) {
    commitRank.set(commits[i], i);
  }

  const historyMixIsos = new Set();
  const historyMapIsos = new Set();

  const lastSeenMix = new Map();
  const lastSeenMap = new Map();

  for (const sha of commits) {
    const mixes = readJsonAtRevision(sha, "config/language-mixes.json");
    const map = readJsonAtRevision(sha, "config/language-mixer-map.json");

    if (mixes) {
      const s = collectIsosFromArray(mixes);
      unionInto(historyMixIsos, s);

      for (const iso of s) {
        if (!lastSeenMix.has(iso)) lastSeenMix.set(iso, sha);
      }
    }
    if (map) {
      const s = collectIsosFromArray(map);
      unionInto(historyMapIsos, s);

      for (const iso of s) {
        if (!lastSeenMap.has(iso)) lastSeenMap.set(iso, sha);
      }
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

  function diffList(a, b) {
    const out = [];
    for (const v of a) {
      if (!b.has(v)) out.push(v);
    }
    out.sort();
    return out;
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

  writeJson("tools/mixer-diagnostics/_language-history-totals.json", summary);

  if (args.includes("--write-losses") || args.includes("--print-losses") || args.includes("--write-losses-meta")) {
    const losses = {
      fromMix: diffList(historyMixIsos, currentMixIsos),
      fromMap: diffList(historyMapIsos, currentMapIsos),
      fromAll: diffList(historyAllIsos, currentAllIsos),
    };

    if (args.includes("--write-losses")) {
      writeJson("tools/mixer-diagnostics/_language-history-losses.json", losses);
    }

    if (args.includes("--write-losses-meta")) {
      const rows = losses.fromAll.map(iso => {
        const mixSha = lastSeenMix.get(iso) || null;
        const mapSha = lastSeenMap.get(iso) || null;

        const mixRank = mixSha && commitRank.has(mixSha) ? commitRank.get(mixSha) : Infinity;
        const mapRank = mapSha && commitRank.has(mapSha) ? commitRank.get(mapSha) : Infinity;
        const lastSeenAny = mixRank <= mapRank ? mixSha : mapSha;

        return {
          iso,
          lastSeenMix: mixSha,
          lastSeenMap: mapSha,
          lastSeenAny,
        };
      });

      const countsByCommit = {};
      for (const row of rows) {
        if (!row.lastSeenAny) continue;
        countsByCommit[row.lastSeenAny] = (countsByCommit[row.lastSeenAny] || 0) + 1;
      }

      const lastSeenCommitSummary = Object.entries(countsByCommit)
        .map(([sha, count]) => ({sha, count}))
        .sort((a, b) => b.count - a.count);

      writeJson("tools/mixer-diagnostics/_language-history-losses-meta.json", {
        losses: rows,
        lastSeenCommitSummary,
      });
    }

    if (args.includes("--print-losses")) {
      console.log("\nLost ISO list (history minus current):");
      console.log("  from catalog:", losses.fromMix.join(", "));
      console.log("  from map:", losses.fromMap.join(", "));
      console.log("  from all:", losses.fromAll.join(", "));
    }
  }

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

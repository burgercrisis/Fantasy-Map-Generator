"use strict";

/**
 * Language Mixer Doctor
 * 
 * Comprehensive diagnostics runner for the Language Mixer system.
 * Executes multiple health checks and generates baseline snapshots.
 * 
 * Usage:
 *   node tools/mixer-core/mixer-doctor.js [--strict] [--max-baselines=N]
 * 
 * Options:
 *   --strict          Fail on warnings in addition to errors
 *   --max-baselines=N Number of baseline snapshots to keep (default: 5)
 * 
 * Output:
 *   tools/mixer-diagnostics/_mixer-doctor-summary.txt
 *   tools/mixer-diagnostics/baselines/baseline-YYYYMMDD-HHMMSS.json
 */

const fs = require("fs");
const path = require("path");
const {execFileSync} = require("child_process");

const {root, readJson, writeJson} = require("./_report-utils");

/**
 * Parses command line arguments
 * @param {Array} argv - Process arguments
 * @returns {Object} Parsed options
 */
function parseArgs(argv) {
  const args = argv.slice(2);

  function findValue(prefix) {
    const hit = args.find(a => a.startsWith(prefix + "="));
    if (!hit) return null;
    return hit.slice(prefix.length + 1);
  }

  const maxBaselinesRaw = findValue("--max-baselines");
  const maxBaselines = maxBaselinesRaw != null && maxBaselinesRaw !== "" ? Number(maxBaselinesRaw) : 5;

  return {
    strict: args.includes("--strict"),
    maxBaselines: Number.isFinite(maxBaselines) && maxBaselines > 0 ? maxBaselines : 5,
  };
}

/**
 * Executes a script and captures output
 * @param {string} scriptRelPath - Relative path to script
 * @param {Array} args - Arguments to pass
 * @returns {Object} Result with ok status and stdout/stderr
 */
function runScript(scriptRelPath, args) {
  const full = path.join(root, scriptRelPath);
  const cmdArgs = [full].concat(args || []);
  try {
    const out = execFileSync("node", cmdArgs, {encoding: "utf8"});
    return {ok: true, stdout: out};
  } catch (err) {
    const stdout = err && err.stdout ? String(err.stdout) : "";
    const stderr = err && err.stderr ? String(err.stderr) : (err && err.message ? String(err.message) : "");
    return {ok: false, stdout, stderr};
  }
}

/**
 * Generates timestamp string for filenames
 * @returns {string} Timestamp in YYYYMMDD-HHMMSS format
 */
function nowStamp() {
  const d = new Date();
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

/**
 * Lists baseline files sorted by modification time
 * @param {string} dirAbs - Absolute directory path
 * @returns {Array} Sorted list of baseline file paths
 */
function listBaselines(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter(f => /^baseline-\d{8}-\d{6}\.json$/i.test(f))
    .sort((a, b) => b.localeCompare(a))
    .map(f => path.join(dirAbs, f));
}

/**
 * Removes old baseline files beyond retention limit
 * @param {string} dirAbs - Absolute directory path
 * @param {number} keepN - Number of baselines to keep
 */
function rotateBaselines(dirAbs, keepN) {
  const files = listBaselines(dirAbs);
  const extra = files.slice(keepN);
  for (const f of extra) {
    try {
      fs.unlinkSync(f);
    } catch {
      // ignore
    }
  }
}

/**
 * Captures current state of ISO code sets
 * @returns {Object} ISO set snapshots
 */
function snapshotIsoSets() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIsos = [];
  for (const e of mixes) {
    if (!e || !e.iso) continue;
    catalogIsos.push(String(e.iso));
  }

  const mapIsos = [];
  for (const e of map) {
    if (!e || !e.iso) continue;
    mapIsos.push(String(e.iso));
  }

  const uniqueCatalog = Array.from(new Set(catalogIsos)).sort((a, b) => a.localeCompare(b));
  const uniqueMap = Array.from(new Set(mapIsos)).sort((a, b) => a.localeCompare(b));
  const all = Array.from(new Set([...uniqueCatalog, ...uniqueMap])).sort((a, b) => a.localeCompare(b));

  return {catalogIsos: uniqueCatalog, mapIsos: uniqueMap, allIsos: all};
}

function main() {
  const opts = parseArgs(process.argv);

  const diagnosticsDir = path.join(root, "tools", "mixer-diagnostics");
  const baselineDir = path.join(diagnosticsDir, "baselines");
  fs.mkdirSync(diagnosticsDir, {recursive: true});
  fs.mkdirSync(baselineDir, {recursive: true});

  const logPath = path.join(diagnosticsDir, "_mixer-doctor-summary.txt");
  function appendLog(block) {
    fs.appendFileSync(logPath, block, "utf8");
  }

  fs.writeFileSync(logPath, "", "utf8");
  appendLog("mixer-doctor run " + new Date().toISOString() + "\n\n");

  let hadFailure = false;

  // Check baseline trends if available
  const haveBaselines = listBaselines(baselineDir).length > 0;
  if (haveBaselines) {
    const args = [
      "--baseline-dir=tools/mixer-diagnostics/baselines",
      "--max-baselines=" + String(opts.maxBaselines),
    ];
    if (opts.strict) args.push("--strict");

    const res = runScript("tools/mixer-diagnostics/report-lost-language-mappings.js", args);
    appendLog("=== report-lost-language-mappings (baselines) ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");

    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  } else {
    appendLog("No baseline snapshots found; skipping baseline loss check.\n\n");
  }

  // Run language mixer health check
  {
    const res = runScript("tools/mixer-core/run-language-mixer-health.js", []);
    appendLog("=== run-language-mixer-health ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  // Generate integration table
  {
    const res = runScript("tools/mixer-core/generate-language-integration-table.js", []);
    appendLog("=== generate-language-integration-table ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  // Generate history totals report
  {
    const res = runScript("tools/mixer-core/report-language-history-totals.js", []);
    appendLog("=== report-language-history-totals ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  // Create baseline snapshot if no failures
  if (!hadFailure) {
    const isoSets = snapshotIsoSets();
    const stamp = nowStamp();
    const baselineRel = "tools/mixer-diagnostics/baselines/baseline-" + stamp + ".json";
    const baselineData = {
      createdAt: new Date().toISOString(),
      maxBaselines: opts.maxBaselines,
      ...isoSets,
    };
    writeJson(baselineRel, baselineData);
    rotateBaselines(baselineDir, opts.maxBaselines);
  } else {
    appendLog("Skipping baseline snapshot due to prior failures.\n");
  }

  console.log("Wrote tools/mixer-diagnostics/_mixer-doctor-summary.txt");
  if (!hadFailure) {
    console.log("Wrote baseline snapshot in tools/mixer-diagnostics/baselines/");
  } else {
    console.log("Skipped baseline snapshot (failures detected)");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while running mixer-doctor:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

  const maxBaselinesRaw = findValue("--max-baselines");
  const maxBaselines = maxBaselinesRaw != null && maxBaselinesRaw !== "" ? Number(maxBaselinesRaw) : 5;

  return {
    strict: args.includes("--strict"),
    maxBaselines: Number.isFinite(maxBaselines) && maxBaselines > 0 ? maxBaselines : 5,
  };
}

function runScript(scriptRelPath, args) {
  const full = path.join(root, scriptRelPath);
  const cmdArgs = [full].concat(args || []);
  try {
    const out = execFileSync("node", cmdArgs, {encoding: "utf8"});
    return {ok: true, stdout: out};
  } catch (err) {
    const stdout = err && err.stdout ? String(err.stdout) : "";
    const stderr = err && err.stderr ? String(err.stderr) : (err && err.message ? String(err.message) : "");
    return {ok: false, stdout, stderr};
  }
}

function nowStamp() {
  const d = new Date();
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function listBaselines(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter(f => /^baseline-\d{8}-\d{6}\.json$/i.test(f))
    .sort((a, b) => b.localeCompare(a))
    .map(f => path.join(dirAbs, f));
}

function rotateBaselines(dirAbs, keepN) {
  const files = listBaselines(dirAbs);
  const extra = files.slice(keepN);
  for (const f of extra) {
    try {
      fs.unlinkSync(f);
    } catch {
      // ignore
    }
  }
}

function snapshotIsoSets() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIsos = [];
  for (const e of mixes) {
    if (!e || !e.iso) continue;
    catalogIsos.push(String(e.iso));
  }

  const mapIsos = [];
  for (const e of map) {
    if (!e || !e.iso) continue;
    mapIsos.push(String(e.iso));
  }

  const uniqueCatalog = Array.from(new Set(catalogIsos)).sort((a, b) => a.localeCompare(b));
  const uniqueMap = Array.from(new Set(mapIsos)).sort((a, b) => a.localeCompare(b));
  const all = Array.from(new Set([...uniqueCatalog, ...uniqueMap])).sort((a, b) => a.localeCompare(b));

  return {catalogIsos: uniqueCatalog, mapIsos: uniqueMap, allIsos: all};
}

function main() {
  const opts = parseArgs(process.argv);

  const diagnosticsDir = path.join(root, "tools", "mixer-diagnostics");
  const baselineDir = path.join(diagnosticsDir, "baselines");
  fs.mkdirSync(diagnosticsDir, {recursive: true});
  fs.mkdirSync(baselineDir, {recursive: true});

  const logPath = path.join(diagnosticsDir, "_mixer-doctor-summary.txt");
  function appendLog(block) {
    fs.appendFileSync(logPath, block, "utf8");
  }

  fs.writeFileSync(logPath, "", "utf8");
  appendLog("mixer-doctor run " + new Date().toISOString() + "\n\n");

  let hadFailure = false;

  const haveBaselines = listBaselines(baselineDir).length > 0;
  if (haveBaselines) {
    const args = [
      "--baseline-dir=tools/mixer-diagnostics/baselines",
      "--max-baselines=" + String(opts.maxBaselines),
    ];
    if (opts.strict) args.push("--strict");

    const res = runScript("tools/mixer-diagnostics/report-lost-language-mappings.js", args);
    appendLog("=== report-lost-language-mappings (baselines) ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");

    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  } else {
    appendLog("No baseline snapshots found; skipping baseline loss check.\n\n");
  }

  {
    const res = runScript("tools/mixer-core/run-language-mixer-health.js", []);
    appendLog("=== run-language-mixer-health ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  {
    const res = runScript("tools/mixer-core/generate-language-integration-table.js", []);
    appendLog("=== generate-language-integration-table ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  {
    const res = runScript("tools/mixer-core/report-language-history-totals.js", []);
    appendLog("=== report-language-history-totals ===\n");
    appendLog(res.stdout || "");
    if (res.stderr) appendLog("\n[stderr]\n" + res.stderr + "\n");
    appendLog("\n");
    if (!res.ok) {
      hadFailure = true;
      process.exitCode = 1;
    }
  }

  if (!hadFailure) {
    const isoSets = snapshotIsoSets();
    const stamp = nowStamp();
    const baselineRel = "tools/mixer-diagnostics/baselines/baseline-" + stamp + ".json";
    const baselineData = {
      createdAt: new Date().toISOString(),
      maxBaselines: opts.maxBaselines,
      ...isoSets,
    };
    writeJson(baselineRel, baselineData);
    rotateBaselines(baselineDir, opts.maxBaselines);
  } else {
    appendLog("Skipping baseline snapshot due to prior failures.\n");
  }

  console.log("Wrote tools/mixer-diagnostics/_mixer-doctor-summary.txt");
  if (!hadFailure) {
    console.log("Wrote baseline snapshot in tools/mixer-diagnostics/baselines/");
  } else {
    console.log("Skipped baseline snapshot (failures detected)");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while running mixer-doctor:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

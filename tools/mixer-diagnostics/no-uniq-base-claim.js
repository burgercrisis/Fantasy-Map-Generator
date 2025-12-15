"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const claimsRelPath = "tools/mixer-diagnostics/_no_uniq_base_claims.json";
const claimsPath = path.join(root, claimsRelPath);
const claimsLockRelPath = "tools/mixer-diagnostics/_no_uniq_base_claims.lock";
const claimsLockPath = path.join(root, claimsLockRelPath);

function stripBom(s) {
  if (!s) return s;
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function readText(absPath) {
  return stripBom(fs.readFileSync(absPath, "utf8"));
}

function readJson(absPath) {
  return JSON.parse(readText(absPath));
}

function writeJsonNoBom(absPath, data) {
  const s = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(absPath, s, "utf8");
}

function readClaimsOrInit(absPath) {
  if (!fs.existsSync(absPath)) return {version: 1, claims: []};
  return readJson(absPath);
}

function sleepSync(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return;
  const end = Date.now() + n;
  while (Date.now() < end) {}
}

function acquireLock(absPath, opts, lockInfo) {
  const waitMs = opts && Number.isFinite(Number(opts.waitMs)) ? Number(opts.waitMs) : 30000;
  const retryMs = opts && Number.isFinite(Number(opts.retryMs)) ? Number(opts.retryMs) : 200;
  const staleMs = opts && Number.isFinite(Number(opts.staleMs)) ? Number(opts.staleMs) : 120000;
  const forceLock = !!(opts && opts.forceLock);

  const startedAt = Date.now();
  const payload = Object.assign({pid: process.pid, createdAt: new Date().toISOString()}, lockInfo || {});
  const lockText = JSON.stringify(payload) + "\n";

  while (true) {
    try {
      const fd = fs.openSync(absPath, "wx");
      fs.writeFileSync(fd, lockText, "utf8");
      fs.closeSync(fd);
      return;
    } catch (err) {
      if (!err || err.code !== "EEXIST") throw err;
    }

    let ageMs = 0;
    try {
      ageMs = Date.now() - fs.statSync(absPath).mtimeMs;
    } catch (e) {
      ageMs = 0;
    }

    if (Number.isFinite(staleMs) && staleMs > 0 && ageMs > staleMs) {
      if (forceLock) {
        try {
          fs.unlinkSync(absPath);
        } catch (e) {}
        continue;
      }
      throw new Error(
        `Claims lock appears stale: ${claimsLockRelPath} (ageMs=${Math.round(ageMs)}). Delete it or pass --forceLock`,
      );
    }

    if (Date.now() - startedAt > waitMs) {
      throw new Error(`Timed out waiting for claims lock: ${claimsLockRelPath}`);
    }

    sleepSync(retryMs);
  }
}

function releaseLock(absPath) {
  try {
    fs.unlinkSync(absPath);
  } catch (e) {}
}

function withLock(absPath, opts, lockInfo, fn) {
  acquireLock(absPath, opts, lockInfo);
  try {
    return fn();
  } finally {
    releaseLock(absPath);
  }
}

function parseArgs(argv) {
  const out = {_: []};
  for (const a of argv) {
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    if (eq === -1) {
      out[a.slice(2)] = true;
      continue;
    }
    out[a.slice(2, eq)] = a.slice(eq + 1);
  }
  return out;
}

function toIsoList(v) {
  if (!v) return [];
  return String(v)
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function getArgList(argv, name) {
  let hitIndex = argv.findIndex(a => a.startsWith(name + "="));
  let first = "";
  let start = -1;

  if (hitIndex !== -1) {
    first = argv[hitIndex].slice(name.length + 1);
    start = hitIndex + 1;
  } else {
    hitIndex = argv.findIndex(a => a === name);
    if (hitIndex === -1) return [];
    start = hitIndex + 1;
    if (start < argv.length && argv[start] && !argv[start].startsWith("--")) {
      first = argv[start];
      start += 1;
    }
  }

  const out = [];
  if (first) out.push(first);
  for (let i = start; i < argv.length; i++) {
    const token = argv[i];
    if (!token || token.startsWith("--")) break;
    out.push(token);
  }

  return out;
}

function parseIsosFromArgv(argv) {
  const repeated = argv
    .filter(a => a.startsWith("--iso="))
    .map(a => a.slice("--iso=".length))
    .map(s => s.trim())
    .filter(Boolean);
  if (repeated.length) return repeated;

  const parts = getArgList(argv, "--isos");
  if (!parts.length) return [];
  return toIsoList(parts.join(","));
}

function getMaxNamebaseIndex() {
  const modulesDir = path.join(root, "modules");
  const files = fs.readdirSync(modulesDir).filter(f => /^namebases-.*\.js$/i.test(f));

  let maxI = -1;
  const rx = /\bi\s*:\s*(\d+)/g;

  for (const f of files) {
    const abs = path.join(modulesDir, f);
    const s = readText(abs);
    let m;
    while ((m = rx.exec(s))) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) maxI = Math.max(maxI, n);
    }
  }

  if (!Number.isFinite(maxI) || maxI < 0) {
    throw new Error("Could not determine max namebase index (i:). Unexpected modules/namebases-*.js format");
  }

  return maxI;
}

function getMaxReservedIndexFromClaims(claims) {
  let maxN = -1;

  const rxRange = /(\d+)\s*[\u2013\-]\s*(\d+)/g; // en-dash or hyphen
  const rxMap = /->\s*(\d+)/g;

  for (const claim of (claims && claims.claims ? claims.claims : [])) {
    if (!claim) continue;

    if (Array.isArray(claim.reservedRange) && claim.reservedRange.length === 2) {
      const a = Number(claim.reservedRange[0]);
      const b = Number(claim.reservedRange[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) maxN = Math.max(maxN, a, b);
    }

    if (typeof claim.notes !== "string") continue;

    rxRange.lastIndex = 0;
    rxMap.lastIndex = 0;

    let m;
    while ((m = rxRange.exec(claim.notes))) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      if (b < a) continue;
      maxN = Math.max(maxN, a, b);
    }
    while ((m = rxMap.exec(claim.notes))) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) maxN = Math.max(maxN, n);
    }
  }

  return maxN;
}

function isoSetIntersects(a, b) {
  if (!a.length || !b.length) return false;
  const s = new Set(a);
  for (const x of b) if (s.has(x)) return true;
  return false;
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help || args.h) {
    process.stdout.write(
      [
        "Usage:",
        "  pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=54 --isos=parmigiano,pavese --status=in_progress --notes=...",
        "",
        "Args:",
        "  --workerId=NUM              Required",
        "  --batchId=STRING            Optional (defaults to <ISO timestamp>-worker<workerId>)",
        "  --isos=a,b,c                Required (comma/space separated)",
        "  --status=in_progress|...    Optional (default: in_progress)",
        "  --notes=STRING              Optional (you can paste later)",
        "  --blockSize=50              Optional (default: 50)",
        "",
        "Behavior:",
        "  - Computes next available reserved i-range based on max i: in modules/namebases-*.js and max referenced base index in claims notes.",
        "  - Appends claim to tools/mixer-diagnostics/_no_uniq_base_claims.json (UTF-8 no BOM).",
        "  - Emits reserved range for copy/paste.",
        "",
      ].join("\n")
    );
    return;
  }

  const workerId = Number(args.workerId);
  if (!Number.isFinite(workerId)) throw new Error("--workerId is required and must be numeric");

  const isos = parseIsosFromArgv(argv);
  if (!isos.length) throw new Error("--isos is required");

  const blockSize = args.blockSize ? Number(args.blockSize) : 50;
  if (!Number.isFinite(blockSize) || blockSize <= 0) throw new Error("--blockSize must be a positive number");

  const now = new Date().toISOString();
  const batchId = typeof args.batchId === "string" && args.batchId ? args.batchId : `${now}-worker${workerId}`;
  const status = typeof args.status === "string" && args.status ? args.status : "in_progress";
  const notes = typeof args.notes === "string" ? args.notes : "";

  const claims = readClaimsOrInit(claimsPath);
  if (!claims || typeof claims !== "object") throw new Error("claims JSON is not an object");
  if (!Number.isFinite(Number(claims.version))) claims.version = 1;
  if (!Array.isArray(claims.claims)) claims.claims = [];

  for (const c of claims.claims) {
    if (!c) continue;
    if (c.batchId === batchId) {
      throw new Error(`batchId already exists: ${batchId}`);
    }
  }

  for (const c of claims.claims) {
    if (!c || c.status !== "in_progress") continue;
    if (Number(c.workerId) === workerId) {
      throw new Error(`workerId=${workerId} already has an in_progress claim batchId=${c.batchId}`);
    }

    const claimedIsos = Array.isArray(c.isos) ? c.isos : [];
    if (isoSetIntersects(isos, claimedIsos)) {
      throw new Error(`ISO overlap with existing in_progress claim workerId=${c.workerId} batchId=${c.batchId}`);
    }
  }

  const maxUsedI = getMaxNamebaseIndex();
  const maxReserved = getMaxReservedIndexFromClaims(claims);
  const start = Math.max(maxUsedI, maxReserved) + 1;
  const end = start + blockSize - 1;

  const claim = {
    workerId,
    batchId,
    isos,
    status,
    startedAt: now,
    updatedAt: now,
    reservedRange: [start, end],
    notes,
  };

  claims.claims.push(claim);

  writeJsonNoBom(claimsPath, claims);

  process.stdout.write(
    [
      `OK: appended claim to ${claimsRelPath}`,
      `workerId=${workerId}`,
      `batchId=${batchId}`,
      `isos=${isos.join(",")}`,
      `reservedRange=${start}-${end}`,
      "",
      "Suggested notes snippet:",
      `Reserved i range ${start}-${end}. ISO->base mapping (fill in):`,
      ...isos.map((iso, idx) => `- ${iso}->${start + idx}`),
      "",
    ].join("\n")
  );
}

main();

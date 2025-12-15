"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const claimsRelPath = "tools/mixer-diagnostics/_no_uniq_base_claims.json";
const claimsPath = path.join(root, claimsRelPath);

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

    let m;
    while ((m = rxRange.exec(claim.notes))) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
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
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    process.stdout.write(
      [
        "Usage:",
        "  node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=54 --isos=parmigiano,pavese --status=in_progress --notes=...",
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

  const isos = toIsoList(args.isos);
  if (!isos.length) throw new Error("--isos is required");

  const blockSize = args.blockSize ? Number(args.blockSize) : 50;
  if (!Number.isFinite(blockSize) || blockSize <= 0) throw new Error("--blockSize must be a positive number");

  const now = new Date().toISOString();
  const batchId = typeof args.batchId === "string" && args.batchId ? args.batchId : `${now}-worker${workerId}`;
  const status = typeof args.status === "string" && args.status ? args.status : "in_progress";
  const notes = typeof args.notes === "string" ? args.notes : "";

  const claims = readJson(claimsPath);
  if (!claims || typeof claims !== "object") throw new Error("claims JSON is not an object");
  if (!Array.isArray(claims.claims)) claims.claims = [];

  for (const c of claims.claims) {
    if (!c || c.status !== "in_progress" || !Array.isArray(c.isos)) continue;
    if (isoSetIntersects(isos, c.isos)) {
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

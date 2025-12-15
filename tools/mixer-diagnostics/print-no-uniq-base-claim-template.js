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

function readClaimsOrInit(absPath) {
  if (!fs.existsSync(absPath)) return {version: 1, claims: []};
  return readJson(absPath);
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

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help || args.h) {
    process.stdout.write(
      [
        "Usage:",
        "  pnpm exec -- node tools/mixer-diagnostics/print-no-uniq-base-claim-template.js --blockSize=50 --isos=<comma-separated isos>",
        "  pnpm exec -- node tools/mixer-diagnostics/print-no-uniq-base-claim-template.js --blockSize=50 --iso=<iso1> --iso=<iso2>",
        "",
        "Args:",
        "  --blockSize=50              Optional (default: 50; must be >= number of ISOs)",
        "  --isos=a,b,c                Optional; comma/space separated. In PowerShell, quote the whole arg or use repeated --iso=",
        "  --iso=ABC                   Optional; repeatable PowerShell-safe alternative to --isos=...",
        "",
        "Behavior:",
        "  - Read-only: does not write any files.",
        "  - Computes nextReservedRange based on max i: in modules/namebases-*.js and max referenced base index in claims notes.",
        "  - Prints a standardized claim notes template (Reserved i range: start-end + ISO->base placeholders).",
        "",
      ].join("\n"),
    );
    return;
  }

  const blockSize = args.blockSize ? Number(args.blockSize) : 50;
  if (!Number.isFinite(blockSize) || blockSize <= 0) throw new Error("--blockSize must be a positive number");

  const isos = parseIsosFromArgv(argv);
  if (isos.length > blockSize) {
    throw new Error(`--blockSize must be >= number of ISOs (${isos.length})`);
  }

  const maxUsedI = getMaxNamebaseIndex();
  const claims = readClaimsOrInit(claimsPath);
  const maxReserved = getMaxReservedIndexFromClaims(claims);

  const start = Math.max(maxUsedI, maxReserved) + 1;
  const end = start + blockSize - 1;

  const notesLines = [
    `Reserved i range: ${start}-${end}`,
    "ISO->base mapping (fill in):",
  ];

  if (isos.length) {
    for (let i = 0; i < isos.length; i++) {
      notesLines.push(`- ${isos[i]}->${start + i}`);
    }
  } else {
    notesLines.push("- <iso>-><baseIndex>");
  }

  const createWithRepeatedIso = [
    "pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js",
    "--workerId=<NUM>",
    "--status=in_progress",
    `--blockSize=${blockSize}`,
    ...isos.map(iso => `--iso=${iso}`),
  ].join(" ");

  process.stdout.write(
    [
      "NO_UNIQ_BASE claim template (read-only)",
      `blockSize=${blockSize}`,
      `maxUsedI=${maxUsedI}`,
      `maxReservedIndex=${maxReserved}`,
      `nextReservedRange=${start}-${end}`,
      isos.length ? `isos=${isos.join(",")}` : "",
      "",
      "Notes template:",
      ...notesLines,
      "",
      "Create claim (writer):",
      isos.length ? createWithRepeatedIso : "pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=<NUM> --isos=<comma-separated> --status=in_progress",
      "",
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );
}

main();

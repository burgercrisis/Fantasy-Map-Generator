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
  if (typeof SharedArrayBuffer === "function" && typeof Atomics === "object" && typeof Atomics.wait === "function") {
    const sab = new SharedArrayBuffer(4);
    const arr = new Int32Array(sab);
    Atomics.wait(arr, 0, 0, n);
    return;
  }
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
        "  pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=54 --iso=parmigiano --iso=pavese --status=in_progress --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --workerId=54 --status=complete --appendNotes --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=stalled --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --dashboard",
        "",
        "Args:",
        "  --workerId=NUM              Required (create mode); optional (update mode)",
        "  --batchId=STRING            Optional (create mode defaults to <ISO timestamp>-worker<workerId>; update mode can target by batchId)",
        "  --isos=a,b,c                Required (create mode; comma/space separated). In PowerShell, quote the whole arg or use repeated --iso=",
        "  --iso=ABC                   Optional (create mode); repeatable PowerShell-safe alternative to --isos=...",
        "  --status=in_progress|...    Optional (default: in_progress)",
        "  --notes=STRING              Optional (create mode: if omitted, a standard notes template is inserted)",
        "  --dashboard                 Optional; read-only summary of in_progress claims + suggested next reserved range",
        "  --update                    Optional; update an existing claim instead of creating a new one",
        "  --appendNotes               Optional (update mode); append notes instead of replacing",
        "  --blockSize=50              Optional (create/dashboard; default: 50; must be >= number of ISOs)",
        "  --lockWaitMs=30000          Optional (default: 30000)",
        "  --lockRetryMs=200           Optional (default: 200)",
        "  --lockStaleMs=120000        Optional (default: 120000)",
        "  --forceLock                 Optional; delete stale lock if lockStaleMs exceeded",
        "",
        "Behavior:",
        "  - Computes next available reserved i-range based on max i: in modules/namebases-*.js and max referenced base index in claims notes.",
        "  - Appends claim to tools/mixer-diagnostics/_no_uniq_base_claims.json (UTF-8 no BOM).",
        "  - Update mode modifies an existing claim under a lock (updatedAt/status/notes).",
        "  - Dashboard mode prints in_progress claims and computes the next available reserved i-range (read-only).",
        "  - Emits reserved range + a notes template for copy/paste.",
        "",
      ].join("\n")
    );
    return;
  }

  const lockOpts = {
    waitMs: args.lockWaitMs ? Number(args.lockWaitMs) : undefined,
    retryMs: args.lockRetryMs ? Number(args.lockRetryMs) : undefined,
    staleMs: args.lockStaleMs ? Number(args.lockStaleMs) : undefined,
    forceLock: !!args.forceLock,
  };

  if (args.dashboard) {
    if (args.update) throw new Error("--dashboard cannot be combined with --update");
    if (args.workerId !== undefined) throw new Error("--dashboard does not accept --workerId");
    if (args.batchId !== undefined) throw new Error("--dashboard does not accept --batchId");
    if (args.status !== undefined) throw new Error("--dashboard does not accept --status");
    if (args.notes !== undefined) throw new Error("--dashboard does not accept --notes");
    if (args.appendNotes) throw new Error("--dashboard does not accept --appendNotes");

    const isosArg = parseIsosFromArgv(argv);
    if (isosArg.length) throw new Error("--dashboard does not accept --isos/--iso");

    const blockSize = args.blockSize ? Number(args.blockSize) : 50;
    if (!Number.isFinite(blockSize) || blockSize <= 0) throw new Error("--blockSize must be a positive number");

    withLock(claimsLockPath, lockOpts, {mode: "dashboard"}, () => {
      const claims = readClaimsOrInit(claimsPath);
      if (!claims || typeof claims !== "object") throw new Error("claims JSON is not an object");
      if (!Number.isFinite(Number(claims.version))) claims.version = 1;
      if (!Array.isArray(claims.claims)) claims.claims = [];

      const inProgress = claims.claims.filter(c => c && c.status === "in_progress");
      inProgress.sort((a, b) => {
        const aw = Number(a && a.workerId);
        const bw = Number(b && b.workerId);
        if (Number.isFinite(aw) && Number.isFinite(bw) && aw !== bw) return aw - bw;
        if (Number.isFinite(aw) && !Number.isFinite(bw)) return -1;
        if (!Number.isFinite(aw) && Number.isFinite(bw)) return 1;
        return String((a && a.batchId) || "").localeCompare(String((b && b.batchId) || ""));
      });

      const usedWorkerIds = new Set();
      for (const c of inProgress) {
        const n = Number(c && c.workerId);
        if (Number.isFinite(n)) usedWorkerIds.add(n);
      }

      let suggestedWorkerId = 1;
      while (usedWorkerIds.has(suggestedWorkerId)) suggestedWorkerId++;

      const maxUsedI = getMaxNamebaseIndex();
      const maxReserved = getMaxReservedIndexFromClaims(claims);
      const start = Math.max(maxUsedI, maxReserved) + 1;
      const end = start + blockSize - 1;

      const lines = [];
      lines.push("NO_UNIQ_BASE claims dashboard");
      lines.push(`in_progress=${inProgress.length}`);
      lines.push("");
      lines.push("IN_PROGRESS CLAIMS:");

      if (!inProgress.length) {
        lines.push("(none)");
      } else {
        for (const c of inProgress) {
          const rr = Array.isArray(c.reservedRange) && c.reservedRange.length === 2 ? c.reservedRange : [];
          const rrText = rr.length ? `${rr[0]}-${rr[1]}` : "";
          const isoList = Array.isArray(c.isos) ? c.isos : [];
          const preview = isoList.slice(0, 12).join(",");
          const more = isoList.length > 12 ? ",..." : "";
          const isoText = `${isoList.length} [${preview}${more}]`;

          lines.push(
            `- workerId=${c.workerId} batchId=${c.batchId}${rrText ? ` reservedRange=${rrText}` : ""} isos=${isoText}`,
          );
        }
      }

      lines.push("");
      lines.push("SUGGESTED:");
      lines.push(`suggestedWorkerId=${suggestedWorkerId}`);
      lines.push(`maxUsedI=${maxUsedI}`);
      lines.push(`maxReservedIndex=${maxReserved}`);
      lines.push(`nextReservedRange=${start}-${end}`);
      lines.push("");
      lines.push(
        `Create a claim: pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=${suggestedWorkerId} --isos=<comma-separated> --status=in_progress`,
      );
      lines.push("");

      console.log(lines.join("\n"));
    });

    return;
  }

  if (args.update) {
    const batchIdArg = typeof args.batchId === "string" ? args.batchId : "";
    const workerIdArg = args.workerId !== undefined ? Number(args.workerId) : NaN;
    const newStatus = typeof args.status === "string" && args.status ? args.status : "";
    const notesArg = typeof args.notes === "string" ? args.notes : null;
    const appendNotes = !!args.appendNotes;

    const isosArg = parseIsosFromArgv(argv);
    if (isosArg.length) {
      throw new Error("--update does not accept --isos/--iso (claim ISO list is immutable)");
    }

    if (!batchIdArg && !Number.isFinite(workerIdArg)) {
      throw new Error("--update requires --batchId or --workerId");
    }

    withLock(
      claimsLockPath,
      lockOpts,
      {
        mode: "update",
        workerId: Number.isFinite(workerIdArg) ? workerIdArg : undefined,
        batchId: batchIdArg || undefined,
      },
      () => {
        const claims = readClaimsOrInit(claimsPath);
        if (!claims || typeof claims !== "object") throw new Error("claims JSON is not an object");
        if (!Number.isFinite(Number(claims.version))) claims.version = 1;
        if (!Array.isArray(claims.claims)) claims.claims = [];

        let idx = -1;
        if (batchIdArg) {
          idx = claims.claims.findIndex(c => c && c.batchId === batchIdArg);
        } else {
          const matches = claims.claims
            .map((c, i) => ({c, i}))
            .filter(x => x.c && Number(x.c.workerId) === workerIdArg);
          if (!matches.length) throw new Error(`No claim found for workerId=${workerIdArg}`);

          const inProgress = matches.filter(x => x.c.status === "in_progress");
          if (inProgress.length === 1) idx = inProgress[0].i;
          else if (matches.length === 1) idx = matches[0].i;
          else throw new Error(`workerId=${workerIdArg} matches multiple claims; pass --batchId`);
        }

        if (idx < 0) {
          throw new Error(
            batchIdArg
              ? `Claim not found for batchId=${batchIdArg}`
              : `Claim not found for workerId=${workerIdArg}`,
          );
        }

        const claim = claims.claims[idx];
        const now = new Date().toISOString();
        claim.updatedAt = now;
        if (newStatus) claim.status = newStatus;

        if (notesArg !== null) {
          if (appendNotes) {
            const existing = typeof claim.notes === "string" ? claim.notes : "";
            if (existing && notesArg) claim.notes = existing.replace(/\s*$/, "") + "\n\n" + notesArg;
            else claim.notes = existing + notesArg;
          } else {
            claim.notes = notesArg;
          }
        }

        if (claim.status === "in_progress") {
          const claimIsos = Array.isArray(claim.isos) ? claim.isos : [];
          for (let i = 0; i < claims.claims.length; i++) {
            if (i === idx) continue;
            const other = claims.claims[i];
            if (!other || other.status !== "in_progress") continue;

            if (Number(other.workerId) === Number(claim.workerId)) {
              throw new Error(
                `workerId=${claim.workerId} already has another in_progress claim batchId=${other.batchId}`,
              );
            }

            const otherIsos = Array.isArray(other.isos) ? other.isos : [];
            if (isoSetIntersects(claimIsos, otherIsos)) {
              throw new Error(
                `ISO overlap with existing in_progress claim workerId=${other.workerId} batchId=${other.batchId}`,
              );
            }
          }
        }

        writeJsonNoBom(claimsPath, claims);

        const rr = Array.isArray(claim.reservedRange) && claim.reservedRange.length === 2 ? claim.reservedRange : [];

        process.stdout.write(
          [
            `OK: updated claim in ${claimsRelPath}`,
            `workerId=${claim.workerId}`,
            `batchId=${claim.batchId}`,
            `status=${claim.status}`,
            `updatedAt=${claim.updatedAt}`,
            rr.length ? `reservedRange=${rr[0]}-${rr[1]}` : "",
            "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
      },
    );

    return;
  }

  const workerId = Number(args.workerId);
  if (!Number.isFinite(workerId)) throw new Error("--workerId is required and must be numeric");

  const isos = parseIsosFromArgv(argv);
  if (!isos.length) throw new Error("--isos is required");

  const blockSize = args.blockSize ? Number(args.blockSize) : 50;
  if (!Number.isFinite(blockSize) || blockSize <= 0) throw new Error("--blockSize must be a positive number");

  if (isos.length > blockSize) {
    throw new Error(`--blockSize must be >= number of ISOs (${isos.length})`);
  }

  const status = typeof args.status === "string" && args.status ? args.status : "in_progress";
  const notesArg = typeof args.notes === "string" ? args.notes : "";

  withLock(
    claimsLockPath,
    lockOpts,
    {mode: "create", workerId, isos: isos.join(",")},
    () => {
      const now = new Date().toISOString();
      const batchId =
        typeof args.batchId === "string" && args.batchId ? args.batchId : `${now}-worker${workerId}`;

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

      const notesTemplateLines = [
        `Reserved i range: ${start}-${end}`,
        "ISO->base mapping (fill in):",
        ...isos.map((iso, idx) => `- ${iso}->${start + idx}`),
      ];

      const notes = notesArg ? notesArg : notesTemplateLines.join("\n");

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
          "Notes template (auto-inserted if you did not pass --notes):",
          ...notesTemplateLines,
          "",
        ].join("\n"),
      );
    },
  );
}

main();

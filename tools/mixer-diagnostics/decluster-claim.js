"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const claimsRelPath = "tools/mixer-diagnostics/_decluster_claims.json";
const claimsPath = path.join(root, claimsRelPath);
const claimsLockRelPath = "tools/mixer-diagnostics/_decluster_claims.lock";
const claimsLockPath = path.join(root, claimsLockRelPath);

const noUniqClaimsRelPath = "tools/mixer-diagnostics/_no_uniq_base_claims.json";
const noUniqClaimsPath = path.join(root, noUniqClaimsRelPath);

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

function readClaimsMaybe(absPath) {
  if (!fs.existsSync(absPath)) return null;
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

function parseBasesFromArgv(argv) {
  const repeated = argv
    .filter(a => a.startsWith("--base="))
    .map(a => a.slice("--base=".length))
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => Number(s))
    .filter(n => Number.isFinite(n));
  if (repeated.length) return repeated;

  const parts = getArgList(argv, "--bases");
  if (!parts.length) return [];
  return String(parts.join(","))
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => Number(s))
    .filter(n => Number.isFinite(n));
}

function normalizeBases(bases) {
  const unique = Array.from(new Set((bases || []).map(n => Number(n)))).filter(n => Number.isFinite(n));
  unique.sort((a, b) => a - b);
  return unique;
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

  const rxRange = /(\d+)\s*[\u2013\-]\s*(\d+)/g;
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
        "  pnpm exec -- node tools/mixer-diagnostics/decluster-claim.js --workerId=54 --bases=12,34,56 --isos=a,b,c --status=in_progress --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/decluster-claim.js --workerId=54 --base=12 --base=34 --base=56 --iso=a --iso=b --iso=c --status=in_progress --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/decluster-claim.js --update --workerId=54 --status=complete --appendNotes --notes=...",
        "  pnpm exec -- node tools/mixer-diagnostics/decluster-claim.js --update --batchId=<batchId> --status=stalled --notes=...",
        "",
        "Args:",
        "  --workerId=NUM              Required (create mode); optional (update mode)",
        "  --batchId=STRING            Optional (create mode defaults to <ISO timestamp>-worker<workerId>; update mode can target by batchId)",
        "  --bases=1,2,3               Required (create mode; comma/space separated)",
        "  --base=NUM                  Optional (create mode); repeatable PowerShell-safe alternative to --bases=...",
        "  --isos=a,b,c                Required (create mode; comma/space separated). In PowerShell, quote the whole arg or use repeated --iso=",
        "  --iso=ABC                   Optional (create mode); repeatable PowerShell-safe alternative to --isos=...",
        "  --status=in_progress|...    Optional (default: in_progress)",
        "  --notes=STRING              Optional",
        "  --update                    Optional; update an existing claim instead of creating a new one",
        "  --appendNotes               Optional (update mode); append notes instead of replacing",
        "  --blockSize=NUM             Optional (create mode; default: number of isos). Use 0 to skip reserving an i-range.",
        "  --lockWaitMs=30000          Optional (default: 30000)",
        "  --lockRetryMs=200           Optional (default: 200)",
        "  --lockStaleMs=120000        Optional (default: 120000)",
        "  --forceLock                 Optional; delete stale lock if lockStaleMs exceeded",
        "",
      ].join("\n"),
    );
    return;
  }

  const lockOpts = {
    waitMs: args.lockWaitMs ? Number(args.lockWaitMs) : undefined,
    retryMs: args.lockRetryMs ? Number(args.lockRetryMs) : undefined,
    staleMs: args.lockStaleMs ? Number(args.lockStaleMs) : undefined,
    forceLock: !!args.forceLock,
  };

  if (args.update) {
    const batchIdArg = typeof args.batchId === "string" ? args.batchId : "";
    const workerIdArg = args.workerId !== undefined ? Number(args.workerId) : NaN;
    const newStatus = typeof args.status === "string" && args.status ? args.status : "";
    const notesArg = typeof args.notes === "string" ? args.notes : null;
    const appendNotes = !!args.appendNotes;

    const isosArg = parseIsosFromArgv(argv);
    const basesArg = normalizeBases(parseBasesFromArgv(argv));
    const basesKeyArg = typeof args.basesKey === "string" ? String(args.basesKey) : "";

    if (isosArg.length || basesArg.length || basesKeyArg) {
      throw new Error("--update does not accept --bases/--base/--isos/--iso (claim target is immutable)");
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
          const claimBasesKey = typeof claim.basesKey === "string" ? claim.basesKey : "";

          for (let i = 0; i < claims.claims.length; i++) {
            if (i === idx) continue;
            const other = claims.claims[i];
            if (!other || other.status !== "in_progress") continue;

            if (Number(other.workerId) === Number(claim.workerId)) {
              throw new Error(
                `workerId=${claim.workerId} already has another in_progress claim batchId=${other.batchId}`,
              );
            }

            const otherBasesKey = typeof other.basesKey === "string" ? other.basesKey : "";
            if (claimBasesKey && otherBasesKey && otherBasesKey === claimBasesKey) {
              throw new Error(
                `basesKey overlap with existing in_progress claim workerId=${other.workerId} batchId=${other.batchId}`,
              );
            }

            const otherIsos = Array.isArray(other.isos) ? other.isos : [];
            if (isoSetIntersects(claimIsos, otherIsos)) {
              throw new Error(
                `ISO overlap with existing in_progress claim workerId=${other.workerId} batchId=${other.batchId}`,
              );
            }
          }

          const noUniqClaims = readClaimsMaybe(noUniqClaimsPath);
          if (noUniqClaims && Array.isArray(noUniqClaims.claims)) {
            for (const other of noUniqClaims.claims) {
              if (!other || other.status !== "in_progress") continue;
              const otherIsos = Array.isArray(other.isos) ? other.isos : [];
              if (isoSetIntersects(claimIsos, otherIsos)) {
                throw new Error(
                  `ISO overlap with existing NO_UNIQ_BASE in_progress claim workerId=${other.workerId} batchId=${other.batchId}`,
                );
              }
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
            `basesKey=${claim.basesKey}`,
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

  const bases = normalizeBases(parseBasesFromArgv(argv));
  if (!bases.length) throw new Error("--bases is required");

  const basesKey = bases.join(",");
  const isos = parseIsosFromArgv(argv);
  if (!isos.length) throw new Error("--isos is required");

  const status = typeof args.status === "string" && args.status ? args.status : "in_progress";
  const notes = typeof args.notes === "string" ? args.notes : "";

  const blockSizeRaw = args.blockSize !== undefined ? Number(args.blockSize) : isos.length;
  const blockSize = Number.isFinite(blockSizeRaw) ? blockSizeRaw : isos.length;

  withLock(
    claimsLockPath,
    lockOpts,
    {mode: "create", workerId, basesKey, isos: isos.join(",")},
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

        const otherBasesKey = typeof c.basesKey === "string" ? c.basesKey : "";
        if (otherBasesKey && otherBasesKey === basesKey) {
          throw new Error(
            `basesKey overlap with existing in_progress claim workerId=${c.workerId} batchId=${c.batchId}`,
          );
        }

        const claimedIsos = Array.isArray(c.isos) ? c.isos : [];
        if (isoSetIntersects(isos, claimedIsos)) {
          throw new Error(`ISO overlap with existing in_progress claim workerId=${c.workerId} batchId=${c.batchId}`);
        }
      }

      const noUniqClaims = readClaimsMaybe(noUniqClaimsPath);
      if (noUniqClaims && Array.isArray(noUniqClaims.claims)) {
        for (const c of noUniqClaims.claims) {
          if (!c || c.status !== "in_progress") continue;
          const claimedIsos = Array.isArray(c.isos) ? c.isos : [];
          if (isoSetIntersects(isos, claimedIsos)) {
            throw new Error(
              `ISO overlap with existing NO_UNIQ_BASE in_progress claim workerId=${c.workerId} batchId=${c.batchId}`,
            );
          }
        }
      }

      let reservedRange;
      if (blockSize > 0) {
        const maxUsedI = getMaxNamebaseIndex();
        const maxReservedDecluster = getMaxReservedIndexFromClaims(claims);
        const maxReservedNoUniq = getMaxReservedIndexFromClaims(noUniqClaims);
        const start = Math.max(maxUsedI, maxReservedDecluster, maxReservedNoUniq) + 1;
        const end = start + blockSize - 1;
        reservedRange = [start, end];
      }

      const claim = {
        workerId,
        batchId,
        basesKey,
        bases,
        isos,
        status,
        startedAt: now,
        updatedAt: now,
        notes,
      };

      if (reservedRange) claim.reservedRange = reservedRange;

      claims.claims.push(claim);
      writeJsonNoBom(claimsPath, claims);

      const rr = Array.isArray(claim.reservedRange) && claim.reservedRange.length === 2 ? claim.reservedRange : [];

      process.stdout.write(
        [
          `OK: appended claim to ${claimsRelPath}`,
          `workerId=${workerId}`,
          `batchId=${batchId}`,
          `basesKey=${basesKey}`,
          `isos=${isos.join(",")}`,
          rr.length ? `reservedRange=${rr[0]}-${rr[1]}` : "",
          "",
          rr.length ? "Suggested notes snippet:" : "",
          rr.length ? `Reserved i range ${rr[0]}-${rr[1]}. ISO->base mapping (fill in):` : "",
          ...(rr.length ? isos.map((iso, idx) => `- ${iso}->${rr[0] + idx}`) : []),
          "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    },
  );
}

main();

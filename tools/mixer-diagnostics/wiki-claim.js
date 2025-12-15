"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const claimsRelPath = "tools/mixer-diagnostics/_wiki_multiagent_claims.json";
const claimsPath = path.join(root, claimsRelPath);
const claimsLockRelPath = "tools/mixer-diagnostics/_wiki_multiagent_claims.lock";
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

function safeParseIsoTime(s) {
  if (!s || typeof s !== "string") return NaN;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}

function formatAgeMs(ageMs) {
  if (!Number.isFinite(ageMs) || ageMs < 0) return "";
  const totalMinutes = Math.floor(ageMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h${minutes.toString().padStart(2, "0")}m`;
}

function normalizeClaimsShape(parsed) {
  const claims = parsed && typeof parsed === "object" && Array.isArray(parsed.claims) ? parsed.claims : [];
  return claims.filter(Boolean);
}

function suggestWorkerId(allClaims) {
  const used = new Set();
  for (const c of allClaims) {
    const n = Number(c && c.workerId);
    if (Number.isFinite(n)) used.add(n);
  }
  let next = 1;
  while (used.has(next)) next++;
  return next;
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  const lockOpts = {
    waitMs: args.lockWaitMs ? Number(args.lockWaitMs) : undefined,
    retryMs: args.lockRetryMs ? Number(args.lockRetryMs) : undefined,
    staleMs: args.lockStaleMs ? Number(args.lockStaleMs) : undefined,
    forceLock: !!args.forceLock,
  };

  if (args.help || args.h) {
    process.stdout.write(
      [
        "Usage:",
        "  pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --dashboard [--limit=25]",
        "  pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --workerId=<NUM> --target=<JSON_PATH> [--scope=...] [--status=in_progress] [--note=...]",
        "  pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --update --workerId=<NUM> [--status=complete|stalled|in_progress] [--scope=...] [--note=...] [--appendNote]",
        "  pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --update --target=<JSON_PATH> [--status=...] [--scope=...] [--note=...] [--appendNote]",
        "",
        "Files:",
        `  claims: ${claimsRelPath}`,
        `  lock:   ${claimsLockRelPath}`,
        "",
        "Notes:",
        "  - Do not hand-edit the claims JSON.",
        "  - status=in_progress locks the target (one worker per target at a time).",
        "",
        "Lock options:",
        "  --lockWaitMs=... --lockRetryMs=... --lockStaleMs=... --forceLock",
        "",
      ].join("\n"),
    );
    return;
  }

  if (args.dashboard) {
    if (args.update) throw new Error("--dashboard cannot be combined with --update");
    if (args.workerId !== undefined) throw new Error("--dashboard does not accept --workerId");
    if (args.target !== undefined) throw new Error("--dashboard does not accept --target");
    if (args.scope !== undefined) throw new Error("--dashboard does not accept --scope");
    if (args.status !== undefined) throw new Error("--dashboard does not accept --status");
    if (args.note !== undefined) throw new Error("--dashboard does not accept --note");
    if (args.appendNote) throw new Error("--dashboard does not accept --appendNote");

    const limit = Math.max(1, Number.isFinite(Number(args.limit)) ? Number(args.limit) : 25);

    withLock(claimsLockPath, lockOpts, {mode: "dashboard"}, () => {
      const claimsDoc = readClaimsOrInit(claimsPath);
      if (!claimsDoc || typeof claimsDoc !== "object") throw new Error("claims JSON is not an object");
      if (!Number.isFinite(Number(claimsDoc.version))) claimsDoc.version = 1;
      if (!Array.isArray(claimsDoc.claims)) claimsDoc.claims = [];

      const allClaims = normalizeClaimsShape(claimsDoc);
      const inProgress = allClaims.filter(c => c && c.status === "in_progress");

      inProgress.sort((a, b) => {
        const at = safeParseIsoTime(a && a.startedAt);
        const bt = safeParseIsoTime(b && b.startedAt);
        if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return at - bt;
        return String((a && a.target) || "").localeCompare(String((b && b.target) || ""));
      });

      let oldestAge = NaN;
      const now = Date.now();
      for (const c of inProgress) {
        const t = safeParseIsoTime(c && c.startedAt);
        if (Number.isFinite(t)) oldestAge = Number.isFinite(oldestAge) ? Math.max(oldestAge, now - t) : now - t;
      }

      const lines = [];
      lines.push("WIKI claims dashboard");
      lines.push(`generatedAt=${new Date(now).toISOString()}`);
      lines.push(`in_progress=${inProgress.length}`);
      lines.push(`suggestedWorkerId=${suggestWorkerId(allClaims)}`);
      if (Number.isFinite(oldestAge)) lines.push(`oldestInProgressAge=${formatAgeMs(oldestAge)}`);
      lines.push("");
      lines.push("IN_PROGRESS CLAIMS:");

      if (!inProgress.length) {
        lines.push("(none)");
      } else {
        for (const c of inProgress.slice(0, limit)) {
          const target = typeof c.target === "string" ? c.target : "";
          const scope = typeof c.scope === "string" ? c.scope : "";
          const startedAt = typeof c.startedAt === "string" ? c.startedAt : "";
          lines.push(
            `- workerId=${c.workerId} target=${target}${scope ? ` scope=${scope}` : ""}${startedAt ? ` startedAt=${startedAt}` : ""}`,
          );
        }
        if (inProgress.length > limit) lines.push(`(truncated: showing ${limit}/${inProgress.length})`);
      }

      lines.push("");
      lines.push(
        `Create a claim: pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --workerId=${suggestWorkerId(allClaims)} --target=<JSON_PATH> --scope=coverage_then_uniqueness_then_race --status=in_progress`,
      );
      lines.push("");

      process.stdout.write(lines.join("\n") + "\n");
    });

    return;
  }

  if (args.update) {
    const workerIdArg = args.workerId !== undefined ? Number(args.workerId) : NaN;
    const targetArg = typeof args.target === "string" ? args.target : "";
    const newStatus = typeof args.status === "string" && args.status ? args.status : "";
    const newScope = typeof args.scope === "string" && args.scope ? args.scope : "";
    const noteArg = typeof args.note === "string" ? args.note : null;
    const appendNote = !!args.appendNote;

    if (!Number.isFinite(workerIdArg) && !targetArg) {
      throw new Error("--update requires --workerId or --target");
    }

    withLock(
      claimsLockPath,
      lockOpts,
      {mode: "update", workerId: Number.isFinite(workerIdArg) ? workerIdArg : undefined, target: targetArg || undefined},
      () => {
        const claimsDoc = readClaimsOrInit(claimsPath);
        if (!claimsDoc || typeof claimsDoc !== "object") throw new Error("claims JSON is not an object");
        if (!Number.isFinite(Number(claimsDoc.version))) claimsDoc.version = 1;
        if (!Array.isArray(claimsDoc.claims)) claimsDoc.claims = [];

        const allClaims = normalizeClaimsShape(claimsDoc);

        let idx = -1;
        if (targetArg) {
          idx = allClaims.findIndex(c => c && c.target === targetArg);
        } else {
          const matches = allClaims
            .map((c, i) => ({c, i}))
            .filter(x => x.c && Number(x.c.workerId) === workerIdArg);

          if (!matches.length) throw new Error(`No claim found for workerId=${workerIdArg}`);

          const inProgress = matches.filter(x => x.c.status === "in_progress");
          if (inProgress.length === 1) idx = inProgress[0].i;
          else if (matches.length === 1) idx = matches[0].i;
          else throw new Error(`workerId=${workerIdArg} matches multiple claims; pass --target`);
        }

        if (idx < 0) {
          throw new Error(targetArg ? `Claim not found for target=${targetArg}` : `Claim not found for workerId=${workerIdArg}`);
        }

        const claim = allClaims[idx];
        const nowIso = new Date().toISOString();

        if (newScope) claim.scope = newScope;

        if (newStatus) {
          claim.status = newStatus;
          if (newStatus !== "in_progress" && typeof claim.finishedAt !== "string") {
            claim.finishedAt = nowIso;
          }
        }

        if (noteArg !== null) {
          if (appendNote) {
            const existing = typeof claim.note === "string" ? claim.note : "";
            if (existing && noteArg) claim.note = existing.replace(/\s*$/, "") + "\n\n" + noteArg;
            else claim.note = existing + noteArg;
          } else {
            claim.note = noteArg;
          }
        }

        const target = typeof claim.target === "string" ? claim.target : "";
        if (claim.status === "in_progress" && target) {
          for (const other of allClaims) {
            if (!other || other === claim) continue;
            if (other.status !== "in_progress") continue;
            if (typeof other.target === "string" && other.target === target) {
              throw new Error(`target already has an in_progress claim workerId=${other.workerId}`);
            }
          }
        }

        claimsDoc.claims = allClaims;
        writeJsonNoBom(claimsPath, claimsDoc);

        process.stdout.write(
          [
            `OK: updated claim in ${claimsRelPath}`,
            `workerId=${claim.workerId}`,
            `target=${claim.target}`,
            `status=${claim.status}`,
            typeof claim.finishedAt === "string" ? `finishedAt=${claim.finishedAt}` : "",
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

  const target = typeof args.target === "string" ? args.target : "";
  if (!target) throw new Error("--target is required");

  const scope = typeof args.scope === "string" && args.scope ? args.scope : "coverage_then_uniqueness_then_race";
  const status = typeof args.status === "string" && args.status ? args.status : "in_progress";
  const note = typeof args.note === "string" ? args.note : "";

  withLock(claimsLockPath, lockOpts, {mode: "create", workerId, target}, () => {
    const claimsDoc = readClaimsOrInit(claimsPath);
    if (!claimsDoc || typeof claimsDoc !== "object") throw new Error("claims JSON is not an object");
    if (!Number.isFinite(Number(claimsDoc.version))) claimsDoc.version = 1;
    if (!Array.isArray(claimsDoc.claims)) claimsDoc.claims = [];

    const allClaims = normalizeClaimsShape(claimsDoc);

    for (const c of allClaims) {
      if (!c || c.status !== "in_progress") continue;
      if (Number(c.workerId) === workerId) {
        throw new Error(`workerId=${workerId} already has an in_progress claim target=${c.target}`);
      }
      if (typeof c.target === "string" && c.target === target) {
        throw new Error(`target already claimed as in_progress by workerId=${c.workerId}`);
      }
    }

    const now = new Date().toISOString();

    const claim = {
      workerId,
      target,
      scope,
      status,
      startedAt: now,
    };

    if (note) claim.note = note;

    allClaims.push(claim);
    claimsDoc.claims = allClaims;
    writeJsonNoBom(claimsPath, claimsDoc);

    process.stdout.write(
      [
        `OK: appended claim to ${claimsRelPath}`,
        `workerId=${workerId}`,
        `target=${target}`,
        `scope=${scope}`,
        `status=${status}`,
        `startedAt=${now}`,
        "",
      ].join("\n"),
    );
  });
}

main();

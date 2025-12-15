"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const SOURCES = [
  {
    id: "no_uniq_base",
    label: "NO_UNIQ_BASE",
    relPath: "tools/mixer-diagnostics/_no_uniq_base_claims.json",
  },
  {
    id: "decluster",
    label: "DECLUSTER",
    relPath: "tools/mixer-diagnostics/_decluster_claims.json",
  },
  {
    id: "wiki",
    label: "WIKI",
    relPath: "tools/mixer-diagnostics/_wiki_multiagent_claims.json",
  },
];

function stripBom(s) {
  if (!s) return s;
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function readJsonIfExists(absPath) {
  if (!fs.existsSync(absPath)) return {ok: false, error: `missing file: ${absPath}`};
  try {
    const raw = stripBom(fs.readFileSync(absPath, "utf8"));
    const parsed = JSON.parse(raw);
    return {ok: true, value: parsed};
  } catch (err) {
    return {ok: false, error: String(err && err.message ? err.message : err)};
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

function toInt(v, defaultValue) {
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
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

function previewList(xs, limit) {
  const arr = Array.isArray(xs) ? xs : [];
  const head = arr.slice(0, limit).join(",");
  const more = arr.length > limit ? ",..." : "";
  return `${arr.length} [${head}${more}]`;
}

function suggestWorkerId(inProgressClaims) {
  const used = new Set();
  for (const c of inProgressClaims) {
    const n = Number(c && c.workerId);
    if (Number.isFinite(n)) used.add(n);
  }
  let next = 1;
  while (used.has(next)) next++;
  return next;
}

function normalizeClaimsShape(parsed) {
  const claims = parsed && typeof parsed === "object" && Array.isArray(parsed.claims) ? parsed.claims : [];
  return claims.filter(Boolean);
}

function getInProgressClaims(allClaims) {
  return allClaims.filter(c => c && c.status === "in_progress");
}

function collectLockedIsosFromClaims(claims) {
  const out = new Set();
  for (const c of claims) {
    const isos = Array.isArray(c && c.isos) ? c.isos : [];
    for (const iso of isos) {
      if (typeof iso === "string" && iso) out.add(iso);
    }
  }
  return out;
}

function printNoUniqBaseClaims(claims, previewCount, limit) {
  const lines = [];
  for (const c of claims.slice(0, limit)) {
    const rr = Array.isArray(c.reservedRange) && c.reservedRange.length === 2 ? c.reservedRange : [];
    const rrText = rr.length ? `${rr[0]}-${rr[1]}` : "";
    const updatedAt = typeof c.updatedAt === "string" ? c.updatedAt : "";
    const startedAt = typeof c.startedAt === "string" ? c.startedAt : "";
    const isos = Array.isArray(c.isos) ? c.isos : [];
    lines.push(
      `- workerId=${c.workerId} batchId=${c.batchId}${rrText ? ` reservedRange=${rrText}` : ""} isos=${previewList(
        isos,
        previewCount,
      )}${updatedAt ? ` updatedAt=${updatedAt}` : startedAt ? ` startedAt=${startedAt}` : ""}`,
    );
  }
  if (claims.length > limit) {
    lines.push(`(truncated: showing ${limit}/${claims.length})`);
  }
  return lines;
}

function printDeclusterClaims(claims, previewCount, limit) {
  const lines = [];
  for (const c of claims.slice(0, limit)) {
    const rr = Array.isArray(c.reservedRange) && c.reservedRange.length === 2 ? c.reservedRange : [];
    const rrText = rr.length ? `${rr[0]}-${rr[1]}` : "";
    const isos = Array.isArray(c.isos) ? c.isos : [];
    lines.push(
      `- workerId=${c.workerId} batchId=${c.batchId} basesKey=${c.basesKey}${rrText ? ` reservedRange=${rrText}` : ""} isos=${previewList(
        isos,
        previewCount,
      )}`,
    );
  }
  if (claims.length > limit) {
    lines.push(`(truncated: showing ${limit}/${claims.length})`);
  }
  return lines;
}

function printWikiClaims(claims, limit) {
  const lines = [];
  for (const c of claims.slice(0, limit)) {
    const target = typeof c.target === "string" ? c.target : "";
    const scope = typeof c.scope === "string" ? c.scope : "";
    const startedAt = typeof c.startedAt === "string" ? c.startedAt : "";
    lines.push(`- workerId=${c.workerId} target=${target}${scope ? ` scope=${scope}` : ""}${startedAt ? ` startedAt=${startedAt}` : ""}`);
  }
  if (claims.length > limit) {
    lines.push(`(truncated: showing ${limit}/${claims.length})`);
  }
  return lines;
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help || args.h) {
    process.stdout.write(
      [
        "Usage:",
        "  pnpm exec -- node tools/mixer-diagnostics/claims-dashboard.js [options]",
        "",
        "Options:",
        "  --limit=N        Max rows to print per section (default: 25)",
        "  --preview=N      ISO preview count (default: 12)",
        "",
        "Behavior:",
        "  - Read-only: does not write any files.",
        "  - Aggregates in_progress claims from:",
        "    - tools/mixer-diagnostics/_no_uniq_base_claims.json", 
        "    - tools/mixer-diagnostics/_decluster_claims.json", 
        "    - tools/mixer-diagnostics/_wiki_multiagent_claims.json",
        "",
      ].join("\n"),
    );
    return;
  }

  const limit = Math.max(1, toInt(args.limit, 25));
  const previewCount = Math.max(1, toInt(args.preview, 12));

  const now = Date.now();
  const header = [];
  header.push("Global claims dashboard (read-only)");
  header.push(`generatedAt=${new Date(now).toISOString()}`);
  header.push("");

  process.stdout.write(header.join("\n") + "\n");

  const loaded = new Map();

  for (const src of SOURCES) {
    const abs = path.join(root, src.relPath);
    const r = readJsonIfExists(abs);
    loaded.set(src.id, {src, abs, ...r});
  }

  const noUniq = loaded.get("no_uniq_base");
  const decluster = loaded.get("decluster");
  const wiki = loaded.get("wiki");

  const sections = [];

  // NO_UNIQ_BASE
  {
    sections.push("NO_UNIQ_BASE:");
    if (!noUniq.ok) {
      sections.push(`- ERROR: ${noUniq.error}`);
    } else {
      const allClaims = normalizeClaimsShape(noUniq.value);
      const inProgress = getInProgressClaims(allClaims);
      sections.push(`- in_progress=${inProgress.length}`);
      sections.push(`- suggestedWorkerId=${suggestWorkerId(inProgress)}`);

      let oldestAge = NaN;
      for (const c of inProgress) {
        const t = safeParseIsoTime(c.startedAt);
        if (Number.isFinite(t)) oldestAge = Number.isFinite(oldestAge) ? Math.max(oldestAge, now - t) : now - t;
      }
      if (Number.isFinite(oldestAge)) sections.push(`- oldestInProgressAge=${formatAgeMs(oldestAge)}`);

      if (!inProgress.length) sections.push("(none)");
      else sections.push(...printNoUniqBaseClaims(inProgress, previewCount, limit));
    }
    sections.push("");
  }

  // DECLUSTER
  {
    sections.push("DECLUSTER:");
    if (!decluster.ok) {
      sections.push(`- ERROR: ${decluster.error}`);
    } else {
      const allClaims = normalizeClaimsShape(decluster.value);
      const inProgress = getInProgressClaims(allClaims);
      sections.push(`- in_progress=${inProgress.length}`);
      sections.push(`- suggestedWorkerId=${suggestWorkerId(inProgress)}`);

      let oldestAge = NaN;
      for (const c of inProgress) {
        const t = safeParseIsoTime(c.startedAt);
        if (Number.isFinite(t)) oldestAge = Number.isFinite(oldestAge) ? Math.max(oldestAge, now - t) : now - t;
      }
      if (Number.isFinite(oldestAge)) sections.push(`- oldestInProgressAge=${formatAgeMs(oldestAge)}`);

      if (!inProgress.length) sections.push("(none)");
      else sections.push(...printDeclusterClaims(inProgress, previewCount, limit));
    }
    sections.push("");
  }

  // WIKI
  {
    sections.push("WIKI:");
    if (!wiki.ok) {
      sections.push(`- ERROR: ${wiki.error}`);
    } else {
      const allClaims = normalizeClaimsShape(wiki.value);
      const inProgress = getInProgressClaims(allClaims);
      sections.push(`- in_progress=${inProgress.length}`);
      sections.push(`- suggestedWorkerId=${suggestWorkerId(inProgress)}`);

      let oldestAge = NaN;
      for (const c of inProgress) {
        const t = safeParseIsoTime(c.startedAt);
        if (Number.isFinite(t)) oldestAge = Number.isFinite(oldestAge) ? Math.max(oldestAge, now - t) : now - t;
      }
      if (Number.isFinite(oldestAge)) sections.push(`- oldestInProgressAge=${formatAgeMs(oldestAge)}`);

      if (!inProgress.length) sections.push("(none)");
      else sections.push(...printWikiClaims(inProgress, limit));
    }
    sections.push("");
  }

  // Cross-check: ISO overlap between NO_UNIQ_BASE and DECLUSTER
  {
    sections.push("CROSS-CHECK:");

    if (noUniq && noUniq.ok && decluster && decluster.ok) {
      const noUniqInProgress = getInProgressClaims(normalizeClaimsShape(noUniq.value));
      const declusterInProgress = getInProgressClaims(normalizeClaimsShape(decluster.value));

      const noUniqIsos = collectLockedIsosFromClaims(noUniqInProgress);
      const declusterIsos = collectLockedIsosFromClaims(declusterInProgress);

      const overlap = [];
      for (const iso of noUniqIsos) {
        if (declusterIsos.has(iso)) overlap.push(iso);
      }
      overlap.sort((a, b) => a.localeCompare(b));

      sections.push(`- isoOverlap.noUniq_vs_decluster=${overlap.length}`);
      if (overlap.length) {
        sections.push(`- overlapIsos=${overlap.join(",")}`);
      }
    } else {
      sections.push("- isoOverlap.noUniq_vs_decluster=unknown (missing/invalid input files)");
    }

    sections.push("");
  }

  process.stdout.write(sections.join("\n") + "\n");
}

main();

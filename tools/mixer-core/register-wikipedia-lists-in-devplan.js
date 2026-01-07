"use strict";

/**
 * Wikipedia List Auto-Registration Script
 *
 * Discovers wikipedia*.json files in tools/mixer-meta/ and registers them
 * in DEVplans/Languages-Status.md under section 8.99 (auto-registered wiki lists).
 *
 * Usage:
 *   node tools/mixer-core/register-wikipedia-lists-in-devplan.js [--apply]
 *
 * Options:
 *   --apply    Write changes to devplan (default is dry run)
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readUtf8Clean(fullPath) {
  const buf = fs.readFileSync(fullPath);
  let s = buf.toString("utf8");
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  s = s.replace(/\u0000/g, "");
  return s;
}

function loadListMeta(relPathFromRoot) {
  const full = path.isAbsolute(relPathFromRoot) ? relPathFromRoot : path.join(root, relPathFromRoot);
  const raw = readUtf8Clean(full);
  const data = JSON.parse(raw);

  if (Array.isArray(data)) {
    return {
      title: path.basename(full),
      source: "",
      items: data,
      relFromRoot: path.relative(root, full).replace(/\\/g, "/")
    };
  }

  return {
    title: String((data && data.title) || path.basename(full)),
    source: String((data && data.source) || ""),
    items: Array.isArray(data && data.items) ? data.items : [],
    relFromRoot: path.relative(root, full).replace(/\\/g, "/")
  };
}

function discoverWikiMetaJsonRelPaths() {
  const dir = path.join(root, "tools", "mixer-meta");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(f => /^wikipedia.*\.json$/i.test(f))
    .filter(f => !/\.bak-/i.test(f))
    .map(f => `tools/mixer-meta/${f}`)
    .sort((a, b) => a.localeCompare(b));
}

function parseRegisteredJsonPathsFromDevplan(devplanRaw) {
  const re = /- \*\*JSON file:\*\* `([^`]+\.json)`/g;
  const out = new Set();
  let m;
  while ((m = re.exec(devplanRaw))) {
    out.add(m[1]);
  }
  return out;
}

function ensureAutoSection(devplanLines) {
  const header = "### 8.99 Auto-registered wiki lists (untriaged)";
  const existingIndex = devplanLines.findIndex(l => l.trim() === header);
  if (existingIndex !== -1) {
    return { lines: devplanLines, insertIndex: existingIndex + 1, alreadyPresent: true };
  }

  let insertAt = devplanLines.findIndex(l => /^##\s+9\./.test(l.trim()));
  if (insertAt === -1) insertAt = devplanLines.length;

  const block = [
    "",
    header,
    "",
    "- **Status:** Auto-populated registry entries for wiki JSONs that exist on disk but have not been triaged into the curated sections above.",
    "- **Note:** Snapshot blocks are maintained by tooling; do not hand-edit counts.",
    ""
  ];

  const lines = [...devplanLines.slice(0, insertAt), ...block, ...devplanLines.slice(insertAt)];
  const newHeaderIndex = lines.findIndex(l => l.trim() === header);
  return { lines, insertIndex: newHeaderIndex + block.length - 1, alreadyPresent: false };
}

function makeEntryMarkdown(listMeta) {
  const title = listMeta.title || path.basename(listMeta.relFromRoot);
  const sourceLine = listMeta.source ? `- **Source:** ${listMeta.source}` : "- **Source:**";

  return [
    `#### ${title}`,
    "",
    `- **JSON file:** \`${listMeta.relFromRoot}\``,
    sourceLine,
    "- **Status tier:** **Untriaged (auto-registered)**",
    "- **Snapshot from last run (all list items):**",
    "  - `fully wired:` 0",
    "  - `missing catalog:` 0",
    "  - `missing map:` 0",
    "  - `missing both:` 0",
    "  - `unmatched:` 0",
    "  - `ambiguous:` 0",
    "  - `Nonunique Bases:` 0",
    "- **Base-set uniqueness details (full items):**",
    "  - `unique bases:` 0",
    "  - `clustered bases:` 0",
    "  - `clustered full items:` 0",
    ""
  ];
}

function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const devplanRel = "DEVplans/Languages-Status.md";
  const devplanPath = path.join(root, devplanRel);

  if (!fs.existsSync(devplanPath)) {
    console.error("Devplan not found:", devplanPath);
    process.exitCode = 1;
    return;
  }

  const devplanRaw = fs.readFileSync(devplanPath, "utf8");
  const registered = parseRegisteredJsonPathsFromDevplan(devplanRaw);

  const allWiki = discoverWikiMetaJsonRelPaths();
  const missing = allWiki.filter(p => !registered.has(p));

  if (!missing.length) {
    console.log("No missing wikipedia*.json entries to register in", devplanRel);
    return;
  }

  console.log("Discovered", allWiki.length, "wikipedia*.json files under tools/mixer-meta/");
  console.log("Missing from devplan:", missing.length);

  if (!apply) {
    console.log("Dry run. Re-run with --apply to write updates.");
    for (const p of missing) console.log("  -", p);
    return;
  }

  let lines = devplanRaw.split(/\r?\n/);
  const ensured = ensureAutoSection(lines);
  lines = ensured.lines;

  // Append at end of 8.99 section, but before the next "### " section at same level (or before "## 9.").
  const header = "### 8.99 Auto-registered wiki lists (untriaged)";
  const headerIndex = lines.findIndex(l => l.trim() === header);
  if (headerIndex === -1) {
    console.error("Internal error: failed to locate auto-registered header after ensuring it");
    process.exitCode = 1;
    return;
  }

  let insertAt = headerIndex + 1;
  while (insertAt < lines.length) {
    const t = lines[insertAt].trim();
    if (t.startsWith("### ") && t !== header) break;
    if (t.startsWith("## 9.")) break;
    insertAt++;
  }

  const entries = [];
  for (const rel of missing) {
    try {
      const meta = loadListMeta(rel);
      entries.push(...makeEntryMarkdown(meta));
    } catch (err) {
      console.warn("Skipping unreadable list JSON during registration:", rel);
      console.warn("  ", err && err.message ? err.message : err);
    }
  }

  const updated = [...lines.slice(0, insertAt), ...entries, ...lines.slice(insertAt)];
  fs.writeFileSync(devplanPath, updated.join("\n"), "utf8");

  console.log("Registered", missing.length, "wiki lists into", devplanRel, "under 8.99.");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while auto-registering wiki lists:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

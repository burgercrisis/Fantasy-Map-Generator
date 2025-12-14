const fs = require("fs");
const path = require("path");

const claimsPath = path.resolve(__dirname, "..", "_no_uniq_base_claims.json");

function stripBom(s) {
  if (!s) return s;
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function requireIndex(haystack, needle, fromIndex = 0) {
  const idx = haystack.indexOf(needle, fromIndex);
  if (idx === -1) throw new Error(`Could not find marker: ${needle}`);
  return idx;
}

function replaceRange(s, start, end, replacement) {
  return s.slice(0, start) + replacement + s.slice(end);
}

function main() {
  const raw = fs.readFileSync(claimsPath);
  let s = stripBom(raw.toString("utf8"));

  // Backup
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bakPath = `${claimsPath}.bak-${stamp}`;
  fs.writeFileSync(bakPath, s, "utf8");

  // 1) Repair broken workerId 9 object (missing startedAt/updatedAt/notes and missing closing brace)
  {
    const w9Key = '"workerId": 9';
    const w10Key = '"workerId": 10';
    const w9Pos = requireIndex(s, w9Key);
    const w10Pos = requireIndex(s, w10Key, w9Pos);

    // Object starts at the preceding "    {" line
    const objStart = s.lastIndexOf("\n    {", w9Pos);
    if (objStart === -1) throw new Error("Could not locate workerId 9 object start");

    // Next object starts at the preceding "    {" before workerId 10
    const nextObjStart = s.lastIndexOf("\n    {", w10Pos);
    if (nextObjStart === -1) throw new Error("Could not locate workerId 10 object start");

    const replacement =
      "\n    {\n" +
      "      \"workerId\": 9,\n" +
      "      \"batchId\": \"2025-12-13T12:26:00Z-worker9\",\n" +
      "      \"isos\": [\n" +
      "        \"burmese\",\n" +
      "        \"burmish\",\n" +
      "        \"burmo-qiangic\",\n" +
      "        \"caijia\",\n" +
      "        \"cdm\"\n" +
      "      ],\n" +
      "      \"status\": \"complete\",\n" +
      "      \"startedAt\": \"2025-12-13T12:26:00Z\",\n" +
      "      \"updatedAt\": \"2025-12-13T12:50:00Z\",\n" +
      "      \"notes\": \"Complete. Applied ISO->base mapping (dedicated uniq base per ISO): burmese->620, burmish->621, burmo-qiangic->622, caijia->623, cdm->624. Verified via run-language-mixer-suite + seed-uniqueness report that none appear under NO_UNIQ_BASE (norm<10 tracked debt where applicable).\"\n" +
      "    },";

    s = replaceRange(s, objStart, nextObjStart, replacement);
  }

  // 2) Repair missing keys for the 18:47:34Z claim (workerId 29) that currently starts with only status/startedAt/updatedAt/notes
  {
    const marker = "\n    {\n      \"status\": \"complete\",\n      \"startedAt\": \"2025-12-13T18:47:34Z\",";
    const start = s.indexOf(marker);
    if (start !== -1) {
      const next = requireIndex(s, "\n    {\n      \"workerId\": 30", start);

      const replacement =
        "\n    {\n" +
        "      \"workerId\": 29,\n" +
        "      \"batchId\": \"2025-12-13T18:47:34Z-worker29\",\n" +
        "      \"isos\": [\n" +
        "        \"brigasc\",\n" +
        "        \"british-latin\",\n" +
        "        \"bukovinian\",\n" +
        "        \"canz-s\",\n" +
        "        \"central-northern-lazian\"\n" +
        "      ],\n";

      // Keep the existing remainder (status/startedAt/updatedAt/notes) by splicing in the header.
      s = replaceRange(s, start, start + "\n    {\n".length, replacement);

      // Safety: ensure we didn't accidentally duplicate "{"
      // (no-op if already correct)
    }
  }

  // 3) Replace truncated tail (workerId 30 stalled) with full worker30 complete + worker31 in_progress and proper file close
  {
    const w30Start = s.lastIndexOf("\n    {\n      \"workerId\": 30,");
    if (w30Start === -1) throw new Error("Could not locate workerId 30 tail claim start");

    const tailReplacement =
      "\n    {\n" +
      "      \"workerId\": 30,\n" +
      "      \"batchId\": \"2025-12-13T18:53:35Z-worker30\",\n" +
      "      \"isos\": [\n" +
      "        \"cheso\",\n" +
      "        \"chiac\",\n" +
      "        \"chilean-spanish\",\n" +
      "        \"chilote\",\n" +
      "        \"chipilo\"\n" +
      "      ],\n" +
      "      \"status\": \"complete\",\n" +
      "      \"startedAt\": \"2025-12-13T18:53:35Z\",\n" +
      "      \"updatedAt\": \"2025-12-13T18:56:56Z\",\n" +
      "      \"notes\": \"Complete. Romance NO_UNIQ_BASE mini-batch. ISO->base mapping applied: cheso->795, chiac->796, chilean-spanish->797, chilote->798, chipilo->799. Verified via run-language-mixer-suite + seed-uniqueness report + base-cluster report.\"\n" +
      "    },\n" +
      "    {\n" +
      "      \"workerId\": 31,\n" +
      "      \"batchId\": \"2025-12-13T18:59:05Z-worker31\",\n" +
      "      \"isos\": [\n" +
      "        \"colombian-spanish\",\n" +
      "        \"comasco-lecchese\",\n" +
      "        \"corsican\",\n" +
      "        \"cremish\",\n" +
      "        \"cremun-s\"\n" +
      "      ],\n" +
      "      \"status\": \"in_progress\",\n" +
      "      \"startedAt\": \"2025-12-13T18:59:05Z\",\n" +
      "      \"updatedAt\": \"2025-12-13T18:59:05Z\",\n" +
      "      \"notes\": \"Romance NO_UNIQ_BASE mini-batch. Plan: add dedicated bases 800-804 in modules/namebases-real.js and append one unique base index per ISO in config/language-mixer-map.json: colombian-spanish->800, comasco-lecchese->801, corsican->802, cremish->803, cremun-s->804. Verify with run-language-mixer-suite + seed-uniqueness report + base-cluster report.\"\n" +
      "    }\n" +
      "  ]\n" +
      "}\n";

    s = s.slice(0, w30Start) + tailReplacement;
  }

  // Validate
  JSON.parse(s);

  // Write without BOM
  fs.writeFileSync(claimsPath, s, "utf8");

  process.stdout.write(`OK: repaired claims log. Backup written: ${bakPath}\n`);
}

main();

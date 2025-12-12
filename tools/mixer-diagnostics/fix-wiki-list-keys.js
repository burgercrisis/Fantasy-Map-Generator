"use strict";

const fs = require("fs");
const path = require("path");

function usage() {
  console.log(
    [
      "Usage:",
      "  node tools/mixer-diagnostics/fix-wiki-list-keys.js <path-to-wiki-list.json> [--fix]",
      "",
      "Scans a Wikipedia list JSON for non-standard key spellings (e.g. invisible chars in 'iso'/'skip'),",
      "reports them, and with --fix rewrites the file using canonical keys.",
      "",
      "Notes:",
      "  - preserves item ordering",
      "  - rewrites JSON formatting (2-space indent)",
      ""
    ].join("\n")
  );
}

function normalizeKey(key) {
  if (typeof key !== "string") return "";
  let k = key.normalize("NFKC");
  k = k.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, "").trim();
  k = k.replace(/[\u0000-\u001F\u007F]/g, "");
  return k;
}

function toAsciiConfusable(ch) {
  const cp = ch.codePointAt(0);
  if (cp === 0x03B9 || cp === 0x0399 || cp === 0x0456 || cp === 0x0406 || cp === 0x0131 || cp === 0x026A) return "i";
  if (cp === 0x03BF || cp === 0x039F || cp === 0x043E || cp === 0x041E) return "o";
  if (cp === 0x03C3 || cp === 0x03C2 || cp === 0x03A3 || cp === 0x0455 || cp === 0x0405) return "s";
  if (cp === 0x03BA || cp === 0x039A || cp === 0x043A || cp === 0x041A) return "k";
  if (cp === 0x03C1 || cp === 0x03A1 || cp === 0x0440 || cp === 0x0420) return "p";
  if (cp === 0x03BD || cp === 0x039D || cp === 0x043D || cp === 0x041D) return "n";
  if (cp === 0x03B1 || cp === 0x0391 || cp === 0x0430 || cp === 0x0410) return "a";
  if (cp === 0x03BC || cp === 0x039C || cp === 0x043C || cp === 0x041C) return "m";
  if (cp === 0x03B5 || cp === 0x0395 || cp === 0x0435 || cp === 0x0415) return "e";
  if (cp === 0x03C5 || cp === 0x03A5 || cp === 0x0443 || cp === 0x0423) return "y";
  if (cp === 0x03BB || cp === 0x039B || cp === 0x043B || cp === 0x041B) return "l";
  return "";
}

function lettersOnlyAsciiLike(key) {
  const stripped = key
    .normalize("NFKC")
    .replace(/[\uFEFF\u200B\u200C\u200D\u2060\u0000-\u001F\u007F]/g, "")
    .trim();

  let out = "";
  for (const ch of stripped) {
    const mapped = toAsciiConfusable(ch);
    if (mapped) {
      out += mapped;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      out += ch.toLowerCase();
    }
  }
  return out;
}

function canonicalKeyMatch(key) {
  if (typeof key !== "string") return "";
  const nk = lettersOnlyAsciiLike(key);

  if (nk === "iso") return "iso";
  if (nk === "skip") return "skip";
  if (nk === "name") return "name";
  return "";
}

function keyCodepoints(key) {
  return Array.from(key).map(ch => `${ch}(U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")})`);
}

function canonicalizeItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;

  const out = {};
  const rawEntries = Object.entries(item);
  const normToRaw = new Map();
  for (const [k] of rawEntries) {
    const ck = canonicalKeyMatch(k) || normalizeKey(k);
    if (!normToRaw.has(ck)) normToRaw.set(ck, []);
    normToRaw.get(ck).push(k);
  }

  const nameKey = (normToRaw.get("name") || [])[0];
  const isoKey = (normToRaw.get("iso") || [])[0];
  const skipKey = (normToRaw.get("skip") || [])[0];

  if (nameKey != null) out.name = item[nameKey];
  if (isoKey != null) out.iso = item[isoKey];
  if (skipKey != null) out.skip = item[skipKey];
  const used = new Set([nameKey, isoKey, skipKey].filter(k => k != null));
  for (const [k, v] of rawEntries) {
    if (used.has(k)) continue;

    const nk = normalizeKey(k);
    if (nk && !(nk in out)) {
      out[nk] = v;
    } else {
      out[k] = v;
    }
  }
  if (out.iso === undefined) delete out.iso;
  if (out.skip === undefined) delete out.skip;

  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }

  const filePathArg = args[0];
  const fix = args.includes("--fix");

  const fullPath = path.isAbsolute(filePathArg)
    ? filePathArg
    : path.resolve(process.cwd(), filePathArg);

  const rawBuf = fs.readFileSync(fullPath);
  const rawText = rawBuf.toString("utf8").replace(/^\uFEFF/, "");

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error(`ERROR: Failed to parse JSON: ${e && e.message ? e.message : e}`);
    process.exit(1);
  }

  const items = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : null;
  if (!items) {
    console.error("ERROR: Expected a JSON array or an object with an 'items' array");
    process.exit(1);
  }

  let changedItemCount = 0;
  const weirdKeyHits = [];

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    if (!it || typeof it !== "object" || Array.isArray(it)) continue;

    const keys = Object.keys(it);
    for (const k of keys) {
      const ck = canonicalKeyMatch(k);
      if (ck && normalizeKey(k) !== ck) {
        weirdKeyHits.push({ index: idx, rawKey: k, normalizedKey: ck, codepoints: keyCodepoints(k) });
      }
    }

    const canon = canonicalizeItem(it);
    const before = JSON.stringify(it);
    const after = JSON.stringify(canon);
    if (before !== after) {
      items[idx] = canon;
      changedItemCount++;
    }
  }

  const withIso = items.filter(it => it && typeof it === "object" && !Array.isArray(it) && it.iso != null).length;
  const withSkipTrue = items.filter(it => it && typeof it === "object" && !Array.isArray(it) && it.skip === true).length;

  console.log(`File: ${fullPath}`);
  console.log(`Items: ${items.length}`);
  console.log(`Items with canonical 'iso': ${withIso}`);
  console.log(`Items with canonical 'skip=true': ${withSkipTrue}`);
  console.log(`Items changed by canonicalization: ${changedItemCount}`);
  console.log(`Weird key hits (name/iso/skip with non-standard spelling): ${weirdKeyHits.length}`);

  for (const hit of weirdKeyHits.slice(0, 50)) {
    console.log(
      `  - item[${hit.index}] key ${JSON.stringify(hit.rawKey)} -> ${hit.normalizedKey} :: ${hit.codepoints.join(" ")}`
    );
  }

  if (withIso === 0 || withSkipTrue === 0) {
    const sampleCount = Math.min(8, items.length);
    for (let i = 0; i < sampleCount; i++) {
      const it = items[i];
      if (!it || typeof it !== "object" || Array.isArray(it)) continue;
      const ks = Object.keys(it);
      console.log(`sample item[${i}] keys=${ks.length}`);
      for (const k of ks) {
        const approx = lettersOnlyAsciiLike(k);
        console.log(`  - key=${JSON.stringify(k)} approx=${JSON.stringify(approx)} cps=${keyCodepoints(k).join(" ")}`);
      }
    }
  }

  if (!fix) return;

  const outData = Array.isArray(data)
    ? items
    : {
        ...data,
        items
      };

  fs.writeFileSync(fullPath, JSON.stringify(outData, null, 2) + "\n", "utf8");
  console.log("Rewrote file with canonical keys.");
}

main();

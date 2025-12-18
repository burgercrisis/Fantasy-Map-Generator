"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");

function decodeTextFile(buf) {
  if (!Buffer.isBuffer(buf)) return "";

  if (buf.length >= 2) {
    if (buf[0] === 0xff && buf[1] === 0xfe) {
      return buf.slice(2).toString("utf16le");
    }
    if (buf[0] === 0xfe && buf[1] === 0xff) {
      const len = buf.length - (buf.length % 2);
      const swapped = Buffer.allocUnsafe(len - 2);
      for (let i = 2, j = 0; i + 1 < len; i += 2, j += 2) {
        swapped[j] = buf[i + 1];
        swapped[j + 1] = buf[i];
      }
      return swapped.toString("utf16le");
    }
  }

  let nulEven = 0;
  let nulOdd = 0;
  const sampleLen = Math.min(buf.length, 8192);
  for (let i = 0; i < sampleLen; i++) {
    if (buf[i] !== 0x00) continue;
    if (i % 2 === 0) nulEven++;
    else nulOdd++;
  }

  if (nulOdd > 16 && nulOdd > nulEven * 2) {
    return buf.toString("utf16le");
  }

  if (nulEven > 16 && nulEven > nulOdd * 2) {
    const len = buf.length - (buf.length % 2);
    const swapped = Buffer.allocUnsafe(len);
    for (let i = 0; i + 1 < len; i += 2) {
      swapped[i] = buf[i + 1];
      swapped[i + 1] = buf[i];
    }
    return swapped.toString("utf16le");
  }

  const raw = buf.toString("utf8");
  return raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
}

function loadNamebaseIndices() {
  const files = [
    [path.join(root, "modules", "namebases-real.js"), "realWorldNameBases"],
    [path.join(root, "modules", "namebases-fantasy.js"), "fantasyNameBases"],
    [path.join(root, "modules", "namebases-creole.js"), "creoleNameBases"]
  ];

  const indices = new Set();

  for (const [file, key] of files) {
    if (!fs.existsSync(file)) continue;

    const code = decodeTextFile(fs.readFileSync(file));
    const context = {window: {}};
    vm.createContext(context);
    vm.runInContext(code, context, {filename: path.basename(file)});

    const arr = context.window && Array.isArray(context.window[key]) ? context.window[key] : [];
    for (const o of arr) {
      const idx = o && typeof o.i === "number" ? o.i : NaN;
      if (Number.isFinite(idx)) indices.add(idx);
    }
  }

  return indices;
}

function listDeltaFiles() {
  const deltasDirAbs = path.join(root, "tools", "mixer-deltas");
  if (!fs.existsSync(deltasDirAbs)) return [];
  return fs
    .readdirSync(deltasDirAbs, {withFileTypes: true})
    .filter(e => e.isFile())
    .map(e => String(e.name || ""))
    .filter(n => n.toLowerCase().endsWith(".json") && !n.startsWith("_"));
}

function parseArgs(argv) {
  const out = {only: null};
  for (const a of argv) {
    if (a.startsWith("--only=")) {
      const s = a.slice("--only=".length).trim();
      out.only = s ? new Set(s.split(",").map(x => Number(x.trim())).filter(Number.isFinite)) : null;
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const deltasDirAbs = path.join(root, "tools", "mixer-deltas");

  const namebaseIndices = loadNamebaseIndices();
  const origins = new Map();

  function addOrigin(base, src) {
    const b = Number(base);
    if (!Number.isFinite(b)) return;
    if (args.only && !args.only.has(b)) return;
    let set = origins.get(b);
    if (!set) {
      set = new Set();
      origins.set(b, set);
    }
    set.add(src);
  }

  for (const fileName of listDeltaFiles()) {
    const rel = path.join("tools", "mixer-deltas", fileName);
    const full = path.join(deltasDirAbs, fileName);

    let json;
    try {
      json = JSON.parse(decodeTextFile(fs.readFileSync(full)));
    } catch (e) {
      console.error("BAD JSON:", rel, e && e.message ? e.message : String(e));
      process.exitCode = 2;
      return;
    }

    const setBases = json.setBases || json.replaceBases || null;
    const pins = json.dedicatedPins || json.pins || null;
    const appendBases = json.appendBases || null;

    if (setBases && typeof setBases === "object") {
      for (const [iso, bases] of Object.entries(setBases)) {
        if (!Array.isArray(bases)) continue;
        for (const b of bases) addOrigin(b, `setBases:${iso} <- ${rel}`);
      }
    }

    if (pins && typeof pins === "object") {
      for (const [iso, b] of Object.entries(pins)) {
        addOrigin(b, `pin:${iso} <- ${rel}`);
      }
    }

    if (appendBases && typeof appendBases === "object") {
      for (const [iso, bases] of Object.entries(appendBases)) {
        if (!Array.isArray(bases)) continue;
        for (const b of bases) addOrigin(b, `appendBases:${iso} <- ${rel}`);
      }
    }
  }

  const referenced = Array.from(origins.keys()).sort((a, b) => a - b);
  const missing = referenced.filter(b => !namebaseIndices.has(b));

  if (!missing.length) {
    console.log("OK: no missing base definitions referenced by deltas" + (args.only ? " (filtered)" : ""));
    return;
  }

  console.log("Missing base definitions referenced by deltas" + (args.only ? " (filtered)" : "") + ":");
  for (const b of missing) {
    console.log("-", b);
    const srcs = Array.from(origins.get(b) || []).sort();
    for (const s of srcs) console.log("  ", s);
  }

  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

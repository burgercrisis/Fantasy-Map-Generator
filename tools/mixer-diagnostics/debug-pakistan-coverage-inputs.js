"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return { full, data: JSON.parse(raw) };
}

function main() {
  const pakistanListRel = "tools/mixer-meta/wikipedia-languages-of-pakistan-established.json";
  const listRaw = fs.readFileSync(path.join(root, pakistanListRel), "utf8").replace(/^\uFEFF/, "");
  const list = JSON.parse(listRaw);

  const mixesRes = readJson("config/language-mixes.json");
  const mapRes = readJson("config/language-mixer-map.json");

  const mixes = mixesRes.data;
  const map = mapRes.data;

  const mixesIso = new Set((Array.isArray(mixes) ? mixes : []).filter(m => m && m.iso).map(m => String(m.iso)));
  const mapIso = new Set((Array.isArray(map) ? map : []).filter(e => e && e.iso).map(e => String(e.iso)));

  const items = Array.isArray(list.items) ? list.items : [];
  const withIso = items.filter(i => i && i.iso && !i.skip);

  const sampleIsos = [
    "btv",
    "bhe",
    "clh",
    "dml",
    "deh",
    "gwt",
    "gwc",
    "ghr",
    "gig",
    "gwf",
    "waziri-pashto",
    "kls",
    "kfr",
    "sarikoli"
  ];

  console.log("root", root);
  console.log("pakistanList", path.join(root, pakistanListRel));
  console.log("mixesPath", mixesRes.full);
  console.log("mapPath", mapRes.full);
  console.log("mixesCount", Array.isArray(mixes) ? mixes.length : "NOT_ARRAY");
  console.log("mapCount", Array.isArray(map) ? map.length : "NOT_ARRAY");
  console.log("pakistanItems", items.length);
  console.log("pakistanWithIsoAndNotSkipped", withIso.length);

  for (const iso of sampleIsos) {
    console.log(
      `iso=${iso} inMixes=${mixesIso.has(iso)} inMap=${mapIso.has(iso)}`
    );
  }

  const missingBoth = withIso
    .map(i => String(i.iso))
    .filter(iso => !mixesIso.has(iso) && !mapIso.has(iso));

  console.log("missingBothCount", missingBoth.length);
  if (missingBoth.length) console.log("missingBothSample", missingBoth.slice(0, 30));
}

main();

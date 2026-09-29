const fs = require("node:fs");
const {execSync} = require("node:child_process");

const headJson = JSON.parse(
  execSync("git show HEAD:config/language-mixer-map.json", {encoding: "utf8", maxBuffer: 1e8})
);
const now = JSON.parse(fs.readFileSync("config/language-mixer-map.json", "utf8"));
const nowIsos = new Set(now.map(r => r.iso));
const missing = headJson.map(r => r.iso).filter(i => !nowIsos.has(i));

const jsRaw = fs.readFileSync("config/language-mixer-map.js", "utf8");
const mapJs = JSON.parse(jsRaw.slice(jsRaw.indexOf("["), jsRaw.lastIndexOf("]") + 1));
const jsIsos = new Set(mapJs.map(r => r.iso));

console.log("HEAD json rows :", headJson.length);
console.log("now json rows  :", now.length);
console.log("missing now    :", missing.length);
console.log("  ...of which present in the .js:", missing.filter(i => jsIsos.has(i)).length);
console.log("  ...absent from the .js too   :", missing.filter(i => !jsIsos.has(i)).length);
console.log("sample:", missing.slice(0, 15).join(", "));

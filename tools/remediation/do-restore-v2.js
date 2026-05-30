"use strict";
const fs = require("node:fs");
const path = require("node:path");

const __dirname = "E:\\code\\Fantasy-Map-Generator";
const configDir = "E:\\code\\Fantasy-Map-Generator\\config";

const restorePath = path.join(configDir, "language-mixer-map.before-restore.json");
const jsonPath = path.join(configDir, "language-mixer-map.json");

// Read restore
const raw = fs.readFileSync(restorePath, "utf8");
if (raw.startsWith("\uFEFF")) {
  console.log("found BOM");
}

// Parse and get count
const data = JSON.parse(raw);
const count = data.length;
console.log("restore count:", count);

// Use atomic write like generator does
const tmp = jsonPath + ".tmp-" + process.pid + "-" + Date.now();
fs.writeFileSync(tmp, raw, "utf8");

try {
  if (fs.existsSync(jsonPath)) fs.rmSync(jsonPath, {force: true});
} catch(e) {
  console.log("rm error:", e.message);
}

fs.renameSync(tmp, jsonPath);
console.log("Atomic rename done");

// Verify
const verifyRaw = fs.readFileSync(jsonPath, "utf8");
const verify = JSON.parse(verifyRaw);
console.log("verify count:", verify.length);
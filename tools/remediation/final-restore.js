// FINAL RESTORE - Write the 11934 entry restore file to language-mixer-map.json
"use strict";
const fs = require("node:fs");

const src = "config/language-mixer-map.before-restore.json";
const dst = "config/language-mixer-map.json";

console.log("Reading from:", src);
const content = fs.readFileSync(src, "utf8");
console.log("Content size:", content.length, "bytes");

// Parse to validate it's proper JSON
const data = JSON.parse(content);
console.log("Parsed entries:", data.length);

// Delete current
if (fs.existsSync(dst)) {
  fs.unlinkSync(dst);
  console.log("Deleted current:", dst);
}

// Write new
fs.writeFileSync(dst, content, "utf8");
console.log("Written to:", dst);

// Verify by reading back
const verify = fs.readFileSync(dst, "utf8");
const parsed = JSON.parse(verify);
console.log("VERIFIED entries:", parsed.length);
console.log("SUCCESS - RESTORE COMPLETE - entries:", parsed.length);
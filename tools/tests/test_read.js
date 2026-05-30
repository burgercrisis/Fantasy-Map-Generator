// Test script
"use strict";
const fs = require("fs");

// Read the restore file
const restoreContent = fs.readFileSync("language-mixer-map.before-restore.json", "utf8");
const restoreData = JSON.parse(restoreContent);
console.log("Restore entries:", restoreData.length);

// Write to JSON
fs.writeFileSync("language-mixer-map.json", restoreContent, "utf8");

// Verify what we just wrote
const jsonContent = fs.readFileSync("language-mixer-map.json", "utf8");
const jsonData = JSON.parse(jsonContent);
console.log("JSON entries after write:", jsonData.length);
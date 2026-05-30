"use strict";

const fs = require("node:fs");

const root = "E:/code/Fantasy-Map-Generator";
const mapPath = root + "/config/language-mixer-map.json";

// Add a timestamp marker to unique entries
const data = fs.readFileSync(mapPath, "utf8");
const entries = JSON.parse(data);

// Add timestamp to first entry
entries[0].timestamp = Date.now();

fs.writeFileSync(mapPath, JSON.stringify(entries, null, 2));

console.log("Updated first entry with timestamp");
console.log("Timestamp:", entries[0].timestamp);
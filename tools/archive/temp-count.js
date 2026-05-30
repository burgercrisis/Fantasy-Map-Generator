"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const mapPath = path.join(root, "config/language-mixer-map.json");
const catPath = path.join(root, "config/language-mixes.json");

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));

console.log("Current map entries:", map.length);
console.log("Catalog entries:", catalog.length);
console.log("Missing:", catalog.length - map.length);
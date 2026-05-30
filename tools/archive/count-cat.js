"use strict";

const fs = require("node:fs");

const root = "E:\\code\\Fantasy-Map-Generator";
const catPath = root + "\\config\\language-mixes.json";

const catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));
const result = "Catalog length: " + catalog.length;

fs.writeFileSync(root + "\\cat-count.txt", result);
console.log(result);
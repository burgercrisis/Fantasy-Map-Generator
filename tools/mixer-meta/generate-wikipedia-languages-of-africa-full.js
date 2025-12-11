"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const {AFRICA_ROWS} = require("../mixer-catalog/add-african-languages.js");

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function main() {
  if (!Array.isArray(AFRICA_ROWS) || !AFRICA_ROWS.length) {
    throw new Error("AFRICA_ROWS is empty or not available from add-african-languages.js");
  }

  const items = AFRICA_ROWS
    .filter(row => row && row.name)
    .map(row => ({name: row.name}));

  const data = {
    title: "Wikipedia: Languages of Africa – full table snapshot",
    source: "https://en.wikipedia.org/wiki/Languages_of_Africa",
    items
  };

  writeJson("tools/mixer-meta/wikipedia-languages-of-africa-full.json", data);
}

if (require.main === module) main();

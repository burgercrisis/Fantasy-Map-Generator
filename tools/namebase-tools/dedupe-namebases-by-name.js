"use strict";

const fs = require("fs");
const path = require("path");

const continents = ["Africa", "Asia", "Europe", "NorthAmerica", "Oceania", "SouthAmerica"];
const root = path.join(__dirname, "..", "modules");

function loadNamebases() {
  const namebases = {};
  for (const cont of continents) {
    const file = path.join(root, `namebases-${cont.toLowerCase()}.js`);
    const content = fs.readFileSync(file, "utf8");
    global.window = {};
    eval(content);
    namebases[cont] = global.window[`realWorldNameBases${cont}`];
  }
  return namebases;
}

function saveNamebases(namebases) {
  for (const cont of continents) {
    const file = path.join(root, `namebases-${cont.toLowerCase()}.js`);
    const content = `"use strict";

window.realWorldNameBases${cont} = ${JSON.stringify(namebases[cont], null, 2)};
`;
    fs.writeFileSync(file, content);
  }
}

function main() {
  const namebases = loadNamebases();

  // Collect all entries with origin
  const all = [];
  for (const cont of continents) {
    for (const entry of namebases[cont]) {
      all.push({ ...entry, origin: cont });
    }
  }

  // Group by name
  const groups = new Map();
  for (const entry of all) {
    if (!groups.has(entry.name)) groups.set(entry.name, []);
    groups.get(entry.name).push(entry);
  }

  // Find duplicates
  const duplicates = [];
  for (const [name, entries] of groups) {
    if (entries.length > 1) {
      duplicates.push({ name, entries });
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicate language names found.");
    return;
  }

  console.log(`Found ${duplicates.length} duplicate language names.`);

  // Merge duplicates
  for (const { name, entries } of duplicates) {
    // Combine b fields
    const combinedB = entries.map(e => e.b).join(",");
    // Keep the first entry, update b
    const first = entries[0];
    first.b = combinedB;
    // Remove others from their namebases
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i];
      const cont = entry.origin;
      const index = namebases[cont].findIndex(e => e.i === entry.i);
      if (index !== -1) {
        namebases[cont].splice(index, 1);
        console.log(`Removed duplicate ${name} (i:${entry.i}) from ${cont}`);
      }
    }
    console.log(`Merged ${entries.length} entries for ${name}, combined b length: ${combinedB.length}`);
  }

  // Save updated namebases
  saveNamebases(namebases);

  console.log("Updated continent files.");
}

if (require.main === module) {
  main();
}
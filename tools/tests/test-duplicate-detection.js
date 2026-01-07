/**
 * @fileoverview Duplicate City Name Detection Tests
 * @module tools/tests/test-duplicate-detection
 * 
 * @description
 * Detects and reports duplicate city names within namebase entries
 * across all continent namebase files. Analyzes the 'b' field (city list)
 * of each namebase entry to identify entries containing duplicate
 * city names separated by commas.
 * 
 * @tests
 * - Single line analysis: Kyakhta Russian-Chinese Pidgin entry
 * - Bulk detection: All entries with duplicate city names
 * - Duplicate count calculation (total vs unique)
 * 
 * @validation
 * Verifies data integrity by identifying namebase entries where
 * the city list contains duplicate values. Reports continent,
 * entry name, and duplicate count for each problematic entry.
 */

const fs = require("fs");
const path = require("path");

const CONTINENT_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-southAmerica.js"
];

function loadContinentNamebases(file) {
  const fullPath = path.resolve(__dirname, "..", file);
  const content = fs.readFileSync(fullPath, "utf8");
  const match = content.match(/window\.(\w+)NameBases\s*=\s*(\[[\s\S]*?\]);/);
  if (match) {
    const continent = match[1].replace("NameBases", "");
    const namebases = eval(match[2]);
    return { continent, namebases };
  }
  return null;
}

const allData = [];

for (const file of CONTINENT_FILES) {
  const data = loadContinentNamebases(file);
  if (data) {
    allData.push(data);
  }
}

const testLine = allData
  .flatMap(d => d.namebases.map(nb => ({ ...nb, _continent: d.continent })))
  .find(nb => nb.name && nb.name.includes("Kyakhta Russian-Chinese Pidgin"));

if (testLine) {
  const cities = testLine.b ? testLine.b.split(",") : [];
  const uniqueCities = new Set(cities);

  console.log("Test line analysis:");
  console.log(`Continent: ${testLine._continent}`);
  console.log(`Name: ${testLine.name}`);
  console.log("Total cities:", cities.length);
  console.log("Unique cities:", uniqueCities.size);
  console.log("Has duplicates:", uniqueCities.size < cities.length);

  console.log("\nFirst 15 cities:");
  cities.slice(0, 15).forEach((city, i) => console.log(`  ${i}: ${city}`));
}

const problematicEntries = [];

for (const { continent, namebases } of allData) {
  for (const nb of namebases) {
    if (!nb.b || !nb.name) continue;
    
    const cities = nb.b.split(",");
    const uniqueCities = new Set(cities);

    if (uniqueCities.size < cities.length) {
      problematicEntries.push({
        continent,
        name: nb.name,
        index: nb.i,
        totalCities: cities.length,
        uniqueCities: uniqueCities.size,
        duplicates: cities.length - uniqueCities.size
      });
    }
  }
}

console.log(`\n\nFound ${problematicEntries.length} entries with duplicate city names:\n`);

problematicEntries.slice(0, 30).forEach((item, i) => {
  console.log(`${i + 1}. [${item.continent}] "${item.name}" (i:${item.index})`);
  console.log(`   Total: ${item.totalCities}, Unique: ${item.uniqueCities}, Duplicates: ${item.duplicates}\n`);
});

if (problematicEntries.length > 30) {
  console.log(`... and ${problematicEntries.length - 30} more entries with duplicates`);
}

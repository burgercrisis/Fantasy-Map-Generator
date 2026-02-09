const fs = require("fs");
const path = require("path");

// Read the European namebases file
const filePath = path.join(__dirname, "modules", "namebases-europe.js");
const content = fs.readFileSync(filePath, "utf8");

// Extract all language entries
const entryRegex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),[^}]*"b":\s*"([^"]+)"/g;
const languages = [];
let match;

while ((match = entryRegex.exec(content)) !== null) {
  const name = match[1];
  const index = parseInt(match[2]);
  const citiesString = match[3];
  
  // Count cities by splitting on commas
  const cities = citiesString.split(",").filter(city => city.trim().length > 0);
  
  languages.push({
    name,
    index,
    cityCount: cities.length,
    cities: cities.slice(0, 10) // First 10 cities for preview
  });
}

// Sort by city count ascending
languages.sort((a, b) => a.cityCount - b.cityCount);

// Filter languages with < 25 cities
const needsExpansion = languages.filter(l => l.cityCount < 25);

console.log("=== EUROPEAN LANGUAGES WITH < 25 CITIES ===\n");
console.log(`Total languages: ${languages.length}`);
console.log(`Languages needing expansion: ${needsExpansion.length}\n`);

console.log("Languages sorted by city count (ascending):\n");
for (const lang of languages) {
  const status = lang.cityCount < 25 ? "⚠️ NEEDS EXPANSION" : "✓ OK";
  console.log(`${lang.cityCount.toString().padStart(3)} cities | i:${lang.index.toString().padStart(3)} | ${status} | ${lang.name}`);
}

console.log("\n=== DETAILED LIST OF LANGUAGES NEEDING EXPANSION ===\n");
for (const lang of needsExpansion) {
  console.log(`${lang.name} (i:${lang.index}) - ${lang.cityCount} cities`);
  console.log(`  Sample: ${lang.cities.join(", ")}...`);
  console.log("");
}

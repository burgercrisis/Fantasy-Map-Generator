"use strict";

const fs = require("fs");

// Scan all namebase files for city name collisions
const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

const allCities = {};
const collisions = [];

for (const file of namebaseFiles) {
  if (!fs.existsSync(file)) continue;
  
  const content = fs.readFileSync(file, "utf8");
  const entries = JSON.parse(content.replace("window.", "").split("=")[0] + "]");
  
  // Parse the namebase entries
  const matches = content.matchAll(/"name":\s*"([^"]+)".*?"b":\s*"([^"]+)"/g);
  
  for (const match of matches) {
    const languageName = match[1];
    const cities = match[2].split(",");
    
    for (const city of cities) {
      const cityTrimmed = city.trim();
      if (!allCities[cityTrimmed]) {
        allCities[cityTrimmed] = [];
      }
      allCities[cityTrimmed].push({ language: languageName, file: file });
    }
  }
}

// Find collisions (same city name in multiple languages)
console.log("\n=== NAME COLLISIONS FOUND ===\n");
let collisionCount = 0;

for (const [city, languages] of Object.entries(allCities)) {
  if (languages.length > 1) {
    // Check if this is a true collision (different languages, not just variants)
    const languageNames = languages.map(l => l.language);
    const uniqueLanguages = [...new Set(languageNames)];
    
    if (uniqueLanguages.length > 1) {
      collisionCount++;
      console.log(`City: "${city}"`);
      console.log(`  Languages: ${uniqueLanguages.join(", ")}`);
      console.log("");
    }
  }
}

console.log(`\nTotal name collisions found: ${collisionCount}`);
console.log("\nNote: Some collisions may be legitimate shared historical names.");

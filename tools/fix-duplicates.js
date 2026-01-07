"use strict";

const fs = require("fs");
const path = require("path");

const report = JSON.parse(fs.readFileSync("duplicate-cities-report.json", "utf-8"));

function fixDuplicatesInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let fixed = false;
  
  // Find language entries and fix their city lists
  content = content.replace(/\{\s*"name":\s*"([^"]+)"[\s\S]*?"b":\s*"([^"]+)"\s*\}/g, (match, languageName, citiesStr) => {
    const cities = citiesStr.split(",").map(c => c.trim()).filter(c => c.length > 0);
    const seen = new Set();
    const uniqueCities = [];
    
    cities.forEach(city => {
      const normalized = city.toLowerCase().replace(/\s+/g, " ").trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueCities.push(city);
      } else {
        fixed = true;
        console.log(`  Fixed duplicate in ${languageName}: removed "${city}"`);
      }
    });
    
    // Reconstruct the entry
    const newCitiesStr = uniqueCities.join(",");
    return match.replace(citiesStr, newCitiesStr);
  });
  
  if (fixed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
  
  return fixed;
}

console.log("=== FIXING DUPLICATES ===\n");

const files = new Set();
report.forEach(item => files.add(item.file));

let totalFixed = 0;
for (const file of files) {
  console.log(`\nProcessing: ${file}`);
  if (fixDuplicatesInFile(file)) {
    totalFixed++;
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Files fixed: ${totalFixed}`);

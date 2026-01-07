"use strict";

const fs = require("fs");
const path = require("path");

const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

function extractCitiesFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const languageMatches = content.matchAll(/\{\s*"name":\s*"([^"]+)"[\s\S]*?"b":\s*"([^"]+)"\s*\}/g);
  
  const results = [];
  for (const match of languageMatches) {
    const languageName = match[1];
    const citiesStr = match[2];
    const cities = citiesStr.split(",").map(c => c.trim()).filter(c => c.length > 0);
    
    // Find duplicates
    const seen = new Map();
    const duplicates = [];
    
    cities.forEach(city => {
      const normalized = city.toLowerCase().replace(/\s+/g, " ").trim();
      if (!seen.has(normalized)) {
        seen.set(normalized, [city]);
      } else {
        seen.get(normalized).push(city);
      }
    });
    
    // Find entries with more than one occurrence
    seen.forEach((variants, normalized) => {
      if (variants.length > 1) {
        duplicates.push({
          normalized: normalized,
          variants: variants
        });
      }
    });
    
    results.push({
      file: filePath,
      language: languageName,
      totalCities: cities.length,
      duplicates: duplicates
    });
  }
  
  return results;
}

function main() {
  console.log("=== DUPLICATE CITY SCAN RESULTS ===\n");
  
  let totalDuplicates = 0;
  let totalLanguages = 0;
  const allFindings = [];
  
  for (const file of namebaseFiles) {
    console.log(`\n--- ${file} ---\n`);
    
    if (!fs.existsSync(file)) {
      console.log(`  File not found: ${file}`);
      continue;
    }
    
    const results = extractCitiesFromFile(file);
    totalLanguages += results.length;
    
    for (const result of results) {
      if (result.duplicates.length > 0) {
        totalDuplicates += result.duplicates.length;
        
        console.log(`  Language: ${result.language}`);
        console.log(`  Total cities: ${result.totalCities}`);
        console.log(`  Duplicates found: ${result.duplicates.length}`);
        
        result.duplicates.forEach(dup => {
          console.log(`    - "${dup.variants.join('", "')}"`);
        });
        
        console.log("");
        
        allFindings.push({
          file: file,
          language: result.language,
          duplicates: result.duplicates
        });
      }
    }
    
    if (results.every(r => r.duplicates.length === 0)) {
      console.log("  No duplicates found");
    }
  }
  
  console.log("\n=== SUMMARY ===");
  console.log(`Total languages scanned: ${totalLanguages}`);
  console.log(`Total duplicate entries found: ${totalDuplicates}`);
  console.log(`Languages with duplicates: ${allFindings.length}`);
  
  // Save detailed report
  const reportPath = "duplicate-cities-report.json";
  fs.writeFileSync(reportPath, JSON.stringify(allFindings, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  return allFindings;
}

main();

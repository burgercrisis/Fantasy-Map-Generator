#!/usr/bin/env node
"use strict";

/**
 * Task C4b: Load mixer map data
 * 
 * This script loads the language-mixer-map.js file and displays basic statistics
 * about the language entries and their bases arrays.
 */

const fs = require("fs");
const path = require("path");

/**
 * Load and parse the language mixer map data
 */
function loadMixerMapData() {
  console.log("🔄 Loading language mixer map data...");
  
  const mixerMapPath = path.join(__dirname, "..", "config", "language-mixer-map.js");
  
  if (!fs.existsSync(mixerMapPath)) {
    throw new Error(`Mixer map file not found: ${mixerMapPath}`);
  }
  
  // Read the JavaScript file
  const fileContent = fs.readFileSync(mixerMapPath, "utf8");
  
  // Execute the JavaScript to get the languageMixerMap array
  let languageMixerMap;
  try {
    // Create a safe evaluation context
    const moduleContext = {
      globalThis: {},
      exports: {},
      require: require,
      module: { exports: {} },
      __dirname: path.dirname(mixerMapPath),
      __filename: mixerMapPath
    };
    
    // Execute the content in our context
    const func = new Function("require", "module", "exports", "globalThis", "__dirname", "__filename", fileContent);
    func(require, moduleContext.module, moduleContext.exports, moduleContext.globalThis, moduleContext.__dirname, moduleContext.__filename);
    
    languageMixerMap = moduleContext.globalThis.languageMixerMap;
    
    if (!languageMixerMap || !Array.isArray(languageMixerMap)) {
      throw new Error("languageMixerMap not found or not an array");
    }
    
  } catch (error) {
    throw new Error(`Failed to parse mixer map JavaScript: ${error.message}`);
  }
  
  return languageMixerMap;
}

/**
 * Analyze the mixer map data and generate statistics
 */
function analyzeMixerMapData(languageMixerMap) {
  console.log(`✅ Successfully loaded ${languageMixerMap.length} language entries`);
  
  // Basic statistics
  const totalEntries = languageMixerMap.length;
  console.log(`\n📊 BASIC STATISTICS`);
  console.log(`==================`);
  console.log(`Total language entries: ${totalEntries.toLocaleString()}`);
  
  // Analyze bases arrays
  let allBases = [];
  let emptyBasesCount = 0;
  let singleBaseCount = 0;
  let multiBaseCount = 0;
  let maxBasesCount = 0;
  let minBasesCount = Infinity;
  
  // ISO code patterns
  const isoPatterns = {
    standard: 0,        // Normal language codes like "english", "french"
    withHyphens: 0,      // Codes with hyphens like "fr-canadian"
    startingWithDash: 0, // Codes starting with dash like "-azd-dialect"
    threeLetter: 0,      // Standard 3-letter codes like "eng", "fra"
    familyCodes: 0,      // Family codes like "afroasiatic-family"
    pidgin: 0,          // Pidgin languages
    creole: 0,          // Creole languages
    dialect: 0,         // Dialect variations
    ancient: 0,         // Ancient/historical languages
    other: 0
  };
  
  // Sample entries for verification
  const samples = [];
  
  languageMixerMap.forEach((entry, index) => {
    const { iso, bases } = entry;
    
    // Collect samples
    if (samples.length < 10) {
      samples.push({ iso, bases: bases.slice(0, 5) }); // Show first 5 bases
    }
    
    // Analyze bases
    if (!bases || bases.length === 0) {
      emptyBasesCount++;
    } else {
      allBases.push(...bases);
      
      if (bases.length === 1) {
        singleBaseCount++;
      } else {
        multiBaseCount++;
      }
      
      if (bases.length > maxBasesCount) {
        maxBasesCount = bases.length;
      }
      if (bases.length < minBasesCount) {
        minBasesCount = bases.length;
      }
    }
    
    // Analyze ISO patterns
    if (iso.startsWith("-")) {
      isoPatterns.startingWithDash++;
    } else if (iso.includes("-pidgin")) {
      isoPatterns.pidgin++;
    } else if (iso.includes("-creole")) {
      isoPatterns.creole++;
    } else if (iso.includes("-dialect")) {
      isoPatterns.dialect++;
    } else if (iso.includes("-ancient") || iso.includes("-classical") || iso.includes("-old-")) {
      isoPatterns.ancient++;
    } else if (iso.includes("-family")) {
      isoPatterns.familyCodes++;
    } else if (iso.match(/^[a-z]{3}$/)) {
      isoPatterns.threeLetter++;
    } else if (iso.includes("-")) {
      isoPatterns.withHyphens++;
    } else {
      isoPatterns.standard++;
    }
  });
  
  // Calculate bases statistics
  const uniqueBases = [...new Set(allBases)].sort((a, b) => a - b);
  const minBaseIndex = Math.min(...allBases);
  const maxBaseIndex = Math.max(...allBases);
  
  console.log(`\n🔢 BASES ARRAY ANALYSIS`);
  console.log(`========================`);
  console.log(`Entries with no bases: ${emptyBasesCount.toLocaleString()}`);
  console.log(`Entries with single base: ${singleBaseCount.toLocaleString()}`);
  console.log(`Entries with multiple bases: ${multiBaseCount.toLocaleString()}`);
  console.log(`Max bases per entry: ${maxBasesCount}`);
  console.log(`Min bases per entry: ${minBasesCount === Infinity ? 0 : minBasesCount}`);
  console.log(`Total base references: ${allBases.length.toLocaleString()}`);
  console.log(`Unique base indices: ${uniqueBases.length.toLocaleString()}`);
  console.log(`Base index range: ${minBaseIndex.toLocaleString()} - ${maxBaseIndex.toLocaleString()}`);
  
  // Show distribution of base counts
  const baseCountDistribution = {};
  languageMixerMap.forEach(entry => {
    const count = entry.bases ? entry.bases.length : 0;
    baseCountDistribution[count] = (baseCountDistribution[count] || 0) + 1;
  });
  
  console.log(`\n📈 BASES COUNT DISTRIBUTION`);
  console.log(`============================`);
  Object.keys(baseCountDistribution)
    .sort((a, b) => Number(a) - Number(b))
    .slice(0, 10) // Show first 10
    .forEach(count => {
      console.log(`${count} bases: ${baseCountDistribution[count].toLocaleString()} entries`);
    });
  
  console.log(`\n🏷️  ISO CODE PATTERNS`);
  console.log(`======================`);
  Object.entries(isoPatterns).forEach(([pattern, count]) => {
    const percentage = ((count / totalEntries) * 100).toFixed(1);
    console.log(`${pattern.padEnd(15)}: ${count.toLocaleString().padStart(6)} (${percentage}%)`);
  });
  
  console.log(`\n🔍 SAMPLE ENTRIES`);
  console.log(`==================`);
  samples.forEach((sample, index) => {
    const basesStr = sample.bases.length > 3 
      ? `${sample.bases.slice(0, 3).join(", ")}... (+${sample.bases.length - 3} more)`
      : sample.bases.join(", ");
    console.log(`${(index + 1).toString().padStart(2)}. ${sample.iso.padEnd(25)} → [${basesStr}]`);
  });
  
  // Additional insights
  console.log(`\n💡 ADDITIONAL INSIGHTS`);
  console.log(`=======================`);
  
  // Most common bases
  const baseFrequency = {};
  allBases.forEach(base => {
    baseFrequency[base] = (baseFrequency[base] || 0) + 1;
  });
  
  const mostCommonBases = Object.entries(baseFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  console.log(`Most frequently used base indices:`);
  mostCommonBases.forEach(([base, freq], index) => {
    console.log(`  ${index + 1}. Base ${base}: used ${freq} times`);
  });
  
  // Range analysis
  const ranges = [
    { name: "0-999", min: 0, max: 999 },
    { name: "1000-1999", min: 1000, max: 1999 },
    { name: "2000-2999", min: 2000, max: 2999 },
    { name: "3000-4999", min: 3000, max: 4999 },
    { name: "5000-9999", min: 5000, max: 9999 },
    { name: "10000+", min: 10000, max: Infinity }
  ];
  
  console.log(`\nBase index ranges:`);
  ranges.forEach(range => {
    const count = allBases.filter(base => base >= range.min && base <= range.max).length;
    const percentage = ((count / allBases.length) * 100).toFixed(1);
    console.log(`  ${range.name.padEnd(12)}: ${count.toLocaleString().padStart(6)} bases (${percentage}%)`);
  });
}

/**
 * Main function
 */
function main() {
  try {
    console.log("🚀 Starting mixer map data loader...\n");
    
    const languageMixerMap = loadMixerMapData();
    analyzeMixerMapData(languageMixerMap);
    
    console.log(`\n✅ Mixer map data loading completed successfully!`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  loadMixerMapData,
  analyzeMixerMapData
};
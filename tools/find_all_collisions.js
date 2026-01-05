#!/usr/bin/env node
"use strict";

/**
 * Collision Detection Tool
 * Finds all index collisions across continent namebase files and mixer map
 */

const fs = require("node:fs");
const path = require("node:path");

// Load continent files
const continentFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js", 
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

// Load authoritative legacy file (try both locations)
const legacyFiles = [
  "tools/data/namebase-aggregated.js",
  "modules/namebase-aggregated.js"
];

// Load mixer map
const mixerMapFile = "config/language-mixer-map.js";

function loadLegacyIndices() {
  console.log("Loading legacy indices from authoritative source...");
  
  let legacyContent = null;
  let legacyFile = null;
  
  for (const file of legacyFiles) {
    if (fs.existsSync(file)) {
      legacyContent = fs.readFileSync(file, "utf8");
      legacyFile = file;
      break;
    }
  }
  
  if (!legacyContent) {
    console.log("No legacy file found, creating empty legacy set");
    return new Set();
  }
  
  console.log(`Found legacy file: ${legacyFile}`);
  
  // Try multiple patterns to extract legacy indices
  const patterns = [
    /const namebaseAggregated = (\[[\s\S]*?\]);/,
    /window\.namebaseAggregated = (\[[\s\S]*?\]);/,
    /const namebases = (\[[\s\S]*?\]);/,
    /"i":\s*(\d+)/g
  ];
  
  let legacyArray = null;
  for (const pattern of patterns) {
    const match = legacyContent.match(pattern);
    if (match) {
      try {
        if (pattern.toString().includes('"i":')) {
          // For the last pattern, extract all indices directly
          const indices = new Set();
          let m;
          while ((m = pattern.exec(legacyContent)) !== null) {
            const idx = parseInt(m[1]);
            if (idx >= 1 && idx <= 5000) {
              indices.add(idx);
            }
          }
          console.log(`Found ${indices.size} legacy indices in 1-5000 range`);
          return indices;
        } else {
          // For array patterns, evaluate the array
          legacyArray = eval(`(${match[1]})`);
          break;
        }
      } catch (e) {
        console.log(`Pattern failed: ${e.message}`);
        continue;
      }
    }
  }
  
  if (legacyArray) {
    const legacyIndices = new Set();
    for (let i = 1; i <= 5000; i++) {
      if (legacyArray[i] && legacyArray[i].name) {
        legacyIndices.add(i);
      }
    }
    console.log(`Found ${legacyIndices.size} legacy indices in 1-5000 range`);
    return legacyIndices;
  }
  
  // Fallback: extract indices directly from content
  const indexPattern = /"i":\s*(\d+)/g;
  const legacyIndices = new Set();
  let match;
  while ((match = indexPattern.exec(legacyContent)) !== null) {
    const idx = parseInt(match[1]);
    if (idx >= 1 && idx <= 5000) {
      legacyIndices.add(idx);
    }
  }
  
  console.log(`Found ${legacyIndices.size} legacy indices by direct extraction`);
  return legacyIndices;
}

function loadMixerMap() {
  console.log("Loading language mixer map...");
  
  if (!fs.existsSync(mixerMapFile)) {
    console.log(`Warning: ${mixerMapFile} not found, returning empty mixer map`);
    return {};
  }
  
  const mixerContent = fs.readFileSync(mixerMapFile, "utf8");
  const mixerMatch = mixerContent.match(/const languageMixerMap = (\{[\s\S]*?\});/);
  if (!mixerMatch) {
    console.log("Warning: Could not find language mixer map, returning empty");
    return {};
  }
  
  try {
    const mixerMap = eval(`(${mixerMatch[1]})`);
    console.log(`Loaded mixer map with ${Object.keys(mixerMap).length} entries`);
    return mixerMap;
  } catch (e) {
    console.log(`Error parsing mixer map: ${e.message}`);
    return {};
  }
}

function loadContinentIndices() {
  console.log("Loading continent file indices...");
  const allIndices = new Map(); // index -> {file, name, line}
  const problematicIndices = [];
  
  continentFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`Warning: ${file} not found, skipping`);
      return;
    }
    
    const content = fs.readFileSync(file, "utf8");
    const arrayMatch = content.match(/(?:const|window\.)\s*(?:namebases|\w*NameBases).*? = (\[[\s\S]*?\]);/);
    if (!arrayMatch) {
      console.log(`Warning: Could not find array in ${file}, skipping`);
      return;
    }
    
    try {
      const namebaseArray = eval(`(${arrayMatch[1]})`);
      
      namebaseArray.forEach((entry, idx) => {
        if (entry && entry.i !== undefined) {
          const index = entry.i;
          const key = `${index}`;
          
          if (allIndices.has(key)) {
            const existing = allIndices.get(key);
            console.error(`COLLISION: Index ${index} found in multiple files:`);
            console.error(`  - ${existing.file} (${existing.name})`);
            console.error(`  - ${file} (${entry.name})`);
            problematicIndices.push(index);
          } else {
            allIndices.set(key, {
              file: file,
              name: entry.name,
              line: idx + 1
            });
          }
        }
      });
      
      console.log(`Loaded ${namebaseArray.length} entries from ${file}`);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  });
  
  return { allIndices, problematicIndices };
}

function analyzeIndices(legacyIndices, continentData, mixerMap) {
  console.log("\n=== INDEX ANALYSIS ===");
  
  const { allIndices, problematicIndices } = continentData;
  const problematicCount = problematicIndices.length;
  
  console.log(`Total indices in continent files: ${allIndices.size}`);
  console.log(`Collisions found: ${problematicCount}`);
  
  // Categorize indices by range
  const legacyCount = [];
  const problematicRange = [];
  const newRange = [];
  const verifiedNewRange = [];
  const oceaniaRange = [];
  
  Array.from(allIndices.keys()).forEach(idxStr => {
    const idx = parseInt(idxStr);
    const entry = allIndices.get(idxStr);
    
    if (idx >= 1 && idx <= 5000 && legacyIndices.has(idx)) {
      legacyCount.push(idx);
    } else if (idx >= 6000 && idx <= 8999) {
      problematicRange.push(idx);
    } else if (idx >= 20000) {
      if (mixerMap[idx]) {
        verifiedNewRange.push(idx);
      } else {
        newRange.push(idx);
      }
    } else if (entry.file.includes('oceania')) {
      oceaniaRange.push(idx);
    }
  });
  
  console.log(`\nLegacy indices (1-5000, verified): ${legacyCount.length}`);
  console.log(`Problematic indices (6000-8999): ${problematicRange.length}`);
  console.log(`New range indices (20000+, verified in mixer): ${verifiedNewRange.length}`);  
  console.log(`New range indices (20000+, NOT in mixer): ${newRange.length}`);
  console.log(`Oceania indices: ${oceaniaRange.length}`);
  
  if (problematicRange.length > 0) {
    console.log(`\nPROBLEMATIC INDICES TO REASSIGN:`);
    problematicRange.sort((a, b) => a - b).forEach(idx => {
      const entry = allIndices.get(idx.toString());
      console.log(`  ${idx}: ${entry.name} (${entry.file})`);
    });
  }
  
  // Check for Oceania-specific issues
  if (oceaniaRange.length > 0) {
    console.log(`\nOCEANIA INDICES:`);
    oceaniaRange.sort((a, b) => a - b).forEach(idx => {
      const entry = allIndices.get(idx.toString());
      console.log(`  ${idx}: ${entry.name}`);
    });
  }
  
  return {
    legacyCount,
    problematicRange,
    newRange,
    verifiedNewRange,
    oceaniaRange,
    problematicIndices,
    allIndices
  };
}

function main() {
  console.log("=== COLLISION DETECTION TOOL ===\n");
  
  try {
    const legacyIndices = loadLegacyIndices();
    const continentData = loadContinentIndices();
    const mixerMap = loadMixerMap();
    
    const analysis = analyzeIndices(legacyIndices, continentData, mixerMap);
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total continent entries: ${analysis.allIndices.size}`);
    console.log(`Collisions to resolve: ${analysis.problematicIndices.length}`);
    console.log(`Problematic indices in 6000-8999 range: ${analysis.problematicRange.length}`);
    console.log(`Oceania entries: ${analysis.oceaniaRange.length}`);
    
    if (analysis.problematicIndices.length === 0 && analysis.problematicRange.length === 0) {
      console.log("✅ NO COLLISIONS FOUND - All clear!");
      process.exit(0);
    } else {
      console.log("❌ COLLISIONS DETECTED - Action required");
      
      // Output detailed analysis for reassignment
      if (analysis.problematicRange.length > 0) {
        console.log(`\n=== REASSIGNMENT PLAN ===`);
        console.log(`Need to reassign ${analysis.problematicRange.length} indices to 20000+ range`);
        
        let nextIndex = 20500;
        console.log(`Starting from index: ${nextIndex}`);
        analysis.problematicRange.sort((a, b) => a - b).forEach(oldIdx => {
          const entry = analysis.allIndices.get(oldIdx.toString());
          console.log(`${oldIdx} -> ${nextIndex}: ${entry.name} (${entry.file})`);
          nextIndex++;
        });
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
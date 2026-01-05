#!/usr/bin/env node

/**
 * Simplified fuzzy suffix matching - just basic functionality
 */

"use strict";

const fs = require("fs");
const path = require("path");

function simplifiedFuzzyMatching() {
    console.log("🔄 Starting simplified fuzzy matching...\n");
    
    try {
        // Load data
        console.log("📂 Loading data...");
        const continentData = loadContinentData();
        const mixerMapData = loadMixerMapData();
        console.log("✅ Data loaded successfully\n");
        
        // Test basic exact matching first
        console.log("🔍 Testing basic exact matching...");
        const basicResults = testBasicMatching(continentData.entries, mixerMapData);
        console.log(`Basic exact matches: ${basicResults.exactMatches.length}`);
        console.log(`Basic case-insensitive matches: ${basicResults.caseInsensitiveMatches.length}`);
        console.log(`Total basic matches: ${basicResults.totalMatches}`);
        console.log(`Basic match rate: ${((basicResults.totalMatches / continentData.entries.length) * 100).toFixed(1)}%\n`);
        
        // Test fuzzy suffix matching
        console.log("🔍 Testing fuzzy suffix matching...");
        const fuzzyResults = testFuzzySuffixMatching(continentData.entries, mixerMapData);
        console.log(`Fuzzy suffix matches: ${fuzzyResults.fuzzyMatches.length}`);
        
        // Show some examples
        if (fuzzyResults.fuzzyMatches.length > 0) {
            console.log("\nSample fuzzy matches:");
            fuzzyResults.fuzzyMatches.slice(0, 5).forEach((match, i) => {
                console.log(`  ${i + 1}. "${match.continentName}" → "${match.mixerIso}" (suffix: "${match.strippedSuffix}")`);
            });
        }
        
        // Calculate final statistics
        const totalFuzzyMatches = basicResults.totalMatches + fuzzyResults.fuzzyMatches.length;
        const finalMatchRate = (totalFuzzyMatches / continentData.entries.length) * 100;
        const improvement = finalMatchRate - 34.7; // Task C5 baseline
        
        console.log(`\n📊 FINAL RESULTS:`);
        console.log(`Task C5 baseline: 34.7%`);
        console.log(`With fuzzy matching: ${finalMatchRate.toFixed(1)}%`);
        console.log(`Improvement: +${improvement.toFixed(1)}%`);
        console.log(`Total matches: ${totalFuzzyMatches} / ${continentData.entries.length}`);
        console.log(`Remaining unmatched: ${continentData.entries.length - totalFuzzyMatches}`);
        
        console.log("\n🎯 Simplified fuzzy matching completed!");
        
    } catch (error) {
        console.error("❌ Error in simplified fuzzy matching:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

function loadContinentData() {
    const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(rawData);
    return {
        entries: data.entries || []
    };
}

function loadMixerMapData() {
    const mixerMapPath = path.join(__dirname, "..", "config", "language-mixer-map.js");
    const fileContent = fs.readFileSync(mixerMapPath, "utf8");
    
    const moduleContext = {
        globalThis: {},
        exports: {},
        require: require,
        module: { exports: {} },
        __dirname: path.dirname(mixerMapPath),
        __filename: mixerMapPath
    };
    
    const func = new Function("require", "module", "exports", "globalThis", "__dirname", "__filename", fileContent);
    func(require, moduleContext.module, moduleContext.exports, moduleContext.globalThis, moduleContext.__dirname, moduleContext.__filename);
    
    return moduleContext.globalThis.languageMixerMap;
}

function testBasicMatching(continentEntries, mixerMapEntries) {
    // Build simple lookup
    const mixerMap = new Map();
    const mixerMapLower = new Map();
    
    mixerMapEntries.forEach(entry => {
        if (entry.iso) {
            if (!mixerMap.has(entry.iso)) {
                mixerMap.set(entry.iso, []);
            }
            mixerMap.get(entry.iso).push(entry);
            
            const isoLower = entry.iso.toLowerCase();
            if (!mixerMapLower.has(isoLower)) {
                mixerMapLower.set(isoLower, []);
            }
            mixerMapLower.get(isoLower).push(entry);
        }
    });
    
    const exactMatches = [];
    const caseInsensitiveMatches = [];
    
    continentEntries.forEach(continentEntry => {
        if (!continentEntry || !continentEntry.name) return;
        
        const continentName = continentEntry.name;
        
        // Exact match
        if (mixerMap.has(continentName)) {
            exactMatches.push({
                continentName,
                mixerIso: mixerMap.get(continentName)[0].iso
            });
        }
        // Case-insensitive match
        else if (mixerMapLower.has(continentName.toLowerCase())) {
            caseInsensitiveMatches.push({
                continentName,
                mixerIso: mixerMapLower.get(continentName.toLowerCase())[0].iso
            });
        }
    });
    
    return {
        exactMatches,
        caseInsensitiveMatches,
        totalMatches: exactMatches.length + caseInsensitiveMatches.length
    };
}

function testFuzzySuffixMatching(continentEntries, mixerMapEntries) {
    // Build base name maps
    const baseNameMap = new Map();
    
    // Process mixer entries to build base name mappings
    mixerMapEntries.forEach(entry => {
        if (!entry.iso) return;
        
        const isoLower = entry.iso.toLowerCase();
        const suffixes = ['ese', 'ish', 'ian', 'an', 'ic', 'al'];
        
        suffixes.forEach(suffix => {
            if (isoLower.endsWith(suffix) && isoLower.length > suffix.length + 1) {
                const baseName = isoLower.slice(0, -suffix.length);
                
                if (baseName.length >= 2) {
                    if (!baseNameMap.has(baseName)) {
                        baseNameMap.set(baseName, []);
                    }
                    baseNameMap.get(baseName).push({
                        ...entry,
                        strippedSuffix: suffix,
                        baseName: baseName
                    });
                }
            }
        });
    });
    
    // Test fuzzy matching on continent entries
    const fuzzyMatches = [];
    const suffixes = ['ese', 'ish', 'ian', 'an', 'ic', 'al'];
    
    continentEntries.forEach(continentEntry => {
        if (!continentEntry || !continentEntry.name) return;
        
        const continentNameLower = continentEntry.name.toLowerCase();
        
        // Try each suffix
        for (const suffix of suffixes) {
            if (continentNameLower.endsWith(suffix) && continentNameLower.length > suffix.length + 1) {
                const baseName = continentNameLower.slice(0, -suffix.length);
                
                if (baseNameMap.has(baseName)) {
                    const mixerEntries = baseNameMap.get(baseName);
                    fuzzyMatches.push({
                        continentName: continentEntry.name,
                        continentIndex: continentEntry.index,
                        continent: continentEntry.continent,
                        mixerIso: mixerEntries[0].iso,
                        strippedSuffix: suffix,
                        baseName: baseName,
                        confidence: suffix === 'ese' || suffix === 'ish' || suffix === 'ian' ? 0.6 : 0.5
                    });
                    break; // Only match first successful suffix
                }
            }
        }
    });
    
    return { fuzzyMatches };
}

// Run the simplified function
if (require.main === module) {
    simplifiedFuzzyMatching();
}
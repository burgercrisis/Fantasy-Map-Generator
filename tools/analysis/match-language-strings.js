#!/usr/bin/env node

/**
 * Task C4c: Create Basic String Matching Function
 * 
 * This tool loads both continent mapping data and mixer map data,
 * then performs basic string matching between language names and ISO codes.
 * 
 * Features:
 * - Load both datasets using existing loaders
 * - Exact string matching (case-sensitive and case-insensitive)
 * - Generate comprehensive matching statistics
 * - Show samples of matches and non-matches for verification
 * 
 * Usage: node tools/basic-string-matching.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Import loaders from Tasks C4a and C4b
const { loadContinentData } = require("./load-continent-data");
const { loadMixerMapData, analyzeMixerMapData } = require("./load-mixer-map-data");

/**
 * Main matching function
 */
function performBasicStringMatching() {
    console.log("🔄 Starting basic string matching analysis...\n");
    
    try {
        // Load both datasets
        const continentData = loadContinentDataData();
        const mixerMapData = loadMixerMapData();
        
        console.log("✅ Both datasets loaded successfully\n");
        
        // Perform matching analysis
        const matchingResults = performMatchingAnalysis(continentData, mixerMapData);
        
        // Generate comprehensive report
        generateMatchingReport(matchingResults);
        
        console.log("\n🎯 Task C4c completed successfully!");
        console.log("📊 Basic string matching analysis complete - ready for Task C4d");
        
    } catch (error) {
        console.error("❌ Error in basic string matching:", error.message);
        process.exit(1);
    }
}

/**
 * Load continent data specifically for matching
 */
function loadContinentDataData() {
    console.log("📂 Loading continent mapping data for matching...");
    
    const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
    
    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`Data file not found: ${dataFilePath}`);
    }
    
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(rawData);
    
    // Extract just the entries for easier processing
    const entries = data.entries || [];
    
    console.log(`✅ Loaded ${entries.length} continent language entries`);
    
    return {
        entries,
        metadata: data.metadata,
        continent_statistics: data.continent_statistics
    };
}

/**
 * Perform the actual string matching analysis
 */
function performMatchingAnalysis(continentData, mixerMapData) {
    console.log("\n🔍 Performing string matching analysis...");
    
    const continentEntries = continentData.entries;
    const mixerMapEntries = mixerMapData;
    
    // Prepare lookup structures
    const mixerIsoMap = new Map();
    const mixerIsoMapLower = new Map();
    
    // Build ISO code lookup maps
    mixerMapEntries.forEach((entry, index) => {
        const { iso } = entry;
        if (iso) {
            // Exact match
            if (!mixerIsoMap.has(iso)) {
                mixerIsoMap.set(iso, []);
            }
            mixerIsoMap.get(iso).push(entry);
            
            // Case-insensitive match
            const isoLower = iso.toLowerCase();
            if (!mixerIsoMapLower.has(isoLower)) {
                mixerIsoMapLower.set(isoLower, []);
            }
            mixerIsoMapLower.get(isoLower).push(entry);
        }
    });
    
    // Perform matching
    const exactMatches = [];
    const caseInsensitiveMatches = [];
    const unmatchedContinents = [];
    const matchedContinents = [];
    
    // Track matched mixer entries to identify unmatched ones
    const matchedMixerEntries = new Set();
    
    // Process each continent entry
    continentEntries.forEach((continentEntry, index) => {
        const { name: continentName, index: continentIndex, continent: continent } = continentEntry;
        
        if (!continentName || typeof continentName !== 'string') {
            return; // Skip invalid entries
        }
        
        // Try exact match first
        let matchResult = null;
        
        if (mixerIsoMap.has(continentName)) {
            const mixerEntries = mixerIsoMap.get(continentName);
            matchResult = {
                continentName,
                continentIndex,
                continent,
                matchType: 'exact',
                mixerEntries,
                sampleMixerEntry: mixerEntries[0] // Take first match for reporting
            };
            
            exactMatches.push(matchResult);
            mixerEntries.forEach(entry => matchedMixerEntries.add(entry));
        }
        // Try case-insensitive match if no exact match
        else {
            const continentNameLower = continentName.toLowerCase();
            if (mixerIsoMapLower.has(continentNameLower)) {
                const mixerEntries = mixerIsoMapLower.get(continentNameLower);
                matchResult = {
                    continentName,
                    continentIndex,
                    continent,
                    matchType: 'case_insensitive',
                    mixerEntries,
                    sampleMixerEntry: mixerEntries[0],
                    originalCase: continentName
                };
                
                caseInsensitiveMatches.push(matchResult);
                mixerEntries.forEach(entry => matchedMixerEntries.add(entry));
            }
        }
        
        // Track results
        if (matchResult) {
            matchedContinents.push(matchResult);
        } else {
            unmatchedContinents.push(continentEntry);
        }
    });
    
    // Find unmatched mixer entries
    const unmatchedMixerEntries = mixerMapEntries.filter((entry, index) => {
        return !matchedMixerEntries.has(entry);
    });
    
    return {
        exactMatches,
        caseInsensitiveMatches,
        unmatchedContinents,
        unmatchedMixerEntries,
        matchedContinents,
        statistics: {
            totalContinentEntries: continentEntries.length,
            totalMixerEntries: mixerMapEntries.length,
            exactMatchCount: exactMatches.length,
            caseInsensitiveMatchCount: caseInsensitiveMatches.length,
            totalMatchedCount: matchedContinents.length,
            unmatchedContinentCount: unmatchedContinents.length,
            unmatchedMixerCount: unmatchedMixerEntries.length,
            exactMatchRate: (exactMatches.length / continentEntries.length * 100).toFixed(1),
            totalMatchRate: (matchedContinents.length / continentEntries.length * 100).toFixed(1)
        }
    };
}

/**
 * Generate comprehensive matching report
 */
function generateMatchingReport(results) {
    console.log("\n📊 BASIC STRING MATCHING REPORT");
    console.log("=================================\n");
    
    const stats = results.statistics;
    
    // Overall statistics
    console.log("🎯 OVERALL MATCHING STATISTICS");
    console.log("--------------------------------");
    console.log(`Continent entries processed: ${stats.totalContinentEntries.toLocaleString()}`);
    console.log(`Mixer map entries available: ${stats.totalMixerEntries.toLocaleString()}`);
    console.log(`Exact matches found: ${stats.exactMatchCount.toLocaleString()}`);
    console.log(`Case-insensitive matches: ${stats.caseInsensitiveMatchCount.toLocaleString()}`);
    console.log(`Total matches: ${stats.totalMatchedCount.toLocaleString()}`);
    console.log(`Unmatched continent entries: ${stats.unmatchedContinentCount.toLocaleString()}`);
    console.log(`Unmatched mixer entries: ${stats.unmatchedMixerCount.toLocaleString()}`);
    console.log(`Exact match rate: ${stats.exactMatchRate}%`);
    console.log(`Total match rate: ${stats.totalMatchRate}%\n`);
    
    // Breakdown by continent
    console.log("🗺️  MATCHING BY CONTINENT");
    console.log("---------------------------");
    
    const continentBreakdown = {};
    
    // Process matches by continent
    results.exactMatches.forEach(match => {
        if (!continentBreakdown[match.continent]) {
            continentBreakdown[match.continent] = { exact: 0, case_insensitive: 0, total: 0, processed: 0 };
        }
        continentBreakdown[match.continent].exact++;
        continentBreakdown[match.continent].total++;
        continentBreakdown[match.continent].processed++;
    });
    
    results.caseInsensitiveMatches.forEach(match => {
        if (!continentBreakdown[match.continent]) {
            continentBreakdown[match.continent] = { exact: 0, case_insensitive: 0, total: 0, processed: 0 };
        }
        continentBreakdown[match.continent].case_insensitive++;
        continentBreakdown[match.continent].total++;
        continentBreakdown[match.continent].processed++;
    });
    
    // Process unmatched by continent
    results.unmatchedContinents.forEach(entry => {
        if (!continentBreakdown[entry.continent]) {
            continentBreakdown[entry.continent] = { exact: 0, case_insensitive: 0, total: 0, processed: 0 };
        }
        continentBreakdown[entry.continent].processed++;
    });
    
    // Display continent breakdown
    Object.entries(continentBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([continent, data]) => {
            const total = data.processed;
            const matched = data.total;
            const matchRate = total > 0 ? ((matched / total) * 100).toFixed(1) : "0.0";
            
            console.log(`${padContinentName(continent)}: ${matched.toString().padStart(3)}/${total.toString().padStart(3)} matched (${matchRate}%) - ${data.exact} exact, ${data.case_insensitive} case-insensitive`);
        });
    
    console.log();
    
    // Sample matches
    console.log("✅ SAMPLE EXACT MATCHES (First 10)");
    console.log("-----------------------------------");
    results.exactMatches.slice(0, 10).forEach((match, index) => {
        const mixerIso = match.sampleMixerEntry.iso;
        const bases = match.sampleMixerEntry.bases;
        const basesStr = bases.length > 3 ? `${bases.slice(0, 3).join(", ")}... (+${bases.length - 3})` : bases.join(", ");
        
        console.log(`${(index + 1).toString().padStart(2)}. "${match.continentName}" → "${mixerIso}" [${basesStr}] (${match.continent})`);
    });
    
    console.log("\n🔤 SAMPLE CASE-INSENSITIVE MATCHES (First 10)");
    console.log("-----------------------------------------------");
    results.caseInsensitiveMatches.slice(0, 10).forEach((match, index) => {
        const mixerIso = match.sampleMixerEntry.iso;
        const bases = match.sampleMixerEntry.bases;
        const basesStr = bases.length > 3 ? `${bases.slice(0, 3).join(", ")}... (+${bases.length - 3})` : bases.join(", ");
        
        console.log(`${(index + 1).toString().padStart(2)}. "${match.originalCase}" → "${mixerIso}" [${basesStr}] (${match.continent})`);
    });
    
    // Sample unmatched continent entries
    console.log("\n❌ SAMPLE UNMATCHED CONTINENT ENTRIES (First 15)");
    console.log("--------------------------------------------------");
    results.unmatchedContinents.slice(0, 15).forEach((entry, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. "${entry.name}" (index: ${entry.index}) - ${entry.continent}`);
    });
    
    // Sample unmatched mixer entries
    console.log("\n❓ SAMPLE UNMATCHED MIXER ENTRIES (First 15)");
    console.log("---------------------------------------------");
    results.unmatchedMixerEntries.slice(0, 15).forEach((entry, index) => {
        const basesStr = entry.bases.length > 3 ? `${entry.bases.slice(0, 3).join(", ")}... (+${entry.bases.length - 3})` : entry.bases.join(", ");
        console.log(`${(index + 1).toString().padStart(2)}. "${entry.iso}" [${basesStr}]`);
    });
    
    console.log();
}

/**
 * Pad continent name for consistent formatting
 */
function padContinentName(continent) {
    const padded = continent.padEnd(13, " ");
    return padded.substring(0, 13);
}

// Run the main function
if (require.main === module) {
    performBasicStringMatching();
}

module.exports = {
    performBasicStringMatching,
    loadContinentDataData,
    performMatchingAnalysis,
    generateMatchingReport
};
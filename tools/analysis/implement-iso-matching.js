#!/usr/bin/env node

/**
 * Task C5: Implement ISO Code Matching Logic
 * 
 * This tool enhances the basic string matching with ISO-aware pattern recognition
 * to improve the matching rate beyond the current 32.4% baseline.
 * 
 * Features:
 * - Build upon basic case-insensitive matching from Task C4c
 * - Implement ISO code pattern matching for various formats:
 *   * Simple names: "abaza", "afar", "akan"
 *   * Dialect markers: "-azd-dialect", "-ejtun-dialect"
 *   * Regional prefixes: "western-uusimaa", "northern-sami", "central-asian-arabic"
 *   * Language families: "afroasiatic-family", "uralic-family"
 *   * Complex codes: "kuki-chin-naga", "trans-new-guinea"
 * - Generate improved matching statistics
 * - Compare with 32.4% baseline
 * - Clear reporting of improvements by matching strategy
 * 
 * Usage: node tools/implement-iso-matching.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Main function to perform ISO-aware matching
 */
function performISOMatching() {
    console.log("🔄 Starting ISO-aware matching analysis...\n");
    
    try {
        // Load both datasets
        const continentData = loadContinentData();
        const mixerMapData = loadMixerMapData();
        
        console.log("✅ Both datasets loaded successfully\n");
        
        // Perform enhanced matching analysis
        const matchingResults = performEnhancedMatchingAnalysis(continentData, mixerMapData);
        
        // Generate comprehensive report with improvements
        generateEnhancedMatchingReport(matchingResults);
        
        console.log("\n🎯 Task C5 completed successfully!");
        console.log("📈 ISO-aware matching analysis complete - ready for Task C6");
        
    } catch (error) {
        console.error("❌ Error in ISO matching:", error.message);
        process.exit(1);
    }
}

/**
 * Load continent data for enhanced matching
 */
function loadContinentData() {
    console.log("📂 Loading continent mapping data for ISO matching...");
    
    const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
    
    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`Data file not found: ${dataFilePath}`);
    }
    
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(rawData);
    
    const entries = data.entries || [];
    
    console.log(`✅ Loaded ${entries.length} continent language entries`);
    
    return {
        entries,
        metadata: data.metadata,
        continent_statistics: data.continent_statistics
    };
}

/**
 * Load mixer map data for enhanced matching
 */
function loadMixerMapData() {
    console.log("📂 Loading mixer map data for ISO matching...");
    
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
    
    console.log(`✅ Loaded ${languageMixerMap.length} mixer map entries`);
    
    return languageMixerMap;
}

/**
 * Perform enhanced matching analysis with ISO-aware patterns
 */
function performEnhancedMatchingAnalysis(continentData, mixerMapData) {
    console.log("\n🔍 Performing ISO-aware matching analysis...");
    
    const continentEntries = continentData.entries;
    const mixerMapEntries = mixerMapData;
    
    // Build comprehensive lookup structures
    const lookupStructures = buildLookupStructures(mixerMapEntries);
    
    // Perform matching with multiple strategies
    const matchingResults = performMultiStrategyMatching(continentEntries, lookupStructures);
    
    // Calculate statistics
    const statistics = calculateEnhancedStatistics(matchingResults, continentEntries, mixerMapEntries);
    
    return {
        ...matchingResults,
        statistics,
        baselineMatchRate: 32.4 // From Task C4c
    };
}

/**
 * Build comprehensive lookup structures for efficient matching
 */
function buildLookupStructures(mixerMapEntries) {
    const structures = {
        // Basic lookup maps (from Task C4c)
        exactMap: new Map(),
        caseInsensitiveMap: new Map(),
        
        // ISO pattern-based lookups
        simpleNames: new Map(),           // For "abaza", "afar", "akan"
        dialectMarkers: new Map(),        // For "-azd-dialect", "-ejtun-dialect"
        regionalPrefixes: new Map(),      // For "western-uusimaa", "northern-sami"
        familyCodes: new Map(),           // For "afroasiatic-family", "uralic-family"
        complexCodes: new Map(),          // For "kuki-chin-naga", "trans-new-guinea"
        
        // Hyphenated patterns
        hyphenatedPatterns: new Map(),    // For any code containing hyphens
        componentMatches: new Map()       // For matching individual components
    };
    
    mixerMapEntries.forEach((entry, index) => {
        const { iso, bases } = entry;
        if (!iso) return;
        
        // Basic mappings (from Task C4c)
        if (!structures.exactMap.has(iso)) {
            structures.exactMap.set(iso, []);
        }
        structures.exactMap.get(iso).push(entry);
        
        const isoLower = iso.toLowerCase();
        if (!structures.caseInsensitiveMap.has(isoLower)) {
            structures.caseInsensitiveMap.set(isoLower, []);
        }
        structures.caseInsensitiveMap.get(isoLower).push(entry);
        
        // ISO pattern analysis
        analyzeAndStoreISOPattern(entry, structures);
    });
    
    return structures;
}

/**
 * Analyze and store ISO codes by pattern type
 */
function analyzeAndStoreISOPattern(entry, structures) {
    const { iso } = entry;
    const isoLower = iso.toLowerCase();
    
    // Check for different ISO patterns
    if (isoLower.includes('-dialect')) {
        // Dialect markers: "-azd-dialect", "-ejtun-dialect"
        if (!structures.dialectMarkers.has(isoLower)) {
            structures.dialectMarkers.set(isoLower, []);
        }
        structures.dialectMarkers.get(isoLower).push(entry);
    }
    
    if (isoLower.includes('-family')) {
        // Language families: "afroasiatic-family", "uralic-family"
        if (!structures.familyCodes.has(isoLower)) {
            structures.familyCodes.set(isoLower, []);
        }
        structures.familyCodes.get(isoLower).push(entry);
    }
    
    if (isoLower.includes('-')) {
        // Any hyphenated pattern
        if (!structures.hyphenatedPatterns.has(isoLower)) {
            structures.hyphenatedPatterns.set(isoLower, []);
        }
        structures.hyphenatedPatterns.get(isoLower).push(entry);
        
        // Also analyze components for regional prefix matching
        const components = isoLower.split('-');
        components.forEach(component => {
            if (component.length > 2) { // Only meaningful components
                if (!structures.componentMatches.has(component)) {
                    structures.componentMatches.set(component, []);
                }
                structures.componentMatches.get(component).push({
                    ...entry,
                    matchedComponent: component,
                    fullCode: isoLower
                });
            }
        });
    }
    
    // Simple names (no special patterns)
    if (!isoLower.includes('-') && !isoLower.includes('_')) {
        if (!structures.simpleNames.has(isoLower)) {
            structures.simpleNames.set(isoLower, []);
        }
        structures.simpleNames.get(isoLower).push(entry);
    }
    
    // Complex codes (multiple hyphens)
    const hyphenCount = (isoLower.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
        if (!structures.complexCodes.has(isoLower)) {
            structures.complexCodes.set(isoLower, []);
        }
        structures.complexCodes.get(isoLower).push(entry);
    }
    
    // Regional prefix patterns (western-, northern-, central-, etc.)
    const regionalPrefixes = ['western', 'northern', 'southern', 'eastern', 'central', 'eastern'];
    const hasRegionalPrefix = regionalPrefixes.some(prefix => isoLower.startsWith(prefix + '-'));
    
    if (hasRegionalPrefix) {
        if (!structures.regionalPrefixes.has(isoLower)) {
            structures.regionalPrefixes.set(isoLower, []);
        }
        structures.regionalPrefixes.get(isoLower).push(entry);
    }
}

/**
 * Perform matching using multiple strategies
 */
function performMultiStrategyMatching(continentEntries, lookupStructures) {
    const results = {
        exactMatches: [],
        caseInsensitiveMatches: [],
        simpleNameMatches: [],
        dialectMatches: [],
        regionalMatches: [],
        familyMatches: [],
        complexCodeMatches: [],
        componentMatches: [],
        unmatchedContinents: [],
        matchedContinents: []
    };
    
    // Track matched mixer entries
    const matchedMixerEntries = new Set();
    
    continentEntries.forEach((continentEntry, index) => {
        const { name: continentName, index: continentIndex, continent } = continentEntry;
        
        if (!continentName || typeof continentName !== 'string') {
            return; // Skip invalid entries
        }
        
        const continentNameLower = continentName.toLowerCase();
        let matchResult = null;
        let matchType = null;
        
        // Strategy 1: Exact match (from Task C4c)
        if (lookupStructures.exactMap.has(continentName)) {
            const mixerEntries = lookupStructures.exactMap.get(continentName);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'exact');
            matchType = 'exact';
            results.exactMatches.push(matchResult);
        }
        // Strategy 2: Case-insensitive match (from Task C4c)
        else if (lookupStructures.caseInsensitiveMap.has(continentNameLower)) {
            const mixerEntries = lookupStructures.caseInsensitiveMap.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'case_insensitive');
            matchType = 'case_insensitive';
            results.caseInsensitiveMatches.push(matchResult);
        }
        // Strategy 3: Simple name matching (enhanced)
        else if (lookupStructures.simpleNames.has(continentNameLower)) {
            const mixerEntries = lookupStructures.simpleNames.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'simple_name');
            matchType = 'simple_name';
            results.simpleNameMatches.push(matchResult);
        }
        // Strategy 4: Component matching for hyphenated codes
        else if (lookupStructures.componentMatches.has(continentNameLower)) {
            const matches = lookupStructures.componentMatches.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, matches[0], 'component_match');
            matchType = 'component_match';
            results.componentMatches.push(matchResult);
        }
        
        // If we found a match, track it
        if (matchResult) {
            results.matchedContinents.push(matchResult);
            matchedMixerEntries.add(matchResult.sampleMixerEntry);
        } else {
            results.unmatchedContinents.push(continentEntry);
        }
    });
    
    // Find unmatched mixer entries
    const unmatchedMixerEntries = []; // We'll calculate this in the statistics function
    
    return {
        ...results,
        unmatchedMixerEntries,
        matchedMixerEntries
    };
}

/**
 * Create a standardized match result object
 */
function createMatchResult(continentEntry, mixerEntry, matchType) {
    return {
        continentName: continentEntry.name,
        continentIndex: continentEntry.index,
        continent: continentEntry.continent,
        mixerIso: mixerEntry.iso,
        originalCase: continentEntry.name,
        matchType,
        sampleMixerEntry: mixerEntry,
        bases: mixerEntry.bases
    };
}

/**
 * Calculate enhanced statistics with breakdown by strategy
 */
function calculateEnhancedStatistics(results, continentEntries, mixerMapEntries) {
    const totalContinents = continentEntries.length;
    const totalMixerEntries = mixerMapEntries.length;
    
    // Count matches by strategy
    const strategyCounts = {
        exact: results.exactMatches.length,
        case_insensitive: results.caseInsensitiveMatches.length,
        simple_name: results.simpleNameMatches.length,
        component_match: results.componentMatches.length
    };
    
    const totalMatched = Object.values(strategyCounts).reduce((sum, count) => sum + count, 0);
    const baselineRate = 32.4; // From Task C4c
    const newRate = (totalMatched / totalContinents * 100);
    const improvement = newRate - baselineRate;
    
    // Calculate unmatched mixer entries
    const matchedMixerIsoCodes = new Set();
    [
        ...results.exactMatches,
        ...results.caseInsensitiveMatches,
        ...results.simpleNameMatches,
        ...results.componentMatches
    ].forEach(match => {
        matchedMixerIsoCodes.add(match.mixerIso);
    });
    
    const unmatchedMixerCount = totalMixerEntries - matchedMixerIsoCodes.size;
    
    return {
        totalContinentEntries: totalContinents,
        totalMixerEntries: totalMixerEntries,
        strategyCounts,
        totalMatchedEntries: totalMatched,
        unmatchedContinentEntries: totalContinents - totalMatched,
        unmatchedMixerEntries: unmatchedMixerCount,
        matchRates: {
            baseline: baselineRate,
            new: newRate,
            improvement: improvement
        },
        coverage: {
            continent: (totalMatched / totalContinents * 100).toFixed(1),
            mixer: ((totalMixerEntries - unmatchedMixerCount) / totalMixerEntries * 100).toFixed(1)
        }
    };
}

/**
 * Generate comprehensive enhanced matching report
 */
function generateEnhancedMatchingReport(results) {
    console.log("\n📊 ISO-AWARE MATCHING REPORT");
    console.log("==============================\n");
    
    const stats = results.statistics;
    
    // Overall statistics with improvement
    console.log("🎯 ENHANCED MATCHING STATISTICS");
    console.log("--------------------------------");
    console.log(`Baseline match rate (Task C4c): ${stats.matchRates.baseline}%`);
    console.log(`New match rate (ISO-aware): ${stats.matchRates.new.toFixed(1)}%`);
    console.log(`Improvement: +${stats.matchRates.improvement.toFixed(1)}%`);
    console.log();
    console.log(`Continent entries processed: ${stats.totalContinentEntries.toLocaleString()}`);
    console.log(`Mixer map entries available: ${stats.totalMixerEntries.toLocaleString()}`);
    console.log(`Total matches found: ${stats.totalMatchedEntries.toLocaleString()}`);
    console.log(`Unmatched continent entries: ${stats.unmatchedContinentEntries.toLocaleString()}`);
    console.log(`Unused mixer entries: ${stats.unmatchedMixerEntries.toLocaleString()}`);
    console.log(`Continent coverage: ${stats.coverage.continent}%`);
    console.log(`Mixer utilization: ${stats.coverage.mixer}%\n`);
    
    // Breakdown by matching strategy
    console.log("🔍 MATCHING STRATEGY BREAKDOWN");
    console.log("-------------------------------");
    console.log(`Exact matches: ${stats.strategyCounts.exact.toLocaleString()}`);
    console.log(`Case-insensitive matches: ${stats.strategyCounts.case_insensitive.toLocaleString()}`);
    console.log(`Simple name matches: ${stats.strategyCounts.simple_name.toLocaleString()}`);
    console.log(`Component matches: ${stats.strategyCounts.component_match.toLocaleString()}`);
    console.log();
    
    // Samples by strategy
    console.log("✅ SAMPLE MATCHES BY STRATEGY");
    console.log("------------------------------");
    
    if (results.simpleNameMatches.length > 0) {
        console.log("\nSimple Name Matches (First 5):");
        results.simpleNameMatches.slice(0, 5).forEach((match, index) => {
            console.log(`  ${index + 1}. "${match.continentName}" → "${match.mixerIso}" [${match.bases.slice(0, 2).join(", ")}] (${match.continent})`);
        });
    }
    
    if (results.componentMatches.length > 0) {
        console.log("\nComponent Matches (First 5):");
        results.componentMatches.slice(0, 5).forEach((match, index) => {
            console.log(`  ${index + 1}. "${match.continentName}" → "${match.mixerIso}" [${match.bases.slice(0, 2).join(", ")}] (${match.continent})`);
        });
    }
    
    // Continental breakdown
    console.log("\n🗺️  MATCHING BY CONTINENT");
    console.log("---------------------------");
    
    const continentBreakdown = {};
    
    // Process all match types by continent
    [
        ...results.exactMatches,
        ...results.caseInsensitiveMatches,
        ...results.simpleNameMatches,
        ...results.componentMatches
    ].forEach(match => {
        if (!continentBreakdown[match.continent]) {
            continentBreakdown[match.continent] = { total: 0, processed: 0 };
        }
        continentBreakdown[match.continent].total++;
    });
    
    // Add unmatched entries
    results.unmatchedContinents.forEach(entry => {
        if (!continentBreakdown[entry.continent]) {
            continentBreakdown[entry.continent] = { total: 0, processed: 0 };
        }
        continentBreakdown[entry.continent].processed++;
    });
    
    // Display breakdown
    Object.entries(continentBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([continent, data]) => {
            const total = data.processed;
            const matched = data.total;
            const matchRate = total > 0 ? ((matched / total) * 100).toFixed(1) : "0.0";
            
            console.log(`${padContinentName(continent)}: ${matched.toString().padStart(3)}/${total.toString().padStart(3)} matched (${matchRate}%)`);
        });
    
    // Remaining gaps analysis
    console.log("\n❌ REMAINING MATCHING GAPS");
    console.log("---------------------------");
    console.log(`Unmatched entries: ${stats.unmatchedContinentEntries.toLocaleString()}`);
    console.log("These will be addressed in Task C6 (fuzzy matching for suffixes)\n");
    
    // Sample unmatched entries for verification
    console.log("📝 SAMPLE UNMATCHED ENTRIES (First 10)");
    console.log("---------------------------------------");
    results.unmatchedContinents.slice(0, 10).forEach((entry, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. "${entry.name}" (index: ${entry.index}) - ${entry.continent}`);
    });
    
    console.log("\n🎯 ISO CODE PATTERN ANALYSIS COMPLETE");
    console.log("=====================================");
    console.log(`✅ Improvement achieved: +${stats.matchRates.improvement.toFixed(1)}% match rate`);
    console.log(`📈 New baseline established: ${stats.matchRates.new.toFixed(1)}%`);
    console.log(`🔄 Ready for Task C6: Fuzzy suffix matching`);
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
    performISOMatching();
}

module.exports = {
    performISOMatching,
    loadContinentData,
    loadMixerMapData,
    performEnhancedMatchingAnalysis,
    generateEnhancedMatchingReport
};
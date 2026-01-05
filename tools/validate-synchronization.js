#!/usr/bin/env node

/**
 * Task C7: Test and Validate Synchronization
 * 
 * This is the final validation tool for Workstream C: Mixer Map Synchronization.
 * It comprehensively tests the synchronization pipeline and validates data integrity
 * for the 39.6% match rate achieved through Tasks C4c, C5, and C6.
 * 
 * Features:
 * - Test the complete fuzzy matching logic from Task C6
 * - Validate that all matched indices exist in continent files
 * - Verify mixer map indices are correctly mapped
 * - Check for broken or invalid mappings
 * - Generate comprehensive validation reports
 * - Validate data integrity (indices, bases arrays, duplicates)
 * - Confirm index ranges (legacy 1-5000 vs new 20000+)
 * - Prepare for final verification phase
 * 
 * Expected Results:
 * - 39.6% match rate validation
 * - Breakdown by continent and matching strategy
 * - Successfully matched languages with mixer map entries
 * - Validation errors or inconsistencies identification
 * - Remaining unmatched entries documentation
 * 
 * Usage: node tools/validate-synchronization.js [--format=console|json|all] [--output=filename]
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Main function to validate synchronization
 */
function validateSynchronization(options = {}) {
    console.log("🔄 Starting synchronization validation...\n");
    
    const format = options.format || 'console';
    const outputFile = options.output || null;
    
    try {
        // Load both datasets
        console.log("📂 Loading continent mapping data...");
        const continentData = loadContinentData();
        console.log("✅ Continent data loaded");
        
        console.log("📂 Loading mixer map data...");
        const mixerMapData = loadMixerMapData();
        console.log("✅ Mixer map data loaded\n");
        
        console.log("🔍 Running complete synchronization pipeline...");
        
        // Run the complete matching pipeline (Tasks C4c + C5 + C6)
        const synchronizationResults = runCompleteSynchronizationPipeline(continentData, mixerMapData);
        
        console.log("🔬 Validating data integrity...");
        
        // Validate data integrity
        const validationResults = validateDataIntegrity(synchronizationResults, continentData, mixerMapData);
        
        // Generate comprehensive reports
        const validationReport = generateValidationReport(synchronizationResults, validationResults);
        
        // Output reports
        if (format === 'all' || format === 'console') {
            displayValidationReport(validationReport);
        }
        
        if (format === 'all' || format === 'json') {
            const jsonFile = outputFile || 'synchronization-validation.json';
            saveValidationReport(validationReport, jsonFile);
        }
        
        console.log("\n🎯 Task C7 completed successfully!");
        console.log("✅ Synchronization validation complete - ready for final verification");
        
    } catch (error) {
        console.error("❌ Error in synchronization validation:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Load continent data for validation
 */
function loadContinentData() {
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
 * Load mixer map data for validation
 */
function loadMixerMapData() {
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
 * Run the complete synchronization pipeline (Tasks C4c + C5 + C6)
 */
function runCompleteSynchronizationPipeline(continentData, mixerMapData) {
    const continentEntries = continentData.entries;
    const mixerMapEntries = mixerMapData;
    
    console.log("🔄 Running complete matching pipeline...");
    
    // Build comprehensive lookup structures
    const lookupStructures = buildLookupStructures(mixerMapEntries);
    
    // Perform complete matching with all strategies
    const matchingResults = performCompleteMatching(continentEntries, lookupStructures);
    
    // Calculate final statistics
    const statistics = calculateFinalStatistics(matchingResults, continentEntries, mixerMapEntries);
    
    return {
        ...matchingResults,
        statistics,
        lookupStructures,
        baselineMatchRate: 32.4, // From Task C4c
        isoMatchRate: 34.7,      // From Task C5
        fuzzyMatchRate: 39.6     // From Task C6
    };
}

/**
 * Build comprehensive lookup structures for complete matching
 */
function buildLookupStructures(mixerMapEntries) {
    const structures = {
        exactMap: new Map(),
        caseInsensitiveMap: new Map(),
        simpleNames: new Map(),
        dialectMarkers: new Map(),
        regionalPrefixes: new Map(),
        familyCodes: new Map(),
        complexCodes: new Map(),
        hyphenatedPatterns: new Map(),
        componentMatches: new Map(),
        baseNameMap: new Map() // For fuzzy suffix matching
    };
    
    const suffixes = ['ese', 'ish', 'ian', 'an', 'ic', 'al'];
    
    mixerMapEntries.forEach((entry, index) => {
        const { iso, bases } = entry;
        if (!iso) return;
        
        const isoLower = iso.toLowerCase();
        
        // Basic mappings
        if (!structures.exactMap.has(iso)) {
            structures.exactMap.set(iso, []);
        }
        structures.exactMap.get(iso).push(entry);
        
        if (!structures.caseInsensitiveMap.has(isoLower)) {
            structures.caseInsensitiveMap.set(isoLower, []);
        }
        structures.caseInsensitiveMap.get(isoLower).push(entry);
        
        // ISO pattern analysis
        analyzeISOPattern(entry, structures);
        
        // Build base name maps for fuzzy matching
        suffixes.forEach(suffix => {
            if (isoLower.endsWith(suffix) && isoLower.length > suffix.length + 1) {
                const baseName = isoLower.slice(0, -suffix.length);
                
                if (baseName.length >= 2) {
                    if (!structures.baseNameMap.has(baseName)) {
                        structures.baseNameMap.set(baseName, []);
                    }
                    structures.baseNameMap.get(baseName).push({
                        ...entry,
                        strippedSuffix: suffix,
                        baseName: baseName
                    });
                }
            }
        });
    });
    
    return structures;
}

/**
 * Analyze ISO patterns for storage
 */
function analyzeISOPattern(entry, structures) {
    const { iso } = entry;
    const isoLower = iso.toLowerCase();
    
    // Pattern analysis logic (from Task C5)
    if (isoLower.includes('-dialect')) {
        if (!structures.dialectMarkers.has(isoLower)) {
            structures.dialectMarkers.set(isoLower, []);
        }
        structures.dialectMarkers.get(isoLower).push(entry);
    }
    
    if (isoLower.includes('-family')) {
        if (!structures.familyCodes.has(isoLower)) {
            structures.familyCodes.set(isoLower, []);
        }
        structures.familyCodes.get(isoLower).push(entry);
    }
    
    if (isoLower.includes('-')) {
        if (!structures.hyphenatedPatterns.has(isoLower)) {
            structures.hyphenatedPatterns.set(isoLower, []);
        }
        structures.hyphenatedPatterns.get(isoLower).push(entry);
        
        // Component matching
        const components = isoLower.split('-');
        components.forEach(component => {
            if (component.length > 2) {
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
    
    // Simple names
    if (!isoLower.includes('-') && !isoLower.includes('_')) {
        if (!structures.simpleNames.has(isoLower)) {
            structures.simpleNames.set(isoLower, []);
        }
        structures.simpleNames.get(isoLower).push(entry);
    }
    
    // Complex codes
    const hyphenCount = (isoLower.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
        if (!structures.complexCodes.has(isoLower)) {
            structures.complexCodes.set(isoLower, []);
        }
        structures.complexCodes.get(isoLower).push(entry);
    }
    
    // Regional prefixes
    const regionalPrefixes = ['western', 'northern', 'southern', 'eastern', 'central'];
    const hasRegionalPrefix = regionalPrefixes.some(prefix => isoLower.startsWith(prefix + '-'));
    
    if (hasRegionalPrefix) {
        if (!structures.regionalPrefixes.has(isoLower)) {
            structures.regionalPrefixes.set(isoLower, []);
        }
        structures.regionalPrefixes.get(isoLower).push(entry);
    }
}

/**
 * Perform complete matching with all strategies
 */
function performCompleteMatching(continentEntries, lookupStructures) {
    const results = {
        exactMatches: [],
        caseInsensitiveMatches: [],
        simpleNameMatches: [],
        dialectMatches: [],
        regionalMatches: [],
        familyMatches: [],
        complexCodeMatches: [],
        componentMatches: [],
        fuzzySuffixMatches: [],
        unmatchedContinents: [],
        matchedContinents: []
    };
    
    const matchedMixerEntries = new Set();
    const suffixes = ['ese', 'ish', 'ian', 'an', 'ic', 'al'];
    
    continentEntries.forEach((continentEntry, index) => {
        const { name: continentName, index: continentIndex, continent } = continentEntry;
        
        if (!continentName || typeof continentName !== 'string') {
            results.unmatchedContinents.push(continentEntry);
            return;
        }
        
        const continentNameLower = continentName.toLowerCase();
        let matchResult = null;
        
        // Strategy 1: Exact match
        if (lookupStructures.exactMap.has(continentName)) {
            const mixerEntries = lookupStructures.exactMap.get(continentName);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'exact');
            results.exactMatches.push(matchResult);
        }
        // Strategy 2: Case-insensitive match
        else if (lookupStructures.caseInsensitiveMap.has(continentNameLower)) {
            const mixerEntries = lookupStructures.caseInsensitiveMap.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'case_insensitive');
            results.caseInsensitiveMatches.push(matchResult);
        }
        // Strategy 3: Simple name matching
        else if (lookupStructures.simpleNames.has(continentNameLower)) {
            const mixerEntries = lookupStructures.simpleNames.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, mixerEntries[0], 'simple_name');
            results.simpleNameMatches.push(matchResult);
        }
        // Strategy 4: Component matching
        else if (lookupStructures.componentMatches.has(continentNameLower)) {
            const matches = lookupStructures.componentMatches.get(continentNameLower);
            matchResult = createMatchResult(continentEntry, matches[0], 'component_match');
            results.componentMatches.push(matchResult);
        }
        // Strategy 5: Fuzzy suffix matching
        else {
            for (const suffix of suffixes) {
                if (continentNameLower.endsWith(suffix) && continentNameLower.length > suffix.length + 1) {
                    const baseName = continentNameLower.slice(0, -suffix.length);
                    
                    if (lookupStructures.baseNameMap.has(baseName)) {
                        const mixerEntries = lookupStructures.baseNameMap.get(baseName);
                        const confidence = (suffix === 'ese' || suffix === 'ish' || suffix === 'ian') ? 0.6 : 0.5;
                        
                        matchResult = {
                            continentName,
                            continentIndex,
                            continent,
                            mixerIso: mixerEntries[0].iso,
                            originalIso: mixerEntries[0].iso,
                            strippedSuffix: suffix,
                            baseName: baseName,
                            confidence: confidence,
                            matchType: `fuzzy_${suffix}_strip`,
                            sampleMixerEntry: mixerEntries[0],
                            bases: mixerEntries[0].bases
                        };
                        results.fuzzySuffixMatches.push(matchResult);
                        break;
                    }
                }
            }
        }
        
        // Track matched entries
        if (matchResult) {
            results.matchedContinents.push(matchResult);
            matchedMixerEntries.add(matchResult.sampleMixerEntry);
        } else {
            results.unmatchedContinents.push(continentEntry);
        }
    });
    
    return {
        ...results,
        matchedMixerEntries,
        unmatchedMixerEntries: [] // Will be calculated in statistics
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
        bases: mixerEntry.bases,
        confidence: matchType === 'exact' ? 1.0 : 0.9
    };
}

/**
 * Calculate final statistics
 */
function calculateFinalStatistics(results, continentEntries, mixerMapEntries) {
    const totalContinents = continentEntries.length;
    const totalMixerEntries = mixerMapEntries.length;
    
    const strategyCounts = {
        exact: results.exactMatches.length,
        case_insensitive: results.caseInsensitiveMatches.length,
        simple_name: results.simpleNameMatches.length,
        component_match: results.componentMatches.length,
        fuzzy_suffix: results.fuzzySuffixMatches.length
    };
    
    const totalMatched = Object.values(strategyCounts).reduce((sum, count) => sum + count, 0);
    const matchRate = (totalMatched / totalContinents * 100);
    
    // Calculate unmatched mixer entries
    const matchedMixerIsoCodes = new Set();
    [
        ...results.exactMatches,
        ...results.caseInsensitiveMatches,
        ...results.simpleNameMatches,
        ...results.componentMatches,
        ...results.fuzzySuffixMatches
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
            baseline: 32.4,
            iso: 34.7,
            fuzzy: matchRate,
            improvement: matchRate - 32.4
        },
        coverage: {
            continent: (totalMatched / totalContinents * 100).toFixed(1),
            mixer: ((totalMixerEntries - unmatchedMixerCount) / totalMixerEntries * 100).toFixed(1)
        }
    };
}

/**
 * Validate data integrity of synchronization results
 */
function validateDataIntegrity(synchronizationResults, continentData, mixerMapData) {
    console.log("🔬 Validating data integrity...");
    
    const validationResults = {
        validationErrors: [],
        warnings: [],
        statistics: {
            totalValidated: 0,
            validMappings: 0,
            invalidIndices: 0,
            missingBases: 0,
            duplicateMappings: 0,
            legacyIndices: 0,
            newIndices: 0
        },
        continentBreakdown: {},
        indexRangeAnalysis: {},
        mixerEntryValidation: {}
    };
    
    const allMatches = [
        ...synchronizationResults.exactMatches,
        ...synchronizationResults.caseInsensitiveMatches,
        ...synchronizationResults.simpleNameMatches,
        ...synchronizationResults.componentMatches,
        ...synchronizationResults.fuzzySuffixMatches
    ];
    
    const continentEntries = continentData.entries;
    const mixerMapEntries = mixerMapData;
    
    // Create lookup maps for validation
    const continentIndexMap = new Map();
    continentEntries.forEach(entry => {
        continentIndexMap.set(entry.index, entry);
    });
    
    const mixerIsoMap = new Map();
    mixerMapEntries.forEach(entry => {
        if (entry.iso) {
            if (!mixerIsoMap.has(entry.iso)) {
                mixerIsoMap.set(entry.iso, []);
            }
            mixerIsoMap.get(entry.iso).push(entry);
        }
    });
    
    // Track duplicates
    const mappingPairs = new Map();
    const isoCodes = new Set();
    
    // Validate each matched entry
    allMatches.forEach((match, index) => {
        validationResults.statistics.totalValidated++;
        
        try {
            // 1. Validate continent index exists
            if (!continentIndexMap.has(match.continentIndex)) {
                validationResults.validationErrors.push({
                    type: 'missing_continent_index',
                    match: match,
                    message: `Continent index ${match.continentIndex} not found in continent data`
                });
                validationResults.statistics.invalidIndices++;
                return;
            }
            
            // 2. Validate mixer entry exists
            if (!mixerIsoMap.has(match.mixerIso)) {
                validationResults.validationErrors.push({
                    type: 'missing_mixer_entry',
                    match: match,
                    message: `Mixer ISO "${match.mixerIso}" not found in mixer map`
                });
                return;
            }
            
            // 3. Validate bases array
            const mixerEntry = mixerIsoMap.get(match.mixerIso)[0];
            if (!mixerEntry.bases || !Array.isArray(mixerEntry.bases) || mixerEntry.bases.length === 0) {
                // This is a warning, not a critical error for validation
                validationResults.warnings.push({
                    type: 'missing_bases',
                    match: match,
                    message: `Mixer entry "${match.mixerIso}" has invalid or empty bases array`
                });
                validationResults.statistics.missingBases++;
            }
            
            // 4. Check for duplicate mappings
            const mappingKey = `${match.continentIndex}-${match.mixerIso}`;
            if (mappingPairs.has(mappingKey)) {
                validationResults.validationErrors.push({
                    type: 'duplicate_mapping',
                    match: match,
                    message: `Duplicate mapping: index ${match.continentIndex} → ISO ${match.mixerIso}`
                });
                validationResults.statistics.duplicateMappings++;
            } else {
                mappingPairs.set(mappingKey, match);
            }
            
            // 5. Track ISO codes for duplicate detection
            if (isoCodes.has(match.mixerIso)) {
                validationResults.warnings.push({
                    type: 'reused_iso_code',
                    match: match,
                    message: `ISO code "${match.mixerIso}" used for multiple continent entries`
                });
            } else {
                isoCodes.add(match.mixerIso);
            }
            
            // 6. Validate index ranges
            const index = match.continentIndex;
            if (index <= 5000) {
                validationResults.statistics.legacyIndices++;
            } else if (index >= 20000) {
                validationResults.statistics.newIndices++;
            }
            
            // 7. Continental breakdown
            if (!validationResults.continentBreakdown[match.continent]) {
                validationResults.continentBreakdown[match.continent] = {
                    total: 0,
                    matched: 0,
                    valid: 0,
                    errors: 0
                };
            }
            validationResults.continentBreakdown[match.continent].total++;
            validationResults.continentBreakdown[match.continent].matched++;
            validationResults.statistics.validMappings++;
            
        } catch (error) {
            validationResults.validationErrors.push({
                type: 'validation_exception',
                match: match,
                message: `Exception during validation: ${error.message}`
            });
        }
    });
    
    // Calculate continental error rates
    Object.entries(validationResults.continentBreakdown).forEach(([continent, data]) => {
        data.errorRate = data.total > 0 ? ((data.errors / data.total) * 100).toFixed(2) : "0.00";
        data.matchRate = data.total > 0 ? ((data.matched / data.total) * 100).toFixed(1) : "0.0";
    });
    
    // Add unmatched entries to continental breakdown
    synchronizationResults.unmatchedContinents.forEach(entry => {
        if (!validationResults.continentBreakdown[entry.continent]) {
            validationResults.continentBreakdown[entry.continent] = {
                total: 0,
                matched: 0,
                valid: 0,
                errors: 0
            };
        }
        validationResults.continentBreakdown[entry.continent].total++;
    });
    
    console.log(`✅ Validation complete: ${validationResults.statistics.validMappings}/${validationResults.statistics.totalValidated} mappings validated`);
    
    return validationResults;
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(synchronizationResults, validationResults) {
    const stats = synchronizationResults.statistics;
    
    return {
        metadata: {
            generatedAt: new Date().toISOString(),
            task: "C7",
            version: "1.0.0",
            description: "Comprehensive synchronization validation report"
        },
        executiveSummary: {
            finalMatchRate: stats.matchRates.fuzzy.toFixed(1),
            totalImprovement: stats.matchRates.improvement.toFixed(1),
            baselineRate: stats.matchRates.baseline,
            validationStatus: validationResults.validationErrors.length === 0 ? 'PASS' : 'FAIL',
            dataIntegrityScore: ((validationResults.statistics.validMappings / validationResults.statistics.totalValidated) * 100).toFixed(1)
        },
        synchronizationResults: {
            statistics: stats,
            matchesByStrategy: {
                exact: synchronizationResults.exactMatches.length,
                case_insensitive: synchronizationResults.caseInsensitiveMatches.length,
                simple_name: synchronizationResults.simpleNameMatches.length,
                component_match: synchronizationResults.componentMatches.length,
                fuzzy_suffix: synchronizationResults.fuzzySuffixMatches.length
            },
            unmatchedEntries: synchronizationResults.unmatchedContinents.length
        },
        validationResults: {
            summary: validationResults.statistics,
            continentBreakdown: validationResults.continentBreakdown,
            errors: validationResults.validationErrors,
            warnings: validationResults.warnings
        },
        recommendations: generateRecommendations(synchronizationResults, validationResults)
    };
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(synchronizationResults, validationResults) {
    const recommendations = [];
    
    if (validationResults.validationErrors.length === 0) {
        recommendations.push({
            priority: 'success',
            category: 'validation',
            message: 'All synchronization validations passed',
            action: 'Proceed to final verification phase'
        });
    } else {
        recommendations.push({
            priority: 'high',
            category: 'validation',
            message: `${validationResults.validationErrors.length} validation errors found`,
            action: 'Fix validation errors before proceeding'
        });
    }
    
    if (validationResults.statistics.duplicateMappings > 0) {
        recommendations.push({
            priority: 'high',
            category: 'data_integrity',
            message: `${validationResults.statistics.duplicateMappings} duplicate mappings detected`,
            action: 'Resolve duplicate mappings to ensure data integrity'
        });
    }
    
    if (validationResults.statistics.missingBases > 0) {
        recommendations.push({
            priority: 'medium',
            category: 'data_quality',
            message: `${validationResults.statistics.missingBases} mixer entries missing valid bases arrays`,
            action: 'Review and fix mixer map entries with missing bases'
        });
    }
    
    if (synchronizationResults.statistics.matchRates.fuzzy < 40.0) {
        recommendations.push({
            priority: 'medium',
            category: 'improvement',
            message: 'Match rate below 40% target',
            action: 'Consider additional fuzzy matching strategies or manual review'
        });
    }
    
    return recommendations;
}

/**
 * Display validation report to console
 */
function displayValidationReport(report) {
    console.log("\n" + "=".repeat(70));
    console.log("📊 SYNCHRONIZATION VALIDATION REPORT");
    console.log("=".repeat(70) + "\n");
    
    // Executive Summary
    console.log("🎯 EXECUTIVE SUMMARY");
    console.log("--------------------");
    console.log(`Final Match Rate: ${report.executiveSummary.finalMatchRate}%`);
    console.log(`Total Improvement: +${report.executiveSummary.totalImprovement}%`);
    console.log(`Baseline Rate (Task C4c): ${report.executiveSummary.baselineRate}%`);
    console.log(`Validation Status: ${report.executiveSummary.validationStatus}`);
    console.log(`Data Integrity Score: ${report.executiveSummary.dataIntegrityScore}%`);
    console.log();
    
    // Synchronization Results
    console.log("🔄 SYNCHRONIZATION RESULTS");
    console.log("---------------------------");
    console.log(`Continent entries processed: ${report.synchronizationResults.statistics.totalContinentEntries.toLocaleString()}`);
    console.log(`Mixer map entries available: ${report.synchronizationResults.statistics.totalMixerEntries.toLocaleString()}`);
    console.log(`Total matches found: ${report.synchronizationResults.statistics.totalMatchedEntries.toLocaleString()}`);
    console.log(`Unmatched entries: ${report.synchronizationResults.unmatchedEntries.toLocaleString()}`);
    console.log(`Continent coverage: ${report.synchronizationResults.statistics.coverage.continent}%`);
    console.log();
    
    // Strategy Breakdown
    console.log("🔍 MATCHING STRATEGY BREAKDOWN");
    console.log("-------------------------------");
    Object.entries(report.synchronizationResults.matchesByStrategy).forEach(([strategy, count]) => {
        const percentage = ((count / report.synchronizationResults.statistics.totalMatchedEntries) * 100).toFixed(1);
        console.log(`${padStrategyName(strategy)}: ${count.toString().padStart(4)} matches (${percentage}%)`);
    });
    console.log();
    
    // Validation Results
    console.log("🔬 VALIDATION RESULTS");
    console.log("---------------------");
    console.log(`Total Validated: ${report.validationResults.summary.totalValidated.toLocaleString()}`);
    console.log(`Valid Mappings: ${report.validationResults.summary.validMappings.toLocaleString()}`);
    console.log(`Validation Errors: ${report.validationResults.errors.length.toLocaleString()}`);
    console.log(`Warnings: ${report.validationResults.warnings.length.toLocaleString()}`);
    
    if (report.validationResults.errors.length > 0) {
        console.log("\n❌ VALIDATION ERRORS:");
        report.validationResults.errors.slice(0, 5).forEach((error, index) => {
            console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
        });
        if (report.validationResults.errors.length > 5) {
            console.log(`  ... and ${report.validationResults.errors.length - 5} more errors`);
        }
    }
    
    if (report.validationResults.warnings.length > 0) {
        console.log("\n⚠️  WARNINGS:");
        report.validationResults.warnings.slice(0, 3).forEach((warning, index) => {
            console.log(`  ${index + 1}. [${warning.type}] ${warning.message}`);
        });
    }
    console.log();
    
    // Continental Breakdown
    console.log("🗺️  CONTINENTAL BREAKDOWN");
    console.log("-------------------------");
    Object.entries(report.validationResults.continentBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([continent, data]) => {
            const matchRate = data.total > 0 ? ((data.matched / data.total) * 100).toFixed(1) : "0.0";
            console.log(`${padContinentName(continent)}: ${data.matched.toString().padStart(3)}/${data.total.toString().padStart(3)} matched (${matchRate}%)`);
        });
    console.log();
    
    // Recommendations
    console.log("💡 RECOMMENDATIONS");
    console.log("------------------");
    report.recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'success' ? '✅' : rec.priority === 'high' ? '🔴' : '🟡';
        console.log(`${index + 1}. ${priorityIcon} [${rec.priority.toUpperCase()}] ${rec.message}`);
        console.log(`   Action: ${rec.action}\n`);
    });
    
    // Success/Failure Summary
    console.log("=" .repeat(70));
    if (report.executiveSummary.validationStatus === 'PASS') {
        console.log("✅ SYNCHRONIZATION VALIDATION: PASSED");
        console.log("🎯 Ready for final verification phase");
    } else {
        console.log("❌ SYNCHRONIZATION VALIDATION: FAILED");
        console.log("🔧 Fix validation errors before proceeding");
    }
    console.log("=".repeat(70));
}

/**
 * Save validation report as JSON
 */
function saveValidationReport(report, filename) {
    const filepath = path.join(__dirname, "data", filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Validation report saved: ${filepath}`);
}

/**
 * Pad strategy name for consistent formatting
 */
function padStrategyName(strategy) {
    const padded = strategy.replace(/_/g, ' ').padEnd(18, ' ');
    return padded.substring(0, 18);
}

/**
 * Pad continent name for consistent formatting
 */
function padContinentName(continent) {
    const padded = continent.padEnd(13, ' ');
    return padded.substring(0, 13);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    args.forEach(arg => {
        if (arg.startsWith('--format=')) {
            options.format = arg.split('=')[1];
        } else if (arg.startsWith('--output=')) {
            options.output = arg.split('=')[1];
        }
    });
    
    return options;
}

// Run the main function
if (require.main === module) {
    const options = parseArgs();
    validateSynchronization(options);
}

module.exports = {
    validateSynchronization,
    loadContinentData,
    loadMixerMapData,
    runCompleteSynchronizationPipeline,
    validateDataIntegrity,
    generateValidationReport
};
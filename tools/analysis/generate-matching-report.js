#!/usr/bin/env node

/**
 * Task C4d: Generate Matching Report
 * 
 * This tool creates comprehensive matching analysis reports between continent data
 * and mixer map data, using the basic string matching function from Task C4c.
 * 
 * Features:
 * - Comprehensive matching analysis using existing string matching logic
 * - Multiple output formats: Console, JSON, and Markdown
 * - Detailed breakdown by continent with statistics
 * - Analysis of naming pattern differences
 * - Actionable recommendations for improvement
 * - Export capabilities for programmatic access
 * 
 * Usage: node tools/generate-matching-report.js [--format=console|json|markdown|all] [--output=filename]
 * 
 * Default: console output only
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Import loaders and matching logic from previous tasks
const { loadContinentData: originalLoadContinentData } = require("./load-continent-data");
const { loadMixerMapData } = require("./load-mixer-map-data");

/**
 * Load continent data and return the actual data object
 */
function loadContinentData() {
    const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
    
    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`Data file not found: ${dataFilePath}`);
    }
    
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(rawData);
    
    return data;
}

/**
 * Main function to generate comprehensive matching report
 */
function generateMatchingReport(options = {}) {
    console.log("🔄 Starting comprehensive matching report generation...\n");
    
    const format = options.format || 'console';
    const outputFile = options.output || null;
    
    try {
        // Load both datasets
        const continentData = loadContinentData();
        const mixerMapData = loadMixerMapData();
        
        console.log("✅ Both datasets loaded successfully\n");
        
        // Perform comprehensive matching analysis
        const matchingResults = performMatchingAnalysis(continentData, mixerMapData);
        
        // Generate reports in requested formats
        const reports = generateComprehensiveReports(matchingResults);
        
        // Output reports
        if (format === 'all' || format === 'console') {
            displayConsoleReport(reports.console);
        }
        
        if (format === 'all' || format === 'json') {
            const jsonFile = outputFile || 'matching-report.json';
            saveJsonReport(reports.json, jsonFile);
        }
        
        if (format === 'all' || format === 'markdown') {
            const mdFile = outputFile || 'matching-report.md';
            saveMarkdownReport(reports.markdown, mdFile);
        }
        
        console.log("\n🎯 Task C4d completed successfully!");
        console.log("📊 Comprehensive matching analysis report generated");
        
    } catch (error) {
        console.error("❌ Error generating matching report:", error.message);
        process.exit(1);
    }
}

/**
 * Perform the actual string matching analysis (enhanced version)
 */
function performMatchingAnalysis(continentData, mixerMapData) {
    console.log("\n🔍 Performing comprehensive matching analysis...");
    
    const continentEntries = continentData.entries;
    const mixerMapEntries = Array.isArray(mixerMapData) ? mixerMapData : mixerMapData.entries;
    
    // Prepare lookup structures
    const mixerIsoMap = new Map();
    const mixerIsoMapLower = new Map();
    
    // Build ISO code lookup maps
    mixerMapEntries.forEach((entry) => {
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
    
    // Track naming patterns for analysis
    const namingPatternAnalysis = {
        exactMatches: [],
        caseInsensitiveDifferences: [],
        unmatchedPatterns: new Map()
    };
    
    // Process each continent entry
    continentEntries.forEach((continentEntry) => {
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
                sampleMixerEntry: mixerEntries[0]
            };
            
            exactMatches.push(matchResult);
            matchedContinents.push(matchResult);
            mixerEntries.forEach(entry => matchedMixerEntries.add(entry));
            
            namingPatternAnalysis.exactMatches.push({
                continentName,
                mixerIso: mixerEntries[0].iso,
                continent
            });
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
                matchedContinents.push(matchResult);
                mixerEntries.forEach(entry => matchedMixerEntries.add(entry));
                
                namingPatternAnalysis.caseInsensitiveDifferences.push({
                    continentName,
                    mixerIso: mixerEntries[0].iso,
                    continent,
                    caseDifference: true
                });
            }
        }
        
        // Track unmatched entries for pattern analysis
        if (!matchResult) {
            unmatchedContinents.push(continentEntry);
            analyzeUnmatchedPattern(continentName, continent, namingPatternAnalysis);
        }
    });
    
    // Find unmatched mixer entries
    const unmatchedMixerEntries = mixerMapEntries.filter((entry) => {
        return !matchedMixerEntries.has(entry);
    });
    
    // Generate comprehensive statistics
    const statistics = generateComprehensiveStatistics(
        continentEntries, mixerMapEntries, matchedContinents, 
        unmatchedContinents, unmatchedMixerEntries, exactMatches, caseInsensitiveMatches
    );
    
    // Analyze naming patterns
    const patternAnalysis = analyzeNamingPatterns(namingPatternAnalysis, unmatchedContinents);
    
    return {
        exactMatches,
        caseInsensitiveMatches,
        unmatchedContinents,
        unmatchedMixerEntries,
        matchedContinents,
        statistics,
        patternAnalysis,
        metadata: {
            generatedAt: new Date().toISOString(),
            version: "1.0.0",
            task: "C4d",
            sourceData: {
                continentEntries: continentEntries.length,
                mixerEntries: mixerMapEntries.length
            }
        }
    };
}

/**
 * Generate comprehensive statistics
 */
function generateComprehensiveStatistics(continentEntries, mixerMapEntries, matchedContinents, 
                                       unmatchedContinents, unmatchedMixerEntries, exactMatches, caseInsensitiveMatches) {
    const totalContinentEntries = continentEntries.length;
    const totalMixerEntries = mixerMapEntries.length;
    
    const exactMatchCount = exactMatches.length;
    const caseInsensitiveMatchCount = caseInsensitiveMatches.length;
    const totalMatchedCount = matchedContinents.length;
    const unmatchedContinentCount = unmatchedContinents.length;
    const unmatchedMixerCount = unmatchedMixerEntries.length;
    
    return {
        totals: {
            continentEntries: totalContinentEntries,
            mixerEntries: totalMixerEntries,
            matchedEntries: totalMatchedCount,
            unmatchedContinentEntries: unmatchedContinentCount,
            unmatchedMixerEntries: unmatchedMixerCount,
            missingFromMixer: unmatchedContinentCount,
            unusedInMixer: unmatchedMixerCount
        },
        matches: {
            exactMatches: exactMatchCount,
            caseInsensitiveMatches: caseInsensitiveMatchCount,
            totalMatches: totalMatchedCount
        },
        rates: {
            exactMatchRate: (exactMatchCount / totalContinentEntries * 100),
            totalMatchRate: (totalMatchedCount / totalContinentEntries * 100),
            coverageRate: (totalMatchedCount / totalMixerEntries * 100),
            unusedMixerRate: ((totalMixerEntries - totalMatchedCount) / totalMixerEntries * 100)
        },
        gaps: {
            missingFromMixer: unmatchedContinentCount,
            unusedInMixer: unmatchedMixerCount,
            potentialMatches: Math.min(unmatchedContinentCount, unmatchedMixerCount)
        }
    };
}

/**
 * Analyze unmatched patterns for insights
 */
function analyzeUnmatchedPattern(continentName, continent, namingPatternAnalysis) {
    if (!namingPatternAnalysis.unmatchedPatterns.has(continent)) {
        namingPatternAnalysis.unmatchedPatterns.set(continent, []);
    }
    
    const patterns = analyzeNamePattern(continentName);
    namingPatternAnalysis.unmatchedPatterns.get(continent).push({
        name: continentName,
        patterns,
        length: continentName.length
    });
}

/**
 * Analyze naming patterns in a single name
 */
function analyzeNamePattern(name) {
    const patterns = [];
    
    // Check for common suffixes
    if (name.endsWith('ese')) patterns.push('suffix:ese');
    if (name.endsWith('ish')) patterns.push('suffix:ish');
    if (name.endsWith('ian')) patterns.push('suffix:ian');
    if (name.endsWith('an')) patterns.push('suffix:an');
    if (name.endsWith('ic')) patterns.push('suffix:ic');
    if (name.endsWith('al')) patterns.push('suffix:al');
    
    // Check for compound words
    if (name.includes(' ')) patterns.push('compound');
    if (name.includes('-')) patterns.push('hyphenated');
    
    // Check for case patterns
    if (name === name.toUpperCase()) patterns.push('all_caps');
    if (name === name.toLowerCase()) patterns.push('all_lowercase');
    if (/^[A-Z]/.test(name) && name.slice(1) === name.slice(1).toLowerCase()) patterns.push('title_case');
    
    // Check for numeric patterns
    if (/\d/.test(name)) patterns.push('contains_numbers');
    
    // Check for special characters
    if (/[^\w\s-]/.test(name)) patterns.push('special_characters');
    
    return patterns;
}

/**
 * Generate comprehensive naming pattern analysis
 */
function analyzeNamingPatterns(namingPatternAnalysis, unmatchedContinents) {
    const analysis = {
        exactMatchPatterns: {},
        caseInsensitivePatterns: {},
        unmatchedPatterns: {},
        recommendations: []
    };
    
    // Analyze exact match patterns
    namingPatternAnalysis.exactMatches.forEach(match => {
        const patterns = analyzeNamePattern(match.continentName);
        patterns.forEach(pattern => {
            if (!analysis.exactMatchPatterns[pattern]) {
                analysis.exactMatchPatterns[pattern] = 0;
            }
            analysis.exactMatchPatterns[pattern]++;
        });
    });
    
    // Analyze case-insensitive patterns
    namingPatternAnalysis.caseInsensitiveDifferences.forEach(match => {
        const patterns = analyzeNamePattern(match.continentName);
        patterns.forEach(pattern => {
            if (!analysis.caseInsensitivePatterns[pattern]) {
                analysis.caseInsensitivePatterns[pattern] = 0;
            }
            analysis.caseInsensitivePatterns[pattern]++;
        });
    });
    
    // Analyze unmatched patterns
    namingPatternAnalysis.unmatchedPatterns.forEach((entries, continent) => {
        analysis.unmatchedPatterns[continent] = {};
        
        entries.forEach(entry => {
            entry.patterns.forEach(pattern => {
                if (!analysis.unmatchedPatterns[continent][pattern]) {
                    analysis.unmatchedPatterns[continent][pattern] = 0;
                }
                analysis.unmatchedPatterns[continent][pattern]++;
            });
        });
    });
    
    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis, namingPatternAnalysis);
    
    return analysis;
}

/**
 * Generate actionable recommendations based on analysis
 */
function generateRecommendations(analysis, namingPatternAnalysis) {
    const recommendations = [];
    
    // Case sensitivity recommendations
    if (Object.keys(analysis.caseInsensitivePatterns).length > 0) {
        recommendations.push({
            priority: "medium",
            category: "case_sensitivity",
            issue: "Case-insensitive matches detected",
            description: "Some languages match only when case is ignored",
            recommendation: "Implement case-insensitive matching as fallback",
            affectedCount: namingPatternAnalysis.caseInsensitiveDifferences.length
        });
    }
    
    // Suffix pattern recommendations
    const commonUnmatchedSuffixes = ['ese', 'ish', 'ian', 'an', 'ic', 'al'];
    commonUnmatchedSuffixes.forEach(suffix => {
        const totalUnmatchedWithSuffix = Object.values(analysis.unmatchedPatterns)
            .reduce((sum, continent) => sum + (continent[`suffix:${suffix}`] || 0), 0);
        
        if (totalUnmatchedWithSuffix > 0) {
            recommendations.push({
                priority: "medium",
                category: "naming_patterns",
                issue: `Unmatched languages with "${suffix}" suffix`,
                description: `${totalUnmatchedWithSuffix} languages with ${suffix} suffix don't match`,
                recommendation: `Implement suffix-stripping logic for ${suffix} endings`,
                affectedCount: totalUnmatchedWithSuffix
            });
        }
    });
    
    // Coverage recommendations
    if (analysis.recommendations.length === 0) {
        recommendations.push({
            priority: "high",
            category: "coverage",
            issue: "Low overall match rate",
            description: "Only basic string matching implemented",
            recommendation: "Implement ISO code matching and fuzzy matching algorithms",
            affectedCount: "all_unmatched"
        });
    }
    
    return recommendations;
}

/**
 * Generate comprehensive reports in all formats
 */
function generateComprehensiveReports(matchingResults) {
    const { statistics, patternAnalysis } = matchingResults;
    
    return {
        console: generateConsoleReport(matchingResults),
        json: generateJsonReport(matchingResults),
        markdown: generateMarkdownReport(matchingResults)
    };
}

/**
 * Generate console report
 */
function generateConsoleReport(results) {
    const { statistics, patternAnalysis } = results;
    
    let report = "";
    
    report += "📊 COMPREHENSIVE MATCHING ANALYSIS REPORT\n";
    report += "==========================================\n\n";
    
    // Executive Summary
    report += "🎯 EXECUTIVE SUMMARY\n";
    report += "-------------------\n";
    report += `Overall Match Rate: ${statistics.rates.totalMatchRate.toFixed(1)}%\n`;
    report += `Exact Match Rate: ${statistics.rates.exactMatchRate.toFixed(1)}%\n`;
    report += `Coverage Rate: ${statistics.rates.coverageRate.toFixed(1)}%\n`;
    report += `Unused Mixer Entries: ${statistics.rates.unusedMixerRate.toFixed(1)}%\n\n`;
    
    // Key Statistics
    report += "📈 KEY STATISTICS\n";
    report += "-----------------\n";
    report += `Total continent entries: ${statistics.totals.continentEntries.toLocaleString()}\n`;
    report += `Total mixer entries: ${statistics.totals.mixerEntries.toLocaleString()}\n`;
    report += `Successfully matched: ${statistics.totals.matchedEntries.toLocaleString()}\n`;
    report += `Missing from mixer: ${statistics.totals.missingFromMixer.toLocaleString()}\n`;
    report += `Unused in mixer: ${statistics.totals.unusedInMixer.toLocaleString()}\n\n`;
    
    // Recommendations
    report += "💡 RECOMMENDATIONS\n";
    report += "------------------\n";
    patternAnalysis.recommendations.forEach((rec, index) => {
        report += `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}\n`;
        report += `   ${rec.recommendation}\n`;
        report += `   Affected: ${rec.affectedCount} entries\n\n`;
    });
    
    return report;
}

/**
 * Generate JSON report
 */
function generateJsonReport(results) {
    return {
        metadata: results.metadata,
        summary: {
            matchRates: results.statistics.rates,
            totals: results.statistics.totals,
            matches: results.statistics.matches
        },
        analysis: {
            exactMatches: results.exactMatches.map(match => ({
                continentName: match.continentName,
                continent: match.continent,
                mixerIso: match.sampleMixerEntry.iso,
                matchType: match.matchType
            })),
            caseInsensitiveMatches: results.caseInsensitiveMatches.map(match => ({
                continentName: match.continentName,
                continent: match.continent,
                mixerIso: match.sampleMixerEntry.iso,
                originalCase: match.originalCase,
                matchType: match.matchType
            })),
            unmatchedContinents: results.unmatchedContinents.map(entry => ({
                name: entry.name,
                index: entry.index,
                continent: entry.continent
            })),
            unmatchedMixerEntries: results.unmatchedMixerEntries.map(entry => ({
                iso: entry.iso,
                bases: entry.bases,
                families: entry.families
            }))
        },
        patternAnalysis: results.patternAnalysis,
        recommendations: results.patternAnalysis.recommendations
    };
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(results) {
    const { statistics, patternAnalysis } = results;
    
    let report = "";
    
    report += "# Comprehensive Matching Analysis Report\n\n";
    report += `**Generated:** ${results.metadata.generatedAt}\n`;
    report += `**Task:** ${results.metadata.task}\n\n`;
    
    // Executive Summary
    report += "## Executive Summary\n\n";
    report += "| Metric | Value |\n";
    report += "|--------|-------|\n";
    report += `| Overall Match Rate | ${statistics.rates.totalMatchRate.toFixed(1)}% |\n`;
    report += `| Exact Match Rate | ${statistics.rates.exactMatchRate.toFixed(1)}% |\n`;
    report += `| Coverage Rate | ${statistics.rates.coverageRate.toFixed(1)}% |\n`;
    report += `| Unused Mixer Entries | ${statistics.rates.unusedMixerRate.toFixed(1)}% |\n\n`;
    
    // Detailed Statistics
    report += "## Detailed Statistics\n\n";
    report += "### Totals\n";
    report += `- **Continent Entries:** ${statistics.totals.continentEntries.toLocaleString()}\n`;
    report += `- **Mixer Entries:** ${statistics.totals.mixerEntries.toLocaleString()}\n`;
    report += `- **Successfully Matched:** ${statistics.totals.matchedEntries.toLocaleString()}\n`;
    report += `- **Missing from Mixer:** ${statistics.totals.missingFromMixer.toLocaleString()}\n`;
    report += `- **Unused in Mixer:** ${statistics.totals.unusedInMixer.toLocaleString()}\n\n`;
    
    // Pattern Analysis
    report += "## Naming Pattern Analysis\n\n";
    
    if (Object.keys(patternAnalysis.exactMatchPatterns).length > 0) {
        report += "### Successful Match Patterns\n";
        Object.entries(patternAnalysis.exactMatchPatterns)
            .sort(([,a], [,b]) => b - a)
            .forEach(([pattern, count]) => {
                report += `- **${pattern}:** ${count} occurrences\n`;
            });
        report += "\n";
    }
    
    if (Object.keys(patternAnalysis.caseInsensitivePatterns).length > 0) {
        report += "### Case-Insensitive Match Patterns\n";
        Object.entries(patternAnalysis.caseInsensitivePatterns)
            .sort(([,a], [,b]) => b - a)
            .forEach(([pattern, count]) => {
                report += `- **${pattern}:** ${count} occurrences\n`;
            });
        report += "\n";
    }
    
    // Recommendations
    report += "## Recommendations\n\n";
    patternAnalysis.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.issue}\n`;
        report += `**Priority:** ${rec.priority.toUpperCase()}\n\n`;
        report += `**Description:** ${rec.description}\n\n`;
        report += `**Recommendation:** ${rec.recommendation}\n\n`;
        report += `**Affected Entries:** ${rec.affectedCount}\n\n`;
    });
    
    // Sample Data
    report += "## Sample Data\n\n";
    
    if (results.exactMatches.length > 0) {
        report += "### Sample Exact Matches\n";
        report += "| Continent Name | Mixer ISO | Continent |\n";
        report += "|----------------|-----------|----------|\n";
        results.exactMatches.slice(0, 10).forEach(match => {
            report += `| ${match.continentName} | ${match.sampleMixerEntry.iso} | ${match.continent} |\n`;
        });
        report += "\n";
    }
    
    if (results.unmatchedContinents.length > 0) {
        report += "### Sample Unmatched Continent Entries\n";
        report += "| Name | Index | Continent |\n";
        report += "|------|-------|----------|\n";
        results.unmatchedContinents.slice(0, 15).forEach(entry => {
            report += `| ${entry.name} | ${entry.index} | ${entry.continent} |\n`;
        });
        report += "\n";
    }
    
    return report;
}

/**
 * Display console report
 */
function displayConsoleReport(report) {
    console.log(report);
}

/**
 * Save JSON report
 */
function saveJsonReport(report, filename) {
    const filepath = path.join(__dirname, "data", filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON report saved: ${filepath}`);
}

/**
 * Save Markdown report
 */
function saveMarkdownReport(report, filename) {
    const filepath = path.join(__dirname, "reports", filename);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(filepath);
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, report);
    console.log(`📄 Markdown report saved: ${filepath}`);
}

// Parse command line arguments
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
    generateMatchingReport(options);
}

module.exports = {
    generateMatchingReport,
    performMatchingAnalysis,
    generateComprehensiveReports
};
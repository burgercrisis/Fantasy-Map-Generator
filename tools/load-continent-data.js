#!/usr/bin/env node

/**
 * Task C4a: Load Continent Mapping Data
 * 
 * This tool loads the continent mapping data created in Task C3 and displays
 * basic statistics about the parsed language entries.
 * 
 * Usage: node tools/load-continent-data.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Main function to load and validate continent mapping data
 */
function loadContinentData() {
    console.log("🔄 Loading continent mapping data...\n");
    
    // Define the path to the data file
    const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
    
    try {
        // Check if file exists
        if (!fs.existsSync(dataFilePath)) {
            throw new Error(`Data file not found: ${dataFilePath}`);
        }
        
        // Read and parse JSON data
        const rawData = fs.readFileSync(dataFilePath, "utf8");
        const data = JSON.parse(rawData);
        
        console.log("✅ Successfully loaded continent mapping data\n");
        
        // Validate data structure
        validateDataStructure(data);
        
        // Display statistics
        displayStatistics(data);
        
        console.log("\n🎯 Task C4a completed successfully!");
        console.log("📊 Data is ready for Tasks C4b-C4d (mixer map loading and matching)");
        
    } catch (error) {
        console.error("❌ Error loading continent mapping data:", error.message);
        process.exit(1);
    }
}

/**
 * Validate the structure of the loaded data
 */
function validateDataStructure(data) {
    console.log("🔍 Validating data structure...");
    
    // Check required top-level properties
    const requiredProperties = ["metadata", "continent_statistics", "entries"];
    
    for (const prop of requiredProperties) {
        if (!data.hasOwnProperty(prop)) {
            throw new Error(`Missing required property: ${prop}`);
        }
    }
    
    // Validate metadata
    if (!data.metadata.hasOwnProperty("total_entries") || 
        !data.metadata.hasOwnProperty("continents")) {
        throw new Error("Invalid metadata structure");
    }
    
    // Validate entries array
    if (!Array.isArray(data.entries)) {
        throw new Error("Entries must be an array");
    }
    
    // Validate each entry has required fields
    data.entries.forEach((entry, index) => {
        if (!entry.hasOwnProperty("name") || 
            !entry.hasOwnProperty("index") || 
            !entry.hasOwnProperty("continent")) {
            throw new Error(`Entry ${index} is missing required fields`);
        }
        
        // Validate continent value
        const validContinents = ["africa", "asia", "europe", "northAmerica", "oceania", "southAmerica"];
        if (!validContinents.includes(entry.continent)) {
            throw new Error(`Invalid continent '${entry.continent}' in entry ${index}`);
        }
    });
    
    console.log("✅ Data structure validation passed\n");
}

/**
 * Display statistics about the loaded data
 */
function displayStatistics(data) {
    console.log("📊 CONTINENT MAPPING DATA STATISTICS");
    console.log("=====================================\n");
    
    // Basic file info
    console.log("📁 File Information:");
    console.log(`   • Total entries: ${data.metadata.total_entries}`);
    console.log(`   • Parsed at: ${data.metadata.parsed_at}`);
    console.log(`   • Validation issues: ${data.metadata.validation_issues || 0}`);
    console.log(`   • Continents processed: ${data.metadata.continents.length}\n`);
    
    // Continent breakdown
    console.log("🗺️  Continent Breakdown:");
    const stats = data.continent_statistics;
    const totalFromStats = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    // Sort continents by entry count (descending)
    const sortedContinents = Object.entries(stats)
        .sort(([,a], [,b]) => b - a);
    
    for (const [continent, count] of sortedContinents) {
        const percentage = ((count / totalFromStats) * 100).toFixed(1);
        console.log(`   • ${padContinentName(continent)}: ${count.toString().padStart(4)} entries (${percentage}%)`);
    }
    
    console.log(`   ${"─".repeat(40)}`);
    console.log(`   ${"TOTAL".padStart(35)}: ${totalFromStats.toString().padStart(4)} entries (100.0%)`);
    console.log();
    
    // Validation status
    if (data.metadata.issues && data.metadata.issues.length > 0) {
        console.log("⚠️  Validation Issues:");
        data.metadata.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        console.log();
    } else {
        console.log("✅ No validation issues found\n");
    }
    
    // Sample entries from each continent
    console.log("🔍 Sample Entries by Continent:");
    const continentSamples = {};
    
    // Get first entry from each continent
    data.entries.forEach(entry => {
        if (!continentSamples[entry.continent]) {
            continentSamples[entry.continent] = entry;
        }
    });
    
    Object.entries(continentSamples)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([continent, entry]) => {
            console.log(`   • ${padContinentName(continent)}: "${entry.name}" (index: ${entry.index})`);
        });
    
    console.log();
    
    // Data quality indicators
    console.log("🔍 Data Quality Check:");
    console.log(`   • Unique names: ${new Set(data.entries.map(e => e.name)).size}`);
    console.log(`   • Unique indices: ${new Set(data.entries.map(e => e.index)).size}`);
    console.log(`   • Name/Index pairs: ${data.entries.length}`);
    
    // Check for potential duplicates
    const nameCounts = {};
    data.entries.forEach(entry => {
        nameCounts[entry.name] = (nameCounts[entry.name] || 0) + 1;
    });
    
    const duplicateNames = Object.entries(nameCounts)
        .filter(([, count]) => count > 1)
        .map(([name]) => name);
    
    if (duplicateNames.length > 0) {
        console.log(`   ⚠️  Duplicate names found: ${duplicateNames.length}`);
    } else {
        console.log("   ✅ All names are unique");
    }
    
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
    loadContinentData();
}

module.exports = {
    loadContinentData,
    validateDataStructure,
    displayStatistics
};
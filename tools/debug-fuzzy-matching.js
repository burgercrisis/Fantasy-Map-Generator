#!/usr/bin/env node

/**
 * Debug version of fuzzy suffix matching
 */

"use strict";

const fs = require("fs");
const path = require("path");

function debugLoadData() {
    console.log("🔄 Starting debug data loading...\n");
    
    try {
        // Test continent data loading
        console.log("📂 Testing continent data loading...");
        const dataFilePath = path.join(__dirname, "data", "continent-file-mapping.json");
        
        if (!fs.existsSync(dataFilePath)) {
            console.error(`❌ Data file not found: ${dataFilePath}`);
            return;
        }
        
        const rawData = fs.readFileSync(dataFilePath, "utf8");
        const data = JSON.parse(rawData);
        const entries = data.entries || [];
        
        console.log(`✅ Loaded ${entries.length} continent language entries`);
        console.log("Sample entries:");
        entries.slice(0, 3).forEach((entry, i) => {
            console.log(`  ${i + 1}. ${entry.name} (${entry.continent}) - index: ${entry.index}`);
        });
        
        // Test mixer map data loading
        console.log("\n📂 Testing mixer map data loading...");
        const mixerMapPath = path.join(__dirname, "..", "config", "language-mixer-map.js");
        
        if (!fs.existsSync(mixerMapPath)) {
            console.error(`❌ Mixer map file not found: ${mixerMapPath}`);
            return;
        }
        
        const fileContent = fs.readFileSync(mixerMapPath, "utf8");
        
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
        
        const languageMixerMap = moduleContext.globalThis.languageMixerMap;
        
        if (!languageMixerMap || !Array.isArray(languageMixerMap)) {
            console.error("❌ languageMixerMap not found or not an array");
            return;
        }
        
        console.log(`✅ Loaded ${languageMixerMap.length} mixer map entries`);
        console.log("Sample entries:");
        languageMixerMap.slice(0, 3).forEach((entry, i) => {
            console.log(`  ${i + 1}. ${entry.iso} [${entry.bases.slice(0, 2).join(", ")}]`);
        });
        
        console.log("\n✅ Debug data loading completed successfully!");
        
    } catch (error) {
        console.error("❌ Error in debug data loading:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the debug function
if (require.main === module) {
    debugLoadData();
}
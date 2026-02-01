#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

// Read the namebases file
const filePath = path.join(__dirname, "..", "modules", "namebases-europe.js");
const content = fs.readFileSync(filePath, "utf8");

// Extract the array from the file
const arrayMatch = content.match(/window\.europeNameBases\s*=\s*(\[.*?\]);/s);
if (!arrayMatch) {
    console.error("Could not find europeNameBases array");
    process.exit(1);
}

let namebases;
try {
    // Replace the window.europeNameBases prefix to parse as JSON
    const jsonStr = arrayMatch[1];
    namebases = JSON.parse(jsonStr);
} catch (e) {
    console.error("Failed to parse namebases:", e.message);
    process.exit(1);
}

// Find the languages we need to check
const languagesToCheck = [
    "Northern Portuguese",
    "Latvian", 
    "Ennese"
];

console.log("📋 Current City Lists:\n");

for (const langName of languagesToCheck) {
    const entry = namebases.find(n => n.name === langName);
    if (!entry) {
        console.error(`❌ Language "${langName}" not found`);
        continue;
    }

    const currentCities = entry.b.split(",").map(c => c.trim()).filter(c => c);
    const currentCount = currentCities.length;

    console.log(`${langName} (${currentCount} cities):`);
    console.log(currentCities.join(", "));
    console.log(`\nNeed ${25 - currentCount} more cities to reach 25.\n`);
    console.log("---\n");
}

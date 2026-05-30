const fs = require("fs");

const csvContent = fs.readFileSync("docs/reports/language-metrics/language-quality-metrics.csv", "utf8");
const lines = csvContent.split("\n");
const header = lines[0].split(",");

const colIndex = {};
header.forEach((col, i) => colIndex[col] = i);

console.log("=== Analysis: What Causes Score 85? ===\n");

// Analyze score 85 entries
const score85 = [];
const score100 = [];

lines.slice(1).forEach(line => {
    if (!line.trim()) return;
    const fields = line.split(",");
    const score = parseInt(fields[colIndex.quality_score], 10);
    const cityCount = parseInt(fields[colIndex.city_count], 10);
    const name = fields[colIndex.language_name];
    const continent = fields[colIndex.continent];
    
    if (score === 85) {
        score85.push({ name, continent, cityCount });
    } else if (score === 100) {
        score100.push({ name, continent, cityCount });
    }
});

console.log(`Score 100 entries: ${score100.length}`);
console.log(`Score 85 entries: ${score85.length}`);

// Analyze city count distribution
const cityCountDist = {};
score85.forEach(entry => {
    const key = `${entry.cityCount} cities`;
    if (!cityCountDist[key]) cityCountDist[key] = [];
    cityCountDist[key].push(entry);
});

console.log("\n=== Score 85: City Count Distribution ===");
Object.keys(cityCountDist).sort((a, b) => {
    const countA = parseInt(a);
    const countB = parseInt(b);
    return countA - countB;
}).forEach(countKey => {
    console.log(`${countKey}: ${cityCountDist[countKey].length} entries`);
});

// Show some examples of score 85 with their city counts
console.log("\n=== Sample Score 85 Entries ===");
score85.slice(0, 30).forEach(entry => {
    console.log(`  ${entry.name} (${entry.continent}) - ${entry.cityCount} cities`);
});

// Check if any entries have very few cities (< 5)
console.log("\n=== Entries with < 5 cities (likely candidates for expansion) ===");
const fewCities = score85.filter(e => e.cityCount < 5);
if (fewCities.length > 0) {
    fewCities.forEach(entry => {
        console.log(`  ${entry.name} (${entry.continent}) - ${entry.cityCount} cities`);
    });
} else {
    console.log("  None - all have 5+ cities");
}

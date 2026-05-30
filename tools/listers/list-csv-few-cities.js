const fs = require("fs");

const csvContent = fs.readFileSync("docs/reports/language-metrics/language-quality-metrics.csv", "utf8");
const lines = csvContent.split("\n");
const header = lines[0].split(",");

const colIndex = {};
header.forEach((col, i) => colIndex[col] = i);

console.log("=== Languages with Fewest Cities (from CSV) ===\n");

// Get all entries with city count
const entries = [];
lines.slice(1).forEach(line => {
    if (!line.trim()) return;
    const fields = line.split(",");
    const score = parseInt(fields[colIndex.quality_score], 10);
    const cityCount = parseInt(fields[colIndex.city_count], 10);
    const name = fields[colIndex.language_name];
    const continent = fields[colIndex.continent];
    
    if (!isNaN(cityCount) && score === 85) {
        entries.push({ name, continent, cityCount, score });
    }
});

// Sort by city count
entries.sort((a, b) => a.cityCount - b.cityCount);

console.log(`Found ${entries.length} entries with score 85\n`);

// Show entries with fewest cities
console.log("=== Entries with Fewest Cities ===\n");
entries.slice(0, 50).forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name} (${entry.continent}) - ${entry.cityCount} cities`);
});

// Group by city count
console.log("\n=== Distribution by City Count ===");
const dist = {};
entries.forEach(e => {
    dist[e.cityCount] = (dist[e.cityCount] || 0) + 1;
});
Object.keys(dist).sort((a, b) => parseInt(a) - parseInt(b)).forEach(count => {
    console.log(`  ${count} cities: ${dist[count]} entries`);
});

// Get all entries that could use more cities
console.log("\n=== All entries needing more cities ===");
entries.forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name}:${entry.cityCount}`);
});

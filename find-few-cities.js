const fs = require("fs");

// Read namebase files
const africa = fs.readFileSync("modules/namebases-africa.js", "utf8");
const asia = fs.readFileSync("modules/namebases-asia.js", "utf8");

console.log("=== Finding Languages with Fewest Cities ===\n");

// Find entries with < 10 cities
const entriesToExpand = [];

// Search Africa
const africaLines = africa.split("\n");
for (let i = 0; i < africaLines.length; i++) {
    const line = africaLines[i];
    if (!line.includes('"name":') && !line.includes('"b":')) continue;
    
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    const bMatch = line.match(/"b":\s*"([^"]*)"/);
    
    if (nameMatch && bMatch) {
        const cities = bMatch[1].split(",").filter(c => c.trim());
        if (cities.length > 0 && cities.length < 10) {
            entriesToExpand.push({
                name: nameMatch[1],
                continent: "Africa",
                cityCount: cities.length,
                cities: cities,
                lineNum: i + 1
            });
        }
    }
}

// Sort by city count (smallest first)
entriesToExpand.sort((a, b) => a.cityCount - b.cityCount);

console.log(`Found ${entriesToExpand.length} entries with < 10 cities\n`);

// Show top candidates for expansion
console.log("=== Top 20 Candidates for City Expansion ===\n");
entriesToExpand.slice(0, 20).forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name} (${entry.continent}) - ${entry.cityCount} cities`);
    console.log(`   Current: ${entry.cities.slice(0, 5).join(", ")}${entry.cities.length > 5 ? "..." : ""}`);
    console.log();
});

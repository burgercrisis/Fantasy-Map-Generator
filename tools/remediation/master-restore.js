"use strict";
const fs = require('node:fs');
const path = require('node:path');

// Configuration
const BACKUP_FILE = 'modules/backups/namebases-real.backup-20251228-221152.js';
const MAPPING_FILE = 'tools/data/continent-file-mapping.json';
const OUTPUT_DIR = 'modules';

// Load Mapping
console.log('Loading mapping...');
const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const nameToContinent = new Map();
mappingData.entries.forEach(entry => {
    nameToContinent.set(entry.name, entry.continent);
});

// Continent variable names as expected by modules/namebases-all.js
const continentVars = {
    'africa': 'AfricaNameBases',
    'asia': 'AsiaNameBases',
    'europe': 'EuropeNameBases',
    'northAmerica': 'NorthAmericaNameBases',
    'southAmerica': 'SouthAmericaNameBases',
    'oceania': 'OceaniaNameBases',
    'unknown': 'UnknownNameBases'
};

// Initialize buckets
const buckets = {
    'africa': [],
    'asia': [],
    'europe': [],
    'northAmerica': [],
    'southAmerica': [],
    'oceania': [],
    'unknown': []
};

// Load Backup and Parse
console.log('Loading backup...');
const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');

// Regex to extract objects safely.
// We look for objects that have at least "name" and "i".
const entryRegex = /\{\s*"?name"?\s*:\s*"([^"]+)"[\s\S]*?\}\s*(?=,|\s*\])/g;

let count = 0;
let match;
while ((match = entryRegex.exec(backupContent)) !== null) {
    const rawObject = match[0];
    let name = match[1].trim(); // Trim name
    
    // Skip placeholders
    if (name === "New Place" || name.endsWith("_unq")) {
        continue;
    }

    // Determine continent
    let continent = nameToContinent.get(name) || 'unknown';
    
    // If it was trimmed, update the raw object's name field
    let finalObject = rawObject;
    if (match[1] !== name) {
        finalObject = rawObject.replace(/"name"\s*:\s*"[^"]+"/, `"name": "${name}"`);
    }
    
    // Add to bucket
    buckets[continent].push(finalObject);
    count++;
}

console.log(`Extracted ${count} valid entries from backup.`);

// Write files
for (const [continent, entries] of Object.entries(buckets)) {
    const varName = continentVars[continent];
    const fileName = `namebases-${continent}.js`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    console.log(`Writing ${fileName} (${entries.length} entries)...`);
    
    const content = `"use strict";

window.${varName} = [
${entries.join(',\n')}
];
`;
    fs.writeFileSync(filePath, content);
}

// Special case: update namebases-all.js to include UnknownNameBases if needed
// Actually, let's just make sure all continents are loaded in index.html

console.log('Restoration complete.');

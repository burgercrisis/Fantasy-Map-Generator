const fs = require('fs');

const namebasesPath = 'e:/code/Fantasy-Map-Generator/modules/namebases-real.js';
const mapPath = 'e:/code/Fantasy-Map-Generator/config/language-mixer-map.json';

// Load namebases
const namebasesContent = fs.readFileSync(namebasesPath, 'utf8');
const namebasesMatch = namebasesContent.match(/window\.realWorldNameBases\s*=\s*\[([\s\S]*?)\];/);
if (!namebasesMatch) {
    console.error('Could not find window.realWorldNameBases in namebases-real.js');
    process.exit(1);
}

// Simple parser for the namebases JS file
const namebasesStr = namebasesMatch[1];
const namebaseIds = new Set();
const idRegex = /i:\s*(\d+)/g;
let match;
while ((match = idRegex.exec(namebasesStr)) !== null) {
    namebaseIds.add(parseInt(match[1]));
}

console.log(`Loaded ${namebaseIds.size} unique namebase IDs.`);

// Load map
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const languages = Object.entries(map);

const brokenLanguages = [];

for (const [iso, config] of languages) {
    if (config.m) {
        for (const mix of config.m) {
            if (!namebaseIds.has(mix.i)) {
                brokenLanguages.push({ iso, name: config.name, missingId: mix.i });
            }
        }
    }
}

console.log(`Found ${brokenLanguages.length} broken languages.`);
if (brokenLanguages.length > 0) {
    console.log('Sample broken languages:', brokenLanguages.slice(0, 5));
    fs.writeFileSync('e:/code/Fantasy-Map-Generator/still_broken_languages.json', JSON.stringify(brokenLanguages, null, 2));
}

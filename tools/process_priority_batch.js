const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const mapPath = 'config/language-mixer-map.json';
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const isos = [
    'korafe', 'kos', 'koya', 'kpt', 'kra', 'krc', 'kum', 
    'kurambhag-paharia', 'kurichiya', 'kuril-dialects', 'kurukh', 
    'kurumba', 'kuu-rv-ludic', 'kuvi', 'kva', 'kvx', 'kwaza', 
    'kwinti', 'kwoma-manambu-pidgin', 'kxp', 'kxu', 'kyaka', 
    'kyakhta-russian-chinese-pidgin', 'kyowa-go', 'kyv'
];

let maxIndex = 0;
const indexMatches = content.match(/i: (\d+)/g);
if (indexMatches) {
    maxIndex = Math.max(...indexMatches.map(m => parseInt(m.match(/\d+/)[0])));
}

console.log(`Current MAX_INDEX: ${maxIndex}`);

let nextIndex = maxIndex + 1;
const newEntries = [];
const mapUpdates = {};

isos.forEach(iso => {
    // Check if it already has a dedicated entry
    const dedicatedPattern = new RegExp(`name: ".*${iso}.*\\(dedicated\\)"`, 'i');
    if (dedicatedPattern.test(content)) {
        console.log(`ISO ${iso} already has a dedicated entry.`);
        // Find its index
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.toLowerCase().includes(iso.toLowerCase()) && line.includes('(dedicated)') && line.includes('i:')) {
                const match = line.match(/i: (\d+)/);
                if (match) {
                    mapUpdates[iso] = parseInt(match[1]);
                    break;
                }
            }
        }
    } else {
        const index = nextIndex++;
        const name = iso.charAt(0).toUpperCase() + iso.slice(1).replace(/-/g, ' ') + " (dedicated)";
        const seeds = [];
        for (let j = 1; j <= 10; j++) {
            seeds.push(`${iso}_${index}_unq${j}`);
        }
        const entry = `    {name: "${name}", i: ${index}, min: 4, max: 11, d: "lnrt", m: 0, b: "${seeds.join(',')}"},`;
        newEntries.push(entry);
        mapUpdates[iso] = index;
        console.log(`Assigned index ${index} to ${iso}`);
    }
});

// Update namebases-real.js
if (newEntries.length > 0) {
    const lines = content.split('\n');
    const lastEntryIndex = lines.findLastIndex(line => line.trim().startsWith('{') && line.includes('i:'));
    lines.splice(lastEntryIndex + 1, 0, ...newEntries);
    fs.writeFileSync('modules/namebases-real.js', lines.join('\n'));
    console.log(`Added ${newEntries.length} new entries to namebases-real.js`);
}

// Update language-mixer-map.json
let updatedCount = 0;
mapData.forEach(entry => {
    if (mapUpdates[entry.iso]) {
        entry.bases = [mapUpdates[entry.iso]];
        updatedCount++;
    }
});
fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2));
console.log(`Updated ${updatedCount} entries in language-mixer-map.json`);

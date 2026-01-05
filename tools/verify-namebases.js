const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'modules');
const files = fs.readdirSync(modulesDir).filter(f => 
    f.startsWith('namebases-') && 
    f.endsWith('.js') && 
    !f.includes('backup') && 
    !f.includes('all') &&
    !f.includes('real')
);

const allEntries = [];
const seenIndices = new Map();
const seenNames = new Map();

function parseJSArray(content) {
    const start = content.indexOf('[');
    const end = content.lastIndexOf('];');
    if (start === -1 || end === -1) return [];
    const jsStr = content.slice(start, end + 1);
    try {
        return new Function(`return ${jsStr}`)();
    } catch (e) {
        console.error("Failed to parse array:", e);
        return [];
    }
}

files.forEach(file => {
    const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
    const entries = parseJSArray(content);
    console.log(`Checking ${file}: ${entries.length} entries`);
    
    entries.forEach(entry => {
        if (!entry || typeof entry.i !== 'number') return;
        
        if (seenIndices.has(entry.i)) {
            console.error(`Collision: Index ${entry.i} used by "${seenIndices.get(entry.i)}" and "${entry.name}" (in ${file})`);
        } else {
            seenIndices.set(entry.i, entry.name);
        }
        
        const lowerName = entry.name.toLowerCase();
        if (seenNames.has(lowerName)) {
            console.warn(`Duplicate Name: "${entry.name}" (index ${entry.i} in ${file}) already exists (index ${seenNames.get(lowerName)})`);
        } else {
            seenNames.set(lowerName, entry.i);
        }
        
        allEntries.push({ ...entry, file });
    });
});

console.log(`Total unique entries: ${allEntries.length}`);
console.log(`Max index: ${Math.max(...Array.from(seenIndices.keys()))}`);

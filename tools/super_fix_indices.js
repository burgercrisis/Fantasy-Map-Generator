const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mapPath = path.join(root, 'config', 'language-mixer-map.json');
const modulesDir = path.join(root, 'modules');
const jsFiles = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js'));

// 1. Load the map
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// 2. Identify all dedicated entries and their current indices
const dedicatedIndices = new Set();
const allBases = [];

jsFiles.forEach(file => {
    const filePath = path.join(modulesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    // Regex to match namebases entries
    const regex = /\{name:\s*\"([^\"]+)\",\s*i:\s*(\d+)[^}]+\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const fullMatch = match[0];
        const name = match[1];
        const id = parseInt(match[2], 10);
        
        const isDedicated = name.includes('(dedicated)') || 
                           name.includes('(setBases aux)') || 
                           name.includes('(aux)') || 
                           fullMatch.includes('_unq') || 
                           fullMatch.includes('_u1');
        
        if (isDedicated) {
            dedicatedIndices.add(id);
            allBases.push({
                id,
                name,
                file,
                fullMatch,
                start: match.index,
                end: regex.lastIndex
            });
        }
    }
});

console.log(`Found ${allBases.length} dedicated entries.`);

// 3. Re-index
let nextIdx = 20000;
const oldToNew = new Map();

// We need to be careful: if the same index is used by multiple dedicated entries (a collision),
// we should probably give them different new indices.
allBases.forEach(base => {
    const newIdx = nextIdx++;
    // Store all mappings if there are collisions
    if (!oldToNew.has(base.id)) {
        oldToNew.set(base.id, []);
    }
    oldToNew.get(base.id).push({ base, newIdx });
});

// 4. Update the JS files
// We'll process file by file to handle multiple updates correctly
jsFiles.forEach(file => {
    const filePath = path.join(modulesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Filter bases for this file
    const fileBases = allBases.filter(b => b.file === file);
    // Sort backwards to avoid offset issues when replacing
    fileBases.sort((a, b) => b.start - a.start);
    
    fileBases.forEach(base => {
        // Find the new index we assigned to THIS specific base object
        const mapping = oldToNew.get(base.id).find(m => m.base === base);
        const newIdx = mapping.newIdx;
        
        let newContent = base.fullMatch.replace(`i: ${base.id}`, `i: ${newIdx}`);
        // Also update placeholders in b: field if they contain the old index
        const idStr = base.id.toString();
        const newIdStr = newIdx.toString();
        
        // Replace occurrences of old index in the b: string if it's part of a placeholder
        // e.g. "tobian_7713_unq1" -> "tobian_20001_unq1"
        newContent = newContent.replace(new RegExp(`_${idStr}_`, 'g'), `_${newIdStr}_`);
        // Handle cases like "gha_pid_9800_u1" -> "gha_pid_20002_u1"
        newContent = newContent.replace(new RegExp(`_${idStr}_u`, 'g'), `_${newIdStr}_u`);

        content = content.slice(0, base.start) + newContent + content.slice(base.end);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});

// 5. Update the map
// This is tricky if there were collisions. If ISO "A" used index 5000 and ISO "B" also used 5000,
// and we split them into 20001 and 20002, which one does the map get?
// Actually, the map should probably get BOTH or we should find which one it was meant for.
// But usually the map only has ONE entry per ISO.
// Let's see... if an ISO had index 5000, we should replace it with the new index.

map.forEach(entry => {
    if (!entry.bases) return;
    entry.bases = entry.bases.map(idx => {
        if (typeof idx !== 'number') return idx;
        if (oldToNew.has(idx)) {
            // If there's a collision, we'll try to match by name or just take the first one.
            // Matching by name is better.
            const mappings = oldToNew.get(idx);
            if (mappings.length === 1) {
                return mappings[0].newIdx;
            } else {
                // Try to match ISO name with base name
                const iso = entry.iso.toLowerCase().replace(/-/g, ' ');
                const match = mappings.find(m => m.base.name.toLowerCase().includes(iso));
                if (match) return match.newIdx;
                // Fallback to first
                return mappings[0].newIdx;
            }
        }
        return idx;
    });
});

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log(`Updated language-mixer-map.json`);

const fs = require('fs');
const continents = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania', 'fantasy'];

// Load mixer map to get referenced indices
const mapContent = fs.readFileSync('config/language-mixer-map.js', 'utf8');
const mapMatch = mapContent.match(/globalThis\.\w+\s*=\s*(\[[\s\S]*?\]);/);
const map = (new Function('return ' + mapMatch[1]))();
const referenced = new Set();
for (const m of map) {
  for (const idx of m.bases) referenced.add(idx);
}

// Load all continent files
let continentData = {};
for (const c of continents) {
  const content = fs.readFileSync('modules/namebases-' + c + '.js', 'utf8');
  const match = content.match(/(window\.\w+\s*=\s*)(\[[\s\S]*?\]);/);
  if (match) {
    const prefix = match[1];
    const bases = (new Function('return ' + match[2]))().filter(x => x !== null && x !== undefined);
    continentData[c] = { prefix, bases };
  }
}

// Build name -> list of (continent, index, count) for all entries
let nameToEntries = new Map();
for (const c of continents) {
  for (const b of continentData[c].bases) {
    if (b.i !== undefined && b.b && b.b.length > 0 && b.name) {
      const key = b.name.toLowerCase().trim();
      if (!nameToEntries.has(key)) nameToEntries.set(key, []);
      nameToEntries.get(key).push({ continent: c, index: b.i, count: b.b.split(',').length, name: b.name });
    }
  }
}

// Find cross-continent duplicates
const crossContinent = [...nameToEntries.entries()].filter(([_, entries]) => {
  const continents = new Set(entries.map(e => e.continent));
  return continents.size > 1;
});

console.log('Cross-continent duplicates found:', crossContinent.length);

// Determine correct continent for each name
// Rules:
// 1. If referenced by mixer map, that continent is correct
// 2. If not referenced, use the continent with the most names (most complete data)
// 3. If tied, prefer the continent that makes linguistic sense (e.g., Swahili -> Africa)

const correctContinent = new Map(); // name -> correct continent

for (const [name, entries] of crossContinent) {
  // Check if any entry is referenced by mixer map
  const referencedEntry = entries.find(e => referenced.has(e.index));
  if (referencedEntry) {
    correctContinent.set(name, referencedEntry.continent);
    continue;
  }
  
  // Check if any entry has a known correct continent based on linguistic family
  let bestContinent = null;
  let bestCount = 0;
  
  // Use the continent with the most names
  for (const e of entries) {
    if (e.count > bestCount) {
      bestCount = e.count;
      bestContinent = e.continent;
    }
  }
  
  correctContinent.set(name, bestContinent);
}

// Remove entries from wrong continents
let totalRemoved = 0;
for (const [name, entries] of crossContinent) {
  const correct = correctContinent.get(name);
  
  // Group by continent
  const byContinent = new Map();
  for (const e of entries) {
    if (!byContinent.has(e.continent)) byContinent.set(e.continent, []);
    byContinent.get(e.continent).push(e);
  }
  
  // Remove entries from wrong continents
  for (const [c, cEntries] of byContinent) {
    if (c !== correct) {
      for (const e of cEntries) {
        // Only remove if not referenced by mixer map
        if (!referenced.has(e.index)) {
          continentData[c].bases = continentData[c].bases.filter(b => b.i !== e.index);
          totalRemoved++;
        }
      }
    }
  }
}

console.log('Total removed:', totalRemoved);

// Write back
for (const c of continents) {
  const prefix = continentData[c].prefix;
  const arrayStr = JSON.stringify(continentData[c].bases, null, 2);
  const content = prefix + arrayStr + ';';
  fs.writeFileSync('modules/namebases-' + c + '.js', content);
  fs.writeFileSync('public/modules/namebases-' + c + '.js', content);
}

// Verify
let validIndices = new Set();
for (const c of continents) {
  for (const b of continentData[c].bases) {
    if (b.i !== undefined && b.b && b.b.length > 0) {
      validIndices.add(b.i);
    }
  }
}

let noData = 0;
for (const m of map) {
  if (!m.bases.some(idx => validIndices.has(idx))) {
    noData++;
    console.log('NO DATA: ' + m.iso + ' -> ' + JSON.stringify(m.bases));
  }
}

const idxToIsos = new Map();
for (const m of map) {
  for (const idx of m.bases) {
    if (!idxToIsos.has(idx)) idxToIsos.set(idx, []);
    idxToIsos.get(idx).push(m.iso);
  }
}
const shared = [...idxToIsos.entries()].filter(([_, isos]) => isos.length > 1);

console.log('Valid indices:', validIndices.size);
console.log('ISOs with no data:', noData);
console.log('Unique indices used:', idxToIsos.size);
console.log('Perfect 1:1:', map.length === idxToIsos.size ? 'YES' : 'NO');
console.log('Shared bases:', shared.length);
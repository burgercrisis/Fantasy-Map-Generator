// Careful migration script - moves entries one continent at a time
const fs = require('fs');
const path = require('path');

const MODULES_DIR = 'E:/code/Fantasy-Map-Generator/modules';
const dedicatedPath = path.join(MODULES_DIR, 'namebases-dedicated.js');
const dedicatedContent = fs.readFileSync(dedicatedPath, 'utf-8');

// Parse the dedicated file
function parseEntries(content) {
    const lines = content.split('\n');
    const entries = [];
    let currentEntry = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('"name":')) {
            if (currentEntry.name) entries.push({...currentEntry});
            currentEntry = {};
            currentEntry.name = line.match(/"name":\s*"([^"]+)"/)[1];
        }
        if (line.startsWith('"i":')) currentEntry.index = parseInt(line.match(/"i":\s*(\d+)/)[1]);
        if (line.startsWith('"min":')) currentEntry.min = parseInt(line.match(/"min":\s*(\d+)/)[1]);
        if (line.startsWith('"max":')) currentEntry.max = parseInt(line.match(/"max":\s*(\d+)/)[1]);
        if (line.startsWith('"d":')) currentEntry.d = line.match(/"d":\s*"([^"]*)"/)[1];
        if (line.startsWith('"m":')) currentEntry.m = parseFloat(line.match(/"m":\s*([0-9.]+)/)[1]);
        if (line.startsWith('"b":')) currentEntry.b = line.match(/"b":\s*"([^"]*)"/)[1];
        if (line === '}') {
            if (currentEntry.name) entries.push({...currentEntry});
        }
    }
    if (currentEntry.name) entries.push({...currentEntry});
    return entries;
}

// Parse existing continent files
function parseContinentFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const indices = new Set();
    const names = new Set();
    const nameMatches = [...content.matchAll(/"name":\s*"([^"]+)"/g)];
    for (const m of nameMatches) names.add(m[1]);
    const indexMatches = [...content.matchAll(/"i":\s*(\d+)/g)];
    for (const m of indexMatches) indices.add(parseInt(m[1]));
    return { indices, names, maxIndex: Math.max(...indices), content };
}

// Classify entries by continent based on index ranges and content
function classifyEntry(entry) {
    const idx = entry.index;
    const name = entry.name.toLowerCase();
    const b = (entry.b || '').toLowerCase();

    // South American (indices 201290-201340)
    if (idx >= 201290 && idx <= 201340) {
        const saNames = ['andoke', 'arhuaco', 'ayoreo', 'cofan', 'cofán', 'cogui', 'fulnio', 'fulniô',
            'guajajara', 'itonama', 'kaapor', 'karu', 'kayapo', 'kulina', 'kwaza', 'kwinti',
            'leco', 'matawai', 'munduruku', 'ndyuka', 'nheengatu', 'nivacle', 'paez', 'páez',
            'piraha', 'pirahã', 'sanoma', 'sanumá', 'saramaccan', 'shipibo', 'shuar', 'siriono',
            'quechua', 'tupi', 'warao', 'warazu', 'xoco', 'xocó', 'yaminawa', 'bozal',
            'palenquero', 'argentinian', 'mawé', 'maco', 'piyo', 'ono', 'ito'];
        for (const n of saNames) if (name.includes(n)) return 'southAmerica';
    }

    // North American (Caribbean creoles - indices 201358-201367)
    if (idx >= 201358 && idx <= 201367) {
        if (name.includes('creole') || name.includes('saint') || name.includes('santiago') ||
            name.includes('santo') || name.includes('são') || name.includes('dominican') ||
            name.includes('grenadian') || name.includes('louisiana') || name.includes('karip')) {
            return 'northAmerica';
        }
    }

    // Oceanian (indices 200900-201130)
    if (idx >= 200900 && idx <= 201130) {
        // Check if it's actually Asian
        const asianKeywords = ['taiwan', 'china', 'japan', 'korea', 'thailand', 'vietnam',
            'philippine', 'indonesia', 'malaysia', 'india', 'burma', 'myanmar',
            'cambodia', 'laos', 'mongolia', 'kazakhstan', 'uzbekistan', 'kyrgyzstan',
            'tajikistan', 'turkmenistan', 'afghanistan', 'iran', 'iraq', 'syria',
            'lebanon', 'jordan', 'israel', 'saudi', 'yemen', 'oman', 'uae', 'qatar',
            'bahrain', 'kuwait', 'turkey', 'cyprus', 'georgia', 'armenia', 'azerbaijan',
            'pakistan', 'bangladesh', 'nepal', 'bhutan', 'sri lanka', 'maldives',
            'siberia', 'yakut', 'buryat', 'tuvan', 'khakas', 'altai', 'tatar',
            'bashkir', 'chuvash', 'mordvin', 'mari', 'udmurt', 'kom', 'yakut'];
        for (const kw of asianKeywords) if (b.includes(kw)) return 'asia';

        const asianNameKeywords = ['bunun', 'rukai', 'amis', 'atayal', 'paiwan', 'tsou',
            'seediq', 'thao', 'saaroa', 'kanakanavu', 'saisiyat', 'yami', 'puyuma',
            'kavalan', 'amis', 'sakizaya', 'sakizaya', 'seedeq', 'kavalan'];
        for (const n of asianNameKeywords) if (name.includes(n)) return 'asia';

        return 'oceania';
    }

    // African (indices 200000-200900)
    if (idx >= 200000 && idx <= 200900) {
        const asianNameKeywords = ['bunun', 'rukai', 'amis', 'atayal', 'paiwan', 'tsou',
            'seediq', 'thao', 'saaroa', 'kanakanavu', 'saisiyat', 'yami', 'puyuma',
            'kavalan', 'kaxabu', 'truku', 'sakizaya', 'seedeq', 'pazeh', 'papora',
            'hoanya', 'taokas', 'babuza', 'favorlang', 'babuzan', 'babuza'];
        for (const n of asianNameKeywords) if (name.includes(n)) return 'asia';

        return 'africa';
    }

    // Asian (indices 201130-201290 and 201340+)
    if (idx >= 201130 && idx <= 201290) return 'asia';
    if (idx >= 201340) return 'asia';

    return 'asia';
}

// Main
const entries = parseEntries(dedicatedContent);
console.log('Total entries in dedicated: ' + entries.length);

const continentFiles = {
    africa: { path: 'namebases-africa.js', varName: 'africaNameBases' },
    asia: { path: 'namebases-asia.js', varName: 'asiaNameBases' },
    europe: { path: 'namebases-europe.js', varName: 'europeNameBases' },
    northAmerica: { path: 'namebases-northAmerica.js', varName: 'northAmericaNameBases' },
    southAmerica: { path: 'namebases-southAmerica.js', varName: 'southAmericaNameBases' },
    oceania: { path: 'namebases-oceania.js', varName: 'oceaniaNameBases' }
};

// Parse all continent files
const continentData = {};
for (const [continent, info] of Object.entries(continentFiles)) {
    const data = parseContinentFile(path.join(MODULES_DIR, info.path));
    continentData[continent] = data;
    console.log(continent + ': ' + data.names.size + ' existing names, max index=' + data.maxIndex);
}

// Categorize dedicated entries
const categorized = {
    africa: [],
    asia: [],
    europe: [],
    northAmerica: [],
    southAmerica: [],
    oceania: []
};

for (const entry of entries) {
    const continent = classifyEntry(entry);
    categorized[continent].push(entry);
}

console.log('\nCategorization of dedicated entries:');
for (const [continent, items] of Object.entries(categorized)) {
    console.log('  ' + continent + ': ' + items.length);
}

// Check for duplicates and prepare new entries
const toAdd = {};
const toRemove = [];
for (const [continent, items] of Object.entries(categorized)) {
    toAdd[continent] = [];
    const existingNames = continentData[continent].names;
    for (const item of items) {
        if (existingNames.has(item.name)) {
            toRemove.push(item.name);
        } else {
            toAdd[continent].push(item);
            toRemove.push(item.name);
        }
    }
}

console.log('\nEntries to add per continent:');
for (const [continent, items] of Object.entries(toAdd)) {
    console.log('  ' + continent + ': ' + items.length + ' new entries');
}
console.log('Total entries to remove from dedicated: ' + toRemove.length);

// Assign new indices
for (const [continent, items] of Object.entries(toAdd)) {
    let nextIndex = continentData[continent].maxIndex + 1000;
    for (const item of items) {
        item.newIndex = nextIndex;
        nextIndex++;
    }
}

// Add entries to continent files
for (const [continent, items] of Object.entries(toAdd)) {
    if (items.length === 0) continue;
    const info = continentFiles[continent];
    const filePath = path.join(MODULES_DIR, info.path);
    let content = continentData[continent].content;

    // Build new entries
    let newEntriesText = '';
    for (const item of items) {
        const entryObj = {
            name: item.name,
            i: item.newIndex,
            min: item.min,
            max: item.max,
            d: item.d,
            m: item.m,
            b: item.b,
            status: "COMPLETE"
        };
        const entryJson = JSON.stringify(entryObj, null, 2)
            .replace(/\n/g, '\n  ')
            .replace('"status": "COMPLETE"', '"status": "COMPLETE"');
        newEntriesText += '  ' + entryJson + ',\n';
    }

    // Find the last ];
    const lastBracket = content.lastIndexOf('];');
    if (lastBracket === -1) {
        console.log('ERROR: could not find ]; in ' + info.path);
        continue;
    }

    // Check if last entry before ]; ends with }
    const beforeBracket = content.substring(0, lastBracket);
    if (beforeBracket.trimEnd().endsWith('}')) {
        // Need to add comma after last entry
        const lastBrace = beforeBracket.lastIndexOf('}');
        content = content.substring(0, lastBrace + 1) + ',\n' + newEntriesText + content.substring(lastBrace + 1);
    } else {
        content = content.substring(0, lastBracket) + newEntriesText + content.substring(lastBracket);
    }

    fs.writeFileSync(filePath, content);
    console.log('  Wrote ' + items.length + ' entries to ' + info.path);
}

// Remove entries from dedicated file
let newDedicatedContent = dedicatedContent;
for (const name of toRemove) {
    // Escape special regex characters in the name
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the entire entry block including the closing }
    const regex = new RegExp('\\s*\\{\\s*"name":\\s*"' + escaped + '"[\\s\\S]*?\\},?\\s*(?=\\{|"use strict"|\\n\\])', 'g');
    const before = newDedicatedContent;
    newDedicatedContent = newDedicatedContent.replace(regex, '\n  ');
    if (newDedicatedContent === before) {
        // Try simpler pattern
        const regex2 = new RegExp('\\s*\\{\\s*"name":\\s*"' + escaped + '"[\\s\\S]*?\\n\\s*\\}', 'g');
        newDedicatedContent = newDedicatedContent.replace(regex2, '');
    }
}

// Clean up multiple blank lines
newDedicatedContent = newDedicatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(dedicatedPath, newDedicatedContent);
console.log('Removed entries from dedicated file');

// Count remaining entries in dedicated
const remainingEntries = parseEntries(newDedicatedContent);
console.log('Remaining entries in dedicated: ' + remainingEntries.length);

// Run guardrails
console.log('\nRunning guardrails...');
const { execSync } = require('child_process');
try {
    const result = execSync('pnpm run mixer:guardrails 2>&1', { cwd: 'E:/code/Fantasy-Map-Generator', encoding: 'utf-8' });
    console.log(result);
} catch (e) {
    console.log('Output: ' + (e.stdout || ''));
    console.log('Error: ' + (e.stderr || ''));
}

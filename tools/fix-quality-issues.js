"use strict";

/**
 * Quality Fix Script - Properly moves languages to correct continent files
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');

// These languages are in the WRONG file (Africa) and need to be moved
const MOVES = [
    // Move to ASIA
    { from: 'africa', to: 'asia', i: 91, name: 'Mandarin Global' },
    { from: 'africa', to: 'asia', i: 98, name: 'Sarawakian Malay' },
    { from: 'africa', to: 'asia', i: 100, name: 'Sabah Malay' },
    { from: 'africa', to: 'asia', i: 107, name: 'Makassar Malay' },
    { from: 'africa', to: 'asia', i: 110, name: 'Maumere Malay' },
    { from: 'africa', to: 'asia', i: 111, name: 'North Moluccan Malay' },
    { from: 'africa', to: 'asia', i: 152, name: 'Sabahan' },
    { from: 'africa', to: 'asia', i: 155, name: 'Makassar Branch' },
    { from: 'africa', to: 'asia', i: 171, name: 'Malaysian Mandarin' },
    { from: 'africa', to: 'asia', i: 175, name: 'Singaporean Mandarin' },
    { from: 'africa', to: 'asia', i: 1226, name: 'Beijing Mandarin' },
    { from: 'africa', to: 'asia', i: 1602, name: 'Chongqing Mandarin' },
    
    // Move to EUROPE
    { from: 'africa', to: 'europe', i: 339, name: 'Molisan' },
    { from: 'africa', to: 'europe', i: 359, name: 'Moselle Romance' },
    { from: 'africa', to: 'europe', i: 380, name: 'Benasquese' },
    { from: 'africa', to: 'europe', i: 455, name: 'Judeo-Aragonese' },
    { from: 'africa', to: 'europe', i: 456, name: 'Judeo-Catalan' },
    { from: 'africa', to: 'europe', i: 457, name: 'Judeo-Gascon' },
    { from: 'africa', to: 'europe', i: 458, name: 'Judeo-Italian' },
    { from: 'africa', to: 'europe', i: 459, name: 'Judeo-Mantuan' },
    { from: 'africa', to: 'europe', i: 460, name: 'Judeo-Piedmontese' },
    { from: 'africa', to: 'europe', i: 461, name: 'Judeo-Portuguese' },
    { from: 'africa', to: 'europe', i: 462, name: 'Judeo-Provençal' },
    { from: 'africa', to: 'europe', i: 463, name: 'Judeo-Spanish' },
    { from: 'africa', to: 'europe', i: 493, name: 'Moldavian' },
    { from: 'africa', to: 'europe', i: 495, name: 'Mozarabic' },
    
    // Move to SOUTH AMERICA
    { from: 'africa', to: 'southAmerica', i: 778, name: 'Movima' },
];

function extractEntry(filepath, targetI, targetName) {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Find the entry by searching for name pattern with the exact index
    // The format is:
    //   {
    //     "name": "Makassar Malay",
    //     "i": 107,
    //     ...
    //     "b": "..."
    //   },
    
    // First find the line with the name
    const nameLineIndex = content.indexOf(`"name": "${targetName}"`);
    if (nameLineIndex === -1) {
        return null;
    }
    
    // Find the start of this entry block (look backwards for the opening brace)
    let blockStart = content.lastIndexOf('\n  {\n', nameLineIndex);
    if (blockStart === -1) {
        blockStart = content.lastIndexOf('\n{', nameLineIndex);
        if (blockStart === -1) {
            // Maybe it's the first entry
            blockStart = content.indexOf('{');
        }
    } else {
        blockStart += 1; // Skip the newline
    }
    
    // Find the end of the entry (the closing } followed by comma and newline)
    const nextComma = content.indexOf('},\n', nameLineIndex);
    const nextEntry = content.indexOf('\n  {\n', nameLineIndex);
    
    let blockEnd;
    if (nextComma !== -1 && (nextEntry === -1 || nextComma < nextEntry)) {
        blockEnd = nextComma + 3; // Include the comma and newline
    } else if (nextEntry !== -1) {
        blockEnd = nextEntry;
    } else {
        // Last entry in file
        blockEnd = content.lastIndexOf('}\n');
        if (blockEnd !== -1) blockEnd += 2;
    }
    
    if (blockEnd === -1 || blockEnd <= blockStart) {
        return null;
    }
    
    const entryBlock = content.substring(blockStart, blockEnd);
    
    // Verify the index matches
    const iMatch = entryBlock.match(/"i":\s*(\d+)/);
    if (!iMatch || parseInt(iMatch[1], 10) !== targetI) {
        return null;
    }
    
    // Parse the entry
    const nameMatch = entryBlock.match(/"name":\s*"([^"]+)"/);
    const minMatch = entryBlock.match(/"min":\s*(\d+)/);
    const maxMatch = entryBlock.match(/"max":\s*(\d+)/);
    const dMatch = entryBlock.match(/"d":\s*"([^"]*)"/);
    const mMatch = entryBlock.match(/"m":\s*([\d.]+)/);
    const bMatch = entryBlock.match(/"b":\s*"([^"]*)"/);
    
    const entry = {
        name: nameMatch[1],
        i: targetI,
        min: minMatch ? parseInt(minMatch[1], 10) : 5,
        max: maxMatch ? parseInt(maxMatch[1], 10) : 12,
        d: dMatch ? dMatch[1] : '',
        m: mMatch ? mMatch[1] : '0',
        b: bMatch ? bMatch[1] : ''
    };
    
    // Remove from source
    const newContent = content.substring(0, blockStart) + content.substring(blockEnd);
    fs.writeFileSync(filepath, newContent, 'utf8');
    
    return entry;
}

function addEntry(filepath, entry) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Clean up
    content = content.replace(/module\.exports.*$/, '');
    content = content.replace(/\]\s*;?\s*$/, '');
    content = content.replace(/,\s*$/, '');
    
    const newEntry = `  {
    "name": "${entry.name}",
    "i": ${entry.i},
    "min": ${entry.min},
    "max": ${entry.max},
    "d": "${entry.d}",
    "m": ${entry.m},
    "b": "${entry.b}"
  }`;
    
    // Add comma to last entry if exists
    if (content.trim().endsWith('}')) {
        content += ',\n';
    } else {
        content += '\n';
    }
    
    content += newEntry + '\n];\n\nmodule.exports = window.' + path.basename(filepath).replace('.js', '') + ';';
    
    fs.writeFileSync(filepath, content, 'utf8');
}

function main() {
    console.log('=== Quality Fix Script ===\n');
    console.log('Moving languages to correct continent files...\n');
    
    let success = 0;
    let failed = 0;
    
    for (const move of MOVES) {
        const fromFile = path.join(MODULES_DIR, 'namebases-' + move.from + '.js');
        const toFile = path.join(MODULES_DIR, 'namebases-' + move.to + '.js');
        
        console.log(`Moving ${move.name} (i:${move.i}): ${move.from} -> ${move.to}`);
        
        const entry = extractEntry(fromFile, move.i, move.name);
        
        if (entry) {
            addEntry(toFile, entry);
            console.log(`  ✅ Success`);
            success++;
        } else {
            console.log(`  ⚠️  Entry not found`);
            failed++;
        }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
}

if (require.main === module) {
    main();
}

module.exports = { MOVES };

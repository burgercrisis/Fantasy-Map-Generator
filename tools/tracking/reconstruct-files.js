"use strict";

/**
 * File Reconstruction Script
 * Uses robust regex parsing to extract entries from corrupted namebase files
 * and reconstruct clean JSON files.
 */

const fs = require('fs');
const path = require('path');

function parseNamebaseFile(content) {
    const entries = [];
    
    // Remove the window assignment line if present
    const cleanContent = content
        .replace(/^window\.\w+NameBases\s*=\s*/, '')
        .replace(/^module\.exports\s*=\s*window\.\w+NameBases;?\s*$/, '')
        .replace(/^\[/, '')
        .replace(/\]\s*;?\s*$/, '');
    
    // Match: "name": "...", "i": N pattern
    const namePattern = /"name":\s*"([^"]+)",\s*"i":\s*(\d+)/g;
    
    let match;
    while ((match = namePattern.exec(cleanContent)) !== null) {
        const startPos = match.index;
        const name = match[1];
        const i = parseInt(match[2], 10);
        
        // Find the end of this entry block
        let endPos = cleanContent.indexOf('},', startPos);
        if (endPos === -1) endPos = cleanContent.indexOf('}\n', startPos);
        if (endPos === -1) endPos = cleanContent.indexOf('}', startPos);
        if (endPos === -1) endPos = cleanContent.length - 1;
        
        const entryBlock = cleanContent.substring(startPos, endPos + 2);
        
        // Extract all fields
        const dMatch = entryBlock.match(/"d":\s*"([^"]*)"/);
        const bMatch = entryBlock.match(/"b":\s*"([^"]*)"/);
        const mMatch = entryBlock.match(/"m":\s*([0-9.]+)/);
        const minMatch = entryBlock.match(/"min":\s*(\d+)/);
        const maxMatch = entryBlock.match(/"max":\s*(\d+)/);
        
        entries.push({
            name: name,
            i: i,
            min: minMatch ? parseInt(minMatch[1], 10) : 4,
            max: maxMatch ? parseInt(maxMatch[1], 10) : 11,
            d: dMatch ? dMatch[1] : '',
            m: mMatch ? parseFloat(mMatch[1]) : 0,
            b: bMatch ? bMatch[1] : ''
        });
    }
    
    return entries;
}

// Process each continental file
const files = [
    'namebases-africa.js',
    'namebases-asia.js',
    'namebases-europe.js',
    'namebases-northAmerica.js',
    'namebases-southAmerica.js',
    'namebases-oceania.js',
    'namebases-unknown.js'
];

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');

files.forEach(filename => {
    const filepath = path.join(MODULES_DIR, filename);
    console.log(`\n=== Processing ${filename} ===`);
    
    if (!fs.existsSync(filepath)) {
        console.log(`  File not found: ${filepath}`);
        return;
    }
    
    const content = fs.readFileSync(filepath, 'utf8');
    const entries = parseNamebaseFile(content);
    
    console.log(`  Extracted ${entries.length} entries`);
    
    // Check for corrupt entries (missing 'b' field or suspicious patterns)
    const corrupt = entries.filter(e => !e.b || e.b.includes('_unq') || e.b.length < 10);
    console.log(`  Entries with issues: ${corrupt.length}`);
    
    if (corrupt.length > 0 && corrupt.length < 10) {
        console.log(`  Problematic entries:`);
        corrupt.forEach(e => console.log(`    - ${e.name} (i:${e.i}): "${e.b?.substring(0, 40)}..."`));
    }
    
    // Write reconstructed file
    const output = '[\n' + entries.map(e => {
        return `{\n    "name": "${e.name}",\n    "i": ${e.i},\n    "min": ${e.min},\n    "max": ${e.max},\n    "d": "${e.d}",\n    "m": ${e.m},\n    "b": "${e.b}"\n  }`;
    }).join(',\n') + '\n]';
    
    fs.writeFileSync(filepath.replace('.js', '.reconstructed.js'), output);
    console.log(`  Reconstructed file written to ${filename.replace('.js', '.reconstructed.js')}`);
});

console.log('\nDone!');

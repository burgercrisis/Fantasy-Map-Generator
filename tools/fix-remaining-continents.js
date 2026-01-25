"use strict";

/**
 * Fix remaining continent assignment issues
 * Moves misplaced languages from Africa to correct continent files
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');

// Languages to move from Africa to correct continents
const MOVES = [
    // Move to EUROPE (fix encoding issues)
    {
        from: 'africa', 
        to: 'europe', 
        oldName: 'Judeo-ProvenÃ§al',
        newName: 'Judeo-Provençal',
        i: 462
    },
    {
        from: 'africa', 
        to: 'europe', 
        oldName: 'MonÃ©gasque',
        newName: 'Monégasque',
        i: 494
    },
    // Move to ASIA (Mandarin dialects with trailing spaces)
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Central Plains Mandarin ',
        newName: 'Central Plains Mandarin',
        i: 829
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Lan-Yin Mandarin ',
        newName: 'Lan-Yin Mandarin',
        i: 830
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Northeastern Mandarin ',
        newName: 'Northeastern Mandarin',
        i: 831
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Southwestern Mandarin ',
        newName: 'Southwestern Mandarin',
        i: 832
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Lower Yangtze Mandarin ',
        newName: 'Lower Yangtze Mandarin',
        i: 833
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Beijing Mandarin ',
        newName: 'Beijing Mandarin',
        i: 1226
    },
    {
        from: 'africa', 
        to: 'asia', 
        oldName: 'Chongqing Mandarin ',
        newName: 'Chongqing Mandarin',
        i: 1602
    },
    // Move to SOUTH AMERICA
    {
        from: 'africa', 
        to: 'southAmerica', 
        oldName: 'Movima ',
        newName: 'Movima',
        i: 778
    }
];

function extractEntry(filepath, targetOldName, targetI) {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Find the entry by searching for the exact old name
    const nameLineIndex = content.indexOf(`"name": "${targetOldName}"`);
    if (nameLineIndex === -1) {
        console.log(`  ⚠️  Entry not found: ${targetOldName}`);
        return null;
    }
    
    // Verify the index matches
    const iLineStart = content.lastIndexOf('"i":', nameLineIndex);
    if (iLineStart === -1) {
        console.log(`  ⚠️  Could not find index for: ${targetOldName}`);
        return null;
    }
    
    const iMatch = content.substring(iLineStart, iLineStart + 20).match(/(\d+)/);
    if (!iMatch || parseInt(iMatch[1], 10) !== targetI) {
        console.log(`  ⚠️  Index mismatch for: ${targetOldName} (expected ${targetI})`);
        return null;
    }
    
    // Find the start of this entry block
    let blockStart = content.lastIndexOf('\n  {\n', nameLineIndex);
    if (blockStart === -1) {
        blockStart = content.lastIndexOf('\n{', nameLineIndex);
        if (blockStart === -1) {
            blockStart = content.indexOf('{');
        }
    } else {
        blockStart += 1;
    }
    
    // Find the end of the entry
    const nextComma = content.indexOf('},\n', nameLineIndex);
    const nextEntry = content.indexOf('\n  {\n', nameLineIndex);
    
    let blockEnd;
    if (nextComma !== -1 && (nextEntry === -1 || nextComma < nextEntry)) {
        blockEnd = nextComma + 3;
    } else if (nextEntry !== -1) {
        blockEnd = nextEntry;
    } else {
        blockEnd = content.lastIndexOf('}\n');
        if (blockEnd !== -1) blockEnd += 2;
    }
    
    if (blockEnd === -1 || blockEnd <= blockStart) {
        console.log(`  ⚠️  Could not determine block boundaries for: ${targetOldName}`);
        return null;
    }
    
    let entryBlock = content.substring(blockStart, blockEnd);
    
    // Replace the old name with the new name
    entryBlock = entryBlock.replace(`"name": "${targetOldName}"`, `"name": "${targetOldName}"`);
    entryBlock = entryBlock.replace(targetOldName, "PLACEHOLDER_NAME");
    entryBlock = entryBlock.replace("PLACEHOLDER_NAME", `"name": "${targetOldName}"`);
    entryBlock = entryBlock.replace(`"name": "${targetOldName}"`, `"name": ""`);
    entryBlock = entryBlock.replace('"name": ""', `"name": "${targetOldName}"`);
    entryBlock = entryBlock.replace(targetOldName, "TEMP");
    entryBlock = entryBlock.replace("TEMP", targetOldName);
    entryBlock = entryBlock.replace(targetOldName, "FINAL");
    entryBlock = entryBlock.replace("FINAL", targetOldName);
    
    // Actually, just do a simple replacement
    const simpleBlock = content.substring(blockStart, blockEnd);
    const correctedBlock = simpleBlock.replace(`"name": "${targetOldName}"`, `"name": ""`);
    
    return { block: correctedBlock, start: blockStart, end: blockEnd, original: simpleBlock };
}

function addEntry(filepath, entryBlock, newName) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Clean up the content
    content = content.replace(/module\.exports.*$/, '');
    content = content.replace(/\]\s*;?\s*$/, '');
    content = content.replace(/,\s*$/, '');
    
    // Fix the name in the entry block - simple direct replacement
    let fixedBlock = entryBlock;
    const nameMatch = entryBlock.match(/"name":\s*"([^"]*)"/);
    if (nameMatch && nameMatch[1] === '') {
        fixedBlock = entryBlock.replace('"name": ""', `"name": "${newName}"`);
    } else {
        // The replacement didn't work, try a different approach
        const lines = entryBlock.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('"name":')) {
                lines[i] = `    "name": "${newName}",`;
                break;
            }
        }
        fixedBlock = lines.join('\n');
    }
    
    // Add comma to last entry if exists
    if (content.trim().endsWith('}')) {
        content += ',\n';
    } else {
        content += '\n';
    }
    
    content += '  ' + fixedBlock.trim() + '\n];\n\nmodule.exports = window.' + path.basename(filepath).replace('.js', '') + ';';
    
    fs.writeFileSync(filepath, content, 'utf8');
}

function main() {
    console.log('=== Fixing Remaining Continent Assignments ===\n');
    
    let success = 0;
    let failed = 0;
    
    for (const move of MOVES) {
        console.log(`Moving ${move.newName} (i:${move.i}): ${move.from} -> ${move.to}`);
        
        const fromFile = path.join(MODULES_DIR, 'namebases-' + move.from + '.js');
        const toFile = path.join(MODULES_DIR, 'namebases-' + move.to + '.js');
        
        // Extract from source
        const result = extractEntry(fromFile, move.oldName, move.i);
        
        if (result) {
            // Remove from source
            let content = fs.readFileSync(fromFile, 'utf8');
            content = content.substring(0, result.start) + content.substring(result.end);
            fs.writeFileSync(fromFile, content, 'utf8');
            
            // Add to destination
            addEntry(toFile, result.block, move.newName);
            
            console.log(`  ✅ Success`);
            success++;
        } else {
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

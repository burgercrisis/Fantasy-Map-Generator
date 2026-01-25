"use strict";

/**
 * CSV-Guided Quality Improvement Script
 * Uses consolidated-quality-metrics.csv to systematically improve language quality
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');
const CSV_PATH = path.resolve(__dirname, '..', 'docs', 'reports', 'consolidated-quality-metrics.csv');

function parseCSV() {
    const content = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index]?.trim() || '';
        });
        
        // Convert string booleans
        entry.has_trailing_space = entry.has_trailing_space === 'TRUE';
        entry.has_encoding_issue = entry.has_encoding_issue === 'TRUE';
        entry.is_placeholder = entry.is_placeholder === 'TRUE';
        entry.suspicious_name = entry.suspicious_name === 'TRUE';
        entry.duplicate_cities = entry.duplicate_cities === 'TRUE';
        
        // Convert numeric fields
        entry.index = parseInt(entry.index);
        entry.city_count = parseInt(entry.city_count);
        entry.quality_score = parseInt(entry.quality_score);
        
        return entry;
    });
}

function fixTrailingSpaces(entry) {
    if (!entry.has_trailing_space) return null;
    
    const sourceFile = path.join(MODULES_DIR, entry.source_file);
    const content = fs.readFileSync(sourceFile, 'utf8');
    
    // Find the entry by index
    const nameLineIndex = content.indexOf(`"i": ${entry.index},`);
    if (nameLineIndex === -1) {
        console.log(`  ⚠️  Entry not found: ${entry.language_name} (i:${entry.index})`);
        return null;
    }
    
    // Find the name line
    const nameLineStart = content.lastIndexOf('"name":', nameLineIndex);
    if (nameLineStart === -1) {
        console.log(`  ⚠️  Name line not found: ${entry.language_name}`);
        return null;
    }
    
    const nameLineEnd = content.indexOf('\n', nameLineStart);
    const nameLine = content.substring(nameLineStart, nameLineEnd);
    
    // Check for trailing space in name
    const nameMatch = nameLine.match(/"name":\s*"([^"]+)"/);
    if (!nameMatch) {
        console.log(`  ⚠️  Could not parse name: ${entry.language_name}`);
        return null;
    }
    
    const originalName = nameMatch[1];
    if (!originalName.endsWith(' ')) {
        console.log(`  ℹ️  No trailing space in name: ${entry.language_name}`);
        return null;
    }
    
    const fixedName = originalName.trim();
    
    // Replace the name line
    const newContent = content.replace(nameLine, nameLine.replace(originalName, fixedName));
    
    fs.writeFileSync(sourceFile, newContent, 'utf8');
    
    return {
        language: entry.language_name,
        index: entry.index,
        originalName: originalName,
        fixedName: fixedName,
        file: entry.source_file
    };
}

function fixEncodingIssues(entry) {
    if (!entry.has_encoding_issue) return null;
    
    const sourceFile = path.join(MODULES_DIR, entry.source_file);
    const content = fs.readFileSync(sourceFile, 'utf8');
    
    // Find the entry by index
    const nameLineIndex = content.indexOf(`"i": ${entry.index},`);
    if (nameLineIndex === -1) {
        console.log(`  ⚠️  Entry not found: ${entry.language_name} (i:${entry.index})`);
        return null;
    }
    
    // Find the name line
    const nameLineStart = content.lastIndexOf('"name":', nameLineIndex);
    if (nameLineStart === -1) {
        console.log(`  ⚠️  Name line not found: ${entry.language_name}`);
        return null;
    }
    
    const nameLineEnd = content.indexOf('\n', nameLineStart);
    const nameLine = content.substring(nameLineStart, nameLineEnd);
    
    // Fix common encoding issues
    let fixedName = entry.language_name;
    let fixed = false;
    
    // Fix Judeo-Provençal encoding
    if (fixedName.includes('ProvenÃ§al')) {
        fixedName = fixedName.replace('ProvenÃ§al', 'Provençal');
        fixed = true;
    }
    
    // Fix Monégasque encoding
    if (fixedName.includes('MonÃ©gasque')) {
        fixedName = fixedName.replace('MonÃ©gasque', 'Monégasque');
        fixed = true;
    }
    
    if (!fixed) {
        console.log(`  ℹ️  No encoding fix needed: ${entry.language_name}`);
        return null;
    }
    
    // Replace the name line
    const newContent = content.replace(nameLine, nameLine.replace(entry.language_name, fixedName));
    
    fs.writeFileSync(sourceFile, newContent, 'utf8');
    
    return {
        language: entry.language_name,
        index: entry.index,
        originalName: entry.language_name,
        fixedName: fixedName,
        file: entry.source_file
    };
}

function main() {
    console.log('=== CSV-Guided Quality Improvement ===\n');
    
    const entries = parseCSV();
    
    // Priority 1: Fix trailing spaces (quality score 90)
    console.log('🔧 Priority 1: Fixing trailing spaces (quality score 90)\n');
    const trailingSpaceEntries = entries.filter(e => e.has_trailing_space && e.quality_score === 90);
    console.log(`Found ${trailingSpaceEntries.length} entries with trailing spaces\n`);
    
    let trailingSpaceFixed = 0;
    for (const entry of trailingSpaceEntries.slice(0, 10)) { // Process first 10
        console.log(`Fixing trailing space: ${entry.language_name} (i:${entry.index})`);
        const result = fixTrailingSpaces(entry);
        if (result) {
            trailingSpaceFixed++;
            console.log(`  ✅ Fixed: "${result.originalName}" → "${result.fixedName}"`);
        }
    }
    
    // Priority 2: Fix encoding issues
    console.log('\n🔧 Priority 2: Fixing encoding issues\n');
    const encodingEntries = entries.filter(e => e.has_encoding_issue);
    console.log(`Found ${encodingEntries.length} entries with encoding issues\n`);
    
    let encodingFixed = 0;
    for (const entry of encodingEntries) {
        console.log(`Fixing encoding: ${entry.language_name} (i:${entry.index})`);
        const result = fixEncodingIssues(entry);
        if (result) {
            encodingFixed++;
            console.log(`  ✅ Fixed: "${result.originalName}" → "${result.fixedName}"`);
        }
    }
    
    // Priority 3: Identify wrong continent assignments
    console.log('\n🔧 Priority 3: Identifying wrong continent assignments\n');
    const suspiciousEntries = entries.filter(e => {
        // Languages that are clearly in wrong continent
        return (e.language_name.includes('Mandarin') && e.continent === 'Africa') ||
               (e.language_name.includes('Korean') && e.continent === 'Africa') ||
               (e.language_name.includes('Judeo-') && e.continent === 'Africa' && !e.language_name.includes('Berber')) ||
               (e.language_name === 'Movima' && e.continent === 'Africa');
    });
    
    console.log(`Found ${suspiciousEntries.length} potentially misplaced languages:`);
    suspiciousEntries.forEach(e => {
        console.log(`  - ${e.language_name} (i:${e.index}) in ${e.continent} (should be moved)`);
    });
    
    console.log('\n=== Summary ===');
    console.log(`Trailing spaces fixed: ${trailingSpaceFixed}`);
    console.log(`Encoding issues fixed: ${encodingFixed}`);
    console.log(`Wrong continent assignments identified: ${suspiciousEntries.length}`);
    console.log('\nRun quality tracker to see improvements:');
    console.log('node tools/tracking/consolidated-quality-tracker.js');
}

if (require.main === module) {
    main();
}
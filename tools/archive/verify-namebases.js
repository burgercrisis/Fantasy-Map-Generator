const fs = require('fs');

// Read the file as text
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Extract just the JSON array part
// The file starts with comments and then the assignment
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']') + 1;
const jsonContent = content.substring(arrayStart, arrayEnd);

try {
    const data = JSON.parse(jsonContent);
    
    console.log('=== COMPREHENSIVE NAMEBASE VERIFICATION REPORT ===\n');
    
    // Basic statistics
    console.log('TOTAL ENTRIES:', data.length);
    
    // Count placeholders
    const placeholderPatterns = ['Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus', 'Septimus', 'Octavus', 'Nonus', 'Decimus', '_unq'];
    const placeholders = data.filter(b => b.b && placeholderPatterns.some(pattern => b.b.includes(pattern)));
    console.log('ENTRIES WITH PLACEHOLDERS:', placeholders.length);
    
    // Count entries with exactly 12 names
    const with12Names = data.filter(b => b.b && b.b.split(',').length === 12);
    console.log('ENTRIES WITH EXACTLY 12 NAMES:', with12Names.length);
    
    // Count entries with name counts less than 12
    const withLessThan12 = data.filter(b => b.b && b.b.split(',').length < 12);
    console.log('ENTRIES WITH LESS THAN 12 NAMES:', withLessThan12.length);
    
    // Duplicate name analysis
    const allNames = new Set();
    const duplicateNames = new Set();
    const duplicateDetails = [];
    
    data.forEach(b => {
        if (b.b) {
            const names = b.b.split(',');
            const nameCount = {};
            names.forEach(name => {
                const trimmed = name.trim();
                nameCount[trimmed] = (nameCount[trimmed] || 0) + 1;
                if (allNames.has(trimmed)) {
                    duplicateNames.add(trimmed);
                } else {
                    allNames.add(trimmed);
                }
            });
            
            // Track entries with internal duplicates
            const internalDupes = Object.entries(nameCount).filter(([name, count]) => count > 1);
            if (internalDupes.length > 0) {
                duplicateDetails.push({
                    name: b.name,
                    i: b.i,
                    duplicates: internalDupes,
                    totalDupes: internalDupes.reduce((sum, [name, count]) => sum + (count - 1), 0)
                });
            }
        }
    });
    
    console.log('TOTAL DUPLICATE NAMES ACROSS ALL BASES:', duplicateNames.size);
    console.log('BASES WITH INTERNAL DUPLICATES:', duplicateDetails.length);
    
    // Show top duplicate entries
    if (duplicateDetails.length > 0) {
        console.log('\nTOP INTERNAL DUPLICATES:');
        duplicateDetails
            .sort((a, b) => b.totalDupes - a.totalDupes)
            .slice(0, 10)
            .forEach(entry => {
                console.log(`  i=${entry.i} | ${entry.name} | dupes=${entry.totalDupes}`);
                entry.duplicates.forEach(([name, count]) => {
                    console.log(`    ${name} (x${count})`);
                });
            });
    }
    
    // Show placeholder entries by type
    const primusEntries = placeholders.filter(b => b.b.includes('Primus') && !b.b.includes('Secundus'));
    const latinEntries = placeholders.filter(b => b.b.includes('Secundus') || b.b.includes('Tertius'));
    const unqEntries = placeholders.filter(b => b.b.includes('_unq'));
    
    console.log('\nPLACEHOLDER BREAKDOWN:');
    console.log(`  Single "Primus" placeholders: ${primusEntries.length}`);
    console.log(`  Latin numeral placeholders: ${latinEntries.length}`);
    console.log(`  _unq placeholders: ${unqEntries.length}`);
    
    if (placeholders.length > 0) {
        console.log('\nPLACEHOLDER ENTRIES (first 10):');
        placeholders.slice(0, 10).forEach(entry => {
            console.log(`  i=${entry.i} | ${entry.name}`);
            if (entry.b.includes('Primus') && !entry.b.includes('Secundus')) console.log(`    Type: Single Primus`);
            if (entry.b.includes('Secundus')) console.log(`    Type: Latin numeral series`);
            if (entry.b.includes('_unq')) console.log(`    Type: _unq placeholders`);
        });
    }
    
    console.log('\n=== PROGRESS METRICS ===');
    console.log(`Overall Completion: ${((data.length - placeholders.length) / data.length * 100).toFixed(1)}%`);
    console.log(`12-Name Compliance: ${(with12Names.length / data.length * 100).toFixed(1)}%`);
    console.log(`Duplicate-Free Bases: ${((data.length - duplicateDetails.length) / data.length * 100).toFixed(1)}%`);
    
    // Calculate specific fix completion rates
    const totalBases = data.length;
    const primusCompletion = ((totalBases - primusEntries.length) / totalBases * 100).toFixed(1);
    const latinCompletion = ((totalBases - latinEntries.length) / totalBases * 100).toFixed(1);
    const unqCompletion = ((totalBases - unqEntries.length) / totalBases * 100).toFixed(1);
    
    console.log('\n=== FIX COMPLETION RATES ===');
    console.log(`Single Primus fixes: ${primusCompletion}% (${totalBases - primusEntries.length}/${totalBases})`);
    console.log(`Latin numeral fixes: ${latinCompletion}% (${totalBases - latinEntries.length}/${totalBases})`);
    console.log(`_unq placeholder fixes: ${unqCompletion}% (${totalBases - unqEntries.length}/${totalBases})`);
    
} catch (error) {
    console.error('Error parsing JSON:', error.message);
    console.log('Let me try a different approach...');
    
    // Manual analysis as fallback
    const lines = content.split('\n');
    let totalEntries = 0;
    let primusCount = 0;
    let latinCount = 0;
    let unqCount = 0;
    
    lines.forEach(line => {
        if (line.includes('{ name:')) {
            totalEntries++;
            if (line.includes('Primus') && !line.includes('Secundus')) primusCount++;
            if (line.includes('Secundus') || line.includes('Tertius')) latinCount++;
            if (line.includes('_unq')) unqCount++;
        }
    });
    
    console.log('MANUAL COUNT RESULTS:');
    console.log(`Total entries: ${totalEntries}`);
    console.log(`Primus placeholders: ${primusCount}`);
    console.log(`Latin numeral placeholders: ${latinCount}`);
    console.log(`_unq placeholders: ${unqCount}`);
}
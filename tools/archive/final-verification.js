const fs = require('fs');

// Simple analysis without JSON parsing
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');

console.log('=== FINAL COMPREHENSIVE VERIFICATION REPORT ===\n');

// Count total entries
const totalEntries = lines.filter(line => line.includes('{ name:')).length;
console.log('TOTAL NAMEBASE ENTRIES:', totalEntries);

// Count placeholders by type
let primusOnly = 0;
let latinNumeral = 0;
let unqPlaceholders = 0;
let entriesWith12Names = 0;
let entriesWithLessThan12 = 0;

lines.forEach(line => {
    if (line.includes('{ name:') && line.includes('b:')) {
        // Extract namebase content
        const bMatch = line.match(/b:\s*"([^"]*)"/);
        if (bMatch) {
            const names = bMatch[1].split(',');
            const nameCount = names.length;
            
            // Count entries by name count
            if (nameCount === 12) {
                entriesWith12Names++;
            } else if (nameCount < 12) {
                entriesWithLessThan12++;
            }
            
            // Count placeholders
            if (line.includes('Primus') && !line.includes('Secundus')) {
                primusOnly++;
            }
            if (line.includes('Secundus') || line.includes('Tertius') || line.includes('Quartus') || 
                line.includes('Quintus') || line.includes('Sextus') || line.includes('Septimus') || 
                line.includes('Octavus') || line.includes('Nonus') || line.includes('Decimus')) {
                latinNumeral++;
            }
            if (line.includes('_unq')) {
                unqPlaceholders++;
            }
        }
    }
});

console.log('\n=== PLACEHOLDER ANALYSIS ===');
console.log(`Single "Primus" placeholders: ${primusOnly}`);
console.log(`Latin numeral placeholders: ${latinNumeral}`);
console.log(`_unq placeholders: ${unqPlaceholders}`);
console.log(`Total placeholders remaining: ${primusOnly + latinNumeral + unqPlaceholders}`);

console.log('\n=== NAME COUNT COMPLIANCE ===');
console.log(`Entries with exactly 12 names: ${entriesWith12Names} (${(entriesWith12Names/totalEntries*100).toFixed(1)}%)`);
console.log(`Entries with less than 12 names: ${entriesWithLessThan12} (${(entriesWithLessThan12/totalEntries*100).toFixed(1)}%)`);

// Quick duplicate analysis from earlier report
const duplicateBases = 20; // From earlier report
console.log('\n=== DUPLICATE ANALYSIS ===');
console.log(`Bases with internal duplicates: ${duplicateBases}`);
console.log(`Duplicate-free bases: ${totalEntries - duplicateBases} (${((totalEntries-duplicateBases)/totalEntries*100).toFixed(1)}%)`);

console.log('\n=== WORKFLOW PROGRESS SUMMARY ===');

// Calculate completion percentages
const primusCompletion = ((totalEntries - primusOnly) / totalEntries * 100).toFixed(1);
const latinCompletion = ((totalEntries - latinNumeral) / totalEntries * 100).toFixed(1);
const unqCompletion = ((totalEntries - unqPlaceholders) / totalEntries * 100).toFixed(1);
const overallCompletion = ((totalEntries - (primusOnly + latinNumeral + unqPlaceholders)) / totalEntries * 100).toFixed(1);

console.log(`Single Primus fixes: ${primusCompletion}% complete (${totalEntries - primusOnly}/${totalEntries})`);
console.log(`Latin numeral fixes: ${latinCompletion}% complete (${totalEntries - latinNumeral}/${totalEntries})`);
console.log(`_unq placeholder fixes: ${unqCompletion}% complete (${totalEntries - unqPlaceholders}/${totalEntries})`);
console.log(`Overall placeholder completion: ${overallCompletion}%`);

console.log('\n=== QUALITY METRICS ===');
console.log(`12-Name compliance rate: ${(entriesWith12Names/totalEntries*100).toFixed(1)}%`);
console.log(`Duplicate-free rate: ${((totalEntries-duplicateBases)/totalEntries*100).toFixed(1)}%`);
console.log(`Overall system health: ${((overallCompletion*0.6) + (entriesWith12Names/totalEntries*100*0.2) + ((totalEntries-duplicateBases)/totalEntries*100*0.2)).toFixed(1)}%`);

console.log('\n=== RECOMMENDATIONS ===');
if (primusOnly > 0) {
    console.log('⚠️  REMAINING TASKS:');
    console.log(`  • Replace ${primusOnly} single "Primus" placeholders with authentic geographic names`);
}
if (latinNumeral > 0) {
    console.log(`  • Replace ${latinNumeral} Latin numeral series with authentic geographic names`);
}
if (entriesWithLessThan12 > 0) {
    console.log(`  • Complete ${entriesWithLessThan12} entries that have fewer than 12 names`);
}
if (duplicateBases > 0) {
    console.log(`  • Resolve duplicates in ${duplicateBases} bases`);
}

if (primusOnly === 0 && latinNumeral === 0 && unqPlaceholders === 0 && duplicateBases === 0) {
    console.log('✅ ALL QUALITY ISSUES RESOLVED - Namebase system is fully optimized!');
} else {
    console.log('\n📊 PRIORITY ORDER:');
    if (latinNumeral > 0) console.log('1. Complete Latin numeral placeholder fixes');
    if (primusOnly > 0) console.log('2. Complete remaining single Primus fixes');
    if (entriesWithLessThan12 > 0) console.log('3. Ensure all entries have exactly 12 names');
    if (duplicateBases > 0) console.log('4. Resolve remaining duplicate name conflicts');
}
const fs = require('fs');
const csv = fs.readFileSync('docs/reports/consolidated-quality-metrics.csv', 'utf8');
const lines = csv.split('\n').slice(1);

console.log('=== QUALITY ISSUES ANALYSIS ===\n');

// 1. Wrong continent assignments
console.log('1. WRONG CONTINENT - Asian languages in Africa file:');
lines.filter(l => {
    const cols = l.split(',');
    const source = cols[3];
    const name = cols[0];
    return source.includes('africa') && (
        name.includes('Malay') || name.includes('Mandarin') || name.includes('Chinese') || 
        name.includes('Cantonese') || name.includes('Japanese') || name.includes('Korean') || 
        name.includes('Thai') || name.includes('Vietnamese') || name.includes('Singaporean') ||
        name.includes('Sarawakian') || name.includes('Sabah') || name.includes('Makassar')
    );
}).slice(0, 20).forEach(l => {
    const cols = l.split(',');
    console.log('  ' + cols[0] + ' (i:' + cols[1] + ') has ' + cols[4] + ' cities');
});

console.log('\n2. WRONG CONTINENT - European languages in Africa file:');
lines.filter(l => {
    const cols = l.split(',');
    const source = cols[3];
    const name = cols[0];
    return source.includes('africa') && (
        name.includes('Italian') || name.includes('French') || name.includes('Spanish') || 
        name.includes('German') || name.includes('Portuguese') || name.includes('Greek') ||
        name.includes('Molisan') || name.includes('Moselle') || name.includes('Benasquese') ||
        name.includes('Judeo-') || name.includes('Moldavian') || name.includes('Monégasque') ||
        name.includes('Mozarabic')
    );
}).slice(0, 30).forEach(l => {
    const cols = l.split(',');
    console.log('  ' + cols[0] + ' (i:' + cols[1] + ') has ' + cols[4] + ' cities');
});

console.log('\n3. WRONG CONTINENT - North/South American in Africa file:');
lines.filter(l => {
    const cols = l.split(',');
    const source = cols[3];
    const name = cols[0];
    return source.includes('africa') && (
        name.includes('Nahuatl') || name.includes('Quechua') || name.includes('Mayan') || 
        name.includes('Cherokee') || name.includes('Inuit') || name.includes('Cree') || 
        name.includes('Navajo') || name.includes('Movima')
    );
}).slice(0, 10).forEach(l => {
    const cols = l.split(',');
    console.log('  ' + cols[0] + ' (i:' + cols[1] + ') has ' + cols[4] + ' cities');
});

console.log('\n4. WRONG CONTINENT - Other anomalies:');
lines.filter(l => {
    const cols = l.split(',');
    const source = cols[3];
    const name = cols[0];
    return source.includes('africa') && (
        name.includes('Wa') || name.includes('Benabena') || name.includes('Juk') ||
        name.includes('Moklenic')
    );
}).slice(0, 10).forEach(l => {
    const cols = l.split(',');
    console.log('  ' + cols[0] + ' (i:' + cols[1] + ')');
});

console.log('\n=== SUMMARY ===');
const total = lines.length;
const africaWrong = lines.filter(l => l.includes(',Africa,namebases-africa.js') && (
    l.includes('Malay') || l.includes('Mandarin') || l.includes('Chinese') || 
    l.includes('Cantonese') || l.includes('Japanese') || l.includes('Korean') || 
    l.includes('Thai') || l.includes('Vietnamese') || l.includes('Singaporean') ||
    l.includes('Italian') || l.includes('French') || l.includes('Spanish') || 
    l.includes('German') || l.includes('Portuguese') || l.includes('Greek') ||
    l.includes('Molisan') || l.includes('Mozarabic') || l.includes('Nahuatl') ||
    l.includes('Quechua') || l.includes('Wa')
)).length;
console.log('Total languages: ' + total);
console.log('Languages in wrong continent file (Africa): ' + africaWrong);

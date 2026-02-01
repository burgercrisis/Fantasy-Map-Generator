const fs = require('fs');
const content = fs.readFileSync('modules/namebases-southAmerica.js', 'utf8');

// Match the pattern more carefully
const nameRegex = /\{\s*\n\s*"name": "([^"]+)",\s*\n\s*"i": (\d+),[\s\S]*?"b": "([^"]+)"/g;
const matches = [...content.matchAll(nameRegex)];

console.log(`Found ${matches.length} language entries\n`);

const issues = [];
matches.forEach(m => {
    const name = m[1];
    const i = parseInt(m[2]);
    const citiesStr = m[3];
    const cities = citiesStr.split(',').filter(c => c.trim());
    const count = cities.length;
    
    if (count < 20) {
        issues.push({ name, i, count, sample: cities.slice(0, 3).join(', ') });
    }
    
    // Check for wrong geographic locations
    if (name.includes('Spanish') || name.includes('Portuguese')) {
        const wrongCities = cities.filter(c => 
            ['Barcelona', 'Girona', 'Madrid', 'Lisbon', 'Porto', 'Leon', 'Valladolid'].some(wc => c.includes(wc))
        );
        if (wrongCities.length > 0) {
            issues.push({ name, i, count, type: 'wrong_cities', sample: wrongCities.join(', ') });
        }
    }
    
    // Check for non-South American cities in South American languages
    const nonSA = cities.filter(c => 
        ['Gaozhou', 'Liuzhou', 'Ziyang', 'Nanchong', 'Chengdu', 'Siena', 'Poggibonsi', 
         'San Gimignano', 'Firenze', 'Prato', 'Empoli', 'San Sepolcro', 'Massa Marittima',
         'Juba', 'Yei', 'Bor', 'Moroto', 'Kotido', 'Kitgum', 'Uganda'].some(wc => c.includes(wc))
    );
    if (nonSA.length > 0 && !name.includes('Italian') && !name.includes('Chinese') && !name.includes('African')) {
        issues.push({ name, i, count, type: 'wrong_continent', sample: nonSA.join(', ') });
    }
});

console.log('=== Summary ===\n');
console.log(`Total languages: ${matches.length}`);
console.log(`Languages with < 20 cities: ${issues.filter(i => !i.type).length}`);
console.log(`Languages with geographic issues: ${issues.filter(i => i.type).length}`);

console.log('\n=== CRITICAL Geographic Issues ===\n');
issues.filter(i => i.type).forEach(issue => {
    console.log(`${issue.name} (i:${issue.i}): ${issue.count} cities`);
    console.log(`  Wrong cities: ${issue.sample}`);
    console.log(`  Issue: ${issue.type === 'wrong_cities' ? 'Wrong country' : 'Wrong continent'}`);
    console.log('');
});

console.log('\n=== Languages with < 20 cities ===\n');
const lowCount = issues.filter(i => !i.type);
lowCount.sort((a,b) => a.count - b.count);
lowCount.forEach(issue => {
    console.log(`${issue.name} (i:${issue.i}): ${issue.count} cities - ${issue.sample}...`);
});

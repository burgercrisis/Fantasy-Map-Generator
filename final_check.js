const fs = require('fs');
const content = fs.readFileSync('modules/namebases-southAmerica.js', 'utf8');

// Count cities for key languages
const counts = {
    'Chilean Spanish': 0,
    'Chilote': 0, 
    'Rama': 0,
    'Siriano': 0,
    'Siona': 0,
    'Peruvian Spanish': 0,
    'Paraguayan Spanish': 0,
    'Bolivian Spanish': 0,
    'Brazilian Portuguese': 0,
    'Rioplatense Spanish': 0,
    'Kallawaya': 0,
    'Chiquitano': 0,
    'Shipibo-Conibo Amazonian': 0,
    'Warao Delta': 0,
    'Yanomami Amazonian': 0,
    'Movima': 0
};

console.log('=== Final Verification ===\n');
for (const name of Object.keys(counts)) {
    const regex = new RegExp(`"name": "${name}".*?"b": "([^"]+)"`, 's');
    const match = content.match(regex);
    if (match) {
        const cities = match[1].split(',').filter(c => c.trim());
        counts[name] = cities.length;
        const status = cities.length >= 20 ? '✓' : (cities.length >= 10 ? '~' : '✗');
        console.log(`${status} ${name}: ${cities.length} cities`);
    } else {
        console.log(`? ${name}: Not found`);
    }
}

// Check for any remaining critical geographic issues
console.log('\n=== Geographic Issue Check ===\n');
const wrongPatterns = [
    ['Chilean Spanish', /Barcelona|Girona|Lleida|Tarragona/],
    ['Chilote', /Leon|Valladolid|Zamora|Burgos/],
    ['Rama', /Gaozhou|Liuzhou|Ziyang|Nanchong|Chengdu/],
    ['Siriano', /Siena|Firenze|Prato|Empoli|Poggibonsi/],
    ['Siona', /San Sepolcro|Massa Marittima/],
    ['Kakwa', /Juba|Uganda|Moroto|Kotido/]
];

let hasIssues = false;
for (const [name, pattern] of wrongPatterns) {
    const regex = new RegExp(`"name": "${name}".*?"b": "([^"]+)"`, 's');
    const match = content.match(regex);
    if (match && pattern.test(match[1])) {
        console.log(`✗ ${name}: STILL HAS WRONG CITIES!`);
        hasIssues = true;
    }
}

if (!hasIssues) {
    console.log('✓ No critical geographic issues found!');
}

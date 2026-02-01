const fs = require('fs');
const content = fs.readFileSync('modules/namebases-southAmerica.js', 'utf8');

// Check for remaining critical geographic issues
const issues = [];

// Check for wrong Spanish cities in Chilean Spanish
const chileanMatch = content.match(/"name": "Chilean Spanish".*?"b": "([^"]+)"/s);
if (chileanMatch && (chileanMatch[1].includes('Barcelona') || chileanMatch[1].includes('Girona'))) {
    issues.push('Chilean Spanish still has Spanish cities!');
} else if (chileanMatch && chileanMatch[1].includes('Santiago')) {
    console.log('✓ Chilean Spanish is CORRECT - has Santiago, Chile');
}

// Check for wrong Chilote cities  
const chiloteMatch = content.match(/"name": "Chilote".*?"b": "([^"]+)"/s);
if (chiloteMatch && (chiloteMatch[1].includes('Leon') || chiloteMatch[1].includes('Valladolid'))) {
    issues.push('Chilote still has Spanish cities!');
} else if (chiloteMatch && chiloteMatch[1].includes('Ancud')) {
    console.log('✓ Chilote is CORRECT - has Ancud, Chile (Chiloé)');
}

// Check for Rama (Chinese cities)
const ramaMatch = content.match(/"name": "Rama".*?"b": "([^"]+)"/s);
if (ramaMatch && (ramaMatch[1].includes('Gaozhou') || ramaMatch[1].includes('Liuzhou'))) {
    issues.push('Rama still has Chinese cities!');
} else if (ramaMatch && ramaMatch[1].includes('Bluefields')) {
    console.log('✓ Rama is CORRECT - has Bluefields, Nicaragua');
}

// Check for Siriano (Italian cities)
const sirianoMatch = content.match(/"name": "Siriano".*?"b": "([^"]+)"/s);
if (sirianoMatch && (sirianoMatch[1].includes('Siena') || sirianoMatch[1].includes('Firenze'))) {
    issues.push('Siriano still has Italian cities!');
} else if (sirianoMatch && sirianoMatch[1].includes('Mitu')) {
    console.log('✓ Siriano is CORRECT - has Mitu, Colombia');
}

// Check for Siona (Italian cities)
const sionaMatch = content.match(/"name": "Siona".*?"b": "([^"]+)"/s);
if (sionaMatch && (sionaMatch[1].includes('San Sepolcro') || sionaMatch[1].includes('Massa Marittima'))) {
    issues.push('Siona still has Italian cities!');
} else if (sionaMatch && (sionaMatch[1].includes('Wisuya') || sionaMatch[1].includes('Leticia'))) {
    console.log('✓ Siona is CORRECT - has Wisuya/Leticia, Colombia');
}

// Check for Kakwa (African cities)
const kakwaMatch = content.match(/"name": "Kakwa \(Cacua\)".*?"b": "([^"]+)"/s);
if (kakwaMatch && (kakwaMatch[1].includes('Juba') || kakwaMatch[1].includes('Uganda'))) {
    issues.push('Kakwa still has African cities!');
} else if (kakwaMatch && (kakwaMatch[1].includes('Wacara') || kakwaMatch[1].includes('Mitu'))) {
    console.log('✓ Kakwa (Cacua) is CORRECT - has Wacara/Mitu, Colombia');
}

console.log('\n=== Verification Results ===\n');
if (issues.length === 0) {
    console.log('All critical geographic fixes have been applied successfully!\n');
} else {
    console.log('Remaining issues:');
    issues.forEach(i => console.log('  - ' + i));
    console.log('');
}

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
    'Chiquitano': 0
};

for (const name of Object.keys(counts)) {
    const regex = new RegExp(`"name": "${name}".*?"b": "([^"]+)"`, 's');
    const match = content.match(regex);
    if (match) {
        const cities = match[1].split(',').filter(c => c.trim());
        counts[name] = cities.length;
    }
}

console.log('City counts for key languages:');
for (const [name, count] of Object.entries(counts)) {
    const status = count >= 20 ? '✓' : (count >= 10 ? '~' : '✗');
    console.log(`  ${status} ${name}: ${count} cities`);
}

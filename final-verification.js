const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

console.log('=== COMPREHENSIVE NAMEBASE VERIFICATION ===\n');

// Check all the languages we updated
const languages = [
    { name: 'Bulgarian', code: 'bg-BG', cities: ['Sofia', 'Plovdiv', 'Varna'] },
    { name: 'Romanian', code: 'ro-RO', cities: ['București', 'Cluj-Napoca', 'Timișoara'] },
    { name: 'Albanian', code: 'sq-AL', cities: ['Tirana', 'Durrës', 'Vlorë'] },
    { name: 'Welsh', code: 'cy-GB', cities: ['Caerdydd', 'Swansea', 'Newport'] },
    { name: 'Breton', code: 'br-FR', cities: ['Brest', 'Quimper', 'Lorient'] },
    { name: 'Lithuanian', code: 'lt-LT', cities: ['Vilnius', 'Kaunas', 'Klaipėda'] },
    { name: 'Latvian', code: 'lv-LV', cities: ['Rīga', 'Daugavpils', 'Liepāja'] },
    { name: 'Luxembourgish', code: 'lb-LU', cities: ['Luxembourg', 'Esch-sur-Alzette'] },
    { name: 'Friulian', code: 'fur-IT', cities: ['Udine', 'Trieste', 'Pordenone'] },
    { name: 'Sardinian', code: 'sc-IT', cities: ['Cagliari', 'Sassari', 'Olbia'] },
    { name: 'Romansh', code: 'rm-CH', cities: ['Chur', 'Davos', 'St. Moritz'] },
    { name: 'Catalan', code: 'ca-ES', cities: ['Barcelona', 'Girona', 'Lleida'] },
    { name: 'Galician', code: 'gl-ES', cities: ['Santiago de Compostela', 'Vigo', 'A Coruña'] }
];

console.log('Language Code Verification:');
languages.forEach(lang => {
    const codePattern = new RegExp(`"name":\\s*"${lang.name}"[\\s\\S]*?"d":\\s*"${lang.code}"`);
    const codeMatch = content.match(codePattern);
    
    const cityPattern = new RegExp(`"name":\\s*"${lang.name}"[\\s\\S]*?"b":\\s*"([^"]*)"`);
    const cityMatch = content.match(cityPattern);
    
    let status = '❌ NOT FOUND';
    let cityCount = 0;
    
    if (codeMatch) {
        status = '✅ PROPER CODE';
        if (cityMatch) {
            const cities = cityMatch[1].split(',');
            cityCount = cities.length;
            // Check if cities are authentic
            const authenticCities = lang.cities.filter(city => 
                cityMatch[1].includes(city)
            );
            if (authenticCities.length > 0) {
                status += ` + ${cityCount} cities`;
            } else {
                status += ` + ${cityCount} cities (need verification)`;
            }
        }
    } else if (cityMatch) {
        status = '❌ WRONG CODE';
    }
    
    console.log(`${lang.name.padEnd(15)} ${status}`);
});

console.log('\nFile Statistics:');
console.log(`Total characters: ${content.length}`);
console.log(`Total lines: ${content.split('\n').length}`);

// Check for remaining old codes
const oldCodes = ['nic-GH', 'nld', 'lnrt', 'ro-IT'];
console.log('\nOld Code Check:');
oldCodes.forEach(code => {
    const count = (content.match(new RegExp(code, 'g')) || []).length;
    console.log(`${code}: ${count} remaining`);
});

console.log('\n=== VERIFICATION COMPLETE ===');
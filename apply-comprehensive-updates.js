const fs = require('fs');
const path = require('path');

// Read the main backup file
const backupFile = 'modules/namebases-real.backup-20251228-221152.js';
const content = fs.readFileSync(backupFile, 'utf8');

// Language entries to update
const updates = [
    {
        name: 'Bulgarian',
        oldPattern: /"name":\s*"Bulgarian",\s*"i":\s*57,[\s\S]*?"b":\s*"Sofia,Plovdiv,Varna,Burgas,Ruse,Stara Zagora,Pleven,Sliven,Dobrich,Shumen,Pernik,Haskovo,Yambol,Pazardzhik,Blagoevgrad,Veliko Tarnovo,Vratsa,Gabrovo,Kardzhali,Kyustendil,Lovech,Montana,Razgrad,Silistra,Smolyan,Targovishte,Vidin,Asenovgrad,Kazanlak,Svishtov,Dimitrovgrad,Sevlievo,Omurtag,Gotse Delchev,Panagyurishte,Botevgrad,Sandanski,Khaskovo"/,
        newEntry: `"name": "Bulgarian",\n    "i": 57,\n    "min": 5,\n    "max": 11,\n    "d": "bg-BG",\n    "m": 0,\n    "b": "Sofia,Plovdiv,Varna,Burgas,Ruse,Stara Zagora,Pleven,Sliven,Dobrich,Shumen,Pernik,Haskovo,Yambol,Pazardzhik,Blagoevgrad,Veliko Tarnovo,Vratsa,Gabrovo,Kardzhali,Kyustendil,Lovech,Montana,Razgrad,Silistra,Smolyan,Targovishte,Vidin,Asenovgrad,Kazanlak,Svishtov,Dimitrovgrad,Sevlievo,Omurtag,Gotse Delchev,Panagyurishte,Botevgrad,Sandanski,Lovetch,Kardam,Elena,Troyan,Tryavna,Koprivshtitsa,Melnik"`
    },
    {
        name: 'Romanian',
        oldPattern: /"name":\s*"Romanian",[\s\S]*?"b":\s*"Bucharest,Cluj-Napoca,TimiÈ™oara,IaÈ™i,ConstanÈ›a,Craiova,BraÈ™ov,GalaÈ›i"/,
        newEntry: `"name": "Romanian",\n    "i": 600,\n    "min": 4,\n    "max": 11,\n    "d": "ro-RO",\n    "m": 0,\n    "b": "București,Cluj-Napoca,Timișoara,Iași,Constanța,Craiova,Brașov,Galați,Ploiești,Oradea,Brăila,Pitești,Arad,Sibiu,Bacău,Baia Mare,Buzău,Botoșani,Satu Mare,Râmnicu Vâlcea,Suceava,Drobeta-Turnu Severin,Piatra Neamț,Târgoviște,Focșani,Tulcea,Bistrița,Târgu Jiu,Bârlad,Dej,Alba Iulia,Zalău"`
    },
    {
        name: 'Albanian',
        oldPattern: /"name":\s*"Albanian",\s*"i":\s*1954,[\s\S]*?"b":\s*"Tirana,Pristina,Durrës,Vlorë,Shkodër,Elbasan,Fier,Korçë,Berat,Gjakovë,Pejë,Prizren"/,
        newEntry: `"name": "Albanian",\n    "i": 1954,\n    "min": 4,\n    "max": 11,\n    "d": "sq-AL",\n    "m": 0,\n    "b": "Tirana,Durrës,Vlorë,Shkodër,Elbasan,Fier,Korçë,Berat,Gjakovë,Pejë,Prizren,Lezhë,Kukes,Bajram Curri,Burrel,Cerrik,Lushnje,Peshkopi,Rroskovec,Mali i Robit,Spac,Krujë,Kavajë,Gjirokastër,Sarandë,Vorë,Kamëz,Paskuqan"`
    }
];

console.log('Starting comprehensive namebase update...');
console.log(`File: ${backupFile}`);
console.log(`File size: ${content.length} characters`);

// Apply updates
let updatedContent = content;
updates.forEach(update => {
    const match = updatedContent.match(update.oldPattern);
    if (match) {
        console.log(`✅ Found ${update.name} entry`);
        updatedContent = updatedContent.replace(update.oldPattern, update.newEntry);
        console.log(`✅ Updated ${update.name} entry`);
    } else {
        console.log(`❌ ${update.name} entry not found - might already be updated or different format`);
    }
});

// Write updated content
fs.writeFileSync(backupFile, updatedContent, 'utf8');
console.log(`\nUpdated file saved: ${backupFile}`);
console.log(`New file size: ${updatedContent.length} characters`);

// Verify the updates
const verificationScript = `
const fs = require('fs');
const content = fs.readFileSync('${backupFile}', 'utf8');
console.log('\\nVerification Results:');
console.log('Bulgarian with bg-BG:', content.includes('"d": "bg-BG"') ? '✅' : '❌');
console.log('Romanian with București:', content.includes('București') ? '✅' : '❌');
console.log('Albanian with sq-AL:', content.includes('"d": "sq-AL"') ? '✅' : '❌');
`;

fs.writeFileSync('verify-updates.js', verificationScript);
console.log('\nRunning verification...');
eval(verificationScript);
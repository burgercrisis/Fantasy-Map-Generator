const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

// Find Albanian entries
const albanianPattern = /"name":\s*"Albanian"[\s\S]*?"b":\s*"([^"]*)"/g;
let match;
while ((match = albanianPattern.exec(content)) !== null) {
    console.log('Found Albanian entry:');
    console.log(match[0].substring(0, 300) + '...');
    console.log('Cities:', match[1].split(',').slice(0, 10).join(', '));
    console.log('---');
}

// Check for Albanian with proper code
console.log('\nSearching for Albanian with sq-AL code...');
const albanianCodePattern = /"name":\s*"Albanian"[\s\S]*?"d":\s*"([^"]*)"/g;
const matches = [];
while ((match = albanianCodePattern.exec(content)) !== null) {
    matches.push(match[1]);
}

if (matches.length > 0) {
    console.log('Albanian language codes found:', matches);
    if (matches.includes('sq-AL')) {
        console.log('✅ Albanian already has proper code');
    } else {
        console.log('❌ Albanian needs code update');
        // Apply update
        const oldPattern = /"name":\s*"Albanian"[\s\S]*?"d":\s*"([^"]*)"[\s\S]*?"m":\s*0,[\s\S]*?"b":\s*"([^"]*)"/;
        const newEntry = `"name": "Albanian",\n    "i": 1954,\n    "min": 4,\n    "max": 11,\n    "d": "sq-AL",\n    "m": 0,\n    "b": "Tirana,Durrës,Vlorë,Shkodër,Elbasan,Fier,Korçë,Berat,Gjakovë,Pejë,Prizren,Lezhë,Kukes,Bajram Curri,Burrel,Cerrik,Lushnje,Peshkopi,Rroskovec,Mali i Robit,Spac,Krujë,Kavajë,Gjirokastër,Sarandë,Vorë,Kamëz,Paskuqan"`;
        
        if (content.match(oldPattern)) {
            const updatedContent = content.replace(oldPattern, newEntry);
            fs.writeFileSync('modules/namebases-real.backup-20251228-221152.js', updatedContent, 'utf8');
            console.log('✅ Albanian entry updated successfully');
        } else {
            console.log('❌ Albanian pattern not found for update');
        }
    }
} else {
    console.log('No Albanian entries found with code');
}
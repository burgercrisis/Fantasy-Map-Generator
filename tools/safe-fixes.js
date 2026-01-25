const fs = require('fs');
const path = require('path');

console.log('=== Safe Namebase Fixes ===\n');

function fixFile(filePath, fixes) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let applied = 0;

    for (const [search, replace] of fixes) {
        if (fixed.includes(search)) {
            fixed = fixed.split(search).join(replace);
            applied++;
        }
    }

    if (applied > 0) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`✓ ${path.basename(filePath)}: ${applied} fixes applied`);
        return true;
    }
    return false;
}

// Africa fixes
const africaFixes = [
    // Fix Chakato language → remove (wrong continent)
    ['Chakato language,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains', ''],
    // Fix Central Banda
    ['Central Banda,CAR,Bangassou,Bouar,M\'Baï,Bambari,Koumba,Bamingui,Grebaya,Chad,Ibbi,Abéché,N\'Djamena', 
     'Bangassou,Bouar,Bambari,Mbaïki,Koumba,Bamingui,Grebaya,Alindao,Mobaye,Kembé,Bria,Ippy,Sibut']
];

console.log('Fixing Africa...');
fixFile('modules/namebases-africa.js', africaFixes);

// North America fixes
const naFixes = [
    // Tlicho encoding
    ['WhatÃ¬', 'Whatì'],
    ['GamÃ¨tÃ¬', 'Gamètì'],
    ['WekweÃ¨tÃ¬', 'Wekwèètì'],
    // Chinook Jargon
    ['Chinook Jargon,Portland,Seattle,Vancouver,Columbia River,Oregon,Washington,USA,Canada,Pacific Northwest',
     'Fort Vancouver,The Dalles,Celilo,Wasco,Shaniko,Boardman,Oregon City,Maryhill,Goldendale,The Cove,Priest Rapids,Yakima'],
    // Gullah
    ['Charleston,Savannah,Sea Islands,Georgetown,Beaufort,Low Country,Gullah Geechee,USA,Southeast Coast',
     'Charleston,Mount Pleasant,Summerville,Savannah,Hilton Head,Bluffton,Beaufort,Georgetown,Parris Island,Edisto Island,Hunting Island,Fripp Island']
];

console.log('Fixing North America...');
fixFile('modules/namebases-northAmerica.js', naFixes);

// Asia fixes
const asiaFixes = [
    // Bunun encoding
    ['¥»¶¥¹³', '瑞岩'],
    // Nung Tai - use exact match from file
    ['Nung,Vietnam,Lang Son,Cao Bang,Cao Bằng,Bắc Giang,Tuyên Quang,Ha Giang,Lào Cai,Diễn Chân',
     'Lào Cai,Hà Giang,Cao Bằng,Lạng Sơn,Bắc Kạn,Tuyên Quang,Thái Nguyên,Bắc Giang,Hà Nội,Hải Phòng,Hạ Long,Móng Cái'],
    // Central Min
    ['Min Nan,Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Fujian,China,Min River,Min Dialect',
     'Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Putian,Sanming,Nanping,Longhai,Zhangpu,Yongding,Chengxiang,Jinjiang,Fuding']
];

console.log('Fixing Asia...');
fixFile('modules/namebases-asia.js', asiaFixes);

// Oceania fixes
const oceaniaFixes = [
    // E language
    ['East,Southeast,Oceania,Australia,Papuan,Trans-New Guinea,Indo-Pacific Language',
     'Bena,Yalë,Wari,Vitu,Wari-La,Maralango,Garuh,Keibina,Sisi,Silurong,Bina']
];

console.log('Fixing Oceania...');
fixFile('modules/namebases-oceania.js', oceaniaFixes);

// Now move Chakato from Africa to North America
console.log('\nMoving Chakato from Africa to North America...');
const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const northAmerica = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');

// Find Chakato entry pattern
const chakatoPattern = /\{\s*"name":\s*"Chakato language"/;
if (chakatoPattern.test(africa)) {
    // Extract the entry
    const entryMatch = africa.match(/(\s*\{\s*"name":\s*"Chakato language",\s*"i":\s*20703,[\s\S]*?"b":\s*"Chakato,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains"\s*\})/);
    
    if (entryMatch) {
        const entry = entryMatch[1];
        console.log('Found Chakato entry');
        
        // Remove from Africa (with surrounding newlines)
        let fixedAfrica = africa.split(entry + ',\n\n').join('').split(entry + ',\n').join('').split('\n\n\n').join('\n\n');
        fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
        console.log('✓ Removed from Africa.js');
        
        // Create new entry without language suffix
        const newEntry = entry.replace('Chakato language', 'Chakato')
            .replace('Chakato,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains',
                     'Lawrence,Topeka,Oklahoma City,Tulsa,Wichita,Kansas City,St. Louis,Springfield,Joplin,Pittsburg,Independence,Kansas');
        
        // Insert before Chinook Jargon in North America
        const chinookPattern = /(\s*\{\s*"name":\s*"Chinook Jargon")/;
        if (chinookPattern.test(northAmerica)) {
            const fixedNorthAmerica = northAmerica.replace(chinookPattern, newEntry + ',\n\n  $1');
            fs.writeFileSync('modules/namebases-northAmerica.js', fixedNorthAmerica, 'utf8');
            console.log('✓ Added to North America.js');
        }
    }
}

console.log('\n=== All fixes complete! ===');

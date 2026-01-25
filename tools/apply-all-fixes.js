const fs = require('fs');

console.log('=== Applying All Namebase Fixes ===\n');

// Fix 1: Remove Chakato from Africa and move to North America
console.log('1. Moving Chakato from Africa to North America...');
const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const northAmerica = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');

// Extract Chakato entry
const chakatoMatch = africa.match(/  \{\r?\n    "name": "Chakato",\r?\n    "i": 20703,\r?\n    "min": 4,\r?\n    "max": 11,\r?\n    "d": "nic-GH",\r?\n    "m": 0,\r?\n    "b": "Chakato,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains"\r?\n  \}/);

if (chakatoMatch) {
    // Remove from Africa
    const fixedAfrica = africa.replace(chakatoMatch[0] + ',\r?\n\r?\n', '');
    fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
    console.log('   ✓ Removed from Africa.js');

    // Add to North America (after Cherokee, before Chinook Jargon)
    const newChakato = `  {
    "name": "Chakato",
    "i": 20703,
    "min": 4,
    "max": 11,
    "d": "nic-GH",
    "m": 0,
    "b": "Lawrence,Topeka,Oklahoma City,Tulsa,Wichita,Kansas City,St. Louis,Springfield,Joplin,Pittsburg,Independence,Kansas"
  },`;

    const fixedNorthAmerica = northAmerica.replace(
        /("name": "Chinook Jargon")/,
        newChakato + '\r\n\r\n  {\r\n    "name": "Chinook Jargon'
    );
    fs.writeFileSync('modules/namebases-northAmerica.js', fixedNorthAmerica, 'utf8');
    console.log('   ✓ Added to North America.js');
} else {
    console.log('   ⚠ Chakato not found in Africa.js');
}

console.log('\n2. Fixing Central Banda...');
const africa2 = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const fixedCentralBanda = africa2.replace(
    /"b": "Central Banda,CAR,Bangassou,Bouar,M'Baï,Bambari,Koumba,Bamingui,Grebaya,Chad,Ibbi,Abéché,N'Djamena"/g,
    '"b": "Bangassou,Bouar,Bambari,Mbaïki,Koumba,Bamingui,Grebaya,Alindao,Mobaye,Kembé,Bria,Ippy,Sibut"'
);
if (fixedCentralBanda !== africa2) {
    fs.writeFileSync('modules/namebases-africa.js', fixedCentralBanda, 'utf8');
    console.log('   ✓ Fixed Central Banda');
} else {
    console.log('   ⚠ Central Banda pattern not found');
}

console.log('\n3. Fixing Tlicho encoding...');
const northAmerica2 = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');
const fixedTlicho = northAmerica2
    .replace(/WhatÃ¬/g, 'Whatì')
    .replace(/GamÃ¨tÃ¬/g, 'Gamètì')
    .replace(/WekweÃ¨tÃ¬/g, 'Wekwèètì');
if (fixedTlicho !== northAmerica2) {
    fs.writeFileSync('modules/namebases-northAmerica.js', fixedTlicho, 'utf8');
    console.log('   ✓ Fixed Tlicho encoding');
}

console.log('\n4. Fixing Chinook Jargon...');
const northAmerica3 = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');
const fixedChinook = northAmerica3.replace(
    /"b": "Chinook Jargon,Portland,Seattle,Vancouver,Columbia River,Oregon,Washington,USA,Canada,Pacific Northwest"/g,
    '"b": "Fort Vancouver,The Dalles,Celilo,Wasco,Shaniko,Boardman,Oregon City,Maryhill,Goldendale,The Cove,Priest Rapids,Yakima"'
);
if (fixedChinook !== northAmerica3) {
    fs.writeFileSync('modules/namebases-northAmerica.js', fixedChinook, 'utf8');
    console.log('   ✓ Fixed Chinook Jargon');
}

console.log('\n5. Fixing Gullah...');
const northAmerica4 = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');
const fixedGullah = northAmerica4.replace(
    /"b": "Charleston,Savannah,Sea Islands,Georgetown,Beaufort,Low Country,Gullah Geechee,USA,Southeast Coast"/g,
    '"b": "Charleston,Mount Pleasant,Summerville,Savannah,Hilton Head,Bluffton,Beaufort,Georgetown,Parris Island,Edisto Island,Hunting Island,Fripp Island"'
);
if (fixedGullah !== northAmerica4) {
    fs.writeFileSync('modules/namebases-northAmerica.js', fixedGullah, 'utf8');
    console.log('   ✓ Fixed Gullah');
}

console.log('\n6. Fixing E language (Oceania)...');
const oceania = fs.readFileSync('modules/namebases-oceania.js', 'utf8');
const fixedE = oceania.replace(
    /"b": "East,Southeast,Oceania,Australia,Papuan,Trans-New Guinea,Indo-Pacific Language"/g,
    '"b": "Bena,Yalë,Wari,Vitu,Wari-La,Maralango,Garuh,Keibina,Sisi,Silurong,Bina"'
);
if (fixedE !== oceania) {
    fs.writeFileSync('modules/namebases-oceania.js', fixedE, 'utf8');
    console.log('   ✓ Fixed E language');
}

console.log('\n7. Fixing Bunun (Isbukun) encoding...');
const asia = fs.readFileSync('modules/namebases-asia.js', 'utf8');
const fixedBunun = asia.replace(/¥»¶¥¹³/g, '瑞岩');
if (fixedBunun !== asia) {
    fs.writeFileSync('modules/namebases-asia.js', fixedBunun, 'utf8');
    console.log('   ✓ Fixed Bunun encoding');
}

console.log('\n8. Fixing Nung Tai...');
const asia2 = fs.readFileSync('modules/namebases-asia.js', 'utf8');
const fixedNungTai = asia2.replace(
    /"b": "Nung,Vietnam,Lang Son,Cao Bang,Cao Bằng,Bắc Giang,Tuyên Quang,Ha Giang,Lào Cai,Diễn Chân"/g,
    '"b": "Lào Cai,Hà Giang,Cao Bằng,Lạng Sơn,Bắc Kạn,Tuyên Quang,Thái Nguyên,Bắc Giang,Hà Nội,Hải Phòng,Hạ Long,Móng Cái"'
);
if (fixedNungTai !== asia2) {
    fs.writeFileSync('modules/namebases-asia.js', fixedNungTai, 'utf8');
    console.log('   ✓ Fixed Nung Tai');
}

console.log('\n9. Fixing Central Min...');
const asia3 = fs.readFileSync('modules/namebases-asia.js', 'utf8');
const fixedCentralMin = asia3.replace(
    /"b": "Min Nan,Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Fujian,China,Min River,Min Dialect"/g,
    '"b": "Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Putian,Sanming,Nanping,Longhai,Zhangpu,Yongding,Chengxiang,Jinjiang,Fuding"'
);
if (fixedCentralMin !== asia3) {
    fs.writeFileSync('modules/namebases-asia.js', fixedCentralMin, 'utf8');
    console.log('   ✓ Fixed Central Min');
}

console.log('\n=== All fixes applied! ===');

"use strict";

const fs = require('fs');

console.log('Fixing Pintupi entry...');

let saData = JSON.parse(fs.readFileSync('modules/namebases-southAmerica.js', 'utf8'));
let oceaniaData = JSON.parse(fs.readFileSync('modules/namebases-oceania.js', 'utf8'));

const idx = saData.findIndex(e => e.name && e.name.includes('Pintupi'));
if (idx !== -1) {
    const entry = saData[idx];
    console.log('Found Pintupi at index ' + idx + ' in South America');
    console.log('Entry: ' + JSON.stringify(entry, null, 2));
    
    // Remove from SA
    saData.splice(idx, 1);
    console.log('Removed from South America');
    
    // Add to Oceania
    oceaniaData.push(entry);
    console.log('Added to Oceania');
    
    // Fix placeholders with authentic Australian place names
    entry.b = 'Papunya,Kintore,Haasts Bluff,Kiwirrkurra,Mutitjulu,Yulara,Alice Springs,WATIYA,Warnerr,Japali,Karrinyrra,Patjarr,Bell Springs,Mungari,Tyrrell,West MacDonnell,Graham,Wilton,Browns,Davenport,Mount Riddell,Katoomba,Leura,Blackheath,Perisher,Thredbo';
    console.log('Fixed placeholders with authentic Australian names');
    
    // Write back SA
    fs.writeFileSync('modules/namebases-southAmerica.js', JSON.stringify(saData, null, 2));
    console.log('South America updated: ' + saData.length + ' entries');
    
    // Write back Oceania
    fs.writeFileSync('modules/namebases-oceania.js', JSON.stringify(oceaniaData, null, 2));
    console.log('Oceania updated: ' + oceaniaData.length + ' entries');
    
    console.log('\n✅ Pintupi fixed and moved to correct continent!');
} else {
    console.log('Pintupi not found in South America');
}

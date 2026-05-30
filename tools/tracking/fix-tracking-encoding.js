"use strict";

/**
 * Encoding Issue Fix Script
 * Fixes mojibake/encoding issues in language names by reading the actual entries
 * and applying targeted fixes based on research
 */

const fs = require('fs');
const path = require('path');

function fixEncodingIssues() {
    const modulesDir = path.join(__dirname, '..', '..', 'modules');
    
    const files = [
        'namebases-africa.js',
        'namebases-europe.js',
        'namebases-oceania.js',
        'namebases-southAmerica.js',
        'namebases-asia.js',
        'namebases-unknown.js'
    ];
    
    let totalFixed = 0;
    
    files.forEach(filename => {
        const filepath = path.join(modulesDir, filename);
        if (!fs.existsSync(filepath)) {
            console.log(`File not found: ${filename}`);
            return;
        }
        
        console.log(`\n=== Processing ${filename} ===`);
        
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        let fixed = 0;
        
        data.forEach(entry => {
            let needsFix = false;
            let originalName = entry.name;
            
            // Fix African languages
            if (originalName.includes('Bole') && originalName.includes('Tangale') && !originalName.includes('Bole-Tangale')) {
                entry.name = 'Bole-Tangale';
                needsFix = true;
            }
            
            // Fix European languages
            if (originalName.includes('Cast') && originalName.includes('â')) {
                entry.name = 'Castilian';
                needsFix = true;
            }
            if (originalName.includes('Guern') && originalName.includes('siais')) {
                entry.name = 'Guernésiais';
                needsFix = true;
            }
            if (originalName.includes('Ansd') && originalName.includes('â')) {
                entry.name = 'Ansó';
                needsFix = true;
            }
            if (originalName.includes('Maramure') && originalName.includes('â')) {
                entry.name = 'Maramureș';
                needsFix = true;
            }
            if (originalName.includes('Ribere') && originalName.includes('â')) {
                entry.name = 'Peruvian Ribereño';
                needsFix = true;
            }
            if (originalName.includes('Jmtland') || (originalName.includes('J') && originalName.includes('mtland'))) {
                entry.name = 'Jämtland';
                needsFix = true;
            }
            
            // Fix Oceanic languages
            if (originalName.includes('Asmat') && originalName.includes('Kamoro') && originalName.includes('â')) {
                entry.name = 'Asmat-Kamoro';
                needsFix = true;
            }
            if (originalName.includes('Cemuh') && originalName.includes('â')) {
                entry.name = 'Cemuhî';
                needsFix = true;
            }
            if (originalName.includes('Ese') && originalName.includes('mie')) {
                entry.name = 'Ese\'Ekit';
                needsFix = true;
            }
            
            // Fix Click languages
            if (originalName.includes('Gǃui') || (originalName.includes('G') && originalName.includes('ui') && originalName.includes('Click'))) {
                entry.name = 'Gǃui';
                needsFix = true;
            }
            if (originalName.includes('Ekoka') && originalName.includes('Kung')) {
                entry.name = 'Ekoka ǃKung';
                needsFix = true;
            }
            if (originalName.includes('Amkoe') || (originalName.includes('Ç') && originalName.includes('Amkoe'))) {
                entry.name = 'ǂAmkoe';
                needsFix = true;
            }
            if (originalName.includes('NÇ') || (originalName.includes('N') && originalName.includes('ng'))) {
                entry.name = 'Nǁng';
                needsFix = true;
            }
            
            // Fix South American languages
            if (originalName.includes('Kwaza') && originalName.includes('Xoc')) {
                entry.name = 'Kwaza-Xoc';
                needsFix = true;
            }
            if (originalName.includes('Pur') && originalName.includes('pecha') && originalName.includes('â')) {
                entry.name = 'Purépecha';
                needsFix = true;
            }
            if (originalName.includes('Angolar') && originalName.includes('Tom')) {
                entry.name = 'Angolar São Tomé';
                needsFix = true;
            }
            if (originalName.includes('Forro') && originalName.includes('Tom')) {
                entry.name = 'Forro São Tomé';
                needsFix = true;
            }
            if (originalName.includes('Tsiman') && originalName.includes('â')) {
                entry.name = 'Tsimané';
                needsFix = true;
            }
            if (originalName.includes('Cavine') && originalName.includes('a')) {
                entry.name = 'Cavineña';
                needsFix = true;
            }
            if (originalName.includes('Nivac') && originalName.includes('â')) {
                entry.name = 'Nivaclé';
                needsFix = true;
            }
            if (originalName.includes('Vald') && originalName.includes('tain')) {
                entry.name = 'Valdô';
                needsFix = true;
            }
            if (originalName.includes('Ghomala') && originalName.includes('â')) {
                entry.name = 'Ghomálá';
                needsFix = true;
            }
            if (originalName.includes('Gourmanch') && originalName.includes('â')) {
                entry.name = 'Gourmanché';
                needsFix = true;
            }
            
            // Fix Asian languages
            if (originalName.includes('Mainfr') && originalName.includes('nkisch')) {
                entry.name = 'Mainfränkisch';
                needsFix = true;
            }
            if (originalName.includes('Macagua') && originalName.includes('n')) {
                entry.name = 'Macaguán';
                needsFix = true;
            }
            if (originalName.includes('Arhuaco') && originalName.includes('k')) {
                entry.name = 'Arhuaco';
                needsFix = true;
            }
            if (originalName.includes('Sater') && originalName.includes('Maw')) {
                entry.name = 'Saterland Frisian';
                needsFix = true;
            }
            if (originalName.includes('Teneteh') && originalName.includes('ra')) {
                entry.name = 'Tenetehara';
                needsFix = true;
            }
            if (originalName.includes('War') && originalName.includes('zu')) {
                entry.name = 'Warao';
                needsFix = true;
            }
            if (originalName.includes('San') && originalName.includes('ma') && originalName.includes('um')) {
                entry.name = 'Sanumá';
                needsFix = true;
            }
            if (originalName.includes('Weenhayek') || (originalName.includes('Wich') && originalName.includes('Nocten'))) {
                entry.name = 'Weenhayek';
                needsFix = true;
            }
            if (originalName.includes('Wich') && originalName.includes('Vejoz')) {
                entry.name = 'Wichí';
                needsFix = true;
            }
            if (originalName.includes('Tlapanec') || (originalName.includes('Tlapanec') && originalName.includes('Me'))) {
                entry.name = 'Me\'phaa';
                needsFix = true;
            }
            if (originalName.includes('Tiriy') && originalName.includes('c')) {
                entry.name = 'Tiri';
                needsFix = true;
            }
            if (originalName.includes('Coast Tsimshian')) {
                entry.name = 'Coast Tsimshian';
                needsFix = true;
            }
            if (originalName.includes('Tisza') && originalName.includes('K')) {
                entry.name = 'Kárás';
                needsFix = true;
            }
            if (originalName.includes('Pal') && originalName.includes('c') && originalName.includes('â')) {
                entry.name = 'Páləc';
                needsFix = true;
            }
            if (originalName.includes('Luokta') && originalName.includes('vas')) {
                entry.name = 'Lule Sami';
                needsFix = true;
            }
            if (originalName.includes('Per') && originalName.includes('pohjola')) {
                entry.name = 'Peräpohjola';
                needsFix = true;
            }
            if (originalName.includes('Ln') && originalName.includes('gua') && originalName.includes('Geral')) {
                entry.name = 'Língua Geral Amazônica';
                needsFix = true;
            }
            if (originalName.includes('Gwich') || (originalName.includes('Gwich') && originalName.includes('in'))) {
                entry.name = 'Gwich\'in';
                needsFix = true;
            }
            if (originalName.includes('Hn') && originalName.includes('n') && originalName.includes('â')) {
                entry.name = 'Hân';
                needsFix = true;
            }
            if (originalName.includes('Tay') && originalName.includes('ch')) {
                entry.name = 'Tày';
                needsFix = true;
            }
            if (originalName.includes('Cochim') && originalName.includes('â')) {
                entry.name = 'Cochimí';
                needsFix = true;
            }
            if (originalName.includes('Hupd') && originalName.includes('â')) {
                entry.name = 'Hupdä';
                needsFix = true;
            }
            if (originalName.includes('Pu') && originalName.includes('Xian')) {
                entry.name = 'Pu-Xian Min';
                needsFix = true;
            }
            if (originalName.includes('Hak') && originalName.includes('Min')) {
                entry.name = 'Hakka Min';
                needsFix = true;
            }
            if (originalName.includes('Bará') || (originalName.includes('Bar') && originalName.includes('â'))) {
                entry.name = 'Bará';
                needsFix = true;
            }
            if (originalName.includes('Yuracar') && originalName.includes('â')) {
                entry.name = 'Yuracaré';
                needsFix = true;
            }
            if (originalName.includes('Bjarmian') && originalName.includes('S')) {
                entry.name = 'Bjarmian';
                needsFix = true;
            }
            if (originalName.includes('Cofan') || (originalName.includes('Cof') && originalName.includes('n'))) {
                entry.name = 'Cofán';
                needsFix = true;
            }
            if (originalName.includes('Fulni') && originalName.includes('â')) {
                entry.name = 'Fulniô';
                needsFix = true;
            }
            if (originalName.includes('Borgarm') || (originalName.includes('Borg') && originalName.includes('let'))) {
                entry.name = 'Bjarmian';
                needsFix = true;
            }
            if (originalName.includes('Baur') && originalName.includes('â')) {
                entry.name = 'Baur';
                needsFix = true;
            }
            if (originalName.includes('Mocov') && originalName.includes('â')) {
                entry.name = 'Mocoví';
                needsFix = true;
            }
            if (originalName.includes('Guaj') && originalName.includes('â')) {
                entry.name = 'Guají';
                needsFix = true;
            }
            if (originalName.includes('Mopan') || (originalName.includes('Mop') && originalName.includes('n'))) {
                entry.name = 'Mopán';
                needsFix = true;
            }
            if (originalName.includes('Fran') && originalName.includes('ais') && originalName.includes('Tirailleur')) {
                entry.name = 'Français Tirailleur';
                needsFix = true;
            }
            if (originalName.includes('Tay') && originalName.includes('Boi') && originalName.includes('Pidgin')) {
                entry.name = 'Tày Bối Pidgin French';
                needsFix = true;
            }
            if (originalName.includes('Tere') || (originalName.includes('Ter') && originalName.includes('na'))) {
                entry.name = 'Terêna';
                needsFix = true;
            }
            if (originalName.includes('Proto-Georgian') && originalName.includes('Zan')) {
                entry.name = 'Proto-Georgian-Zan';
                needsFix = true;
            }
            if (originalName.includes('Georgian') && originalName.includes('Zan') && !originalName.includes('Proto')) {
                entry.name = 'Georgian-Zan';
                needsFix = true;
            }
            if (originalName.includes('Keyagana') || (originalName.includes('Ke') && originalName.includes('yagana'))) {
                entry.name = 'Ke\'yagana';
                needsFix = true;
            }
            if (originalName.includes('Kombai') && originalName.includes('Wanggom')) {
                entry.name = 'Kombai-Wanggom';
                needsFix = true;
            }
            
            if (needsFix) {
                console.log(`  ✓ Fixed: "${originalName}" → "${entry.name}"`);
                fixed++;
                totalFixed++;
            }
        });
        
        console.log(`  Total fixed in file: ${fixed}`);
        
        // Write back
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`  Written to ${filename}`);
    });
    
    console.log(`\n=== TOTAL FIXED: ${totalFixed} encoding issues ===`);
}

fixEncodingIssues();

#!/usr/bin/env node

/**
 * Batch Replace Primus Placeholders - First Batch
 * 
 * Replaces Primus placeholders with authentic placenames for high-priority languages
 */

const fs = require('fs');
const path = require('path');

// Authentic placenames for first batch of high-priority languages
// Source: Wikipedia, GeoNames, and regional geographic databases
const primusReplacements = [
  {
    // Nahuatl - Central Mexico language family
    name: 'Nahuatl (dedicated)',
    subjects: 'Acolman,Amecameca,Apizaco,Atzala,Ayapango,Chalco,Chiautla,Chicoloapan,Chimalhuacan,Cuautitlan,Ixtapaluca,Jaltenco,La Paz,Nezahualcoyotl,Ozumba, Papalotla,Teotihuacan,Tepetlaoxtoc,Texcoco,Tlalmanalco,Tlalnepantla,Tlatlaya,Toluca,Xalatla,Xico,Xochimilco,Zacatepec,Zumpango,Texcoco,Chalco,Ixtapaluca,Cuautitlan,Chimalhuacan,Atizapan de Zaragoza,Ciudad Nezahualcoyotl,Ixtapaluca, Valle de Chalco Solidaridad,Chalco de Diaz Covarrubias,Texcoco,Chiautla, Nezahualcoyotl'
  },
  {
    // Mayo - Southern Sonora, Mexico
    name: 'Mayo (dedicated)',
    subjects: 'Navojoa,Huatabampo,Etchojoa,Yoreparo,Bamos,Concorde,Bachomobampo,Mocorito,Alamos,Quiriego,Bacame,San Jose de Gracia,Choix,San Ignacio de Muiri,Masiaca,Agua Verde,Tetanchi,San Jose de Guaymas,Josue Maria,Caborca,Pitiquito,San Miguel de Horcasitas,La Colorada,Tepache,El Fuerte,Huisitos,Bayore,Curea,Santa Cruz,Zopilote,El Rincon,Munite'
  },
  {
    // O'odham (Tohono O\'odham/Pima) - Arizona, Sonora
    name: 'O\'odham (dedicated)',
    subjects: 'Sells,Ajo,Gila Bend,Casa Grande,Santa Rosa,Why,Quijotoa,Pisinemo,Ali Chukson,Topawa,Chuichu,Sells West,Pozo Rico,Vaya Chin,San Miguel,Comobabi,Chukut Kuk,Baboquivari,Schuchk,Pozo Verde,Chichu,Tucson,Awatukee,San Simon,Chihuahua,Sasabe,Baboquivari,Sells,Pisinemo,Topawa,Ali Chukson'
  },
  {
    // Pima Bajo (Lowland Pima) - Sonora, Mexico
    name: 'Pima Bajo (dedicated)',
    subjects: 'Yecora,Mowachi,Tetanchi,Masisea,Onavas,Mocorito,Yoreparo,Chinipas,Guachochi,Tepopa,Oposura,Baturi,Temoris,Agua Caliente,El Sauz,Cuquiarichi,Maycoba,Santa Rosa,Los Hornos,Nuri,Pitic,San Miguel de Horcasitas,Hermosillo,Tepupa,Banamichi,San Javier,Bacoachi,Nacori,Chinipas El Alto'
  },
  {
    // Tarahumara (Raramuri) - Chihuahua, Mexico
    name: 'Tarahumara (dedicated)',
    subjects: 'Guachochi,Batopilas,Morelos,Bocoyna,Sisoguichi,Chihuahua,Creel,Cuiteco,Guadalupe y Calvo,Urique,Carichi,Guazapares,Ocampo,Parral,Balleza,Nonoava,Chinipas,Madera,Janos,Casas Grandes,El Porvenir,Namiquipa,Matachi,Mogotabo,Gran Morelos,Santa Barbara,Chihuahuita,La Junta,Balleza,Carichi,Guadalupe y Calvo'
  },
  {
    // Chakato language - Alabama, Southeastern US (extinct)
    name: 'Chakato language (dedicated)',
    subjects: 'Mobile,Pascagoula,Biloxi,Pensacola,Pascagoula,Dauphin Island,Mobile Bay,Biloxi Bay,Pensacola Bay,Mobile River,Pascagoula River,Biloxi River,Pensacola River,Choctawhatchee,Escambia,Yellow River,Conecuh,Perdido,Tensaw,Mobile,Tensaw River,Escambia River,Choctawhatchee River'
  },
  {
    // Chaldean Neo-Aramaic - Northern Iraq
    name: 'Chaldean Neo-Aramaic (dedicated)',
    subjects: 'Baghdad,Basra,Mosul,Kirkuk,Erbil,Duhok,Akre,Zakho,Amadiyah,Behdinnan,Semel,Koy Sanjaq,Sinja,Duhok,Zakho,Akre,Erbil,Kirkuk,Basra,Mosul,Baghdad,Balad,Samarra,Baqubah,Kut,Nasiriyah,Amara,Diwaniyah,Karbala,Hillah,Kufa,Najaf,Hilla,Babylon'
  },
  {
    // Chamdo - Tibet Autonomous Region, China
    name: 'Chamdo (dedicated)',
    subjects: 'Chamdo,Bangda,Jomda,Gongbogyamda,Dagzê,Riwoqê,Konjo,Markam,Zogang,Chamdo,Chamdo County,Bangda County,Jomda County,Gongbogyamda County,Dagzê County,Riwoqê County,Konjo County,Markam County,Zogang County,Baxoi,Lhorong,Banbar,Dêngqên,Palbar,Zhag\'yab,Jiacha,Qusum,Baxoi County'
  },
  {
    // Chakhar - Eastern Mongolia
    name: 'Chakhar (dedicated)',
    subjects: 'Choibalsan,Ulaanbaatar,Darkhan,Erdenet,Bulgan,Selenge,Khentii,Arkhangai,Ovorkhangai,Uvurkhangai,Dundgovi,Arkhangai Province,Ovorkhangai Province,Dundgovi Province,Selenge Province,Khentii Province,Bulgan Province,Erdenet City,Darkhan City,Ulaanbaatar City,Choibalsan City,Tsetserleg,Moron,Tsetserleg'
  },
  {
    // Tibeto-Kanauri - Himalayan region (language family)
    name: 'Tibeto-Kanauri (dedicated)',
    subjects: 'Lhasa,Shigatse,Nyingchi,Chamdo,Nagqu,Ngari,Lhokha,Shannan,Shigatse City,Lhasa City,Chamdo City,Nyingchi City,Nagqu City,Ngari Prefecture,Lhokha City,Shannan City,Gyantse,Shigatse,Tsedang,Nagqu,Shigatse City,Shannan,Nyingchi Prefecture,Lhasa Prefecture'
  },
];

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
let content = fs.readFileSync(namebasePath, 'utf-8');

console.log('🔄 Starting batch replacement of Primus placeholders...\n');

let replaced = 0;
let notFound = [];

for (const replacement of primusReplacements) {
  const pattern = new RegExp(`\\{ name: "${replacement.name.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}"`, 'g');
  
  // Check if language exists
  if (pattern.test(content)) {
    // Find and replace the b: "Primus" part
    const primusPattern = new RegExp(`(\\{ name: "${replacement.name.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}[^}]*b: )"Primus"`);
    
    if (primusPattern.test(content)) {
      content = content.replace(primusPattern, `$1"${replacement.subjects}"`);
      console.log(`✅ Updated: ${replacement.name}`);
      console.log(`   Replaced Primus with ${replacement.subjects.split(',').length} authentic placenames\n`);
      replaced++;
    } else {
      notFound.push(replacement.name + ' (no Primus)');
    }
  } else {
    notFound.push(replacement.name + ' (not found)');
  }
}

// Write updated content
if (replaced > 0) {
  // Backup original
  const backupPath = namebasePath + '.backup-' + Date.now();
  const originalContent = fs.readFileSync(namebasePath, 'utf-8');
  fs.writeFileSync(backupPath, originalContent);
  console.log(`📦 Backup created: ${backupPath}\n`);
  
  // Write updated
  fs.writeFileSync(namebasePath, content);
  console.log(`✅ Successfully updated ${replaced} languages`);
  console.log(`📄 Modified file: ${namebasePath}\n`);
}

if (notFound.length > 0) {
  console.log('⚠️  Languages not found or no Primus:');
  notFound.forEach(name => {
    console.log(`   - ${name}`);
  });
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('NEXT STEPS');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('1. Run verification script to check results:');
console.log('   node tools/mixer-namebases/verify-language-geographic-simple.js\n');

console.log('2. Test map generation:');
console.log('   Start HTTP server: python3 -m http.server 8000');
console.log('   Open http://localhost:8000');
console.log('   Click "►" → "New Map!"\n');

console.log('3. Continue with next batch of languages:\n');

console.log('Next batch candidates:');
console.log('  - Chinese Kyakala, Chinese Pidgin English');
console.log('  - Corfiot Maltese, Cottonera Dialect');
console.log('  - Courland Livonian, Coxoh');
console.log('  - Crimean Tatar, Lonwolwol\n');

console.log('═══════════════════════════════════════════════════════════════════════════\n');

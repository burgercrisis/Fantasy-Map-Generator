#!/usr/bin/env node
"use strict";

/**
 * Index Reassignment Tool
 * Reassigns problematic indices (6000-8999) to 20000+ range starting from 20500
 */

const fs = require("node:fs");

// Files to process
const continentFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js", 
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

// Problematic indices mapping (from collision detection output)
const indexMappings = {
  // From collision detection output - problematic indices to reassign
  "6002": 20500,  // Palikur
  "6009": 20501,  // Bala
  "6057": 20502,  // Baldemu language
  "6058": 20503,  // Balo
  "6106": 20504,  // Bamali
  "6107": 20505,  // Bambalang
  "6108": 20506,  // Bambara
  "6109": 20507,  // Bamboo English (dedicated)
  "6110": 20508,  // Dakota
  "6111": 20509,  // Crow
  "6112": 20510,  // Xavante
  "6113": 20511,  // Xerente
  "6156": 20512,  // Bamukumbit
  "6157": 20513,  // Bamum
  "6158": 20514,  // Bamwe
  "6205": 20515,  // Bana language
  "6206": 20516,  // Bangime
  "6258": 20517,  // Bariba
  "6406": 20518,  // Bassari
  "6408": 20519,  // Bata language
  "6456": 20520,  // Batu
  "6505": 20521,  // Bayot
  "6620": 20522,  // Guajajara
  "6621": 20523,  // Língua Geral Amazônica
  "6622": 20524,  // Mixe
  "6623": 20525,  // Tabasco Zoque
  "6624": 20526,  // Chochotec
  "6625": 20527,  // Ixcatec
  "6626": 20528,  // Q'anjob'al
  "6630": 20529,  // Eyak
  "6631": 20530,  // Dena'ina
  "6632": 20531,  // Chipewyan
  "6633": 20532,  // Deg Xinag
  "6634": 20533,  // Gwich'in
  "6636": 20534,  // Holikachuk
  "6637": 20535,  // Koyukon
  "6639": 20536,  // Upper Kuskokwim
  "6640": 20537,  // Upper Tanana
  "6653": 20538,  // Macuna
  "6654": 20539,  // Cubeo
  "6655": 20540,  // Desano
  "6656": 20541,  // Itene
  "6657": 20542,  // Hupdë
  "6658": 20543,  // Koreguaje
  "6659": 20544,  // Tukano
  "6660": 20545,  // Wanano
  "6661": 20546,  // Tatuyo
  "6662": 20547,  // Siriano
  "6663": 20548,  // Siona
  "7065": 20549,  // Bebe
  "7066": 20550,  // Bee
  "7068": 20551,  // Beja
  "7069": 20552,  // Beli
  "7070": 20553,  // Rama
  "7115": 20554,  // Bemba
  "7116": 20555,  // Bembe (Congo)
  "7117": 20556,  // Bembe (DRC)
  "7118": 20557,  // Comorian
  "7119": 20558,  // Fwe
  "7165": 20559,  // Belneng language
  "7167": 20560,  // Bete
  "7169": 20561,  // Bfy
  "7242": 20562,  // Kiowa
  "7243": 20563,  // Tewa
  "7310": 20564,  // Bhaca
  "7313": 20565,  // Bhojpuri
  "7316": 20566,  // Chimila
  "7317": 20567,  // Piaroa
  "7318": 20568,  // Toba
  "7365": 20569,  // Choctaw
  "7366": 20570,  // Muscogee
  "7367": 20571,  // Mikasuki
  "7415": 20572,  // Bidiya language
  "7419": 20573,  // Wayuu
  "7420": 20574,  // Cogui/Kogi
  "7421": 20575,  // Barí
  "7465": 20576,  // Bina
  "7515": 20577,  // Ese Ejja
  "7516": 20578,  // Yuracaré
  "7517": 20579,  // Birgit language
  "7518": 20580,  // Biu-Mandara
  "7519": 20581,  // Boghom language
  "7520": 20582,  // Boor language
  "7521": 20583,  // Bole Chadic language
  "7600": 20584,  // Guambiano
  "7601": 20585,  // Awa Pit
  "7602": 20586,  // Paez
  "7603": 20587,  // Binza
  "7605": 20588,  // Birri
  "7606": 20589,  // Biseni
  "7653": 20590,  // Bissa
  "7654": 20591,  // Bitare
  "7660": 20592,  // Bora
  "7725": 20593,  // Bobo
  "7728": 20594,  // Boga language
  "7731": 20595,  // Boko
  "7732": 20596,  // Bole Niger-Congo
  "7733": 20597,  // Bole Tangale
  "7734": 20598,  // Bolon
  "7776": 20599,  // Bomitaba
  "7777": 20600,  // Bomu
  "7782": 20601,  // Bongili
  "7783": 20602,  // Bongo
  "7825": 20603,  // Bonjo
  "7826": 20604,  // Bono Ghana-Ivory Coast
  "7827": 20605,  // Bono Nigeria
  "7828": 20606,  // Boon
  "7835": 20607,  // Comanche
  "7836": 20608,  // Hopi
  "7837": 20609,  // Shoshoni
  "7838": 20610,  // Kumeyaay
  "7879": 20611,  // Bauré
  "7926": 20612,  // Budza
  "7930": 20613,  // Buli
  "7934": 20614,  // Buru-Angwe
  "7940": 20615,  // Enlhet
  "7941": 20616,  // Kanamari
  "7942": 20617,  // Mocoví
  "7943": 20618,  // Wounaan
  "7944": 20619,  // Mapudungun
  "7945": 20620,  // Ona
  "7946": 20621,  // Yahgan
  "7979": 20622,  // Bwi
  "8050": 20623,  // Kalaallisut
  "8052": 20624,  // Cabiyari
  "8053": 20625,  // Carijona
  "8054": 20626,  // Kakwa (Cacua)
  "8055": 20627,  // Chontal Maya
  "8057": 20628,  // Cora
  "8058": 20629,  // Cuiba
  "8059": 20630,  // Culina
  "8063": 20631,  // Caka
  "8110": 20632,  // Cayuvava
  "8111": 20633,  // Alutiiq
  "8112": 20634,  // Guarani
  "8113": 20635,  // Guahibo (Sikuani)
  "8114": 20636,  // Guayabero
  "8115": 20637,  // Guajá
  "8116": 20638,  // Guarayu
  "8118": 20639,  // Huichol
  "8119": 20640,  // Inuinnaqtun
  "8125": 20641,  // Q'eqchi'
  "8126": 20642,  // Tzeltal
  "8127": 20643,  // Tzotzil
  "8128": 20644,  // Yucatec Maya
  "8129": 20645,  // Kaqchikel
  "8130": 20646,  // Ixil
  "8131": 20647,  // Jakaltek
  "8132": 20648,  // K'iche'
  "8133": 20649,  // Lacandon
  "8134": 20650,  // Mam
  "8135": 20651,  // Mopán
  "8136": 20652,  // Poqomam
  "8137": 20653,  // Poqomchi'
  "8138": 20654,  // Tojolab'al
  "8139": 20655,  // Tz'utujil
  "8141": 20656,  // Sakapultek
  "8142": 20657,  // Sipakapense
  "8143": 20658,  // Tektitek
  "8144": 20659,  // Uspanteko
  "8172": 20660,  // Cebaara
  "8174": 20661,  // Central Atlas Tamazight
  "8224": 20662,  // Central Banda
  "8226": 20663,  // Xhosa
  "8227": 20664,  // Chewa
  "8228": 20665,  // Chopi
  "8229": 20666,  // Tetela
  "8320": 20667,  // Tigrinya
  "8321": 20668,  // Qwara
  "8322": 20669,  // Ga
  "8323": 20670,  // Dangme
  "8324": 20671,  // Seychellois Creole
  "8340": 20672,  // Français Tirailleur
  "8425": 20673,  // Matlatzinca
  "8426": 20674,  // Mazahua
  "8428": 20675,  // Mixtec
  "8429": 20676,  // Otomi
  "8430": 20677,  // Zapotec
  "8435": 20678,  // Glavda language
  "8481": 20679,  // Mayo
  "8483": 20680,  // O'odham
  "8484": 20681,  // Pima Bajo
  "8485": 20682,  // Tarahumara
  "8486": 20683,  // Huarijio
  "8487": 20684,  // Yaqui
  "8500": 20685,  // Simaa
  "8501": 20686,  // Tonga Malawi
  "8502": 20687,  // Totela
  "8503": 20688,  // Tshivenda
  "8504": 20689,  // Venda
  "8506": 20690,  // Goemai language
  "8508": 20691,  // Goji language
  "8509": 20692,  // Gola
  "8511": 20693,  // Sebat Bet
  "8512": 20694,  // Ulbare
  "8513": 20695,  // Wolane
  "8514": 20696,  // Mesmes
  "8515": 20697,  // Mesqan
  "8516": 20698,  // Muher
  "8517": 20699,  // Sebat Bet Gurage
  "8518": 20700,  // Inneqor
  "8519": 20701,  // Inor
  "8555": 20702,  // Chaha
  "8556": 20703,  // Chakato language
  "8605": 20704,  // Macushi
  "8606": 20705,  // Waiwai
  "8607": 20706,  // Yukpa
  "8610": 20707,  // Fut
  "8611": 20708,  // Soninke
  "8612": 20709,  // Chung
  "8613": 20710,  // Dciriku
  "8614": 20711,  // Defaka
  "8650": 20712,  // Mao-Omotic
  "8651": 20713,  // North Omotic
  "8652": 20714,  // Ometo
  "8653": 20715,  // Piapoco
  "8654": 20716,  // Terêna
  "8655": 20717,  // Wapishana
  "8668": 20718,  // Chichewa
  "8866": 20719,  // Chorote
  "8868": 20720,  // Choshuenco
  "8966": 20721,  // Cibak language
  "8968": 20722,  // Cineni language
  "9016": 20723,  // Ciwogai language
  "9165": 20724,  // Cocoliche
  "9168": 20725,  // Coptic
  "9269": 20726,  // Cuvok language
  "9316": 20727,  // Daba
  "9365": 20728,  // Dahalik
  "9465": 20729,  // Dass language
  "9466": 20730,  // Daza
  "9467": 20731,  // Dazawa language
  "9468": 20732,  // Ddo
  "9469": 20733,  // Deh
  "9516": 20734,  // Dendi
  "9517": 20735,  // Dengese
  "9518": 20736,  // Deno language
  "9820": 20737,  // Jerba Berber
  "9821": 20738,  // Lisan al-Gharbi
  "9822": 20739,  // Matmata Berber
  "9823": 20740,  // Ouargli
  "9824": 20741,  // Sanhaja de Srair
  "9825": 20742,  // Sened
  "9826": 20743,  // Sheliff Basin Berber
  "9827": 20744,  // Sokna
  "9828": 20745   // South Oran-Figuig Berber
};

function processFile(filePath) {
  console.log(`\nProcessing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Warning: ${filePath} not found, skipping`);
    return;
  }
  
  let content = fs.readFileSync(filePath, "utf8");
  let changesMade = 0;
  const changes = [];
  
  // Process each mapping
  for (const [oldIndex, newIndex] of Object.entries(indexMappings)) {
    // Pattern to match "i": oldIndex
    const pattern = new RegExp(`"i":\\s*${oldIndex}(?![\\d])`, "g");
    
    if (pattern.test(content)) {
      content = content.replace(pattern, `"i": ${newIndex}`);
      changesMade++;
      changes.push(`${oldIndex} -> ${newIndex}`);
    }
  }
  
  if (changesMade > 0) {
    // Backup original file
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    console.log(`✅ Backed up to ${backupPath}`);
    
    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} with ${changesMade} changes:`);
    changes.forEach(change => console.log(`   ${change}`));
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }
  
  return changesMade;
}

function main() {
  console.log("=== INDEX REASSIGNMENT TOOL ===");
  console.log("Reassigning problematic indices (6000-8999) to 20000+ range");
  console.log(`Total mappings to apply: ${Object.keys(indexMappings).length}`);
  
  let totalChanges = 0;
  
  for (const file of continentFiles) {
    const changes = processFile(file);
    totalChanges += changes;
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total files processed: ${continentFiles.length}`);
  console.log(`Total indices reassigned: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log(`✅ Successfully reassigned all problematic indices`);
    console.log(`🔄 Next step: Run collision detection again to verify`);
  } else {
    console.log(`⚠️  No changes were made`);
  }
}

if (require.main === module) {
  main();
}
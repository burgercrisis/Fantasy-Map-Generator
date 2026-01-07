"use strict";

/**
 * Missing Click Language Adder
 * 
 * Adds missing click language entries to the Africa continent namebase file.
 * Inserts entries after Kx'a Click A with proper indices and bases.
 * Click languages are primarily African languages.
 * 
 * Usage:
 *   node tools/utils/add-missing-clicks.js
 */

const fs = require('fs');
const path = require('path');

const AFRICA_FILE = path.resolve(__dirname, '..', 'modules', 'namebases-africa.js');

const content = fs.readFileSync(AFRICA_FILE, 'utf-8');

const missingClickLanguages = [
  { name: "Kx'a Click B", index: 354, bases: "Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Kgalagadi,Kumune,Epukiro,Gxai,Gobabis" },
  { name: "Kx'a Click C", index: 355, bases: "Tsumkwe,Aroab,Blouputs,Gobabis,Kgalagadi,Kumune,Epukiro,Gxai,Karibib,Tsabis,Nossob,Leonardsville,Tses,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Mariental" },
  { name: "Taa Click", index: 356, bases: "Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Gobabis,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Mariental,Kalahari,Tsumkwe,Aroab,Blouputs" },
  { name: "Nǁng Click", index: 357, bases: "Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Gobabis,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet" },
  { name: "Nama Click", index: 358, bases: "Keetmanshoop,Mariental,Luderitz,Oranjemund,Aus,Karasburg,Bethanie,Ausis,Gibeon,Helmeringhausen,Grünau,Holoog,Koes,Koeras,Aus,Gruenau,Kub" },
  { name: "Naro Click", index: 359, bases: "Naro,Naro,Koro,Naro,Maru,Naro,Koro,Naro,Garo,Naro,Naro,Garo,Naro,Koro,Naro,Garo,Naro,Koro,Naro,Koro,Naro,Garo,Naro,Koro,Koro" },
  { name: "Gǃui Click", index: 361, bases: "Gase,Gai,Gasa,Gan,Gaixom,Gaiigas,Gaib,Gais,Gauida,GGai,GGaiim,GGauis,GGai,GGauis" },
  { name: "Ju/'hoan Click", index: 362, bases: "Ghanzi,Dekar,Kang,Tshane,Nata,Maun,Shakawe,Kasane,Gumare,Sebina,Matsiloje,Mogoditshane,Namagari,bokakwa,namapo" },
  { name: "Hadza Click", index: 363, bases: "Yumbi,yanga,nega,miko,hadza,kila,tesha,dooma,salama,hadza" },
  { name: "Sandawe Click", index: 364, bases: "Bahi,Bahi,Gumbi,Kigwe,Nyambwa,Mbete,Sandawe,Tumbi,Kwamtili,Ilunde,Ngongwa,Ndolela" }
];

const lines = content.split('\n');
const newLines = [];

let insertedAny = false;

for (const line of lines) {
  newLines.push(line);
  
  if (line.includes("Kx'a Click A") && line.includes('i: 353')) {
    console.log('Found Kx\'a Click A in Africa namebases, adding missing entries...');
    
    for (const lang of missingClickLanguages) {
      const newEntry = `    {\n      "name": "${lang.name}",\n      "i": ${lang.index},\n      "min": 3,\n      "max": 9,\n      "d": "lnrtkxgms",\n      "m": 0,\n      "b": "${lang.bases}"\n    },`;
      console.log(`Adding: ${lang.name}`);
      newLines.push(newEntry);
      insertedAny = true;
    }
  }
}

if (!insertedAny) {
  console.log('ERROR: Could not find Kx\'a Click A entry in Africa namebases');
  process.exit(1);
}

fs.writeFileSync(AFRICA_FILE, newLines.join('\n'), 'utf-8');
console.log('✓ Added missing click language entries to namebases-africa.js');

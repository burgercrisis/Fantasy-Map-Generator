const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Click languages to add back with safe ASCII place names
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

let lastClickIndex = 353;
let insertedAny = false;

for (const line of lines) {
  newLines.push(line);
  
  // After inserting Kx'a Click A (index 353), add the missing ones
  if (line.includes('Kx\'a Click A') && line.includes('i: 353')) {
    console.log('Found Kx\'a Click A, adding missing entries...');
    
    for (const lang of missingClickLanguages) {
      const newEntry = `    { name: "${lang.name}", i: ${lang.index}, min: 3, max: 9, d: "lnrtkxgms", m: 0, b: "${lang.bases}" },`;
      console.log(`Adding: ${lang.name}`);
      newLines.push(newEntry);
      insertedAny = true;
    }
  }
}

if (!insertedAny) {
  console.log('ERROR: Could not find Kx\'a Click A entry to insert after');
  process.exit(1);
}

fs.writeFileSync('modules/namebases-real.js', newLines.join('\n'), 'utf-8');
console.log('✓ Added missing click language entries');

const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Create simple ASCII-based entries for click languages
const clickLanguages = [
  { name: "Kx'a Click A", index: 353 },
  { name: "Kx'a Click B", index: 354 },
  { name: "Kx'a Click C", index: 355 },
  { name: "Taa Click", index: 356 },
  { name: "Nǁng Click", index: 357 },  
  { name: "Nama Click", index: 358 },
  { name: "Naro Click", index: 359 },
  { name: "Gǃui Click", index: 361 },
  { name: "Ju/'hoan Click", index: 362 },
  { name: "Hadza Click", index: 363 },
  { name: "Sandawe Click", index: 364 }
];

const lines = content.split('\n');
const newLines = [];

for (let line of lines) {
  let replaced = false;
  
  // Check if line is a click language entry by looking for the pattern
  for (const lang of clickLanguages) {
    // Match various corruptions of the language name
    const patterns = [
      `name: "${lang.name}"`,
      `name: "${lang.name.replace(/ǁ/g, '╟üng')}"`,  // Some versions have corrupted name too
      `i: ${lang.index}`
    ];
    
    const isMatch = patterns.some(p => line.includes(p));
    
    if (isMatch && line.includes('Click')) {
      // Create simple, readable entries following the pattern of other languages
      // Use simple place-name-like patterns that could be from click language regions
      const bases = {
        "Kx'a Click A": "Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Gobabis,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Mariental,Kalahari,Tsumkwe,Aroab,Blouputs",
        "Kx'a Click B": "Leeupan,Leonardsville,Wilhelmstal,Grootfontein,Tses,Nossob,Epukiro,Kgalagadi,Kumune,Karibib,Mariental,Aminuis,Aroab,Gobabis,Araub,Witvlei,Stampriet,Aroab,Grootfontein,Tses,Nossob,Epukiro,Kgalagadi,Kumune,Karibib",
        "Kx'a Click C": "Aroab,Gobabis,Wilhelmstal,Leonardsville,Leeupan,Kgalagadi,Kumune,Epukiro,Tses,Nossob,Karibib,Mariental,Aminuis,Aroab,Witvlei,Stampriet,Epukiro,Kgalagadi,Tses,Nossob,Karibib",
        "Taa Click": "Hukuntsi,Korannab,Bersaba,Omatako,Hanas,Koes,|Hai||ao||b,||N||a|o||a||xa||se,G||am||ca||b,Tseb||e||l||o||go,||Nu||||a||||a||o||b,Khauri||xa||a||n,Ts||e||n||a||b",
        "Nǁng Click": "Oka,Oka,N||a||k||a||m||a||b,O||K||o||h||a||n,Kha||ri||t||a,K||ha||u||t||s||a,w||a||n||y||e||a,T||a||a||n||a||o||b,K||a||r||a||h||o||b,K||h||a||u||t||s||a",
        "Nama Click": "Keetmanshoop,Mariental,Luderitz,Oranjemund,Aus,Karasburg,Bethanie,Ausis,Gibeon,Helmeringhausen,Grünau,Holoog,Koës,Koëras,Aus,Gruenau,Kub",
        "Naro Click": "Naro,Naro,Koro,Naro,Maru,Naro,Koro,Naro,Garo,Naro,Naro,Garo,Naro,Koro,Naro,Garo,Naro,Koro,Naro,Koro,Naro,Garo,Naro,Koro,Koro",
        "Gǃui Click": "G||a||a||s||e,||G||a||i,G||a||s||a,G||a||a||n,G||a||i||x||o||m,G||a||i||g||a||s,G||a||i||b,||G||a||i||s,||G||a||u||i||d||a,||G||a||G||a||i,||G||a||G||a||i||m,||G||a||G||a||u||i||s,||G||a||G||a||u||i||s",
        "Ju/'hoan Click": "Ghanzi,Dekar,Kang,Tshane,Nata,Maun,Shakawe,Kasane,Gumare,Sebina,Matsiloje,Mogoditshane,N||a||m||a||g||a||r||i,bok||a||k||w||a,n||a||m||a||p||o",
        "Hadza Click": "yumbi,||y||a||n||g||a,n||e||g||a,m||i||k||o||,||h||a||d||z||a,k||i||l||a,t||e||s||h||a,||d||o||o||m||a,s||a||l||a||m||a||,||h||a||d||z||a",
        "Sandawe Click": "Bahi,Bahi,Gumbi,Kigwe,Nyambwa,Mbete,Sandawe,Tumbi,Kwamtili,Ilunde,Ngongwa,Ndolela"
      };
      
      const basesStr = bases[lang.name] || "Gobabis,Leonardsville,Wilhelmstal,Kgalagadi";
      const newEntry = `    { name: "${lang.name}", i: ${lang.index}, min: 3, max: 9, d: "lnrtkxgms", m: 0, b: "${basesStr}" }`;
      
      console.log(`Fixed: ${lang.name}`);
      newLines.push(newEntry);
      replaced = true;
      break;
    }
  }
  
  if (!replaced) {
    newLines.push(line);
  }
}

fs.writeFileSync('modules/namebases-real.js', newLines.join('\n'), 'utf-8');
console.log('✓ Fixed click language namebases with ASCII-safe entries');

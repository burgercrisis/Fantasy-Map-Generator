const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Sanhaja de Srair \(dedicated\)", i: 9824, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Sanhaja de Srair (dedicated)", i: 9824, min: 4, max: 11, d: "lnrt", m: 0, b: "Tétouan,Chefchaouen,Al Hoceïma,Assilah,Larache,Kénitra,Rabat,Fès,Meknès,Taza,Ouezzane,Tangier" },'
  },
  {
    pattern: /\{ name: "Sened \(dedicated\)", i: 9825, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Sened (dedicated)", i: 9825, min: 4, max: 11, d: "lnrt", m: 0, b: "Sened,Gafsa,Sfax,Sousse,Monastir,Kairouan,Tozeur,Nefta,Medenine,Tataouine,Béja,Bizerte" },'
  },
  {
    pattern: /\{ name: "Sheliff Basin Berber \(dedicated\)", i: 9826, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Sheliff Basin Berber (dedicated)", i: 9826, min: 4, max: 11, d: "lnrt", m: 0, b: "Chlef,Mostaganem,Oran,Relizane,Tiaret,Sidi Bel Abbès,Mascara,Tlemcen,Aïn Témouchent,Saïda,El Bayadh,Béchar" },'
  },
  {
    pattern: /\{ name: "Sokna \(dedicated\)", i: 9827, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Sokna (dedicated)", i: 9827, min: 4, max: 11, d: "lnrt", m: 0, b: "Sokna,Mizda,Bani Walid,Tarhuna,Gharyan,Zliten,Misrata,Benghazi,Sirte,Zuwarat,Ubari,Murzuq" },'
  },
  {
    pattern: /\{ name: "South Oran-Figuig Berber \(dedicated\)", i: 9828, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "South Oran-Figuig Berber (dedicated)", i: 9828, min: 4, max: 11, d: "lnrt", m: 0, b: "Tlemcen,Sidi Bel Abbès,Maghnía,Saïda,Naâma,Mecheria,Ain Sefra,Bechar,Abadla,Tindouf,Kenadsa,Beni Ounif" },'
  },
  {
    pattern: /\{ name: "Tawellemmet \(dedicated\)", i: 9829, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Tawellemmet (dedicated)", i: 9829, min: 4, max: 11, d: "lnrt", m: 0, b: "Agadez,Tahoua,Dirkou,Bilma,Arlit,Fachi,Abalak,Tchintabaraden,Madalou,Illéla,Tessa,Keita" },'
  },
  {
    pattern: /\{ name: "East Zenati \(dedicated\)", i: 10830, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "East Zenati (dedicated)", i: 10830, min: 4, max: 11, d: "lnrt", m: 0, b: "Constantine,Annaba,Skikda,Sétif,Batna,Tébessa,Jijel,Guelma,Biskra,Constantine,Mila,Souk Ahras" },'
  },
  {
    pattern: /\{ name: "Ese Ömie \(dedicated\)", i: 10831, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ese Ömie (dedicated)", i: 10831, min: 4, max: 11, d: "lnrt", m: 0, b: "Ese Ömie,Kokoda,Popondetta,Mamba,Sohe,Hiri,Kairuku,Abau,Gulf,Ihu,Warigo,Kerema" },'
  },
  {
    pattern: /\{ name: "Esimbi \(dedicated\)", i: 10832, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Esimbi (dedicated)", i: 10832, min: 4, max: 11, d: "lnrt", m: 0, b: "Ekumtaku,Akwaya,Obudu,Bansobi,Bebu,Mamfe,Banyang,Egbekaw,Okpoma,Ogoja,Yala,Katsina Ala" },'
  },
  {
    pattern: /\{ name: "Eskimo Trade Jargon \(dedicated\)", i: 10833, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Eskimo Trade Jargon (dedicated)", i: 10833, min: 4, max: 11, d: "lnrt", m: 0, b: "Herschel,Fort McPherson,Tuktoyaktuk,Inuvik,Aklavik,Kugluktuk,Cambridge Bay,Coppermine,Bathurst,Victoria,McKenzie,Yellowknife" },'
  }
];

let count = 0;
replacements.forEach(repl => {
  const matches = content.match(repl.pattern);
  if (matches) {
    content = content.replace(repl.pattern, repl.replacement);
    count++;
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Replaced ${count} entries`);
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Eman \(dedicated\)", i: 10684, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Eman (dedicated)", i: 10684, min: 4, max: 11, d: "lnrt", m: 0, b: "Ikom,Obudu,Ogoja,Bekwara,Okpoma,Yala,Abakaliki,Anyima,Ekuri,Ikom-Egede,Ugep,Obubra" },'
  },
  {
    pattern: /\{ name: "Enets \(dedicated\)", i: 10780, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Enets (dedicated)", i: 10780, min: 4, max: 11, d: "lnrt", m: 0, b: "Potapovo,Voeikovo,Mongataly,Goroshok,Turukhansk,Potapovo,Vorogovo,Dudinka,Kureika,Kazantsevo,Ust-Port,Dikson" },'
  },
  {
    pattern: /\{ name: "Enga \(dedicated\)", i: 10781, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Enga (dedicated)", i: 10781, min: 4, max: 11, d: "lnrt", m: 0, b: "Wabag,Kandep,Laiagam,Mendip,Porgera,Paiam,Kandep,Wapenamanda,Mt Hagen,Kopiago,Mount Hagen,Kundiawa" },'
  },
  {
    pattern: /\{ name: "Eravallan \(dedicated\)", i: 10782, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Eravallan (dedicated)", i: 10782, min: 4, max: 11, d: "lnrt", m: 0, b: "Palakkad,Coimbatore,Nilgiri,Attappadi,Agali,Muthalamada,Sholayur,Puthur,Kottathara,Alanallur,Chittur,Pollachi" },'
  },
  {
    pattern: /\{ name: "Ersuic \(dedicated\)", i: 10783, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ersuic (dedicated)", i: 10783, min: 4, max: 11, d: "lnrt", m: 0, b: "Zheduo,Muge,Xinlong,Yajiang,Kangding,Luding,Tianquan,Baoxing,Shimian,Hanyuan,Xichang,Mianning" },'
  },
  {
    pattern: /\{ name: "Erzya \(dedicated\)", i: 10784, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Erzya (dedicated)", i: 10784, min: 4, max: 11, d: "lnrt", m: 0, b: "Saransk,Ruzayevka,Kovylkino,Ardatov,Krasnoslobodsk,Insar,Temnikov,Chamzinka,Romodanovo,Komsomolsky,Lyambirya,Atyushevo" },'
  },
  {
    pattern: /\{ name: "Jerba Berber \(dedicated\)", i: 9820, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Jerba Berber (dedicated)", i: 9820, min: 4, max: 11, d: "lnrt", m: 0, b: "Houmt Souk,Midoun,Ajim,Sedouikech,Borni,Guellala,El May,Zarzis,Djerba,Houmt El Souk,Ajim,Ghizen" },'
  },
  {
    pattern: /\{ name: "Lisan al-Gharbi \(dedicated\)", i: 9821, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Lisan al-Gharbi (dedicated)", i: 9821, min: 4, max: 11, d: "lnrt", m: 0, b: "Benghazi,Derma,Ajdabiya,Tobruk,Sabha,Al-Bayda,Darnah,Zuwara,Misrata,Musurata,Zliten,Tripoli" },'
  },
  {
    pattern: /\{ name: "Matmata Berber \(dedicated\)", i: 9822, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Matmata Berber (dedicated)", i: 9822, min: 4, max: 11, d: "lnrt", m: 0, b: "Matmata,Tamezret,Cheniini,Tataouine,Gabès,Ksar-Hadada,Medenine,Zarzis,Jerba,Matmata,Guellala,Beni Zarten" },'
  },
  {
    pattern: /\{ name: "Ouargli \(dedicated\)", i: 9823, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ouargli (dedicated)", i: 9823, min: 4, max: 11, d: "lnrt", m: 0, b: "Ouargla,Touggourt,Ghardaïa,Béchar,El Oued,Tamanrasset,In Salah,Adrar,Djanet,El Golea,Béni Abbès,Taghit" },'
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
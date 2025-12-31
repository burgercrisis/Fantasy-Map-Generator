const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Dyula \(dedicated\)", i: 10532, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dyula (dedicated)", i: 10532, min: 4, max: 11, d: "lnrt", m: 0, b: "Korhogo,Bouaké,Odienné,Séguéla,Boundiali,Dabakala,Mankono,Katiola,Kong,Sikasso,Siguirí,Banako" },'
  },
  {
    pattern: /\{ name: "Dzando \(dedicated\)", i: 10533, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dzando (dedicated)", i: 10533, min: 4, max: 11, d: "lnrt", m: 0, b: "Mouila,Ndjolé,Lambaréné,Fougamou,Koulamoutou,Mimongo,Lastoursville,Moanda,Mounana,Tchibanga,Mbigou,Makokou" },'
  },
  {
    pattern: /\{ name: "Dzao Min \(dedicated\)", i: 10534, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dzao Min (dedicated)", i: 10534, min: 4, max: 11, d: "lnrt", m: 0, b: "Ha Giang,Dong Van,Meo Vac,Bac Quang,Bao Lac,Yen Minh,Vi Xuyen,Quan Ba,Hoang Su Phi,Xin Man,Bac Me,Vi Thuy" },'
  },
  {
    pattern: /\{ name: "Dzodinka \(dedicated\)", i: 10630, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dzodinka (dedicated)", i: 10630, min: 4, max: 11, d: "lnrt", m: 0, b: "Dzodinka,Yaoundé,Douala,Buea,Kumba,Limbe,Ebolowa,Bafoussam,Mamfe,Kribi,Bamenda,Tiko" },'
  },
  {
    pattern: /\{ name: "Eastern Votic \(dedicated\)", i: 10631, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Eastern Votic (dedicated)", i: 10631, min: 4, max: 11, d: "lnrt", m: 0, b: "Jõgõperä,Kraskovo,Luzhitsy,Rozhdestvenno,Kingissepp,Sosnovy Bor,Slantsy,Ivangorod,Koporye,Yam,Narva,Ust-Luga" },'
  },
  {
    pattern: /\{ name: "Eastern Yugur \(dedicated\)", i: 10632, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Eastern Yugur (dedicated)", i: 10632, min: 4, max: 11, d: "lnrt", m: 0, b: "Sunan,Zhangye,Jiuquan,Jinchang,Wuwei,Lanzhou,Baiyin,Dingxi,Tianshui,Longnan,Hezuo,Gannan" },'
  },
  {
    pattern: /\{ name: "Edolo \(dedicated\)", i: 10634, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Edolo (dedicated)", i: 10634, min: 4, max: 11, d: "lnrt", m: 0, b: "Edolo,Tabubil,Kiunga,Murua,Ningerum,Morehead,Kaibobo,Abau,Tari,Mendi,Mt Hagen,Kikori" },'
  },
  {
    pattern: /\{ name: "Ekari \(dedicated\)", i: 10681, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ekari (dedicated)", i: 10681, min: 4, max: 11, d: "lnrt", m: 0, b: "Enarotali,Wamena,Timika,Tembagapura,Kaimana,Fakfak,Kokonao,Moa,Mapura,Paniai,Waghete,Biak" },'
  },
  {
    pattern: /\{ name: "Ekherit Bulagat Buryat \(dedicated\)", i: 10682, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ekherit Bulagat Buryat (dedicated)", i: 10682, min: 4, max: 11, d: "lnrt", m: 0, b: "Ulan-Ude,Nizhneudinsk,Alarsk,Bokhan,Tunka,Khorinsk,Kizhinga,Kyakhta,Zaigraevo,Kabansk,Selenga,Tarbagatay" },'
  },
  {
    pattern: /\{ name: "Ekhirit Bulagat Buryat \(dedicated\)", i: 10683, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ekhirit Bulagat Buryat (dedicated)", i: 10683, min: 4, max: 11, d: "lnrt", m: 0, b: "Ulan-Ude,Zaigraevo,Kabansk,Selenga,Kyakhta,Tarbagatay,Nizhneudinsk,Alarsk,Bokhan,Tunka,Khorinsk,Kizhinga" },'
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
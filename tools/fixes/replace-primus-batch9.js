const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Gan \(dedicated\)", i: 11130, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gan (dedicated)", i: 11130, min: 4, max: 11, d: "lnrt", m: 0, b: "Nanchang,Jiujiang,Ganzhou,Jingdezhen,Pingxiang,Xinyu,Yingtan,Jian,Shangrao,Fuzhou,Yichun" },'
  },
  {
    pattern: /\{ name: "Gangwon Dialect \(dedicated\)", i: 11131, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gangwon Dialect (dedicated)", i: 11131, min: 4, max: 11, d: "lnrt", m: 0, b: "Chuncheon,Gangneung,Sokcho,Donghae,Wonju,Samcheok,Taebaek,Cheongnyang,Pyeongchang,Hongcheon,Yangyang,Jeongseon" },'
  },
  {
    pattern: /\{ name: "Gaulish \(dedicated\)", i: 11132, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gaulish (dedicated)", i: 11132, min: 4, max: 11, d: "lnrt", m: 0, b: "Alesia,Bibracte,Lugdunum,Lutetia,Nemetocenna,Mediolanum,Tolosa,Burdigala,Narbo,Lugdunum,Aquae Sulis,Camulodunum" },'
  },
  {
    pattern: /\{ name: "Gauwa \(dedicated\)", i: 11133, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gauwa (dedicated)", i: 11133, min: 4, max: 11, d: "lnrt", m: 0, b: "Gauwa,Karatu,Mbulu,Babati,Mto wa Mbu,Magugu,Mangola,Katesh,Gallu,Enduimet,Mbulu,Makuyuni" },'
  },
  {
    pattern: /\{ name: "Gawar Language \(dedicated\)", i: 11134, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gawar Language (dedicated)", i: 11134, min: 4, max: 11, d: "lnrt", m: 0, b: "Gawar,Burma,Myanmar,Mandalay,Yangon,Taunggyi,Lashio,Muse,Mogok,Pakokku,Pyinmana,Naypyidaw" },'
  },
  {
    pattern: /\{ name: "Gaya Korean \(dedicated\)", i: 11135, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gaya Korean (dedicated)", i: 11135, min: 4, max: 11, d: "lnrt", m: 0, b: "Gyeongju,Goryeong,Gimcheon,Andong,Gimhae,Sangju,Hapcheon,Miryang,Changnyeong,Seongju,Goryeong,Chilgok" },'
  },
  {
    pattern: /\{ name: "Garhwali \(dedicated\)", i: 11136, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Garhwali (dedicated)", i: 11136, min: 4, max: 11, d: "lnrt", m: 0, b: "Dehradun,Haridwar,Rishikesh,Rudraprayag,Chamoli,Uttarkashi,Tehri,Pauri,Kotdwar,Uttarkashi,Pithoragarh,Joshimath" },'
  },
  {
    pattern: /\{ name: "Godoberi \(dedicated\)", i: 11137, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Godoberi (dedicated)", i: 11137, min: 4, max: 11, d: "lnrt", m: 0, b: "Godoberi,Godoberi Kala,Bagval,Guni,Khindakh,Ritlyab,Tsilandi,Kvanada,Tlondoda,Makhachkala,Kizlyar,Derbent" },'
  },
  {
    pattern: /\{ name: "Geji \(dedicated\)", i: 11138, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Geji (dedicated)", i: 11138, min: 4, max: 11, d: "lnrt", m: 0, b: "Geji,Kiru,Kankia,Kafanchan,Manchok,Zangon Kataf,Kagoro,Jema,Kwoi,Saminaka,Zonkwa,Kachia" },'
  },
  {
    pattern: /\{ name: "Gejia \(dedicated\)", i: 11139, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gejia (dedicated)", i: 11139, min: 4, max: 11, d: "lnrt", m: 0, b: "Gejia,Qiandongnan,Guiyang,Zhijin,Dafang,Weining,Hezhang,Nayong,Bijie,Jinsha,Qianxi,Guizhou" },'
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
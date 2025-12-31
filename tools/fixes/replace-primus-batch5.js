const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Fasu \(dedicated\)", i: 10888, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fasu (dedicated)", i: 10888, min: 4, max: 11, d: "lnrt", m: 0, b: "Fasu,Kikori,Baimuru,Paim,Baimuru,Darai,Nomi,Namau,Kutubu,Mubi,Morobe,Huon" },'
  },
  {
    pattern: /\{ name: "Fataluku \(dedicated\)", i: 10889, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fataluku (dedicated)", i: 10889, min: 4, max: 11, d: "lnrt", m: 0, b: "Lospalos,Lautem,Com,Baucau,Viqueque,Dili,Oecusse,Aileu,Ainaro,Maliana,Liquica,Manatuto" },'
  },
  {
    pattern: /\{ name: "Dizoid \(dedicated\)", i: 10930, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dizoid (dedicated)", i: 10930, min: 4, max: 11, d: "lnrt", m: 0, b: "Dizi,Nao,Suri,Maji,Murle,Tirma,Mezhenger,Bodi,Mursi,Nyangatom,Surma,Dime" },'
  },
  {
    pattern: /\{ name: "Domaaki \(dedicated\)", i: 10931, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Domaaki (dedicated)", i: 10931, min: 4, max: 11, d: "lnrt", m: 0, b: "Doma,Chilas,Diamer,Gilgit,Astore,Rakaposhi,Hunza,Skardu,Passu,Karimabad,Ganish,Gulmit" },'
  },
  {
    pattern: /\{ name: "Dameli \(dedicated\)", i: 10932, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dameli (dedicated)", i: 10932, min: 4, max: 11, d: "lnrt", m: 0, b: "Dameli,Bumburet,Rumbur,Ayun,Kalash,Birir,Jelam,Gram,Patrak,Batrik,Kashman,Istak" },'
  },
  {
    pattern: /\{ name: "Dogri \(dedicated\)", i: 10933, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dogri (dedicated)", i: 10933, min: 4, max: 11, d: "lnrt", m: 0, b: "Jammu,Udhampur,Kathua,Jammu Cantonment,Kathua,Jammu City,Akhnoor,Samba,Ramnagar,Basohli,Kishtwar,Ramban" },'
  },
  {
    pattern: /\{ name: "Doko-Uyanga \(dedicated\)", i: 10934, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Doko-Uyanga (dedicated)", i: 10934, min: 4, max: 11, d: "lnrt", m: 0, b: "Uyo,Akwa Ibom,Calabar,Ekori,Ikono,Ikot Ekpene,Ukanafun,Abak,Oron,Eket,Itu,Mbobo" },'
  },
  {
    pattern: /\{ name: "Dom \(dedicated\)", i: 10935, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dom (dedicated)", i: 10935, min: 4, max: 11, d: "lnrt", m: 0, b: "Dom,Goroka,Asaro,Henganofi,Kainantu,Lufa,Kundiawa,Mt Hagen,Chuave,Karo,Guine,Simbu" },'
  },
  {
    pattern: /\{ name: "Domu \(dedicated\)", i: 10936, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Domu (dedicated)", i: 10936, min: 4, max: 11, d: "lnrt", m: 0, b: "Domu,Aroma,Hiri,Kairuku,Mekeo,Abau,Kupiano,Maopa,Kwikila,Port Moresby,Gulf,Brown River" },'
  },
  {
    pattern: /\{ name: "Dongjia \(dedicated\)", i: 10937, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dongjia (dedicated)", i: 10937, min: 4, max: 11, d: "lnrt", m: 0, b: "Dongjia,Guiding,Guiding County,Duyun,Kaili,Rongjiang,Congjiang,Liping,Zhaoxing,Dejiang,Yinjiang,Yanhe" },'
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
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Golin \(dedicated\)", i: 11080, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Golin (dedicated)", i: 11080, min: 4, max: 11, d: "lnrt", m: 0, b: "Golin,Chuave,Mendi,Mt Hagen,Kundiawa,Gembi,Munima,Karimui,Gawinaka,Gembarobo,Yulai,Paiela" },'
  },
  {
    pattern: /\{ name: "Gondi \(dedicated\)", i: 11081, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gondi (dedicated)", i: 11081, min: 4, max: 11, d: "lnrt", m: 0, b: "Adilabad,Chandrapur,Gadchiroli,Nagpur,Bhandara,Raipur,Bilaspur,Jagdalpur,Kanker,Bastar,Dantewara,Mulugu" },'
  },
  {
    pattern: /\{ name: "Gonga \(dedicated\)", i: 11082, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Gonga (dedicated)", i: 11082, min: 4, max: 11, d: "lnrt", m: 0, b: "Gonga,Beda,Suru,Komo,Dizi,Shako,She,Na,Maji,Murle,Tirma,Bodi" },'
  },
  {
    pattern: /\{ name: "Goroka \(dedicated\)", i: 11083, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Goroka (dedicated)", i: 11083, min: 4, max: 11, d: "lnrt", m: 0, b: "Goroka,Kainantu,Asaro,Henganofi,Lufa,Obura,Wonenara,Fane,Yagusa,Daulo,Okapa,Mount Hagen" },'
  },
  {
    pattern: /\{ name: "Goryeo Korean \(dedicated\)", i: 11084, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Goryeo Korean (dedicated)", i: 11084, min: 4, max: 11, d: "lnrt", m: 0, b: "Kaeseong,Ganghwa,Gangneung,Sokcho,Donghae,Samcheok,Gangneung,Goseong,Wonju,Pyeongchang,Yangyang,Jeongseon" },'
  },
  {
    pattern: /\{ name: "Grand Valley Dani \(dedicated\)", i: 11085, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Grand Valley Dani (dedicated)", i: 11085, min: 4, max: 11, d: "lnrt", m: 0, b: "Wamena,Carstenz Pyramid,Tiem,Napua,Kurima,Wosilimo,Kilome,Pugima,Yugwa,Yuwenggen,Hubulu,Wologoma" },'
  },
  {
    pattern: /\{ name: "Grass Koiari \(dedicated\)", i: 11086, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Grass Koiari (dedicated)", i: 11086, min: 4, max: 11, d: "lnrt", m: 0, b: "Koiari,Port Moresby,Sogeri,Brown River,Garaina,Wau,Bulolo,Buani,Kokoda,Popondetta,Oro Bay,Tufi" },'
  },
  {
    pattern: /\{ name: "Greater Siangic \(dedicated\)", i: 11087, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Greater Siangic (dedicated)", i: 11087, min: 4, max: 11, d: "lnrt", m: 0, b: "Yingkiong,Mariang,Along,Pasighat,Tuting,Kaying,Roing,Tezu,Daporijo,Ziro,Bomdila,Tawang" },'
  },
  {
    pattern: /\{ name: "Greenlandic \(dedicated\)", i: 11088, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Greenlandic (dedicated)", i: 11088, min: 4, max: 11, d: "lnrt", m: 0, b: "Nuuk,Sisimiut,Ilulissat,Qaqortoq,Maniitsoq,Aasiaat,Nuuk,Nuuk Harbour,Paamiut,Narsaq,Nanortalik,Upernavik" },'
  },
  {
    pattern: /\{ name: "Garo \(dedicated\)", i: 11089, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Garo (dedicated)", i: 11089, min: 4, max: 11, d: "lnrt", m: 0, b: "Tura,Ampati,Resubelpara,Baghmara,Williamsnagar,Dalu,Tekrigre,Rongsai,Chokpot,Chibinang,Mendip,Selsella" },'
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
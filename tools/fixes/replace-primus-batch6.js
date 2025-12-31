const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Dongo \(dedicated\)", i: 10938, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dongo (dedicated)", i: 10938, min: 4, max: 11, d: "lnrt", m: 0, b: "Dongo,Bumba,Genena,Lisala,Bumba,Coquilhatville,Mbandaka,Bumba,Equateur,Luapula,Kinshasa,Kisangani" },'
  },
  {
    pattern: /\{ name: "Dongxiang \(dedicated\)", i: 10939, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dongxiang (dedicated)", i: 10939, min: 4, max: 11, d: "lnrt", m: 0, b: "Dongxiang,Honghu,Gongan,Shayang,Jingzhou,Jingmen,Qianjiang,Xiantao,Tianmen,Xianning,Wuhan,Yichang" },'
  },
  {
    pattern: /\{ name: "Daza \(dedicated\)", i: 10980, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Daza (dedicated)", i: 10980, min: 4, max: 11, d: "lnrt", m: 0, b: "Faya-Largeau,Mao,Kouba Oye,Bardai,Zouar,Aouzou,Yebbi Bou,Ounianga,Tibesti,Chad,Borkou,Emi Koussi" },'
  },
  {
    pattern: /\{ name: "Tsez \(dedicated\)", i: 10981, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Tsez (dedicated)", i: 10981, min: 4, max: 11, d: "lnrt", m: 0, b: "Tsez,Bezhta,Kidero,Tlisi,Gakvari,Navru,Sagada,Mokok,Tindit,Genikh,Imerkheva,Khopti" },'
  },
  {
    pattern: /\{ name: "Dida \(dedicated\)", i: 10982, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dida (dedicated)", i: 10982, min: 4, max: 11, d: "lnrt", m: 0, b: "Dida,Dabou,Divo,Grand-Bassam,Bondoukou,Abengourou,Yamoussoukro,Bouaké,Korhogo,Bonoua,San-Pédro,Daloa" },'
  },
  {
    pattern: /\{ name: "Dima \(dedicated\)", i: 10983, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dima (dedicated)", i: 10983, min: 4, max: 11, d: "lnrt", m: 0, b: "Dima,Dimapur,Kohima,Mokokchung,Tuensang,Mon,Peren,Zunheboto,Wokha,Phek,Kiphire,Longleng" },'
  },
  {
    pattern: /\{ name: "Diri \(dedicated\)", i: 10984, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Diri (dedicated)", i: 10984, min: 4, max: 11, d: "lnrt", m: 0, b: "Diri,Yenagoa,Kaiama,Brass,Nembe,Okrika,Port Harcourt,Ogbia,Sagbama,Bayelsa,Amassoma,Otuoke" },'
  },
  {
    pattern: /\{ name: "Dimasa \(dedicated\)", i: 10985, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dimasa (dedicated)", i: 10985, min: 4, max: 11, d: "lnrt", m: 0, b: "Dimapur,Haflong,Diphu,Karbi Anglong,Hojai,Dimapur Hill,Lumding,Kokrajhar,Bongaigaon,Guwahati,Tezpur,Nagaon" },'
  },
  {
    pattern: /\{ name: "Dorbet Oirat \(dedicated\)", i: 10986, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dorbet Oirat (dedicated)", i: 10986, min: 4, max: 11, d: "lnrt", m: 0, b: "Altai,Manzhouli,Hulunbuir,Ulaangovi,Tsongkhon,Dayan,Ongon,Choibalsan,Matad,Sumber,Khalkhgol,Bulgan" },'
  },
  {
    pattern: /\{ name: "Doromu \(dedicated\)", i: 10987, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Doromu (dedicated)", i: 10987, min: 4, max: 11, d: "lnrt", m: 0, b: "Doromu,Kwikila,Brown River,Gulf,Maopa,Hiri,Mekeo,Kupiano,Abau,Port Moresby,Aroma,Kairuku" },'
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
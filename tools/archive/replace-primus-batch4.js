const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Basque \(dedicated\)", i: 10835, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Basque (dedicated)", i: 10835, min: 4, max: 11, d: "lnrt", m: 0, b: "Bilbao,San Sebastián,Vitoria-Gasteiz,Pamplona,Donostia,Bilbao,Bayonne,Fontarrabie,Hondarribia,Biarritz,Mauleon,Saint-Pée-sur-Nivelle" },'
  },
  {
    pattern: /\{ name: "Even \(dedicated\)", i: 10836, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Even (dedicated)", i: 10836, min: 4, max: 11, d: "lnrt", m: 0, b: "Yakutsk,Chersky,Srednekolymsk,Ust-Nera,Verkhoyansk,Susuman,Ust-Maya,Oymyakon,Tommot,Aldan,Neryungri,Handyga" },'
  },
  {
    pattern: /\{ name: "Ewage \(dedicated\)", i: 10837, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ewage (dedicated)", i: 10837, min: 4, max: 11, d: "lnrt", m: 0, b: "Ewage,Mendi,Mt Hagen,Kundiawa,Tari,Koroba,Hagen,Jiwaka,Simbu,Wahgi,Kama,Kandep" },'
  },
  {
    pattern: /\{ name: "Ewenic \(dedicated\)", i: 10839, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Ewenic (dedicated)", i: 10839, min: 4, max: 11, d: "lnrt", m: 0, b: "Yakutsk,Magadan,Chersky,Srednekolymsk,Ust-Nera,Susuman,Omsukchan,Verkhoyansk,Kolyma,Indigirka,Ust-Maya,Tommot" },'
  },
  {
    pattern: /\{ name: "Faiwol \(dedicated\)", i: 10880, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Faiwol (dedicated)", i: 10880, min: 4, max: 11, d: "lnrt", m: 0, b: "Tabubil,Kiunga,Olsobip,Ningerum,Faiwol,Mimika,Tembin,Fly River,Bensbach,Torres Strait,Weam,Miriwo" },'
  },
  {
    pattern: /\{ name: "Fali of Mubi \(dedicated\)", i: 10881, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fali of Mubi (dedicated)", i: 10881, min: 4, max: 11, d: "lnrt", m: 0, b: "Mubi,Michika,Madagali,Gwoza,Bama,Bama Town,Maiduguri,Banki,Dikwa,Kala Balge,Kukawa,Bama" },'
  },
  {
    pattern: /\{ name: "Fanagalo \(dedicated\)", i: 10882, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fanagalo (dedicated)", i: 10882, min: 4, max: 11, d: "lnrt", m: 0, b: "Johannesburg,Pretoria,Durban,Cape Town,Kimberley,Welkom,Rustenburg,Klerksdorp,Vereeniging,Port Elizabeth,Polokwane,East London" },'
  },
  {
    pattern: /\{ name: "Fanji \(dedicated\)", i: 10885, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fanji (dedicated)", i: 10885, min: 4, max: 11, d: "lnrt", m: 0, b: "Nanjiang,Bazhong,Hechuan,Nanchong,Yilong,Nanchong,Guangyuan,Mianyang,Jiangyou,Mianyang,Bazhong,Yilong" },'
  },
  {
    pattern: /\{ name: "Far Eastern Khanty \(dedicated\)", i: 10886, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Far Eastern Khanty (dedicated)", i: 10886, min: 4, max: 11, d: "lnrt", m: 0, b: "Surgut,Nefteyugansk,Khanty-Mansiysk,Nizhnevartovsk,Agan,Yugansk,Langepas,Sovetsky,Pyt-Yakh,Novy Urengoy,Noyabrsk,Tarko-Sale" },'
  },
  {
    pattern: /\{ name: "Farefare \(dedicated\)", i: 10887, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Farefare (dedicated)", i: 10887, min: 4, max: 11, d: "lnrt", m: 0, b: "Bolgatanga,Navrongo,Tema,Zuarungu,Tongo,Bawku,Pusiga,Walewale,Garu,Sandema,Kongo,Sissala" },'
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
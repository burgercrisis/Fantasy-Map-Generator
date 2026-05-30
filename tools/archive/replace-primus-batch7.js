const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Douiret \(dedicated\)", i: 10988, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Douiret (dedicated)", i: 10988, min: 4, max: 11, d: "lnrt", m: 0, b: "Douiret,Tataouine,Ghomrassen,Medenine,Zarzis,Ben Guerdane,Mahres,Sfax,Monastir,Sousse,Jerba,Kerkennah" },'
  },
  {
    pattern: /\{ name: "Dolpo \(dedicated\)", i: 10989, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dolpo (dedicated)", i: 10989, min: 4, max: 11, d: "lnrt", m: 0, b: "Dolpo,Shey Phoksando,Saldang,Phoksundo,Dho Tarap,Mugu,Simu Kot,Tinje,Mustang,Manang,Muktinath,Jomsom" },'
  },
  {
    pattern: /\{ name: "Dry \(dedicated\)", i: 11030, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dry (dedicated)", i: 11030, min: 4, max: 11, d: "lnrt", m: 0, b: "Dry,Dry River,Wangaratta,Benalla,Shepparton,Echuca,Mildura,Swan Hill,Warrnambool,Ballarat,Bendigo,Geelong" },'
  },
  {
    pattern: /\{ name: "Duan \(dedicated\)", i: 11031, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Duan (dedicated)", i: 11031, min: 4, max: 11, d: "lnrt", m: 0, b: "Duan,Dali,Lijiang,Shangri-La,Weishan,Nanjian,Yongping,Xiangyun,Midu,Yunlong,Binchuan,Yunnan" },'
  },
  {
    pattern: /\{ name: "Dzongkha \(dedicated\)", i: 11032, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Dzongkha (dedicated)", i: 11032, min: 4, max: 11, d: "lnrt", m: 0, b: "Thimphu,Paro,Punakha,Wangdue Phodrang,Tashichho Dzong,Tongsa,Trongsa,Bumthang,Mongar,Trashigang,Trashiyangtse,Chukha" },'
  },
  {
    pattern: /\{ name: "E \(dedicated\)", i: 11033, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "E (dedicated)", i: 11033, min: 4, max: 11, d: "lnrt", m: 0, b: "Emeishan,Leshan,Yibin,Chengdu,Mianyang,Zigong,Yaan,Qionglai,Pengzhou,Jiangyou,Deyang,Guanghan" },'
  },
  {
    pattern: /\{ name: "Early Modern Korean \(dedicated\)", i: 11034, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Early Modern Korean (dedicated)", i: 11034, min: 4, max: 11, d: "lnrt", m: 0, b: "Seoul,Gaeseong,Busan,Daegu,Gyeongju,Jeonju,Hanyang,Hanseong,Hwanghae,Pyongyang,Kaesong,Namyang" },'
  },
  {
    pattern: /\{ name: "East Bodish \(dedicated\)", i: 11035, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "East Bodish (dedicated)", i: 11035, min: 4, max: 11, d: "lnrt", m: 0, b: "Lhasa,Shigatse,Gyantse,Tsetang,Lhokha,Nyingchi,Bayi,Nagqu,Chamdo,Shannan,Lhoka,Zhangmu" },'
  },
  {
    pattern: /\{ name: "East Chadic \(dedicated\)", i: 11036, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "East Chadic (dedicated)", i: 11036, min: 4, max: 11, d: "lnrt", m: 0, b: "Maiduguri,Yola,Jalingo,Gombe,Bauchi,Mubi,Girei,Mubi,Numan,Hawul,Biu,Kukawa" },'
  },
  {
    pattern: /\{ name: "Favorlang \(dedicated\)", i: 11039, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Favorlang (dedicated)", i: 11039, min: 4, max: 11, d: "lnrt", m: 0, b: "Favorlang,Puli,Douliu,Zhongxing,Xinshi,Lugang,Yuanlin,Yizhu,Changhua,Taichung,Taipingshan,Houli" },'
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
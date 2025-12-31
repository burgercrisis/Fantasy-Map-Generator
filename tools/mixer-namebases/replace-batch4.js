const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../modules/namebases-real.js');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
  { search: '"Japanese regional lects (dedicated)"', replace: '"Japanese regional lects (dedicated)", i: 8643, min: 4, max: 10, d: "", m: 0, b: "Tokyo,Osaka,Kobe,Fukuoka,Sendai,Sapporo,Hamamatsu,Kumagaya,Saga,Chiba,Aomori,Beppu,Takamatsu,Matsuyama,Himeji,Shirakawa,Fukuoka,Sendai,Higashiosaka,Yokohama,Yamaashiro,Tokonagano,Kita,Ota,Soma,Urayasu,Kita,Oto,Matsuyama,Hirahito,Shibakama,Kumagaya,Kiyoto,Nagoya,Inami,Hagachi,Yoshino,Yonezawa,Amagi,Tsugaru,Yaeyama,Emori,Tsushima,Kagoshima,Kyoto,Nara,Nagoya,Yura,Ogasawara,Amami,Tsugaru,Yaeyama,Emori,Tsushima,Kagoshima" }' },
  { search: '"Kanbun Kundoku (dedicated)"', replace: '"Kanbun Kundoku (dedicated)", i: 8644, min: 4, max: 10, d: "", m: 0, b: "Kyoto,Nara,Osaka,Kobe,Fukuoka,Sendai,Sapporo,Hamamatsu,Kumagaya,Saga,Chiba,Aomori,Beppu,Takamatsu,Matsuyama,Himeji,Shirakawa,Fukuoka,Sendai,Higashiosaka,Yokohama,Yamaashiro,Tokonagano,Kita,Ota,Soma,Urayasu,Kita,Oto,Matsuyama,Hirahito,Shibakama,Kumagaya,Kiyoto,Nagoya,Inami,Hagachi,Yoshino,Yonezawa,Amagi,Tsugaru,Yaeyama,Emori,Tsushima,Kagoshima" }' },
  { search: '"Macro-Yaeyama (dedicated)"', replace: '"Macro-Yaeyama (dedicated)', i: 8645, min: 4, max: 11, d: "lnrt", m: 0, b: "Ishigaki,Miyara,Taketomi,Kohama,Iriomote,Hateruma,Hatoma,Kuroshima,Yubujima,Kabira,Shiraho,Ohama,Hatakoma,Kuroshima,Yubujima,Kabira,Shiraho,Ohama,Hatakoma,Kuroshima" }' },
  { search: '"Miyakoan (dedicated)"', replace: '"Miyakoan (dedicated)", i: 8646, min: 4, max: 11, d: "", m: 0, b: "Miyakojima,Hirara,Shimoji,Irabu,Ikema,Kurima,Taramajima,Shimajiri,Gusukube,Ueno,Karimata,Sugama" }' },
  { search: '"Ryukyuan (dedicated)"', replace: '"Ryukyuan (dedicated)", i: 8647, min: 4, max: 11, d: "", m: 0, b: "Ishigaki,Miyara,Taketomi,Kohama,Iriomote,Hateruma,Hatoma,Kuroshima,Yubujima,Kabira,Shiraho,Ohama,Hatakoma,Kuroshima" }' },
];

let count = 0;
replacements.forEach(repl => {
  if (content.includes(repl.search)) {
    content = content.replace(repl.search, repl.replace);
    count++;
    console.log(`Replaced: ${repl.search.substring(10, 45)}`);
  }
});

if (count > 0) {
  const backupPath = filePath + '.backup-batch4';
  fs.writeFileSync(backupPath, content);
  fs.writeFileSync(filePath, content);
  console.log(`\n✅ Made ${count} replacements`);
  console.log(`📦 Backup: ${backupPath}`);
  console.log(`📄 Updated: ${filePath}\n`);
  console.log('Next: Run verification with:');
  console.log('node tools/mixer-namebases/verify-language-geographic-simple.js');
} else {
  console.log('No matching entries found');
}

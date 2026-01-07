"use strict";

/**
 * D-Code Correction Applicator
 * 
 * Applies corrections to incorrect language d-codes in continent namebase files.
 * Fixes misclassified language codes (e.g., nic-GH -> correct regional codes).
 * 
 * Usage:
 *   node tools/utils/apply-d-code-fixes.js
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');

const fixes = [
  {line: 689, name: "Tabarchino", currentD: "nic-GH", correctD: "it-IT"},
  {line: 690, name: "Talian", currentD: "nic-GH", correctD: "it-IT"},
  {line: 692, name: "Transylvanian", currentD: "nic-GH", correctD: "ro-RO"},
  {line: 693, name: "Tuscia", currentD: "nic-GH", correctD: "it-IT"},
  {line: 694, name: "Umbrian", currentD: "nic-GH", correctD: "it-IT"},
  {line: 695, name: "Uruguayan Portuguese", currentD: "nic-GH", correctD: "pt-UY"},
  {line: 696, name: "Uruguayan Spanish", currentD: "nic-GH", correctD: "es-UY"},
  {line: 697, name: "Valdôtain", currentD: "nic-GH", correctD: "ro-FR"},
  {line: 698, name: "Valencian", currentD: "nic-GH", correctD: "ca-ES"},
  {line: 699, name: "Venetian", currentD: "nic-GH", correctD: "it-IT"},
  {line: 700, name: "Venezuelan Spanish", currentD: "nic-GH", correctD: "es-VE"},
  {line: 701, name: "Versiliese", currentD: "nic-GH", correctD: "it-IT"},
  {line: 702, name: "Viareggino", currentD: "nic-GH", correctD: "it-IT"},
  {line: 782, name: "Western Aragonese", currentD: "nic-GH", correctD: "ro-ES"},
  {line: 783, name: "Western Catalan", currentD: "nic-GH", correctD: "ca-ES"},
  {line: 784, name: "Western Sicilian", currentD: "nic-GH", correctD: "it-IT"},
  {line: 785, name: "Wisconsin Walloon", currentD: "nic-GH", correctD: "ro-FR"},
  {line: 738, name: "Evant", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 742, name: "Ghomala", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 743, name: "Gikuyu", currentD: "nic-GH", correctD: "nic-KE"},
  {line: 744, name: "Goundo", currentD: "nic-GH", correctD: "nic-TD"},
  {line: 745, name: "Gourmanché", currentD: "nic-GH", correctD: "nic-BF"},
  {line: 746, name: "Gumuz", currentD: "nic-GH", correctD: "nic-ET"},
  {line: 747, name: "Gwari", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 748, name: "Gyong", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 749, name: "Hakaona", currentD: "nic-GH", correctD: "nic-NA"},
  {line: 750, name: "Hanga", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 751, name: "Saari", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 752, name: "Samwe", currentD: "nic-GH", correctD: "nic-BF"},
  {line: 754, name: "Sighu", currentD: "nic-GH", correctD: "nic-GA"},
  {line: 756, name: "Southeast Ijo", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 758, name: "Susu", currentD: "nic-GH", correctD: "nic-GN"},
  {line: 759, name: "Tagwana", currentD: "nic-GH", correctD: "nic-CI"},
  {line: 760, name: "Talni", currentD: "nic-GH", correctD: "nic-BF"},
  {line: 761, name: "Tikar", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 762, name: "Vengo", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 763, name: "Viemo", currentD: "nic-GH", correctD: "nic-BF"},
  {line: 764, name: "Viti", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 765, name: "Vori", currentD: "nic-GH", correctD: "nic-CM"},
  {line: 766, name: "Voro", currentD: "nic-GH", correctD: "nic-NG"},
  {line: 1001, name: "Karelian", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1002, name: "Karelian proper", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1012, name: "Kemi", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1013, name: "Kemijärvi", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1015, name: "Keuruu-Evijärvi", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1016, name: "Hollola", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1017, name: "Heart Tavastian", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1018, name: "Savonian", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1022, name: "Central Transdanubian", currentD: "nic-GH", correctD: "urj-HU"},
  {line: 1023, name: "Tisza-Körös", currentD: "nic-GH", correctD: "urj-HU"},
  {line: 1024, name: "Palóc", currentD: "nic-GH", correctD: "urj-HU"},
  {line: 1025, name: "Southern Transdanubian", currentD: "nic-GH", correctD: "urj-HU"},
  {line: 1026, name: "Southern Great Plain", currentD: "nic-GH", correctD: "urj-HU"},
  {line: 1027, name: "Bahrani Arabic", currentD: "nic-GH", correctD: "afa-BH"},
  {line: 1034, name: "Standard Finnish", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1038, name: "Torne Sami", currentD: "nic-GH", correctD: "urj-NO"},
  {line: 1039, name: "Tavastian", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1040, name: "Tornio", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1041, name: "Hevaha", currentD: "nic-GH", correctD: "urj-RU"},
  {line: 1042, name: "Northern Karelian", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1047, name: "Peräpohjola", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1048, name: "Fingelska", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1049, name: "Southern Selkup", currentD: "nic-GH", correctD: "urj-RU"},
  {line: 1050, name: "Vadey", currentD: "nic-GH", correctD: "urj-RU"},
  {line: 1051, name: "Bahraini Gulf Arabic", currentD: "nic-GH", correctD: "afa-BH"},
  {line: 1053, name: "Balochi", currentD: "nic-GH", correctD: "ira-PK"},
  {line: 1054, name: "Balti", currentD: "nic-GH", correctD: "sit-PK"},
  {line: 1095, name: "Bavarian", currentD: "nic-GH", correctD: "gm-DE"},
  {line: 1096, name: "Cimbrian", currentD: "nic-GH", correctD: "gm-IT"},
  {line: 1097, name: "Limburgish", currentD: "nic-GH", correctD: "gm-NL"},
  {line: 1098, name: "Low German", currentD: "nic-GH", correctD: "gm-DE"},
  {line: 1099, name: "Mainfränkisch", currentD: "nic-GH", correctD: "gm-DE"},
  {line: 1100, name: "Palatinate German", currentD: "nic-GH", correctD: "gm-DE"},
  {line: 1101, name: "Ripuarian Platt", currentD: "nic-GH", correctD: "gm-DE"},
  {line: 1107, name: "Bathari", currentD: "nic-GH", correctD: "afa-OM"},
  {line: 1108, name: "Bats", currentD: "nic-GH", correctD: "nca-GE"},
  {line: 1109, name: "Bayat Oirat", currentD: "nic-GH", correctD: "xgn-MN"},
  {line: 1110, name: "Bayot", currentD: "nic-GH", correctD: "alv-SN"},
  {line: 1111, name: "Toba Batak", currentD: "nic-GH", correctD: "map-ID"},
  {line: 1114, name: "Badeshi", currentD: "nic-GH", correctD: "ira-PK"},
  {line: 1115, name: "Uzbek", currentD: "nic-GH", correctD: "trk-UZ"},
  {line: 1116, name: "Kazakh", currentD: "nic-GH", correctD: "trk-KZ"},
  {line: 1117, name: "Kyrgyz", currentD: "nic-GH", correctD: "trk-KG"},
  {line: 1118, name: "Tatar", currentD: "nic-GH", correctD: "trk-RU"},
  {line: 1119, name: "Tuvan", currentD: "nic-GH", correctD: "trk-RU"},
  {line: 1120, name: "Ili Turki", currentD: "nic-GH", correctD: "trk-CN"},
  {line: 1121, name: "Fuyu Kyrgyz", currentD: "nic-GH", correctD: "trk-CN"},
  {line: 1122, name: "Salar", currentD: "nic-GH", correctD: "trk-CN"},
  {line: 1133, name: "Pashto, Central", currentD: "nic-GH", correctD: "ira-AF"},
  {line: 1134, name: "Waneci", currentD: "nic-GH", correctD: "ira-AF"},
  {line: 1135, name: "Eastern Indonesian Malay", currentD: "nic-GH", correctD: "pam-ID"},
  {line: 1136, name: "Gorap", currentD: "nic-GH", correctD: "pam-ID"},
  {line: 1143, name: "Hollola (setBases aux)", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1144, name: "Heart Tavastian (setBases aux)", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1145, name: "Savonian (setBases aux)", currentD: "nic-GH", correctD: "urj-FI"},
  {line: 1146, name: "Aleppine Arabic", currentD: "nic-GH", correctD: "afa-SY"},
  {line: 1147, name: "Algerian Arabic", currentD: "nic-GH", correctD: "afa-DZ"},
  {line: 1148, name: "Algerian Saharan Arabic", currentD: "nic-GH", correctD: "afa-DZ"},
  {line: 1149, name: "Anatolian Arabic", currentD: "nic-GH", correctD: "afa-TR"},
  {line: 1150, name: "Aramaic", currentD: "nic-GH", correctD: "sem-SY"},
  {line: 1151, name: "Arabic", currentD: "nic-GH", correctD: "afa-SA"},
  {line: 1152, name: "Arabic Javanese of Klego", currentD: "nic-GH", correctD: "pam-ID"},
  {line: 1153, name: "Arin", currentD: "nic-GH", correctD: "xsc-RU"},
  {line: 1154, name: "Aringa", currentD: "nic-GH", correctD: "alv-UG"},
  {line: 1155, name: "Armazic", currentD: "nic-GH", correctD: "art-GE"},
  {line: 1156, name: "Aro", currentD: "nic-GH", correctD: "alv-NG"},
  {line: 1157, name: "Aroid", currentD: "nic-GH", correctD: "afa-ET"},
  {line: 1158, name: "Arp", currentD: "nic-GH", correctD: "gm-FR"},
  {line: 1159, name: "Arunachal", currentD: "nic-GH", correctD: "sit-IN"},
  {line: 1160, name: "Ashaninka", currentD: "nic-GH", correctD: "awd-PE"},
  {line: 1161, name: "Asoa", currentD: "nic-GH", correctD: "alv-CF"},
  {line: 1162, name: "Assamese", currentD: "nic-GH", correctD: "inc-IN"},
  {line: 1163, name: "Assan", currentD: "nic-GH", correctD: "xsc-RU"},
  {line: 1164, name: "Assyrian", currentD: "nic-GH", correctD: "sem-IQ"},
  {line: 1165, name: "Atohwaim-Kaugat", currentD: "nic-GH", correctD: "ppg-ID"},
  {line: 1166, name: "Atsam", currentD: "nic-GH", correctD: "alv-NG"},
  {line: 1167, name: "Mongolian", currentD: "nic-GH", correctD: "xgn-MN"},
  {line: 1168, name: "Buryat", currentD: "nic-GH", correctD: "xgn-RU"},
  {line: 1169, name: "Daur", currentD: "nic-GH", correctD: "xgn-CN"},
  {line: 1170, name: "Oirat", currentD: "nic-GH", correctD: "xgn-MN"},
  {line: 1171, name: "Torgut Oirat", currentD: "nic-GH", correctD: "xgn-CN"},
  {line: 1174, name: "Wali Sudan", currentD: "nic-GH", correctD: "afa-SD"},
  {line: 1175, name: "Samo (Burkina)", currentD: "nic-GH", correctD: "alv-BF"},
  {line: 1176, name: "Ekoka ǃKung", currentD: "nic-GH", correctD: "khi-NA"},
  {line: 1177, name: "ǁéKxǩaoǧüǩae", currentD: "nic-GH", correctD: "khi-NA"},
  {line: 1178, name: "Sekele", currentD: "nic-GH", correctD: "khi-BW"},
  {line: 1179, name: "Wolof", currentD: "nic-GH", correctD: "alv-SN"},
  {line: 1180, name: "Sesotho", currentD: "nic-GH", correctD: "alv-LS"},
  {line: 1181, name: "Tswana", currentD: "nic-GH", correctD: "alv-BW"},
  {line: 1182, name: "Zarma", currentD: "nic-GH", correctD: "alv-NE"},
  {line: 1183, name: "Seze", currentD: "nic-GH", correctD: "afa-ET"},
  {line: 1184, name: "Shona", currentD: "nic-GH", correctD: "alv-ZW"},
  {line: 1185, name: "Sena", currentD: "nic-GH", correctD: "alv-MZ"},
  {line: 1186, name: "Tshiluba", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1187, name: "Sotho", currentD: "nic-GH", correctD: "alv-ZA"},
  {line: 1188, name: "Swazi", currentD: "nic-GH", correctD: "alv-SZ"},
  {line: 1189, name: "Tumbuka", currentD: "nic-GH", correctD: "alv-MW"},
  {line: 1190, name: "Sakata", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1191, name: "Sengele", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1192, name: "Shi", currentD: "nic-GH", correctD: "alv-RW"},
  {line: 1193, name: "Suba", currentD: "nic-GH", correctD: "alv-KE"},
  {line: 1194, name: "Suku", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1195, name: "Wongo", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1196, name: "Zulu", currentD: "nic-GH", correctD: "alv-ZA"},
  {line: 1197, name: "Sepedi", currentD: "nic-GH", correctD: "alv-ZA"},
  {line: 1198, name: "Southern Ndebele", currentD: "nic-GH", correctD: "alv-ZA"},
  {line: 1199, name: "Sumayela Ndebele", currentD: "nic-GH", correctD: "alv-ZW"},
  {line: 1200, name: "Tsonga or Xitsonga", currentD: "nic-GH", correctD: "alv-MZ"},
  {line: 1201, name: "Umbundu", currentD: "nic-GH", correctD: "alv-AO"},
  {line: 1202, name: "Burushaski", currentD: "nic-GH", correctD: "isq-PK"},
  {line: 1203, name: "Hinglish", currentD: "nic-GH", correctD: "inc-IN"},
  {line: 1204, name: "Hindko, Northern", currentD: "nic-GH", correctD: "inc-PK"},
  {line: 1205, name: "Indian English", currentD: "nic-GH", correctD: "gm-IN"},
  {line: 1206, name: "Korku", currentD: "nic-GH", correctD: "mun-IN"},
  {line: 1207, name: "Nepalese English", currentD: "nic-GH", correctD: "gm-NP"},
  {line: 1208, name: "Newar", currentD: "nic-GH", correctD: "sit-NP"},
  {line: 1209, name: "Sora (Savara)", currentD: "nic-GH", correctD: "mun-IN"},
  {line: 1210, name: "Manchu", currentD: "nic-GH", correctD: "tus-CN"},
  {line: 1211, name: "Jurchen", currentD: "nic-GH", correctD: "tus-CN"},
  {line: 1212, name: "Xibe", currentD: "nic-GH", correctD: "tus-CN"},
  {line: 1213, name: "Nanai", currentD: "nic-GH", correctD: "tuw-RU"},
  {line: 1214, name: "Evenki", currentD: "nic-GH", correctD: "tuw-RU"},
  {line: 1215, name: "Oroqen", currentD: "nic-GH", correctD: "tuw-CN"},
  {line: 1216, name: "Awjila language", currentD: "nic-GH", correctD: "afa-LY"},
  {line: 1217, name: "Aws-Nian", currentD: "nic-GH", correctD: "art-SS"},
  {line: 1218, name: "Aymara", currentD: "nic-GH", correctD: "awq-BO"},
  {line: 1219, name: "Ayo", currentD: "nic-GH", correctD: "afa-ET"},
  {line: 1220, name: "Ba-Ari", currentD: "nic-GH", correctD: "afa-ET"},
  {line: 1221, name: "Man Met (Kemie)", currentD: "nic-GH", correctD: "afa-ER"},
  {line: 1222, name: "Hu (Angku, Kon Keu)", currentD: "nic-GH", correctD: "aav-CN"},
  {line: 1223, name: "U (Pouma)", currentD: "nic-GH", correctD: "aav-CN"},
  {line: 1224, name: "Baarin Mongol", currentD: "nic-GH", correctD: "xgn-MN"},
  {line: 1225, name: "Baba", currentD: "nic-GH", correctD: "alv-CM"},
  {line: 1226, name: "Babylonian", currentD: "nic-GH", correctD: "sem-IQ"},
  {line: 1227, name: "Bacama alias", currentD: "nic-GH", correctD: "alv-NG"},
  {line: 1228, name: "Badaga", currentD: "nic-GH", correctD: "dra-IN"},
  {line: 1229, name: "Baoan", currentD: "nic-GH", correctD: "xgn-CN"},
  {line: 1230, name: "Baoanic", currentD: "nic-GH", correctD: "xgn-CN"},
  {line: 1231, name: "Baoting Hlai", currentD: "nic-GH", correctD: "aav-CN"},
  {line: 1232, name: "Barai", currentD: "nic-GH", correctD: "paa-PG"},
  {line: 1233, name: "Barambu", currentD: "nic-GH", correctD: "alv-CD"},
  {line: 1234, name: "Badong Yao", currentD: "nic-GH", correctD: "hmn-CN"},
  {line: 1235, name: "Baekje Korean", currentD: "nic-GH", correctD: "pko-KR"},
  {line: 1236, name: "Baghdadi Arabic", currentD: "nic-GH", correctD: "afa-IQ"},
  {line: 1237, name: "Baham", currentD: "nic-GH", correctD: "alv-NG"},
  {line: 1238, name: "Bahnar", currentD: "nic-GH", correctD: "aav-VN"},
  {line: 1239, name: "Bengali", currentD: "nic-GH", correctD: "inc-BD"},
  {line: 1240, name: "Bengali Portuguese Creole", currentD: "nic-GH", correctD: "crp-IN"},
  {line: 1241, name: "Beni Snous dialect", currentD: "nic-GH", correctD: "afa-DZ"},
  {line: 1242, name: "Berber", currentD: "nic-GH", correctD: "afa-MA"},
  {line: 1243, name: "Berbice", currentD: "nic-GH", correctD: "crp-GY"},
  {line: 1355, name: "Danish", currentD: "nic-GH", correctD: "gm-DK"},
  {line: 1356, name: "isl", currentD: "nic-GH", correctD: "gm-IS"},
  {line: 1357, name: "Norwegian", currentD: "nic-GH", correctD: "gm-NO"},
];

const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

let totalApplied = 0;

for (const filename of CONTINENT_FILES) {
  const filepath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`Skipping ${filename} - not found`);
    continue;
  }

  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  let appliedCount = 0;

  console.log(`\nProcessing ${filename}...`);

  for (const fix of fixes) {
    const lineIndex = fix.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];

      if (line.includes(`d: "${fix.currentD}"`)) {
        lines[lineIndex] = line.replace(`d: "${fix.currentD}"`, `d: "${fix.correctD}"`);
        appliedCount++;
        console.log(`  ✓ Line ${fix.line}: "${fix.name}" → ${fix.correctD}`);
      }
    }
  }

  if (appliedCount > 0) {
    fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
    console.log(`  Applied ${appliedCount} fixes to ${filename}`);
    totalApplied += appliedCount;
  }
}

console.log(`\nTotal fixes applied: ${totalApplied}`);

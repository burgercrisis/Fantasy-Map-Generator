"use strict";

/**
 * Namebase Restoration Script (Indices 539-558)
 *
 * Restores Papuan and other language namebase entries to modules/namebases-real.js.
 * These entries were previously blocked or missing and are now being added back.
 *
 * Usage:
 *   node tools/mixer-core/restore-namebases-539-558.js
 */

const fs = require("fs");
const path = require("path");

const targetPath = path.resolve(__dirname, "../../modules/namebases-real.js");

const entries = [
  {name: "Mardijker Creole", i: 539, min: 4, max: 11, d: "lnrt", m: 0, b: "Jakarta,Batavia,Tugu,Cilincing,Koja,Tanjung Priok,Kemayoran,Gambir,Sunda Kelapa,Ancol,Marunda,Bekasi,Tangerang,Bogor,Depok"},
  {name: "Tetum", i: 540, min: 4, max: 11, d: "lnrt", m: 0, b: "Dili,Baucau,Suai,Maliana,Same,Manatuto,Viqueque,Aileu,Ainaro,Ermera,Liquica,Los Palos,Atauro,Oecusse"},
  {name: "Santali", i: 541, min: 4, max: 11, d: "lnrt", m: 0, b: "Ranchi,Jamshedpur,Dhanbad,Bokaro,Dumka,Deoghar,Chaibasa,Khunti,Giridih,Asansol,Durgapur,Baripada,Rairangpur,Keonjhar"},
  {name: "Palaung", i: 542, min: 4, max: 11, d: "lnrt", m: 0, b: "Namhsan,Mantong,Kyaukme,Hsipaw,Lashio,Muse,Laukkaing,Taunggyi,Kengtung,Mongmit,Kunlong,Hsenwi,Mongmao"},
  {name: "Abui", i: 543, min: 4, max: 11, d: "lnrt", m: 0, b: "Kalabahi,Alor Island,Alor Besar,Alor Kecil,Teluk Mutiara,Mainang,Pureman,Ateng Melang,Tribuana,Morba,Maritaing,Atambua,Kupang,Larantuka"},
  {name: "Angal", i: 544, min: 4, max: 11, d: "lnrt", m: 0, b: "Mendi,Tari,Ialibu,Porgera,Wabag,Mount Hagen,Kundiawa,Goroka,Kagua,Nipa,Pangia,Kompiam,Koroba,Tambul"},
  {name: "Asmat", i: 545, min: 4, max: 11, d: "lnrt", m: 0, b: "Agats,Atsj,Asmat,Unir,Sawa Erma,Ewer,Suator,Atat,Betcbamu,Fayit,Aswi,Timika,Merauke"},
  {name: "Asmat Citak", i: 546, min: 4, max: 11, d: "lnrt", m: 0, b: "Agats,Citak,Kaokonao,Kokonao,Tanam,Asmat,Suator,Kepi,Okaba,Merauke,Obaa,Bade,Passel"},
  {name: "Asmat–Kamoro", i: 547, min: 4, max: 11, d: "lnrt", m: 0, b: "Timika,Mimika,Mapurujaya,Kokonao,Kaokonao,Agats,Atuka,Pouweri,Carstensz,Puncak Jaya,Kuala Kencana,Nabire"},
  {name: "Becking–Dawi", i: 548, min: 4, max: 11, d: "lnrt", m: 0, b: "Lae,Nadzab,Markham Valley,Finschhafen,Sialum,Tewai-Siassi,Madang,Wewak,Bulolo,Watut,Morobe,Huon Gulf"},
  {name: "Benabena", i: 549, min: 4, max: 11, d: "lnrt", m: 0, b: "Goroka,Kainantu,Benabena,Okapa,Asaro,Watabung,Daulo,Marawaka,Kundiawa,Mount Hagen,Madang,Lae"},
  {name: "Bimin", i: 550, min: 4, max: 11, d: "lnrt", m: 0, b: "Tabubil,Telefomin,Oksapmin,Kiunga,Ok Tedi,Fly River,Vanimo,Aitape,Wewak,Sandaun,Green River,Imonda"},
  {name: "Gadsup", i: 551, min: 4, max: 11, d: "lnrt", m: 0, b: "Goroka,Kainantu,Gadsup,Marawaka,Okapa,Asaro,Watabung,Daulo,Kundiawa,Mount Hagen,Madang"},
  {name: "Gahuku", i: 552, min: 4, max: 11, d: "lnrt", m: 0, b: "Goroka,Kainantu,Gahuku,Asaro,Okapa,Watabung,Daulo,Marawaka,Lae,Madang,Wau"},
  {name: "Gogodala", i: 553, min: 4, max: 11, d: "lnrt", m: 0, b: "Kerema,Gogodala,Gulf Province,Purari River,Kikori,Baimuru,Popondetta,Alotau,Daru,Port Moresby"},
  {name: "Awiyaana", i: 554, min: 4, max: 11, d: "lnrt", m: 0, b: "Daru,Kiunga,Western Province,Fly River,Balimo,Ok Tedi,Tabubil,Bamu River,Delta Fly,Lake Murray,Port Moresby"},
  {name: "Kasua", i: 555, min: 4, max: 11, d: "lnrt", m: 0, b: "Kikori,Lake Kutubu,Moro,Mount Bosavi,Strickland River,Nomad District,Balimo,Mendi,Tari,Port Moresby"},
  {name: "Kamoro", i: 556, min: 4, max: 11, d: "lnrt", m: 0, b: "Timika,Mimika,Mapurujaya,Kuala Kencana,Atuka,Kaokonao,Kokonao,Nabire,Enarotali,Paniai,Carstensz"},
  {name: "Kerewo", i: 557, min: 4, max: 11, d: "lnrt", m: 0, b: "Kerema,Kerewo,Gulf Province,Omati River,Purari River,Kikori,Baimuru,Popondetta,Port Moresby"},
  {name: "Kenati", i: 558, min: 4, max: 11, d: "lnrt", m: 0, b: "Lae,Morobe,Bulolo,Wau,Watut,Markham Valley,Nadzab,Finschhafen,Madang,Goroka,Mount Hagen"}
];

function main() {
  const src = fs.readFileSync(targetPath, "utf8");

  if (src.includes("i: 539") || src.includes("Mardijker Creole") || src.includes("i: 558")) {
    process.stdout.write("modules/namebases-real.js already contains 539+ bases; nothing to do.\n");
    return;
  }

  const nl = src.includes("\r\n") ? "\r\n" : "\n";

  const tailRe = /(\{name: "Sundanese", i: 538[^\r\n]*\})(\r?\n)(\s*)\];\s*$/;
  const m = src.match(tailRe);
  if (!m) {
    throw new Error("Could not locate Sundanese (i:538) tail block to insert after");
  }

  const sundaneseLine = m[1];
  const closingIndent = m[3];

  const entryIndent = "      ";
  const entryLines = entries.map((e, idx) => {
    const comma = idx === entries.length - 1 ? "" : ",";
    return `${entryIndent}{name: "${e.name}", i: ${e.i}, min: ${e.min}, max: ${e.max}, d: "${e.d}", m: ${e.m}, b: "${e.b}"}${comma}`;
  });

  const replacement = [
    `${sundaneseLine},`,
    ...entryLines,
    `${closingIndent}];`,
    ""
  ].join(nl);

  const out = src.replace(tailRe, replacement);
  fs.writeFileSync(targetPath, out, "utf8");
  process.stdout.write("Restored namebases 539–558 into modules/namebases-real.js\n");
}

main();

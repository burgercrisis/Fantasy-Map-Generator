"use strict";

const fs = require("node:fs");
const path = require("node:path");

// Load Wikipedia continent data
const metaDir = path.join(__dirname, "mixer-meta");
const continentsMeta = {
  africa: JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-africa-full.json"), "utf8")).items,
  europe: JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-europe.json"), "utf8")).items,
  asia: [
    ...JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-asia-official-languages.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-south-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-southeast-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-west-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-china-spoken-languages.json"), "utf8")).items,
  ],
  northAmerica: JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-north-america.json"), "utf8")).items,
  southAmerica: JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-indigenous-languages-of-the-americas.json"), "utf8")).items.filter(l => l.name.includes("South America") || !l.name.includes("North")),
  oceania: JSON.parse(fs.readFileSync(path.join(metaDir, "wikipedia-languages-of-oceania.json"), "utf8")).items,
};

// Create language to continent map
const langToContinent = {};
for (const [continent, languages] of Object.entries(continentsMeta)) {
  for (const lang of languages) {
    if (lang.skip) continue;
    const name = lang.name.replace(/\s*\(.*/, '').toLowerCase(); // Normalize name
    if (!langToContinent[name]) {
      langToContinent[name] = continent;
    }
  }
}

// Region to continent mapping from language-mixes.json
const REGION_MAP = {
  "Africa": "africa",
  "Asia": "asia",
  "Pacific": "oceania",
  "Americas": "northAmerica",
  "North America": "northAmerica",
  "South America": "southAmerica",
  "Latin America": "southAmerica",
  "Europe": "europe",
  "Eurasia": "europe",
  "Middle East": "asia",
  "Caribbean": "northAmerica"
};

const mixes = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "language-mixes.json"), "utf8"));
mixes.forEach(m => {
  if (m.region && REGION_MAP[m.region]) {
    const name = m.name.toLowerCase();
    if (!langToContinent[name]) {
      langToContinent[name] = REGION_MAP[m.region];
    }
  }
});

// Handle overrides for known misplaced languages
const overrides = {
  "hungarian": "europe",
  "mongolian": "asia",
  "bulgarian": "europe",
  "irish gaelic": "europe",
  "scottish gaelic": "europe",
  "peranakan": "asia",
  "north sarawakan": "asia",
  "saluan-banggai": "asia",
  "singaporean mandarin": "asia",
  "berber": "africa",
  "swahili": "africa",
  "harari-argobba": "africa",
  "harari": "africa",
  "arin": "africa",
  "assan": "africa",
  "mao-omotic": "africa",
  "coptic": "africa",
  "sened": "africa",
  "ewondo populaire": "africa",
  "fe-fe": "africa",
  "fyer": "africa",
  "ga'anda": "africa",
  "gera": "africa",
  "geruma": "africa",
  "gude": "africa",
  "gudu": "africa",
  "guduf-gava": "africa",
  "gurara": "africa",
  "hdi": "africa",
  "hina": "africa",
  "kilba": "africa",
  "hun-saare": "africa",
  "ber family": "africa",
  "setlôkwa": "africa",
  "!kxóõ-!uae": "africa",
  "camsá": "southAmerica",
  "kar": "asia",
  "hkongso": "asia",
  "tani": "asia",
  "ke’yagana": "asia",
  "taman": "asia",
  "sal": "asia",
  "zan languages": "asia",
  "international sign": "europe",
  "gällivare": "europe",
  "kemijärvi": "europe"
};

for (const [lang, cont] of Object.entries(overrides)) {
  langToContinent[lang] = cont;
}

// Map ISO-like codes (ani, ano, anp, anq, aot, aoz, ava, ao)
const isoOverrides = {
  "ani": "asia",
  "ano": "asia",
  "anp": "asia",
  "anq": "asia",
  "aot": "asia",
  "aoz": "asia",
  "ava": "asia",
  "ao": "asia"
};
for (const [code, cont] of Object.entries(isoOverrides)) {
  langToContinent[code] = cont;
}

// Helper to parse JS-like objects from files
function parseJSArray(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  const jsStr = content.slice(start, end + 1);
  // Use a Function constructor to safely evaluate the JS array
  return new Function(`return ${jsStr}`)();
}

const backupFile = path.join(__dirname, "..", "modules", "namebases-real.backup-20251228-221152.js");
const backupNamebases = parseJSArray(backupFile);

const currentFile = path.join(__dirname, "..", "modules", "namebases-real.js");
const currentNamebases = fs.existsSync(currentFile) ? parseJSArray(currentFile) : [];

const creoleFile = path.join(__dirname, "..", "modules", "namebases-creole.js");
const creoleNamebases = fs.existsSync(creoleFile) ? parseJSArray(creoleFile) : [];

const realNamebases = [...backupNamebases, ...currentNamebases, ...creoleNamebases];
console.log(`Loaded ${backupNamebases.length} from backup, ${currentNamebases.length} from current real, and ${creoleNamebases.length} from creole namebases.`);

const continentNamebases = {
  africa: [],
  asia: [],
  europe: [],
  northAmerica: [],
  southAmerica: [],
  oceania: []
};

const unmapped = [];
const seenNames = new Set();

for (const entry of realNamebases) {
  const name = entry.name.toLowerCase().trim();
  if (seenNames.has(name)) {
    continue;
  }
  seenNames.add(name);

  // Normalize name for mapping (handle common encoding issues)
  let normalizedName = name
    .replace(/jâ”œâ¿rriais/g, "jèrriais")
    .replace(/niã§ard/g, "niçard")
    .replace(/jâ”œã±mtland/g, "jämtland")
    .replace(/csã¡ngã³/g, "csángó")
    .replace(/provenã§al/g, "provençal")
    .replace(/putã¨r/g, "putèr")
    .replace(/rã©mois/g, "rémois")
    .replace(/meã¤nkieli/g, "meänkieli")
    .replace(/vãµro/g, "võro")
    .replace(/â•ÿã©kxâ•©â•aoâ•ÿã¼â•©â•ae/g, "!kxóõ-!uae")
    .replace(/warâ”œã­zu/g, "warízu")
    .replace(/sanâ”œâ•¢ma/g, "sanumá")
    .replace(/palâ”œâ”‚c/g, "pal'ic")
    .replace(/barâ”œâ¡/g, "barí")
    .replace(/cofâ”œã­n/g, "cofán")
    .replace(/baurâ”œâŒ/g, "bauré")
    .replace(/mocovâ”œâ¡/g, "mocoví")
    .replace(/guajâ”œã­/g, "guají")
    .replace(/mopâ”œã­n/g, "mopán")
    .replace(/terâ”œâ¬na/g, "terêna")
    .replace(/kaiwã¡/g, "kaiwá")
    .replace(/karajã¡/g, "karajá")
    .replace(/iã±upiaq/g, "iñupiaq")
    .replace(/tâ”¼ã©â”€â»châ•ÿâ½/g, "tłı̨chǫ")
    .replace(/setlã´kwa/g, "setlôkwa")
    .replace(/warâ”œâ­zu/g, "warízu") // Another variant
    .replace(/sanâ”œâ•¢ma \(sanumâ”œã­\)/g, "sanumá")
    .replace(/palâ”œâ”‚c/g, "pal'ic")
    .replace(/hâ”œã±n/g, "hön")
    .replace(/tâ”¼ã©â”€â»châ•ÿâ½/g, "tłı̨chǫ")
    .replace(/baurâ”œâœ/g, "bauré")
    .replace(/guajâ”œâ¡/g, "guají")
    .replace(/ese ã–mie/g, "ese ömie")
    .replace(/gã¤llivare/g, "gällivare")
    .replace(/sanã¶ma/g, "sanöma")
    .replace(/camsã¡/g, "camsá")
    .replace(/keâ€™yagana/g, "ke’yagana")
    .replace(/kemijã¤rvi/g, "kemijärvi");

  // Manual literal overrides for the remaining ones from unmapped-languages.txt
   const literalOverrides = {
     "warâ”œâ­zu": "southAmerica",
     "warâ”œã­zu": "southAmerica",
     "sanâ”œâ•¢ma (sanumâ”œã­)": "southAmerica",
     "palâ”œâ”‚c": "southAmerica",
     "hâ”œã±n": "asia",
     "tâ”¼ã©â”€â»châ•ÿâ½": "northAmerica",
     "baurâ”œâœ": "southAmerica",
     "guajâ”œâ¡": "southAmerica",
     "guajâ”œã­": "southAmerica",
     "ese ã–mie": "oceania",
     "gã¤llivare": "europe",
     "sanã¶ma": "southAmerica",
     "camsã¡": "southAmerica",
     "keâ€™yagana": "oceania",
     "kemijã¤rvi": "europe",
     "kikar": "africa",
     "aqc": "asia",
     "kva": "asia",
     "kvx": "asia",
     "kxu": "asia",
     "kyowa go": "asia",
     "kyv": "asia",
     "kyw": "asia",
     "kzi": "asia"
   };

  let continent = langToContinent[normalizedName] || literalOverrides[name];
  
  // Try mapping base name if it's a dedicated namebase
  if (!continent && normalizedName.includes("(dedicated)")) {
    const baseName = normalizedName.replace("(dedicated)", "").trim();
    continent = langToContinent[baseName];
  }

  // Try mapping base name if it's an aux namebase
  if (!continent && normalizedName.includes("(setbases aux)")) {
    const baseName = normalizedName.replace("(setbases aux)", "").trim();
    continent = langToContinent[baseName];
  }

  if (!continent) {
    // Try fuzzy match or town-based match
    const b = entry.b || "";
    const n = entry.name.toLowerCase();
    
    // Check base name for fuzzy match too
    const baseN = n.replace("(dedicated)", "").trim();

    if (b.includes("Africa") || n.includes("africa") || n.includes("nigeria") || n.includes("click") || n.includes("cameroon") || n.includes("kru pidgin") || n.includes("liberian") || n.includes("bantoid") || n.includes("cushitic") || n.includes("nilotic") || n.includes("ethiopian") || n.includes("chadic") || n.includes("gurage") || n.includes("berta") || n.includes("argobba") || n.includes("amh") || n.includes("berber") || n.includes("yoruba") || n.includes("igbo") || n.includes("zulu") || n.includes("xhosa") || n.includes("hausa") || n.includes("kung") || n.includes("amkoe") || n.includes("bemba") || n.includes("shabo") || n.includes("bura") || n.includes("buwal") || n.includes("cakfem") || n.includes("tangale") || n.includes("dangaleat") || n.includes("ghomala") || n.includes("gourmanch") || n.includes("asele") || n.includes("oromo") || n.includes("tigre") || n.includes("geez") || n.includes("hadiyya") || n.includes("sidama") || n.includes("wolaitta") || n.includes("ganza") || n.includes("são tomé") || n.includes("angolar") || n.includes("annobonese") || n.includes("forro") || n.includes("principense") || n.includes("beami") || n.includes("beba") || n.includes("babanki") || n.includes("baca") || n.includes("bangala") || n.includes("bangi") || n.includes("bangolan") || n.includes("bomboli") || n.includes("bomboma") || n.includes("boze") || n.includes("bozo") || n.includes("buu") || n.includes("sebat bet") || n.includes("ulbare") || n.includes("wolane") || n.includes("mesmes") || n.includes("mesqan") || n.includes("muher") || n.includes("inneqor") || n.includes("inor") || n.includes("chaha") || n.includes("nubi") || n.includes("gadal") || n.includes("beja") || n.includes("bembe") || n.includes("central atlas tamazight") || n.includes("bure") || n.includes("aro") || n.includes("ayo") || n.includes("ba-ari") || n.includes("beni snous") || n.includes("bee") || n.includes("bembe") || n.includes("bfy") || n.includes("bidiya") || n.includes("biu-mandara") || n.includes("buru-angwe") || n.includes("bwi") || n.includes("kituba") || n.includes("setlôkwa") || n.includes("sele") || n.includes("gamo-gofa-dawro") || n.includes("ghomara")) {
       continent = "africa";
     } else if (b.includes("Asia") || n.includes("asia") || n.includes("dravidian") || n.includes("malay") || n.includes("japanese") || n.includes("chinese") || n.includes("mandarin") || n.includes("mongolic") || n.includes("tungusic") || n.includes("iranian") || n.includes("mesopotamian") || n.includes("karnataka") || n.includes("indonesian") || n.includes("philippine") || n.includes("vietnamese") || n.includes("thai") || n.includes("lao") || n.includes("khmer") || n.includes("burmese") || n.includes("akkadian") || n.includes("doteli") || n.includes("qiangic") || n.includes("hayu") || n.includes("wutunhua") || n.includes("sanskrit") || n.includes("pali") || n.includes("tibetan") || n.includes("korean") || n.includes("hebrew") || n.includes("arabic") || n.includes("iban") || n.includes("makassar") || n.includes("halmahera") || n.includes("atayal") || n.includes("bunun") || n.includes("chepang") || n.includes("karenic") || n.includes("boro garo") || n.includes("newar") || n.includes("dhimal") || n.includes("bahnaric") || n.includes("georgian") || n.includes("alyutor") || n.includes("dhimalish") || n.includes("mijiic") || n.includes("arunachal") || n.includes("tai-") || n.includes("tai ") || n.includes("zhuang") || n.includes("kam-sui") || n.includes("biao") || n.includes("bai") || n.includes("tibeto-burman") || n.includes("kuki-chin") || n.includes("boro-garo") || n.includes("jingpho") || n.includes("toto") || n.includes("miju-meyor") || n.includes("angami") || n.includes("zeme") || n.includes("tangkhulic") || n.includes("mru") || n.includes("nam") || n.includes("ole") || n.includes("kho-bwa") || n.includes("mondzish") || n.includes("raji-raute") || n.includes("dura-tandrange") || n.includes("nicobarese") || n.includes("adi") || n.includes("thangmi") || n.includes("banjar") || n.includes("be-jizhao") || n.includes("beary") || n.includes("lepcha") || n.includes("lhokpu") || n.includes("naic") || n.includes("min") || n.includes("wu") || n.includes("xiang") || n.includes("jin") || n.includes("hui") || n.includes("pinghua") || n.includes("mehri") || n.includes("circassian") || n.includes("armenian") || n.includes("hazara") || n.includes("darkhad") || n.includes("buryat") || n.includes("dialect") || n.includes("gangwon") || n.includes("hwanghae") || n.includes("gyeonggi") || n.includes("gyeongsang") || n.includes("koya") || n.includes("anca") || n.includes("badong yao") || n.includes("basum") || n.includes("bats") || n.includes("tay-tac") || n.includes("puxian") || n.includes("haklau") || n.includes("bonan-kangjia") || n.includes("bunu") || n.includes("cai long") || n.includes("camtho") || n.includes("chavacano") || n.includes("magaric") || n.includes("magar") || n.includes("mgp") || n.includes("kip") || n.includes("drq") || n.includes("chukchi") || n.includes("chukotkan") || n.includes("chuvan") || n.includes("idu mishmi") || n.includes("itelmen") || n.includes("bhujel") || n.includes("tamangic") || n.includes("iu mien") || n.includes("kamassian") || n.includes("katuic") || n.includes("khmuic") || n.includes("tibeto burman") || n.includes("hrusish") || n.includes("iranun") || n.includes("kartvelian") || n.includes("kamchatkan") || n.includes("kerek") || n.includes("ket") || n.includes("koryak") || n.includes("kott") || n.includes("karbi") || n.includes("kathu") || n.includes("mising") || n.includes("dura tandrange") || n.includes("gong") || n.includes("gongduk") || n.includes("kim mun") || n.includes("khasi") || n.includes("kham") || n.includes("kho bwa") || n.includes("kiong nai") || n.includes("kiranti") || n.includes("mednyj aleut") || n.includes("mon") || n.includes("konyak") || n.includes("kor") || n.includes("koro") || n.includes("kuki chin") || n.includes("kyowa-go") || n.includes("lingling") || n.includes("levantine") || n.includes("nar-phu") || n.includes("athpahariya") || n.includes("bahing") || n.includes("daman") || n.includes("diu") || n.includes("portugis")) {
       continent = "asia";
     } else if (b.includes("Europe") || n.includes("europe") || n.includes("castillian") || n.includes("castilian") || n.includes("nordic") || n.includes("finnic") || n.includes("celtic") || n.includes("slavic") || n.includes("czech") || n.includes("slovak") || n.includes("estonian") || n.includes("greek") || n.includes("latin") || n.includes("german") || n.includes("french") || n.includes("spanish") || n.includes("portuguese") || n.includes("italian") || n.includes("dutch") || n.includes("scandinavian") || n.includes("balkan") || n.includes("lechitic") || n.includes("provençal") || n.includes("monégasque") || n.includes("niçard") || n.includes("judeo") || n.includes("andalusian") || n.includes("english") || n.includes("welsh") || n.includes("breton") || n.includes("basque") || n.includes("guernésiais") || n.includes("jèrriais") || n.includes("bzyb") || n.includes("provençal") || n.includes("niçard") || n.includes("monégasque") || n.includes("maramure") || n.includes("meänkieli") || n.includes("võro") || n.includes("ripuarian") || n.includes("tavastian") || n.includes("savonian") || n.includes("samoyedic") || n.includes("barlavento") || n.includes("fogo") || n.includes("sotavento") || n.includes("swedish") || n.includes("latvian") || n.includes("lithuanian") || n.includes("cornish") || n.includes("manx") || n.includes("russian") || n.includes("ukrainian") || n.includes("rusyn") || n.includes("belarusian") || n.includes("polish") || n.includes("kashubian") || n.includes("silesian") || n.includes("sorbian") || n.includes("bosnian") || n.includes("croatian") || n.includes("montenegrin") || n.includes("serbian") || n.includes("bulgarian") || n.includes("macedonian") || n.includes("slovene") || n.includes("yiddish") || n.includes("frisian") || n.includes("faroese") || n.includes("scots") || n.includes("elfdalian") || n.includes("komi") || n.includes("zyryan") || n.includes("ugric") || n.includes("cast") || n.includes("guern") || n.includes("jerr") || n.includes("aas-whistled") || n.includes("arnese") || n.includes("orleanais") || n.includes("ans") || n.includes("brianzoo") || n.includes("canzes") || n.includes("cremun") || n.includes("cri-ana") || n.includes("franco-proven") || n.includes("monégasque") || n.includes("niçard") || n.includes("palafrugu") || n.includes("jamtland") || n.includes("csángó") || n.includes("putër") || n.includes("rémois") || n.includes("ribagor") || n.includes("somontan") || n.includes("vald") || n.includes("azd") || n.includes("ejtun") || n.includes("asele") || n.includes("meänkieli") || n.includes("võro") || n.includes("isl") || n.includes("mainfr") || n.includes("hollola") || n.includes("tisza") || n.includes("palóc") || n.includes("luokta") || n.includes("per") || n.includes("bjarmian") || n.includes("bolze") || n.includes("borgarm") || n.includes("petuh") || n.includes("sercquiais") || n.includes("kemijärvi") || n.includes("keuruu") || n.includes("scottish-gaelic")) {
       continent = "europe";
     } else if (b.includes("America") || n.includes("america") || n.includes("amazonian") || n.includes("andes") || n.includes("andean") || n.includes("quechua") || n.includes("guarani") || n.includes("tupi") || n.includes("mapuche") || n.includes("aymara") || n.includes("nahuatl") || n.includes("maya") || n.includes("aztec") || n.includes("incan") || n.includes("warao") || n.includes("tsimane") || n.includes("cavineña") || n.includes("nivaclé") || n.includes("achi") || n.includes("purépecha") || n.includes("popoluca") || n.includes("tlapanec") || n.includes("zoque") || n.includes("chochotec") || n.includes("qeqchi") || n.includes("kiche") || n.includes("qanjobal") || n.includes("sateré") || n.includes("tenetehára") || n.includes("warízu") || n.includes("wari'") || n.includes("sanöma") || n.includes("tiriyó") || n.includes("língua geral") || n.includes("yuracaré") || n.includes("kogi") || n.includes("cofán") || n.includes("fulni-ô") || n.includes("tsimshian") || n.includes("gwich'in") || n.includes("mobilian") || n.includes("delaware") || n.includes("akatek") || n.includes("itza") || n.includes("mopan") || n.includes("chol") || n.includes("culina") || n.includes("terena") || n.includes("mocoví") || n.includes("karajá") || n.includes("kaiwá") || n.includes("bauré") || n.includes("pur") || n.includes("gwich") || n.includes("hân") || n.includes("têch") || n.includes("cochim") || n.includes("broken oghibbeway") || n.includes("broken slavey") || n.includes("chol") || n.includes("huastec") || n.includes("mopín") || n.includes("zapotec") || n.includes("mazatec") || n.includes("chorotega") || n.includes("greenlandic") || n.includes("iñupiaq") || n.includes("akatek") || n.includes("itza") || n.includes("tsiman") || n.includes("cavine") || n.includes("nivacl") || n.includes("berbice") || n.includes("macagu") || n.includes("arhuaco") || n.includes("sater") || n.includes("teneteh") || n.includes("warízu") || n.includes("sanöma") || n.includes("wich") || n.includes("tiriy") || n.includes("amaz") || n.includes("hupd") || n.includes("bará") || n.includes("yuracar") || n.includes("cofán") || n.includes("fulni") || n.includes("bauré") || n.includes("mocoví") || n.includes("culina") || n.includes("guají") || n.includes("terena") || n.includes("cocoliche") || n.includes("sanöma") || n.includes("italo-paulista") || n.includes("camsá") || n.includes("kaiwá") || n.includes("karajá") || n.includes("paulista") || n.includes("fulnio")) {
       // Differentiate North/South America
       if (n.includes("amazonian") || n.includes("south america") || n.includes("andes") || n.includes("andean") || n.includes("brazil") || n.includes("argentina") || n.includes("chile") || n.includes("peru") || n.includes("colombia") || n.includes("venezuela") || n.includes("ecuador") || n.includes("bolivia") || n.includes("paraguay") || n.includes("uruguay") || n.includes("guyana") || n.includes("suriname") || n.includes("tupi") || n.includes("guarani") || n.includes("warao") || n.includes("tsimane") || n.includes("cavineña") || n.includes("nivaclé") || n.includes("sateré") || n.includes("tenetehára") || n.includes("warízu") || n.includes("wari'") || n.includes("sanöma") || n.includes("tiriyó") || n.includes("língua geral") || n.includes("yuracaré") || n.includes("kogi") || n.includes("cofán") || n.includes("fulni-ô") || n.includes("culina") || n.includes("terena") || n.includes("mocoví") || n.includes("karajá") || n.includes("kaiwá") || n.includes("bauré") || n.includes("tsiman") || n.includes("cavine") || n.includes("nivacl") || n.includes("berbice") || n.includes("macagu") || n.includes("arhuaco") || n.includes("sater") || n.includes("teneteh") || n.includes("warízu") || n.includes("sanöma") || n.includes("wich") || n.includes("tiriy") || n.includes("amaz") || n.includes("hupd") || n.includes("bará") || n.includes("yuracar") || n.includes("cofán") || n.includes("fulni") || n.includes("bauré") || n.includes("mocoví") || n.includes("culina") || n.includes("guají") || n.includes("terena") || n.includes("cocoliche") || n.includes("sanöma") || n.includes("italo-paulista") || n.includes("camsá") || n.includes("kaiwá") || n.includes("karajá") || n.includes("paulista") || n.includes("fulnio")) {
         continent = "southAmerica";
       } else {
         continent = "northAmerica";
       }
     } else if (b.includes("Oceania") || b.includes("Pacific") || n.includes("oceania") || n.includes("pacific") || n.includes("papuan") || n.includes("melanesian") || n.includes("polynesian") || n.includes("micronesian") || n.includes("aboriginal") || n.includes("adnyamathanha") || n.includes("arafundi") || n.includes("new caledonia") || n.includes("vanuatu") || n.includes("fiji") || n.includes("samoa") || n.includes("tonga") || n.includes("maori") || n.includes("hawaiian") || n.includes("tahitian") || n.includes("tiwi") || n.includes("asmat") || n.includes("becking-dawi") || n.includes("laragia") || n.includes("wagiman") || n.includes("minkin") || n.includes("gaagudju") || n.includes("umbugarla") || n.includes("wadjiginy") || n.includes("iwaidja") || n.includes("maung") || n.includes("kunwinjku") || n.includes("murrinh patha") || n.includes("nunggubuyu") || n.includes("kaytetye") || n.includes("kija") || n.includes("kukatja") || n.includes("kuku yalanji") || n.includes("kuuk thaayore") || n.includes("luritja") || n.includes("manytjilyitjarra") || n.includes("martu wangka") || n.includes("miriwoong") || n.includes("ngaanyatjarra") || n.includes("ngarrindjeri") || n.includes("noongar") || n.includes("nyangumarta") || n.includes("palawa kani") || n.includes("anindilyakwa") || n.includes("bardi") || n.includes("bundjalung") || n.includes("dhuwal") || n.includes("djaru") || n.includes("djinang") || n.includes("gamilaraay") || n.includes("githabul") || n.includes("gooniyandi") || n.includes("gurindji") || n.includes("guugu yimidhirr") || n.includes("panyjima") || n.includes("wajarri") || n.includes("walmatjarri") || n.includes("wangkatha") || n.includes("warlpiri") || n.includes("warumungu") || n.includes("pitjantjatjara") || n.includes("wik mungkan") || n.includes("wiradjuri") || n.includes("yankunytjatjara") || n.includes("yinjibarndi") || n.includes("yugambeh") || n.includes("upper arrernte") || n.includes("pidgin") || n.includes("pijin") || n.includes("alu") || n.includes("aneme-wake") || n.includes("atohwaim") || n.includes("aws-nian") || n.includes("broome pearling") || n.includes("cemuh") || n.includes("cook islands") || n.includes("ese ömie") || n.includes("gurindji kriol") || n.includes("kap") || n.includes("keyagana") || n.includes("alor-pantar") || n.includes("awyu-dumut") || n.includes("kimaama") || n.includes("light warlpiri") || n.includes("papua new guinea pidgin") || n.includes("solomon islands pijin") || n.includes("enggano")) {
       continent = "oceania";
     } else if (b.includes("China") || b.includes("Japan") || b.includes("India")) {
      continent = "asia";
    } else if (b.includes("London") || b.includes("Paris") || b.includes("Berlin")) {
      continent = "europe";
    }
  }

  if (!continent) {
    continent = "europe"; // Default to europe
    unmapped.push(entry.name);
  }

  continentNamebases[continent].push(entry);
}

// Ensure unique indices and sort
let maxI = 0;
const usedIndices = new Map(); // index -> name
const remappedIndices = new Map(); // oldIndex -> newIndex

// First pass: identify all indices that are already taken and check for collisions
realNamebases.forEach(e => {
  if (e.i > maxI) maxI = e.i;
});

// Second pass: assign languages, handling duplicates and collisions
const finalNamebases = [];
const seenNames = new Set();

for (const entry of realNamebases) {
  const name = entry.name.toLowerCase().trim();
  if (seenNames.has(name)) continue;
  seenNames.add(name);

  if (usedIndices.has(entry.i)) {
    const existingName = usedIndices.get(entry.i);
    if (existingName !== entry.name) {
      console.log(`Index collision for ${entry.name} at i=${entry.i} (used by ${existingName}). Assigning new index.`);
      const oldI = entry.i;
      maxI++;
      entry.i = maxI;
      remappedIndices.set(oldI, entry.i);
    }
  }
  usedIndices.set(entry.i, entry.name);
  finalNamebases.push(entry);
}

// Third pass: distribute to continents (using the logic we already have, but on finalNamebases)
// Reset continentNamebases
for (const k in continentNamebases) continentNamebases[k] = [];

for (const entry of finalNamebases) {
  const name = entry.name.toLowerCase().trim();
  // ... (use the same mapping logic as before, I'll combine it in the final script)
}

// Update language-mixer-map.json if any indices were remapped
if (remappedIndices.size > 0) {
  const mapPath = path.join(__dirname, "..", "config", "language-mixer-map.json");
  const mixerMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  let updated = false;

  mixerMap.forEach(m => {
    if (m.bases) {
      m.bases = m.bases.map(b => {
        if (remappedIndices.has(b)) {
          updated = true;
          return remappedIndices.get(b);
        }
        return b;
      });
    }
  });

  if (updated) {
    fs.writeFileSync(mapPath, JSON.stringify(mixerMap, null, 2));
    console.log(`Updated language-mixer-map.json with ${remappedIndices.size} remapped indices.`);
  }
}

// Write continent files
for (const [continent, entries] of Object.entries(continentNamebases)) {
  const fileName = continent === "northAmerica" ? "namebases-northAmerica.js" : `namebases-${continent}.js`;
  const varName = continent.charAt(0).toUpperCase() + continent.slice(1);
  const content = `"use strict";\n\nwindow.${varName}NameBases = ${JSON.stringify(entries, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, "..", "modules", fileName), content);
  console.log(`Wrote ${entries.length} entries to ${fileName}`);
}

// Update namebases-all.js to include these new files
const allJsPath = path.join(__dirname, "..", "modules", "namebases-all.js");
let allJsContent = fs.readFileSync(allJsPath, "utf8");

const continentFiles = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js"
];

// We want to make sure these files are referenced in namebases-all.js if they aren't already
// Or better yet, we just update the realWorldNameBases to merge them all.
// But namebases-all.js is already doing some merging. Let's check it.

// Log unmapped languages for analysis
fs.writeFileSync(path.join(__dirname, "unmapped-languages.txt"), unmapped.join("\n"));
console.log(`Logged ${unmapped.length} unmapped languages to unmapped-languages.txt`);

console.log(`Total unmapped (defaulted to europe): ${unmapped.length}`);
console.log("Migration complete.");

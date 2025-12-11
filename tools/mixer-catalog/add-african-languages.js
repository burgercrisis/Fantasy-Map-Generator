"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function slugifyName(name) {
  if (!name) return "";
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "";
}

function inferCategoryFamily(row) {
  const rawFamily = row.family || row.familyLabel || "";
  let family = rawFamily.replace(/\s*\(.*?\)\s*$/, "").trim();
  family = family.replace(/–/g, "-");
  if (!family) {
    return {category: "Niger-Congo", family: "Niger-Congo"};
  }

  const lowerFam = family.toLowerCase();

  if (lowerFam.includes("english creole") || (row.name && /creole|pidgin/i.test(row.name) && /english/i.test(row.name))) {
    return {category: "Creole", family: "English-based", lexifier: "English"};
  }
  if (lowerFam.includes("french creole") || (row.name && /creole|pidgin/i.test(row.name) && /french/i.test(row.name))) {
    return {category: "Creole", family: "French-based", lexifier: "French"};
  }
  if (lowerFam.includes("portuguese creole") || (row.name && /creole|pidgin/i.test(row.name) && /portuguese/i.test(row.name))) {
    return {category: "Creole", family: "Portuguese-based", lexifier: "Portuguese"};
  }
  if (lowerFam.includes("arabic-based creole") || (row.name && /creole|pidgin/i.test(row.name) && /arabic/i.test(row.name))) {
    return {category: "Creole", family: "Arabic-based", lexifier: "Arabic"};
  }

  if (/^niger-?congo$/i.test(family)) {
    return {category: "Niger-Congo", family: "Niger-Congo"};
  }
  if (/^afro[- ]?asiatic$/i.test(family)) {
    return {category: "Afroasiatic", family: "Afroasiatic"};
  }
  if (/^nilo-?saharan$/i.test(family)) {
    return {category: "Nilo-Saharan", family: "Nilo-Saharan"};
  }
  if (/^mande$/i.test(family)) {
    return {category: "Mande", family: "Mande"};
  }
  if (/^ubangian$/i.test(family)) {
    return {category: "Ubangian", family: "Ubangian"};
  }
  if (/^khoe-?kwadi$/i.test(family)) {
    return {category: "Khoe-Kwadi", family: "Khoe-Kwadi"};
  }
  if (/^kx?a$/i.test(family.replace(/['ʼ]/g, ""))) {
    return {category: "Kx'a", family: "Kx'a"};
  }
  if (/^tuu$/i.test(family)) {
    return {category: "Tuu", family: "Tuu"};
  }

  return {category: family, family};
}

const AFRICA_ROWS = [
  {name: "ǂKxʼaoǁʼae", family: "Kxʼa"},
  {name: "ǂʼAmkoe", family: "Kxʼa"},
  {name: "Abon", family: "Niger–Congo (Probable)"},
  {name: "Abron", family: "Niger–Congo"},
  {name: "Acheron", family: "Niger–Congo (Probable)"},
  {name: "Adara", family: "Niger–Congo (Probable)"},
  {name: "Afar", family: "Afroasiatic"},
  {name: "Afrikaans", family: "Indo-European"},
  {name: "Aghem", family: "Niger–Congo (Probable)"},
  {name: "Aiki", family: "Nilo-Saharan (Probable)"},
  {name: "Aja", family: "Nilo-Saharan (Probable)"},
  {name: "Aka", family: "Niger–Congo (Probable)"},
  {name: "Akan", family: "Niger–Congo"},
  {name: "Ambo", family: "Niger–Congo (Probable)"},
  {name: "Amdang", family: "Nilo-Saharan (Probable)"},
  {name: "Ambele", family: "Niger–Congo (Probable)"},
  {name: "Amharic", family: "Afroasiatic"},
  {name: "Amira", family: "Niger–Congo (Probable)"},
  {name: "Anaang", family: "Niger–Congo (Probable)"},
  {name: "Áncá", family: "Niger–Congo (Probable)"},
  {name: "Asoa", family: "Nilo-Saharan (Probable)"},
  {name: "Atsam", family: "Niger–Congo (Probable)"},
  {name: "Arabic", family: "Afroasiatic"},
  {name: "Aringa", family: "Nilo-Saharan (Probable)"},
  {name: "Avokaya", family: "Nilo-Saharan (Probable)"},
  {name: "Awing", family: "Niger–Congo (Probable)"},
  {name: "Baba", family: "Niger–Congo (Probable)"},
  {name: "Babanki", family: "Niger–Congo (Probable)"},
  {name: "Baca", family: "Niger–Congo (Probable)"},
  {name: "Bacama", family: "Afroasiatic"},
  {name: "Bade", family: "Afroasiatic"},
  {name: "Baka", family: "Nilo-Saharan (Probable)"},
  {name: "Barambu", family: "Niger–Congo (Probable)"},
  {name: "Bariba", family: "Niger–Congo (Probable)"},
  {name: "Bala", family: "Niger–Congo (Probable)"},
  {name: "Balo", family: "Niger–Congo (Probable)"},
  {name: "Bamali", family: "Niger–Congo (Probable)"},
  {name: "Bambara", family: "Niger–Congo (Probable)"},
  {name: "Bambassi", family: "Afroasiatic"},
  {name: "Bambalang", family: "Niger–Congo (Probable)"},
  {name: "Bamukumbit", family: "Niger–Congo (Probable)"},
  {name: "Bamum", family: "Niger–Congo (Probable)"},
  {name: "Bamwe", family: "Niger–Congo (Probable)"},
  {name: "Bangala", family: "Niger–Congo (Probable)"},
  {name: "Bangi", family: "Niger–Congo (Probable)"},
  {name: "Bangolan", family: "Niger–Congo (Probable)"},
  {name: "Bassari", family: "Niger–Congo (Probable)"},
  {name: "Baṭḥari", family: "Afroasiatic"},
  {name: "Batu", family: "Niger–Congo (Probable)"},
  {name: "Bebe", family: "Niger–Congo (Probable)"},
  {name: "Beba", family: "Niger–Congo (Probable)"},
  {name: "Beli", family: "Nilo-Saharan (Probable)"},
  {name: "Bemba", family: "Niger–Congo (Probable)"},
  {name: "Bembe (Congo)", family: "Niger–Congo (Probable)"},
  {name: "Bembe (DRC)", family: "Niger–Congo (Probable)"},
  {name: "Berber", family: "Afroasiatic"},
  {name: "Berta", family: "Nilo-Saharan (Probable)"},
  {name: "Besme", family: "Niger–Congo (Probable)"},
  {name: "Bhaca", family: "Niger–Congo (Probable)"},
  {name: "Bhojpuri", family: "Indo-European"},
  {name: "Bina", family: "Niger–Congo (Probable)"},
  {name: "Binza", family: "Niger–Congo (Probable)"},
  {name: "Birri", family: "Nilo-Saharan (Probable)"},
  {name: "Biseni", family: "Niger–Congo (Probable)"},
  {name: "Bissa", family: "Niger–Congo (Probable)"},
  {name: "Bitare", family: "Niger–Congo (Probable)"},
  {name: "Bobo", family: "Niger–Congo (Probable)"},
  {name: "Bole (Afroasiatic)", family: "Afroasiatic"},
  {name: "Bole (Niger–Congo)", family: "Niger–Congo (Probable)"},
  {name: "Bolon", family: "Niger–Congo (Probable)"},
  {name: "Bomboli–Bozaba", family: "Niger–Congo (Probable)"},
  {name: "Bomboma", family: "Niger–Congo (Probable)"},
  {name: "Bomitaba", family: "Niger–Congo (Probable)"},
  {name: "Bomu", family: "Niger–Congo (Probable)"},
  {name: "Bongili", family: "Niger–Congo (Probable)"},
  {name: "Bongo", family: "Nilo-Saharan (Probable)"},
  {name: "Bonjo", family: "Niger–Congo (Probable)"},
  {name: "Bono (Ghana-Ivory Coast)", family: "Niger–Congo (Probable)"},
  {name: "Bono (Nigeria)", family: "Niger–Congo (Probable)"},
  {name: "Boon", family: "Niger–Congo (Probable)"},
  {name: "Boko", family: "Niger–Congo (Probable)"},
  {name: "Boze", family: "Niger–Congo (Probable)"},
  {name: "Bozo", family: "Mande"},
  {name: "Bube", family: "Niger–Congo (Probable)"},
  {name: "Budza", family: "Niger–Congo (Probable)"},
  {name: "Buli", family: "Niger–Congo (Probable)"},
  {name: "Bukusu", family: "Niger–Congo (Probable)"},
  {name: "Bulu", family: "Niger–Congo (Probable)"},
  {name: "Bum", family: "Niger–Congo (Probable)"},
  {name: "Buru–Angwe", family: "Niger–Congo (Probable)"},
  {name: "Busa", family: "Niger–Congo (Probable)"},
  {name: "Bushong", family: "Niger–Congo (Probable)"},
  {name: "Buu", family: "Niger–Congo (Probable)"},
  {name: "Buyu", family: "Niger–Congo (Probable)"},
  {name: "Bwela", family: "Niger–Congo (Probable)"},
  {name: "Caka", family: "Niger–Congo (Probable)"},
  {name: "Cape Verdean Creole", family: "Portuguese Creole"},
  {name: "Cebaara", family: "Niger–Congo (Probable)"},
  {name: "Central Banda", family: "Niger–Congo (Probable)"},
  {name: "Chewa", family: "Niger–Congo (Probable)"},
  {name: "Chopi", family: "Niger–Congo (Probable)"},
  {name: "Chung", family: "Niger–Congo (Probable)"},
  {name: "Comorian", family: "Niger–Congo (Probable)"},
  {name: "Dagaare", family: "Niger–Congo (Probable)"},
  {name: "Dagbani", family: "Niger–Congo (Probable)"},
  {name: "Dangme", family: "Niger–Congo (Probable)"},
  {name: "Daza", family: "Nilo-Saharan (Probable)"},
  {name: "Dciriku", family: "Niger–Congo (Probable)"},
  {name: "Dendi", family: "Nilo-Saharan (Probable)"},
  {name: "Dengese", family: "Niger–Congo (Probable)"},
  {name: "Defaka", family: "Niger–Congo (Probable)"},
  {name: "Dinka", family: "Nilo-Saharan"},
  {name: "Djimini", family: "Niger–Congo (Probable)"},
  {name: "Doghose", family: "Niger–Congo (Probable)"},
  {name: "Dogoso", family: "Niger–Congo (Probable)"},
  {name: "Doko", family: "Niger–Congo (Probable)"},
  {name: "Dongo", family: "Nilo-Saharan (Probable)"},
  {name: "Dyula", family: "Niger–Congo (Probable)"},
  {name: "Dzando", family: "Niger–Congo (Probable)"},
  {name: "Dzodinka", family: "Niger–Congo (Probable)"},
  {name: "Ebira", family: "Niger–Congo (Probable)"},
  {name: "Ekoka ǃKung", family: "Kxʼa"},
  {name: "Eman", family: "Niger–Congo (Probable)"},
  {name: "Esimbi", family: "Niger–Congo (Probable)"},
  {name: "Eton", family: "Niger–Congo (Probable)"},
  {name: "Evant", family: "Niger–Congo (Probable)"},
  {name: "Ewondo", family: "Niger–Congo (Probable)"},
  {name: "Fang (Equatorial Guinea and Gabon)", family: "Niger–Congo (Probable)"},
  {name: "Fang (Cameroon)", family: "Niger–Congo (Probable)"},
  {name: "Fanji", family: "Niger–Congo (Probable)"},
  {name: "Farefare", family: "Niger–Congo (Probable)"},
  {name: "Feʼfeʼ", family: "Niger–Congo (Probable)"},
  {name: "Fio", family: "Niger–Congo (Probable)"},
  {name: "Fongoro", family: "Nilo-Saharan (Probable)"},
  {name: "Fungor", family: "Niger–Congo (Probable)"},
  {name: "Fur", family: "Nilo-Saharan (Probable)"},
  {name: "Furu", family: "Nilo-Saharan (Probable)"},
  {name: "Fut", family: "Niger–Congo (Probable)"},
  {name: "Fwe", family: "Niger–Congo (Probable)"},
  {name: "Gǀui", family: "Khoe–Kwadi"},
  {name: "Ga", family: "Niger–Congo (Probable)"},
  {name: "Gendza", family: "Niger–Congo (Probable)"},
  {name: "Gengele Creole", family: "Niger–Congo (Probable)"},
  {name: "Geme", family: "Niger–Congo (Probable)"},
  {name: "Ghomalaʼ", family: "Niger–Congo (Probable)"},
  {name: "Gikuyu", family: "Niger–Congo (Probable)"},
  {name: "Goundo", family: "Niger–Congo (Probable)"},
  {name: "Gourmanché", family: "Niger–Congo (Probable)"},
  {name: "Gumuz", family: "Nilo-Saharan (Probable)"},
  {name: "Gwari", family: "Niger–Congo (Probable)"},
  {name: "Gyong", family: "Niger–Congo (Probable)"},
  {name: "Hakaona", family: "Niger–Congo (Probable)"},
  {name: "Hanga", family: "Niger–Congo (Probable)"},
  {name: "El Molo", family: "Nilo-Saharan (Probable)"},
  {name: "Qwara", family: "Afroasiatic"},
  {name: "Hozo", family: "Nilo-Saharan (Probable)"},
  {name: "Seze", family: "Nilo-Saharan (Probable)"},
  {name: "Saari", family: "Niger–Congo (Probable)"},
  {name: "Saba", family: "Afroasiatic"},
  {name: "Saho", family: "Niger–Congo (Probable)"},
  {name: "Samo", family: "Niger–Congo (Probable)"},
  {name: "Samwe", family: "Niger–Congo (Probable)"},
  {name: "Sakata", family: "Niger–Congo (Probable)"},
  {name: "Saya", family: "Niger–Congo (Probable)"},
  {name: "Sekele", family: "Kxʼa"},
  {name: "Sena", family: "Niger–Congo (Probable)"},
  {name: "Senara", family: "Niger–Congo (Probable)"},
  {name: "Sengele", family: "Niger–Congo (Probable)"},
  {name: "Sepedi", family: "Niger–Congo (Probable)"},
  {name: "Sesotho", family: "Niger–Congo (Probable)"},
  {name: "Setlôkwa", family: "Niger–Congo (Probable)"},
  {name: "Seychellois Creole", family: "French Creole"},
  {name: "Shabo", family: "Language isolate or possible Nilo-Saharan"},
  {name: "Shanjo", family: "Niger–Congo (Probable)"},
  {name: "Shi", family: "Niger–Congo (Probable)"},
  {name: "Shona", family: "Niger–Congo (Probable)"},
  {name: "Shwai", family: "Niger–Congo (Probable)"},
  {name: "Sighu", family: "Niger–Congo (Probable)"},
  {name: "Simaa", family: "Niger–Congo (Probable)"},
  {name: "Sinyar", family: "Nilo-Saharan (Probable)"},
  {name: "Siwu", family: "Nilo-Saharan (Probable)"},
  {name: "Somali", family: "Afroasiatic"},
  {name: "Soninke", family: "Niger–Congo (Probable)"},
  {name: "Soli", family: "Niger–Congo (Probable)"},
  {name: "Sotho", family: "Niger–Congo (Probable)"},
  {name: "South Banda", family: "Ubangian"},
  {name: "Southeast Ijo", family: "Niger–Congo (Probable)"},
  {name: "Southern Birifor", family: "Niger–Congo (Probable)"},
  {name: "Suba", family: "Niger–Congo (Probable)"},
  {name: "Suba-Simbiti", family: "Niger–Congo (Probable)"},
  {name: "Sucite", family: "Niger–Congo (Probable)"},
  {name: "Suku", family: "Niger–Congo (Probable)"},
  {name: "Sukur", family: "Afroasiatic"},
  {name: "Supyire", family: "Niger–Congo (Probable)"},
  {name: "Sumayela Ndebele", family: "Niger–Congo (Probable)"},
  {name: "Susu", family: "Niger–Congo (Probable)"},
  {name: "Suwu", family: "Niger–Congo (Probable)"},
  {name: "Spanish", family: "Indo-European"},
  {name: "Songhoyboro Ciine", family: "Nilo-Saharan (Probable)"},
  {name: "Southern Ndebele", family: "Niger–Congo"},
  {name: "Surbakhal", family: "Nilo-Saharan (Probable)"},
  {name: "Syer-Tenyer", family: "Niger–Congo (Probable)"},
  {name: "Swahili", family: "Niger–Congo (Probable)"},
  {name: "Swazi", family: "Niger–Congo (Probable)"},
  {name: "Taa", family: "Tuu"},
  {name: "Tadaksahak", family: "Nilo-Saharan (Probable)"},
  {name: "Tagdal", family: "Nilo-Saharan (Probable)"},
  {name: "Tagoi", family: "Niger–Congo (Probable)"},
  {name: "Tagwana", family: "Niger–Congo (Probable)"},
  {name: "Talodi", family: "Niger–Congo (Probable)"},
  {name: "Talni", family: "Niger–Congo (Probable)"},
  {name: "Tamil", family: "Dravidian"},
  {name: "Tasawaq", family: "Nilo-Saharan (Probable)"},
  {name: "Teda", family: "Nilo-Saharan (Probable)"},
  {name: "Tegali", family: "Niger–Congo (Probable)"},
  {name: "Tegem", family: "Niger–Congo (Probable)"},
  {name: "Telugu", family: "Dravidian"},
  {name: "Tembo", family: "Niger–Congo (Probable)"},
  {name: "Tetela", family: "Niger–Congo (Probable)"},
  {name: "Tigrinya", family: "Afroasiatic"},
  {name: "Tikar", family: "Niger–Congo (Probable)"},
  {name: "Tiro", family: "Niger–Congo (Probable)"},
  {name: "Tima", family: "Niger–Congo (Probable)"},
  {name: "Tiv", family: "Niger–Congo (Probable)"},
  {name: "Tocho", family: "Niger–Congo (Probable)"},
  {name: "Tondi Songway Kiini", family: "Nilo-Saharan (Probable)"},
  {name: "Tonga (Zimbabwe, Zambia, and Mozambique)", family: "Niger–Congo (Probable)"},
  {name: "Tonga (Mozambique)", family: "Niger–Congo (Probable)"},
  {name: "Tonga (Malawi)", family: "Niger–Congo (Probable)"},
  {name: "Totela", family: "Niger–Congo (Probable)"},
  {name: "Tsamai", family: "Afroasiatic"},
  {name: "Tsotsitaal and Camtho, aka Iscamtho", family: "Niger–Congo (Probable)"},
  {name: "Tshiluba", family: "Niger–Congo (Probable)"},
  {name: "Tsonga or Xitsonga", family: "Niger–Congo (Probable)"},
  {name: "Tshivenda", family: "Niger–Congo (Probable)"},
  {name: "Tswa", family: "Niger–Congo (Probable)"},
  {name: "Tswana", family: "Niger–Congo (Probable)"},
  {name: "Tulishi", family: "Nilo-Saharan"},
  {name: "Tumbuka", family: "Niger–Congo (Probable)"},
  {name: "Tumtum", family: "Nilo-Saharan (Probable)"},
  {name: "Twi", family: "Niger–Congo (Probable)"},
  {name: "Tyap", family: "Niger–Congo (Probable)"},
  {name: "Uduk", family: "Nilo-Saharan (Probable)"},
  {name: "Umbundu", family: "Niger–Congo (Probable)"},
  {name: "Venda", family: "Niger–Congo (Probable)"},
  {name: "Vengo", family: "Niger–Congo (Probable)"},
  {name: "Viemo", family: "Niger–Congo (Probable)"},
  {name: "Viti", family: "Niger–Congo (Probable)"},
  {name: "Vori", family: "Niger–Congo (Probable)"},
  {name: "Voro", family: "Niger–Congo (Probable)"},
  {name: "Wannu", family: "Niger–Congo (Probable)"},
  {name: "Wali (Ghana)", family: "Niger–Congo (Probable)"},
  {name: "Wali (Sudan)", family: "Nilo-Saharan (Probable)"},
  {name: "Wapan", family: "Niger–Congo (Probable)"},
  {name: "Weh", family: "Niger–Congo (Probable)"},
  {name: "Werni", family: "Niger–Congo (Probable)"},
  {name: "West Banda", family: "Ubangian"},
  {name: "Wolof", family: "Niger–Congo (Probable)"},
  {name: "Wongo", family: "Niger–Congo (Probable)"},
  {name: "Wushi", family: "Niger–Congo (Probable)"},
  {name: "Xhosa", family: "Niger–Congo (Probable)"},
  {name: "Yamba", family: "Niger–Congo (Probable)"},
  {name: "Yangere", family: "Ubangian"},
  {name: "Yalunka", family: "Niger–Congo (Probable)"},
  {name: "Yela-Kela", family: "Niger–Congo (Probable)"},
  {name: "Yemba", family: "Niger–Congo (Probable)"},
  {name: "Yeyi", family: "Niger–Congo (Probable)"},
  {name: "Yobe", family: "Niger–Congo (Probable)"},
  {name: "Yoruba", family: "Niger–Congo (Probable)"},
  {name: "Yulu", family: "Nilo-Saharan (Probable)"},
  {name: "Zaghawa", family: "Nilo-Saharan (Probable)"},
  {name: "Zande", family: "Niger–Congo (Probable)"},
  {name: "Zarma", family: "Nilo-Saharan (Probable)"},
  {name: "Zemba", family: "Niger–Congo (Probable)"},
  {name: "Zhire", family: "Niger–Congo (Probable)"},
  {name: "Zhoa", family: "Niger–Congo (Probable)"},
  {name: "Zulu", family: "Niger–Congo (Probable)"}
];

function ensureCatalogAndMap(options) {
  const opts = options || {};
  const apply = !!opts.apply;
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

   const originalMixIsos = new Set(
     Array.isArray(mixes)
       ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
       : []
   );
   const originalMapIsos = new Set(
     Array.isArray(map)
       ? map.filter(e => e && e.iso).map(e => String(e.iso))
       : []
   );

  const existingByName = new Map(mixes.map(m => [String(m.name || "").toLowerCase(), m]));
  const existingIsos = new Set(mixes.map(m => m.iso));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const nigerCongoEntry = map.find(e => e.iso === "niger-congo-family");
  const afroEntry = map.find(e => e.iso === "afroasiatic-family");

  const addedMixes = [];
  const addedMappings = [];

  for (const row of AFRICA_ROWS) {
    const name = row.name;
    if (!name) continue;
    const key = name.toLowerCase();
    if (existingByName.has(key)) continue;

    let iso = slugifyName(name);
    if (!iso) continue;
    let suffix = 2;
    while (existingIsos.has(iso)) {
      iso = iso + "-" + suffix++;
    }

    const inferred = inferCategoryFamily(row);
    const entry = {
      name,
      iso,
      region: "Africa",
      category: inferred.category,
      family: inferred.family
    };

    if (inferred.lexifier) {
      entry.lexifier = inferred.lexifier;
      entry.tags = ["creole"];
    }

    mixes.push(entry);
    existingIsos.add(iso);
    existingByName.set(key, entry);
    addedMixes.push(entry);

    if (!mapByIso.has(iso)) {
      let bases = null;
      if (inferred.family === "Afroasiatic" && afroEntry) {
        bases = Array.isArray(afroEntry.bases) ? afroEntry.bases.slice() : null;
      } else if (nigerCongoEntry) {
        bases = Array.isArray(nigerCongoEntry.bases) ? nigerCongoEntry.bases.slice() : null;
      }
      if (bases && bases.length) {
        const mapEntry = {iso, bases};
        map.push(mapEntry);
        mapByIso.set(iso, mapEntry);
        addedMappings.push(mapEntry);
      }
    }
  }

  if (!apply) {
    console.log("[add-african-languages] Dry run only (no files written). Pass --apply to write changes.");
    console.log("  Would add mixes:", addedMixes.length);
    console.log("  Would add mappings:", addedMappings.length);
  } else {
    if (addedMixes.length) {
      const finalMixIsos = new Set(
        Array.isArray(mixes)
          ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
          : []
      );
      for (const iso of originalMixIsos) {
        if (!finalMixIsos.has(iso)) {
          console.error(
            "[add-african-languages] refusing to write config/language-mixes.json; would drop ISO",
            iso
          );
          return;
        }
      }

      writeJson("config/language-mixes.json", mixes);
    } else {
      console.log("No new catalog entries added.");
    }

    if (addedMappings.length) {
      const finalMapIsos = new Set(
        Array.isArray(map)
          ? map.filter(e => e && e.iso).map(e => String(e.iso))
          : []
      );
      for (const iso of originalMapIsos) {
        if (!finalMapIsos.has(iso)) {
          console.error(
            "[add-african-languages] refusing to write config/language-mixer-map.json; would drop ISO",
            iso
          );
          return;
        }
      }

      writeJson("config/language-mixer-map.json", map);
    } else {
      console.log("No new mapping entries added.");
    }

    console.log("Added mixes:", addedMixes.length);
    console.log("Added mappings:", addedMappings.length);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  if (!apply) {
    console.log("[add-african-languages] Running in dry-run mode. No changes will be written without --apply.");
  }
  ensureCatalogAndMap({apply});
}

module.exports = {AFRICA_ROWS, ensureCatalogAndMap};

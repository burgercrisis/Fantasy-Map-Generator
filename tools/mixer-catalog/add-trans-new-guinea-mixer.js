"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

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

// Core Pacific / Papuan-ish base cluster
const PAPUAN_BASES = [25, 194, 195, 263];

// Additional broader set for the overall Papuan family
const PAPUAN_FAMILY_BASES = [25, 193, 194, 195, 196, 197, 198, 263];
const PNG_HIGHLAND_BASES = [263];
const WEST_PAPUAN_INDONESIAN_BASES = [263, 194, 195];
const TIMOR_ALOR_BASES = [194, 195];
const SE_PAPUAN_COASTAL_BASES = [263, 196, 198];

// Nodes to ensure exist in language-mixes.json, with their desired mapping bases.
// These are the family / branch nodes from your Trans–New Guinea list, not every leaf.
const papuanNodes = [
  {
    name: "Papuan family",
    iso: "papuan-family",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    tags: ["family"],
    bases: PAPUAN_FAMILY_BASES
  },
  {
    name: "Trans–New Guinea languages",
    iso: "trans-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "West Trans–New Guinea languages",
    iso: "west-trans-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "Dani",
    iso: "dani",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Paniai Lakes",
    iso: "paniai-lakes",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [263, 194]
  },
  {
    name: "West Bomberai",
    iso: "west-bomberai",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "Timor–Alor–Pantar",
    iso: "timor-alor-pantar",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: TIMOR_ALOR_BASES
  },
  {
    name: "East Timor (Papuan)",
    iso: "east-timor-papuan",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: TIMOR_ALOR_BASES
  },
  {
    name: "Alor–Pantar",
    iso: "alor-pantar",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: TIMOR_ALOR_BASES
  },
  {
    name: "Central and South New Guinea languages",
    iso: "central-south-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Asmat–Kamoro",
    iso: "asmat-kamoro",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "Greater Awyu",
    iso: "greater-awyu",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "Ok–Oksapmin",
    iso: "ok-oksapmin",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Bayono–Awbono",
    iso: "bayono-awbono",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: WEST_PAPUAN_INDONESIAN_BASES
  },
  {
    name: "Kutubuan languages",
    iso: "kutubuan-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Chimbu–Wahgi languages",
    iso: "chimbu-wahgi-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Kainantu–Goroka languages",
    iso: "kainantu-goroka-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Madang languages",
    iso: "madang-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PNG_HIGHLAND_BASES
  },
  {
    name: "Finisterre–Huon languages",
    iso: "finisterre-huon-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: SE_PAPUAN_COASTAL_BASES
  },
  {
    name: "Southeast Papuan languages",
    iso: "southeast-papuan-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: SE_PAPUAN_COASTAL_BASES
  },
  {
    name: "Anim languages",
    iso: "anim-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: SE_PAPUAN_COASTAL_BASES
  },
  {
    name: "Inland Gulf",
    iso: "inland-gulf",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: SE_PAPUAN_COASTAL_BASES
  }
];

function slugifyIso(name) {
  if (!name) return "";
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ɨ/g, "i")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const papuanLeafGroups = [
  {
    parentIso: "dani",
    family: "Dani",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Grand Valley Dani",
      "Hupla",
      "Nduga",
      "Nggem",
      "Silimo",
      "Walak",
      "Wano",
      "Western Dani",
      "Yali"
    ]
  },
  {
    parentIso: "paniai-lakes",
    family: "Paniai Lakes",
    bases: [263, 194],
    leaves: ["Auye", "Dao", "Ekari", "Moni", "Wolani"]
  },
  {
    parentIso: "west-bomberai",
    family: "West Bomberai",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: ["Baham", "Iha", "Karas"]
  },
  {
    parentIso: "timor-alor-pantar",
    family: "Timor–Alor–Pantar",
    bases: TIMOR_ALOR_BASES,
    leaves: ["Bunak"]
  },
  {
    parentIso: "east-timor-papuan",
    family: "East Timor Papuan",
    bases: TIMOR_ALOR_BASES,
    leaves: ["Fataluku", "Makalero", "Makasae", "Oirata", "Rusenu"]
  },
  {
    parentIso: "alor-pantar",
    family: "Alor–Pantar",
    bases: TIMOR_ALOR_BASES,
    leaves: [
      "Abui",
      "Adang",
      "Blagar",
      "Kafoa",
      "Kamang",
      "Klon",
      "Kui",
      "Kula",
      "Retta",
      "Sawila",
      "Wersing",
      "Kaera",
      "Nedebang",
      "Teiwa",
      "Western Pantar"
    ]
  },
  {
    parentIso: "asmat-kamoro",
    family: "Asmat–Kamoro",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: [
      "Asmat",
      "Asmat Citak",
      "Sabakor",
      "Buruwai",
      "Kamberau",
      "Kamoro",
      "Sempan"
    ]
  },
  {
    parentIso: "greater-awyu",
    family: "Greater Awyu",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: [
      "Awyu–Dumut",
      "Aghu",
      "Mandobo",
      "Kombai–Wanggom",
      "Pisa",
      "Sawi",
      "Shiaxa",
      "Wambon",
      "Becking–Dawi",
      "Komyandaret",
      "Korowai",
      "Tsaukambo"
    ]
  },
  {
    parentIso: "ok-oksapmin",
    family: "Ok–Oksapmin",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Western",
      "Burumakok",
      "Kopkaka",
      "Lowland Iwur",
      "Muyu",
      "Ninggerum",
      "Yonggom",
      "Mountain",
      "Bimin",
      "Faiwol",
      "Mian",
      "Setaman",
      "Suganga",
      "Tifal",
      "Telefol",
      "Urapmin",
      "Nakai",
      "Ngalum",
      "Oksapmin",
      "Tangko"
    ]
  },
  {
    parentIso: "bayono-awbono",
    family: "Bayono–Awbono",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: [
      "Bayono",
      "Awbono",
      "Densar",
      "Kovojab",
      "Komolom",
      "Koneraw",
      "Mombum",
      "Somahai",
      "Momina",
      "Momuna"
    ]
  },
  {
    parentIso: "kutubuan-languages",
    family: "Kutubuan",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Foe", "Fiwaga", "Fasu", "Some", "Namumi"]
  },
  {
    parentIso: "chimbu-wahgi-languages",
    family: "Chimbu–Wahgi",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Jimi",
      "Kandawo",
      "Maring",
      "Narak",
      "Wahgi",
      "Nii",
      "Chimbu",
      "Chuave",
      "Dom",
      "Golin",
      "Kuman",
      "Nomane",
      "Salt-Yui",
      "Sinasina",
      "Hagen",
      "Kaguel",
      "Melpa",
      "Tembagla"
    ]
  },
  {
    parentIso: "kainantu-goroka-languages",
    family: "Kainantu–Goroka",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Goroka",
      "Gahuku",
      "Alekano",
      "Dano",
      "Tokano",
      "Abaga",
      "Inoke-Yate",
      "Kamono",
      "Kanite",
      "Ke’yagana",
      "Yagaria",
      "Benabena",
      "Fore",
      "Gende",
      "Gimi",
      "Isabi",
      "Siane",
      "Yaweyuha",
      "Kainantu",
      "Tairora",
      "Binumarien",
      "Kambaira",
      "Tairoa",
      "Waffa",
      "Gauwa",
      "Agarabi",
      "Awa",
      "Awiyaana",
      "Gadsup",
      "Kosena",
      "Ontenu",
      "Oweina",
      "Usarufa",
      "Kenati"
    ]
  },
  {
    parentIso: "southeast-papuan-languages",
    family: "Southeast Papuan",
    bases: SE_PAPUAN_COASTAL_BASES,
    leaves: [
      "Grass Koiari",
      "Mountain Koiari",
      "Koitabu",
      "Barai",
      "Namiae",
      "Ese Ömie",
      "Humene",
      "Uare",
      "Mulaha",
      "Doromu",
      "Maria",
      "Moikodi",
      "Aneme Wake",
      "Bariji",
      "Nawaru",
      "Yareba",
      "Bauwaki",
      "Domu",
      "Binahari",
      "Morawa",
      "Mailu",
      "Laua",
      "Daga",
      "Mapena",
      "Maiwa",
      "Dima",
      "Ginuman",
      "Kanasi",
      "Onjob",
      "Umanakaina",
      "Turaka"
    ]
  },
  {
    parentIso: "anim-languages",
    family: "Anim",
    bases: SE_PAPUAN_COASTAL_BASES,
    leaves: [
      "Tirio (Lower Fly)",
      "Baramu",
      "Bitur",
      "Makayam",
      "Were",
      "Boazi (Lake Murray)",
      "Boazi",
      "Zimakani",
      "Bipim",
      "Marind",
      "Yaqay"
    ]
  },
  {
    parentIso: "inland-gulf",
    family: "Inland Gulf",
    bases: SE_PAPUAN_COASTAL_BASES,
    leaves: ["Ipiko", "Foia Foia", "Hoia Hoia", "Mubami"]
  },
  {
    parentIso: "papuan-family",
    family: "Angan",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Akoye",
      "Angaataha",
      "Ankave",
      "Hamtai",
      "Kamasa",
      "Kawacha",
      "Menya",
      "Safeyoka",
      "Simbari",
      "Susuami",
      "Tainae",
      "Yagwoia",
      "Yipma"
    ]
  },
  {
    parentIso: "papuan-family",
    family: "Awin–Pa",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Awin", "Pa"]
  },
  {
    parentIso: "papuan-family",
    family: "Binanderean",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Baruga",
      "Binandere",
      "Ewage",
      "Korafe",
      "Orokaiva",
      "Suena",
      "Yekora",
      "Zia"
    ]
  },
  {
    parentIso: "papuan-family",
    family: "Bosavi",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Aimele",
      "Beami",
      "Edolo",
      "Kaluli",
      "Kasua",
      "Onobasulu",
      "Sonia"
    ]
  },
  {
    parentIso: "papuan-family",
    family: "Duna–Pogaya",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Duna", "Pogaya"]
  },
  {
    parentIso: "papuan-family",
    family: "East Strickland",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Fembe", "Gobasi", "Konai", "Kubo", "Odoodee", "Samo"]
  },
  {
    parentIso: "papuan-family",
    family: "Engan",
    bases: PNG_HIGHLAND_BASES,
    leaves: [
      "Angal",
      "Bisorio",
      "Enga",
      "Huli",
      "Ipili",
      "Kewa",
      "Kyaka",
      "Lembena",
      "Samberigi"
    ]
  },
  {
    parentIso: "papuan-family",
    family: "Gogodala–Suki",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: ["Suki", "Gogodala", "Ari", "Waruna"]
  },
  {
    parentIso: "papuan-family",
    family: "Goilalan",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Fuyug", "Tauade", "Biangai", "Kunimaipa", "Weri"]
  },
  {
    parentIso: "papuan-family",
    family: "Kayagaric",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: [
      "Atohwaim (Kaugat)",
      "Yogo (Tamagario)",
      "Kayagar (Kaygir)",
      "Tamagario"
    ]
  },
  {
    parentIso: "papuan-family",
    family: "Kiwaian",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: ["Bami", "Kerewo", "Kiwai", "Morigi", "Waboda"]
  },
  {
    parentIso: "papuan-family",
    family: "Kolopom",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: ["Kimaama (Kimaghama)", "Riantana", "Ndom"]
  },
  {
    parentIso: "papuan-family",
    family: "Turama–Kikorian",
    bases: WEST_PAPUAN_INDONESIAN_BASES,
    leaves: ["Ikobi", "Omati", "Rumu"]
  },
  {
    parentIso: "papuan-family",
    family: "Papuan isolates",
    bases: PNG_HIGHLAND_BASES,
    leaves: ["Moraori", "Wiru"]
  }
];

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  let mixesAdded = 0;
  let mapsAdded = 0;

  for (const node of papuanNodes) {
    if (!node || !node.iso) continue;

    if (!mixesByIso.has(node.iso)) {
      const entry = {
        name: node.name,
        iso: node.iso,
        region: node.region || "Pacific",
        category: node.category || "Papuan",
        family: node.family || "Papuan"
      };
      if (Array.isArray(node.tags) && node.tags.length) entry.tags = node.tags.slice();
      mixes.push(entry);
      mixesByIso.set(node.iso, entry);
      mixesAdded++;
    }

    if (!mapByIso.has(node.iso)) {
      const bases = Array.isArray(node.bases) && node.bases.length ? node.bases.slice() : PAPUAN_BASES.slice();
      const entry = {iso: node.iso, bases};
      map.push(entry);
      mapByIso.set(node.iso, entry);
      mapsAdded++;
    }
  }

  for (const group of papuanLeafGroups) {
    if (!group || !Array.isArray(group.leaves)) continue;
    const parentIso = group.parentIso || null;
    const parent = parentIso ? mixesByIso.get(parentIso) : null;
    const parentMap = parentIso ? mapByIso.get(parentIso) : null;
    const groupBases = Array.isArray(group.bases) && group.bases.length ? group.bases.slice() : null;
    const family = group.family || (parent && parent.family) || "Papuan";

    for (const leafName of group.leaves) {
      if (!leafName) continue;
      const iso = slugifyIso(leafName);
      if (!iso) continue;

      if (!mixesByIso.has(iso)) {
        const entry = {
          name: leafName,
          iso,
          region: "Pacific",
          category: "Papuan",
          family
        };
        mixes.push(entry);
        mixesByIso.set(iso, entry);
        mixesAdded++;
      }

      if (!mapByIso.has(iso)) {
        let bases = groupBases;
        if (!bases) {
          if (parentMap && Array.isArray(parentMap.bases) && parentMap.bases.length) {
            bases = parentMap.bases.slice();
          } else {
            bases = PAPUAN_BASES.slice();
          }
        }
        const entry = {iso, bases};
        map.push(entry);
        mapByIso.set(iso, entry);
        mapsAdded++;
      }
    }
  }

  if (mixesAdded) {
    // Keep overall sort roughly stable: same as existing file order, new entries just appended.
    writeJson("config/language-mixes.json", mixes);
  } else {
    console.log("No new catalog entries added to language-mixes.json");
  }

  if (mapsAdded) {
    writeJson("config/language-mixer-map.json", map);
  } else {
    console.log("No new mappings added to language-mixer-map.json");
  }

  console.log("Papuan / Trans–New Guinea helper finished.");
  console.log("  Catalog entries added:", mixesAdded);
  console.log("  Mapping entries added:", mapsAdded);
}

if (require.main === module) main();

"use strict";

// Arcana Unearthed (AU) race data extracted from core modules/races.js.
// This file is NOT wired into the app yet; it is a candidate payload for a
// future softmod loader that can merge these definitions into the core
// fantasyRaceBases, raceLanguageProfiles, race sets, and expansionism.

// AU races (player-facing + antagonists)
const auRaces = [
  "Loresong Faen",
  "Quickling Faen",
  "Spryte",
  "Litorian",
  "Mojh",
  "Sibeccai",
  "Verrik",
  "Dramojh",
  "Ratmen",
  "Chorram",
  "Shadow Troll"
];

// Namebase mappings (were part of fantasyRaceBases)
const auFantasyRaceBases = {
  "Loresong Faen": [43],
  "Quickling Faen": [44],
  Spryte: [78],
  Litorian: [76],
  Mojh: [39],
  Sibeccai: [53],
  Verrik: [68],
  Dramojh: [39],
  Ratmen: [36],
  Chorram: [49],
  "Shadow Troll": [38]
};

// Language mixer profiles (were part of raceLanguageProfiles)
const auRaceLanguageProfiles = {
  "Loresong Faen": {
    categories: ["Celtic", "Uralic"],
    families: ["Celtic", "Uralic", "Sami", "Romance"]
  },
  "Quickling Faen": {
    categories: ["Celtic", "Germanic"],
    families: ["Celtic", "Germanic", "Romance"]
  },
  Spryte: {
    categories: ["Celtic"],
    families: ["Celtic", "Sami"]
  },
  Litorian: {
    categories: [
      "Niger-Congo",
      "Nilo-Saharan",
      "Afroasiatic",
      "Mande",
      "Khoe-Kwadi",
      "Kx'a",
      "Songhay",
      "Khoe",
      "Tuu"
    ],
    families: [
      "Niger-Congo",
      "Bantu",
      "Nilo-Saharan",
      "Semitic",
      "Mande",
      "Khoe-Kwadi",
      "Kx'a",
      "Songhay",
      "Khoe",
      "Tuu"
    ]
  },
  Mojh: {
    categories: ["Sino-Tibetan", "Mongolic", "Tai-Kadai", "Japonic", "Koreanic"],
    families: ["Sino-Tibetan", "Mongolic", "Tai-Kadai", "Japonic", "Koreanic", "Indo-Iranian"]
  },
  Sibeccai: {
    categories: ["Afroasiatic", "Niger-Congo"],
    families: ["Afroasiatic", "Semitic", "Chadic", "Niger-Congo", "Bantu"]
  },
  Verrik: {
    categories: ["Indo-Aryan", "Iranian", "Afroasiatic"],
    families: ["Indo-Aryan", "Indo-Iranian", "Iranian", "Afroasiatic", "Semitic", "Arabic"]
  },
  Dramojh: {
    categories: [
      "Sino-Tibetan",
      "Mongolic",
      "Tai-Kadai",
      "Japonic",
      "Koreanic",
      "Indo-Aryan",
      "Iranian"
    ],
    families: [
      "Sino-Tibetan",
      "Mongolic",
      "Tai-Kadai",
      "Japonic",
      "Koreanic",
      "Indo-Aryan",
      "Indo-Iranian",
      "Iranian",
      "Turkic"
    ]
  },
  Ratmen: {
    categories: ["Slavic", "Germanic"],
    families: ["Slavic", "Germanic", "Romance", "Romani"]
  },
  Chorram: {
    categories: ["Slavic", "Iranian"],
    families: ["Slavic", "Iranian", "Indo-Iranian", "Turkic"]
  },
  "Shadow Troll": {
    categories: ["Germanic", "Uralic"],
    families: ["Germanic", "Uralic", "Sami"]
  }
};

// AU contributions to race-set presets (were hard-coded in getRacesSetFilter)
// These are the AU-specific additions per existing themed set.
const auRaceSetContributions = {
  arcanaUnearthed: [
    "Loresong Faen",
    "Quickling Faen",
    "Spryte",
    "Litorian",
    "Mojh",
    "Sibeccai",
    "Verrik",
    "Dramojh",
    "Ratmen",
    "Chorram",
    "Shadow Troll"
  ],
  dark: ["Mojh", "Dramojh", "Ratmen", "Chorram", "Shadow Troll"],
  primal: ["Litorian", "Sibeccai", "Loresong Faen", "Quickling Faen", "Spryte"],
  planar: ["Mojh", "Verrik", "Dramojh"],
  fey: ["Loresong Faen", "Quickling Faen", "Spryte"],
  beastfolk: ["Litorian", "Sibeccai"],
  underdark: ["Ratmen", "Shadow Troll"]
};

// AU expansionism base values (were encoded in defineRaceExpansionism)
const auRaceExpansionismBase = {
  Dramojh: 0.8,
  Ratmen: 1.3,
  Chorram: 1.4,
  "Shadow Troll": 0.8
};

const auModMetadata = {
  id: "arcana-unearthed",
  label: "Arcana Unearthed – Diamond Throne races",
  version: "0.1.0",
  authors: ["Monte Cook (original setting)", "Local FMG fork maintainer"],
  license: "Personal use only; do not redistribute proprietary text.",
  tags: ["races", "third-party-ip", "au", "example-softmod"]
};

const auCultureSeeds = [
  {
    id: "au-giant-diamond-throne",
    name: "Hu-Charad Giant Stewardship",
    primaryRaces: ["Giant", "Human", "Sibeccai", "Loresong Faen", "Quickling Faen", "Spryte"],
    archetype: "lawful-benevolent empire",
    biomeHints: ["temperate", "mountain", "urban"],
    notes: "Giants who overthrew the Dramojh and now rule as ritual-bound caretakers over humans, faen, and sibeccai."
  },
  {
    id: "au-human-kingdoms",
    name: "Diamond Throne Human Realms",
    primaryRaces: ["Human", "Giant", "Sibeccai"],
    archetype: "vassal kingdoms",
    biomeHints: ["temperate", "river", "urban"],
    notes: "Human-majority realms owing fealty to the giants but with their own cities, nobility, and local cults."
  },
  {
    id: "au-faen-enclaves",
    name: "Faen Enclaves",
    primaryRaces: ["Loresong Faen", "Quickling Faen", "Spryte"],
    archetype: "fey enclaves",
    biomeHints: ["forest", "river", "hills"],
    notes: "Tightly knit faen communities with elaborate rituals, pleasure-seeking culture, and dense pantheons of faen gods."
  },
  {
    id: "au-litorian-ranges",
    name: "Litorian Ranges",
    primaryRaces: ["Litorian"],
    archetype: "nomadic clans",
    biomeHints: ["savanna", "steppe", "plain"],
    notes: "Leonine hunter-clans who patrol open grasslands, enforcing their own codes of honor and territorial patrols."
  },
  {
    id: "au-sibeccai-legions",
    name: "Sibeccai Legions",
    primaryRaces: ["Sibeccai", "Giant", "Human"],
    archetype: "uplifted servitors",
    biomeHints: ["urban", "river", "coastal"],
    notes: "Jackal-headed servitors uplifted by giants, forming disciplined urban cohorts and bureaucratic castes."
  },
  {
    id: "au-verrik-enclaves",
    name: "Verrik Desert Enclaves",
    primaryRaces: ["Verrik", "Human"],
    archetype: "psionic desert cities",
    biomeHints: ["desert", "steppe", "oasis"],
    notes: "Red-skinned psionic near-humans dwelling in hot, dry lands, with contemplative orders and witchcraft traditions."
  },
  {
    id: "au-mojh-cabals",
    name: "Mojh Cabals",
    primaryRaces: ["Mojh", "Human"],
    archetype: "dragonkin cabals",
    biomeHints: ["urban", "mountain", "ruins"],
    notes: "Former humans transformed into draconic mojh, gathering in secretive cabals obsessed with magic and runes."
  },
  {
    id: "au-ratmen-warrens",
    name: "Ratmen Plague Warrens",
    primaryRaces: ["Ratmen"],
    archetype: "sewer underclass",
    biomeHints: ["underground", "urban"],
    notes: "Sapient ratfolk colonies in sewers and tunnels, associated with disease, scavenging, and covert raids."
  },
  {
    id: "au-chorram-warhosts",
    name: "Chorram Warhosts",
    primaryRaces: ["Chorram"],
    archetype: "warlike antagonists",
    biomeHints: ["forest", "hills", "borderlands"],
    notes: "Militaristic enemy people willing to burn forests and lands to root out faen and other foes."
  },
  {
    id: "au-shadow-troll-clans",
    name: "Shadow Troll Clans",
    primaryRaces: ["Shadow Troll"],
    archetype: "underdark shadowkin",
    biomeHints: ["underground", "shadow", "swamp"],
    notes: "Troll offshoots steeped in shadow, haunting deep caverns and dark wetlands at the edges of civilization."
  }
];

const auStateSeeds = [
  {
    id: "au-state-diamond-throne",
    name: "Diamond Throne",
    cultureId: "au-giant-diamond-throne",
    dominantRaces: ["Giant", "Human", "Sibeccai", "Loresong Faen", "Quickling Faen", "Spryte"],
    government: "ritual monarchy",
    notes: "Central giant-ruled realm of the setting, seat of Hu-Charad authority and protector of freed peoples."
  },
  {
    id: "au-state-litorian-ranges",
    name: "Ranges of the Litorians",
    cultureId: "au-litorian-ranges",
    dominantRaces: ["Litorian"],
    government: "clan councils",
    notes: "Loose network of Litorian hunting ranges and patrol territories, only loosely subject to the Diamond Throne."
  },
  {
    id: "au-state-verrik-deserts",
    name: "Verrik Desert Cities",
    cultureId: "au-verrik-enclaves",
    dominantRaces: ["Verrik", "Human"],
    government: "city-states",
    notes: "Scattered city-states in hot, arid regions, ruled by contemplative Verrik orders and merchant houses."
  },
  {
    id: "au-state-mojh-enclaves",
    name: "Mojh Enclaves",
    cultureId: "au-mojh-cabals",
    dominantRaces: ["Mojh"],
    government: "arcane cabals",
    notes: "Secretive enclaves where mojh conduct magical research and pursue long-term draconic agendas."
  },
  {
    id: "au-state-ratmen-warrens",
    name: "Plague Warrens",
    cultureId: "au-ratmen-warrens",
    dominantRaces: ["Ratmen"],
    government: "clan warrens",
    notes: "Hidden networks of ratmen tunnels beneath major cities, rarely acknowledged by surface authorities."
  }
];

const auHistorySeeds = [
  {
    id: "au-history-dramojh-empire-fall",
    name: "Fall of the Dramojh Empire",
    era: "ancient",
    summary: "Giants overthrow the draconic Dramojh tyrants and free enslaved humans and faen from their rule.",
    tags: ["extinction", "liberation", "ancient-empire"]
  },
  {
    id: "au-history-rise-diamond-throne",
    name: "Rise of the Diamond Throne",
    era: "ancient",
    summary: "Hu-Charad giants establish the Diamond Throne as a steward realm, inviting freed peoples into their protection.",
    tags: ["founding", "giants", "stewardship"]
  },
  {
    id: "au-history-faen-migrations",
    name: "Migrations of the Faen",
    era: "classical",
    summary: "Faen communities spread from ancestral enclaves into giant-ruled and human-ruled lands, forming new enclaves and spryte colonies.",
    tags: ["migration", "fey", "diaspora"]
  },
  {
    id: "au-history-mojh-transformations",
    name: "First Mojh Transformations",
    era: "classical",
    summary: "The first humans undergo the mojh transformation rituals, creating draconic cabals that unsettle both giants and common folk.",
    tags: ["transformation", "dragonkin", "magic"]
  },
  {
    id: "au-history-shadow-troll-raids",
    name: "Shadow Troll Raids",
    era: "recent",
    summary: "Shadow troll clans raid borderlands and deep roads, becoming emblematic foes for champions of light and life.",
    tags: ["raids", "shadow", "underdark"]
  }
];

// Export for potential future loaders (Node/CLI tooling, bundlers, etc.)
if (typeof module !== "undefined") {
  module.exports = {
    auRaces,
    auFantasyRaceBases,
    auRaceLanguageProfiles,
    auRaceSetContributions,
    auRaceExpansionismBase,
    auModMetadata,
    auCultureSeeds,
    auStateSeeds,
    auHistorySeeds
  };
}

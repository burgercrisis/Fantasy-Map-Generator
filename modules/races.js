"use strict";

const fantasyRaceBases = {
  Elf: [33],
  "Dark Elf": [34],
  Dwarf: [35],
  Goblin: [36],
  Orc: [37],
  Giant: [38],
  Draconic: [39],
  Arachnid: [40],
  Serpent: [41],
  Halfling: [43],
  Gnome: [44],
  "Half-Elf": [45],
  "Half-Orc": [46],
  Tiefling: [47],
  Aasimar: [48],
  Hobgoblin: [49],
  Goliath: [50],
  Lizardfolk: [51],
  Shifter: [52],
  Gnoll: [53],
  Bugbear: [54],
  Tabaxi: [55],
  Warforged: [56],
  Kenku: [57],
  Aarakocra: [58],
  Dragonborn: [59],
  Triton: [60],
  "Yuan-ti": [61],
  Firbolg: [62],
  Gith: [63],
  Genasi: [64],
  Changeling: [65],
  Satyr: [66],
  Minotaur: [67],
  Kalashtar: [68],
  Kobold: [69],
  Duergar: [70],
  Dhampir: [71],
  Reborn: [72],
  "Shadar-kai": [73],
  Hexblood: [74],
  Centaur: [75],
  Leonin: [76],
  Loxodon: [77],
  Harengon: [78],
  Tortle: [79],
  Giff: [80],
  Owlin: [81],
  "Thri-Kreen": [82],
  Oni: [83],
  Kitsune: [84],
  Deepkin: [85],
  Starspawn: [86]
};

function getRacesSetFilter(value) {
  switch (value) {
    case "classic":
      return new Set([
        "Elf",
        "Dark Elf",
        "Dwarf",
        "Halfling",
        "Gnome",
        "Half-Elf",
        "Half-Orc",
        "Goblin",
        "Orc",
        "Giant",
        "Dragonborn",
        "Satyr",
        "Minotaur",
        "Oni",
        "Kitsune"
      ]);
    case "dark":
      return new Set([
        "Dark Elf",
        "Goblin",
        "Orc",
        "Hobgoblin",
        "Gnoll",
        "Bugbear",
        "Arachnid",
        "Serpent",
        "Lizardfolk",
        "Shifter",
        "Kenku",
        "Yuan-ti",
        "Gith",
        "Dragonborn",
        "Kobold",
        "Duergar",
        "Minotaur",
        "Dhampir",
        "Reborn",
        "Shadar-kai",
        "Hexblood",
        "Oni",
        "Deepkin",
        "Starspawn"
      ]);
    case "primal":
      return new Set([
        "Elf",
        "Dark Elf",
        "Firbolg",
        "Goliath",
        "Lizardfolk",
        "Shifter",
        "Gnoll",
        "Bugbear",
        "Tabaxi",
        "Kenku",
        "Aarakocra",
        "Triton",
        "Satyr",
        "Minotaur",
        "Centaur",
        "Leonin",
        "Loxodon",
        "Harengon",
        "Tortle",
        "Owlin",
        "Thri-Kreen",
        "Oni",
        "Kitsune",
        "Deepkin"
      ]);
    case "planar":
      return new Set([
        "Tiefling",
        "Aasimar",
        "Gith",
        "Genasi",
        "Draconic",
        "Dragonborn",
        "Yuan-ti",
        "Triton",
        "Aarakocra",
        "Kalashtar",
        "Shadar-kai",
        "Hexblood",
        "Starspawn"
      ]);
    case "eberron":
      return new Set([
        "Warforged",
        "Shifter",
        "Changeling",
        "Gnome",
        "Halfling",
        "Half-Elf",
        "Half-Orc",
        "Orc",
        "Goblin",
        "Hobgoblin",
        "Dragonborn",
        "Kalashtar",
        "Kobold",
        "Dhampir",
        "Reborn",
        "Hexblood"
      ]);
    case "fey":
      return new Set([
        "Elf",
        "Dark Elf",
        "Firbolg",
        "Satyr",
        "Harengon",
        "Hexblood",
        "Shadar-kai",
        "Aarakocra",
        "Kenku",
        "Owlin",
        "Centaur",
        "Goliath",
        "Changeling",
        "Kalashtar",
        "Kitsune"
      ]);
    case "beastfolk":
      return new Set([
        "Goliath",
        "Lizardfolk",
        "Shifter",
        "Gnoll",
        "Bugbear",
        "Tabaxi",
        "Leonin",
        "Loxodon",
        "Kenku",
        "Aarakocra",
        "Owlin",
        "Centaur",
        "Tortle",
        "Giff",
        "Thri-Kreen",
        "Kobold",
        "Kitsune"
      ]);
    case "underdark":
      return new Set([
        "Dark Elf",
        "Duergar",
        "Kobold",
        "Yuan-ti",
        "Thri-Kreen",
        "Arachnid",
        "Serpent",
        "Goblin",
        "Bugbear",
        "Gith",
        "Deepkin",
        "Starspawn"
      ]);
    case "undead":
      return new Set([
        "Dhampir",
        "Reborn",
        "Shadar-kai",
        "Hexblood",
        "Dark Elf",
        "Tiefling"
      ]);
    default:
      return null;
  }
}

function defineRaceExpansionism(name) {
  const sizeVarietyElement = byId("sizeVariety");
  const variety =
    (sizeVarietyElement && (sizeVarietyElement.valueAsNumber || +sizeVarietyElement.value)) || 1;

  let base = 1;

  if (name === "Elf") base = 0.8;
  else if (name === "Dark Elf") base = 0.9;
  else if (name === "Dwarf") base = 0.7;
  else if (name === "Goblin") base = 1.3;
  else if (name === "Orc") base = 1.6;
  else if (name === "Giant") base = 0.5;
  else if (name === "Draconic") base = 0.6;
  else if (name === "Arachnid") base = 1.1;
  else if (name === "Serpent") base = 1.2;
  else if (name === "Halfling") base = 0.9;
  else if (name === "Gnome") base = 0.8;
  else if (name === "Half-Elf") base = 1.1;
  else if (name === "Half-Orc") base = 1.4;
  else if (name === "Tiefling") base = 1.0;
  else if (name === "Aasimar") base = 0.9;
  else if (name === "Hobgoblin") base = 1.5;
  else if (name === "Goliath") base = 0.8;
  else if (name === "Lizardfolk") base = 1.2;
  else if (name === "Shifter") base = 1.2;
  else if (name === "Gnoll") base = 1.3;
  else if (name === "Bugbear") base = 1.1;
  else if (name === "Tabaxi") base = 1.2;
  else if (name === "Warforged") base = 1.0;
  else if (name === "Kenku") base = 1.0;
  else if (name === "Aarakocra") base = 0.9;
  else if (name === "Dragonborn") base = 1.3;
  else if (name === "Triton") base = 0.8;
  else if (name === "Yuan-ti") base = 1.1;
  else if (name === "Firbolg") base = 0.7;
  else if (name === "Gith") base = 1.2;
  else if (name === "Genasi") base = 1.1;
  else if (name === "Changeling") base = 1.0;
  else if (name === "Satyr") base = 1.1;
  else if (name === "Minotaur") base = 1.4;
  else if (name === "Kalashtar") base = 0.8;
  else if (name === "Kobold") base = 1.3;
  else if (name === "Duergar") base = 0.7;
  else if (name === "Dhampir") base = 1.2;
  else if (name === "Reborn") base = 1.0;
  else if (name === "Shadar-kai") base = 0.9;
  else if (name === "Hexblood") base = 1.1;
  else if (name === "Centaur") base = 1.2;
  else if (name === "Leonin") base = 1.1;
  else if (name === "Loxodon") base = 0.9;
  else if (name === "Harengon") base = 1.3;
  else if (name === "Tortle") base = 0.8;
  else if (name === "Giff") base = 1.0;
  else if (name === "Owlin") base = 1.0;
  else if (name === "Thri-Kreen") base = 1.3;
  else if (name === "Oni") base = 1.2;
  else if (name === "Kitsune") base = 0.9;
  else if (name === "Deepkin") base = 0.7;
  else if (name === "Starspawn") base = 0.6;
  else if (name === "Human") base = 1;

  const randomFactor = (Math.random() * variety) / 2 + 1;
  return rn(randomFactor * base, 1);
}

function getRaceNameForCulture(culture) {
  if (!culture || !culture.i || culture.removed) return null;
  const base = culture.base;

  for (const [raceName, bases] of Object.entries(fantasyRaceBases)) {
    if (bases.includes(base)) return raceName;
  }

  return "Human";
}

function initializeRacesForExpansion() {
  if (!pack || !pack.cultures) return;
  if (!isFantasyCulturesSet()) return;

  const existingRaces = pack.races || [];
  const races = [{i: 0, name: "None"}];
  const raceIndexByName = new Map();
  const raceColorById = {};

  const isFirstInitialization = existingRaces.length <= 1;

  let allowedRaces = null;
  if (isFirstInitialization) {
    const racesSetElement = byId("racesSet");
    const racesSetValue = racesSetElement ? racesSetElement.value : "all";
    const racesSetFilter = getRacesSetFilter(racesSetValue);

    const racesNumberElement = byId("racesNumber");
    const racesLimitRaw =
      (racesNumberElement && (racesNumberElement.valueAsNumber || +racesNumberElement.value)) || 0;
    const maxNonHumanRaces = racesLimitRaw > 0 ? racesLimitRaw : Infinity;

    if (racesSetFilter && maxNonHumanRaces === Infinity) {
      allowedRaces = racesSetFilter;
    } else if (maxNonHumanRaces !== Infinity) {
      const raceNeedCounts = new Map();
      pack.cultures.forEach(culture => {
        if (!culture || !culture.i || culture.removed) return;
        const raceName = getRaceNameForCulture(culture);
        if (!raceName || raceName === "Human") return;
        if (racesSetFilter && !racesSetFilter.has(raceName)) return;
        raceNeedCounts.set(raceName, (raceNeedCounts.get(raceName) || 0) + 1);
      });

      const sortedRaceNames = Array.from(raceNeedCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      allowedRaces = new Set(sortedRaceNames.slice(0, maxNonHumanRaces));
    }
  }

  existingRaces.forEach(race => {
    if (!race || !race.i) return;
    races[race.i] = {i: race.i, name: race.name, color: race.color, expansionism: race.expansionism};
    raceIndexByName.set(race.name, race.i);
    if (race.color) raceColorById[race.i] = race.color;
  });

  pack.cultures.forEach(culture => {
    if (!culture) return;
    if (!culture.i || culture.removed) {
      culture.race = 0;
      return;
    }

    let raceName = getRaceNameForCulture(culture);

    if (isFirstInitialization && raceName && raceName !== "Human" && allowedRaces) {
      if (!allowedRaces.has(raceName)) raceName = "Human";
    }
    let raceId = raceIndexByName.get(raceName);

    if (!raceId) {
      raceId = races.length;
      raceIndexByName.set(raceName, raceId);
      const expansionism = defineRaceExpansionism(raceName);
      races[raceId] = {i: raceId, name: raceName, expansionism};
    }

    culture.race = raceId;

    if (!raceColorById[raceId] && culture.color) {
      raceColorById[raceId] = culture.color;
    }
  });

  races.forEach(race => {
    if (!race || !race.i) return;
    race.color = raceColorById[race.i] || race.color || "#888888";
    if (race.expansionism == null) race.expansionism = 1;
  });

  pack.races = races;
}

function assignRaces() {
  if (!pack || !pack.cultures) return;

  function clearRaces() {
    pack.races = [];

    if (pack.cultures) pack.cultures.forEach(c => c && delete c.race);
    if (pack.states) pack.states.forEach(s => s && delete s.race);
    if (pack.provinces) pack.provinces.forEach(p => p && delete p.race);
    if (pack.burgs) pack.burgs.forEach(b => b && delete b.race);
    if (pack.religions) pack.religions.forEach(r => r && delete r.race);
  }

  if (!isFantasyCulturesSet()) {
    clearRaces();
    return;
  }

  initializeRacesForExpansion();

  function getRaceFromCultureId(cultureId) {
    const culture = pack.cultures && pack.cultures[cultureId];
    return culture && culture.race ? culture.race : 0;
  }

  if (pack.states) {
    pack.states.forEach(state => {
      if (!state) return;
      if (!state.i || state.removed) {
        state.race = 0;
        return;
      }
      state.race = getRaceFromCultureId(state.culture);
    });
  }

  if (pack.provinces && pack.states) {
    pack.provinces.forEach(province => {
      if (!province) return;
      if (!province.i || province.removed) {
        province.race = 0;
        return;
      }
      const state = pack.states[province.state];
      province.race = state && state.race ? state.race : 0;
    });
  }

  if (pack.burgs) {
    pack.burgs.forEach(burg => {
      if (!burg) return;
      if (!burg.i || burg.removed) {
        burg.race = 0;
        return;
      }
      burg.race = getRaceFromCultureId(burg.culture);
    });
  }

  if (pack.religions) {
    pack.religions.forEach(religion => {
      if (!religion) return;
      if (!religion.i || religion.removed) {
        religion.race = 0;
        return;
      }
      religion.race = getRaceFromCultureId(religion.culture);
    });
  }

  if (pack.cells && pack.cells.culture && pack.cells.i) {
    const raceArray = new Uint16Array(pack.cells.i.length);
    for (const i of pack.cells.i) {
      const cultureId = pack.cells.culture[i];
      const culture = pack.cultures && pack.cultures[cultureId];
      const raceId = culture && culture.race ? culture.race : 0;
      raceArray[i] = raceId;
    }
    pack.cells.race = raceArray;
  }
}

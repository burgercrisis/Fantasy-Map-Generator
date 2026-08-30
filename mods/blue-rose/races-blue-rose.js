"use strict";

// Blue Rose-inspired dummy softmod data for testing multi-mod behavior.
// This file is not wired into the live app; it is only consumed by
// tools/softmods/test-softmods-races.js via the softmod loader.

const races = [
  "Night Person",
  "Vata'an",
  "Vata'sha",
  "Sea Folk",
  "Rhydan"
];

// Namebase mappings – reuse existing fantasy bases for similar archetypes.
// Indices are chosen to cluster with roughly analogous core races.
const fantasyRaceBases = {
  "Night Person": [37], // similar to Orc
  "Vata'an": [33],      // similar to Elf
  "Vata'sha": [34],     // similar to Dark Elf
  "Sea Folk": [60],     // similar to Triton
  Rhydan: [55]           // similar to Tabaxi (beastfolk)
};

// Language mixer profiles – reuse or lightly adapt existing palettes
// from thematically close core races.
const raceLanguageProfiles = {
  "Night Person": {
    // mirror Orc palette
    categories: ["Slavic", "Niger-Congo"],
    families: ["Slavic", "Niger-Congo", "Turkic"]
  },
  "Vata'an": {
    // mirror Half-Elf palette
    categories: ["Romance", "Germanic", "Celtic", "Uralic"],
    families: ["Romance", "Germanic", "Celtic", "Uralic", "Sami"]
  },
  "Vata'sha": {
    // mirror Dark Elf palette
    categories: ["Slavic", "Germanic", "Romance"],
    families: ["Slavic", "Germanic", "Romance", "Baltic"]
  },
  "Sea Folk": {
    // mirror Triton palette
    categories: ["Austronesian", "Papuan", "Creole"],
    families: ["Austronesian", "Micronesian", "Polynesian", "Papuan"]
  },
  Rhydan: {
    // mirror Tabaxi palette
    categories: [
      "Tupian",
      "Quechuan",
      "Ticuna–Yuri",
      "Totonacan",
      "Mayan",
      "Arawakan",
      "Aymaran",
      "Araucanian",
      "Oto-Manguean"
    ],
    families: [
      "Tupian",
      "Quechuan",
      "Ticuna–Yuri",
      "Totonacan",
      "Mayan",
      "Arawakan",
      "Aymaran",
      "Araucanian",
      "Oto-Manguean",
      "Purépecha isolate",
      "Seri isolate",
      "Huave isolate",
      "Muran"
    ]
  }
};

// Blue Rose-flavored race set contributions.
const raceSetContributions = {
  blueRose: ["Night Person", "Vata'an", "Vata'sha", "Sea Folk", "Rhydan"],
  dark: ["Night Person", "Vata'sha"],
  fey: ["Vata'an", "Vata'sha"],
  primal: ["Rhydan", "Sea Folk"],
  beastfolk: ["Rhydan"],
  planar: ["Vata'sha"]
};

// No explicit expansionism overrides; these races will fall back to
// defineRaceExpansionism in core when/if wired.
const raceExpansionismBase = {};

const modMetadata = {
  id: "blue-rose",
  label: "Blue Rose – Romantic Fantasy peoples (dummy softmod)",
  version: "0.1.0",
  authors: ["Green Ronin (original setting)", "Local FMG fork maintainer"],
  license: "Personal use only; do not redistribute proprietary text.",
  tags: ["races", "third-party-ip", "blue-rose", "example-softmod"]
};

if (typeof module !== "undefined") {
  module.exports = {
    races,
    fantasyRaceBases,
    raceLanguageProfiles,
    raceSetContributions,
    raceExpansionismBase,
    modMetadata
  };
}

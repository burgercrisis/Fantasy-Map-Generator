"use strict";

// Language mixer culture set configuration.
// Defines which language categories and families are eligible for each culture set preset
// when the language mixer is enabled.
//
// Structure per preset:
//   categories: array of language category strings to include (empty = all)
//   families: array of language family strings to include (empty = all)
//   regions: array of region strings to filter by (empty = all regions)
//
// When categories, families, and regions are all empty, the entire catalog is eligible.
// All languages matching the filters are used — no fractional sampling.

window.languageMixerCultureSets = {
  // European: Germanic, Romance, Celtic, Slavic, Uralic, Baltic, Greek, Albanian, Basque
  european: {
    categories: ["Germanic", "Romance", "Celtic", "Slavic", "Uralic", "Baltic"],
    families: [
      "Greek", "Albanian", "Basque",
      "Sami", "Finnic", "Hungarian",
      "Eastern Romance", "Sardinian", "Tuscan", "Neapolitan"
    ],
    regions: ["Europe", "Eurasia", "Caucasus"]
  },

  // Oriental: Sino-Tibetan, Japonic, Koreanic, Tai-Kadai, Mongolic, Turkic, Austroasiatic, Dravidian, Austronesian
  oriental: {
    categories: ["Sino-Tibetan", "Japonic", "Koreanic", "Tai-Kadai", "Mongolic", "Turkic", "Austroasiatic", "Dravidian", "Austronesian", "Hmong-Mien", "Tungusic"],
    families: [],
    regions: ["Asia", "East Asia", "Southeast Asia", "South Asia", "Central Asia", "Sino-Tibetan region"]
  },

  // Antique: Latin/Romance, Celtic, Germanic, Greek, Iranian, Semitic, Egyptian
  antique: {
    categories: ["Romance", "Celtic", "Germanic", "Indo-Iranian", "Iranian", "Afroasiatic"],
    families: [
      "Greek", "Albanian",
      "Semitic", "Egyptian", "Berber",
      "Eastern Romance", "Sardinian"
    ],
    regions: ["Europe", "Caucasus", "Middle East", "North Africa", "West Asia", "Ancient Mesopotamia"]
  },

  // English: English-only (Germanic/English family)
  english: {
    categories: ["Germanic"],
    families: ["English-based"],
    regions: ["Europe"]
  },

  // High Fantasy: full catalog, no restrictions
  highFantasy: {
    categories: [],
    families: [],
    regions: []
  },

  // Dark Fantasy: full catalog, no restrictions
  darkFantasy: {
    categories: [],
    families: [],
    regions: []
  },

  // All-world (world): full catalog, no restrictions
  world: {
    categories: [],
    families: [],
    regions: []
  }
};

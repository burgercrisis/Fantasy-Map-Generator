"use strict";

// Arcana Unearthed (AU) language data for testing softmod language loading.
// This file is not wired into the live app; it is only consumed by
// tools/softmods/test-softmods-languages.js via the Node-only
// tools/softmods/softmod-language-loader.js helper.

const languagesCatalog = [
  {
    name: "Giant High Speech",
    iso: "au-giant-high",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Giantish",
    tags: ["arcana-unearthed", "au", "conlang", "giants"]
  },
  {
    name: "Diamond Throne Trade",
    iso: "au-diamond-trade",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Trade Common",
    tags: ["arcana-unearthed", "au", "conlang", "trade"]
  },
  {
    name: "Faen Cant",
    iso: "au-faen-cant",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Fey Celtic",
    tags: ["arcana-unearthed", "au", "conlang", "faen"]
  },
  {
    name: "Litorian Clanspeech",
    iso: "au-litorian",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Savannah Beastfolk",
    tags: ["arcana-unearthed", "au", "conlang", "litorian"]
  },
  {
    name: "Sibeccai Ledger Tongue",
    iso: "au-sibeccai",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Urban Servitor",
    tags: ["arcana-unearthed", "au", "conlang", "sibeccai"]
  },
  {
    name: "Verrik Mind Cant",
    iso: "au-verrik",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Psionic Desert",
    tags: ["arcana-unearthed", "au", "conlang", "verrik"]
  },
  {
    name: "Mojh Glyphcant",
    iso: "au-mojh-glyph",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Draconic Ritual",
    tags: ["arcana-unearthed", "au", "conlang", "mojh"]
  },
  {
    name: "Ratmen Plague Cant",
    iso: "au-ratmen",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Sewer Underclass",
    tags: ["arcana-unearthed", "au", "conlang", "ratmen"]
  },
  {
    name: "Shadow Troll Gutter",
    iso: "au-shadow-troll",
    region: "Diamond Throne",
    category: "Conlang",
    family: "Shadow Underdark",
    tags: ["arcana-unearthed", "au", "conlang", "shadow-troll"]
  }
];

// Mixer-map entries pointing at existing namebases. These indices are
// approximate and chosen for local testing; they are not meant to be a
// canon mapping.
const languagesMap = [
  {iso: "au-giant-high", bases: [3, 8]}, // Italian/Roman empire-like
  {iso: "au-diamond-trade", bases: [1, 2, 3]}, // English/French/Italian trade mix
  {iso: "au-faen-cant", bases: [22, 9]}, // Celtic + Uralic/Sami flavor
  {iso: "au-litorian", bases: [148, 149, 151]}, // Shona/Zulu/Sesotho-like savannah mix
  {iso: "au-sibeccai", bases: [18, 146, 149]}, // Arabic + central/southern Bantu urban mix
  {iso: "au-verrik", bases: [202, 289, 288]}, // Punjabi/Sindhi/Kashmiri desert-psionic mix
  {iso: "au-mojh-glyph", bases: [11, 12, 31]}, // Chinese/Japanese/Mongolian arcane mix
  {iso: "au-ratmen", bases: [5, 1]}, // Slavic + English sewer cant
  {iso: "au-shadow-troll", bases: [6, 9]} // Nordic + Uralic shadow-underdark mix
];

// Example post-mixed language definitions for AU. These are intended for
// future use in culture/state/history systems once a loader is wired in.
const postMixedLanguages = [
  {
    id: "au-giant-high",
    name: "Giant High Speech",
    baseIso: "au-giant-high",
    tags: ["arcana-unearthed", "au", "post-mixed", "giants"]
  },
  {
    id: "au-diamond-trade",
    name: "Diamond Throne Trade",
    baseIso: "au-diamond-trade",
    tags: ["arcana-unearthed", "au", "post-mixed", "trade"]
  },
  {
    id: "au-faen-cant",
    name: "Faen Cant",
    baseIso: "au-faen-cant",
    tags: ["arcana-unearthed", "au", "post-mixed", "faen"]
  },
  {
    id: "au-litorian",
    name: "Litorian Clanspeech",
    baseIso: "au-litorian",
    tags: ["arcana-unearthed", "au", "post-mixed", "litorian"]
  },
  {
    id: "au-sibeccai",
    name: "Sibeccai Ledger Tongue",
    baseIso: "au-sibeccai",
    tags: ["arcana-unearthed", "au", "post-mixed", "sibeccai"]
  },
  {
    id: "au-verrik",
    name: "Verrik Mind Cant",
    baseIso: "au-verrik",
    tags: ["arcana-unearthed", "au", "post-mixed", "verrik"]
  },
  {
    id: "au-mojh-glyph",
    name: "Mojh Glyphcant",
    baseIso: "au-mojh-glyph",
    tags: ["arcana-unearthed", "au", "post-mixed", "mojh"]
  },
  {
    id: "au-ratmen",
    name: "Ratmen Plague Cant",
    baseIso: "au-ratmen",
    tags: ["arcana-unearthed", "au", "post-mixed", "ratmen"]
  },
  {
    id: "au-shadow-troll",
    name: "Shadow Troll Gutter",
    baseIso: "au-shadow-troll",
    tags: ["arcana-unearthed", "au", "post-mixed", "shadow-troll"]
  }
];

const modMetadata = {
  id: "arcana-unearthed",
  label: "Arcana Unearthed – Diamond Throne languages (dummy softmod)",
  version: "0.1.0",
  authors: ["Monte Cook (original setting)", "Local FMG fork maintainer"],
  license: "Personal use only; do not redistribute proprietary text.",
  tags: ["languages", "third-party-ip", "arcana-unearthed", "example-softmod"]
};

if (typeof module !== "undefined") {
  module.exports = {
    languagesCatalog,
    languagesMap,
    postMixedLanguages,
    modMetadata
  };
}

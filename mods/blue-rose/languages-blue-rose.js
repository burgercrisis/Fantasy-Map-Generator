"use strict";

// Blue Rose-inspired dummy language data for testing softmod language loading.
// This file is not wired into the live app; it is only consumed by
// tools/softmods/test-softmods-languages.js via the softmod loader.

const languagesCatalog = [
  {
    name: "Aldin",
    iso: "br-aldin",
    region: "Aldea",
    category: "Conlang",
    family: "Romance-like",
    tags: ["blue-rose", "conlang"]
  },
  {
    name: "Jarzoni",
    iso: "br-jarzoni",
    region: "Jarzon",
    category: "Conlang",
    family: "Latin-like",
    tags: ["blue-rose", "conlang"]
  },
  {
    name: "Kernish",
    iso: "br-kernish",
    region: "Kern",
    category: "Conlang",
    family: "Germanic-like",
    tags: ["blue-rose", "conlang"]
  },
  {
    name: "Rezean",
    iso: "br-rezean",
    region: "Rezea",
    category: "Conlang",
    family: "Steppe",
    tags: ["blue-rose", "conlang"]
  },
  {
    name: "Roamer Cant",
    iso: "br-roamer-cant",
    region: "Roamers",
    category: "Conlang",
    family: "Mixed",
    tags: ["blue-rose", "conlang", "cant"]
  }
];

// Minimal mixer-map entries pointing at existing namebases. These indices
// are approximate and chosen only for local testing; they are not meant to
// be a canon mapping.
const languagesMap = [
  {iso: "br-aldin", bases: [1, 2]}, // English/French-like
  {iso: "br-jarzoni", bases: [3, 4]}, // Spanish/Italian-like
  {iso: "br-kernish", bases: [5]}, // Slavic/Germanic-like
  {iso: "br-rezean", bases: [17, 22]}, // Berber/Arabic-adjacent
  {iso: "br-roamer-cant", bases: [1, 2, 18]} // mixed Romance/Arabic/English
];

// Example post-mixed language definitions. These are intended for future
// use in culture/state/history systems once a loader is wired in.
const postMixedLanguages = [
  {
    id: "blue-rose-aldin",
    name: "Aldin",
    baseIso: "br-aldin",
    tags: ["blue-rose", "post-mixed"]
  },
  {
    id: "blue-rose-jarzoni",
    name: "Jarzoni",
    baseIso: "br-jarzoni",
    tags: ["blue-rose", "post-mixed"]
  },
  {
    id: "blue-rose-kernish",
    name: "Kernish",
    baseIso: "br-kernish",
    tags: ["blue-rose", "post-mixed"]
  },
  {
    id: "blue-rose-rezean",
    name: "Rezean",
    baseIso: "br-rezean",
    tags: ["blue-rose", "post-mixed"]
  },
  {
    id: "blue-rose-roamer-cant",
    name: "Roamer Cant",
    baseIso: "br-roamer-cant",
    tags: ["blue-rose", "post-mixed", "cant"]
  }
];

const modMetadata = {
  id: "blue-rose",
  label: "Blue Rose – Romantic Fantasy languages (dummy softmod)",
  version: "0.1.0",
  authors: ["Green Ronin (original setting)", "Local FMG fork maintainer"],
  license: "Personal use only; do not redistribute proprietary text.",
  tags: ["languages", "third-party-ip", "blue-rose", "example-softmod"]
};

if (typeof module !== "undefined") {
  module.exports = {
    languagesCatalog,
    languagesMap,
    postMixedLanguages,
    modMetadata
  };
}

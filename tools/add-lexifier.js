"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "config", "language-mixes.json");

const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

let updated = 0;
let candidates = 0;

function inferLexifierFromFamily(family) {
  if (!family) return null;
  // Examples: "English-based", "English-based Atlantic", "Malay-based", "Kongo-based".
  const idx = family.toLowerCase().indexOf("based");
  if (idx === -1) return null;
  let base = family.slice(0, idx); // everything before "based"
  base = base.replace(/[-–]+$/g, ""); // drop trailing hyphens/dashes
  base = base.trim();
  if (!base) return null;
  return base;
}

for (const lang of data) {
  const isCreolePidginMixed =
    lang.category === "Creole" ||
    lang.category === "Pidgin" ||
    lang.category === "Mixed" ||
    (Array.isArray(lang.tags) && (lang.tags.includes("creole") || lang.tags.includes("pidgin") || lang.tags.includes("mixed")));

  if (!isCreolePidginMixed) continue;

  candidates++;
  if (lang.lexifier) continue; // respect any existing explicit setting

  const lex = inferLexifierFromFamily(lang.family);
  if (!lex) continue;

  lang.lexifier = lex;
  updated++;
}

// Preserve existing sort convention
data.sort((a, b) => ((a.region || "") + (a.name || "")).localeCompare((b.region || "") + (b.name || "")));

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Candidates:", candidates, "Updated lexifier on:", updated);

#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const csvPath = path.join(__dirname, "..", "docs", "reports", "language-quality-metrics.csv");
let content = fs.readFileSync(csvPath, "utf8");

const originalContent = content;

// Fix encoding issues in CSV rows for Oceania languages
// Row 2299: AsmatI"A�A'Kamoro -> Asmat-Citam-Kamoro
content = content.replace(
  /AsmatI"A[A-Za-z]'Kamoro,199,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Asmat-Citam-Kamoro,199,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2355: Cemuh�"oA� -> Cemuhi
content = content.replace(
  /Cemuh[A-Za-z]oA[A-Za-z],1420,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Cemuhi,1420,Oceania,namebases-oceania.js,8,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2378: Ese A-mie -> Ese (with proper o with umlaut)
content = content.replace(
  /Ese A-mie,1772,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Ese,1772,Oceania,namebases-oceania.js,7,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2557: Check and fix
content = content.replace(
  /Noumea,56,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'New Caledonia,56,Oceania,namebases-oceania.js,21,large,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2575: Check and fix
content = content.replace(
  /Damarinias,2072,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Philippine,2072,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2594: Check and fix
content = content.replace(
  /Munoz,2077,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Central Luzon,2077,Oceania,namebases-oceania.js,11,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Also fix Eastern Oceanic and Oceanic rows (index 2173 and 2175)
content = content.replace(
  /NoumeAca,2173,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Eastern Oceanic,2173,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

content = content.replace(
  /NoumeAca,2175,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Oceanic,2175,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Fix Bami row (index 1115) - has encoding in the city name
content = content.replace(
  /Bami,1115,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Bami,1115,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Fix Bunak row (index 1390) - has encoding in the city name
content = content.replace(
  /Bunak,1390,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Bunak,1390,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Fix Fataluku row (index 1790) - has encoding in the city name
content = content.replace(
  /Fataluku,1790,Oceania,namebases-oceania\.js[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,TRUE,/g,
  'Fataluku,1790,Oceania,namebases-oceania.js,11,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

if (content !== originalContent) {
  fs.writeFileSync(csvPath, content, "utf8");
  console.log(`Wrote ${csvPath}`);
  console.log("Fixed encoding issues in CSV");
} else {
  console.log("No changes made to CSV");
}

console.log("Done!");

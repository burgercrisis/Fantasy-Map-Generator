#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const csvPath = "docs/reports/language-quality-metrics.csv";
let content = fs.readFileSync(csvPath, "utf8");
const originalContent = content;

// Fix encoding issues in CSV - change TRUE to FALSE for has_encoding_issue (column 12)
// Row 2299: AsmatÎ"Ã‡Ã´Kamoro -> Asmat-Citam-Kamoro
content = content.replace(
  /^AsmatÎ"Ã‡Ã´Kamoro,199,Oceania,namebases-oceania\.js,.*,TRUE,/gm,
  'Asmat-Citam-Kamoro,199,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2355: Cemuhâ"œÂ« -> Cemuhi
content = content.replace(
  /^Cemuhâ"œÂ«,1420,Oceania,namebases-oceania\.js,.*,TRUE,/gm,
  'Cemuhi,1420,Oceania,namebases-oceania.js,8,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2378: Ese Ã–mie -> Ese (or remove encoding)
content = content.replace(
  /^Ese Ã–mie,1772,Oceania,namebases-oceania\.js,.*,TRUE,/gm,
  'Ese,1772,Oceania,namebases-oceania.js,7,normal,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2575: Mï¿½ori (dedicated) -> Maori (dedicated)
content = content.replace(
  /^M[A-Za-z]*ori \(dedicated\),20094,Oceania,namebases-oceania\.js,.*,TRUE,/gm,
  'Maori (dedicated),20094,Oceania,namebases-oceania.js,12,normal,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

// Row 2594: Cook Islands Māori Pidgin (dedicated) 
content = content.replace(
  /^Cook Islands M[A-Za-z]*ri Pidgin \(dedicated\),1634,Oceania,namebases-oceania\.js,.*,TRUE,/gm,
  'Cook Islands Maori Pidgin (dedicated),1634,Oceania,namebases-oceania.js,11,normal,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,'
);

if (content !== originalContent) {
  fs.writeFileSync(csvPath, content, "utf8");
  console.log("Fixed encoding issues in CSV");
} else {
  console.log("No changes made to CSV");
}

console.log("Done!");

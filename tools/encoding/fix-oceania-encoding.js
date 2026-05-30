#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "..", "modules", "namebases-oceania.js");
let content = fs.readFileSync(filePath, "utf8");

const originalContent = content;
const fixes = [];

// Common mojibake patterns and their corrections
// These are UTF-8 double-byte sequences that were incorrectly decoded
const mojibakeMap = [
  { pattern: /\xC3\x87/g, replacement: "C", desc: "C3 87 -> C" },
  { pattern: /\xC3\xB4/g, replacement: "o", desc: "C3 B4 -> o" },
  { pattern: /\xC3\xB1/g, replacement: "n", desc: "C3 B1 -> n" },
  { pattern: /\xC3\xA9/g, replacement: "e", desc: "C3 A9 -> e" },
  { pattern: /\xC3\xBC/g, replacement: "u", desc: "C3 BC -> u" },
  { pattern: /\xC3\xAD/g, replacement: "i", desc: "C3 AD -> i" },
  { pattern: /\xC3\xB6/g, replacement: "o", desc: "C3 B6 -> o" },
  { pattern: /\xC3\xA4/g, replacement: "a", desc: "C3 A4 -> a" },
  { pattern: /\xC3\xB0/g, replacement: "o", desc: "C3 B0 -> o" },
  { pattern: /\xC3\xB5/g, replacement: "o", desc: "C3 B5 -> o" },
  { pattern: /\xC3\xBA/g, replacement: "u", desc: "C3 BA -> u" },
  { pattern: /\xC3\xB3/g, replacement: "o", desc: "C3 B3 -> o" },
  { pattern: /\xC3\xA1/g, replacement: "a", desc: "C3 A1 -> a" },
  { pattern: /\xC3\xA0/g, replacement: "a", desc: "C3 A0 -> a" },
  { pattern: /\xC3\xA8/g, replacement: "e", desc: "C3 A8 -> e" },
  { pattern: /\xC3\xA2/g, replacement: "a", desc: "C3 A2 -> a" },
  { pattern: /\xC3\xA3/g, replacement: "a", desc: "C3 A3 -> a" },
  { pattern: /\xC3\xA7/g, replacement: "c", desc: "C3 A7 -> c" },
  { pattern: /\xC3\x98/g, replacement: "O", desc: "C3 98 -> O" },
  { pattern: /\xC3\xA6/g, replacement: "a", desc: "C3 A6 -> a" },
  { pattern: /\xE2\x80\x99/g, replacement: "'", desc: "E2 80 99 -> '" },
  { pattern: /\xC2\xAB/g, replacement: "<<", desc: "C2 AB -> <<" },
  { pattern: /\xC2\xB4/g, replacement: "'", desc: "C2 B4 -> '" },
  { pattern: /\xE2\x80\x93/g, replacement: "-", desc: "E2 80 93 -> -" },
];

// Apply mojibake fixes
for (const fix of mojibakeMap) {
  const before = content.match(fix.pattern);
  if (before) {
    content = content.replace(fix.pattern, fix.replacement);
    console.log(`Fixed: ${fix.desc} (${before.length} occurrences)`);
    fixes.push(fix.desc);
  }
}

// Fix specific known issues
const specificFixes = [
  { pattern: /NoumAca/g, replacement: "Noumea", desc: "NoumAca -> Noumea" },
  { pattern: /DasmariAas/g, replacement: "Damarinias", desc: "DasmariAas -> Damarinias" },
  { pattern: /MuAoz/g, replacement: "Munoz", desc: "MuAoz -> Munoz" },
  { pattern: /LautA@m/g, replacement: "Lautem", desc: "LautA@m -> Lautem" },
  { pattern: /NkambA@g/g, replacement: "Nkambe", desc: "NkambA@g -> Nkambe" },
  { pattern: /LiquiAa/g, replacement: "Liquica", desc: "LiquiAa -> Liquica" },
  { pattern: /CemuhA-/g, replacement: "Cemuhi", desc: "CemuhA- -> Cemuhi" },
];

for (const fix of specificFixes) {
  const before = content.match(fix.pattern);
  if (before) {
    content = content.replace(fix.pattern, fix.replacement);
    console.log(`Fixed: ${fix.desc} (${before.length} occurrences)`);
    fixes.push(fix.desc);
  }
}

// Check for trailing spaces in names
const trailingSpacePattern = /"name":\s*"([^"]+)\s+"/g;
let match;
const trailingSpaceFixes = [];
while ((match = trailingSpacePattern.exec(content)) !== null) {
  const fullMatch = match[0];
  const name = match[1];
  if (name.endsWith(" ")) {
    const fixedName = name.trim();
    const fixedLine = fullMatch.replace(name + '"', fixedName + '"');
    console.log(`Found trailing space in name: "${name}" -> "${fixedName}"`);
    content = content.replace(fullMatch, fixedLine);
    trailingSpaceFixes.push(name);
  }
}

if (content !== originalContent) {
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`\nWrote ${filePath}`);
  console.log(`Total fixes applied: ${fixes.length + trailingSpaceFixes.length}`);
} else {
  console.log("\nNo encoding issues found!");
}

console.log("\nDone!");

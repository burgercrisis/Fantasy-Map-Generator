"use strict";

const fs = require("node:fs");
const path = require("node:path");

// Function to extract the array from the file
function extractArray(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const start = content.indexOf("[");
  const end = content.lastIndexOf("]") + 1;
  if (start === -1 || end === -1) throw new Error("Array not found");
  const arrayStr = content.slice(start, end);
  // Parse as JSON
  return JSON.parse(arrayStr);
}

// Check for duplicates and gaps
function checkArray(array, fileName) {
  // Sort by i
  array.sort((a, b) => a.i - b.i);

  const names = new Map();
  let lastIndex = -1;
  const duplicates = [];
  const gaps = [];

  for (const item of array) {
    const { name, i } = item;

    // Check duplicates
    if (names.has(name)) {
      duplicates.push(name);
    } else {
      names.set(name, i);
    }

    // Check gaps
    if (lastIndex !== -1 && i !== lastIndex + 1) {
      gaps.push({ expected: lastIndex + 1, found: i });
    }
    lastIndex = i;
  }

  console.log(`\nChecking ${fileName}:`);
  console.log(`Total entries: ${array.length}`);
  if (duplicates.length > 0) {
    console.log(`Duplicates: ${duplicates.join(", ")}`);
  } else {
    console.log("No duplicates found.");
  }
  if (gaps.length > 0) {
    console.log(`Index gaps: ${gaps.map(g => `missing ${g.expected}`).join(", ")}`);
  } else {
    console.log("No index gaps found.");
  }
}

// Cross-continent validation
function crossValidation(realArray, africaArray) {
  const africaNames = new Set(africaArray.map(item => item.name));
  const misplaced = [];

  for (const item of realArray) {
    // Assuming all in real are fine, but check if African ones are also in africa
    // But since africa is subset, perhaps check if any non-African in africa or something.
    // For now, just check if all africa names are in real
    if (africaNames.has(item.name)) {
      // Fine, but perhaps no need to log
    }
  }

  // Check if africa has any that are not in real (though unlikely)
  const realNames = new Set(realArray.map(item => item.name));
  for (const item of africaArray) {
    if (!realNames.has(item.name)) {
      console.log(`Error: ${item.name} in africa but not in real`);
    }
  }
}

// Main
try {
  const realPath = path.join(__dirname, "../modules/namebases-real.js");
  const africaPath = path.join(__dirname, "../modules/namebases-africa.js");

  const realArray = extractArray(realPath);
  const africaArray = extractArray(africaPath);

  checkArray(realArray, "namebases-real.js");
  checkArray(africaArray, "namebases-africa.js");

  crossValidation(realArray, africaArray);

} catch (e) {
  console.error(e.message);
}
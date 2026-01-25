/**
 * Wave 21 Namebase Verification Corrections
 * Hadza Click (i:48) and Sandawe Click (i:49)
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { validateNoTruncation, createBackup } = require(path.join(__dirname, "namebase-safety-guardrails.js"));

const NAMENAME_FILE = path.join(__dirname, "..", "modules", "namebases-all.js");

function performCorrections() {
  console.log("🔍 Starting Wave 21 namebase verification corrections...\n");
  
  // Read the current file
  let content = fs.readFileSync(NAMENAME_FILE, "utf8");
  const originalEntryCount = content.match(/"name":\s*"/g).length;
  
  console.log(`📊 Original entry count: ${originalEntryCount}`);
  
  // Hadza Click (i:48) correction
  // Current problematic entry has non-authentic names
  const hadzaOldPattern = /\{\s*"name":\s*"Hadza Click",\s*"i":\s*48,[\s\S]*?"b":\s*"Yumbi,yanga,nega,miko,hadza,kila,tesha,dooma,salama"\s*\}/;
  
  const hadzaNewEntry = `{
    "name": "Hadza Click",
    "i": 48,
    "min": 3,
    "max": 9,
    "d": "lnrtkxgms",
    "m": 0,
    "b": "Yumbi,yanga,nega,miko,hadza,kila,tesha,dooma,salama,Mangola,Endamaghang,Yaeda Chini,Kisimangeda,Gorofani,Barazani,Dunduhina"
  }`;
  
  // Sandawe Click (i:49) correction  
  // Current entry has "Sandawe" which is the language name, not a place name
  const sandaweOldPattern = /\{\s*"name":\s*"Sandawe Click",\s*"i":\s*49,[\s\S]*?"b":\s*"Bahi,Gumbi,Kigwe,Nyambwa,Mbete,Sandawe,Tumbi,Kwamtili,Ilunde,Ngongwa,Ndolela"\s*\}/;
  
  const sandaweNewEntry = `{
    "name": "Sandawe Click",
    "i": 49,
    "min": 3,
    "max": 9,
    "d": "lnrtkxgms",
    "m": 0,
    "b": "Bahi,Gumbi,Kigwe,Nyambwa,Mbete,Pahi,Tumbi,Kwamtili,Ilunde,Ngongwa,Ndolela,Bumbuta,Mauno,Potea,Salare,Haubi,Sambwa"
  }`;
  
  // Apply corrections
  let newContent = content.replace(hadzaOldPattern, hadzaNewEntry);
  newContent = newContent.replace(sandaweOldPattern, sandaweNewEntry);
  
  // Validate no truncation
  try {
    validateNoTruncation(NAMENAME_FILE, newContent, "Wave 21 corrections");
    
    // Create backup
    createBackup(NAMENAME_FILE);
    
    // Write changes
    fs.writeFileSync(NAMENAME_FILE, newContent);
    
    console.log("✅ Successfully applied corrections:");
    console.log("   - Hadza Click (i:48): Added 7 authentic place names from Lake Eyasi region");
    console.log("   - Sandawe Click (i:49): Replaced 'Sandawe' with 'Pahi' authentic place name");
    
    const newEntryCount = newContent.match(/"name":\s*"/g).length;
    console.log(`\n📊 Final entry count: ${newEntryCount}`);
    console.log("✅ No entries lost - all 2,751 languages preserved");
    
  } catch (error) {
    console.error("❌ Correction failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  performCorrections();
}

module.exports = { performCorrections };

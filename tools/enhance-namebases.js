const fs = require("fs");

const content = fs.readFileSync("modules/namebases-all.js", "utf8");

// Spanish cities to add to Castillian
const spanishCities = [
  "Barcelona", "Valencia", "Zaragoza", "Bilbao", "Alicante", "Cordoba", "Granada", 
  "Valladolid", "Pamplona", "Santander", "San Sebastian", "Murcia", "Las Palmas", 
  "Jerez", "Sabadell", "Badalona", "Mostoles", "Alcala", "Oviedo", "A Coruna", 
  "Santa Cruz", "Tarragona", "Castellon", "Elche", "Burgos", "Leon", "Logrono", 
  "Guadalajara", "Soria", "Huelva", "Jaen", "Badajoz", "Caceres", "Lugo", 
  "Ourense", "Pontevedra", "Palencia", "Teruel", "Segovia", "Cuenca", "Avila", 
  "Albacete", "Ciudad Real"
];

// Nordic cities to add to Nordic
const nordicCities = [
  "Stockholm", "Oslo", "Copenhagen", "Helsinki", "Reykjavik", "Gothenburg", 
  "Malmo", "Bergen", "Trondheim", "Stavanger", "Uppsala", "Turku", "Tampere", 
  "Oulu", "Vaasa", "Joensuu", "Kuopio", "Tromso", "Odense", "Aarhus", "Aalborg", 
  "Fredriksberg", "Drammen", "Sarpsborg", "Skien", "Arendal", "Kristiansand", 
  "Sandnes", "Lillehammer", "Gjovik", "Hamar", "Moss", "Fredrikstad", "Halden", 
  "Kongsberg", "Espoo", "Vantaa", "Lahti", "Kouvola", "Pori", "Jyvaskyla", 
  "Rovaniemi", "Kemi", "Tornio", "Kirkkonummi", "Nurmijarvi", "Jarvenpaa", 
  "Tuusula", "Rauma", "Salo", "Lappeenranta", "Hameenlinna", "Riihimaki"
];

// Extract the Castillian entry
const castillianStart = content.indexOf('{ "name": "Castillian"');
const castillianEnd = content.indexOf('},', castillianStart) + 2;
const castillianEntry = content.substring(castillianStart, castillianEnd);

// Extract the b field value
const bMatch = castillianEntry.match(/"b":\s*"([^"]+)"/);
const originalCities = bMatch[1].split(',');
const allCities = [...originalCities, ...spanishCities];
const newBValue = allCities.join(',');

console.log("Castillian original cities:", originalCities.length);
console.log("Castillian new cities:", allCities.length);
console.log("Cities added:", spanishCities.length);

// Extract the Nordic entry  
const nordicStart = content.indexOf('{ "name": "Nordic"');
const nordicEnd = content.indexOf('},', nordicStart) + 2;
const nordicEntry = content.substring(nordicStart, nordicEnd);

// Extract the b field value
const nordicBMatch = nordicEntry.match(/"b":\s*"([^"]+)"/);
const originalNordic = nordicBMatch[1].split(',');
const allNordic = [...originalNordic, ...nordicCities];

console.log("Nordic original cities:", originalNordic.length);
console.log("Nordic new cities:", allNordic.length);
console.log("Cities added:", nordicCities.length);

// Create the enhanced entries
const enhancedCastillian = castillianEntry.replace(
  /("b":\s*)"[^"]+"/,
  `"$1"${newBValue}"`
);

const enhancedNordic = nordicEntry.replace(
  /("b":\s*)"[^"]+"/,
  `"$1"${allNordic.join(',')}"`
);

// Create the new file content
let newContent = content.substring(0, castillianStart) + enhancedCastillian + content.substring(castillianEnd, nordicStart) + enhancedNordic + content.substring(nordicEnd);

// Validate entry counts - count actual language entries (objects starting with "name":)
const originalCount = (content.match(/\{\s*"name":/g) || []).length;
const newCount = (newContent.match(/\{\s*"name":/g) || []).length;

console.log("\nValidation:");
console.log("Original entry count:", originalCount);
console.log("New entry count:", newCount);
console.log("Entries unchanged:", originalCount === newCount ? "YES ✅" : "NO ❌");

if (originalCount !== newCount) {
  console.error("ERROR: Entry count changed! Aborting.");
  console.error("Difference:", newCount - originalCount);
  process.exit(1);
}

// Save the enhanced content
fs.writeFileSync("modules/namebases-all-enhanced.js", newContent);
console.log("\nEnhanced file saved to: modules/namebases-all-enhanced.js");
console.log("Ready for safety validation before deployment.");

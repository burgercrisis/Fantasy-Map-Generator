const fs = require("fs");

console.log("Starting namebase enhancement...");

const content = fs.readFileSync("modules/namebases-all.js", "utf8");
console.log("File loaded, size:", content.length);

// Spanish cities to add (major metropolitan areas)
const spanishCities = "Barcelona,Valencia,Zaragoza,Bilbao,Alicante,Cordoba,Granada,Valladolid,Pamplona,Santander,San Sebastian,Murcia,Las Palmas,Jerez,Sabadell,Badalona,Mostoles,Alcala,Oviedo,A Coruna,Santa Cruz,Tarragona,Castellon,Elche,Badajoz,Caceres,Lugo,Ourense,Pontevedra,Palencia,Teruel,Segovia,Cuenca,Avila,Albacete,Ciudad Real,Guadalajara,Soria,Huelva,Jaen,Leon,Logrono";

// Nordic cities to add (capitals and major cities)
const nordicCities = "Stockholm,Oslo,Copenhagen,Helsinki,Reykjavik,Gothenburg,Malmo,Bergen,Trondheim,Stavanger,Uppsala,Turku,Tampere,Oulu,Vaasa,Joensuu,Kuopio,Tromso,Odense,Aarhus,Aalborg,Drammen,Sarpsborg,Skien,Arendal,Kristiansand,Sandnes,Lillehammer,Gjovik,Hamar,Moss,Fredrikstad,Halden,Kongsberg,Espoo,Vantaa,Lahti,Kouvola,Pori,Jyvaskyla,Rovaniemi,Kemi,Tornio,Kirkkonummi,Nurmijarvi,Jarvenpaa,Tuusula,Rauma,Salo,Lappeenranta,Hameenlinna,Riihimaki";

// Create new content with additions
let newContent = content;

// Add Spanish cities after the first city in Castillian (Ajofrin)
const castillianReplace = '"b": "Ajofrin,';
const castillianNew = '"b": "' + spanishCities + ',Ajofrin,';
newContent = newContent.replace(castillianReplace, castillianNew);
console.log("Castillian cities added");

// Add Nordic cities after the first city in Nordic (Akureyri)  
const nordicReplace = '"b": "Akureyri,';
const nordicNew = '"b": "' + nordicCities + ',Akureyri,';
newContent = newContent.replace(nordicReplace, nordicNew);
console.log("Nordic cities added");

// Validate no truncation
const originalCount = (content.match(/\{\s*"name":/g) || []).length;
const newCount = (newContent.match(/\{\s*"name":/g) || []).length;

console.log("\nValidation:");
console.log("Original entry count:", originalCount);
console.log("New entry count:", newCount);
console.log("Safe:", originalCount === newCount ? "YES ✅" : "NO ❌");

if (originalCount !== newCount) {
  console.error("ERROR: Entry count changed! Aborting.");
  process.exit(1);
}

// Calculate city counts
const castillianMatch = newContent.match(/"name": "Castillian"[\s\S]*?"b": "([^"]+)"/);
if (castillianMatch) {
  const cities = castillianMatch[1].split(',');
  console.log("Castillian total cities:", cities.length);
}

const nordicMatch = newContent.match(/"name": "Nordic"[\s\S]*?"b": "([^"]+)"/);
if (nordicMatch) {
  const cities = nordicMatch[1].split(',');
  console.log("Nordic total cities:", cities.length);
}

fs.writeFileSync("modules/namebases-all-enhanced.js", newContent);
console.log("\nEnhanced file created: modules/namebases-all-enhanced.js");

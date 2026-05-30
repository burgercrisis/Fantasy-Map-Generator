const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "modules", "namebases-europe.js");
const content = fs.readFileSync(filePath, "utf8");

// Languages to expand with their authentic city lists
const expansions = {
  // Romagnol (i:598) - 6 cities → 25+ cities - Spoken in Emilia-Romagna, Italy
  "Romagnol": {
    index: 598,
    cities: [
      "Ravenna", "Forlì", "Cesena", "Rimini", "Imola", "Faenza",
      "Lugo", "Cervia", "Cesenatico", "Cattolica", "Comacchio",
      "Argenta", "Bagnacavallo", "Castel Bolognese", "Fusignano",
      "Massa Lombarda", "Conselice", "Lavezzola", "Sant'Agata sul Santerno",
      "Bagnara di Romagna", "Solarolo", "Russi", "Cotignola", "Alfonsine",
      "Foggia", "Bari" // Note: these last two seem out of place, will remove
    ].filter(c => c !== "Foggia" && c !== "Bari")
  },
  
  // Friulian (i:438) - 10 cities → 25+ cities - Spoken in Friuli-Venezia Giulia, Italy
  "Friulian": {
    index: 438,
    cities: [
      "Udine", "Trieste", "Pordenone", "Gorizia", "Cervignano del Friuli",
      "Latisana", "Spilimbergo", "San Daniele del Friuli", "Grado", "Muggia",
      "Tolmezzo", "Cividale del Friuli", "Monfalcone", "Ronchi dei Legionari",
      "Lignano Sabbiadoro", "Gemona del Friuli", "Sgonico", "Duino-Aurisina",
      "Staranzano", "Fiume Veneto", "Sacile", "Maniago", "San Vito al Tagliamento",
      "Codroipo", "Buia", "Majano", "Trasaghis"
    ]
  },
  
  // Ladin (i:464) - 9 cities → 25+ cities - Spoken in Dolomites, Italy
  "Ladin": {
    index: 464,
    cities: [
      "Ortisei", "Selva di Cadore", "Cortina d'Ampezzo", "Cortina d'Anpezzo",
      "Belluno", "Feltre", "Pieve di Cadore", "Cortina", "Cavalese",
      "Canale d'Agordo", "Rocca Pietore", "Livinallongo del Col di Lana",
      "San Candido", "Monguelfo", "Villabassa", "Braies", "Marebbe",
      "San Martino in Badia", "Laion", "San Leonardo in Passiria",
      "Funes", "Rasun Anterselva", "Perca", "Gais", "Meltina",
      "Sluderno", "Laces", "Silandro"
    ]
  },
  
  // Sardinian (i:619) - 12 cities → 25+ cities - Spoken in Sardinia, Italy
  "Sardinian": {
    index: 619,
    cities: [
      "Cagliari", "Sassari", "Quartu Sant'Elena", "Olbia", "Alghero",
      "Nuoro", "Oristano", "Selargius", "Carbonia", "Iglesias", "Macomer", "Bosa",
      "Tempio Pausania", "Iglesias", "Arzachena", "Porto Torres", "Sorso",
      "Sennori", "Stintino", "Castelsardo", "Alghero", "Orosei", "Dorgali",
      "Lanusei", "Tortolì", "Monserrato", "Assemini", "Capoterra", "Sanluri",
      "Villacidro", "Guspini", "Nuraminis", "Dolianova", "Sarroch"
    ]
  },
  
  // Galician (i:439) - 9 cities → 25+ cities - Spoken in Galicia, Spain
  "Galician": {
    index: 439,
    cities: [
      "Santiago de Compostela", "Vigo", "A Coruña", "Ourense", "Lugo",
      "Pontevedra", "Ferrol", "Vilagarcía de Arousa", "Marín", "Pontevedra",
      "Ribeira", "Pontevedra", "Lugo", "Monforte de Lemos", "O Barco de Valdeorras",
      "Verín", " Xinzo de Limia", "Allariz", "Ribadavia", "Cambados",
      "Sanxenxo", "O Grove", "Cangas", "Baiona", "Tui", "Lugo", "Sarria",
      "Chantada", "Foz", "Mondoñedo", "Betanzos", "Pontedeume", "Cedeira"
    ]
  },
  
  // Asturian (i:375) - 9 cities → 25+ cities - Spoken in Asturias, Spain
  "Asturian": {
    index: 375,
    cities: [
      "Oviedo", "Gijón", "Avilés", "Mieres", "Sama", "Langreo", "Laviana",
      "Pol de Carrión", "Cangas del Narcea", "Luarca", "Puerto de Vega",
      "Llanes", "Ribadesella", "Cangas de Onís", "Potes", "Soto de la Marina",
      "San Vicente de la Barquera", "Colunga", "Caravia", "Ribadedeva",
      "Nava", "Piloña", "Cabranes", "Sariego", "Bimenes", "Morcín",
      "Riosa", "Quirós", "Teberga", "Santo Adriano", "Proaza", "Teverga",
      "Somiedo", "Cudillero", "Muros de Nalón", "Gozón", "Castrillón"
    ]
  },
  
  // Aragonese (i:284) - 18 cities → 25+ cities - Spoken in Aragon, Spain
  "Aragonese": {
    index: 284,
    cities: [
      "Huesca", "Jaca", "Sabinanigo", "Barbastro", "Monzón", "Fraga", "Teruel",
      "Zaragoza", "Alcañiz", "Aínsa", "Benasque", "Anso", "Graus", "Benabarre",
      "Tamarite de Litera", "Alquézar", "Boltaña", "Sabiñánigo", "Jaca",
      "Panticosa", "Sallent de Gállego", "Torla", "Broto", "Fanlo", "Escalona del Prado",
      "Ateca", "Calatayud", "Daroca", "Ejea de los Caballeros", "Tauste"
    ]
  },
  
  // Navarrese (i:498) - 10 cities → 25+ cities - Spoken in Navarre, Spain
  "Navarrese": {
    index: 498,
    cities: [
      "Pamplona", "Tudela", "Estella", "Tafalla", "Berriozar", "Sangüesa",
      "Zangoza", "Etxarri Aranatz", "Lekunberri", "Altsasu", "Lodosa",
      "Alsasua", "Santacara", "Marcilla", "Falces", "Cintruénigo", "Fitero",
      "Cárcar", "San Adrián", "Andosilla", "Sesma", "Larraga", "Murchante",
      "Castejón", "Valtierra", "Arguedas", "Cabanillas", "Ribaforada", "Buñuel",
      "Corella", "Cascante", "Milagro", "Fustiñana", "Azagra"
    ]
  },
  
  // Extremaduran (i:425) - 11 cities → 25+ cities - Spoken in Extremadura, Spain
  "Extremaduran": {
    index: 425,
    cities: [
      "Badajoz", "Mérida", "Cáceres", "Plasencia", "Almendralejo", "Zafra",
      "Don Benito", "Villanueva de la Serena", "Llerena", "Trujillo", "Albuquerque",
      "Coria", "Jerez de los Caballeros", "Olivenza", "Montijo", "Puebla de la Calzada",
      "Villafranca de los Barros", "Almendralejo", "Azuaga", "Fuente de Cantos",
      "Fregenal de la Sierra", "Huelva", "Llerena", "Burguillos del Cerro",
      "Valencia de Alcántara", "San Vicente de Alcántara", "Talayuela", "Navalmoral de la Mata"
    ]
  }
};

// Generate updates
console.log("=== LANGUAGE EXPANSIONS ===\n");

for (const [langName, data] of Object.entries(expansions)) {
  const cities = data.cities;
  console.log(`${langName} (i:${data.index})`);
  console.log(`  Cities to add: ${cities.length}`);
  console.log(`  Cities: ${cities.join(", ")}`);
  console.log("");
}

// Export for use
module.exports = { expansions };

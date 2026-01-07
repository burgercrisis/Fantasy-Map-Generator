/**
 * Placeholder Replacement System
 * 
 * This module systematically replaces placeholder placenames with authentic
 * geographical names from appropriate regions and linguistic contexts.
 * 
 * Created: January 3, 2026
 * Purpose: Phase 2 - Data Quality Remediation
 */

"use strict";

const fs = require('fs');
const path = require('path');

class PlaceholderReplacementSystem {
  constructor() {
    this.placeholderPatterns = [
      /_unq\d+/g,     // _unq1, _unq2, etc.
      /_u\d+/g,       // _u1, _u2, etc.
      /placeholder/gi, // placeholder text
      /TODO/gi,       // TODO markers
      /FIXME/gi       // FIXME markers
    ];
    
    // Geographic name databases by region and language family
    this.geographicDatabases = {
      africa: {
        general: [
          "Khartoum", "Lagos", "Nairobi", "Cairo", "Casablanca", "Addis Ababa", "Kampala", "Dar es Salaam",
          "Accra", "Dakar", "Bamako", "Ouagadougou", "Niamey", "Abuja", "Kano", "Ibadan", "Kumasi",
          "Tunis", "Tripoli", "Algiers", "Tangier", "Fez", "Marrakesh", "Rabat", "Cape Town", "Johannesburg",
          "Durban", "Port Elizabeth", "Bloemfontein", "Harare", "Bulawayo", "Lusaka", "Ndola", "Livingstone",
          "Gaborone", "Windhoek", "Maputo", "Beira", "Angoche", "Mogadishu", "Hargeisa", "Kismayo",
          "Malabo", "Bata", "Libreville", "Port-Gentil", "Brazzaville", "Pointe-Noire", "Kinshasa", "Lubumbashi",
          "Bujumbura", "Gitega", "Kigali", "Antananarivo", "Antsirabe", "Mahajanga", "Toamasina", "Fianarantsoa"
        ],
        west_africa: [
          "Abidjan", "Bouaké", "Yamoussoukro", "Bobo-Dioulasso", "Ouagadougou", "Koudougou", "Bamako", "Sikasso",
          "Segou", "Mopti", "Kayes", "Koulikoro", "Kidal", "Tombouctou", "Gao", "Kidal", "Niamey", "Zinder",
          "Maradi", "Tahoua", "Dosso", "Tillabéri", "Agadez", "Birnin-Konni", "Gaya", "Gouro", "Dogondoutchi",
          "Dakoro", "Diffa", "Maïné-Soroa", "N'Guigmi", "Dosso", "Gaya", "Sokodé", "Kpalimé", "Aného",
          "Kara", "Tsévié", "Lomé", "Cotonou", "Porto-Novo", "Parakou", "Bohicon", "Ouidah", "Abomey",
          "Djougou", "Natitingou", "Kérou", "Kouandé", "Bétérou", "Tchaourou", "Sakété", "Ifangni", "So-Ava"
        ],
        east_africa: [
          "Mogadishu", "Hargeisa", "Kismayo", "Jowhar", "Baidoa", "Berbera", "Borama", "Garowe", "Galkayo",
          "Lughaya", "Eyl", "Qardho", "Afmadow", "Jilib", "Kismayo", "Buur Hakaba", "Baardheere", "Qooqaare",
          "Kampala", "Entebbe", "Jinja", "Mbale", "Gulu", "Lira", "Mbarara", "Kasese", "Masaka", "Mubende",
          "Fort Portal", "Moroto", "Arua", "Soroti", "Kitgum", "Moroto", "Kabale", "Rukungiri", "Ntungamo",
          "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Garissa", "Nyeri", "Meru", "Kitale",
          "Malindi", "Kilifi", "Kwale", "Lamu", "Tana River", "Machakos", "Kajiado", "Kericho", "Bomet"
        ],
        central_africa: [
          "Kinshasa", "Lubumbashi", "Kananga", "Mbuji-Mayi", "Kikwit", "Bukavu", "Goma", "Beni", "Buta",
          "Aketi", "Basoko", "Bongandanga", "Bumba", "Businga", "Coquilhatville", "Lisala", "Mongala",
          "Bangui", "Bimbo", "Berbérati", "Kaga-Bandoro", "Mbaïki", "N'Djamena", "Abéché", "Sarh", "Kousséri",
          "Doba", "Léré", "Moundou", "Pala", "Kélo", "Bongor", "Goz Beïda", "Fada", "Farchana", "Goundi",
          "Kousséri", "Mora", "Kousséri", "Mindif", "Mokolo", "Maroua", "Guidiguis", "Mokolo", "Douala",
          "Yaoundé", "Garoua", "Bertoua", "Ebolowa", "Kribi", "Limbe", "Bafoussam", "Bamenda", "Douala"
        ],
        southern_africa: [
          "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London",
          "Pietermaritzburg", "Benoni", "Tembisa", "Vereeniging", "Soweto", "Krugersdorp", "Botshabelo",
          "Brakpan", "Welkom", "Carletonville", "Midrand", "Roodepoort", "Rustenburg", "Potchefstroom",
          "Polokwane", "Mahikeng", "Mafikeng", "Klerksdorp", "Potgietersrus", "Thabazimbi", "Lephalale",
          "Middelburg", "Emalahleni", "Standerton", "Secunda", "Bethal", "Witbank", "Middelburg", "Lydenburg",
          "Harrismith", "Phuthaditjhaba", "QwaQwa", "Manzini", "Mbabane", "Siteki", "Nhlambane", "Lavumisa"
        ]
      },
      
      asia: {
        general: [
          "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Chongqing", "Nanjing", "Wuhan",
          "Xi'an", "Hangzhou", "Harbin", "Shenyang", "Dalian", "Jinan", "Qingdao", "Zhengzhou", "Kunming",
          "Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu", "Keelung", "Chiayi", "Changhua", "Yunlin",
          "Nantou", "Pingtung", "Yilan", "Hualien", "Taitung", "Penghu", "Kinmen", "Matsu", "Tokyo", "Osaka",
          "Kyoto", "Yokohama", "Nagoya", "Kobe", "Fukuoka", "Kawasaki", "Saitama", "Hiroshima", "Sendai",
          "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon",
          "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Surat",
          "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Indore", "Thane", "Bhopal"
        ],
        southeast_asia: [
          "Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Chiang Rai", "Khon Kaen", "Udon Thani", "Nakhon Ratchasima",
          "Hua Hin", "Rayong", "Hat Yai", "Krabi", "Surat Thani", "Nakhon Si Thammarat", "Samut Prakan",
          "Samut Sakhon", "Ayutthaya", "Trat", "Mae Sot", "Pai", "Mae Hong Son", "Lampang", "Phayao",
          "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Depok", "Bekasi",
          "Tangerang", "Yogyakarta", "Denpasar", "Balikpapan", "Pekanbaru", "Bandar Lampung", "Padang",
          "Manila", "Quezon City", "Caloocan", "Makati", "Pasig", "Taguig", "Marikina", "Antipolo", "Cavite",
          "Laguna", "Batangas", "Bulacan", "Pampanga", "Bataan", "Zambales", "Olongapo", "Subic", "Clark"
        ],
        south_asia: [
          "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Hyderabad", "Gujranwala", "Peshawar",
          "Quetta", "Sargodha", "Sialkot", "Bahawalpur", "Sukkur", "Larkana", "Sheikhupura", "Jhang",
          "Gujrat", "Kasur", "Mardan", "Rahim Yar Khan", "Sahiwal", "Okara", "Nawabshah", "Mirpur Khas",
          "Dera Ghazi Khan", "Chiniot", "Kashmir", "Muzaffarabad", "Mirpur", "Gilgit", "Skardu", "Hunza",
          "Chitral", "Swat", "Kurram", "North Waziristan", "South Waziristan", "Orakzai", "Khyber", "Mohmand",
          "Khost", "Paktia", "Paktika", "Logar", "Wardak", "Bagram", "Bamyan", "Ghor", "Badakhshan"
        ],
        central_asia: [
          "Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Taraz", "Pavlodar", "Ust-Kamenogorsk",
          "Semipalatinsk", "Atyrau", "Kokshetau", "Petropavl", "Kyzylorda", "Aktobe", "Aktau", "Zhambyl",
          "Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan", "Fergana", "Nukus", "Termez", "Jizzakh",
          "Gulistan", "Sirdarya", "Navoi", "Surkhandarya", "Kashkadarya", "Bukhara", "Navoi", "Samarqand",
          "Bishkek", "Osh", "Jalal-Abad", "Karakol", "Tokmok", "Kara-Balta", "Naryn", "Batken", "Talas"
        ]
      },
      
      europe: {
        general: [
          "London", "Paris", "Berlin", "Rome", "Madrid", "Moscow", "Kyiv", "London", "Birmingham", "Manchester",
          "Liverpool", "Sheffield", "Bristol", "Glasgow", "Leeds", "Edinburgh", "Cardiff", "Belfast", "Dublin",
          "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux",
          "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen",
          "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania",
          "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas",
          "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Nizhny Novgorod", "Kazan", "Chelyabinsk",
          "Omsk", "Samara", "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar"
        ],
        northern_europe: [
          "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsinki",
          "Espoo", "Tampere", "Vantaa", "Turku", "Oulu", "Copenhagen", "Aarhus", "Odense", "Aalborg",
          "Frederiksberg", "Oslo", "Bergen", "Stavanger", "Trondheim", "Drammen", "Fredrikstad", "Porsgrunn",
          "Skien", "Tromsø", "Bodø", "Harstad", "Hamar", "Gjøvik", "Kristiansand", "Moss", "Halden",
          "Riga", "Liepāja", "Daugavpils", "Jelgava", "Jūrmala", "Ventspils", "Tallinn", "Tartu", "Narva",
          "Kohtla-Järve", "Pärnu", "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus"
        ],
        southern_europe: [
          "Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina", "Chania", "Rhodes",
          "Corfu", "Kalamata", "Serres", "Alexandroupoli", "Drama", "Kavala", "Xanthi", "Komotini", "Orestiada",
          "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania",
          "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas",
          "Lisbon", "Porto", "Braga", "Setúbal", "Coimbra", "Leiria", "Faro", "Évora", "Guarda", "Viana do Castelo",
          "Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Pančevo", "Čačak", "Novi Pazar", "Zrenjanin"
        ]
      },
      
      americas: {
        north_america: [
          "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
          "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco",
          "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Detroit", "Nashville",
          "Portland", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque",
          "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City",
          "Hamilton", "Kitchener", "London", "St. Catharines", "Halifax", "Oshawa", "Victoria", "Windsor",
          "Saskatoon", "Regina", "St. John's", "Kelowna", "Barrie", "Sherbrooke", "Guelph", "Cambridge",
          "Waterloo", "Whitby", "Burlington", "Grande Prairie", "Lévis", "Abbotsford", "Coquitlam"
        ],
        south_america: [
          "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus",
          "Curitiba", "Recife", "Porto Alegre", "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís",
          "Nova Iguaçu", "Maceió", "Duque de Caxias", "Natal", "Teresina", "São Bernardo do Campo",
          "Campo Grande", "Jaboatão dos Guararapes", "Osasco", "Santo André", "São José dos Campos",
          "Ribeirão Preto", "Uberlândia", "Sorocaba", "Contagem", "Aracaju", "Feira de Santana",
          "Cuiabá", "Joinville", "Londrina", "Aparecida de Goiânia", "Niterói", "Vitória", "Florianópolis",
          "Palmas", "Macapá", "Porto Velho", "Boa Vista", "Rio Branco", "São Carlos", "Indaiatuba",
          "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata",
          "Salta", "Santa Fe", "San Juan", "Resistencia", "Neuquén", "Formosa", "Corrientes", "Posadas"
        ],
        central_america: [
          "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Torreón",
          "Querétaro", "Mérida", "San Luis Potosí", "Mexicali", "Aguascalientes", "Cuernavaca", "Chihuahua",
          "Saltillo", "Querétaro", "Durango", "Zacatecas", "Tampico", "Villahermosa", "Pachuca", "Cuautitlán",
          "Cancún", "Playa del Carmen", "Cozumel", "Chetumal", "Tulum", "Isla Mujeres", "Cabo San Lucas",
          "Puerto Vallarta", "Mazatlán", "Acapulco", "Ixtapa", "Zihuatanejo", "Managua", "León", "Granada",
          "Masaya", "Chinandega", "Matagalpa", "Estelí", "Jinotega", "Somoto", "San Juan del Sur", "Bluefields",
          "San José", "Alajuela", "Cartago", "Puntarenas", "Heredia", "Limón", "Liberia", "Nicoya", "Golfito",
          "Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choluteca", "El Progreso", "Comayagua", "Olanchito"
        ],
        caribbean: [
          "Kingston", "Spanish Town", "Portmore", "Montego Bay", "Mandeville", "May Pen", "Old Harbour",
          "Savanna-la-Mar", "Half Way Tree", "Santa Cruz", "Bog Walk", " Ocho Rios", "Falmouth", "Runaway Bay",
          "Negril", "Port Antonio", "Morant Bay", "Spanish Town", "Golden Grove", "Harbour View", "St. Ann's Bay",
          "Port de Spain", "San Fernando", "Chaguanas", "Arima", "Couva", "Tunapuna", "Sangre Grande",
          "La Brea", "Princes Town", "Rio Claro", "Guanare", " Siparia", "Penal", "Debe", "Barrackpore",
          "Roseau", "Fort-de-France", "Basse-Pointe", "Le Lamentin", "Le Robert", "Sainte-Marie", "La Trinité",
          "Le François", "Ducos", "Saint-Joseph", "Le Vauclin", "Rivière-Pilote", "Anse-d'Arlet", "Case-Pilote",
          "Bridgetown", "Speightstown", "Holetown", "Oistins", "Bathsheba", "Cherry Hill", "St. Lawrence Gap",
          "Needham's Point", "Crane Beach", "Bottom Bay", "Dover Beach", "Miami Beach", "Crane Beach"
        ]
      },
      
      oceania: {
        general: [
          "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin",
          "Wollongong", "Toowoomba", "Launceston", "Rockhampton", "Gladstone", "Cairns", "Townsville",
          "Alice Springs", "Auckland", "Wellington", "Christchurch", "Dunedin", "Invercargill", "Whangarei",
          "Hamilton NZ", "Napier", "Gisborne", "Rotorua", "Tauranga", "Palmerston North", "Nelson",
          "Ashburton", "Timaru", "Blenheim", "Greymouth", "Westport", "Queenstown", "Invercargill",
          "Port Moresby", "Lae", "Madang", "Goroka", "Mount Hagen", "Rabaul", "Kokopo", "Kimbe", "Alotau",
          "Kavieng", "Vanimo", "Wewak", "Daru", "Kundiawa", "Popondetta", "Kerema", "Arawa", "Buka",
          "Suva", "Lautoka", "Nadi", "Labasa", "Savusavu", "Sigatoka", "Lomaloma", "Levuka", "Tavua",
          "Ba", "Nasinu", "Nausori", "Lautoka", "Nadi", "Lomaloma", "Tavua", "Ba", "Nasinu", "Nausori"
        ],
        pacific_islands: [
          "Apia", "Vaitele", "Faleula", "Leulumoega", "Lalomanu", "Mulifanua", "Salelologa", "Safotu",
          "Nuku'alofa", "Neiafu", "Pangai", "Ohonua", "Lapaha", "Hihifo", "Ha'ateiho", "Tatakamotonga",
          "Nuku'alofa", "Tongatapu", "Ha'apai", "Vava'u", "Niuatoputapu", "Niuafo'ou", "Funafuti", "Vaitupu",
          "Majuro", "Kwajalein", "Jaluit", "Ebon", "Kili", "Wotje", "Arno", "Rongelap", "Utrik", "Ujae",
          "Lae", "Malakula", "Espiritu Santo", "Efate", "Pentecost", "Ambae", "Maewo", "Paama", "Epi",
          "Erromango", "Tanna", "Aneityum", "Mokoroa", "Norsup", "Lakatoro", "Longana", "Port Vila", "Isangel"
        ]
      },
      
      fantasy: {
        magical_places: [
          "Avalon", "El Dorado", "Shangri-La", "Atlantis", "Camelot", "Valhalla", "Olympus", "Asgard",
          "Midgard", "Jotunheim", "Niflheim", "Muspelheim", "Alfheim", "Vanaheim", "Svartalfheim", "Nidavellir",
          "Avalon", "Lyonesse", "Hy-Brasil", "Thule", "Hyperborea", "Lemuria", "Mu", "Pangea", "R'lyeh",
          "Irem", "Dilmun", "Erewhon", "Utopia", "Neverland", "Wonderland", "Narnia", "Middle-earth",
          "Hogwarts", "Hogsmeade", "Diagon Alley", "Platform 9¾", "The Burrow", "Marauder's Map", "Gringotts",
          "Azkaban", "St. Mungo's", "The Leaky Cauldron", "Three Broomsticks", "Honeydukes", "Florean Fortescue's",
          "Quality Quidditch Supplies", "Wands by Gregorovitch", "Magical Menagerie", "Flourish and Blotts",
          "Scribbulus Writing Instruments", "Malkins Cloak Shop", "Madame Puddifoot's", "The Hog's Head",
          "The Three Broomsticks", "The Leaky Cauldron", "The Leaky Cauldron", "The Leaky Cauldron"
        ],
        mythical_kingdoms: [
          "Camelot", "Lyonesse", "Avallon", "Gondor", "Rohan", "Mordor", "Shire", "Rivendell", "Lothlórien",
          "Fangorn", "Edoras", "Helm's Deep", "Minas Tirith", "Minas Morgul", "Barad-dûr", "Mount Doom",
          "Narnia", "Archenland", "Calormene", "Telmar", "Underland", "Wonderland", "Looking-Glass World",
          "Hogwarts", "Beauxbatons", "Durmstrang", "Ilvermorny", "Koldovstoretz", "Mahoutokoro", "Uagadou",
          "Neverland", "Neverland", "Neverland", "Neverland", "Neverland", "Neverland", "Neverland", "Neverland",
          "Azeroth", "Lordaeron", "Stormwind", "Draenor", "Argus", "Kul Tiras", "Zandalar", "Pandaria",
          "Draenor", "Argus", "Kul Tiras", "Zandalar", "Pandaria", "Kul Tiras", "Zandalar", "Pandaria"
        ]
      },
      
      global: {
        universal: [
          "Metropolis", "Gotham", "Central City", "Star City", "National City", "Gateway City", "Blüdhaven",
          "Coast City", "Keystone City", "Opal City", " Keystone City", " Coast City", " Star City", " Central City",
          "Metropolis", "Gotham City", "Star City", "Central City", "Coast City", "Keystone City", "Blüdhaven",
          "National City", "Gateway City", "Opal City", "Hub City", "Pine Ridge", "Marlon", "Fairfield",
          "Millennium City", "Angel City", "Cape City", "Liberty City", "Vice City", "San Andreas", "Carcer City",
          "Lost Heaven", "Bullworth", "Fairview", "New York City", "Los Santos", "Liberty City", "Vice City",
          "Central City", "Opal City", "Gateway City", "National City", "Hub City", "Star City", "Keystone City",
          "Coast City", "Blüdhaven", "Gotham City", "Metropolis", "Pine Ridge", "Fairfield", "Millennium City"
        ]
      }
    };
    
    this.languageFamilyMappings = {
      'creole': 'global',
      'english_creole': 'americas.caribbean',
      'french_creole': 'americas.caribbean', 
      'spanish_creole': 'americas.central_america',
      'portuguese_creole': 'americas.south_america',
      'arabic_creole': 'africa.general',
      'pidgin': 'oceania.general',
      'bamboo_english': 'asia.general',
      'australian': 'oceania.general',
      'pacific': 'oceania.general',
      'west_african': 'africa.west_africa',
      'east_african': 'africa.east_africa',
      'central_african': 'africa.central_africa',
      'southern_african': 'africa.southern_africa',
      'southeast_asian': 'asia.southeast_asia',
      'south_asian': 'asia.south_asia',
      'central_asian': 'asia.central_asia',
      'northern_european': 'europe.northern_europe',
      'southern_european': 'europe.southern_europe',
      'northern_american': 'americas.north_america',
      'southern_american': 'americas.south_america',
      'central_american': 'americas.central_america'
    };
  }

  /**
   * Identify placeholder patterns in text
   */
  identifyPlaceholders(text) {
    const placeholders = [];
    
    for (const pattern of this.placeholderPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        placeholders.push(...matches);
      }
    }
    
    return placeholders;
  }

  /**
   * Determine appropriate geographic database based on language context
   */
  getGeographicDatabase(languageName, region = 'global') {
    // Extract keywords from language name
    const name = languageName.toLowerCase();
    
    // Check for specific regional indicators
    if (name.includes('west african') || name.includes('ghana') || name.includes('nigeria')) {
      return this.geographicDatabases.africa.west_africa;
    }
    if (name.includes('east african') || name.includes('kenya') || name.includes('uganda')) {
      return this.geographicDatabases.africa.east_africa;
    }
    if (name.includes('central african') || name.includes('congo') || name.includes('cameroon')) {
      return this.geographicDatabases.africa.central_africa;
    }
    if (name.includes('southern african') || name.includes('south africa') || name.includes('zimbabwe')) {
      return this.geographicDatabases.africa.southern_africa;
    }
    
    // Check for language family indicators
    for (const [family, geoKey] of Object.entries(this.languageFamilyMappings)) {
      if (name.includes(family.replace('_', ' '))) {
        const keys = geoKey.split('.');
        let db = this.geographicDatabases;
        for (const key of keys) {
          db = db[key];
          if (!db) break;
        }
        if (Array.isArray(db)) return db;
      }
    }
    
    // Default to regional mapping
    const regionKey = region.toLowerCase();
    if (this.geographicDatabases[regionKey]) {
      return this.geographicDatabases[regionKey];
    }
    
    // Ultimate fallback
    return this.geographicDatabases.global.universal;
  }

  /**
   * Generate authentic replacements for placeholder placenames
   */
  generateReplacements(languageName, basePlacenames, region = 'global') {
    const geographicDB = this.getGeographicDatabase(languageName, region);
    const replacements = [];
    const used = new Set();
    
    // Collect all existing authentic placenames
    const existingAuthentic = basePlacenames.filter(name => 
      !this.identifyPlaceholders(name).length
    );
    
    // Generate replacements for placeholders
    for (const placename of basePlacenames) {
      const placeholders = this.identifyPlaceholders(placename);
      
      if (placeholders.length === 0) {
        // Already authentic
        replacements.push(placename);
        used.add(placename);
      } else {
        // Need replacement
        let replacement = null;
        let attempts = 0;
        
        while (!replacement && attempts < geographicDB.length) {
          const candidate = geographicDB[attempts];
          if (!used.has(candidate) && !existingAuthentic.includes(candidate)) {
            replacement = candidate;
            used.add(candidate);
          }
          attempts++;
        }
        
        // If no unique name found, generate a modified version
        if (!replacement && geographicDB.length > 0) {
          const baseName = geographicDB[attempts % geographicDB.length];
          replacement = this.generateModifiedName(baseName, attempts);
          used.add(replacement);
        }
        
        replacements.push(replacement || 'New Place');
      }
    }
    
    return replacements;
  }

  /**
   * Generate a modified version of a geographic name to ensure uniqueness
   */
  generateModifiedName(baseName, attemptNumber) {
    const suffixes = ['Ville', 'berg', 'town', 'ford', 'ham', 'chester', 'bridge', 'field', 'wood', 'hill'];
    const prefixes = ['New', 'North', 'South', 'East', 'West', 'Upper', 'Lower', 'Old', 'Great', 'Little'];
    
    if (attemptNumber % 3 === 0) {
      return `${prefixes[attemptNumber % prefixes.length]} ${baseName}`;
    } else if (attemptNumber % 3 === 1) {
      return `${baseName}${suffixes[attemptNumber % suffixes.length]}`;
    } else {
      return `${baseName}-${attemptNumber}`;
    }
  }

  /**
   * Process a namebase file and replace placeholders
   */
  processNamebaseFile(filePath) {
    console.log(`Processing ${filePath}...`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const vm = require('vm');
      const context = { window: {} };
      vm.runInContext(content, context, { filename: filePath });

      const baseName = path.basename(filePath, '.js');
      const continentName = baseName.replace('namebases-', '').replace(/([A-Z])/g, ' $1').trim();
      const arrayName = continentName.replace(/ /g, '') + 'NameBases';
      const entries = context.window[arrayName];

      if (!entries || !Array.isArray(entries)) {
        console.log(`  ⚠ No entries found in ${filePath}`);
        return 0;
      }

      let changes = 0;

      for (const entry of entries) {
        if (entry.b) {
          const placenames = entry.b.split(',').map(s => s.trim()).filter(s => s);
          const hasPlaceholders = placenames.some(name => this.identifyPlaceholders(name).length > 0);

          if (hasPlaceholders) {
            const region = this.detectRegion(continentName);
            const replacements = this.generateReplacements(entry.name, placenames, region);
            entry.b = replacements.join(',');
            changes++;
          }
        }
      }

      if (changes > 0) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf-8');

        const newContent = this.generateFileContent(entries, arrayName);
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`  ✅ Saved changes to ${filePath}`);
        console.log(`  📋 Backup created: ${backupPath}`);
      } else {
        console.log(`  ✓ No placeholders found`);
      }

      return changes;

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  detectRegion(continentName) {
    const mapping = {
      'Africa': 'africa',
      'Asia': 'asia',
      'Europe': 'europe',
      'NorthAmerica': 'americas.north_america',
      'SouthAmerica': 'americas.south_america',
      'Oceania': 'oceania',
      'Fantasy': 'fantasy'
    };
    return mapping[continentName] || 'global';
  }

  generateFileContent(entries, arrayName) {
    let content = `"use strict";

window.${arrayName} = [
`;

    entries.forEach((entry, idx) => {
      content += `  {
    "name": "${entry.name}",
    "i": ${entry.i},
    "min": ${entry.min},
    "max": ${entry.max},
    "d": "${entry.d}",
    "m": ${entry.m},
    "b": "${entry.b}"
  }${idx < entries.length - 1 ? ',' : ''}
`;
    });

    content += `];
`;
    return content;
  }

  /**
   * Process a single namebase entry line
   */
  processNamebaseLine(line) {
    return line;
  }

  /**
   * Process all namebase files
   */
  processAllNamebaseFiles() {
    const namebaseFiles = [
      'modules/namebases-africa.js',
      'modules/namebases-asia.js',
      'modules/namebases-europe.js',
      'modules/namebases-fantasy.js',
      'modules/namebases-northAmerica.js',
      'modules/namebases-oceania.js',
      'modules/namebases-southAmerica.js'
    ];

    console.log('🚀 Starting placeholder replacement process...\n');

    let totalChanges = 0;
    const fileResults = {};

    for (const file of namebaseFiles) {
      if (fs.existsSync(file)) {
        const changes = this.processNamebaseFile(file);
        fileResults[file] = changes;
        totalChanges += changes;
        console.log('');
      } else {
        console.log(`⚠ File not found: ${file}`);
      }
    }

    console.log('📊 Placeholder Replacement Summary:');
    console.log(`Total files processed: ${Object.keys(fileResults).length}`);
    console.log(`Total lines changed: ${totalChanges}`);

    const report = {
      timestamp: new Date().toISOString(),
      totalChanges: totalChanges,
      filesProcessed: Object.keys(fileResults).length,
      fileResults: fileResults,
      status: totalChanges > 0 ? 'completed' : 'no_changes_needed'
    };

    const reportPath = path.join(__dirname, '../data/placeholder-replacement-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Report saved: ${reportPath}`);

    return report;
  }

  /**
   * Validate replacement quality
   */
  validateReplacements(filePath) {
    console.log(`Validating replacements in ${filePath}...`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const vm = require('vm');
      const context = { window: {} };
      vm.runInContext(content, context, { filename: filePath });

      const baseName = path.basename(filePath, '.js');
      const continentName = baseName.replace('namebases-', '').replace(/([A-Z])/g, ' $1').trim();
      const arrayName = continentName.replace(/ /g, '') + 'NameBases';
      const entries = context.window[arrayName];

      let remainingPlaceholders = 0;

      if (entries && Array.isArray(entries)) {
        for (const entry of entries) {
          if (entry.b) {
            const placenames = entry.b.split(',');
            for (const placename of placenames) {
              if (this.identifyPlaceholders(placename).length > 0) {
                remainingPlaceholders++;
              }
            }
          }
        }
      }

      console.log(`  Remaining placeholders: ${remainingPlaceholders}`);
      return remainingPlaceholders === 0;

    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaceholderReplacementSystem;
}

// Auto-execute if run directly
if (require.main === module) {
  const system = new PlaceholderReplacementSystem();
  
  console.log('🎯 Placeholder Replacement System');
  console.log('=====================================\n');
  
  // Process all files
  const report = system.processAllNamebaseFiles();
  
  // Validate results
  console.log('\n🔍 Validating results...');
  const namebaseFiles = [
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-creole.js',
    'modules/namebases-europe.js',
    'modules/namebases-fantasy.js',
    'modules/namebases-global.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-oceania.js',
    'modules/namebases-southAmerica.js'
  ];
  
  let validationPassed = true;
  for (const file of namebaseFiles) {
    if (fs.existsSync(file)) {
      const passed = system.validateReplacements(file);
      if (!passed) validationPassed = false;
    }
  }
  
  if (validationPassed) {
    console.log('✅ All validations passed!');
  } else {
    console.log('⚠ Some validations failed - manual review needed');
  }
  
  console.log('\n🎉 Placeholder replacement process complete!');
}
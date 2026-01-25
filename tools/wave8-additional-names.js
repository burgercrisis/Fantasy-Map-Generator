// Additional authentic Nigerian place names to add
const additionalNigerianNames = [
  "Lagos",        // Yoruba - Largest city
  "Kano",         // Hausa - Historic walled city  
  "Ibadan",       // Yoruba - 3rd largest city
  "Abuja",        // Federal Capital
  "Port Harcourt",// English colonial - Oil hub
  "Benin City",   // Edo - Historic Benin Kingdom
  "Kaduna",       // Hausa - Northern industrial
  "Onitsha",      // Igbo - Commercial hub
  "Owerri",       // Igbo - State capital
  "Enugu",        // Igbo - Coal city
  "Jos",          // Plateau - Mining
  "Bauchi",       // Hausa - State capital
  "Maiduguri",    // Hausa - Borno state
  "Zaria",        // Hausa - Historic city
  "Ife",          // Yoruba - Ancient kingdom
  "Abeokuta",     // Yoruba - Rock city
  "Ijebu-Ode",    // Yoruba - Gateway
  "Nsukka",       // Igbo - University town
  "Akure",        // Yoruba - Sunshine state
  "Ado-Ekiti",    // Yoruba - Fountain of truth
  "Uyo",          // Ibibio - Akwa Ibom
  "Calabar",      // Efik - Cross River
  "Makurdi",      // Tiv - Benue state
  "Katsina",      // Hausa - Northern city
  "Sokoto",       // Hausa - Historic caliphate
  "Minna",        // Nupe - Niger state
  "Lokoja",       Confluence city
  "O // Ebira -yo",          // Yoruba - Historic kingdom
  "Osogbo",       // Yoruba - Osun state
  "Dutse",        // Hausa - Jigawa
  "Gombe",        // Hausa - Gombe state
  "Yola",         // Hausa - Adamawa
  "Damaturu",     // Hausa - Yobe
  "Jalingo",      // Hausa - Taraba
  "Birnin Kebbi", // Hausa - Kebbi
  "Argungu",      // Hausa - Fishing festival
  "Gusau",        // Hausa - Zamfara
  "Kumasi",       // Akan - Ghana (close cultural ties)
  "Aba",          // Igbo - Commercial center
  "Warri",        // Itsekiri - Oil region
  "Badagry",      // Yoruba - Slave trade history
  "Ogbomosho",    // Yoruba - Ancient city
  "Ilorin",       // Yoruba - Kwara state
  "Ekiti",        // Yoruba - Town in Ekiti
  "Ikere-Ekiti",  // Yoruba - Ekiti state
  "Ijesha",       // Yoruba - Region name
  "Ondo",         // Yoruba - Ondo state
  "Ore",          // Yoruba - Town
  "Sagamu",       // Yoruba - Industrial town
  "Shagamu",      // Yoruba - Same as above
  "Epe",          // Lagos lagoon
  "Badagry",      // Coastal town
  "Lekki",        // Lagos - New development
  "Ikoyi",        // Lagos - Premium area
  "Surulere",     // Lagos - Local government
  "Mushin",       // Lagos - Area
  "Shomolu",      // Lagos - Area
  "Kosofe",       // Lagos - Area
  "Agege",        // Lagos - Area
  "Alimosho",     // Lagos - Local government
  "Amuwo-Odofin", // Lagos - Area
  "Ojo",          // Lagos - Local government
  "Ibeju-Lekki",  // Lagos - Coastal area
  "Eti-Osa",      // Lagos - Area
  "Ifako-Ijaiye", // Lagos - Area
  "Ojodu",        // Lagos - Area
  "Babcock",      // Lagos - Area
  "Shomolu",      // Lagos - Area
  "Mile 12",      // Lagos - Market area
  "Mushin",       // Lagos - Area
  "Ojuelegba",    // Lagos - Famous area
  "Yaba",         // Lagos - University area
  "Surulere",     // Lagos - Sports area
  "Festac",       // Lagos - Housing scheme
  "Amuwo",        // Lagos - Area
  "Satellite",    // Lagos - Development
  "Chevron",      // Lagos - Oil company area
  "Victoria Island", // Lagos - Premium
  "Ikoyi",        // Lagos - Elite area
  "Banana Island", // Lagos - Exclusive
  "Lekki Phase 1", // Lagos - New area
  "Lekki Phase 2", // Lagos - Extension
  "Abraham Adesanya", // Lagos - Estate
  "Bethel",       // Lagos - Estate
  "Igbogbo",      // Lagos - Town
  "Ikorodu",      // Lagos - Town
  "Shagamu",      // Ogun - Town
  "Abeokuta",     // Ogun - Capital
  "Sango-Ota",    // Ogun - Industrial
  "Ilaro",        // Ogun - Town
  "Yewa",         // Ogun - Region
  "Ipokia",       // Ogun - Town
  "Ogun Waterside", // Ogun - LGA
  "Remo",         // Ogun - Region
  "Shagamu",      // Ogun - Town
  "Ifo",          // Ogun - LGA
  "Ewekoro",      // Ogun - LGA
  "Ado-Odo/Ota",  // Ogun - LGA
  "Aiyegunle",    // Ogun - Town
  "Olomore",      // Ogun - Area
  "Lafenwa",      // Ogun - Area
  "Ibese",        // Ogun - Cement
  "Ketu",         // Lagos - Area
  "Mile 2",       // Lagos - Area
  "Alaba",        // Lagos - Market
  "Otta",         // Ogun - Town
  "Sango",        // Ogun - Transit town
  "Dala",         // Kano - Hill
  "Hotoro",       // Kano - Area
  "Sabon Gari",   // Kano - Hausa-Fulani area
  "Zangon",       // Kano - Area
  "Tudun Wada",   // Kano - Area
  "Fagge",        // Kano - Area
  "Gwale",        // Kano - Area
  "Nassarawa",    // Kano - Area
  "Kura",         // Kano - LGA
  "Madobi",       // Kano - LGA
  "Kibiya",       // Kano - LGA
  "Bebeji",       // Kano - LGA
  "Kiru",         // Kano - LGA
  "Tofa",         // Kano - LGA
  "Rano",         // Kano - LGA
  "Bunkure",      // Kano - LGA
  "Kunchi",       // Kano - LGA
  "Tsanyawa",     // Kano - LGA
  "Shanono",      // Kano - LGA
  "Bagwai",       // Kano - LGA
  "Gwarzo",       // Kano - LGA
  "Karaye",       // Kano - LGA
  "Rogo",         // Kano - LGA
  "Kabo",         // Kano - LGA
  "Gaya",         // Kano - LGA
  "Dawakin Kudu", // Kano - LGA
  "Dawakin Tofa", // Kano - LGA
  "Gabas",        // Kano - Area
  "Yamma",        // Kano - Area
];

// Additional authentic Celtic place names to add
const additionalCelticNames = [
  // Irish cities and towns
  "Dublin",           // Baile Átha Cliath - Capital
  "Cork",             // Corcaigh - 2nd city
  "Limerick",         // Luimneach - 3rd city
  "Galway",           // Gaillimh - West coast
  "Waterford",        // Port Láirge - Southeast
  "Derry",            // Doire - Northwest
  "Londonderry",      // Doire - Same as above
  "Belfast",          // Béal Feirste - NI capital
  "Kilkenny",         // Cill Chainnigh - Medieval
  "Wexford",          // Loch Garman - Southeast
  "Wicklow",          // Cill Mhantáin - Garden county
  "Wexford",          // Port laigin - Ancient
  "Drogheda",         // Droichead Átha - East
  "Dundalk",          // Dún Dealgan - Border
  "Sligo",            // Sligeach - Northwest
  "Clonmel",          // Clonmel - South
  "Tralee",           // Trá Lí - Kerry
  "Ennis",            // Inis - Clare
  "Killarney",        // Cill Airne - Kerry
  "Mullingar",        // Muileann gCearr - Westmeath
  "Athlone",          // Baile Átha Luain - Midlands
  "Portlaoise",       // Port Laoise - Laois
  "Carlow",           // Ceatharlach - Southeast
  "Naas",             // Nás na Ríogh - Kildare
  "Newbridge",        // Droichead Nua - Kildare
  "Mayo",             // Maigh Eo - County
  "Sligo",            // Sligach - Ancient
  "Leitrim",          // Liatroim - County
  "Monaghan",         // Muineachán - County
  "Louth",            // Lú - County
  "Donegal",          // Dún na nGall - Northwest
  "Cavan",            // An Cabhán - County
  "Fermanagh",        // Fear Manach - County
  "Tyrone",           // Tír Eoghain - County
  "Armagh",           // Ard Mhacha - County
  "Down",             // An Dún - County
  "Antrim",           // Aontroim - County
  
  // Scottish cities and towns  
  "Edinburgh",        // Dùn Èideann - Capital
  "Glasgow",          // Glaschu - Largest city
  "Aberdeen",         // Obar Dheathain - Granite city
  "Dundee",          // Dùn Dè - Discovery quay
  "Inverness",       // Inbhir Nis - Highlands
  "Stirling",        // Sruighlea - Historic
  "Perth",           // Peairt - Fair city
  "Dunfermline",     // Dùn Phàrlain - Ancient capital
  "Ayr",             // Inbhir Àir - Coast
  "Dumfries",        // Dùn Phris - South
  "Galloway",        // Gall-Ghaidhealaibh - Region
  "Oban",            // An t-Oban - West coast
  "Fort William",    // Caol - Highlands
  "Skye",            // An t-Eilean Sgitheanach - Island
  "Islay",           // Ìle - Whisky island
  "Mull",            // Muile - Island
  "Uist",            // Uibhist - Outer Hebrides
  "Lewis",           // Leòdhas - Island
  "Shetland",        // Sealtainn - Northern isles
  "Orkney",          // Arcaibh - Northern islands
  "Elgin",           // Eilginn - Moray
  "Falkirk",         // An Eaglais Bhreac - Central
  "Paisley",         // Pàislig - Near Glasgow
  "Greenock",        // Grianaig - Coast
  "Ayrshire",        // Siorrachd Àir - Region
  "Argyll",          // Earraghaidheal - Coast
  "Kintyre",         // Cinn Tìre - Peninsula
  "Bute",            // Eilean Bòid - Island
  "Renfrewshire",    // Siorrachd Rinn Friù - Region
  "Lanarkshire",     // Siorrachd Lanark - Region
  "Dumfriesshire",   // Siorrachd Dhùn Phris - Region
  "Kirkcudbright",   // Cill Chuadbhaidh - Southwest
  "Wigtownshire",    // Siorrachd Bhaile na h-Ùige - Southwest
  
  // Welsh cities and towns
  "Cardiff",         // Caerdydd - Capital
  "Swansea",         // Abertawe - 2nd city
  "Newport",         // Casnewydd - Southeast
  "Bangor",          // Bangor - North Wales
  "St Asaph",        // Llanelwy - Smallest city
  "St Davids",       // Tyddewi - Smallest city
  "Wrexham",         // Wrecsam - Northeast
  "Monmouth",        // Trefynwy - Southeast
  "Aberystwyth",     // Aberystwyth - West coast
  "Cardigan",        // Aberteifi - West Wales
  "Haverfordwest",   // Hwlffordd - Pembrokeshire
  "Pembroke",        // Penfro - South Wales
  "Tenby",           // Dinbych-y-pysgod - Coast
  "Llandudno",       // Llandudno - North coast
  "Rhyl",            // Y Rhyl - North coast
  "Holyhead",        // Caergybi - Anglesey
  "Caernarfon",      // Caernarfon - North Wales
  "Conwy",           // Conwy - Castle town
  "Llangollen",      // Llangollen - Dee valley
  "Snowdonia",       // Eryri - Mountains
  "Brecon",          // Aberhonddu - Powys
  "Builth",          // Llandoch - Powys
  "Breconshire",     // Sir Frycheiniog - Historic county
  "Glamorgan",       // Morgannwg - South Wales
  "Gwent",           // Gwent - Southeast Wales
  "Dyfed",           // Dyfed - West Wales
  "Powys",           // Powys - Mid Wales
  
  // Breton cities and towns (Brittany, France)
  "Rennes",          // Roazhon - Capital
  "Brest",           // Brest - West coast
  "Quimper",         // Kemper - Finistère
  "Vannes",          // Gwened - Morbihan
  "Lorient",         // An Oriant - Coast
  "Saint-Malo",      // Saent-Maloë - Coast
  "Saint-Brieuc",    // Sant-Brieg - Côtes d'Armor
  "Dinan",           // Dinan - Medieval town
  "Concarneau",      // Konkorne - Fishing port
  "Carhaix",         // Karaez - Interior
  "Quimperlé",       // Kemperel - Brittany
  "Brest",           // An Brest - Ancient
  "Lannion",         // Lannuon - North
  "Guingamp",        // Gwengamp - Center
  "St-Malo",         // Saint-Malo - Historic port
  "Dinard",          // Dinard - Riviera
  "Fougères",        // Felger - East
  "Vitré",           // Gwitre - East
  "Redon",           // Redon - South
  "Vannes",          // Gwened - Ancient
  
  // Cornish cities and towns
  "Truro",           // Truru - Only city
  "Penzance",        // Pensans - West coast
  "Newquay",         // Tewynblustri - North coast
  "St Ives",         // Porth Ia - North coast
  "Falmouth",        // Aberfal - South coast
  "Bude",            // Porthjuffa - North coast
  "Saltash",         // Essa - Tamar bridge
  "St Austell",      // Sansa - China clay
  "Bodmin",          // Bosvenegh - County town
  "Wadebridge",      // Ponsrys - Camel estuary
  "Camelford",       // Kamelford - North
  "Liskeard",        // Lyskerrys - Southeast
  "Looe",            // Log - South coast
  "Fowey",           // Fowydh - South coast
  "Helston",         // Hellys - Lizard peninsula
  "Perranporth",     // Porthpyran - North coast
  "St Agnes",        // Porth Jona - North coast
  "Padstow",         // Padstow - North coast
  "Bude",            // Bude - North coast
  "Crackington",     // Crackington - North coast
  "Tintagel",        // Tintagel - Arthurian
  "Boscastle",       // Boskastel - North coast
  
  // Manx cities and towns (Isle of Man)
  "Douglas",         // Doolish - Capital
  "Ramsey",          // Rhumsaa - North coast
  "Peel",           // Purt ny hInshey - West coast
  "Castletown",     // Balley Chashtal - South
  "Port Erin",      // Purt Çhreenk - South
  "Port Stanley",   // Purt - South
  "Kirk Michael",   // Balthane - Parish
  "Laxey",          // Laksaa - East coast
  "Onchan",         // Conchan - Near Douglas
  "Ballasalla",     // Balley Salley - South
  "Castletown",     // Balley Chashtal - Ancient capital
  "Maughold",       // Maghal - Parish
  "Braddan",        // Braddan - Parish
  "Michael",        // Michael - Parish
  "Patrick",        // Pherick - Parish
  "German",         // Germaan - Parish
  "Andreas",        // Andreas - Parish
  "Bride",          // Briddan - Parish
  "Jurby",          // Jorby - Parish
  "Ramsey",         // Rhumsaa - Market town
];

module.exports = {
  additionalNigerianNames,
  additionalCelticNames
};

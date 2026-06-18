"use strict";
const EURASIA2_DB = {

  "alentejan": ["Evora","Beja","Portel","Vila Vicosa","Montemor-o-Novo","Estremoz","Borba","Redondo","Reguengos de Monsaraz","Sousel","Alandroal","Campo Maior","Elvas","Alter do Chao","Fronteira","Monforte","Serpa","Moura","Vidigueira","Cuba","Alvito","Viana do Alentejo"," Monsaraz"],

  "ancona": ["Ancona","Osimo","Jesi","Fabriano","Senigallia","Cingoli","Corinaldo","Ostra","Loreto","Recanati","Porto Recanati","Camerano","Sirolo","Numana","Offagna","Chiaravalle","Maiolati","Castelplanio","Cupramontana","Staffolo","Arcevia","Poggio San Marcello"],

  "angevin": ["Angers","Saumur","Cholet","Sables-d'Olonne","La Fleche","Beaupreau","Chalonnes-sur-Loire","Le Puy-Notre-Dame","Segre","Pouance","Chateau-Gontier","Laval","Mayenne","Ambrieres-le-Grand","Sille-le-Guillaume","Craon","Bauge-en-Anjou","Durtal","Seiches-sur-le-Loir","Tierce","Morannes","Le Lion-d'Angers"],

  "arpitan": ["Lyon","Grenoble","Geneva","Annecy","Chambery","Aix-les-Bains","Thonon-les-Bains","Evian-les-Bains","Belley","Bourg-en-Bresse","Roanne","Saint-Etienne","Vienne","Macon","Neuchatel","Fribourg","Sion","Martigny","Vevey","Montreux","Aoste","Ivrea"],

  "barese": ["Bari","Bitonto","Molfetta","Giovinazzo","Andria","Trani","Barletta","Corato","Ruvo di Puglia","Altamura","Monopoli","Polignano a Mare","Conversano","Putignano","Alberobello","Locorotondo","Fasano","Martina Franca","Ostuni","Gravina di Puglia","Adelfia","Toritto"],

  "basilicatine": ["Potenza","Matera","Pisticci","Scanzano Ionico","San Mauro Forte","Ferrandina","Pomarico","Miglionico","Montalbano Jonico","Bernalda","Metaponto","Tursi","Sinni","Nova Siri","Rotonda","Lagonegro","Latronico","Senise","Cirigliano","Stigliano","Aliano","Calvello"],

  "brianz-": ["Monza","Brianza","Lissone","Desio","Seregno","Cesano Maderno","Limbiata","Seveso","Carate Brianza","Giussano","Agrate Brianza","Busnago","Vimercate","Usmate Velate","Lentate sul Seveso","Meda","Cabiate","Mariano Comense","Carugo","Arosio","Inverigo","Lurago d'Erba"],

  "bustocco-legnanese": ["Busto Arsizio","Legnano","Gallarate","Samarate","Fagnano Olona","Olgiate Olona","Saronno","Rho","Cassano Magnago","Buscate","Arsago Seprio","Cairate","Cavaria Con Premezzo","Jerago con Orago","Solbiate Arno","Albizzate","Caronno Varesino","Castelseprio","Carnago","Marnate","Oriago Veneto","Trezzano sul Naviglio"],

  "cadorino": ["Pieve di Cadore","Auronzo di Cadore","Calalzo di Cadore","Borca di Cadore","Vodo di Cadore","Comelico Superiore","Comelico Inferiore","Santo Stefano di Cadore","San Vito di Cadore","Domegge di Cadore","Lorenzago di Cadore","Lozzo di Cadore","Forni Avoltri","Cibiana di Cadore","Zoldo Alto","Longarone","Castellavazzo","Perarolo di Cadore","Chies d'Alpago","Farra d'Alpago","Puos d'Alpago"],

  "calabro": ["Reggio Calabria","Catanzaro","Cosenza","Crotone","Vibo Valentia","Lamezia Terme","Gioia Tauro","Rosarno","Siderno","Locri","Caulonia","Pizzo","Tropea","Nicotera","Scalea","Paola","Amantea","Belvedere Marittimo","Diamante","Soverato","Gerace","Stilo"],

  "campano": ["Naples","Salerno","Avellino","Benevento","Caserta","Sorrento","Amalfi","Positano","Ravello","Pompei","Ercolano","Torre del Greco","Portici","Casoria","Afragola","Giugliano","Pozzuoli","Bacoli","Scauri","Paestum","Agropoli","Battipaglia"],

  "campidanese": ["Cagliari","Quartu Sant'Elena","Assemini","Elmas","Decimomannu","Sestu","Uta","Sinnai","Villasimius","Villacidro","Sanluri","Serramanna","Samatzai","Settimo San Pietro","Quartucciu","Monserrato","Selargius","Dolianova","Donori","Siurgus Donigala","Escalaplano","Esterzili"],

  "castelmezzano": ["Castelmezzano","Pietrapertosa","Campomaggiore","Trivigno","Brindisi Montagna","Castelgrande","Rapone","San Fele","Muro Lucano","Laviano","Calitri","Andretta","Guardia Lombardi","Caposele","Acerenza","Oppido Lucano","Genzano di Lucania","Palazzo San Gervasio","Banzi","Cancellara","Vaglio Basilicata","Avigliano"],

  "castilian": ["Madrid","Toledo","Segovia","Avila","Salamanca","Valladolid","Burgos","Leon","Zamora","Cuenca","Guadalajara","Alcala de Henares","Chinchon","Aranjuez","El Escorial","Manzanares","San Lorenzo de El Escorial","Talavera de la Reina","Ciudad Rodrigo","Medina del Campo","Tordesillas","Olmedo"],

  "castrapo": ["Badajoz","Caceres","Merida","Plasencia","Trujillo","Navalmoral de la Mata","Coria","Zafra","Jerez de los Caballeros","Olivenza","Almendralejo","Villanueva de la Serena","Don Benito","Medellin","Miajadas","Hervas","Garganta la Olla","Valverde de la Vera","Jarandilla de la Vera","Cuacos de Yuste","Pasaron de la Vera","La Vera"],

  "central-aragonese": ["Huesca","Jaca","Sabiñanigo","Benasque","Graus","Benabarre","Campo","Ainsa","Broto","Bielsa","Plan","Sallent de Gallego","Panticosa","Biescas","Villanua","Ayerbe","Loporzano","Angues","Almudevar","Sietamo","Barbastro","Alquezar"],

  "central-catalan": ["Barcelona","Terrassa","Sabadell","Mataro","Girona","Lleida","Tarragona","Reus","Vic","Manresa","Igualada","Vilafranca del Penedes","Sitges","Blanes","Figueres","Ripoll","Olot","Tortosa","Amposta","Sant Feliu de Guixols","Palafrugell","Calafell"],

  "central-northern-lazian": ["Rieti","Cittaducale","Poggio Mirteto","Magliano Sabina","Casperia","Tarano","Torricella in Sabina","Montopoli di Sabina","Contigliano","Leonessa","Amatrice","Borbona","Cantalice","Pescorocchiano","Posta","Antrodoco","Borgo Velino","Castel Sant'Angelo","Cittareale","Micigliano","Fiamignano","Varco Sabino"],

  "central-southern-calabrian": ["Catanzaro","Crotone","Lamezia Terme","Nicastro","Soverato","Squillace","Girifalco","Chiaravalle Centrale","Serrastretta","Decollatura","Mileto","Pizzo","San Pietro a Maida","Martirano","Simeri Crichi","Borgia","San Floro","Gasperina","Montauro","Amaroni","Pentone","Curinga"],

  "chovashi": ["Cheboksary","Kanash","Alatyr","Tsivilsk","Yadrin","Shumerlya","Novocheboksarsk","Kozlovka","Mariinsky Posad","Poretskoye","Vurnary","Ibresi","Batyrevskoye","Shemursha","Krasnochetayskoye","Yantikovskoye","Morgaushskoye","Alikovskoye","Kugesi","Sosnovka","Calikasy","Yalchik"],

  "cilentan": ["Agropoli","Vallo della Lucania","Sapri","Ascea","Pisciotta","Palinuro","Marina di Camerota","Camerota","Roccagloriosa","Ceraso","Novi Velia","Celle di Bulgheria","Montano Antilia","Felitto","Maggiano","Gioi","Orria","Perito","Laurito","Castellabate","Ogliastro Cilento","Pruno"],

  "comasco-lecchese": ["Como","Lecco","Lugano","Varese","Menaggio","Bellagio","Varenna","Lenno","Tremezzo","Gravedona","Dongo","Colico","Abbadia Lariana","Mandello del Lario","Lierna","Oliveto Lario","Malgrate","Casate","Oggiono","Valmadrera","Merate","Calolziocorte"],

  "cosentino": ["Cosenza","Paola","Rende","Corigliano Calabro","Rossano","Acri","San Giovanni in Fiore","Amantea","Belvedere Marittimo","Diamante","Scalea","San Marco Argentano","Bisignano","Luzzi","Quattromiglia","Castrolibero","Carolei","Dipignano","Mendicino","Cerisano","Marano Marchesato","Rende"],

  "cremun-s": ["Cremona","Crema","Soresina","Casalmaggiore","Viadana","Mantua","Castiglione delle Stiviere","Asola","Bozzolo","Marcaria","Canneto sull'Oglio","San Benedetto Po","Ostiglia","Sustinente","Volta Mantovana","Governolo","Sermide","Poggio Rusco","Quingentole","Curtatone","Roncoferraro","Bagnolo San Vito"],

  "eastern-aragonese": ["Benasque","Cerler","Laspaules","Sahun","Chia","Seira","Eriste","Sant Martin de Tor","Anciles","Castejonde Sos","Liri","Bisaurri","Urmella","Villanova","Arro","Bailo","Javierrelatre","Sigenes","Santa Cruz de la Sierra","Bielsa","Broto","Fanlo"],

  "eastern-lombard": ["Bergamo","Brescia","Crema","Lovere","Sarnico","Iseo","Darfo Boario Terme","Ponte di Legno","Edolo","Esine","Breno","Capo di Ponte","Cividate Camuno","Sellero","Peia","Onore","Albino","Alzano Lombardo","Seriate","Dalmine","Trescore Balneario","Lallio","Stezzano"],

  "eastern-nonmetafonetica": ["Catania","Acireale","Giarre","Riposto","Mascali","Calatabiano","Fiumefreddo di Sicilia","Linguaglossa","Piedimonte Etneo","Sant'Alfio","Milo","Zafferana Etnea","Trecastagni","Aci Catena","Aci Sant'Antonio","Aci Bonaccorsi","Valverde","Viagrande","Santa Venerina","Mineo","Palagonia","Belpasso"],

  "ecuadorian-spanish": ["Quito","Guayaquil","Cuenca","Ambato","Loja","Riobamba","Machala","Portoviejo","Manta","Esmeraldas","Ibarra","Latacunga","Babahoyo","Quevedo","Santo Domingo","Tulcan","Baños","Puyo","Nueva Loja","Atacames","Canoa","Puerto Lopez"],

  "faetar": ["Faeto","Celle di San Vito","Volturino","Castelluccio Valmaggiore","Biccari","Alberona","Rocchetta Sant'Antonio","Orsara di Puglia","Troia","Foggia","Lucera","Bovino","Ascoli Satriano","Cerignola","Manfredonia","San Severo","Apricena","Peschici","Vieste","Mattinata","Monte Sant'Angelo","San Marco in Lamis"],

  "forlivese": ["Forli","Cesena","Rimini","Ravenna","Faenza","Lugo","Imola","Bertinoro","Meldola","Predappio","Castrocaro Terme","Bagno di Romagna","Sarsina","Mercato Saraceno","Monte Poggiolo","Galeata","Santa Sofia","Portico di Romagna","Premilcuore","Civitella di Romagna","Verghereto","Borghi"],

  "franco-proven-al": ["Lyon","Grenoble","Annecy","Chambery","Geneva","Lausanne","Neuchatel","Fribourg","Sion","Martigny","Aoste","Saint-Jean-de-Maurienne","Albertville","Moutiers","Bourg-Saint-Maurice","Thonon-les-Bains","Evian-les-Bains","Bellegarde-sur-Valserine","Nantua","Oyonnax","Morez","Saint-Claude"],

  "gla": ["Inverness","Fort William","Oban","Mallaig","Ullapool","Stornoway","Portree","Kyleakin","Broadford","Tobermory","Islay","Tiree","Barra","South Uist","North Uist","Harris","Lewis","Dingwall","Wick","Thurso","Gairloch","Plockton"],

  "galician-asturian": ["Muxia","Cedeira","Orteigueira","Carino","Avion","Entrimo","Lobios","Castrelo","Padrenda","Covelo","Mondariz","Ponteareas","Salvaterra","As Neves","Vegadeo","Castropol","Boal","Allande","Illano","Coana","Pesoz","Grandas de Salime"],

  "gallo-picene": ["Pesaro","Urbino","Fano","Fossombrone","Mondolfo","Senigallia","Jesi","Cagli","Sassocorvaro","Urbania","Acqualagna","Mercatello sul Metauro","Belforte all'Isauro","Carpegna","Frontino","Piandimeleto","Sant'Angelo in Vado","Pontremoli","Aulla","Fivizzano","Villafranca in Lunigiana","Bagnone"],

  "gallurese": ["Tempio Pausania","Olbia","Arzachena","Calangianus","Luogosanto","Luras","Bortigiadas","Santa Teresa Gallura","Palau","La Maddalena","Capo Testa","San Pantaleo","Trinita d'Agultu","Aggius","Badesi","Viddalba","Perfugas","Erula","Tula","Oschiri","Monti","Berchidda"],

  "gaulish": ["Lugdunum","Lutetia","Burdigala","Nemausus","Divodurum","Augustodunum","Avaricum","Cenabum","Rotomagus","Turnacum","Durocortorum","Augustonemetum","Lemonum","Condate","Alesia","Bibracte","Gergovia","Uxellodunum","Noviodunum","Cabillonum","Matrona","Axona"],

  "haketia": ["Tetouan","Chefchaouen","Larache","Al Hoceima","Nador","Tangier","Oujda","Fez","Meknes","Rabat","Sale","Casablanca","Marrakech","Essaouira","Safi","El Jebha","Ketama","Targuist","Zoumi","Beni Ensar","Driouch","Midar"],

  "italo-australian": ["Melbourne","Sydney","Adelaide","Brisbane","Perth","Wollongong","Newcastle","Geelong","Carlton","Leichhardt","Noble Park","Thornbury","Reservoir","Keilor","Sunshine","Brooklyn","Fawkner","Coburg","Pascoe Vale","Mooroolbark","Dandenong","Springvale"],

  "judeo-aragonese": ["Huesca","Zaragoza","Calatayud","Jaca","Ejea de los Caballeros","Tarazona","Uncastillo","Sos del Rey Catolico","Borja","Alagon","Sadaba","Luna","Biel","Ayerbe","Echo","Ans","Broto","Biescas","Sabiñanigo","Benasque","Barbastro","Monzon"],

  "judeo-catalan": ["Barcelona","Girona","Tarragona","Lleida","Perpignan","Besalu","Vic","Manresa","Mataro","Tortosa","Reus","Figueres","Olot","Ripoll","Sant Feliu de Guixols","Blanes","Cadaques","Puigcerda","Seu d'Urgell","Cardona","Berga","Sant Cugat"],

  "judeo-gascon": ["Bayonne","Biarritz","Pau","Tarbes","Dax","Saint-Sever","Aire-sur-l'Adour","Mont-de-Marsan","Orthez","Hendaye","Saint-Jean-de-Luz","Mauleon-Licharre","Oloron-Sainte-Marie","Navarrenx","Sauveterre-de-Bearn","Lescar","Gan","Morlaas","Arthez-de-Bearn","Salies-de-Bearn","Hasparren","Espelette"],

  "judeo-italian": ["Rome","Venice","Florence","Livorno","Ferrara","Mantua","Modena","Padua","Pisa","Siena","Lucca","Ancona","Urbino","Pesaro","Senigallia","Verona","Trieste","Genoa","Naples","Palermo","Bologna","Reggio Emilia"],

  "judeo-portuguese": ["Lisbon","Porto","Braga","Coimbra","Evora","Faro","Guarda","Viseu","Viana do Castelo","Aveiro","Leiria","Castelo Branco","Portalegre","Beja","Setubal","Santarem","Tomar","Vila Real","Braganca","Chaves","Guimaraes","Ponte de Lima"],

  "languedocien": ["Toulouse","Montpellier","Nimes","Carcassonne","Beziers","Narbonne","Albi","Castelnaudary","Muret","Rodez","Millau","Villefranche-de-Rouergue","Cahors","Montauban","Auch","Foix","Pamiers","Sete","Lunel","Pezenas","Beaucaire","Saint-Gilles"],

  "lat": ["Roma","Londinium","Lutetia","Massilia","Tarraco","Carthago","Pompeii","Herculaneum","Aquincum","Eboracum","Verulamium","Caerleon","Deva","Isca","Calleva","Camulodunum","Viroconium","Noviomagus","Durovernum","Mediolanum","Colonia Agrippina","Lugdunum"],

  "leonese": ["Leon","Zamora","Salamanca","Astorga","Benavente","Villafranca del Bierzo","Ponferrada","Cistierna","Boñar","Riaño","Mansilla de las Mulas","Valencia de Don Juan","La Bañeza","Villamayor","Veguellina","Soto de la Vega","Gordon","Cerezal de Negrillas","Calzada de Valduncel","Villares de la Reina","Cabreros","Navianos de Valverde"],

  "lorrain": ["Metz","Nancy","Verdun","Epinal","Toul","Bar-le-Duc","Pont-a-Mousson","Longwy","Thionville","Sarreguemines","Sarrebourg","Chateau-Salins","Briey","Dieulouard","Jarny","Hombourg-Haut","Forbach","Saint-Avold","Creutzwald","Morhange","Boulay-Moselle","Bitche"],

  "lower-sorbian": ["Cottbus","Chosebuz","Lubeschow","Wjerchwoz","Grynow","Smogowc","Rogow","Bukow","Stary Cottbus","Spremberg","Groß Gastrose","Guben","Forst","Briesen","Drebkau","Weisswasser","Bad Muskau","Krauschwitz","Spreewald","Burg","Schleife","Hoyerswerda"],

  "mainfraenkisch": ["Wurzburg","Schweinfurt","Bamberg","Kitzingen","Volkach","Marktbreit","Ochsenfurt","Karlstadt","Hammelburg","Bad Kissingen","Mellrichstadt","Kunzelsau","Obernburg","Miltenberg","Wertheim","Tauberbischofsheim","Bad Mergentheim","Creglingen","Iphofen","Ebern","Eltmann","Hassfurt"],

  "mallorcan": ["Palma de Mallorca","Soller","Inca","Manacor","Alcudia","Pollenca","Calvia","Andratx","Valldemossa","Deia","Fornalutx","Banyalbufar","Estellencs","Puigpunyent","Esporles","Bunyola","Santa Maria del Cami","Consell","Alaro","Lloseta","Mancor de la Vall","Costitx"],

  "maltese": ["Valletta","Mdina","Sliema","St Julian's","Mosta","Rabat","Zebbug","Qormi","Hamrun","Floriana","Marsascala","Birzebbuga","Mellieha","St Paul's Bay","Gzira","Attard","Balzan","Lija","Naxxar","Birkirkara","Tarxien","Paola"],

  "manduriano": ["Manduria","Oria","Mesagne","Francavilla Fontana","Lizzano","Torre Santa Susanna","San Giorgio Ionico","Faggiano","Pulsano","Leporano","Roccaforzata","Montemesola","Avetrana","Erchie","Maruggio","Sava","Ginosa","Ginosa Marina","Laterza","Castellaneta","Massafra","Martina Franca"],

  "meridional-french": ["Toulouse","Bordeaux","Montauban","Auch","Agen","Tarbes","Pau","Mont-de-Marsan","Dax","Bayonne","Perigueux","Bergerac","Villeneuve-sur-Lot","Fumel","Cahors","Moissac","Castelsarrasin","Grenade-sur-Garonne","Villefranche-de-Lauragais","Revel","Nailloux","Saint-Felix-Lauragais"],

  "messinese": ["Messina","Milazzo","Barcellona Pozzo di Gotto","Torregrotta","Sant'Agata di Militello","Patti","Capo d'Orlando","Brolo","Fiumedinisi","Ali Terme","Nizza di Sicilia","Itala","Santo Stefano di Camastra","Spadafora","Meri","San Filippo del Mela","San Pier Niceto","Mistretta","San Fratello","Motta Sant'Anastasia","Sant'Agata di Militello","Falcone"],

  "enm": ["London","Canterbury","York","Winchester","Norwich","Bristol","Oxford","Cambridge","Lincoln","Exeter","Gloucester","Worcester","Salisbury","Warwick","Leicester","Coventry","Nottingham","Derby","Chester","Lancaster","Newcastle","Beverley"],

  "milanese": ["Milan","Monza","Bergamo","Brescia","Pavia","Cremona","Mantua","Lodi","Vigevano","Legnano","Rho","Saronno","Como","Varese","Lecco","Seregno","Desio","Cesano Maderno","Cinisello Balsamo","Sesto San Giovanni","Paderno Dugnano","Bollate","Corsico"],

  "minderico": ["Minde","Alcanena","Torres Novas","Ourem","Fatima","Batalha","Leiria","Alvaiazere","Ansiao","Pombal","Redinha","Vila Nova de Anços","Mata Mourisca","Guia","Carvalhal","Vila Nova de Poiares","Lousa","Gois","Arganil","Oliveira do Hospital","Tabua","Seia"],

  "murcian": ["Murcia","Cartagena","Lorca","Aguilas","Caravaca de la Cruz","Cehegin","Mula","Yecla","Jumilla","Torre Pacheco","San Javier","Los Alcazares","Mazarron","Totana","Alhama de Murcia","Fortuna","Abanilla","Santomera","Alcantarilla","Molina de Segura","Archena","Ricote"],

  "navarrese": ["Pamplona","Tudela","Estella","Burlada","Baranain","Villava","Ansoain","Huarte","Zizur Mayor","Noain","Tafalla","Olite","Sanguesa","Aoiz","Echalar","Lesaka","Bera","Doneztebe","Igantzi","Arantza","Ituren","Urroz"],

  "navarro-aragonese": ["Pamplona","Jaca","Huesca","Yesa","Sanguesa","Lumbier","Aoiz","Monreal","Tafalla","Olite","Corella","Cascante","Tarazona","Borja","Magallon","Ainzon","Caparroso","Carcastillo","Sada","Liedena","Vera de Bidasoa","Eugi"],

  "norman": ["Caen","Rouen","Le Havre","Saint-Lo","Cherbourg","Avranches","Dieppe","Falaise","Lisieux","Bayeux","Alencon","Argentan","Flers","Vire","Conde-sur-Noireau","Villedieu-les-Poeles","Granville","Coutances","Saint-Hilaire-du-Harcouet","Pontorson","Dives-sur-Mer","Honfleur"],

  "northern-romanian": ["Iasi","Suceava","Botosani","Bacau","Piatra Neamt","Vaslui","Falticeni","Pascani","Roman","Birlad","Husi","Dorohoi","Vatra Dornei","Campulung Moldovenesc","Radauti","Siret","Targu Frumos","Hirlau","Podu Iloaiei","Scanteia","Cotnari","Rasca"],

  "northern-sami": ["Kautokeino","Karasjok","Alta","Tana","Nesseby","Porsanger","Lakselv","Guovdageaidnu","Deatnu","Unjarga","Boazo","Suovvir","Skiisa","Ohccejohka","Cahkkas","Rasttigaisa","Slatto","Beattetgieddi","Masi","Snase","Kirkenes","Neiden"],

  "old-catalan": ["Barcelona","Girona","Tarragona","Lleida","Tortosa","Perpignan","Puigcerda","Besalu","Vic","Sant Feliu de Guixols","Figueres","Olot","Ripoll","Cardona","Berga","Manresa","Montserrat","Balaguer","Agramunt","Cervera","Montblanc","Reus"],

  "ang": ["Canterbury","Winchester","York","London","Norwich","Exeter","Wessex","Mercia","Northumbria","East Anglia","Kent","Essex","Sussex","Berkshire","Wiltshire","Somerset","Dorset","Devon","Cornwall","Herefordshire","Shropshire","Lincolnshire"],

  "old-gallo-romance": ["Paris","Lyon","Bordeaux","Toulouse","Marseille","Rouen","Tours","Bourges","Poitiers","Limoges","Clermont-Ferrand","Rennes","Nantes","Angers","Le Mans","Orleans","Dijon","Besancon","Metz","Strasbourg","Reims","Amiens"],

  "old-leonese": ["Leon","Zamora","Salamanca","Oviedo","Gijon","Avila","Segovia","Burgos","Sahagun","Astorga","Villafranca del Bierzo","Ponferrada","Cistierna","Riaño","Benavente","Toro","Valencia de Don Juan","La Bañeza","Cabriles","Murias","Soto","Fuentes"],

  "old-lombard": ["Milan","Bergamo","Brescia","Como","Cremona","Pavia","Lodi","Mantua","Crema","Piacenza","Parma","Reggio Emilia","Modena","Bologna","Ferrara","Bobbio","Voghera","Tortona","Alessandria","Novara","Vercelli","Ivrea"],

  "old-romagnol": ["Rimini","Ravenna","Forli","Cesena","Faenza","Lugo","Imola","Bertinoro","Castel Bolognese","Cotignola","Solarolo","Bagnacavallo","Russi","Sarsina","Verghereto","Bagno di Romagna","Santa Sofia","Portico di Romagna","Premilcuore","Mercato Saraceno","Montescudo","Monte Colombano"],

  "oliventine": ["Olivenza","Badajoz","Elvas","Campo Maior","Alconchel","Taliga","Villanueva del Fresno","Cheles","Valverde de Leganes","Alburquerque","San Vicente de Alcantara","Herreruela","La Codosera","Puebla de Obando","Villar del Rey","Torre de Miguel Sesmero","Zarza la Mayor","Estorninos","Villar Grande","La Codosera","Alambar","Segura"],

  "oltenian": ["Craiova","Drobeta-Turnu Severin","Targu Jiu","Slatina","Caracal","Ramnicu Valcea","Calafat","Turnu Magurele","Corabia","Bals","Filiași","Pitesti","Curtea de Arges","Campulung","Draganesti-Olt","Scornicești","Potcoava","Bechet","Strehaia","Murgesti","Horezu","Bistrita"],

  "orl-anais": ["Orleans","Pithiviers","Montargis","Gien","Cosne-sur-Loire","Sully-sur-Loire","Beaugency","La Chapelle-Saint-Mesmin","Olivet","Fleury-les-Aubrais","Saran","Ingre","Saint-Jean-de-Braye","Chateauneuf-sur-Loire","Malesherbes","Puiseaux","Amilly","Villorceau","Chaussy","Briare","Bonnieres-sur-Loire","Chateauneuf"],

  "palra": ["Cangas de Onis","Oviedo","Gijon","Aviles","Luanco","Cudillero","Pravia","Soto del Barco","Muros de Nalon","Luarca","Navia","Villaviciosa","Colunga","Caravia","Ribadesella","Llanes","Potes","Torrelavega","San Vicente de la Barquera","Comillas","Suances","Santillana del Mar"],

  "pannonian-latin": ["Savaria","Sopianae","Aquincum","Gorsium","Iovia","Brigetio","Carnuntum","Vindobona","Arrabona","Mursa","Cibalae","Sirmium","Bassiana","Marsonia","Taurunum","Singidunum","Viminacium","Margum","Novae","Ratiaria","Durostorum","Lugio"],

  "paydret": ["Fontenay-le-Comte","Lucon","La Roche-sur-Yon","Les Sables-d'Olonne","Challans","Saint-Jean-de-Monts","Machecoul","La Mothe-Achard","Aizenay","Le Poiré-sur-Vie","Mouilleron-le-Captif","Essarts","Mervent","Vouvant","Saint-Michel-le-Cloucq","Fallerans","L'Herbergement","Bazoges-en-Pareds","Chantonnay","Sigournais","Chauche","Legou"],

  "pesciatino": ["Pescia","Montecatini Terme","Buggiano","Ponte Buggianese","Massa e Cozzile","Monsummano Terme","Vellano","Castelvecchio","Stiappa","Pietrabuona","Medicina","Collodi","San Quirico","Vellano","Altopascio","Borgo a Buggiano","Uzzano","Chiesina Uzzanese","Lamporecchio","Cerreto Guidi","Empoli","Vinci"],

  "picard": ["Amiens","Lille","Roubaix","Tourcoing","Arras","Calais","Boulogne-sur-Mer","Dunkerque","Cambrai","Saint-Quentin","Laon","Soissons","Beauvais","Creil","Compiegne","Senlis","Abbeville","Doullens","Montreuil-sur-Mer","Hesdin","Lens","Lievin","Bethune"],

  "pisano-livornese": ["Pisa","Livorno","Cecina","Volterra","Pontedera","Empoli","San Miniato","Fucecchio","Santa Croce sull'Arno","Castelfranco di Sotto","Ponsacco","Capannoli","Lajatico","Peccioli","Montaione","Gambassi Terme","Certaldo","Colle Val d'Elsa","San Gimignano","Casale Marittimo","Bibbona","Rosignano Marittimo"],

  "poitevin": ["Poitiers","Niort","La Rochelle","Rochefort","Saintes","Angouleme","Cognac","Royan","Fontenay-le-Comte","Lucon","Melle","Chef-Boutonne","Lusignan","Couhe","Lezay","Parthenay","Thouars","Bressuire","Chatellerault","Montmorillon","Chauvigny","Lencloitre"],

  "poitevin-saintongeais": ["Poitiers","Saintes","Saint-Jean-d'Angely","Cognac","Angouleme","Rochefort","Royan","La Rochelle","Niort","Fontenay-le-Comte","Marennes","Saujon","Pons","Barbezieux","Chalais","Aubeterre-sur-Dronne","Brossac","Montguyon","Matha","Burie","Archiac","Jarnac"],

  "pol": ["Warsaw","Krakow","Wroclaw","Gdansk","Poznan","Lodz","Lublin","Katowice","Szczecin","Bydgoszcz","Torun","Bialystok","Gdynia","Czestochowa","Radom","Sosnowiec","Kielce","Gliwice","Opole","Zabrze","Bielsko-Biala","Rzeszow"],

  "por": ["Lisbon","Porto","Braga","Coimbra","Faro","Funchal","Evora","Setubal","Aveiro","Viseu","Guarda","Leiria","Viana do Castelo","Vila Real","Braganca","Ponte de Lima","Guimaraes","Barcelos","Chaves","Santo Tirso","Vila do Conde","Oliveira de Azemeis"],

  "proto-eastern-romance": ["Tomis","Durostorum","Novae","Ratiaria","Sirmium","Scupi","Naissus","Serdica","Philippopolis","Histria","Callatis","Dionysiopolis","Olbia","Apollonia","Marcianopolis","Odessus","Pautalia","Germania","Beroe","Augusta Traiana","Trapezus","Nicopolis ad Istrum"],

  "proto-romance": ["Roma","Mediolanum","Lugdunum","Lutetia","Tarraco","Carthago Nova","Emerita Augusta","Toletum","Bracara Augusta","Nemausus","Arelate","Massilia","Aquae Sextiae","Noviodunum","Vindobona","Londinium","Eboracum","Olisipo","Caesaraugusta","Pompaelo","Isca Dumnoniorum","Burdigala"],

  "regional-italian": ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Catania","Venice","Verona","Cagliari","Perugia","Ancona","L'Aquila","Potenza","Campobasso","Trieste","Trento","Bolzano","Udine"],

  "riunorese": ["Riuno","San Martin","Cecos","Villarmeori","Bual","Navia","Grandas de Salime","Pesoz","San Damian","Pando","Bustelo","Muniellos","Allande","Pola de Allande","Berducedo","Linares","Samol","Sante","Penouta","Cangas","Illano","Boal"],

  "royasc": ["La Brigue","Tende","Saorge","Breil-sur-Roya","Castellar","Menton","Olivetta San Michele","Airole","Castiglione","Pigna","Dolceacqua","Isolabona","Apricale","Perinaldo","Seborga","Bordighera","Vallecrosia","Camporosso","Sanremo","Taggia","Costarainero","Riva Ligure"],

  "sabino": ["Rieti","L'Aquila","Avezzano","Tagliacozzo","Sulmona","Pescara","Chieti","Teramo","Lanciano","Ortona","Vasto","San Salvo","Torre dei Passeri","Amatrice","Antrodoco","Borgorose","Pescorocchiano","Magliano de' Marsi","Massa d'Albe","Scurcola Marsicana","Cappadocia","Carsoli"],

  "salentino": ["Lecce","Brindisi","Taranto","Gallipoli","Otranto","Maglie","Martina Franca","Francavilla Fontana","Ostuni","Mesagne","San Pietro Vernotico","Cellino San Marco","Campi Salentina","Squinzano","Copertino","Nardo","Galatina","Alessano","Tricase","Casarano","Parabita","Matino"],

  "sassarese": ["Sassari","Alghero","Porto Torres","Sorso","Stintino","Castelsardo","Valledoria","Badesi","Perfugas","Erula","Nulvi","Chiaramonti","Martis","Oschiri","Tula","Ozieri","Ardara","Codrongianos","Ploaghe","Giave","Bonorva","Semestene"],

  "savoyard": ["Chambery","Annecy","Aix-les-Bains","Albertville","Moutiers","Bourg-Saint-Maurice","Thonon-les-Bains","Evian-les-Bains","Saint-Jean-de-Maurienne","Moûtiers","Bozel","Pralognan-la-Vanoise","Modane","Saint-Michel-de-Maurienne","Aime","Megève","Chamonix","Sallanches","Cluses","Scionzier","Rumilly","Albens"],

  "sco": ["Edinburgh","Glasgow","Dundee","Aberdeen","Inverness","Stirling","Perth","Dumfries","Kirkcaldy","Falkirk","Ayr","Paisley","Kilmarnock","Motherwell","Hamilton","East Kilbride","Livingston","Cumbernauld","Irvine","Greenock","Kirkwall","Lerwick"],

  "senese": ["Siena","San Gimignano","Volterra","Montalcino","Pienza","Montepulciano","Chiusi","Monte Oliveto Maggiore","Asciano","Colle Val d'Elsa","Casole d'Elsa","Radicondoli","Gambassi Terme","Certaldo","Castellina in Chianti","Radda in Chianti","Gaiole in Chianti","Castelnuovo Berardenga","Sovicille","Murlo","Buonconvento","Monticiano"],

  "serbo-croatian": ["Belgrade","Zagreb","Sarajevo","Split","Dubrovnik","Novi Sad","Subotica","Osijek","Rijeka","Zadar","Pula","Knin","Mostar","Banja Luka","Tuzla","Zenica","Podgorica","Nis","Kragujevac","Pristina","Tivat","Herceg Novi"],

  "silesian-german": ["Breslau","Liegnitz","Glogau","Schweidnitz","Waldenburg","Brieg","Namslau","Oels","Sagan","Gorlitz","Hirschberg","Landeshut","Ratibor","Oppeln","Beuthen","Kattowitz","Koenigshutte","Tarnowitz","Gleiwitz","Cosel","Neisse","Bielitz"],

  "slovene": ["Ljubljana","Maribor","Celje","Kranj","Velenje","Novo Mesto","Ptuj","Murska Sobota","Koper","Izola","Piran","Domzale","Kamnik","Trbovlje","Jesenice","Slovenj Gradec","Vojnik","Skofja Loka","Idrija","Postojna","Bled","Bohinj"],

  "southern-cilentan": ["Sapri","Camerota","San Giovanni a Piro","Roccagloriosa","Celle di Bulgheria","Morigerati","San Mauro La Bruca","Futani","Vallo della Lucania","Ascea","Pisciotta","Capitolo","Centola","Cannalonga","Gioi","Orria","Montano Antilia","Perito","Laurito","Torre Orsaia","Caselle in Pittari","San Martino"],

  "southern-laziale": ["Frosinone","Latina","Cassino","Anagni","Alatri","Ferentino","Ceccano","Patrica","Supino","Rocca d'Arce","Isola del Liri","Arpino","Atina","Belmonte Castello","Sora","Pontecorvo","Pico","San Giovanni Incarico","Lenola","Terracina","Fondi","Itri"],

  "swe": ["Stockholm","Gothenburg","Malmo","Uppsala","Linkoping","Vasteras","Orebro","Norrkoping","Helsingborg","Jönkoping","Umea","Lulea","Gavle","Sundsvall","Karlstad","Vaxjo","Kalmar","Karlskrona","Kiruna","Pitea","Lund","Halmstad"],

  "swiss-italian": ["Lugano","Bellinzona","Locarno","Mendrisio","Chiasso","Ascona","Massagno","Sorengo","Pregassona","Comano","Vezia","Porza","Cadempino","Savosa","Cureglia","Agno","Bioggio","Manno","Bironico","Monte Carasso","Cugnasco","Vira Gambarogno"],

  "transylvanian": ["Cluj-Napoca","Brasov","Sibiu","Alba Iulia","Targu Mures","Bistrita","Dej","Medias","Sebes","Sighisoara","Oradea","Satu Mare","Zalau","Baia Mare","Aiud","Blaj","Turda","Ludus","Reghin","Gherla","Fagaras","Rasnov"],

  "tuatschin": ["Trun","Disentis","Sedrun","Ilanz","Mustér","Sumvitg","Breil","Ruis","Siat","Cumbel","Pigniu","Lumbrein","Vrin","Duvin","Ardez","Tschlin","Ramosch","Sent","Vna","Martina","Strada","Schleins"],

  "tuscan": ["Florence","Siena","Pisa","Lucca","Arezzo","Pistoia","Prato","Livorno","Grosseto","Volterra","San Gimignano","Empoli","Pontedera","Cortona","Montevarchi","Sansepolcro","Anghiari","Capalbio","Orbetello","Massa Marittima","Follonica","Piombino"],

  "tuscia": ["Viterbo","Tarquinia","Civitavecchia","Montefiascone","Bolsena","Orvieto","Acquapendente","Tuscania","Bagnoregio","Ronciglione","Caprarola","Nepi","Sutri","Fabrica di Roma","Vallerano","Vejano","Barbarano Romano","Blera","Tolfa","Allumiere","Civitella d'Agliano","Castiglione in Teverina"],

  "umbrian": ["Perugia","Assisi","Spoleto","Orvieto","Gubbio","Todi","Citta di Castello","Foligno","Narni","Amelia","Terni","Norcia","Castiglione del Lago","Passignano sul Trasimeno","Magione","Panicale","Paciano","Citta della Pieve","Montefalco","Bevagna","Trevi","Campello sul Clitunno"],

  "valencian": ["Valencia","Alicante","Castellon de la Plana","Elche","Torrent","Sagunto","Gandia","Xativa","Villarreal","Alcoi","Elda","Petrer","Orihuela","Benidorm","Vila-real","Burriana","Alzira","Carcaixent","Denia","Calpe","Vinaros","Morella"],

  "vallader": ["Scuol","Sent","Vna","Champfless","Tarasp","Ardez","Lavin","Susch","Zernez","Madulain","Mustair","Santa Maria Val Mustair","Valchava","Ftan","S-charl","Strada","Tschlin","Ramosch","Schiers","Klosters","Davos","Klosters-Serneus"],

  "vivaro-alpine": ["Gap","Briancon","Embrun","Digne-les-Bains","Barcelonnette","Sisteron","Forcalquier","Manosque","Apt","Cavaillon","Orange","Carpentras","Vaison-la-Romaine","Nyons","Die","Serres","La Batie-Montsaleon","Aspres-sur-Buech","Veynes","Pelvoux","Saint-Etienne-en-Devoluy","L'Argentiere-la-Bessee"],

  "west-walloon": ["Tournai","Mons","Ath","Enghien","Soignies","Leuze-en-Hainaut","Beloeil","Peruwelz","Flobecq","Lessines","Chievres","Brugelette","Cambron-Casteau","Rongy","Brunehaut","Antoing","Pecq","Templeuve","Luingne","Mouchin","Bury","Pont-a-Chin"],

  "western-aragonese": ["Canfranc","Villanua","Aisa","Aragues del Puerto","Borau","Castiello de Jaca","Santa Cruz de la Seros","Jaca","Yesa","Salvatierra de Esca","Ans","Echo","Beratu","Sallent de Gallego","Panticosa","Balbarda","Villalba","Zuera","Farasdes","San Juan de la Peña","Bailo","Sigues"],

  "western-catalan": ["Lleida","Tortosa","Amposta","Alacant","Elx","Oriola","Elda","Petrer","Villarreal","Alcoi","Xativa","Ontinyent","Sax","Villena","Crevillent","Aspe","Novelda","Monforte del Cid","El Campello","San Juan de Alicante","Mutxamel","Busot"],

  "wisconsin-walloon": ["Green Bay","Kewaskum","Door County","Brussels","Namur","Union","Gardner","Robinsonville","Chambers Island","Washington Island","Egg Harbor","Fish Creek","Sister Bay","Ellison Bay","Gills Rock","Baileys Harbor","Sturgeon Bay","Algoma","Kewaunee","Casco","Denmark","Wrightstown","Hilbert"],

  "zea": ["Middelburg","Vlissingen","Goes","Terneuzen","Domburg","Veere","Zierikzee","Middelharnis","Sommerensdijk","Sluis","Cadzand","Breskens","Tholen","Sint-Maartensdijk","Kapelle","Borsele","Hulst","Oostburg","IJzendijke","Axel","Retranchement","Westkapelle"],

  "akkala-sami": ["Kildinsty","Kuoloyarvi","Akhkala","Babinsky","Yona","Kovdor","Kandalaksha","Olenegorsk","Monchegorsk","Apatity","Kirovsk","Lovozero","Revda","Imandra","Nivanky","Kaskam","Kurtzh","Kholtak","Yumansk","Umba","Knyazhegubskoye","Kah-kaul"],

  "ala-satakunta": ["Rauma","Pori","Huittinen","Kokemaki","Eurajoki","Luvia","Nakkila","Harjavalta","Ulvila","Kullaa","Kodisjoki","Lappi","Merikarvia","Siikainen","Karinainen","Ylane","Koylio","Vampula","Sakyla","Eura","Kirstila","Laitila"],

  "alutaguse": ["Johvi","Toila","Vaivara","Narva-Joesuu","Iisaku","Avinurme","Lohusuu","Mustvee","Kasepaa","Illuka","Jouga","Kurtna","Kukruse","Ontika","Oru","Purtse","Puhajoe","Saka","Sompa","Tammiku","Tudulinna","Alutaguse"],

  "atlym": ["Berezovo","Kazym","Sorum","Punsi","Alym","Vosh","Yasunt","Khulgor","Khothlor","Yagilyakh","Urmanny","Sogom","Tegi","Kondes","Shorsh","Yelakh","Niyaksor","Korlkgan","Vanzetur","Pitlyar","Loymot","Kanglym"],

  "atlym-nizyam-khanty": ["Berezovo","Kazym","Nizyam","Atlym","Sorum","Punsi","Vosh","Yasunt","Khulgor","Khothlor","Yagilyakh","Urmanny","Tegi","Kondes","Shorsh","Yelakh","Niyaksor","Pitlyar","Loymot","Vanzetur","Kanglym","Yerkim"],

  "berjozov": ["Berezovo","Kazym","Sorum","Numto","Yunyugan","Vutyt","Pitlyar","Loymot","Yary","Nyaksimvol","Khanty-Mansiysk","Nyagan","Surgut","Nefteyugansk","Kogalym","Langepas","Pokachi","Pyt-Yakh","Izilim","Uray","Oktyabrskoye","Krasnoleninsky"],

  "bjarmian-finnic": ["Perm","Cherdyn","Solikamsk","Berezniki","Kudymkar","Ocher","Kungur","Dobryanka","Krasnokamsk","Nytva","Osa","Okhansk","Gubakha","Lysva","Vereshchagino","Chaikovsky","Aleksandrovsk","Polazna","Gornozavodsk","Biser","Kochyovskoye","Gainy"],

  "central-erzya": ["Saransk","Ruzayevka","Kovylkino","Insnar","Kochkurovo","Lyambir","Staroye Shaygurovo","Bolshiye Berezniki","Krasnoslobodsk","Temnikov","Yelnik","Torbeevo","Chamzinka","Atyashevo","Dubrovka","Ladushkino","Kadomkino","Staroye Ardashevo","Mokshaye","Shiringushi","Kepyalya","Atyasevo"],

  "central-estonian": ["Paide","Turi","Tapa","Rakvere","Poltsamaa","Jogeva","Pajusi","Pilistvere","Vohma","Karstna","Kilingi-Nomme","Tori","Vandra","Suure-Jaani","Viljandi","Lihula","Marjamaa","Kullamaa","Haapsalu","Linnamae","Risti","Kivi-Vigala"],

  "central-finland": ["Jyvaskyla","Jamsa","Keuruu","Saarijarvi","Karstula","Kinnula","Kuhmoinen","Laukaa","Uurainen","Multia","Petajavesi","Korpilahti","Muurame","Toivakka","Leivonmaki","Hankasalmi","Konnevesi","Luhanka","Sumiainen","Suolahti","Viitasaari","Pihtipudas"],

  "central-ludic": ["Mikhaylovskoye","Kondopoga","Girvas","Gomselga","Latva-Vetka","Selgy","Tivdija","Shuya","Krokhino","Besovets","Sennaya","Gabselga","Unitskaya","Kedrozero","Svyatozero","Vygozero","Shcheleyki","Shoksha","Pudozh","Onega","Belomorsk","Kem"],

  "central-mansi": ["Khanty-Mansiysk","Nizhnevartovsk","Surgut","Berezovo","Beloyarsky","Nyagan","Kogalym","Langepas","Pokachi","Pyt-Yakh","Uray","Izilim","Oktyabrskoye","Krasnoleninsky","Cherlakh","Salianka","Tremtam","Akne","Pitlyar","Yeryomino","Khortinskoye","Vanzetour"],

  "central-moksha": ["Saransk","Krasnoslobodsk","Temnikov","Kovylkino","Insar","Kadoshkin","Yelnik","Torbeevo","Staroye Shaygurovo","Bolshiye Berezniki","Mokshaney","Zubova Polyana","Nizhny Lomov","Narovchat","Spassk","Vadinsk","Kerzha","Pochinki","Krasnaya Presnya","Ulyanovka","Bolshevik","Selishche"],

  "central-selkup": ["Nakhodka","Farkovo","Ivantsevo","Kellog","Krasnoselkup","Tazovsky","Gaz-Sale","Naftokhanka","Sidorovsk","Matrosovo","Tukhard","Kazym","Urengoy","Purpe","Tarko-Sale","Korpokh","Venga","Payakha","Ngarka","Yamsovey","Toholyam","Sabyda"],

  "central-veps": ["Shyoltozero","Rybreka","Shelga","Kaskesg","Kuks","Ozera","Boksa","Matveeva-Selga","Megrega","Ryapityaselga","Syargi","Pyat","Kaskeselga","Kukselga","Ponalaksha","Pella","Vinnitsy","Shugozero","Padanos","Yaroslav","Kuytozero","Kimozero"],

  "central-vychegda": ["Syktyvkar","Vychegda","Ukhta","Sosnogorsk","Pechora","Vorkuta","Inta","Usinsk","Koygorodok","Kortkeros","Ust-Kulom","Ust-Tsilema","Izhma","Nizhnyaya Omra","Yarega","Ust-Vym","Mikun","Zheleznodorozhny","Chinyaveryk","Visinga","Kylud","Garevo"],

  "chukotko-kamchatkan-amuric": ["Anadyr","Bilibino","Pevek","Uelen","Lavrentiya","Provideniya","Egvekinot","Ust-Belyayka","Markovo","Khatyrka","Mainung","Nutepelmen","Kanchalan","Uelkal","Ilirney","Alkatvaam","Anyuy","Krasneno","Snezhnoye","Ostrovnoye","Tanyurer","Shakhtinsky"],

  "chusovaya": ["Chusovoy","Lysva","Kungur","Verkhnyaya Chusovaya","Chusovaya River","Kamenka","Bisert","Nizhny Tagil","Polevskoy","Revdinsk","Gornouralsk","Yevropeyskaya","Kushva","Nevyansk","Verkh-Neyvinsk","Turan","Utkinsk","Klyuchi","Sergeyevsk","Russkiy","Isetskoye","Shilovsk"],

  "colloquial-finnish": ["Helsinki","Espoo","Vantaa","Tampere","Turku","Oulu","Jyvaskyla","Lahti","Kuopio","Porvoo","Hameenlinna","Joensuu","Lappeenranta","Hämeenlinna","Vaasa","Rovaniemi","Mikkeli","Savonlinna","Kokkola","Kajaani","Kerava","Kirkkonummi"],

  "core-mansi": ["Khanty-Mansiysk","Nizhnevartovsk","Surgut","Nyagan","Kogalym","Langepas","Berezovo","Beloyarsky","Nyaksimvol","Sortiral","Yakha","Yugan","Malij Yugan","Leushi","Gornopravdinsk","Andra","Yarsino","Tapkhylor","Torm","Yalpyngen","Putur","Nyalinskoye"],

  "eastern-khanty": ["Nizhnevartovsk","Surgut","Megion","Langepas","Pokachi","Uray","Kogalym","Lyantor","Pyt-Yakh","Nefteyugansk","Malij Jugan","Tremjugan","Vakh","Vasyugan","Salym","Yugan","Kinchany","Korlik","Varyogan","Agan","Tromygan","Ust-Balyk"],

  "eastern-mari": ["Yoshkar-Ola","Kozmodemyansk","Volzhsk","Zvenigovo","Medvedevo","Orshanka","Kilemary","Mari-Turek","Morki","Paranga","Sovetsky","Yurino","Cheboksary","Krasnogorsky","Kuyarsk","Nomozh","Pemba","Sheremetyevsky","Aylat","Karaksha","Bolshoy Luy","Kokshaysk"],

  "enets": ["Potapovo","Tukhard","Dudinka","Ust-Avan","Volochanka","Khatanga","Nosok","Novaya","Dikson","Karaul","Taimyr","Imangda","Kresty","Syndassko","Bikada","Uolyk","Khotochokha","Boyarka","Balan","Kapchuk","Malaya Kheta","Zimnyaya"],

  "erzya": ["Saransk","Ruzayevka","Kovylkino","Insar","Kadoshkin","Yelnik","Torbeevo","Bolshiye Berezniki","Krasnoslobodsk","Temnikov","Staroye Shaygurovo","Chamzinka","Atyashevo","Lyambir","Kochkurovo","Dubrovka","Ladushkino","Kadomkino","Staroye Ardashevo","Mokshaye","Shiringushi","Kepyalya"],

  "fingelska": ["Helsinki","Espoo","Vantaa","Porvoo","Loviisa","Kotka","Hamina","Kouvola","Elimäki","Anjalankoski","Valkeala","Kuusankoski","Jaala","Tuusula","Kerava","Sipoo","Pornainen","Askola","Myrskylä","Pukkila","Orimattila","Lapinjärvi"],

  "finnmark-sami": ["Karasjok","Kautokeino","Alta","Lakselv","Nesseby","Vadsø","Vardø","Kirkenes","Bugøynes","Neiden","Seidet","Polmak","Tana","Deatnu","Leavsnjarga","Unjárga","Båtsfjord","Berlevåg","Gamvik","Mehamn","Skipagurra","Vestre Jakobselv"],

  "forest-enets": ["Potapovo","Tukhard","Dudinka","Khatanga","Volochanka","Nosok","Novaya","Imangda","Kresty","Syndassko","Bikada","Uolyk","Khotochokha","Boyarka","Balan","Karaul","Dikson","Malaya Kheta","Zimnyaya","Kapchuk","Ust-Avan","Taimyr"],

  "forest-nenets": ["Narjan-Mar","Usinsk","Inta","Pechora","Vorkuta","Izhma","Ust-Tsilema","Sosnogorsk","Ukhta","Syktyvkar","Koygorodok","Yarega","Visinga","Nizhnyaya Omra","Kushva","Verkhnyaya Omra","Kortkeros","Ust-Kulom","Chinyaveryk","Garevo","Mikun","Pechora River"],

  "hevaha": ["Kingisepp","Leningrad","Gatchina","Volosovo","Slantsy","Ivangorod","Narva","Koporje","Soikino","Kurgolovo","Kikkerpyal","Ropsu","Hindika","Haavakivi","Väykatky","Kose","Kellomäki","Somerikkö","Kyyrölä","Keltto","Lempaala","Volmansi"],

  "ingrian": ["Kingisepp","Gatchina","Lomonosov","Volosovo","Koporje","Soikino","Kurgolovo","Ivangorod","Slantsy","Väykatky","Kellomäki","Somerikkö","Kyyrölä","Keltto","Lempaala","Hietamäki","Pöllölä","Tyrö","Kupanitsa","Spankkova","Venjoki","Mikkola"],

  "insular-estonian": ["Kuressaare","Kihelkonna","Laimjala","Leisi","Mustjala","Muhu","Orissaare","Pöide","Ruhnu","Saaremaa","Torgu","Väike-Maarja","Kärla","Kärdla","Hiiumaa","Emmaste","Käina","Pühalepa","Reigi","Kassari","Kõrgessaare","Putkaste"],

  "izhma": ["Izhma","Syktyvkar","Ukhta","Pechora","Sosnogorsk","Koygorodok","Ust-Kulom","Ust-Tsilema","Vorkuta","Inta","Usinsk","Nizhnyaya Omra","Kortkeros","Mikun","Yarega","Chinyaveryk","Visinga","Garevo","Kylud","Kushva","Verkhnyaya Omra","Pechora River"],

  "kamas": ["Abakan","Minusinsk","Kyzyl","Tuva","Sayansk","Chernogorsk","Ust-Abakan","Tashtyp","Askiz","Shira","Bograd","Beybazar","Kazanovka","Sagen-Nur","Uyuk","Elegest","Balgazyn","Kaa-Khem","Chadan","Teeli","Samagaltai","Erzin"],

  "karagas": ["Abakan","Kyzyl","Minusinsk","Sayansk","Chernogorsk","Ust-Abakan","Tashtyp","Askiz","Shira","Bograd","Kazanovka","Sagen-Nur","Uyuk","Elegest","Kaa-Khem","Chadan","Teeli","Samagaltai","Erzin","Balyktyg","Kara-Khem","Todzha"],

  "karasuk": ["Karassuk","Karasuk","Krotovka","Zdvinsk","Chany","Kupyino","Bagan","Kochki","Ubinskoye","Chistoozernoye","Krasnozyorskoye","Tatarsk","Barabinsk","Kuybyshev","Omsk","Bolsherechye","Tara","Znamenskoye","Sherbakul","Moskalenka","Pokrovka","Isilkul","Maryanovka"],

  "karelian": ["Petrozavodsk","Kondopoga","Sortavala","Kostomuksha","Suoyarvi","Kem","Belomorsk","Pudozh","Medvezhyegorsk","Kalevala","Louhi","Chupa","Khibiny","Nadvoitsy","Porso","Shapoma","Pialma","Girvas","Sukkozero","Voloma","Padany","Vendury"],

  "karelian-proper": ["Petrozavodsk","Sortavala","Kondopoga","Kostomuksha","Suoyarvi","Kem","Medvezhyegorsk","Padany","Vedlozero","Krokhino","Sukkozero","Voloma","Shuya","Essoila","Kaskes","Kukselga","Syargi","Belenky","Michurinskoye","Svyatozero","Kedrozero","Chalna"],

  "kemi": ["Kemi","Tornio","Haparanda","Kallio","Keminmaa","Tervola","Simo","Ylitornio","Övertorneå","Pello","Kolari","Rovaniemi","Kemijärvi","Sodankylä","Pelkosenniemi","Savukoski","Kittilä","Muonio","Enontekiö","Inari","Utsjoki","Karigasniemi"],

  "kemi-sami": ["Kemi","Tornio","Haparanda","Keminmaa","Tervola","Simo","Ylitornio","Övertorneå","Pello","Kolari","Kemijärvi","Sodankylä","Pelkosenniemi","Savukoski","Rovaniemi","Kittilä","Muonio","Enontekiö","Pajala","Överkalix","Kalix","Luleå"],

  "kemij-rvi": ["Kemijärvi","Rovaniemi","Sodankylä","Pelkosenniemi","Savukoski","Kittilä","Muonio","Enontekiö","Inari","Utsjoki","Posio","Ranua","Salla","Kuusamo","Suomussalmi","Taivalkoski","Pudasjärvi","Ylikiiminki","Yli-Iis","Iisalmi","Lapinlahti","Soni"],

  "keuruu-evij-rvi": ["Keuruu","Evijärvi","Ähtäri","Saarijärvi","Kannonkoski","Karstula","Kyyjärvi","Multia","Pihlavesi","Kuhmoinen","Jämsä","Orivesi","Kangasala","Sahalahti","Kuhmalahti","Pälkäne","Luopioinen","Hattula","Kalvola","Tyrväntö","Hämeenlinna","Vanaja","Lammi"],

  "kochevo": ["Kudymkar","Kocha","Velva","Kosa","Yurla","Cherdyn","Solikamsk","Berezniki","Dobryanka","Ocher","Kungur","Nytva","Krasnokamsk","Okhansk","Osa","Gainy","Kochyovskoye","Mikhailovsk","Vereshchagino","Chaikovsky","Alexandrovsk","Polazna"],

  "koibal": ["Abakan","Kyzyl","Minusinsk","Sayansk","Chernogorsk","Shushenskoye","Ermakovskoye","Karatzag","Tuva","Ust-Abakan","Izyk-Kyzyl","Balgazyn","Kaa-Khem","Chadan","Teeli","Samagaltai","Erzin","Kyzyl-Khaya","Ak-Dovurak","Chaa-Khol","Tandy","Sut-Khol"],

  "komi-permyak": ["Kudymkar","Kosa","Kocha","Yurla","Velva","Doyur","Belozerka","Kudymkar-Inva","Parma","Onokhino","Kochyovskoye","Gainy","Koslan","Bolshekochinsky","Udora","Glazov","Kirovo-Chepetsk","Vyatka","Syktyvkar","Ukhta","Pechora","Mikun","Snytury"],

  "kraasna": ["Voru","Kraasna","Rapina","Polva","Vastseline","Otepaa","Kambja","Kanepi","Kastre","Luunja","Rae","Tartu","Elva","Puhja","Rannu","Sangaste","Oksa","Haanja","Misso","Rouge","Varstu","Mokra"],

  "krasnojarsk-khanty": ["Krasnoyarsk","Yeniseisk","Lesosibirsk","Igarka","Dudinka","Norilsk","Turukhansk","Bor","Yarzevo","Kazachinsk","Bolshaya Murta","Yenisey River","Podkamennaya","Strelka","Vorogovo","Surikha","Bakhta","Goroshikha","Lebed","Maklak","Potapova","Ust-Port"],

  "kudymkar-inva": ["Kudymkar","Kocha","Velva","Kosa","Yurla","Parma","Onokhino","Belozerka","Kudymkar-Inva","Gainy","Kochyovskoye","Koslan","Bolshekochinsky","Doyur","Snytury","Kuvandyk","Beryozovka","Maykor","Ocher","Nytva","Krasnokamsk","Vereshchagino"],

  "kukkuzi": ["Kukkuzi","Votic","Ivankovo","Kattila","Luutsa","Liivtšülla","Jõgiperä","Alutaguse","Vaivara","Jõhvi","Toila","Narva-Jõesuu","Iisaku","Kukruse","Ontika","Oru","Purtse","Puhajoe","Saka","Sompa","Tammiku","Tudulinna","Alutaguse"],

  "kven": ["Tromsø","Bardu","Målselv","Nordreisa","Kvænangen","Skjervøy","Storfjord","Lyngen","Kåfjord","Alta","Porsanger","Kautokeino","Nesseby","Tana","Vadsø","Sør-Varanger","Ruija","Paatsjoki","Neiden","Bugøynes","Vesterålen","Bodø","Narvik"],

  "likrisovskoe": ["Nizhnevartovsk","Surgut","Megion","Langepas","Vakh","Vasyugan","Agan","Tromygan","Ust-Balyk","Malij Jugan","Tremjugan","Likrisovskoe","Salym","Korlik","Varyogan","Pokachi","Lyantor","Pyt-Yakh","Nefteyugansk","Kogalym","Bely Yar","Uray","Kholmogory"],

  "livonian": ["Mazirbe","Kolka","Dundaga","Roja","Ventspils","Pitrags","Saunags","Lielirbe","Sikrags","Jūrkalne","Liepāja","Riga","Daugavgrīva","Jūrmala","Salacgrīva","Ainaži","Pāvilosta","Užava","Sārnate","Valmiera","Cēsis","Sigulda"],

  "lower-inva": ["Kudymkar","Kocha","Velva","Kosa","Yurla","Parma","Onokhino","Belozerka","Gainy","Kochyovskoye","Koslan","Bolshekochinsky","Doyur","Snytury","Beryozovka","Maykor","Ocher","Nytva","Krasnokamsk","Vereshchagino","Kirovo-Chepetsk","Glazov","Vyatka"],

  "ludic": ["Mikhaylovskoye","Kondopoga","Girvas","Gomselga","Latva-Vetka","Selgy","Tivdija","Shuya","Krokhino","Besovets","Sennaya","Gabselga","Unitskaya","Kedrozero","Svyatozero","Vygozero","Shcheleyki","Shoksha","Pudozh","Onega","Belomorsk","Kem"],

  "malij-jugan": ["Malij Jugan","Nizhnevartovsk","Surgut","Tremjugan","Vakh","Vasyugan","Agan","Tromygan","Ust-Balyk","Salym","Korlik","Varyogan","Yugan","Kinchany","Bely Yar","Kholmogory","Nefteyugansk","Kogalym","Lyantor","Pyt-Yakh","Pokachi","Uray","Megion"],

  "mator-proper": ["Abakan","Minusinsk","Kyzyl","Sayansk","Chernogorsk","Ust-Abakan","Tashtyp","Askiz","Shira","Bograd","Samagaltai","Erzin","Kaa-Khem","Chadan","Teeli","Balgazyn","Todzha","Kara-Khem","Balgazyn","Uyuk","Elegest","Kazanovka"],

  "me-nkieli": ["Tornio","Haparanda","Pello","Övertorneå","Ylitornio","Kolari","Pajala","Överkalix","Kalix","Luleå","Gällivare","Jokkmokk","Arvidsjaur","Boden","Älvsbyn","Robertsfors","Skellefteå","Umeå","Vindeln","Norsjö","Burträsk","Vännäsby"],

  "moksha": ["Saransk","Krasnoslobodsk","Temnikov","Kovylkino","Insar","Kadoshkin","Yelnik","Torbeevo","Bolshiye Berezniki","Mokshaney","Zubova Polyana","Nizhny Lomov","Narovchat","Spassk","Vadinsk","Kerzha","Pochinki","Krasnaya Presnya","Ulyanovka","Selishche","Atyashevo","Chamzinka"],

  "muromian": ["Murom","Vladimir","Kovrov","Gus-Khrustalny","Vyazniki","Gorokhovets","Melenki","Sudogda","Muromsky","Kameshkovo","Selivanovo","Mordves","Tuma","Krasnooktyabrsky","Dmitriyevo","Varstukhovo","Navashino","Kulebaki","Vyksa","Nizhny Novgorod","Dzerzhinsk","Bogorodsk","Arzamas"],

  "nganasan": ["Ust-Avan","Volochanka","Khatanga","Novaya","Nosok","Dudinka","Tukhard","Potapovo","Syndassko","Bikada","Kresty","Imangda","Dikson","Karaul","Malaya Kheta","Balan","Boyarka","Kapchuk","Uolyk","Khotochokha","Zimnyaya","Taimyr"],

  "nizyam": ["Berezovo","Kazym","Nizyam","Sorum","Punsi","Atlym","Vosh","Yasunt","Khulgor","Khothlor","Yagilyakh","Urmanny","Tegi","Kondes","Shorsh","Yelakh","Niyaksor","Korlkgan","Vanzetur","Pitlyar","Loymot","Kanglym"],

  "north-estonian": ["Tallinn","Kohtla-Järve","Narva","Sillamäe","Jõhvi","Kiviõli","Paldiski","Rakvere","Tapa","Kunda","Haljala","Võsu","Kuusalu","Loksa","Maardu","Viimsi","Jägala","Koogi","Kloogaranna","Padise","Vasalemma","Keila"],

  "north-vagilsk": ["Berezovo","Kazym","Sorum","Nyaksimvol","Khanty-Mansiysk","Nyagan","Beloyarsky","Oktyabrskoye","Krasnoleninsky","Nizhnevartovsk","Surgut","Sortiral","Yakha","Tapkhylor","Torm","Nyalinskoye","Vanzetour","Cherlakh","Khortinskoye","Putur","Leushi","Yary"],

  "northern-botnian": ["Luleå","Piteå","Boden","Älvsbyn","Kalix","Haparanda","Pajala","Överkalix","Gällivare","Jokkmokk","Arvidsjaur","Skellefteå","Norsjö","Robertsfors","Vindeln","Burträsk","Malå","Sorsele","Storuman","Vilhelmina","Dorotea","Åsele"],

  "northern-erzya": ["Saransk","Ruzayevka","Lyambir","Bolshiye Berezniki","Krasnoslobodsk","Temnikov","Kovylkino","Insar","Atyashevo","Chamzinka","Dubrovka","Ladushkino","Kadomkino","Kochkurovo","Staroye Shaygurovo","Staroye Ardashevo","Shiringushi","Kepyalya","Yelnik","Torbeevo","Zubova Polyana","Kadoshkin"],

  "northern-karelian": ["Kostomuksha","Kalevala","Louhi","Kem","Kondopoga","Petrozavodsk","Chupa","Nadvoitsy","Porso","Pialma","Girvas","Khibiny","Belomorsk","Shuya","Ozero","Krokhino","Pudozh","Sortavala","Medvezhyegorsk","Padany","Vendury","Sukkozero"],

  "northern-ludic": ["Mikhaylovskoye","Kondopoga","Girvas","Gomselga","Selgy","Tivdija","Shuya","Krokhino","Besovets","Sennaya","Gabselga","Unitskaya","Kedrozero","Svyatozero","Pudozh","Onega","Belomorsk","Vygozero","Shcheleyki","Shoksha","Latva-Vetka","Kem"],

  "northern-selkup": ["Krasnoselkup","Tazovsky","Nakhodka","Farkovo","Ivantsevo","Kellog","Gaz-Sale","Naftokhanka","Sidorovsk","Matrosovo","Tukhard","Kazym","Urengoy","Purpe","Tarko-Sale","Korpokh","Venga","Payakha","Ngarka","Yamsovey","Toholyam","Sabyda"],

  "per-pohjola": ["Kemi","Tornio","Haparanda","Rovaniemi","Kemijärvi","Sodankylä","Kittilä","Muonio","Enontekiö","Pello","Kolari","Ylitornio","Övertorneå","Utsjoki","Inari","Karigasniemi","Kaunispää","Näätämö","Sevetjärvi","Ivalojoki","Tankavaara","Vuotisdrivi"],

  "pori-region": ["Pori","Rauma","Ulvila","Harjavalta","Nakkila","Luvia","Kullaa","Kodisjoki","Huittinen","Kokemäki","Eurajoki","Laitila","Kirstila","Köyliö","Vampula","Säkylä","Eura","Olrkkö","Kuuvanvaara","Kullervonkylä","Hinnerjoki","Honkilahti"],

  "proper-southeastern": ["Lappeenranta","Imatra","Joutseno","Ruokolahti","Rautjärvi","Parikkala","Simpele","Säkkijärvi","Käkisalmi","Kurkijoki","Hiitola","Sortavala","Karmala","Korisea","Salmi","Pyhäjärvi","Suistamo","Suojärvi","Porajärvi","Paatene","Leukasmäki","Kollaa"],

  "proto-finnic": ["Helsinki","Tallinn","Tartu","Turku","Tampere","Oulu","Kuopio","Lahti","Pori","Vaasa","Joensuu","Lappeenranta","Hämeenlinna","Jyväskylä","Porvoo","Rovaniemi","Espoo","Vantaa","Kokkola","Savonlinna","Kajaani","Kerava"],

  "proto-hungarian": ["Budapest","Debrecen","Szeged","Miskolc","Pécs","Győr","Nyíregyháza","Kecskemét","Székesfehérvár","Szombathely","Szolnok","Eger","Tatabánya","Kaposvár","Békéscsaba","Zalaegerszeg","Veszprém","Sopron","Dunaújváros","Hódmezővásárhely","Nagykanizsa","Salgótarján"],

  "proto-karelian": ["Petrozavodsk","Sortavala","Kondopoga","Kem","Belomorsk","Kostomuksha","Pudozh","Medvezhyegorsk","Kalevala","Louhi","Olonets","Väinölä","Salmi","Suoyarvi","Padany","Vedlozero","Essoila","Krokhino","Chalna","Svyatozero","Kedrozero","Shuya"],

  "proto-mari": ["Yoshkar-Ola","Kozmodemyansk","Volzhsk","Zvenigovo","Orshanka","Kilemary","Mari-Turek","Morki","Paranga","Sovetsky","Yurino","Cheboksary","Krasnogorsky","Pemba","Sheremetyevsky","Nem","Kokshaysk","Karaksha","Aylat","Bolshoy Luy","Cheremshank","Karasorka"],

  "proto-ob-ugric": ["Khanty-Mansiysk","Berezovo","Kazym","Nizhnevartovsk","Surgut","Nyagan","Beloyarsky","Kogalym","Langepas","Tromygan","Vasyugan","Agan","Yugan","Kholmogory","Nefteyugansk","Uray","Izilim","Pyt-Yakh","Pokachi","Lyantor","Megion","Korlik","Varyogan"],

  "proto-permic": ["Syktyvkar","Ukhta","Pechora","Kudymkar","Komi-Permyak","Kortkeros","Ust-Kulom","Izhma","Vorkuta","Inta","Usinsk","Nizhnyaya Omra","Mikun","Yarega","Visinga","Chinyaveryk","Garevo","Kylud","Snytury","Glazov","Kirovo-Chepetsk","Vyatka","Ocher"],

  "proto-samoyedic": ["Salekhard","Narjan-Mar","Tazovsky","Novy Urengoy","Nadym","Aksarka","Labytnangi","Kharp","Yar-Sale","Panaevsk","Taz","Urengoy","Purpe","Tarko-Sale","Gaz-Sale","Novy Port","Mys Kamenny","Krasnoselkup","Nakhodka","Farkovo","Ivantsevo","Kellog"],

  "proto-uralic": ["Komi","Udmurt","Mari","Mordvin","Khanty","Mansi","Hungarian","Finnish","Estonian","Sami","Nenets","Karelian","Veps","Votic","Livonian","Ingrian","Voro","Seto","Kven","Meankieli","Enets","Nganasan","Selkup"],

  "salym-khanty": ["Nizhnevartovsk","Surgut","Salym","Pyt-Yakh","Nefteyugansk","Kogalym","Lyantor","Megion","Langepas","Pokachi","Uray","Bely Yar","Agan","Tromygan","Ust-Balyk","Yugan","Kinchany","Kholmogory","Varyogan","Korlik","Malij Jugan","Tremjugan"],

  "savonlinna": ["Savonlinna","Kerimäki","Punkaharju","Sääminki","Rantasalmi","Enonkoski","Kuopio","Siilinjärvi","Juankoski","Kaavi","Tuusniemi","Outokumpu","Polvijärvi","Liperi","Rääkkylä","Kitee","Tohmajärvi","Kesälahti","Juva","Mikkeli","Haukivuori","Kangasniemi"],

  "semisjaur-njarg": ["Arjeplog","Arvidsjaur","Sorsele","Storuman","Vilhelmina","Dorotea","Åsele","Malå","Norsjö","Jokkmokk","Gällivare","Hällnäs","Lycksele","Vindeln","Umeå","Skellefteå","Piteå","Luleå","Boden","Rörback","Tärnaby","Hemavan"],

  "soikkola": ["Kingisepp","Koporje","Soikkola","Ivangorod","Gatchina","Volosovo","Slantsy","Väykatky","Kellomäki","Somerikkö","Kyyrölä","Keltto","Lempaala","Hietamäki","Pöllölä","Tyrö","Kupanitsa","Spankkova","Venjoki","Mikkola","Lomonosov","Narva"],

  "southeastern-erzya": ["Saransk","Ruzayevka","Bolshiye Berezniki","Krasnoslobodsk","Temnikov","Kovylkino","Insar","Atyashevo","Chamzinka","Lyambir","Kochkurovo","Dubrovka","Ladushkino","Staroye Shaygurovo","Kadoshkin","Yelnik","Torbeevo","Zubova Polyana","Mokshaye","Shiringushi","Kepyalya","Kadomkino"],

  "southern-botnian": ["Umeå","Vännäs","Bygdeå","Norrby","Robertsfors","Skellefteå","Burträsk","Norsjö","Kågedalen","Bjurholm","Vindeln","Västerbotten","Degerfors","Holmön","Sävar","Böle","Ersmark","Fällfors","Risböl","Lövånger","Jörn","Klara"],

  "southern-great-plain": ["Kecskemét","Cegléd","Nagykőrös","Szolnok","Debrecen","Hódmezővásárhely","Békéscsaba","Gyula","Orosháza","Szentes","Csongrád","Makó","Kiskunhalas","Kiskunmajsa","Jászberény","Karcag","Kunhegyes","Tiszafüred","Mezőtúr","Túrkeve","Fegyvernek","Kenderes"],

  "southern-karelian": ["Sortavala","Olonets","Pitkyaranta","Lakhdenpokhya","Suoyarvi","Kurkijoki","Hiitola","Salmi","Pyhäjärvi","Rautu","Kaskinen","Säkkijärvi","Impilahti","Sääminki","Kiteen","Tohmajärvi","Kesälahti","Uukuniemi","Vuoksa","Kilpola","Rasivuori","Manssila"],

  "southern-selkup": ["Nakhodka","Farkovo","Ivantsevo","Kellog","Tazovsky","Tarko-Sale","Purpe","Krasnoselkup","Gaz-Sale","Naftokhanka","Sidorovsk","Matrosovo","Urengoy","Venga","Payakha","Ngarka","Yamsovey","Toholyam","Sabyda","Korpokh","Kazym","Kollta"],

  "southern-transdanubian": ["Pécs","Kaposvár","Nagykanizsa","Zalaegerszeg","Szombathely","Sopron","Veszprém","Tapolca","Balatonfüred","Keszthely","Hévíz","Zirc","Ajka","Pápa","Devecser","Csorna","Kapuvár","Sárvár","Celldömölk","Jánosháza","Körmend","Vasvár"],

  "southwestern-finnish": ["Turku","Naantali","Pargas","Kustavi","Rymättylä","Velkua","Merimasku","Askainen","Lieto","Aura","Paimio","Sauvo","Kemio","Dragsfjärd","Västanfjärd","Karis","Raseborg","Ekenäs","Pohja","Kimitoön","Salo","Somero"],

  "tavastian": ["Hämeenlinna","Riihimäki","Hattula","Hauho","Kalvola","Lammi","Renko","Hauha","Tyrväntö","Vanaja","Janakkala","Tammela","Humppila","Forssa","Jokioinen","Somero","Ypäjä","Kyrö","Miekka","Perttilä","Kuuma","Eväkkä"],

  "tavda": ["Tavda","Turinsk","Verkhoturye","Krasnoturinsk","Karpinsk","Serov","Nevyansk","Nizhny Tagil","Kushva","Verkh-Neyvinsk","Revdinsk","Kirovgrad","Alapayevsk","Asbest","Berezovsky","Verkhnaya Pyshma","Sredneuralsk","Polevskoy","Syserot","Chrysostom","Isetskoye","Shilovsk"],

  "taygi": ["Krasnoyarsk","Minusinsk","Kyzyl","Abakan","Sayansk","Chernogorsk","Ust-Abakan","Tashtyp","Askiz","Shira","Bograd","Ermakovskoye","Shushenskoye","Karatzag","Tuva","Todzha","Kaa-Khem","Chadan","Teeli","Samagaltai","Erzin","Kyzyl-Khaya"],

  "torne-sami": ["Tornio","Haparanda","Pello","Övertorneå","Ylitornio","Kolari","Muonio","Kittilä","Enontekiö","Kautokeino","Karasjok","Alta","Rovaniemi","Sodankylä","Inari","Utsjoki","Neiden","Seidet","Polmak","Leavsnjarga","Bugøynes","Skipagurra"],

  "tornio": ["Tornio","Haparanda","Kemi","Keminmaa","Tervola","Simo","Ylitornio","Övertorneå","Pello","Kolari","Rovaniemi","Kemijärvi","Sodankylä","Pelkosenniemi","Savukoski","Kittilä","Muonio","Enontekiö","Pajala","Överkalix","Kalix","Luleå"],

  "transylvanian-plain": ["Cluj-Napoca","Turda","Dej","Gherla","Huedin","Campia Turzii","Aghires","Feleacu","Gilau","Bontida","Someseni","Apc","Baisoara","Calatele","Margau","Riscuta","Vlaha","Luna","Ciurila","Plosco","Cojocna","Corneni"],

  "tremjugan": ["Tremjugan","Nizhnevartovsk","Malij Jugan","Surgut","Vakh","Vasyugan","Agan","Tromygan","Ust-Balyk","Salym","Korlik","Varyogan","Yugan","Kinchany","Bely Yar","Kholmogory","Nefteyugansk","Kogalym","Lyantor","Pyt-Yakh","Pokachi","Uray","Megion"],

  "tundra-nenets": ["Salekhard","Narjan-Mar","Tazovsky","Novy Urengoy","Nadym","Aksarka","Labytnangi","Yar-Sale","Panaevsk","Taz","Urengoy","Purpe","Tarko-Sale","Gaz-Sale","Novy Port","Mys Kamenny","Krasnoselkup","Nakhodka","Farkovo","Ivantsevo","Kellog","Kharp"],

  "tura": ["Tura","Baykit","Kuyumba","Vanavara","Chunoyar","Sobolyevsky","Strelka-Chunoyar","Tayozhny","Kochetka","Yuzhno-Yeniseisk","Nizhnyaya Tunguska","Podkamennaya Tunguska","Bakhto","Nidym","Kislokan","Chirinda","Ekonda","Tutonchany","Vivi","Sayansk","Uchami","Kheveren"],

  "udora": ["Syktyvkar","Ukhta","Pechora","Izhma","Ust-Tsilema","Ust-Kulom","Koygorodok","Nizhnyaya Omra","Kortkeros","Mikun","Yarega","Visinga","Chinyaveryk","Garevo","Kylud","Snytury","Verkhnyaya Omra","Kushva","Glazov","Kirovo-Chepetsk","Vyatka","Sosnogorsk","Vorkuta"],

  "upper-demjanka": ["Surgut","Nizhnevartovsk","Berezovo","Beloyarsky","Nyagan","Kogalym","Langepas","Tromygan","Vasyugan","Agan","Yugan","Kholmogory","Nefteyugansk","Demjanka","Upper Demjanka","Uray","Izilim","Pyt-Yakh","Pokachi","Lyantor","Megion","Korlik","Varyogan"],

  "upper-konda": ["Khanty-Mansiysk","Nizhnevartovsk","Surgut","Berezovo","Beloyarsky","Upper Konda","Nyagan","Kogalym","Langepas","Pokachi","Pyt-Yakh","Uray","Izilim","Oktyabrskoye","Krasnoleninsky","Cherlakh","Salianka","Tremtam","Akne","Pitlyar","Yeryomino","Khortinskoye","Vanzetour"],

  "upper-sysola": ["Syktyvkar","Ukhta","Pechora","Izhma","Upper Sysola","Koygorodok","Ust-Kulom","Ust-Tsilema","Vorkuta","Inta","Usinsk","Nizhnyaya Omra","Kortkeros","Mikun","Yarega","Visinga","Chinyaveryk","Garevo","Kylud","Snytury","Verkhnyaya Omra","Kushva","Kommunist"],

  "upper-vychegda": ["Syktyvkar","Ukhta","Pechora","Upper Vychegda","Sosnogorsk","Koygorodok","Ust-Kulom","Ust-Tsilema","Vorkuta","Inta","Usinsk","Nizhnyaya Omra","Kortkeros","Mikun","Yarega","Visinga","Chinyaveryk","Garevo","Kylud","Snytury","Verkhnyaya Omra","Kushva","Aykina"],

  "vadey": ["Ust-Avan","Volochanka","Khatanga","Novaya","Nosok","Dudinka","Tukhard","Potapovo","Syndassko","Bikada","Kresty","Imangda","Dikson","Karaul","Malaya Kheta","Balan","Boyarka","Kapchuk","Uolyk","Khotochokha","Zimnyaya","Taimyr"],

  "vakh": ["Nizhnevartovsk","Vakh","Vasyugan","Agan","Tromygan","Ust-Balyk","Salym","Korlik","Varyogan","Yugan","Kinchany","Bely Yar","Surgut","Kholmogory","Nefteyugansk","Kogalym","Lyantor","Pyt-Yakh","Pokachi","Uray","Megion","Langepas","Malij Jugan"],

  "veps": ["Shyoltozero","Rybreka","Shelga","Vinnitsy","Shugozero","Pudozh","Onega","Belomorsk","Kem","Kondopoga","Petrozavodsk","Kallio","Ozero","Ponalaksha","Pella","Padanos","Yaroslav","Kuytozero","Kimozero","Kaskeselga","Kukselga","Gabselga","Megrega"],

  "vishera": ["Khanty-Mansiysk","Berezovo","Kazym","Sorum","Vishera","Nyaksimvol","Nyagan","Beloyarsky","Oktyabrskoye","Krasnoleninsky","Nizhnevartovsk","Surgut","Sortiral","Yakha","Tapkhylor","Torm","Nyalinskoye","Vanzetour","Cherlakh","Khortinskoye","Putur","Leushi","Yary"],

  "v-ro": ["Voru","Rapina","Polva","Vastselina","Otepaa","Kambja","Kanepi","Kastre","Luunja","Rae","Tartu","Elva","Puhja","Rannu","Sangaste","Oksa","Haanja","Misso","Rouge","Varstu","Mokra","Moksamaa","Tsooru"],

  "western-erzya": ["Saransk","Ruzayevka","Kovylkino","Insar","Temnikov","Krasnoslobodsk","Bolshiye Berezniki","Zubova Polyana","Torbeevo","Yelnik","Kadoshkin","Staroye Shaygurovo","Lyambir","Kochkurovo","Atyashevo","Chamzinka","Mokshaye","Nizhny Lomov","Narovchat","Spassk","Vadinsk","Kerzha","Selishche"],

  "western-mansi": ["Khanty-Mansiysk","Berezovo","Kazym","Sorum","Nyaksimvol","Nyagan","Beloyarsky","Oktyabrskoye","Krasnoleninsky","Nizhnevartovsk","Surgut","Sortiral","Yakha","Tapkhylor","Torm","Nyalinskoye","Vanzetour","Cherlakh","Khortinskoye","Putur","Leushi","Yary","Vosh"]
};
module.exports = { EURASIA2_DB };
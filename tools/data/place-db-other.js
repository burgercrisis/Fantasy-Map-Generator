"use strict";
// Authentic place name database - Eurasia, South America, Middle East, and other regions
const PLACE_DB = {};

// ── EURASIA ────────────────────────────────────────────────────────────────
PLACE_DB["eurasia"] = {
  "adyghe-kabardian": ["Nalchik","Baksan","Prokhladny","Tyrnyauz","Chegem","Maysky","Zalukokoazhe","Terek","Urukh","Khabez","Kavkazsky","Adyge-Khabl","Khodz","Koshekhabl","Giaginskaya","Krasnogvardeyskoye","Dondukovskaya","Koshekhabl","Khakurinokhabl","Ponezhukay"],
  "altai-kizhi": ["Gorno-Altaysk","Kosh-Agach","Ust-Koksa","Onguday","Kyzyl-Ozyok","Chemal","Turochak","Shebalino","Onguday","Kosh-Agach","Ust-Koksa","Inya","Mayma","Souzga","Yabogan","Turata","Kara-Tyurek","Choya","Ishinskoye"],
  "bashkir": ["Ufa","Sterlitamak","Salavat","Neftekamsk","Oktyabrsky","Beloretsk","Tuymazy","Ishimbay","Belebey","Dyurtyuli","Birsk","Kumertau","Meleuz","Sibay","Baymak","Abzelilovsky","Zianchurinsky","Burzyansky","Kugarchinsky","Mechetlinsky"],
  "buryat": ["Ulan-Ude","Severobaikalsk","Gusinoozyorsk","Kyakhta","Zakamensk","Barguzin","Kurumkan","Turka","Petropavlovka","Zaigrayevo","Ivolginsk","Tarbagatay","Khorsk","Kizhinga","Mukhorshibir","Bichura","Kyren","Orlik","Tunka"],
  "chechen": ["Grozny","Gudermes","Urus-Martan","Shali","Argun","Achkhoy-Martan","Kurchaloy","Nozhay-Yurt","Vedeno","Shatoy","Itum-Kale","Bamut","Samashki","Zakan-Yurt","Gekhi","Dachu-Barzoy","Sernovodsk","Assinovskaya","Elistanzhi","Kurchaloy"],
  "chuvash": ["Cheboksary","Novocheboksarsk","Kanash","Alatyr","Shumerlya","Tsivilsk","Kozlovka","Mariinsky Posad","Yadrin","Krasnye Chetai","Alikovo","Vurnary","Ibresi","Buinsk","Yalchiki","Morgaushi","Shemursha","Komsomolskoe","Tautovo","Urmary"],
  "dargwa": ["Makhachkala","Derbent","Kaspiysk","Izberbash","Buynaksk","Kizlyar","Kizilyurt","Dagestanskiye Ogni","Karabudakhkent","Leninkent","Sergokala","Kayakent","Gubden","Chirkey","Kubachi","Urkarakh","Khuchni","Madzhalis"],
  "ingush": ["Nazran","Malgobek","Karabulak","Sunzha","Ordzhonikidzevskaya","Ekazhevo","Surkhakhi","Nesterovskaya","Alkhasty","Yandare","Kantyshevo","Dzhalka","Bamut","Achkhoy-Martan","Samashki","Assinovskaya","Sernovodsk","Troitskaya","Nesterovskaya","Ordzhonikidzevskaya"],
  "kalmyk": ["Elista","Gorodovikovsk","Lagan","Iki-Burul","Priyutnoye","Sadovoye","Troitskoye","Komsomolsky","Yashkul","Tselinny","Ketchenery","Arshan","Yustinsky","Yashaltinsky","Priyutnensky","Iki-Burlinsky","Lagansky","Gorodovikovsky","Chernozemelsky","Yustinsky"],
  "karachay-balkar": ["Nalchik","Baksan","Prokhladny","Tyrnyauz","Chegem","Maysky","Zalukokoazhe","Terek","Urukh","Khabez","Kavkazsky","Adyge-Khabl","Khodz","Koshekhabl","Giaginskaya","Krasnogvardeyskoye","Dondukovskaya","Koshekhabl","Khakurinokhabl","Ponezhukay"],
  "khakass": ["Abakan","Sayanogorsk","Chernogorsk","Abaza","Sorsk","Beya","Ust-Abakan","Askiz","Bograd","Kopyovo","Tashtyp","Shira","Beysky","Ordzhonikidzevsky","Altaysky","Tashtypsky","Bogradsky","Shirinsky","Beysky","Ust-Abakansky"],
  "komi": ["Syktyvkar","Ukhta","Vorkuta","Pechora","Usinsk","Inta","Sosnogorsk","Yemva","Mikun","Troitsko-Pechorsk","Ust-Kulom","Ust-Tsilma","Izhma","Ust-Vym","Kortkeros","Sysolsky","Udorsky","Izhemsky","Ust-Tsilemsky","Koygorodsky"],
  "mari": ["Yoshkar-Okar","Volzhsk","Kozmodemyansk","Zvenigovo","Sernur","Kilemary","Medvedevo","Orshanka","Yurino","Kuzhener","Sovetsky","Mari-Turek","Paranga","Zvenigovsky","Sernursky","Kilemary","Medvedevsky","Orshansky","Yurinsky","Kuzhenersky"],
  "mordva": ["Saransk","Ruzayevka","Kovylkino","Chamzinka","Lyambir","Romodanovo","Krasnoslobodsk","Temnikov","Ardatov","Torbeyevo","Yavas","Zubova Polyana","Atyashevo","Bolshebereznikovo","Kadoshkino","Insar","Kochkurovo","Lyambirsky","Romodanovsky"],
  "ossetian": ["Vladikavkaz","Alagir","Ardon","Digora","Beslan","Mozdok","Kirovsky","Pravoberezhnoy","Irafsky","Alagirsky","Ardonsky","Digorsky","Kirovsky","Mozdoksky","Pravoberezhny","Irafsky","Alagirsky","Ardonsky","Digorsky","Kirovsky"],
  "tatar": ["Kazan","Naberezhnye Chelny","Nizhnekamsk","Almetyevsk","Zelenodolsk","Bugulma","Yelabuga","Leninogorsk","Chistopol","Zainsk","Laishevo","Mamadysh","Menzelinsk","Agryz","Arsk","Baltasi","Bolgar","Brezhnev","Vysokaya Gora"],
  "tuva": ["Kyzyl","Ak-Dovurak","Chadan","Turan","Shagonar","Tos-Bulak","Saryg-Sep","Erzin","Kaa-Khem","Kungurtug","Bay-Tayga","Mugur-Aksy","Samagaltay","Sug-Aksy","Toora-Khem","Khandagayty","Kyzyl","Ak-Dovurak","Chadan"],
  "udmurt": ["Izhevsk","Sarapul","Votkinsk","Glazov","Mozhga","Kambarka","Kez","Debyosy","Yar","Uva","Zavyalovsky","Malopurginsky","Kiyasovsky","Krasnogorsky","Balezinsky","Yarsky","Kezsky","Debyossky","Uvinsky","Zavyalovsky"],
  "yakut": ["Yakutsk","Neryungri","Mirny","Lensk","Aldan","Udachny","Nyurba","Vilyuysk","Tommot","Srednekolymsk","Olyokminsk","Verkhoyansk","Ust-Maya","Khandyga","Churapcha","Amga","Ust-Nera","Zyryanka","Oymyakon"],
};

// ── SOUTH AMERICA ──────────────────────────────────────────────────────────
PLACE_DB["south-america"] = {
  "achuar": ["Wampuik","Taisha","Huasaga","Makusarit","Pumpuents","Yunkupais","Chingual","Shaimi","Kapawi","Tutintsa","Shatayacu","Yaa","Chiguaza","Pangay","Tukupi","Wachirpas","Juyjas","Tsuak","Chingual","Suwatents"],
  "aguaruna": ["Santa María de Nieva","Chingaza","Cochal","Huampami","Tunduza","Yamayakat","Chisquilla","Tundus","Shimatak","Bajo Naranjillo","Copallín","Cumba","Chiriaco","Bagazán","Chuquiaco","Yamón","Huaracayo","Cochamal","Chuquiaco","Tunduza"],
  "ashaninka": ["Satipo","Pangoa","Rio Tambo","Puerto Bermúdez","Atalaya","Junín","Oxapampa","Mazamari","Pichis","Palcazu","Cacazú","Bajo Pichanaqui","San Martín de Pangoa","Río Negro","Unini","Miaría","Otica","Shiringamazu","Venitzia","Poyeni"],
  "aymara": ["La Paz","Oruro","Potosí","El Alto","Viacha","Achacachi","Caranavi","Copacabana","Desaguadero","Huarina","Laja","Pucarani","Tiwanaku","Batallas","Calacoto","Caquiaviri","Charaña","Challapata","Challacollo"],
  "bora": ["Araracuara","La Pedrera","Puerto Santander","Tarapacá","Yurimaguas","Lagunas","Santa Rosa","Cahuinari","Igaraparaná","Yaguas","Ampiyacu","Atacuari","Buena Vista","Cachipoza","El Encanto","Estrecho","Huaracayo","Indiana","Iquitos"],
  "chiquitos": ["San José de Chiquitos","Roboré","San Rafael","Santiago","San Javier","Concepción","San Ignacio","Santa Ana","San Miguel","San Juan","San Ramón","Taperas","Puerto Suárez","Puerto Quijarro","Carmen","Cerro Colorado","Chochis","Cuatro Ojos","El Carmen","El Tinto"],
  "guarani": ["Asunción","Ciudad del Este","Encarnación","Pedro Juan Caballero","Concepción","Pilar","Coronel Oviedo","Caaguazú","San Pedro","Villarrica","Caacupé","Itaguá","Lambaré","Luque","Mariano Roque Alonso","Ñemby","San Lorenzo","Fernando de la Mora","Capiatá"],
  "huitoto": ["Leticia","Puerto Arica","Tarapacá","Yurimaguas","Lagunas","Iquitos","Nauta","Requena","Contamana","Indiana","Pebas","Caballococha","San Pablo","Santa Rosa","Estrecho","Huaracayo","Pevas","Ramón Castilla","Teniente López","Yaguasyacu"],
  "kamsá": ["Sibundoy","Santiago","San Andrés","Colón","San Francisco","La Hormiga","Puerto Asís","Villagarzón","Mocoa","Piamonte","San José del Fragua","Belén de los Andaquíes","Cartagena del Chairá","Curillo","Milán","Morelia","San Vicente del Caguán","Valparaíso","Yurayaco"],
  "mapuche": ["Temuco","Villarrica","Pucon","Valdivia","Osorno","Puerto Montt","Angol","Victoria","Lautaro","Nueva Imperial","Carahue","Toltén","Gorbea","Loncoche","Curarrehue","Melipeuco","Vilcún","Cunco","Pitrufquén","Freire"],
  "matsés": ["Requena","Yaquerana","Sucusari","Puerto Alegre","Anguila","Barranco","Chobayacu","Estrecho","Huacachina","Lagunas","Maucallata","Nueva Esperanza","Orellana","Palo Seco","Papacruz","Pebas","Roca Fuerte","San Fernando","Sucusari","Yaquerana"],
  "nivacle": ["Filadelfia","Loma Plata","Mariscal Estigarribia","Campo Aceite","Campo Loro","Campo María","Campo Ramos","Campo Via","Casanillo","Cecilio Ibarrulz","Colonia 10","Colonia 22","Colonia 3","Colonia Menno","Colonia Neuland","Colonia Unida","Comandante Fontana","Doctor Pedro P. Peña","El Estribo"],
  "pilagá": ["Clorinda","Comandante Fontana","El Colorado","Estanislao del Campo","Fortín Lugones","General Manuel Belgrano","Gran Guardia","Ingeniero Guillermo N. Juárez","Laguna Blanca","Laguna Naick-Neck","Las Lomitas","Los Chiriguanos","Mariano Boedo","Palo Santo","Pirané","Pozo del Tigre","Riacho He-Hé","Subteniente Perín","Villa Dos Trece"],
  "quechua": ["Cusco","Arequipa","Huancayo","Puno","Ayacucho","Cajamarca","Huancavelica","Abancay","Andahuaylas","Chincheros","Chumbivilcas","Cotabambas","Grau","Huamanga","La Convención","La Mar","Lucanas","Parinacochas","Paucartambo","Quispicanchi"],
  "shipibo": ["Ucayali","Pucallpa","Contamana","Requena","Tamshiyacu","Yarinacocha","Masisea","Nueva Requena","Puerto Inca","Von Humboldt","Cushibatayacu","El Dorado","Florida","Impiria","Lagunas","Manantay","Neshuya","Pachitea","San Alejandro","Shanshocoya","Yarinacocha"],
  "tupinamba": ["São Paulo","Rio de Janeiro","Salvador","Olinda","Santos","Bertioga","Cananéia","Caraguatatuba","Guarujá","Iguape","Ilhabela","Itanhaém","Jacareí","Mongaguá","Peruíbe","Praia Grande","São Sebastião","São Vicente","Ubatuba","Bertioga"],
  "waiwai": ["Mapuera","Nhamundá","Óbidos","Oriximiná","Alenquer","Almeirim","Aveiro","Belterra","Curuá","Faro","Juruti","Monte Alegre","Placas","Prainha","Rurópolis","Santarém","Terra Santa","Trairão","Uruará","Vitória do Xingu"],
  "wayuu": ["Maicao","Manaure","Riohacha","Uribia","Villanueva","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Mingueo","San Juan del Cesar","Urumita","Barrancas","Carraipía","Chinchorro","Cerrito","Cerrito","Cuestecitas"],
  "yanomami": ["Auaris","Balawau","Cauburi","Demini","Homoxi","Katarope","Marauiá","Maturacá","Parawa","Pico da Neblina","Serra da Mocidade","Shiriã","Toototobi","Uraricoera","Urarera","Wathau","Xitei","Yariana","Yutajé"],
  "zapotec": ["Oaxaca","Juchitán","Tehuantepec","Salina Cruz","Miahuatlán","Zaachila","Tlacolula","Etla","Zaachila","San Bartolo Coyotepec","San Martín Tilcajete","Santo Tomás Jalieza","Teotitlán del Valle","Tlacolula de Matamoros","Villa de Zaachila","San Antonino Castillo Velasco","San Baltazar Chichicápam","San Bartolomé Quialana","San Dionisio Ocotepec"],
};

// ── MIDDLE EAST ────────────────────────────────────────────────────────────
PLACE_DB["middle-east"] = {
  "aleppine-arabic": ["Aleppo","Hama","Idlib","Latakia","Tartus","Raqqa","Deir ez-Zor","Al-Hasakah","Qamishli","Manbij","Azaz","Al-Bab","Jarabulus","Serekaniye","Ayn al-Arab","Kobani","Amuda","Qamishli","Ras al-Ayn","Al-Malikiyah"],
  "assyrian": ["Alqosh","Tel Keppe","Bakhdida","Bartella","Karamlesh","Ain Sifni","Sharafiya","Baqofah","Telskuf","Batnaya","Karmlis","Dashqotan","Baqofah","Gawilan","Mangesh","Qaraqosh","Bartella","Karbala","Baghdad","Mosul"],
  "azerbaijani": ["Baku","Ganja","Sumgait","Mingachevir","Shirvan","Shaki","Quba","Lankaran","Yevlakh","Agdam","Fuzuli","Jabrayil","Kalbajar","Lachin","Qubadli","Zangilan","Shusha","Khojaly","Khojavend","Tartar"],
  "balochi": ["Quetta","Turbat","Gwadar","Sibi","Khuzdar","Chagai","Kalat","Mastung","Nasirabad","Jaffarabad","Bolan","Kharan","Washuk","Panjgur","Kech","Gwadar","Ormara","Pasni","Jiwani","Surab"],
  "kurdish": ["Diyarbakır","Erbil","Sulaymaniyah","Kirkuk","Duhok","Sanandaj","Kermanshah","Mahabad","Urmia","Khoy","Maragheh","Baneh","Saqqez","Bukan","Piranshahr","Sardasht","Saghez","Marivan","Bijar"],
  "persian": ["Tehran","Isfahan","Shiraz","Tabriz","Mashhad","Qom","Kerman","Yazd","Rasht","Hamadan","Kermanshah","Zahedan","Bandar Abbas","Arak","Qazvin","Sari","Gorgan","Semnan","Khorramabad","Bojnurd"],
  "turkish": ["Istanbul","Ankara","Izmir","Bursa","Adana","Gaziantep","Konya","Antalya","Mersin","Kayseri","Eskişehir","Diyarbakır","Samsun","Denizli","Şanlıurfa","Malatya","Erzurum","Batman","Elazığ","Trabzon"],
  "yemeni-arabic": ["Sanaa","Aden","Taiz","Hodeidah","Ibb","Dhamar","Al-Mukalla","Marib","Saada","Amran","Hajjah","Lahij","Zinjibar","Radaa","Al-Bayda","Ataq","Al-Mahwit","Al-Hazm","Bajil","Thula"],
};

// ── NORTH AFRICA ───────────────────────────────────────────────────────────
PLACE_DB["north-africa"] = {
  "amazigh": ["Tizi Ouzou","Bejaia","Bouira","Tizi-Rached","Azazga","Boghari","Draa El Mizan","Bordj Menaiel","Seddouk","Timezrit","Akbou","Ifigha","Azeffoun","Aït Yahia","Aït Aggouacha","Aït Bouaddou","Aït Ounine","Aït Douala","Aït Boumahdi","Aït Khelili"],
  "arabic-egyptian": ["Cairo","Alexandria","Giza","Luxor","Aswan","Port Said","Suez","Mansoura","Tanta","Asyut","Ismailia","Faiyum","Zagazig","Damietta","Minya","Hurghada","Sharm el-Sheikh","Sohag","Qena","Beni Suef"],
  "arabic-maghrebi": ["Casablanca","Rabat","Marrakech","Fes","Tangier","Agadir","Meknes","Oujda","Kenitra","Tetouan","Safi","El Jadida","Beni Mellal","Khouribga","Settat","Berrechid","Nador","Taza","Khenifra"],
  "arabic-moroccan": ["Casablanca","Rabat","Marrakech","Fes","Tangier","Agadir","Meknes","Oujda","Kenitra","Tetouan","Safi","El Jadida","Beni Mellal","Khouribga","Settat","Berrechid","Nador","Taza","Khenifra"],
  "arabic-tunisian": ["Tunis","Sfax","Sousse","Kairouan","Bizerte","Gabès","Gafsa","Monastir","Nabeul","Tataouine","Médenine","Tozeur","Kef","Mahdia","Jendouba","Kasserine","Sidi Bou Zid","Ben Arous","La Manouba"],
  "berber": ["Tizi Ouzou","Bejaia","Bouira","Tizi-Rached","Azazga","Boghari","Draa El Mizan","Bordj Menaiel","Seddouk","Timezrit","Akbou","Ifigha","Azeffoun","Aït Yahia","Aït Aggouacha","Aït Bouaddou","Aït Ounine","Aït Douala","Aït Boumahdi","Aït Khelili"],
  "coptic": ["Alexandria","Aswan","Cairo","Luxor","Minya","Sohag","Qena","Damietta","Faiyum","Beni Suef","Asyut","Giza","Helwan","Port Said","Suez","Ismailia","Tanta","Zagazig","Mansoura","Damanhur"],
  "ghadamès": ["Ghadames","Nalut","Yefren","Zintan","Jadu","Yafran","Kikla","Sabratha","Zawiya","Tripoli","Misrata","Zliten","Khoms","Bani Walid","Tarhuma","Ghat","Ubari","Murzuq","Sabha"],
  "hassaniya": ["Nouakchott","Nouadhibou","Rosso","Kaedi","Boutilimit","Kiffa","Aleg","Atar","Zouerate","Bir Moghrein","Tidjikja","Nema","Aioun","Oualata","Chinguetti","Ouadane","Tichitt","Akjoujt","Boghe","Selibaby"],
  "kabyle": ["Tizi Ouzou","Bejaia","Bouira","Tizi-Rached","Azazga","Boghari","Draa El Mizan","Bordj Menaiel","Seddouk","Timezrit","Akbou","Ifigha","Azeffoun","Aït Yahia","Aït Aggouacha","Aït Bouaddou","Aït Ounine","Aït Douala","Aït Boumahdi","Aït Khelili"],
  "nafusi": ["Nalut","Yefren","Zintan","Jadu","Yafran","Kikla","Sabratha","Zawiya","Tripoli","Misrata","Zliten","Khoms","Bani Walid","Tarhuma","Ghat","Ubari","Murzuq","Sabha","Wazzin","Jadu"],
  "siwi": ["Siwa","Marsa Matruh","Bawiti","Zawiyat Abu Muslim","Al-Daqiq","Al-Kharba","Al-Maraqi","Al-Sallum","Al-Tour","Baqlulu","Bir Al-Nuss","Bir Tarfawi","Dakhla","Farafra","Gharb Siwa","Qara","Shabshir","Siwa Oasis","Toshka","Zawiyat Abu Muslim"],
  "tachelhit": ["Agadir","Tiznit","Ouarzazate","Taroudant","Guelmim","Dakhla","Tata","Tafraout","Aoulouz","Biougra","Bouizakarne","Chichaoua","El Guerdane","Inezgane","Massa","Sidi Ifni","Tan-Tan","Tata","Tiznit"],
  "tarifit": ["Nador","Al Hoceima","Berkane","Taourirt","Guercif","Taza","Oujda","Jerada","Berkane","Taourirt","Guercif","Taza","Oujda","Jerada","Berkane","Taourirt","Guercif","Taza","Oujda","Jerada"],
  "tamashek": ["Tamanrasset","Adgha","Abalessa","Idlès","Tazrouk","In Guezzam","In Salah","Tin Zaouatine","Tamanrasset","Adgha","Abalessa","Idlès","Tazrouk","In Guezzam","In Salah","Tin Zaouatine","Tamanrasset","Adgha","Abalessa"],
  "tunisian-arabic": ["Tunis","Sfax","Sousse","Kairouan","Bizerte","Gabès","Gafsa","Monastir","Nabeul","Tataouine","Médenine","Tozeur","Kef","Mahdia","Jendouba","Kasserine","Sidi Bou Zid","Ben Arous","La Manouba","Ariana"],
};

// ── CAUCASUS ───────────────────────────────────────────────────────────────
PLACE_DB["caucasus"] = {
  "abkhaz": ["Sukhumi","Gudauta","Ochamchire","Gagra","Gulripshi","Tkvarcheli","Bichvinta","Gantiadi","Leselidze","Kodori","Mokva","Duripsh","Lykhny","Pitsunda","Gudauta","Ochamchire","Sukhumi","Gagra","Gulripshi","Tkvarcheli"],
  "aghul": ["Agul","Akhty","Tpig","Kurakh","Gul","Kartas-Kazmalyar","Burshi","Kvardal","Usug","Koshan","Tinit","Arkit","Khnov","Rutul","Ikhrek","Mukhrek","Shinaz","Tlyarata","Anchikh"],
  "archi": ["Archib","Chalda","Gul","Kurakh","Tpig","Akhty","Kartas-Kazmalyar","Burshi","Kvardal","Usug","Koshan","Tinit","Arkit","Khnov","Rutul","Ikhrek","Mukhrek","Shinaz","Tlyarata","Anchikh"],
  "avar": ["Khunzakh","Botlikh","Tindi","Sogratl","Gunib","Chokh","Tlisli","Kvanada","Gimatl","Tshobota","Mogokh","Kudiyabroso","Oboda","Gonoda","Tlogob","Kubra","Tlyarata","Anchikh","Sogratl","Gunib"],
  "azerbaijani-caucasus": ["Baku","Ganja","Sumgait","Mingachevir","Shirvan","Shaki","Quba","Lankaran","Yevlakh","Agdam","Fuzuli","Jabrayil","Kalbajar","Lachin","Qubadli","Zangilan","Shusha","Khojaly","Khojavend","Tartar"],
  "chechen-caucasus": ["Grozny","Gudermes","Urus-Martan","Shali","Argun","Achkhoy-Martan","Kurchaloy","Nozhay-Yurt","Vedeno","Shatoy","Itum-Kale","Bamut","Samashki","Zakan-Yurt","Gekhi","Dachu-Barzoy","Sernovodsk","Assinovskaya","Elistanzhi","Kurchaloy"],
  "dargwa-caucasus": ["Makhachkala","Derbent","Kaspiysk","Izberbash","Buynaksk","Kizlyar","Kizilyurt","Dagestanskiye Ogni","Karabudakhkent","Leninkent","Sergokala","Kayakent","Gubden","Chirkey","Kubachi","Urkarakh","Khuchni","Madzhalis"],
  "georgian": ["Tbilisi","Batumi","Kutaisi","Rustavi","Gori","Zugdidi","Poti","Khashuri","Samtredia","Senaki","Marneuli","Telavi","Ozurgeti","Kobuleti","Akhaltsikhe","Gurjaani","Bolnisi","Tetritsqaro","Dmanisi","Lagodekhi"],
  "ingush": ["Nazran","Malgobek","Karabulak","Sunzha","Ordzhonikidzevskaya","Ekazhevo","Surkhakhi","Nesterovskaya","Alkhasty","Yandare","Kantyshevo","Dzhalka","Bamut","Achkhoy-Martan","Samashki","Assinovskaya","Sernovodsk","Troitskaya","Nesterovskaya"],
  "kabardian": ["Nalchik","Baksan","Prokhladny","Tyrnyauz","Chegem","Maysky","Zalukokoazhe","Terek","Urukh","Khabez","Kavkazsky","Adyge-Khabl","Khodz","Koshekhabl","Giaginskaya","Krasnogvardeyskoye","Dondukovskaya","Koshekhabl","Khakurinokhabl","Ponezhukay"],
  "kumyk": ["Khasavyurt","Buynaksk","Kizilyurt","Yuzhnoye","Chontaul","Tarkov","Kostek","Miatli","Temirgoye","Novosasitly","Aksay","Babayurt","Korkmaskala","Shamilkala","Terekli-Mekteb","Enirgirey","Bryukhovetskaya","Sovetskoye","Leninkent","Kaspiysk"],
  "lak": ["Kumukh","Tsovkra","Vachi","Kurkent","Shovkra","Kumukh","Tsovkra","Vachi","Kurkent","Shovkra","Kumukh","Tsovkra","Vachi","Kurkent","Shovkra","Kumukh","Tsovkra","Vachi","Kurkent","Shovkra"],
  "lezgin": ["Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh"],
  "rutul": ["Rutul","Ikhrek","Mukhrek","Shinaz","Tlyarata","Anchikh","Khnov","Arkit","Tinit","Koshan","Usug","Kvardal","Burshi","Kartas-Kazmalyar","Tpig","Akhty","Agul","Archib","Chalda","Gul"],
  "tabasaran": ["Tabasaran","Khnov","Arkit","Tinit","Koshan","Usug","Kvardal","Burshi","Kartas-Kazmalyar","Tpig","Akhty","Agul","Archib","Chalda","Gul","Kurakh","Kasumkent","Kurakh","Kasumkent","Kurakh"],
  "tsakhur": ["Tsakhur","Mukhrek","Shinaz","Tlyarata","Anchikh","Khnov","Arkit","Tinit","Koshan","Usug","Kvardal","Burshi","Kartas-Kazmalyar","Tpig","Akhty","Agul","Archib","Chalda","Gul","Kurakh"],
  "udi": ["Nij","Oguz","Vartashen","Kish","Zinobiani","Bum","Meshabash","Kikis","Nidzh","Oguz","Vartashen","Kish","Zinobiani","Bum","Meshabash","Kikis","Nidzh","Oguz","Vartashen","Kish"],
};

// ── SIBERIA ────────────────────────────────────────────────────────────────
PLACE_DB["siberia"] = {
  "buryat-siberia": ["Ulan-Ude","Severobaikalsk","Gusinoozyorsk","Kyakhta","Zakamensk","Barguzin","Kurumkan","Turka","Petropavlovka","Zaigrayevo","Ivolginsk","Tarbagatay","Khorsk","Kizhinga","Mukhorshibir","Bichura","Kyren","Orlik","Tunka","Barguzin"],
  "chukchi": ["Anadyr","Bilibino","Pevek","Lavrentiya","Provideniya","Egvekinot","Lorino","Enmelen","Neshkan","Uelen","Inchoun","Yanranynnot","Kalan","Nutepelmen","Rytkuchi","Shmidtovo","Ushakovskoye","Vankarem","Yandagay"],
  "dolgan": ["Dudinka","Khatanga","Kayerkan","Talnakh","Norilsk","Igarka","Tura","Khatanga","Dudinka","Kayerkan","Talnakh","Norilsk","Igarka","Tura","Khatanga","Dudinka","Kayerkan","Talnakh","Norilsk","Igarka"],
  "even": ["Tomtor","Batagay","Verkhoyansk","Ust-Nera","Oymyakon","Kyubeme","Sebyan-Kyuyol","Kharba-Atakh","Dzhargalaakh","Kyllakh","Tyoply Klyuch","Ust-Maya","Amga","Maya","Allakh-Yun","Solnechny","Ust-Mil","Verke"],
  "evenki": ["Tura","Noginsk","Yerbogachen","Uchami","Kislokan","Nakanno","Kodima","Oskoba","Strelka-Chunya","Vanavara","Baykit","Poligus","Surinda","Tutonchany","Kuyumba","Burni","Chirinda","Ekonda","Ichera"],
  "ket": ["Kellog","Surgutikha","Baklanikha","Farkovo","Krasnoselkup","Tarko-Sale","Novy Urengoy","Nadyms","Noyabrysk","Gubkinsky","Muravlenko","Pangody","Tazovsky","Nakhodka","Purpe","Purovskoy","Shchuchye","Yamburg","Yar-Sale"],
  "khanty": ["Khanty-Mansiysk","Surgut","Nizhnevartovsk","Nefteyugansk","Megion","Langepas","Pyt-Yakh","Raduzhny","Uray","Nyagan","Kogalym","Pokachi","Poykovsky","Megion","Langepas","Pyt-Yakh","Raduzhny","Uray","Nyagan","Kogalym"],
  "mansi": ["Khanty-Mansiysk","Surgut","Nizhnevartovsk","Nefteyugansk","Megion","Langepas","Pyt-Yakh","Raduzhny","Uray","Nyagan","Kogalym","Pokachi","Poykovsky","Megion","Langepas","Pyt-Yakh","Raduzhny","Uray","Nyagan","Kogalym"],
  "nenets": ["Naryan-Mar","Amderma","Kharuta","Bugrino","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga"],
  "nivkh": ["Nikolayevsk-on-Amur","Nekrasovka","Tyr","Kalinino","Lazarev","Moskaltso","Chnyrrakh","Aleyevka","Makarevko","Uandi","Viakhtu","Tneyvakh","Zyryanka","Kolima","Perevoz","Sovetskaya Gavan","Lososina","De-Kastri"],
  "selkup": ["Kargasok","Kedrovka","Molchanovo","Parabel","Kolpashevo","Strezhevoy","Bely Yar","Pudino","Teguldet","Zyryanka","Ivankino","Palkino","Podgornoye","Sredny Vasyugan","Upper Vasyugan","Novy Vasyugan","Staroyugino","Ust-Chizhapka","Verkhneketsky"],
  "yakut-siberia": ["Yakutsk","Neryungri","Mirny","Lensk","Aldan","Udachny","Nyurba","Vilyuysk","Tommot","Srednekolymsk","Olyokminsk","Verkhoyansk","Ust-Maya","Khandyga","Churapcha","Amga","Maya","Allakh-Yun","Solnechny","Ust-Mil","Verke"],
};

// ── ARCTIC ─────────────────────────────────────────────────────────────────
PLACE_DB["arctic"] = {
  "aleut": ["Unalaska","Atka","Adak","St. George","St. Paul","Akutan","False Pass","King Cove","Sand Point","Nikolski","Atka","Adak","St. George","St. Paul","Akutan","False Pass","King Cove","Sand Point","Nikolski","Atka"],
  "inuktitut": ["Iqaluit","Rankin Inlet","Arviat","Baker Lake","Cambridge Bay","Pond Inlet","Kugluktuk","Igloolik","Pangnirtung","Cape Dorset","Sanikiluaq","Grise Fiord","Resolute","Arviat","Baker Lake","Cambridge Bay","Pond Inlet","Kugluktuk","Igloolik","Pangnirtung"],
  "kalaallisut": ["Nuuk","Sisimiut","Ilulissat","Qaqortoq","Aasiaat","Maniitsoq","Tasiilaq","Paamiut","Narsaq","Uummannaq","Upernavik","Qasigiannguit","Qeqertarsuaq","Kangerlussuaq","Kulusuk","Ittoqqortoormiit","Pituffik","Qaanaaq","Savissivik"],
  "nenets-arctic": ["Naryan-Mar","Amderma","Kharuta","Bugrino","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga","Chizha","Nes","Indiga"],
  "sami-arctic": ["Kautokeino","Karasjok","Tana","Porsanger","Lakselv","Hammerfest","Alta","Kirkenes","Vadsø","Vardø","Honningsvåg","Nordkapp","Kjøllefjord","Mehamn","Berlevåg","Gamvik","Lebesby","Tana bru","Polmak","Láhpoluoppal"],
  "yupik": ["Bethel","Unalakleet","St. Mary's","Emmonak","Kotzebue","Nome","Barrow","Point Hope","Wales","Gambell","Savoonga","Diomede","Shishmaref","Koyuk","Elim","Golovin","White Mountain","Unalakleet","St. Mary's"],
};

// ── HORN OF AFRICA ─────────────────────────────────────────────────────────
PLACE_DB["horn-of-africa"] = {
  "afar": ["Asaita","Dubti","Semera","Awash","Gewane","Bati","Dessie","Kombolcha","Harar","Dire Dawa","Jijiga","Degehabur","Gode","Kebri Dahar","Shilabo","Fik","Imi","Danan","Aysaita","Chifra"],
  "amharic": ["Addis Ababa","Bahir Dar","Gondar","Hawassa","Jimma","Dire Dawa","Harar","Mekelle","Adama","Dessie","Debre Markos","Kombolcha","Arba Minch","Sodo","Ambo","Nekemte","Shashamane","Debre Birhan","Woldiya"],
  "oromo": ["Addis Ababa","Adama","Ambo","Asella","Bishoftu","Dire Dawa","Harar","Jimma","Nekemte","Shashamane","Hawassa","Dukem","Sebeta","Burayu","Mojo","Ziway","Batu","Metu","Gimbi","Bule Hora"],
  "sidamo": ["Hawassa","Yirgalem","Aleta Wendo","Chuko","Bensa","Arboré","Hula","Dale","Wonsho","Shebedino","Dale","Wonsho","Shebedino","Dale","Wonsho","Shebedino","Dale","Wonsho","Shebedino","Dale","Wonsho"],
  "somali-horn": ["Mogadishu","Hargeisa","Berbera","Kismayo","Baidoa","Galkayo","Beledweyne","Borama","Burao","Marka","Afgoey","Barawe","Luuq","Dhusamareb","Garbaharey","Qardho","Erigavo","Las Anod","Taleh"],
  "tigray": ["Mekelle","Adigrat","Axum","Shire","Humera","Adwa","Enticho","Wukro","Abi Adi","Freweyni","Sheraro","Maychew","Korem","Alamata","Inda Selassie","Adi Daero","Hawzen","Naeder Adet","Tsigereda"],
  "tigrinya-horn": ["Asmara","Keren","Massawa","Assab","Mendefera","Barentu","Agordat","Teseney","Ghinda","Adi Quala","Dekemhare","Senafe","Tseada Emba","Adi Keyh","Adi Ugri","Himberti","Ghatelai","Foro","Ghirmay"],
};

// ── MESOAMERICA ────────────────────────────────────────────────────────────
PLACE_DB["mesoamerica"] = {
  "chol": ["Tila","Tumbalá","Salto de Agua","Palenque","Yajalón","Chilón","Ocosingo","Altamirano","Oxchuc","Chanal","Amatenango del Valle","Huitiupán","Pueblo Nuevo Solistahuacán","Rayón","Tapilula","Sitalá","San Andrés Duraznal","Santiago el Pinar","Aldama"],
  "huastec": ["Tantoyuca","Tamiahua","Tempoal","Tanquian","San Vicente Tancuayalab","Platón Sánchez","Chicontepec","Ixcatepec","Tepetzintla","Temapache","Cerro Azul","Naranjos","Álamo","Pánuco","Tampico Alto","Ozuluama","Chinampa de Gorostiza","Tamalín","Tancoco"],
  "kiche": ["Santa Cruz del Quiché","Chichicastenango","Joyabaj","Nebaj","Sacapulas","Uspantán","Cunén","Chiché","Patzité","San Andrés Sajcabajá","San Pedro Jocopilas","San Antonio Ilotenango","San Bartolomé Jocotenango","San Juan Cotzal","Pachalum","Canillá","Zacualpa","Chinique"],
  "maya-yucatec": ["Mérida","Valladolid","Tizimín","Oxkutzcab","Tekax","Motul","Izamal","Ticul","Maxcanú","Hunucmá","Kanasín","Umán","Progreso","Chemax","Temozon","Espita","Cuncunul","Chikindzonot","Tixcacalcupul","Tahdziu"],
  "mixtec": ["Huajuapan de León","Tlaxiaco","Nochixtlán","Tlacolula","Oaxaca","Putla","Juxtlahuaca","Silacayoapam","Coicoyán de las Flores","San Juan Mixtepec","Santa María Tataltepec","Santiago Nuyoo","San Pedro y San Pablo Teposcolula","San Antonino Monte Santo","San Esteban Atatlahuca","San Miguel el Grande","Santa María Yucuhiti","San Juan Ñumí"],
  "nahuatl": ["Pachuca","Tulancingo","Apan","Tepeji del Río","Actopan","Ixmiquilpan","Zimapán","Huichapan","Tula de Allende","Temoaya","Jilotepec","Aculco","Polotitlán","San Martín de las Pirámides","Otumba","Teotihuacán","Texcoco","Chimalhuacán","Naucalpan"],
  "purepecha": ["Morelia","Uruapan","Zamora","Pátzcuaro","Zitácuaro","Apatzingán","Ciudad Hidalgo","Los Reyes","Tacámbaro","Purépero","Tlazazalca","Tingambato","Taretan","Nuevo Urecho","Ario de Rosales","Salvador Escalante","Quiroga","Coeneo","Erongarícuaro"],
  "totonac": ["Papantla","Poza Rica","Coatzintla","Zozocolco","Espinal","Coyutla","Mecatlán","Filomeno Mata","Gutiérrez Zamora","Tecolutla","Cazones","Chumatlán","Coxquihui","Zozocolco","Espinal","Coyutla","Mecatlán","Filomeno Mata","Gutiérrez Zamora","Tecolutla"],
  "tzeltal": ["Ocosingo","Altamirano","Chanal","Oxchuc","Tenejapa","Amatenango del Valle","Yajalón","San Juan Cancuc","Sitalá","Chilón","Tila","Tumbalá","Salto de Agua","Palenque","Huitiupán","Pueblo Nuevo Solistahuacán","Rayón","Tapilula","San Andrés Duraznal"],
  "tzotzil": ["San Cristóbal de las Casas","Chamula","Zinacantán","San Andrés Larráinzar","Pantelhó","Chenalhó","Oxchuc","Tenejapa","Amatenango del Valle","Yajalón","San Juan Cancuc","Sitalá","Chilón","Tila","Tumbalá","Salto de Agua","Palenque","Huitiupán","Pueblo Nuevo Solistahuacán"],
  "zapotec-meso": ["Oaxaca","Juchitán","Tehuantepec","Salina Cruz","Miahuatlán","Zaachila","Tlacolula","Etla","Zaachila","San Bartolo Coyotepec","San Martín Tilcajete","Santo Tomás Jalieza","Teotitlán del Valle","Tlacolula de Matamoros","Villa de Zaachila","San Antonino Castillo Velasco","San Baltazar Chichicápam","San Bartolomé Quialana","San Dionisio Ocotepec"],
};

// ── SOUTHEAST ASIA ─────────────────────────────────────────────────────────
PLACE_DB["southeast-asia"] = {
  "aceh": ["Banda Aceh","Lhokseumawe","Langsa","Sabang","Subulussalam","Singkil","Meulaboh","Blangpidie","Calang","Tapaktuan","Kuala Simpang","Idi Rayeuk","Lhoksukon","Bireuen","Sigli","Suka Makmue","Tapaktuan","Kuala Simpang","Idi Rayeuk","Lhoksukon"],
  "balinese": ["Denpasar","Singaraja","Amlapura","Semarapura","Negara","Tabanan","Gianyar","Bangli","Karangasem","Jembrana","Klungkung","Buleleng","Badung","Gianyar","Bangli","Karangasem","Jembrana","Klungkung","Buleleng","Badung"],
  "cham": ["Phan Rang-Tháp Chàm","Phan Thiết","Ninh Hòa","Nha Trang","Cam Ranh","Khánh Hòa","Bình Thuận","Ninh Thuận","Phan Rang","Phan Thiết","Ninh Hòa","Nha Trang","Cam Ranh","Khánh Hòa","Bình Thuận","Ninh Thuận","Phan Rang","Phan Thiết","Ninh Hòa"],
  "javanese": ["Jakarta","Surabaya","Bandung","Semarang","Yogyakarta","Malang","Solo","Purwokerto","Cirebon","Tegal","Pekalongan","Madiun","Kediri","Jember","Banyuwangi","Tasikmalaya","Sukabumi","Cianjur","Garut","Sumedang"],
  "khmer": ["Phnom Penh","Siem Reap","Battambang","Sihanoukville","Kampong Cham","Kampong Thom","Kampong Speu","Kampot","Takeo","Kep","Koh Kong","Pailin","Preah Vihear","Oddar Meanchey","Banteay Meanchey","Pursat","Svay Rieng","Tboung Khmum","Kratie"],
  "lao": ["Vientiane","Luang Prabang","Savannakhet","Pakse","Thakhek","Xam Neua","Phonsavan","Xayaboury","Bolikhamxai","Khammouan","Saravane","Sekong","Attapeu","Xieng Khouang","Bokeo","Luang Namtha","Oudomxay","Phongsali","Houaphanh"],
  "malay": ["Kuala Lumpur","Johor Bahru","Ipoh","Kuching","Kota Kinabalu","Shah Alam","Petaling Jaya","Klang","Subang Jaya","Penang","Malacca","Alor Setar","Kuantan","Kuala Terengganu","Kota Bharu","Seremban","Kangar","Butterworth","Taiping"],
  "thai": ["Bangkok","Chiang Mai","Chiang Rai","Phuket","Pattaya","Hat Yai","Nakhon Ratchasima","Khon Kaen","Udon Thani","Nakhon Si Thammarat","Songkhla","Surat Thani","Phitsanulok","Ubon Ratchathani","Nakhon Sawan","Lampang","Sukhothai","Ayutthaya","Nakhon Pathom"],
  "vietnamese": ["Ho Chi Minh City","Hanoi","Da Nang","Hai Phong","Can Tho","Bien Hoa","Nha Trang","Hue","Vung Tau","Quy Nhon","Buon Ma Thuot","Rach Gia","Long Xuyen","Thai Nguyen","Nam Dinh","Vinh","Ha Tinh","Dong Hoi","Pleiku"],
};

// ── EAST ASIA ──────────────────────────────────────────────────────────────
PLACE_DB["east-asia"] = {
  "hakka": ["Meizhou","Heyuan","Shaoguan","Jieyang","Zhanjiang","Maoming","Zhaoqing","Huizhou","Shanwei","Yangjiang","Qingyuan","Chaozhou","Jieyang","Meizhou","Heyuan","Shaoguan","Jieyang","Zhanjiang","Maoming","Zhaoqing"],
  "japanese": ["Tokyo","Osaka","Kyoto","Yokohama","Nagoya","Sapporo","Kobe","Fukuoka","Kawasaki","Saitama","Hiroshima","Sendai","Kitakyushu","Chiba","Sakai","Niigata","Hamamatsu","Okayama","Kumamoto","Shizuoka"],
  "korean": ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Ulsan","Suwon","Changwon","Goyang","Yongin","Seongnam","Cheongju","Jeonju","Cheonan","Gimpo","Pohang","Gumi","Chuncheon","Wonju"],
  "mandarin": ["Beijing","Shanghai","Guangzhou","Shenzhen","Chengdu","Wuhan","Hangzhou","Nanjing","Xi'an","Tianjin","Suzhou","Zhengzhou","Changsha","Qingdao","Dalian","Xiamen","Kunming","Hefei","Jinan","Fuzhou"],
  "min-nan": ["Xiamen","Quanzhou","Zhangzhou","Fuzhou","Putian","Nan'an","Jinjiang","Shishi","Longhai","Anxi","Yongchun","Dehua","Hui'an","Nan'an","Jinjiang","Shishi","Longhai","Anxi","Yongchun","Dehua"],
  "mongolian": ["Ulaanbaatar","Erdenet","Darkhan","Choibalsan","Mörön","Ölgii","Uliastai","Sükhbaatar","Tsetserleg","Arvaikheer","Bayankhongor","Altai","Darhan","Choir","Zuunmod","Nalaikh","Baganuur","Bagakhangai"],
  "tibetan": ["Lhasa","Shigatse","Chamdo","Nyingchi","Shannan","Nagqu","Ngari","Gyantse","Tsedang","Xigazê","Lhatse","Nyalam","Tingri","Sakya","Lhamo","Gyirong","Purang","Burang","Gar","Shiquanhe"],
  "zhuang": ["Nanning","Liuzhou","Guilin","Yulin","Baise","Hezhou","Qinzhou","Guigang","Fangchenggang","Chongzuo","Heshan","Dongxing","Pingxiang","Beihai","Wuzhou","Hechi","Laibin","Yulin","Baise","Hezhou"],
};

// ── SINO-TIBETAN REGION ────────────────────────────────────────────────────
PLACE_DB["sino-tibetan-region"] = {
  "bai": ["Dali","Jianchuan","Heqing","Yongping","Yunlong","Eryuan","Binchuan","Midu","Xiangyun","Weishan","Nanjian","Yangbi","Eryuan","Binchuan","Midu","Xiangyun","Weishan","Nanjian","Yangbi","Eryuan"],
  "jingpho": ["Myitkyina","Bhamo","Putao","Mohnyin","Mogaung","Shwegu","Ingyanyaw","Sumprabum","Chibwe","Waingmaw","Mansi","Momauk","Hpakan","Nawngmun","Pangwa","Kamaing","Mawhpung","Sinlum","Namti"],
  "kachin": ["Myitkyina","Bhamo","Putao","Mohnyin","Mogaung","Shwegu","Ingyanyaw","Sumprabum","Chibwe","Waingmaw","Mansi","Momauk","Hpakan","Nawngmun","Pangwa","Kamaing","Mawhpung","Sinlum","Namti","Mongmao"],
  "lepcha": ["Gangtok","Namchi","Rangpo","Ravangla","Mangan","Dikchu","Rhenock","Rongli","Soreng","Yuksom","Pelling","Gyalshing","Namthang","Rangpo","Ravangla","Mangan","Dikchu","Rhenock","Rongli","Soreng"],
  "lolo": ["Kunming","Qujing","Yuxu","Chuxiong","Dali","Lijiang","Baoshan","Zhaotong","Wenshan","Honghe","Pu'er","Lincang","Nujiang","Diqing","Dehong","Xishuangbanna","Dali","Lijiang","Baoshan","Zhaotong"],
  "mizo": ["Aizawl","Lunglei","Champhai","Serchhip","Kolasib","Lawngtlai","Mamit","Saiha","Khawzawl","Hnahthial","Saitual","Khawbung","Ngopa","Phullen","Tlangnuam","Thingsulthliah","Bilkhawthlir","Zawlnuam","Hrangturzo"],
  "naxi": ["Lijiang","Yongning","Ninglang","Weixi","Yongsheng","Huaping","Ninglang","Weixi","Yongsheng","Huaping","Ninglang","Weixi","Yongsheng","Huaping","Ninglang","Weixi","Yongsheng","Huaping","Ninglang","Weixi"],
  "newar": ["Kathmandu","Patan","Bhaktapur","Kirtipur","Banepa","Dhulikhel","Panauti","Bidur","Nagarkot","Chautara","Dolakha","Sindhupalchok","Kavrepalanchok","Ramechhap","Dhading","Nuwakot","Rasuwa","Sindhuli","Makwanpur"],
  "qiang": ["Wenchuan","Maoxian","Lixian","Songpan","Heishui","Beichuan","Pingwu","Jiangzi","Anzhou","Mianzhu","Shifang","Guanghan","Deyang","Luojiang","Jiangyou","Fucheng","Santai","Yanting","Zitong"],
  "sherpa": ["Namche Bazaar","Thame","Khumjung","Pangboche","Phortse","Dingboche","Lobuche","Gorak Shep","Everest Base Camp","Lukla","Phakding","Jorsale","Monjo","Sagarmatha","Solukhumbu","Khumbu","Rolwaling","Helambu","Langtang"],
  "tamang": ["Kathmandu","Dhading","Nuwakot","Rasuwa","Sindhupalchok","Kavrepalanchok","Makwanpur","Chitwan","Gorkha","Lamjung","Tanahu","Syangja","Palpa","Gulmi","Arghakhanchi","Kapilvastu","Rupandehi","Nawalparasi"],
  "yi": ["Xichang","Butuo","Zhaojue","Yuexi","Ganluo","Jinyang","Puge","Leibo","Meigu","Xide","Mianning","Yanyuan","Dechang","Huidong","Ningnan","Puge","Leibo","Meigu","Xide","Mianning"],
};

// ── AUSTRALIA ──────────────────────────────────────────────────────────────
PLACE_DB["australia"] = {
  "arrernte": ["Alice Springs","Hermannsburg","Santa Teresa","Amoonguna","Titjikala","Laramba","Ntaria","Wallace Rockhole","Burt Plain","Hart Range","Inverway","Ali Curung","Wilora","Engawala","Murray Downs","Ti Tree","Wycliffe Well","Erldunda","Stuart"],
  "pitjantjatjara": ["Ernabella","Amata","Kaltjiti","Pipalyatjara","Watarru","Watinuma","Kanpi","Kalka","Murputja","Nyapari","Kunytjaru","Tjukurla","Warakurna","Blackstone","Irrunytju","Fregon","Indulkana","Yalata","Oak Valley"],
  "warlpiri": ["Yuendumu","Lajamanu","Willowra","Nyirripi","Yuelamu","Ali Curung","Tennant Creek","Borroloola","Top Springs","Canteen Creek","Wycliffe Well","Erldunda","Stuart","Ti Tree","Murray Downs","Engawala","Wilora","Amoonguna"],
  "wiradjuri": ["Wagga Wagga","Narrandera","Griffith","Leeton","Temora","Young","Cowra","Forbes","Parkes","Dubbo","Orange","Bathurst","Lithgow","Mudgee","Wellington","Gilgandra","Coonamble","Warren","Nyngan"],
  "yolngu": ["Nhulunbuy","Yirrkala","Galiwinku","Milingimbi","Ramingining","Gapuwiyak","Gunyangara","Dhalinybuy","Gurrumurru","Biranybirany","Matamata","Baniyala","Djarrakpi","Gangan","Rurrangala","Dhalinbuy","Wandawuy","Gutjangan"],
};

// ── INDIAN OCEAN ───────────────────────────────────────────────────────────
PLACE_DB["indian-ocean"] = {
  "comorian": ["Moroni","Mutsamudu","Fomboni","Domoni","Ouani","Sima","Moya","Nioumachoua","Bambao","Itsandra","Iconi","Mbeni","Bandrani","Kangani","Hahaya","Sada","Chandra","Mramani","Vouvouni"],
  "maldivian": ["Malé","Addu City","Fuvahmulah","Hithadhoo","Kulhudhuffushi","Thinadhoo","Naifaru","Dhidhdhoo","Eydhafushi","Feydhoo","Gan","Hulhudheli","Maafushi","Manadhoo","Muli","Nilandhoo","Thoddoo","Utheemu","Villingili"],
  "mauritian-creole": ["Port Louis","Beau Bassin-Rose Hill","Vacoas-Phoenix","Curepipe","Quatre Bornes","Triolet","Goodlands","Centre de Flacq","Bel Air","Mahébourg","Pamplemousses","Rivière du Rempart","Flacq","Grand Port","Savanne","Plaines Wilhems","Moka","Port Mathurin"],
  "seychellois": ["Victoria","Anse Royale","Beau Vallon","Cascade","Takamaka","Port Glaud","Grand Anse","Baie Lazare","Anse Boileau","Anse Etoile","English River","Bel Ombre","Glacis","Mont Fleuri","Plaisance","Pointe Larue","Saint Louis","Au Cap","Anse aux Pins"],
};

// ── CARIBBEAN ──────────────────────────────────────────────────────────────
PLACE_DB["caribbean"] = {
  "haitian-creole": ["Port-au-Prince","Cap-Haïtien","Gonaïves","Les Cayes","Jacmel","Jérémie","Miragoâne","Saint-Marc","Hinche","Fort-Liberté","Petit-Goâve","Grand-Goâve","Pétion-Ville","Delmas","Carrefour","Tabarre","Cité Soleil","Kenscoff","Thomazeau"],
  "jamaican-creole": ["Kingston","Montego Bay","Spanish Town","Mandeville","May Pen","Half Way Tree","Savanna-la-Mar","Port Antonio","Ocho Rios","Linstead","Morant Bay","Port Maria","St. Ann's Bay","Falmouth","Black River","Lucea","Negril","Old Harbour"],
  "papiamento": ["Willemstad","Oranjestad","Philipsburg","Kralendijk","Dakota","Sint Michiel","Santa Cruz","San Nicolaas","Rincon","Noord","Savaneta","Barber","Soto","Lagun","Parera","Cas Cabito","Curaçao","Bonaire","Aruba"],
  "trinidadian-creole": ["Port of Spain","San Fernando","Chaguanas","Arima","Point Fortin","Scarborough","Sangre Grande","Princes Town","Couva","Diego Martin","Tunapuna","Marabella","Roxborough","Tabaquite","Claxton Bay","Gasparillo","Freeport","Penal","Debe"],
};

// ── MISC ───────────────────────────────────────────────────────────────────
PLACE_DB["misc"] = {
  "creole": ["Paramaribo","Lelydorp","Nieuw Nickerie","Moengo","Albina","Wageningen","Groningen","Domburg","Totness","Brownsweg","Brokopondo","Nieuw Amsterdam","Mariënburg","Boskamp","Friendship","Windsor","Onverwacht","Zanderij","Kwamalasamutu"],
  "pidgin": ["Port Moresby","Lae","Mount Hagen","Madang","Wewak","Goroka","Kimbe","Kokopo","Popondetta","Arawa","Buka","Alotau","Vanimo","Kundiawa","Mendi","Tari","Kerema","Daru","Lorengau"],
  "sign-language": ["Washington","New York","London","Paris","Tokyo","Beijing","Moscow","Berlin","Madrid","Rome","Sydney","Toronto","Mexico City","Buenos Aires","Cairo","Mumbai","Bangkok","Seoul","Jakarta","Lagos"],
};

module.exports = { PLACE_DB };

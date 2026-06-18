"use strict";
const fs = require("fs");

const africa1 = require("./data/place-db-africa.js");
const africa2 = require("./data/place-db-africa2.js");

const existingNames = new Set();
for (const names of Object.values(africa1.AFRICA_PLACE_DB)) names.forEach(n => existingNames.add(n));
for (const names of Object.values(africa2.AFRICA2_DB)) names.forEach(n => existingNames.add(n));

const used = new Set();
function u(arr) { return arr.filter(n => !existingNames.has(n) && !used.has(n) && (used.add(n), true)); }

const B = {};

// Each entry: 40-50 unique real places from the language's specific geographic area
// Names must NOT exist in existing DBs AND must be unique across all entries here

B["acheron"] = u(["Heiban","Abu Sinjeil","El Buram","Um Dorein","Abu Karshola","Kalogi","Al Sunut","Dibebad","Guldal","Muglad","Ajing","Koalib","Tindirov","Karkar","Key Afer","Pochalla","Pariang","Aweil","Kuajok","Wau","Rumbek","Yirol","Bor","Nasir","Ajakuac","Anyuon","Thiei","Ajok","Boma","Ganyliel","Panekar","Malualkon","Al Mabien","Makak","Turalei","Warrap","Romic"]);

B["adara"] = u(["Manchok","Atiak","Agban","Riyom","Barkin Ladi","Doma","Karu","Kokona","Akwanga","Naka","Umaisha","Agatu","Otukpo","Okpokwu","Ugbokpo","Igumale","Oju","Ugbokolo","Okpaga","Ogbadibo","Edumoga","Awhum","Okpatu","Udi","Ngwo","Ezeagu","Agbani","Nenwe","Opi","Obimo","Ugwuogo","Nike","Ekukun","Egede","Uburu","Effium","Ezza","Ohaozara","Amasiri","Nenwe","Abak"]);

B["afade"] = u(["Doukoula","Dziguilao","Mogodé","Moulvoudaye","Mogombiri","Gangue","Guirvidig","Blangoua","Méri","Dabanga","Hilé Alifa","Yagoua","Kalfou","Mokong","Bourrha","Zina","Ngambélédouma","Blablata","Makary","Gazaoua","Moutourwa","Moskota","Mayo Tsanaga","Mayo Ouldémé","Kalkoussa","Mindif","Mora","Hina","Maroua","Abéchédé","Amchidé","Goulfey","Kousséri","Logone-Birni","Tchibanga","Roua","Waza","Bogo"]);

B["african-romance"] = u(["Hadrumetus","Leptis Magna","Sabratha","Cirta","Hippo Regius","Timgad","Lambaesis","Thugga","Bulla Regia","Sicca Veneria","Thysdrus","Dougga","Gabès","Gafsa","Tozeur","Djerba","Monastir","Mahdia","Bizerte","Kairouan","Tébessa","Oran","Tlemcen","Batna","Biskra","Béjaïa","Mostaganem","Tiaret","Saida","Ghardaia","Ouargla","Laghouat","Djelfa","In Salah","Tindouf","Bechar","Adrar","Timimoun","Reggane","Aoulef","Foggaret Ezzoua","Zaouiet Kounta","Tin Fouye Tabankort","Tit","Gharroufa","Tidikelt","In Ghar","Ouled Said","Ksar Kaddour","Metarfa","Taoudenni","Tamentit","Tiberghamine","Tin El Koum"]);

B["aghem"] = u(["Wakwa","Fengwe","Chup","Folepi","Mankon","Bafanji","Balikumbat","Babessi","Bamenyam","Ndu","Tatum","Tabenken","Nkwen","Mbatu","Bafang","Dschang","Mbouda","Bangangté","Bana","Banka","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Esu","Jakiri","Jarum","Nev","Awing","Nkor","Akum","Zhoa","Fundong","Bali","Bamenda","Mbengwi","Njinikom","Ndop","Kumbo"]);

B["aiki"] = u(["Moïssala","Batangafo","Bossangoa","Baboua","Bozoum","Ippy","Yalinga","Dékoa","Kaga Bandoro","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï","Koro","Gaiwe","Monkoyo","Bougoum","Lobaye","Gamboula","Dédé Makouba","Amada Gaza","Mbaïki","Boda","Alindao","Bouar","Berberati","Bambari","Carnot","Koumra","Pala","Sarh","Sibut","N'Délé","Birao","Bria","Biltine"]);

B["air-tamajeq"] = u(["Arlit","Tchirozerine","Iférouane","Tadenr","Tabalak","Tchirozérine","Ingall","Aderbissinat","Dakoussa","Takiéta","Keita","Illela","Bagaroua","Bankilare","Tamaske","Gothèye","Madarounfa","Guidan Roumdji","Tanout","Goure","Badaguichi","Madaoua","Filingué","Say","Kollo","Boboye","Kouré","Ouallam","Dakoro","Bouza","Tchin Tabaraden","Imanan","Tegguiada In Tessoum","Tiloa","Tabelot","Abalak","Agadez","Tahoua","Bella"]);

B["ambele"] = u(["Ikot Ekpene","Etinan","Ikot Abasi","Oron","Okopedi","Etim Ekpo","Ukana","Itu","Mbak","Uruan","Nsit Ubium","Nsit Atai","Ibesikpo Asutan","Eastern Obolo","Esit Eket","Ibeno","Ini","Ikono","Mbo","Udung Uko","Urue Offong Oruko","Eket","Abak","Uyo","Ikom","Obudu","Ogoja","Bende","Ohafia","Arochukwu","Udi","Enugu","Abakaliki","Afikpo"]);

B["ambo"] = u(["Senanga","Kaoma","Shangombo","Kalabo","Mwandi","Kasempa","Zambezi","Ngonye","Simungoma","Silalo","Lubosi","Lilonga","Ndau","Sitoti","Chingenge","Mukumbutu","Mulumbi","Lukulu","Mitete","Kabompo","Chavuma","Mwinilunga","Ikelenge","Kalumbila","Kanyama","Mandevu","Chongwe","Luanshya","Masaiti","Mpongwe","Lufwanyama","Chililabombwe","Choma","Pemba","Monze","Sesheke","Katima Mulilo","Mongu","Livingstone","Chipata"]);

B["amdang"] = u(["Tiné","Am Zoer","Goz Beïda","Daguessa","Am Dam","Mangueigne","Kerfiba","Edd al Fursan","Birak","Koro Treij","Mouraye","Adé","Djourin","Koulbous","Oum Hadjer","Moyen Chari","Laï","Bébédjia","Bongor","Kelo","Pala","Sarh","Koumra","Moundou","Abeche","Biltine","Mongo","Am Dam","Mangueigne","Geneina","Beida","Foro Baranga","Adré","Iriba","Guéréda","Arada","Biltine","Mongo","Am Dam"]);

B["amira"] = u(["Koudi","Gaiwe","Monkoyo","Bougoum","Lobaye","Gamboula","Dédé Makouba","Amada Gaza","Mobaye","Mbaïki","Boda","Alindao","Sibut","Bouar","Berberati","Bambari","N'Délé","Birao","Bria","Carnot","Koumra","Pala","Sarh","Koro","Ippy","Yalinga","Batangafo","Bossangoa","Baboua","Bozoum","Dékoa","Kaga Bandoro","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï"]);

B["angas"] = u(["Ampang","Kaltungo","Nafada","Dass","Tafawa Balewa","Bukuru","Mikang","Kombun","Langtang","Kanke","Lere","Kwanga","Kurra","Gwarok","Asso","Jengre","Irigwe","Kwardar","Nyes","Kura","Bokkos","Gindiri","Tunkus","Dax","Vom","Kagoro","Fkan","Zanina","Fursum","Dyemsa","Gok","Dokan Kasuwa","Abwa Madaki","Afuze","Kwali","Latya","Mallam Sidi","Bassa","Birnin Kudu","Misau","Darazo","Bauchi","Pankshin","Mangu","Jos","Shendam","Dengi","Bogoro"]);

B["asoa"] = u(["Gaiwe","Monkoyo","Bougoum","Lobaye","Gamboula","Dédé Makouba","Amada Gaza","Mobaye","Mbaïki","Boda","Alindao","Sibut","Bouar","Berberati","Bambari","N'Délé","Birao","Bria","Carnot","Koumra","Pala","Sarh","Koro","Ippy","Yalinga","Batangafo","Bossangoa","Baboua","Bozoum","Dékoa","Kaga Bandoro","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Guéréda","Iriba","Arada","Adré","Foro Baranga"]);

B["auyokawa"] = u(["Itas","Jalam","Dambatta","Gamawa","Dukku","Waja","Balanga","Deba","Shongom","Katagum","Hadejia","Gumel","Dutse","Ringim","Garki","Keffin Hausa","Daraz","Toro","Azare","Bauchi","Bogoro","Langtang","Pankshin","Mangu","Ampang","Kaltungo","Nafada","Dass","Tafawa Balewa","Bukuru","Mikang","Kombun","Jos","Misau","Jama'are","Ningi","Dambatta","Kazaure"]);

B["avokaya"] = u(["Ngangala","Nzara","Nagero","Tambura","Tindalo","Ezo","Sakure","Bereka","Bazi","Gangura","Ri Rangu","Girilla","Kupi","Bungu","Yambio","Maridi","Yei","Kajo Keji","Terekeka","Lainya","Mundri","Morobo","Tindalo","Sakure","Bereka","Bazi","Gangura","Ri Rangu","Girilla","Kupi","Bungu","Lainya","Mundri","Morobo","Ngangala","Nzara","Nagero","Tambura","Tindalo","Ezo","Sakure","Bereka","Bazi","Gangura","Ri Rangu","Girilla","Kupi","Bungu"]);

B["babanki"] = u(["Njinikijem","Tabenken","Ndu","Tatum","Bafanji","Balikumbat","Babessi","Bamenyam","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Bafang","Dschang","Mbouda","Bangangté","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Mankon","Nkwen","Mbatu","Bana","Banka","Esu","Jakiri","Jarum","Nev","Fengwe","Chup","Folepi","Wum","Njinikom","Bafut","Zhoa","Fundong","Bali"]);

B["baca"] = u(["Abankoro","Abakalikem","Affa","Agukwu","Ebonyi","Ezzama","Ishielu","Ezza","Ohanivo","Okposi","Uburu","Onicha","Ohaozara","Ivo","Ikwo","Eha Amufu","Nkalagu","Abakaliki","Afikpo","Ohafia","Arochukwu","Amasiri","Obolo Effiong","Nkporo","Ibenda","Agbani","Eha Amufu","Nkalagu","Uburu","Onicha","Ohaozara","Ivo","Ikwo","Abankoro","Abakalikem","Affa","Agukwu","Ebonyi","Ezzama","Ishielu","Ezza","Ohanivo","Okposi","Uburu","Onicha","Ohaozara"]);

B["bade-chadic"] = u(["Jakusko","Yusufari","Machina","Bursari","Damagum","Fune","Karasuwa","Ngala","Gulani","Magumeri","Marte","Monguno","Kaga","Konduga","Abadam","Kukawa","Banki","Dikwa","Nganzai","Gubio","Kala Balge","Gamgara","Gamjimari","Bayam","Layiwola","Gajiganna","Gajiram","Kumshe","Old Maiduguri","Mafa","Gwoza","Damboa","Askira","Uba","Biu","Gashua","Geidam","Potiskum","Bama","Mubi","Madagali","Michika"]);

B["bade-language"] = u(["Nangere","Bade","Yusufari","Machina","Karasuwa","Gujba","Gulani","Buni Yadi","Gorgoram","Biu","Gadaka","Dapchi","Jakusko","Kari","Damasak","Mubi","Madagali","Michika","Gombi","Song","Hong","Gulak","Gella","Kwosa","Pella","Bazi","Tizha","Gadar","Kava","Kudu","Hirku","Mayo Mbali","Mayo Nguli","Gashua","Geidam","Potiskum","Fika","Bama","Mubi","Madagali","Michika","Gombi","Song","Hong","Gulak","Gella"]);

B["baka"] = u(["Dimako","Doumé","Abong Mbang","Batouri","Yokadouma","Garoua Boulai","Belabo","Minta","Bétaré Oya","Mindourou","Gari Gombo","Ndélélé","Mbang","Lomié","Moloundou","Lolodorf","Campo","Ma'an","Bipindi","Kribi","Ambam","Mébolé","Dimako","Doumé","Abong Mbang","Batouri","Yokadouma","Garoua Boulai","Belabo","Minta","Bétaré Oya","Mindourou","Gari Gombo","Ndélélé","Mbang","Lomié","Moloundou","Lolodorf","Campo","Ma'an","Bipindi","Kribi","Ambam","Mébolé"]);

B["bamali"] = u(["Njinikijem","Tabenken","Ndu","Tatum","Bafanji","Balikumbat","Baba","Babessi","Bamenyam","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Bafang","Dschang","Mbouda","Bangangté","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Mankon","Nkwen","Mbatu","Bana","Banka","Esu","Jakiri","Jarum","Nev","Fengwe","Chup","Folepi","Wum","Njinikom","Bafut","Zhoa"]);

B["bambalang"] = u(["Njinikijem","Tabenken","Ndu","Tatum","Bafanji","Balikumbat","Baba","Babessi","Bamenyam","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Bafang","Dschang","Mbouda","Bamessing","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Mankon","Nkwen","Mbatu","Bana","Banka","Esu","Jakiri","Jarum","Nev","Fengwe","Chup","Folepi","Wum","Njinikom","Bafut","Zhoa"]);

B["bambara"] = u(["Sikasso","Koutiala","San","Niono","Markala","Fana","Banamba","Kangaba","Kolokani","Dioila","Nara","Bougouni","Kadiolo","Yorosso","Orodara","Toussiana","Djenné","Bandiagara","Bla","Kati","Koulikoro","Mopti","Ségou","Bamako","Kayes","Kita","Ménaka","Taoudénit","Kidal","Gao","Tombouctou","Dioïla","Yanfolila","Morila","Pelengana"]);

B["bambassi"] = u(["Bambashi","Asosa","Dibate","Menge","Guba","Mago","Jinka","Bulqedar","Sherkole","Kurmuk","Tongo","Giwang","Gore","Tepi","Mizan Teferi","Aman","Shebenchi","Bench Maji","Keffa","Sheka","Selinge","Murale","Gelila","Karkar","Bena Tsemay","Hammer","Kuraz","Debub Ari","Selamago","Bodji","Workeye","Turmi","Dimeka","Kangito","Kara Omudi","Ari","Bume"]);

B["bamukumbit"] = u(["Njinikijem","Tabenken","Ndu","Tatum","Bafanji","Balikumbat","Baba","Babessi","Bamenyam","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Bafang","Dschang","Mbouda","Bamessing","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Mankon","Nkwen","Mbatu","Bana","Banka","Esu","Jakiri","Jarum","Nev","Fengwe","Chup","Folepi","Wum","Njinikom","Bafut","Zhoa"]);

B["bamum"] = u(["Foumbot","Bamendjou","Bangangté","Banka","Batcham","Bazou","Galion","Kouoptamo","Malentouen","Massangam","Ngouonkpat","Petté","Refi","Tamdjou","Tonga","Zem","Tcholliré","Foumban","Bafoussam","Bamendjou","Bana","Banka","Batcham","Bazou","Galion","Kouoptamo","Malentouen","Massangam","Ngouonkpat","Petté","Refi","Tamdjou","Tonga","Zem","Tcholliré"]);

B["bamwe"] = u(["Kalangai","Bafwasende","Ubundu","Opala","Lokolia","Yahuma","Lomela","Kamina","Kabongo","Kaniama","Katongo","Lufira","Kasaji","Mutshatsha","Dilolo","Kapanga","Kasongo Lunda","Kwamouth","Mangai","Idiofa","Feshi","Kahemba","Bagata","Kisangani","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko"]);

B["bana"] = u(["Koza","Mayo Ouldémé","Kalkoussa","Gangue","Guirvidig","Blangoua","Méri","Dabanga","Hilé Alifa","Yagoua","Kalfou","Mokong","Bourrha","Waza","Bogo","Koza","Roua","Zina","Maroua","Mokolo","Mindif","Moutourwa","Hina","Moskota","Mayo Tsanaga","Gazaoua","Gangue","Guirvidig","Blangoua","Méri","Dabanga","Hilé Alifa","Yagoua","Kalfou","Mokong","Bourrha","Waza","Bogo","Koza","Roua"]);

B["bangala"] = u(["Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko","Gemena","Libenge","Lisala","Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko","Gemena","Libenge"]);

B["bangi"] = u(["Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko","Gemena","Libenge","Lisala","Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko"]);

B["barein"] = u(["Gori","Damtar","Sarh","Koumra","Pala","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Biltine","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï","Biltine","Mongo","Gori","Damtar","Sarh","Koumra","Pala","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Biltine","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï","Biltine","Mongo","Gori","Damtar"]);

B["bata"] = u(["Batibo","Widikum","Ngie","Ngwo","Oku","Nkambe","Fundong","Bali","Esu","Jakiri","Jarum","Awing","Nkor","Akum","Nev","Fengwe","Chup","Folepi","Mankon","Bafanji","Balikumbat","Baba","Babessi","Bamenyam","Bamessing","Ndu","Tatum","Tabenken","Nkwen","Mbatu","Bafang","Dschang","Mbouda","Bangangté","Bana","Banka","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Nkambe","Oku","Kom","Boyo","Mundemba"]);

B["batu"] = u(["Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi"]);

B["beele"] = u(["Pankshin","Ampang","Mangu","Kaltungo","Nafada","Dass","Tafawa Balewa","Bukuru","Mikang","Kombun","Langtang","Kanke","Lere","Kwanga","Kurra","Bogoro","Jos","Shendam","Dengi","Bassa","Gwarok","Asso","Jengre","Irigwe","Kwardar","Nyes","Kura","Bokkos","Riyom","Barkin Ladi","Gindiri","Tunkus","Dax","Vom","Kagoro","Fkan","Zanina","Fursum","Dyemsa","Gok","Dokan Kasuwa","Abwa Madaki","Afuze","Kwali","Latya","Mallam Sidi"]);

B["beli"] = u(["Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi","Bungu","Girilla","Lainya","Terekeka","Kajo Keji","Mundri","Yambio","Nzara","Ezo","Maridi","Yei","Kupi"]);

B["bemba"] = u(["Luwingu","Chinsali","Isoka","Nakonde","Mungwi","Chilubi","Kaputa","Kawambwa","Mporokoso","Luwinga","Shiwa Ngandwe","Shafilondwe","Mpulungu","Kasaba Bay","Nsombo","Mambwe","Chikwanda","Kasama","Chililabombwe","Luwingu","Chinsali","Isoka","Nakonde","Mungwi","Chilubi","Kaputa","Kawambwa","Mporokoso","Luwinga","Shiwa Ngandwe","Shafilondwe","Mpulungu","Kasaba Bay","Nsombo","Mambwe","Chikwanda","Kasama","Chililabombwe","Luwingu","Chinsali","Isoka","Nakonde","Mungwi","Chilubi","Kaputa","Kawambwa","Mporokoso","Luwinga","Shiwa Ngandwe","Shafilondwe","Mpulungu","Kasaba Bay","Nsombo","Mambwe","Chikwanda","Kasama","Chililabombwe"]);

B["berta"] = u(["Menge","Guba","Dibate","Bulqedar","Sherkole","Kurmuk","Bambashi","Tongo","Giwang","Gore","Tepi","Mizan Teferi","Aman","Bench Maji","Keffa","Sheka","Kapoeta","Torit","Bume","Selinge","Murale","Gelila","Karkar","Bena Tsemay","Hammer","Kuraz","Debub Ari","Selamago","Bodji","Workeye","Turmi","Dimeka","Kangito","Kara Omudi","Ari"]);

B["bete"] = u(["Gagnoa","Daloa","Soubré","Issia","Guibéroua","Saïoua","Doukouya","Zoukougbeu","Oumé","Fresco","Lakota","Niambézaria","Grand Lahou","Tiassalé","Sikensi","Divo","Guitry","Dairo-Didizo","Bouaflé","Oumé","Fresco","Lakota","Niambézaria","Grand Lahou","Tiassalé","Sikensi","Divo","Guitry","Dairo-Didizo","Bouaflé","Gagnoa","Daloa","Soubré","Issia","Guibéroua","Saïoua","Doukouya","Zoukougbeu","Oumé","Fresco","Lakota","Niambézaria","Grand Lahou","Tiassalé","Sikensi","Divo","Guitry","Dairo-Didizo","Bouaflé"]);

B["binza"] = u(["Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko","Gemena","Libenge","Lisala","Bolomba","Lokole","Kungu","Budjala","Boso Ngoro","Bumba","Basankusu","Yangambi","Isangi","Dongo","Ngede","Yakoma","Banalia","Mobati","Imese","Lolanga","Moeko","Gemena","Libenge"]);

B["birgit"] = u(["Gori","Damtar","Sarh","Koumra","Pala","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Biltine","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï","Biltine","Mongo","Gori","Damtar","Sarh","Koumra","Pala","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Biltine","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï","Biltine","Mongo","Gori","Damtar"]);

B["birri"] = u(["Gaiwe","Monkoyo","Bougoum","Lobaye","Gamboula","Dédé Makouba","Amada Gaza","Mobaye","Mbaïki","Boda","Alindao","Sibut","Bouar","Berberati","Bambari","N'Délé","Birao","Bria","Carnot","Koumra","Pala","Sarh","Koro","Ippy","Yalinga","Koudi","Batangafo","Bossangoa","Baboua","Bozoum","Ippy","Dékoa","Kaga Bandoro","Moundou","Doba","Bongor","Kelo","Bébédjia","Am Timan","Mongo","Guéréda","Iriba","Arada","Adré","Foro Baranga","Geneina","Beida","Oum Hadjer","Moyen Chari","Laï"]);

B["bissa"] = u(["Tenkodogo","Garango","Zabré","Bittou","Koulpélogo","Ouargaye","Fada N'gourma","Manga","Koupéla","Koudougou","Réo","Sapouy","Léo","Boussé","Kombissiri","Ziniaré","Zitenga","Béré","Niaogho","Gogo","Tenkodogo","Garango","Zabré","Bittou","Koulpélogo","Ouargaye","Fada N'gourma","Manga","Koupéla","Koudougou","Réo","Sapouy","Léo","Boussé","Kombissiri","Ziniaré","Zitenga","Béré","Niaogho","Gogo"]);

B["bitare"] = u(["Abankoro","Abakalikem","Affa","Agukwu","Ebonyi","Eha Amufu","Ishielu","Ezza","Ohanivo","Okposi","Uburu","Onicha","Ohaozara","Ivo","Ikwo","Abakaliki","Afikpo","Ohafia","Arochukwu","Ikwo","Ezza","Ishielu","Ohaozara","Onicha","Ivo","Ikwo","Abankoro","Abakalikem","Affa","Agukwu","Ebonyi","Eha Amufu","Ishielu","Ezza","Ohanivo","Okposi","Uburu","Onicha","Ohaozara","Ivo","Ikwo","Abakaliki","Afikpo","Ohafia","Arochukwu","Ikwo","Ezza","Ishielu","Ohaozara","Onicha","Ivo","Ikwo","Abankoro","Abakalikem"]);

B["bobo"] = u(["Bobo Dioulasso","Nouna","Koudougou","Réo","Ouagadougou","Banfora","Sindou","Dandé","Léo","Boromo","Dédougou","Tougan","Solenzo","Gao","Baguinéda","Sikasso","Fana","Koutiala","Niena","Houndé","Nouna","Koudougou","Réo","Ouagadougou","Banfora","Sindou","Dandé","Léo","Boromo","Dédougou","Tougan","Solenzo","Gao","Baguinéda","Sikasso","Fana","Koutiala","Niena","Houndé"]);

B["boga"] = u(["Koza","Mayo Ouldémé","Kalkoussa","Gangue","Guirvidig","Blangoua","Méri","Dabanga","Hilé Alifa","Yagoua","Kalfou","Mokong","Bourrha","Koza","Roua","Zina","Maroua","Mokolo","Mindif","Moutourwa","Hina","Moskota","Mayo Tsanaga","Gazaoua","Gangue","Guirvidig","Blangoua","Méri","Dabanga","Hilé Alifa","Yagoua","Kalfou","Mokong","Bourrha","Waza","Bogo","Koza","Roua","Zina","Maroua","Mokolo","Mindif","Moutourwa","Hina","Moskota"]);

B["boghom"] = u(["Boghom","Jama'are","Bauchi","Potiskum","Misau","Darazo","Dass","Tafawa Balewa","Kirfi","Shira","Bi","Yana","Riruwai","Jalingo","Takum","Katsina Alkali","Ardo Kola","Gashaka","Bali","Wukari","Takum","Katsina Alkali","Ardo Kola","Gashaka","Bali","Wukari","Boghom","Jama'are","Bauchi","Potiskum","Misau","Darazo","Dass","Tafawa Balewa","Kirfi","Shira","Bi","Yana","Riruwai","Jalingo","Takum","Katsina Alkali","Ardo Kola","Gashaka","Bali"]);

B["bole-chadic-language"] = u(["Gombe","Misau","Shongom","Nafada","Azare","Deba","Biu","Kaltungo","Kwami","Billiri","Akko","Yana","Gamawa","Jamaare","Dukku","Waja","Balanga","Birnin Kebbi","Kalgo","Bunza","Gombe","Misau","Shongom","Nafada","Azare","Deba","Biu","Kaltungo","Kwami","Billiri","Akko","Yana","Gamawa","Jamaare","Dukku","Waja","Balanga","Birnin Kebbi","Kalgo","Bunza"]);

B["bole-niger-congo"] = u(["Jessu","Lau","Azare","Ningi","Warji","Ganjuwa","Dambam","Katagum","Bole","Kano","Kaduna","Jos","Bauchi","Gombe","Yola","Jalingo","Wukari","Takum","Bi","Shira","Kirfi","Darazo","Dass","Tafawa Balewa","Misau","Jessu","Lau","Azare","Ningi","Warji","Ganjuwa","Dambam","Katagum"]);

B["bolon"] = u(["Sikasso","Koutiala","Fana","San","Ségou","Mopti","Kati","Djenné","Koulikoro","Niono","Markala","Banamba","Kangaba","Kolokani","Dioila","Nara","Tin-Ellal","Kita","Bafoulabé","Kenieba","Manantali","Niokolo Koba","Bandafassi","Dindefelo","Segou","Fongolimbit","Ibel","Boundou","Sikasso","Koutiala","Fana","San","Ségou","Mopti","Kati","Djenné","Koulikoro","Niono","Markala","Banamba","Kangaba","Kolokani","Dioila","Nara","Tin-Ellal","Kita","Bafoulabé","Kenieba","Manantali","Niokolo Koba","Bandafassi","Dindefelo","Segou","Fongolimbit","Ibel","Boundou"]);

B["bomitaba"] = u(["Impfondo","Loukoléla","Bétou","Enyellé","Ewo","Kellé","Gamboma","Boda","Bimbo","Sibut","Kaga Bandoro","Batangafo","Bozoum","Bouar","Carnot","Berberati","Mbaïki","Yangambi","Alindao","Impfondo","Loukoléla","Bétou","Enyellé","Ewo","Kellé","Gamboma","Boda","Bimbo","Sibut","Kaga Bandoro","Batangafo","Bozoum","Bouar","Carnot","Berberati","Mbaïki","Yangambi","Alindao"]);

B["bomu"] = u(["Mali","Bamako","Segou","Mopti","Tombouctou","Gao","Kayes","Koutiala","Sikasso","San","Djenné","Bandiagara","Niono","Bla","Kati","Koulikoro","Kidal","Ménaka","Taoudénit","Kita","Mali","Bamako","Segou","Mopti","Tombouctou","Gao","Kayes","Koutiala","Sikasso","San","Djenné","Bandiagara","Niono","Bla","Kati","Koulikoro","Kidal","Ménaka","Taoudénit","Kita"]);

B["bongili"] = u(["Ewo","Kellé","Gamboma","Impfondo","Loukoléla","Bétou","Enyellé","Bossangoa","Batangafo","Bouar","Baboua","Bozoum","Carnot","Berberati","Bambari","Ippy","Yalinga","N'Délé","Mobaye","Ewo","Kellé","Gamboma","Impfondo","Loukoléla","Bétou","Enyellé","Bossangoa","Batangafo","Bouar","Baboua","Bozoum","Carnot","Berberati","Bambari","Ippy","Yalinga","N'Délé","Mobaye"]);

B["bongo"] = u(["Yambio","Tambura","Mundri","Maridi","Ezo","Nagero","Rambang","Rimenze","Mundo","Nambiri","Bazia","Sakure","Nabiapai","Ri Rangu","Barumbilu","Bagida","Yambio","Tambura","Mundri","Maridi","Ezo","Nagero","Rambang","Rimenze","Mundo","Nambiri","Bazia","Sakure","Nabiapai","Ri Rangu","Barumbilu","Bagida","Yambio","Tambura","Mundri","Maridi","Ezo","Nagero","Rambang","Rimenze","Mundo","Nambiri","Bazia","Sakure","Nabiapai","Ri Rangu","Barumbilu","Bagida"]);

B["bonjo"] = u(["Ituri","Ibambi","Djugu","Komanda","Mongwalu","Kakwa","Aru","Mahagi","Dungu","Faradje","Wamba","Mgbidi","Bafwasende","Opala","Yangambi","Kisangani","Ubundu","Lokolia","Yahuma","Lomela","Ituri","Ibambi","Djugu","Komanda","Mongwalu","Kakwa","Aru","Mahagi","Dungu","Faradje","Wamba","Mgbidi","Bafwasende","Opala","Yangambi","Kisangani","Ubundu","Lokolia","Yahuma","Lomela"]);

B["bono-ghana-ivory-coast"] = u(["Techiman","Wenchi","Berekum","Sunyani","Dormaa Ahenkko","Nsawkaw","Kintampo","Atebubu","Ejura","Yeji","Prang","Amenfi","Nsuaem","Tepa","Goase","Akumadan","Tanoboase","Nkoranza","Wamfie","Techiman","Wenchi","Berekum","Sunyani","Dormaa Ahenkko","Nsawkaw","Kintampo","Atebubu","Ejura","Yeji","Prang","Amenfi","Nsuaem","Tepa","Goase","Akumadan","Tanoboase","Nkoranza","Wamfie"]);

B["boor"] = u(["Azare","Dambatta","Ningi","Jama'are","Misau","Biu","Kazaure","Gumel","Hadejia","Katagum","Gamawa","Jamaare","Dutse","Ringim","Garki","Keffin Hausa","Daraz","Toro","Misau","Shongom","Nafada","Deba","Azare","Dambatta","Ningi","Jama'are","Misau","Biu","Kazaure","Gumel","Hadejia","Katagum","Gamawa","Jamaare","Dutse","Ringim","Garki","Keffin Hausa","Daraz","Toro","Misau","Shongom","Nafada","Deba"]);

B["budza"] = u(["Kwamouth","Mangai","Masi Manimba","Gungu","Idiofa","Feshi","Kahemba","Bagata","Yangambi","Lomela","Banalia","Turumbu","Kikwit","Opala","Bulungu","Isangi","Kenge","Kasongo Lunda","Lokolia","Yahuma","Kwamouth","Mangai","Masi Manimba","Gungu","Idiofa","Feshi","Kahemba","Bagata","Yangambi","Lomela","Banalia","Turumbu","Kikwit","Opala","Bulungu","Isangi","Kenge","Kasongo Lunda","Lokolia","Yahuma"]);

B["buli"] = u(["Kaltungo","Nafada","Azare","Deba","Shongom","Kwami","Billiri","Akko","Gamawa","Jamaare","Dukku","Waja","Balanga","Misau","Katagum","Ningi","Hadejia","Gumel","Kazaure","Darazo","Kaltungo","Nafada","Azare","Deba","Shongom","Kwami","Billiri","Akko","Gamawa","Jamaare","Dukku","Waja","Balanga","Misau","Katagum","Ningi","Hadejia","Gumel","Kazaure","Darazo"]);

B["bulu"] = u(["Ebolowa","Sangmélima","Ambam","Lolodorf","Campo","Bipindi","Kribi","Eseka","Makak","Ngoulemakong","Messondo","Batanga","Ngoyang","Efoulan","Bitam","Oyem","Makokou","Mitzic","Ebolowa","Sangmélima","Ambam","Lolodorf","Campo","Bipindi","Kribi","Eseka","Makak","Ngoulemakong","Messondo","Batanga","Ngoyang","Efoulan","Bitam","Oyem","Makokou","Mitzic"]);

B["bura"] = u(["Biu","Shani","Bayo","Kwaya Kusar","Hawul","Kurana","Askira","Gongola","Uba","Gulak","Madagali","Michika","Mubi","Gwoza","Damboa","Konduga","Jonkpanti","Meri","Dille","Nguranna","Biu","Shani","Bayo","Kwaya Kusar","Hawul","Kurana","Askira","Gongola","Uba","Gulak","Madagali","Michika","Mubi","Gwoza","Damboa","Konduga","Jonkpanti","Meri","Dille","Nguranna"]);

B["bushong"] = u(["Mbuji Mayi","Tshilenge","Kabeya Kamwanga","Katanda","Mwene Ditu","Luputa","Ngandajika","Kazumba","Weji","Kabinda","Bena Tshishimbi","Kasaji","Mutshatsha","Dilolo","Kapanga","Kasongo Lunda","Kwamouth","Feshi","Kahemba","Bagata","Mbuji Mayi","Tshilenge","Kabeya Kamwanga","Katanda","Mwene Ditu","Luputa","Ngandajika","Kazumba","Weji","Kabinda","Bena Tshishimbi","Kasaji","Mutshatsha","Dilolo","Kapanga","Kasongo Lunda","Kwamouth","Feshi","Kahemba","Bagata"]);

B["buwal"] = u(["Njinikijem","Tabenken","Ndu","Tatum","Bafanji","Balikumbat","Baba","Babessi","Bamenyam","Nkambe","Oku","Kom","Boyo","Mundemba","Ngie","Bafang","Dschang","Mbouda","Bangangté","Bana","Banka","Batcham","Bazou","Kouoptamo","Malentouen","Massangam","Petté","Tcholliré","Mankon","Nkwen","Mbatu","Esu","Jakiri","Jarum","Nev","Fengwe","Chup","Folepi","Wum","Njinikom","Bafut","Zhoa"]);

B["buyu"] = u(["Kalemie","Uvira","Fizi","Baraka","Bukavu","Kabare","Walungu","Kavumu","Kasongo","Kamina","Kabalo","Kongolo","Nyunzu","Manono","Kabanga","Kongila","Itumba","Kasika","Kalemie","Uvira","Fizi","Baraka","Bukavu","Kabare","Walungu","Kavumu","Kasongo","Kamina","Kabalo","Kongolo","Nyunzu","Manono","Kabanga","Kongila","Itumba","Kasika"]);

B["bwela"] = u(["Katima Mulilo","Sesheke","Senanga","Mongu","Kalabo","Shangombo","Kaoma","Mwandi","Kasempa","Zambezi","Ngonye","Simungoma","Silalo","Lubosi","Lilonga","Ndau","Sitoti","Chingenge","Mukumbutu","Mulumbi","Lukulu","Mitete","Kabompo","Chavuma","Mwinilunga","Ikelenge","Kalumbila","Katima Mulilo","Sesheke","Senanga","Mongu","Kalabo","Shangombo","Kaoma","Mwandi","Kasempa","Zambezi","Ngonye","Simungoma","Silalo","Lubosi","Lilonga","Ndau","Sitoti","Chingenge","Mukumbutu","Mulumbi","Lukulu","Mitete","Kabompo","Chavuma","Mwinilunga","Ikelenge"]);

// Print counts
for (const [k,v] of Object.entries(B)) console.log(k + ': ' + v.length);
console.log('Total unique names used:', used.size);

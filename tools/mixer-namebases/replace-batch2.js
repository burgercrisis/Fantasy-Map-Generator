#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../modules/namebases-real.js');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
  { search: '{ name: "Greater Magaric (dedicated)"', replace: '{ name: "Greater Magaric (dedicated)', i: 8634, min: 4, max: 11, d: "lnrt", m: 0, b: "Gandaki,Sirkot,Magardi,Magart,Mugachor,Palpa,Bhutia,Rampur,Tadag" }' },
  { search: '{ name: "Magaric (dedicated)"', replace: '{ name: "Magaric (dedicated)", i: 8635, min: 4, max: 11, d: "lnrt", m: 0, b: "Magar,Gandaki,Gurkha,Palpa,Bhutia,Myagdi,Tadag,Chauparana" }' },
  { search: '{ name: "Magar (dedicated)"', replace: '{ name: "Magar (dedicated)", i: 8636, min: 4, max: 11, d: "lnrt", m: 0, b: "Magar,Magart,Mugachor,Chauparana,Chhintang,Gandaki,Gurkha,Tadag,Rampur" }' },
  { search: '{ name: "Mgp (dedicated)"', replace: '{ name: "Mgp (dedicated)", i: 8637, min: 4, max: 11, d: "lnrt", m: 0, b: "Kohima,Mara,Chhintang,Tadag,Gandaki,Magart,Rampur,Bhutia,Chauparana" }' },
  { search: '{ name: "Kip (dedicated)"', replace: '{ name: "Kip (dedicated)", i: 8638, min: 4, max: 11, d: "lnrt", m: 0, b: "Kohima,Chhintang,Tadag,Mugachor,Gandaki,Magart,Rampur,Bhutia,Chauparana,Mar" }' },
  { search: '{ name: "Drq (dedicated)"', replace: '{ name: "Drq (dedicated)", i: 8639, min: 4, max: 11, d: "lnrt", m: 0, b: "Dolpo,Pajok,Tadag,Kohima,Mar,Mugachor,Gandaki,Bhutia,Rampur" }' },
  { search: '{ name: "Japanese regional lects (dedicated)"', replace: '{ name: "Japanese regional lects (dedicated)", i: 8643, min: 4, max: 10, d: "", m: 0, b: "Kansai,Kanto,Tohoku,Hokkaido,Chugoku,Shikoku,Kyushu,Okinawa,Ryukyu,Ogasawara,Amami,Tsugaru,Yaeyama,Emori,Tsushima,Kagoshima,Goto" }' },
  { search: '{ name: "Kanbun Kundoku (dedicated)"', replace: '{ name: "Kanbun Kundoku (dedicated)", i: 8644, min: 4, max: 10, d: "", m: 0, b: "Kyoto,Nara,Osaka,Kobe,Kanazawa,Otsu,Kyoto,Fujiwara,Wakayama,Himeji,Heian,Nara-Heijo,Kyoto-Osaka" }' },
  { search: '{ name: "Mao-Omotic (dedicated)"', replace: '{ name: "Mao-Omotic (dedicated)", i: 8650, min: 4, max: 11, d: "lnrt", m: 0, b: "Shinasha,Bench,Maji,Gamuz,Hamer,Bodi,Weyto,Zergula,Kaffa,Gidicho,Hadiya,Yem,Harari,Ongota,Chara" }' },
  { search: '{ name: "North Omotic (dedicated)"', replace: '{ name: "North Omotic (dedicated)", i: 8651, min: 4, max: 11, d: "lnrt", m: 0, b: "Kafa,Gidicho,Maji,Bodi,Weyto,Zergula,Ongota,Harari,Ometo,Gamo,Gongola,Doko,Dirasha,Kachama,Bere,Hamta" }' },
  { search: '{ name: "Ometo (dedicated)"', replace: '{ name: "Ometo (dedicated)", i: 8652, min: 4, max: 11, d: "lnrt", m: 0, b: "Weyto,Zergula,Yem,Gamuz,Doko,Chara,Bench,Harari,Ongota,Maji,Bodi,Gidicho,Kafa,Ometo,Kemant,Kemate" }' },
  { search: '{ name: "Piapoco (dedicated)"', replace: '{ name: "Piapoco (dedicated)", i: 8653, min: 4, max: 11, d: "lnrt", m: 0, b: "Puerto Carreno,Colombia,Casanare,Puerto Inirida,Vichada,Meta,Guaviare,Vaupes,Arauca,Maquipal,Tame" }' },
  { search: '{ name: "Wapishana (dedicated)"', replace: '{ name: "Wapishana (dedicated)", i: 8655, min: 4, max: 11, d: "lnrt", m: 0, b: "Boa Vista,Roraima,Roraima,Brasil,Santa Maria do Pará,Baependi,Cuiabá,Barra do Garças" }' },
  { search: '{ name: "Chepangic (dedicated)"', replace: '{ name: "Chepangic (dedicated)", i: 8665, min: 4, max: 11, d: "lnrt", m: 0, b: "Sindhupalchok,Khotang,Dandaga,Taplejung,Ryang,Syabrung,Khotangche,Taplejungche,Ryangche,Sindhuli,Khotang,Dandagche,Taplejungche" }' },
  { search: '{ name: "Chiang Saen (dedicated)"', replace: '{ name: "Chiang Saen (dedicated)", i: 8667, min: 4, max: 11, d: "lnrt", m: 0, b: "Chiang Saen,Chiang Rai,Chiang Khong,Nan,Lampang,Lampang Province" }' },
  { search: '{ name: "Chichewa (dedicated)"', replace: '{ name: "Chichewa (dedicated)", i: 8668, min: 4, max: 11, d: "lnrt", m: 0, b: "Blantyre,Zomba,Lilongwe,Mwanza,Dedza,Salima,Karonga,Mzuzu,Lilongwe" }' },
  { search: '{ name: "Chimbu (dedicated)"', replace: '{ name: "Chimbu (dedicated)", i: 8669, min: 4, max: 11, d: "lnrt", m: 0, b: "Chimbu,Chuave,Dimbug,Kudjip,Wabag,Mount Wilhelm,Mendi,Wabag Town,Chimbu Town,Wabag River" }' },
  { search: '{ name: "Fut (dedicated)"', replace: '{ name: "Fut (dedicated)", i: 8610, min: 4, max: 11, d: "lnrt", m: 0, b: "Fut,Futa-Jalon,Futa,Jallon,Futa,Bandialu,Tombuctou,Labé,Kankalaba,Bafoulabé" }' },
  { search: '{ name: "Soninke (dedicated)"', replace: '{ name: "Soninke (dedicated)", i: 8611, min: 4, max: 11, d: "lnrt", m: 0, b: "Kayes,Kita,Mali,Bamako,Nioro du Sahel,Yélimané,Nioro,Ségou,Yélimané,Mali" }' },
  { search: '{ name: "Chung (dedicated)"', replace: '{ name: "Chung (dedicated)", i: 8612, min: 4, max: 11, d: "lnrt", m: 0, b: "Chung,Sok,Kong,Nkomi,Monie,Ekona,Dzeng,Bas-Uele,Chumvi" }' },
  { search: '{ name: "Dciriku (dedicated)"', replace: '{ name: "Dciriku (dedicated)", i: 8613, min: 4, max: 11, d: "lnrt", m: 0, b: "Dciriku,Masham,Kong,Nkomi,Bas-Uelle,Chumvi,Chum,Ekona,Sok,Chung" }' },
  { search: '{ name: "Defaka (dedicated)"', replace: '{ name: "Defaka (dedicated)", i: 8614, min: 4, max: 11, d: "lnrt", m: 0, b: "Defaka,Calabar,Cross River,Nigeria" }' },
  { search: '{ name: "Changjiang Hlai (dedicated)"', replace: '{ name: "Changjiang Hlai (dedicated)", i: 8615, min: 4, max: 11, d: "lnrt", m: 0, b: "Changjiang,Hainan,Sanya,Ledong,Baisha,Lingshui,Qiongshan,Tongcheng,Danzhou,Dongfang" }' },
  { search: '{ name: "Chavacano (dedicated)"', replace: '{ name: "Chavacano (dedicated)", i: 8616, min: 4, max: 11, d: "lnrt", m: 0, b: "Zamboanga,Chavacano,Cotabato,Cotabato,Zamboanga City,Cavite City,Cavite,Chavacano,Cotabato,Cavite" }' },
  { search: '{ name: "Chenchu (dedicated)"', replace: '{ name: "Chenchu (dedicated)", i: 8618, min: 4, max: 11, d: "lnrt", m: 0, b: "Chenchu,Odisha,India,Koraput,Phulbani,Raigarha,Sambalpur,Sundergarh" }' },
  { search: '{ name: "Daba (dedicated)"', replace: '{ name: "Daba (dedicated)", i: 9316, min: 4, max: 11, d: "lnrt", m: 0, b: "Daba,Iduwe,Adamawa,Jos,Mubi,Ngala,Akoko,Dukku,Geidam" }' },
  { search: '{ name: "Dadanitic (dedicated)"', replace: '{ name: "Dadanitic (dedicated)", i: 9317, min: 4, max: 11, d: "lnrt", m: 0, b: "Dadanitic,Dedan,Saudi Arabia,Ancient South Arabian,Tayma,Oman" }' },
  { search: '{ name: "Daga (dedicated)"', replace: '{ name: "Daga (dedicated)", i: 9318, min: 4, max: 11, d: "lnrt", m: 0, b: "Daga,Chad,Cameroon,Nigeria,Central African Republic" }' },
  { search: '{ name: "Dagur (dedicated)"', replace: '{ name: "Dagur (dedicated)", i: 9319, min: 4, max: 11, d: "lnrt", m: 0, b: "Dagur,Daghestan,Bamyan,Chad" }' },
  { search: '{ name: "Dahalik (dedicated)"', replace: '{ name: "Dahalik (dedicated)", i: 9365, min: 4, max: 11, d: "lnrt", m: 0, b: "Dahalik,Chad" }' },
  { search: '{ name: "Dai Zhuang (dedicated)"', replace: '{ name: "Dai Zhuang (dedicated)", i: 9366, min: 4, max: 11, d: "lnrt", m: 0, b: "Dai Zhuang,Guangxi,China,Napo,Baise,Sanjiang,Du\'an,Yulin,Hechi,Nandan,Qinzhou,Guigang,Wuzhou,Laibin" }' },
  { search: '{ name: "Damu (dedicated)"', replace: '{ name: "Damu (dedicated)", i: 9367, min: 4, max: 11, d: "lnrt", m: 0, b: "Damu,Papua New Guinea,Madang,Morobe,Gulf,Huon Gulf,Eastern Highlands" }' },
  { search: '{ name: "Dani (dedicated)"', replace: '{ name: "Dani (dedicated)", i: 9368, min: 4, max: 11, d: "lnrt", m: 0, b: "Dani,Wamena,Wosilimo,Wolo,Assologajma,Mokongame,Kelila,Mugi,Wano,Lapago,Baliem Valley,Jiwika,Ikyak,Kurima" }' },
  { search: '{ name: "Dano (dedicated)"', replace: '{ name: "Dano (dedicated)", i: 9369, min: 4, max: 11, d: "lnrt", m: 0, b: "Dano,Nigeria,Africa,Northern Nigeria,Kano,Bauchi" }' },
  { search: '{ name: "Dao (dedicated)"', replace: '{ name: "Dao (dedicated)", i: 9415, min: 4, max: 11, d: "lnrt", m: 0, b: "Dao,Guizhou,China,Yunnan,Guizhou Prefecture,Nujiang,Lijiang,Dali" }' },
  { search: '{ name: "Dap (dedicated)"', replace: '{ name: "Dap (dedicated)", i: 9416, min: 4, max: 11, d: "lnrt", m: 0, b: "Dap,Philippines,Agusan del Sur,Bukidnon,Davao del Sur" }' },
  { search: '{ name: "Dargwa (dedicated)"', replace: '{ name: "Dargwa (dedicated)", i: 9417, min: 4, max: 11, d: "lnrt", m: 0, b: "Dargwa,Nigeria,Zamfara,Kebbi,Kano,Katsina" }' },
  { search: '{ name: "Dari (dedicated)"', replace: '{ name: "Dari (dedicated)", i: 9418, min: 4, max: 11, d: "lnrt", m: 0, b: "Dari,Afghanistan,Dari Persian Language,Kabul,Afghanistan" }' },
  { search: '{ name: "Darkhad (dedicated)"', replace: '{ name: "Darkhad (dedicated)", i: 9419, min: 4, max: 11, d: "lnrt", m: 0, b: "Darkhad,Darkhad,Tibet Autonomous Region,China,Lhasa,Xigaze" }' },
  { search: '{ name: "Dass language (dedicated)"', replace: '{ name: "Dass language (dedicated)", i: 9465, min: 4, max: 11, d: "lnrt", m: 0, b: "Dass language,Nigeria,Bauchi State,Shira,Bauchi,Dass" }' },
  { search: '{ name: "Daza (dedicated)"', replace: '{ name: "Daza (dedicated)", i: 9466, min: 4, max: 11, d: "lnrt", m: 0, b: "Daza,Chad,Kanem,Chad" }' },
  { search: '{ name: "Dazawa language (dedicated)"', replace: '{ name: "Dazawa language (dedicated)", i: 9467, min: 4, max: 11, d: "lnrt", m: 0, b: "Dazawa,Nigeria,Zamfara,Kebbi,Dargwa,Nigeria" }' },
  { search: '{ name: "Ddo (dedicated)"', replace: '{ name: "Ddo (dedicated)", i: 9468, min: 4, max: 11, d: "lnrt", m: 0, b: "Ddo,Nigeria,Nigeria,Kaduna State,Zamfara,Guiri,Kaduna" }' },
  { search: '{ name: "Deh (dedicated)"', replace: '{ name: "Deh (dedicated)", i: 9469, min: 4, max: 11, d: "lnrt", m: 0, b: "Deh,Ethiopia,Southwestern Ethiopia,Kafa Zone,Jimma Zone,Oromia" }' },
  { search: '{ name: "Kakkala (dedicated)"', replace: '{ name: "Kakkala (dedicated)", i: 9570, min: 4, max: 11, d: "lnrt", m: 0, b: "Kakkala,Ethiopia,Oromia Zone,Guji Zone,Goma Zone,Gambela,Gololcha,Jimma,Horo Guduru" }' },
  { search: '{ name: "Kalanadi (dedicated)"', replace: '{ name: "Kalanadi (dedicated)", i: 9571, min: 4, max: 11, d: "lnrt", m: 0, b: "Kalanadi,Ethiopia,Oromia Region,West Guji Zone,Buno Bedele Zone,Kalu Woreda" }' },
  { search: '{ name: "Kanikkaran (dedicated)"', replace: '{ name: "Kanikkaran (dedicated)", i: 9572, min: 4, max: 11, d: "lnrt", m: 0, b: "Kanikkaran,Ethiopia,Oromia Region,East Guji Zone,Bedeno Zone,Goro Zone,Liben Zone,Menz" }' },
  { search: '{ name: "Khirwar (dedicated)"', replace: '{ name: "Khirwar (dedicated)", i: 9573, min: 4, max: 11, d: "lnrt", m: 0, b: "Khirwar,Ethiopia,Gurage Zone,Borana Zone,Menz,SNNPR" }' },
  { search: '{ name: "Dendi (dedicated)"', replace: '{ name: "Dendi (dedicated)", i: 9516, min: 4, max: 11, d: "lnrt", m: 0, b: "Dendi,Ethiopia,Oromia Region,Hadiya Zone,Sheka Zone,Bedi Zone,Menz,Ginir" }' },
  { search: '{ name: "Dengese (dedicated)"', replace: '{ name: "Dengese (dedicated)", i: 9517, min: 4, max: 11, d: "lnrt", m: 0, b: "Dengese,Ethiopia,Oromia Region,Gimbi Zone,Ancharo Zone,Dinsho,Buno Zone" }' },
  { search: '{ name: "Deno language (dedicated)"', replace: '{ name: "Deno language (dedicated)", i: 9518, min: 4, max: 11, d: "lnrt", m: 0, b: "Deno language,Ethiopia,Afroasiatic Language,Afroasiatic,Maji Language,Dengibu Language,Dizi Language,Endegegn" }' },
  { search: '{ name: "Densar (dedicated)"', replace: '{ name: "Densar (dedicated)", i: 9519, min: 4, max: 11, d: "lnrt", m: 0, b: "Densar,Ethiopia,Afroasiatic Language,Afroasiatic,Endegegn Language,Maji Language,Bodi Language,Gidole Language" }' },
  { search: '{ name: "Derung (dedicated)"', replace: '{ name: "Derung (dedicated)", i: 9980, min: 4, max: 11, d: "lnrt", m: 0, b: "Derung,Qinghai,Yunnan,Sichuan,China,Baoshan,Dali,Lijiang,Xichang,Deqen,Kunming,Dukou" }' },
  { search: '{ name: "Dghwede language (dedicated)"', replace: '{ name: "Dghwede language (dedicated)", i: 9981, min: 4, max: 11, d: "lnrt", m: 0, b: "Dghwede language,Nigeria,Borno State,Bi,Biu,Bama,Kukawa,Maiduguri,Mafa" }' },
  { search: '{ name: "Dhakaiya Kutti Bengali (dedicated)"', replace: '{ name: "Dhakaiya Kutti Bengali (dedicated)", i: 9982, min: 4, max: 11, d: "lnrt", m: 0, b: "Dhakaiya Kutti Bengali,West Bengal,India,Kolkata,Howrah,Hooghly,Burdwan,Asansol,Bankura,Baruipur" }' },
  { search: '{ name: "Dhivehi (dedicated)"', replace: '{ name: "Dhivehi (dedicated)", i: 9983, min: 4, max: 11, d: "lnrt", m: 0, b: "Dhivehi,Maldives,Male,Kulhudhuffushi,Mafushi,Fuvahmulah,Hanimaadhoo,Maldives" }' },
  { search: '{ name: "Dida (dedicated)"', replace: '{ name: "Dida (dedicated)", i: 9984, min: 4, max: 11, d: "lnrt", m: 0, b: "Dida,Ethiopia,Oromia Region,Gurage Zone,Alaba Zone,Alaba Woreda" }' },
  { search: '{ name: "Dima (dedicated)"', replace: '{ name: "Dima (dedicated)", i: 9985, min: 4, max: 11, d: "lnrt", m: 0, b: "Dima,Ethiopia,Oromia Region,Hadiya Zone,Sheka Zone,Bedi Zone,Ginir" }' },
  { search: '{ name: "Dullay (dedicated)"', replace: '{ name: "Dullay (dedicated)", i: 10031, min: 4, max: 11, d: "lnrt", m: 0, b: "Dullay,Ethiopia,Oromia Region,Guji Zone,Buno Bedele Zone,Kalu Woreda,Nagele" }' },
  { search: '{ name: "Duna (dedicated)"', replace: '{ name: "Duna (dedicated)", i: 10032, min: 4, max: 11, d: "lnrt", m: 0, b: "Duna,Ethiopia,Oromia Region,West Hararghe Zone,Nekemte Zone,Hababo Zone" }' },
  { search: '{ name: "Duruwa (dedicated)"', replace: '{ name: "Duruwa (dedicated)", i: 10033, min: 4, max: 11, d: "lnrt", m: 0, b: "Duruwa,Ethiopia,Oromia Region,West Hararghe Zone,Nekemte Zone,Nagele,Bona" }' },
  { search: '{ name: "E mixed (dedicated)"', replace: '{ name: "E mixed (dedicated)", i: 10380, min: 4, max: 11, d: "lnrt", m: 0, b: "E mixed,Ethiopia,Afroasiatic Language,Omotu Language,Maji Language,Gidole Language,Yem,Harari,Ometo" }' },
  { search: '{ name: "Early Modern Korean (dedicated)"', replace: '{ name: "Early Modern Korean (dedicated)", i: 10381, min: 4, max: 11, d: "", m: 0, b: "Seoul,Kaesong,Gwangju,Incheon,Daegu,Busan,Ulsan,Jeonju,Gwangju,Jinju" }' },
  { search: '{ name: "East Bodish (dedicated)"', replace: '{ name: "East Bodish (dedicated)", i: 10382, min: 4, max: 11, d: "lnrt", m: 0, b: "East Bodish,Bhutan,Tibet Autonomous Region" }' },
  { search: '{ name: "East Chadic (dedicated)"', replace: '{ name: "East Chadic (dedicated)", i: 10383, min: 4, max: 11, d: "lnrt", m: 0, b: "East Chadic,Chad,NDjamena,Moundou,N\'Djamena,Sarh,Abéché,Mao,Kanem,Bokoro,Bebdijada" }' },
  { search: '{ name: "East Zenati (dedicated)"', replace: '{ name: "East Zenati (dedicated)", i: 10384, min: 4, max: 11, d: "lnrt", m: 0, b: "East Zenati,Libya,Zuwarah,Zawiya,Zliten,Ajdabiya,Tajuray,Zuwara,Ghadames,Mizda,Al Qatrun,Nalut" }' },
  { search: '{ name: "Eastern Berber (dedicated)"', replace: '{ name: "Eastern Berber (dedicated)", i: 10480, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Berber,Libya,Awjilah,Nafusah,Murzuq,Ghadames,Ghat,Mizda,Zuwarah,Zliten" }' },
  { search: '{ name: "Eastern Estonian (dedicated)"', replace: '{ name: "Eastern Estonian (dedicated)", i: 10481, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Estonian,Estonia,Narva,Tartu,Viljandi,Voruma,Valga,Rakvere,Voru,Võru,Kuremae,Lääne-Viru,Põltsamaa" }' },
  { search: '{ name: "Eastern Himalayas (dedicated)"', replace: '{ name: "Eastern Himalayas (dedicated)", i: 10482, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Himalayas,Tibet Autonomous Region,Lhasa,Shigatse,Nyingchi,Qamdo,Barkam,Nagqu,Lhokha,Shannan" }' },
  { search: '{ name: "Eastern Itelmen (dedicated)"', replace: '{ name: "Eastern Itelmen (dedicated)", i: 10483, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Itelmen,Kamchatka,Karagas,Taykory,Khaykha,Koryak,Kuyada,Palana,Komsomolsk,Sedanka,Seimchan,Penchinskaya" }' },
  { search: '{ name: "Eastern Middle Atlas Berber (dedicated)"', replace: '{ name: "Eastern Middle Atlas Berber (dedicated)", i: 10580, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Middle Atlas Berber,Algeria,Morocco,Middle Atlas,Taza,Guercif,Azilal,Ifrane,Beni Mellal,Khenifra" }' },
  { search: '{ name: "Eastern Min (dedicated)"', replace: '{ name: "Eastern Min (dedicated)", i: 10581, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Min,Fujian,Zhejiang,Guangdong,Ningde,Liancheng,Lianjiang,Gutian,Longyan,Sanming,Xianning,Pingtan,Longyan City" }' },
  { search: '{ name: "Eastern Morocco Zenati (dedicated)"', replace: '{ name: "Eastern Morocco Zenati (dedicated)", i: 10582, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Morocco Zenati,Morocco,Oujda,Nador,Al Hoceima,Taza,Tan-Tan,Guercif,Temsaman,El Jadida" }' },
  { search: '{ name: "Eastern Savonian (dedicated)"', replace: '{ name: "Eastern Savonian (dedicated)", i: 10583, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Savonian,Fiji,Labasa,Viti Levu,Nausori,Levuka,Moala,Lakeba,Bua,Rakiraki,Kadavu,Taveuni" }' },
  { search: '{ name: "Eastern South Estonian (dedicated)"', replace: '{ name: "Eastern South Estonian (dedicated)", i: 10584, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern South Estonian,Estonia,Võru,Viljandi,Valga,Setomaa,Kehra,Lääne-Viru,Peipsiäare,Põltsamaa" }' },
  { search: '{ name: "Eastern Votic (dedicated)"', replace: '{ name: "Eastern Votic (dedicated)", i: 10730, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Votic,Estonia,Lääne-Viru,Kodasööde,Alatski,Koorti,Kulli,Kõpu,Käsmu,Kolga,Lüganuse" }' },
  { search: '{ name: "Eastern Yugur (dedicated)"', replace: '{ name: "Eastern Yugur (dedicated)", i: 10731, min: 4, max: 11, d: "lnrt", m: 0, b: "Eastern Yugur,China,Qinghai,Gansu,Hami,Hebei,Hohhot,Shaanxi,Zhengzhou,Chifeng,Chengde,Jining" }' },
  { search: '{ name: "Edolo (dedicated)"', replace: '{ name: "Edolo (dedicated)", i: 10733, min: 4, max: 11, d: "lnrt", m: 0, b: "Edolo,Ethiopia,Oromia Region,Gurage Zone,Borana Zone,Bedeno Zone,Menz,Ginir" }' },
  { search: '{ name: "Dhd (dedicated)"', replace: '{ name: "Dhd (dedicated)", i: 10280, min: 4, max: 11, d: "lnrt", m: 0, b: "Dhd,Ethiopia,Oromia Region,Borana Zone,Bedeno Zone,Menz,Ginir" }' },
  { search: '{ name: "Dinka (dedicated)"', replace: '{ name: "Dinka (dedicated)", i: 10281, min: 4, max: 11, d: "lnrt", m: 0, b: "Dinka,South Sudan,Aweil,Bor,Ethiopia,Bor,Jonglei,Gogrial,Abyei,Aliap,Wau,Pariang,Aliap,Twic,Aliap,Yirol,Yirol,Aliap" }' },
  { search: '{ name: "Duan Bahnaric (dedicated)"', replace: '{ name: "Duan Bahnaric (dedicated)", i: 10431, min: 4, max: 11, d: "lnrt", m: 0, b: "Duan Bahnaric,Vietnam,Kon Tum,Dong Nai,Cao Bang,Lam Dong,Bac Ninh,Tay Ninh,Dong Thap,Nghe An,Hoa Binh,Quang Ngai,Vinh Phuc,Binh Dinh,Phu Yen" }' },
  { search: '{ name: "Duvle Wano Pidgin (dedicated)"', replace: '{ name: "Duvle Wano Pidgin (dedicated)", i: 10432, min: 4, max: 11, d: "lnrt", m: 0, b: "Duvle Wano Pidgin,Papua New Guinea,Sandaun,Duvle,Vanimo,Wapi,Biak,Lae,Purari,Uramu,Wapenamana,Nembi,Kiunga,Mendi,Moroobe" }' },
  { search: '{ name: "Duwai language (dedicated)"', replace: '{ name: "Duwai language (dedicated)", i: 10433, min: 4, max: 11, d: "lnrt", m: 0, b: "Duwai language,Papua New Guinea,Wapenamana,Mendi,Kiunga,Moroobe,Duvle,Wapenamana,Strickland,Sandaun,Lae,Purari,Uramu,Vanimo" }' },
  { search: '{ name: "Dwz (dedicated)"', replace: '{ name: "Dwz (dedicated)", i: 10434, min: 4, max: 11, d: "lnrt", m: 0, b: "Dwz,Papua New Guinea,Strickland,Sandaun,West New Britain,Kimbe,Patpatar,Vatanga,Kove,Uvol,Nakanai,Rabaul" }' },
  { search: '{ name: "Arh (dedicated)"', replace: '{ name: "Arh (dedicated)", i: 10280, min: 4, max: 11, d: "lnrt", m: 0, b: "Arh,Nepal,Chitwan,Sankhuwa,Sunthari,Humla,Taklakot,Takladho,Khumbu,Taplejong,Lamjung,Taksindu,Parbat,Rukumkot,Tanahu,Taksera,Taksindu,Tumlingtak,Danda" }' }
];

let count = 0;
replacements.forEach(repl => {
  if (content.includes(repl.search)) {
    content = content.replace(repl.search, repl.replace);
    count++;
  }
});

if (count > 0) {
  const backupPath = filePath + '.backup-batch2';
  const originalContent = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync(backupPath, originalContent);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Replaced ${count} languages`);
  console.log(`📦 Backup: ${backupPath}`);
  console.log(`📄 Updated: ${filePath}`);
} else {
  console.log('No matching entries found');
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log(`BATCH 2 SUMMARY`);
console.log('═══════════════════════════════════════════════════════════════════\n');
console.log(`Replacements made: ${count}`);
console.log('\nNext steps:');
console.log('1. Run verification script to verify improvements');
console.log('2. Continue with remaining Primus placeholders');
console.log('3. Test map generation');
console.log('\nRemaining high priority languages need manual research');
console.log('═══════════════════════════════════════════════════════════════════\n');

#!/usr/bin/env python3
"""Script to safely expand Oceanian language namebases"""

import re

# Read the original file
with open("modules/namebases-oceania.js", "r", encoding="utf-8") as f:
    content = f.read()

# Dictionary of expansions to make
# Format: (old_b_value, new_b_value)
expansions = {
    # Melanesian Vanuatu (i:53)
    '"b": "Port Vila,Luganville,Norsup,Sola,Saratamata,Longana,Lakatoro,Norfolk,Isangel,Lenakel,Litzlitz,Loltong,Mota Lava,Louganville,Auki,Honiara,Gizo,Munda,Tulagi"': '"b": "Port Vila,Luganville,Norsup,Sola,Saratamata,Longana,Lakatoro,Norfolk,Isangel,Lenakel,Litzlitz,Loltong,Mota Lava,Louganville,Auki,Honiara,Gizo,Munda,Tulagi,Avire,Bunlap,Butmas,Endu,Forari,Ipikil,Ipota,Port Olry,Rovo Bay,Sulphur Bay,Whitesands,Martin,Loron,Pango,Mele,Erakor"',
    # Central Pacific (i:55)
    '"b": "Apia,Faleula,Vaitele,Siusega,Malie,Afega,Fasitoo,Uafato,Nuku\'alofa,Neiafu,Pangai,Hakahau,Matavai,Papeete,Punaauia,Faaa,Paopao,Uturoa,Taiohae,TaiohaeVillage"': "\"b\": \"Apia,Faleula,Vaitele,Siusega,Malie,Afega,Fasitoo,Uafato,Nuku'alofa,Neiafu,Pangai,Hakahau,Matavai,Papeete,Punaauia,Faaa,Paopao,Uturoa,Taiohae,TaiohaeVillage,Salelologa,Asau,Safotu,Satupaitea,Lalomanu,Falealili,Falealupo,Gataivai,Lautoka,Nasinu,Nausori,Nadi,Labasa,Sigatoka,Tavua,Navua,Levuka,Savusavu,Lifuka,Foa,Ha'ano,Ohonua,Hihifo,Vaini,Kolovai,Ha'apai,Vava'u,Eua\"",
    # Admiralty (i:2149)
    '"b": "Lorengau,Manus,Los-Negros,Pak,Rambutyo,Lou,Baluan,MBuke,Bipi,Hermit,Ninigo,Wuvulu"': '"b": "Lorengau,Manus,Los-Negros,Pak,Rambutyo,Lou,Baluan,MBuke,Bipi,Hermit,Ninigo,Wuvulu,Alokuk,Aran,Badlock,Bohuai,Bowat,Auna,Bapi,Baun,Luf,Mal,Mbuke,Nauna,Ndrilo,Ponam,Pityilu,Pokali,Rangi,Sae,Suf,Tatak,Tong,Kalipo,Laualau,Liot,Little Ndrova,Big Ndrova,Sisi Liu,Jalun,Analtin,Aua,Warl,Barely,Bariyoe,Bunca"',
    # Alor-Pantar (i:2151)
    '"b": "Kalabahi,Baranusa,Kabir,Blangmerang,Maritaing,Moru,Apui,Alor-Kecil,Kokar,Mainang,Wolwal,Matar"': '"b": "Kalabahi,Baranusa,Kabir,Blangmerang,Maritaing,Moru,Apui,Alor-Kecil,Kokar,Mainang,Wolwal,Matar,Kepa,Buaya,Ternate,Pura,Treweng,Kura,Kangge,Sika,Nub,Kapas,Batang,Lapang,Rusa,Tikus,Kambing,Bakel,Bampalola,Halerman,Ilawe,Mali,Mataru,Takpala,Welolo,Ling\'al,Tiga Warna,Tuti Adagae,Ampera,Burubeba,Deleng,Sikka"',
    # Anim languages (i:2153)
    '"b": "Merauke,Okaba,Kimaam,Muting,Jeti,Kurik,Tanah-Miring,Semangga,Sota,Ulilin,Eligobel,Tubang"': '"b": "Merauke,Okaba,Kimaam,Muting,Jeti,Kurik,Tanah-Miring,Semangga,Sota,Ulilin,Eligobel,Tubang,Bambam,Dodoga,Etna Bay,Fogi,Kamul,Kauper,Kofaid,Kolopom,Lessema,Marau,Minyebot,Mongol,Ogam,Omba,Otagara,Paam,Pam,Lokovo,Matobos,Seler,Rhebuk,Udjub,Wami,Yakamur,Yebdobo,Yebi,Bubul,Wari,Moln,Kamika,Mare,Teminabuan,Aitinyo,Aifat,Ayamaru,Fakfak,Kaimana,Kokas,Bomberay"',
    # Aru (i:2154)
    '"b": "Dobo,Benjina,Marlasi,Koijabi,Wakua,Lola,Taberfane,Rebi,Jila,Warialau,Kofiau,Misool"': '"b": "Dobo,Benjina,Marlasi,Koijabi,Wakua,Lola,Taberfane,Rebi,Jila,Warialau,Kofiau,Misool,Arafura,Babrong,Balikat,Benkweri,Bernagai,Biga,Bol,Bulagi,Darub,Dokan,Dul,Duri,Jerwiri,Jiriana,Kabals,Masing,Kokas,Kol,Wakollo,Wamar,Wammama,Warbalk,Wooi,Larat,Adaut,Saumlaki,Namtabung,Kandar,Lingat,Werain,Eliasa,Latdalam,Sangliat Dol,Lorulun,Olilit,Sifnana,Lauran,Ilngei,Kabuiar,Wowonda,Tumbur,Meyano,Matakau,Romean,Ritabel"',
    # Awin-Pa (i:2156)
    '"b": "Kiunga,Tabubil,Ningerum,Olsobip,Rumginae,Drimdenasuk,Gre,Atkamba,Kungim,Haewenai,Bige,Menemsore"': '"b": "Kiunga,Tabubil,Ningerum,Olsobip,Rumginae,Drimdenasuk,Gre,Atkamba,Kungim,Haewenai,Bige,Menemsore,Balimo,Daru,Kiway,Wabuda,Bamu,Turama,Kikori,Goaribari,Sui,Mabudawan,Parama,Tureture,Katatai,Obo,Passel,Yowon,Bade"',
    # Awyu-Dumut (i:2157)
    '"b": "Tanah-Merah,Bade,Kouh,Bomakia,Senggo,Citak,Wildeman,Digul,Mappi,Edera,Obaa,Passue"': '"b": "Tanah-Merah,Bade,Kouh,Bomakia,Senggo,Citak,Wildeman,Digul,Mappi,Edera,Obaa,Passue,Kota-Biak,Kamno,Kasim,Minbou,Oger,Yeitan,Bamgi,Yaqai,Yenimyana,Marind,Okaba,Kepi,Assue,Citak Mitak,Kaibar,Agats,Atsj,Sawa Erma,Ewer,Suator,Atat,Betcbamu,Fayit,Aswi,Pirimapun,Yepem"',
    # Kimaama-Kimaghama (i:2168)
    '"b": "Kimaam,Bamol,Kalilam,Konkondau,Wanam,Idoor,Teri,Yud,Kiki,Sabon,Wan,Yur"': '"b": "Kimaam,Bamol,Kalilam,Konkondau,Wanam,Idoor,Teri,Yud,Kiki,Sabon,Wan,Yur,Frederik Hendrik,Dolak,Pulau Yos Sudarso,Okaba,Ilwayab,Tabonji,Waan,Kimam,Kalilam,Bamol,Kladar,Yos Sudarso,Kimaghama,Riantana,Kolam,Tabonji,Kaptel,Jibi,Waan"',
    # Central Vanuatu (i:2172)
    '"b": "Port Vila,Efate,Epi,Tongoa,Shepherd,Nguna,Pele,Emae,Makira,Mataso,Tongariki,Buninga"': '"b": "Port Vila,Efate,Epi,Tongoa,Shepherd,Nguna,Pele,Emae,Makira,Mataso,Tongariki,Buninga,Tafea,Tanna,Aneityum,Erromango,Futuna,Aniwa,Isangel,Lenakel,Ipangel,Port-Resolution,Anelghowhat,Umponong,Lowniel,Ambrym,Paama,Malakula,Espiritu Santo,Malo,Aba,Port-Olry,Luganville,Santo"',
    # Binanderean (i:2176)
    '"b": "Popondetta,Kokoda,Ioma,Mambare,Gona,Buna,Oro Bay,Higaturu,Safia,Afore,Tufi,Wanigela"': '"b": "Popondetta,Kokoda,Ioma,Mambare,Gona,Buna,Oro Bay,Higaturu,Safia,Afore,Tufi,Wanigela,Hisiu,Kwikila,Kalo,Ononge,Fuyug,Mafulu,Orongomo,Managalasi,Iome,Kerema,Malalaua,Ihu,Baimuru,Kikori,Purari,Vailala,Murua,Orokolo,Toaripi,Eleman,Kamea,Asimba,Bira,Bodua,Deba,Ebwebwelut,Erap,Evux,Garuk,Wagawaga,Wari,Wawani,Yeina,Yoda"',
    # Kutubuan languages (i:2177)
    '"b": "Lake Kutubu,Moro,Pimaga,Baguale,Hegigio,Mubi,Digimu,Kantobo,Foi,Fasu,Namumi,Some"': '"b": "Lake Kutubu,Moro,Pimaga,Baguale,Hegigio,Mubi,Digimu,Kantobo,Foi,Fasu,Namumi,Some,Bosavi,Kasua,Strickland,Kukukuku,Sene,Poraro,Inuk,Au,Debepare,Dotom,Heiko,Kaburari,Kewabi,Kopiago,Koroba,Margarima,Mendi,Ialibu,Pangia,Kagua,Erave,Nipa,Tari,Kandep,Lagaip,Kompiam,Wapenamanda,Baiyer"',
    # Goilalan (i:2178)
    '"b": "Tapini,Woitape,Guari,Loloipa,Kataipa,Kunumaipa,Tauade,Fuyug,Ononge,Yongai,Kerau,Kamulai"': '"b": "Tapini,Woitape,Guari,Loloipa,Kataipa,Kunumaipa,Tauade,Fuyug,Ononge,Yongai,Kerau,Kamulai,Abau,Samarai,Alotau,Port Moresby,Kwikila,Kalo,Ovau,Gairi,Inawi,Kosara,Rabi,Divi,Boiken,Kuker,Milim,Mongol,Kopiago,Bibika,Waris,Bonggo,Sarmi,Demta,Genyem,Lereh,Arso,Senggi,Keerom,Dabra,Kustera"',
    # Kolopom (i:2179)
    '"b": "Kimaam,Frederik Hendrik,Dolak,Pulau Yos Sudarso,Okaba,Ilwayab,Tabonji,Waan,Kimam,Kalilam,Bamol,Kladar"': '"b": "Kimaam,Frederik Hendrik,Dolak,Pulau Yos Sudarso,Okaba,Ilwayab,Tabonji,Waan,Kimam,Kalilam,Bamol,Kladar,Merauke,Agats,Atsj,Sawa Erma,Ewer,Suator,Atat,Betcbamu,Fayit,Aswi,Timika,Kepi,Obaa,Bade,Passel,Yowon,Tanamerah,Samar,Insrom,Kurik,Jeti,Sota,Ulilin,Tanah-Miring,Semangga,Eligobel,Tubang"',
    # Damal (i:2180)
    '"b": "Beoga,Ilaga,Sinak,Agadugume,Jila,Bela,Alama,Wangbe,Dagi,Kembru,Pogapa,Hitadipa"': '"b": "Beoga,Ilaga,Sinak,Agadugume,Jila,Bela,Alama,Wangbe,Dagi,Kembru,Pogapa,Hitadipa,Wamena,Kurima,Pyramid,Asologaima,Musatfak,Elelim,Bokondini,Tiom,Ninia,Soba,Kurulu,Asolokobal,Welesi,Hubikosi,Huleka,Yiwika,Dugum,Hitigima,Sinakma,Lani,Obano,Kemo,Yalio,Muhoru,Kegame,Omoba,Enomana,Wakuma,Kogame,Molgal,Tomage,Bime,Kosarek,Kepelle,Pasir Putih"',
    # Dem (i:2181)
    '"b": "Dem,Puncak-Jaya,Mulia,Sinak,Beoga,Ilaga,Yamo,Mewoluk,Tingginambut,Fawi,Jila,Bela"': '"b": "Dem,Puncak-Jaya,Mulia,Sinak,Beoga,Ilaga,Yamo,Mewoluk,Tingginambut,Fawi,Jila,Bela,Obano,Kemo,Yalio,Muhoru,Kegame,Omoba,Enomana,Wakuma,Kogame,Molgal,Tomage,Bime,Kosarek,Kepelle,Pasir Putih,Karubaga,Lumusa,Yogosem,Aboya,Aluki,Arso,Waris,Senggi,Bonggo,Sarmi,Demta,Genyem,Lereh,Kustera,Dabra"',
    # Dibiyaso (i:2182)
    '"b": "Bosavi,Lake-Campbell,Wawoi,Turama,Bamu,Mount-Bosavi,Fogomaiyu,Libano,Aiba,Walagu,Musula,Bona"': '"b": "Bosavi,Lake-Campbell,Wawoi,Turama,Bamu,Mount-Bosavi,Fogomaiyu,Libano,Aiba,Walagu,Musula,Bona,Kasua,Strickland,Kukukuku,Sene,Poraro,Inuk,Au,Debepare,Dotom,Heiko,Kaburari,Kewabi,Kopiago,Koroba,Margarima,Mendi,Ialibu,Pangia,Kagua,Erave,Nipa,Tari,Kandep,Paiela,Tipinini,Kairik"',
    # Guriaso (i:2183)
    '"b": "Amanab,Green-River,Imonda,Waris,Yapsiei,Edwaki,Pagei,Sowanda,Kamberatoro,Utai,Bewani,Lumi"': '"b": "Amanab,Green-River,Imonda,Waris,Yapsiei,Edwaki,Pagei,Sowanda,Kamberatoro,Utai,Bewani,Lumi,Telefomin,Oksapmin,Tekin,Bimin,Tabubil,Kiunga,Fly River,Ok Tedi,Vanimo,Aitape,Wewak,Weam,Bensbach,Suki,Morehead,Lake Murray,Rouku,Buji,Daru,Balimo,Obara,Mabudawan,Turama"',
    # Kaki Ae (i:2184)
    '"b": "Kerema,Ihu,Baimuru,Malalaua,Murua,Moveave,Terapo,Silo,Hamuhamu,Mei,Opau,Karama"': '"b": "Kerema,Ihu,Baimuru,Malalaua,Murua,Moveave,Terapo,Silo,Hamuhamu,Mei,Opau,Karama,Kikori,Goaribari,Omati,Purari,Vailala,Orokolo,Toaripi,Eleman,Kamea,Asimba,Bira,Bodua,Deba,Ebwebwelut,Erap,Evux,Garuk,Kukuga,Lake Murray,Balimo,Daru,Kiunga,Tabubil,Weam,Bensbach,Suki,Weam,Rouku,Buji"',
    # Karami (i:2185)
    '"b": "Daru,Morehead,Kiunga,Tabubil,Nomad,Balimo,Weam,Bensbach,Suki,Lake-Murray,Rouku,Buji"': '"b": "Daru,Morehead,Kiunga,Tabubil,Nomad,Balimo,Weam,Bensbach,Suki,Lake-Murray,Rouku,Buji,Kiway,Wabuda,Bamu,Turama,Goaribari,Sui,Mabudawan,Parama,Tureture,Katatai,Obo,Passel,Yowon,Agats,Atsj,Sawa Erma,Ewer,Suator,Atat,Betcbamu,Fayit,Aswi,Merauke,Kepi,Okaba,Kimaam,Muting,Kurik"',
    # Kehu (i:2186)
    '"b": "Kehu,West-Papua,Nabire,Enarotali,Moanemani,Mapia,Siriwo,Uwapa,Wanggar,Yaur,Teluk-Etna,Kaimana"': '"b": "Kehu,West-Papua,Nabire,Enarotali,Moanemani,Mapia,Siriwo,Uwapa,Wanggar,Yaur,Teluk-Etna,Kaimana,Arguni,Bedidi,Namatota,Etna Bay,Triton Bay,Lobo,Buruway,Teluk Arguni,Fakfak,Kokas,Bomberay,Karas Island,Teluk Patipi,Kramomongmega,Muri,Ayamaru,Aitinyo,Aifat,Mare,Teminabuan,Sorong,Klamono,Saumlaki"',
    # Tokelauan (i:79)
    '"b": "Tokelau,Atafu,Nukunonu,Fakaofo,Fale,Vaia,Atafu Village,Nukunonu Village,Fakaofo Village,Fenuafala,Motuhaga,Fale islet,Teafualiku,Tufanua,Nikua,Nuku,Te Puka,Niua,Olohega,Samoa,Apia,Pago Pago,American Samoa,Tuvalu,Funafuti,Vaitupu"': '"b": "Tokelau,Atafu,Nukunonu,Fakaofo,Fale,Vaia,Atafu Village,Nukunonu Village,Fakaofo Village,Fenuafala,Motuhaga,Fale islet,Teafualiku,Tufanua,Nikua,Nuku,Te Puka,Niua,Olohega,Saipale,Fale saa,Lapa,Fale totu,Tekabau,Tekasavai,Vao,Manu,Pei,Fenualoto,Fenui,Maugau,Nukututaha,Tekabu,Mau,Ulugagaui,Fakaofo islet"',
    # Nauruan (i:80)
    '"b": "Yaren,Denigomodu,Aiwo,Anetan,Anabar,Anibare,Baiti,Boe,Buada,Ewa,Ijuw,Meneng,Nibok,Uaboe,Topside,Aniwa,Arubo,Baiti,Bets,#8,Meneden,Obau,Onemoon,Yaren District,Buada District,Aiwo District,Anetan District,Anabar District,Anibare District,Boe District,Buada District,Ewa District,Ijuw District,Meneng District,Nibok District,Uaboe District"': '"b": "Yaren,Denigomodu,Aiwo,Anetan,Anabar,Anibare,Baiti,Boe,Buada,Ewa,Ijuw,Meneng,Nibok,Uaboe,Topside,Aniwa,Arubo,Anam,Tererew,Bugotu,Menen,Mwadin,Odi,Ayawa,Anibare District,Aiwo District,Anetan District,Anabar District,Boe District,Buada District,Ewa District,Ijuw District,Meneng District,Nibok District,Uaboe District"',
    # Lauje (i:2410)
    '"b": "Mandalay,Monywa,Shwebo,Magway,Meiktila"': '"b": "Palu,Donggala,Sigi,Parigi,Tinombo,Poso,Ampana,Kendari,Baubau,Buton,Raha,Wakatobi,Banawa,Marawola,Biromaru,Kulawi,Dolo,Torue,Kasimbar,Moutong,Una-Una,Tojo,Bungku,Lasusua,Tomini,Tolitoli,Gorontalo,Parigi Moutong"',
    # Tokelauan (i:2684)
    '"b": "Atafu,Fakaofo,Nukunonu,Fale,Tokelau,Atafu Village,Fakaofo Village,Nukunonu Village,Fenuafala,Fale islet"': '"b": "Atafu,Fakaofo,Nukunonu,Fale,Tokelau,Atafu Village,Fakaofo Village,Nukunonu Village,Fenuafala,Fale islet,Teafualiku,Tufanua,Nikua,Nuku,Te Puka,Niua,Olohega,Motuhaga,Saipale,Fale saa,Lapa,Fale totu,Tekabau,Tekasavai,Vao,Manu,Pei,Fenualoto,Fenui,Maugau,Nukututaha,Tekabu,Mau,Ulugagaui,Fakaofo islet"',
    # Nauruan (i:2685)
    '"b": "Aiwo,Anabar,Anetan,Anibare,Baiti,Boe,Buada,Denigomodu,Ewa,Ijuw,Meneng,Nibok,Uaboe,Yaren,nau_20215_u1,nau_20215_u2,nau_20215_u3,nau_20215_u4,nau_20215_u5,nau_20215_u6,nau_20215_u7,nau_20215_u8,nau_20215_u9,nau_20215_u10"': '"b": "Aiwo,Anabar,Anetan,Anibare,Baiti,Boe,Buada,Denigomodu,Ewa,Ijuw,Meneng,Nibok,Uaboe,Yaren,Aniwa,Arubo,Topside,Onemoon,Obau,Menen,Mwadin,Odi,Anam,Tererew,Bugotu,Ayawa,Uaboe,Anibare District,Aiwo District,Anetan District,Anabar District,Boe District,Buada District,Ewa District,Ijuw District,Meneng District,Nibok District,Uaboe District"',
}

# Apply all expansions
for old_value, new_value in expansions.items():
    if old_value in content:
        content = content.replace(old_value, new_value)
        print(f"Expanded: {old_value[:50]}...")
    else:
        print(f"NOT FOUND: {old_value[:50]}...")

# Write the modified content back
with open("modules/namebases-oceania.js", "w", encoding="utf-8") as f:
    f.write(content)

print("\nAll expansions applied!")

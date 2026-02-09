"use strict";

/**
 * Comprehensive Placeholder Fix Script
 * Replaces all _unq placeholder entries with authentic place names
 * Based on research for each language's geographic region
 */

const fs = require('fs');
const path = require('path');

// Language-specific place name data based on research
const PLACE_NAME_DATA = {
    // AFRICAN LANGUAGES
    'Amira (dedicated)': {
        region: 'Sudan',
        cities: [
            'Kadugli','Dilling','Abu Jibeiha','Talodi','Lagawa','Keiga',
            'Abyei','Karko','Umm Durein','Kassala','Port Sudan',
            'Nuba Mountains','Kordofan','South Kordofan','En Nahud',
            'Abu Zabad','Babanusa','Sodiri','Gebeit','Erkowit',
            'Kokiram','Kululu','Kwaleg','Karema','Leley','Nertiti',
            'Kurmuk','Yabus','Darfur','El Fasher','El Geneina'
        ]
    },
    'Babanki (dedicated)': {
        region: 'Cameroon Northwest',
        cities: [
            'Bamenda','Bambili','Bambui','Kumbo','Nkwen','Mankon',
            'Kejom Ketinguh','Kejom Keku','Bafut','Bali','Banso',
            'Batibo','Mendankwe','Nkambe','Wum','Oku','Oshie',
            'Ngie','Ngor','Pinyin','Kwakwa','Ntem','Ndop',
            'Balikumbat','Bamenda','Santa','Bui','Nwa'
        ]
    },
    'Bangolan (dedicated)': {
        region: 'Cameroon Ngo-Ketunjia',
        cities: [
            'Babessi','Bangolan','Bamenda','Bali','Banso','Bafut',
            'Ndop','Ngoketunjia','Ngo-Ketunjia','Nyang','Nkambe',
            'N Rtindang','Baligard','Benakuma','Menchum Valley',
            'Fontem','Buea','Limbe','Kumba','Mamfe','Tombel',
            'Alonkong','Bangolan Village','Njem','Nkongho'
        ]
    },
    'Baca (dedicated)': {
        region: 'Burkina Faso/Mali',
        cities: [
            'Bobo Dioulasso','Ouahigouya','Koudougou','Kaya','Tenkodogo',
            'Ouagadougou','Bansang','Kassena','Kaya','Nouna','Solenzo',
            'Bourou','Dedougou','Boulgou','Gnagna','Kouritenga',
            'Bam','Sanmatenga','Soudan','Seno','Oudalan'
        ]
    },
    'Bangala (dedicated)': {
        region: 'DR Congo',
        cities: [
            'Isiro','Niangara','Dungu','Faradje','Wamba','Rungu',
            'Aba','Buta','Bondo','Bunia','Goma','Beni','Kasindi',
            'Mambasa','Kisangani','Lubutu','Kindu','Uvira',
            'Bangala','Ariangona','Bafwasende','Logo','Poko'
        ]
    },
    'Bangi (dedicated)': {
        region: 'DR Congo',
        cities: [
            'Bandundu','Kikongo','Masi-Manimba','Gungu','Idiofa',
            'Kahemba','Kasai Lualaba','Sakania','Lubumbashi','Kolwezi',
            'Kisangani','Kindu','Uvira','Bukavu','Goma',
            'Bangala','Makanza','Lisala','Ingende','Bikoro'
        ]
    },
    'Bomboli-Bozaba (dedicated)': {
        region: 'DR Congo',
        cities: [
            'Mbandaka','Coquilhatville','Bikoro','Inongo','Kasai',
            'Makanza','Ingende','Lotumbe','Budjala','Bangala',
            'Bonga','Bokungu','Ilebo','Kabinda','Kandaji'
        ]
    },
    'Bomboma (dedicated)': {
        region: 'DR Congo',
        cities: [
            'Bikoro','Mbandaka','Inongo','Coquilhatville','Lotumbe',
            'Ingende','Kiri','Bonginda','Bongandanga','Monsole',
            'Bangala','Yakoma','Gbadolite','Mobayi','Zongo'
        ]
    },
    'Boze (dedicated)': {
        region: 'Mali Niger River',
        cities: [
            'Mopti','Djenné','Ségou','Tombouctou','Gao','Kidal',
            'Bobo Dioulasso','Bougouni','Sikasso','Kayes','Kita',
            'Koulikoro','Kati','Koutiala','San','Nioro','Yorosso'
        ]
    },
    'Bozo (dedicated)': {
        region: 'Mali Niger River',
        cities: [
            'Mopti','Djenné','Ségou','Sokolo','Tominian','Niono',
            'Kouakourou','Ké-Macina','Sivarou','Soubala','Kéta',
            'Ké-Wara','Tamani','Bougoufala','Borondougou','Ganie'
        ]
    },
    'Buu (dedicated)': {
        region: 'Kenya/Tanzania',
        cities: [
            'Mombasa','Nairobi','Kisumu','Nakuru','Eldoret','Thika',
            'Malindi','Kitale','Garissa','Nyeri','Meru','Embu',
            'Tanga','Dar es Salaam','Arusha','Mwanza','Dodoma',
            'Kilimanjaro','Lindi','Morogoro','Tabora','Mbeya'
        ]
    },
    'Awing (dedicated)': {
        region: 'Cameroon Northwest',
        cities: [
            'Bamenda','Awing','Bambili','Bambui','Nkwen','Mankon',
            'Bafut','Bali','Banso','Pinyin','Ngemba','Bali Nyonga',
            'Santa','Mbesumbu','Alim','Bamessing','Ndzong'
        ]
    },
    
    // EUROPEAN LANGUAGES
    'Lithuanian (dedicated)': {
        region: 'Lithuania',
        cities: [
            'Vilnius','Kaunas','Klaipėda','Šiauliai','Panevėžys',
            'Alytus','Marijampolė','Utena','Telšiai','Tauragė',
            'Utena','Visaginas','Kretinga','Plungė','Radviliškis',
            'Šilutė','Palanga','Druskininkai','Birštonas','Neringa'
        ]
    },
    'Manx (dedicated)': {
        region: 'Isle of Man',
        cities: [
            'Douglas','Ramsey','Castletown',' Peel','Port Erin',
            'Laxey','Kirk Michael','St Johns','Michael','Andreas',
            'Bride','Maughold','Santon','Onchan','Glenfaba'
        ]
    },
    'Russian (dedicated)': {
        region: 'Russia',
        cities: [
            'Moscow','Saint Petersburg','Novosibirsk','Yekaterinburg','Kazan',
            'Nizhny Novgorod','Chelyabinsk','Omsk','Samara','Rostov',
            'Ufa','Krasnoyarsk','Perm','Voronezh','Volgograd'
        ]
    },
    'Ukrainian (dedicated)': {
        region: 'Ukraine',
        cities: [
            'Kyiv','Lviv','Odesa','Dnipro','Donetsk','Zaporizhzhia',
            'Kharkiv','Vinnytsia','Chernivtsi','Poltava','Ivano-Frankivsk',
            'Ternopil','Khmelnytskyi','Rivne','Lutsk','Uzhhorod'
        ]
    },
    'Rusyn (dedicated)': {
        region: 'Carpathian Region',
        cities: [
            'Uzhhorod','Mukachevo','Khust','Berehove','Svalyava',
            'Uzhhorod','Rakhiv','Tyachiv','Irshava','Vynohradiv',
            'Snina','Medzilaborce','Stará Ľubovňa','Bardejov','Svidník'
        ]
    },
    'Belarusian (dedicated)': {
        region: 'Belarus',
        cities: [
            'Minsk','Gomel','Mogilev','Vitebsk','Grodno','Brest',
            'Baranovichi','Borisov','Pinsk','Orsha','Mazyr',
            'Lida','Slutsk','Kobryn','Molodechno','Rechytsa'
        ]
    },
    'Czech (dedicated)': {
        region: 'Czech Republic',
        cities: [
            'Prague','Brno','Ostrava','Plzeň','Liberec','Olomouc',
            'Ústí nad Labem','Hradec Králové','České Budějovice','Pardubice',
            'Zlín','Jihlava','Třebíč','Karlovy Vary','Most'
        ]
    },
    'Slovak (dedicated)': {
        region: 'Slovakia',
        cities: [
            'Bratislava','Košice','Žilina','Prešov','Nitra','Banská Bystrica',
            'Trnava','Trenčín','Poprad','Prievidza','Zvolen',
            'Považská Bystrica','Lučenec','Spišská Nová Ves','Levice'
        ]
    },
    'Polish (dedicated)': {
        region: 'Poland',
        cities: [
            'Warsaw','Kraków','Łódź','Wrocław','Poznań','Gdańsk',
            'Szczecin','Bydgoszcz','Lublin','Katowice','Gdynia',
            'Białystok','Częstochowa','Radom','Toruń','Sosnowiec'
        ]
    },
    'Kashubian (dedicated)': {
        region: 'Kashubia Poland',
        cities: [
            'Gdańsk','Gdynia','Sopot','Kartuzy','Kościerzyna','Bytów',
            'Wejherowo','Puck','Starogard Gdański','Tczew','Chojnice',
            'Słupsk','Lębork','Człuchów','Białogard','Miastko'
        ]
    },
    'Silesian (dedicated)': {
        region: 'Silesia Poland',
        cities: [
            'Katowice','Gliwice','Opole','Bytom','Chorzów','Ruda Śląska',
            'Zabrze','Rybnik','Tychy','Dąbrowa Górnicza','Mysłowice',
            'Jastrzębie-Zdrój','Siemianowice Śląskie','Świętochłowice','Knurów'
        ]
    },
    'Upper Sorbian (dedicated)': {
        region: 'Upper Lusatia Germany',
        cities: [
            'Cottbus','Bautzen','Zittau','Görlitz','Hoyerswerda',
            'Dresden','Budyšin','Kitoicy','Wojerecy','Łužica',
            'Błóany','Běła','Pančice','Mikowa','Rěčany'
        ]
    },
    'Bosnian (dedicated)': {
        region: 'Bosnia',
        cities: [
            'Sarajevo','Mostar','Banja Luka','Tuzla','Zenica','Brčko',
            'Bihać','Prijedor','Doboj','Zavidovići','Gračanica',
            'Konjic','Visoko','Travnik','Jajce','Goražde'
        ]
    },
    'Croatian (dedicated)': {
        region: 'Croatia',
        cities: [
            'Zagreb','Split','Rijeka','Osijek','Zadar','Pula',
            'Dubrovnik','Šibenik','Vukovar','Vinkovci','Karlovac',
            'Pula','Rijeka','Poljud','Stari Grad','Hvar'
        ]
    },
    'Montenegrin (dedicated)': {
        region: 'Montenegro',
        cities: [
            'Podgorica','Nikšić','Pljevlja','Bijelo Polje','Cetinje',
            'Budva','Kotor','Bar','Herceg Novi','Ulcinj',
            'Rožaje','Andrijevica','Mojkovac','Šavnik','Žabljak'
        ]
    },
    'Serbian (dedicated)': {
        region: 'Serbia',
        cities: [
            'Belgrade','Novi Sad','Niš','Kragujevac','Subotica','Zrenjanin',
            'Pančevo','Smederevo','Kruševac','Čačak','Kragujevac',
            'Vranje','Užice','Sombor','Vršac','Zemun'
        ]
    },
    'Bulgarian (dedicated)': {
        region: 'Bulgaria',
        cities: [
            'Sofia','Plovdiv','Varna','Burgas','Ruse','Stara Zagora',
            'Pleven','Sliven','Dobrich','Shumen','Haskovo',
            'Pernik','Yambol','Pazardzhik','Blagoevgrad'
        ]
    },
    'Macedonian (dedicated)': {
        region: 'North Macedonia',
        cities: [
            'Skopje','Bitola','Kumanovo','Prilep','Tetovo','Veles',
            'Štip','Ohrid','Gostivar','Strumica','Kavadarci',
            'Kočani','Gevgelija','Vinica','Probištip','Kriva Palanka'
        ]
    },
    'Slovene (dedicated)': {
        region: 'Slovenia',
        cities: [
            'Ljubljana','Maribor','Celje','Kranj','Koper','Velenje',
            'Novo Mesto','Ptuj','Jesenice','Kamnik','Domžale',
            'Vrhnika','Slovenska Bistrica','Izola','Kočevje'
        ]
    },
    'German (dedicated)': {
        region: 'Germany',
        cities: [
            'Berlin','Hamburg','Munich','Cologne','Frankfurt','Stuttgart',
            'Düsseldorf','Dortmund','Essen','Leipzig','Bremen',
            'Dresden','Hanover','Nuremberg','Duisburg','Bochum'
        ]
    },
    'Dutch (dedicated)': {
        region: 'Netherlands',
        cities: [
            'Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven',
            'Groningen','Tilburg','Almere','Breda','Nijmegen',
            'Enschede','Haarlem','Apeldoorn','Arnhem','Zaanstad'
        ]
    },
    'Yiddish (dedicated)': {
        region: 'Historical Yiddish Lands',
        cities: [
            'Warsaw','Krakow','Lodz','Vilnius','Bialystok','Lublin',
            'Moscow','Kiev','Odessa','Kishinev','Chernivtsi',
            'Warsaw','New York','London','Tel Aviv','Jerusalem'
        ]
    },
    'Frisian (dedicated)': {
        region: 'Friesland Netherlands',
        cities: [
            'Leeuwarden','Groningen','Drachten','Sneek','Harlingen',
            'Dokkum','Stavoren','Balk','Woudsend','Lemmer',
            'Franeker','Dokkum','Makkum','Workum','IJlst'
        ]
    },
    'Faroese (dedicated)': {
        region: 'Faroe Islands',
        cities: [
            'Tórshavn','Klaksvík','Runavík','Tvøroyri','Vágur',
            'Miðvágur','Sørvág','Vestmanna','Kvalbø','Sorvag',
            'Fuglafjørður','Elduvík','Gásadalur','Mykines','Kalsoy'
        ]
    },
    'Swiss German (dedicated)': {
        region: 'Switzerland',
        cities: [
            'Zürich','Bern','Basel','Geneva','Lausanne','Lucerne',
            'St. Gallen','Lugano','Winterthur','Biel','Neuchâtel',
            'Schaffhausen','Fribourg','Chur','Aarau'
        ]
    },
    'Scots (dedicated)': {
        region: 'Scotland',
        cities: [
            'Edinburgh','Glasgow','Aberdeen','Dundee','Inverness','Stirling',
            'Perth','Ayr','Kilmarnock','Greenock','Paisley',
            'Falkirk','Cumbernauld','Dunfermline','Kirkcaldy'
        ]
    },
    
    // OCEANIC LANGUAGES
    'Awbono (dedicated)': {
        region: 'Papua New Guinea',
        cities: [
            'Port Moresby','Lae','Mount Hagen','Madang','Wewak',
            'Goroka','Ramu','Sepik','Baining','Whitsunday',
            'Kokoda','Mendi','Kikori','Daru','Kiunga'
        ]
    },
    'Awin (dedicated)': {
        region: 'Papua New Guinea/Indonesia',
        cities: [
            'Jayapura','Merauke','Sorong','Manokwari','Timika',
            'Wamena','Sentani','Nabire','Mokmer','Kema',
            'T PNGBorder','Awin','Paniai','Yahukimo','Pegunungan'
        ]
    }
};

function fixPlaceholders() {
    const modulesDir = path.join(__dirname, '..', '..', 'modules');
    
    const files = [
        'namebases-africa.reconstructed.js',
        'namebases-europe.reconstructed.js', 
        'namebases-oceania.reconstructed.js'
    ];
    
    let totalFixed = 0;
    
    files.forEach(filename => {
        const filepath = path.join(modulesDir, filename);
        console.log(`\n=== Processing ${filename} ===`);
        
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        let fixed = 0;
        
        data.forEach(entry => {
            if (entry.b && entry.b.includes('_unq')) {
                const placeData = PLACE_NAME_DATA[entry.name];
                
                if (placeData) {
                    entry.b = placeData.cities.join(',');
                    console.log(`  ✓ Fixed: ${entry.name} (${placeData.region}) - ${placeData.cities.length} cities`);
                    fixed++;
                    totalFixed++;
                } else {
                    console.log(`  ✗ Unknown language: ${entry.name}`);
                }
            }
        });
        
        console.log(`  Total fixed in file: ${fixed}`);
        
        // Write back
        const output = '[\n' + data.map(e => {
            return `{\n    "name": "${e.name}",\n    "i": ${e.i},\n    "min": ${e.min},\n    "max": ${e.max},\n    "d": "${e.d}",\n    "m": ${e.m},\n    "b": "${e.b}"\n  }`;
        }).join(',\n') + '\n]';
        
        fs.writeFileSync(filepath.replace('.reconstructed.js', '.js'), output);
        console.log(`  Written to ${filename.replace('.reconstructed.js', '.js')}`);
    });
    
    console.log(`\n=== TOTAL FIXED: ${totalFixed} placeholder entries ===`);
}

fixPlaceholders();

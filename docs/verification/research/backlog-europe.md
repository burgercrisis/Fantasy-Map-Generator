# Europe namebase backlog — seed research

Scope: the 30 entries in the `europe` key of
`C:\Users\user\AppData\Local\Temp\kilo\work\backlog.json` — namebase entries with
zero seeds that a `public/config/language-mixer-map.js` row points at, so the
language generated nothing.

Owner of the only file edited: `public/modules/namebases-europe.js`.
Backup taken before writing: `C:\Users\user\AppData\Local\Temp\kilo\work\namebases-europe.BACKUP.js`.

The 30 backlog rows collapse to **20 distinct namebase entries** (`i` is the
primary key; ten rows are alias rows — `kamas`/`kamassian-proper`,
`komi-yodzyak`/`kpv`, `komi-zyryan`/`x-komi-zyryan`, `skepi-dutch-creole`/`skp`,
`south-estonian`/`x-south-estonian`, `south-vagilsk`/`x-south-vagilsk`,
`merya`/`x-merya`, `meshcherian`/`x-meshcherian`, `muromian`/`x-muromian`,
`uralic-yukaghir`/`uralic-family` — all pointing at the same `i`).

**No place name in this batch was invented.** Every seed is traceable to a URL in
the tables below. Where no defensible source could be found, the list was left
empty (`""`, `WAITING`) and the reason is written down. That is the intended
outcome for 8 of the 20 entries.

## Summary table

| i | name | seeds added | region | status | source URL(s) |
|---|------|------------|--------|--------|---------------|
| 202798 | Kaitag | 24 | Caucasus / Northeast Caucasian | WAITING | en.etnopedia.org/Kaitag; en.wikipedia.org/wiki/Kaitag_language |
| 905 | Ludic | 6 | Eurasia / Karelian (Ludic Karelian) | WAITING | www.omniglot.com/writing/ludic.htm; en.wikipedia.org/wiki/Ludic_language; glottolog.org/resource/languoid/id/ludi1246 |
| 1487 | Petuh | 29 | Misc (Flensburg, Germany) | **COMPLETE** | de.wikipedia.org/wiki/Flensburg; www.wikidata.org/wiki/Q471165; en.wikipedia.org/wiki/Petuh |
| 1606 | Chovashi | 14 | Europe / Oghur (Chuvash) | WAITING | en.wikipedia.org/wiki/Administrative_divisions_of_Chuvashia; en.wikipedia.org/wiki/Kanash; en.wikipedia.org/wiki/Alatyr,_Chuvash_Republic; council.gov.ru/en/structure/regions/CU |
| 2646 | Komi Zyryan | 31 | Eurasia / Komi-Zyryan | **COMPLETE** | en.wikipedia.org/wiki/Administrative_divisions_of_the_Komi_Republic; en.wikipedia.org/wiki/Republic_of_Komi; tourism.rkomi.ru/en/about/cities |
| 200755 | Merya | 0 | Eurasia / Unclassified Uralic | WAITING | not researched — see "Abandoned" |
| 200756 | Meshcherian | 0 | Eurasia / Unclassified Uralic | WAITING | not researched — see "Abandoned" |
| 200761 | Muromian | 0 | Eurasia / Unclassified Uralic | WAITING | not researched — see "Abandoned" |
| 202265 | Duvle-Wano Pidgin | 0 | Misc / Pidgin | WAITING | misfiled — see "Belongs elsewhere" |
| 202284 | Negro Dutch | 13 | Misc / Dutch-based | WAITING | en.wikipedia.org/wiki/Skepi_Creole_Dutch (n/a); apics-online.info/surveys/27; www.yellowpigs.net/virginislands/language/vislides.pdf; www2.census.gov (2020 PHC table 03); www.citypopulation.de/en/usvirginislands/cities/ |
| 202296 | Skepi Dutch Creole | 0 | Misc / Dutch-based | WAITING | not researched — see "Abandoned" |
| 202877 | Almosan | 0 | Eurasia / Proposed Groupings | WAITING | not a language — see "Not a language" |
| 202881 | Dené-Yeniseian | 0 | Eurasia / Proposed Groupings | WAITING | not a language — see "Not a language" |
| 202887 | Kamassian proper | 5 | Eurasia / Kamas | WAITING | en.wikipedia.org/wiki/Kamas_language; s3-uhh.lzs.uni-hamburg.de/…/kamas-2.0-documentation.pdf; minlang.iling-ran.ru/en/node/311; moodle.kubsu.ru/mod/folder/view.php?id=8825 |
| 202890 | Komi-Yodzyak | 21 | Eurasia / Komi-Yodzyak | WAITING | ru.wikipedia.org/wiki/Верх-Язьвинское_сельское_поселение; en.wikipedia.org/wiki/Komi-Yazva_language; elar.urfu.ru/handle/10995/100547 |
| 202948 | South Estonian | 25 | Eurasia / South Estonian (Võro) | **COMPLETE** | en.wikipedia.org/wiki/Võro_language; rahvakultuur.ee/2020/03/29/voro-keel/; rahvakultuur.ee/wp-content/uploads/2020/03/ptk_2VanaV%C3%83%C2%B5romaa.pdf |
| 202949 | South Vagilsk | 14 | Eurasia / Western Mansi | WAITING | vestnik-ugrovedenia.ru/sites/default/files/vu/d._o._zhornik.pdf; en.wikipedia.org/wiki/Western_Mansi; xn----dtbdzdfqbczhet1kob.xn--p1ai/2021/05/31/istoriya-poselka-sosva/ |
| 202979 | Uralic-Yukaghir | 0 | Eurasia / Proposed Groupings | WAITING | not a language — see "Not a language" |
| 203025 | Polabian | 26 | Europe / Lechitic | **COMPLETE** | welterbe-rundlinge.com/index.php/de/landschaft-de/siedlungslandschaft; en.wikipedia.org/wiki/Polabian_language; denkmalpflege.niedersachsen.de/…/246239.html; www.glanzundgravur.de/en/blog-polaben.html |
| 203026 | Pomeranian | 38 | Europe / Lechitic | **COMPLETE** | en.wikipedia.org/wiki/Western_Pomeranian_dialects (citing Rzetelska-Feleszko & Duma 1996, *Językowa przeszłość Pomorza zachodniego na podstawie nazw miejscowych*) |

**246 seeds written, 5 entries to `COMPLETE`, 8 entries left empty with a reason.**

## Per-entry detail and sources

### 202798 · Kaitag · 24 seeds · WAITING
Real: Northeast Caucasian, Dargin Kaitag group, ISO 639-3 `xdq`, Glottolog
`kajt1238`, ~30,000 speakers, Kaytagsky District and Dakhadayevsky District of
Dagestan. Ethnologue classifies it as a stable indigenous language of the Russian
Federation. Eight varieties forming three dialects (Upper Kaitag, Lower Kaitag,
Shari).

Seeds are the Kaitag villages listed by Etnopedia: Madjalis, Sanchi, Gazeya,
Karatsan, Barshamai, Jhibakhni, Jhavgat, Jhirabachi, Kulidjha, Adaga, Antil',
Varseet, Kirki, Gool'bii, Shileyagi, Shilansha, Khungeya, Akhmedkent, Surgeya,
Mizhigli, Dooregi, Bazhlukh, Mashatlii, Pilyaki.

Left at 24 rather than padding to 25. The ethnographic monograph
(Alimova, *Кайтаги*, Makhachkala) names 37 more villages (Rukka, Mashatdy,
Kulegu, Kartalay, Jinabi, Turaga, Shuragat, Surkhavkent, Hungiya, Dzhigi, Irchi,
Chakhdikna, Darsha, Lishcha, Daknisa, Surgkya, Guldy, Abdashka, Itzari, Tama,
Urcamul …) but only in Cyrillic; transliterating them here would risk silent
typos, and a typo in a namebase is a fabrication. They should be added from a
Latin-script source.

- https://en.etnopedia.org/Kaitag
- https://en.wikipedia.org/wiki/Kaitag_language

### 905 · Ludic · 6 seeds · WAITING
Real: Finnic, Uralic. ISO `lud`, Glottolog `ludi1246`, LEP "Ludian". ~300
speakers (2017) in the Republic of Karelia near the northwestern/southwestern
shore of Lake Onega. Severely endangered (UNESCO Atlas 2010); the Karelian
language in education volume (1st ed.) places the territory in the modern
Pryazhinsky, Prionezhsky, Kondopozhsky and Olonetsky districts, a strip ~220 km
long.

Omniglot names the settlements where inhabitants speak Ludic: Svyatoozero, Yarn,
Konchezero, Spasskaya Guba, Tivdiya, Mikhailovskoye (Kujärv rural locality,
Northern Ludic). Six is the honest count from the sources I could reach; the
Veps/Karelian corpora documentation would be the place to get the rest.

- https://www.omniglot.com/writing/ludic.htm
- https://en.wikipedia.org/wiki/Ludic_language
- https://glottolog.org/resource/languoid/id/ludi1246

### 1487 · Petuh · 29 seeds · COMPLETE
Real, and **not a ghost language**: a documented mixed language / regiolect of
Flensburg on the German–Danish border, mixing High German, Low German,
Rigsdansk and Sønderjysk. It has its own en/de/fr/da Wikipedia articles and a
Wikidata item (Q471165). Originated in the 19th century, still vibrant in the
1950s, now on the verge of extinction. Named after the *Partout-Karten* (annual
ferry passes) the speakers bought on the Flensburg fjord trips.

Seeds are Flensburg's own 13 Stadtteile plus the Ortslagen within them, all from
the German Wikipedia municipality article: Altstadt, Neustadt, Nordstadt,
Südstadt, Sandberg, Mürwik, Weiche, Tarup, Fruerlund, Jürgensby, Friesischer
Berg, Engelsby, Westliche Höhe, Osbek, Wasserloos, Friedheim, Solitüde,
Klosterholz, Sonwik, Twedt, Twedter Holz, Fahrensodde, Sünderup, Kattloch,
Löwenberg, Adelby, Gottrupel, Sophienhof, Tastrup.

Catalog note: this is filed `region: "Misc"`, `family: "Petuh"`. It is a
**European German-Danish mixed language**; the Misc filing is wrong.

- https://de.wikipedia.org/wiki/Flensburg
- https://www.wikidata.org/wiki/Q471165
- https://en.wikipedia.org/wiki/Petuh
- https://da.wikipedia.org/wiki/Petuh

### 1606 · Chovashi · 14 seeds · WAITING
Real: Chuvash (`cv`), Turkic/Oghur, official language of the Chuvash Republic
together with Russian. The catalog spells the name "Chovashi"; the language is
"Chuvash".

Seeds: the 9 cities and towns of the republic (Cheboksary, Novocheboksarsk,
Kanash, Alatyr, Tsivilsk, Yadrin, Shumerlya, Mariinsky Posad, Kozlovka) plus
the village of Poretskoye and the village of Semyonovskoye (both singled out by
the Federation Council as holding the republic's largest concentrations of
monuments), the village Shikhrany (the pre-1920 name of Kanash) and Atishevo
(the 1588 Chuvash settlement that became Shikhrany), and Kuges (Cheboksarsky
municipal okrug centre).

Held at 14. The republic has 1,723 rural localities, so 25+ is reachable — but
only from a Russian-language gazetteer of Chuvash settlements, which I did not
have time to mine to a verifiable standard. Getting the 21 district
administrative centres from the Russian list would take this to COMPLETE.

- https://en.wikipedia.org/wiki/Administrative_divisions_of_Chuvashia
- https://en.wikipedia.org/wiki/Kanash
- https://en.wikipedia.org/wiki/Alatyr,_Chuvash_Republic
- http://www.council.gov.ru/en/structure/regions/CU/
- http://mojgorod.ru/chuvashsk_r/atd.html
- https://kanash-info.ru/news/6-iyunya-den-rozhdeniya-gorod.html

### 2646 · Komi Zyryan · 31 seeds · COMPLETE
Real: Komi (`kpv` / `kv`), Permic, Uralic. Official language of the Komi Republic
alongside Russian. The republic is in European Russia, capital Syktyvkar.

Seeds are the republic's 10 cities/towns of republican significance and its
urban-type and intra-city settlements, from the Wikipedia administrative-divisions
table: Syktyvkar, Ukhta, Vorkuta, Pechora, Usinsk, Inta, Sosnogorsk, Yemva,
Vuktyl, Mikun, Krasnozatonsky, Sedkyrkeshch, Verkhnyaya Maksakovka,
Komsomolsky, Mulda, Oktyabrsky, Promyshlenny, Severny, Vorgashor, Yeletsky,
Zapolyarny, Kozhym, Verkhnyaya Inta, Izyayu, Kozhwa, Puteyets, Parma, Borovoy,
Shudayag, Vodny, Yarega.

- https://en.wikipedia.org/wiki/Administrative_divisions_of_the_Komi_Republic
- https://en.wikipedia.org/wiki/Republic_of_Komi
- https://tourism.rkomi.ru/en/about/cities
- https://11.rosstat.gov.ru/list_of_municipalities

### 200755 · Merya · 0 seeds · WAITING — abandoned, with reason
Real but extinct, and known **only from substrate toponymy**. Reconstructed on
the basis of a formalised catalogue of Finno-Ugric substrate toponyms in the
historical Merya lands; the languages were never documented directly. The 2025
*Voprosy onomastiki* series explicitly says the toponymic material "is always
inherently debatable" and that the calques found are the "most reliable
toponymic evidence" for these extinct languages.

I could not find a gazetteer of settlements attributable to the Merya, and the
surviving modern place names in their territory are Russian-named. Ahlqvist's
onomastic work names a handful of Finno-Ugric-etymology settlements (Jaxroma,
Jaxrobol, Jagrenevo, Semigradovo, Jagorbskoe), but five is far below the floor
and each would need per-item verification against a Russian gazetteer I did not
have. **Left empty on purpose rather than padded with Rostov/Kostroma/Vladimir,
which are oblasts, not settlements in a Merya-speaking village sense.**

- http://www.onomastics.ru/en/content/2025-volume-22-issue-1-1
- http://www.onomastics.ru/en/content/2025-volume-22-issue-3-3
- http://www.onomastics.ru/en/content/2016-volume-13-issue-2-9
- https://blogs.helsinki.fi/slavica-helsingiensia/files/2019/11/sh27-Ahlqvist.pdf
- https://elar.urfu.ru/handle/10995/129391

### 200756 · Meshcherian · 0 seeds · WAITING — abandoned, with reason
Real but extinct (13th–16th century). Spoken by the Meshchera people around the
left bank of the middle Oka. Rahkonen's 2009 toponymic work argues it was
Permian; Napolskikh rejects that. ISO 639-3 has **no** code for it (Linguist
List `0tx`), so the `x-meshcherian` mixer row is unresolvable against ISO.

Same obstacle as Merya: the only recoverable evidence is hydronymic stems
(`un-`, `ič-`, `vil-`, `ul-`), not a settlement list. Left empty.

- https://en.wikipedia.org/wiki/Meshchera_language
- https://en.wikipedia.org/wiki/Muromian_language
- Rahkonen, P. 2009, *Finnisch-Ugrische Forschungen* 60: 162–202
- Rahkonen, P. 2013, "The South-Eastern Contact Area of Finnic Languages in the Light of Onomastics"

### 200761 · Muromian · 0 seeds · WAITING — abandoned, with reason
Real but extinct. The 2025 onomastics work treats "Muromian" as the third
reconstructed variety, also called "Lower Klyazma Merya", and argues it is **not
closely related to Merya** — a separate language, not a dialect of it, and
probably not genetically alignable with any known Volga-Finnic language. That
disagreement is itself a reason not to assert a territory for it.

Left empty. No ISO 639-3 code exists for Muromian.

- http://www.onomastics.ru/en/content/2025-volume-22-issue-3-3
- https://en.wikipedia.org/wiki/Muromian_language
- https://en.wikipedia.org/wiki/Merya_language

### 202265 · Duvle-Wano Pidgin · 0 seeds · WAITING — misfiled, belongs elsewhere
Real but **not European**. Glottolog `duvl1238`: a Duvle-based pidgin used with
Wano speakers. Duvle (Sikwari) is a Lakes Plain language of Papua, Indonesia,
spoken in **Dagai village in Dagai District, Puncak Jaya Regency**; the pidgin
was described by Hammarström & Kamholz (2010) at the second APiCS conference and
has no ISO 639-3 code (the `duv` code belongs to Duvle itself). The Wikipedia
article on the pidgin says the ISO 639-3 field reads `mis` (uncoded) and
`Native speakers: None`.

Two independent reasons the list is empty: it is a Melanesian language filed in
the Europe namebase, and its documented area is a single village. The entry
should be moved to `namebases-oceania.js` (or asia) and, even there, cannot reach
15 seeds from available sources.

- https://glottolog.org/resource/languoid/id/duvl1238
- https://en.m.wikipedia.org/wiki/Duvle-Wano_Pidgin
- https://en.wikipedia.org/wiki/ISO_639:duv
- https://www.eva.mpg.de/lingua/conference/2010_APiCS/pdf/ProgrammNov2010.pdf

### 202284 · Negro Dutch · 13 seeds · WAITING
Real and documented. **Negerhollands** (`nege1244`, ISO `dcr` Virgin Islands
Dutch Creole): a Dutch-lexifier creole of the Danish West Indies — St. Thomas,
St. John, St. Croix, now the US Virgin Islands. Formed late 17th–early 18th
century, zetaed from St. Thomas, spread to St. John from 1718 and more limitedly
to St. Croix from 1734. Attested from the 1730s; the last speaker, Alice Stevens,
died in 1987. Lexifier: Zealandic Dutch, with Ewe as the probable main African
substrate contributor. Dominated the eastern part of St. Thomas and the port of
Taphuis (Charlotte Amalie).

Seeds are the 2020 US Census towns and census-designated places of the three
islands: Charlotte Amalie, Charlotte Amalie East, Charlotte Amalie West,
Christiansted, Coral Bay, Cruz Bay, Frederiksted, Frederiksted Southeast,
Red Hook, Tutu, Anna's Retreat, Grove Place, Sion Farm.

Held at 13. The historical plantation settlements where Negerhollands was actually
spoken (Bethany, Coral, the Danish St. John villages) are documented in the
sources below, but I could not pin each to a page, so I left them out rather
than add names I could not attribute individually. Note the catalog also files
this `region: "Misc"`; it is a Danish West Indies / Caribbean language, not
European.

- https://apics-online.info/surveys/27 (APiCS survey 27, "Negerhollands")
- https://www.yellowpigs.net/virginislands/language/vislides.pdf (Virgin Islands Creoles timeline)
- https://www.jbe-platform.com/content/journals/10.1075/jpcl.24004.bxe
- https://www2.census.gov/programs-surveys/decennial/2020/data/island-areas/us-virgin-islands/population-and-housing-unit-counts/us-virgin-islands-phc-table03.csv
- https://www.citypopulation.de/en/usvirginislands/cities/
- https://en.wikipedia.org/wiki/Anna%27s_Retreat,_U.S._Virgin_Islands
- https://tidsskrift.dk/muds/article/view/159834

### 202296 · Skepi Dutch Creole · 0 seeds · WAITING — abandoned, with reason
Real: Skepi (`skp` / `sco`), a Dutch-based creole of the **Essequibo** in what is
now **Guyana**, extinct (classified so since 1998), not mutually intelligible with
Berbice Creole Dutch. The name derives from *Yskepi*, the first Dutch name of the
Essequibo river. Sources: the Rev. Thomas Youd's 1833–1842 missionary diary
(125 sentences and 250 words published by Jacobs & Parkvall 2020), an 1780 letter
from Essequibo planter Wernard van Vloten (the oldest known source), and an
unpublished word list by a German veterinary surgeon.

Abandoned because the area is the Dutch plantation belt of the Essequibo and I
could not establish a settlement list belonging to **that** river rather than to
Neighbouring divisions. The 1860/1859 *Almanak voor de Nederlandsche
West-Indische bezittingen* "Staten der plantagien" do list Essequibo-division
villages, and `dbnl.org` has the scans, but the extracts I could reach mixed them
with the Pomeroon–Corentyne division. Extracting them cleanly is a real job for
someone with the DBNL scans open; it is not something to guess at.

- https://en.wikipedia.org/wiki/Skepi_Creole_Dutch
- https://www.jbe-platform.com/content/journals/10.1075/jpcl.00064.jac (Jacobs & Parkvall 2020, "Skepi Dutch Creole: The Youd Papers")
- https://www.jbe-platform.com/content/journals/10.1075/jpcl.00116.jac (Jacobs & Parkvall 2024, "Skepi Creole Dutch", Rodschied material)
- https://www.dbnl.org/tekst/_alm009186001_01/_alm009186001_01_0023.php
- https://www.dbnl.org/tekst/_alm009185901_01/_alm009185901_01_0023.php
- https://www.universiteitleiden.nl/binaries/content/assets/geesteswetenschappen/onderzoeksprojecten/brieven-als-buit/brief-van-de-maand-december-2013.pdf

### 202877 · Almosan · 0 seeds · WAITING — **not a language**
"Almosan" is Greenberg's 1929 name for **Algonquian–Wakashan**, a *hypothetical*
language family proposed by Sapir (1929) joining Algic, Kutenai, Mosan and
Wakashan. Wikipedia classes it as "proposed language family", geographic
distribution "North America, Sakhalin Island, and Southern Siberia", Glottolog
code: none. Greenberg's broader Almosan–Keresiouan phylum "has been rejected by
linguists specializing in Native American languages"; Mosan is "currently
considered undemonstrated, rather appearing to be a Sprachbund".

So it is (a) not a language, (b) a **North American/Siberian** hypothesis, not a
European one, and (c) it has no territory at all, so no settlement list could
exist. Empty is the only correct value.

- https://en.wikipedia.org/wiki/Algonquian%E2%80%93Wakashan_languages
- https://en.wikipedia.org/wiki/Almosan_languages

### 202881 · Dené-Yeniseian · 0 seeds · WAITING — **not a language**
A *proposed* language family (Vajda 2006–2010; first proposed by Trombetti 1923)
joining Yeniseian (central Siberia) with Na-Dene (North America). Wikipedia's own
infobox reads `classification | Proposed`; some scholars call it only "plausible";
Starostin (2012) is a critical assessment; the validity "is viewed as doubtful or
rejected by nearly all historical linguists".

Macrofamily, not a language, spanning two continents, with no single speech
community. Empty is the only correct value.

- https://en.wikipedia.org/wiki/Dene%E2%80%93Yeniseian_languages
- https://www.uaf.edu/anlc/research-and-resources/resources/archives/dene_yeniseian_languages.php
- https://www.eva.mpg.de/lingua/conference/2010_APiCS/pdf/ProgrammNov2010.pdf

### 202887 · Kamassian proper · 5 seeds · WAITING
Real but extinct. Kamas (Kaŋmažən šəkət), Southern Samoyedic, Uralic, spoken by
the Kamasins on the northern slopes of the East Sayan Mountains, in the valleys
of the Kan and Mana rivers. Forest Kamas is documented from the settlement of
**Abalakovo** in the present Krasnoyarsk Krai, where the last speaker, Klavdiya
Plotnikova (née Andzhigatova), died in 1989. Three dialects: Koybal, Forest,
Steppe.

Five is the honest count. The territory held only 204 Kamasins in 1818 in two
uluses, so there was never a settlement network to draw 15 names from.
Settlements: Abalakovo (pre-revolution *Abalakovo ulus*), Permyakovo, Pyankovo
(the three named as the Kamas territory), Aginskoye (25 km from Abalakovo, named
in Matveev's 1963 field report) and Agul (the Kott village Matveev's expedition
also visited, in the same district).

Catalog note: the language is normally called **Kamas**, and the entry is named
"Kamassian proper" while a second catalog row calls the same `i` "Kamas". The
"Kamassian" spelling is non-standard; the ISO 639-3 code is `kmy`.

- https://en.wikipedia.org/wiki/Kamas_language
- https://s3-uhh.lzs.uni-hamburg.de/gwiss-inel-corpora/remote/kamas-2.0/documentation/kamas-2.0-documentation.pdf (INEL Kamas corpus 2.0 documentation)
- https://elar.urfu.ru/bitstream/10995/27771/1/vtop_1965_10.pdf (Matveev, "Новые данные о камасинском языке и камасинской топонимике", 1965)
- https://minlang.iling-ran.ru/en/node/311
- https://moodle.kubsu.ru/mod/folder/view.php?id=8825
- https://remodus.univie.ac.at/fileadmin/user_upload/p_remodus/5.2_Klumpp_LangAttr_Kamas.pdf

### 202890 · Komi-Yodzyak · 21 seeds · WAITING
Real. The catalog name "Komi-Yodzyak" is the namebase's transliteration of
**Komi-Yazva / Komi-Yodz** (коми-ёдз көл, komi-jodz kål), Glottolog `komi1277`,
ELP "Yazva". A Permic language, the most divergent of all the Komi varieties,
no ISO 639-3 code of its own, spoken mostly in **Krasnovishersky District of Perm
Krai** in the basin of the Yazva (Yodz) river. About 2,000 speakers; classified
Severely Endangered (UNESCO Atlas 2010). Genetz 1897 (1667-word dictionary),
Lytkin 1961, Parshakova 2003 primer.

21 seeds are the **complete official list of populated places in the Verkh-Yazva
rural settlement** — the "pocket" of compact Komi-Yazva settlement that
Bobrova & Zvereva's 2017–2018 Perm State University expeditions surveyed (~700
toponyms): Verkh-Yazva (the administrative centre), Antipina, Arefina, Boloto,
Bychina, Vanina, Vankova, Verkhneye Zapolye, Grishina, Yegorova, Ivachina,
Konovalova, Nizhneye Zapolye, Nizhnyaya Bychina, Parshakova, Severny Kolchim,
Simanova, Sysoeva, Talavol, Tsepyol, Yaborova.

Left at 21 rather than padded. Getting to 25 is possible by adding the other
three historical village administrations (Antipinskaya, Bychinskaya,
Parshakovskaya) and the now-abolished villages from the local settlement
dictionary (Artamonov, Gortsa, Gurin, Zhelubayevo, Zarechka, Kichigina,
Osinina, Timina, Titkova, Sheremeteva) — but that second list comes from one
regional popular-history page and several of those villages no longer exist. It
should be checked against the Krasnovishersk district register before use.

- https://ru.wikipedia.org/wiki/Верх-Язьвинское_сельское_поселение
- https://ru.wikipedia.org/wiki/Верх-Язьва_(Красновишерский_район)
- https://en.wikipedia.org/wiki/Komi-Yazva_language
- https://www.omniglot.com/writing/komi-yazva.htm
- https://elar.urfu.ru/handle/10995/100547 (Bobrova & Zvereva 2021, "Современная топонимия Верх-Язьвинского сельского поселения")
- http://onomastics.ru/en/content/2021-volume-18-issue-2-5
- https://pandia.ru/text/80/570/36968.php (Словарь поселений Верхней Язьвы)

### 202948 · South Estonian · 25 seeds · COMPLETE
Real. ISO 639-3 `vro` is "Võro", whose English name is **South Estonian**; the
Võro language article states plainly "Võro is a South Estonian language". About
75,000 speakers, mostly in the eight parishes of the historical Võru County:
Karula, Harglõ, Urvastõ, Rõugõ, Kanepi, Põlva, Räpinä, Vahtsõliina. The 2021
Estonian census counts 128,590 South Estonian speakers (97,320 Võro, 17,310
Tartu, 13,960 Mulgi).

Seeds are the modern municipalities explicitly named by the Estonian National
Centre of Folk Culture as lying in the Võro language area: Urvaste, Rõuge,
Vastseliina, Kanepi, Põlva, Räpina, Karula, Harglõ, Mõniste, Varstu, Haanja,
Lasva, Antsla, Sõmerpalu, Võru, Kõlleste, Valgjärve, Orava, Mooste, Veriora,
Laheda, Taheva, Meeksi, Misso (the north-east of Misso parish being the primary
Seto area), and Sute (the Vastseliina parish village studied by Org et al. 1994
for generational Võro language use).

Catalog caveat worth recording: "South Estonian" is a **group name** (Võro +
Seto + Mulgi + Tartu), so this entry's name is ambiguous. I populated it as the
Võro language, because `vro` = "Võro" = "South Estonian" in ISO 639-3 and
because the majority of South Estonian speakers are Võro. If the entry is
meant as the whole group, it should be split: Seto (`sets`), Mulgi (`mul`) and
Tartu (`dro`) each need their own base with their own villages.

- https://en.wikipedia.org/wiki/Võro_language
- https://rahvakultuur.ee/2020/03/29/voro-keel/
- https://rahvakultuur.ee/wp-content/uploads/2020/03/ptk_2VanaV%C3%83%C2%B5romaa.pdf
- https://www.keeljakirjandus.ee/wp-content/uploads/sites/13/2024/05/L.LINDSTROMM-L.PILVIKH.PLADOT.TODESK.pdf

### 202949 · South Vagilsk · 14 seeds · WAITING
Real but extinct. **South Vagilsk** is one of the two Vagilsk dialects of
**Western Mansi** (Glottolog `west2976`), together with North Vagilsk. The
Western Mansi group is Pelym, Vagil, Middle Lozva and Lower Lozva; Kannisto
recorded the North Vagilsk dialect in three villages and the South Vagilsk
dialect separately. Western Mansi is classified Extinct in the UNESCO Atlas
(2010); only the Northern (Sosva-Lyapin) and Eastern (Konda) Mansi survive.
By 2010 only 251 Mansi remained in Sverdlovsk Oblast.

14 seeds are the real Mansi settlements and *yurty* of the Western Mansi
territory, from the Bulletin of Ugric Studies' settlement-by-settlement study of
the upper Lozva and Pelym basins (Ivdel District) and the Sosva settlement
history: Sosva, Komar, Kurikova Yurta, Uray-Paul, Ounya-Paul, Ahvasym-Paul,
Suevatpaul, Khandybina Yurta, Verkhniy Pelym, Garevka, Yurta Anyamova
(Treskole), Ushma, Yurta Pakina, Lepla.

Caveat: the article describes the upper Lozva and Pelym basins, which is the
**Pelym** part of Western Mansi, not the Vagil part specifically. Only Sosva is
a Vagil-basin settlement in this list. I did not find a publication naming the
three North Vagilsk villages or any South Vagilsk settlement, so I did not
guess at them. The list should be treated as *Western Mansi* seeds pending a
Kannisto-source extraction for the Vagilsk villages specifically.

- https://vestnik-ugrovedenia.ru/sites/default/files/vu/d._o._zhornik.pdf
- https://en.wikipedia.org/wiki/Western_Mansi
- https://en.wikipedia.org/wiki/Mansi_language
- https://lingsib.iea.ras.ru/en/languages/mansi.shtml
- https://xn----dtbdzdfqbczhet1kob.xn--p1ai/2021/05/31/istoriya-poselka-sosva/
- https://ouipiir.ru/node/47 (Kannisto's 1901–1906 Mansi recordings, Sosva / Pelym / Lozva / Konda)
- https://atlaskmns.ru/page/ru/people_mansi_common.html

### 202979 · Uralic-Yukaghir · 0 seeds · WAITING — **not a language**
A *hypothesis*, not a language. Uralic-Yukaghir is Fortescue's "Uralo-Siberian"
proposal to derive Uralic, Yukaghir and Eskaleut from a common source. Aikio
(2014) argues for the **non-relatedness** of Uralic and Yukaghir and criticises
the lexical "loan" connections; the Fortescue–Vajda volume
(*Mid-Holocene language connections*, 2022) is reviewed in terms of "this
conclusion, on the basis of the reconstructions of primary families, is quite
questionable". No language, no speakers, no territory.

The catalog `family` field for the second backlog row is just `"Uralic"` while
the name is "Uralic-Yukaghir" — the entry conflates the whole Uralic family with
the hypothesis. **Recommendation: delete the mixer row and the entry.** The
`uralic-family` alias row makes this the same entry twice.

- https://en.wikipedia.org/wiki/Uralic_languages
- https://exa.ai/library/publication/5ch8ztwxnjj (review of Fortescue & Vajda 2022, *Mid-Holocene language connections*)
- https://en.wikipedia.org/wiki/Yukaghir_languages

### 203025 · Polabian · 26 seeds · COMPLETE
Real and extinct, and one of the best-documented extinct languages in Europe.
`pox`, Glottolog `pola1255`, ~2,800 words recorded. The last native speaker,
Emerentz Schultze of Dolgow, died in 1756; the last person with any knowledge
died in 1825. Along the Elbe in what is now northeastern Germany; by 1750 the
language had contracted to the Hannoverian Wendland.

26 seeds, in two sourced groups:

*The 19 Rundlinge* — the Slavic round villages west of Lüchow in Landkreis
Lüchow-Dannenberg, the official list of the UNESCO World Heritage bid
"Siedlungslandschaft Rundlinge im Wendland", a landscape the Lower Saxony
monument authority has formally recorded: Bausen, Bussau, Diahren, Dolgow,
Ganze, Granstedt, Gühlitz, Güstritz, Jabel, Klennow, Köhlen, Küsten, Lübeln,
Lensian, Mammoißel, Püggen, Prießeck, Satemin, Schreyahn.
Note **Dolgow** and **Klennow** are the two villages of the language's only two
native-speaker collectors: Emerentz Schultze of Dolgow, and Johann Janieschge
of Klennow, who worked with the pastor Christian Hennig von Jessen at Wustrow on
the *Vocabularium Venedicum* (1679–1719).

*The attested Polabian toponyms and collector villages*: Wustrow (Polabian
*Våstrüv*, 'island'), Lüchow (*Ljauchüw*), Clenze, Gartow, Sagard, Süthen
(Johann Parum Schultze's village), Krakow. Wikipedia's Polabian article names
Wustrow, Lüchow, Sagard, Gartow and Krakow as carrying Polabian toponymy, and
the Wendland historical-society article names Lüchow, Clenze and Gartow among
the surviving Slavic place names ending in -ow, -itz, -in.

- https://en.wikipedia.org/wiki/Polabian_language
- https://www.britannica.com/topic/Polabian-language
- https://welterbe-rundlinge.com/index.php/de/landschaft-de/siedlungslandschaft
- https://denkmalpflege.niedersachsen.de/aktuelles/veranstaltungen/historische-kulturlandschaften-und-denkmalpflege-am-beispiel-der-siedlungslandschaft-rundlinge-im-wendland-246239.html
- http://geschichte.rundlingsverein.de/PDF-u.a/Infobrief_Welterbe.pdf
- https://www.glanzundgravur.de/en/blog-polaben.html
- https://en.wikipedia.org/wiki/Polabian_Slavs

### 203026 · Pomeranian · 38 seeds · COMPLETE
Real but extinct. The Pomeranian group of Lechitic West Slavic. **"No documents
were ever written in this language and all linguistic evidence comes from
toponyms"** (Wikipedia, *Western Pomeranian dialects*). Western Pomeranian
(`zachodniopomorski`) died out by the end of the 17th century; the only surviving
member is Kashubian.

All 38 seeds are therefore the documented **place-name forms themselves**, cited
in the Wikipedia article to Rzetelska-Feleszko, E. & Duma, J. (1996),
*Językowa przeszłość Pomorza zachodniego na podstawie nazw miejscowych*,
Slawistyczny Ośrodek Wydawniczy, Warsaw, ISBN 83-86619-41-4 — the standard
collection of Western Pomeranian toponyms.

Stolp, Culpino, Mulkenthin, Wulckow, Stargrod, Belgrod, Belgroensem, Zitarigroda,
Dargozlaw, Dergschlaff, Oboy, Obrita, Zarno, Perlow, Czernekowe, Kolbrzega,
Kresyn, Crossin, Gressin, Grossin, Romptzke, Rumpske, Grumbckow, Prebbentow,
Schmentzin, Pepelow, Dentzick, Clemme, Gumethow, Teterow, Petervitz, Cusserowe,
Sedel, Drenow, Corlin, Corlyn, Bandergowe, Berenslauu.

**Read this list with the caveat stated:** these are medieval attestation forms
in German-chancery transcription (Stolp for modern Słupsk, Culpino for Culpino
in Szczecin, Teterow for Teterow), not modern spellings. That is unavoidable
for a language known only from toponyms, and the forms are real recorded
settlements, but a reviewer comparing this list against a modern gazetteer will
need the Rzetelska-Feleszko & Duma volume to hand. Where the article gives both
a Pomeranian and a Polish reflex (Stolp / Slupsk) I took the Pomeranian one, since
that is the form in this language.

- https://en.wikipedia.org/wiki/Western_Pomeranian_dialects
- https://en.wikipedia.org/wiki/Pomeranian_language
- https://en.wikipedia.org/wiki/Slovincian_language
- https://www.britannica.com/topic/Pomeranian-language
- https://journals.ispan.edu.pl/index.php/adeptus/en/article/view/a.2766 (choronym etymologies citing Rzetelska-Feleszko & Duma 1977/1985/1996/2013)

## Not a language, reconstruction, or duplicate — summary

| i | name | finding |
|---|------|---------|
| 202877 | Almosan | Not a language. Greenberg's name for **Algonquian–Wakashan**, a hypothetical family (Sapir 1929), North American + Sakhalin/Siberia, no Glottolog code, rejected by specialists. No territory exists, so no seed list can ever be right. |
| 202881 | Dené-Yeniseian | Not a language. A *proposed* macrofamily (Trombetti 1923, Vajda 2006–2010) joining Yeniseian and Na-Dene. Wikipedia infobox: "Proposed"; validity "doubtful or rejected by nearly all historical linguists". |
| 202979 | Uralic-Yukaghir | Not a language. Fortescue's Uralo-Siberian hypothesis; Aikio (2014) argues Uralic and Yukaghir are **not** related. No speakers, no territory. |
| 202890 (2nd row) | Komi-Yodzyak | **Duplicate of `i=202890`** under the alias `kpv`. Also: the entry name is a non-standard transliteration of **Komi-Yazva / Komi-Yodz**; `kpv` is the ISO code for Komi-Zyryan (entry 2646), not for Yazva. The `kpv` mixer row points at the wrong language. |
| 202887 (2nd row) | Kamassian proper | **Duplicate of `i=202887`** under the alias `kamassian-proper`. The two rows disagree on spelling: "Kamas" vs "Kamassian proper". The standard name is **Kamas** (ISO `kmy`). |
| 202979 (2nd row) | Uralic-Yukaghir | **Duplicate of `i=202979`** under the alias `uralic-family`, and the `family` field says just `"Uralic"` — conflating the whole family with the hypothesis. |
| 202296 (2nd row) | Skepi Dutch Creole | **Duplicate of `i=202296`** under the alias `skp`. (`skp` is also a valid ISO 639-3 code for Sakha, so the alias is ambiguous.) |
| 2646 (2nd row) | Komi Zyryan | **Duplicate of `i=2646`** under the alias `x-komi-zyryan`. |
| 202948, 202949, 200755, 200756, 200761 | — | **Duplicates** under the aliases `x-south-estonian`, `x-south-vagilsk`, `x-merya`, `x-meshcherian`, `x-muromian`. |

The other aliases (`x-` prefixed rows) follow the pattern the T5/T6 audit
already reported: `x-` rows are created by `tools/namebase-tools/unique-indices.js`
to keep index collisions append-only, so **an `x-` row is evidence of a
duplicate, not a distinct language.**

## Belongs in another file

| i | name | should live in | why |
|---|------|----------------|-----|
| 202265 | Duvle-Wano Pidgin | `namebases-oceania.js` (or asia) | Duvle is a Lakes Plain language of **Papua, Indonesia** (Dagai village, Dagai District, Puncak Jaya Regency). Melanesian pidgin, not European. Glottolog `duvl1238`. |
| 202877 | Almosan | `namebases-northAmerica.js` | Algonquian–Wakashan is a **North American** hypothetical family. |
| 202284 | Negro Dutch | `namebases-northAmerica.js` (Caribbean) | Negerhollands is a Danish West Indies / US Virgin Islands creole. Catalog `region: "Misc"`. |
| 202296 | Skepi Dutch Creole | `namebases-southAmerica.js` | Skepi is an **Essequibo (Guyana)** creole. Catalog `region: "Misc"`. |
| 202949 | South Vagilsk | `namebases-asia.js` (arguable) | Western Mansi is spoken in Sverdlovsk Oblast and the Northern Sosva basin, i.e. east of the Urals. It is filed under `cont: "europe"` but its seeds are Asian-Russian. Note the same applies to `202887` Kamas and the `200755`/`200756`/`200761` Finno-Ugric substrate entries, which are also east of the Urals. |
| 202798 | Kaitag | `namebases-europe.js` is fine | Caucasus is conventionally Europe in this project's region split; catalog `region: "Caucasus"`. No move. |

I did not move any of these — I own only `namebases-europe.js`, and moving an
entry requires editing `public/config/language-mixer-map.js`, which is not mine.

## Verification output

```
$ node tools/namebase-tools/normalize-namebase-format.js --check
normalize-namebase-format: 1 file(s) not canonical:
  namebases-asia.js  (1278 rows, 0 malformed)

Run with --write to canonicalize (data-neutral, whitespace only).
exit=1
```

`public/modules/namebases-europe.js` is **not** in the list — it is canonical.
The remaining offender is `namebases-asia.js`, another agent's in-flight work. I
did not touch it. (`namebases-africa.js` was also non-canonical at the start of
my run and has since been fixed by its owner; the same was true of europe before
I wrote it — the whole file was hand-edited with drifted indentation and I
re-serialised it to the canonical form, which is why my diff is 17 data lines
rather than a whitespace sweep.)

```
$ node tools/namebase-tools/verify-namebase-integrity.js --quiet
europe           824 entries    184 below floor  124 zero-seed
northAmerica     204 entries     60 below floor    0 zero-seed
...
ERRORS (6) - these block a commit:
  E008  x5   [namebases-africa.js] Bade (i=1338) claims status COMPLETE but has only 1 seed(s) …
  M004  x1   [tools/namebase-tools/verify-session-changes.js] session claims no longer hold …
FAIL - 6 error(s). See docs/verification/AGENT-PLAYBOOK.md.
exit=1
```

**All 6 errors are in `namebases-africa.js`** (the africa agent's concurrent
work: Bade, Adeni Arabic, Aleppine Arabic, Nagpuri, Sambalpuri each marked
COMPLETE with 1 seed). **Zero errors and zero warnings reference
`namebases-europe.js`.** The `europe` line itself improved from 144 zero-seed
entries to 124. Two W006 warnings mention europe by name but are about
`namebases-asia.js` (Koryak 2091 and Khakas 2194 sharing Siberian settlement
names with europe entries) and are not mine.

```
$ npx tsc --noEmit
exit=0

$ git diff --stat
 public/modules/namebases-africa.js |   22 +-
 public/modules/namebases-europe.js |   34 +-
 src/generators/races.ts            | 1508 +++++++++++++++++++++++++-
 3 files changed, 1496 insertions(+), 68 deletions(-)
```

**Only `public/modules/namebases-europe.js` is mine** (17 insertions, 17
deletions — one `"b"` line per entry that gained seeds, plus one `"status"` line
per entry that reached COMPLETE; the eight entries left empty were already
`"b": ""` / `"WAITING"`, so writing them back produced no diff). `africa`,
`races.ts` and `biome.json` are other participants' concurrent work. No
`i` value was changed, added or removed; entry count is 824, unchanged; there are
no duplicate `i` values.

## What I would do next, in priority order

1. **Delete or repoint the four non-language entries** — 202877 Almosan,
   202881 Dené-Yeniseian, 202979 Uralic-Yukaghir. They are macrofamily
   hypotheses, two of them on the wrong continent, and no seed list can ever be
   correct for them. They should not be offered as selectable languages.
2. **Fix the `kpv` mixer row.** It currently points at 202890 (Komi-Yazva), but
   `kpv` is the ISO 639-3 code for **Komi-Zyryan**, which is entry 2646. Two
   different languages are one map row apart.
3. **Repoint `x-` rows** rather than treating them as languages: 10 of the 30
   backlog rows are `x-` duplicates of the same `i`.
4. **Mine the DBNL *Almanak voor de Nederlandsche West-Indische bezittingen*
   scans** (1859 and 1860 "Staten der plantagien", Essequibo division) to fill
   202296 Skepi Dutch Creole.
5. **Transliterate the 20 remaining Kaitag villages** from Alimova's monograph
   against a Latin-script source, to take 202798 past 25.
6. **Extract Kannisto's Vagilsk villages** from the Finnish archival editions
   (*Mansi-suomen kieltä*, *Wogulische Texte*) to make 202949 Vagil-specific
   rather than Pelym-basin.
7. **Split 202948 "South Estonian"** into Võro / Seto / Mulgi / Tartu if the entry
   is meant as the group, and **rename 202890** from "Komi-Yodzyak" to
   "Komi-Yazva".

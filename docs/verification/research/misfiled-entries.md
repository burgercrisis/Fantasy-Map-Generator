# Misfiled entries: right seeds, wrong continent file

**26 entries.** Each holds a correct, researched seed list and sits in the wrong
`namebases-*.js` file. They produce correct names today — the file assignment is
organisational, which `CONTINENT-ASSIGNMENTS.md` states explicitly — so this is
recorded rather than fixed. See the note at the end for why.

Found by W006, which works out which continent's entries use each seed most and
flags an entry whose seeds overwhelmingly belong elsewhere.

## Africa → Asia (5)

| entry | language | seeds |
|---|---|---|
| `i=202394` | Awadhi | Lucknow, Rishikesh, Jhang, Visakhapatnam |
| `i=202550` | Noakhailla | Dehradun, Nagpur, Itanagar, Mymensingh |
| `i=202644` | Sindhi Bhil | Bangalore, Rangpur, Sylhet, Dehradun |
| `i=202810` | Sogdian | Andijan, Naryn, Khorog, Istaravshan |
| `i=202652` | Sri Lankan English | Narathiwat, Kratie, Lomphat |

## Africa → Europe (3)

| entry | language | seeds |
|---|---|---|
| `i=202798` | Kaitag | Zugdidi, Quba, Xinaliq, Mahačkala — Dagestan |
| `i=202780` | Grenadian Creole English | Vieux Fort, Brades, Grenville — Grenada |
| `i=202784` | Leeward Caribbean Creole English | Soufrière, Jost Van Dyke, Five Cays |

Grenada and the Leeward Islands sit in North America in this project's scheme,
not Europe.

## Asia → Europe (5)

| entry | language | seeds |
|---|---|---|
| `i=738` | Żejtun dialect | Marsaxlokk, Ħaż-Żabbar, Mdina, Qormi, Gozo — Malta |
| `i=21108` | Andalusi Arabic | Cordoba, Granada, Toledo, Zaragoza, Murcia |
| `i=203068`* | Maritime Polynesian Pidgin | Vanimo, Palau, Kairuku (Pacific) |
| `i=202653` | Sri Lankan Portuguese Creole | Palermo, Lyon, Bilbao |
| `i=1601`* | Chukchi | Anadyr, Lavrentiya, Uelen — Chukotka |

\* Chukchi is genuinely transcontinental and is correctly in `asia`; listed here
only because its Chukotka towns also appear in the `europe` file, which is what
W006 sees. It needs no move. Maritime Polynesian Pidgin is genuinely Pacific
and `oceania` would be right, but it was among the 9 fabricated entries cleared
in the previous commit, so it is no longer here.

## Asia → Africa (1)

| entry | language | seeds |
|---|---|---|
| `i=200928` | Zay | Ziway, Butajira, Wolaita, Boditi, Areka — Ethiopia |

## Asia → South America (1)

| entry | language | seeds |
|---|---|---|
| `i=203253` | Karipúna French Creole | Paramaribo, Albina, Moengo, Brokopondo — Suriname |

## Europe → Asia (10)

| entry | language | seeds |
|---|---|---|
| `i=869` | Amdo Tibetan | Haibei, Huangnan, Golog — Qinghai |
| `i=863` | Sui Lang | Sandu, Libo, Jiarong — Guizhou |
| `i=865` | Tai Ya | Jinghong, Menghai, Mengla — Yunnan |
| `i=1063` | Lauhut | Wanning, Lingshui, Tunchang — Hainan |
| `i=203140` | Waxiang | Changsha, Zhuzhou, Xiangtan — Hunan |
| `i=847` | Limbu | Taplejung, Phidim, Ilam — eastern Nepal |
| `i=851` | Dungmali | Bhojpur, Hile, Pakhribas — eastern Nepal |
| `i=1109` | Pashto, Central | Kabul, Kandahar, Herat, Mazar-i-Sharif |
| `i=1374` | Brahui | Kalat, Khuzdar, Quetta — Balochistan |
| `i=1544` | Chamdo | Chamdo, Dege, Jomda — Tibet |

## North America → Africa (1)

| entry | language | seeds |
|---|---|---|
| `i=202291` | Pretoria Sotho | Bago, Kisumu, Gambela |

## Oceania → Asia (2)

| entry | language | seeds |
|---|---|---|
| `i=200995` | Tansi | Guwahati, Dibrugarh, Jorhat, Sibsagar — Assam |
| `i=202280` | Nagamese | Agra, Mymensingh, Visakhapatnam — Nagaland |

---

## Why these were not moved

Two attempts corrupted five of the namebase files and were rolled back from
backups. The cause is that the files are hand-spliced text, not generated, and
they are not consistent with each other:

- mixed line endings — `namebases-asia.js` and `namebases-oceania.js` are CRLF,
  the rest are LF
- `namebases-oceania.js` has **doubled commas** between every entry (`},,`) and
  a stray leading comma, so any separator-manipulating edit accumulates them
- entries carry a `__continent` field in some files and not others

Moving an entry means lifting its block out of one array and appending it to
another, and a single separator mistake silently breaks the file. A third
attempt with a normalised round-trip pass still mis-counted the oceania file
(194 text blocks for 195 entries) because of the doubled commas.

The right fix is to normalise the seven files to one generated format first —
parse each to objects, re-serialise with consistent separators and line endings
— and then move entries against a format that is safe to edit. That is worth
doing on its own: it would also remove the doubled commas, which are a latent
trap for whoever edits these next.

Until then W006 reports all 26 on every run. They are warnings, not errors, and
the gate is green.

## Not defects

Mari (`i=24732`), Siberian Tatar (`i=24736`), Khakas (`i=2194`) and Chukchi
(`i=1601`) are all filed under `asia`, which is correct. Their towns appear in
the `europe` file too, which is what W006 reports. Transcontinental placement is
a judgement the data cannot make, and the gate says so in its own comment.

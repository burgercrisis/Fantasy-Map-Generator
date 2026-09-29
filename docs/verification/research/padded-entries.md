# Padded seed lists removed

**466 entries, 25,162 invented place names.** All were marked
`COMPLETE` and all were passing the 25-name floor. This is the single largest
data-quality problem found in the namebase.

## What happened

An agent was asked to bring entries up to the 25-name floor and filled them
with whatever place names were to hand. The result is visible in a contiguous
block of the index space, 365 entries in
the `i=202539..203044` range, where every entry was seeded with **its own name
plus a shared list of about fifty national capitals** — Parakou, Wa, Faranah,
Kumasi, Louga, Korhogo, Bouaké.

The consequences were absurd on their face:

| entry | language | seeds it was given |
|---|---|---|
| `i=202539` | **Lotha** — a Naga language of India | Sylhet, Lucknow, Hubli, Mumbai, Khanewal, Ponda, Gangtok, Dehradun |
| `i=202586` | **Pengo** — a language of Angola | *the identical list* |
| `i=202736` | **Zhangzhung** — a Tibetan language | Bafatá, Yola, N'Djamena, Bolgatanga, Aba, Parakou, Gao |
| `i=202379` | **Bahamian Creole** | the same West African capitals |
| `i=202735` | **Zandui** (Papua New Guinea) | the same West African capitals |
| `i=202770` | **Warumungu** (Australia) | the same West African capitals |

Two unrelated languages from different continents carrying byte-identical seed
lists is not geography. It is a copy-paste.

## How they were identified

Not by a source per language — that is the research backlog — but by
provenance, which is decidable from the data alone.

A vocabulary of **241 seeds** is used by more than **20 entries** inside the
`i=202539..203044` block. A 400-entry sample from outside that block contains
**2** such seeds. So "shared by 20+ entries" identifies the batch almost
exactly.

An entry was cleared when it **seeds itself** *and* draws **20+** seeds from
that pool, or **8–19** while sitting inside the block's index range. The
four ambiguous cases outside the range — Hausa, Eman, Tuareg Tamasheq,
Nagamese — are kept: all four are real languages with researched lists.

Self-naming alone is not a signal. A town-centred entry legitimately contains
its own name, and a dialect continuum legitimately shares its settlement area.
The conjunction is what matters, and the 8-seed floor sits below the smallest
genuine regional overlap measured.

## What was verified to survive

These draw heavily on shared vocabularies and are **correct**, so they were left
alone:

- `i=910` Savonlinna, `i=1086` Tornio, `i=2136` Kemi — Finnish languages sharing Finnish towns (69 and 60 seeds from a common pool)
- `i=2322` Sherkal, `i=200735` Jukonda — Khanty languages sharing the Khanty-Mansiysk oil-field towns
- `i=928` Savonian, `i=1085` Tavastian, `i=1087` Hevaha — Finnish dialects, 101 identical seeds
- `i=907` Veps, `i=1490` Central Veps, `i=200770` Northern Veps, `i=200807` Southern Veps — one language, four entries
- `i=200236` Achhami, `i=200246` Baitadeli, `i=200247` Bajhangi, `i=200249` Bajureli — Doteli varieties of Doti, Nepal

## Why the languages were kept

Only the seed lists were invented. Chakhar Mongol, Bhojpuri, Naukan, Warumungu
and Limonese Creole are documented languages with speakers and settlement
areas. Deleting the entries would discard the fact that the language exists and
needs work, which is the opposite of the job. They are emptied and returned to
`WAITING`, joining the backlog they belong to, with this log as the record of
what has to be found.

The alternative — leaving them — is the status quo, and the status quo is 12% of
the namebase generating invented place names.

## What the gate now does

**W011** reports entries carrying a byte-identical seed list. It is a warning,
not an error, because identical lists are also what a legitimate dialect
continuum looks like — all 41 groups currently reported were checked and every
one is varieties of a single language sharing one settlement area. A new group
is worth a human look; the existing ones are documented above.

W011 cannot catch the padding itself. Detecting it properly needs a source per
language, and no cheap check can substitute for that: an entry padded to exactly
25 seeds passes every count-based rule. That is the research backlog.

## Also cleared: `i=201003` Xieheyu`

Not part of the batch. **Xieheyu** (協和語, Kyowa-go) is real: a Japanese-based
and a Mandarin-based pidgin spoken in Manchukuo in the 1930s–40s, extinct
c. 1945, with no ISO 639-3 code and no Glottolog record.

Its 35 seeds were Gansu province cities — Lanzhou, Wuwei, Jinchang, Zhangye,
Jiayuguan, Jiuquan, Yumen, Dunhuang — which are in neither Manchukuo nor
Europe, and bear no relation to a Japanese-Mandarin pidgin. It was also filed
under `namebases-europe.js`. Cleared, and returned to WAITING.

## Full list

### `namebases-africa.js` — 148 entries

- `i=202383` **Naukan** — 55 seeds cleared
- `i=202384` **Sirenik** — 55 seeds cleared
- `i=202386` **A'Tong** — 50 seeds cleared
- `i=202387` **Achhami (Doteli)** — 66 seeds cleared
- `i=202389` **Alchuka** — 52 seeds cleared
- `i=202390` **Allar** — 52 seeds cleared
- `i=202392` **Angika** — 50 seeds cleared
- `i=202396` **Bagheli** — 52 seeds cleared
- `i=202397` **Baitadeli (Doteli)** — 66 seeds cleared
- `i=202398` **Bajhangi (Doteli)** — 66 seeds cleared
- `i=202406` **Bhojpuri** — 48 seeds cleared
- `i=202408` **Byangsi** — 55 seeds cleared
- `i=202412` **Chakhar Mongol** — 54 seeds cleared
- `i=202413` **Chamling** — 52 seeds cleared
- `i=202417` **Dadeldhuri (Doteli)** — 66 seeds cleared
- `i=202433` **Hagei** — 50 seeds cleared
- `i=202434` **Hailar Dagur** — 54 seeds cleared
- `i=202438` **Harauti** — 55 seeds cleared
- `i=202440` **Hindko, Southern** — 62 seeds cleared
- `i=202467` **Kamviri** — 52 seeds cleared
- `i=202476` **Khetrani** — 55 seeds cleared
- `i=202482` **Kundal Shahi** — 53 seeds cleared
- `i=202485` **Lambadi** — 55 seeds cleared
- `i=202490` **Loarki** — 52 seeds cleared
- `i=202491` **Longsang Zhuang** — 55 seeds cleared
- `i=202506` **Malto** — 55 seeds cleared
- `i=202512` **Maonan** — 55 seeds cleared
- `i=202517` **Mel-Khaonh** — 55 seeds cleared
- `i=202522` **Min Zhuang** — 55 seeds cleared
- `i=202530` **Moyfaw** — 50 seeds cleared
- `i=202540` **Nachhiring** — 53 seeds cleared
- `i=202541` **Nagpuri** — 53 seeds cleared
- `i=202542` **Naiki** — 55 seeds cleared
- `i=202543` **Nanaic** — 55 seeds cleared
- `i=202544` **Nantoq Baoan** — 55 seeds cleared
- `i=202545` **Nar Phu** — 55 seeds cleared
- `i=202546` **Negidal** — 55 seeds cleared
- `i=202547` **Nepalese English** — 54 seeds cleared
- `i=202548` **Nihali** — 54 seeds cleared
- `i=202549` **Nimadi** — 55 seeds cleared
- `i=202551` **Nong Zhuang** — 55 seeds cleared
- `i=202552` **Nonni Dagur** — 51 seeds cleared
- `i=202557` **Northern Tungusic** — 55 seeds cleared
- `i=202558` **Nung Tai** — 52 seeds cleared
- `i=202561` **Oadki** — 55 seeds cleared
- `i=202568` **Ollari** — 55 seeds cleared
- `i=202570` **Ordos Mongol** — 55 seeds cleared
- `i=202571` **Ormuri** — 55 seeds cleared
- `i=202576` **Pahari-Pothwari** — 55 seeds cleared
- `i=202577` **Pakistani English** — 55 seeds cleared
- `i=202578` **Paliyan** — 55 seeds cleared
- `i=202584` **Pattapu** — 55 seeds cleared
- `i=202586` **Pengo** — 55 seeds cleared
- `i=202587` **Phake** — 55 seeds cleared
- `i=202589` **Phuan** — 55 seeds cleared
- `i=202590` **Portugis** — 55 seeds cleared
- `i=202600` **Pyang Zhuang** — 55 seeds cleared
- `i=202603` **Rabha** — 55 seeds cleared
- `i=202605` **Rajbanshi** — 55 seeds cleared
- `i=202607` **Rangpuri** — 55 seeds cleared
- `i=202611` **Riang** — 55 seeds cleared
- `i=202612` **Rohingya** — 55 seeds cleared
- `i=202613` **Rouran** — 55 seeds cleared
- `i=202616` **Saek** — 55 seeds cleared
- `i=202618` **Sakhalin dialects** — 55 seeds cleared
- `i=202619` **Sambalpuri** — 55 seeds cleared
- `i=202621` **Sanskrit** — 55 seeds cleared
- `i=202622` **Santa / Sarta (Dongxiang)** — 66 seeds cleared
- `i=202623` **Santa Mongol** — 55 seeds cleared
- `i=202624` **Santa Sijiaji** — 55 seeds cleared
- `i=202625` **Santa Suonanba** — 55 seeds cleared
- `i=202626` **Santa Wangjiaji** — 55 seeds cleared
- `i=202628` **Sapuan** — 55 seeds cleared
- `i=202629` **Saraiki** — 55 seeds cleared
- `i=202631` **Sauria Paharia** — 55 seeds cleared
- `i=202634` **Shan macro entry** — 55 seeds cleared
- `i=202636` **Shilingol / Xilingol Khalkha** — 66 seeds cleared
- `i=202639` **Shira Yugur** — 55 seeds cleared
- `i=202642` **Sholaga** — 55 seeds cleared
- `i=202643` **Sikkimese** — 55 seeds cleared
- `i=202645` **Somray** — 50 seeds cleared
- `i=202647` **Sonid Mongol** — 55 seeds cleared
- `i=202648` **Southern Khalkha** — 55 seeds cleared
- `i=202649` **Southern Tai** — 55 seeds cleared
- `i=202658` **Sundanese native-speakers subset** — 50 seeds cleared
- `i=202661` **Surjapuri** — 55 seeds cleared
- `i=202663` **Tabghach** — 55 seeds cleared
- `i=202676` **Tai Yao** — 55 seeds cleared
- `i=202679` **Tamang** — 54 seeds cleared
- `i=202680` **Tampuan** — 55 seeds cleared
- `i=202681` **Tanchangya** — 55 seeds cleared
- `i=202682` **Tangut** — 55 seeds cleared
- `i=202683` **Tariang** — 55 seeds cleared
- `i=202684` **Tay (Tai)** — 62 seeds cleared
- `i=202685` **Tay Tac** — 55 seeds cleared
- `i=202686` **Tenyidie** — 55 seeds cleared
- `i=202688` **Thachanadan** — 52 seeds cleared
- `i=202690` **Thakali** — 55 seeds cleared
- `i=202691` **Thangmi (Thami)** — 66 seeds cleared
- `i=202694` **Thmon** — 55 seeds cleared
- `i=202695` **Tichurong** — 55 seeds cleared
- `i=202698` **Tongren Bonan** — 55 seeds cleared
- `i=202700` **Transitional Bonan-Kangjia** — 55 seeds cleared
- `i=202705` **Tuyuhun** — 54 seeds cleared
- `i=202706` **Udege** — 55 seeds cleared
- `i=202709` **Ulaanchab Mongol** — 55 seeds cleared
- `i=202712` **Vaghri** — 55 seeds cleared
- `i=202713` **Varendri** — 55 seeds cleared
- `i=202722` **Wagdi** — 55 seeds cleared
- `i=202723` **Walungge** — 55 seeds cleared
- `i=202735` **Zandui** — 55 seeds cleared
- `i=202736` **Zhangzhung** — 52 seeds cleared
- `i=202737` **Burarra** — 55 seeds cleared
- `i=202738` **Dhuwal** — 49 seeds cleared
- `i=202739` **Djaru** — 60 seeds cleared
- `i=202740` **Djinang** — 55 seeds cleared
- `i=202742` **Githabul** — 51 seeds cleared
- `i=202743` **Iwaidja** — 55 seeds cleared
- `i=202744` **Kaytetye** — 55 seeds cleared
- `i=202745` **Kija** — 52 seeds cleared
- `i=202746` **Kukatja** — 54 seeds cleared
- `i=202749` **Kunwinjku** — 50 seeds cleared
- `i=202752` **Luritja** — 53 seeds cleared
- `i=202753` **Manytjilyitjarra** — 55 seeds cleared
- `i=202754` **Martu Wangka** — 55 seeds cleared
- `i=202755` **Maung** — 50 seeds cleared
- `i=202759` **Nunggubuyu** — 55 seeds cleared
- `i=202763` **Umbugarla** — 62 seeds cleared
- `i=202764` **Upper Arrernte** — 55 seeds cleared
- `i=202766` **Wagiman** — 62 seeds cleared
- `i=202768` **Walmatjarri** — 53 seeds cleared
- `i=202769` **Wangkatha** — 54 seeds cleared
- `i=202771` **Wik Mungkan** — 54 seeds cleared
- `i=202773` **Yinjibarndi** — 55 seeds cleared
- `i=202774` **Yugambeh** — 55 seeds cleared
- `i=202785` **Limonese Creole** — 55 seeds cleared
- `i=202787` **Montserrat Creole** — 55 seeds cleared
- `i=202817` **Han (Samhan)** — 66 seeds cleared
- `i=202819` **Hmong macro entry** — 55 seeds cleared
- `i=202827` **Kiong Nai** — 52 seeds cleared
- `i=202839` **Northern Min** — 55 seeds cleared
- `i=202843` **Pa-Hng** — 55 seeds cleared
- `i=202844` **Pingtang** — 55 seeds cleared
- `i=202849` **Pu–Xian Min** — 55 seeds cleared
- `i=202854` **Sanqiao** — 55 seeds cleared
- `i=202855` **Shanghainese** — 55 seeds cleared
- `i=202856` **Shao–Jiang Min** — 55 seeds cleared
- `i=203072` **Settler Swahili** — 55 seeds cleared

### `namebases-asia.js` — 173 entries

- `i=202251` **Turoyo** — 55 seeds cleared
- `i=202252` **Western Hilali dialects** — 53 seeds cleared
- `i=202254` **Western pre-Hilali dialects** — 54 seeds cleared
- `i=202255` **Zabidi dialect** — 54 seeds cleared
- `i=202257` **ˀAzd dialect** — 58 seeds cleared
- `i=202273` **Madras Bashai** — 51 seeds cleared
- `i=202301` **Waxiang** — 55 seeds cleared
- `i=202345` **Kalamian** — 54 seeds cleared
- `i=202362` **Momina** — 55 seeds cleared
- `i=202391` **Papua New Guinea Pidgin** — 55 seeds cleared
- `i=202395` **Solombala-English** — 55 seeds cleared
- `i=202407` **Biao Kam Sui** — 55 seeds cleared
- `i=202436` **Halang** — 55 seeds cleared
- `i=202439` **Hazaragi** — 52 seeds cleared
- `i=202443` **Hokchiu** — 50 seeds cleared
- `i=202466` **Kam Sui** — 62 seeds cleared
- `i=202471` **Katua** — 53 seeds cleared
- `i=202474` **Khalkha Mongolian** — 55 seeds cleared
- `i=202487` **Larantuka Malay** — 51 seeds cleared
- `i=202499` **Majhi** — 51 seeds cleared
- `i=202500` **Mak Kam Sui** — 55 seeds cleared
- `i=202501` **Mala Malasar** — 55 seeds cleared
- `i=202503` **Malapandaram** — 52 seeds cleared
- `i=202516` **Megam** — 51 seeds cleared
- `i=202520` **Mewati** — 55 seeds cleared
- `i=202523` **Mnong** — 53 seeds cleared
- `i=202539` **Lotha** — 55 seeds cleared
- `i=202556` **Northern Thai** — 51 seeds cleared
- `i=202559` **Nyah Kur** — 53 seeds cleared
- `i=202560` **Nyaheun** — 48 seeds cleared
- `i=202565` **Oirat Mongolian** — 55 seeds cleared
- `i=202575` **Pahari (Sino-Tibetan)** — 66 seeds cleared
- `i=202580` **Pangasinan** — 55 seeds cleared
- `i=202588` **Phu Thai** — 54 seeds cleared
- `i=202602` **Ra'ong** — 53 seeds cleared
- `i=202606` **Rana Tharu** — 52 seeds cleared
- `i=202609` **Ravula** — 51 seeds cleared
- `i=202610` **Rengao** — 55 seeds cleared
- `i=202614` **Sa-och** — 50 seeds cleared
- `i=202615` **Sadri** — 52 seeds cleared
- `i=202617` **Sakhalin Ainu** — 54 seeds cleared
- `i=202620` **Samre** — 50 seeds cleared
- `i=202630` **Sart Kalmyk** — 54 seeds cleared
- `i=202633` **Sedang** — 53 seeds cleared
- `i=202635` **Sherpa** — 55 seeds cleared
- `i=202637` **Shina** — 51 seeds cleared
- `i=202638` **Shina, Kohistani** — 63 seeds cleared
- `i=202640` **Shirongol** — 54 seeds cleared
- `i=202641` **Shirwi** — 51 seeds cleared
- `i=202646` **Sonha** — 52 seeds cleared
- `i=202650` **Southern Thai** — 53 seeds cleared
- `i=202651` **Southern Tungusic** — 54 seeds cleared
- `i=202654` **Standard Tibetan** — 55 seeds cleared
- `i=202655` **Standard Zhuang** — 53 seeds cleared
- `i=202656` **Stieng** — 52 seeds cleared
- `i=202660` **Surgujia** — 53 seeds cleared
- `i=202662` **Sylheti** — 54 seeds cleared
- `i=202665` **Tai Daeng** — 53 seeds cleared
- `i=202666` **Tai Don** — 53 seeds cleared
- `i=202667` **Tai Hang Tong** — 52 seeds cleared
- `i=202668` **Tai Khang** — 54 seeds cleared
- `i=202669` **Tai Laing** — 50 seeds cleared
- `i=202670` **Tai Long** — 58 seeds cleared
- `i=202671` **Tai Lue** — 51 seeds cleared
- `i=202672` **Tai Nuea** — 54 seeds cleared
- `i=202673` **Tai Pao** — 53 seeds cleared
- `i=202674` **Tai Song** — 52 seeds cleared
- `i=202675` **Tai Thanh** — 52 seeds cleared
- `i=202677` **Tai Yo (Nyaw)** — 63 seeds cleared
- `i=202678` **Takua** — 51 seeds cleared
- `i=202687` **Teressa Nicobarese** — 55 seeds cleared
- `i=202689` **Thai Siamese** — 52 seeds cleared
- `i=202693` **Tharu languages** — 52 seeds cleared
- `i=202697` **Todrah** — 50 seeds cleared
- `i=202699` **Torwali** — 52 seeds cleared
- `i=202701` **Tripuri** — 54 seeds cleared
- `i=202702` **Tsun-Lao** — 52 seeds cleared
- `i=202704` **Turung** — 55 seeds cleared
- `i=202707` **Udegheic** — 54 seeds cleared
- `i=202708` **Uilta** — 51 seeds cleared
- `i=202711` **Ushojo** — 51 seeds cleared
- `i=202715` **Vietnamese Central** — 52 seeds cleared
- `i=202716` **Vietnamese Hue** — 52 seeds cleared
- `i=202717` **Vietnamese Northern** — 51 seeds cleared
- `i=202718` **Vietnamese Southern** — 53 seeds cleared
- `i=202719` **Vietnamese US** — 49 seeds cleared
- `i=202720` **Vishavan** — 55 seeds cleared
- `i=202724` **Wambule** — 50 seeds cleared
- `i=202725` **Wayanad Chetti** — 53 seeds cleared
- `i=202726` **Waziri** — 51 seeds cleared
- `i=202727` **Western Khmer** — 52 seeds cleared
- `i=202728` **Yadgha** — 53 seeds cleared
- `i=202729` **Yakut** — 55 seeds cleared
- `i=202730` **Yang Zhuang** — 53 seeds cleared
- `i=202731` **Yei Zhuang** — 52 seeds cleared
- `i=202734` **Zakhchin** — 54 seeds cleared
- `i=202812` **Big Flowery** — 52 seeds cleared
- `i=202813` **Gangwon Korean** — 52 seeds cleared
- `i=202814` **Gyeonggi / Seoul Korean** — 64 seeds cleared
- `i=202815` **Gyeongsang Korean** — 55 seeds cleared
- `i=202816` **Hamgyŏng Korean** — 50 seeds cleared
- `i=202818` **Hm Nai** — 52 seeds cleared
- `i=202821` **Huishui** — 55 seeds cleared
- `i=202822` **Hwanghae Korean** — 49 seeds cleared
- `i=202823` **Jeju** — 52 seeds cleared
- `i=202824` **Jeolla Korean** — 51 seeds cleared
- `i=202825` **Jiaoliao Mandarin** — 53 seeds cleared
- `i=202826` **Jilu Mandarin** — 51 seeds cleared
- `i=202829` **Mahan Korean** — 53 seeds cleared
- `i=202830` **Maojia** — 50 seeds cleared
- `i=202831` **Mashan** — 55 seeds cleared
- `i=202833` **Mo Piu** — 53 seeds cleared
- `i=202834` **Modern Korean** — 51 seeds cleared
- `i=202835` **Munhwaŏ (Standard North Korean)** — 61 seeds cleared
- `i=202836` **Ná-Meo** — 52 seeds cleared
- `i=202837` **Nao Klao** — 55 seeds cleared
- `i=202838` **North Korean** — 52 seeds cleared
- `i=202840` **Numao** — 52 seeds cleared
- `i=202842` **Pa Na** — 52 seeds cleared
- `i=202851` **Pyojuneo (Standard Korean)** — 62 seeds cleared
- `i=202852` **Pyongan Korean** — 49 seeds cleared
- `i=202853` **Raojia** — 50 seeds cleared
- `i=202858` **She Chinese** — 55 seeds cleared
- `i=202859` **Silla Korean** — 54 seeds cleared
- `i=202861` **South Korean** — 52 seeds cleared
- `i=202862` **Southern Min** — 55 seeds cleared
- `i=202863` **Suzhounese** — 51 seeds cleared
- `i=202864` **Taiwanese Mandarin** — 55 seeds cleared
- `i=202865` **Wenzhounese** — 52 seeds cleared
- `i=202866` **Xixiu** — 53 seeds cleared
- `i=202868` **Yangchun Pai Yao** — 55 seeds cleared
- `i=202869` **Ye-Maek** — 51 seeds cleared
- `i=202870` **Yeheni** — 51 seeds cleared
- `i=202871` **Yeongdong Korean** — 55 seeds cleared
- `i=202872` **Yeongseo Korean** — 51 seeds cleared
- `i=202873` **Younian** — 51 seeds cleared
- `i=202874` **Younuo** — 55 seeds cleared
- `i=202875` **Yukjin Korean** — 49 seeds cleared
- `i=202876` **Zainichi Korean** — 53 seeds cleared
- `i=203063` **Ch'olti'** — 52 seeds cleared
- `i=203065` **Cappadocian Greek** — 54 seeds cleared
- `i=203066` **Hawaiian Pidgin English** — 55 seeds cleared
- `i=203067` **Loucheux Jargon** — 52 seeds cleared
- `i=203070` **Nootka Jargon** — 55 seeds cleared
- `i=203071` **Papuan Pidgin English** — 66 seeds cleared
- `i=203073` **Solomon Islands Pijin** — 50 seeds cleared
- `i=203074` **Te Parau Tinito** — 51 seeds cleared
- `i=203077` **Kanakanavu** — 53 seeds cleared
- `i=203123` **Tibeto Kanauri** — 60 seeds cleared
- `i=203125` **Araona** — 53 seeds cleared
- `i=203126` **Ka'apor** — 55 seeds cleared
- `i=203127` **Nivaclé** — 55 seeds cleared
- `i=203128` **Sirionó** — 55 seeds cleared
- `i=203129` **Sranan Tongo** — 55 seeds cleared
- `i=203142` **Ambonese Malay** — 51 seeds cleared
- `i=203143` **Baba Malay** — 50 seeds cleared
- `i=203144` **Banda Malay** — 55 seeds cleared
- `i=203145` **Be-Jizhao** — 55 seeds cleared
- `i=203146` **Betawi** — 55 seeds cleared
- `i=203147` **Classical Tibetan** — 55 seeds cleared
- `i=203148` **Daman** — 53 seeds cleared
- `i=203149` **Darkhad Mongolian** — 54 seeds cleared
- `i=203150` **Ha Em** — 54 seeds cleared
- `i=203152` **Kadar** — 55 seeds cleared
- `i=203153` **Kaloeng** — 54 seeds cleared
- `i=203154` **Khorchin Mongol** — 55 seeds cleared
- `i=203155` **Khorchin Mongol alias** — 55 seeds cleared
- `i=203156` **Lakkia Kam Sui** — 55 seeds cleared
- `i=203157` **Lao-Phutai** — 52 seeds cleared
- `i=203158` **Lhowa (Lhopa)** — 66 seeds cleared
- `i=203159` **Maithili** — 48 seeds cleared
- `i=203160` **Mangghuer** — 49 seeds cleared
- `i=203161` **Maumere Malay** — 51 seeds cleared

### `namebases-europe.js` — 125 entries

- `i=202266` **Français Tirailleur** — 50 seeds cleared
- `i=202277` **Michif** — 51 seeds cleared
- `i=202278` **Missingsch** — 52 seeds cleared
- `i=202283` **Negerhollands** — 55 seeds cleared
- `i=202294` **Russenorsk** — 55 seeds cleared
- `i=202877` **Almosan** — 55 seeds cleared
- `i=202878` **Bjarmian Sámi** — 50 seeds cleared
- `i=202879` **Cingali** — 51 seeds cleared
- `i=202880` **Csángó** — 50 seeds cleared
- `i=202882` **Jåkkåkaska** — 55 seeds cleared
- `i=202883` **Jällivaara** — 51 seeds cleared
- `i=202884` **Jugan** — 55 seeds cleared
- `i=202885` **Jukonda** — 52 seeds cleared
- `i=202886` **Kainuu** — 51 seeds cleared
- `i=202888` **Kazym** — 53 seeds cleared
- `i=202889` **Kiknur** — 54 seeds cleared
- `i=202892` **Kosa-Kama** — 54 seeds cleared
- `i=202893` **Kozymodemyan** — 52 seeds cleared
- `i=202895` **Likrisovskoe** — 51 seeds cleared
- `i=202896` **Lipsha** — 51 seeds cleared
- `i=202897` **Lower Demjanka** — 53 seeds cleared
- `i=202898` **Lower Konda** — 50 seeds cleared
- `i=202899` **Lower Lozva** — 51 seeds cleared
- `i=202900` **Lower Luga** — 54 seeds cleared
- `i=202901` **Lower Vychegda** — 53 seeds cleared
- `i=202902` **Ludza** — 52 seeds cleared
- `i=202903` **Luokta-Mávas** — 52 seeds cleared
- `i=202904` **Luza-Letka** — 52 seeds cleared
- `i=202905` **Merya** — 55 seeds cleared
- `i=202906` **Meshcherian** — 55 seeds cleared
- `i=202910` **Mulgi** — 55 seeds cleared
- `i=202911` **Muromian** — 55 seeds cleared
- `i=202913` **Nerdva** — 54 seeds cleared
- `i=202914` **North Vagilsk** — 50 seeds cleared
- `i=202915` **Northeast Hungary** — 51 seeds cleared
- `i=202917` **Northern Botnian** — 51 seeds cleared
- `i=202919` **Northern Savonian** — 52 seeds cleared
- `i=202921` **Ob Mansi** — 54 seeds cleared
- `i=202922` **Obdorsk** — 52 seeds cleared
- `i=202926` **Orodezhi** — 54 seeds cleared
- `i=202927` **Päijänne Tavastia** — 55 seeds cleared
- `i=202928` **Pechora** — 50 seeds cleared
- `i=202929` **Pelym** — 48 seeds cleared
- `i=202931` **Pite Sami** — 55 seeds cleared
- `i=202932` **Porvoo** — 52 seeds cleared
- `i=202935` **Ruija** — 53 seeds cleared
- `i=202937` **Sea Sami** — 55 seeds cleared
- `i=202938` **Semisjaur-Njarg** — 52 seeds cleared
- `i=202939` **Sernur-Morkin** — 54 seeds cleared
- `i=202940` **Serri** — 50 seeds cleared
- `i=202941` **Seto** — 55 seeds cleared
- `i=202942` **Siberian Finnish** — 55 seeds cleared
- `i=202943` **Siberian Ingrian Finnish** — 55 seeds cleared
- `i=202944` **Sirkas** — 50 seeds cleared
- `i=202945` **Skolt Sami** — 55 seeds cleared
- `i=202946` **Soikkola** — 54 seeds cleared
- `i=202947` **Sörkaitum** — 49 seeds cleared
- `i=202949` **South Vagilsk** — 51 seeds cleared
- `i=202951` **Southeastern Tavastian** — 55 seeds cleared
- `i=202952` **Southern Botnian** — 52 seeds cleared
- `i=202953` **Southern Karelian** — 54 seeds cleared
- `i=202955` **Southern Savonian** — 51 seeds cleared
- `i=202956` **Southern Tavastian** — 55 seeds cleared
- `i=202957` **Southern Veps** — 54 seeds cleared
- `i=202958` **Svaipa** — 51 seeds cleared
- `i=202959` **Sygva** — 52 seeds cleared
- `i=202960` **Székely** — 54 seeds cleared
- `i=202961` **Tagil** — 51 seeds cleared
- `i=202962` **Tartu** — 51 seeds cleared
- `i=202963` **Tavda** — 52 seeds cleared
- `i=202964` **Taygi** — 52 seeds cleared
- `i=202965` **Ter Sami** — 55 seeds cleared
- `i=202966` **Tisza-Körös** — 52 seeds cleared
- `i=202967` **Tonshaevo** — 51 seeds cleared
- `i=202968` **Torne Valley** — 53 seeds cleared
- `i=202970` **Tuorpon** — 50 seeds cleared
- `i=202971` **Turku highlands** — 52 seeds cleared
- `i=202972` **Tuzha** — 50 seeds cleared
- `i=202973` **Tysfjord** — 52 seeds cleared
- `i=202974` **Ume Sami** — 55 seeds cleared
- `i=202975` **Upper Konda** — 52 seeds cleared
- `i=202976` **Upper Lozva** — 51 seeds cleared
- `i=202977` **Upper Lupya** — 53 seeds cleared
- `i=202978` **Upper Sysola** — 51 seeds cleared
- `i=202980` **Uralo-Siberian** — 54 seeds cleared
- `i=202982` **Värmland Savonian** — 51 seeds cleared
- `i=202983` **Vartovskoe** — 54 seeds cleared
- `i=202984` **Vasjugan** — 55 seeds cleared
- `i=202985` **Verkhne-Kalimsk** — 49 seeds cleared
- `i=202986` **Vishera** — 55 seeds cleared
- `i=202988` **Western Transdanubian** — 55 seeds cleared
- `i=202989` **Western Uusimaa** — 50 seeds cleared
- `i=202990` **Western Votic** — 55 seeds cleared
- `i=202991` **Yaran** — 51 seeds cleared
- `i=202992` **Yaransk** — 52 seeds cleared
- `i=202993` **Yazva** — 52 seeds cleared
- `i=202994` **Ylä-Satakunta** — 51 seeds cleared
- `i=202995` **Yoshkar-Olin** — 53 seeds cleared
- `i=202996` **Yurats** — 55 seeds cleared
- `i=202997` **Zyuzdino** — 52 seeds cleared
- `i=202999` **Andalusian Spanish** — 55 seeds cleared
- `i=203000` **Anglo-Norman** — 55 seeds cleared
- `i=203001` **Béarnese** — 55 seeds cleared
- `i=203002` **Brianzöö** — 53 seeds cleared
- `i=203003` **Canzés** — 55 seeds cleared
- `i=203004` **Castilian Spanish** — 55 seeds cleared
- `i=203005` **Castúo** — 55 seeds cleared
- `i=203006` **Cremunés** — 55 seeds cleared
- `i=203007` **Crișana** — 55 seeds cleared
- `i=203013` **Judeo-Aragonese** — 55 seeds cleared
- `i=203016` **Moldavian** — 108 seeds cleared
- `i=203018` **Monégasque** — 55 seeds cleared
- `i=203022` **Orléanais** — 55 seeds cleared
- `i=203023` **Paḷḷuezu** — 52 seeds cleared
- `i=203024` **Podlachian** — 55 seeds cleared
- `i=203025` **Polabian** — 51 seeds cleared
- `i=203026` **Pomeranian** — 55 seeds cleared
- `i=203027` **Ripuarian (Platt)** — 66 seeds cleared
- `i=203031` **Slovincian** — 55 seeds cleared
- `i=203038` **Valdôtain** — 55 seeds cleared
- `i=203039` **Walser German** — 53 seeds cleared
- `i=203040` **West Polesian** — 55 seeds cleared
- `i=203042` **Wymysorys** — 55 seeds cleared
- `i=203043` **Yenish** — 54 seeds cleared
- `i=203044` **Zeelandic** — 55 seeds cleared

### `namebases-oceania.js` — 20 entries

- `i=202243` **Mocho'** — 55 seeds cleared
- `i=202270` **Javindo** — 67 seeds cleared
- `i=202286` **Petjo** — 65 seeds cleared
- `i=202343` **Kaera** — 52 seeds cleared
- `i=202344` **Kafoa** — 51 seeds cleared
- `i=202741` **Gaagudju** — 52 seeds cleared
- `i=202747` **Kuku Yalanji** — 54 seeds cleared
- `i=202748` **Kungarakany** — 55 seeds cleared
- `i=202750` **Kuuk Thaayore** — 51 seeds cleared
- `i=202751` **Laragia** — 54 seeds cleared
- `i=202756` **Murrinh Patha** — 51 seeds cleared
- `i=202757` **Ngaanyatjarra** — 52 seeds cleared
- `i=202758` **Ngarrindjeri** — 51 seeds cleared
- `i=202760` **Nyangumarta** — 54 seeds cleared
- `i=202761` **palawa kani** — 54 seeds cleared
- `i=202762` **Panyjima** — 52 seeds cleared
- `i=202765` **Wadjiginy** — 52 seeds cleared
- `i=202767` **Wajarri** — 52 seeds cleared
- `i=202770` **Warumungu** — 55 seeds cleared
- `i=202772` **Yankunytjatjara** — 54 seeds cleared

---

*Generated during the padded-list investigation. Every entry above was verified
present and non-empty before clearing, and every file was re-parsed afterwards;
entry count is unchanged at 3793, so nothing was lost beyond the invented seeds.*

---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Session: Africa Namebase Entries 723-790 (Batch Cleanup)

Date: 2026-06-24

## Summary
Completed verification and cleanup of 68 Africa namebase entries (entries 723-790, i=200191-201019, i=200896-200903, i=201364-201367).

## Operations Performed

### Entries with Duplicate Blocks Removed
- Tikar (200193): removed duplicated town blocks
- Tonga Mozambique (200196): removed triplicated blocks
- Tonga Zimbabwe Zambia Mozambique (200197): removed 4x duplicated blocks, added Zambian Tonga villages
- Tswa (200201): removed duplicated blocks
- West Banda (200211): removed 10x repeated Bambari/Bria/Bangassou blocks, replaced with full CAR town list
- Yangere (200214): same as West Banda
- Western Somali (200212): removed duplicated blocks, added Somali Region towns
- Yedina (200215): removed duplicated Borno names
- Zaghawa (200219): removed 3x repeated blocks
- Zemba (200222): removed duplicated Angola blocks
- Zenaga (200223): removed duplicated Mauritania blocks
- Harari (200899): removed duplicated blocks
- Mauritian Creole (200901): removed duplicated blocks
- Beni Snous (201004): removed duplicated blocks

### ISO-3166 Country Names, Region Names, or Geographic Features Removed
- West Banda: "Central African Republic" (country)
- Yangere: "Central African Republic" (country)
- Yeyi: "Botswana" (country), "Kalahari" (desert)
- Zemba: "Angola" (country)
- Zenaga: "Mauritania" (country)
- Zirenkel: "Chad" (country), "Mayo-Kebbi" (region), "Biltine" (region), "Ennedi" (region)
- Vame: "Borno" (state), "Adamawa" (state)
- Vemgo-Mabas: "Borno" (state), "Adamawa" (state)
- Wandala: "Borno" (state), "Adamawa" (state)
- Yedina: "Borno" (state), "Lake Chad" (geographic feature)
- Argobba: "Amhara" (region), "Wollo" (region), "Oromia" (region), "Afar" (region)
- Tuareg Tamasheq: "Agadez Region", "Kidal Region", "Gao Region", "Tombouctou Region", "Tahoua Region", "Kidal Cercle", "Gao Cercle", "Tombouctou Cercle"

### LGA/Department Names Removed (Cameroon Mayo- entries)
- Tsuvan (200200): removed "Mayo-Tsanaga", "Mayo-Moskota", "Mayo-Ouldeme", "Mayo-Louti", "Mayo-Maskola", "Moyen Chari"
- Ubi (200205): same departments removed
- Wuzlam (200213): same
- Zizilivakan (200225): same
- Zulgo-Gemzek (200226): same
- Zumaya (200227): same

### LGA/State Names Removed (Nigeria Bauchi entries)
- Teshenawa (200191): removed Bauchi-area LGAs, replaced with Jigawa-area towns
- Warji (200209): removed "Bauchi" state
- Zari (200220): removed "Bauchi" state
- Zeem (200221): removed "Bauchi" state
- Zumbun (200228): removed "Bauchi" state

### LGA/State Names Removed (Nigeria Plateau entries)
- Tiro (200194): removed "Plateau" state, removed Kogi/Benue/Nasarawa towns not in Tiro area
- Weh (200210): removed "Plateau" state, restricted to Plateau towns
- Yiwom (200217): removed "Plateau" state, restricted to Plateau towns

### Country Names Removed
- Tobanga (200195): removed "Chad"
- Toram (200198): removed "Chad", "Guera", "Batha", "Ennedi"
- Tumak (200202): removed "Chad", "Mayo-Kebbi", "Ennedi"

### Replaced Nigerian Placeholders with Proper North African Towns
All 13 Berber entries with "Bauchi,Dass,Tafawa Balewa,Bununu,Lere..." Nigerian placeholders completely rewritten:
- Ghadames (201005): Libyan/Tunisian border towns
- Iznasen (201006): Eastern Moroccan towns
- Kabyle (201007): Kabylie region towns (Tizi Ouzou, Bejaia, Bouira, Setif, etc.)
- Shawiya (201008): Aurès region towns (Batna, Khenchela, Arris, etc.)
- Shilha (201009): Souss-Massa region towns (Agadir, Taroudant, Tiznit, etc.)
- Siwi (201010): Siwa Oasis towns (Shali, Aghurmi, Bahariya, etc.)
- South Oran and Figuig Berber (201011): Bechar/Figuig area towns
- Tarifit (201012): Rif region towns (Nador, Al Hoceima, Driouch, etc.)
- Tidikelt (201013): Tidikelt region towns (Adrar, Timmimoun, In Salah, etc.)
- Tugurt (201015): Touggourt/El Oued region towns
- Tuwat (201016): Touat region towns (Adrar, Reggane, Aoulef, etc.)
- Western Algerian Zenatic dialects (201017): Oran/Tlemcen area towns
- Zurg (201018): Kufra/Jalu area towns (Saharan Libyan)
- Zuwara Berber (201019): Libyan coastal towns (Zuwara, Sabratha, Tripoli area)

### Fabricated Entries Removed
- Principense Creole (200897): removed 20+ fabricated "Praia de" entries (e.g., "Praia de Praia de Santa Catarina")

### Cross-Island Contamination Fixed
- Santiago Creole (201364): verified Cape Verdean towns are all on Santiago Island
- São Vicente Creole (201367): removed other island names (Santo Antão, Santa Luzia, São Nicolau, Sal, Boa Vista, Santiago, Fogo, Brava, Maio, Praia)

### Minor Cleanup
- Yoruba alt code (200218): removed duplicate entries (Abeokuta, Oyo, Ogbomosho appeared twice), added more Yoruba towns
- Tiro (200194): expanded with verified Plateau/Shendam-area towns
- Weh (200210): expanded with verified southern Kaduna/Plateau towns
- Yiwom (200217): expanded with verified Plateau towns
- ȞKx'aoȞ'ae (200229): removed Kalahari, Okavango, district names, replaced with verified Kgalagadi villages
- Ȟ'Amkoe (200230): same treatment
- Forro Creole (200896): verified São Tomé towns
- Chagossian Creole (200900): verified Chagos Archipelago island names
- Rodriguan Creole (200902): verified Rodrigues island towns
- Tayo Creole (200903): verified New Caledonian towns

## Status
- All 70 remaining entries in modules/namebases-africa.js processed
- Guardrails check passed (map=3425 catalog=3526)
- 0 new failures introduced (180 pre-existing failures from non-Africa entries)
- Version bumped from 1.109.5 to 1.109.6
- index.html hash cache updated (namebases-africa.js: 1.0.0 -> 1.0.1)


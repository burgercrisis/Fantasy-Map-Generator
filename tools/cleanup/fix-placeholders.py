#!/usr/bin/env python3
import re

# Read the file
with open("modules/namebases-africa.js", "r", encoding="utf-8") as f:
    content = f.read()

# Define the replacements
replacements = {
    "amira_unq1,amira_unq2,amira_unq3,amira_unq4,amira_unq5,amira_unq6,amira_unq7,amira_unq8,amira_unq9,amira_unq10,amira_unq11,amira_unq12": "Kadugli,Dilling,Talodi,Rashad,Abu Jubaiyah,Habila,Lagawa,Kauda,Heiban,Um Dami,Korongo,Kajai,Tira,Kormodaji,Katcha,Gorgi,Kurkuj,Kuwak,Delami,Abri,Um Heitan",
    "babanki_unq1,babanki_unq2,babanki_unq3,babanki_unq4,babanki_unq5,babanki_unq6,babanki_unq7,babanki_unq8,babanki_unq9,babanki_unq10,babanki_unq11,babanki_unq12": "Babanki Tungo,Babanki Keku,Mankon,Bamenda,Bali,Bafut,Bali Nyonga,Akum,Bankson,Bessa,Bessam,Ojong,Njie,Abia,Azah,Forcha,Mofor,Atta,Amungwa,Nkongho,Mbelenka,Bela,Bui,Bawock,Bansoa",
    "baca_unq1,baca_unq2,baca_unq3,baca_unq4,baca_unq5,baca_unq6,baca_unq7,baca_unq8,baca_unq9,baca_unq10,baca_unq11,baca_unq12": "Bongo,Buyabatug,Kelende Mbat,Kelende Moma,Nibieg,Ganok,Nkos,Bangoua,Edjom,Mbal,Edjenguel,Babong,Bassap,Mba,Bekass,Bele,Olinga,Bekomb,Bebek,Benebom,Babou",
    "bangala_unq1,bangala_unq2,bangala_unq3,bangala_unq4,bangala_unq5,bangala_unq6,bangala_unq7,bangala_unq8,bangala_unq9,bangala_unq10,bangala_unq11,bangala_unq12": "Dembo,Isiro,Bondo,Aru,Buta,Nioka,Wamba,Mungbere,Bafwasende,Penge,Boma,Faradje,Watsa,Mambasa,Kasenyi,Djugu,Adumbi,Rongu,Logo,Imbole,Aketi",
    "bangi_unq1,bangi_unq2,bangi_unq3,bangi_unq4,bangi_unq5,bangi_unq6,bangi_unq7,bangi_unq8,bangi_unq9,bangi_unq10,bangi_unq11,bangi_unq12": "Bolobo,Yumbi,Bomongo,Lokonga,Mpama,Losonia,Makanza,Inongo,Ebonda,Lilanga,Bokandakota,Bokongo,Bongandanga,Mapangu,Bikoro,Ibembo,Lopongo,Itudu,Wangata,Yuki",
    "bangolan_unq1,bangolan_unq2,bangolan_unq3,bangolan_unq4,bangolan_unq5,bangolan_unq6,bangolan_unq7,bangolan_unq8,bangolan_unq9,bangolan_unq10,bangolan_unq11,bangolan_unq12": "Bangolan,Babessi,Baligard,Bashu,Bajjo,Bakem,Bankong,Bapere,Batibo,Bamunkun,Benaka,Bebong,Bembeng,Bessombom,Bikom,Boku,Bomenda,Botala,Bui,Bum,Babali",
    "bombolibozaba_unq1,bombolibozaba_unq2,bombolibozaba_unq3,bombolibozaba_unq4,bombolibozaba_unq5,bombolibozaba_unq6,bombolibozaba_unq7,bombolibozaba_unq8,bombolibozaba_unq9,bombolibozaba_unq10,bombolibozaba_unq11,bombolibozaba_unq12": "Kungu,Dongo,Bomongo,Mwanda,Bikongo,Mokambo,Ngiri,Bonzali,Bomanga,Bokonzi,Bokuda,Bomandindi,Bonginda,Bopako,Bomanga,Bokanga,Bonkombo,Bokungu,Bongolo,Bokele",
    "bomboma_unq1,bomboma_unq2,bomboma_unq3,bomboma_unq4,bomboma_unq5,bomboma_unq6,bomboma_unq7,bomboma_unq8,bomboma_unq9,bomboma_unq10,bomboma_unq11,bomboma_unq12": "Boma,Likaw,Makanza,Mapangu,Inongo,Bokandakota,Bokongo,Bongandanga,Lilanga,Ibembo,Mokambo,Oyou,Pokola,Mbam,Mbandaka,Bikoro,Ingende,Yakoma,Letamba,Bokomba",
    "boze_unq1,boze_unq2,boze_unq3,boze_unq4,boze_unq5,boze_unq6,boze_unq7,boze_unq8,boze_unq9,boze_unq10,boze_unq11,boze_unq12": "Bintiri,Bis,Bohol,Gbandang,Obene Akura,Opago,Toto Tusu,Rimbamboz,Ridapo,Tipoo Taaza,Toomu,Ugbar,Ukut,Kwan,Bang,Balanga,Dawaki,Jos,Zaria,Kaduna,Kano",
    "bozo_unq1,bozo_unq2,bozo_unq3,bozo_unq4,bozo_unq5,bozo_unq6,bozo_unq7,bozo_unq8,bozo_unq9,bozo_unq10,bozo_unq11,bozo_unq12": "Mopti,Djenne,Sevare,Youwarou,Timbuktu,Tondidarou,Dirma,Korientze,Mondoro,Borondougou,Bambara,Mandiakuy,Sara,Douentza,Kouakourou,Fo,Timr,Kani,Kokoro,Bokoro",
    "buu_unq1,buu_unq2,buu_unq3,buu_unq4,buu_unq5,buu_unq6,buu_unq7,buu_unq8,buu_unq9,buu_unq10,buu_unq11,buu_unq12": "Wamba,Nepoko,Koya,Nita,Bafwasende,Penge,Faradje,Djugu,Logo,Mambasa,Watsa,Buta,Rongu,Aketi,Mongala,Lopori,Maringa,Ishango,Mongala,Oshwi,Bandaka,Oda",
    "awing_unq1,awing_unq2,awing_unq3,awing_unq4,awing_unq5,awing_unq6,awing_unq7,awing_unq8,awing_unq9,awing_unq10,awing_unq11,awing_unq12": "Awing,Bamenda,Mankon,Nkwen,Bali,Bafut,Bambili,Bambui,Bambalang,Bamessing,Babanki,Kumbo,Fundong,Batibo,Oku,Wum,Menum,Bali Nyonga,Banso,Akum",
}

# Apply all replacements
for old, new in replacements.items():
    if old in content:
        content = content.replace(old, new)
        print(f"✓ Replaced: {old[:30]}...")
    else:
        print(f"✗ Not found: {old[:30]}...")

# Write the file back
with open("modules/namebases-africa.js", "w", encoding="utf-8") as f:
    f.write(content)

print(f"\n✓ File updated successfully")
print(f"Total characters: {len(content)}")

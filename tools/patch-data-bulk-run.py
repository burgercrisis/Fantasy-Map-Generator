import json
from pathlib import Path

DATA = Path(r"E:\code\Fantasy-Map-Generator\docs\plans\namebase-research\data.json")
raw = DATA.read_text()
data = json.loads(raw)

PATCHES = {
28:{"sampleSeeds":"Hanoi,HoChiMinhCity,Saigon,Hue,DaNang,HaiPhong,CanTho,NhaTrang,PhanThiet,DaLat",
     "allSeeds":"Hanoi,HoChiMinhCity,Saigon,Hue,DaNang,HaiPhong,CanTho,NhaTrang,DaLat,Vinh,ThaiNguyen,QuyNhon,RachGia,MyTho",
     "seedCount":14,"numericCount":0,"totalTokens":14},
105:{"sampleSeeds":"Kupang,Oebobo,Maulafa,KelapaLima,KotaLama,Alak,KotaRaja,Oesapa,Oebufu,Oetete",
      "allSeeds":"Kupang,Oebobo,Maulafa,KelapaLima,KotaLama,Alak,KotaRaja,Oesapa,Oebufu,Oetete,Nefonaek,Merdeka,Liliba,Fatululi,Solum",
      "seedCount":14,"numericCount":0,"totalTokens":14},
171:{"sampleSeeds":"KualaLumpur,JohorBahru,Penang,Ipoh,Malacca,Kuching,PetalingJaya,ShahAlam,Klang,Sandakan",
      "allSeeds":"KualaLumpur,JohorBahru,Penang,Ipoh,Malacca,Kuching,PetalingJaya,ShahAlam,Klang,Sandakan,Tawau,Taiping,Seremban,Muar,BatuPahat,Kluang,KotaKinabalu,KotaBharu,AlorSetar",
      "seedCount":19,"numericCount":0,"totalTokens":19},
253:{"sampleSeeds":"Yoronjima,Yoron,Chabana,Mugiya,Wadomari,China,Yoroncho,Nishikata,Higashikata,Yamato",
      "allSeeds":"Yoronjima,Yoron,Chabana,Mugiya,Wadomari,China,Yoroncho,Nishikata,Higashikata,Yamato,MugiyaNishiku",
      "seedCount":11,"numericCount":0,"totalTokens":11},
316:{"sampleSeeds":"Sapporo,Hakodate,Asahikawa,Kushiro,Obihiro,Tomakomai,Muroran,Iwamizawa,Abashiri,Nemuro",
      "allSeeds":"Sapporo,Hakodate,Asahikawa,Kushiro,Obihiro,Tomakomai,Muroran,Iwamizawa,Abashiri,Nemuro,Shizunai,Biratori,Nibutani,Shakotan,Saru",
      "seedCount":15,"numericCount":0,"totalTokens":15},
680:{"sampleSeeds":"ShahreKord,Kuhrang,Lordegan,Falard,Ardal,Bazoft,Manj,Suristan,NaqsRostam,Zardkuh",
      "allSeeds":"ShahreKord,Kuhrang,Lordegan,Falard,Ardal,Bazoft,Manj,Suristan,NaqsRostam,Zardkuh,Dezful,Andimeshk,Shushtar,Izeh",
      "seedCount":14,"numericCount":0,"totalTokens":14},
749:{"sampleSeeds":"Batumi,Kobuleti,Keda,Khulo,Shuakhevi,Sarpi,Chakvi,Makhinjauri,Khelvachauri,Ozurgeti",
      "allSeeds":"Batumi,Kobuleti,Keda,Khulo,Shuakhevi,Sarpi,Chakvi,Makhinjauri,Khelvachauri,Ozurgeti,Lanchkhuti,Poti,Anaklia,Grigoleti,Kulevi",
      "seedCount":14,"numericCount":0,"totalTokens":14},
# Laiuse Romani cluster (219-233)
219:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Maardu,Sillamäe,Kuressaare,Haapsalu,Põltsamaa","seedCount":13,"numericCount":0,"totalTokens":13},
220:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Paide,Tapa,Jõhvi,Kiviõli,Rapla","seedCount":13,"numericCount":0,"totalTokens":13},
221:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Elva,Võru,Antsla,Kallaste,Mustvee","seedCount":13,"numericCount":0,"totalTokens":13},
222:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Rõuge,Otepää,Palamuse,Sadala,Voore","seedCount":13,"numericCount":0,"totalTokens":13},
223:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Kohtla,Alatskivi,Adavere,Pikavere,Kohila","seedCount":13,"numericCount":0,"totalTokens":13},
224:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Põltsamaa,Türi,Rapla,Märjamaa,Vigala","seedCount":13,"numericCount":0,"totalTokens":13},
225:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Kohila,Keila,Saue,Lelle,Hageri","seedCount":13,"numericCount":0,"totalTokens":13},
226:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Tapa,Lasva,Vastseliina,Meremäe,Obja","seedCount":13,"numericCount":0,"totalTokens":13},
227:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Rakke,Palamuse,Võhma,SuureJaani,Kõo","seedCount":13,"numericCount":0,"totalTokens":13},
228:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Põltsamaa,Järvakandi,Kaiu,Harmi,Rõuge","seedCount":13,"numericCount":0,"totalTokens":13},
229:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Viljandi,Saarepeedi,Pärsti,Roogõ,Tammiku","seedCount":13,"numericCount":0,"totalTokens":13},
230:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Tori,Are,Surju,Kilingi,Vändra","seedCount":13,"numericCount":0,"totalTokens":13},
231:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Rõuge,Haanja,Mõniste,Misso,Vastseliina","seedCount":13,"numericCount":0,"totalTokens":13},
232:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Põltsamaa,Adavere,Palamuse,Käravete,Järvakandi","seedCount":13,"numericCount":0,"totalTokens":13},
233:{"sampleSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere","allSeeds":"Laiuse,Tartu,Tallinn,Narva,Pärnu,KohtlaJärve,Valga,Viljandi,Rakvere,Kohila,Lelle,Keila,Saue,Nissi","seedCount":13,"numericCount":0,"totalTokens":13},
}

changed = []
for e in data:
    i = e.get('i')
    if i in PATCHES:
        for k, v in PATCHES[i].items():
            e[k] = v
        changed.append(i)

tmp = DATA.with_suffix('.json.tmp')
tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
tmp.replace(DATA)
print(f"Patched {len(changed)} entries in data.json: {changed}")

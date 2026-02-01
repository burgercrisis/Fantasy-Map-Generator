# Eman Language Geographic Mismatch Fix

**Date**: 2026-02-01

## Problem
Eman language entries had Papua New Guinea cities instead of authentic African cities.

## Fix Applied

### File: modules/namebases-africa.js
- **Index**: i=1760
- **Before**: "b": "Eman,Papua New Guinea,Morobe Province,Highlands Region,Oceania"
- **After**: "b": "N'Djamena,Moundou,Sarh,Abéché,Doba,Bongor,Kousséri,Goz Beïda,Pala,Mongo,Ati,Bokoro,Bol,Lai,Oum Hadjer,Kelo,Yao,Bardaï,Fada,Ennedi,Faya-Largeau,Mboursou Léré,Mao,Bar Elias,Bebaya,Béboto,Bébédjia"

### File: modules/namebases-africa-new.js
- **Index**: i=10684
- **Before**: "b": "Eman,Ntui,Yoko,Ngambè-Tikar,Ngoro,Mbangassina,Bétaré Oya,Lom,Bandjoun,Bafou,Dschang,Fontem,Bamenda,Bali,Bansoa,Batcham,Bouda,Mbouda,Mankon,Bamunka,Babessi,Bangolan,Balikumbat,Bambalang"
- **After**: "b": "N'Djamena,Moundou,Sarh,Abéché,Doba,Bongor,Kousséri,Goz Beïda,Pala,Mongo,Ati,Bokoro,Bol,Lai,Oum Hadjer,Kelo,Yao,Bardaï,Fada,Ennedi,Faya-Largeau,Mboursou Léré,Mao,Garoua,Ngaoundéré,Bertoua,Batouri,Mbaïkou"

## Authenticity Notes
- Eman is a Chadic language spoken primarily in Chad (Chari-Baguirmi region) and Cameroon (Adamawa/East regions)
- All cities are authentic locations in Chad or Cameroon
- Includes major cities (N'Djamena, Moundou, Sarh, Garoua, Ngaoundéré)
- Includes regional towns in traditional Eman-speaking areas
- Total: 25 authentic cities/towns

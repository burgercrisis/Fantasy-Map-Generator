import json
f = open(r'E:\code\Fantasy-Map-Generator\docs/plans/namebase-research/data.json','r',encoding='utf-8')
data = json.load(f)
f.close()
e = [x for x in data if x.get('i')==25][0]
with open(r'E:\code\Fantasy-Map-Generator\entry_data.txt','w',encoding='utf-8') as out:
    out.write("name: %s\n" % e.get('name'))
    out.write("i: %s\n" % e.get('i'))
    out.write("d: %s\n" % e.get('d'))
    out.write("min: %s, max: %s\n" % (e.get('min'), e.get('max')))
    out.write("file: %s\n" % e.get('filename'))
    out.write("family: %s\n" % e.get('catalogFamily'))
    out.write("seeds: %s\n" % e.get('allSeeds'))
print("Wrote entry data")

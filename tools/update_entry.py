import json
f = open(r'E:\code\Fantasy-Map-Generator\docs/plans/namebase-research/data.json','r',encoding='utf-8')
data = json.load(f)
f.close()
for e in data:
    if e.get('i') == 25:
        e['d'] = 'tnlrpkd'
        e['min'] = 5
        e['max'] = 12
        e['catalogFamily'] = 'Dravidian'
        e['audited'] = True
        e['auditNotes'] = 'd=tnl missing retroflex/palatal stops. d=tnlrpkd for Dravidian geminates (tt,nn,ll,rr,pp,kk,dd+retroflex). Family: None->Dravidian. Seeds are already in local Kannada form (Bengaluru not Bangalore).'
        break
f = open(r'E:\code\Fantasy-Map-Generator\docs/plans/namebase-research/data.json','w',encoding='utf-8')
json.dump(data, f, indent=2, ensure_ascii=False)
f.close()
print('Updated Karnataka i=25')

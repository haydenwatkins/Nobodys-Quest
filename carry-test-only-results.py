#!/usr/bin/env python3
"""Carry isolated passing test-file runs across one verified test-only fix."""
import hashlib,json,shutil,subprocess,sys
from pathlib import Path
root=Path(sys.argv[1]);oldname=sys.argv[2];newname=sys.argv[3];changed=sys.argv[4]
old=root/'.scratch/verification'/oldname/'full-files';new=root/'.scratch/verification'/newname/'full-files';new.mkdir(parents=True,exist_ok=False)
m=json.loads((old/'manifest.json').read_text());head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
for p,h in m['sourceHashes'].items():
 actual=hashlib.sha256((root/p).read_bytes()).hexdigest()
 if p!=changed:assert actual==h,f'unexpected source change: {p}'
 else:assert actual!=h,'expected changed test did not change'
assert changed in m['files'] and changed.startswith('tests/')
oldhead=m['head'];m['head']=head;m['sourceHashes'][changed]=hashlib.sha256((root/changed).read_bytes()).hexdigest()
m['method']='Complete per-file Node TAP sweep; reuse isolated passing files from '+oldname+' after verifying all runtime and all other test hashes unchanged. The corrected '+changed+' is rerun. Not one combined invocation.'
m['testOnlyCarry']={'oldHead':oldhead,'newHead':head,'changedTest':changed,'reason':'Replace the retired Atlas sampler expectation with the implemented fault and weight; other test files run in independent Node processes.'}
(new/'manifest.json').write_text(json.dumps(m,indent=2));count=0
for file in old.glob('*.json'):
 if file.name in ['manifest.json','completed.json']:continue
 data=json.loads(file.read_text())
 if data['file']==changed or data['exit']!=0:continue
 assert data['sha256']==m['sourceHashes'][data['file']]
 source=Path(data['log']);dest=new/source.name;assert source.is_file();shutil.copy2(source,dest);data['log']=str(dest);(new/file.name).write_text(json.dumps(data,indent=2));count+=1
print(json.dumps({'old':oldname,'new':newname,'reusedPassingFiles':count,'changedTest':changed,'oldHead':oldhead,'newHead':head}))

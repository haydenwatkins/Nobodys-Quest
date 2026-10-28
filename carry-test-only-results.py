#!/usr/bin/env python3
"""Carry isolated passing test-file runs across one verified test-only fix."""
import hashlib,json,shutil,subprocess,sys
from pathlib import Path
root=Path(sys.argv[1]);oldname=sys.argv[2];newname=sys.argv[3];changed=sys.argv[4]
old=root/'.scratch/verification'/oldname/'full-files';new=root/'.scratch/verification'/newname/'full-files';new.mkdir(parents=True,exist_ok=False)
m=json.loads((old/'manifest.json').read_text());head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
oldhead=m['head'];status=subprocess.check_output(['git','status','--porcelain=v1','-uall'],cwd=root,text=True);assert not status,'working tree must be clean, including untracked files'
changedFiles=subprocess.check_output(['git','diff','--name-only',oldhead,head],cwd=root,text=True).splitlines()
allowed={changed,'docs/ATLAS-REBUILT-GROUND.md','docs/MERIDIAN-PAIRED-ROADS.md','docs/BOSS-ROSTER-ACCEPTANCE.md','docs/CLOUD-ROADMAP.md','tools/check-meridian-roads-realtime.cjs','tools/review-guardian-court-edges.cjs'}
assert changed in changedFiles and all(p in allowed for p in changedFiles),f'unexpected tracked dependency change: {changedFiles}'
references=subprocess.run(['rg','-n','docs/|check-meridian-roads-realtime|review-guardian-court-edges|worldwake\\.test\\.js','tests','tools/lib'],cwd=root,text=True,capture_output=True)
assert references.returncode==1,f'tests may depend on a changed auxiliary file: {references.stdout}'
for p,h in m['sourceHashes'].items():
 actual=hashlib.sha256((root/p).read_bytes()).hexdigest()
 if p!=changed:assert actual==h,f'unexpected source change: {p}'
 else:assert actual!=h,'expected changed test did not change'
assert changed in m['files'] and changed.startswith('tests/')
m['head']=head;m['sourceHashes'][changed]=hashlib.sha256((root/changed).read_bytes()).hexdigest()
m['method']='Complete per-file Node TAP sweep; reuse isolated passing files from '+oldname+' after verifying all runtime and all other test hashes unchanged. The corrected '+changed+' is rerun. Not one combined invocation.'
m['testOnlyCarry']={'oldHead':oldhead,'newHead':head,'changedTest':changed,'trackedDiff':changedFiles,'workingTreeClean':True,'reason':'Replace the retired Atlas sampler expectation with the implemented fault and weight; other test files run in independent Node processes.'}
(new/'manifest.json').write_text(json.dumps(m,indent=2));count=0
for file in old.glob('*.json'):
 if file.name in ['manifest.json','completed.json']:continue
 data=json.loads(file.read_text())
 stats=data.get('stats',{})
 if data['file']==changed or data['exit']!=0 or not isinstance(stats.get('pass'),int) or any(stats.get(k)!=0 for k in ['fail','cancelled','skipped','todo']):continue
 assert data['sha256']==m['sourceHashes'][data['file']]
 source=Path(data['log']);dest=new/source.name;assert source.is_file();shutil.copy2(source,dest);data['log']=str(dest);(new/file.name).write_text(json.dumps(data,indent=2));count+=1
print(json.dumps({'old':oldname,'new':newname,'reusedPassingFiles':count,'changedTest':changed,'oldHead':oldhead,'newHead':head}))

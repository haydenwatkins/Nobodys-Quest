import concurrent.futures,hashlib,json,re,subprocess,sys,time
from pathlib import Path
root=Path(sys.argv[1]); name=sys.argv[2]; workers=int(sys.argv[3]); folder=root/'.scratch/verification'/name/'full-files';folder.mkdir(parents=True,exist_ok=True)
files=sorted(str(p.relative_to(root)) for p in (root/'tests').glob('*.test.js'))+sorted(str(p.relative_to(root)) for p in (root/'3d/tests').glob('*.test.mjs'))
sourcefiles=sorted(str(p.relative_to(root)) for p in (root/'js').rglob('*.js'))+['index.html']+files
hashes={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in sourcefiles}
manifest={'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'method':'Complete per-file Node TAP sweep; matching successful files may be reused after interruption. Not one combined invocation.','files':files,'sourceHashes':hashes}
manifest_path=folder/'manifest.json'
if manifest_path.exists():
 old=json.loads(manifest_path.read_text());assert old['files']==files and old['sourceHashes']==hashes,'source changed since prior sweep';manifest=old
else:manifest_path.write_text(json.dumps(manifest,indent=2))
def run(p):
 target=folder/p.replace('/','__');result=Path(str(target)+'.json');log=Path(str(target)+'.log')
 if result.exists():
  data=json.loads(result.read_text());assert data['file']==p and data['sha256']==hashes[p] and data['exit']==0;return data
 start=time.time()
 with log.open('w') as stream:code=subprocess.call(['node','--test','--test-reporter=tap',p],cwd=root,stdout=stream,stderr=subprocess.STDOUT)
 stats={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$',log.read_text(),re.M)}
 data={'file':p,'sha256':hashes[p],'exit':code,'seconds':round(time.time()-start,3),'stats':stats,'log':str(log)}
 tmp=Path(str(result)+'.tmp');tmp.write_text(json.dumps(data,indent=2));tmp.replace(result);print(json.dumps(data),flush=True);return data
with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:results=list(pool.map(run,files))
assert all(hashlib.sha256((root/p).read_bytes()).hexdigest()==h for p,h in hashes.items()),'source changed during verification'
assert all(r['exit']==0 and r['stats'].get('fail')==0 and r['stats'].get('cancelled')==0 and r['stats'].get('skipped')==0 and r['stats'].get('todo')==0 for r in results),'failed/incomplete file; inspect logs'
report={'head':manifest['head'],'method':manifest['method'],'files':len(files),'totalPasses':sum(r['stats']['pass'] for r in results),'failures':0,'sourceUnchanged':True}
(folder/'completed.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)

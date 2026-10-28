import concurrent.futures,hashlib,json,re,subprocess,sys,time
from pathlib import Path
root=Path(sys.argv[1]);name=sys.argv[2];folder=root/'.scratch/verification'/name/'full-files';m=json.loads((folder/'manifest.json').read_text());files=[p for p in m['files'] if p.startswith('3d/tests/')]
def run(p):
 target=folder/p.replace('/','__');result=Path(str(target)+'.json');log=Path(str(target)+'.log')
 if result.exists():
  data=json.loads(result.read_text());assert data['exit']==0 and data['sha256']==m['sourceHashes'][p];return
 assert hashlib.sha256((root/p).read_bytes()).hexdigest()==m['sourceHashes'][p]
 start=time.time()
 with log.open('w') as stream:code=subprocess.call(['node','--test','--test-reporter=tap',p],cwd=root,stdout=stream,stderr=subprocess.STDOUT)
 stats={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$',log.read_text(),re.M)}
 data={'file':p,'sha256':m['sourceHashes'][p],'exit':code,'seconds':round(time.time()-start,3),'stats':stats,'log':str(log)}
 assert code==0 and all(stats.get(k)==0 for k in ['fail','cancelled','skipped','todo']),data
 tmp=Path(str(result)+'.tmp');tmp.write_text(json.dumps(data,indent=2));tmp.replace(result);print(p,stats['pass'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(run,files))

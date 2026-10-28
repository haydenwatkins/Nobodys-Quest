#!/usr/bin/env python3
"""Verify an exact Pages commit and every frozen changed runtime file."""
import hashlib,json,subprocess,sys,urllib.parse,urllib.request
from pathlib import Path
root=Path(sys.argv[1]);commit=sys.argv[2];manifest=json.loads(Path(sys.argv[3]).read_text());
def gh(*args):return json.loads(subprocess.check_output(['gh',*args],cwd=root,text=True))
full=subprocess.check_output(['git','rev-parse',commit],cwd=root,text=True).strip()
runs=gh('run','list','--limit','30','--json','databaseId,headSha,status,conclusion,url,workflowName')
run=next((x for x in runs if x['headSha']==full and x['workflowName']=='pages-build-deployment' and x['status']=='completed' and x['conclusion']=='success'),None)
assert run,'no successful completed Pages workflow for exact commit'
build=gh('api','repos/haydenwatkins/Nobodys-Quest/pages/builds/latest');assert build['commit']==full and build['status']=='built' and not build.get('error',{}).get('message'),f"latest Pages build does not match {full}"
verified=[]
for name,want in manifest['runtime'].items():
 local=subprocess.check_output(['git','show',f'{full}:{name}'],cwd=root);assert hashlib.sha256(local).hexdigest()==want,f'frozen source changed: {name}'
 url='https://haydenwatkins.github.io/Nobodys-Quest/'+urllib.parse.quote(name)+'?release='+full
 with urllib.request.urlopen(url,timeout=30) as response:public=response.read()
 assert public==local,f'public bytes differ: {name}'
 verified.append(name)
print(json.dumps({'commit':full,'workflow':run['url'],'pages':build['status'],'verified':verified},indent=2))

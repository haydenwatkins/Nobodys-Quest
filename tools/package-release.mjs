import {readFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,relative} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'dist');
const files=['index.html','3d/index.html','3d/style.css','3d/main.mjs','3d/game.mjs','3d/scene.mjs','3d/world-data.mjs','3d/vendor/three.module.min.js','3d/vendor/LICENSE-three.txt','THIRD_PARTY_NOTICES.md'];
// Refuse an existing nonempty output instead of accidentally carrying old files into a release.
try{if((await readdir(out)).length)throw Error('dist is not empty. Choose a fresh checkout for packaging.');}catch(e){if(e.code!=='ENOENT')throw e;}
for(const file of files){const data=await readFile(resolve(root,file));if(!file.includes('vendor/')&&/Nobody|Greenfield|Fester|Mayor Maybe|Drinkbox|borrowed art|Unfinished Warden/i.test(data.toString()))throw Error('Legacy content marker in '+file);}
for(const file of files){const dest=resolve(out,file);await mkdir(dirname(dest),{recursive:true});await copyFile(resolve(root,file),dest);}
console.log(`Packaged ${files.length} approved files in ${relative(root,out)}/.`);

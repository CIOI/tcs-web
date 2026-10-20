import {readFile,writeFile,cp,mkdir,rm,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {parseHTML} from 'linkedom';
import {createClient} from '@sanity/client';
import {renderContent} from './render.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'public');
const config={projectId:process.env.SANITY_STUDIO_PROJECT_ID,dataset:process.env.SANITY_STUDIO_DATASET};
if(process.env.VERCEL_ENV!=='production'&&config.dataset==='production')throw new Error('Preview builds must not use the production dataset.');
if(Boolean(config.projectId)!==Boolean(config.dataset))throw new Error('Both Sanity project ID and dataset are required.');
let docs;
if(config.projectId){
 const client=createClient({...config,apiVersion:'2026-10-20',useCdn:false,perspective:'published',token:process.env.SANITY_READ_TOKEN});
 docs=await client.fetch('*[!(_id in path("drafts.**")) && _type in ["sitePage","project","client","equipment","company"]]');
 if(!docs.some(d=>d._id==='company')||!docs.some(d=>d._id==='page-index'))throw new Error('CMS content is missing. Import the initial content before deploying.');
 console.log(`Building ${docs.length} published CMS documents from ${config.dataset}`);
}else{
 if(process.env.VERCEL)throw new Error('Configure the Sanity project and development dataset before deploying the CMS branch.');
 docs=JSON.parse(await readFile(resolve(root,'content/seed.json'),'utf8'));console.log('Local content preview: account is not connected; using seed documents.');
}
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['assets','styles.css','pages.css','app.js','pages.js','translations.js','robots.txt'])await cp(resolve(root,name),resolve(out,name),{recursive:true});
for(const name of await readdir(root)){if(!name.endsWith('.html'))continue;let html=await readFile(resolve(root,name),'utf8');if(name.startsWith('google')){await writeFile(resolve(out,name),html);continue;}
 const {document}=parseHTML(html);const page=name.replace('.html','');
 const translations=renderContent(document,docs,page,config);
 const script=document.createElement('script');script.textContent='Object.assign(window.TCS_TRANSLATIONS,'+JSON.stringify(translations).replace(/</g,'\\u003c')+');';document.querySelector('script[src="translations.js"]').after(script);
 if(process.env.VERCEL_ENV!=='production')document.querySelector('meta[name="robots"]')?.setAttribute('content','noindex, nofollow');
 const base='https://tcscast.com/'+(name==='index.html'?'':name);if(!document.querySelector('link[rel="canonical"]')){const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=base;document.head.append(canonical);}
 await writeFile(resolve(out,name),document.toString());
}
await writeFile(resolve(out,'sitemap.xml'),await readFile(resolve(root,'sitemap.xml')));
// Templates are public site HTML only. Studio preview carries no API credentials.
await mkdir(resolve(out,'cms-preview'),{recursive:true});
for(const name of await readdir(root))if(name.endsWith('.html')&&!name.startsWith('google'))await cp(resolve(root,name),resolve(out,'cms-preview',name));
await writeFile(resolve(out,'cms-preview','seed.json'),JSON.stringify(docs));
if(config.projectId){execFileSync(resolve(root,'node_modules/.bin/sanity'),['build',resolve(out,'admin'),'--yes'],{cwd:root,stdio:'inherit',env:{...process.env,SANITY_STUDIO_BASEPATH:'/admin'}});}
console.log('Static website build complete:',out);

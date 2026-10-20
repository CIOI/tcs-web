import {createClient} from '@sanity/client';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const {SANITY_STUDIO_PROJECT_ID:projectId,SANITY_STUDIO_DATASET:dataset,SANITY_API_TOKEN:token}=process.env;
if(!projectId||!dataset||!token)throw new Error('Set project, dataset and SANITY_API_TOKEN in your local shell. Never commit tokens.');
if(dataset!=='development')throw new Error('Initial import is allowed only into the development dataset.');
const client=createClient({projectId,dataset,token,apiVersion:'2026-10-20',useCdn:false});
const docs=JSON.parse(await readFile(resolve(root,'content/seed.json'),'utf8'));
if(await client.fetch('count(*[_type in ["sitePage","project","client","equipment","company"]])'))throw new Error('Dataset already contains content. Refusing to overwrite customer edits.');
const assets=new Map();
async function upload(source){if(assets.has(source))return assets.get(source);if(!/^assets\//.test(source)||source.includes('..'))throw new Error('Invalid source asset path');const bytes=await readFile(resolve(root,source));const asset=await client.assets.upload('image',bytes,{filename:source.split('/').pop()});assets.set(source,asset._id);console.log('Uploaded image',source);return asset._id;}
async function visit(node){if(!node||typeof node!=='object')return;if(node.sourceUrl){const ref=await upload(node.sourceUrl);const image={_type:'image',asset:{_type:'reference',_ref:ref}};if(node._type==='client')node.logo=image;else node.image=image;}for(const val of Object.values(node)){if(Array.isArray(val)){for(const item of val)await visit(item);}else if(val&&typeof val==='object')await visit(val);}}
for(const doc of docs)await visit(doc);
let transaction=client.transaction();for(const doc of docs)transaction=transaction.createIfNotExists(doc);await transaction.commit();console.log(`Imported ${docs.length} documents and ${assets.size} images into development.`);

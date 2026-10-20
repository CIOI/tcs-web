import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {readFile} from 'node:fs/promises';
import {renderContent,assetUrl} from '../render.mjs';
const docs=JSON.parse(await readFile(new URL('../../content/seed.json',import.meta.url),'utf8'));
async function render(page,values=docs){const {document}=parseHTML(await readFile(new URL(`../../${page}.html`,import.meta.url),'utf8'));const translations=renderContent(document,values,page);return {document,translations};}
test('customer gallery edits apply order, grouped originals and removal',async()=>{
 const values=structuredClone(docs);const p=values.find(d=>d._type==='project');p.title={ko:'새 사례',en:'New project'};p.order=-1;p.photos=[p.photos[0],{...p.photos[0],_key:'extra',sourceUrl:'assets/projects/s09-06.jpg'}];
 const {document,translations}=await render('projects',values);assert.equal(document.querySelector('.project-card h3').textContent,'새 사례');assert.equal(translations['새 사례'],'New project');assert.equal(document.querySelector('.project-card').querySelectorAll('.image-open').length,2);
 const empty=await render('projects',values.filter(d=>d._type!=='project'));assert.equal(empty.document.querySelectorAll('.project-card').length,0);
});
test('HTML in customer text is shown as text rather than executable markup',async()=>{const values=structuredClone(docs);const p=values.find(d=>d._type==='project');p.title={ko:'<img src=x onerror=alert(1)>',en:'Example'};const {document}=await render('projects',values);assert.equal(document.querySelector('.project-caption h3').textContent,p.title.ko);assert.equal(document.querySelector('.project-caption h3 img'),null);});
test('client link schemes cannot execute javascript',async()=>{const values=structuredClone(docs);values.find(d=>d._type==='client').url='javascript:alert(1)';const {document}=await render('clients',values);assert.equal(document.querySelector('.client-card').getAttribute('href'),'');});
test('image crop affects thumbnail, but original viewer stays uncropped',()=>{const photo={image:{asset:{_ref:'image-abcdef-1400x1000-jpg'},crop:{left:.1,right:.1,top:.2,bottom:0}},rotation:90};const config={projectId:'testid',dataset:'development'};assert.match(assetUrl(photo,config),/rect=140%2C200%2C1120%2C800/);assert.doesNotMatch(assetUrl(photo,config,true),/rect/);assert.match(assetUrl(photo,config,true),/or=90/);});
test('contact copy address and map reflect company edits',async()=>{const values=structuredClone(docs);const c=values.find(d=>d._type==='company');c.email='updated@example.com';c.mapQuery='서울';const {document}=await render('contact',values);assert.equal(document.querySelector('.email-copy').dataset.email,'updated@example.com');assert.match(document.querySelector('.contact-map').getAttribute('src'),/%EC%84%9C%EC%9A%B8/);});
test('bilingual line breaks preserve existing translations',async()=>{const {document,translations}=await render('index');assert.equal(document.querySelectorAll('.hero h1').length,1);assert.ok(translations['정교한 설계,']);});

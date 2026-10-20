import {parseHTML} from 'linkedom';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const translations={window:{}};vm.runInNewContext(await readFile(resolve(root,'translations.js'),'utf8'),translations);
const t=translations.window.TCS_TRANSLATIONS;
const localized=ko=>({_type:'localizedText',ko,en:t[ko]||ko.split('\n').map(line=>t[line]||line).join('\n')});
const pages=['index','about','career','casting','patterns','foam-trimming','jigs','projects','equipment','clients','contact'];
const docs=[];let projects=[];let clients=[];
function selector(el){const parts=[];while(el&&el.tagName!=='MAIN'){const tag=el.localName;const siblings=[...el.parentElement.children].filter(n=>n.localName===tag);parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(el)+1})`);el=el.parentElement;}return 'main > '+parts.join(' > ');}
function picture(img,key){return {_type:'projectPhoto',_key:key,alt:localized(img.alt||''),sourceUrl:img.getAttribute('src'),display:img.classList.contains('product-photo')?'cover':'contain',rotation:0};}
for(const name of pages){
 const {document}=parseHTML(await readFile(resolve(root,name+'.html'),'utf8'));
 const title=document.querySelector('h1')?.textContent.trim()||'메인 화면';
 const fields=[];
 for(const el of document.querySelectorAll('main h1,main h2,main h3,main p,main figcaption,main .facts dd,main .career-list b')){
  if(el.closest('.project-card,.client-card,.software-list,.contact,table')||el.querySelector('a,button,img'))continue;
  const ko=el.innerText.trim();if(!ko||el.id==='detail-text')continue;
  fields.push({_type:'pageText',_key:'text'+fields.length,label:ko.length>40?ko.slice(0,40)+'…':ko,selector:selector(el),value:localized(ko)});
 }
 const images=[];
 for(const img of document.querySelectorAll('main img')){
  if(img.closest('.project-card,.client-card'))continue;
  images.push({...picture(img,'image'+images.length),_type:'pageImage',label:img.alt||'대표 이미지',selector:selector(img)});
 }
 docs.push({_id:'page-'+name,_type:'sitePage',page:name,title,seoTitle:{_type:'localizedText',ko:document.title,en:name==='index'?'TCS | 3D Modeling & Casting Design in Gimpo':`${t[title]||title} | TCS`},seoDescription:{_type:'localizedText',ko:document.querySelector('meta[name="description"]')?.getAttribute('content')||'',en:name==='index'?'TCS — Total Casting Solution. 2D drawing review, 3D master models and casting plan design in Gimpo, South Korea.':`TCS — ${t[title]||title}. Total Casting Solution.`},fields,images});
 if(name==='projects'){
  projects=[...document.querySelectorAll('.project-card')].map((card,i)=>({_id:'project-'+String(i+1).padStart(2,'0'),_type:'project',title:localized(card.querySelector('h3').textContent.trim()),kind:localized(card.querySelector('.project-caption p').textContent.trim()),category:card.dataset.category,order:i+1,featured:['햄 슬라이스 머신','오토미션 밸브바디 주조금형','펌프케이싱 목형설계'].includes(card.querySelector('h3').textContent.trim()),photos:[...card.querySelectorAll('.image-open')].map((btn,j)=>({...picture(btn.querySelector('img'),'photo'+j),sourceUrl:btn.dataset.image,alt:localized(btn.dataset.caption)}))}));
 }
 if(name==='clients'){
  clients=[...document.querySelectorAll('.client-card')].map((card,i)=>({_id:'client-'+(i+1),_type:'client',name:localized(card.querySelector('h2').textContent.trim()),order:i+1,url:card.getAttribute('href'),linkType:card.href.includes('google.com/maps')?'map':'website',sourceUrl:card.querySelector('img')?.getAttribute('src')||'',showOnHome:!!card.querySelector('img')}));
 }
 if(name==='equipment'){
  const equipment=[...document.querySelectorAll('tbody tr')].map((tr,i)=>{const cols=[...tr.querySelectorAll('td')].map(n=>n.textContent.trim());return {_type:'equipmentRow',_key:'row'+i,columns:cols.map((s,j)=>({_type:'localizedText',_key:'col'+j,...localized(s)}))};});
  const software=[...document.querySelectorAll('.software-list>*')].map((el,i)=>({_type:'softwareRow',_key:'soft'+i,name:el.querySelector('h3')?.textContent.trim()||'',detail:localized(el.querySelector('p')?.textContent.trim()||'')}));
  docs.push({_id:'equipment',_type:'equipment',title:'보유 장비',rows:equipment,software});
 }
}
const app=await readFile(resolve(root,'app.js'),'utf8');const match=app.match(/const details=(?:window\.TCS_PROCESS_STEPS\|\|)?(\[.*?\]);/s);if(match){const steps=vm.runInNewContext(match[1]);docs.find(d=>d._id==='page-index').processSteps=steps.map((row,i)=>({_type:'processStep',_key:'step'+i,label:row[0],description:localized(row[1])}));}
docs.push(...projects,...clients);
docs.push({_id:'company',_type:'company',title:'회사정보',email:'tcs2021@daum.net',phone:'031-996-2044',fax:'031-996-2045',address:localized('경기도 김포시 대곶면\n대곶로 246-40 티시에스'),mapQuery:'경기도 김포시 대곶면 대곶로 246-40 티시에스',inquiry:localized('프로젝트 개요와 보유 도면을 이메일로 보내주세요.\n구체적인 진행 범위는 상담을 통해 확인합니다.'),footer:localized('티시에스 · 대표 박성서\n사업자등록번호 465-79-00353\n주소: 경기도 김포시 대곶면 대곶로 246-40 티시에스')});
await writeFile(resolve(root,'content/seed.json'),JSON.stringify(docs,null,2)+'\n');console.log(`Extracted ${docs.length} public content documents`);

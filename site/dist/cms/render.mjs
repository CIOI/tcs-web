// Shared by the static build and authenticated Studio draft preview.
export const categories=['casting','patterns','foam-trimming','jigs'];
export function text(value,lang='ko'){if(typeof value==='string')return value;return value?.[lang]||value?.ko||'';}
export function escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function safeUrl(url){return /^(https?:\/\/|assets\/)/.test(url||'')?url:'';}
export function assetUrl(photo,config={},original=false){
 const image=photo?.image||photo?.logo;
 const ref=image?.asset?._ref;
 let url=image?.asset?.url;
 if(!url&&ref){const m=ref.match(/^image-([\w]+)-(\d+x\d+)-(\w+)$/);if(m&&config.projectId&&config.dataset)url=`https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${m[1]}-${m[2]}.${m[3]}`;}
 if(!url)return safeUrl(photo?.sourceUrl);
 const query=new URLSearchParams({auto:'format'});
 if(!original){query.set('w','1600');query.set('fit','max');const m=ref?.match(/-(\d+)x(\d+)-/);const crop=image.crop;if(m&&crop){const w=+m[1],h=+m[2];query.set('rect',[Math.round(w*crop.left),Math.round(h*crop.top),Math.max(1,Math.round(w*(1-crop.left-crop.right))),Math.max(1,Math.round(h*(1-crop.top-crop.bottom)))].join(','));}}
 if([90,180,270].includes(photo.rotation))query.set('or',String(photo.rotation));
 return safeUrl(url)+'?'+query;
}
export function renderContent(document,docs,page,config={}){
 const translations={};
 function local(value){const ko=text(value);if(value?.en&&ko){translations[ko]=value.en;const a=ko.split('\n'),b=value.en.split('\n');if(a.length===b.length)a.forEach((line,i)=>{if(line)translations[line]=b[i];});}return ko;}
 function setText(el,value){if(!el)return;const ko=local(value);if(el.innerText?.trim()===ko.trim())return;el.replaceChildren();ko.split('\n').forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line));});}
 function picture(photo){const url=assetUrl(photo,config);const alt=local(photo.alt);const hotspot=photo.image?.hotspot;return `<img${photo.display==='cover'?' class="product-photo"':''} src="${escape(url)}" alt="${escape(alt)}" width="700" height="500" loading="lazy"${hotspot?` style="object-position:${hotspot.x*100}% ${hotspot.y*100}%"`:''}>`;}
 function button(photo,title,index){return `<button type="button" class="image-open" data-image="${escape(assetUrl(photo,config,true))}" data-caption="${escape(local(title))}" aria-label="${escape(local(title))} ${index+1}">${picture(photo)}${index===0?'<span class="image-zoom" aria-hidden="true">＋</span>':''}</button>`;}
 const content=docs.find(d=>d._type==='sitePage'&&d.page===page);
 for(const step of content?.processSteps||[])local(step.description);
 if(content?.seoTitle)document.title=local(content.seoTitle);if(content?.seoDescription)document.querySelector('meta[name="description"]')?.setAttribute('content',local(content.seoDescription));
 if(content){for(const item of content.fields||[])setText(document.querySelector(item.selector),item.value);for(const item of content.images||[]){const img=document.querySelector(item.selector);if(img){img.setAttribute('src',assetUrl(item,config));img.setAttribute('alt',local(item.alt));img.classList.toggle('product-photo',item.display==='cover');if(item.image?.hotspot)img.style.objectPosition=`${item.image.hotspot.x*100}% ${item.image.hotspot.y*100}%`;}}}
 if(page==='index'&&content?.heroPhoto?.image?.asset){const art=document.querySelector('.engineering');if(art){art.innerHTML=picture(content.heroPhoto);art.setAttribute('aria-label',local(content.heroPhoto.alt));}}
 const projects=docs.filter(d=>d._type==='project').sort((a,b)=>(a.order||0)-(b.order||0));
 {
  let selected=page==='index'?projects.filter(p=>p.featured):categories.includes(page)?projects.filter(p=>p.category===page):page==='projects'?projects:[];
  const grid=document.querySelector('.project-grid');
  if(grid&&(page==='index'||page==='projects'||categories.includes(page)))grid.innerHTML=selected.map(p=>{const photos=p.photos||[];if(!photos.length)return '';return `<article class="project-card" data-category="${escape(p.category)}"><div class="project-picture">${button(photos[0],p.title,0)}</div><div class="project-caption"><p>${escape(local(p.kind))}</p><h3>${escape(local(p.title))}</h3></div>${photos.length>1?`<div class="project-thumbnails">${photos.slice(1).map((photo,i)=>button(photo,p.title,i+1)).join('')}</div>`:''}</article>`;}).join('');
 }
 const clients=docs.filter(d=>d._type==='client').sort((a,b)=>(a.order||0)-(b.order||0));
 if(page==='clients'&&document.querySelector('.client-grid'))document.querySelector('.client-grid').innerHTML=clients.map(c=>{const logo=assetUrl(c,config);const name=local(c.name);return `<a class="client-card" href="${escape(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer"><div class="client-logo">${logo?`<img src="${escape(logo)}" alt="" width="220" height="80" loading="lazy">`:`<span class="client-wordmark">${escape(name)}</span>`}</div><div class="client-label"><h2>${escape(name)}</h2><span>${c.linkType==='map'?'Google 지도':'홈페이지'}</span><span class="external-mark" aria-hidden="true">↗</span></div><span class="sr-only">새 창으로 열기</span></a>`;}).join('');
 if(page==='index'&&document.querySelector('.partners-track')){const items=clients.filter(c=>c.showOnHome);const list=items.map(c=>{const logo=assetUrl(c,config);return `<li class="partner-item"><a href="${escape(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">${logo?`<img src="${escape(logo)}" alt="${escape(local(c.name))}" width="180" height="54" loading="lazy">`:''}<span>${escape(local(c.name))}</span></a></li>`;}).join('');document.querySelector('.partners-track').innerHTML=`<ul class="partners-group">${list}</ul><ul class="partners-group" aria-hidden="true" inert>${list}</ul>`;}
 const equipment=docs.find(d=>d._type==='equipment');
 if(page==='equipment'&&equipment){const body=document.querySelector('tbody');if(body)body.innerHTML=(equipment.rows||[]).map(row=>`<tr>${row.columns.map(col=>`<td>${escape(local(col))}</td>`).join('')}</tr>`).join('');const software=document.querySelector('.software-list');if(software)software.innerHTML=(equipment.software||[]).map(row=>`<article><h3>${escape(row.name)}</h3><p>${escape(local(row.detail))}</p></article>`).join('');}
 const company=docs.find(d=>d._type==='company');
 if(company){document.querySelectorAll('.email-copy').forEach(el=>{el.replaceChildren(document.createTextNode(company.email+' '));const arrow=document.createElement('span');arrow.textContent='↗';el.append(arrow);el.setAttribute('data-email',company.email);el.setAttribute('aria-label',`이메일 주소 복사: ${company.email}`);translations[`이메일 주소 복사: ${company.email}`]=`Copy email address: ${company.email}`;});setText(document.querySelector('.contact-description'),company.inquiry);setText(document.querySelector('.contact-info>p'),company.address);setText(document.querySelector('.footer-top>p'),company.footer);const phone=document.querySelector('.contact-phone');if(phone){phone.textContent=`전화 ${company.phone||''} / 팩스 ${company.fax||''}`;translations[phone.textContent]=`Tel ${company.phone||''} / Fax ${company.fax||''}`;}document.querySelectorAll('.contact-map').forEach(el=>el.setAttribute('src','https://maps.google.com/maps?q='+encodeURIComponent(company.mapQuery||text(company.address))+'&z=16&output=embed'));}
 for(const meta of document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]'))meta.setAttribute('content',document.title);
 for(const meta of document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]'))meta.setAttribute('content',document.querySelector('meta[name="description"]')?.getAttribute('content')||'');
 if(company)for(const tag of document.querySelectorAll('script[type="application/ld+json"]')){try{const json=JSON.parse(tag.textContent);const items=json['@graph']||[json];for(const item of items)if(item['@type']==='LocalBusiness'){item.email=company.email;item.telephone=company.phone;item.address=company.mapQuery||text(company.address);}tag.textContent=JSON.stringify(json).replace(/</g,'\\u003c');}catch{}}
 return translations;
}

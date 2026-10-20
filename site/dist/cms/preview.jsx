import React,{useEffect,useRef,useState} from 'react';
import {useClient} from 'sanity';
import {renderContent} from './render.mjs';
const pages={sitePage:d=>d.page,project:()=> 'projects',client:()=> 'clients',equipment:()=> 'equipment',company:()=> 'contact'};
export function DraftPreview({document:state}){
 const client=useClient({apiVersion:'2026-10-20'});
 const draft=state.displayed;const [html,setHtml]=useState('');const [error,setError]=useState('');const version=useRef(0);
 useEffect(()=>{const current=++version.current;const timer=setTimeout(async()=>{try{
  const page=pages[draft._type]?.(draft)||'index';const origin=window.location.origin;
  const [response,docs]=await Promise.all([fetch(`${origin}/cms-preview/${page}.html`),client.withConfig({perspective:'published'}).fetch('*[!(_id in path("drafts.**")) && _type in ["sitePage","project","client","equipment","company"]]')]);
  if(!response.ok)throw new Error('미리보기 템플릿을 불러오지 못했습니다.');
  const base=new DOMParser().parseFromString(await response.text(),'text/html');const id=draft._id.replace(/^drafts\./,'');const documents=docs.filter(d=>d._id!==id);documents.push({...draft,_id:id});
  const translations=renderContent(base,documents,page,client.config());
  const baseTag=base.createElement('base');baseTag.href=origin+'/';base.head.prepend(baseTag);
  const robots=base.querySelector('meta[name="robots"]');robots?.setAttribute('content','noindex, nofollow');
  const steps=documents.find(d=>d._type==='sitePage'&&d.page===page)?.processSteps?.map(step=>[step.label,step.description.ko]);
  const script=base.createElement('script');script.textContent=(steps?'window.TCS_PROCESS_STEPS='+JSON.stringify(steps).replace(/</g,'\\u003c')+';':'')+'Object.assign(window.TCS_TRANSLATIONS,'+JSON.stringify(translations).replace(/</g,'\\u003c')+');';base.querySelector('script[src="translations.js"]').after(script);
  if(current===version.current){setHtml('<!doctype html>'+base.documentElement.outerHTML);setError('');}
 }catch(e){if(current===version.current)setError(e.message);}},350);return()=>clearTimeout(timer);},[draft,client]);
 return <div style={{height:'100%',display:'flex',flexDirection:'column'}}><div style={{padding:12,fontSize:13}}>아직 발행하지 않은 변경사항입니다. 저장 후 실제 페이지에 적용하려면 발행을 눌러 주세요.</div>{error?<p role="alert">{error}</p>:<iframe title="발행 전 콘텐츠 미리보기" srcDoc={html} style={{border:0,flex:1,width:'100%',background:'#fff'}}/>}</div>;
}

import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {koKRLocale} from '@sanity/locale-ko-kr';
import {schemaTypes} from './cms/schema.mjs';
import {DraftPreview} from './cms/preview.jsx';
const projectId=process.env.SANITY_STUDIO_PROJECT_ID;
const dataset=process.env.SANITY_STUDIO_DATASET;
if(!projectId||!dataset)throw new Error('SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET must be configured.');
if(dataset==='production')throw new Error('This Studio is configured for development only. Production activation requires a separate release.');
const singletonTypes=new Set(['company','equipment','sitePage']);
export default defineConfig({name:'tcs-development',title:'TCS 콘텐츠 관리 · 개발용',projectId,dataset,basePath:'/',
 plugins:[koKRLocale(),structureTool({structure:S=>S.list().id('content').title('콘텐츠 관리').items([
  S.listItem().id('pages').title('페이지 문구·대표사진').child(S.documentTypeList('sitePage').title('페이지 선택')),
  S.listItem().id('projects').title('제작사례').child(S.documentTypeList('project').title('제작사례')),
  S.listItem().id('clients').title('주요 고객사').child(S.documentTypeList('client').title('주요 고객사')),
  S.listItem().id('equipment').title('보유 장비').child(S.document().schemaType('equipment').documentId('equipment').title('보유 장비')),
  S.listItem().id('company').title('회사정보·연락처').child(S.document().schemaType('company').documentId('company').title('회사정보·연락처'))
 ]),defaultDocumentNode:(S)=>S.document().views([S.view.form(),S.view.component(DraftPreview).title('미리보기')])})],
 schema:{types:schemaTypes},document:{newDocumentOptions:(prev)=>prev.filter(item=>!singletonTypes.has(item.templateId)),actions:(prev,{schemaType})=>singletonTypes.has(schemaType)?prev.filter(action=>!['delete','duplicate','unpublish'].includes(action.action)):prev}
});

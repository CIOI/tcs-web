let language = 'ko';
const translate = (text) => language === 'en' ? (window.TCS_TRANSLATIONS[text] || text) : text;
const menu=document.querySelector('.menu');const nav=document.querySelector('#nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',translate(open?'메뉴 닫기':'메뉴 열기'));menu.textContent=open?'×':'☰';nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',translate('메뉴 열기'));menu.textContent='☰'}));
const details=[['01 / DRAWING REVIEW','2D 도면에 담긴 형상과 주요 정보를 살펴보고, 3D 모델링으로 이어질 설계의 기준을 파악합니다.'],['02 / MASTER MODEL','도면의 형상과 설계 의도를 입체적인 Master Model로 구체화합니다. 설계 이력을 고려하며 다음 단계로 이어질 모델을 다룹니다.'],['03 / CAST MODEL','Master Model을 바탕으로 배치와 주조방안을 고려합니다. 형상을 주조 설계의 관점에서 살펴보는 단계입니다.']];
document.querySelectorAll('.service').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.service').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-expanded','false')});b.classList.add('active');b.setAttribute('aria-expanded','true');const d=details[Number(b.dataset.index)];document.querySelector('.detail-index').textContent=d[0];document.querySelector('#detail-text').textContent=translate(d[1])}));
document.querySelector('#year').textContent=new Date().getFullYear();

document.querySelector('.email-copy').addEventListener('click',async()=>{
  try {
    await navigator.clipboard.writeText('tcs2021@daum.net');
    window.alert(translate('복사되었습니다'));
  } catch {
    window.prompt(translate('아래 이메일 주소를 복사해 주세요.'), 'tcs2021@daum.net');
  }
});

// Retain original text nodes so switching languages never changes links or markup.
const localizedNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (node.parentElement.closest('script, style, #detail-text, .menu')) continue;
  const key = node.textContent.trim();
  if (window.TCS_TRANSLATIONS[key]) localizedNodes.push({node, original:node.textContent, key});
}
const localizedAttributes = [];
document.querySelectorAll('[aria-label], [title]').forEach(element => {
  for (const attribute of ['aria-label', 'title']) {
    const original = element.getAttribute(attribute);
    if (window.TCS_TRANSLATIONS[original]) localizedAttributes.push({element, attribute, original});
  }
});
const description = document.querySelector('meta[name="description"]');
const originalDescription = description.content;
function setLanguage(next) {
  language = next === 'en' ? 'en' : 'ko';
  document.documentElement.lang = language;
  localizedNodes.forEach(({node, original, key}) => {
    node.textContent = language === 'ko' ? original : original.replace(key, window.TCS_TRANSLATIONS[key]);
  });
  localizedAttributes.forEach(({element, attribute, original}) => element.setAttribute(attribute, translate(original)));
  menu.setAttribute('aria-label',translate(menu.getAttribute('aria-expanded') === 'true' ? '메뉴 닫기' : '메뉴 열기'));
  const active = document.querySelector('.service.active');
  document.querySelector('#detail-text').textContent = translate(details[Number(active.dataset.index)][1]);
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
  description.content = language === 'en' ? 'TCS — Total Casting Solution. 2D drawing review, 3D master models and casting plan design in Gimpo, South Korea.' : originalDescription;
  try { localStorage.setItem('tcs-language', language); } catch {}
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
let savedLanguage;
try { savedLanguage = localStorage.getItem('tcs-language'); } catch {}
setLanguage(savedLanguage || 'ko');

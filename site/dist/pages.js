// Disclosure menus work with touch, keyboard and pointer navigation.
document.querySelectorAll('.submenu-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.nav-item');
    const open = !item.classList.contains('open');
    document.querySelectorAll('.nav-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.nav-item.open').forEach(item => {
    item.classList.remove('open');
    const button = item.querySelector('.submenu-toggle');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  });
});
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.submenu a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
});
const filterButtons = document.querySelectorAll('[data-filter]');
function updateCaseCount() {
  const count = document.querySelector('.case-count');
  if (!count) return;
  const visible = [...document.querySelectorAll('.project-card')].filter(card => !card.hidden).length;
  count.textContent = language === 'en' ? `${visible} project references` : `총 ${visible}개 사례`;
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(other => {
    other.classList.toggle('active', other === button);
    other.setAttribute('aria-pressed', String(other === button));
  });
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
  });
  updateCaseCount();
}));
new MutationObserver(updateCaseCount).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
updateCaseCount();
const imageDialog = document.querySelector('.image-dialog');
if (imageDialog) {
  let opener;
  let group = [];
  let current = 0;
  const image = imageDialog.querySelector('img');
  const caption = imageDialog.querySelector('.image-caption');
  const previous = document.createElement('button');
  const next = document.createElement('button');
  const counter = document.createElement('p');
  previous.type = next.type = 'button';
  previous.className = 'image-previous image-navigation';
  next.className = 'image-next image-navigation';
  previous.textContent = '‹';
  next.textContent = '›';
  counter.className = 'image-counter';
  counter.setAttribute('aria-live', 'polite');
  imageDialog.append(previous, next, counter);
  function showImage() {
    const selected = group[current];
    if (!selected) return;
    image.src = selected.dataset.image;
    image.alt = translate(selected.dataset.caption);
    caption.textContent = translate(selected.dataset.caption);
    counter.textContent = `${current + 1} / ${group.length}`;
    previous.hidden = next.hidden = counter.hidden = group.length < 2;
    previous.setAttribute('aria-label', translate('이전 사진'));
    next.setAttribute('aria-label', translate('다음 사진'));
  }
  function moveImage(direction) {
    if (group.length < 2) return;
    current = (current + direction + group.length) % group.length;
    showImage();
  }
  previous.addEventListener('click', () => moveImage(-1));
  next.addEventListener('click', () => moveImage(1));
  imageDialog.addEventListener('keydown', event => {
    if (!imageDialog.open || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    moveImage(event.key === 'ArrowLeft' ? -1 : 1);
  });
  new MutationObserver(showImage).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const card = button.closest('.project-card');
    group = card ? [...card.querySelectorAll('.image-open')] : [button];
    current = group.indexOf(button);
    showImage();
    imageDialog.showModal();
  }));
  imageDialog.querySelector('.image-close').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return;
    const rect = imageDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) imageDialog.close();
  });
  imageDialog.addEventListener('close', () => opener?.focus());
}

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
  document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const caption = translate(button.dataset.caption);
    const image = imageDialog.querySelector('img');
    image.src = button.dataset.image;
    image.alt = caption;
    imageDialog.querySelector('.image-caption').textContent = caption;
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

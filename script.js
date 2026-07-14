const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.magnet-btn').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches || event.pointerType !== 'mouse') return;

    const rect = button.getBoundingClientRect();
    const pull = 0.18;
    const offsetX = (event.clientX - (rect.left + rect.width / 2)) * pull;
    const offsetY = (event.clientY - (rect.top + rect.height / 2)) * pull;

    button.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  });

  button.addEventListener('pointerleave', () => {
    button.style.transform = 'translate3d(0, 0, 0)';
  });
});

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const projectCursor = document.createElement('div');
projectCursor.className = 'project-cursor';
projectCursor.setAttribute('aria-hidden', 'true');
document.body.append(projectCursor);

document.querySelectorAll('.case-media[data-cursor]').forEach((preview) => {
  preview.addEventListener('pointerenter', (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    projectCursor.textContent = preview.dataset.cursor;
    projectCursor.style.left = `${event.clientX}px`;
    projectCursor.style.top = `${event.clientY}px`;
    projectCursor.classList.add('is-visible');
  });

  preview.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    projectCursor.style.left = `${event.clientX}px`;
    projectCursor.style.top = `${event.clientY}px`;
  });

  preview.addEventListener('pointerleave', () => {
    projectCursor.classList.remove('is-visible');
  });
});

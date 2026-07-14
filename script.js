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

const experienceTitle = document.querySelector('#experience-title');

if (experienceTitle && !reduceMotion.matches) {
  const titleText = experienceTitle.textContent.trim();
  const visualText = document.createElement('span');
  const animatedCharacters = [];

  visualText.setAttribute('aria-hidden', 'true');

  titleText.match(/\S+|\s+/g)?.forEach((part) => {
    if (/^\s+$/.test(part)) {
      visualText.append(document.createTextNode(part));
      return;
    }

    const word = document.createElement('span');
    word.className = 'soft-blur-word';

    Array.from(part).forEach((character) => {
      const characterElement = document.createElement('span');
      characterElement.className = 'soft-blur-char';
      characterElement.textContent = character;
      word.append(characterElement);
      animatedCharacters.push(characterElement);
    });

    visualText.append(word);
  });

  experienceTitle.textContent = '';
  experienceTitle.setAttribute('aria-label', titleText);
  experienceTitle.classList.add('soft-blur-title');
  experienceTitle.append(visualText);

  const revealTitle = () => {
    const animations = animatedCharacters.map((character, index) => character.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 16px, 0)', filter: 'blur(12px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' },
      ],
      {
        duration: 900,
        delay: index * 25,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      },
    ));

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      animatedCharacters.forEach((character) => {
        character.style.opacity = '1';
        character.style.transform = 'translate3d(0, 0, 0)';
        character.style.filter = 'blur(0)';
        character.style.willChange = 'auto';
      });
    });
  };

  if ('IntersectionObserver' in window) {
    const titleObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      revealTitle();
      observer.disconnect();
    }, { threshold: 0.45 });

    titleObserver.observe(experienceTitle);
  } else {
    revealTitle();
  }
}

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

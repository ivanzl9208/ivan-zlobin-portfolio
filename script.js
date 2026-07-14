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

const collectTextNodes = (root) => {
  const textNodes = [];

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      textNodes.push(...collectTextNodes(node));
    }
  });

  return textNodes;
};

const splitSoftBlurText = (title, mode) => {
  const units = [];

  collectTextNodes(title).forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const parts = textNode.textContent.match(/\S+|\s+/g) ?? [];

    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }

      if (mode === 'words') {
        const word = document.createElement('span');
        word.className = 'soft-blur-word soft-blur-unit';
        word.textContent = part;
        fragment.append(word);
        units.push(word);
        return;
      }

      const word = document.createElement('span');
      word.className = 'soft-blur-word';

      Array.from(part).forEach((character) => {
        const characterElement = document.createElement('span');
        characterElement.className = 'soft-blur-unit';
        characterElement.textContent = character;
        word.append(characterElement);
        units.push(characterElement);
      });

      fragment.append(word);
    });

    textNode.replaceWith(fragment);
  });

  return units;
};

const finishSoftBlur = (units) => {
  units.forEach((unit) => {
    unit.style.opacity = '1';
    unit.style.transform = 'translate3d(0, 0, 0)';
    unit.style.filter = 'blur(0)';
    unit.style.willChange = 'auto';
  });
};

document.querySelectorAll('[data-soft-blur]').forEach((title) => {
  if (reduceMotion.matches) return;

  const mode = title.dataset.softBlur;
  const units = splitSoftBlurText(title, mode);
  const stagger = mode === 'words' ? 15 : 25;

  title.classList.add('soft-blur-title');

  const reveal = () => {
    if (!Element.prototype.animate) {
      finishSoftBlur(units);
      return;
    }

    const animations = units.map((unit, index) => unit.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 16px, 0)', filter: 'blur(12px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' },
      ],
      {
        duration: 900,
        delay: index * stagger,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      },
    ));

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      finishSoftBlur(units);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      reveal();
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(title);
  } else {
    reveal();
  }
});

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

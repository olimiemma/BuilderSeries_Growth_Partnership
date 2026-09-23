(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.getElementById('deck');
  const bar = document.getElementById('bar');
  const cur = document.getElementById('cur');
  const grid = document.getElementById('grid');
  const gridButton = document.getElementById('gridbtn');
  const gwrap = document.getElementById('gwrap');
  // Touch devices need native document scrolling even with a tablet-sized viewport.
  // Keep this query in sync with the deck reading-mode rule in responsive.css.
  const reading = matchMedia('(max-width: 900px), (max-height: 500px), (hover: none) and (pointer: coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let returnFocus;
  let previousOverflow;
  let lockedScroll;
  let navigationTarget = null;
  let scrollTimer;

  function navigationButton(id, label, path) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'deck-arrow';
    button.setAttribute('aria-label', label);
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return button;
  }
  const previousButton = navigationButton('deck-prev', 'Previous slide', 'm14 6-6 6 6 6');
  const nextButton = navigationButton('deck-next', 'Next slide', 'm10 6 6 6-6 6');
  gridButton.before(previousButton);
  document.querySelector('.hud').append(nextButton);
  previousButton.addEventListener('click', () => go((navigationTarget ?? current) - 1));
  nextButton.addEventListener('click', () => go((navigationTarget ?? current) + 1));

  document.getElementById('tot').textContent = slides.length;
  grid.setAttribute('role', 'dialog');
  grid.setAttribute('aria-modal', 'true');
  grid.setAttribute('aria-label', gridButton.textContent.trim());
  gridButton.setAttribute('aria-controls', 'grid');
  gridButton.setAttribute('aria-expanded', 'false');
  const closeButton = document.createElement('button');
  closeButton.className = 'grid-close';
  closeButton.setAttribute('aria-label', 'Close all slides');
  closeButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  grid.prepend(closeButton);

  slides.forEach((slide, index) => {
    slide.id ||= `slide-${index + 1}`;
    // Register on each slide so mobile WebKit treats the surface as tappable.
    slide.addEventListener('click', handleSlideClick);
    const button = document.createElement('button');
    button.className = 'gcell';
    button.innerHTML = '<span></span><b></b>';
    button.querySelector('span').textContent = String(index + 1).padStart(2, '0');
    button.querySelector('b').textContent = slide.dataset.title;
    button.addEventListener('click', () => {
      closeGrid(false);
      go(index);
      slide.tabIndex = -1;
      slide.focus({preventScroll: true});
    });
    gwrap.appendChild(button);
  });

  function update(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, n) => slide.classList.toggle('on', n === current));
    bar.style.width = `${(current + 1) / slides.length * 100}%`;
    cur.textContent = current + 1;
    previousButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;
    [...gwrap.children].forEach((button, n) => {
      if (n === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function go(index, immediate = false) {
    update(index);
    if (reading.matches) {
      navigationTarget = current;
      slides[current].scrollIntoView({behavior: immediate || reducedMotion.matches ? 'instant' : 'smooth', block: 'start'});
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(finishScroll, 180);
    } else slides[current].scrollTop = 0;
    history.replaceState(null, '', `#${current + 1}`);
  }

  function openGrid() {
    returnFocus = document.activeElement === document.body ? gridButton : document.activeElement;
    previousOverflow = document.body.style.overflow;
    // Pin the document while the overview scrolls, including on mobile Safari.
    lockedScroll = reading.matches ? {x: scrollX, y: scrollY} : null;
    if (lockedScroll) {
      document.body.style.position = 'fixed';
      document.body.style.top = `${-lockedScroll.y}px`;
      document.body.style.width = '100%';
    }
    grid.hidden = false;
    deck.inert = true;
    document.querySelector('.footrow').inert = true;
    document.body.style.overflow = 'hidden';
    gridButton.setAttribute('aria-expanded', 'true');
    gwrap.children[current].focus();
  }

  function closeGrid(restoreFocus = true) {
    if (grid.hidden) return;
    grid.hidden = true;
    deck.inert = false;
    document.querySelector('.footrow').inert = false;
    document.body.style.overflow = previousOverflow;
    if (lockedScroll) {
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      window.scrollTo({left: lockedScroll.x, top: lockedScroll.y, behavior: 'instant'});
      lockedScroll = null;
    }
    gridButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) returnFocus?.focus({preventScroll: true});
  }

  gridButton.addEventListener('click', openGrid);
  closeButton.addEventListener('click', () => closeGrid());
  grid.addEventListener('click', event => { if (event.target === grid) closeGrid(); });
  document.addEventListener('keydown', event => {
    if (!grid.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); closeGrid(); }
      if (event.key === 'Tab') {
        const buttons = [...grid.querySelectorAll('button')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.target.closest('a, button, input, textarea, select, [contenteditable], .scroller')) return;
    if (event.key.toLowerCase() === 'g') { event.preventDefault(); openGrid(); return; }
    // Native reading keys scroll normally on phones and tablets.
    if (reading.matches) return;
    const offsets = {ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1};
    if (event.key in offsets) { event.preventDefault(); go(current + offsets[event.key]); }
    else if (event.key === 'Home') { event.preventDefault(); go(0); }
    else if (event.key === 'End') { event.preventDefault(); go(slides.length - 1); }
  });
  function handleSlideClick(event) {
    if (!grid.hidden || event.target.closest('a, button, .scroller, table, .footrow')) return;
    if (performance.now() < suppressClickUntil) return;
    if (getSelection().toString()) return;
    const slide = event.target.closest('.slide');
    if (!slide) return;
    const index = reading.matches ? slides.indexOf(slide) : current;
    go(index + (event.clientX < innerWidth * .28 ? -1 : 1));
  }
  let touchStart;
  let suppressClickUntil = 0;
  document.addEventListener('touchstart', event => {
    // A finger taking over must stop a long smooth jump before native panning starts.
    // Otherwise the animation can keep moving forward during a backward swipe.
    if (reading.matches && grid.hidden) window.scrollTo({left: scrollX, top: scrollY, behavior: 'instant'});
    navigationTarget = null;
    touchStart = event.touches.length === 1 && grid.hidden && !event.target.closest('a, button, .scroller, table, .footrow')
      ? {x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now(), moved: false} : null;
  }, {passive: true});
  document.addEventListener('touchmove', event => {
    if (!touchStart) return;
    if (event.touches.length !== 1) { touchStart = null; suppressClickUntil = performance.now() + 700; return; }
    const touch = event.touches[0];
    if (Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) > 10) touchStart.moved = true;
  }, {passive: true});
  document.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    // Scrolling or selecting text must never trigger the synthesized click's slide advance.
    if (touchStart.moved || performance.now() - touchStart.time > 600) suppressClickUntil = performance.now() + 700;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5 && !getSelection().toString()) go(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});
  document.addEventListener('touchcancel', () => { touchStart = null; }, {passive: true});

  function syncScroll() {
    if (!reading.matches || !grid.hidden) return;
    let index = 0;
    slides.forEach((slide, n) => { if (slide.getBoundingClientRect().top <= Math.min(64, innerHeight * .15)) index = n; });
    if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight) index = slides.length - 1;
    update(index);
    history.replaceState(null, '', `#${index + 1}`);
  }
  function finishScroll() {
    navigationTarget = null;
    syncScroll();
  }
  let scheduled = false;
  addEventListener('scroll', () => {
    if (!reading.matches || !grid.hidden || scheduled) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(finishScroll, 180);
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (navigationTarget === null) syncScroll();
    });
  }, {passive: true});
  reading.addEventListener('change', () => go(current, true));
  addEventListener('wheel', () => { navigationTarget = null; }, {passive: true});
  addEventListener('hashchange', () => {
    const index = parseInt(location.hash.slice(1), 10);
    if (Number.isFinite(index)) go(index - 1, true);
  });
  const start = parseInt(location.hash.slice(1), 10);
  update(Number.isFinite(start) ? start - 1 : 0);
  if (Number.isFinite(start)) requestAnimationFrame(() => go(current, true));
})();

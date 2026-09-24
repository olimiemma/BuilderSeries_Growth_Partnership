(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isDeck = document.body.classList.contains('page-deck');
  const slides = [...document.querySelectorAll('.slide')];
  const progress = document.createElement('div');
  progress.className = 'story-progress';
  progress.setAttribute('aria-hidden', 'true');
  const segments = Array.from({length: isDeck ? slides.length : 1}, () => {
    const segment = document.createElement('span');
    segment.append(document.createElement('i'));
    progress.append(segment);
    return segment.firstElementChild;
  });
  document.body.append(progress);
  document.body.classList.add('experience-ready');

  // Use the existing headings as shortcuts; all editorial text stays in place.
  const headings = document.body.matches('.page-hub, .page-doc') && !document.querySelector('.doc')
    ? [...document.querySelectorAll('.wrap h2')] : [];
  let chapters;
  const chapterLinks = [];
  if (headings.length > 1) {
    chapters = document.createElement('nav');
    chapters.className = 'chapter-rail';
    chapters.setAttribute('aria-label', 'Page sections');
    headings.forEach((heading, index) => {
      heading.id ||= `chapter-${index + 1}`;
      heading.classList.add('chapter-heading');
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      chapters.append(link);
      chapterLinks.push(link);
    });
    const anchor = document.querySelector('.hero') || document.querySelector('.meta');
    anchor?.after(chapters);
  }

  const up = document.createElement('button');
  up.className = 'reading-return';
  up.setAttribute('aria-label', 'Back to top');
  up.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="reading-track" cx="20" cy="20" r="17"/><circle class="reading-fill" cx="20" cy="20" r="17" pathLength="100"/><path d="M20 27V13m-6 6 6-6 6 6"/></svg>';
  up.hidden = true;
  if (!isDeck) document.body.append(up);
  up.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    const title = document.querySelector('h1');
    if (title) {
      title.tabIndex = -1;
      title.focus({preventScroll: true});
    }
  });

  let scheduled = false;
  let previousChapter = -1;
  let lockedPosition = null;
  function paintProgress() {
    scheduled = false;
    if (lockedPosition || (isDeck && !document.getElementById('grid').hidden)) return;
    const range = document.documentElement.scrollHeight - innerHeight;
    const amount = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 1;
    if (isDeck) {
      const index = Number(document.getElementById('cur').textContent) - 1;
      const reading = getComputedStyle(slides[index]).position === 'static';
      const bounds = slides[index].getBoundingClientRect();
      const portion = reading ? Math.max(.06, Math.min(1, -bounds.top / Math.max(1, bounds.height - 80))) : 1;
      segments.forEach((segment, n) => { segment.style.transform = `scaleX(${n < index ? 1 : n === index ? portion : 0})`; });
      if (reading && amount >= .999) segments.forEach(segment => { segment.style.transform = 'scaleX(1)'; });
    } else {
      segments[0].style.transform = `scaleX(${amount})`;
      up.style.setProperty('--read', amount * 100);
      up.hidden = scrollY < Math.min(500, innerHeight * .65);
    }
    if (chapters) {
      let active = 0;
      headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top < 140) active = index; });
      if (active !== previousChapter) {
        chapterLinks.forEach((link, index) => {
          if (index === active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        previousChapter = active;
      }
    }
  }
  function scheduleProgress() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(paintProgress); }
  }
  addEventListener('scroll', scheduleProgress, {passive: true});
  addEventListener('resize', scheduleProgress, {passive: true});
  addEventListener('touchstart', () => {
    // Let a finger immediately take over from a chapter jump or return-to-top animation.
    if (!isDeck && !lockedPosition) window.scrollTo({left: scrollX, top: scrollY, behavior: 'instant'});
  }, {passive: true});
  if (isDeck) new MutationObserver(scheduleProgress).observe(document.getElementById('cur'), {childList: true});
  paintProgress();

  // Animate entry once. Content is never hidden while waiting for JavaScript or an observer.
  const revealTargets = document.querySelectorAll('.door, .rows > li, .gal > li, .page-proposal .card, .page-proposal .metric-item, .page-proposal .package-card, .page-deck .stat, .page-deck .engine > div');
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!reducedMotion.matches) entry.target.classList.add('arrive');
        reveals.unobserve(entry.target);
      });
    }, {threshold: .12});
    revealTargets.forEach(target => reveals.observe(target));
  }

  // Turn the existing artwork into a swipeable, full-screen gallery.
  const artwork = [...document.querySelectorAll('.gal figure')];
  if (!artwork.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'artwork-viewer';
  dialog.setAttribute('aria-labelledby', 'artwork-title');
  dialog.innerHTML = '<div class="artwork-toolbar"><span class="artwork-count"></span><button class="artwork-close" aria-label="Close artwork"></button></div><div class="artwork-stage"><img alt=""></div><div class="artwork-details"><button class="artwork-prev" aria-label="Previous artwork"></button><div><b id="artwork-title"></b><p class="artwork-description"></p></div><button class="artwork-next" aria-label="Next artwork"></button></div>';
  const icon = path => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  dialog.querySelector('.artwork-close').innerHTML = icon('m6 6 12 12M6 18 18 6');
  dialog.querySelector('.artwork-prev').innerHTML = icon('m14 6-6 6 6 6');
  dialog.querySelector('.artwork-next').innerHTML = icon('m10 6 6 6-6 6');
  document.body.append(dialog);
  const fullImage = dialog.querySelector('.artwork-stage img');
  const previous = dialog.querySelector('.artwork-prev');
  const next = dialog.querySelector('.artwork-next');
  let selected = 0;
  let opener;
  let bodyStyle;
  function showArtwork(index) {
    selected = Math.max(0, Math.min(artwork.length - 1, index));
    const figure = artwork[selected];
    const source = figure.querySelector('img');
    fullImage.src = source.currentSrc || source.src;
    fullImage.alt = source.alt;
    dialog.querySelector('#artwork-title').textContent = figure.querySelector('figcaption b').textContent;
    dialog.querySelector('.artwork-description').textContent = figure.querySelector('figcaption span').textContent;
    dialog.querySelector('.artwork-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${artwork.length}`;
    previous.disabled = selected === 0;
    next.disabled = selected === artwork.length - 1;
  }
  artwork.forEach((figure, index) => {
    const image = figure.querySelector('img');
    const button = document.createElement('button');
    button.className = 'artwork-open';
    button.setAttribute('aria-label', `View artwork: ${image.alt}`);
    button.setAttribute('aria-haspopup', 'dialog');
    image.before(button);
    button.append(image);
    const expand = document.createElement('span');
    expand.className = 'artwork-expand';
    expand.innerHTML = icon('M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7');
    expand.setAttribute('aria-hidden', 'true');
    button.append(expand);
    button.addEventListener('click', () => {
      opener = button;
      showArtwork(index);
      lockedPosition = {x: scrollX, y: scrollY};
      bodyStyle = document.body.getAttribute('style');
      Object.assign(document.body.style, {position: 'fixed', top: `${-lockedPosition.y}px`, width: '100%', overflow: 'hidden'});
      dialog.showModal();
      dialog.querySelector('.artwork-close').focus({preventScroll: true});
    });
  });
  previous.addEventListener('click', () => showArtwork(selected - 1));
  next.addEventListener('click', () => showArtwork(selected + 1));
  dialog.querySelector('.artwork-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showArtwork(selected - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showArtwork(selected + 1); }
  });
  let start;
  const stage = dialog.querySelector('.artwork-stage');
  stage.addEventListener('touchstart', event => {
    start = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  stage.addEventListener('touchmove', event => { if (event.touches.length !== 1) start = null; }, {passive: true});
  stage.addEventListener('touchcancel', () => { start = null; }, {passive: true});
  stage.addEventListener('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showArtwork(selected + (dx < 0 ? 1 : -1));
    start = null;
  }, {passive: true});
  dialog.addEventListener('close', () => {
    if (bodyStyle === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', bodyStyle);
    window.scrollTo({left: lockedPosition.x, top: lockedPosition.y, behavior: 'instant'});
    lockedPosition = null;
    opener.focus({preventScroll: true});
    scheduleProgress();
  });
})();

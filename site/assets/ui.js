(() => {
  // Name scroll regions from existing headings, without adding page copy.
  document.querySelectorAll('.scroller').forEach((region, index) => {
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    const heading = region.closest('.slide')?.querySelector('h1, h2') || document.querySelector('h1');
    if (heading) {
      heading.id ||= `table-heading-${index}`;
      region.setAttribute('aria-labelledby', heading.id);
    }
    region.querySelectorAll('th').forEach(cell => cell.setAttribute('scope', 'col'));
  });
  if (!document.body.classList.contains('page-proposal')) return;

  const header = document.querySelector('header');
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 20}px`);
  }).observe(header);

  document.querySelectorAll('input[type="range"]').forEach(input => {
    const label = input.previousElementSibling.firstElementChild;
    label.id = `${input.id}-label`;
    input.setAttribute('aria-labelledby', label.id);
  });
  const tabs = [...document.querySelectorAll('.t-tab')];
  const panels = [...document.querySelectorAll('.timeline-panel')];
  document.querySelector('.timeline-tabs').setAttribute('role', 'tablist');
  const originalSwitch = window.switchTimeline;
  window.switchTimeline = index => {
    originalSwitch(index);
    tabs.forEach((tab, n) => {
      tab.setAttribute('aria-selected', n === index ? 'true' : 'false');
      tab.tabIndex = n === index ? 0 : -1;
    });
  };
  tabs.forEach((tab, index) => {
    tab.id = `timeline-tab-${index}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `timeline-panel-${index}`);
    panels[index].id = `timeline-panel-${index}`;
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      window.switchTimeline(next);
      tabs[next].focus();
    });
  });
  window.switchTimeline(0);

  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(link => document.querySelector(link.hash));
  let scheduled = false;
  const updateNav = () => {
    scheduled = false;
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= header.offsetHeight + 60) active = index;
    });
    links.forEach((link, index) => {
      link.classList.toggle('active', index === active);
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); }
  }, {passive: true});
  updateNav();
})();

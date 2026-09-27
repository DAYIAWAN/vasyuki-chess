(() => {
  'use strict';

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const $ = (selector, root = document) => root.querySelector(selector);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const menuToggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.classList.remove('modal-open');
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(opening));
      nav.classList.toggle('open', opening);
      document.body.classList.toggle('modal-open', opening);
    });

    $$('a, button', nav).forEach((control) => {
      control.addEventListener('click', () => {
        if (window.innerWidth <= 760) closeMenu();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const selector = anchor.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = $(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', selector);
    });
  });

  const supportModal = $('[data-support-modal]');
  const openSupportButtons = $$('[data-support-open]');
  const closeSupportButtons = $$('[data-support-close]');
  let supportTrigger = null;

  const closeSupport = () => {
    if (!supportModal || !supportModal.open) return;
    supportModal.close();
  };

  openSupportButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!supportModal) return;
      supportTrigger = button;
      supportModal.showModal();
      document.body.classList.add('modal-open');
    });
  });

  closeSupportButtons.forEach((button) => button.addEventListener('click', closeSupport));

  if (supportModal) {
    supportModal.addEventListener('click', (event) => {
      const rect = supportModal.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) closeSupport();
    });
    supportModal.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (supportTrigger) supportTrigger.focus();
    });
  }

  const stagesViewport = $('[data-stages]');
  const stagesTrack = $('[data-stages-track]');
  const stagesPrev = $('[data-stages-prev]');
  const stagesNext = $('[data-stages-next]');
  const stagesProgress = $('[data-stages-progress]');

  const updateStages = () => {
    if (!stagesTrack || !stagesPrev || !stagesNext || window.innerWidth > 760) return;
    const max = Math.max(1, stagesTrack.scrollWidth - stagesTrack.clientWidth);
    const ratio = Math.min(1, Math.max(0, stagesTrack.scrollLeft / max));
    const visibleRatio = Math.min(1, stagesTrack.clientWidth / stagesTrack.scrollWidth);
    stagesPrev.disabled = stagesTrack.scrollLeft <= 4;
    stagesNext.disabled = stagesTrack.scrollLeft >= max - 4;
    if (stagesProgress) {
      stagesProgress.style.width = `${Math.max(14.285, visibleRatio * 100 + ratio * (100 - visibleRatio * 100))}%`;
    }
  };

  const stageScroll = (direction) => {
    if (!stagesTrack) return;
    const card = $('.stage-card', stagesTrack);
    const gap = 12;
    const distance = card ? card.getBoundingClientRect().width + gap : stagesTrack.clientWidth * 0.85;
    stagesTrack.scrollBy({ left: direction * distance, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  };

  if (stagesTrack && stagesPrev && stagesNext) {
    stagesPrev.addEventListener('click', () => stageScroll(-1));
    stagesNext.addEventListener('click', () => stageScroll(1));
    stagesTrack.addEventListener('scroll', updateStages, { passive: true });
    window.addEventListener('resize', updateStages);
    updateStages();
  }

  const participantsViewport = $('[data-participants]');
  const participantsTrack = $('[data-participants-track]');
  const participantCards = $$('[data-participant]');
  const participantsPrev = $('[data-participants-prev]');
  const participantsNext = $('[data-participants-next]');
  const participantsCurrent = $('[data-participants-current]');
  let participantIndex = 0;

  const participantMetrics = () => {
    if (!participantsViewport || !participantsTrack || participantCards.length === 0) return null;
    const card = participantCards[0];
    const style = window.getComputedStyle(participantsTrack);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    const step = card.getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.floor((participantsViewport.clientWidth + gap) / step));
    return { step, visible, maxIndex: Math.max(0, participantCards.length - visible) };
  };

  const updateParticipants = () => {
    const metrics = participantMetrics();
    if (!metrics || !participantsTrack || !participantsPrev || !participantsNext) return;
    participantIndex = Math.min(participantIndex, metrics.maxIndex);
    participantsTrack.style.transform = `translate3d(${-participantIndex * metrics.step}px, 0, 0)`;
    participantsPrev.disabled = participantIndex === 0;
    participantsNext.disabled = participantIndex >= metrics.maxIndex;
    if (participantsCurrent) participantsCurrent.textContent = String(participantIndex + 1).padStart(2, '0');
  };

  if (participantsPrev && participantsNext) {
    participantsPrev.addEventListener('click', () => {
      participantIndex = Math.max(0, participantIndex - 1);
      updateParticipants();
    });
    participantsNext.addEventListener('click', () => {
      const metrics = participantMetrics();
      if (!metrics) return;
      participantIndex = Math.min(metrics.maxIndex, participantIndex + 1);
      updateParticipants();
    });
    window.addEventListener('resize', updateParticipants);
    updateParticipants();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav && nav.classList.contains('open')) closeMenu();
  });

  $$('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();

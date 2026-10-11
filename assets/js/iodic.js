(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // Header — glass bar once the page scrolls.
  function initHeader() {
    var header = document.getElementById('iodHeader');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 30);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Mobile nav dropdown toggle.
  function initNav() {
    var toggle = document.getElementById('iodNavToggle');
    var nav = document.getElementById('iodNav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // Services dropdown — hover on desktop (CSS), click toggle everywhere.
  function initDropdown() {
    var dd = document.querySelector('.iod-dd');
    if (!dd) return;
    var toggle = dd.querySelector('.iod-dd__toggle');

    function set(open) {
      dd.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      set(!dd.classList.contains('is-open'));
    });

    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) set(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') set(false);
    });
  }

  // Floating back-to-top button.
  function initToTop() {
    var btn = document.getElementById('iodToTop');
    if (!btn) return;

    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // Quote popup — opened by any [data-quote] trigger, links fall back to contact.html.
  function initQuote() {
    var modal = document.getElementById('iodQuote');
    var triggers = document.querySelectorAll('[data-quote]');
    if (!modal || !triggers.length) return;

    var form = modal.querySelector('form');
    var status = form.querySelector('.iod-form__status');
    var done = modal.querySelector('.iod-modal__done');
    var lastFocus = null;
    var closeTimer = null;

    function focusables() {
      return Array.prototype.filter.call(
        modal.querySelectorAll('a[href], button, input, select, textarea'),
        function (el) { return !el.disabled && el.offsetParent !== null; }
      );
    }

    function open(e) {
      e.preventDefault();
      clearTimeout(closeTimer);
      lastFocus = document.activeElement;
      form.hidden = false;
      done.hidden = true;
      modal.hidden = false;
      root.classList.add('iod-locked');
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        var first = form.querySelector('input[name="name"]');
        if (first) first.focus({ preventScroll: true });
      });
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      root.classList.remove('iod-locked');
      closeTimer = setTimeout(function () { modal.hidden = true; }, reduceMotion ? 0 : 450);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    triggers.forEach(function (t) { t.addEventListener('click', open); });

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-quote-close]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var email = form.elements.email;
      var valid = true;

      [name, email].forEach(function (field) {
        var ok = field.value.trim() !== '' && field.checkValidity();
        field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        status.classList.add('is-error');
        status.textContent = 'Please add your name and a valid email.';
        return;
      }

      status.textContent = '';
      modal.querySelector('[data-quote-name]').textContent = ', ' + name.value.trim();
      form.reset();
      form.hidden = true;
      done.hidden = false;
      done.querySelector('button').focus({ preventScroll: true });
    });
  }

  // Category filter (blog posts, portfolio projects) — filters [data-cat] items in the same section.
  function initFilter() {
    document.querySelectorAll('.iod-filter').forEach(function (group) {
      var section = group.closest('section') || document;
      initFilterGroup(group.querySelectorAll('.iod-filter__btn'), section.querySelectorAll('[data-cat]'));
    });
  }

  function initFilterGroup(buttons, posts) {
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        posts.forEach(function (post) {
          var show = cat === 'All' || post.getAttribute('data-cat') === cat;
          post.classList.toggle('is-hidden', !show);
          if (show) {
            post.style.opacity = 1;
            post.style.transform = 'none';
          }
        });
        if (hasGsap) window.ScrollTrigger.refresh();
      });
    });
  }

  // Newsletter — client-side validation only.
  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(function (form) {
      var input = form.querySelector('input');
      var status = form.querySelector('.iod-form__status');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = input.value.trim() !== '' && input.checkValidity();
        input.classList.toggle('is-invalid', !ok);
        status.classList.toggle('is-error', !ok);
        status.textContent = ok ? 'Thanks for subscribing!' : 'Please enter a valid email.';
        if (ok) form.reset();
      });
    });
  }

  // Article: reading progress, table-of-contents highlight, copy link.
  function initArticle() {
    var bar = document.getElementById('iodProgress');
    var prose = document.querySelector('.iod-prose');

    if (bar && prose) {
      var update = function () {
        var rect = prose.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var p = Math.min(Math.max(-rect.top / (total > 0 ? total : 1), 0), 1);
        bar.style.transform = 'scaleX(' + p + ')';
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
    }

    var tocLinks = document.querySelectorAll('#iodToc a');
    if (tocLinks.length && 'IntersectionObserver' in window) {
      var map = {};
      tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
          map[entry.target.id].classList.add('is-active');
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }

    document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(window.location.href).then(function () {
          btn.classList.add('is-copied');
          setTimeout(function () { btn.classList.remove('is-copied'); }, 1500);
        });
      });
    });
  }

  // Scroll reveals + hero intro (GSAP / ScrollTrigger).
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');

    if (!hasGsap || reduceMotion) {
      root.classList.remove('iod-js');
      return;
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    if (document.querySelector('[data-hero]')) gsap.to('[data-hero]', {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.1,
      delay: 0.1
    });

    // Fan cards rise up and open out from a stack.
    if (document.querySelector('.iod-fan')) gsap.from('.iod-fan__card', {
      y: 260,
      rotate: 0,
      x: 0,
      duration: 1.4,
      ease: 'expo.out',
      stagger: { each: 0.08, from: 'center' },
      delay: 0.35,
      clearProps: 'transform'
    });

    if (document.querySelector('.iod-chip')) gsap.from('.iod-chip', {
      opacity: 0,
      scale: 0.6,
      duration: 0.9,
      ease: 'back.out(1.6)',
      stagger: 0.08,
      delay: 0.8
    });

    items.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Fan drifts down slightly as the hero scrolls away.
    if (document.querySelector('.iod-fan')) gsap.to('.iod-fan', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.iod-hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Light up process steps one after another.
    document.querySelectorAll('.iod-step').forEach(function (step, i) {
      window.ScrollTrigger.create({
        trigger: '.iod-steps',
        start: 'top 70%',
        once: true,
        onEnter: function () {
          setTimeout(function () { step.classList.add('is-active'); }, i * 250);
        }
      });
    });
  }

  // Hero chips follow the pointer (each chip scales the offset by its --d in CSS).
  function initHeroParallax() {
    var hero = document.getElementById('iodHero');
    if (!hero || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    var frame = null;
    hero.addEventListener('pointermove', function (e) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (((e.clientX - rect.left) / rect.width) - 0.5) * -40);
        hero.style.setProperty('--my', (((e.clientY - rect.top) / rect.height) - 0.5) * -40);
        frame = null;
      });
    });

    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }

  // Count-up hero stats.
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function render(el, value) {
      el.textContent = value + (el.getAttribute('data-suffix') || '');
    }

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (reduceMotion) return render(el, target);

      var start = null;
      var duration = 1600;

      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        render(el, Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  // Cursor-follow glow on service cards.
  function initCardGlow() {
    document.querySelectorAll('.iod-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  // Contact form — client-side validation only (no backend yet).
  function initForm() {
    var form = document.getElementById('iodForm');
    var status = document.getElementById('iodFormStatus');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var valid = true;

      [name, email].forEach(function (field) {
        var ok = field.value.trim() !== '' && field.checkValidity();
        field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });

      status.classList.toggle('is-error', !valid);

      if (!valid) {
        status.textContent = 'Please add your name and a valid email.';
        return;
      }

      // No backend yet — once one exists, redirect after it responds.
      window.location.href = 'thank-you.html?name=' + encodeURIComponent(name.value.trim());
    });
  }

  // Thank-you page: greet by first name passed from the form.
  function initThanks() {
    var slot = document.querySelector('[data-thanks-name]');
    if (!slot) return;
    var name = new URLSearchParams(window.location.search).get('name');
    if (!name) return;
    var first = name.trim().split(/\s+/)[0].slice(0, 30);
    if (first) slot.textContent = ', ' + first;
  }

  function initYear() {
    var year = document.getElementById('iodYear');
    if (year) year.textContent = new Date().getFullYear();
  }

  initHeader();
  initNav();
  initDropdown();
  initToTop();
  initQuote();
  initFilter();
  initNewsletter();
  initArticle();
  initReveal();
  initHeroParallax();
  initCounters();
  initCardGlow();
  initForm();
  initThanks();
  initYear();
})();

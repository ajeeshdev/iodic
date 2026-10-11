(function () {
  'use strict';

  // Mighty Warners MEG home page — floating pill nav's mobile dropdown toggle.
  function initMegHeader() {
    var toggle = document.getElementById('megNavToggle');
    var nav = document.getElementById('megNav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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

  // Mighty Warners MEG home page — hero banner background slider. The
  // headline/search/stats overlay stays fixed; only the background photo
  // crossfades between slides, and the existing pill dots (bottom-right)
  // become slick's own dots so they're real, clickable slide controls.
  function initMegHeroSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-meg-hero-slider]');
    if (!$slider.length) return;

    $slider.slick({
      fade: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 6000,
      pauseOnHover: false,
      speed: 900,
      cssEase: 'ease-in-out',
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: true,
      appendDots: $('.meg-hero__dots')
    });
  }

  // Mighty Warners MEG home page — services/jobs/testimonials/blog card
  // sliders. Each [data-meg-slider] grid shows all its cards side by side at
  // desktop widths (matching the Figma layout exactly — slidesToShow equals
  // the card count there) and becomes a swipeable slick carousel as the
  // viewport narrows, so touch devices get sliding instead of a tall stack.
  function initMegSliders() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    // slidesToShow deliberately stays below each section's card count through
    // the common desktop range (not just tablet/mobile) so the prev/next
    // arrows are always live and clickable, not just decorative — only very
    // wide screens show every card at once, matching the Figma layout there.
    var configs = {
      // Right-bleed "peek" carousel: cards keep their own CSS width
      // (.meg-slider--bleed-right .meg-service-card) instead of slick
      // dividing the track into slidesToShow equal slots, so however many
      // fit shows and the next one is cut off at the browser edge.
      services: {
        variableWidth: true,
        slidesToShow: 1
      },
      jobs: {
        slidesToShow: 3,
        responsive: [
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      },
      testimonials: {
        slidesToShow: 2,
        responsive: [
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      },
      blog: {
        slidesToShow: 3,
        responsive: [
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      }
    };

    $('[data-meg-slider]').each(function () {
      var $grid = $(this);
      var key = $grid.attr('data-meg-slider');
      var config = configs[key];
      if (!config) return;

      var $nav = $grid.closest('.meg-slider').next('.meg-slider-nav');
      var $prev = $nav.find('.meg-slider-arrow--prev');
      var $next = $nav.find('.meg-slider-arrow--next');

      $grid.slick($.extend({
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4500,
        pauseOnHover: true,
        pauseOnFocus: true,
        arrows: false,
        dots: false,
        speed: 450,
        cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }, config));

      $prev.on('click', function () { $grid.slick('slickPrev'); });
      $next.on('click', function () { $grid.slick('slickNext'); });

      function syncArrows() {
        var opts = $grid.slick('getSlick');
        var atStart = !opts.options.infinite && opts.currentSlide === 0;
        var atEnd = !opts.options.infinite && opts.currentSlide >= opts.slideCount - opts.options.slidesToShow;
        $prev.prop('disabled', atStart);
        $next.prop('disabled', atEnd);
      }

      $grid.on('afterChange init', syncArrows);
      syncArrows();
    });
  }

  // Header scroll state
  function initHeaderScroll() {
    var header = document.querySelector('header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Mobile nav drawer — Bootstrap Offcanvas handles open/close, backdrop,
  // Esc-to-close and body scroll lock; we only need to keep the trigger
  // buttons' aria-expanded and close-on-link-click behavior in sync.
  function initMobileNav() {
    var nav = document.querySelector('#mobile-nav.offcanvas');
    if (!nav || typeof bootstrap === 'undefined') return;

    var triggers = document.querySelectorAll('[data-bs-target="#mobile-nav"]');
    var offcanvas = bootstrap.Offcanvas.getOrCreateInstance(nav);

    nav.addEventListener('show.bs.offcanvas', function () {
      triggers.forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
    });

    nav.addEventListener('hidden.bs.offcanvas', function () {
      triggers.forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
    });

    nav.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        offcanvas.hide();
      });
    });
  }

  // Generic pill / tab groups — toggles .is-active, and optionally filters
  // sibling cards when buttons carry [data-filter] and cards carry [data-category].
  function initTabGroups() {
    document.querySelectorAll('[data-tab-group]').forEach(function (group) {
      var buttons = group.querySelectorAll('[data-tab]');

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');

          var filter = btn.getAttribute('data-filter');
          var targetSel = group.getAttribute('data-filter-target');
          var filterRoot = targetSel ? document.querySelector(targetSel) : null;
          if (!filter || !filterRoot) return;

          filterRoot.querySelectorAll('[data-category]').forEach(function (card) {
            var match = filter === 'all' || card.getAttribute('data-category') === filter;
            card.hidden = !match;
          });
        });
      });
    });
  }

  // Profile dashboard — wishlist "remove" heart buttons and saved-search
  // delete buttons both just remove their own card/row (demo-only, same
  // no-backend pattern as initProjectSaves above).
  function initDashboardRemovable() {
    document.querySelectorAll('[data-remove-item]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var item = btn.closest('.mw-dubai-card, .mw-dashboard__search-row');
        if (item) item.remove();
      });
    });
  }

  // Sticky sidebars ([data-sticky-sidebar]: blog-details "Recent Blogs"
  // aside, profile dashboard nav) — same JS-toggled position: fixed
  // technique as initStickyPropertyTabsBar above and for the same reason
  // (html/body only declare overflow-x: hidden in _reset.scss, which per
  // spec forces their overflow-y to compute as auto rather than visible,
  // making them scroll containers that break CSS position: sticky against
  // the real viewport). Parks at the bottom of the flex row (via
  // position: absolute) once the row's shorter, main content column
  // finishes scrolling past, so it never overlaps the footer.
  function initStickySidebars() {
    document.querySelectorAll('[data-sticky-sidebar]').forEach(function (aside) {
      var layout = aside.parentElement;
      var header = document.querySelector('header');
      if (!layout) return;

      var spacer = document.createElement('div');
      spacer.hidden = true;
      aside.insertAdjacentElement('afterend', spacer);

      var rect = aside.getBoundingClientRect();
      var layoutRectInit = layout.getBoundingClientRect();
      var naturalTop = rect.top + window.pageYOffset;
      var naturalWidth = rect.width;
      // Anchored to the aside's own natural position, not a hardcoded
      // edge — it works whether the aside is the first (left, e.g. the
      // profile dashboard nav) or last (right, e.g. the blog "Recent
      // Blogs" panel) column in its flex row.
      var naturalLeft = rect.left;
      var parkedLeft = rect.left - layoutRectInit.left;
      var ticking = false;

      function clearInlineStyles() {
        aside.classList.remove('is-stuck', 'is-parked');
        aside.style.position = '';
        aside.style.top = '';
        aside.style.bottom = '';
        aside.style.left = '';
        aside.style.right = '';
        aside.style.width = '';
        spacer.hidden = true;
      }

      function update() {
        ticking = false;

        if (!window.matchMedia('(min-width: 992px)').matches) {
          clearInlineStyles();
          return;
        }

        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var stickTop = headerHeight + 24;

        if (window.pageYOffset + stickTop < naturalTop) {
          clearInlineStyles();
          return;
        }

        var asideHeight = aside.getBoundingClientRect().height;
        spacer.hidden = false;
        spacer.style.height = asideHeight + 'px';
        // Also reserve the aside's width in the flex row — otherwise the
        // sibling content column (flex-grow: 1) expands to fill the space
        // the instant the aside leaves flow, causing a visible reflow/jump.
        spacer.style.width = naturalWidth + 'px';
        spacer.style.flex = '0 0 auto';

        var layoutRect = layout.getBoundingClientRect();

        if (layoutRect.bottom <= stickTop + asideHeight) {
          aside.classList.remove('is-stuck');
          aside.classList.add('is-parked');
          aside.style.position = 'absolute';
          aside.style.top = 'auto';
          aside.style.bottom = '0';
          aside.style.left = parkedLeft + 'px';
          aside.style.right = 'auto';
          aside.style.width = naturalWidth + 'px';
        } else {
          aside.classList.remove('is-parked');
          aside.classList.add('is-stuck');
          aside.style.position = 'fixed';
          aside.style.top = stickTop + 'px';
          aside.style.bottom = '';
          aside.style.left = naturalLeft + 'px';
          aside.style.right = 'auto';
          aside.style.width = naturalWidth + 'px';
        }
      }

      function requestUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
      update();
    });
  }

  function initPillTabDropdowns() {
    document.querySelectorAll('.mw-pill-tabs').forEach(function (group) {
      if (group.querySelector('[data-pill-toggle]')) return;

      var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-tab]'));
      if (!buttons.length) return;

      var menu = document.createElement('div');
      menu.className = 'mw-pill-tabs__menu';
      buttons.forEach(function (btn) {
        menu.appendChild(btn);
      });

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mw-pill-tabs__toggle';
      toggle.setAttribute('data-pill-toggle', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'listbox');

      function activeLabel() {
        var active = group.querySelector('[data-tab].is-active');
        return active ? active.textContent.trim() : 'Select';
      }

      function syncToggle() {
        toggle.innerHTML = activeLabel() +
          '<img src="assets/images/icons/chevron-down.svg" alt="" width="14" height="14">';
      }

      function close() {
        group.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }

      group.appendChild(toggle);
      group.appendChild(menu);
      syncToggle();

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = group.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          syncToggle();
          close();
        });
      });
    });

    document.addEventListener('click', function (e) {
      document.querySelectorAll('.mw-pill-tabs.is-open').forEach(function (group) {
        if (!group.contains(e.target)) {
          group.classList.remove('is-open');
          var toggle = group.querySelector('[data-pill-toggle]');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.mw-pill-tabs.is-open').forEach(function (group) {
        group.classList.remove('is-open');
        var toggle = group.querySelector('[data-pill-toggle]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initCommunityPanels() {
    var saleGrid = document.querySelector('#communities .mw-communities__grid[data-category="for-sale"]');
    var wrap = document.getElementById('communities-panels');
    if (!saleGrid || !wrap) return;
    if (wrap.querySelectorAll('[data-category]').length > 1) return;

    ['for-rent', 'off-plan'].forEach(function (cat) {
      var clone = saleGrid.cloneNode(true);
      clone.setAttribute('data-category', cat);
      clone.hidden = true;
      wrap.appendChild(clone);
    });
  }

  // Generic horizontal carousel: [data-carousel] > [data-carousel-track] > items,
  // with optional [data-carousel-prev] / [data-carousel-next] / [data-carousel-dots].
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('[data-carousel-track]');
      if (!track) return;

      var prev = root.querySelector('[data-carousel-prev]');
      var next = root.querySelector('[data-carousel-next]');
      var dotsWrap = root.querySelector('[data-carousel-dots]');
      var items = Array.prototype.slice.call(track.children);

      function step() {
        var item = track.querySelector(':scope > *');
        return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      }

      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -step(), behavior: 'smooth' });
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: step(), behavior: 'smooth' });
        });
      }

      if (dotsWrap && items.length) {
        items.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          if (i === 0) dot.classList.add('is-active');
          dot.addEventListener('click', function () {
            items[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
          });
          dotsWrap.appendChild(dot);
        });

        var dots = Array.prototype.slice.call(dotsWrap.children);
        var syncTimer = null;
        track.addEventListener('scroll', function () {
          clearTimeout(syncTimer);
          syncTimer = setTimeout(function () {
            var trackLeft = track.getBoundingClientRect().left;
            var closest = 0;
            var closestDist = Infinity;
            items.forEach(function (item, i) {
              var dist = Math.abs(item.getBoundingClientRect().left - trackLeft);
              if (dist < closestDist) {
                closestDist = dist;
                closest = i;
              }
            });
            dots.forEach(function (d, i) { d.classList.toggle('is-active', i === closest); });
          }, 100);
        }, { passive: true });
      }
    });
  }

  // Newsletter / contact / search forms — static build, just acknowledge submission
  function initForms() {
    document.querySelectorAll('.mw-footer__newsletter-form, .mw-property-enquiry__form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.reset();
      });
    });

    document.querySelectorAll('.mw-hero__search, .mw-contact__form, .mw-page-contact__form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
      });
    });
  }

  // Dropdown menus — header lang/currency switcher and the hero "Property Type" field.
  // A [data-dropdown] is either the trigger itself or wraps a [data-dropdown-trigger]
  // plus a [data-dropdown-menu] list of [data-dropdown-option] buttons.
  // ENG / عربي language switcher — toggles the `.is-rtl` class (see
  // _direction.scss) to mirror text alignment for an Arabic preview.
  // Deliberately does NOT set the `dir="rtl"` HTML attribute (or the CSS
  // `direction` property) on <html>: either one makes the browser itself
  // auto-mirror every flex/grid container's main axis, which is what
  // caused the widespread overlap/collision bugs across cards, the
  // header, and the footer when this previously flipped `dir`. Content is
  // still English throughout (no Arabic translations exist), so genuine
  // bidi mirroring was never actually wanted — only the right-aligned
  // reading-copy preview `.is-rtl` provides.
  function initLanguageSwitch() {
    document.querySelectorAll('.mw-header__lang').forEach(function (trigger) {
      var dropdown = trigger.closest('[data-dropdown]');
      if (!dropdown) return;
      dropdown.querySelectorAll('[data-dropdown-option]').forEach(function (option) {
        option.addEventListener('click', function () {
          var isArabic = option.textContent.trim() === 'عربي';
          document.documentElement.classList.toggle('is-rtl', isArabic);
          document.documentElement.setAttribute('lang', isArabic ? 'ar' : 'en');
        });
      });
    });
  }

  function initDropdowns() {
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

    function close(dropdown) {
      dropdown.classList.remove('is-open');
      var trigger = dropdown.hasAttribute('data-dropdown-trigger') ? dropdown : dropdown.querySelector('[data-dropdown-trigger]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function closeAll(except) {
      dropdowns.forEach(function (d) {
        if (d !== except) close(d);
      });
    }

    dropdowns.forEach(function (dropdown) {
      var trigger = dropdown.hasAttribute('data-dropdown-trigger') ? dropdown : dropdown.querySelector('[data-dropdown-trigger]');
      var menu = dropdown.querySelector('[data-dropdown-menu]');
      if (!trigger || !menu) return;

      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      function toggle(e) {
        e.stopPropagation();
        var willOpen = !dropdown.classList.contains('is-open');
        closeAll(dropdown);
        dropdown.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      }

      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(e);
        }
      });

      menu.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      menu.addEventListener('mousedown', function (e) {
        e.stopPropagation();
      });

      menu.querySelectorAll('[data-dropdown-option]').forEach(function (option) {
        option.addEventListener('click', function (e) {
          e.stopPropagation();
          var label = dropdown.querySelector('[data-dropdown-label]');
          if (label) label.textContent = option.textContent.trim();
          menu.querySelectorAll('[data-dropdown-option]').forEach(function (o) { o.classList.remove('is-selected'); });
          option.classList.add('is-selected');
          close(dropdown);
        });
      });
    });

    if (dropdowns.length) {
      document.addEventListener('click', function () { closeAll(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAll();
      });
    }
  }

  function formatAed(value) {
    var n = Number(value);
    if (n >= 1000000) {
      var millions = n / 1000000;
      return 'AED ' + (millions % 1 === 0 ? millions : millions.toFixed(1)) + 'M';
    }
    if (n >= 1000) {
      return 'AED ' + Math.round(n / 1000) + 'K';
    }
    return 'AED ' + n;
  }

  function parseAed(str) {
    var raw = String(str || '').trim().toUpperCase().replace(/AED/g, '').replace(/,/g, '').replace(/\s/g, '');
    if (!raw) return NaN;
    var mult = 1;
    if (raw.charAt(raw.length - 1) === 'M') {
      mult = 1000000;
      raw = raw.slice(0, -1);
    } else if (raw.charAt(raw.length - 1) === 'K') {
      mult = 1000;
      raw = raw.slice(0, -1);
    }
    var n = parseFloat(raw);
    return isNaN(n) ? NaN : Math.round(n * mult);
  }

  function initPriceRange() {
    document.querySelectorAll('[data-price-slider]').forEach(function (root) {
      var minInput = root.querySelector('[data-price-min]');
      var maxInput = root.querySelector('[data-price-max]');
      var fill = root.querySelector('[data-price-range]');
      var wrap = root.closest('[data-dropdown]');
      if (!minInput || !maxInput || !wrap) return;

      var minText = wrap.querySelector('[data-price-min-input]');
      var maxText = wrap.querySelector('[data-price-max-input]');
      var fieldLabel = wrap.querySelector('[data-dropdown-label]');
      var presets = Array.prototype.slice.call(wrap.querySelectorAll('[data-price-preset]'));
      var absMin = Number(minInput.min);
      var absMax = Number(minInput.max);
      var step = Number(minInput.step) || 1;

      function clamp(value, min, max) {
        var snapped = Math.round(value / step) * step;
        return Math.max(min, Math.min(max, snapped));
      }

      function sync(fromPreset) {
        var min = Number(minInput.value);
        var max = Number(maxInput.value);
        if (min > max) {
          minInput.value = max;
          min = max;
        }

        var span = absMax - absMin || 1;
        var start = ((min - absMin) / span) * 100;
        var end = ((max - absMin) / span) * 100;
        if (fill) {
          fill.style.left = start + '%';
          fill.style.width = (end - start) + '%';
        }
        if (minText && document.activeElement !== minText) minText.value = formatAed(min);
        if (maxText && document.activeElement !== maxText) maxText.value = formatAed(max);
        if (fieldLabel) {
          fieldLabel.textContent = (min <= absMin && max >= absMax)
            ? 'Price Range'
            : formatAed(min) + ' – ' + formatAed(max);
        }

        if (!fromPreset) {
          presets.forEach(function (btn) {
            var matches = Number(btn.getAttribute('data-min')) === min && Number(btn.getAttribute('data-max')) === max;
            btn.classList.toggle('is-selected', matches);
          });
        }
      }

      function applyTyped(which) {
        var field = which === 'min' ? minText : maxText;
        if (!field) return;
        var parsed = parseAed(field.value);
        if (isNaN(parsed)) {
          sync(false);
          return;
        }
        if (which === 'min') {
          minInput.value = clamp(parsed, absMin, Number(maxInput.value));
        } else {
          maxInput.value = clamp(parsed, Number(minInput.value), absMax);
        }
        sync(false);
      }

      minInput.addEventListener('input', function () { sync(false); });
      maxInput.addEventListener('input', function () { sync(false); });

      [minText, maxText].forEach(function (field, index) {
        if (!field) return;
        var which = index === 0 ? 'min' : 'max';
        field.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyTyped(which);
            field.blur();
          }
        });
        field.addEventListener('blur', function () { applyTyped(which); });
      });

      presets.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          minInput.value = btn.getAttribute('data-min');
          maxInput.value = btn.getAttribute('data-max');
          presets.forEach(function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          sync(true);
        });
      });

      sync(false);
    });
  }

  function initCardGalleries() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-card-gallery]').forEach(function (root, galleryIndex) {
      var track = root.querySelector('[data-gallery-track]');
      if (!track) return;

      var slides = Array.prototype.slice.call(track.children);
      if (!slides.length) return;

      var prev = root.querySelector('[data-gallery-prev]');
      var next = root.querySelector('[data-gallery-next]');
      var dotsWrap = root.querySelector('[data-gallery-dots]');
      var countEl = root.querySelector('[data-gallery-count]');
      var index = 0;
      var startX = 0;
      var timer = null;
      var delay = 3500 + (galleryIndex % 4) * 400;

      if (countEl) countEl.textContent = String(slides.length);

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        if (!dotsWrap) return;
        Array.prototype.forEach.call(dotsWrap.children, function (dot, n) {
          dot.classList.toggle('is-active', n === index);
        });
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function play() {
        stop();
        if (reduceMotion || slides.length < 2) return;
        timer = setInterval(function () {
          go(index + 1);
        }, delay);
      }

      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
          if (i === 0) dot.classList.add('is-active');
          dot.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            go(i);
            play();
          });
          dotsWrap.appendChild(dot);
        });
      }

      if (prev) {
        prev.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          go(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          go(index + 1);
          play();
        });
      }

      root.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button, a')) return;
        startX = e.clientX;
        stop();
      });

      root.addEventListener('pointerup', function (e) {
        if (e.target.closest('button, a')) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) >= 40) go(index + (dx < 0 ? 1 : -1));
        play();
      });

      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', play);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', function () {
        if (!root.contains(document.activeElement)) play();
      });

      go(0);
      play();
    });
  }

  function initPopularPlacesSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-places-slider]');
    if (!$slider.length) return;

    $slider.slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: false,
      dots: false,
      speed: 450,
      cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
      responsive: [
        {
          breakpoint: 1201,
          settings: { slidesToShow: 3 }
        },
        {
          // Slick matches `window.innerWidth < breakpoint` — a bare 768
          // misses devices whose width is exactly 768px (iPad portrait).
          breakpoint: 769,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });

    $('[data-places-prev]').on('click', function () {
      $slider.slick('slickPrev');
    });

    $('[data-places-next]').on('click', function () {
      $slider.slick('slickNext');
    });
  }

  function initListingSlider($slider, prevSel, nextSel, desktopSlides) {
    if (!$slider.length || $slider.hasClass('slick-initialized')) return;

    desktopSlides = desktopSlides || 4;

    if ($slider.children().length <= 4) {
      $slider.append($slider.children().clone());
    }

    $slider.slick({
      slidesToShow: desktopSlides,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: false,
      dots: false,
      speed: 450,
      cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
      responsive: [
        {
          // The page's .container-ctn caps out at 1480px (min(1200){...}),
          // so it doesn't actually reach that full width until the
          // viewport is comfortably past it — below ~1560px the container
          // is still narrower than 1480px, and forcing a 4th slide into
          // that shrinking width is what was squeezing card content
          // (price text overflowing its own card) in the 1200–1560 range.
          breakpoint: 1561,
          settings: { slidesToShow: Math.min(3, desktopSlides) }
        },
        {
          breakpoint: 993,
          settings: { slidesToShow: Math.min(2, desktopSlides) }
        },
        {
          // Slick's own breakpoint check is `window.innerWidth < breakpoint`
          // (strictly less-than), so a plain `768` here would NOT match a
          // device whose width is exactly 768px (e.g. iPad portrait) — it'd
          // fall through to the 993 tier above instead. +1 makes it match.
          breakpoint: 769,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });

    var $section = $slider.closest('section');
    $section.find(prevSel).on('click', function () {
      $slider.slick('slickPrev');
    });

    $section.find(nextSel).on('click', function () {
      $slider.slick('slickNext');
    });

    window.jQuery(window).on('load', function () {
      $slider.slick('setPosition');
    });
  }

  function initRealtySlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    $('[data-realty-slider]').each(function () {
      initListingSlider($(this), '[data-realty-prev]', '[data-realty-next]');
    });
    $('[data-agent-listings-slider]').each(function () {
      initListingSlider($(this), '[data-agent-listings-prev]', '[data-agent-listings-next]');
    });
    $('[data-agency-properties-slider]').each(function () {
      initListingSlider($(this), '[data-agency-properties-prev]', '[data-agency-properties-next]', 4);
    });
    $('[data-agency-agents-slider]').each(function () {
      initListingSlider($(this), '[data-agency-agents-prev]', '[data-agency-agents-next]', 3);
    });
    $('[data-property-gallery-slider]').each(function () {
      initListingSlider($(this), '[data-property-gallery-prev]', '[data-property-gallery-next]', 3);
    });
    $('[data-similar-properties-slider]').each(function () {
      initListingSlider($(this), '[data-similar-properties-prev]', '[data-similar-properties-next]');
    });
  }

  function initAgentDetailTabs() {
    var root = document.querySelector('[data-agent-tabs]');
    if (!root) return;

    var buttons = root.querySelectorAll('[data-agent-tab]');
    var panels = document.querySelectorAll('[data-agent-panel]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-agent-tab');
        buttons.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-agent-panel') !== id;
        });
      });
    });
  }

  function initHighlightSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    $('[data-highlight-slider]').each(function () {
      var $slider = $(this);
      if ($slider.hasClass('slick-initialized')) return;

      if ($slider.children().length <= 4) {
        $slider.append($slider.children().clone());
      }

      $slider.on('init setPosition', function () {
        $slider.find('.slick-list, .slick-track, .slick-slide, .slick-slide > div').css('height', 'auto');
      });

      $slider.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        pauseOnFocus: true,
        arrows: false,
        dots: false,
        adaptiveHeight: false,
        speed: 450,
        cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
        responsive: [
          {
            breakpoint: 1201,
            settings: { slidesToShow: 3 }
          },
          {
            breakpoint: 993,
            settings: { slidesToShow: 2 }
          },
          {
            // Slick matches `window.innerWidth < breakpoint` — a bare 768
            // misses devices whose width is exactly 768px (iPad portrait).
            breakpoint: 769,
            settings: {
              slidesToShow: 1,
              centerMode: false
            }
          }
        ]
      });

      var $section = $slider.closest('.mw-highlight');
      $section.find('[data-highlight-prev]').on('click', function () {
        $slider.slick('slickPrev');
      });
      $section.find('[data-highlight-next]').on('click', function () {
        $slider.slick('slickNext');
      });

      $(window).on('load', function () {
        $slider.slick('setPosition');
      });
    });
  }

  function initProjectsSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-projects-slider]');
    if (!$slider.length) return;

    var mq = window.matchMedia('(max-width: 767px)');

    function activeFilter() {
      var btn = document.querySelector('[data-filter-target="#projects-grid"] [data-tab].is-active');
      return btn ? btn.getAttribute('data-filter') : 'all';
    }

    function applyFilter() {
      if (!$slider.hasClass('slick-initialized')) return;
      var filter = activeFilter();
      $slider.slick('slickUnfilter');
      if (filter && filter !== 'all') {
        $slider.slick('slickFilter', '[data-category="' + filter + '"]');
      }
      $slider.slick('slickGoTo', 0, true);
      $slider.slick('setPosition');
    }

    function mount() {
      if (mq.matches) {
        if ($slider.hasClass('slick-initialized')) {
          applyFilter();
          return;
        }

        $slider.slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          autoplay: true,
          autoplaySpeed: 4000,
          pauseOnHover: true,
          pauseOnFocus: true,
          arrows: false,
          dots: true,
          adaptiveHeight: true,
          speed: 450,
          cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)'
        });

        applyFilter();
        return;
      }

      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
    }

    mount();

    if (mq.addEventListener) {
      mq.addEventListener('change', mount);
    } else if (mq.addListener) {
      mq.addListener(mount);
    }

    document.querySelectorAll('[data-filter-target="#projects-grid"] [data-tab]').forEach(function (btn) {
      btn.addEventListener('click', applyFilter);
    });
  }

  function initLuxurySlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-luxury-slider]');
    if (!$slider.length) return;

    var mq = window.matchMedia('(max-width: 991px)');
    var $section = $slider.closest('.mw-luxury');

    function bindNav() {
      $section.find('[data-luxury-prev]').off('click.luxury').on('click.luxury', function () {
        $slider.slick('slickPrev');
      });
      $section.find('[data-luxury-next]').off('click.luxury').on('click.luxury', function () {
        $slider.slick('slickNext');
      });
    }

    function mount() {
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }

      var mobile = mq.matches;
      $slider.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4500,
        pauseOnHover: true,
        pauseOnFocus: true,
        arrows: false,
        dots: false,
        variableWidth: !mobile,
        swipeToSlide: true,
        adaptiveHeight: false,
        speed: 450,
        cssEase: 'ease'
      });

      bindNav();
    }

    mount();

    if (mq.addEventListener) {
      mq.addEventListener('change', mount);
    } else if (mq.addListener) {
      mq.addListener(mount);
    }

    $(window).on('load', function () {
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('setPosition');
      }
    });
  }

  function initTestimonialsSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-testimonials-slider]');
    if (!$slider.length) return;

    var $section = $slider.closest('.mw-testimonials');
    var pageCount = 3;

    function pauseVideos() {
      $slider.find('video').each(function () {
        this.pause();
        var card = this.closest('.mw-testimonials__card');
        if (card) {
          card.classList.remove('is-playing');
          syncPlayLabel(card, false);
        }
      });
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('slickPlay');
      }
    }

    function syncPlayLabel(card, playing) {
      var btn = card.querySelector('.mw-testimonials__play');
      var nameEl = card.querySelector('.mw-testimonials__name');
      if (!btn) return;
      var who = nameEl ? nameEl.textContent.trim() : 'video';
      btn.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + who + "'s video testimonial");
    }

    if ($slider.children().length <= 4) {
      $slider.append($slider.children().clone(true));
    }

    $slider.slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 6000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: false,
      dots: false,
      speed: 450,
      cssEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
      responsive: [
        {
          breakpoint: 1201,
          settings: { slidesToShow: 3 }
        },
        {
          breakpoint: 993,
          settings: { slidesToShow: 2 }
        },
        {
          // Slick matches `window.innerWidth < breakpoint` (strict), so
          // +1 ensures a device at exactly the round-number width still
          // gets this tier instead of falling through to the one above.
          breakpoint: 577,
          settings: { slidesToShow: 1 }
        }
      ]
    });

    $section.find('[data-testimonials-prev]').on('click', function (e) {
      e.preventDefault();
      $slider.slick('slickPrev');
    });

    $section.find('[data-testimonials-next]').on('click', function (e) {
      e.preventDefault();
      $slider.slick('slickNext');
    });

    var $dots = $section.find('[data-testimonials-dots]');
    if ($dots.length) {
      for (var i = 0; i < pageCount; i += 1) {
        (function (index) {
          var $btn = $('<button type="button"></button>');
          $btn.attr('aria-label', 'Go to testimonials page ' + (index + 1));
          if (index === 0) $btn.addClass('is-active');
          $btn.on('click', function () {
            $slider.slick('slickGoTo', index);
          });
          $dots.append($btn);
        })(i);
      }
    }

    $slider.on('afterChange', function (event, slick, current) {
      var page = current % pageCount;
      $dots.children().removeClass('is-active').eq(page).addClass('is-active');
      pauseVideos();
    });

    $slider.on('click', '.mw-testimonials__play', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var card = this.closest('.mw-testimonials__card--video');
      if (!card) return;
      var video = card.querySelector('video');
      if (!video) return;

      if (card.classList.contains('is-playing') && !video.paused) {
        video.pause();
        card.classList.remove('is-playing');
        syncPlayLabel(card, false);
        if ($slider.hasClass('slick-initialized')) {
          $slider.slick('slickPlay');
        }
        return;
      }

      pauseVideos();

      if (!video.currentSrc) {
        var source = video.querySelector('source');
        if (source && source.getAttribute('src')) {
          video.src = source.getAttribute('src');
        }
      }

      if (!video.currentSrc) return;

      $slider.slick('slickPause');

      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          card.classList.add('is-playing');
          syncPlayLabel(card, true);
        }).catch(function () {});
      } else {
        card.classList.add('is-playing');
        syncPlayLabel(card, true);
      }
    });

    $slider.on('click', '.mw-testimonials__video', function () {
      var card = this.closest('.mw-testimonials__card--video');
      if (!card || !card.classList.contains('is-playing')) return;
      this.pause();
      card.classList.remove('is-playing');
      syncPlayLabel(card, false);
    });

    $slider.on('ended', 'video', function () {
      var card = this.closest('.mw-testimonials__card');
      if (card) {
        card.classList.remove('is-playing');
        syncPlayLabel(card, false);
      }
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('slickPlay');
      }
    });

    $(window).on('load', function () {
      $slider.slick('setPosition');
    });
  }

  function initDiversityVideo() {
    var section = document.querySelector('[data-video-expand]');
    if (!section) return function () {};

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var media = section.querySelector('.mw-about-diversity__media');
    var video = section.querySelector('.mw-about-diversity__video');
    var btn = section.querySelector('.mw-about-diversity__play');
    var userPaused = false;

    function updateZoom() {
      if (!media) return;
      if (reduce || window.innerWidth < 1200) {
        media.style.setProperty('--about-hero-media-width', '100%');
        media.style.setProperty('--about-hero-video-scale', '1');
        return;
      }

      var container = media.closest('.container-ctn');
      var rect = media.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var start = viewport * 0.78;
      var end = viewport * 0;
      var progress = (start - rect.top) / Math.max(1, start - end);
      progress = Math.max(0, Math.min(1, progress));
      var eased = progress * progress * (3 - 2 * progress);
      var baseWidth = container ? container.getBoundingClientRect().width : media.offsetWidth;
      var targetWidth = window.innerWidth || document.documentElement.clientWidth;
      var width = baseWidth + ((targetWidth - baseWidth) * eased);
      var scale = 1 + (eased * 0.12);

      media.style.setProperty('--about-hero-media-width', width + 'px');
      media.style.setProperty('--about-hero-video-scale', String(scale));
    }

    function syncState() {
      if (!video || !media || !btn) return;
      var playing = !video.paused;
      media.classList.toggle('is-playing', playing);
      media.classList.toggle('is-paused', userPaused);
      btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }

    function toggleVideo(e) {
      if (e) e.preventDefault();
      if (!video) return;
      if (video.paused) {
        userPaused = false;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
      } else {
        userPaused = true;
        video.pause();
      }
      syncState();
    }

    if (video) {
      video.muted = true;
      video.setAttribute('muted', '');
      var tryPlay = function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
      };
      tryPlay();
      video.addEventListener('play', syncState);
      video.addEventListener('pause', syncState);
      video.addEventListener('canplay', function () {
        if (!userPaused) tryPlay();
      });

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (userPaused) return;
            if (entry.isIntersecting) tryPlay();
            else video.pause();
          });
        }, { threshold: 0.15 });
        io.observe(media);
      }
    }

    if (btn) btn.addEventListener('click', toggleVideo);
    if (media) {
      media.addEventListener('click', function (e) {
        if (e.target.closest('.mw-about-diversity__play')) return;
        toggleVideo(e);
      });
    }

    syncState();
    updateZoom();
    return updateZoom;
  }

  function initAboutPage() {
    if (!document.body.classList.contains('about-page') && !document.body.classList.contains('contact-page') && !document.body.classList.contains('agents-page')) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var progress = document.querySelector('.mw-about-progress span');
    var parallaxEls = document.querySelectorAll('[data-parallax]');
    var ticking = false;
    var updateDiversity = initDiversityVideo();

    function updateProgress() {
      if (!progress) return;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      progress.style.width = pct + '%';
    }

    function updateParallax() {
      if (reduce || !parallaxEls.length) return;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.16;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var y = ((rect.top + rect.height / 2) - vh / 2) * speed * -0.35;
        el.style.transform = 'translate3d(0, ' + y.toFixed(1) + 'px, 0) scale(1.12)';
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateProgress();
        updateParallax();
        updateDiversity();
        ticking = false;
      });
    }

    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        io.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('is-inview');
      });
    }

    updateProgress();
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function initAboutBuildersSlider() {
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.slick !== 'function') return;

    var $ = window.jQuery;
    var $slider = $('[data-builders-slider]');
    if (!$slider.length) return;

    $slider.slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 0,
      speed: 4000,
      cssEase: 'linear',
      arrows: false,
      dots: false,
      pauseOnHover: false,
      pauseOnFocus: false,
      swipe: false,
      draggable: false,
      variableWidth: true
    });
  }

  function initPricingCycle() {
    var root = document.querySelector('[data-pricing-cycle]');
    if (!root) return;

    var buttons = root.querySelectorAll('[data-cycle]');
    var amounts = document.querySelectorAll('[data-price-monthly]');
    var notes = document.querySelectorAll('[data-billed-yearly]');

    function applyCycle(cycle) {
      buttons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-cycle') === cycle);
      });

      amounts.forEach(function (el) {
        var next = cycle === 'yearly' ? el.getAttribute('data-price-yearly') : el.getAttribute('data-price-monthly');
        if (next) el.textContent = next;
      });

      notes.forEach(function (el) {
        el.hidden = cycle !== 'yearly';
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyCycle(btn.getAttribute('data-cycle') || 'monthly');
      });
    });
  }

  function initProjectSaves() {
    document.querySelectorAll('.mw-projects__save, .mw-luxury__save, .mw-realty__save, .mw-highlight__save, .mw-agent-prop__save, .mw-dubai-card__fav').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var saved = btn.classList.toggle('is-saved');
        btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      });
    });
  }

  // Agencies listing page — grid/list view toggle and static pagination
  // (demo-only: no real filtering/paging, matches the other static
  // interactions in this file such as initTabGroups).
  function initAgenciesPage() {
    var grid = document.querySelector('[data-agencies-grid]');

    document.querySelectorAll('[data-agencies-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-agencies-view');
        document.querySelectorAll('[data-agencies-view]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        if (grid) grid.classList.toggle('is-list-view', view === 'list');
      });
    });

    var pagination = document.querySelector('[data-agencies-pagination]');
    if (!pagination) return;

    pagination.querySelectorAll('[data-agencies-page]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var page = btn.getAttribute('data-agencies-page');
        if (page === 'prev' || page === 'next') return;
        pagination.querySelectorAll('[data-agencies-page]').forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
      });
    });
  }

  // properties-dubai.html grid/list view toggle — same mechanism as
  // initAgenciesPage's view switch above, keyed to its own data attributes
  // since it's a separate grid with no pagination logic to share.
  function initPropertiesView() {
    var grid = document.querySelector('[data-properties-grid]');
    if (!grid) return;

    document.querySelectorAll('[data-properties-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-properties-view');
        document.querySelectorAll('[data-properties-view]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        grid.classList.toggle('is-list-view', view === 'list');
      });
    });
  }

  function initBottomNav() {
    var nav = document.querySelector('.mw-bottom-nav');
    if (!nav) return;

    var items = nav.querySelectorAll('.mw-bottom-nav__item');

    nav.addEventListener('click', function (e) {
      var item = e.target.closest('.mw-bottom-nav__item');
      if (!item) return;
      items.forEach(function (el) {
        el.classList.remove('is-active');
      });
      item.classList.add('is-active');
    });
  }

  // Generic Fancybox binding — any element with [data-fancybox] anywhere on
  // the site gets lightbox behavior for free; grouping is via the
  // attribute's value (e.g. data-fancybox="property-gallery"), same as
  // Fancybox's own convention. No-op if the Fancybox script isn't loaded on
  // a given page.
  // Property Details section nav (Overview / Features & Amenities / Floor
  // Plans / Near By / Gallery) — NOT a show/hide tab panel: every section
  // stays on the page, and clicking a link (or picking the mobile <select>
  // equivalent) just smooth-scrolls to it. The bar itself is pinned via
  // initStickyPropertyTabsBar() below, so this also runs a lightweight
  // scrollspy to keep the current section's link highlighted while the
  // page scrolls.
  function initPropertyTabs() {
    var tabs = document.querySelectorAll('[data-property-tab]');
    var panels = document.querySelectorAll('[data-property-panel]');
    var select = document.querySelector('[data-property-tabs-select]');
    if (!tabs.length || !panels.length) return;

    function setActive(id) {
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute('data-property-tab') === id;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (select && select.value !== id) select.value = id;
    }

    function scrollToPanel(id) {
      var panel = document.querySelector('[data-property-panel="' + id + '"]');
      var bar = document.querySelector('[data-property-tabs-bar]');
      var header = document.querySelector('header');
      if (!panel) return;

      var barHeight = bar ? bar.getBoundingClientRect().height : 0;
      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var targetY = panel.getBoundingClientRect().top + window.pageYOffset - barHeight - headerHeight - 16;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        setActive(tab.getAttribute('data-property-tab'));
        scrollToPanel(tab.getAttribute('data-property-tab'));
      });
    });

    if (select) {
      select.addEventListener('change', function () {
        setActive(select.value);
        scrollToPanel(select.value);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActive(entry.target.getAttribute('data-property-panel'));
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      panels.forEach(function (panel) {
        observer.observe(panel);
      });
    }
  }

  // Pins the Property Details tabs bar (desktop nav / mobile <select>, both
  // live inside [data-property-tabs-bar]) below the fixed site header once
  // scrolled past it — done via a JS-toggled `position: fixed` rather than
  // CSS `position: sticky`, since sticky wasn't actually engaging in some
  // test/preview contexts. Bounded to .mw-property > .container-ctn only
  // (that container is position: relative — see _property-details.scss):
  // once its bottom edge scrolls up to meet the bar, the bar switches from
  // fixed to `.is-parked` (position: absolute; bottom: 0) so it settles at
  // the container's own end and scrolls away with the rest of the page,
  // instead of staying fixed and floating on indefinitely over whatever
  // comes after the section (e.g. the footer).
  function initStickyPropertyTabsBar() {
    var bar = document.querySelector('[data-property-tabs-bar]');
    if (!bar) return;

    var container = bar.closest('.container-ctn');
    var header = document.querySelector('header');

    var spacer = document.createElement('div');
    spacer.className = 'mw-property__tabs-bar-spacer';
    spacer.hidden = true;
    bar.insertAdjacentElement('afterend', spacer);

    // Rendered `headerHeight` px *above* its own normal flow position (via
    // a negative `top` offset on an otherwise-normal 1px box) so it leaves
    // the viewport exactly when the bar's natural position reaches the
    // header's bottom edge — i.e. exactly when it should start sticking.
    var headerHeightAtInit = header ? header.getBoundingClientRect().height : 0;
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.position = 'relative';
    sentinel.style.top = '-' + Math.ceil(headerHeightAtInit) + 'px';
    sentinel.style.height = '1px';
    bar.insertAdjacentElement('beforebegin', sentinel);

    var pastSentinel = false;
    var ticking = false;

    function clearInlineStyles() {
      bar.style.position = '';
      bar.style.top = '';
      bar.style.bottom = '';
      bar.style.left = '';
      bar.style.width = '';
    }

    function update() {
      ticking = false;
      if (!pastSentinel) return;

      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var barHeight = bar.getBoundingClientRect().height || spacer.getBoundingClientRect().height;
      var containerBottom = container ? container.getBoundingClientRect().bottom : Infinity;

      if (containerBottom <= headerHeight + barHeight) {
        bar.classList.remove('is-stuck');
        bar.classList.add('is-parked');
        bar.style.position = 'absolute';
        bar.style.top = 'auto';
        bar.style.bottom = '0';
        bar.style.left = '0';
        bar.style.width = '100%';
      } else {
        bar.classList.remove('is-parked');
        bar.classList.add('is-stuck');
        bar.style.position = 'fixed';
        bar.style.bottom = '';
        bar.style.top = headerHeight + 'px';
        if (container) {
          var rect = container.getBoundingClientRect();
          bar.style.left = rect.left + 'px';
          bar.style.width = rect.width + 'px';
        }
      }
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    function enter() {
      if (pastSentinel) return;
      pastSentinel = true;
      spacer.style.height = bar.getBoundingClientRect().height + 'px';
      spacer.hidden = false;
      update();
    }

    function exit() {
      if (!pastSentinel) return;
      pastSentinel = false;
      bar.classList.remove('is-stuck', 'is-parked');
      clearInlineStyles();
      spacer.hidden = true;
    }

    if ('IntersectionObserver' in window) {
      // Classic sentinel recipe: with no rootMargin, `ratio < 1 && top < 0`
      // only happens when the sentinel has scrolled UP past the viewport's
      // top edge — never when it simply hasn't been scrolled to yet (in
      // that case top is still positive, below the viewport), which is
      // what previously made the bar wrongly stick from page load.
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.intersectionRatio < 1 && entry.boundingClientRect.top < 0) {
              enter();
            } else if (entry.intersectionRatio === 1) {
              exit();
            }
          });
        },
        { threshold: [1] }
      );
      observer.observe(sentinel);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  function initFloorPlanTabs() {
    var tabs = document.querySelectorAll('[data-floorplan-tab]');
    if (!tabs.length) return;

    var image = document.querySelector('[data-floorplan-image]');
    var link = document.querySelector('[data-floorplan-link]');
    var captionName = document.querySelector('[data-floorplan-caption-name]');
    var captionRange = document.querySelector('[data-floorplan-caption-range]');

    function select(tab) {
      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (image) {
        var src = tab.getAttribute('data-floorplan-img');
        var alt = tab.getAttribute('data-floorplan-alt');
        if (src) image.setAttribute('src', src);
        if (alt) image.setAttribute('alt', alt);
      }

      // Keep the Fancybox zoom link (wraps the image) pointing at the same
      // asset/caption, so tapping to zoom always shows what's on screen.
      if (link) {
        var linkSrc = tab.getAttribute('data-floorplan-img');
        var linkAlt = tab.getAttribute('data-floorplan-alt');
        if (linkSrc) link.setAttribute('href', linkSrc);
        if (linkAlt) link.setAttribute('data-caption', linkAlt);
      }

      // The project only has one floor plan blueprint asset, so the image
      // itself can't change per unit type — this caption is what actually
      // reflects the selected tab (name + size) since the picture won't.
      var nameEl = tab.querySelector('.mw-property__floorplan-name');
      var rangeEl = tab.querySelector('.mw-property__floorplan-range');
      if (captionName && nameEl) captionName.textContent = nameEl.textContent;
      if (captionRange && rangeEl) captionRange.textContent = rangeEl.textContent;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        select(tab);
      });

      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(tab);
        }
      });
    });
  }

  function initFancybox() {
    if (typeof window.Fancybox === 'undefined') return;
    window.Fancybox.bind('[data-fancybox]', {
      Carousel: {
        Toolbar: {
          display: {
            left: ['infobar'],
            middle: [],
            right: ['slideshow', 'thumbs', 'close'],
          },
        },
      },
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMegHeader();
    initMegHeroSlider();
    initMegSliders();
    initHeaderScroll();
    initMobileNav();
    initBottomNav();
    initCommunityPanels();
    initTabGroups();
    initDashboardRemovable();
    initStickySidebars();
    initPillTabDropdowns();
    initCarousels();
    initPopularPlacesSlider();
    initLuxurySlider();
    initHighlightSlider();
    initProjectsSlider();
    initCardGalleries();
    initRealtySlider();
    initAgentDetailTabs();
    initAgenciesPage();
    initPropertiesView();
    initTestimonialsSlider();
    initAboutBuildersSlider();
    initAboutPage();
    initPricingCycle();
    initProjectSaves();
    initForms();
    initDropdowns();
    initLanguageSwitch();
    initPriceRange();
    initPropertyTabs();
    initStickyPropertyTabsBar();
    initFloorPlanTabs();
    initFancybox();
  });
})();

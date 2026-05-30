(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get('q') || '';
  const searchInputs = Array.from(document.querySelectorAll('[data-card-search]'));
  let activeChip = '全部';

  searchInputs.forEach(function (input) {
    input.value = initialQuery;
    input.addEventListener('input', filterCards);
  });

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeChip = button.dataset.filterValue || '全部';
      document.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  if (initialQuery) {
    filterCards();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const query = normalize(searchInputs.map(function (input) { return input.value; }).find(Boolean) || '');
    const chip = normalize(activeChip);
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.dataset.search || card.textContent);
      const matchesQuery = !query || haystack.includes(query);
      const matchesChip = chip === '全部' || !chip || haystack.includes(chip);
      const isVisible = matchesQuery && matchesChip;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    document.querySelectorAll('[data-empty-state]').forEach(function (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    });
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-overlay');
    const source = player.dataset.videoSrc || (video ? video.dataset.src : '');
    let sourceReady = false;
    let hls = null;

    if (!video || !source) return;

    function attachSource() {
      if (sourceReady) return;
      sourceReady = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            video.src = source;
          }
        });
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      player.classList.add('is-playing');
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target.closest('video')) return;
      playVideo();
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) return;
      player.classList.remove('is-playing');
    });
  });
})();

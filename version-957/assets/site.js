(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileLinks = document.querySelector('.mobile-links');

  if (menuButton && mobileLinks) {
    menuButton.addEventListener('click', function () {
      var open = mobileLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === slideIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  function applyFilters(root) {
    var search = root.querySelector('.movie-search');
    var yearFilter = root.querySelector('.year-filter');
    var items = Array.prototype.slice.call(root.querySelectorAll('.movie-card, .rank-item'));
    var empty = root.querySelector('.empty-state');

    if (!items.length) {
      return;
    }

    function run() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var shown = 0;

      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-region'),
          item.getAttribute('data-category')
        ].join(' ').toLowerCase();

        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !year || item.getAttribute('data-year') === year;
        var visible = matchText && matchYear;

        item.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    if (search) {
      search.addEventListener('input', run);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', run);
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && search) {
      search.value = initial;
    }

    run();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-listing]')).forEach(applyFilters);

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-button');
    var src = shell.getAttribute('data-video') || (button ? button.getAttribute('data-video') : '');
    var loaded = false;

    function loadAndPlay() {
      if (!video || !src) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = src;
        }
        loaded = true;
      }

      shell.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        loadAndPlay();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      if (event.target.closest && event.target.closest('a')) {
        return;
      }
      loadAndPlay();
    });
  });
})();

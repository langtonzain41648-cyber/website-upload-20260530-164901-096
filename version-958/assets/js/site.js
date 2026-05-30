(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    show(0);
    start();
  }

  function setupFilters() {
    var grids = qsa('[data-card-grid]');
    grids.forEach(function (grid) {
      var scope = grid.closest('[data-filter-scope]') || document;
      var input = qs('[data-filter-input]', scope);
      var type = qs('[data-filter-type]', scope);
      var year = qs('[data-filter-year]', scope);
      var empty = qs('[data-no-results]', scope);
      var cards = qsa('[data-card]', grid);
      function run() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
          var okKeyword = !keyword || hay.indexOf(keyword) !== -1;
          var okType = !typeValue || card.dataset.type === typeValue;
          var okYear = !yearValue || card.dataset.year === yearValue;
          var ok = okKeyword && okType && okYear;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', run);
          control.addEventListener('change', run);
        }
      });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play]', shell);
      if (!video || !button) {
        return;
      }
      var source = video.dataset.stream;
      var prepared = false;
      var hls = null;
      function prepare() {
        if (prepared || !source) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function play() {
        prepare();
        shell.classList.add('active');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('active');
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        shell.classList.add('active');
      });
      video.addEventListener('click', function () {
        if (!prepared) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();

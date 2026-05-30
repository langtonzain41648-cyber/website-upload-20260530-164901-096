(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startCarousel() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-carousel-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current - 1);
      startCarousel();
    });
  });

  document.querySelectorAll('[data-carousel-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current + 1);
      startCarousel();
    });
  });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-go-slide')) || 0);
      startCarousel();
    });
  });

  startCarousel();

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var input = panel.querySelector('.search-input');
    var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
    var scope = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var activeFilter = 'all';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.style.display = matchKeyword && matchFilter ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });
})();

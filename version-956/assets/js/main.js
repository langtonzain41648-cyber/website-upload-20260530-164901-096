(function () {
    var navButton = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function (area) {
        var scope = area.parentElement || document;
        var input = area.querySelector('[data-filter-input]');
        var type = area.querySelector('[data-filter-type]');
        var region = area.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function update() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var t = type ? type.value : '';
            var r = region ? region.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && cardType.indexOf(t) === -1 && text.indexOf(t.toLowerCase()) === -1) {
                    ok = false;
                }
                if (r && cardRegion.indexOf(r) === -1 && text.indexOf(r.toLowerCase()) === -1) {
                    ok = false;
                }
                card.hidden = !ok;
            });
        }

        [input, type, region].forEach(function (item) {
            if (item) {
                item.addEventListener('input', update);
                item.addEventListener('change', update);
            }
        });
    });

    var backTop = document.querySelector('[data-backtop]');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('show', window.scrollY > 420);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();

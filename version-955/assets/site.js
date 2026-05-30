(function () {
  var mobileButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backTop.classList.add("show");
      } else {
        backTop.classList.remove("show");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  var hero = document.querySelector(".hero");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var activeIndex = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function playHero() {
      timer = window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5000);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      playHero();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setHero(dotIndex);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setHero(activeIndex - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setHero(activeIndex + 1);
        restartHero();
      });
    }

    setHero(0);
    playHero();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var targets = Array.prototype.slice.call(document.querySelectorAll(".search-target"));

      targets.forEach(function (target) {
        var haystack = (target.getAttribute("data-search") || target.textContent || "").toLowerCase();
        target.classList.toggle("hidden-by-search", keyword !== "" && haystack.indexOf(keyword) === -1);
      });
    });
  });

  var player = document.querySelector(".watch-player");

  if (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var source = player.getAttribute("data-stream") || "";
    var hasLoaded = false;

    function startVideo() {
      if (!video || !source) {
        return;
      }

      if (!hasLoaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        hasLoaded = true;
      }

      player.classList.add("playing");

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
      if (!hasLoaded) {
        startVideo();
      }
    });
  }
})();

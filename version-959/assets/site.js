(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function toggleMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initLibrary() {
    var input = document.querySelector("[data-library-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || !cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var term = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.genre + " " + card.dataset.year);
        card.classList.toggle("is-hidden", term && haystack.indexOf(term) === -1);
      });
    }

    input.addEventListener("input", apply);
    apply();
  }

  function initFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.dataset.filterValue;
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          var match = value === "all" || card.dataset.region === value || card.dataset.type === value;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  function attachVideo(video) {
    var src = video.dataset.hls;
    var wrap = video.closest(".player-wrap");
    var startButton = wrap ? wrap.querySelector(".video-start") : null;
    var hlsInstance = null;
    var initialized = false;

    function begin() {
      if (!src) return;
      if (!initialized) {
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      video.controls = true;
      if (startButton) startButton.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (!initialized || video.paused) {
        begin();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("video[data-hls]")).forEach(attachVideo);
  }

  ready(function () {
    toggleMenu();
    initLibrary();
    initFilters();
    initPlayers();
  });
})();

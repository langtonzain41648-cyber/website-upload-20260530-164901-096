(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = selectAll(".hero-slide", root);
    var dots = selectAll(".hero-dot", root);
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = selectAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var root = panel.closest(".page-container");
      var list = root ? root.querySelector("[data-filter-list]") : null;
      var empty = root ? root.querySelector("[data-empty-state]") : null;
      var cards = list ? selectAll(".movie-card", list) : [];
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var genre = panel.querySelector("[data-filter-genre]");

      function apply() {
        var q = (keyword && keyword.value ? keyword.value : "").trim().toLowerCase();
        var y = year && year.value ? year.value : "";
        var r = region && region.value ? region.value : "";
        var g = genre && genre.value ? genre.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            visible = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            visible = false;
          }
          if (g && text.indexOf(g.toLowerCase()) === -1) {
            visible = false;
          }
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      [keyword, year, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function cardHTML(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card movie-card-normal\">",
      "<a class=\"movie-cover\" href=\"" + escapeHTML(item.url) + "\" aria-label=\"" + escapeHTML(item.title) + "\">",
      "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\">",
      "<span class=\"cover-mask\"><span class=\"cover-play\">▶</span></span>",
      "</a>",
      "<div class=\"movie-body\">",
      "<h3><a href=\"" + escapeHTML(item.url) + "\">" + escapeHTML(item.title) + "</a></h3>",
      "<p>" + escapeHTML(item.oneLine) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHTML(item.year) + "</span><span>•</span><span>" + escapeHTML(item.region) + "</span></div>",
      "<div class=\"movie-tags\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearch() {
    var input = document.getElementById("search-input");
    var button = document.getElementById("search-button");
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    if (!input || !button || !results || !empty || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        empty.textContent = "输入关键词开始搜索";
        empty.classList.add("is-visible");
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(" "), item.oneLine]
          .join(" ")
          .toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(cardHTML).join("");
      empty.textContent = "没有找到匹配影片";
      empty.classList.toggle("is-visible", matched.length === 0);
    }

    button.addEventListener("click", run);
    input.addEventListener("input", run);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });
    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initBackTop();
    initHero();
    initFilters();
    initSearch();
  });
})();

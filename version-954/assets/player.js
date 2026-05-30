(function () {
  var hlsInstance = null;
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.onload = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    document.head.appendChild(script);
  }

  window.initializePlayer = function (videoUrl) {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var ready = false;

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          video.play().catch(function () {});
        });
      } else {
        video.src = videoUrl;
        ready = true;
        video.play().catch(function () {});
      }
    }

    function start() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (ready) {
        video.play().catch(function () {});
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        ready = true;
        video.play().catch(function () {});
        return;
      }
      loadHls(attachWithHls);
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();

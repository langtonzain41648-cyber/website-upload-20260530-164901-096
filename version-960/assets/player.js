
(function () {
  const player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const cover = player.querySelector('[data-player-cover]');
  const button = player.querySelector('[data-player-button]');
  const source = player.getAttribute('data-video-url');

  const start = function () {
    if (!source || !video) {
      return;
    }

    if (cover) {
      cover.style.display = 'none';
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }
})();

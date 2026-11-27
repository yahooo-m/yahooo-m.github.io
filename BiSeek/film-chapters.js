(() => {
  const player = document.getElementById('film-player');
  const chapterLinks = Array.from(document.querySelectorAll('.film-chapter'));
  const chapters = chapterLinks.map(link => ({
    link,
    start: Number(link.dataset.start),
    label: link.querySelector('strong').textContent
  }));
  const time = document.getElementById('film-time');
  const chapterTitle = document.getElementById('film-current');
  let selected = chapters[0];

  const clock = value => {
    const sec = Math.floor(value);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  };

  function update() {
    const currentTime = player.currentTime || 0;
    const duration = Number.isFinite(player.duration) ? player.duration : 186;
    time.textContent = clock(currentTime) + ' / ' + clock(duration);
    const active = chapters.filter(chapter => chapter.start <= currentTime).pop() || chapters[0];
    if (active === selected) return;
    selected.link.removeAttribute('aria-current');
    active.link.setAttribute('aria-current', 'time');
    chapterTitle.textContent = active.label;
    selected = active;
  }

  function play() {
    player.play().catch(() => {
      // Native controls stay available when a browser requires another gesture.
    });
  }

  function isOrdinaryClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey &&
      !event.shiftKey && !event.altKey;
  }

  for (const chapter of chapters) {
    chapter.link.addEventListener('click', event => {
      if (!isOrdinaryClick(event)) return;
      event.preventDefault();
      player.currentTime = chapter.start;
      update();
      play();
    });
  }

  document.getElementById('watch').addEventListener('click', event => {
    if (isOrdinaryClick(event)) play();
  });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked', 'ended'].forEach(event => {
    player.addEventListener(event, update);
  });

  const dialog = document.getElementById('viewer');
  new MutationObserver(() => {
    if (dialog.open) player.pause();
  }).observe(dialog, {attributes: true, attributeFilter: ['open']});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) player.pause();
  });
  document.addEventListener('play', event => {
    if (event.target instanceof HTMLVideoElement && event.target.matches('#film-player, #motion-vtg-video, #motion-stvg-video')) {
      document.querySelectorAll('video').forEach(other => {
        if (other !== event.target && !other.paused) other.pause();
      });
    }
  }, true);
})();

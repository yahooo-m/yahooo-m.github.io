(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('page-motion');
  let pausedByUser = false;
  try { pausedByUser = sessionStorage.getItem('pause-page-motion') === 'yes'; } catch {}

  function updatePreference() {
    const paused = pausedByUser || reduced.matches;
    root.classList.toggle('motion-paused', paused);
    toggle.hidden = reduced.matches;
    toggle.dataset.playing = String(!paused);
    const label = paused ? 'Resume automatic motion' : 'Pause automatic motion';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.querySelector('.motion-text').textContent = paused ? 'Resume motion' : 'Pause motion';
    document.dispatchEvent(new Event('motionchange'));
  }
  toggle.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    try { sessionStorage.setItem('pause-page-motion', pausedByUser ? 'yes' : 'no'); } catch {}
    updatePreference();
  });
  reduced.addEventListener('change', updatePreference);
  updatePreference();

  const stage = document.querySelector('.hero-monitor');
  const mast = document.querySelector('.mast-surface');
  const film = document.getElementById('hero-film');
  const heroPlay = document.getElementById('hero-play');
  const bars = [...stage.querySelectorAll('.hero-timeline i')];
  const number = document.getElementById('hero-scene-no');
  const command = document.getElementById('edit-command');
  const phase = document.getElementById('hero-phase');
  const name = document.getElementById('hero-name');
  const scenes = [
    ['Football at sunset', 'Remove the player and ball.'],
    ['Circle of faces', 'Erase the broadcast graphics.'],
    ['On the workbench', 'Remove the English overlays.']
  ];
  const shotDuration = 4.32;
  let manualPlay = false;
  let localPause = false;
  let frameCallback;

  function showTime(t) {
    const index = Math.min(scenes.length - 1, Math.floor(t / shotDuration));
    const local = t - index * shotDuration;
    const [title, phrase] = scenes[index];
    const state = local < 1.28 ? 'input' : local < 2.84 ? 'wipe' : 'result';
    const text = film.paused || reduced.matches ? phrase : phrase.slice(0, 1 + Math.floor(local * 34));
    if (name.textContent !== title) name.textContent = title;
    if (command.textContent !== text) command.textContent = text;
    if (stage.dataset.phase !== state) {
      stage.dataset.phase = state;
      phase.textContent = {input:'Original', wipe:'Comparing', result:'EraseAnything'}[state];
    }
    number.textContent = String(index + 1).padStart(2, '0') + ' / 03';
    bars.forEach((bar, i) => bar.style.setProperty('--scene-progress', i < index ? 1 : i > index ? 0 : Math.min(local / shotDuration, 1)));
  }
  function paintFrame(_, metadata) {
    showTime(metadata.mediaTime);
    if (!film.paused) frameCallback = film.requestVideoFrameCallback(paintFrame);
  }
  function playbackUI() {
    const playing = !film.paused;
    mast.classList.toggle('is-running', playing);
    heroPlay.dataset.playing = String(playing);
    const label = playing ? 'Pause opening comparison' : 'Play opening comparison';
    heroPlay.setAttribute('aria-label', label);
    heroPlay.title = label;
    if (frameCallback !== undefined) film.cancelVideoFrameCallback(frameCallback);
    if (playing && film.requestVideoFrameCallback) frameCallback = film.requestVideoFrameCallback(paintFrame);
    showTime(film.currentTime);
  }
  function syncFilm() {
    const enabled = !root.classList.contains('motion-paused') || manualPlay;
    if (enabled && !localPause && pageVideos.allows('hero')) {
      pageVideos.attach(film, film.dataset.src, film.dataset.liteSrc, {mode:'auto'});
      film.play().catch(playbackUI);
    } else if (localPause && pageVideos.allows('hero')) {
      film.pause();
    } else {
      pageVideos.suspend(film);
    }
  }
  heroPlay.hidden = false;
  film.controls = false;
  heroPlay.addEventListener('click', () => {
    manualPlay = film.paused;
    localPause = !manualPlay;
    if (manualPlay) pageVideos.prefer('hero');
    syncFilm();
  });
  for (const event of ['playing', 'pause', 'loadeddata']) film.addEventListener(event, playbackUI);
  film.addEventListener('timeupdate', () => { if (!film.requestVideoFrameCallback || film.paused) showTime(film.currentTime); });
  pageVideos.register('hero', stage);
  document.addEventListener('previewchange', syncFilm);
  document.addEventListener('motionchange', () => { manualPlay = false; syncFilm(); });
  playbackUI();

  // All three marks use the same 0 to +4 dB scale as the printed gains.
  document.querySelectorAll('.result-highlights > div').forEach((card, i) => {
    const gain = parseFloat(card.querySelector('strong').textContent);
    if (!Number.isFinite(gain)) return;
    const track = document.createElement('span');
    track.className = 'gain-track';
    track.setAttribute('aria-hidden', 'true');
    track.style.setProperty('--gain', Math.min(100, gain / 4 * 100) + '%');
    track.style.setProperty('--delay', i * .12 + 's');
    track.append(document.createElement('i'));
    card.querySelector('strong').after(track);
  });
  const arrivals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('enter-section');
      arrivals.unobserve(entry.target);
    }
  }, {threshold:.12});
  document.querySelectorAll('.section-heading,.abstract-inner,.benchmark-stats,.result-highlights').forEach(el => arrivals.observe(el));
})();

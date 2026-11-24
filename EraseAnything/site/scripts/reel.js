(() => {
  const broadcast = 'Natural High S4 · 现在就出发4';
  const sourceUrl = 'https://www.youtube.com/watch?v=P0njSUp1WGs';
  const scenes = [
    { title: 'Circle of faces', tag: 'Natural High S4', category: broadcast, path: './assets/headliners/group-huddle', note: 'The caption bar gives way to large lettering across the sky. Watch the faces around the edge of the frame.' },
    { title: 'Forest sign', tag: 'Natural High S4', category: broadcast, path: './assets/headliners/forest-sign', note: 'Watch the lettering on the wooden sign as the two broadcast graphics disappear.' },
    { title: 'Backstage dialogue', tag: 'Natural High S4', category: broadcast, path: './assets/headliners/backstage-dialogue', note: 'The dialogue captions change across the dark costumes. Follow the fabric in the reconstruction.' },
    { title: 'Night conversation', tag: 'Natural High S4', category: broadcast, path: './assets/headliners/night-conversation', note: 'The illuminated sign stays in the scene as the captions and corner graphic disappear.' },
    { title: 'Poolside dialogue', tag: 'Natural High S4', category: broadcast, path: './assets/premiere/poolside-dialogue', note: 'Look at the moving water behind the two dialogue captions.' },
    { title: 'Football at sunset', tag: 'Object removal', category: 'Object removal · Mask guided', path: './assets/featured-results/sunset-football', note: 'Follow the player and ball in the foreground. The distant players remain visible.' },
    { title: 'Crossing the plaza', tag: 'Object removal', category: 'Object removal · Mask guided', path: './assets/featured-results/plaza-walker', note: 'The pedestrian crosses the paving and facade, revealing the background in other frames.' },
    { title: 'On the workbench', tag: 'English overlays', category: 'English overlays · Instruction only', path: './assets/featured-results/english-workbench', note: 'Compare the two English overlays with the changing text on the device screen.' }
  ];

  const get = id => document.getElementById(id);
  const video = get('reel-video');
  const frame = get('reel-frame');
  const canvas = get('reel-canvas');
  const context = canvas.getContext('2d', {alpha: false});
  const play = get('reel-play');
  const seek = get('reel-seek');
  const divider = get('wipe-position');
  const rail = get('scene-rail');
  const loop = get('loop-scene');
  const modeButtons = [...document.querySelectorAll('.stage-modes button')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width:680px)');
  const modals = [...document.querySelectorAll('dialog')];
  const clock = new Intl.NumberFormat('en', {minimumIntegerDigits: 2});
  const stamp = s => Math.floor(s / 60) + ':' + clock.format(Math.floor(s % 60));
  let active = 0;
  let mode = small.matches ? 'wipe' : 'pair';
  let pickedLayout = false;
  let poster;
  let paintId;
  let wantsPlayback = !motion.matches;
  let onScreen = false;
  let manuallyStarted = false;
  const mayAdvance = () => !document.documentElement.classList.contains('motion-paused');

  function draw() {
    if (frame.dataset.layout === 'pair') return;
    const picture = video.readyState >= 2 ? video : poster;
    if (!picture) return;
    const w = (picture.videoWidth || picture.naturalWidth) / 2;
    const h = picture.videoHeight || picture.naturalHeight;
    if (!w || !h) return;
    const width = canvas.width;
    const height = frame.dataset.layout === 'stacked' ? canvas.height / 2 : canvas.height;
    if (frame.dataset.layout === 'stacked') {
      context.drawImage(picture, 0, 0, w, h, 0, 0, width, height);
      context.drawImage(picture, w, 0, w, h, 0, height, width, height);
    } else {
      const portion = Number(divider.value) / 100;
      context.drawImage(picture, w, 0, w, h, 0, 0, width, height);
      if (portion) context.drawImage(picture, 0, 0, w * portion, h, 0, 0, width * portion, height);
    }
  }
  function animate() {
    cancelAnimationFrame(paintId);
    draw();
    if (frame.dataset.layout !== 'pair' && !video.paused && !video.ended) paintId = requestAnimationFrame(animate);
  }
  function setDivider() {
    frame.style.setProperty('--wipe', divider.value + '%');
    divider.setAttribute('aria-valuetext', divider.value + '% original');
    draw();
  }
  function setLayout() {
    const layout = mode === 'pair' && small.matches ? 'stacked' : mode;
    frame.dataset.layout = layout;
    frame.classList.toggle('using-canvas', layout !== 'pair');
    canvas.hidden = layout === 'pair';
    canvas.height = layout === 'stacked' ? 1080 : 540;
    divider.hidden = mode !== 'wipe';
    frame.querySelector('.wipe-mark').hidden = divider.hidden;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    modeButtons[0].textContent = small.matches ? 'Stacked' : 'Side by side';
    animate();
  }
  function indicatePlayback() {
    play.dataset.playing = String(!video.paused && !video.ended);
    play.setAttribute('aria-label', video.paused ? 'Play showreel' : 'Pause showreel');
    animate();
  }
  function syncPlayback() {
    if (wantsPlayback && (mayAdvance() || manuallyStarted) && onScreen && !document.hidden && !modals.some(dialog => dialog.open)) {
      video.play().catch(indicatePlayback);
    } else {
      video.pause();
    }
  }
  function progress() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const elapsed = duration ? video.currentTime : 0;
    const percent = duration ? elapsed * 100 / duration : 0;
    seek.value = percent;
    seek.style.setProperty('--played', percent + '%');
    cards[active].style.setProperty('--scene-progress', percent / 100);
    cards[active].style.setProperty('--scene-progress', percent + '%');
    get('reel-clock').textContent = stamp(elapsed) + ' / ' + stamp(duration);
    seek.setAttribute('aria-valuetext', stamp(elapsed) + ' of ' + stamp(duration));
  }
  const cards = scenes.map((scene, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scene-item';
    const thumb = document.createElement('span');
    thumb.className = 'scene-image';
    const img = new Image();
    img.alt = '';
    img.src = scene.path + '.webp';
    thumb.append(img);
    const title = document.createElement('strong');
    title.textContent = scene.title;
    const tag = document.createElement('small');
    tag.textContent = scene.tag;
    button.append(thumb, title, tag);
    button.addEventListener('click', () => choose(i));
    button.addEventListener('keydown', event => {
      const dest = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: scenes.length - 1}[event.key];
      if (dest === undefined) return;
      event.preventDefault();
      choose(dest);
      cards[active].focus({preventScroll: true});
    });
    rail.append(button);
    return button;
  });
  function choose(index) {
    active = (index + scenes.length) % scenes.length;
    const scene = scenes[active];
    get('premiere-title').textContent = scene.title;
    get('scene-note').textContent = scene.note;
    get('scene-category').textContent = scene.category;
    const source = get('scene-source');
    source.hidden = scene.category !== broadcast;
    if (!source.hidden) source.href = sourceUrl;
    get('scene-position').textContent = clock.format(active + 1) + ' / ' + clock.format(scenes.length);
    cards.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    const card = cards[active];
    const delta = card.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    if (delta < 0 || delta + card.offsetWidth > rail.clientWidth) {
      rail.scrollLeft += delta - (rail.clientWidth - card.offsetWidth) / 2;
    }
    video.setAttribute('aria-label', 'Original footage and EraseAnything output for ' + scene.title);
    video.poster = scene.path + '.webp';
    poster = new Image();
    poster.onload = draw;
    poster.src = video.poster;
    if (video.getAttribute('src') !== scene.path + '.mp4') {
      video.src = scene.path + '.mp4';
      video.load();
    } else if (video.readyState) {
      video.currentTime = 0;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    progress();
    syncPlayback();
  }

  video.controls = false;
  modeButtons.forEach(button => button.addEventListener('click', () => { pickedLayout = true; mode = button.dataset.mode; setLayout(); }));
  divider.addEventListener('input', setDivider);
  get('previous-scene').addEventListener('click', () => choose(active - 1));
  get('next-scene').addEventListener('click', () => choose(active + 1));
  play.addEventListener('click', () => { wantsPlayback = video.paused; manuallyStarted = wantsPlayback; syncPlayback(); });
  loop.addEventListener('click', () => {
    video.loop = !video.loop;
    loop.setAttribute('aria-pressed', String(video.loop));
  });
  seek.addEventListener('input', () => {
    if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) * video.duration / 100;
    progress();
  });
  video.addEventListener('ended', () => { if (wantsPlayback && !video.loop && mayAdvance()) choose(active + 1); });
  for (const event of ['loadedmetadata', 'timeupdate', 'durationchange']) video.addEventListener(event, progress);
  for (const event of ['playing', 'pause']) video.addEventListener(event, indicatePlayback);
  for (const event of ['loadeddata', 'seeked']) video.addEventListener(event, draw);
  small.addEventListener('change', () => {
    if (!pickedLayout) mode = small.matches ? 'wipe' : 'pair';
    setLayout();
  });
  motion.addEventListener('change', () => { wantsPlayback = !motion.matches; syncPlayback(); });
  document.addEventListener('motionchange', () => { manuallyStarted = false; syncPlayback(); });
  const observer = new MutationObserver(syncPlayback);
  modals.forEach(dialog => observer.observe(dialog, {attributes: true, attributeFilter: ['open']}));
  document.addEventListener('visibilitychange', syncPlayback);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    syncPlayback();
  }).observe(frame);
  setDivider();
  setLayout();
  choose(0);
})();

(() => {
  const root = document.getElementById('task-previews');
  if (!root) return;
  const local = './assets/task-previews/';
  const examples = [
    {id:'object', tab:'Object', name:'The chess player', note:'The player disappears. The board and pieces stay on the table.', path:'./assets/collection/chess'},
    {id:'subtitle', tab:'Subtitle', name:'A cooking demonstration', note:'Two lines of English subtitles cross the counter and cutting board.', path:local+'subtitle'},
    {id:'logo', tab:'Logo', name:'Channel logo over foliage', note:'In this top-right detail, the blue channel logo clears from the leaves.', path:local+'logo'},
    {id:'watermark', tab:'Watermark', name:'Pencil drawing', note:'The watermark crosses the pencil strokes. Both views show the same detail of the drawing.', path:local+'watermark'},
    {id:'banner', tab:'Banner', name:'Lower third on a shirt', note:'The dark caption strip covers the shoulder and collar as the speaker turns.', path:local+'banner'},
    {id:'overlay', tab:'Mixed', name:'A Japanese dialogue', note:'Subtitles, on-screen text and a corner logo share the frame.', path:'./assets/collection/japanese'},
    {id:'keep', tab:'Identity', name:'A clean studio interview', note:'Compare the clean source and the model output along the suit, shelves and flowers.', path:local+'keep'}
  ];
  root.innerHTML = '<div class="task-preview-copy"><h3>Task examples</h3><div class="task-preview-tabs" role="group" aria-label="Choose a task example"></div><h4 id="task-preview-name"></h4><p id="task-preview-note"></p><button id="task-preview-play" type="button">Pause tour</button></div><figure class="task-preview-figure"><div class="task-preview-stage"><canvas width="640" height="360" role="img" aria-label="Original footage and model output"></canvas><video muted playsinline preload="none" hidden></video><span class="task-preview-phase" aria-hidden="true"></span><span class="task-preview-divider" aria-hidden="true"></span></div><figcaption><label for="task-preview-split">All output</label><input id="task-preview-split" type="range" aria-label="Amount of original footage" min="0" max="100" value="60"><span>All original</span></figcaption></figure>';
  const find = selector => root.querySelector(selector);
  const rail = find('.task-preview-tabs');
  const video = find('video'), canvas = find('canvas'), stage = find('.task-preview-stage');
  const context = canvas.getContext('2d', {alpha:false});
  const phase = find('.task-preview-phase'), slider = find('input'), play = find('#task-preview-play');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let active = -1, poster, hold = false, explicitPlay = false;
  let dragOverride = false, localChoice = false, cursor = 60, mediaLoaded = false;

  function allowed() {
    return pageVideos.allows('tasks') && !hold &&
      (explicitPlay || (!document.documentElement.classList.contains('motion-paused') && !reduced.matches));
  }
  function paint() {
    const image = mediaLoaded && video.readyState >= 2 ? video : poster;
    if (!image) return;
    const half = (image.videoWidth || image.naturalWidth) / 2;
    const height = image.videoHeight || image.naturalHeight;
    if (!half || !height) return;
    const ratio = cursor / 100;
    context.drawImage(image, half, 0, half, height, 0, 0, canvas.width, canvas.height);
    if (ratio > 0) context.drawImage(image, 0, 0, half * ratio, height, 0, 0, canvas.width * ratio, canvas.height);
    stage.style.setProperty('--preview-split', cursor + '%');
    phase.textContent = cursor === 100 ? 'Original' : cursor === 0 ? 'EraseAnything' : 'Comparing';
    stage.classList.toggle('task-split', cursor > 0 && cursor < 100);
    slider.value = Math.round(cursor);
    slider.setAttribute('aria-valuetext', Math.round(cursor) + '% original');
  }
  function frame() {
    if (!dragOverride && !video.paused && Number.isFinite(video.duration)) {
      const elapsed = video.currentTime / video.duration;
      const progress = Math.min(1, Math.max(0, (elapsed - .22) / .43));
      cursor = 100 * (1 + Math.cos(Math.PI * progress)) / 2;
    }
    paint();
  }
  function sync() {
    const path = examples[active].path;
    if (!poster && pageVideos.allows('tasks')) {
      const image = new Image();
      poster = image;
      image.onload = () => { if (poster === image) paint(); };
      image.src = path + '.webp';
    }
    const enabled = allowed();
    play.textContent = enabled ? 'Pause tour' : 'Play tour';
    play.setAttribute('aria-label', enabled ? 'Pause task examples' : 'Play task examples');
    if (enabled) {
      if (video.readyState >= 2) {
        mediaLoaded = true;
        if (video.ended) video.currentTime = 0;
      }
      pageVideos.play(video, path + '.mp4').catch(error => {
        if (error.name === 'AbortError' || !allowed()) return;
        hold = true;
        sync();
      });
    } else {
      pageVideos.pause(video);
      if (!pageVideos.allows('tasks') || !hold) {
        pageVideos.suspend(video);
        mediaLoaded = video.readyState >= 2;
      }
      paint();
    }
  }
  const buttons = examples.map((example, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = example.tab;
    button.addEventListener('click', () => {
      localChoice = true;
      pageVideos.prefer('tasks');
      select(i);
    });
    rail.append(button);
    return button;
  });
  function select(index) {
    if (active === index) return;
    active = index;
    const example = examples[index];
    pageVideos.release(video, false);
    mediaLoaded = false;
    poster = undefined;
    context.clearRect(0, 0, canvas.width, canvas.height);
    dragOverride = false;
    cursor = allowed() ? 100 : 56;
    find('#task-preview-name').textContent = example.name;
    find('#task-preview-note').textContent = example.note;
    canvas.setAttribute('aria-label', example.tab + ' task, ' + example.name + '. Original on the left, EraseAnything on the right.');
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    sync();
  }
  play.addEventListener('click', () => {
    if (allowed()) { hold = true; explicitPlay = false; }
    else { hold = false; explicitPlay = true; dragOverride = false; localChoice = false; }
    if (explicitPlay) pageVideos.prefer('tasks');
    sync();
  });
  slider.addEventListener('input', () => {
    dragOverride = true; localChoice = true; hold = true; explicitPlay = false;
    cursor = Number(slider.value);
    sync();
  });
  video.addEventListener('loadeddata', () => { mediaLoaded = true; });
  pageVideos.frames(video, frame, allowed);
  function prepareNext() {
    if (allowed() && !localChoice) {
      pageVideos.prepare('tasks', video, examples[(active + 1) % examples.length].path + '.mp4');
    }
  }
  for (const event of ['playing', 'progress', 'timeupdate']) video.addEventListener(event, prepareNext);
  video.addEventListener('ended', () => {
    if (!allowed()) return;
    if (localChoice) { hold = true; sync(); }
    else select((active + 1) % examples.length);
  });
  document.addEventListener('scoretaskchange', event => {
    const i = examples.findIndex(example => example.id === event.detail?.group);
    if (i < 0 || (localChoice && pageVideos.allows('tasks') && !event.detail?.manual)) return;
    localChoice = false;
    select(i);
  });
  document.addEventListener('motionchange', () => { explicitPlay = false; sync(); });
  document.addEventListener('previewchange', sync);
  root.hidden = false;
  pageVideos.register('tasks', stage);
  select(0);
})();

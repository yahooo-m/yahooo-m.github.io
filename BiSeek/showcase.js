(() => {
  'use strict';
  const isComparison = record => Boolean(record.query && record.comparator);
  const compareViews = ['compare','baseline','ours','input'];
  const queryViews = ['both','first','second','input'];
  const records = (window.BISEEK_SHOWCASE || []).filter(item =>
    isComparison(item)
      ? compareViews.every(view => item.sources?.[view])
      : item.queries?.length === 2 && queryViews.every(view => item.sources?.[view])
  );
  if (!records.length) return;

  const showcase = document.querySelector('.showcase');
  const stage = document.getElementById('showcase-stage');
  const scenes = document.getElementById('showcase-scenes');
  const queries = showcase.querySelector('.showcase-queries');
  const expression = showcase.querySelector('.showcase-expression');
  const originalQuery = expression.querySelector('details');
  const views = showcase.querySelector('.showcase-views');
  const finding = showcase.querySelector('.showcase-finding');
  const annotation = showcase.querySelector('.showcase-annotation');
  const crop = showcase.querySelector('.showcase-crop');
  const play = document.getElementById('showcase-play');
  const cycle = showcase.querySelector('.showcase-cycle');
  const seek = document.getElementById('showcase-seek');
  const time = document.getElementById('showcase-time');
  const status = document.getElementById('showcase-status');
  const foregroundSelector = '#film-player, #motion-vtg-video, #motion-stvg-video';
  const findForegroundPlayer = () => Array.from(document.querySelectorAll(foregroundSelector)).find(video => !video.paused);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = -1;
  let active = null;
  let pending = null;
  let players = new Map();
  let visible = true;
  let wantsPlay = !reduced.matches;
  let cycleChoice;
  let loops = 0;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const record = () => records[index];
  const cycleClips = () => records.length > 1 && (cycleChoice ?? (!reduced.matches && !isComparison(record())));
  const frameCount = () => Math.max(1, Number(record().frames) || Math.round((active?.duration || 1) * frameRate()));
  const frameRate = () => Number(record().fps) || 24;
  const frameAt = clip => Math.max(0, Math.min(frameCount() - 1, Math.floor((clip?.currentTime || 0) * frameRate() + .0001)));
  const canPlay = () => visible && !document.hidden && !document.getElementById('viewer')?.open && !findForegroundPlayer();
  const viewName = view => ({
    compare:'Side by side', baseline:record().comparator, ours:record().model,
    both:'Both queries', first:'Query 1', second:'Query 2', input:'Original video', gt:'Ground truth'
  })[view];
  const labels = make('div','showcase-stage-labels');
  const baselineLabel = make('span','showcase-side-label');
  const oursLabel = make('span','showcase-side-label is-biseek');
  labels.append(baselineLabel, oursLabel);

  function transport() {
    const running = wantsPlay && canPlay();
    play.setAttribute('aria-label', running ? 'Pause video' : 'Play video');
    play.firstElementChild.className = running ? 'pause-icon' : 'play-icon';
    play.lastElementChild.textContent = running ? 'Pause' : 'Play';
    cycle.setAttribute('aria-pressed', String(cycleClips()));
  }
  function syncPlay() {
    transport();
    if (!active) return;
    if (pending || !wantsPlay || !canPlay()) {active.pause();return;}
    const expected = active;
    active.play().catch(error => {
      if (expected !== active || pending || error.name === 'AbortError') return;
      wantsPlay = false;
      transport();
    });
  }
  function updateTime() {
    const frame = pending ? pending.frame : frameAt(active);
    const count = frameCount();
    seek.max = count - 1;
    seek.value = frame;
    seek.disabled = !active && !pending?.clip.readyState;
    seek.setAttribute('aria-valuetext', 'Frame ' + (frame + 1) + ' of ' + count);
    time.value = 'Frame ' + (frame + 1) + ' / ' + count;
  }
  function markView(view) {
    showcase.querySelectorAll('button[data-view]').forEach(button => {
      const mode = button.dataset.view;
      button.setAttribute('aria-pressed',String(mode === view || (view === 'both' && ['first','second'].includes(mode))));
    });
    labels.hidden = view !== 'compare';
    crop.hidden = view !== 'compare' || !record().pairedCrop;
  }
  function finishSwitch() {
    if (!pending) return;
    const {clip, frame} = pending;
    if (!(clip.readyState >= 1 && Number.isFinite(clip.duration))) return;
    if (!pending.sought) {
      pending.sought = true;
      // A small offset within the frame avoids decoder rounding to the preceding frame.
      const target = Math.min((frame + .09) / frameRate(), Math.max(0, clip.duration - .001));
      if (Math.abs(clip.currentTime - target) > .15 / frameRate()) clip.currentTime = target;
    }
    if (clip.seeking || clip.readyState < 2) return;
    if (active !== clip) {
      if (active) { active.classList.remove('is-current'); active.pause(); }
      clip.classList.add('is-current');
    }
    active = clip;
    markView(pending.view);
    pending = null;
    updateTime();
    syncPlay();
  }
  function getPlayer(view) {
    if (players.has(view)) return players.get(view);
    const clip = make('video');
    clip.playsInline = true;
    clip.muted = true;
    clip.defaultMuted = true;
    clip.preload = 'auto';
    clip.setAttribute('aria-label', record().title + ', ' + viewName(view));
    clip.setAttribute('aria-hidden','true');
    for (const event of ['loadedmetadata','loadeddata','canplay','seeked']) {
      clip.addEventListener(event, () => {
        if (pending?.clip === clip) finishSwitch();
        if (active === clip && !pending) updateTime();
      });
    }
    clip.addEventListener('timeupdate', () => { if (active === clip && !pending) updateTime(); });
    clip.addEventListener('ended', () => {
      if (active !== clip || pending || !wantsPlay) return;
      loops++;
      if (cycleClips() && loops * clip.duration >= 6) { chooseCase((index + 1) % records.length); return; }
      clip.currentTime = 0;
      syncPlay();
    });
    clip.addEventListener('error', () => {
      if (clip !== pending?.clip && clip !== active) return;
      wantsPlay = false;
      status.textContent = 'This view could not be loaded. Select another view or clip.';
      status.hidden = false;
      pending = null;
      if (active) markView(active.dataset.view);
      syncPlay();
    });
    clip.dataset.view = view;
    players.set(view, clip);
    stage.append(clip);
    clip.src = record().sources[view];
    return clip;
  }
  function showView(view, frame) {
    if (!pending && active?.dataset.view === view) return;
    active?.pause();
    const clip = getPlayer(view);
    pending = {view,clip,frame,sought:false};
    status.hidden = true;
    finishSwitch();
    updateTime();
  }
  function chooseCase(next) {
    if (index === next) return;
    const item = records[next];
    const comparison = isComparison(item);
    // Crossfade legacy clips without laying one comparison's labels over another clip.
    let outgoing;
    if (!comparison && active?.readyState >= 2 && !isComparison(record()) && !reduced.matches) {
      outgoing = make('canvas','showcase-outgoing');
      outgoing.width = active.videoWidth;
      outgoing.height = active.videoHeight;
      outgoing.getContext('2d').drawImage(active,0,0);
      outgoing.setAttribute('aria-hidden','true');
    }
    index = next;
    pending = null;
    active = null;
    for (const clip of players.values()) {
      clip.pause(); clip.removeAttribute('src'); clip.load(); clip.remove();
    }
    players = new Map();
    loops = 0;
    showcase.classList.toggle('showcase-comparison', comparison);
    const initialView = comparison ? 'compare' : 'both';
    const poster = make('img','showcase-poster');
    poster.alt = comparison
      ? item.alt || item.comparator + ' and ' + item.model + ' predictions in ' + item.title
      : 'Two referring-query predictions in ' + item.title;
    if (item.poster) poster.src = item.poster;
    stage.replaceChildren(...(item.poster ? [poster] : []));
    if (outgoing) {
      stage.append(outgoing);
      const fade = () => {
        if (!outgoing.isConnected) return;
        const effect = outgoing.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-out'});
        effect.finished.then(() => outgoing.remove(), () => outgoing.remove());
      };
      if (item.poster) poster.decode().then(fade,fade);
      else fade();
    }
    if (comparison) {
      const setModelLabel = (label, name, score) => {
        label.textContent = name;
        if (Number.isFinite(score)) label.append(make('small','showcase-score',score.toFixed(2) + '%'));
      };
      setModelLabel(baselineLabel, item.comparator, item.scores?.baseline);
      setModelLabel(oursLabel, item.model, item.scores?.ours);
      stage.append(labels);
    }
    if (item.width && item.height) stage.style.setProperty('--shot-aspect', item.width + ' / ' + item.height);
    document.getElementById('showcase-title').textContent = item.title;
    const metricNote = item.scores?.metric && 'Full-sequence ' + item.scores.metric;
    document.getElementById('showcase-meta').textContent =
      [item.dataset, comparison ? metricNote : item.model].filter(Boolean).join(' · ');
    expression.hidden = !comparison;
    expression.querySelector('p').textContent = comparison ? item.focus || item.query : '';
    originalQuery.hidden = !comparison || !item.focus;
    originalQuery.open = false;
    originalQuery.querySelector('blockquote').textContent = comparison ? item.query : '';
    annotation.hidden = !comparison;
    finding.hidden = !item.finding;
    finding.textContent = comparison ? item.finding || '' : '';
    const modes = comparison
      ? item.sources.gt ? [...compareViews,'gt'] : compareViews
      : ['both','input'];
    views.replaceChildren(...modes.map(view => {
      const text = {compare:'Compare', baseline:'Baseline', ours:'BiSeek', input:comparison ? 'Original' : 'Original video'}[view] || viewName(view);
      const button = make('button', null, text);
      button.type = 'button';
      button.dataset.view = view;
      if (view === 'compare') button.setAttribute('aria-label','Compare both methods side by side');
      if (view === 'baseline' || view === 'ours') button.setAttribute('aria-label','Show ' + viewName(view) + ' only');
      return button;
    }));
    queries.hidden = comparison;
    queries.replaceChildren(...(comparison ? [] : item.queries.map((query, n) => {
      const view = n ? 'second' : 'first';
      const button = make('button','showcase-query');
      button.type = 'button';
      button.dataset.view = view;
      const color = Array.isArray(query.color) ? 'rgb(' + query.color.join(' ') + ')' : query.color;
      button.style.setProperty('--query-color',CSS.supports('color',color) ? color : (n ? '#faab64' : '#39d6bd'));
      const mark = make('span','mark');
      mark.setAttribute('aria-hidden','true');
      button.append(mark, make('span','query-index','Query ' + (n + 1)), make('span','query-text',query.text));
      button.title = 'Show this query alone, or select it again to show both';
      return button;
    })));
    Array.from(scenes.children).forEach((button, n) => button.setAttribute('aria-pressed',String(n === index)));
    markView(initialView);
    showView(initialView,0);
    transport();
  }

  records.forEach((item, n) => {
    const button = make('button');
    button.type = 'button';
    button.title = item.title;
    if (item.poster) {
      const image = make('img');
      image.alt = ''; image.loading = 'lazy'; image.src = item.poster;
      button.append(image);
    }
    button.append(make('span',null,item.title));
    button.addEventListener('click', () => chooseCase(n));
    scenes.append(button);
  });
  scenes.hidden = cycle.hidden = records.length < 2;
  document.getElementById('showcase-interface').hidden = false;
  showcase.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    let view = button.dataset.view;
    const currentView = pending?.view || active?.dataset.view;
    if (currentView === view && ['first','second'].includes(view)) view = 'both';
    showView(view, pending ? pending.frame : frameAt(active));
  });
  annotation.querySelector('a').addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const item = window.biSeekResearch?.cases.find(entry => entry.id === record().galleryCase);
    if (!item) return;
    const task = document.querySelector('#task-bar [data-task="' + CSS.escape(item.task) + '"]');
    if (task?.getAttribute('aria-pressed') === 'false') task.click();
    const galleryCase = document.querySelector('#case-rail [data-case="' + CSS.escape(item.id) + '"]');
    if (galleryCase?.getAttribute('aria-pressed') === 'false') galleryCase.click();
  });
  play.addEventListener('click', () => {
    const foreground = findForegroundPlayer();
    if (foreground) { wantsPlay = true; foreground.pause(); }
    else wantsPlay = !wantsPlay;
    syncPlay();
  });
  cycle.addEventListener('click', () => {cycleChoice = !cycleClips();loops = 0;transport();});
  seek.addEventListener('input', () => {
    const frame = Number(seek.value);
    if (pending) {pending.frame = frame;pending.sought = false;finishSwitch();}
    else if (active && Number.isFinite(active.duration)) active.currentTime = Math.min((frame + .09) / frameRate(),active.duration - .001);
    updateTime();
  });
  reduced.addEventListener('change', event => {
    if (event.matches) {wantsPlay = false;cycleChoice = false;syncPlay();}
  });
  document.addEventListener('visibilitychange',syncPlay);
  for (const eventName of ['play','pause']) {
    document.addEventListener(eventName, event => {
      if (event.target instanceof HTMLVideoElement && event.target.matches(foregroundSelector)) syncPlay();
    }, true);
  }
  const modal = document.getElementById('viewer');
  if (modal) new MutationObserver(syncPlay).observe(modal,{attributes:true,attributeFilter:['open']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;syncPlay();},{threshold:.025}).observe(stage);
  }
  chooseCase(0);
})();

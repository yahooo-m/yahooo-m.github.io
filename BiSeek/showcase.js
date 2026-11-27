(() => {
  'use strict';
  const records = (window.BISEEK_SHOWCASE || []).filter(record =>
    record.queries?.length === 2 && ['both','first','second','input'].every(view => record.sources?.[view])
  );
  if (!records.length) return;

  const showcase = document.querySelector('.showcase');
  const stage = document.getElementById('showcase-stage');
  const scenes = document.getElementById('showcase-scenes');
  const queries = showcase.querySelector('.showcase-queries');
  const play = document.getElementById('showcase-play');
  const cycle = showcase.querySelector('.showcase-cycle');
  const seek = document.getElementById('showcase-seek');
  const time = document.getElementById('showcase-time');
  const status = document.getElementById('showcase-status');
  const film = document.getElementById('film-player');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = -1;
  let active = null;
  let pending = null;
  let players = new Map();
  let visible = true;
  let wantsPlay = !reduced.matches;
  let cycleClips = !reduced.matches && records.length > 1;
  let loops = 0;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const record = () => records[index];
  const frameCount = () => Math.max(1, Number(record().frames) || Math.round((active?.duration || 1) * frameRate()));
  const frameRate = () => Number(record().fps) || 24;
  const frameAt = clip => Math.max(0, Math.min(frameCount() - 1, Math.floor((clip?.currentTime || 0) * frameRate() + .0001)));
  const canPlay = () => visible && !document.hidden && !document.getElementById('viewer')?.open && (!film || film.paused);
  const viewName = view => ({both:'Both queries',first:'Query 1',second:'Query 2',input:'Original video'})[view];

  function transport() {
    const running = wantsPlay && canPlay();
    play.setAttribute('aria-label', running ? 'Pause video' : 'Play video');
    play.firstElementChild.className = running ? 'pause-icon' : 'play-icon';
    play.lastElementChild.textContent = running ? 'Pause' : 'Play';
    cycle.setAttribute('aria-pressed', String(cycleClips));
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
      if (cycleClips && loops * clip.duration >= 6) { chooseCase((index + 1) % records.length); return; }
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
    // Keep the outgoing frame on screen until the incoming poster is ready.
    let outgoing;
    if (active?.readyState >= 2 && !reduced.matches) {
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
    const item = record();
    const poster = make('img','showcase-poster');
    poster.alt = 'Two referring-query predictions in ' + item.title;
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
    if (item.width && item.height) stage.style.setProperty('--shot-aspect', item.width + ' / ' + item.height);
    document.getElementById('showcase-title').textContent = item.title;
    document.getElementById('showcase-meta').textContent = [item.dataset,item.model].filter(Boolean).join(' · ');
    queries.replaceChildren(...item.queries.map((query, n) => {
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
    }));
    Array.from(scenes.children).forEach((button, n) => button.setAttribute('aria-pressed',String(n === index)));
    markView('both');
    showView('both',0);
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
  play.addEventListener('click', () => {
    if (film && !film.paused) { wantsPlay = true; film.pause(); }
    else wantsPlay = !wantsPlay;
    syncPlay();
  });
  cycle.addEventListener('click', () => {cycleClips = !cycleClips;loops = 0;transport();});
  seek.addEventListener('input', () => {
    const frame = Number(seek.value);
    if (pending) {pending.frame = frame;pending.sought = false;finishSwitch();}
    else if (active && Number.isFinite(active.duration)) active.currentTime = Math.min((frame + .09) / frameRate(),active.duration - .001);
    updateTime();
  });
  reduced.addEventListener('change', event => {
    if (event.matches) {wantsPlay = false;cycleClips = false;syncPlay();}
  });
  document.addEventListener('visibilitychange',syncPlay);
  film?.addEventListener('play',syncPlay);
  film?.addEventListener('pause',syncPlay);
  const modal = document.getElementById('viewer');
  if (modal) new MutationObserver(syncPlay).observe(modal,{attributes:true,attributeFilter:['open']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;syncPlay();},{threshold:.025}).observe(stage);
  }
  chooseCase(0);
})();

// The visible comparison nearest the reading position gets the preview decoder.
const pageVideos = (() => {
  const regions = new Map();
  const positions = new WeakMap();
  const objectSources = new WeakMap();
  const connection = navigator.connection;
  const smallScreen = matchMedia('(max-width: 680px)');
  const anchoredEntry = Boolean(location.hash);
  let entryReady = !anchoredEntry;
  let selected, preferred, scrollFrame, settleTimer, standby;

  function update(settled = true) {
    if (!entryReady) return;
    const height = document.documentElement.clientHeight;
    const readingLine = height * .43;
    let next, bestDistance = Infinity;
    if (!document.hidden && !document.querySelector('dialog[open]')) {
      for (const [region, element] of regions) {
        const box = element.getBoundingClientRect();
        const visible = Math.min(height, box.bottom) - Math.max(0, box.top);
        if (visible < Math.min(box.height, height) * .20 || visible <= 0) continue;
        const distance = Math.max(0, box.top - readingLine, readingLine - box.bottom);
        if (region === preferred) { next = region; break; }
        if (distance < bestDistance) { next = region; bestDistance = distance; }
      }
      if (preferred !== next) preferred = undefined;
    }
    if (next !== selected && (settled || selected !== undefined)) {
      selected = settled ? next : undefined;
      if (standby && standby.region !== selected) cancelStandby();
      document.dispatchEvent(new Event('previewchange'));
    }
  }

  function schedule() {
    clearTimeout(settleTimer);
    if (scrollFrame === undefined) {
      scrollFrame = requestAnimationFrame(() => { scrollFrame = undefined; update(false); });
    }
    settleTimer = setTimeout(() => update(), 140);
  }
  function register(region, element) {
    regions.set(region, element);
    // Let the registering component finish its setup before dispatching previewchange.
    queueMicrotask(update);
  }
  function prefer(region) {
    preferred = region;
    update();
  }
  function allows(region) {
    return region === selected;
  }

  function useLite() {
    return smallScreen.matches || connection?.saveData ||
      ['slow-2g', '2g', '3g'].includes(connection?.effectiveType) ||
      (connection?.downlink > 0 && connection.downlink <= 2);
  }

  function variant(path, litePath = path.replace(/(?:-lite)?\.mp4$/, '-lite.mp4')) {
    return useLite() ? litePath : path;
  }
  function bufferedToEnd(video) {
    const ranges = video.buffered;
    return ranges.length === 1 && ranges.start(0) < .1 && ranges.end(0) >= video.duration - .1;
  }
  function cancelStandby() {
    standby?.controller.abort();
    standby = undefined;
  }
  function prepare(region, video, nextPath) {
    if (!allows(region) || !nextPath || document.hidden || connection?.saveData ||
        video.paused || video.currentTime < .6 || video.duration - video.currentTime < 1 ||
        !bufferedToEnd(video)) return;
    const path = variant(nextPath);
    if (standby?.path === path) return;
    cancelStandby();
    const ticket = {region, path, controller:new AbortController()};
    standby = ticket;
    // A single finished short clip can pay for the next cut without competing with playback.
    fetch(path, {signal:ticket.controller.signal, priority:'low'})
      .then(response => response.ok ? response.blob() : undefined)
      .then(blob => { if (standby === ticket && blob?.size) ticket.blob = blob; })
      .catch(() => {});
  }
  function forgetObjectSource(video) {
    const saved = objectSources.get(video);
    if (saved) URL.revokeObjectURL(saved.url);
    objectSources.delete(video);
  }
  function attach(video, path, litePath) {
    const previous = objectSources.get(video)?.path || video.getAttribute('src');
    const src = variant(path, litePath);
    // Keep the selected file for the lifetime of this clip, including network changes.
    const alternate = litePath || path.replace(/(?:-lite)?\.mp4$/, '-lite.mp4');
    if (previous === path || previous === alternate) return;
    const blob = standby?.path === src ? standby.blob : undefined;
    cancelStandby();
    forgetObjectSource(video);
    if (blob) {
      const url = URL.createObjectURL(blob);
      objectSources.set(video, {url, path:src});
      video.setAttribute('src', url);
    } else video.setAttribute('src', src);
    const saved = positions.get(video);
    if ((saved?.path === path || saved?.path === alternate) && saved.time > 0) {
      video.currentTime = saved.time;
    }
  }
  function release(video, remember = true) {
    const path = objectSources.get(video)?.path || video.getAttribute('src');
    if (!remember) positions.delete(video);
    if (!path) return;
    if (remember && video.currentTime > 0) positions.set(video, {path, time:video.currentTime});
    video.pause();
    video.removeAttribute('src');
    video.load();
    forgetObjectSource(video);
  }
  function suspend(video) {
    video.pause();
    // Keep completed short previews ready to resume. Incomplete downloads yield bandwidth.
    if (!bufferedToEnd(video)) release(video);
  }

  function frames(video, draw, active = () => true) {
    const request = video.requestVideoFrameCallback?.bind(video) || requestAnimationFrame;
    const cancel = video.cancelVideoFrameCallback?.bind(video) || cancelAnimationFrame;
    let token;
    function refresh() {
      if (token !== undefined) cancel(token);
      token = undefined;
      draw();
      if (!video.paused && !video.ended && active()) token = request(refresh);
    }
    for (const event of ['playing', 'pause', 'loadeddata', 'seeked', 'ended']) {
      video.addEventListener(event, refresh);
    }
    return refresh;
  }

  if (anchoredEntry) {
    // Initial fragment scrolling can happen after the deferred scripts create the target.
    const enableEntry = () => requestAnimationFrame(() => {
      entryReady = true;
      update();
    });
    if (document.readyState === 'complete') enableEntry();
    else window.addEventListener('load', enableEntry, {once:true});
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => update());
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) document.documentElement.classList.add('smooth-navigation');
  }, {capture:true});
  const dialogs = new MutationObserver(() => update());
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, {attributes:true, attributeFilter:['open']}));
  connection?.addEventListener?.('change', () => document.dispatchEvent(new Event('previewchange')));
  return {register, prefer, allows, attach, suspend, release, frames, prepare};
})();

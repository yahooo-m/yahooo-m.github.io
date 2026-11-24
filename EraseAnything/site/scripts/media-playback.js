// The visible comparison nearest the reading position gets the preview decoder.
const pageVideos = (() => {
  const regions = new Map();
  const positions = new WeakMap();
  const connection = navigator.connection;
  let selected, preferred, scrollFrame, settleTimer;

  function update(settled = true) {
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
    schedule();
  }
  function prefer(region) {
    preferred = region;
    update();
  }
  function allows(region, explicit = false) {
    const limited = connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
    return region === selected && (explicit || !limited);
  }

  function attach(video, path) {
    if (video.getAttribute('src') === path) return;
    video.setAttribute('src', path);
    const saved = positions.get(video);
    if (saved?.path === path && saved.time > 0) {
      // Seeking before metadata is available sets the initial playback position.
      video.currentTime = saved.time;
    }
  }
  function release(video, remember = true) {
    const path = video.getAttribute('src');
    if (!remember) positions.delete(video);
    if (!path) return;
    if (remember && video.currentTime > 0) positions.set(video, {path, time:video.currentTime});
    video.pause();
    video.removeAttribute('src');
    video.load();
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
  return {register, prefer, allows, attach, release};
})();

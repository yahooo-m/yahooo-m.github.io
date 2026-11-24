const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clipDialog = document.querySelector('#clip-dialog');
const filmDialog = document.querySelector('#film-dialog');
const film = document.querySelector('#film-video');

const canvas = document.querySelector('#compare-canvas');
const canvasContext = canvas.getContext('2d', {alpha:false});
const frame = document.querySelector('#comparison-frame');
const slider = document.querySelector('#comparison-slider');
const video = document.querySelector('#comparison-video');
const playButton = document.querySelector('#play-comparison');
const status = document.querySelector('#demo-status');
const grid = document.querySelector('#gallery-grid');
const expand = document.querySelector('#expand-gallery');
let activeExample;
let split = 50;
let poster;
let revealFrame;
let videoFrame;
let galleryFilter = 'all';
let expanded = false;

function drawComparison() {
  const source = video.readyState >= 2 ? video : poster;
  if (!source || (!source.videoWidth && !source.naturalWidth)) return;
  const w = (source.videoWidth || source.naturalWidth) / 2;
  const h = source.videoHeight || source.naturalHeight;
  canvasContext.drawImage(source, w, 0, w, h, 0, 0, canvas.width, canvas.height);
  if (split) canvasContext.drawImage(source, 0, 0, w * split/100, h, 0, 0, canvas.width * split/100, canvas.height);
}
function moveDivider(value) {
  split = Math.round(value);
  slider.value = split;
  frame.style.setProperty('--split', split + '%');
  slider.setAttribute('aria-valuetext', split + '% original, ' + (100 - split) + '% result');
  drawComparison();
}
function runReveal() {
  cancelAnimationFrame(revealFrame);
  if (reducedMotion.matches) { moveDivider(split === 0 ? 100 : 0); return; }
  const start = performance.now();
  function sweep(now) {
    const t = Math.min(1, (now - start) / 1900);
    const position = t < .66 ? 100 * (1 + Math.cos(t / .66 * Math.PI)) / 2 : activeExample.split * (1 - Math.cos((t - .66) / .34 * Math.PI)) / 2;
    moveDivider(position);
    if (t < 1) revealFrame = requestAnimationFrame(sweep);
  }
  revealFrame = requestAnimationFrame(sweep);
}
function playComparison() {
  video.play().catch(error => {
    if (error.name !== 'AbortError' && clipDialog.open) status.textContent = 'Press play to start the clip, or drag the divider to compare the still frame.';
  });
}
function openClip(example) {
  activeExample = example;
  video.src = example.path + '.mp4';
  poster = new Image();
  poster.onload = drawComparison;
  poster.src = example.path + '.webp';
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('aria-label', example.title + '. Original on the left and result on the right.');
  document.querySelector('#case-title').textContent = example.title;
  document.querySelector('#case-input').textContent = example.category;
  document.querySelector('#case-description').textContent = example.description;
  status.textContent = '';
  moveDivider(example.split);
  clipDialog.showModal();
  if (!reducedMotion.matches) playComparison();
}
function paintMovingClip() {
  cancelAnimationFrame(videoFrame);
  drawComparison();
  if (!video.paused) videoFrame = requestAnimationFrame(paintMovingClip);
}
function comparisonPlayback() {
  playButton.dataset.playing = String(!video.paused);
  playButton.lastElementChild.textContent = video.paused ? 'Play clip' : 'Pause clip';
  paintMovingClip();
}
video.addEventListener('playing', comparisonPlayback);
video.addEventListener('pause', comparisonPlayback);
video.addEventListener('loadeddata', drawComparison);
slider.addEventListener('pointerdown', () => cancelAnimationFrame(revealFrame));
slider.addEventListener('input', () => { cancelAnimationFrame(revealFrame); moveDivider(Number(slider.value)); });
document.querySelector('#reveal-comparison').addEventListener('click', runReveal);
playButton.addEventListener('click', () => { if (video.paused) playComparison(); else video.pause(); });
clipDialog.addEventListener('close', () => { cancelAnimationFrame(revealFrame); video.pause(); });

const galleryLayer = document.createElement('span');
galleryLayer.className = 'gallery-live';
galleryLayer.setAttribute('aria-hidden','true');
const galleryVideo = document.createElement('video');
galleryVideo.className = 'gallery-decoder';
galleryVideo.muted = true;
galleryVideo.defaultMuted = true;
galleryVideo.playsInline = true;
const galleryCanvas = document.createElement('canvas');
const galleryContext = galleryCanvas.getContext('2d', {alpha:false});
const gallerySeam = document.createElement('span');
gallerySeam.className = 'gallery-seam';
galleryLayer.append(galleryVideo, galleryCanvas, gallerySeam);

let previewCard;
let pointedCard;
let focusedCard;
let galleryFrame;
const visibleCases = new Set();
const hoverInput = matchMedia('(hover: hover)');

function drawGalleryFrame() {
  if (!previewCard || !galleryVideo.videoWidth || galleryVideo.readyState < 2) return;
  const w = galleryVideo.videoWidth / 2;
  const h = galleryVideo.videoHeight;
  if (galleryCanvas.width !== w || galleryCanvas.height !== h) {
    galleryCanvas.width = w;
    galleryCanvas.height = h;
  }
  // Both crops come from the same decoded video frame, including during the wipe.
  const phase = galleryVideo.currentTime / (galleryVideo.duration || 1);
  const travel = Math.max(0, Math.min(1, (phase - .12) / .54));
  const fraction = (1 + Math.cos(Math.PI * travel)) / 2;
  const edge = Math.round(w * fraction);
  galleryContext.drawImage(galleryVideo, w, 0, w, h, 0, 0, w, h);
  if (edge) galleryContext.drawImage(galleryVideo, 0, 0, edge, h, 0, 0, edge, h);
  gallerySeam.style.left = 100 * fraction + '%';
  galleryLayer.dataset.phase = fraction > .84 ? 'original' : fraction < .16 ? 'result' : 'split';
  galleryLayer.classList.add('has-frame');
}

function advanceGalleryFrame() {
  drawGalleryFrame();
  if (!previewCard || galleryVideo.paused) return;
  galleryFrame = galleryVideo.requestVideoFrameCallback ?
    galleryVideo.requestVideoFrameCallback(advanceGalleryFrame) : requestAnimationFrame(advanceGalleryFrame);
}

function cancelGalleryFrame() {
  if (galleryFrame === undefined) return;
  if (galleryVideo.cancelVideoFrameCallback) galleryVideo.cancelVideoFrameCallback(galleryFrame);
  else cancelAnimationFrame(galleryFrame);
  galleryFrame = undefined;
}

function stopPreview() {
  if (!previewCard) return;
  cancelGalleryFrame();
  previewCard.classList.remove('is-previewing');
  previewCard = undefined;
  galleryLayer.classList.remove('has-frame');
  galleryVideo.pause();
  galleryVideo.removeAttribute('src');
  galleryVideo.load();
  galleryLayer.remove();
}

function syncPreview(advance = false) {
  if (document.hidden || reducedMotion.matches || document.documentElement.classList.contains('motion-paused') ||
      document.querySelector('dialog[open]')) {
    stopPreview();
    return;
  }
  const eligible = cards.filter(card => visibleCases.has(card) && !card.hidden);
  if (!eligible.length) { stopPreview(); return; }
  const current = eligible.indexOf(previewCard);
  const nextIndex = current < 0 ? 0 : (current + Number(advance)) % eligible.length;
  const target = [pointedCard, focusedCard].find(card => eligible.includes(card)) || eligible[nextIndex];
  if (target === previewCard) {
    if (advance && galleryVideo.ended) {
      galleryVideo.currentTime = 0;
      galleryVideo.play().catch(() => {});
    }
    return;
  }
  stopPreview();
  previewCard = target;
  previewCard.classList.add('is-previewing');
  const picture = target.querySelector('.gallery-picture');
  picture.insertBefore(galleryLayer, picture.lastElementChild);
  galleryVideo.src = target.dataset.path + '.mp4';
  galleryVideo.play().catch(() => {});
}

galleryVideo.addEventListener('playing', () => {
  cancelGalleryFrame();
  advanceGalleryFrame();
});
galleryVideo.addEventListener('loadeddata', drawGalleryFrame);
galleryVideo.addEventListener('ended', () => syncPreview(true));
function makeCard(example) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'gallery-card';
  card.id = 'clip-' + example.id;
  card.dataset.case = example.id;
  card.dataset.path = example.path;
  card.setAttribute('aria-haspopup','dialog');
  const picture = document.createElement('span');
  picture.className = 'gallery-picture';
  const img = new Image();
  img.loading = 'lazy';
  img.alt = '';
  img.src = example.path + '.webp';
  const play = document.createElement('span');
  play.className = 'gallery-action';
  play.setAttribute('aria-hidden','true');
  const icon = document.createElement('i');
  icon.className = 'play-icon';
  play.append(icon);
  picture.append(img,play);
  const label = document.createElement('span');
  label.className = 'card-meta';
  label.textContent = example.category;
  const title = document.createElement('strong');
  title.textContent = example.title;
  card.append(picture,label,title);
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !hoverInput.matches) return;
    pointedCard = card;
    syncPreview();
  });
  card.addEventListener('pointerleave', () => { if (pointedCard === card) pointedCard = undefined; });
  card.addEventListener('focus', () => {
    if (card.matches(':focus-visible')) { focusedCard = card; syncPreview(); }
  });
  card.addEventListener('blur', () => { if (focusedCard === card) focusedCard = undefined; });
  card.addEventListener('click', () => { stopPreview(); openClip(example); });
  return card;
}
const cards = showcaseExamples.map(makeCard);
grid.append(...cards);
const galleryObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const card = entry.target.closest('.gallery-card');
    if (entry.intersectionRatio >= .25) visibleCases.add(card);
    else visibleCases.delete(card);
  }
  syncPreview();
}, {threshold: [0, .25], rootMargin: '-54px 0px 0px'});
cards.forEach(card => galleryObserver.observe(card.querySelector('.gallery-picture')));
const galleryDialogs = new MutationObserver(() => syncPreview());
document.querySelectorAll('dialog').forEach(dialog => galleryDialogs.observe(dialog, {attributes:true, attributeFilter:['open']}));
document.addEventListener('visibilitychange', () => syncPreview());
document.addEventListener('motionchange', () => syncPreview());
reducedMotion.addEventListener('change', () => syncPreview());
function filterGallery() {
  stopPreview();
  const matched = showcaseExamples.filter(item => galleryFilter === 'all' || item.group === galleryFilter);
  const visible = !expanded && galleryFilter === 'all' ? matched.slice(0,6) : matched;
  cards.forEach((card,i) => { card.hidden = !visible.includes(showcaseExamples[i]); });
  document.querySelector('#gallery-count').textContent = visible.length + ' of ' + matched.length + ' clips';
  expand.hidden = galleryFilter !== 'all' || matched.length <= 6;
  expand.setAttribute('aria-expanded', expanded);
  expand.textContent = expanded ? 'Show fewer clips' : 'Show all ' + matched.length + ' clips';
  syncPreview();
}
for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => {
    galleryFilter = button.dataset.filter;
    expanded = false;
    for (const choice of document.querySelectorAll('[data-filter]')) choice.setAttribute('aria-pressed', choice === button);
    filterGallery();
  });
}
expand.addEventListener('click', () => {
  const incoming = cards.find(card => card.hidden);
  expanded = !expanded;
  filterGallery();
  if (expanded && incoming) incoming.focus();
});
filterGallery();

for (const link of document.querySelectorAll('a[data-film-title]')) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (film.src !== link.href) film.src = link.href;
    document.querySelector('#film-title').textContent = 'EraseAnything · ' + link.dataset.filmTitle;
    filmDialog.showModal();
    film.play().catch(() => {});
  });
}
filmDialog.addEventListener('close', () => { film.pause(); });
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close();
  });
}
const mobileSections = document.querySelector('.mobile-sections');
mobileSections.querySelector('nav').addEventListener('click', () => { mobileSections.open = false; });
const readProgress = document.querySelector('.read-progress');
function updateProgress() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  readProgress.style.transform = 'scaleX(' + (scrollRange ? Math.min(1,window.scrollY / scrollRange) : 0) + ')';
}
window.addEventListener('scroll', updateProgress, {passive:true});
window.addEventListener('resize', updateProgress);
updateProgress();

const figureDialog = document.querySelector('#figure-dialog');
const enlargedFigure = document.querySelector('#enlarged-figure');

for (const button of document.querySelectorAll('[data-figure]')) {
  button.addEventListener('click', () => {
    document.querySelector('#figure-title').textContent = button.dataset.title;
    enlargedFigure.src = button.dataset.figure;
    enlargedFigure.alt = button.dataset.alt ?? button.querySelector('img').alt;
    figureDialog.showModal();
  });
}

const copy = document.querySelector('#copy-citation');
let resetCopyLabel;
copy.addEventListener('click', async () => {
  const code = document.querySelector('#bibtex');
  const status = document.querySelector('#copy-status');
  clearTimeout(resetCopyLabel);
  try {
    await navigator.clipboard.writeText(code.textContent);
    copy.textContent = 'Copied';
    status.textContent = 'BibTeX copied to clipboard.';
    resetCopyLabel = setTimeout(() => { copy.textContent = 'Copy BibTeX'; }, 1800);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'BibTeX selected. Use your browser’s copy shortcut.';
    copy.textContent = 'BibTeX selected';
    resetCopyLabel = setTimeout(() => { copy.textContent = 'Copy BibTeX'; }, 3200);
  }
});

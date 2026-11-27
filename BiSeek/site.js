'use strict';
const {cases, benchmarks, attention} = window.biSeekResearch;
const byId = id => document.getElementById(id);
const all = (selector, root=document) => Array.from(root.querySelectorAll(selector));
const el = (tag, text, cls) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (cls) node.className = cls;
  return node;
};
function setPressed(group, active) {
  all('button', group).forEach(btn => btn.setAttribute('aria-pressed', String(btn === active)));
}
function updateImage(id, path, description) {
  const image = byId(id);
  if (image.getAttribute('src') !== path) image.src = path;
  image.alt = description;
}
function fillSelect(select, options) {
  select.replaceChildren(...options.map(([value, text]) => new Option(text, value)));
}
const themeBtn = byId('theme');
function syncTheme() {
  const isLight = document.documentElement.dataset.theme === 'light';
  themeBtn.setAttribute('aria-label', 'Switch to ' + (isLight ? 'dark' : 'light') + ' theme');
  document.querySelector('meta[name="theme-color"]').content = isLight ? '#fcfdfd' : '#0c1115';
}
themeBtn.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('biseek-theme', root.dataset.theme); } catch {}
  syncTheme();
});
syncTheme();
all('.menu a').forEach(a => a.addEventListener('click', () => {a.closest('details').open = false;}));

let selectedTask = 'STVG';
let selectedCase = cases.find(c => c.id === 'animal-interaction');
let caseFrame = 2, casePlaying = false, caseVisible = false;
const caseMemory = {STVG:'animal-interaction', RVOS:'human-intervention', VTG:'action-chain'};
const caseGroup = byId('case-rail');
const compare = byId('comparator');
const comparisonPair = byId('case-pair');
const wipeControl = comparisonPair.querySelector('.wipe-control');
const wipeRange = byId('wipe-position');
function setLayout(layout) {
  comparisonPair.dataset.layout = layout;
  wipeControl.hidden = layout !== 'wipe';
  setPressed(byId('case-layout'), byId('case-layout').querySelector('[data-layout="' + layout + '"]'));
}
function moveDivider() {
  comparisonPair.style.setProperty('--divider', wipeRange.value + '%');
  wipeRange.setAttribute('aria-valuetext', wipeRange.value + '% of the comparison method visible');
}
wipeRange.addEventListener('input', moveDivider);
byId('case-layout').addEventListener('click', event => {
  const button = event.target.closest('button[data-layout]');
  if (button) setLayout(button.dataset.layout);
});
setLayout(matchMedia('(max-width: 47rem)').matches ? 'wipe' : 'pair');
moveDivider();
const metrics = {STVG:'vIoU', RVOS:'J&F', VTG:'tIoU'};
function changeTask(task) {
  selectedTask = task;
  setPressed(byId('task-bar'),document.querySelector('[data-task="' + task + '"]'));
  const entries = cases.filter(c => c.task === task);
  caseGroup.replaceChildren(...entries.map(item => {
    const btn = el('button');
    const img = el('img'); img.loading='lazy'; img.alt=''; img.src=item.thumb;
    btn.append(img,el('span',item.title));
    btn.dataset.case = item.id;
    btn.addEventListener('click', () => selectCase(item));
    return btn;
  }));
  selectCase(entries.find(item => item.id === caseMemory[task]) || entries[0]);
}
function selectCase(item) {
  selectedCase = item;
  caseMemory[selectedTask] = item.id;
  caseFrame = 2; casePlaying = false;
  const spatial = selectedTask !== 'VTG';
  setPressed(caseGroup,caseGroup.querySelector('[data-case="' + item.id + '"]'));
  byId('case-dataset').textContent = item.dataset;
  byId('case-query').textContent = '“' + item.query + '”';
  byId('spatial-pane').hidden = !spatial;
  byId('comparator-control').hidden = !spatial;
  byId('temporal-pane').hidden = spatial;
  if (!spatial) {renderTimeline(); return;}
  const others = item.methods.filter(m => m.id !== 'BiSeek');
  const options=others.map(m => [m.id,m.name]);
  if (selectedTask === 'STVG') options.unshift(['RGB','Input frame']);
  fillSelect(compare,options);
  compare.value = others.reduce((best,m) => (m.score ?? -1) > (best.score ?? -1) ? m : best, others[0]).id;
  drawComparison();
}
function drawComparison() {
  const ours = selectedCase.methods.find(m => m.id === 'BiSeek');
  const other = compare.value === 'RGB'
    ? {id:'RGB',name:'Input frame',score:null,frames:selectedCase.frames.map(f=>f.image)}
    : selectedCase.methods.find(m => m.id === compare.value);
  const time = selectedCase.frames[caseFrame].time;
  const metricLabel = score => score == null ? 'Reference' : score.toFixed(2) + ' ' + metrics[selectedTask];
  updateImage('base-img',other.frames[caseFrame],other.name + ' · ' + selectedCase.title + ' · ' + time);
  updateImage('ours-img',ours.frames[caseFrame],ours.name + ' · ' + selectedCase.title + ' · ' + time);
  byId('base-name').textContent = other.name;
  byId('base-score').textContent = other.id === 'RGB' ? '' : metricLabel(other.score);
  byId('ours-score').textContent = metricLabel(ours.score);
  byId('case-frame').value = caseFrame;
  byId('case-time').textContent = time;
  const play=byId('case-play');
  play.replaceChildren(el('span',null,casePlaying ? 'pause-icon' : 'play-icon'),document.createTextNode(casePlaying ? 'Pause samples' : 'Play samples'));
  play.firstChild.setAttribute('aria-hidden','true');
}
function renderTimeline() {
  const item = selectedCase;
  const strip = byId('timeline-images');
  const spans = byId('time-spans');
  // Unrounded RGB time_sec from the figure provenance, measured in the evaluated clip.
  const times = JSON.parse(byId('timing-seconds').textContent)[item.id];
  const reliable = Array.isArray(times) && times.length === item.frames.length &&
    times.every(t => Number.isFinite(t) && t >= 0 && t <= item.duration);
  const samples = item.frames.map((frame, index) => {
    const sample = el(reliable ? 'button' : 'figure');
    if (reliable) {
      sample.type = 'button';
      sample.setAttribute('aria-label', 'Frame ' + (index + 1) + ', ' + frame.time);
      sample.addEventListener('click', () => selectSample(index));
      sample.addEventListener('keydown', event => {
        const last = item.frames.length - 1;
        const next = {ArrowLeft:Math.max(index - 1, 0), ArrowRight:Math.min(index + 1, last), Home:0, End:last}[event.key];
        if (next === undefined) return;
        event.preventDefault();
        samples[next].focus();
        selectSample(next);
      });
    }
    const image = el('img');
    image.alt = reliable ? '' : item.title + ' at ' + frame.time;
    image.decoding = 'async';
    image.src = frame.image;
    sample.append(image, el(reliable ? 'span' : 'figcaption', frame.time));
    return sample;
  });
  strip.replaceChildren(...samples);
  const rows = item.methods.map(method => {
    const row = el('div',null,'span-row');
    row.dataset.model = method.id;
    const track = el('div',null,'span-track');
    const start = Math.max(0,Math.min(item.duration,method.span[0]));
    const end = Math.max(start,Math.min(item.duration,method.span[1]));
    const bar = el('i');
    bar.style.left = start / item.duration * 100 + '%';
    bar.style.width = (end - start) / item.duration * 100 + '%';
    track.setAttribute('aria-hidden','true');
    track.append(bar);
    const interval = method.span[0].toFixed(2) + '–' + method.span[1].toFixed(2) + ' s';
    const value = el('span',interval);
    row.title = interval + (method.score != null ? ' · ' + method.score.toFixed(2) + ' tIoU' : '');
    if (method.score != null) value.append(el('small',method.score.toFixed(2) + ' tIoU'));
    const label = el('div',null,'timing-method');
    label.append(el('strong',method.name));
    if (reliable) {
      label.append(el('span',null,'timing-membership'));
      track.append(el('b',null,'timing-marker'));
    }
    row.append(label,track,value);
    return row;
  });
  spans.replaceChildren(...rows);
  byId('timing-prompt').hidden = !reliable;
  byId('timing-summary').textContent = '';
  function selectSample(index) {
    const seconds = times[index];
    samples.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    spans.style.setProperty('--timing-position', seconds / item.duration * 100 + '%');
    const insideMethods = [];
    rows.forEach((row, i) => {
      const method = item.methods[i];
      const inside = seconds >= method.span[0] && seconds < method.span[1];
      row.dataset.inside = String(inside);
      row.querySelector('.timing-membership').textContent = inside ? 'Inside interval' : 'Outside interval';
      if (inside) insideMethods.push(method.name);
    });
    byId('timing-summary').textContent = item.frames[index].time + '. ' +
      (insideMethods.length ? 'Inside the intervals for ' + insideMethods.join(', ') + '.' : 'Outside every interval.');
  }
  if (reliable) selectSample(Math.min(2, samples.length - 1));
}
compare.addEventListener('change', drawComparison);
byId('case-frame').addEventListener('input', event => {caseFrame=Number(event.target.value);casePlaying=false;drawComparison();});
byId('case-play').addEventListener('click',()=>{casePlaying=!casePlaying;drawComparison();});
all('[data-task]').forEach(btn => btn.addEventListener('click',()=>changeTask(btn.dataset.task)));
new IntersectionObserver(([entry]) => {caseVisible=entry.isIntersecting;}).observe(byId('spatial-pane'));
changeTask(selectedTask);
window.setInterval(() => {
  if (document.hidden || byId('viewer').open) return;
  if (caseVisible && casePlaying && selectedTask !== 'VTG') {caseFrame=(caseFrame+1)%selectedCase.frames.length; drawComparison();}
},800);

const stages = {
  a:['Bidirectional video–query encoding','Bidirectional attention lets native frame boundaries and patches incorporate the referring query before any readout.'],
  b:['Temporal extent readout','Start and end scores are read from native unit boundaries. The decoder selects an ordered pair to delimit the event.'],
  c:['Time-addressed box geometry','At each requested time, a frame query reads nearby spatial patches to recover the target box.'],
  d:['SAM 3 grounding and set decoding','The query state and endpoint states condition a SAM 3 decoder alongside independently encoded image features to predict target masks.']
};
const methodMap = document.querySelector('.method-map');
const stageMenu = document.querySelector('.stage-list');
const tourControl = byId('method-tour');
let currentStage = 'a', touring = false, methodVisible = false, methodTimer;
const stageSequence = Object.keys(stages);
function selectStage(stage) {
  currentStage = stage;
  methodMap.dataset.region = stage;
  setPressed(stageMenu, stageMenu.querySelector('[data-stage="' + stage + '"]'));
  setPressed(methodMap, methodMap.querySelector('button[data-region="' + stage + '"]'));
  updateImage('stage-image','assets/method/'+stage+'.webp',stages[stage][0]+' from the BiSeek paper.');
  byId('stage-title').textContent = stages[stage][0];
  byId('stage-text').textContent = stages[stage][1];
}
function syncMethodTour() {
  clearTimeout(methodTimer);
  tourControl.textContent = touring ? 'Pause walkthrough' : 'Play walkthrough';
  tourControl.setAttribute('aria-pressed',String(touring));
  if (!touring || !methodVisible || document.hidden || byId('viewer').open) return;
  methodTimer = setTimeout(() => {
    const next = stageSequence.indexOf(currentStage) + 1;
    if (next < stageSequence.length) selectStage(stageSequence[next]);
    else touring = false;
    syncMethodTour();
  }, 3600);
}
for (const button of [...all('[data-stage]',stageMenu), ...all('button[data-region]',methodMap)]) {
  button.addEventListener('click', () => {
    touring = false;
    selectStage(button.dataset.stage || button.dataset.region);
    syncMethodTour();
  });
}
tourControl.addEventListener('click', () => {
  touring = !touring;
  if (touring && currentStage === stageSequence.at(-1)) selectStage(stageSequence[0]);
  syncMethodTour();
});
new IntersectionObserver(([entry]) => {
  methodVisible = entry.isIntersecting; syncMethodTour();
}, {threshold:.25}).observe(document.querySelector('.method-lenses'));
document.addEventListener('visibilitychange',syncMethodTour);
new MutationObserver(syncMethodTour).observe(byId('viewer'),{attributes:true,attributeFilter:['open']});
let attUnit=0;
const attentionPlayback = byId('att-play');
const attentionReduced = matchMedia('(prefers-reduced-motion: reduce)');
let attentionPlaying = !attentionReduced.matches;
let attentionVisible = false;
let attentionTimer;
function syncAttentionPlayback() {
  clearInterval(attentionTimer);
  const active = attentionPlaying && attentionVisible && !document.hidden && !byId('viewer').open;
  attentionPlayback.textContent = attentionPlaying ? 'Pause units' : 'Play units';
  attentionPlayback.setAttribute('aria-pressed', String(attentionPlaying));
  if (active) {
    attentionTimer = setInterval(() => {
      attUnit = (attUnit + 1) % attention[byId('att-case').value].frames.length;
      drawAttention();
    }, 1650);
  }
}
attentionPlayback.addEventListener('click', () => {
  attentionPlaying = !attentionPlaying;
  syncAttentionPlayback();
});
attentionReduced.addEventListener('change', event => {
  if (event.matches) { attentionPlaying = false; syncAttentionPlayback(); }
});
new IntersectionObserver(([entry]) => {
  attentionVisible = entry.isIntersecting;
  syncAttentionPlayback();
}, {threshold: .35}).observe(document.querySelector('.att-grid'));
document.addEventListener('visibilitychange', syncAttentionPlayback);
new MutationObserver(syncAttentionPlayback).observe(byId('viewer'), {attributes:true, attributeFilter:['open']});
const units=byId('unit-rail');
for(let i=0;i<4;i++){
  const btn=el('button','Unit '+(i+1));
  btn.addEventListener('click',()=>{attentionPlaying=false;syncAttentionPlayback();attUnit=i;drawAttention();});
  units.append(btn);
}
function drawAttention() {
  const item=attention[byId('att-case').value], frame=item.frames[attUnit];
  byId('att-query').textContent='“'+item.query+'”';
  byId('att-time').textContent=frame.t.toFixed(2)+' s';
  for(const key of ['rgb','causal','bi']) {
    const title={rgb:'Input frame',causal:'Causal query-only attention',bi:'Bidirectional query-boundary attention'}[key];
    updateImage('att-'+key,frame[key],title+' for unit '+(attUnit+1)+' of '+item.query+'.');
  }
  setPressed(units, units.children[attUnit]);
}
byId('att-case').addEventListener('change',()=>{attUnit=0;syncAttentionPlayback();drawAttention();});
drawAttention();

const dialog=byId('viewer'), media=byId('dialog-media');
function openViewer(event,title,content) {
  if (!dialog.showModal) return;
  event.preventDefault();
  byId('dialog-title').textContent=title;
  media.replaceChildren(content);
  document.body.classList.add('dialog-open');
  dialog.showModal();
}
byId('zoom-method').addEventListener('click',event=>{
  const zoom=el('button',null,'figure-zoom');zoom.setAttribute('aria-label','Zoom in on the entire architecture diagram');
  const img=el('img');img.src=byId('zoom-method').getAttribute('href');img.alt='Full BiSeek architecture, showing joint encoding and the three structure-preserving readouts.';
  zoom.append(img);
  zoom.addEventListener('click',()=>{const large=zoom.classList.toggle('expanded');zoom.setAttribute('aria-label',large?'Zoom out':'Zoom in on the entire architecture diagram');});
  openViewer(event,'BiSeek · Method overview',zoom);
});
byId('close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{const video=media.querySelector('video');if(video)video.pause();media.replaceChildren();document.body.classList.remove('dialog-open');});

byId('copy-cite').addEventListener('click', async () => {
  const bib=byId('bibtex'), feedback=byId('copy-feedback');
  const selection=window.getSelection(), range=document.createRange();
  range.selectNodeContents(bib);selection.removeAllRanges();selection.addRange(range);
  let copied=false;
  try {copied=document.execCommand('copy');} catch {}
  if (copied) {selection.removeAllRanges();feedback.textContent='Copied.';return;}
  feedback.textContent='Citation selected for copying.';
  if (navigator.clipboard) {
    try {await navigator.clipboard.writeText(bib.textContent);feedback.textContent='Copied.';}catch {}
  }
});
const navLinks=all('.nav-main a');
const sectionObserver=new IntersectionObserver(entries=>{
  for(const entry of entries) if(entry.isIntersecting) navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));
},{rootMargin:'-10% 0px -62% 0px'});
navLinks.forEach(a=>sectionObserver.observe(document.querySelector(a.hash)));

(() => {
  const root = document.querySelector('#score-explorer');
  const groupTabs = document.querySelector('#score-groups');
  const datasetMenu = document.querySelector('#score-dataset');
  const metricMenu = document.querySelector('#score-metric');
  const tableRegion = document.querySelector('#score-table');
  const chartRegion = document.querySelector('#score-chart');
  const chartBody = document.querySelector('#metric-ranking');
  const reading = document.querySelector('#score-reading');
  const exampleLink = document.querySelector('#score-example-link');
  const viewButtons = [...root.querySelectorAll('[data-view]')];
  const groups = [
    { id: 'object', label: 'Object removal', data: window.objectEvidence },
    ...window.taskEvidence.map(dataset => ({
      id: dataset.id.replace('task-', ''), label: dataset.title.replace(' removal', ''), data: [dataset]
    })),
    { id: 'overlay', label: 'Mixed overlays', data: window.overlayEvidence },
    { id: 'keep', label: 'Preservation', data: [...window.framePreservationEvidence, ...window.identityEvidence] },
    { id: 'speed', label: 'Throughput', data: window.speedEvidence },
    { id: 'studies', label: 'Ablations', data: window.studyEvidence }
  ];
  const tabs = [];
  let activeGroup = groups[0];
  let dataset;
  let view = 'chart';
  const tourButton = document.querySelector('#score-tour');
  const playlist = [
    'rose', 'task-subtitle', 'task-logo', 'task-watermark', 'task-banner',
    'overlay-all', 'task-frame-preservation', 'vor', 'overlay-short', 'overlay-long',
    'object-speed', 'overlay-speed', 'study-occupancy'
  ];
  const dwell = 5800;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let touring = true;
  let explicitPlay = false;
  let tourTimer;
  let tourProgress;
  let animation;
  let finishScores;
  const allowed = () => !reduced.matches && !document.documentElement.classList.contains('motion-paused');
  const panelVisible = () => visible && !document.hidden && !document.querySelector('dialog[open]');

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function format(value, metric) {
    return value === null ? '—' : value.toLocaleString('en-US', {
      minimumFractionDigits: metric.digits, maximumFractionDigits: metric.digits, useGrouping: false
    });
  }
  function arrow(metric) { return metric.better === 'higher' ? '↑' : '↓'; }
  function fillMenu(menu, options) {
    menu.replaceChildren(...options.map(item => new Option(item.title, item.id)));
  }
  function makeTable() {
    const table = node('table');
    table.setAttribute('aria-label', dataset.title + ' results');
    const heading = table.createTHead().insertRow();
    const first = node('th', activeGroup.id === 'studies' ? 'Configuration' : 'Method');
    first.scope = 'col';
    heading.append(first);
    const winners = dataset.metrics.map((metric, i) => {
      const head = node('th', metric.label);
      head.scope = 'col';
      head.append(node('small', [metric.unit, arrow(metric)].filter(Boolean).join(' ')));
      heading.append(head);
      const values = dataset.rows.map(row => row.values[i]).filter(value => value !== null);
      if (values.length < 2 || dataset.matchedCohort === false) return null;
      const best = metric.better === 'higher' ? Math.max(...values) : Math.min(...values);
      return format(best, metric);
    });
    const body = table.createTBody();
    for (const item of dataset.rows) {
      const row = body.insertRow();
      if (item.ours) row.className = 'reference-row';
      const name = node('th', item.name);
      name.scope = 'row';
      if (item.group) name.append(node('small', item.group, 'cue-label'));
      row.append(name);
      item.values.forEach((value, index) => {
        const cell = row.insertCell();
        const output = format(value, dataset.metrics[index]);
        if (output === winners[index]) cell.append(node('strong', output));
        else cell.textContent = output;
      });
    }
    tableRegion.replaceChildren(table);
  }

  function settleScores() {
    cancelAnimationFrame(animation);
    if (finishScores) finishScores();
    finishScores = null;
    chartBody.classList.remove('bars-in');
  }
  function makeChart() {
    settleScores();
    const index = metricMenu.selectedIndex;
    const metric = dataset.metrics[index];
    const rows = dataset.rows.filter(row => row.values[index] !== null);
    const ours = rows.find(row => row.ours);
    reading.hidden = !ours;
    if (ours) {
      document.querySelector('#reading-method').textContent = ours.name;
      document.querySelector('#reading-score').textContent = format(ours.values[index], metric);
      document.querySelector('#reading-unit').textContent = metric.unit;
      document.querySelector('#reading-metric').textContent = metric.label + ' · ' + (metric.better === 'higher' ? 'higher' : 'lower') + ' is better';
    }
    if (dataset.matchedCohort !== false) {
      rows.sort((a, b) => metric.better === 'higher' ? b.values[index] - a.values[index] : a.values[index] - b.values[index]);
    }
    const legend = document.querySelector('#score-legend');
    legend.replaceChildren();
    const hasGuidance = rows.some(row => row.group);
    legend.hidden = !hasGuidance;
    if (hasGuidance) {
      for (const [label, style] of [['Instruction', 'instruction'], ['Box', 'box'], ['EraseAnything', 'model']]) {
        const present = rows.some(row => {
          if (style === 'model') return row.ours;
          return !row.ours && (row.group || '').toLowerCase().includes(style);
        });
        if (present) legend.append(node('span', label, 'key-' + style));
      }
    }
    const max = Math.max(0, ...rows.map(row => row.values[index]));
    const chart = node('ol', undefined, 'ranking');
    chart.setAttribute('aria-label', dataset.title + ' by ' + metric.label);
    const readings = rows.map((row, position) => {
      const item = node('li');
      const value = row.values[index];
      const formatted = format(value, metric);
      item.style.setProperty('--row-delay', position * 38 + 'ms');
      if (row.ours) item.className = 'reference-bar';
      else if (/box/i.test(row.group || '')) item.className = 'box-guided-bar';
      else if (/instruction/i.test(row.group || '')) item.className = 'instruction-bar';
      if (row.group) item.title = row.name + ' · ' + row.group;
      const track = node('span', undefined, 'score-track');
      const bar = node('i');
      bar.style.width = (max ? 100 * value / max : 0) + '%';
      track.append(bar);
      track.setAttribute('aria-hidden','true');
      const reading = node('strong', formatted);
      reading.setAttribute('aria-hidden', 'true');
      item.append(node('span', row.name, 'score-name'), track, reading, node('span', formatted, 'sr-only'));
      chart.append(item);
      return {reading, value, formatted};
    });
    chartBody.replaceChildren(chart);
    if (!panelVisible() || !allowed()) return;
    chartBody.classList.add('bars-in');
    finishScores = () => readings.forEach(({reading, formatted}) => { reading.textContent = formatted; });
    const started = performance.now();
    function tick(now) {
      readings.forEach(({reading, value, formatted}, position) => {
        const t = Math.min(1, Math.max(0, (now - started - position * 38) / 820));
        reading.textContent = t === 1 ? formatted : format(value * (1 - (1 - t) ** 3), metric);
      });
      if (now - started < 820 + (rows.length - 1) * 38) animation = requestAnimationFrame(tick);
      else settleScores();
    }
    tick(started);
  }
  function changeView(next) {
    view = next;
    document.querySelector('#score-panel').dataset.view = next;
    tableRegion.hidden = view !== 'table';
    chartRegion.hidden = view !== 'chart';
    for (const button of viewButtons) button.setAttribute('aria-pressed', button.dataset.view === view);
    if (view === 'chart') makeChart();
    else settleScores();
    document.querySelector('#score-footnote').textContent = view === 'chart'
      ? (dataset.matchedCohort === false ? 'Methods follow the order in the supplement.' : 'Methods are ordered by the selected metric.')
      : (dataset.matchedCohort === false ? dataset.source : 'Bold marks the best displayed result in each comparison.');
  }
  function showDataset(resetMetric = false) {
    dataset = activeGroup.data.find(item => item.id === datasetMenu.value);
    document.querySelector('#score-context').textContent = dataset.description;
    const hasExample = ['object','subtitle','logo','watermark','banner','overlay','keep'].includes(activeGroup.id);
    exampleLink.hidden = !hasExample;
    const previousMetric = resetMetric ? null : metricMenu.value;
    fillMenu(metricMenu, dataset.metrics.map(metric => ({
      id: metric.key,
      title: metric.label + ' ' + arrow(metric) + (metric.unit ? ' (' + metric.unit + ')' : '')
    })));
    if (dataset.metrics.some(metric => metric.key === previousMetric)) metricMenu.value = previousMetric;
    makeTable();
    changeView(view);
    document.dispatchEvent(new CustomEvent('scoretaskchange', {detail:{group:activeGroup.id, dataset:dataset.id, manual:!touring}}));
  }
  function chooseGroup(index, datasetId) {
    activeGroup = groups[index];
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', i === index);
      tab.tabIndex = i === index ? 0 : -1;
    });
    document.querySelector('#score-panel').setAttribute('aria-labelledby', tabs[index].id);
    document.querySelector('#dataset-label').textContent = activeGroup.id === 'studies' ? 'Study' : 'Evaluation';
    fillMenu(datasetMenu, activeGroup.data);
    if (datasetId) datasetMenu.value = datasetId;
    showDataset(true);
  }
  groups.forEach((group, index) => {
    const tab = node('button', group.label);
    tab.type = 'button';
    tab.id = 'score-tab-' + group.id;
    tab.append(node('i', undefined, 'tour-meter'));
    tab.lastElementChild.setAttribute('aria-hidden', 'true');
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls','score-panel');
    tab.addEventListener('click', () => { holdTour(); chooseGroup(index); });
    tab.addEventListener('keydown', event => {
      const destinations = {ArrowLeft:(index + groups.length - 1) % groups.length, ArrowRight:(index + 1) % groups.length, Home:0, End:groups.length - 1};
      if (!Object.hasOwn(destinations,event.key)) return;
      event.preventDefault();
      holdTour();
      const next = destinations[event.key];
      tabs[next].focus();
      chooseGroup(next);
    });
    groupTabs.append(tab);
    tabs.push(tab);
  });
  function holdTour() {
    touring = false;
    explicitPlay = false;
    scheduleTour();
  }
  function scheduleTour() {
    clearTimeout(tourTimer);
    tourProgress?.cancel();
    const enabled = touring && (allowed() || explicitPlay) && view === 'chart';
    const running = enabled && panelVisible();
    tourButton.dataset.playing = String(enabled);
    tourButton.lastElementChild.textContent = enabled ? 'Pause tour' : 'Play tour';
    tourButton.setAttribute('aria-label', enabled ? 'Pause automatic result comparisons' : 'Play automatic result comparisons');
    root.classList.toggle('is-touring', running);
    tourButton.title = tourButton.getAttribute('aria-label');
    if (!running) return;
    const activeMeter = groupTabs.querySelector('[aria-selected=true] .tour-meter');
    if (allowed()) tourProgress = activeMeter.animate(
      [{transform:'scaleX(0)'}, {transform:'scaleX(1)'}], {duration:dwell, fill:'both'}
    );
    tourTimer = setTimeout(() => {
      const next = playlist[(playlist.indexOf(dataset.id) + 1) % playlist.length];
      const group = groups.findIndex(group => group.data.some(entry => entry.id === next));
      chooseGroup(group, next);
      scheduleTour();
    }, dwell);
  }
  exampleLink.addEventListener('click', () => {
    holdTour();
    document.dispatchEvent(new CustomEvent('scoretaskchange', {detail:{group:activeGroup.id, dataset:dataset.id, manual:!touring}}));
  });
  tourButton.addEventListener('click', () => {
    if (tourButton.dataset.playing === 'true') { holdTour(); return; }
    touring = true;
    explicitPlay = true;
    changeView('chart');
    scheduleTour();
  });
  for (const button of viewButtons) button.addEventListener('click', () => { holdTour(); changeView(button.dataset.view); });
  datasetMenu.addEventListener('change', () => { holdTour(); showDataset(); });
  metricMenu.addEventListener('change', () => { holdTour(); makeChart(); });
  for (const menu of [datasetMenu, metricMenu]) menu.addEventListener('focus', holdTour);
  chooseGroup(0);
  root.hidden = false;
  new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting && entry.intersectionRatio >= .16;
    if (visible && !wasVisible && view === 'chart') makeChart();
    if (!visible) settleScores();
    scheduleTour();
  }, {threshold:[0, .16]}).observe(root);
  function pendingMotion() {
    if (!panelVisible() || !allowed()) settleScores();
    scheduleTour();
  }
  document.addEventListener('motionchange', () => { explicitPlay = false; pendingMotion(); });
  document.addEventListener('visibilitychange', pendingMotion);
  const modalWatch = new MutationObserver(pendingMotion);
  document.querySelectorAll('dialog').forEach(dialog => modalWatch.observe(dialog, {attributes:true, attributeFilter:['open']}));
  scheduleTour();
})();

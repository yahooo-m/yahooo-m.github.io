'use strict';

(() => {
  const datasetMenu = byId('benchmark');
  const metricMenu = byId('benchmark-metric');
  const chart = byId('benchmark-chart');
  const tableView = byId('benchmark-table-view');
  const viewButtons = byId('bench-view');
  const ranking = byId('bench-ranking');
  const tourButton = byId('bench-tour');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const preferredMetrics = ['mIoU','m_vIoU','J&F'];
  const isBiSeek = row => row.name.startsWith('BiSeek-');
  let dataset, view = 'chart', onScreen = false, revealed = false;
  let tourEnabled = false, tourTimer;

  for (const [key,label] of [['VTG','Temporal grounding'],['STVG','Object localization'],['RVOS','Video segmentation']]) {
    const group = el('optgroup');
    group.label = label;
    benchmarks.filter(item => item.task === key).forEach(item => group.append(new Option(item.dataset,item.dataset)));
    datasetMenu.append(group);
  }

  function scheduleTour() {
    clearTimeout(tourTimer);
    const available = dataset.metric.length > 1;
    tourButton.hidden = !available || view !== 'chart';
    tourButton.textContent = tourEnabled ? 'Pause metric tour' : 'Play metric tour';
    tourButton.setAttribute('aria-pressed',String(tourEnabled));
    if (!tourEnabled || !available || !onScreen || document.hidden || view !== 'chart') return;
    tourTimer = setTimeout(() => {
      metricMenu.selectedIndex = (metricMenu.selectedIndex + 1) % dataset.metric.length;
      render();
    }, 7000);
  }

  function chooseDataset() {
    const previousMetric = metricMenu.value;
    dataset = benchmarks.find(item => item.dataset === datasetMenu.value);
    fillSelect(metricMenu,dataset.metric.map(metric => [metric,metric]));
    metricMenu.value = dataset.metric.includes(previousMetric)
      ? previousMetric
      : dataset.metric.find(metric => preferredMetrics.includes(metric)) || dataset.metric[0];
    render();
  }

  function renderTable(entries) {
    const table = byId('bench-table');
    table.replaceChildren();
    const header = table.createTHead().insertRow();
    for (const label of ['Method', ...dataset.metric]) {
      const th = el('th',label); th.scope = 'col'; header.append(th);
    }
    const maxima = dataset.metric.map((_,i) => Math.max(...dataset.rows.map(row => row.v[i] ?? -Infinity)));
    const body = table.createTBody();
    for (const entry of entries) {
      const row = body.insertRow();
      if (isBiSeek(entry)) row.className = 'ours';
      const name = el('th',entry.name); name.scope = 'row'; row.append(name);
      entry.v.forEach((value,i) => {
        const cell = row.insertCell();
        if (value === null) cell.textContent = '—';
        else if (value === maxima[i]) cell.append(el('strong',value.toFixed(1)));
        else cell.textContent = value.toFixed(1);
      });
    }
  }

  function render() {
    const i = metricMenu.selectedIndex;
    const metric = dataset.metric[i];
    const entries = [...dataset.rows].sort((a,b) => (b.v[i] ?? -Infinity) - (a.v[i] ?? -Infinity));
    const reported = entries.filter(row => Number.isFinite(row.v[i]));
    const comparison = reported.filter(row => !isBiSeek(row));
    const best = comparison[0]?.v[i];
    const leaders = comparison.filter(row => row.v[i] === best);
    const ours = reported.find(row => row.name === 'BiSeek-4B');
    const summary = byId('bench-summary');
    summary.replaceChildren();
    if (ours) {
      summary.append(el('b',ours.name + ' · ' + ours.v[i].toFixed(1) + '%'), ' ' + metric + ' on ' + dataset.dataset + '.');
    }
    if (leaders.length) {
      summary.append(' ' + leaders.map(row => row.name).join(' and ') + (leaders.length === 1 ? ' leads' : ' lead') + ' the listed baselines at ' + best.toFixed(1) + '%.');
    }
    byId('bench-chart-heading').textContent = dataset.dataset + ' · ' + metric + ' (%)';
    chart.querySelector('.series-best').hidden = leaders.length === 0;
    chart.querySelector('.series-other').hidden = comparison.length === leaders.length;
    ranking.replaceChildren(...reported.map((entry,position) => {
      const kind = isBiSeek(entry) ? 'ours' : entry.v[i] === best ? 'best' : 'other';
      const row = el('li'); row.className = 'bench-bar-row';
      row.dataset.series = kind;
      const label = el('span',entry.name,'bench-bar-name');
      if (kind === 'best') label.append(el('span',' · top listed baseline','sr-only'));
      const track = el('div',null,'bench-bar-track'), bar = el('i');
      track.setAttribute('aria-hidden','true');
      bar.style.width = entry.v[i] + '%';
      bar.style.setProperty('--bar-delay',Math.min(9,position) * 12 + 'ms');
      track.append(bar);
      const score = el('strong',entry.v[i].toFixed(1),'bench-bar-value');
      score.setAttribute('aria-hidden','true');
      label.append(el('span',' · ' + score.textContent + '%','sr-only'));
      row.append(label,track,score);
      return row;
    }));
    renderTable(entries);
    scheduleTour();
  }

  datasetMenu.addEventListener('change',() => {tourEnabled = false;chooseDataset();});
  metricMenu.addEventListener('change',() => {tourEnabled = false;render();});
  all('button',viewButtons).forEach(button => button.addEventListener('click',() => {
    view = button.dataset.view;
    tourEnabled = false;
    setPressed(viewButtons,button);
    chart.hidden = view !== 'chart'; tableView.hidden = view !== 'table';
    scheduleTour();
  }));
  tourButton.addEventListener('click',() => {tourEnabled = !tourEnabled;scheduleTour();});
  reducedMotion.addEventListener('change',event => {if (event.matches) {tourEnabled = false;scheduleTour();}});
  document.addEventListener('visibilitychange',scheduleTour);
  chooseDataset();
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen && !revealed) {
      revealed = true;
      chart.classList.add('bars-in');
    }
    scheduleTour();
  }, {threshold:0.01}).observe(chart);
})();

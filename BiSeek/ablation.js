'use strict';

(() => {
  // Paired BiSeek-2B rows from the preprint. The first item in each pair
  // corresponds to the open marker and the second to the filled marker.
  const comparisons = [
    {
      condition: 'Both encoder variants condition the mask decoder on one query state and two unit-boundary states per unit. This fixes the three-slot readout while comparing causal and bidirectional attention.',
      metric: 'Mask J&F (%)', from: 'Causal encoder', to: 'Bidirectional encoder',
      table: 'Table 7(a,b)', page: 10,
      rows: [
        ['MeViS',60.6,62.1],
        ['ReVOS',68.0,69.6],
        ['GroundMoRe · sequential',61.2,62.8],
        ['GroundMoRe · causal',54.9,56.4]
      ]
    },
    {
      condition: 'With matched training budgets, the temporal readout uses either one shared end state or separate native start and end states to score both event boundaries.',
      metric: 'Mean temporal IoU (%)', from: 'Shared end state', to: 'Separate start/end states',
      table: 'Table 5(a)', page: 9,
      rows: [
        ['Charades-TimeLens',51.8,58.3],
        ['VidSTG',47.6,52.8],
        ['HC-STVG v2',57.2,63.1]
      ]
    },
    {
      condition: 'Under joint training, the box readout draws patches from the nearest unit alone or also from its immediate neighbors. Spatial IoU is measured within the ground-truth time interval.',
      metric: 'Spatial IoU (%)', from: 'Nearest unit (r = 0)', to: 'Local memory (r = 1)',
      table: 'Table 6(a)', page: 9,
      rows: [
        ['VidSTG',52.7,62.3],
        ['HC-STVG v2',72.1,76.6]
      ]
    }
  ];
  const tabs = all('.ab-switch [role="tab"]');
  function draw(index) {
    const item = comparisons[index];
    tabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected',String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    byId('ab-study').setAttribute('aria-labelledby',tabs[index].id);
    byId('ab-condition').textContent = item.condition;
    byId('ab-metric').textContent = item.metric;
    byId('ab-from').textContent = item.from;
    byId('ab-to').textContent = item.to;
    const source = byId('ab-source');
    source.textContent = item.table;
    source.href = 'assets/biseek-preprint.pdf#page=' + item.page;
    byId('ab-pairs').replaceChildren(...item.rows.map(([name,from,to]) => {
      const row = el('li',null,'ab-row');
      const delta = (to - from).toFixed(1);
      row.setAttribute('aria-label',name + ', ' + item.from + ': ' + from.toFixed(1) + '%. ' + item.to + ': ' + to.toFixed(1) + '%. Gain ' + delta + ' percentage points.');
      const plot = el('div',null,'ab-track');
      plot.setAttribute('aria-hidden','true');
      plot.style.setProperty('--start',((from - 40) / 40 * 100) + '%');
      plot.style.setProperty('--end',((to - 40) / 40 * 100) + '%');
      plot.append(el('span',null,'ab-join'),el('i',null,'ab-before'),el('i',null,'ab-after'));
      row.append(el('span',name,'ab-name'),el('span',from.toFixed(1),'ab-number before'),plot,el('span',to.toFixed(1),'ab-number after'),el('strong','+' + delta,'ab-delta'));
      return row;
    }));
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click',() => draw(index));
    tab.addEventListener('keydown',event => {
      const next = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      draw(next);
      tabs[next].focus();
    });
  });
  draw(0);
})();

(() => {
  const viewer = document.querySelector('#visual-results');
  if (!viewer) return;

  const scenes = [
    {
      id: 'railing',
      label: 'Banner over a railing',
      benchmark: 'EraseKeep-Bench · Frame 430 · 17.20 s',
      note: 'Follow the vertical posts behind the banner. The lines remain visible in the EraseAnything result, while the other reconstructions soften, break, or smear them.',
      panels: [
        ['input', 'Input', 'A white banner with purple lettering crosses the posts.'],
        ['propainter', 'ProPainter', 'The post edges appear softened.'],
        ['diffueraser', 'DiffuEraser', 'The wall texture continues through gaps in the railing.'],
        ['minimax', 'MiniMax-Remover', 'Vertical red and grey streaks cross the stonework.'],
        ['ours', 'EraseAnything', 'The posts and the stone edge are visible where the banner was.'],
        ['clean', 'Clean target', 'The reference frame shows the railing before the overlay was added.'],
      ],
    },
    {
      id: 'mirror-lamp',
      label: 'Lamp beside a mirror',
      benchmark: 'ROSE · Frame 45 · 3.00 s',
      note: 'Look along the right edge of the round mirror. ROSE and EraseAnything remove the lamp. The shade remains visible in the EffectErase and MiniMax-Remover outputs.',
      panels: [
        ['input', 'Input', 'A dark lamp stands in front of the right edge of a round mirror.'],
        ['rose', 'ROSE', 'The lamp is removed beside the mirror.'],
        ['effecterase', 'EffectErase', 'The dark lampshade remains visible.'],
        ['minimax', 'MiniMax-Remover', 'A rectangular shade remains in front of the mirror.'],
        ['ours', 'EraseAnything', 'The lamp is removed, leaving the mirror and cabinet visible.'],
        ['clean', 'Clean target', 'A round mirror and wooden cabinet are visible without the lamp.'],
      ],
    },
  ];

  function create(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const section = create('section', 'qual-panel');
  const heading = create('h3', 'qual-heading', 'Side-by-side comparisons');
  heading.id = 'qual-heading';
  section.setAttribute('aria-labelledby', heading.id);
  const toolbar = create('div', 'qual-toolbar');
  const choices = create('div', 'qual-scenes');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Comparison scene');
  const zoom = create('button', 'qual-zoom');
  zoom.type = 'button';
  const description = create('p', 'qual-observation');
  const metadata = create('p', 'qual-metadata');
  const gallery = create('div', 'qual-grid');
  gallery.id = 'qual-gallery';
  zoom.setAttribute('aria-controls', gallery.id);
  zoom.textContent = 'Railing detail';

  const visibleTiles = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !entry.target.isConnected) continue;
      const image = entry.target.querySelector('img');
      image.src = image.dataset.src;
      visibleTiles.unobserve(entry.target);
    }
  });
  let active = scenes[0];
  let zoomed = true;

  function updateFraming() {
    const canZoom = active.id === 'railing';
    const showDetail = canZoom && zoomed;
    zoom.hidden = !canZoom;
    zoom.setAttribute('aria-pressed', String(showDetail));
    gallery.classList.toggle('qual-detail', showDetail);
    visibleTiles.disconnect();
    for (const tile of gallery.children) {
      const image = tile.querySelector('img');
      image.dataset.src = image.dataset.base + (showDetail ? '-detail.webp' : '.webp');
      if (image.getAttribute('src') !== image.dataset.src) visibleTiles.observe(tile);
    }
    metadata.textContent = active.benchmark + (showDetail ? ' · Matched 180 × 120 px crop' : ' · Full frame');
  }

  function render(scene) {
    active = scene;
    for (const button of choices.children) {
      button.setAttribute('aria-pressed', String(button.dataset.qualScene === scene.id));
    }
    description.textContent = scene.note;
    const tiles = scene.panels.map(([id, name, observation]) => {
      const tile = create('figure', 'qual-tile' + (id === 'ours' ? ' qual-ours' : ''));
      const caption = create('figcaption', 'qual-name', name);
      const view = create('div', 'qual-view');
      const image = create('img', 'qual-image');
      image.alt = name + '. ' + observation;
      image.dataset.base = './assets/result-comparisons/' + scene.id + '-' + id;
      image.fetchPriority = 'low';
      image.decoding = 'async';
      view.append(image);
      if (scene.id === 'railing' && id === 'input') {
        const mark = create('span', 'qual-region');
        mark.setAttribute('aria-hidden', 'true');
        view.append(mark);
      }
      tile.append(caption, view);
      return tile;
    });
    gallery.replaceChildren(...tiles);
    updateFraming();
  }

  for (const scene of scenes) {
    const button = create('button', 'qual-choice', scene.label);
    button.type = 'button';
    button.dataset.qualScene = scene.id;
    button.setAttribute('aria-controls', gallery.id);
    button.addEventListener('click', () => render(scene));
    choices.append(button);
  }

  zoom.addEventListener('click', () => {
    zoomed = !zoomed;
    updateFraming();
  });
  toolbar.append(choices, zoom);
  section.append(heading, toolbar, metadata, gallery, description);
  viewer.append(section);
  render(active);
})();

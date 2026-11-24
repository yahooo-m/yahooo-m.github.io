(() => {
  const get = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const figures = [...document.querySelectorAll('dialog')];
  const players = [];

  function makePlayer({panel, control, labels, advance, interval, firstStep}) {
    let visible = false;
    let manualHold = false;
    let explicitPlay = false;
    let timeout;
    let playing = false;

    function cancel() {
      clearTimeout(timeout);
      timeout = undefined;
    }

    function refresh() {
      const motionAllowed = !document.documentElement.classList.contains('motion-paused');
      const active = visible && !document.hidden && !figures.some(dialog => dialog.open) &&
        !manualHold && ((motionAllowed && !reduced.matches) || explicitPlay);
      if (active && timeout === undefined) {
        firstStep?.();
        const delay = interval();
        panel.style.setProperty('--tick-length', delay + 'ms');
        timeout = setTimeout(() => {
          timeout = undefined;
          advance();
          refresh();
        }, delay);
      } else if (!active) {
        cancel();
      }
      playing = active;
      panel.classList.toggle('motion-running', active);
      control.textContent = active ? labels.pause : labels.play;
    }

    function hold() {
      manualHold = true;
      explicitPlay = false;
      refresh();
    }

    control.addEventListener('click', () => {
      if (playing) { hold(); return; }
      manualHold = false;
      explicitPlay = true;
      refresh();
    });

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .18;
      refresh();
    }, {threshold: [0, .18], rootMargin: '-4% 0px -4% 0px'}).observe(panel);

    const restartClock = () => { cancel(); refresh(); };
    players.push({refresh, preferenceChanged() { explicitPlay = false; refresh(); }});
    refresh();
    return {hold, restartClock};
  }

  const trajectory = get('trajectory-frames');
  const trajectoryCard = trajectory.closest('.trajectory-card');
  const steps = [...trajectoryCard.querySelectorAll('[data-step]')];
  const taskButtons = [...trajectoryCard.querySelectorAll('[data-trajectory-task]')];
  const stateImage = get('state-image');
  const estimateImage = get('estimate-image');
  const names = {object: 'Park pedestrian · Mask guided', overlay: 'Dog in the park · Text instruction'};
  const sigmas = ['1.000', '0.938', '0.834', '0.628', '0.000'];
  let currentStep = 0;
  function tile(index) {
    return (index % 3) * 50 + '% ' + Math.floor(index / 3) * 50 + '%';
  }
  steps.forEach((button, i) => {
    const thumbnail = document.createElement('span');
    thumbnail.className = 'step-thumbnail';
    thumbnail.setAttribute('aria-hidden', 'true');
    thumbnail.style.backgroundPosition = tile(i);
    button.prepend(thumbnail);
  });

  function displayStep(next) {
    currentStep = next;
    const source = next === 0;
    stateImage.style.backgroundPosition = tile(next);
    estimateImage.style.backgroundPosition = tile(source ? 0 : next + 4);
    stateImage.setAttribute('aria-label', source ? 'Source frame' : 'Decoded sampler state after update ' + next);
    estimateImage.setAttribute('aria-label', source ? 'Source frame' : 'Predicted clean image at update ' + next);
    stateImage.nextElementSibling.textContent = source ? 'Source frame' : 'Updated sampler state';
    estimateImage.nextElementSibling.textContent = source ? 'Source frame' : 'Predicted clean frame';
    steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    trajectoryCard.dataset.task = trajectory.dataset.task;
    get('trajectory-note').textContent = names[trajectory.dataset.task] + (source ? ' · Source frame 109' :
      ' · Update ' + next + ' · Noise level ' + sigmas[next]) + (next === 4 ? ' · Both views match the final result.' : '');
  }

  displayStep(0);
  const trajectoryPlayer = makePlayer({
    panel: trajectoryCard, control: get('replay-trajectory'),
    labels: {play: 'Play updates', pause: 'Pause updates'},
    advance: () => displayStep((currentStep + 1) % steps.length),
    interval: () => currentStep === 4 ? 2450 : 1300
  });
  steps.forEach((button, i) => button.addEventListener('click', () => {
    trajectoryPlayer.hold();
    displayStep(i);
  }));
  taskButtons.forEach(button => button.addEventListener('click', () => {
    trajectory.dataset.task = button.dataset.trajectoryTask;
    taskButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    displayStep(currentStep);
    trajectoryPlayer.restartClock();
  }));

  const method = document.querySelector('.method-tour');
  const spot = method.querySelector('.method-spot');
  const stageButtons = [...method.querySelectorAll('[data-method-stage]')];
  const stages = [
    {bounds: [3.3, 2.4, 93.5, 36.1], caption: 'Condition encoding turns the instruction, source video, and spatial cue into context for the generator.'},
    {bounds: [3.3, 39.1, 66.5, 32.3], caption: 'In each DiT block, the noisy target reads source and cue features through asymmetric attention.'},
    {bounds: [70.5, 39.1, 26.2, 32.3], caption: 'Four Euler updates refine the target state. The decoder maps the final state back to video frames.'}
  ];
  let currentStage = -1;
  function showStage(i) {
    const {bounds, caption} = stages[i];
    currentStage = i;
    spot.hidden = false;
    ['left', 'top', 'width', 'height'].forEach((key, n) => { spot.style[key] = bounds[n] + '%'; });
    stageButtons.forEach((button, n) => button.setAttribute('aria-pressed', String(i === n)));
    get('method-tour-caption').textContent = caption;
  }
  get('method-controls').hidden = false;
  stageButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  const methodPlayer = makePlayer({
    panel: method, control: get('play-method-tour'),
    labels: {play: 'Play tour', pause: 'Pause tour'},
    advance: () => showStage((currentStage + 1) % stages.length),
    interval: () => 2950,
    firstStep: () => { if (currentStage < 0) showStage(0); }
  });
  stageButtons.forEach((button, i) => button.addEventListener('click', () => {
    methodPlayer.hold();
    showStage(i);
  }));
  const refresh = () => players.forEach(player => player.refresh());
  document.addEventListener('visibilitychange', refresh);
  const preferenceChanged = () => players.forEach(player => player.preferenceChanged());
  document.addEventListener('motionchange', preferenceChanged);
  reduced.addEventListener('change', preferenceChanged);
  const dialogObserver = new MutationObserver(refresh);
  figures.forEach(dialog => dialogObserver.observe(dialog, {attributes: true, attributeFilter: ['open']}));
})();

(() => {
  "use strict";

  const demos = document.getElementById("motion-demos");
  const template = document.getElementById("motion-template");
  const records = window.BISEEK_MOTION;
  if (!demos || !template || !records) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const film = document.getElementById("film-player");

  const names = {
    vtg: "VTG · Temporal grounding",
    stvg: "STVG · Spatiotemporal grounding"
  };
  const viewNames = {
    compare: "Side by side",
    input: "Original video",
    gt: "Ground truth",
    baseline: "Baseline only",
    ours: "BiSeek only"
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const seconds = (time, digits = 2) => Number(time.toFixed(digits)) + " s";

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function mount(task, entries) {
    const card = document.getElementById("motion-" + task);
    const temporal = task === "vtg";
    const defaultView = temporal ? "input" : "compare";
    const items = (entries || []).filter(item =>
      item.sources?.[defaultView] && Number.isFinite(item.duration) && item.duration > 0
    );
    if (!card || !items.length) return;

    card.append(template.content.cloneNode(true));
    const select = selector => card.querySelector(selector);
    const title = select(".motion-title");
    const cases = select(".motion-cases");
    const focus = select(".motion-focus");
    const query = select(".motion-query");
    const stage = select(".motion-stage");
    const video = select("video");
    const play = select(".motion-play");
    const seek = select(".motion-range");
    const clock = select(".motion-clock");
    const loop = select(".motion-loop");
    const timing = select(".motion-timing");
    const tracks = select(".motion-tracks");
    const axis = select(".motion-axis");
    const labels = select(".motion-labels");
    const views = select(".motion-views");
    const landmarks = select(".motion-landmarks");
    const finding = select(".motion-finding");
    const note = select(".motion-note");
    const galleryLink = select(".motion-gallery-link");
    const status = select(".motion-status");
    let current;
    let view;
    let pendingTime = null;
    let loopOn = false;
    let frame;
    let timelineRows = [];
    let timelineStart;
    let timelineEnd;
    let canAutoplay = true;
    let stageVisible = false;

    video.id = card.id + "-video";
    video.muted = true;
    video.playsInline = true;
    title.id = card.id + "-title";
    select(".motion-task").textContent = names[task];
    seek.setAttribute("aria-controls", video.id);
    play.setAttribute("aria-controls", video.id);
    loop.setAttribute("aria-controls", video.id);
    timing.hidden = !temporal;

    const clipStart = () => current.start || 0;
    const mediaTime = () => pendingTime ?? video.currentTime;
    const sourceTime = () => clipStart() + mediaTime();
    const duration = () => Number.isFinite(video.duration) && video.duration > 0
      ? video.duration : current.duration;
    const loopRange = () => current.loop || [clipStart(), clipStart() + duration()];

    function setStatus(message) {
      status.textContent = message;
      status.hidden = !message;
    }

    function setLoop(active) {
      loopOn = active;
      loop.setAttribute("aria-pressed", String(active));
    }

    function updatePlay() {
      const playing = !video.paused && !video.ended;
      play.firstElementChild.className = playing ? "pause-icon" : "play-icon";
      play.lastChild.textContent = playing ? "Pause" : "Play";
    }

    function updatePosition() {
      const time = sourceTime();
      seek.value = mediaTime();
      seek.setAttribute("aria-valuetext", seconds(time) + " in the source clip");
      clock.textContent = seconds(time, 1);
      if (temporal) {
        const percent = clamp((time - timelineStart) / (timelineEnd - timelineStart) * 100, 0, 100);
        tracks.style.setProperty("--motion-progress", percent + "%");
        // Allow for the browser's sub-microsecond seek rounding at interval boundaries.
        const intervalTime = time + 1e-6;
        for (const {row, span} of timelineRows) {
          row.dataset.hit = String(intervalTime >= span[0] && intervalTime < span[1]);
        }
      }
    }

    function seekSource(time, manual = false) {
      if (manual && loopOn && (time < loopRange()[0] || time > loopRange()[1])) setLoop(false);
      const requested = clamp(time - clipStart(), 0, duration());
      if (video.readyState >= 1) {
        pendingTime = null;
        video.currentTime = requested;
      } else {
        pendingTime = requested;
      }
      updatePosition();
    }

    function startPlayback(automatic = false) {
      if (video.ended) seekSource(loopOn ? loopRange()[0] : clipStart());
      video.play().catch(error => {
        if (automatic || error.name === "AbortError") return;
        setStatus("Playback could not start. Select Play to try again.");
        updatePlay();
      });
    }

    function autoplayWhenVisible() {
      if (!canAutoplay || !stageVisible || document.hidden || reduced.matches || film?.paused === false) return;
      canAutoplay = false;
      startPlayback(true);
    }

    function advance() {
      if (video.paused || video.ended) return;
      const time = sourceTime();
      if (loopOn && time >= loopRange()[1]) seekSource(loopRange()[0]);
      else updatePosition();
      frame = requestAnimationFrame(advance);
    }

    function selectView(mode, position, preservePlayback = false) {
      if (!current.sources[mode]) return;
      view = mode;
      video.pause();
      pendingTime = clamp(position, 0, current.duration);
      const [width, height] = current.viewSizes?.[mode] || [current.width, current.height];
      stage.style.setProperty("--motion-length", width && height ? width + " / " + height : "16 / 9");
      video.preload = "metadata";
      if (current.poster && mode === defaultView) video.poster = current.poster;
      else video.removeAttribute("poster");
      video.src = current.sources[mode];
      video.load();
      seek.disabled = false;
      seek.max = current.duration;
      video.setAttribute("aria-label", current.title + " · " + viewNames[mode]);
      labels.hidden = mode !== "compare" || !labels.childElementCount;
      for (const button of views.children) {
        button.setAttribute("aria-pressed", String(button.dataset.view === mode));
      }
      updatePosition();
      updatePlay();
      if (preservePlayback) startPlayback();
    }

    function drawTimeline() {
      timelineStart = clipStart();
      timelineEnd = timelineStart + current.duration;
      const rows = current.rows || [];
      timelineRows = rows.map(({name, role, span, score}) => {
        const row = element("div", "motion-track");
        row.dataset.role = role;
        const label = element("strong", "motion-track-name", name);
        const readout = element("span", "motion-span", Number(span[0].toFixed(2)) + "–" + seconds(span[1]));
        if (Number.isFinite(score)) readout.append(element("small", "", score.toFixed(1) + "% tIoU"));
        const button = element("button", "motion-track-button");
        button.type = "button";
        button.setAttribute("aria-label", "Seek to the start of " + name + " at " + seconds(span[0]));
        const bar = element("span", "motion-interval");
        const playhead = element("span", "motion-track-playhead");
        const domain = timelineEnd - timelineStart;
        const offset = time => clamp((time - timelineStart) / domain * 100, 0, 100);
        bar.style.setProperty("--bar-start", offset(span[0]) + "%");
        bar.style.setProperty("--bar-width", (offset(span[1]) - offset(span[0])) + "%");
        if (span[0] < timelineStart) bar.classList.add("starts-offscreen");
        if (span[1] > timelineEnd + .05) bar.classList.add("ends-offscreen");
        button.append(bar, playhead);
        button.addEventListener("click", event => {
          const box = button.getBoundingClientRect();
          const position = event.detail > 0
            ? timelineStart + clamp((event.clientX - box.left) / box.width, 0, 1) * domain
            : span[0];
          seekSource(position, true);
        });
        row.append(label, button, readout);
        return {row, span};
      });
      tracks.replaceChildren(...timelineRows.map(item => item.row));
      const ticks = [0, .25, .5, .75, 1];
      axis.replaceChildren(...ticks.map(fraction => element("span", "", seconds(
        timelineStart + fraction * (timelineEnd - timelineStart), 1
      ))));
    }

    function drawMarkers() {
      const buttons = (current.markers || []).filter(marker => Number.isFinite(marker.time))
        .map(({label, time}) => {
          const button = element("button", "motion-marker");
          button.type = "button";
          button.append(element("span", "", label), element("small", "", seconds(time)));
          button.addEventListener("click", () => seekSource(time, true));
          return button;
        });
      landmarks.replaceChildren(...buttons);
      landmarks.hidden = !buttons.length;
    }

    function drawViews() {
      const badges = (current.compare || []).map(({name, role, score}) => {
        const badge = element("div", "motion-label");
        badge.dataset.role = role;
        badge.append(element("strong", "", name));
        if (Number.isFinite(score)) {
          badge.append(element("small", "", score.toFixed(2) + "%"));
          badge.title = "Full-clip " + (current.metric || "score");
        }
        return badge;
      });
      labels.replaceChildren(...badges);
      const buttons = Object.keys(viewNames).filter(mode => current.sources[mode]).map(mode => {
        const button = element("button", "", viewNames[mode]);
        button.type = "button";
        button.dataset.view = mode;
        button.addEventListener("click", () => {
          if (mode !== view) selectView(mode, mediaTime(), !video.paused);
        });
        return button;
      });
      views.replaceChildren(...buttons);
      views.hidden = buttons.length < 2;
    }

    function selectCase(entry, preservePlayback = false) {
      current = entry;
      title.replaceChildren(document.createTextNode(entry.title));
      if (entry.dataset) title.append(element("span", "motion-dataset", entry.dataset));
      focus.textContent = entry.focus || entry.query;
      query.hidden = !entry.focus || !entry.query;
      query.open = false;
      query.querySelector("p").textContent = entry.query || "";
      finding.textContent = entry.finding || "";
      finding.hidden = !entry.finding;
      note.textContent = entry.notice || (entry.framing ? entry.framing + "." : "");
      note.hidden = !note.textContent;
      galleryLink.hidden = !entry.galleryCase;
      for (const [index, button] of Array.from(cases.children).entries()) {
        button.setAttribute("aria-pressed", String(items[index] === entry));
      }
      setStatus("");
      setLoop(false);
      loop.textContent = entry.loop ? "Loop event" : "Loop clip";
      if (temporal) drawTimeline();
      drawMarkers();
      drawViews();
      selectView(defaultView, (entry.initial ?? clipStart()) - clipStart(), preservePlayback);
    }

    video.addEventListener("loadedmetadata", () => {
      seek.max = duration();
      if (pendingTime !== null) seekSource(clipStart() + pendingTime);
      else updatePosition();
    });
    video.addEventListener("play", () => {
      updatePlay();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(advance);
    });
    video.addEventListener("pause", () => {
      cancelAnimationFrame(frame);
      updatePlay();
      updatePosition();
    });
    video.addEventListener("seeked", updatePosition);
    video.addEventListener("ended", () => {
      if (loopOn) {
        seekSource(loopRange()[0]);
        startPlayback();
      } else {
        updatePlay();
        updatePosition();
      }
    });
    video.addEventListener("error", () => {
      setStatus("This video could not load. Select another view or try again.");
      updatePlay();
    });
    play.addEventListener("click", () => {
      canAutoplay = false;
      setStatus("");
      if (video.paused || video.ended) {
        if (video.error) selectView(view, mediaTime());
        startPlayback();
      } else video.pause();
    });
    seek.addEventListener("input", () => seekSource(clipStart() + Number(seek.value), true));
    loop.addEventListener("click", () => {
      setLoop(!loopOn);
      const [from, to] = loopRange();
      if (loopOn && (sourceTime() < from || sourceTime() >= to)) seekSource(from);
    });
    galleryLink.addEventListener("click", event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const galleryTask = temporal ? "VTG" : "STVG";
      document.querySelector('#task-bar button[data-task="' + galleryTask + '"]')?.click();
      const button = Array.from(document.querySelectorAll("#case-rail button"))
        .find(node => node.dataset.case === current.galleryCase);
      button?.click();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        stageVisible = entry.intersectionRatio >= .55;
        if (entry.intersectionRatio < .15) video.pause();
        autoplayWhenVisible();
      }, {threshold: [.15, .55]}).observe(stage);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else autoplayWhenVisible();
    });
    film?.addEventListener("pause", autoplayWhenVisible);
    reduced.addEventListener("change", event => {
      if (event.matches) video.pause();
      else autoplayWhenVisible();
    });

    for (const item of items) {
      const button = element("button", "", item.title);
      button.type = "button";
      button.addEventListener("click", () => {
        if (item !== current) selectCase(item, !video.paused);
      });
      cases.append(button);
    }
    cases.hidden = items.length < 2;
    selectCase(items[0]);
    card.hidden = false;
    demos.hidden = false;
  }

  mount("vtg", records.vtg);
  mount("stvg", records.stvg);
})();

// Source tables in preprint/main.tex and preprint/experiment-results.tex.
(() => {
  const metrics = {
    editPSNR: { key: "edit-psnr", label: "Edit PSNR", unit: "dB", better: "higher", digits: 2 },
    keepMAE: { key: "keep-mae", label: "Keep MAE", unit: "×100", better: "lower", digits: 2 },
    editTDE: { key: "edit-tde", label: "Edit TDE", unit: "×100", better: "lower", digits: 2 },
    editLPIPS: { key: "edit-lpips", label: "Edit LPIPS", unit: "×100", better: "lower", digits: 2 },
    rosePSNR: { key: "rose-psnr", label: "ROSE PSNR", unit: "dB", better: "higher", digits: 2 },
    vorPSNR: { key: "vor-psnr", label: "VOR-Eval PSNR", unit: "dB", better: "higher", digits: 2 },
    roseOut: { key: "rose-out-mae", label: "ROSE outside-change MAE", unit: "×100", better: "lower", digits: 2 },
    vorOut: { key: "vor-out-mae", label: "VOR-Eval outside-change MAE", unit: "×100", better: "lower", digits: 2 },
    time: { key: "seconds", label: "Time per clip", unit: "s", better: "lower", digits: 2 },
    gpuHours: { key: "gpu-hours", label: "Training cost", unit: "GPU-h", better: "lower", digits: 0 },
    fullPSNR: { key: "full-psnr", label: "Full PSNR", unit: "dB", better: "higher", digits: 2 },
    fullLPIPS: { key: "full-lpips", label: "Full LPIPS", unit: "×100", better: "lower", digits: 2 },
    fullTDE: { key: "full-tde", label: "Full TDE", unit: "×100", better: "lower", digits: 2 },
  };

  window.studyEvidence = [
    {
      id: "study-occupancy",
      title: "Occupancy supervision",
      description: "The same 60 short mixed-overlay clips test occupancy supervision with each attention direction.",
      metrics: [metrics.editPSNR, metrics.keepMAE],
      rows: [
        { name: "Bidirectional, without occupancy", values: [28.52, 0.82] },
        { name: "Bidirectional, with occupancy", values: [29.78, 0.79] },
        { name: "Asymmetric, without occupancy", values: [29.05, 0.81] },
        { name: "Asymmetric, with occupancy", ours: true, values: [30.20, 0.73] },
      ],
    },
    {
      id: "study-conditioning",
      title: "Condition interaction",
      description: "Occupancy supervision is enabled throughout. Outside-change error is measured on ROSE; edit and preservation scores use 60 short mixed-overlay clips.",
      metrics: [metrics.roseOut, metrics.editPSNR, metrics.keepMAE],
      rows: [
        { name: "Additive conditioning", values: [3.28, 29.25, 0.86] },
        { name: "Bidirectional streams", values: [3.02, 29.78, 0.79] },
        { name: "Asymmetric streams", ours: true, values: [2.86, 30.20, 0.73] },
      ],
    },
    {
      id: "study-losses",
      title: "Reconstruction losses",
      description: "Outside-change error is measured beyond the object mask on ROSE. Edit PSNR, Keep MAE, and Edit TDE use 60 short mixed-overlay clips.",
      metrics: [metrics.roseOut, metrics.editPSNR, metrics.keepMAE, metrics.editTDE],
      rows: [
        { name: "Full objective", ours: true, values: [2.86, 30.20, 0.73, 2.12] },
        { name: "Without associated-change weighting", values: [3.41, 30.02, 0.73, 2.13] },
        { name: "Without temporal loss", values: [2.95, 29.89, 0.75, 2.68] },
        { name: "Without clean-estimate supervision", values: [3.05, 29.62, 0.76, 2.34] },
        { name: "Uniform spatial weights", values: [3.25, 29.72, 0.79, 2.18] },
      ],
    },
    {
      id: "study-rollout",
      title: "Trajectory training",
      description: "Three training strategies share four-call inference. Object scores use ROSE and VOR-Eval; overlay scores use 60 short mixed clips.",
      metrics: [metrics.rosePSNR, metrics.vorPSNR, metrics.editPSNR, metrics.editTDE],
      rows: [
        { name: "Flow matching", values: [32.91, 24.35, 28.60, 2.62] },
        { name: "Detached rollout", values: [33.95, 25.10, 29.75, 2.30] },
        { name: "Full rollout", ours: true, values: [34.31, 25.39, 30.20, 2.12] },
      ],
    },
    {
      id: "study-cues",
      title: "Input-cue sensitivity",
      description: "The same model, removal instruction, target video, and scoring regions are used with each spatial cue on ROSE and VOR-Eval.",
      metrics: [metrics.rosePSNR, metrics.roseOut, metrics.vorPSNR, metrics.vorOut],
      rows: [
        { name: "Exact mask", ours: true, values: [34.31, 2.86, 25.39, 6.61] },
        { name: "Dilated mask", values: [34.06, 2.97, 25.15, 6.82] },
        { name: "Eroded mask", values: [32.80, 3.30, 23.95, 7.41] },
        { name: "Bounding box", values: [33.29, 3.51, 24.58, 7.62] },
        { name: "No mask", values: [31.91, 4.02, 23.51, 8.21] },
      ],
    },
    {
      id: "study-calls",
      title: "Inference calls",
      description: "Weights, source conditions, noise seeds, and schedule endpoints are fixed. Reconstruction is evaluated on the same 60 short mixed-overlay clips.",
      metrics: [metrics.editPSNR, metrics.editLPIPS, metrics.keepMAE, metrics.time],
      rows: [
        { name: "1 call", values: [25.80, 0.95, 0.88, 2.50] },
        { name: "2 calls", values: [28.91, 0.52, 0.77, 4.80] },
        { name: "4 calls", ours: true, values: [30.20, 0.33, 0.73, 9.40] },
        { name: "8 calls", values: [30.45, 0.31, 0.73, 18.60] },
      ],
    },
    {
      id: "study-joint",
      title: "Joint and specialist training",
      description: "Runs share initialization, total training updates, batch size, and resolution buckets. Overlay scores use 60 short mixed cases. A dash marks a task excluded from training.",
      metrics: [metrics.rosePSNR, metrics.vorPSNR, metrics.editPSNR, metrics.keepMAE, metrics.gpuHours],
      rows: [
        { name: "Object only", values: [34.55, 25.58, null, null, 164] },
        { name: "Overlay only", values: [null, null, 30.61, 0.69, 152] },
        { name: "Joint training", ours: true, values: [34.31, 25.39, 30.20, 0.73, 286] },
      ],
    },
  ];

  window.identityEvidence = [
    {
      id: "overlay-identity",
      title: "Clean inputs",
      description: "The overlay removal instruction is applied to 24 clean inputs from 24 source groups (11 short, 13 long). The full frame is the preservation region.",
      metrics: [metrics.keepMAE, metrics.fullPSNR, metrics.fullLPIPS, metrics.fullTDE],
      rows: [
        { name: "EraseAnything", ours: true, values: [0.87, 37.29, 1.38, 1.44] },
      ],
    },
  ];
})();

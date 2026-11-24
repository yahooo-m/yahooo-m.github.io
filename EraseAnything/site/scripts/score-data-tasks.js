// CVPR supplementary material, paper/supp.tex, tab:supp_category_metrics.
// Values verified against ccfa-workfiles/figures/category-metrics/data/metrics.csv.
(() => {
  const editMetrics = [
    { key: 'edit-psnr', label: 'Edit PSNR', unit: 'dB', better: 'higher', digits: 3 },
    { key: 'edit-ssim', label: 'Edit SSIM', unit: '', better: 'higher', digits: 4 },
    { key: 'edit-lpips', label: 'Edit LPIPS', unit: '', better: 'lower', digits: 4 },
    { key: 'keep-mae', label: 'Keep MAE', unit: '', better: 'lower', digits: 5 },
    { key: 'edit-tde', label: 'Edit TDE', unit: '', better: 'lower', digits: 5 },
  ];
  const fullMetrics = [
    { key: 'full-psnr', label: 'Full PSNR', unit: 'dB', better: 'higher', digits: 3 },
    { key: 'full-ssim', label: 'Full SSIM', unit: '', better: 'higher', digits: 4 },
    { key: 'full-lpips', label: 'Full LPIPS', unit: '', better: 'lower', digits: 4 },
    { key: 'full-mae', label: 'Full MAE', unit: '', better: 'lower', digits: 5 },
    { key: 'full-tde', label: 'Full TDE', unit: '', better: 'lower', digits: 5 },
  ];
  const source = 'CVPR supplement, Category-wise metrics';
  const cohort = 'Scores average the source groups completed by each method.';

  window.taskEvidence = [
    {
      id: 'task-subtitle', title: 'Subtitle removal',
      description: 'Subtitle-only overlays. ' + cohort, source, matchedCohort: false,
      metrics: editMetrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [8.579, 0.1257, 0.5307, 0.03614, 0.07799] },
        { name: "CLEAR", group: "Fixed subtitle instruction", values: [20.046, 0.7659, 0.1819, 0.07145, 0.03127] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [17.827, 0.6137, 0.1892, 0.04440, 0.05085] },
        { name: "MiniMax-Remover", group: "GT box", values: [25.289, 0.8422, 0.0477, 0.00910, 0.03590] },
        { name: "DiffuEraser", group: "GT box", values: [26.421, 0.8457, 0.0406, 0.01053, 0.03460] },
        { name: "ProPainter", group: "GT box", values: [25.896, 0.8354, 0.0533, 0.01063, 0.03194] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [29.982, 0.8913, 0.0242, 0.00712, 0.02460] },
      ],
    },
    {
      id: 'task-logo', title: 'Logo removal',
      description: 'Logo-only overlays. ' + cohort, source, matchedCohort: false,
      metrics: editMetrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [10.777, 0.4153, 0.5343, 0.03894, 0.03608] },
        { name: "CLEAR", group: "Fixed subtitle instruction", values: [13.163, 0.5542, 0.5101, 0.07094, 0.02581] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [22.429, 0.7205, 0.2296, 0.04773, 0.02322] },
        { name: "MiniMax-Remover", group: "GT box", values: [30.189, 0.8794, 0.1092, 0.00831, 0.01679] },
        { name: "DiffuEraser", group: "GT box", values: [31.580, 0.8801, 0.0978, 0.00969, 0.01438] },
        { name: "ProPainter", group: "GT box", values: [33.554, 0.8805, 0.0830, 0.01039, 0.01342] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [35.778, 0.9311, 0.0360, 0.00689, 0.01171] },
      ],
    },
    {
      id: 'task-watermark', title: 'Watermark removal',
      description: 'Watermark-only overlays. ' + cohort, source, matchedCohort: false,
      metrics: editMetrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [14.805, 0.2096, 0.4321, 0.03487, 0.04343] },
        { name: "CLEAR", group: "Fixed subtitle instruction", values: [20.367, 0.7697, 0.2395, 0.07150, 0.02609] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [20.999, 0.6725, 0.1889, 0.04685, 0.03792] },
        { name: "MiniMax-Remover", group: "GT box", values: [27.701, 0.8494, 0.0617, 0.00833, 0.02470] },
        { name: "DiffuEraser", group: "GT box", values: [28.969, 0.8617, 0.0563, 0.00965, 0.02296] },
        { name: "ProPainter", group: "GT box", values: [28.993, 0.8445, 0.0548, 0.01040, 0.02189] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [33.789, 0.9174, 0.0187, 0.00694, 0.01588] },
      ],
    },
    {
      id: 'task-banner', title: 'Banner removal',
      description: 'Banner-only overlays. ' + cohort, source, matchedCohort: false,
      metrics: editMetrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [11.276, 0.4655, 0.4753, 0.03782, 0.04694] },
        { name: "CLEAR", group: "Fixed subtitle instruction", values: [16.890, 0.7023, 0.3447, 0.07109, 0.02860] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [23.076, 0.7625, 0.1541, 0.05360, 0.02831] },
        { name: "MiniMax-Remover", group: "GT box", values: [32.394, 0.9246, 0.0374, 0.00816, 0.01933] },
        { name: "DiffuEraser", group: "GT box", values: [34.342, 0.9310, 0.0297, 0.00943, 0.01706] },
        { name: "ProPainter", group: "GT box", values: [34.015, 0.9256, 0.0377, 0.01021, 0.01652] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [34.896, 0.9464, 0.0257, 0.00700, 0.01365] },
      ],
    },
  ];

  window.framePreservationEvidence = [
    {
      id: 'task-frame-preservation', title: 'Frame preservation',
      description: 'Full-frame preservation scores. ' + cohort, source, matchedCohort: false,
      metrics: fullMetrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [22.739, 0.8871, 0.1045, 0.04152, 0.02911] },
        { name: "CLEAR", group: "Fixed subtitle instruction", values: [21.786, 0.8574, 0.1061, 0.07159, 0.02014] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [20.506, 0.7656, 0.1438, 0.06539, 0.03670] },
        { name: "MiniMax-Remover", group: "GT box", values: [38.182, 0.9690, 0.0132, 0.00805, 0.01185] },
        { name: "DiffuEraser", group: "GT box", values: [36.608, 0.9485, 0.0197, 0.00922, 0.01318] },
        { name: "ProPainter", group: "GT box", values: [34.718, 0.9449, 0.0404, 0.01022, 0.01195] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [39.661, 0.9769, 0.0108, 0.00671, 0.01017] },
      ],
    },
  ];
})();

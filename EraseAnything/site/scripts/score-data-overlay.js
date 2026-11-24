// EraseKeep-Bench mixed-overlay comparison, preprint/main.tex, Table 2 (tab:overlay_results).
// The numbers below are displayed on the same scale as the paper.
(() => {
  const metrics = [
    { key: "edit-psnr", label: "Edit PSNR", unit: "dB", better: "higher", digits: 2 },
    { key: "edit-ssim", label: "Edit SSIM", unit: "", better: "higher", digits: 2 },
    { key: "edit-lpips", label: "Edit LPIPS", unit: "×100", better: "lower", digits: 2 },
    { key: "keep-mae", label: "Keep MAE", unit: "×100", better: "lower", digits: 2 },
    { key: "edit-tde", label: "Edit TDE", unit: "×100", better: "lower", digits: 2 },
    { key: "full-psnr", label: "Full PSNR", unit: "dB", better: "higher", digits: 2 },
    { key: "full-ssim", label: "Full SSIM", unit: "", better: "higher", digits: 2 },
    { key: "full-lpips", label: "Full LPIPS", unit: "×100", better: "lower", digits: 2 },
    { key: "full-mae", label: "Full MAE", unit: "×100", better: "lower", digits: 2 },
    { key: "full-tde", label: "Full TDE", unit: "×100", better: "lower", digits: 2 },
  ];

  window.overlayEvidence = [
    {
      id: "overlay-all",
      title: "All mixed videos",
      description: "200 clips from 178 source groups. Each group contributes equally to the reported mean.",
      metrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [9.66, 0.23, 10.57, 3.18, 6.50, 20.97, 0.86, 20.17, 4.00, 3.00] },
        { name: "CLEAR", group: "Subtitle instruction", values: [14.30, 0.65, 5.67, 6.91, 3.53, 20.97, 0.85, 13.79, 7.23, 2.18] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [15.86, 0.62, 4.53, 6.34, 4.86, 20.08, 0.76, 16.18, 6.51, 3.87] },
        { name: "MiniMax-Remover", group: "Box", values: [25.05, 0.85, 0.79, 0.98, 3.24, 33.48, 0.96, 2.74, 1.09, 1.56] },
        { name: "DiffuEraser", group: "Box", values: [25.78, 0.86, 0.69, 1.20, 3.13, 32.91, 0.94, 3.09, 1.30, 1.64] },
        { name: "ProPainter", group: "Box", values: [26.18, 0.86, 0.69, 1.06, 2.77, 33.01, 0.94, 4.16, 1.15, 1.37] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [29.92, 0.90, 0.32, 0.75, 2.22, 37.58, 0.97, 1.53, 0.80, 1.16] },
      ],
    },
    {
      id: "overlay-short",
      title: "Short mixed videos",
      description: "180 clips lasting 8–20 seconds. Scores are averaged within source groups, then across groups.",
      metrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [9.65, 0.24, 10.77, 3.18, 6.40, 20.98, 0.87, 20.06, 3.99, 2.86] },
        { name: "CLEAR", group: "Subtitle instruction", values: [14.13, 0.65, 5.96, 7.05, 3.47, 20.85, 0.85, 14.14, 7.38, 2.06] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [16.16, 0.63, 4.50, 6.35, 4.64, 20.28, 0.76, 16.22, 6.51, 3.62] },
        { name: "MiniMax-Remover", group: "Box", values: [25.50, 0.86, 0.78, 0.93, 3.07, 33.90, 0.96, 2.62, 1.05, 1.46] },
        { name: "DiffuEraser", group: "Box", values: [26.35, 0.87, 0.67, 1.16, 3.00, 33.35, 0.94, 2.97, 1.25, 1.56] },
        { name: "ProPainter", group: "Box", values: [26.52, 0.86, 0.69, 1.02, 2.65, 33.33, 0.94, 4.13, 1.11, 1.29] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [30.32, 0.91, 0.31, 0.71, 2.12, 37.96, 0.97, 1.46, 0.77, 1.08] },
      ],
    },
    {
      id: "overlay-long",
      title: "Long mixed videos",
      description: "20 clips lasting 105–389 seconds. Scores are averaged within source groups, then across groups.",
      metrics,
      rows: [
        { name: "Lucy-Edit 1.1", group: "Instruction", values: [9.70, 0.18, 8.90, 3.25, 7.40, 20.87, 0.81, 21.12, 4.04, 4.26] },
        { name: "CLEAR", group: "Subtitle instruction", values: [15.86, 0.69, 3.10, 5.65, 4.20, 22.14, 0.85, 10.65, 5.90, 3.19] },
        { name: "Kiwi-Instruct", group: "Instruction", values: [13.33, 0.50, 4.89, 6.34, 6.90, 18.29, 0.69, 15.96, 6.58, 6.14] },
        { name: "MiniMax-Remover", group: "Box", values: [21.21, 0.79, 0.84, 1.39, 4.78, 29.78, 0.93, 3.82, 1.53, 2.46] },
        { name: "DiffuEraser", group: "Box", values: [20.94, 0.77, 0.86, 1.58, 4.36, 29.17, 0.91, 4.11, 1.73, 2.37] },
        { name: "ProPainter", group: "Box", values: [23.20, 0.81, 0.68, 1.44, 3.89, 30.05, 0.92, 4.61, 1.53, 2.13] },
        { name: "EraseAnything", group: "Instruction", ours: true, values: [26.51, 0.85, 0.35, 1.05, 3.19, 34.19, 0.95, 2.12, 1.12, 1.86] },
      ],
    },
  ];
})();

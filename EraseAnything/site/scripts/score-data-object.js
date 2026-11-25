// Object scores: preprint/main.tex and paper/main.tex, tab:local_reconstruction.
// Source precision: ccfa-workfiles/manuscript/cvpr-paper/source/compact-results/before-remote-main.tex.
// Speed: preprint/appendix.tex, tab:inference_throughput, and
// results/inference_speed_20261124/reported_fps_latency.csv.
(() => {
  const qualityMetrics = [
    { key: 'psnr', label: 'PSNR', unit: 'dB', better: 'higher', digits: 2 },
    { key: 'ssim', label: 'SSIM', unit: '×100', better: 'higher', digits: 1 },
    { key: 'lpips', label: 'LPIPS', unit: '×100', better: 'lower', digits: 1 },
    { key: 'fvd', label: 'FVD', unit: '', better: 'lower', digits: 1 }
  ];

  const first81Frames = [
    {
      id: 'rose',
      title: 'ROSE · first 81 frames',
      description: '60 videos, first 81 frames at 832 × 480. EraseAnything leads on PSNR, SSIM and LPIPS. EffectErase has the lowest FVD.',
      metrics: qualityMetrics,
      rows: [
        { name: 'VACE', values: [20.805, 69.4, 17.4, 254.117] },
        { name: 'DiffuEraser', values: [26.502, 89.8, 12.8, 167.483] },
        { name: 'MiniMax-Remover', values: [26.770, 90.5, 9.9, 137.840] },
        { name: 'OmniPaint', values: [27.569, 91.0, 8.5, 809.645] },
        { name: 'ProPainter', values: [27.200, 91.5, 9.5, 171.020] },
        { name: 'ObjectClear', values: [29.535, 92.0, 7.6, 742.829] },
        { name: 'ROSE', values: [31.122, 91.7, 7.7, 72.177] },
        { name: 'EffectErase', values: [32.161, 94.8, 3.9, 55.578] },
        { name: 'EraseAnything', ours: true, values: [34.312, 95.0, 3.7, 60.014] }
      ]
    },
    {
      id: 'vor',
      title: 'VOR-Eval · first 81 frames',
      description: '43 videos, first 81 frames at 832 × 480. EraseAnything leads on all four metrics, gaining 1.64 dB in PSNR over EffectErase.',
      metrics: qualityMetrics,
      rows: [
        { name: 'VACE', values: [17.677, 59.1, 29.4, 806.476] },
        { name: 'DiffuEraser', values: [21.946, 80.2, 21.4, 559.497] },
        { name: 'MiniMax-Remover', values: [21.963, 80.2, 21.7, 539.427] },
        { name: 'OmniPaint', values: [21.511, 78.1, 20.1, 1439.867] },
        { name: 'ProPainter', values: [21.975, 80.0, 22.5, 589.012] },
        { name: 'ObjectClear', values: [22.583, 78.7, 19.0, 1391.858] },
        { name: 'ROSE', values: [22.966, 79.2, 20.3, 383.084] },
        { name: 'EffectErase', values: [23.750, 80.6, 17.0, 342.871] },
        { name: 'EraseAnything', ours: true, values: [25.390, 80.9, 16.5, 323.350] }
      ]
    }
  ];

  // Full-sequence and regional comparisons: preprint/experiment-results.tex.
  const fullSequenceMetrics = qualityMetrics.map(metric => ({
    ...metric, digits: 2, exportDigits: metric.key === 'psnr' ? 4 : 2
  }));
  const regionalMetrics = [
    { key: 'object-mae', label: 'Object MAE', unit: '×100', better: 'lower', digits: 2 },
    { key: 'outside-mae', label: 'Outside-change MAE', unit: '×100', better: 'lower', digits: 2 },
    { key: 'background-mae', label: 'Background MAE', unit: '×100', better: 'lower', digits: 2 }
  ];
  window.objectEvidence = [
    {
      id: 'rose-full', title: 'ROSE · full sequences',
      description: 'All 5,400 frames of 60 videos. EraseAnything leads on all four metrics and gains 3.44 dB in PSNR over ROSE.',
      metrics: fullSequenceMetrics,
      showPsnrGain: true,
      rows: [
        { name: 'MiniMax-Remover', values: [26.9220, 91.28, 10.28, 143.98] },
        { name: 'EffectErase', values: [27.4380, 90.83, 10.38, 131.86] },
        { name: 'ROSE', values: [30.8749, 92.50, 7.07, 110.24] },
        { name: 'EraseAnything', ours: true, values: [34.3148, 95.02, 5.53, 94.04] }
      ]
    },
    {
      id: 'vor-full', title: 'VOR-Eval · full sequences',
      description: 'All 10,320 frames of 43 videos. EraseAnything leads on all four metrics and gains 2.92 dB in PSNR over EffectErase.',
      metrics: fullSequenceMetrics,
      showPsnrGain: true,
      rows: [
        { name: 'MiniMax-Remover', values: [21.5029, 77.45, 25.69, 470.18] },
        { name: 'ROSE', values: [22.6799, 77.23, 23.75, 488.31] },
        { name: 'EffectErase', values: [22.7260, 75.62, 23.83, 352.49] },
        { name: 'EraseAnything', ours: true, values: [25.6412, 80.78, 21.27, 272.75] }
      ]
    },
    ...first81Frames,
    {
      id: 'rose-regional', title: 'ROSE · regional MAE',
      description: '60 full videos scored at 1024 × 576. Outside-change MAE measures paired changes beyond the object mask.',
      metrics: regionalMetrics,
      rows: [
        { name: 'Unchanged input', values: [22.76, 12.99, 0.78] },
        { name: 'EraseAnything', ours: true, values: [3.65, 2.86, 1.17] }
      ]
    },
    {
      id: 'vor-regional', title: 'VOR-Eval · regional MAE',
      description: '43 full videos scored at 1024 × 576. Outside-change MAE measures paired changes beyond the object mask.',
      metrics: regionalMetrics,
      rows: [
        { name: 'Unchanged input', values: [29.50, 10.32, 1.89] },
        { name: 'EraseAnything', ours: true, values: [6.78, 6.61, 2.17] }
      ]
    }
  ];

  const speedMetrics = [
    { key: 'fps', label: 'Throughput', unit: 'FPS', better: 'higher', digits: 3 },
    { key: 'latency', label: 'Time per frame', unit: 'ms', better: 'lower', digits: 2 }
  ];
  const speedProtocol = 'One 240-frame clip at 832 × 480 on an A100 80 GB, batch size one. The supplement reports the median of three runs after warm-up. Timing covers conditioning, sampling and VAE encoding and decoding. Methods that require masks use supplied masks. Timing excludes detection, model loading and video I/O.';
  window.speedEvidence = [
    {
      id: 'object-speed',
      title: 'Object throughput',
      description: speedProtocol,
      metrics: speedMetrics,
      rows: [
        { name: 'ROSE', values: [0.441, 2267.57] },
        { name: 'EffectErase', values: [0.565, 1769.91] },
        { name: 'MiniMax-Remover', values: [1.872, 534.19] },
        { name: 'EraseAnything', ours: true, values: [3.692, 270.86] }
      ]
    },
    {
      id: 'overlay-speed',
      title: 'Overlay throughput',
      description: speedProtocol,
      metrics: speedMetrics,
      rows: [
        { name: 'Lucy-Edit 1.1', values: [0.446, 2242.15] },
        { name: 'Kiwi-Edit Instruct', values: [1.621, 616.90] },
        { name: 'DiffuEraser', values: [2.358, 424.09] },
        { name: 'CLEAR', values: [2.572, 388.80] },
        { name: 'MiniMax-Remover', values: [2.707, 369.41] },
        { name: 'ProPainter', values: [3.670, 272.48] },
        { name: 'EraseAnything', ours: true, values: [3.998, 250.13] }
      ]
    }
  ];
})();

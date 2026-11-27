window.BISEEK_SHOWCASE = [
  {
    "title": "Two pandas, one target",
    "dataset": "ReasonVOS",
    "model": "BiSeek-4B",
    "comparator": "VideoLoom-4B",
    "query": "If the animal were not on the right track, it would probably be intervened and corrected by human. Which one is on the wrong track?",
    "focus": "The panda being moved by the keeper",
    "finding": "The keeper repositions one panda. VideoLoom follows the other, while BiSeek stays with the panda being moved.",
    "alt": "VideoLoom follows the panda on the right while BiSeek follows the one moved to the foreground.",
    "scores": {
      "baseline": 8.56,
      "ours": 91.71,
      "metric": "J&F"
    },
    "sources": {
      "compare": "assets/showcase/panda-compare.mp4",
      "baseline": "assets/showcase/panda-baseline.mp4",
      "ours": "assets/showcase/panda-ours.mp4",
      "input": "assets/showcase/panda-input.mp4",
      "gt": "assets/showcase/panda-gt.mp4"
    },
    "poster": "assets/showcase/panda-comparison-poster.webp",
    "width": 1320,
    "height": 594,
    "fps": 8,
    "frames": 30,
    "pairedCrop": false,
    "galleryCase": "human-intervention"
  },
  {
    "title": "Finding the blanket",
    "dataset": "ReasonVOS",
    "model": "BiSeek-4B",
    "comparator": "VideoLoom-4B",
    "query": "After sitting on the sofa and watching TV for a while, I started to feel a bit cold. Which object is most likely to help me alleviate the cold?",
    "focus": "The folded blanket on the sofa",
    "finding": "BiSeek picks out the folded blanket on the sofa and follows it as it opens. VideoLoom initially highlights the person or dog.",
    "alt": "VideoLoom outlines the dog while BiSeek outlines the folded blanket on the sofa.",
    "scores": {
      "baseline": 19.1,
      "ours": 85.69,
      "metric": "J&F"
    },
    "sources": {
      "compare": "assets/showcase/blanket-compare.mp4",
      "baseline": "assets/showcase/blanket-baseline.mp4",
      "ours": "assets/showcase/blanket-ours.mp4",
      "input": "assets/showcase/blanket-input.mp4",
      "gt": "assets/showcase/blanket-gt.mp4"
    },
    "poster": "assets/showcase/blanket-comparison-poster.webp",
    "width": 1320,
    "height": 594,
    "fps": 12,
    "frames": 193,
    "pairedCrop": true,
    "galleryCase": "warmth-function"
  },
  {
    "title": "School of goldfish",
    "dataset": "Ref-DAVIS17",
    "model": "BiSeek-4B",
    "queries": [
      {
        "text": "the biggest goldfish",
        "color": "#56f4ca"
      },
      {
        "text": "a gold fish on the left swimming towards the top right",
        "color": "#e999ff"
      }
    ],
    "sources": {
      "input": "assets/showcase/gold-fish-input.mp4",
      "first": "assets/showcase/gold-fish-first.mp4",
      "second": "assets/showcase/gold-fish-second.mp4",
      "both": "assets/showcase/gold-fish-both.mp4"
    },
    "poster": "assets/showcase/gold-fish-poster.webp",
    "width": 854,
    "height": 480,
    "fps": 24,
    "frames": 78
  },
  {
    "title": "Judo bout",
    "dataset": "Ref-DAVIS17",
    "model": "BiSeek-4B",
    "queries": [
      {
        "text": "a man with a blue belt on the right",
        "color": "#56f4ca"
      },
      {
        "text": "a bald man in the middle wearing a black belt falling down",
        "color": "#e999ff"
      }
    ],
    "sources": {
      "input": "assets/showcase/judo-input.mp4",
      "first": "assets/showcase/judo-first.mp4",
      "second": "assets/showcase/judo-second.mp4",
      "both": "assets/showcase/judo-both.mp4"
    },
    "poster": "assets/showcase/judo-poster.webp",
    "width": 854,
    "height": 480,
    "fps": 24,
    "frames": 34
  },
  {
    "title": "Motocross jump",
    "dataset": "Ref-DAVIS17",
    "model": "BiSeek-4B",
    "queries": [
      {
        "text": "a man wearing a green helmet",
        "color": "#56f4ca"
      },
      {
        "text": "a green motorbike",
        "color": "#e999ff"
      }
    ],
    "sources": {
      "input": "assets/showcase/motocross-jump-input.mp4",
      "first": "assets/showcase/motocross-jump-first.mp4",
      "second": "assets/showcase/motocross-jump-second.mp4",
      "both": "assets/showcase/motocross-jump-both.mp4"
    },
    "poster": "assets/showcase/motocross-jump-poster.webp",
    "width": 854,
    "height": 480,
    "fps": 24,
    "frames": 40
  }
];

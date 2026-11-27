window.BISEEK_MOTION = {
  "vtg": [
    {
      "title": "The sip with the card",
      "focus": "Watch for the sip while she is holding the card.",
      "finding": "VideoLoom includes an earlier sip without the card. UFVideo stops before the sip with the card ends.",
      "start": 22.5,
      "duration": 13.066016,
      "end": 35.56666666666667,
      "initial": 28.5,
      "loop": [
        28.5,
        35.5
      ],
      "framing": "Fixed crop from the original clip",
      "markers": [
        {
          "label": "Earlier sip, no card",
          "time": 23.7
        },
        {
          "label": "Card held, cup lowered",
          "time": 28.5
        },
        {
          "label": "Sip with the card",
          "time": 32.6
        },
        {
          "label": "Cup lowered again",
          "time": 34.4
        }
      ],
      "dataset": "Charades-TimeLens",
      "query": "A woman holds a card in one hand while taking a sip of water from a cup",
      "sources": {
        "input": "assets/motion/vtg-card-and-sip.mp4"
      },
      "poster": "assets/motion/vtg-card-and-sip.webp",
      "rows": [
        {
          "name": "Ground truth",
          "span": [
            30,
            34
          ],
          "role": "ground-truth"
        },
        {
          "name": "UFVideo-7B",
          "span": [
            26.944444444444446,
            31.97407407407408
          ],
          "role": "baseline",
          "score": 27.979002624671985
        },
        {
          "name": "VideoLoom-4B",
          "span": [
            23.7,
            35.6
          ],
          "role": "baseline",
          "score": 33.61344537815125
        },
        {
          "name": "BiSeek-4B",
          "span": [
            30.21666717529297,
            34.21666717529297
          ],
          "role": "ours",
          "score": 89.72329727314013
        }
      ],
      "width": 880,
      "height": 494
    },
    {
      "title": "Choosing and showing a card",
      "focus": "Watch her select a card and hold it up to the camera.",
      "finding": "UFVideo ends before the close-up. VideoLoom marks a later, disjoint interval.",
      "start": 0,
      "duration": 150,
      "end": 150,
      "initial": 57,
      "loop": [
        57,
        74
      ],
      "markers": [
        {
          "label": "Reaching for the cards",
          "time": 49
        },
        {
          "label": "Card shown to the camera",
          "time": 64
        },
        {
          "label": "Later object handling",
          "time": 107.5
        }
      ],
      "dataset": "QVHighlights-TimeLens",
      "query": "The woman picks up three cards, selects one, shows it to the camera, and then puts it back after showing",
      "sources": {
        "input": "assets/motion/vtg-card-selection.mp4"
      },
      "poster": "assets/motion/vtg-card-selection.webp",
      "rows": [
        {
          "name": "Ground truth",
          "span": [
            49,
            71
          ],
          "role": "ground-truth"
        },
        {
          "name": "UFVideo-7B",
          "span": [
            48.48484848484849,
            60.6060606060606
          ],
          "role": "baseline",
          "score": 51.54777927321669
        },
        {
          "name": "VideoLoom-4B",
          "span": [
            102.4,
            131.0
          ],
          "role": "baseline",
          "score": 0.0
        },
        {
          "name": "BiSeek-4B",
          "span": [
            48.25,
            71.25
          ],
          "role": "ours",
          "score": 95.65217391304348
        }
      ],
      "width": 534,
      "height": 300
    }
  ],
  "stvg": [
    {
      "title": "Two dogs in the aisle",
      "dataset": "VidSTG",
      "query": "what is behind the other dog on the left?",
      "focus": "The white dog behind the one on the left",
      "finding": "DeViL often boxes the dog on the left. BiSeek follows the white dog and continues past the annotated end.",
      "sources": {
        "compare": "assets/motion/stvg-dogs-compare.mp4",
        "input": "assets/motion/stvg-dogs-input.mp4",
        "gt": "assets/motion/stvg-dogs-gt.mp4",
        "baseline": "assets/motion/stvg-dogs-baseline.mp4",
        "ours": "assets/motion/stvg-dogs-ours.mp4"
      },
      "poster": "assets/motion/stvg-dogs-poster.webp",
      "width": 1088,
      "height": 360,
      "duration": 32.16546666666667,
      "start": 0.0,
      "galleryCase": "dog-relation",
      "compare": [
        {
          "name": "DeViL-7B",
          "score": 18.99,
          "role": "baseline"
        },
        {
          "name": "BiSeek-4B",
          "score": 61.31,
          "role": "ours"
        }
      ],
      "metric": "vIoU",
      "notice": "Full-clip vIoU. Both panes use the same crop. Saved boxes are held between evaluation frames.",
      "markers": [
        {
          "label": "Different dogs",
          "time": 19.886533333333333
        },
        {
          "label": "White dog gets up",
          "time": 23.957266666666666
        },
        {
          "label": "Target moves forward",
          "time": 26.5265
        },
        {
          "label": "After the annotated end",
          "time": 28.061366666666668
        }
      ],
      "initial": 19.886533333333333,
      "viewSizes": {
        "baseline": [
          640,
          360
        ],
        "ours": [
          640,
          360
        ],
        "input": [
          640,
          360
        ],
        "gt": [
          640,
          360
        ]
      }
    },
    {
      "title": "The animal that pushes",
      "dataset": "VidSTG",
      "query": "there is a cow on the left pushing another cow on the right.",
      "focus": "The animal on the left pushing its neighbor",
      "finding": "As the animals press together, DeViL often picks the neighbor. BiSeek follows the one pushing from the left.",
      "sources": {
        "compare": "assets/motion/stvg-cows-compare.mp4",
        "input": "assets/motion/stvg-cows-input.mp4",
        "gt": "assets/motion/stvg-cows-gt.mp4",
        "baseline": "assets/motion/stvg-cows-baseline.mp4",
        "ours": "assets/motion/stvg-cows-ours.mp4"
      },
      "poster": "assets/motion/stvg-cows-poster.webp",
      "width": 1024,
      "height": 480,
      "duration": 14.981648314981648,
      "start": 27.42742742742743,
      "galleryCase": "animal-interaction",
      "compare": [
        {
          "name": "DeViL-7B",
          "score": 24.68,
          "role": "baseline"
        },
        {
          "name": "BiSeek-4B",
          "score": 72.1,
          "role": "ours"
        }
      ],
      "metric": "vIoU",
      "notice": "Full-clip vIoU. Both panes use the same crop. Saved boxes are held between evaluation frames.",
      "markers": [
        {
          "label": "The animals approach",
          "time": 29.462796129462795
        },
        {
          "label": "Different targets",
          "time": 31.43143143143143
        },
        {
          "label": "A second approach",
          "time": 40.27360694027361
        }
      ],
      "initial": 31.43143143143143,
      "viewSizes": {
        "baseline": [
          640,
          480
        ],
        "ours": [
          640,
          480
        ],
        "input": [
          640,
          480
        ],
        "gt": [
          640,
          480
        ]
      }
    }
  ]
};

---
permalink: /
title: ""
excerpt: "Deshui Miao's research in video segmentation, generative video editing and streaming video understanding."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<span class="anchor" id="about-me"></span>

I am a Ph.D. candidate at Harbin Institute of Technology (Shenzhen), advised by [Haijun Zhang](https://www.dl2link.com/). I also work with [Xin Li](https://sites.google.com/view/xinli-homepage) and [Ming-Hsuan Yang](https://faculty.ucmerced.edu/mhyang/).

My research focuses on **video segmentation, generative video editing, and streaming video understanding**. I am currently an algorithm research intern at **ByteDance**.

# 🔥 News
{: #news}

- **2026.10**: New papers and project pages: [DeOverlay / DVTE-Bench](https://yahooo-m.github.io/DVTE-Bench/), [TCoVP](https://victor-wjw.github.io/TCoVP/), and [DeltaStreamer](https://bbbbchan.github.io/DeltaStreamer/).
- **2026.06**: 🏆 Our [APRVOS](https://arxiv.org/abs/2604.18665) solution won **1st place in the MeViS-Audio track** of the [5th PVUW Challenge at CVPR 2026](https://pvuw.github.io/).
- **2026.05**: [GeoWeaver](https://arxiv.org/abs/2605.22558) and [RCoT-Seg](https://arxiv.org/abs/2605.07334) are available on arXiv.
- **2026.02**: [SGAFuse](https://doi.org/10.1016/j.neunet.2026.108779) was published online in *Neural Networks*.
- **2025.07**: 🏆 Winner of the VOTS 2025 Challenge (VOTS, VOTS-RT, and VOTSt tracks).
- **2025.01**: One paper accepted to **ICLR 2025**.
- **2024.08**: 🏆 Winner of the LSVOS V6 Challenge (VOS track).
- **2024.07**: 🏆 Winner of the VOTS 2024 Challenge; one paper accepted to **ECCV 2024**.
- **2024.06**: 🏆 Winner of the 3rd PVUW Challenge at CVPR 2024 (MOSE track).
- **2024.03**: One paper accepted to **IEEE TMM**.
- **2023.08**: 2nd place in the 5th LSVOS Challenge (VOS track).

# 📝 Publications
{: #publications}

{% assign publication_year = 0 %}
{% for paper in site.data.publications %}
{% if paper.year != publication_year %}
<h2 class="publication-year">{{ paper.year }}</h2>
{% assign publication_year = paper.year %}
{% endif %}
{% include research-item.html paper=paper %}
{% endfor %}

<details class="earlier-manuscript">
<summary>Earlier research manuscript</summary>
<p><strong>Referring and Reasoning Segmentation via Learning Contextual Instructions</strong></p>
<p class="research-authors"><strong>Deshui Miao</strong>, Yameng Gu, Zhenyu He, Xin Li, Qingfang Zheng, Ming-Hsuan Yang</p>
<p>ContextSeg studies contextual spatial information and temporal aggregation for referring and reasoning segmentation.</p>
</details>

# 🧩 Projects
{: #projects}

<div class="project-grid">
  <article class="project-card">
    <a href="https://yahooo-m.github.io/ReST/" aria-label="ReST project page"><img src="{{ '/images/research/rest.webp' | relative_url }}" alt="ReST subtitle, title and watermark erasure examples" loading="lazy" width="640" height="360"></a>
    <div class="project-card-body">
      <h2><a href="https://yahooo-m.github.io/ReST/">ReST</a></h2>
      <p class="project-subtitle">One-Step Video Subtitle Erasure · ByteDance</p>
      <p>Residual spatio-temporal diffusion removes video subtitles while retaining source appearance and motion.</p>
      <p class="research-links"><a href="https://yahooo-m.github.io/ReST/">Project &amp; demos ↗</a></p>
    </div>
  </article>
  <article class="project-card">
    <a href="https://yahooo-m.github.io/DVTE-Bench/" aria-label="DeOverlay and DVTE-Bench project page"><img src="{{ '/images/research/dvte-benchmark.png' | relative_url }}" alt="DVTE-Bench construction pipeline and eight text-overlay categories" loading="lazy" width="640" height="360"></a>
    <div class="project-card-body">
      <h2><a href="https://yahooo-m.github.io/DVTE-Bench/">DeOverlay + DVTE-Bench</a></h2>
      <p class="project-subtitle">Video Overlay Removal</p>
      <p>Explore paired videos and recorded removal results across eight text-overlay categories, with 1,631 clips and 136,090 frames.</p>
      <p class="research-links"><a href="https://yahooo-m.github.io/DVTE-Bench/">Project &amp; benchmark explorer ↗</a></p>
    </div>
  </article>
</div>

# 📄 Technical Reports
{: #technical-reports}

<ul class="report-list">
{% for report in site.data.technical_reports %}
  <li><a href="{{ report.paper_url }}"><strong>{{ report.title | escape }}</strong></a><p>{{ report.summary | escape }}</p></li>
{% endfor %}
</ul>

# 🏆 Honors and Awards
{: #honors-and-awards}

- **2026 · CVPR PVUW — MeViS-Audio track, 1st place.** [APRVOS report](https://arxiv.org/abs/2604.18665) · [Official workshop](https://pvuw.github.io/)
- **2025 · VOTS Challenge — Winner, VOTS / VOTS-RT / VOTSt tracks.**
- **2024 · 6th LSVOS Challenge — VOS track, 1st place.** [Report](https://arxiv.org/abs/2408.16431) · [Certificate](/images/lsvos_winner.jpg)
- **2024 · VOTS Challenge — VOTS track, Winner.** [Challenge report](https://prints.vicos.si/publications/450) · [Certificate](/images/vots2024-winner.jpg)
- **2024 · CVPR PVUW — MOSE track, 1st place.** [Report](https://arxiv.org/abs/2406.04600) · [Certificate](/images/MOSEWinner.jpg)
- **2023 · ICCV 5th LSVOS Challenge — VOS track, 2nd place.** [Report](https://youtube-vos.org/assets/challenge/2023/reports/VOS_2nd.pdf) · [Certificate](/images/LSVOS5.jpg)

# 🎖 Services
{: #services}

Reviewer: **NeurIPS 2024**.

# 💻 Internships
{: #internships}

- **2025.10 – Present** · **ByteDance**, Algorithm Research Intern, Shenzhen, China.
- **2025.05 – 2025.08** · **Tencent**, Qingyun Program (青云计划), Shenzhen, China.
- **2022.09 – 2025.04** · **Peng Cheng Laboratory**, supervised by [Xin Li](https://sites.google.com/view/xinli-homepage), Shenzhen, China.
- **2021.07 – 2022.05** · **Alibaba AI Research (Amap)**, Beijing, China.
- **2021.05 – 2021.07** · **SenseTime**, Beijing, China.

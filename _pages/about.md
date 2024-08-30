---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

I am a 2nd-year Ph.D. candidate at Harbin Institute of Technology (Shenzhen), under the supervision of [Zhenyu He](https://faculty.hitsz.edu.cn/hezhenyu). Now I am doing research under the supervision of [Xin Li](https://sites.google.com/view/xinli-homepage) and [Ming-Hsuan Yang](https://faculty.ucmerced.edu/mhyang/).

<!-- I'm generally interested in video self-supervised learning. In particular, on topics:
- video correspondence learning with downstream tasks including video object segmentation, point tracking, etc.
- learning generalizable representations with large-scale unlabeled videos
- large-scale generative models for representation and synthesis, e.g., diffusion models, Masked Image Modeling.   -->




# 🔥 News
- *2024.08*: &nbsp;🎉🎉 Winner of the LSVOS V6 Challenge (VOS Track)
- *2024.07*: &nbsp;🎉🎉 Winner of the VOTS 2024 Challenge (VOTS Track)
- *2024.07*: &nbsp;🎉🎉 One paper is accepted to ECCV 2024
- *2024.06*: &nbsp;🎉🎉 Winner of the 3th PVUW workshop (MOSE Track)
- *2024.03*: &nbsp;🎉🎉 One paper is accepted to TMM
- *2023.08*: &nbsp;🎉🎉 2nd Place of 5th LSVOS Challenge

# 📝 Publications 
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Arxiv</div><img src='images/overall8.jpg' alt="sym" width="70%"></div></div>
<div class='paper-box-text' markdown="1">

Learning Spatial-Semantic Features for Robust Video Object Segmentation [[pdf](https://arxiv.org/abs/2407.07760)][[code](https://github.com/yahooo-m/VOS-Solution)]

**Xin Li**, **Deshui Miao**, Zhenyu He, Yaowei Wang, Huchuan Lu, Ming-Hsuan Yang


<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- In this paper, we propose a robust video object segmentation framework equipped with spatial-semantic features and discriminative object queries to address the above issues. Specifically, we construct a spatial-semantic network comprising a semantic embedding block and spatial dependencies modeling block to associate the pretrained ViT features with global semantic features and local spatial features, providing a comprehensive target representation. In addition, we develop a masked cross-attention module to generate object queries that focus on the most discriminative parts of target objects during query propagation, alleviating noise accumulation and ensuring effective long-term query propagation. 

</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ECCV 2024</div><img src='images/framework6.jpg' alt="sym" width="70%"></div></div>
<div class='paper-box-text' markdown="1">

Spatial-Temporal Multi-level Association for Video Object Segmentation [[pdf](https://arxiv.org/abs/2404.06265)][[code](https://github.com/yahooo-m/VOS-Solution)]

**Deshui Miao**, Xin Li, Zhenyu He, Huchuan Lu, Ming-Hsuan Yang

European Conference on Computer Vision **(ECCV)** 2024

<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- we propose a spatial-temporal memory to assist feature association and temporal ID assignment and correlation. We evaluate the proposed method by conducting extensive experiments on numerous video object segmentation datasets, including DAVIS 2016/2017 val, DAVIS 2017 test-dev, and YouTube-VOS 2018/2019 val. The favorable performance against the state-of-the-art methods demonstrates the effectiveness of our approach. 

</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">TMM</div><img src='images/TMM.png' alt="sym" width="70%"></div></div>
<div class='paper-box-text' markdown="1">

Context-Guided Black-Box Attack for Visual Tracking [[pdf](https://ieeexplore.ieee.org/abstract/document/10489919/)]

Xingsen Huang, **Deshui Miao**, Hongpeng Wang, Yaowei Wang, Xin Li

IEEE Transactions on Multimedia **(TMM)** 

<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- We propose a context-guided black-box attack method to investigate the robustness of recent advanced deep trackers against spatial and temporal interference. 

</div>
</div>

# 🎖 Services
Reviewer of NIPS 2024.

# 🎖 Honors and Awards
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Winner of CVPR 2024 PVUW workshop</div><img src='images/MOSEWinner.jpg' alt="sym" width="70%"></div></div>
<div class='paper-box-text' markdown="1"> 
1st Place Solution for MOSE Track in CVPR 2024 PVUW Workshop: Complex Video Object Segmentation [[pdf](https://arxiv.org/pdf/2406.17005)] [[code](https://github.com/yahooo-m/VOS-Solution)]

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">2nd of ICCV 2023 LSVOS workshop</div><img src='images/LSVOS5.jpg' alt="sym" width="70%"></div></div>
<div class='paper-box-text' markdown="1"> 
2nd Place Solution for the LSVOS Challenge 2023: Video Object Segmentation [[pdf](https://arxiv.org/pdf/2406.17005)]

</div>
</div>

<!-- # 📖 Educations
- *2019.06 - 2022.04 (now)*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2015.09 - 2019.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  -->

<!-- # 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->

# 💻 Internships
- *2021.03 - 2022.06*, Sensetime, Beijing, China.
- *2021.06 - 2022.05*, Alibaba AI Research (GaoDe map), Beijing, China.
- *2022.09 - Now*, PengCheng Laboratory (supervised by [Xin Li](https://sites.google.com/view/xinli-homepage)),Shenzhen, China.

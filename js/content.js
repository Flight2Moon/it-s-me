/* Jihoney OS — single source of truth for portfolio content.
   Edit JOS.data to update every window, the terminal files, and resume.html at once. */
window.JOS = window.JOS || {};

JOS.data = {
  name: 'Ji Heon Kim',
  nameKo: '김지헌',
  user: 'jihoney',
  host: 'hive',
  tagline: 'Undergraduate AI researcher working on vision-language models, multimodal learning, and trustworthy AI.',
  email: 'kimjiheon2536@gmail.com',
  photo: 'assets/photo.jpg',
  links: {
    github: 'https://github.com/Flight2Moon',
    blog: 'https://flight2moon.github.io/',
    resumePdf: 'assets/JiHeonKim_Resume.pdf'
  },
  interests: [
    'Vision-Language Models',
    'Multimodal Learning',
    'Trustworthy AI and Generalization',
    'Video Understanding and Anomaly Detection'
  ],
  education: [
    { school: 'Dong-A University', dept: 'Department of AI', when: 'Mar 2022 – Present', note: '4th year' }
  ],
  research: [
    {
      lab: 'UVLL — UNIST Vision & Learning Lab', org: 'UNIST', prof: 'Prof. Seungryul Baek',
      role: 'Undergraduate Researcher', when: 'Jan 2026 – Present',
      points: [
        'Research paper seminar presentation',
        'Large-scale multimodal dataset filtering',
        'VLM-based deepfake detection and prevention framework using large-scale dataset curation'
      ]
    },
    {
      lab: 'PILL — Physio-Informatics Lifecare Lab', org: 'Dong-A University', prof: 'Prof. Minkook Son',
      role: 'Undergraduate Researcher', when: 'Mar 2026 – Present',
      points: [
        'Research infrastructure and GPU cluster management',
        'Undergraduate teaching assistant (TA)',
        'Reliable and trustworthy medical AI'
      ]
    },
    {
      lab: 'AIDT — Artificial Intelligence Digital Twin Lab', org: 'Dong-A University', prof: 'Prof. Suk-Hwan Lee',
      role: 'Undergraduate Researcher', when: 'Mar 2024 – May 2025',
      points: [
        'High-efficiency edge computing framework via Jetson Nano clusters',
        'Deep learning research on anomalous sound detection and audio denoising'
      ]
    }
  ],
  projects: [
    {
      id: 'graph-memory-vad', kind: 'Personal',
      title: 'Edge-Triggered Dynamic Semantic Graph Memory for Cross-Domain Video Anomaly Detection',
      when: 'Mar 2026 – Present',
      topic: 'Edge-to-server video anomaly detection with vision-language models and dynamic scene graphs',
      points: [
        'Developed an edge-to-server anomaly detection framework that converts triggered video scenes into dynamic semantic graphs for explainable anomaly reasoning',
        'Implemented an end-to-end framework for event package reception, VLM-based relation extraction, semantic graph construction, graph memory retrieval, hybrid anomaly scoring, and dashboard-based visualization',
        'Proposed a fine-tuning-free anomaly reasoning strategy using context-conditioned graph rarity, rule violation, temporal persistence, transition unexpectedness, and VLM uncertainty'
      ]
    },
    {
      id: 'cpx-multi-agent', kind: 'Personal',
      title: 'Multi-Agent AI Standardized Patient System for CPX Training',
      when: 'Mar 2026 – Present',
      topic: 'Interactive patient simulation and evidence-grounded clinical interview evaluation',
      points: [
        'Designed a multi-agent CPX training framework that separates interactive AI patient simulation from post-session, rubric-based clinical interview evaluation',
        'Developed structured patient-state representations and action-contingent disclosure rules to maintain persona consistency and reveal clinical information only after relevant questions or examinations',
        'Built an evidence-grounded evaluation pipeline that maps student utterances and examination actions to CPX rubrics, generating feedback with performed items, omissions, quoted evidence, and alternative expressions'
      ]
    },
    {
      id: 'audio-denoising', kind: 'Personal',
      title: 'Unsupervised Denoising of Noisy-Only Audio in Small-Scale Datasets',
      when: 'Feb 2025 – Dec 2025',
      topic: 'Background noise reduction in machine sounds',
      points: [
        'Developed a lightweight unsupervised denoising framework for abnormal sound detection using only 1,000 noisy audio samples per machine class',
        'Proposed a noise-to-noise augmentation technique utilizing intra-class pairing and cropping without labeled or clean audio'
      ]
    },
    {
      id: 'pcpa-vlm', kind: 'Dong-A Univ. Dept. of Child Studies',
      title: 'VLM-based Automated Framework for Parent-Child Play Assessment (PCPA)',
      when: 'Mar 2026 – May 2026',
      points: [
        'Proposed an end-to-end VLM-based framework to automate the clinical observation of parental responsiveness and acceptance by mapping non-verbal behavioral cues to structured psychological descriptors'
      ]
    },
    {
      id: 'llm-calibration', kind: 'Dong-A Univ. College of Medicine',
      title: 'Quantitative Analysis of Domain-Specific LLM Calibration and Human-AI Alignment in Medical Physiology',
      when: 'Mar 2026 – Present',
      points: [
        'Investigated the generalization and domain-specific biases of large language models in high-stakes medical knowledge retrieval and reasoning tasks'
      ]
    },
    {
      id: 'dyslipidemia', kind: 'Dong-A Univ. College of Medicine',
      title: 'Predictive Modeling for Dyslipidemia Risk and Medication Status using Public Health Data',
      when: 'Jan 2026 – Present',
      points: [
        'Developed a binary classification model to predict dyslipidemia status and medication adherence using the KNHANES (Korea National Health and Nutrition Examination Survey) dataset',
        'Revised the feature set by analyzing feature importance and removing target-proxy variables to ensure valid model evaluation',
        'Leveraged a domain-specific LLM, MedGemma, for synthetic data generation to address class imbalance and data scarcity, improving accuracy and F1-score over the original baseline'
      ]
    },
    {
      id: 'uti-discharge', kind: 'Dong-A Univ. College of Medicine',
      title: 'Predicting Hospitalization and Discharge Dates for UTI Patients',
      when: 'Sep 2025 – Present',
      points: [
        'Developed a predictive model to estimate the discharge dates of UTI patients, aiming to optimize hospital resource management',
        'Preprocessed heterogeneous clinical EHR data through missing-value imputation, outlier detection, and feature engineering',
        'Implemented and benchmarked multiple ML/DL models, including XGBoost, LightGBM, and LSTM, to identify the most robust predictive approach'
      ]
    },
    {
      id: 'dacon-fake-audio', kind: 'DACON 2024',
      title: 'Detection of Fake Audio via Speaker Pattern Augmentation',
      when: '2024',
      points: [
        'Proposed an augmentation method that combines and crops audio samples within the same class without using external datasets',
        'ResNet-based classifier design and training using spectrogram features'
      ]
    },
    {
      id: 'dcase2024', kind: 'DCASE 2024 Task 2',
      title: 'First-Shot Unsupervised Anomalous Sound Detection for Machine Condition Monitoring',
      when: '2024',
      points: [
        'Data preprocessing and augmentation',
        'Model training pipeline design'
      ]
    }
  ],
  publications: [
    {
      authors: 'Jiheon Kim†, Jihye Shin, Chaeyeong Yi',
      title: 'Improving Prediction of Suboptimal Medication Adherence in Dyslipidemia Using Generative Data Augmentation: A KNHANES-Based Machine Learning Study',
      venue: 'SoLA 2026', status: 'Accepted', note: '† First & presenting author'
    },
    {
      authors: 'Jihye Shin, Jiheon Kim, Min Jeong Kim, Chaeyeong Yi',
      title: 'Prediction of Prolonged Hospitalization in Sepsis Using Admission-Level Data',
      venue: 'The Korean Society of Critical Care Medicine (KSCCM ACCC) 2026', status: 'Under review'
    }
  ],
  awards: [
    {
      title: 'Future Talent Award (미래인재상)', by: 'The Korean Society of Lipid and Atherosclerosis (SoLA)', when: 'Apr 2026', cert: 'assets/cert-sola.jpg',
      topic: 'Improving Prediction of Suboptimal Medication Adherence in Dyslipidemia Using Generative Data Augmentation',
      points: [
        'Conducted first-author research on predicting suboptimal medication adherence using nationally representative KNHANES data',
        'Proposed and evaluated generative augmentation strategies using CTGAN, DistilGPT-2, and GPT-5.2 to address severe class imbalance',
        'Improved Random Forest AUROC from 0.7554 to 0.7667 while achieving a sensitivity of 0.9351'
      ]
    },
    {
      title: '3rd Place, College Student Thesis Competition', by: 'The Korean Society of Management Consulting', when: 'Nov 2025', cert: 'assets/cert-thesis.jpg',
      topic: 'Shareholder structure and kinship share analysis system using an LLM-based name normalization model',
      points: [
        'Proposed a company-specific TAG (Tabular-Augmented Generation) framework to improve RAG retrieval performance with per-company summary information',
        'Designed a framework for visualizing and analyzing corporate-shareholder relationships and generating structured reports'
      ]
    },
    {
      title: '1st Place, CODE:MEDI', by: 'Busan Metropolitan City', when: 'Aug 2025', cert: 'assets/cert-codemedi.jpg',
      topic: 'Predicting 30-day discharge dates for UTI patients using MIMIC-IV data',
      points: [
        'Achieved 93.2% accuracy using a Transformer-based model with imputation and masking strategies for missing data',
        'Proposed and implemented an autoencoder-based summarizer model'
      ]
    }
  ],
  honors: [
    '2026 Donga Plus Scholarship',
    '2025 Excellent Performance Scholarship',
    '2025 Donga Plus Scholarship',
    '2024 Eom Ki-seop Scholarship',
    '2024 Donga Plus Scholarship',
    '2024 Excellent Performance Scholarship',
    '2023 Excellent Performance Scholarship',
    '2022 Excellent Performance Scholarship'
  ],
  certs: [
    'Linux Master Level 2 (KAIT)',
    'Microsoft Certified: Azure Data Fundamentals',
    'Microsoft Certified: Azure Fundamentals'
  ]
};

/* HTML renderers shared by the OS windows and resume.html */
(function () {
  const D = JOS.data;
  const esc = JOS.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ul = a => a && a.length ? `<ul>${a.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const item = (title, meta, when, body) =>
    `<article class="item"><header><h3>${esc(title)}</h3><span class="when">${esc(when || '')}</span></header>` +
    (meta ? `<p class="meta">${esc(meta)}</p>` : '') + body + `</article>`;

  const cert = a => a.cert ? `<a class="cert" href="${esc(a.cert)}" target="_blank" rel="noopener"><img src="${esc(a.cert)}" alt="Certificate: ${esc(a.title)}" loading="lazy"><span>View certificate ↗</span></a>` : '';

  JOS.html = {
    about: () => `
      <div class="hero"><div class="avatar">${D.photo ? `<img src="${esc(D.photo)}" alt="Portrait of ${esc(D.name)}">` : '🐝'}</div>
        <div><h1>${esc(D.name)} <small>${esc(D.nameKo)}</small></h1><p>${esc(D.tagline)}</p></div></div>
      <h2>Research Interests</h2>
      <ul class="chips">${D.interests.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <h2>Education</h2>
      ${D.education.map(e => item(e.school, `${e.dept} · ${e.note}`, e.when, '')).join('')}
      <h2>Contact</h2>
      <p class="btns">
        <a class="btn" href="mailto:${esc(D.email)}">✉ ${esc(D.email)}</a>
        <a class="btn" href="${esc(D.links.github)}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn" href="${esc(D.links.blog)}" target="_blank" rel="noopener">Blog</a>
      </p>`,
    research: () => `<h2>Research Experience</h2>` +
      D.research.map(r => item(r.lab, `${r.org} · ${r.prof} · ${r.role}`, r.when, ul(r.points))).join(''),
    projects: () => `<h2>Projects</h2>` +
      D.projects.map((p, i) => `<details class="item"${i < 2 ? ' open' : ''}><summary><h3>${esc(p.title)}</h3>
        <span class="when">${esc(p.when)}</span></summary><p class="meta">${esc(p.kind)}${p.topic ? ' · ' + esc(p.topic) : ''}</p>${ul(p.points)}</details>`).join(''),
    pubs: () => `<h2>Publications</h2>` +
      D.publications.map(p => `<article class="item"><p class="meta">${esc(p.authors)}</p><h3>“${esc(p.title)}”</h3>
        <p><span class="tag">${esc(p.status)}</span> ${esc(p.venue)}${p.note ? ` <span class="meta">— ${esc(p.note)}</span>` : ''}</p></article>`).join(''),
    awards: () => `<h2>Awards</h2>` +
      D.awards.map(a => item(a.title, `${a.by} · ${a.topic}`, a.when, ul(a.points) + cert(a))).join('') +
      `<h2>Honors</h2>${ul(D.honors)}<h2>Certifications</h2>${ul(D.certs)}`
  };
})();

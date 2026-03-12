// ============================================
// MARKETING ANALYSIS TOOL — RENDERING ENGINE
// Converts JSON data into dashboard HTML
// ============================================

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ===== TRENDS =====
function renderTrends(trends) {
  if (!trends || !trends.length) return;
  const dayTrends = trends.filter(t => t.timeframe === 'day');
  const weekTrends = trends.filter(t => t.timeframe === 'week');

  document.getElementById('trend-day-grid').innerHTML = dayTrends.map(t => renderTrendCard(t)).join('');
  document.getElementById('trend-week-grid').innerHTML = weekTrends.map(t => renderTrendCard(t)).join('');
}

function renderTrendCard(t) {
  const platforms = (t.platforms || []).map(p =>
    `<span class="platform-tag ${esc(p)} clickable" data-platform="${esc(p)}">${esc(capitalize(p))}</span>`
  ).join('');

  const detailMetrics = (t.detailMetrics || []).map(m =>
    `<div class="detail-metric"><div class="detail-metric-platform ${esc(m.platform)}">${esc(capitalize(m.platform))}</div><div class="detail-metric-value">${esc(m.value)}</div><div class="detail-metric-label">${esc(m.label)}</div></div>`
  ).join('');

  const links = (t.searchLinks || []).map(l =>
    `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="detail-link ${esc(l.platform)}">${esc(l.label)} &#8599;</a>`
  ).join('');

  const viewsJson = JSON.stringify(t.views || {});
  const defaultRegion = 'australia';
  const defaultViews = t.views?.[defaultRegion] || t.views?.global || '';

  return `<div class="trend-card ${esc(t.tier || '')}" data-platforms="${(t.platforms || []).join(' ')}" data-views='${esc(viewsJson)}' data-growth="${esc(t.growth)}">
    <div class="trend-badge">${esc(t.status)}</div>
    <h3>${esc(t.title)}</h3>
    <div class="trend-platforms">${platforms}</div>
    <p>${esc(t.description)}</p>
    <div class="trend-metrics">
      <span class="views-label">${esc(defaultViews)} views</span>
      <span>Growth: ${esc(t.growth)}</span>
    </div>
    <div class="relevance-bar">
      <div class="relevance-label">Business Relevance</div>
      <div class="relevance-track"><div class="relevance-fill" style="width:${t.relevance || 0}%"></div></div>
      <span class="relevance-score">${t.relevance || 0}%</span>
    </div>
    <div class="expand-hint">Click to expand metrics &amp; links</div>
    <div class="trend-card-detail">
      <div class="detail-metrics-grid">${detailMetrics}</div>
      <div class="detail-links">${links}</div>
    </div>
  </div>`;
}

// ===== VIRAL POSTS =====
function renderViralPosts(viralPosts) {
  if (!viralPosts) return;
  ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
    const container = document.getElementById(`platform-${platform}-content`);
    if (!container) return;
    const posts = viralPosts[platform] || [];
    container.innerHTML = posts.map(p => renderViralCard(p)).join('');
  });
}

function renderViralCard(p) {
  const metrics = (p.metrics || []).map(m =>
    `<div class="metric"><span class="metric-value">${esc(m.value)}</span><span class="metric-label">${esc(m.label)}</span></div>`
  ).join('');

  const categories = (p.contentCategory || []).map(c => `<span class="tag">${esc(c)}</span>`).join('');
  const hooks = (p.hookType || []).map(h => `<span class="tag">${esc(h)}</span>`).join('');
  const triggers = (p.psychTriggers || []).map(t => `<span class="tag trigger">${esc(t)}</span>`).join('');

  const share = (p.scores?.shareability || 0) * 10;
  const save = (p.scores?.saveability || 0) * 10;
  const comment = (p.scores?.commentDriver || 0) * 10;

  return `<div class="viral-card">
    <div class="viral-header">
      <div class="viral-rank">#${p.rank || ''}</div>
      <div class="viral-info">
        <h3>${esc(p.title)}</h3>
        <span class="viral-brand">${esc(p.creator)}</span>
      </div>
      <div class="viral-score">
        <div class="score-circle">${p.viralityScore || 0}</div>
        <span>Virality Score</span>
      </div>
    </div>
    <div class="viral-metrics">${metrics}</div>
    <div class="viral-details">
      <div class="detail-group"><h4>Content Category</h4>${categories}</div>
      <div class="detail-group"><h4>Hook Type</h4>${hooks}</div>
      <div class="detail-group"><h4>Visual Style</h4><p>${esc(p.visualStyle)}</p></div>
      <div class="detail-group"><h4>Psychological Triggers</h4>${triggers}</div>
      <div class="detail-group"><h4>Why It Resonated</h4><p>${esc(p.whyItResonated)}</p></div>
      <div class="scores-row">
        <div class="mini-score"><span>Shareability</span><div class="mini-bar"><div style="width:${share}%"></div></div><span>${p.scores?.shareability || 0}/10</span></div>
        <div class="mini-score"><span>Saveability</span><div class="mini-bar"><div style="width:${save}%"></div></div><span>${p.scores?.saveability || 0}/10</span></div>
        <div class="mini-score"><span>Comment Driver</span><div class="mini-bar"><div style="width:${comment}%"></div></div><span>${p.scores?.commentDriver || 0}/10</span></div>
      </div>
      <div class="detail-group"><h4>Core Learning</h4><p class="core-learning">${esc(p.coreLearning)}</p></div>
    </div>
  </div>`;
}

// ===== COMPETITORS =====
function renderCompetitors(competitors) {
  if (!competitors?.products?.length) return;
  const grid = document.getElementById('competitor-grid');
  const filterBar = document.getElementById('product-filter-btns');
  if (!grid || !filterBar) return;

  filterBar.innerHTML = `<button class="product-btn active" data-product="all">All Products</button>` +
    competitors.products.map(p =>
      `<button class="product-btn" data-product="${esc(p.id)}">${esc(p.name)}</button>`
    ).join('');

  grid.innerHTML = competitors.products.map(p => {
    const options = (p.competitors || []).map((c, i) =>
      `<option value="${i}">${esc(c.name)}</option>`
    ).join('');

    return `<div class="competitor-card" data-product="${esc(p.id)}" id="comp-${esc(p.id)}">
      <div class="competitor-card-top">
        <div class="pe-product-label">${esc(p.name)} &mdash; <strong>${esc(p.price)}</strong></div>
        <span class="competitor-vs-badge">VS</span>
        <div class="brand-selector">
          <select class="brand-select" data-product="${esc(p.id)}">${options}</select>
        </div>
      </div>
      <div class="comp-body" id="comp-body-${esc(p.id)}"></div>
    </div>`;
  }).join('');

  window._competitorData = {};
  competitors.products.forEach(p => {
    window._competitorData[p.id] = p.competitors;
  });

  competitors.products.forEach(p => renderCompetitorBody(p.id));

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.product-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.product-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.product;
    grid.querySelectorAll('.competitor-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.product === filter) ? '' : 'none';
    });
  });

  grid.addEventListener('change', e => {
    if (e.target.classList.contains('brand-select')) {
      renderCompetitorBody(e.target.dataset.product);
    }
  });
}

function renderCompetitorBody(productId) {
  const card = document.getElementById('comp-body-' + productId);
  const select = document.querySelector(`.brand-select[data-product="${productId}"]`);
  if (!card || !select || !window._competitorData?.[productId]) return;

  const brand = window._competitorData[productId][parseInt(select.value)];
  if (!brand) return;

  const metricsHTML = (brand.metrics || []).map(m =>
    `<div class="comp-metric-row"><span class="comp-metric-label">${esc(m.label)}</span><span class="comp-metric-pe">${esc(m.pe)}</span><span class="comp-metric-vs">vs</span><span class="comp-metric-comp">${esc(m.comp)}</span></div>`
  ).join('');

  const strengths = (brand.strengths || []).map(s => `<li>${esc(s)}</li>`).join('');
  const wins = (brand.businessWins || []).map(w => `<li>${esc(w)}</li>`).join('');

  card.innerHTML = `<div class="variant-brand-name">${esc(brand.name)} <span class="brand-type">${esc(brand.type)}</span></div>
    <div class="competitor-metrics">${metricsHTML}</div>
    <div class="comp-lists">
      <div class="comp-list"><h4>Their Strengths</h4><ul>${strengths}</ul></div>
      <div class="comp-list wins"><h4>Your Wins</h4><ul>${wins}</ul></div>
    </div>
    <div class="comp-action"><strong>Action:</strong> ${esc(brand.action)}</div>`;
}

// ===== ARCHETYPES =====
function renderArchetypes(archetypes, gapAnalysis) {
  const grid = document.getElementById('archetype-grid');
  const gapEl = document.getElementById('gap-summary');
  if (!grid) return;

  grid.innerHTML = (archetypes || []).map(a => {
    const fillClass = a.usage >= 60 ? 'high' : a.usage >= 30 ? 'medium' : 'low';
    return `<div class="archetype-card">
      <div class="archetype-number">${a.number}</div>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.description)}</p>
      <div class="archetype-score">
        <span>Usage:</span>
        <div class="usage-bar"><div class="usage-fill ${fillClass}" style="width:${a.usage}%"></div></div>
        <span class="usage-label">${esc(a.usageLabel)}</span>
      </div>
      <div class="archetype-verdict ${esc(a.statusType)}">${esc(a.status)}</div>
    </div>`;
  }).join('');

  if (gapEl && gapAnalysis) {
    const triggers = (gapAnalysis.missingTriggers || []).map(t => `<li><strong>${esc(t.name)}</strong> &mdash; ${esc(t.detail)}</li>`).join('');
    const overused = (gapAnalysis.overusedArchetypes || []).map(a => `<li><strong>${esc(a.name)}</strong> &mdash; ${esc(a.detail)}</li>`).join('');
    const underused = (gapAnalysis.underusedArchetypes || []).map(a => `<li><strong>${esc(a.name)}</strong> &mdash; ${esc(a.detail)}</li>`).join('');
    const platforms = (gapAnalysis.platformReach || []).map(p =>
      `<tr><td>${esc(p.platform)}</td><td class="${p.level === 'LOW' || p.level === 'ABSENT' ? 'low-reach' : 'mod-reach'}">${esc(p.level)}</td><td>${esc(p.detail)}</td></tr>`
    ).join('');

    gapEl.innerHTML = `<h3>Gap Analysis Summary</h3>
      <div class="gap-grid">
        <div class="gap-item"><h4>Missing Psychological Triggers</h4><ul>${triggers}</ul></div>
        <div class="gap-item"><h4>Overused Archetypes</h4><ul>${overused}</ul></div>
        <div class="gap-item"><h4>Most Underused Archetypes</h4><ul>${underused}</ul></div>
        <div class="gap-item"><h4>Predicted Organic Reach</h4><table class="mini-table">${platforms}</table></div>
      </div>`;
  }
}

// ===== SCORECARD =====
function renderScorecard(scorecard) {
  if (!scorecard) return;
  const hero = document.getElementById('scorecard-hero');
  const grid = document.getElementById('scorecard-grid');
  const bench = document.getElementById('benchmark-body');

  if (hero) {
    hero.innerHTML = `<div class="total-score">
      <div class="total-score-circle"><span class="score-number">${scorecard.overall}</span><span class="score-max">/100</span></div>
      <p>Overall Virality Score</p>
    </div>
    <div class="score-interpretation">
      <h3>Assessment: ${esc(scorecard.assessment)}</h3>
      <p>${esc(scorecard.assessmentDetail)}</p>
    </div>`;
  }

  if (grid) {
    grid.innerHTML = (scorecard.categories || []).map(c =>
      `<div class="score-category">
        <h4>${esc(c.name)}</h4>
        <div class="score-bar-container"><div class="score-bar" style="width:${c.score}%"><span>${c.score}/100</span></div></div>
        <p>${esc(c.description)}</p>
      </div>`
    ).join('');
  }

  if (bench) {
    bench.innerHTML = (scorecard.benchmarks || []).map(b => {
      const gapClass = b.gap === 'Severe' ? 'gap-severe' : b.gap === 'Moderate' ? 'gap-moderate' : b.gap === 'No Data' ? 'gap-data' : '';
      return `<tr><td>${esc(b.metric)}</td><td>${esc(b.business)}</td><td>${esc(b.average)}</td><td>${esc(b.topPerformer)}</td><td class="${gapClass}">${esc(b.gap)}</td></tr>`;
    }).join('');
  }
}

// ===== IMPROVED POSTS =====
function renderImprovedPosts(posts) {
  if (!posts) {
    ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
      const container = document.getElementById(`improved-${platform}`);
      if (container) container.innerHTML = '<div class="empty-section-msg">No improved posts data available. Try re-running the analysis.</div>';
    });
    return;
  }
  ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
    const container = document.getElementById(`improved-${platform}`);
    if (!container) return;
    container.innerHTML = (posts[platform] || []).map(p => {
      const triggers = (p.triggers || []).map(t => `<span class="tag trigger">${esc(t)}</span>`).join('');
      return `<div class="improved-post">
        <div class="improved-post-header">
          <span class="post-number">#${p.number}</span>
          <h4>${esc(p.title)}</h4>
          <span class="archetype-label">${esc(p.archetype)}</span>
        </div>
        <div class="post-script">
          <div class="script-section"><span class="script-label">HOOK:</span> ${esc(p.script?.hook)}</div>
          <div class="script-section"><span class="script-label">BODY:</span> ${esc(p.script?.body)}</div>
          <div class="script-section"><span class="script-label">REVEAL:</span> ${esc(p.script?.reveal)}</div>
          <div class="script-section"><span class="script-label">CTA:</span> ${esc(p.script?.cta)}</div>
        </div>
        <div class="post-triggers">${triggers}</div>
      </div>`;
    }).join('');
  });
}

// ===== KPI =====
function renderKPI(kpi) {
  if (!kpi) {
    const tbody = document.getElementById('kpi-perf-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="12" class="empty-section-msg">No KPI data available. Try re-running the analysis.</td></tr>';
    return;
  }
  const tbody = document.getElementById('kpi-perf-body');
  const targetsEl = document.getElementById('kpi-targets');
  const formulasEl = document.getElementById('kpi-formulas');

  if (tbody) {
    tbody.innerHTML = (kpi.recentPerformance || []).map(r => {
      const trendClass = r.trendType === 'positive' ? 'trend-up' : r.trendType === 'negative' ? 'trend-down' : 'trend-flat';
      return `<tr>
        <td>${r.week}</td><td>${esc(r.date)}</td><td>${esc(r.description)}</td>
        <td>${esc(r.platform)}</td><td>${esc(r.type)}</td><td>${esc(r.reach)}</td>
        <td>${esc(r.likes)}</td><td>${esc(r.comments)}</td><td>${esc(r.saves)}</td>
        <td>${esc(r.shares)}</td><td>${esc(r.engRate)}</td>
        <td><span class="trend-badge-sm ${trendClass}">${esc(r.trend)}</span></td>
      </tr>`;
    }).join('');
  }

  if (targetsEl && kpi.targets) {
    targetsEl.innerHTML = ['tiktok', 'instagram', 'facebook', 'linkedin'].map(platform => {
      const t = kpi.targets[platform] || [];
      return `<div class="target-card">
        <h4>${capitalize(platform)}</h4>
        ${t.map(m => `<div class="target-month"><span>Month ${m.month}:</span> ${esc(m.target)}</div>`).join('')}
      </div>`;
    }).join('');
  }

  if (formulasEl && kpi.formulas) {
    formulasEl.innerHTML = (kpi.formulas || []).map(f =>
      `<div class="formula-card"><h4>${esc(f.name)}</h4><code>${esc(f.formula)}</code><p>Target: ${esc(f.target)}</p></div>`
    ).join('');
  }
}

// ===== ROADMAP =====
function renderRoadmap(roadmap) {
  if (!roadmap) {
    const phasesEl = document.getElementById('roadmap-phases');
    if (phasesEl) phasesEl.innerHTML = '<div class="empty-section-msg">No roadmap data available. Try re-running the analysis.</div>';
    return;
  }
  const phasesEl = document.getElementById('roadmap-phases');
  const recsEl = document.getElementById('roadmap-recs');

  if (phasesEl) {
    phasesEl.innerHTML = (roadmap.phases || []).map(phase => {
      const weeks = (phase.weeks || []).map(w =>
        `<div class="roadmap-week"><h4>${esc(w.label)}</h4><ul>${(w.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`
      ).join('');
      const metrics = (phase.successMetrics || []).map(m => `<li>${esc(m)}</li>`).join('');
      return `<div class="roadmap-phase">
        <div class="phase-header"><h3>${esc(phase.title)}</h3><span class="phase-subtitle">${esc(phase.subtitle)}</span></div>
        <div class="phase-weeks">${weeks}</div>
        <div class="phase-metrics"><h4>Success Metrics</h4><ul>${metrics}</ul></div>
      </div>`;
    }).join('');
  }

  if (recsEl) {
    recsEl.innerHTML = (roadmap.recommendations || []).map(r => {
      const impact = r.impact || '';
      const impactClass = impact.includes('HIGHEST') ? 'highest' : impact.includes('HIGH') ? 'high' : 'medium';
      return `<div class="rec-card">
        <div class="rec-rank">${r.rank}</div>
        <div class="rec-content"><h4>${esc(r.title)}</h4><p>${esc(r.description)}</p></div>
        <span class="rec-impact ${impactClass}">${esc(r.impact)}</span>
      </div>`;
    }).join('');
  }
}

// ===== SEO =====
function renderSEO(seo) {
  if (!seo?.length) return;
  const container = document.getElementById('seo-grid');
  if (!container) return;

  container.innerHTML = (seo || []).map(s => {
    const strategy = (s.strategy || []).map((step, i) => `<li>${esc(step)}</li>`).join('');
    return `<div class="search-term-card">
      <div class="search-term-main">
        <h3>"${esc(s.term)}"</h3>
        <div class="seo-stats">
          <span class="seo-volume">${esc(s.volume)}</span>
          <span class="seo-difficulty">${esc(s.difficulty)}</span>
          <span class="seo-rank">${esc(s.currentRank)}</span>
        </div>
      </div>
      <span class="seo-expand-hint">Click for strategy &amp; insights &#9660;</span>
      <div class="seo-card-detail">
        <div class="seo-detail-section"><h4>Trend Data</h4><ul>
          <li><strong>Trend:</strong> ${esc(s.trendData?.trend)}</li>
          <li><strong>Peak months:</strong> ${esc(s.trendData?.peakMonths)}</li>
          <li><strong>Related rising:</strong> ${esc(s.trendData?.relatedRising)}</li>
          <li><strong>Regional:</strong> ${esc(s.trendData?.regional)}</li>
        </ul></div>
        <div class="seo-detail-section"><h4>Strategy to Rank</h4><ol>${strategy}</ol></div>
        <div class="seo-detail-costs">
          <div class="seo-cost-box"><h4>Estimated Cost</h4><p>${esc(s.cost)}</p></div>
          <div class="seo-impact-box"><h4>Potential Impact</h4><p>${esc(s.impact)}</p></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ===== LLM OPPORTUNITIES =====
function renderLLM(opportunities) {
  if (!opportunities?.length) return;
  const container = document.getElementById('llm-grid');
  if (!container) return;

  container.innerHTML = (opportunities || []).map(o =>
    `<div class="llm-card">
      <span class="llm-badge llm-${esc(o.badgeType)}">${esc(o.badge)}</span>
      <h4>${esc(o.title)}</h4>
      <p>${esc(o.description)}</p>
      <div class="llm-action"><strong>Action:</strong> ${esc(o.action)}</div>
      <div class="llm-cost">${esc(o.cost)}</div>
    </div>`
  ).join('');
}

// ===== MASTER RENDER =====
function renderDashboard(data) {
  if (!data) return;

  const bizName = document.getElementById('biz-name');
  const bizDesc = document.getElementById('biz-desc');
  if (bizName) bizName.textContent = data.business?.name || 'Business Analysis';
  if (bizDesc) bizDesc.textContent = data.business?.description || '';

  document.querySelectorAll('.section-header h2').forEach(h => {
    h.textContent = h.textContent.replace(/Pure Earth/g, data.business?.name || 'Business');
  });

  renderTrends(data.trends);
  renderViralPosts(data.viralPosts);
  renderCompetitors(data.competitors);
  renderArchetypes(data.archetypes, data.gapAnalysis);
  renderScorecard(data.scorecard);
  renderImprovedPosts(data.improvedPosts);
  renderKPI(data.kpi);
  renderRoadmap(data.roadmap);
  renderSEO(data.seo);
  renderLLM(data.llmOpportunities);
}

// ===================================================================
// PDF EXPORT — Premium Dark-Theme Agency Report
// Charts: Radar, Horizontal Bars, Sparklines, Butterfly Bars, Timeline
// Icons: Geometric shapes (triangles, circles, lines)
// ===================================================================
function exportToPDF(data) {
  try {
    var jsPDFLib = window.jspdf;
    if (!jsPDFLib || !jsPDFLib.jsPDF) { alert('PDF library not loaded.'); return; }
    var jsPDF = jsPDFLib.jsPDF;
    var doc = new jsPDF('p', 'mm', 'a4');
    var pw = 210, ph = 297, m = 18, cw = pw - m * 2;
    var gut = 4, col2 = (cw - gut) / 2;
    var y = 20;

    function s(v) { if (v == null) return ''; return String(v).replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim(); }

    // ── COLOR PALETTE ──
    var C = {
      pageBg: [18,18,18], cardBg: [30,30,34], cardBgAlt: [38,38,42],
      gridLine: [50,50,55], charcoal: [18,18,18],
      forest: [89,102,85], forestDark: [55,65,52],
      gold: [184,151,106], goldDim: [140,115,80],
      sand: [232,226,216], cream: [246,244,240],
      white: [255,255,255], black: [30,30,30],
      textPrimary: [255,255,255], textSecondary: [160,160,165], textMuted: [100,100,108],
      success: [75,140,94], warning: [196,150,75], error: [180,60,50],
      link: [100,160,230],
      tiktok: [0,0,0], instagram: [193,53,132], facebook: [24,119,242], linkedin: [10,102,194]
    };

    var tocEntries = [];
    var tocPageNum = 2;

    // ── CORE HELPERS ──
    function darkPage() { doc.setFillColor(C.pageBg[0],C.pageBg[1],C.pageBg[2]); doc.rect(0,0,pw,ph,'F'); }
    function newPage() { doc.addPage(); darkPage(); y = 22; }
    function checkSpace(n) { if (y + n > 275) newPage(); }
    function setC(c) { doc.setTextColor(c[0],c[1],c[2]); }
    function setF(c) { doc.setFillColor(c[0],c[1],c[2]); }
    function setD(c) { doc.setDrawColor(c[0],c[1],c[2]); }
    function ragColor(pct) { return pct >= 0.7 ? C.success : pct >= 0.4 ? C.warning : C.error; }

    function card(x,yy,w,h,opts) {
      opts = opts || {}; var r = opts.r || 3;
      setF(opts.fill || C.cardBg);
      doc.roundedRect(x,yy,w,h,r,r,'F');
      if (opts.stroke) { setD(opts.stroke); doc.setLineWidth(opts.lw||0.2); doc.roundedRect(x,yy,w,h,r,r,'S'); }
    }

    function badge(text,x,yy,bg,fg) {
      doc.setFontSize(6); doc.setFont('helvetica','bold');
      var tw = doc.getTextWidth(s(text)) + 5;
      setF(bg||C.forest); doc.roundedRect(x,yy,tw,4.5,2.2,2.2,'F');
      setC(fg||C.white); doc.text(s(text),x+2.5,yy+3.2);
      return tw;
    }

    function scoreGauge(cx,cy,r,score,max) {
      var sc = Number(score)||0, mx = Number(max)||100;
      setF(ragColor(sc/mx)); doc.circle(cx,cy,r,'F');
      setF(C.pageBg); doc.circle(cx,cy,r*0.68,'F');
      doc.setFontSize(r>12?18:11); doc.setFont('helvetica','bold'); setC(C.white);
      doc.text(String(sc),cx,cy+(r>12?2:1),{align:'center'});
      doc.setFontSize(6); doc.setFont('helvetica','normal'); setC(C.textMuted);
      doc.text('/'+mx,cx,cy+(r>12?6.5:4.5),{align:'center'});
    }

    function scoreBar(x,yy,w,score,max,color) {
      var sc = Number(score)||0, mx = Number(max)||100;
      var fw = Math.max(1.5, Math.min((sc/mx)*w, w));
      setF(C.gridLine); doc.roundedRect(x,yy,w,3,1.5,1.5,'F');
      setF(color||C.forest); doc.roundedRect(x,yy,fw,3,1.5,1.5,'F');
    }

    function accentBar(x,yy,w,color) { setF(color||C.gold); doc.rect(x,yy,w,1,'F'); }

    function heading(text) {
      checkSpace(14); accentBar(m,y,35,C.gold); y += 4;
      doc.setFontSize(14); doc.setFont('helvetica','bold'); setC(C.white);
      doc.text(s(text),m,y); y += 2;
      setD(C.gridLine); doc.setLineWidth(0.2); doc.line(m,y,pw-m,y); y += 5;
    }

    function sectionStart(title) { newPage(); tocEntries.push({title:s(title),page:doc.internal.getNumberOfPages()}); heading(title); }

    function sub(text) { checkSpace(8); doc.setFontSize(10); doc.setFont('helvetica','bold'); setC(C.gold); doc.text(s(text),m,y); y+=5; }

    function txt(text,indent) {
      if (!text) return; checkSpace(5);
      doc.setFontSize(8); doc.setFont('helvetica','normal'); setC(C.textSecondary);
      var lines = doc.splitTextToSize(s(text),cw-(indent||0));
      lines.forEach(function(l) { checkSpace(3.8); doc.text(s(l),m+(indent||0),y); y+=3.5; }); y+=1;
    }

    function label(lbl,val,indent) {
      checkSpace(5); doc.setFontSize(8); doc.setFont('helvetica','bold'); setC(C.white);
      doc.text(s(lbl),m+(indent||0),y);
      var lw = doc.getTextWidth(s(lbl));
      doc.setFont('helvetica','normal'); setC(C.textSecondary);
      doc.text(s(val||'N/A'),m+(indent||0)+lw+1.5,y); y+=4.5;
    }

    function addLink(text,url,x,yy) {
      if (!url) return 0;
      doc.setFontSize(7.5); doc.setFont('helvetica','normal'); setC(C.link);
      var lt = s(text||url); doc.text(lt,x,yy);
      var tw = doc.getTextWidth(lt);
      doc.setLineWidth(0.15); setD(C.link); doc.line(x,yy+0.4,x+tw,yy+0.4);
      doc.link(x,yy-3,tw+2,5,{url:s(url)}); return tw;
    }

    function sep() { y+=1.5; setD(C.gridLine); doc.setLineWidth(0.15); doc.line(m,y,pw-m,y); y+=3; }

    function platColor(n) {
      var v = (n||'').toLowerCase();
      return v.indexOf('tiktok')>=0?C.tiktok:v.indexOf('instagram')>=0?C.instagram:v.indexOf('facebook')>=0?C.facebook:v.indexOf('linkedin')>=0?C.linkedin:C.forest;
    }

    // ── CHART: RADAR ──
    function drawRadar(cx,cy,radius,labels,values,maxVal,fillCol,strokeCol) {
      var n = labels.length; if (n<3) return;
      maxVal = maxVal||100; fillCol = fillCol||C.forest; strokeCol = strokeCol||C.gold;
      var step = (2*Math.PI)/n, start = -Math.PI/2;
      function pt(i,f) { var a=start+i*step; return {x:cx+radius*f*Math.cos(a),y:cy+radius*f*Math.sin(a)}; }
      // Grid rings
      [0.25,0.5,0.75,1.0].forEach(function(lv) {
        setD(C.gridLine); doc.setLineWidth(lv===1?0.25:0.12);
        for (var i=0;i<n;i++) { var p1=pt(i,lv),p2=pt((i+1)%n,lv); doc.line(p1.x,p1.y,p2.x,p2.y); }
      });
      // Axes
      setD(C.gridLine); doc.setLineWidth(0.1);
      for (var i=0;i<n;i++) { var o=pt(i,1); doc.line(cx,cy,o.x,o.y); }
      // Filled polygon with opacity
      try {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity:0.2}));
        setF(fillCol);
        var f0 = pt(0,Math.min((Number(values[0])||0)/maxVal,1));
        doc.moveTo(f0.x,f0.y);
        for (var i=1;i<n;i++) { var v=Math.min((Number(values[i])||0)/maxVal,1); var p=pt(i,v); doc.lineTo(p.x,p.y); }
        doc.close(); doc.fill();
        doc.restoreGraphicsState();
      } catch(e) { /* GState not available, skip fill */ }
      // Stroke polygon
      setD(strokeCol); doc.setLineWidth(0.5);
      var s0 = pt(0,Math.min((Number(values[0])||0)/maxVal,1));
      doc.moveTo(s0.x,s0.y);
      for (var i=1;i<n;i++) { var v=Math.min((Number(values[i])||0)/maxVal,1); var p=pt(i,v); doc.lineTo(p.x,p.y); }
      doc.close(); doc.stroke();
      // Dots + labels
      for (var i=0;i<n;i++) {
        var v=Math.min((Number(values[i])||0)/maxVal,1); var dp=pt(i,v);
        setF(strokeCol); doc.circle(dp.x,dp.y,0.9,'F');
        var lp=pt(i,1.18); var angle=start+i*step;
        var align = Math.cos(angle)<-0.1?'right':Math.cos(angle)>0.1?'left':'center';
        doc.setFontSize(5.5); doc.setFont('helvetica','bold'); setC(C.textSecondary);
        doc.text(s(labels[i]).substring(0,16),lp.x,lp.y+1,{align:align});
      }
    }

    // ── CHART: HORIZONTAL BARS ──
    function drawHorizBars(items,bx,by,bw,opts) {
      opts = opts||{}; var barH=opts.barH||4, gap=opts.gap||6.5, labelW=opts.labelW||40, scoreW=opts.scoreW||12;
      var trackW = bw-labelW-scoreW-4;
      items.forEach(function(item,i) {
        var iy = by+i*gap;
        doc.setFontSize(6.5); doc.setFont('helvetica','normal'); setC(C.textSecondary);
        doc.text(s(item.label).substring(0,22),bx,iy+barH-1);
        setF(C.gridLine); doc.roundedRect(bx+labelW,iy,trackW,barH,2,2,'F');
        var val=Number(item.value)||0, mx=Number(item.max)||100;
        var fw = Math.max(1.5,Math.min((val/mx)*trackW,trackW));
        var color = item.color || ragColor(val/mx);
        setF(color); doc.roundedRect(bx+labelW,iy,fw,barH,2,2,'F');
        doc.setFontSize(7); doc.setFont('helvetica','bold'); setC(C.white);
        doc.text(String(val),bx+labelW+trackW+3,iy+barH-1);
      });
      return items.length * gap;
    }

    // ── CHART: SPARKLINE ──
    function drawSparkline(data,sx,sy,sw,sh,color) {
      if (!data||data.length<2) return;
      color = color||C.gold;
      var maxV=0; data.forEach(function(v){if(v>maxV) maxV=v;}); if(!maxV) maxV=1;
      var stepX = sw/(data.length-1);
      // Area fill with opacity
      try {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity:0.12}));
        setF(color);
        doc.moveTo(sx,sy+sh);
        data.forEach(function(v,i) { doc.lineTo(sx+i*stepX, sy+sh-(v/maxV)*sh); });
        doc.lineTo(sx+sw,sy+sh); doc.close(); doc.fill();
        doc.restoreGraphicsState();
      } catch(e) {}
      // Line
      setD(color); doc.setLineWidth(0.5);
      data.forEach(function(v,i) {
        if (!i) return;
        doc.line(sx+(i-1)*stepX, sy+sh-(data[i-1]/maxV)*sh, sx+i*stepX, sy+sh-(v/maxV)*sh);
      });
      // Dots
      setF(color);
      data.forEach(function(v,i) { doc.circle(sx+i*stepX, sy+sh-(v/maxV)*sh, 0.7,'F'); });
    }

    // ── CHART: BUTTERFLY BAR ──
    function butterflyBar(by,centerX,halfW,leftVal,rightVal,maxV,leftCol,rightCol) {
      var barH=3.5; maxV=maxV||100;
      setD(C.gridLine); doc.setLineWidth(0.15); doc.line(centerX,by,centerX,by+barH);
      var lw = Math.max(1,(Number(leftVal)||0)/maxV*halfW);
      setF(leftCol||C.forest); doc.roundedRect(centerX-lw,by,lw,barH,1,1,'F');
      var rw = Math.max(1,(Number(rightVal)||0)/maxV*halfW);
      setF(rightCol||C.error); doc.roundedRect(centerX+0.3,by,rw,barH,1,1,'F');
    }

    // ── CHART: TIMELINE ──
    function drawTimeline(phases,tx,ty,tw) {
      var n=phases.length||1, segW=tw/n;
      var phColors = [C.forest,C.gold,C.instagram];
      phases.forEach(function(ph,i) {
        var sx=tx+i*segW;
        setF(phColors[i%3]); doc.roundedRect(sx+(i?0.5:0),ty,segW-(i<n-1?1:0),7,i===0?2:0,i===n-1?2:0,'F');
        doc.setFontSize(6); doc.setFont('helvetica','bold'); setC(C.white);
        doc.text(s(ph.title),sx+segW/2,ty+4.5,{align:'center'});
      });
      setD(C.textMuted); doc.setLineWidth(0.3); doc.line(tx,ty+10,tx+tw,ty+10);
      setF(C.textMuted); doc.triangle(tx+tw,ty+10,tx+tw-2,ty+8.5,tx+tw-2,ty+11.5,'F');
      doc.setFontSize(5); setC(C.textMuted);
      phases.forEach(function(ph,i) { doc.text(s(ph.subtitle||''),tx+i*segW+segW/2,ty+13.5,{align:'center'}); });
    }

    // ── ICONS ──
    function iconArrowUp(ix,iy,sz,color) { setF(color||C.success); doc.triangle(ix,iy-sz,ix-sz*0.7,iy+sz*0.4,ix+sz*0.7,iy+sz*0.4,'F'); }
    function iconArrowDown(ix,iy,sz,color) { setF(color||C.error); doc.triangle(ix-sz*0.7,iy-sz*0.4,ix+sz*0.7,iy-sz*0.4,ix,iy+sz,'F'); }
    function iconCheck(ix,iy,sz,color) { setD(color||C.success); doc.setLineWidth(sz*0.25); doc.line(ix-sz*0.4,iy,ix-sz*0.05,iy+sz*0.35); doc.line(ix-sz*0.05,iy+sz*0.35,ix+sz*0.45,iy-sz*0.35); }
    function iconWarning(ix,iy,sz,color) { setF(color||C.warning); doc.triangle(ix,iy-sz,ix-sz*0.8,iy+sz*0.5,ix+sz*0.8,iy+sz*0.5,'F'); setF(C.pageBg); doc.circle(ix,iy+sz*0.15,sz*0.1,'F'); doc.rect(ix-sz*0.06,iy-sz*0.35,sz*0.12,sz*0.35,'F'); }
    function iconChart(ix,iy,sz,color) { setF(color||C.forest); doc.rect(ix-sz*0.5,iy+sz*0.1,sz*0.25,-sz*0.45,'F'); doc.rect(ix-sz*0.1,iy+sz*0.1,sz*0.25,-sz*0.8,'F'); doc.rect(ix+sz*0.3,iy+sz*0.1,sz*0.25,-sz*0.6,'F'); }
    function iconStar(ix,iy,sz,color) {
      setF(color||C.gold);
      var pts=[];
      for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5;var r=i%2===0?sz:sz*0.4;pts.push([ix+r*Math.cos(a),iy+r*Math.sin(a)]);}
      doc.moveTo(pts[0][0],pts[0][1]);
      for(var i=1;i<10;i++) doc.lineTo(pts[i][0],pts[i][1]);
      doc.close(); doc.fill();
    }

    // ── LAYOUT: KPI CARD ROW ──
    function kpiCardRow(cards) {
      var n=cards.length, cardW=(cw-(n-1)*gut)/n, cardH=20;
      checkSpace(cardH+4);
      cards.forEach(function(c,i) {
        var cx=m+i*(cardW+gut);
        card(cx,y,cardW,cardH,{fill:C.cardBg,stroke:C.gridLine,lw:0.15});
        setF(c.color||C.gold); doc.rect(cx+3,y+1.5,cardW-6,0.7,'F');
        if(c.icon) c.icon(cx+7,y+10,2.2,c.color||C.gold);
        doc.setFontSize(15); doc.setFont('helvetica','bold'); setC(C.white);
        var vx=c.icon?cx+14:cx+cardW/2, va=c.icon?'left':'center';
        doc.text(s(c.value),vx,y+11,{align:va});
        doc.setFontSize(6); doc.setFont('helvetica','normal'); setC(C.textMuted);
        doc.text(s(c.label),c.icon?vx:cx+cardW/2,y+16,{align:va});
      });
      y += cardH+4;
    }

    // ── TABLE ──
    function drawTable(headers,rows,colWidths,opts) {
      opts=opts||{}; var startX=opts.x||m, totalW=0;
      colWidths.forEach(function(w){totalW+=w;});
      checkSpace(9);
      setF(C.cardBgAlt); doc.roundedRect(startX,y-1,totalW,6.5,2,2,'F');
      doc.setFontSize(6.5); doc.setFont('helvetica','bold'); setC(C.gold);
      var tx=startX; headers.forEach(function(h,i){doc.text(s(h),tx+1.5,y+3);tx+=colWidths[i];});
      y+=7.5;
      rows.forEach(function(row,idx){
        checkSpace(6);
        if(idx%2===0){setF(C.cardBg);doc.rect(startX,y-1,totalW,5.5,'F');}
        doc.setFontSize(6.5); doc.setFont('helvetica','normal'); setC(C.textSecondary);
        tx=startX;
        row.forEach(function(v,i){doc.text(s(v).substring(0,Math.floor(colWidths[i]/1.6)),tx+1.5,y+3);tx+=colWidths[i];});
        y+=5.5;
      }); y+=2;
    }

    // ════════════════════════════════════════════
    // PAGE 1: PREMIUM COVER
    // ════════════════════════════════════════════
    darkPage();
    setF(C.gold); doc.rect(0,0,pw,2.5,'F');
    setF(C.cardBg); doc.rect(0,ph*0.68,pw,ph*0.32,'F');
    setF(C.gold); doc.rect(0,ph*0.68,pw,0.8,'F');
    // Decorative dots
    for(var dx=0;dx<5;dx++) for(var dy=0;dy<5;dy++){setF(C.goldDim);doc.circle(pw-m-8+dx*4.5,ph*0.72+dy*4.5,0.4,'F');}
    // Title
    setC(C.white); doc.setFontSize(36); doc.setFont('helvetica','bold'); doc.text('MARKETING',m+2,68);
    setC(C.gold); doc.setFontSize(28); doc.text('EFFECTIVENESS',m+2,82);
    setC(C.white); doc.setFontSize(28); doc.text('REPORT',m+2,95);
    setF(C.gold); doc.rect(m+2,102,50,0.8,'F');
    // Business info
    doc.setFontSize(17); doc.setFont('helvetica','normal'); setC(C.white);
    doc.text(s(data.business?.name||'Business Analysis'),m+2,118);
    doc.setFontSize(9.5); setC(C.textSecondary);
    doc.text(new Date().toLocaleDateString('en-AU',{year:'numeric',month:'long',day:'numeric'}),m+2,128);
    if(data.business?.industry) badge(s(data.business.industry).toUpperCase(),m+2,133,C.gold,C.pageBg);
    if(data.business?.url){doc.setFontSize(8.5);setC(C.link);doc.text(s(data.business.url),m+2,146);doc.link(m+2,143,doc.getTextWidth(s(data.business.url))+4,6,{url:s(data.business.url)});}
    if(data.business?.tagline){doc.setFontSize(8.5);doc.setFont('helvetica','italic');setC(C.textMuted);doc.text(s(data.business.tagline),m+2,155);}
    // Score gauge
    if(data.scorecard?.overall!=null){
      var gcx=pw-m-28,gcy=82;
      scoreGauge(gcx,gcy,22,data.scorecard.overall,100);
      doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.gold);
      doc.text('VIRALITY SCORE',gcx,gcy+28,{align:'center'});
    }
    // Footer
    doc.setFontSize(7.5);doc.setFont('helvetica','normal');setC(C.textMuted);
    doc.text('AI-Powered Marketing Intelligence Report',m+2,ph-16);
    doc.setFontSize(6.5);setC([70,70,75]);doc.text('CONFIDENTIAL',m+2,ph-11);

    // ════════════════════════════════════════════
    // PAGE 2: TOC (placeholder)
    // ════════════════════════════════════════════
    newPage();

    // ════════════════════════════════════════════
    // PAGE 3: EXECUTIVE SUMMARY
    // ════════════════════════════════════════════
    sectionStart('Executive Summary');
    var platCount=0;['tiktok','instagram','facebook','linkedin'].forEach(function(p){if(data.viralPosts&&data.viralPosts[p]&&data.viralPosts[p].length)platCount++;});
    var compCount=0;(data.competitors?.products||[]).forEach(function(p){compCount+=(p.competitors||[]).length;});
    kpiCardRow([
      {value:s(data.scorecard?.overall||'--'),label:'VIRALITY SCORE',icon:iconChart,color:C.gold},
      {value:String((data.trends||[]).length),label:'TRENDS TRACKED',icon:iconArrowUp,color:C.forest},
      {value:String(platCount),label:'PLATFORMS',icon:iconStar,color:C.instagram},
      {value:String(compCount),label:'COMPETITORS',icon:iconWarning,color:C.error}
    ]);
    // Assessment strip
    if(data.scorecard?.assessment){
      checkSpace(14);
      card(m,y,cw,12,{fill:C.cardBg,stroke:C.goldDim,lw:0.2});
      setF(C.gold);doc.rect(m+2,y+2.5,2,7,'F');
      doc.setFontSize(9.5);doc.setFont('helvetica','bold');setC(C.gold);
      doc.text(s(data.scorecard.assessment),m+8,y+5.5);
      doc.setFontSize(7);doc.setFont('helvetica','normal');setC(C.textSecondary);
      var aL=doc.splitTextToSize(s(data.scorecard.assessmentDetail||''),cw-14);
      aL.slice(0,2).forEach(function(l,i){doc.text(s(l),m+8,y+9+i*3);});
      y+=16;
    }
    // RADAR CHART — Hero
    var radarLabels=(data.scorecard?.categories||[]).map(function(c){return c.name;});
    var radarValues=(data.scorecard?.categories||[]).map(function(c){return c.score;});
    if(radarLabels.length>=3){
      checkSpace(86);
      card(m,y,cw,82,{fill:C.cardBg,r:4});
      doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
      doc.text('CATEGORY PERFORMANCE OVERVIEW',m+cw/2,y+5.5,{align:'center'});
      drawRadar(m+cw/2,y+44,32,radarLabels,radarValues,100,C.forest,C.gold);
      y+=86;
    }
    // 2-column: bars left, recommendations right
    checkSpace(48);
    var colStartY=y, leftX=m, rightX=m+col2+gut;
    doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
    doc.text('TOP CATEGORY SCORES',leftX+2,y); y+=5;
    var barItems=(data.scorecard?.categories||[]).slice(0,6).map(function(c){return{label:c.name,value:c.score,max:100};});
    drawHorizBars(barItems,leftX+2,y,col2-4,{barH:3.5,gap:6,labelW:36,scoreW:11});
    // Right: recommendations
    var ry=colStartY;
    doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
    doc.text('PRIORITY ACTIONS',rightX+2,ry); ry+=5;
    (data.roadmap?.recommendations||[]).slice(0,4).forEach(function(r,i){
      setF(C.gold);doc.circle(rightX+5,ry+1,2.2,'F');
      doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.pageBg);
      doc.text(String(i+1),rightX+5,ry+2,{align:'center'});
      doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.white);
      doc.text(s(r.title).substring(0,28),rightX+10,ry+2); ry+=3.5;
      doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textMuted);
      var rL=doc.splitTextToSize(s(r.description||''),col2-14);
      rL.slice(0,2).forEach(function(l){doc.text(s(l),rightX+10,ry);ry+=3;});
      ry+=2;
    });
    y=Math.max(y+barItems.length*6,ry)+4;

    // ════════════════════════════════════════════
    // VIRALITY SCORECARD
    // ════════════════════════════════════════════
    if(data.scorecard){
      sectionStart('Virality Scorecard');
      checkSpace(34);
      card(m,y,cw,30,{fill:C.cardBg,r:4});
      scoreGauge(m+25,y+15,11,data.scorecard.overall,100);
      doc.setFontSize(11);doc.setFont('helvetica','bold');setC(C.white);
      doc.text(s(data.scorecard.assessment||''),m+44,y+9);
      doc.setFontSize(7.5);doc.setFont('helvetica','normal');setC(C.textSecondary);
      var hL=doc.splitTextToSize(s(data.scorecard.assessmentDetail||''),cw-52);
      hL.slice(0,3).forEach(function(l,i){doc.text(s(l),m+44,y+14+i*3.2);});
      y+=34;
      // Horizontal bar chart for categories
      checkSpace(56);
      card(m,y,cw,52,{fill:C.cardBg,r:3});
      doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
      doc.text('CATEGORY BREAKDOWN',m+4,y+5);
      var catItems=(data.scorecard.categories||[]).map(function(c){return{label:c.name,value:c.score,max:100};});
      drawHorizBars(catItems,m+4,y+9,cw-8,{barH:4,gap:5.5,labelW:42,scoreW:12});
      y+=56;
      // Benchmarks
      if(data.scorecard.benchmarks?.length){
        y+=2; sub('Industry Benchmarks');
        drawTable(['Metric','You','Average','Top','Gap'],[].concat(data.scorecard.benchmarks.map(function(b){return[b.metric,b.business,b.average,b.topPerformer,b.gap];})),[38,26,28,44,30]);
      }
    }

    // ════════════════════════════════════════════
    // CURRENT TRENDS (2-column)
    // ════════════════════════════════════════════
    if(data.trends?.length){
      sectionStart('Current Industry Trends');
      var trends=data.trends||[];
      for(var ti=0;ti<trends.length;ti+=2){
        checkSpace(42);
        for(var col=0;col<2&&ti+col<trends.length;col++){
          var t=trends[ti+col], cx=m+col*(col2+gut), cardY=y;
          card(cx,cardY,col2,38,{fill:C.cardBg,stroke:C.gridLine,lw:0.15,r:3});
          var badgeBg=s(t.tier).toLowerCase()==='hot'?C.error:C.warning;
          badge(s(t.status||'TREND'),cx+3,cardY+2.5,badgeBg,C.white);
          badge(s(t.growth||''),cx+col2-22,cardY+2.5,C.forest,C.white);
          doc.setFontSize(8.5);doc.setFont('helvetica','bold');setC(C.white);
          var tL=doc.splitTextToSize(s(t.title),col2-8);
          tL.slice(0,2).forEach(function(l,li){doc.text(s(l),cx+3,cardY+12+li*3.5);});
          doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textMuted);
          doc.text('Relevance',cx+3,cardY+22);
          scoreBar(cx+20,cardY+20,col2-38,t.relevance||0,100,C.forest);
          doc.text(String(t.relevance||0)+'%',cx+col2-14,cardY+22);
          var px=cx+3;
          (t.platforms||[]).slice(0,3).forEach(function(p){px+=badge(s(p).toUpperCase(),px,cardY+26,platColor(p),C.white)+1.5;});
          doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textMuted);
          var dL=doc.splitTextToSize(s(t.description),col2-8);
          dL.slice(0,2).forEach(function(l,li){doc.text(s(l),cx+3,cardY+33+li*2.8);});
        }
        y+=42;
        // Search links for both trends in this row
        for(var col=0;col<2&&ti+col<trends.length;col++){
          var t=trends[ti+col];
          if(t.searchLinks?.length){
            t.searchLinks.forEach(function(link){checkSpace(4);addLink(s(link.label||link.platform||'Link'),s(link.url),m+col*(col2+gut)+3,y);y+=3.5;});
          }
        }
        y+=2;
      }
    }

    // ════════════════════════════════════════════
    // COMPETITOR ANALYSIS (butterfly bars)
    // ════════════════════════════════════════════
    if(data.competitors?.products?.length){
      sectionStart('Competitor Analysis');
      (data.competitors.products||[]).forEach(function(prod){
        checkSpace(12);
        doc.setFontSize(11);doc.setFont('helvetica','bold');setC(C.white);
        doc.text(s(prod.name),m,y);
        doc.setFontSize(8);setC(C.gold);doc.text(s(prod.price||''),m+doc.getTextWidth(s(prod.name))+4,y);
        y+=6;
        (prod.competitors||[]).forEach(function(comp){
          checkSpace(35);
          card(m,y,cw,6,{fill:C.cardBgAlt,r:2});
          doc.setFontSize(9);doc.setFont('helvetica','bold');setC(C.white);
          doc.text('vs '+s(comp.name),m+4,y+4.5);
          badge(s(comp.type||'').toUpperCase(),m+cw-28,y+1.5,C.gold,C.pageBg);
          y+=9;
          // Butterfly bars
          if(comp.metrics?.length){
            var centerX=m+cw/2;
            doc.setFontSize(6);doc.setFont('helvetica','bold');
            setC(C.forest);doc.text('YOU',centerX-18,y,{align:'right'});
            setC(C.error);doc.text('THEM',centerX+18,y);
            y+=3;
            comp.metrics.forEach(function(met){
              var lN=parseFloat(String(met.pe).replace(/[^0-9.]/g,''))||50;
              var rN=parseFloat(String(met.comp).replace(/[^0-9.]/g,''))||50;
              var mx=Math.max(lN,rN,1);
              doc.setFontSize(5.5);doc.setFont('helvetica','normal');setC(C.textMuted);
              doc.text(s(met.label).substring(0,14),centerX,y+2,{align:'center'});
              doc.setFontSize(5.5);setC(C.forest);doc.text(s(met.pe),centerX-32,y+2,{align:'right'});
              setC(C.error);doc.text(s(met.comp),centerX+32,y+2);
              butterflyBar(y,centerX,28,lN,rN,mx,C.forest,C.error);
              y+=5.5;
            });
          }
          // 2-col: strengths left, wins right
          var swy=y;
          if(comp.strengths?.length){
            doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.textMuted);doc.text('Their Strengths',m+2,y);y+=3;
            comp.strengths.slice(0,3).forEach(function(str){doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text('- '+s(str).substring(0,38),m+4,y);y+=3;});
          }
          var rwy=swy;
          if(comp.businessWins?.length){
            doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.success);doc.text('Your Wins',m+col2+gut+2,rwy);rwy+=3;
            comp.businessWins.slice(0,3).forEach(function(w){iconCheck(m+col2+gut+4,rwy-0.3,1,C.success);doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(w).substring(0,36),m+col2+gut+8,rwy);rwy+=3;});
          }
          y=Math.max(y,rwy)+2;
          if(comp.action){card(m+2,y,cw-4,6,{fill:C.cardBg,r:2});doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.gold);doc.text('ACTION:',m+5,y+4);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(comp.action).substring(0,78),m+20,y+4);y+=8;}
          y+=3;
        });
        sep();
      });
    }

    // ════════════════════════════════════════════
    // CONTENT ARCHETYPES (radar + bars)
    // ════════════════════════════════════════════
    if(data.archetypes?.length){
      sectionStart('Content Archetypes & Gap Analysis');
      var archLabels=(data.archetypes||[]).map(function(a){return a.title;});
      var archValues=(data.archetypes||[]).map(function(a){return a.usage;});
      if(archLabels.length>=3){
        checkSpace(74);
        card(m,y,cw,70,{fill:C.cardBg,r:4});
        doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
        doc.text('CONTENT STRATEGY SHAPE',m+cw/2,y+5,{align:'center'});
        drawRadar(m+cw/2,y+38,26,archLabels,archValues,100,C.forest,C.gold);
        y+=74;
      }
      checkSpace(52);sub('Archetype Usage Levels');
      var archItems=(data.archetypes||[]).map(function(a){
        var c=a.statusType==='critical'||a.statusType==='underused'?C.error:a.statusType==='moderate'?C.warning:C.success;
        return{label:a.title,value:a.usage,max:100,color:c};
      });
      drawHorizBars(archItems,m+2,y,cw-4,{barH:4,gap:6.5,labelW:48,scoreW:12});
      y+=archItems.length*6.5+4;
      // Gap analysis
      if(data.gapAnalysis){
        sub('Gap Analysis');
        if(data.gapAnalysis.missingTriggers?.length){doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.error);doc.text('Missing Triggers:',m+2,y);y+=3.5;data.gapAnalysis.missingTriggers.forEach(function(t){checkSpace(3.5);doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text('- '+s(t.name)+': '+s(t.detail||''),m+6,y);y+=3.2;});y+=2;}
        if(data.gapAnalysis.underusedArchetypes?.length){doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.warning);doc.text('Underused:',m+2,y);y+=3.5;data.gapAnalysis.underusedArchetypes.forEach(function(a){checkSpace(3.5);doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text('- '+s(a.name)+': '+s(a.detail||''),m+6,y);y+=3.2;});y+=2;}
        if(data.gapAnalysis.platformReach?.length){doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.white);doc.text('Platform Reach:',m+2,y);y+=3.5;data.gapAnalysis.platformReach.forEach(function(p){var lc=p.level==='LOW'||p.level==='ABSENT'?C.error:p.level==='MODERATE'?C.warning:C.success;badge(s(p.level),m+6,y-1,lc,C.white);doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(p.platform)+' - '+s(p.detail||''),m+28,y+1.5);y+=5;});}
      }
    }

    // ════════════════════════════════════════════
    // VIRAL POSTS (condensed)
    // ════════════════════════════════════════════
    if(data.viralPosts){
      sectionStart('Viral Post Database');
      ['tiktok','instagram','facebook','linkedin'].forEach(function(platform){
        var posts=data.viralPosts[platform]; if(!posts?.length) return;
        checkSpace(8);
        setF(platColor(platform));doc.rect(m,y,3,5,'F');
        doc.setFontSize(9.5);doc.setFont('helvetica','bold');setC(C.white);
        doc.text(capitalize(platform),m+6,y+3.5);
        doc.setFontSize(6.5);setC(C.textMuted);doc.text('('+posts.length+' posts)',m+6+doc.getTextWidth(capitalize(platform))+3,y+3.5);
        y+=8;
        posts.forEach(function(p){
          checkSpace(20);
          card(m,y,cw,17,{fill:C.cardBg,r:2});
          setF(platColor(platform));doc.rect(m,y+1,2,15,'F');
          doc.setFontSize(11);doc.setFont('helvetica','bold');setC(C.textMuted);
          doc.text('#'+s(p.rank),m+5,y+6);
          doc.setFontSize(8);doc.setFont('helvetica','bold');setC(C.white);
          doc.text(s(p.title||'').substring(0,48),m+15,y+4.5);
          doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textMuted);
          doc.text(s(p.creator||''),m+15,y+8);
          // Score pill
          if(p.viralityScore){var sc=Number(p.viralityScore)||0;setF(ragColor(sc/100));doc.roundedRect(m+cw-20,y+2,16,5,2.5,2.5,'F');doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.white);doc.text(String(sc),m+cw-12,y+5.5,{align:'center'});}
          // Triple score bars
          if(p.scores){
            var bStartX=m+15,bY=y+11;
            [{l:'Share',v:p.scores.shareability||0},{l:'Save',v:p.scores.saveability||0},{l:'Cmnt',v:p.scores.commentDriver||0}].forEach(function(bar,bi){
              var bx=bStartX+bi*38;
              doc.setFontSize(5);doc.setFont('helvetica','normal');setC(C.textMuted);doc.text(bar.l,bx,bY+1.5);
              scoreBar(bx+11,bY,18,bar.v,10,C.gold);
              doc.setFontSize(5);setC(C.textSecondary);doc.text(String(bar.v),bx+31,bY+1.5);
            });
          }
          if(p.coreLearning){doc.setFontSize(5.5);doc.setFont('helvetica','italic');setC(C.textMuted);doc.text(s(p.coreLearning).substring(0,72),m+15,y+15.5);}
          y+=19;
        });
        y+=3;
      });
    }

    // ════════════════════════════════════════════
    // IMPROVED POSTS (condensed)
    // ════════════════════════════════════════════
    if(data.improvedPosts){
      sectionStart('Improved Post Scripts');
      ['tiktok','instagram','facebook','linkedin'].forEach(function(platform){
        var posts=data.improvedPosts[platform]; if(!posts?.length) return;
        setF(platColor(platform));doc.rect(m,y,3,4.5,'F');
        doc.setFontSize(9);doc.setFont('helvetica','bold');setC(C.white);doc.text(capitalize(platform),m+6,y+3.2);y+=7;
        posts.forEach(function(p){
          checkSpace(24);card(m,y,cw,20,{fill:C.cardBg,r:2});
          setF(platColor(platform));doc.rect(m,y+1,2,18,'F');
          doc.setFontSize(8);doc.setFont('helvetica','bold');setC(C.white);
          doc.text('#'+s(p.number)+': '+s(p.title||''),m+5,y+4);
          badge(s(p.archetype||''),m+5,y+5.5,C.forest,C.white);
          if(p.script){
            var sY=y+11;
            var secs={hook:C.error,body:C.textMuted,reveal:C.gold,cta:C.success};
            ['hook','body','reveal','cta'].forEach(function(sec){
              if(!p.script[sec]) return;
              doc.setFontSize(5);doc.setFont('helvetica','bold');setC(secs[sec]);doc.text(sec.toUpperCase(),m+5,sY);
              doc.setFontSize(5.5);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(p.script[sec]).substring(0,62),m+16,sY);sY+=2.8;
            });
          }
          y+=22;
        });y+=3;
      });
    }

    // ════════════════════════════════════════════
    // KPI DASHBOARD (sparkline)
    // ════════════════════════════════════════════
    if(data.kpi){
      sectionStart('KPI Tracking Dashboard');
      var perfData=data.kpi.recentPerformance||[];
      var engRates=perfData.map(function(r){return parseFloat(String(r.engRate).replace('%',''))||0;});
      var lastEng=engRates.length?engRates[engRates.length-1]:0;
      var prevEng=engRates.length>1?engRates[engRates.length-2]:lastEng;
      var isUp=lastEng>=prevEng;
      kpiCardRow([
        {value:String(perfData.length),label:'WEEKS TRACKED',color:C.forest},
        {value:s(perfData.length?perfData[perfData.length-1].engRate:'--'),label:'LATEST ENG RATE',color:C.gold},
        {value:isUp?'UP':'DOWN',label:'TREND',icon:isUp?iconArrowUp:iconArrowDown,color:isUp?C.success:C.error}
      ]);
      // Sparkline
      if(engRates.length>=2){
        checkSpace(28);card(m,y,cw,24,{fill:C.cardBg,r:3});
        doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.gold);
        doc.text('ENGAGEMENT RATE TREND',m+4,y+4.5);
        drawSparkline(engRates,m+6,y+7,cw-12,12,C.gold);
        doc.setFontSize(4.5);setC(C.textMuted);
        perfData.forEach(function(r,i){var lx=m+6+i*((cw-12)/Math.max(perfData.length-1,1));doc.text(s(r.date||'W'+r.week),lx,y+22,{align:'center'});});
        y+=28;
      }
      // Table
      if(perfData.length){
        sub('Performance Detail');
        drawTable(['Wk','Date','Post','Plat','Reach','Likes','Eng%','Trend'],perfData.map(function(r){return[r.week,r.date,s(r.description||'').substring(0,18),r.platform,r.reach,r.likes,r.engRate,r.trend];}),[9,14,34,14,18,15,14,50]);
      }
      // Targets
      if(data.kpi.targets){
        sub('90-Day Platform Targets');
        ['tiktok','instagram','facebook','linkedin'].forEach(function(platform){
          var targets=data.kpi.targets[platform]; if(!targets?.length) return;
          checkSpace(12);badge(capitalize(platform).toUpperCase(),m+2,y,platColor(platform),C.white);y+=6;
          targets.forEach(function(t){label('  Month '+s(t.month)+': ',s(t.target),3);});y+=2;
        });
      }
      if(data.kpi.formulas?.length){
        sub('Key Formulas');
        data.kpi.formulas.forEach(function(f){checkSpace(7);card(m,y,cw,6.5,{fill:C.cardBg,r:2});doc.setFontSize(7);doc.setFont('helvetica','bold');setC(C.white);doc.text(s(f.name)+':',m+4,y+4);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(f.formula)+' ('+s(f.target)+')',m+4+doc.getTextWidth(s(f.name)+': ')+1,y+4);y+=8;});
      }
    }

    // ════════════════════════════════════════════
    // 90-DAY ROADMAP (timeline)
    // ════════════════════════════════════════════
    if(data.roadmap){
      sectionStart('90-Day Marketing Roadmap');
      if(data.roadmap.phases?.length){
        checkSpace(18);drawTimeline(data.roadmap.phases,m,y,cw);y+=18;
        (data.roadmap.phases||[]).forEach(function(phase,pi){
          checkSpace(25);
          var phCol=[C.forest,C.gold,C.instagram][pi%3];
          card(m,y,cw,5.5,{fill:phCol,r:2});
          doc.setFontSize(8.5);doc.setFont('helvetica','bold');setC(C.white);
          doc.text(s(phase.title)+' - '+s(phase.subtitle||''),m+4,y+4);y+=8;
          (phase.weeks||[]).forEach(function(w){
            checkSpace(10);doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);doc.text(s(w.label),m+3,y);y+=3;
            (w.items||[]).forEach(function(item){checkSpace(3.5);iconCheck(m+5,y-0.3,1,C.success);doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(item).substring(0,72),m+9,y);y+=3.2;});y+=1;
          });
          if(phase.successMetrics?.length){
            doc.setFontSize(6.5);doc.setFont('helvetica','bold');setC(C.gold);doc.text('Targets:',m+3,y);y+=3;
            phase.successMetrics.forEach(function(met){iconStar(m+5,y-0.3,1.3,C.gold);doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(met),m+9,y);y+=3;});
          }
          y+=4;
        });
      }
      if(data.roadmap.recommendations?.length){
        sub('Priority Recommendations');
        data.roadmap.recommendations.forEach(function(r){
          checkSpace(12);
          var impCol=String(r.impact||'').indexOf('HIGHEST')>=0?C.error:String(r.impact||'').indexOf('HIGH')>=0?C.warning:C.success;
          card(m,y,cw,9,{fill:C.cardBg,r:2});
          setF(impCol);doc.rect(m,y+1,2.5,7,'F');
          doc.setFontSize(9);doc.setFont('helvetica','bold');setC(C.textMuted);doc.text(String(r.rank),m+6,y+5.5);
          doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.white);doc.text(s(r.title),m+12,y+4);
          badge(s(r.impact),m+cw-26,y+2,impCol,C.white);
          doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textSecondary);doc.text(s(r.description||'').substring(0,88),m+12,y+8);
          y+=11;
        });
      }
    }

    // ════════════════════════════════════════════
    // SEO OPPORTUNITIES (bar chart)
    // ════════════════════════════════════════════
    if(data.seo?.length){
      sectionStart('Google Search Opportunities');
      checkSpace(44);card(m,y,cw,40,{fill:C.cardBg,r:3});
      doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.gold);
      doc.text('KEYWORD OPPORTUNITY MAP',m+4,y+5);
      var seoItems=(data.seo||[]).map(function(item){
        var vol=parseFloat(String(item.volume).replace(/[^0-9]/g,''))||0;
        var diffCol=String(item.difficulty).toLowerCase().indexOf('hard')>=0?C.error:String(item.difficulty).toLowerCase().indexOf('med')>=0?C.warning:C.success;
        return{label:item.term,value:vol,max:10000,color:diffCol};
      });
      drawHorizBars(seoItems,m+4,y+9,cw-8,{barH:4,gap:5,labelW:50,scoreW:16});
      y+=44;
      // Detail cards
      (data.seo||[]).forEach(function(seoItem){
        checkSpace(22);card(m,y,cw,18,{fill:C.cardBg,r:2});
        doc.setFontSize(9);doc.setFont('helvetica','bold');setC(C.white);
        doc.text('"'+s(seoItem.term)+'"',m+4,y+4.5);
        var diffCol=String(seoItem.difficulty).toLowerCase().indexOf('hard')>=0?C.error:String(seoItem.difficulty).toLowerCase().indexOf('med')>=0?C.warning:C.success;
        badge(s(seoItem.difficulty),m+cw-22,y+2,diffCol,C.white);
        doc.setFontSize(6.5);doc.setFont('helvetica','normal');setC(C.textSecondary);
        doc.text(s(seoItem.volume)+' | Rank: '+s(seoItem.currentRank),m+4,y+9);
        (seoItem.strategy||[]).slice(0,2).forEach(function(step,i){doc.setFontSize(6);setC(C.textMuted);doc.text((i+1)+'. '+s(step).substring(0,68),m+4,y+13+i*2.8);});
        y+=21;
      });
    }

    // ════════════════════════════════════════════
    // LLM OPPORTUNITIES (2-column icons)
    // ════════════════════════════════════════════
    if(data.llmOpportunities?.length){
      sectionStart('AI & LLM Marketing Opportunities');
      var llm=data.llmOpportunities||[];
      for(var li=0;li<llm.length;li+=2){
        checkSpace(32);
        for(var col=0;col<2&&li+col<llm.length;col++){
          var o=llm[li+col], cx=m+col*(col2+gut);
          card(cx,y,col2,28,{fill:C.cardBg,r:3});
          var iconFn=o.badgeType==='critical'?iconWarning:o.badgeType==='new'?iconStar:iconChart;
          var iconCol=o.badgeType==='critical'?C.error:o.badgeType==='new'?[100,160,230]:C.success;
          iconFn(cx+8,y+7,2.5,iconCol);
          var bCol=o.badgeType==='critical'?C.error:o.badgeType==='new'?[40,120,180]:C.success;
          badge(s(o.badge||'OPPORTUNITY'),cx+14,y+3,bCol,C.white);
          doc.setFontSize(7.5);doc.setFont('helvetica','bold');setC(C.white);
          doc.text(s(o.title).substring(0,28),cx+4,y+14);
          doc.setFontSize(6);doc.setFont('helvetica','normal');setC(C.textSecondary);
          var dL=doc.splitTextToSize(s(o.description||''),col2-10);
          dL.slice(0,3).forEach(function(l,i){doc.text(s(l),cx+4,y+18+i*2.6);});
          if(o.cost){doc.setFontSize(5.5);doc.setFont('helvetica','bold');setC(C.gold);doc.text('Cost: '+s(o.cost),cx+4,y+26);}
        }
        y+=32;
      }
    }

    // ════════════════════════════════════════════
    // SECOND PASS: TABLE OF CONTENTS
    // ════════════════════════════════════════════
    doc.setPage(tocPageNum);
    var tocY=18;
    setF(C.cardBgAlt);doc.rect(0,0,pw,5,'F');
    accentBar(0,5,pw,C.gold);tocY=22;
    doc.setFontSize(20);doc.setFont('helvetica','bold');setC(C.white);
    doc.text('Table of Contents',m,tocY);tocY+=4;
    accentBar(m,tocY,40,C.gold);tocY+=10;
    tocEntries.forEach(function(entry,idx){
      card(m,tocY-3,cw,8,{fill:C.cardBg,r:2});
      doc.setFontSize(10);doc.setFont('helvetica','normal');setC(C.white);
      doc.text((idx+1)+'.  '+entry.title,m+4,tocY+1);
      doc.setFont('helvetica','bold');setC(C.gold);
      doc.text(String(entry.page),pw-m-4,tocY+1,{align:'right'});
      doc.setFontSize(7);setC(C.gridLine);
      var te=m+8+doc.getTextWidth((idx+1)+'.  '+entry.title);
      for(var dx=te;dx<pw-m-14;dx+=2.2) doc.text('.',dx,tocY+1);
      doc.link(m,tocY-3,cw,8,{pageNumber:entry.page});
      tocY+=10;
    });

    // ════════════════════════════════════════════
    // THIRD PASS: FOOTERS
    // ════════════════════════════════════════════
    var totalPages=doc.internal.getNumberOfPages();
    for(var i=2;i<=totalPages;i++){
      doc.setPage(i);
      setD(C.gold);doc.setLineWidth(0.3);doc.line(m,286,pw-m,286);
      doc.setFontSize(6.5);doc.setFont('helvetica','normal');
      doc.setTextColor(C.textMuted[0],C.textMuted[1],C.textMuted[2]);
      doc.text(s(data.business?.name||''),m,290);
      doc.text('Page '+(i-1)+' of '+(totalPages-1),pw/2,290,{align:'center'});
      doc.text('Marketing Intelligence Report',pw-m,290,{align:'right'});
    }

    // ════════════════════════════════════════════
    // DOWNLOAD
    // ════════════════════════════════════════════
    var filename=(s(data.business?.name)||'analysis').replace(/[^a-zA-Z0-9]/g,'-')+'-marketing-report.pdf';
    doc.save(filename);
    return filename;

  } catch(err) {
    console.error('PDF Export Error:',err);
    alert('PDF export failed: '+err.message+'\n\nCheck console for details.');
  }
}

// ===== UTIL =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

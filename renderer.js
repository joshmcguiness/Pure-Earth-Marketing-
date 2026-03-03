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

  // Build filter buttons
  filterBar.innerHTML = `<button class="product-btn active" data-product="all">All Products</button>` +
    competitors.products.map(p =>
      `<button class="product-btn" data-product="${esc(p.id)}">${esc(p.name)}</button>`
    ).join('');

  // Build competitor cards
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

  // Store competitor data globally for dropdown switching
  window._competitorData = {};
  competitors.products.forEach(p => {
    window._competitorData[p.id] = p.competitors;
  });

  // Render initial cards
  competitors.products.forEach(p => renderCompetitorBody(p.id));

  // Bind filter buttons
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

  // Bind dropdowns
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
  if (!posts) return;
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
  if (!kpi) return;
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
  if (!roadmap) return;
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
      const impactClass = r.impact.includes('HIGHEST') ? 'highest' : r.impact.includes('HIGH') ? 'high' : 'medium';
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

  // Update header with business info
  const bizName = document.getElementById('biz-name');
  const bizDesc = document.getElementById('biz-desc');
  if (bizName) bizName.textContent = data.business?.name || 'Business Analysis';
  if (bizDesc) bizDesc.textContent = data.business?.description || '';

  // Update section headers to use business name instead of "Pure Earth"
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
// PDF EXPORT — Premium Agency-Quality Report
// ===================================================================
function exportToPDF(data) {
  try {
    var jsPDFLib = window.jspdf;
    if (!jsPDFLib || !jsPDFLib.jsPDF) {
      alert('PDF library not loaded. Please try again.');
      return;
    }
    var jsPDF = jsPDFLib.jsPDF;
    var doc = new jsPDF('p', 'mm', 'a4');
    var pw = 210, ph = 297, m = 15, cw = pw - m * 2;
    var y = 20;

    // Safe string — strips non-ASCII for Helvetica compatibility
    function s(val) {
      if (val == null) return '';
      return String(val).replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }

    // === COLOR PALETTE ===
    var C = {
      charcoal: [18, 18, 18],
      charcoalLight: [38, 38, 42],
      forest: [89, 102, 85],
      forestDark: [55, 65, 52],
      gold: [184, 151, 106],
      goldLight: [210, 185, 145],
      sand: [232, 226, 216],
      cream: [246, 244, 240],
      white: [255, 255, 255],
      black: [30, 30, 30],
      grey: [120, 120, 120],
      greyLight: [195, 195, 195],
      success: [75, 140, 94],
      warning: [196, 150, 75],
      error: [180, 60, 50],
      link: [30, 90, 160],
      tiktok: [0, 0, 0],
      instagram: [193, 53, 132],
      facebook: [24, 119, 242],
      linkedin: [10, 102, 194]
    };

    var tocEntries = [];
    var tocPageNum = 2;

    // === HELPER FUNCTIONS ===
    function newPage() { doc.addPage(); y = 22; }
    function checkSpace(needed) { if (y + needed > 275) newPage(); }
    function setC(c) { doc.setTextColor(c[0], c[1], c[2]); }
    function setF(c) { doc.setFillColor(c[0], c[1], c[2]); }
    function setD(c) { doc.setDrawColor(c[0], c[1], c[2]); }

    // Rounded card
    function card(x, yy, w, h, opts) {
      opts = opts || {};
      var r = opts.r || 3;
      if (opts.fill && opts.stroke) {
        setF(opts.fill); setD(opts.stroke);
        doc.setLineWidth(opts.lw || 0.3);
        doc.roundedRect(x, yy, w, h, r, r, 'FD');
      } else if (opts.fill) {
        setF(opts.fill);
        doc.roundedRect(x, yy, w, h, r, r, 'F');
      } else if (opts.stroke) {
        setD(opts.stroke);
        doc.setLineWidth(opts.lw || 0.3);
        doc.roundedRect(x, yy, w, h, r, r, 'S');
      }
    }

    // Pill badge — returns width
    function badge(text, x, yy, bg, fg) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      var tw = doc.getTextWidth(s(text)) + 6;
      setF(bg || C.forest);
      doc.roundedRect(x, yy, tw, 5, 2.5, 2.5, 'F');
      setC(fg || C.white);
      doc.text(s(text), x + 3, yy + 3.5);
      return tw;
    }

    // Score gauge (ring)
    function scoreGauge(cx, cy, radius, score, max, lbl) {
      var sc = Number(score) || 0;
      var mx = Number(max) || 100;
      var pct = Math.min(sc / mx, 1);
      var ringCol = pct >= 0.7 ? C.success : pct >= 0.4 ? C.warning : C.error;
      setF(ringCol);
      doc.circle(cx, cy, radius, 'F');
      setF(C.charcoal);
      doc.circle(cx, cy, radius * 0.7, 'F');
      doc.setFontSize(radius > 15 ? 20 : 13);
      doc.setFont('helvetica', 'bold');
      setC(C.white);
      doc.text(String(sc), cx, cy + (radius > 15 ? 2 : 1), { align: 'center' });
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      setC(C.greyLight);
      doc.text('/' + mx, cx, cy + (radius > 15 ? 7 : 4.5), { align: 'center' });
      if (lbl) {
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        setC(C.gold);
        doc.text(s(lbl), cx, cy + radius + 5, { align: 'center' });
      }
    }

    // Rounded progress bar
    function scoreBarRounded(x, yy, w, score, max, color) {
      var sc = Number(score) || 0;
      var mx = Number(max) || 100;
      var fillW = Math.max(2, Math.min((sc / mx) * w, w));
      if (!isFinite(fillW)) fillW = 2;
      setF(C.sand);
      doc.roundedRect(x, yy, w, 3.5, 1.8, 1.8, 'F');
      setF(color || C.forest);
      doc.roundedRect(x, yy, fillW, 3.5, 1.8, 1.8, 'F');
    }

    // Gold accent bar
    function accentBar(x, yy, w, color) {
      setF(color || C.gold);
      doc.rect(x, yy, w, 1.2, 'F');
    }

    // Section heading with gold accent
    function heading(text) {
      checkSpace(16);
      accentBar(m, y, 40, C.gold);
      y += 5;
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text(s(text), m, y);
      y += 3;
      setD(C.sand);
      doc.setLineWidth(0.3);
      doc.line(m, y, pw - m, y);
      y += 6;
    }

    function sectionStart(title) {
      newPage();
      tocEntries.push({ title: s(title), page: doc.internal.getNumberOfPages() });
      heading(title);
    }

    function sub(text) {
      checkSpace(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setC(C.forest);
      doc.text(s(text), m, y);
      y += 6;
    }

    function txt(text, indent) {
      if (!text) return;
      checkSpace(6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      var lines = doc.splitTextToSize(s(text), cw - (indent || 0));
      lines.forEach(function(line) {
        checkSpace(4.5);
        doc.text(s(line), m + (indent || 0), y);
        y += 4.2;
      });
      y += 1.5;
    }

    function label(lbl, val, indent) {
      checkSpace(6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text(s(lbl), m + (indent || 0), y);
      var lblW = doc.getTextWidth(s(lbl));
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      doc.text(s(val || 'N/A'), m + (indent || 0) + lblW + 2, y);
      y += 5;
    }

    // Clickable hyperlink (blue, underlined)
    function addLink(text, url, x, yy) {
      if (!url) return 0;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      setC(C.link);
      var lt = s(text || url);
      doc.text(lt, x, yy);
      var tw = doc.getTextWidth(lt);
      doc.setLineWidth(0.15);
      setD(C.link);
      doc.line(x, yy + 0.5, x + tw, yy + 0.5);
      doc.link(x, yy - 3, tw + 2, 5, { url: s(url) });
      setC(C.black);
      return tw;
    }

    // Professional table
    function drawTable(headers, rows, colWidths, opts) {
      opts = opts || {};
      var startX = opts.x || m;
      var totalW = 0;
      colWidths.forEach(function(w) { totalW += w; });
      checkSpace(10);
      setF(opts.headerBg || C.charcoal);
      doc.roundedRect(startX, y - 1, totalW, 7, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setC(opts.headerFg || C.white);
      var tx = startX;
      headers.forEach(function(h, i) {
        doc.text(s(h), tx + 2, y + 3.5);
        tx += colWidths[i];
      });
      y += 8;
      rows.forEach(function(row, idx) {
        checkSpace(7);
        if (idx % 2 === 0) {
          setF(C.cream);
          doc.rect(startX, y - 1, totalW, 6.5, 'F');
        }
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setC(C.black);
        tx = startX;
        row.forEach(function(v, i) {
          var maxChars = Math.floor(colWidths[i] / 1.8);
          doc.text(s(v).substring(0, maxChars), tx + 2, y + 3.5);
          tx += colWidths[i];
        });
        y += 6.5;
      });
      y += 3;
    }

    // Platform color lookup
    function platColor(name) {
      var n = (name || '').toLowerCase();
      if (n.indexOf('tiktok') >= 0) return C.tiktok;
      if (n.indexOf('instagram') >= 0) return C.instagram;
      if (n.indexOf('facebook') >= 0) return C.facebook;
      if (n.indexOf('linkedin') >= 0) return C.linkedin;
      return C.forest;
    }

    function sep() {
      y += 2;
      setD(C.sand);
      doc.setLineWidth(0.3);
      doc.line(m, y, pw - m, y);
      y += 4;
    }

    // ============================================================
    // PAGE 1: PREMIUM COVER
    // ============================================================
    setF(C.charcoal);
    doc.rect(0, 0, pw, ph, 'F');

    // Gold accent bar at very top
    setF(C.gold);
    doc.rect(0, 0, pw, 3, 'F');

    // Forest overlay on lower third
    setF(C.forestDark);
    doc.rect(0, ph * 0.64, pw, ph * 0.36, 'F');
    setF(C.gold);
    doc.rect(0, ph * 0.64 - 0.8, pw, 1.2, 'F');

    // Title block
    setC(C.white);
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    doc.text('MARKETING', m + 2, 72);
    setC(C.gold);
    doc.setFontSize(30);
    doc.text('EFFECTIVENESS', m + 2, 88);
    setC(C.white);
    doc.setFontSize(30);
    doc.text('REPORT', m + 2, 103);

    // Gold rule
    setF(C.gold);
    doc.rect(m + 2, 111, 55, 1, 'F');

    // Business name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    setC(C.white);
    doc.text(s(data.business?.name || 'Business Analysis'), m + 2, 126);

    // Date
    doc.setFontSize(10);
    setC(C.greyLight);
    var dateStr = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, m + 2, 136);

    // Industry badge
    if (data.business?.industry) {
      badge(s(data.business.industry).toUpperCase(), m + 2, 141, C.gold, C.charcoal);
    }

    // Clickable URL
    if (data.business?.url) {
      doc.setFontSize(9);
      setC([180, 200, 220]);
      doc.text(s(data.business.url), m + 2, 155);
      doc.link(m + 2, 152, doc.getTextWidth(s(data.business.url)) + 4, 6, { url: s(data.business.url) });
    }

    // Tagline
    if (data.business?.tagline) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      setC(C.greyLight);
      doc.text(s(data.business.tagline), m + 2, 165);
    }

    // Score gauge on right
    if (data.scorecard?.overall != null) {
      var cvScore = Number(data.scorecard.overall) || 0;
      var cvPct = cvScore / 100;
      var cvRingCol = cvPct >= 0.7 ? C.success : cvPct >= 0.4 ? C.warning : C.error;
      var gcx = pw - m - 28, gcy = 90;
      setF(cvRingCol);
      doc.circle(gcx, gcy, 24, 'F');
      setF(C.charcoal);
      doc.circle(gcx, gcy, 17, 'F');
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      setC(C.white);
      doc.text(String(cvScore), gcx, gcy + 3, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setC(C.greyLight);
      doc.text('/100', gcx, gcy + 9, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setC(C.gold);
      doc.text('VIRALITY SCORE', gcx, gcy + 30, { align: 'center' });
    }

    // Cover footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setC([140, 155, 140]);
    doc.text('AI-Powered Marketing Intelligence Report', m + 2, ph - 18);
    doc.setFontSize(7);
    setC([100, 115, 100]);
    doc.text('CONFIDENTIAL', m + 2, ph - 12);

    // ============================================================
    // PAGE 2: TABLE OF CONTENTS (placeholder — filled second pass)
    // ============================================================
    newPage();

    // ============================================================
    // PAGE 3: EXECUTIVE SUMMARY (NEW)
    // ============================================================
    sectionStart('Executive Summary');

    // Count metrics
    var platCount = 0;
    ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(function(p) {
      if (data.viralPosts && data.viralPosts[p] && data.viralPosts[p].length) platCount++;
    });
    var compCount = 0;
    (data.competitors?.products || []).forEach(function(p) {
      compCount += (p.competitors || []).length;
    });

    // 4 metric cards
    var metricData = [
      { val: s(data.scorecard?.overall || '--'), lbl: 'Overall Score', color: C.forest },
      { val: String((data.trends || []).length), lbl: 'Trends Tracked', color: C.gold },
      { val: String(platCount), lbl: 'Platforms', color: C.instagram },
      { val: String(compCount), lbl: 'Competitors', color: C.error }
    ];
    var cardW = (cw - 12) / 4;
    metricData.forEach(function(met, i) {
      var cx = m + i * (cardW + 4);
      card(cx, y, cardW, 22, { fill: C.cream, stroke: C.sand });
      setF(met.color);
      doc.roundedRect(cx, y, cardW, 3, 3, 3, 'F');
      setF(C.cream);
      doc.rect(cx + 0.5, y + 2, cardW - 1, 2, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text(s(met.val), cx + cardW / 2, y + 13, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      doc.text(s(met.lbl), cx + cardW / 2, y + 19, { align: 'center' });
    });
    y += 28;

    // Assessment card
    if (data.scorecard?.assessment) {
      checkSpace(26);
      card(m, y, cw, 22, { fill: C.sand, r: 3 });
      setF(C.gold);
      doc.rect(m, y + 2, 2.5, 18, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text('Assessment: ' + s(data.scorecard.assessment), m + 8, y + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      var aLines = doc.splitTextToSize(s(data.scorecard.assessmentDetail || ''), cw - 14);
      aLines.slice(0, 3).forEach(function(l, i) {
        doc.text(s(l), m + 8, y + 14 + i * 3.8);
      });
      y += 28;
    }

    // 2-column: categories left, recommendations right
    checkSpace(55);
    var colHalf = (cw - 8) / 2;
    var leftX = m, rightX = m + colHalf + 8;
    var colStartY = y;

    // Left: category scores
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setC(C.forest);
    doc.text('TOP CATEGORY SCORES', leftX, y);
    y += 6;
    var cats = (data.scorecard?.categories || []).slice(0, 5);
    cats.forEach(function(c) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setC(C.charcoal);
      doc.text(s(c.name), leftX + 2, y);
      doc.text(s(c.score) + '/100', leftX + colHalf - 18, y);
      y += 2;
      scoreBarRounded(leftX + 2, y, colHalf - 24, c.score, 100, C.forest);
      y += 7;
    });

    // Right: recommendations
    var ry = colStartY;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setC(C.gold);
    doc.text('PRIORITY RECOMMENDATIONS', rightX, ry);
    ry += 6;
    var recs = (data.roadmap?.recommendations || []).slice(0, 4);
    recs.forEach(function(r, i) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text(s((i + 1) + '. ' + (r.title || '')), rightX + 2, ry);
      ry += 3.5;
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      var rLines = doc.splitTextToSize(s(r.description || ''), colHalf - 6);
      rLines.slice(0, 2).forEach(function(l) {
        doc.text(s(l), rightX + 4, ry);
        ry += 3.5;
      });
      ry += 3;
    });
    y = Math.max(y, ry) + 5;

    // Business description
    if (data.business?.description) {
      checkSpace(15);
      sub('About the Business');
      txt(data.business.description, 2);
    }
    if (data.business?.url) {
      addLink(data.business.url, data.business.url, m + 2, y);
      y += 6;
    }

    // ============================================================
    // VIRALITY SCORECARD
    // ============================================================
    if (data.scorecard) {
      sectionStart('Virality Scorecard');

      // Hero block
      checkSpace(38);
      card(m, y, cw, 34, { fill: C.cream, stroke: C.sand });
      scoreGauge(m + 28, y + 17, 14, data.scorecard.overall, 100, null);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      setC(C.charcoal);
      doc.text(s(data.scorecard.assessment || ''), m + 52, y + 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setC(C.grey);
      var heroLines = doc.splitTextToSize(s(data.scorecard.assessmentDetail || ''), cw - 60);
      heroLines.slice(0, 4).forEach(function(l, i) {
        doc.text(s(l), m + 52, y + 16 + i * 3.8);
      });
      y += 40;

      // Category cards
      (data.scorecard.categories || []).forEach(function(c) {
        checkSpace(18);
        card(m, y, cw, 14, { fill: C.cream, r: 2 });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text(s(c.name), m + 4, y + 5);
        doc.text(s(c.score) + '/100', m + cw - 22, y + 5);
        scoreBarRounded(m + 4, y + 8, cw - 30, c.score, 100, C.forest);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setC(C.grey);
        doc.text(s(c.description || '').substring(0, 95), m + 4, y + 13);
        y += 16;
      });

      // Benchmarks
      if (data.scorecard.benchmarks?.length) {
        y += 4;
        sub('Industry Benchmarks');
        var bmH = ['Metric', 'You', 'Average', 'Top Performer', 'Gap'];
        var bmW = [40, 28, 30, 45, 30];
        var bmRows = data.scorecard.benchmarks.map(function(b) {
          return [b.metric, b.business, b.average, b.topPerformer, b.gap];
        });
        drawTable(bmH, bmRows, bmW, { headerBg: C.forest });
      }
    }

    // ============================================================
    // CURRENT INDUSTRY TRENDS
    // ============================================================
    if (data.trends?.length) {
      sectionStart('Current Industry Trends');
      data.trends.forEach(function(t) {
        checkSpace(35);
        card(m, y, cw, 28, { fill: C.cream, stroke: C.sand, r: 3 });

        // Status badge
        var badgeBg = (s(t.tier)).toLowerCase() === 'hot' ? C.error : C.warning;
        badge(s(t.status || 'TREND'), m + 4, y + 3, badgeBg, C.white);

        // Title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text(s(t.title), m + 4, y + 13);

        // Growth + relevance
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setC(C.grey);
        doc.text('Growth: ' + s(t.growth), m + 4, y + 18);
        doc.text('Relevance:', m + 50, y + 18);
        scoreBarRounded(m + 72, y + 16, 30, t.relevance || 0, 100, C.forest);
        doc.text(s(t.relevance || 0) + '%', m + 104, y + 18);

        // Platform badges
        var px = m + 4;
        (t.platforms || []).forEach(function(p) {
          px += badge(s(p).toUpperCase(), px, y + 22, platColor(p), C.white) + 2;
        });

        y += 32;
        txt(t.description, 4);

        // Search links (CLICKABLE!)
        if (t.searchLinks?.length) {
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          setC(C.forest);
          doc.text('Research Links:', m + 4, y);
          y += 4;
          t.searchLinks.forEach(function(link) {
            checkSpace(5);
            addLink(s(link.label || link.platform || 'Link'), s(link.url), m + 8, y);
            y += 4.5;
          });
        }
        y += 3;
      });
    }

    // ============================================================
    // COMPETITOR ANALYSIS
    // ============================================================
    if (data.competitors?.products?.length) {
      sectionStart('Competitor Analysis');
      data.competitors.products.forEach(function(p) {
        checkSpace(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text(s(p.name), m, y);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setC(C.gold);
        doc.text(s(p.price || ''), m + doc.getTextWidth(s(p.name)) + 4, y);
        y += 7;

        (p.competitors || []).forEach(function(c) {
          checkSpace(30);
          // Competitor header bar
          card(m, y, cw, 7, { fill: C.charcoalLight, r: 2 });
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          setC(C.white);
          doc.text('vs ' + s(c.name), m + 4, y + 5);
          badge(s(c.type || 'competitor').toUpperCase(), m + 8 + doc.getTextWidth('vs ' + s(c.name)), y + 1.5, C.gold, C.charcoal);
          y += 10;

          // Metrics table
          if (c.metrics?.length) {
            var metH = ['Metric', 'You', 'Them'];
            var metW = [70, 50, 50];
            var metRows = c.metrics.map(function(met) {
              return [met.label, met.pe, met.comp];
            });
            drawTable(metH, metRows, metW, { headerBg: C.forest });
          }

          // Strengths
          if (c.strengths?.length) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            setC(C.charcoal);
            doc.text('Their Strengths:', m + 4, y);
            y += 4;
            c.strengths.forEach(function(str) {
              checkSpace(4);
              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'normal');
              setC(C.grey);
              doc.text('- ' + s(str), m + 8, y);
              y += 3.8;
            });
            y += 2;
          }

          // Business wins
          if (c.businessWins?.length) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            setC(C.success);
            doc.text('Your Wins:', m + 4, y);
            y += 4;
            c.businessWins.forEach(function(w) {
              checkSpace(4);
              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'normal');
              setC(C.grey);
              doc.text('> ' + s(w), m + 8, y);
              y += 3.8;
            });
            y += 2;
          }

          // Action
          if (c.action) {
            checkSpace(10);
            card(m + 4, y, cw - 8, 8, { fill: C.sand, r: 2 });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            setC(C.forest);
            doc.text('Action: ', m + 8, y + 5);
            doc.setFont('helvetica', 'normal');
            setC(C.charcoal);
            doc.text(s(c.action).substring(0, 85), m + 22, y + 5);
            y += 11;
          }
          y += 3;
        });
        sep();
      });
    }

    // ============================================================
    // CONTENT ARCHETYPES & GAP ANALYSIS
    // ============================================================
    if (data.archetypes?.length) {
      sectionStart('Content Archetypes & Gap Analysis');
      data.archetypes.forEach(function(a) {
        checkSpace(18);
        card(m, y, cw, 14, { fill: C.cream, r: 2 });
        // Number circle
        setF(C.forest);
        doc.circle(m + 7, y + 7, 4.5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setC(C.white);
        doc.text(s(a.number), m + 7, y + 8.5, { align: 'center' });
        // Title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text(s(a.title), m + 15, y + 5.5);
        // Usage label badge
        if (a.usageLabel) {
          var statusCol = (a.statusType === 'underused' || a.statusType === 'gap') ? C.error :
                          a.statusType === 'moderate' ? C.warning : C.success;
          badge(s(a.usageLabel), m + 18 + doc.getTextWidth(s(a.title)), y + 2, statusCol, C.white);
        }
        // Bar + percentage
        scoreBarRounded(m + 15, y + 9, cw - 60, a.usage, 100, C.forest);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        setC(C.grey);
        doc.text(s(a.usage) + '%', m + cw - 40, y + 11);
        y += 16;
        txt(a.description, 5);
      });

      // Gap Analysis
      if (data.gapAnalysis) {
        y += 3;
        sub('Gap Analysis Summary');

        if (data.gapAnalysis.missingTriggers?.length) {
          checkSpace(10);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.error);
          doc.text('Missing Psychological Triggers:', m + 2, y);
          y += 4;
          data.gapAnalysis.missingTriggers.forEach(function(t) {
            checkSpace(4);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            doc.text('- ' + s(t.name) + ': ' + s(t.detail || ''), m + 6, y);
            y += 3.8;
          });
          y += 2;
        }

        if (data.gapAnalysis.underusedArchetypes?.length) {
          checkSpace(8);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.warning);
          doc.text('Underused Archetypes:', m + 2, y);
          y += 4;
          data.gapAnalysis.underusedArchetypes.forEach(function(a) {
            checkSpace(4);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            doc.text('- ' + s(a.name) + ': ' + s(a.detail || ''), m + 6, y);
            y += 3.8;
          });
          y += 2;
        }

        if (data.gapAnalysis.overusedArchetypes?.length) {
          checkSpace(8);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.forest);
          doc.text('Overused Archetypes:', m + 2, y);
          y += 4;
          data.gapAnalysis.overusedArchetypes.forEach(function(a) {
            checkSpace(4);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            doc.text('- ' + s(a.name) + ': ' + s(a.detail || ''), m + 6, y);
            y += 3.8;
          });
          y += 2;
        }

        // Platform reach
        if (data.gapAnalysis.platformReach?.length) {
          checkSpace(10);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text('Predicted Organic Reach by Platform:', m + 2, y);
          y += 5;
          data.gapAnalysis.platformReach.forEach(function(p) {
            checkSpace(6);
            var lvlCol = (p.level === 'LOW' || p.level === 'ABSENT') ? C.error :
                          p.level === 'MODERATE' ? C.warning : C.success;
            badge(s(p.level), m + 6, y - 1, lvlCol, C.white);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.charcoal);
            doc.text(s(p.platform) + ' - ' + s(p.detail || ''), m + 30, y + 2);
            y += 6;
          });
        }
      }
    }

    // ============================================================
    // VIRAL POST DATABASE
    // ============================================================
    if (data.viralPosts) {
      sectionStart('Viral Post Database');
      ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(function(platform) {
        var posts = data.viralPosts[platform];
        if (!posts?.length) return;

        // Platform header
        checkSpace(12);
        card(m, y, cw, 8, { fill: platColor(platform), r: 2 });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setC(C.white);
        doc.text(capitalize(platform) + ' (' + posts.length + ' posts)', m + 5, y + 5.5);
        y += 12;

        posts.forEach(function(p) {
          checkSpace(35);

          // Rank + Title
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text('#' + s(p.rank) + '  ' + s(p.title || ''), m + 4, y);
          y += 5;

          // Creator
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          setC(C.grey);
          doc.text(s(p.creator || ''), m + 4, y);

          // Score pill
          if (p.viralityScore) {
            var sc = Number(p.viralityScore) || 0;
            var scCol = sc >= 70 ? C.success : sc >= 40 ? C.warning : C.error;
            setF(scCol);
            doc.roundedRect(m + cw - 28, y - 3, 24, 6, 3, 3, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            setC(C.white);
            doc.text(s(sc) + '/100', m + cw - 16, y + 1, { align: 'center' });
          }
          y += 5;

          // Metrics
          if (p.metrics?.length) {
            var mx = m + 4;
            p.metrics.forEach(function(met) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'bold');
              setC(C.charcoal);
              doc.text(s(met.value), mx, y);
              doc.setFontSize(6.5);
              doc.setFont('helvetica', 'normal');
              setC(C.grey);
              doc.text(s(met.label), mx, y + 3.5);
              mx += 28;
            });
            y += 7;
          }

          // Badge row: hook type, content category, visual style
          var bx = m + 4;
          if (p.hookType?.length) {
            p.hookType.forEach(function(h) {
              bx += badge(s(h), bx, y, C.forest, C.white) + 2;
            });
          }
          if (p.contentCategory?.length) {
            p.contentCategory.forEach(function(ct) {
              bx += badge(s(ct), bx, y, C.gold, C.charcoal) + 2;
            });
          }
          if (p.visualStyle) {
            badge(s(p.visualStyle), bx, y, C.charcoalLight, C.white);
          }
          if (bx > m + 4) y += 7;

          // Psych triggers
          if (p.psychTriggers?.length) {
            var ptx = m + 4;
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            setC(C.forest);
            doc.text('Triggers:', ptx, y);
            ptx += 16;
            p.psychTriggers.forEach(function(t) {
              ptx += badge(s(t), ptx, y - 2, C.sand, C.charcoal) + 2;
              if (ptx > m + cw - 20) { ptx = m + 20; y += 6; }
            });
            y += 5;
          }

          // Score bars
          if (p.scores) {
            checkSpace(14);
            [
              { lbl: 'Shareability', val: p.scores.shareability || 0, max: 10 },
              { lbl: 'Saveability', val: p.scores.saveability || 0, max: 10 },
              { lbl: 'Comment Driver', val: p.scores.commentDriver || 0, max: 10 }
            ].forEach(function(bar) {
              doc.setFontSize(7);
              doc.setFont('helvetica', 'normal');
              setC(C.grey);
              doc.text(s(bar.lbl), m + 4, y);
              scoreBarRounded(m + 33, y - 2, 40, bar.val, bar.max, C.forest);
              doc.text(s(bar.val) + '/' + s(bar.max), m + 76, y);
              y += 4.5;
            });
          }

          // Why it resonated
          if (p.whyItResonated) {
            checkSpace(8);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            setC(C.forest);
            doc.text('Why It Resonated:', m + 4, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            var whyL = doc.splitTextToSize(s(p.whyItResonated), cw - 12);
            whyL.slice(0, 2).forEach(function(l) { doc.text(s(l), m + 4, y); y += 3.5; });
            y += 1;
          }

          // Core learning
          if (p.coreLearning) {
            checkSpace(8);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            setC(C.charcoal);
            doc.text('Core Learning:', m + 4, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            var clL = doc.splitTextToSize(s(p.coreLearning), cw - 12);
            clL.slice(0, 2).forEach(function(l) { doc.text(s(l), m + 4, y); y += 3.5; });
            y += 1;
          }

          // Search links (clickable)
          if (p.searchLinks?.length) {
            checkSpace(6);
            p.searchLinks.forEach(function(link) {
              checkSpace(4.5);
              addLink(s(link.label || link.platform || 'Search'), s(link.url), m + 4, y);
              y += 4.5;
            });
          }

          y += 4;
          sep();
        });
      });
    }

    // ============================================================
    // IMPROVED POST SCRIPTS
    // ============================================================
    if (data.improvedPosts) {
      sectionStart('Improved Post Scripts');
      ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(function(platform) {
        var posts = data.improvedPosts[platform];
        if (!posts?.length) return;

        checkSpace(10);
        card(m, y, cw, 7, { fill: platColor(platform), r: 2 });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setC(C.white);
        doc.text(capitalize(platform), m + 5, y + 5);
        y += 10;

        posts.forEach(function(p) {
          checkSpace(30);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text('#' + s(p.number) + ': ' + s(p.title || ''), m + 2, y);
          y += 4;

          // Archetype + triggers
          badge(s(p.archetype || ''), m + 2, y, C.forest, C.white);
          var tpx = m + 6 + doc.getTextWidth(s(p.archetype || '')) + 8;
          (p.triggers || []).forEach(function(t) {
            tpx += badge(s(t), tpx, y, C.sand, C.charcoal) + 2;
          });
          y += 8;

          // Script sections
          if (p.script) {
            ['hook', 'body', 'reveal', 'cta'].forEach(function(section) {
              if (!p.script[section]) return;
              checkSpace(10);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              setC(C.forest);
              doc.text(section.toUpperCase() + ':', m + 5, y);
              doc.setFont('helvetica', 'normal');
              setC(C.grey);
              var scriptLines = doc.splitTextToSize(s(p.script[section]), cw - 30);
              scriptLines.forEach(function(l) {
                checkSpace(4);
                doc.text(s(l), m + 22, y);
                y += 4;
              });
              y += 1.5;
            });
          }
          y += 4;
          sep();
        });
      });
    }

    // ============================================================
    // KPI TRACKING DASHBOARD
    // ============================================================
    if (data.kpi) {
      sectionStart('KPI Tracking Dashboard');

      // Full performance table with ALL columns
      if (data.kpi.recentPerformance?.length) {
        sub('Recent Performance');
        var kH = ['Wk', 'Date', 'Post', 'Plat', 'Type', 'Reach', 'Likes', 'Cmts', 'Saves', 'Shrs', 'Eng%', 'Trend'];
        var kW = [8, 14, 32, 14, 14, 16, 13, 12, 12, 12, 13, 18];
        var kRows = data.kpi.recentPerformance.map(function(r) {
          return [r.week, r.date, s(r.description || '').substring(0, 18), r.platform,
                  r.type || '', r.reach, r.likes, r.comments || '', r.saves || '',
                  r.shares || '', r.engRate, r.trend];
        });
        drawTable(kH, kRows, kW, { headerBg: C.charcoal });
      }

      // Targets
      if (data.kpi.targets) {
        sub('90-Day Platform Targets');
        ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(function(platform) {
          var targets = data.kpi.targets[platform];
          if (!targets?.length) return;
          checkSpace(14);
          badge(capitalize(platform).toUpperCase(), m + 2, y, platColor(platform), C.white);
          y += 7;
          targets.forEach(function(t) {
            label('  Month ' + s(t.month) + ': ', s(t.target), 3);
          });
          y += 3;
        });
      }

      // Formulas
      if (data.kpi.formulas?.length) {
        y += 3;
        sub('Key Formulas');
        data.kpi.formulas.forEach(function(f) {
          checkSpace(8);
          card(m, y, cw, 8, { fill: C.cream, r: 2 });
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text(s(f.name) + ':', m + 4, y + 4);
          doc.setFont('helvetica', 'normal');
          setC(C.grey);
          doc.text(s(f.formula) + '  (Target: ' + s(f.target) + ')', m + 4 + doc.getTextWidth(s(f.name) + ': ') + 1, y + 4);
          y += 10;
        });
      }
    }

    // ============================================================
    // 90-DAY MARKETING ROADMAP
    // ============================================================
    if (data.roadmap) {
      sectionStart('90-Day Marketing Roadmap');

      (data.roadmap.phases || []).forEach(function(phase) {
        checkSpace(20);
        // Phase header
        card(m, y, cw, 10, { fill: C.charcoal, r: 3 });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setC(C.gold);
        doc.text(s(phase.title), m + 5, y + 5);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setC(C.greyLight);
        doc.text(s(phase.subtitle || ''), m + 5, y + 9);
        y += 14;

        (phase.weeks || []).forEach(function(w) {
          checkSpace(12);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          setC(C.forest);
          doc.text(s(w.label), m + 4, y);
          y += 4;
          (w.items || []).forEach(function(item) {
            checkSpace(5);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            var itemLines = doc.splitTextToSize('- ' + s(item), cw - 14);
            itemLines.forEach(function(l) { doc.text(s(l), m + 8, y); y += 3.8; });
          });
          y += 2;
        });

        if (phase.successMetrics?.length) {
          checkSpace(10);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.gold);
          doc.text('Success Metrics:', m + 4, y);
          y += 4;
          phase.successMetrics.forEach(function(metric) {
            checkSpace(4);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            doc.text('> ' + s(metric), m + 8, y);
            y += 3.8;
          });
        }
        y += 5;
      });

      // Recommendations
      if (data.roadmap.recommendations?.length) {
        sub('Top Priority Recommendations');
        data.roadmap.recommendations.forEach(function(r) {
          checkSpace(16);
          card(m, y, cw, 12, { fill: C.cream, stroke: C.sand, r: 3 });
          // Rank circle
          setF(C.charcoal);
          doc.circle(m + 8, y + 6, 4, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          setC(C.white);
          doc.text(s(r.rank), m + 8, y + 7.5, { align: 'center' });
          // Title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text(s(r.title), m + 16, y + 5);
          // Impact badge
          var impCol = (s(r.impact)).indexOf('HIGHEST') >= 0 ? C.error :
                       (s(r.impact)).indexOf('HIGH') >= 0 ? C.warning : C.success;
          badge(s(r.impact), m + cw - 30, y + 2, impCol, C.white);
          // Description
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          setC(C.grey);
          doc.text(s(r.description || '').substring(0, 100), m + 16, y + 10);
          y += 15;
        });
      }
    }

    // ============================================================
    // SEO OPPORTUNITIES
    // ============================================================
    if (data.seo?.length) {
      sectionStart('Google Search Opportunities');
      data.seo.forEach(function(seoItem) {
        checkSpace(32);
        card(m, y, cw, 16, { fill: C.cream, stroke: C.sand, r: 3 });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text('"' + s(seoItem.term) + '"', m + 5, y + 6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setC(C.grey);
        doc.text(s(seoItem.volume) + '  |  Current: ' + s(seoItem.currentRank), m + 5, y + 12);
        // Difficulty badge
        var diffCol = (s(seoItem.difficulty)).toLowerCase().indexOf('hard') >= 0 ? C.error :
                      (s(seoItem.difficulty)).toLowerCase().indexOf('med') >= 0 ? C.warning : C.success;
        badge(s(seoItem.difficulty), m + cw - 30, y + 3, diffCol, C.white);
        y += 19;

        // Trend data
        if (seoItem.trendData) {
          checkSpace(16);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          setC(C.forest);
          doc.text('Trend Insights:', m + 4, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          setC(C.grey);
          if (seoItem.trendData.trend) { doc.text('YoY Trend: ' + s(seoItem.trendData.trend), m + 8, y); y += 3.5; }
          if (seoItem.trendData.peakMonths) { doc.text('Peak Months: ' + s(seoItem.trendData.peakMonths), m + 8, y); y += 3.5; }
          if (seoItem.trendData.relatedRising) { doc.text('Related Rising: ' + s(seoItem.trendData.relatedRising), m + 8, y); y += 3.5; }
          if (seoItem.trendData.regional) { doc.text('Regional: ' + s(seoItem.trendData.regional), m + 8, y); y += 3.5; }
          y += 2;
        }

        // Strategy
        if (seoItem.strategy?.length) {
          checkSpace(10);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          setC(C.charcoal);
          doc.text('Strategy to Rank:', m + 4, y);
          y += 4;
          seoItem.strategy.forEach(function(step, i) {
            checkSpace(4);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            setC(C.grey);
            var stepL = doc.splitTextToSize((i + 1) + '. ' + s(step), cw - 14);
            stepL.forEach(function(l) { doc.text(s(l), m + 8, y); y += 3.5; });
          });
          y += 2;
        }

        // Cost + Impact
        checkSpace(6);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        setC(C.gold);
        doc.text('Cost: ' + s(seoItem.cost) + '     Impact: ' + s(seoItem.impact), m + 4, y);
        y += 7;
      });
    }

    // ============================================================
    // AI & LLM OPPORTUNITIES
    // ============================================================
    if (data.llmOpportunities?.length) {
      sectionStart('AI & LLM Marketing Opportunities');
      data.llmOpportunities.forEach(function(o) {
        checkSpace(22);
        card(m, y, cw, 6, { fill: C.cream, r: 2 });

        // Badge
        var bCol = o.badgeType === 'critical' ? C.error :
                   o.badgeType === 'new' ? [40, 120, 180] : C.success;
        badge(s(o.badge || 'OPPORTUNITY'), m + 4, y + 1, bCol, C.white);
        y += 9;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setC(C.charcoal);
        doc.text(s(o.title), m + 4, y);
        y += 5;
        txt(o.description, 4);

        if (o.action) {
          checkSpace(6);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setC(C.forest);
          doc.text('Action: ', m + 4, y);
          doc.setFont('helvetica', 'normal');
          setC(C.grey);
          var aLines = doc.splitTextToSize(s(o.action), cw - 24);
          aLines.forEach(function(l) { doc.text(s(l), m + 18, y); y += 3.8; });
          y += 1;
        }

        if (o.cost) {
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          setC(C.gold);
          doc.text('Cost: ' + s(o.cost), m + 4, y);
          y += 5;
        }
        y += 3;
      });
    }

    // ============================================================
    // SECOND PASS: TABLE OF CONTENTS
    // ============================================================
    doc.setPage(tocPageNum);
    var tocY = 20;

    // TOC header styling
    setF(C.charcoal);
    doc.rect(0, 0, pw, 5, 'F');
    accentBar(0, 5, pw, C.gold);
    tocY = 25;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    setC(C.charcoal);
    doc.text('Table of Contents', m, tocY);
    tocY += 5;
    accentBar(m, tocY, 45, C.gold);
    tocY += 12;

    tocEntries.forEach(function(entry, idx) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      setC(C.charcoal);
      var numLabel = (idx + 1) + '.  ';
      doc.text(numLabel + entry.title, m + 4, tocY);
      // Page number
      doc.setFont('helvetica', 'bold');
      setC(C.gold);
      doc.text(String(entry.page), pw - m - 4, tocY, { align: 'right' });
      // Dotted leader
      doc.setFontSize(8);
      setC(C.greyLight);
      var textEnd = m + 8 + doc.getTextWidth(numLabel + entry.title);
      var numStart = pw - m - 12;
      for (var dx = textEnd; dx < numStart; dx += 2.5) {
        doc.text('.', dx, tocY);
      }
      // Internal link
      doc.link(m, tocY - 5, cw, 8, { pageNumber: entry.page });
      tocY += 10;
    });

    // ============================================================
    // THIRD PASS: PAGE FOOTERS
    // ============================================================
    var totalPages = doc.internal.getNumberOfPages();
    for (var i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      // Gold accent line
      doc.setDrawColor(C.gold[0], C.gold[1], C.gold[2]);
      doc.setLineWidth(0.4);
      doc.line(m, 286, pw - m, 286);
      // Footer text
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(140, 140, 140);
      doc.text(s(data.business?.name || ''), m, 290);
      doc.text('Page ' + (i - 1) + ' of ' + (totalPages - 1), pw / 2, 290, { align: 'center' });
      doc.text('Marketing Intelligence Report', pw - m, 290, { align: 'right' });
    }

    // ============================================================
    // DOWNLOAD
    // ============================================================
    var filename = (s(data.business?.name) || 'analysis').replace(/[^a-zA-Z0-9]/g, '-') + '-marketing-report.pdf';
    doc.save(filename);
    return filename;

  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('PDF export failed: ' + err.message + '\n\nCheck console for details.');
  }
}

// ===== UTIL =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

// ===== PDF EXPORT =====
async function exportToPDF(data) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert('PDF library not loaded. Please try again.');
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  function addPage() {
    doc.addPage();
    y = 20;
  }

  function checkSpace(needed) {
    if (y + needed > 275) addPage();
  }

  function heading(text, size) {
    checkSpace(15);
    doc.setFontSize(size || 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(89, 102, 85); // Forest green
    doc.text(text, margin, y);
    y += (size || 16) * 0.5 + 3;
  }

  function subheading(text) {
    checkSpace(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(18, 18, 18);
    doc.text(text, margin, y);
    y += 6;
  }

  function bodyText(text, indent) {
    checkSpace(8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentWidth - (indent || 0));
    lines.forEach(line => {
      checkSpace(5);
      doc.text(line, margin + (indent || 0), y);
      y += 4.5;
    });
    y += 2;
  }

  function separator() {
    checkSpace(8);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // === COVER ===
  doc.setFillColor(89, 102, 85);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Marketing Effectiveness Report', margin, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(data.business?.name || 'Business Analysis', margin, 42);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }), margin, 52);
  y = 75;

  // Business overview
  doc.setTextColor(18, 18, 18);
  heading('Business Overview', 14);
  bodyText(`Website: ${data.business?.url || 'N/A'}`);
  bodyText(`Industry: ${data.business?.industry || 'N/A'}`);
  bodyText(data.business?.description || '');
  separator();

  // === SCORECARD ===
  if (data.scorecard) {
    heading('Virality Scorecard');
    subheading(`Overall Score: ${data.scorecard.overall}/100 — ${data.scorecard.assessment}`);
    bodyText(data.scorecard.assessmentDetail || '');
    y += 3;
    (data.scorecard.categories || []).forEach(c => {
      checkSpace(12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.name}: ${c.score}/100`, margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(c.description, contentWidth - 5);
      lines.forEach(l => { checkSpace(4); doc.text(l, margin + 5, y); y += 4; });
      y += 2;
    });
    separator();
  }

  // === TRENDS ===
  if (data.trends?.length) {
    heading('Current Trends');
    data.trends.forEach(t => {
      subheading(`${t.status}: ${t.title}`);
      bodyText(t.description, 5);
      bodyText(`Growth: ${t.growth} | Relevance: ${t.relevance}%`, 5);
      y += 2;
    });
    separator();
  }

  // === COMPETITORS ===
  if (data.competitors?.products?.length) {
    heading('Competitor Analysis');
    data.competitors.products.forEach(p => {
      subheading(`${p.name} (${p.price})`);
      (p.competitors || []).forEach(c => {
        bodyText(`vs ${c.name} (${c.type})`, 5);
        bodyText(`Action: ${c.action}`, 10);
      });
      y += 2;
    });
    separator();
  }

  // === ARCHETYPES ===
  if (data.archetypes?.length) {
    heading('Content Archetypes');
    data.archetypes.forEach(a => {
      bodyText(`${a.number}. ${a.title} — Usage: ${a.usageLabel} (${a.usage}%) — ${a.status}`);
    });
    separator();
  }

  // === IMPROVED POSTS ===
  if (data.improvedPosts) {
    heading('Improved Post Scripts');
    ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
      const posts = data.improvedPosts[platform];
      if (!posts?.length) return;
      subheading(capitalize(platform));
      posts.forEach(p => {
        bodyText(`#${p.number}: ${p.title} (${p.archetype})`, 3);
        bodyText(`Hook: ${p.script?.hook}`, 8);
        bodyText(`CTA: ${p.script?.cta}`, 8);
        y += 1;
      });
    });
    separator();
  }

  // === ROADMAP ===
  if (data.roadmap?.recommendations?.length) {
    heading('Top Recommendations');
    data.roadmap.recommendations.forEach(r => {
      bodyText(`${r.rank}. ${r.title} [${r.impact}]`);
      bodyText(r.description, 8);
    });
    separator();
  }

  // === SEO ===
  if (data.seo?.length) {
    heading('SEO Opportunities');
    data.seo.forEach(s => {
      bodyText(`"${s.term}" — ${s.volume}, ${s.difficulty} difficulty`);
      bodyText(`Impact: ${s.impact} | Cost: ${s.cost}`, 8);
    });
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Marketing Analysis Tool — Powered by Claude AI', margin, 287);

  // Download
  const filename = `${(data.business?.name || 'analysis').replace(/[^a-zA-Z0-9]/g, '-')}-marketing-report.pdf`;
  doc.save(filename);
  return filename;
}

// ===== UTIL =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
  const pw = 210; // page width
  const ph = 297; // page height
  const m = 18;   // margin
  const cw = pw - m * 2; // content width
  let y = 20;

  // Color palette
  const green = [89, 102, 85];
  const darkGreen = [55, 65, 52];
  const white = [255, 255, 255];
  const black = [30, 30, 30];
  const grey = [100, 100, 100];
  const lightGrey = [230, 230, 230];
  const veryLightGrey = [245, 245, 245];

  // TOC entries collected during rendering
  const tocEntries = [];
  const tocPageNum = 2; // TOC is always page 2

  // --- Helpers ---
  function newPage() { doc.addPage(); y = 25; }
  function checkSpace(needed) { if (y + needed > 272) newPage(); }

  function setColor(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
  function setFill(rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }

  function heading(text) {
    checkSpace(18);
    setFill(green);
    doc.rect(m, y - 1, cw, 10, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    setColor(white);
    doc.text(text, m + 4, y + 6);
    y += 14;
    setColor(black);
  }

  function sectionStart(title) {
    newPage();
    tocEntries.push({ title, page: doc.internal.getNumberOfPages() });
    heading(title);
  }

  function sub(text) {
    checkSpace(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(darkGreen);
    doc.text(text, m, y);
    y += 6;
    setColor(black);
  }

  function txt(text, indent) {
    if (!text) return;
    checkSpace(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(grey);
    const lines = doc.splitTextToSize(String(text), cw - (indent || 0));
    lines.forEach(line => {
      checkSpace(4.5);
      doc.text(line, m + (indent || 0), y);
      y += 4.2;
    });
    y += 1.5;
  }

  function label(lbl, val, indent) {
    checkSpace(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(black);
    doc.text(lbl, m + (indent || 0), y);
    const lblW = doc.getTextWidth(lbl);
    doc.setFont('helvetica', 'normal');
    setColor(grey);
    doc.text(String(val || 'N/A'), m + (indent || 0) + lblW + 2, y);
    y += 5;
  }

  function scoreBar(x, yPos, width, score, max) {
    setFill(lightGrey);
    doc.rect(x, yPos, width, 4, 'F');
    const fillW = Math.max(1, (score / max) * width);
    setFill(green);
    doc.rect(x, yPos, fillW, 4, 'F');
  }

  function sep() {
    y += 2;
    doc.setDrawColor(210, 210, 210);
    doc.line(m, y, pw - m, y);
    y += 4;
  }

  function link(text, url, x, yPos) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 90, 160);
    doc.textWithLink(text, x, yPos, { url: url });
    doc.setTextColor(30, 30, 30);
  }

  // ===== PAGE 1: COVER =====
  // Full green background
  setFill(green);
  doc.rect(0, 0, pw, ph, 'F');

  // Accent bar
  setFill(darkGreen);
  doc.rect(0, 0, pw, 8, 'F');

  // Title block
  setColor(white);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Marketing', m, 80);
  doc.text('Effectiveness', m, 95);
  doc.text('Report', m, 110);

  // Separator line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(m, 120, m + 60, 120);
  doc.setLineWidth(0.2);

  // Business name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text(data.business?.name || 'Business Analysis', m, 135);

  // Details
  doc.setFontSize(11);
  const dateStr = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, m, 150);
  if (data.business?.industry) {
    doc.text('Industry: ' + data.business.industry, m, 160);
  }
  if (data.business?.url) {
    doc.text(data.business.url, m, 170);
  }

  // Score badge
  if (data.scorecard?.overall != null) {
    const score = data.scorecard.overall;
    setFill(darkGreen);
    doc.rect(pw - m - 50, 75, 50, 50, 'F');
    setColor(white);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(score), pw - m - 25, 100, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('VIRALITY', pw - m - 25, 110, { align: 'center' });
    doc.text('SCORE', pw - m - 25, 116, { align: 'center' });
  }

  // Footer on cover
  doc.setFontSize(9);
  setColor([200, 210, 200]);
  doc.text('AI-Powered Marketing Analysis', m, ph - 20);

  // ===== PAGE 2: TABLE OF CONTENTS (placeholder — filled in second pass) =====
  newPage();
  // We'll fill this in after rendering all content

  // ===== CONTENT SECTIONS =====

  // --- Business Overview ---
  sectionStart('Business Overview');
  label('Business: ', data.business?.name || 'N/A');
  if (data.business?.url) {
    checkSpace(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(black);
    doc.text('Website: ', m, y);
    link(data.business.url, data.business.url, m + doc.getTextWidth('Website: ') + 2, y);
    y += 5;
  }
  label('Industry: ', data.business?.industry || 'N/A');
  label('Tagline: ', data.business?.tagline || '');
  y += 2;
  txt(data.business?.description || '');

  // --- Virality Scorecard ---
  if (data.scorecard) {
    sectionStart('Virality Scorecard');

    // Score hero
    checkSpace(30);
    setFill(veryLightGrey);
    doc.rect(m, y, cw, 22, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    setColor(green);
    doc.text(data.scorecard.overall + '/100', m + 6, y + 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(black);
    doc.text(data.scorecard.assessment || '', m + 50, y + 10);
    doc.setFontSize(8);
    setColor(grey);
    const assessLines = doc.splitTextToSize(data.scorecard.assessmentDetail || '', cw - 58);
    assessLines.slice(0, 2).forEach((l, i) => {
      doc.text(l, m + 50, y + 16 + i * 3.5);
    });
    y += 28;

    // Category scores
    (data.scorecard.categories || []).forEach(c => {
      checkSpace(14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setColor(black);
      doc.text(c.name, m, y);
      doc.setFont('helvetica', 'normal');
      doc.text(c.score + '/100', m + cw - 15, y);
      y += 2;
      scoreBar(m, y, cw - 20, c.score, 100);
      y += 5;
      doc.setFontSize(7.5);
      setColor(grey);
      const descLines = doc.splitTextToSize(c.description, cw - 5);
      descLines.slice(0, 2).forEach(l => { doc.text(l, m + 2, y); y += 3.2; });
      y += 3;
    });

    // Benchmarks table
    if (data.scorecard.benchmarks?.length) {
      checkSpace(20);
      y += 4;
      sub('Industry Benchmarks');
      const headers = ['Metric', 'You', 'Average', 'Top Performer', 'Gap'];
      const colW = [40, 28, 30, 42, 30];
      let tx = m;
      // Header row
      setFill([70, 80, 68]);
      doc.rect(m, y - 1, cw, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(white);
      headers.forEach((h, i) => { doc.text(h, tx + 2, y + 4); tx += colW[i]; });
      y += 8;
      // Data rows
      data.scorecard.benchmarks.forEach((b, idx) => {
        checkSpace(8);
        if (idx % 2 === 0) { setFill(veryLightGrey); doc.rect(m, y - 1, cw, 7, 'F'); }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setColor(black);
        tx = m;
        [b.metric, b.business, b.average, b.topPerformer, b.gap].forEach((v, i) => {
          doc.text(String(v || '').substring(0, 25), tx + 2, y + 4);
          tx += colW[i];
        });
        y += 7;
      });
      y += 4;
    }
  }

  // --- Current Trends ---
  if (data.trends?.length) {
    sectionStart('Current Industry Trends');
    data.trends.forEach((t, idx) => {
      checkSpace(22);
      // Card background
      setFill(idx % 2 === 0 ? veryLightGrey : white);
      doc.rect(m, y - 1, cw, 18, 'F');
      // Status badge
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setFill(t.tier === 'hot' ? [180, 60, 40] : green);
      const badgeW = doc.getTextWidth(t.status || 'TREND') + 6;
      doc.rect(m + 2, y, badgeW, 5, 'F');
      setColor(white);
      doc.text(t.status || '', m + 5, y + 3.5);
      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(black);
      doc.text(t.title || '', m + 2, y + 10);
      // Stats
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(grey);
      doc.text(`Growth: ${t.growth || ''} | Relevance: ${t.relevance || 0}% | Platforms: ${(t.platforms || []).join(', ')}`, m + 2, y + 15);
      y += 20;
      txt(t.description, 2);
      y += 1;
    });
  }

  // --- Competitor Analysis ---
  if (data.competitors?.products?.length) {
    sectionStart('Competitor Analysis');
    data.competitors.products.forEach(p => {
      checkSpace(15);
      sub(p.name + ' — ' + p.price);
      (p.competitors || []).forEach(c => {
        checkSpace(16);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setColor(darkGreen);
        doc.text('vs ' + c.name, m + 3, y);
        doc.setFont('helvetica', 'normal');
        setColor(grey);
        doc.text(' (' + c.type + ')', m + 3 + doc.getTextWidth('vs ' + c.name) + 1, y);
        y += 5;
        // Metrics
        (c.metrics || []).forEach(metric => {
          label('  ' + metric.label + ': ', metric.pe + ' vs ' + metric.comp, 3);
        });
        txt('Action: ' + c.action, 6);
        y += 2;
      });
      sep();
    });
  }

  // --- Content Archetypes ---
  if (data.archetypes?.length) {
    sectionStart('Content Archetypes & Gap Analysis');
    data.archetypes.forEach(a => {
      checkSpace(14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setColor(black);
      doc.text(a.number + '. ' + a.title, m, y);
      // Score bar
      scoreBar(m + 90, y - 3, 50, a.usage, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(grey);
      doc.text(a.usage + '% — ' + a.status, m + 142, y);
      y += 5;
      txt(a.description, 5);
    });

    // Gap Analysis
    if (data.gapAnalysis) {
      y += 3;
      sub('Gap Analysis Summary');
      if (data.gapAnalysis.missingTriggers?.length) {
        label('Missing Triggers: ', data.gapAnalysis.missingTriggers.map(t => t.name).join(', '));
      }
      if (data.gapAnalysis.underusedArchetypes?.length) {
        label('Underused: ', data.gapAnalysis.underusedArchetypes.map(a => a.name).join(', '));
      }
      if (data.gapAnalysis.overusedArchetypes?.length) {
        label('Overused: ', data.gapAnalysis.overusedArchetypes.map(a => a.name).join(', '));
      }
    }
  }

  // --- Viral Post Database ---
  if (data.viralPosts) {
    sectionStart('Viral Post Database');
    ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
      const posts = data.viralPosts[platform];
      if (!posts?.length) return;
      sub(capitalize(platform));
      posts.forEach(p => {
        checkSpace(14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setColor(black);
        doc.text('#' + p.rank + ' ' + (p.title || ''), m + 2, y);
        doc.setFont('helvetica', 'normal');
        setColor(grey);
        doc.text('Score: ' + (p.viralityScore || 0) + '/100', m + cw - 30, y);
        y += 4.5;
        doc.setFontSize(8);
        doc.text(p.creator || '', m + 5, y);
        y += 4;
        txt(p.coreLearning, 5);
      });
    });
  }

  // --- Improved Post Scripts ---
  if (data.improvedPosts) {
    sectionStart('Improved Post Scripts');
    ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
      const posts = data.improvedPosts[platform];
      if (!posts?.length) return;
      sub(capitalize(platform));
      posts.forEach(p => {
        checkSpace(28);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setColor(black);
        doc.text('#' + p.number + ': ' + (p.title || ''), m + 2, y);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setColor(green);
        doc.text(p.archetype || '', m + 2, y + 4);
        y += 7;
        setColor(grey);
        // Script sections
        if (p.script) {
          ['hook', 'body', 'reveal', 'cta'].forEach(section => {
            if (!p.script[section]) return;
            checkSpace(8);
            doc.setFont('helvetica', 'bold');
            setColor(darkGreen);
            doc.text(section.toUpperCase() + ':', m + 5, y);
            doc.setFont('helvetica', 'normal');
            setColor(grey);
            const scriptLines = doc.splitTextToSize(p.script[section], cw - 30);
            scriptLines.forEach(l => { checkSpace(4); doc.text(l, m + 22, y); y += 4; });
            y += 1;
          });
        }
        y += 3;
      });
    });
  }

  // --- KPI Dashboard ---
  if (data.kpi) {
    sectionStart('KPI Tracking Dashboard');

    // Recent performance table
    if (data.kpi.recentPerformance?.length) {
      sub('Recent Performance');
      const kpiHeaders = ['Wk', 'Date', 'Post', 'Platform', 'Reach', 'Likes', 'Eng%', 'Trend'];
      const kpiColW = [10, 18, 50, 22, 20, 16, 16, 22];
      let tx = m;
      setFill([70, 80, 68]);
      doc.rect(m, y - 1, cw, 6, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setColor(white);
      kpiHeaders.forEach((h, i) => { doc.text(h, tx + 1, y + 3); tx += kpiColW[i]; });
      y += 7;

      data.kpi.recentPerformance.forEach((r, idx) => {
        checkSpace(7);
        if (idx % 2 === 0) { setFill(veryLightGrey); doc.rect(m, y - 1, cw, 6, 'F'); }
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setColor(black);
        tx = m;
        [r.week, r.date, (r.description || '').substring(0, 30), r.platform, r.reach, r.likes, r.engRate, r.trend].forEach((v, i) => {
          doc.text(String(v || ''), tx + 1, y + 3);
          tx += kpiColW[i];
        });
        y += 6;
      });
      y += 5;
    }

    // Targets
    if (data.kpi.targets) {
      sub('90-Day Targets');
      ['tiktok', 'instagram', 'facebook', 'linkedin'].forEach(platform => {
        const targets = data.kpi.targets[platform];
        if (!targets?.length) return;
        checkSpace(12);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setColor(darkGreen);
        doc.text(capitalize(platform), m + 2, y);
        y += 5;
        targets.forEach(t => {
          label('  Month ' + t.month + ': ', t.target, 3);
        });
        y += 2;
      });
    }

    // Formulas
    if (data.kpi.formulas?.length) {
      y += 3;
      sub('Key Formulas');
      data.kpi.formulas.forEach(f => {
        label(f.name + ': ', f.formula + ' (Target: ' + f.target + ')');
      });
    }
  }

  // --- 90-Day Roadmap ---
  if (data.roadmap) {
    sectionStart('90-Day Marketing Roadmap');

    // Phases
    (data.roadmap.phases || []).forEach(phase => {
      checkSpace(20);
      sub(phase.title + ' — ' + phase.subtitle);
      (phase.weeks || []).forEach(w => {
        checkSpace(10);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        setColor(black);
        doc.text(w.label, m + 3, y);
        y += 4;
        (w.items || []).forEach(item => {
          checkSpace(5);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          setColor(grey);
          const itemLines = doc.splitTextToSize('• ' + item, cw - 12);
          itemLines.forEach(l => { doc.text(l, m + 6, y); y += 3.8; });
        });
        y += 2;
      });
      if (phase.successMetrics?.length) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        setColor(darkGreen);
        doc.text('Success Metrics:', m + 3, y);
        y += 4;
        phase.successMetrics.forEach(metric => {
          checkSpace(5);
          doc.setFont('helvetica', 'normal');
          setColor(grey);
          doc.text('✓ ' + metric, m + 6, y);
          y += 3.8;
        });
      }
      y += 4;
    });

    // Top Recommendations
    if (data.roadmap.recommendations?.length) {
      sub('Top 8 Priority Recommendations');
      data.roadmap.recommendations.forEach(r => {
        checkSpace(12);
        setFill(veryLightGrey);
        doc.rect(m, y - 1, cw, 9, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        setColor(black);
        doc.text(r.rank + '. ' + r.title, m + 3, y + 4);
        // Impact badge
        const impactColor = r.impact?.includes('HIGHEST') ? [180, 60, 40] : r.impact?.includes('HIGH') ? [200, 140, 30] : green;
        setFill(impactColor);
        const impactText = r.impact || '';
        const impactW = doc.getTextWidth(impactText) + 6;
        doc.rect(m + cw - impactW - 2, y + 1, impactW, 5, 'F');
        doc.setFontSize(6.5);
        setColor(white);
        doc.text(impactText, m + cw - impactW + 1, y + 4.5);
        y += 10;
        txt(r.description, 5);
      });
    }
  }

  // --- SEO Opportunities ---
  if (data.seo?.length) {
    sectionStart('Google Search Opportunities');
    data.seo.forEach((s, idx) => {
      checkSpace(22);
      setFill(idx % 2 === 0 ? veryLightGrey : white);
      doc.rect(m, y - 1, cw, 16, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(black);
      doc.text('"' + s.term + '"', m + 3, y + 5);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(grey);
      doc.text(s.volume + '  |  ' + s.difficulty + ' difficulty  |  ' + s.currentRank, m + 3, y + 11);
      y += 18;
      if (s.strategy?.length) {
        s.strategy.forEach((step, i) => {
          checkSpace(5);
          txt((i + 1) + '. ' + step, 5);
        });
      }
      label('Cost: ', s.cost + '  |  Impact: ' + s.impact, 3);
      y += 3;
    });
  }

  // --- AI & LLM Opportunities ---
  if (data.llmOpportunities?.length) {
    sectionStart('AI & LLM Marketing Opportunities');
    data.llmOpportunities.forEach(o => {
      checkSpace(18);
      // Badge
      const badgeColor = o.badgeType === 'critical' ? [180, 60, 40] : o.badgeType === 'new' ? [40, 120, 180] : green;
      setFill(badgeColor);
      const badgeText = o.badge || 'OPPORTUNITY';
      const bw = doc.getTextWidth(badgeText) + 8;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.rect(m, y, bw, 5, 'F');
      setColor(white);
      doc.text(badgeText, m + 3, y + 3.5);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(black);
      doc.text(o.title || '', m + 2, y);
      y += 5;
      txt(o.description, 2);
      label('Action: ', o.action, 2);
      label('Cost: ', o.cost, 2);
      y += 3;
    });
  }

  // ===== SECOND PASS: Fill Table of Contents =====
  doc.setPage(tocPageNum);
  let tocY = 25;

  // TOC header
  setFill(green);
  doc.rect(0, 0, pw, 8, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(black);
  doc.text('Table of Contents', m, tocY + 10);
  tocY += 20;
  doc.setDrawColor(89, 102, 85);
  doc.line(m, tocY, m + 40, tocY);
  tocY += 10;

  tocEntries.forEach((entry, idx) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setColor(black);
    doc.text((idx + 1) + '.  ' + entry.title, m + 5, tocY);
    // Page number
    doc.setFont('helvetica', 'bold');
    setColor(green);
    doc.text(String(entry.page), pw - m - 5, tocY);
    // Dotted line
    doc.setFontSize(8);
    setColor(lightGrey);
    const textEnd = m + 10 + doc.getTextWidth(entry.title) + 5;
    const numStart = pw - m - 10;
    for (let dx = textEnd; dx < numStart; dx += 3) {
      doc.text('.', dx, tocY);
    }
    // Internal link
    doc.link(m, tocY - 5, cw, 8, { pageNumber: entry.page });
    tocY += 10;
  });

  // ===== THIRD PASS: Add page numbers + footer to all pages =====
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text('Page ' + (i - 1) + ' of ' + (totalPages - 1), pw / 2, 290, { align: 'center' });
    doc.text(data.business?.name || '', m, 290);
    doc.text('Marketing Analysis Report', pw - m, 290, { align: 'right' });
    // Thin line above footer
    doc.setDrawColor(220, 220, 220);
    doc.line(m, 286, pw - m, 286);
  }

  // ===== DOWNLOAD =====
  const filename = `${(data.business?.name || 'analysis').replace(/[^a-zA-Z0-9]/g, '-')}-marketing-report.pdf`;
  doc.save(filename);
  return filename;
}

// ===== UTIL =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

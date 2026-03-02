// ============================================
// MARKETING ANALYSIS TOOL
// Main Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentData = null;
  let currentUrl = '';

  // DOM refs
  const landing = document.getElementById('landing');
  const dashboard = document.getElementById('dashboard');
  const stepUrl = document.getElementById('step-url');
  const stepQuestions = document.getElementById('step-questions');
  const loadingEl = document.getElementById('analysisLoading');
  const errorEl = document.getElementById('analysisError');
  const errorMsg = document.getElementById('errorMsg');
  const loadingFill = document.getElementById('loadingFill');
  const loadingLabel = document.getElementById('loadingLabel');

  // ===== LANDING PAGE LOGIC =====

  // URL Next button
  document.getElementById('urlNextBtn').addEventListener('click', () => {
    const urlInput = document.getElementById('businessUrl');
    let url = urlInput.value.trim();
    if (!url) { urlInput.focus(); return; }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
      urlInput.value = url;
    }
    stepUrl.classList.add('hidden');
    stepQuestions.classList.remove('hidden');
  });

  // URL enter key
  document.getElementById('businessUrl').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('urlNextBtn').click();
  });

  // Industry custom input
  document.getElementById('industrySelect').addEventListener('change', e => {
    const custom = document.getElementById('industryCustom');
    if (e.target.value === 'Other') {
      custom.classList.remove('hidden');
      custom.focus();
    } else {
      custom.classList.add('hidden');
    }
  });

  // Size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Analyze button
  document.getElementById('analyzeBtn').addEventListener('click', startAnalysis);

  // Retry button
  document.getElementById('retryBtn').addEventListener('click', () => {
    errorEl.classList.add('hidden');
    stepQuestions.classList.remove('hidden');
  });

  // Settings toggle
  document.getElementById('settingsToggle').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.toggle('hidden');
  });

  // Save API key
  document.getElementById('saveKeyBtn').addEventListener('click', () => {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    if (key) {
      saveApiKey(key);
      input.value = '';
      input.placeholder = 'Key saved ✓';
      setTimeout(() => { input.placeholder = 'sk-ant-api03-...'; }, 2000);
    }
  });

  // Load saved API key indicator
  if (getApiKey()) {
    document.getElementById('apiKeyInput').placeholder = 'Key saved ✓ (enter new to replace)';
  }

  // Load saved analyses list
  renderSavedList();

  // ===== ANALYSIS FLOW =====

  async function startAnalysis() {
    const url = document.getElementById('businessUrl').value.trim();
    const industrySelect = document.getElementById('industrySelect');
    const industry = industrySelect.value === 'Other'
      ? document.getElementById('industryCustom').value.trim()
      : industrySelect.value;
    const sizeBtn = document.querySelector('.size-btn.active');
    const size = sizeBtn ? sizeBtn.dataset.size : 'Small (1-10 employees)';
    const platforms = Array.from(document.querySelectorAll('.platform-checks input:checked')).map(c => c.value);
    const audience = document.getElementById('targetAudience').value.trim();

    if (!url) { document.getElementById('businessUrl').focus(); return; }
    if (!industry) { alert('Please select an industry.'); return; }
    if (!getApiKey()) {
      document.getElementById('settingsPanel').classList.remove('hidden');
      document.getElementById('apiKeyInput').focus();
      alert('Please add your Anthropic API key in Settings first.');
      return;
    }

    currentUrl = url;

    // Show loading
    stepQuestions.classList.add('hidden');
    stepUrl.classList.add('hidden');
    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    loadingFill.style.width = '0%';

    try {
      const data = await analyzeBusiness(url, industry, size, platforms, audience, (pct, label) => {
        loadingFill.style.width = pct + '%';
        loadingLabel.textContent = label;
      });

      currentData = data;
      saveAnalysis(data);
      renderSavedList();
      showDashboard(data);

    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      errorMsg.textContent = err.message || 'Analysis failed. Please try again.';
    }
  }

  function showDashboard(data) {
    loadingEl.classList.add('hidden');
    landing.classList.add('hidden');
    dashboard.classList.remove('hidden');

    // Set date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-AU', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Reset nav to first section
    document.querySelectorAll('.nav-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.querySelectorAll('.section').forEach((s, i) => s.classList.toggle('active', i === 0));

    // Render all sections
    renderDashboard(data);

    // Init dashboard interactivity
    initDashboardNav();
    initTrendInteractivity();

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // ===== SAVED ANALYSES =====

  function renderSavedList() {
    const saved = getSavedAnalyses();
    const list = document.getElementById('savedList');
    const section = document.getElementById('savedSection');
    const entries = Object.entries(saved);

    if (!entries.length) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');

    list.innerHTML = entries.sort((a, b) => (b[1].savedAt || '').localeCompare(a[1].savedAt || '')).map(([url, entry]) => {
      const date = entry.savedAt ? new Date(entry.savedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return `<div class="saved-item" data-url="${escHtml(url)}">
        <div>
          <div class="saved-item-name">${escHtml(entry.businessName)}</div>
          <div class="saved-item-date">${escHtml(url)} &mdash; ${date}</div>
        </div>
        <button class="saved-item-delete" data-delete="${escHtml(url)}" title="Delete">&times;</button>
      </div>`;
    }).join('');

    // Click to load
    list.querySelectorAll('.saved-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.classList.contains('saved-item-delete')) return;
        const url = item.dataset.url;
        const data = loadAnalysis(url);
        if (data) {
          currentData = data;
          currentUrl = url;
          showDashboard(data);
        }
      });
    });

    // Delete buttons
    list.querySelectorAll('.saved-item-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        deleteAnalysis(btn.dataset.delete);
        renderSavedList();
      });
    });
  }

  // ===== DASHBOARD NAVIGATION =====

  function initDashboardNav() {
    // Section nav
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(btn.dataset.section);
        if (target) target.classList.add('active');
      });
    });

    // Platform tabs (viral posts)
    document.querySelectorAll('.platform-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.platform-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`platform-${tab.dataset.platform}-content`);
        if (target) target.classList.add('active');
      });
    });

    // Trend timeframe tabs
    document.querySelectorAll('.trend-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.trend-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.trend-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`trend-${tab.dataset.period}`);
        if (target) target.classList.add('active');
      });
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', goBack);

    // Re-analyze button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      if (currentUrl && currentData) {
        goBack();
        document.getElementById('businessUrl').value = currentUrl;
        stepUrl.classList.add('hidden');
        stepQuestions.classList.remove('hidden');
      }
    });

    // Export PDF button
    document.getElementById('exportBtn').addEventListener('click', () => {
      if (currentData) exportToPDF(currentData);
    });
  }

  function goBack() {
    dashboard.classList.add('hidden');
    landing.classList.remove('hidden');
    stepUrl.classList.remove('hidden');
    stepQuestions.classList.add('hidden');
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    window.scrollTo(0, 0);
  }

  // ===== TREND INTERACTIVITY =====

  function initTrendInteractivity() {
    // Region selector
    const regionSelect = document.getElementById('regionSelect');
    if (regionSelect) {
      regionSelect.addEventListener('change', () => {
        const region = regionSelect.value;
        document.querySelectorAll('.trend-card[data-views]').forEach(card => {
          try {
            const views = JSON.parse(card.dataset.views);
            const viewsLabel = card.querySelector('.views-label');
            if (viewsLabel && views[region]) {
              viewsLabel.textContent = views[region] + ' views';
            }
          } catch {}
        });
      });
    }

    // Platform filter
    document.querySelectorAll('.platform-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.platform-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.trend-card').forEach(card => {
          if (filter === 'all') {
            card.style.display = '';
          } else {
            const platforms = (card.dataset.platforms || '').split(' ');
            card.style.display = platforms.includes(filter) ? '' : 'none';
          }
        });
      });
    });

    // Trend card expand/collapse
    document.querySelectorAll('.trend-grid').forEach(grid => {
      grid.addEventListener('click', e => {
        const card = e.target.closest('.trend-card');
        if (card && !e.target.closest('a')) {
          card.classList.toggle('expanded');
        }
      });
    });

    // SEO card expand/collapse
    const seoGrid = document.getElementById('seo-grid');
    if (seoGrid) {
      seoGrid.addEventListener('click', e => {
        const card = e.target.closest('.search-term-card');
        if (card) card.classList.toggle('expanded');
      });
    }
  }

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !dashboard.classList.contains('hidden')) {
      goBack();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'e' && currentData) {
      e.preventDefault();
      exportToPDF(currentData);
    }
  });

  // Helper
  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
});

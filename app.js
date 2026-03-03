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

  // Stop analysis button
  document.getElementById('stopAnalysisBtn').addEventListener('click', () => {
    cancelAnalysis();
    loadingEl.classList.add('hidden');
    stepQuestions.classList.remove('hidden');
  });

  // ===== AUTH GATE =====
  const authGate = document.getElementById('authGate');
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');

  // Login form refs
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // Register form refs
  const registerInviteCode = document.getElementById('registerInviteCode');
  const registerUsername = document.getElementById('registerUsername');
  const registerPassword = document.getElementById('registerPassword');
  const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
  const registerBtn = document.getElementById('registerBtn');
  const registerError = document.getElementById('registerError');

  // User greeting
  const userGreeting = document.getElementById('userGreeting');

  // Show/hide auth gate based on session
  if (isLoggedIn()) {
    authGate.classList.add('hidden');
    updateUserGreeting();
  }

  function updateUserGreeting() {
    const username = getSessionUsername();
    if (userGreeting && username) {
      userGreeting.textContent = 'Signed in as ' + username;
    }
  }

  // Toggle between login and register views
  document.getElementById('showRegister').addEventListener('click', e => {
    e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
    registerInviteCode.focus();
  });

  document.getElementById('showLogin').addEventListener('click', e => {
    e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
    loginUsername.focus();
  });

  // Login handlers
  loginBtn.addEventListener('click', handleLogin);
  loginPassword.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  loginUsername.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginPassword.focus();
  });

  async function handleLogin() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;
    if (!username) { loginUsername.focus(); return; }
    if (!password) { loginPassword.focus(); return; }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    loginError.classList.add('hidden');

    try {
      await loginUser(username, password);
      authGate.classList.add('hidden');
      loginUsername.value = '';
      loginPassword.value = '';
      updateUserGreeting();
    } catch (err) {
      loginError.textContent = err.message || 'Login failed. Please try again.';
      loginError.classList.remove('hidden');
      loginPassword.value = '';
      loginPassword.focus();
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }

  // Register handlers
  registerBtn.addEventListener('click', handleRegister);
  registerPasswordConfirm.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });

  async function handleRegister() {
    const inviteCode = registerInviteCode.value.trim();
    const username = registerUsername.value.trim();
    const password = registerPassword.value;
    const passwordConfirm = registerPasswordConfirm.value;

    // Client-side validation
    if (!inviteCode) { registerInviteCode.focus(); return; }
    if (!username) { registerUsername.focus(); return; }
    if (username.length < 3 || username.length > 30) {
      showRegisterError('Username must be 3-30 characters.');
      registerUsername.focus();
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      showRegisterError('Username can only contain letters, numbers, hyphens, and underscores.');
      registerUsername.focus();
      return;
    }
    if (password.length < 8) {
      showRegisterError('Password must be at least 8 characters.');
      registerPassword.focus();
      return;
    }
    if (password !== passwordConfirm) {
      showRegisterError('Passwords do not match.');
      registerPasswordConfirm.focus();
      return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';
    registerError.classList.add('hidden');

    try {
      await registerUser(username, password, inviteCode);
      authGate.classList.add('hidden');
      registerInviteCode.value = '';
      registerUsername.value = '';
      registerPassword.value = '';
      registerPasswordConfirm.value = '';
      updateUserGreeting();
    } catch (err) {
      showRegisterError(err.message || 'Registration failed. Please try again.');
    }

    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
  }

  function showRegisterError(msg) {
    registerError.textContent = msg;
    registerError.classList.remove('hidden');
  }

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logoutUser();
    authGate.classList.remove('hidden');
    loginView.classList.remove('hidden');
    registerView.classList.add('hidden');
  });

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
    if (!isLoggedIn()) {
      authGate.classList.remove('hidden');
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
      const loadingPct = document.getElementById('loadingPct');
      const loadingSection = document.getElementById('loadingSection');

      const data = await analyzeBusiness(url, industry, size, platforms, audience, (pct, label, section) => {
        loadingFill.style.width = pct + '%';
        loadingPct.textContent = pct + '%';
        loadingLabel.textContent = label;
        loadingSection.textContent = section ? 'Currently generating: ' + section : '';
      });

      currentData = data;
      saveAnalysis(data);
      renderSavedList();
      showDashboard(data);

    } catch (err) {
      loadingEl.classList.add('hidden');
      if (err.message === 'ANALYSIS_CANCELLED') {
        // User clicked Stop — already handled, just return quietly
        return;
      }
      if (err.message === 'SESSION_EXPIRED' || err.message === 'NOT_LOGGED_IN') {
        authGate.classList.remove('hidden');
        return;
      }
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
    const countBadge = document.getElementById('savedCount');
    const entries = Object.entries(saved);

    if (!entries.length) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');
    countBadge.textContent = entries.length;

    // Sort newest first
    const sorted = entries.sort((a, b) => (b[1].savedAt || '').localeCompare(a[1].savedAt || ''));

    list.innerHTML = sorted.map(([key, entry]) => {
      const displayUrl = entry.url || key.split('|')[0] || '';
      const date = entry.savedAt ? new Date(entry.savedAt).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const industry = entry.data?.business?.industry || entry.data?._meta?.industry || '';
      const score = entry.data?.scorecard?.overall;
      const scoreHtml = score != null ? `<span class="saved-item-score">${score}/100</span>` : '';
      const partial = entry.data?._meta?.partial ? '<span class="saved-item-partial">Partial</span>' : '';

      return `<div class="saved-item" data-key="${escHtml(key)}">
        <div class="saved-item-info">
          <div class="saved-item-name">${escHtml(entry.businessName)}</div>
          <div class="saved-item-meta">
            ${industry ? `<span class="saved-item-industry">${escHtml(industry)}</span>` : ''}
            <span class="saved-item-date">${date}</span>
            ${partial}
          </div>
          <div class="saved-item-url">${escHtml(displayUrl)}</div>
        </div>
        <div class="saved-item-right">
          ${scoreHtml}
          <button class="saved-item-delete" data-delete="${escHtml(key)}" title="Delete">&times;</button>
        </div>
      </div>`;
    }).join('');

    // Click to load report
    list.querySelectorAll('.saved-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.classList.contains('saved-item-delete')) return;
        const key = item.dataset.key;
        const data = loadAnalysis(key);
        if (data) {
          currentData = data;
          currentUrl = data.business?.url || key.split('|')[0] || '';
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

    // Dropdown toggle (attach once)
    const toggle = document.getElementById('savedToggle');
    if (toggle && !toggle._bound) {
      toggle._bound = true;
      toggle.addEventListener('click', () => {
        section.classList.toggle('open');
      });
    }
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
      if (!currentData) {
        alert('No report data loaded. Please run an analysis first.');
        return;
      }
      try {
        exportToPDF(currentData);
      } catch (err) {
        console.error('Export PDF error:', err);
        alert('PDF export failed: ' + (err.message || err));
      }
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

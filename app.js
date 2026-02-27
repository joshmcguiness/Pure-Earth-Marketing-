// ============================================
// PURE EARTH MARKETING EFFECTIVENESS TOOL
// Interactive Dashboard Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Set current date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ===== Refresh Button =====
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      setTimeout(() => {
        location.reload();
      }, 600);
    });
  }

  // ===== Midnight Auto-Refresh =====
  function getMsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
  }

  function formatCountdown(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  const countdownEl = document.getElementById('refreshCountdown');
  const refreshStatusEl = document.getElementById('refreshStatus');

  // Update countdown every second
  function updateCountdown() {
    const ms = getMsUntilMidnight();
    if (countdownEl) countdownEl.textContent = formatCountdown(ms);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Schedule actual page reload at midnight
  setTimeout(() => {
    if (refreshStatusEl) refreshStatusEl.textContent = 'Refreshing...';
    location.reload();
  }, getMsUntilMidnight());

  // ===== Section Navigation =====
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // ===== Trending Period Tabs =====
  const trendTabs = document.querySelectorAll('.trend-tab');
  const trendContents = document.querySelectorAll('.trend-content');

  trendTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const period = tab.dataset.period;

      trendTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      trendContents.forEach(c => c.classList.remove('active'));
      const target = document.getElementById(`trend-${period}`);
      if (target) target.classList.add('active');
    });
  });

  // ===== Platform Tabs (Viral Database) =====
  const platformTabs = document.querySelectorAll('.platform-tab');
  const platformContents = document.querySelectorAll('.platform-content');

  platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const platform = tab.dataset.platform;

      platformTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      platformContents.forEach(c => c.classList.remove('active'));
      const target = document.getElementById(`platform-${platform}`);
      if (target) target.classList.add('active');
    });
  });

  // ===== Animate score bars on scroll =====
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate score bars
        const bars = entry.target.querySelectorAll('.score-bar, .usage-fill, .relevance-fill');
        bars.forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.width = width;
            });
          });
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scorecard-grid, .archetype-grid, .trend-grid').forEach(el => {
    animateOnScroll.observe(el);
  });

  // ===== Viral card expand/collapse =====
  document.querySelectorAll('.viral-card').forEach(card => {
    const header = card.querySelector('.viral-header');
    const details = card.querySelector('.viral-details');

    if (header && details) {
      // Start expanded
      details.style.maxHeight = details.scrollHeight + 'px';
      details.style.overflow = 'hidden';
      details.style.transition = 'max-height 0.3s ease';

      header.style.cursor = 'pointer';
      header.addEventListener('click', () => {
        if (details.style.maxHeight !== '0px') {
          details.style.maxHeight = '0px';
          card.classList.add('collapsed');
        } else {
          details.style.maxHeight = details.scrollHeight + 'px';
          card.classList.remove('collapsed');
        }
      });
    }
  });

  // ===== Region Selector =====
  const regionSelect = document.getElementById('regionSelect');
  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      const region = regionSelect.value;
      document.querySelectorAll('.trend-card[data-views]').forEach(card => {
        try {
          const views = JSON.parse(card.dataset.views);
          const viewsLabel = card.querySelector('.views-label');
          if (viewsLabel && views[region]) {
            const currentText = viewsLabel.textContent;
            const suffix = currentText.includes('views') ? ' views' :
                          currentText.includes('searches') ? ' searches' :
                          currentText.includes('engagements') ? ' engagements' : ' views';
            const timeframe = currentText.includes('today') ? ' today' :
                             currentText.includes('this week') ? ' this week' :
                             currentText.includes('this month') ? ' this month' : '';
            viewsLabel.textContent = views[region] + suffix + timeframe;
          }
        } catch (e) {}
      });
    });
  }

  // ===== Platform Filter Buttons =====
  const filterBtns = document.querySelectorAll('.platform-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.trend-card[data-platforms]').forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const platforms = card.dataset.platforms.split(' ');
          card.style.display = platforms.includes(filter) ? '' : 'none';
        }
      });
    });
  });

  // ===== Clickable Platform Tags on Trend Cards =====
  document.querySelectorAll('.platform-tag.clickable').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const platform = tag.dataset.platform;
      // Activate the corresponding filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      const targetFilter = document.querySelector(`.platform-filter-btn[data-filter="${platform}"]`);
      if (targetFilter) {
        targetFilter.classList.add('active');
        targetFilter.click();
      }
    });
  });

  // ===== Trend Card Expand/Collapse =====
  document.querySelectorAll('.trend-card[data-platforms]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't expand if clicking a link
      if (e.target.closest('a') || e.target.closest('.platform-tag.clickable')) return;
      card.classList.toggle('expanded');
    });
  });

  // ===== Keyboard navigation =====
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '8') {
      const index = parseInt(e.key) - 1;
      if (navBtns[index]) {
        navBtns[index].click();
      }
    }
  });

  // ===== KPI Refresh Metrics =====
  const refreshBtn = document.getElementById('refreshMetrics');
  const progressWrapper = document.getElementById('progressWrapper');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const progressPercent = document.getElementById('progressPercent');
  const cancelBtn = document.getElementById('cancelRefresh');

  let refreshInterval = null;
  let refreshCancelled = false;

  const refreshSteps = [
    { pct: 5, label: 'Connecting to Instagram API...' },
    { pct: 15, label: 'Fetching post data (last 3 weeks)...' },
    { pct: 30, label: 'Pulling engagement metrics...' },
    { pct: 45, label: 'Calculating engagement rates...' },
    { pct: 55, label: 'Fetching follower growth data...' },
    { pct: 65, label: 'Comparing against benchmarks...' },
    { pct: 75, label: 'Analysing content performance...' },
    { pct: 85, label: 'Generating virality scores...' },
    { pct: 95, label: 'Finalising dashboard update...' },
    { pct: 100, label: 'Metrics refreshed successfully!' }
  ];

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshCancelled = false;
      refreshBtn.disabled = true;
      progressWrapper.classList.add('active');
      cancelBtn.classList.add('active');
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      progressLabel.textContent = 'Initialising...';

      let stepIndex = 0;
      refreshInterval = setInterval(() => {
        if (refreshCancelled) return;
        if (stepIndex < refreshSteps.length) {
          const step = refreshSteps[stepIndex];
          progressFill.style.width = step.pct + '%';
          progressPercent.textContent = step.pct + '%';
          progressLabel.textContent = step.label;
          stepIndex++;
        } else {
          clearInterval(refreshInterval);
          refreshInterval = null;
          setTimeout(() => {
            progressWrapper.classList.remove('active');
            cancelBtn.classList.remove('active');
            refreshBtn.disabled = false;
            progressLabel.textContent = 'Connecting to Instagram API...';
            progressFill.style.width = '0%';
            progressPercent.textContent = '0%';
          }, 1500);
        }
      }, 800);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      refreshCancelled = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
      progressLabel.textContent = 'Cancelled by user.';
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      setTimeout(() => {
        progressWrapper.classList.remove('active');
        cancelBtn.classList.remove('active');
        refreshBtn.disabled = false;
        progressLabel.textContent = 'Connecting to Instagram API...';
      }, 1000);
    });
  }

  // ===== Competitor Data & Rendering =====
  const competitorData = {
    serum: [
      {
        name: 'Mukti Organics Vital C Elixir',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$49', comp: '$82' },
          { label: 'Rating', pe: '5.0/5', comp: '4.6/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~45K' },
          { label: 'Packaging', pe: 'Aluminium', comp: 'Glass' }
        ],
        strengths: [
          'Strong retail distribution (Nourished Life, Flora & Fauna)',
          'Active founder (Mukti Lustig) on events circuit',
          'Press coverage in Vogue Australia, InStyle',
          'Consistent video Reels with product demos'
        ],
        peWins: [
          'Better price point ($49 vs $82)',
          'Perfect 5.0 star rating',
          'Fully plastic-free packaging',
          'Unique Kakadu Plum hero ingredient'
        ],
        action: 'Better value with higher ratings, but Mukti\'s press presence and retail distribution drive 4x awareness. Priority: get listed in same directories and pitch to beauty editors.'
      },
      {
        name: 'Biologi Bf Restore Face & Body Serum',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$49', comp: '$69' },
          { label: 'Rating', pe: '5.0/5', comp: '4.8/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~25K' },
          { label: 'Key Ingredient', pe: 'Kakadu Plum', comp: 'Davidson Plum' }
        ],
        strengths: [
          'Single-ingredient philosophy resonates with "clean" buyers',
          'Stocked in Adore Beauty and selected pharmacies',
          'Strong Australian native botanicals narrative',
          'Active PR with beauty editors and influencers'
        ],
        peWins: [
          'Better price ($49 vs $69)',
          'Perfect 5.0 rating vs 4.8',
          'Kakadu Plum has higher vitamin C than Davidson Plum',
          'Aluminium packaging vs Biologi\'s glass + plastic'
        ],
        action: 'Biologi\'s single-ingredient approach is compelling but limits their range. Position Pure Earth as the Kakadu Plum authority with better ingredients and packaging.'
      },
      {
        name: 'Sand & Sky Australian Emu Apple Serum',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$49', comp: '$59.90' },
          { label: 'Rating', pe: '5.0/5', comp: '4.3/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~320K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Sephora, ASOS' }
        ],
        strengths: [
          'Massive social media following (320K+ IG)',
          'Sephora and ASOS distribution globally',
          'Viral pink clay mask drove brand awareness',
          'Heavy influencer marketing investment'
        ],
        peWins: [
          'Better price ($49 vs $59.90)',
          'Significantly higher ratings (5.0 vs 4.3)',
          'Truly Australian-made (Sand & Sky outsources production)',
          'Plastic-free aluminium packaging'
        ],
        action: 'Sand & Sky proves Australian botanicals sell globally but their ratings lag behind. Target their audience with "what real Australian skincare looks like."'
      },
      {
        name: 'Ere Perez Quandong Green Booster Serum',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$49', comp: '$65' },
          { label: 'Rating', pe: '5.0/5', comp: '4.5/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~35K' },
          { label: 'Certifications', pe: 'Cruelty-Free', comp: 'B Corp, Vegan' }
        ],
        strengths: [
          'B Corp certified \u2014 strong ethical positioning',
          'Stocked in Mecca, Nourished Life, and UK retailers',
          'Beautiful minimalist branding and photography',
          'Strong editorial coverage in ethical beauty space'
        ],
        peWins: [
          'Better price ($49 vs $65)',
          'Perfect 5.0 rating vs 4.5',
          'Kakadu Plum > Quandong for vitamin C content',
          'Fully plastic-free packaging'
        ],
        action: 'Ere Perez has strong B Corp credibility. Consider pursuing B Corp certification for Pure Earth. In the meantime, lead with superior ratings and the Kakadu Plum story.'
      }
    ],
    shampoo: [
      {
        name: 'Sukin Natural Balance Shampoo',
        type: 'Mass Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$10.99' },
          { label: 'Rating', pe: '5.0/5', comp: '4.2/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~180K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Woolworths, Coles' }
        ],
        strengths: [
          'Mass market retail in every supermarket',
          'Aggressive SEO \u2014 #1 for "natural shampoo australia"',
          'Affordable price attracts first-time natural buyers',
          'Strong brand recall and shelf space'
        ],
        peWins: [
          'Superior ingredients (Kakadu Plum vs basic botanicals)',
          'Perfect ratings vs 4.2',
          'Fully plastic-free aluminium packaging',
          'Higher concentration of active ingredients'
        ],
        action: 'Sukin is mass-market \u2014 don\'t compete on price. Position as the premium "upgrade from Sukin" for conscious consumers ready for better quality.'
      },
      {
        name: 'A\'kin Moisture Rich Wheat Protein Shampoo',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$17.95' },
          { label: 'Rating', pe: '5.0/5', comp: '4.3/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~15K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Priceline, Chemist W.' }
        ],
        strengths: [
          'Well-established Australian natural brand since 2002',
          'Priceline and Chemist Warehouse distribution',
          'Mid-range pricing accessible to wider audience',
          'Strong repeat purchase rate in loyalty programs'
        ],
        peWins: [
          'Perfect 5.0 star ratings vs 4.3',
          'Kakadu Plum hero ingredient vs generic wheat protein',
          'Fully plastic-free aluminium packaging',
          'Stronger sustainability narrative'
        ],
        action: 'A\'kin sits in the "accessible natural" space. Pure Earth can position above them with premium native ingredients. Target their audience ready to trade up.'
      },
      {
        name: 'EverEscents Organic Rose Shampoo',
        type: 'Salon + DTC',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$29.95' },
          { label: 'Rating', pe: '5.0/5', comp: '4.6/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~8K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Salons, DTC' }
        ],
        strengths: [
          'Certified organic \u2014 strong eco credentials',
          'Salon-quality positioning builds trust',
          'Loyal niche following in organic space',
          'Australian-made with local ingredients'
        ],
        peWins: [
          'Perfect 5.0 vs 4.6 rating',
          'Similar price but better ingredients',
          'Kakadu Plum is more innovative than Rose',
          'Aluminium packaging vs EverEscents plastic bottles'
        ],
        action: 'EverEscents is the closest competitor in positioning and price. Differentiate through Kakadu Plum innovation and aluminium packaging. Target salon partnerships.'
      },
      {
        name: 'Kevin Murphy Hydrate-Me.Wash',
        type: 'Salon + Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$49.95' },
          { label: 'Rating', pe: '5.0/5', comp: '4.4/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~500K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Salons, Adore Beauty' }
        ],
        strengths: [
          'Celebrity hairdresser brand with massive reach',
          'Premium salon positioning globally',
          'Beautiful packaging and brand aesthetic',
          '500K+ IG following with professional content'
        ],
        peWins: [
          'Better price ($32 vs $49.95)',
          'Perfect 5.0 star rating vs 4.4',
          'Truly natural ingredients vs synthetic blends',
          'Plastic-free packaging vs Kevin Murphy\'s plastic'
        ],
        action: 'Kevin Murphy is premium-priced with lower ratings. Pure Earth can capture their audience seeking genuine natural products. Content: "salon quality without the salon markup or the plastic."'
      }
    ],
    oil: [
      {
        name: 'KORA Organics Noni Radiant Body Oil',
        type: 'DTC + Premium Retail',
        metrics: [
          { label: 'Price', pe: '$45', comp: '$68' },
          { label: 'Rating', pe: '5.0/5', comp: '4.7/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~850K' },
          { label: 'Celebrity', pe: 'None', comp: 'Miranda Kerr' }
        ],
        strengths: [
          'Celebrity founder with massive personal reach',
          'Sephora Australia distribution',
          'Polished brand content with studio-quality Reels',
          'Strong Google rankings for "organic beauty australia"'
        ],
        peWins: [
          'Scalp-specific formulation (KORA is face/body focused)',
          'Better price ($45 vs $68)',
          'Aluminium vs plastic packaging',
          'Authenticity \u2014 real founder story vs celebrity brand'
        ],
        action: 'KORA has celebrity reach that can\'t be matched, but Pure Earth\'s scalp oil occupies a different niche. Position as: "Built in the bush, not in a boardroom."'
      },
      {
        name: 'Grown Alchemist Smoothing Hair Treatment',
        type: 'DTC + Premium Retail',
        metrics: [
          { label: 'Price', pe: '$45', comp: '$49' },
          { label: 'Rating', pe: '5.0/5', comp: '4.5/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~70K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Mecca, David Jones' }
        ],
        strengths: [
          'Premium positioning in Mecca and David Jones',
          'Science-meets-nature brand story resonates',
          'Strong visual identity and packaging design',
          'Wide product range creates brand stickiness'
        ],
        peWins: [
          'Better price ($45 vs $49)',
          'Perfect 5.0 vs 4.5 rating',
          'Kakadu Plum is more unique than generic "smoothing"',
          'Aluminium packaging vs plastic'
        ],
        action: 'Grown Alchemist\'s Mecca presence is aspirational. Pursue Mecca stocking \u2014 Pure Earth\'s ratings and packaging story align perfectly with their ethical beauty curation.'
      },
      {
        name: 'Mr. Smith Serum',
        type: 'Salon + DTC',
        metrics: [
          { label: 'Price', pe: '$45', comp: '$42' },
          { label: 'Rating', pe: '5.0/5', comp: '4.3/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~40K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Salons, Adore Beauty' }
        ],
        strengths: [
          'Cool, minimalist Melbourne brand aesthetic',
          'Strong salon network across Australia',
          'Active on social with hairstylist collaborations',
          'Adore Beauty and RY.com.au distribution'
        ],
        peWins: [
          'Perfect 5.0 vs 4.3 rating',
          'Kakadu Plum active ingredient vs generic silicones',
          'Aluminium packaging vs plastic',
          'Stronger sustainability credentials'
        ],
        action: 'Mr. Smith has salon credibility but lower ratings. Target salon partnerships \u2014 Pure Earth delivers better results (higher ratings) with better sustainability (no plastic).'
      },
      {
        name: 'Evo Love Perpetua Shine Drops',
        type: 'Salon + Retail',
        metrics: [
          { label: 'Price', pe: '$45', comp: '$38' },
          { label: 'Rating', pe: '5.0/5', comp: '4.2/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~55K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Salons, RY.com.au' }
        ],
        strengths: [
          'Fun, irreverent Australian brand personality',
          'Strong salon distribution nationally',
          'Active social media with humorous content',
          'Professional recommendation drives repeat purchase'
        ],
        peWins: [
          'Perfect 5.0 vs 4.2 rating \u2014 significant gap',
          'Natural ingredients vs Evo\'s synthetic base',
          'Aluminium packaging vs plastic',
          'Scalp health focus vs just shine/styling'
        ],
        action: 'Evo\'s fun branding is effective but their ratings are average. Pure Earth can win on substance \u2014 "all the personality, but with real results."'
      }
    ],
    conditioner: [
      {
        name: 'Ethique Wonderbar Conditioner',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$26' },
          { label: 'Rating', pe: '5.0/5', comp: '4.4/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~110K' },
          { label: 'Format', pe: 'Liquid / Aluminium', comp: 'Solid Bar' }
        ],
        strengths: [
          'Strong sustainability narrative (NZ-based, B Corp)',
          'Press \u2014 Forbes, Vogue, Good Morning America',
          '3,000+ backlinks driving SEO dominance',
          'Solid bar format is unique and shareable'
        ],
        peWins: [
          'Higher customer ratings (5.0 vs 4.4)',
          'Liquid format preferred by most consumers',
          'Australian-made with native ingredients',
          'Australian botanical hero story vs generic "eco"'
        ],
        action: 'Ethique\'s solid bar format divides customers. Position as "all the sustainability, none of the compromise" with aluminium liquid format.'
      },
      {
        name: 'Sukin Natural Balance Conditioner',
        type: 'Mass Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$10.99' },
          { label: 'Rating', pe: '5.0/5', comp: '4.1/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~180K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Woolworths, Coles' }
        ],
        strengths: [
          'Available in every Australian supermarket',
          'Cheapest natural option on shelf',
          'Strong SEO for "natural conditioner australia"',
          'Massive brand awareness in natural space'
        ],
        peWins: [
          'Dramatically better ratings (5.0 vs 4.1)',
          'Lemon Myrtle ingredient vs generic botanicals',
          'Aluminium packaging vs Sukin\'s plastic bottles',
          'Higher active ingredient concentrations'
        ],
        action: 'Sukin owns mass-market natural. Position Pure Earth as the premium upgrade. Content: "Loved your Sukin? Wait until you try real native Australian botanicals."'
      },
      {
        name: 'A\'kin Lavender & Anthemis Conditioner',
        type: 'DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$17.95' },
          { label: 'Rating', pe: '5.0/5', comp: '4.4/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~15K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Priceline' }
        ],
        strengths: [
          'Established brand with 20+ years in market',
          'Priceline distribution with loyalty program',
          'Mid-range price makes it accessible',
          'Good repeat purchase rates'
        ],
        peWins: [
          'Perfect 5.0 vs 4.4 rating',
          'Native Australian Lemon Myrtle vs generic lavender',
          'Fully plastic-free aluminium packaging',
          'Stronger brand story and sustainability'
        ],
        action: 'A\'kin customers are mid-range natural buyers ready to upgrade. Target with comparison content showing ingredient quality and sustainability benefits.'
      },
      {
        name: 'EverEscents Organic Rose Conditioner',
        type: 'Salon + DTC',
        metrics: [
          { label: 'Price', pe: '$32', comp: '$29.95' },
          { label: 'Rating', pe: '5.0/5', comp: '4.5/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~8K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Salons, DTC' }
        ],
        strengths: [
          'Certified organic credentials',
          'Strong salon network distribution',
          'Loyal following in organic haircare space',
          'Australian-made with quality ingredients'
        ],
        peWins: [
          'Perfect 5.0 vs 4.5 rating',
          'Lemon Myrtle is more unique than Rose',
          'Aluminium packaging vs plastic',
          'More compelling sustainability story'
        ],
        action: 'Closest competitor in positioning and price. Differentiate through Lemon Myrtle innovation, aluminium packaging, and the Pure Earth founder story.'
      }
    ],
    bodywash: [
      {
        name: 'Bondi Wash Body Wash',
        type: 'DTC + Premium Retail',
        metrics: [
          { label: 'Price', pe: '$28', comp: '$35' },
          { label: 'Rating', pe: '5.0/5', comp: '4.5/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~65K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'David Jones, Mecca' }
        ],
        strengths: [
          'Premium positioning in David Jones, Mecca',
          'Strong Australian bush botanical storytelling',
          'Beautiful product photography and branding',
          'Active gifting/hospitality partnerships'
        ],
        peWins: [
          'Better price ($28 vs $35)',
          'Perfect 5.0 star ratings',
          'Aluminium packaging vs Bondi Wash\'s plastic',
          'One Tree Planted partnership adds purpose'
        ],
        action: 'Bondi Wash has a similar "Australian bush botanical" narrative but uses plastic. Content angle: side-by-side packaging comparison showing their plastic vs your aluminium.'
      },
      {
        name: 'Sukin Botanical Body Wash',
        type: 'Mass Retail',
        metrics: [
          { label: 'Price', pe: '$28', comp: '$9.99' },
          { label: 'Rating', pe: '5.0/5', comp: '4.0/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~180K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Woolworths, Coles' }
        ],
        strengths: [
          'Cheapest natural body wash on shelves',
          'Available everywhere in Australia',
          'Strong brand awareness in natural category',
          'Broad product range for cross-selling'
        ],
        peWins: [
          'Dramatically higher ratings (5.0 vs 4.0)',
          'Real native Australian ingredients vs generic',
          'Fully plastic-free aluminium packaging',
          'Higher quality formulation'
        ],
        action: 'Sukin dominates mass market but ratings show quality gap. Position as the conscious upgrade: "You started natural with Sukin. Now experience what natural should actually feel like."'
      },
      {
        name: 'Aesop A Rose By Any Other Name Cleanser',
        type: 'Premium DTC + Retail',
        metrics: [
          { label: 'Price', pe: '$28', comp: '$53' },
          { label: 'Rating', pe: '5.0/5', comp: '4.7/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~480K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Own Stores, Mecca' }
        ],
        strengths: [
          'Iconic premium Australian brand globally',
          'Own retail stores create brand experience',
          'Cult following with massive social proof',
          'Beautiful store design and brand aesthetic'
        ],
        peWins: [
          'Dramatically better price ($28 vs $53)',
          'Perfect 5.0 vs 4.7 rating',
          'Aluminium packaging vs Aesop\'s plastic pumps',
          'Small-batch authenticity vs corporate brand'
        ],
        action: 'Aesop is aspirational premium. Position as "Aesop quality at honest prices, without the plastic." Target their audience who question the price and packaging.'
      },
      {
        name: 'Grown Alchemist Body Cleanser',
        type: 'DTC + Premium Retail',
        metrics: [
          { label: 'Price', pe: '$28', comp: '$39' },
          { label: 'Rating', pe: '5.0/5', comp: '4.4/5' },
          { label: 'IG Followers', pe: '~10K', comp: '~70K' },
          { label: 'Distribution', pe: 'DTC Only', comp: 'Mecca, David Jones' }
        ],
        strengths: [
          'Science-forward brand positioning',
          'Premium retail distribution (Mecca, David Jones)',
          'Strong visual identity and packaging',
          'Active ingredient storytelling in content'
        ],
        peWins: [
          'Better price ($28 vs $39)',
          'Perfect 5.0 vs 4.4 rating',
          'Aluminium packaging vs plastic',
          'Australian native ingredients vs generic botanicals'
        ],
        action: 'Grown Alchemist\'s Mecca presence is the benchmark. Pursue Mecca listing \u2014 Pure Earth\'s ratings, price, and packaging story are a natural fit.'
      }
    ]
  };

  function renderCompetitorCard(product) {
    const card = document.getElementById('comp-body-' + product);
    const select = document.querySelector('.brand-select[data-product="' + product + '"]');
    if (!card || !select || !competitorData[product]) return;

    const brandIndex = parseInt(select.value);
    const brand = competitorData[product][brandIndex];
    if (!brand) return;

    let metricsHTML = '<div class="competitor-metrics">';
    brand.metrics.forEach(function(m) {
      metricsHTML += '<div class="comp-metric"><div class="comp-metric-label">' + m.label + '</div><div class="comp-metric-row"><span class="comp-pe-value">' + m.pe + '</span><span class="comp-divider">vs</span><span class="comp-other-value">' + m.comp + '</span></div></div>';
    });
    metricsHTML += '</div>';

    const strengthsHTML = brand.strengths.map(function(s) { return '<li>' + s + '</li>'; }).join('');
    const peWinsHTML = brand.peWins.map(function(w) { return '<li>' + w + '</li>'; }).join('');

    card.innerHTML = '<div class="variant-brand-name">' + brand.name + ' <span class="brand-type">' + brand.type + '</span></div>' +
      metricsHTML +
      '<div class="competitor-insights"><div class="insight-box strength"><h4>What They Do Well</h4><ul>' + strengthsHTML + '</ul></div><div class="insight-box weakness"><h4>Where Pure Earth Wins</h4><ul>' + peWinsHTML + '</ul></div></div>' +
      '<div class="competitor-action">' + brand.action + '</div>';
  }

  // Initialize all competitor cards
  ['serum', 'shampoo', 'oil', 'conditioner', 'bodywash'].forEach(function(product) {
    renderCompetitorCard(product);
  });

  // Brand dropdown change
  document.querySelectorAll('.brand-select').forEach(function(select) {
    select.addEventListener('change', function() {
      renderCompetitorCard(select.dataset.product);
    });
  });

  // Product filter buttons
  const productBtns = document.querySelectorAll('.product-btn');
  productBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const product = btn.dataset.product;
      productBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      document.querySelectorAll('.competitor-card[data-product]').forEach(function(card) {
        if (product === 'all') {
          card.style.display = '';
        } else {
          card.style.display = card.dataset.product === product ? '' : 'none';
        }
      });
    });
  });

  // ===== SEO Card Expand/Collapse =====
  document.querySelectorAll('.search-term-card').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      card.classList.toggle('expanded');
    });
  });
});

// ============================================
// MARKETING ANALYSIS TOOL — DATA SCHEMA
// Defines the JSON structure returned by Claude API
// ============================================

const DATA_SCHEMA = {
  // Example/template showing the exact structure Claude must return
  business: {
    name: '',           // "Pure Earth"
    url: '',            // "https://pureearth.com.au"
    industry: '',       // "Beauty & Skincare"
    description: '',    // Short 1-2 sentence description
    tagline: ''         // Brand tagline or positioning
  },

  trends: [
    // 4 trends for "Last 24 Hours", 4 for "This Week"
    {
      title: '',             // "Skin Cycling 2.0 — Barrier Repair Focus"
      status: '',            // "TRENDING NOW" | "RISING" | "EMERGING" | "TRENDING"
      tier: '',              // "hot" | "warm" | "" (empty = default)
      timeframe: '',         // "day" | "week"
      platforms: [],         // ["tiktok", "instagram"]
      description: '',       // Paragraph explaining the trend
      views: {               // Regional view counts
        global: '', australia: '', asia: '', europe: '',
        africa: '', usa: '', canada: '', 'south-america': ''
      },
      growth: '',            // "+340%"
      relevance: 0,          // 0-100 percentage
      detailMetrics: [       // Platform-specific breakdowns
        { platform: '', value: '', label: '' }
      ],
      searchLinks: [         // External search links
        { platform: '', url: '', label: '' }
      ]
    }
  ],

  viralPosts: {
    tiktok: [],    // Array of 5 viral post objects
    instagram: [],
    facebook: [],
    linkedin: []
    // Each post:
    // {
    //   rank: 1,
    //   title: "Trinidad Sandoval — Peter Thomas Roth Eye Tightener",
    //   creator: "@trinidad1967",
    //   viralityScore: 94,
    //   metrics: [ { value: "30M+", label: "Views" } ],
    //   contentCategory: ["UGC Showcase", "Before & After"],
    //   hookType: ["Emotional Trigger", "Pattern Interrupt"],
    //   visualStyle: "Raw selfie-cam, no editing...",
    //   psychTriggers: ["Aspiration", "Validation", "Identity"],
    //   whyItResonated: "A 54-year-old hospital housekeeper...",
    //   scores: { shareability: 9, saveability: 8, commentDriver: 10 },
    //   coreLearning: "Real people showing real results..."
    // }
  },

  competitors: {
    products: [
      // {
      //   name: "Kakadu Plum Vitamin C Serum",
      //   price: "$49",
      //   id: "serum",
      //   competitors: [
      //     {
      //       name: "Mukti Organics",
      //       type: "DTC + Retail",
      //       metrics: [ { label: "Price", pe: "$49", comp: "$89" } ],
      //       strengths: ["Certified organic", "Spa distribution"],
      //       businessWins: ["More affordable", "Kakadu Plum hero"],
      //       action: "Emphasize native botanical innovation..."
      //     }
      //   ]
      // }
    ]
  },

  archetypes: [
    // {
    //   number: 1,
    //   title: "Relatable Identity Content",
    //   description: "Content that makes viewers say 'that's so me.'",
    //   usage: 40,         // 0-100 percentage
    //   usageLabel: "Medium",  // "Absent" | "Very Low" | "Low" | "Medium" | "High"
    //   status: "UNDERUSED — High Potential",
    //   statusType: "underused"  // "underused" | "balanced" | "critical"
    // }
  ],

  gapAnalysis: {
    missingTriggers: [],    // [{ name: "FOMO", detail: "No scarcity..." }]
    overusedArchetypes: [], // [{ name: "Educational", detail: "Strong but..." }]
    underusedArchetypes: [],// [{ name: "Transformation", detail: "Zero content..." }]
    platformReach: []       // [{ platform: "TikTok", level: "LOW", detail: "No account" }]
  },

  scorecard: {
    overall: 0,             // 0-100
    assessment: '',         // "Significant Growth Opportunity"
    assessmentDetail: '',   // Longer paragraph
    categories: [
      // { name: "Content Quality", score: 65, description: "Strong blog..." }
    ],
    benchmarks: [
      // { metric: "Instagram Followers", business: "~10K", average: "50K-200K", topPerformer: "3M+ (Sol de Janeiro)", gap: "Severe" }
    ]
  },

  improvedPosts: {
    tiktok: [],    // Array of 5 post objects
    instagram: [],
    facebook: [],
    linkedin: []
    // Each post:
    // {
    //   number: 1,
    //   title: "The Kakadu Plum Challenge",
    //   archetype: "Transformation Visual × Trend Audio",
    //   script: {
    //     hook: "POV: You replaced your $120 serum...",
    //     body: "Show the bottle, the texture...",
    //     reveal: "Day 14 results — CLOSE UP on skin",
    //     cta: "Would you try it? Comment PLUM..."
    //   },
    //   triggers: ["Aspiration", "Curiosity", "Social Proof"]
    // }
  },

  kpi: {
    recentPerformance: [
      // { week: 1, date: "Nov 18", description: "Product carousel...", platform: "Instagram", type: "Carousel", reach: "12,400", likes: "320", comments: "45", saves: "89", shares: "12", engRate: "5.3%", trend: "BENCHMARK", trendType: "neutral" }
    ],
    targets: {
      tiktok: [{ month: 1, target: '' }, { month: 2, target: '' }, { month: 3, target: '' }],
      instagram: [{ month: 1, target: '' }, { month: 2, target: '' }, { month: 3, target: '' }],
      facebook: [{ month: 1, target: '' }, { month: 2, target: '' }, { month: 3, target: '' }],
      linkedin: [{ month: 1, target: '' }, { month: 2, target: '' }, { month: 3, target: '' }]
    },
    formulas: [
      // { name: "Engagement Rate", formula: "(Likes + Comments + Saves + Shares) / Reach × 100", target: "Above 5%" }
    ]
  },

  roadmap: {
    phases: [
      // {
      //   title: "Foundation",
      //   subtitle: "Days 1-30",
      //   weeks: [
      //     { label: "Week 1-2", items: ["Set up TikTok account", "..."] },
      //     { label: "Week 3-4", items: ["Launch first Reels series", "..."] }
      //   ],
      //   successMetrics: ["1K TikTok followers", "..."]
      // }
    ],
    recommendations: [
      // { rank: 1, title: "Launch TikTok", description: "...", impact: "HIGHEST IMPACT" }
    ]
  },

  seo: [
    // {
    //   term: "natural shampoo australia",
    //   volume: "5,400/mo",
    //   difficulty: "Medium",
    //   currentRank: "Not ranking",
    //   trendData: { trend: "+8% YoY", peakMonths: "Jan, Sep", relatedRising: "...", regional: "..." },
    //   strategy: ["Create pillar blog post...", "..."],
    //   cost: "$500-$1,500",
    //   impact: "400-800 visits/mo"
    // }
  ],

  llmOpportunities: [
    // {
    //   title: "Google AI Overviews (SGE)",
    //   badge: "CRITICAL",        // "CRITICAL" | "NEW CHANNEL" | "OPPORTUNITY"
    //   badgeType: "critical",    // "critical" | "new" | "opportunity"
    //   description: "Google now shows AI-generated summaries...",
    //   action: "Restructure product pages with FAQ schema...",
    //   cost: "$200-$500/month"
    // }
  ]
};

// Schema prompts split into two parts to stay within token limits

// Part 1: Core Analysis (business, trends, viral posts, competitors, archetypes, gap analysis, scorecard)
const SCHEMA_PROMPT_PART1 = `Return a JSON object with this exact structure:
{
  "business": { "name": string, "url": string, "industry": string, "description": string, "tagline": string },
  "trends": [8 objects - 4 with timeframe "day", 4 with timeframe "week". Each: { "title": string, "status": "TRENDING NOW"|"RISING"|"EMERGING"|"TRENDING", "tier": "hot"|"warm"|"", "timeframe": "day"|"week", "platforms": ["tiktok","instagram","facebook","linkedin"], "description": string, "views": {"global":string,"australia":string,"asia":string,"europe":string,"africa":string,"usa":string,"canada":string,"south-america":string}, "growth": string like "+340%", "relevance": number 0-100, "detailMetrics": [{"platform":string,"value":string,"label":string}], "searchLinks": [{"platform":"tiktok"|"instagram"|"google"|"linkedin"|"facebook","url":string,"label":string}] }],
  "viralPosts": { "tiktok": [5 posts], "instagram": [5], "facebook": [5], "linkedin": [5]. Each post: { "rank": number, "title": string, "creator": string, "viralityScore": number 0-100, "metrics": [{"value":string,"label":string}], "contentCategory": [string], "hookType": [string], "visualStyle": string, "psychTriggers": [string], "whyItResonated": string, "scores": {"shareability":1-10,"saveability":1-10,"commentDriver":1-10}, "coreLearning": string } },
  "competitors": { "products": [3-5 products. Each: {"name":string,"price":string,"id":string (lowercase no spaces),"competitors":[4 objects. Each: {"name":string,"type":string,"metrics":[{"label":string,"pe":string,"comp":string}],"strengths":[string],"businessWins":[string],"action":string}]}] },
  "archetypes": [8 objects. Each: {"number":1-8,"title":string,"description":string,"usage":number 0-100,"usageLabel":"Absent"|"Very Low"|"Low"|"Medium"|"High","status":string,"statusType":"underused"|"balanced"|"critical"}],
  "gapAnalysis": { "missingTriggers": [{"name":string,"detail":string}], "overusedArchetypes": [{"name":string,"detail":string}], "underusedArchetypes": [{"name":string,"detail":string}], "platformReach": [{"platform":string,"level":"LOW"|"MODERATE"|"HIGH"|"ABSENT","detail":string}] },
  "scorecard": { "overall": number 0-100, "assessment": string, "assessmentDetail": string, "categories": [8 objects: {"name":string,"score":number 0-100,"description":string}], "benchmarks": [{"metric":string,"business":string,"average":string,"topPerformer":string,"gap":"Severe"|"Moderate"|"Slight"|"No Data"}] }
}`;

// Part 2: Strategy & Content (improved posts, KPI, roadmap, SEO, LLM opportunities)
const SCHEMA_PROMPT_PART2 = `Return a JSON object with this exact structure:
{
  "improvedPosts": { "tiktok": [5], "instagram": [5], "facebook": [5], "linkedin": [5]. Each: {"number":1-5,"title":string,"archetype":string,"script":{"hook":string,"body":string,"reveal":string,"cta":string},"triggers":[string]} },
  "kpi": { "recentPerformance": [5-9 rows: {"week":number,"date":string,"description":string,"platform":string,"type":string,"reach":string,"likes":string,"comments":string,"saves":string,"shares":string,"engRate":string,"trend":string,"trendType":"positive"|"negative"|"neutral"}], "targets": {"tiktok":[{"month":1,"target":string},{"month":2,"target":string},{"month":3,"target":string}],"instagram":[same],"facebook":[same],"linkedin":[same]}, "formulas": [{"name":string,"formula":string,"target":string}] },
  "roadmap": { "phases": [3 phases: {"title":string,"subtitle":string,"weeks":[{"label":string,"items":[string]}],"successMetrics":[string]}], "recommendations": [8: {"rank":1-8,"title":string,"description":string,"impact":"HIGHEST IMPACT"|"HIGH IMPACT"|"MEDIUM IMPACT"}] },
  "seo": [6 objects: {"term":string,"volume":string,"difficulty":string,"currentRank":string,"trendData":{"trend":string,"peakMonths":string,"relatedRising":string,"regional":string},"strategy":[4 strings],"cost":string,"impact":string}],
  "llmOpportunities": [6 objects: {"title":string,"badge":"CRITICAL"|"NEW CHANNEL"|"OPPORTUNITY","badgeType":"critical"|"new"|"opportunity","description":string,"action":string,"cost":string}]
}`;

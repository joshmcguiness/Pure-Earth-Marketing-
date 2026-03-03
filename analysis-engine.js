// ============================================
// MARKETING ANALYSIS TOOL — AI ENGINE
// Calls Claude API to generate business analysis
// Split into 2 API calls to stay within token limits
// ============================================

// UPDATE THIS after deploying your Cloudflare Worker:
const WORKER_BASE_URL = 'https://marketing-tool-proxy.josh-mcguiness.workers.dev';
const WORKER_URL = WORKER_BASE_URL + '/api/analyze';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// ===== SESSION MANAGEMENT =====

function getSessionToken() {
  return localStorage.getItem('session_token') || '';
}

function getSessionUsername() {
  return localStorage.getItem('session_username') || '';
}

function saveSession(token, username) {
  localStorage.setItem('session_token', token);
  localStorage.setItem('session_username', username);
}

function clearSession() {
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_username');
}

function isLoggedIn() {
  return !!getSessionToken();
}

// ===== AUTH API FUNCTIONS =====

async function registerUser(username, password, inviteCode) {
  const response = await fetch(WORKER_BASE_URL + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, inviteCode })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  saveSession(data.sessionToken, data.username);
  return data;
}

async function loginUser(username, password) {
  const response = await fetch(WORKER_BASE_URL + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  saveSession(data.sessionToken, data.username);
  return data;
}

async function logoutUser() {
  const token = getSessionToken();
  if (token) {
    try {
      await fetch(WORKER_BASE_URL + '/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Token': token }
      });
    } catch (e) {
      // Ignore network errors on logout — clear locally regardless
    }
  }
  clearSession();
}

// ===== PROMPT BUILDERS =====

function buildPromptPart1(url, industry, size, platforms, audience) {
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `You are an expert marketing strategist and social media analyst. Analyze the business at ${url} and generate Part 1 of a marketing effectiveness report.

Business details provided by the user:
- Website: ${url}
- Industry: ${industry}
- Business size: ${size}
- Active/target platforms: ${platforms.join(', ')}
- Target audience: ${audience}
- Analysis date: ${today}

Generate the CORE ANALYSIS sections. Be specific, actionable, and realistic. Use real competitor names, real platform data estimates, and specific strategic recommendations tailored to this exact business and industry.

For the "trends" section: Identify 8 real, current trends in this business's industry (4 "day" timeframe, 4 "week" timeframe). Use actual trending topics, not generic ones. Include realistic view count estimates.

For "viralPosts": Find or describe 5 real viral posts per platform that are relevant to this industry. Use actual creator names where possible, realistic metrics.

For "competitors": Identify 3-5 of this business's actual products/services and 4 real competitors for each. Use real pricing and real competitive advantages.

For "archetypes": Score how well this business uses each of 8 viral content archetypes (0-100). Be honest about gaps.

For "scorecard": Give an honest overall virality score (most small businesses score 15-45). Don't inflate scores.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation text. Just the JSON object.

${SCHEMA_PROMPT_PART1}`;
}

function buildPromptPart2(url, industry, size, platforms, audience, businessContext) {
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `You are an expert marketing strategist. You are generating Part 2 of a marketing effectiveness report for the following business:

- Business name: ${businessContext.name}
- Website: ${url}
- Industry: ${industry}
- Business size: ${size}
- Active/target platforms: ${platforms.join(', ')}
- Target audience: ${audience}
- Current virality score: ${businessContext.score}/100
- Analysis date: ${today}

Generate the STRATEGY & CONTENT sections. Be specific, actionable, and realistic. Tailor everything to this exact business.

For "improvedPosts": Write 5 ready-to-use post scripts per platform, tailored to this specific business. Include compelling hooks and clear CTAs.

For "kpi": Estimate recent performance and set realistic 90-day targets for each platform.

For "roadmap": Create a specific 90-day action plan with 3 phases and weekly tasks. Include 8 prioritized recommendations.

For "seo": Identify 6 high-value search terms this business should target with volume estimates and ranking strategies.

For "llmOpportunities": Identify 6 AI/LLM marketing opportunities relevant to this business.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation text. Just the JSON object.

${SCHEMA_PROMPT_PART2}`;
}

// ===== JSON REPAIR FOR TRUNCATED RESPONSES =====

function repairTruncatedJSON(str) {
  try {
    let s = str;

    // Step 1: Close any open string literal
    let inStr = false, esc = false;
    for (let i = 0; i < s.length; i++) {
      if (esc) { esc = false; continue; }
      if (s[i] === '\\' && inStr) { esc = true; continue; }
      if (s[i] === '"') inStr = !inStr;
    }
    if (inStr) s += '"';

    // Step 2: Try progressively stripping trailing incomplete tokens until we can close delimiters
    for (let attempts = 0; attempts < 100; attempts++) {
      s = s.replace(/[,:\s]+$/, '');

      inStr = false; esc = false;
      const stack = [];
      for (let i = 0; i < s.length; i++) {
        if (esc) { esc = false; continue; }
        if (s[i] === '\\' && inStr) { esc = true; continue; }
        if (s[i] === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (s[i] === '{') stack.push('}');
        else if (s[i] === '[') stack.push(']');
        else if ((s[i] === '}' || s[i] === ']') && stack.length && stack[stack.length - 1] === s[i]) {
          stack.pop();
        }
      }

      let candidate = s;
      while (stack.length) candidate += stack.pop();

      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        const stripped = s.replace(/(?:"(?:[^"\\]|\\.)*"|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[}\]])\s*$/, '');
        if (stripped === s || stripped.length < 2) return null;
        s = stripped;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ===== REUSABLE API CALL HELPER =====

async function makeApiCall(prompt, signal, sessionToken) {
  // Makes a single API call and returns parsed JSON data
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }]
    }),
    signal: signal
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error?.message || errorData.error || errorMsg;
        if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
      } catch {
        if (errorText && errorText.length < 500) errorMsg = errorText;
      }
    } catch {}
    if (response.status === 401) {
      clearSession();
      throw new Error('SESSION_EXPIRED');
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    throw new Error(errorMsg);
  }

  // Read and parse the SSE response
  const responseText = await response.text();
  let fullText = '';
  let stopReason = null;

  // Parse SSE events
  const lines = responseText.split('\n');
  let deltaCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      const data = trimmed.startsWith('data: ') ? trimmed.slice(6).trim() : trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          fullText += event.delta.text;
          deltaCount++;
        }
        if (event.type === 'message_delta' && event.delta?.stop_reason) {
          stopReason = event.delta.stop_reason;
        }
        if (event.type === 'error') {
          throw new Error('AI error: ' + (event.error?.message || JSON.stringify(event.error || event)));
        }
      } catch (e) {
        if (e.message?.startsWith('AI error:')) throw e;
      }
    }
  }

  // Fallback: try direct JSON if SSE yielded nothing
  if (!fullText) {
    try {
      const jsonResp = JSON.parse(responseText);
      if (jsonResp.content && Array.isArray(jsonResp.content)) {
        for (const block of jsonResp.content) {
          if (block.type === 'text') fullText += block.text;
        }
        stopReason = jsonResp.stop_reason || null;
      }
    } catch {}
  }

  console.log('API call: deltas=' + deltaCount, 'textLen=' + fullText.length, 'stop=' + stopReason);

  if (!fullText) {
    throw new Error('Empty response from AI. Please try again.');
  }

  // Extract JSON from the response text
  let jsonStr = fullText.trim();

  // Strip markdown code fences
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  // Try direct parse
  try {
    return JSON.parse(jsonStr);
  } catch {}

  // Find outermost JSON object
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = jsonStr.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch {
      // Try repair
      console.warn('JSON parse failed, attempting repair... (stop=' + stopReason + ')');
      const repaired = repairTruncatedJSON(jsonStr.substring(firstBrace));
      if (repaired) {
        try {
          const result = JSON.parse(repaired);
          console.log('JSON repair succeeded, recovered keys:', Object.keys(result).join(', '));
          return result;
        } catch {}
      }
    }
  }

  const hint = stopReason === 'max_tokens' ? ' Response was truncated (too long).' : '';
  throw new Error('Failed to parse AI response.' + hint + ' Please try again.');
}

// ===== MAIN ANALYSIS FUNCTION =====

// Global abort controller — allows cancellation from outside
let currentAbortController = null;

function cancelAnalysis() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

async function analyzeBusiness(url, industry, size, platforms, audience, onProgress) {
  const token = getSessionToken();
  if (!token) {
    throw new Error('NOT_LOGGED_IN');
  }

  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    // ===== CALL 1: Core Analysis =====
    if (onProgress) onProgress(2, 'Preparing analysis...', '');

    const prompt1 = buildPromptPart1(url, industry, size, platforms, audience);

    if (onProgress) onProgress(4, 'Connecting to AI — Phase 1 of 2...', '');

    // Simulated progress for Call 1 (4% to 48%)
    const STAGES_1 = [
      { pct: 8,  name: 'Business Profile',   label: 'Phase 1: Analysing business profile...' },
      { pct: 14, name: 'Industry Trends',     label: 'Phase 1: Scanning industry trends...' },
      { pct: 20, name: 'Viral Post Database',  label: 'Phase 1: Finding viral content...' },
      { pct: 28, name: 'Viral Post Database',  label: 'Phase 1: Analysing viral posts...' },
      { pct: 34, name: 'Competitor Analysis',   label: 'Phase 1: Researching competitors...' },
      { pct: 38, name: 'Content Archetypes',    label: 'Phase 1: Evaluating archetypes...' },
      { pct: 42, name: 'Gap Analysis',          label: 'Phase 1: Identifying gaps...' },
      { pct: 45, name: 'Virality Scorecard',    label: 'Phase 1: Calculating virality score...' },
    ];

    let stageIdx = 0;
    const timer1 = setInterval(() => {
      if (stageIdx < STAGES_1.length) {
        const s = STAGES_1[stageIdx];
        if (onProgress) onProgress(s.pct, s.label, s.name);
        stageIdx++;
      }
    }, 5000);

    let part1Data;
    try {
      part1Data = await makeApiCall(prompt1, signal, token);
      clearInterval(timer1);
    } catch (err) {
      clearInterval(timer1);
      throw err;
    }

    // Validate Part 1
    if (!part1Data.business || !part1Data.trends) {
      throw new Error('Incomplete analysis from Phase 1. Please try again.');
    }

    console.log('Part 1 complete. Keys:', Object.keys(part1Data).join(', '));

    // ===== CALL 2: Strategy & Content =====
    if (onProgress) onProgress(48, 'Phase 1 complete — starting Phase 2...', '');

    const businessContext = {
      name: part1Data.business?.name || 'Unknown',
      score: part1Data.scorecard?.overall || 'N/A'
    };
    const prompt2 = buildPromptPart2(url, industry, size, platforms, audience, businessContext);

    if (onProgress) onProgress(50, 'Connecting to AI — Phase 2 of 2...', '');

    // Simulated progress for Call 2 (50% to 93%)
    const STAGES_2 = [
      { pct: 54, name: 'Improved Posts',        label: 'Phase 2: Writing improved posts...' },
      { pct: 60, name: 'Improved Posts',        label: 'Phase 2: Crafting post scripts...' },
      { pct: 66, name: 'KPI Dashboard',         label: 'Phase 2: Building KPI dashboard...' },
      { pct: 72, name: '90-Day Roadmap',        label: 'Phase 2: Creating 90-day roadmap...' },
      { pct: 78, name: '90-Day Roadmap',        label: 'Phase 2: Planning action items...' },
      { pct: 84, name: 'SEO Opportunities',     label: 'Phase 2: Finding SEO opportunities...' },
      { pct: 88, name: 'AI & LLM Opportunities', label: 'Phase 2: Discovering AI opportunities...' },
      { pct: 91, name: 'Finishing up...',        label: 'Phase 2: Finalising strategy...' },
    ];

    let stageIdx2 = 0;
    const timer2 = setInterval(() => {
      if (stageIdx2 < STAGES_2.length) {
        const s = STAGES_2[stageIdx2];
        if (onProgress) onProgress(s.pct, s.label, s.name);
        stageIdx2++;
      }
    }, 5000);

    let part2Data = {};
    try {
      part2Data = await makeApiCall(prompt2, signal, token);
      clearInterval(timer2);
      console.log('Part 2 complete. Keys:', Object.keys(part2Data).join(', '));
    } catch (err) {
      clearInterval(timer2);
      // Graceful degradation: if Part 2 fails, return partial data from Part 1
      console.warn('Part 2 failed, returning partial data:', err.message);
      part1Data._meta = {
        analyzedAt: new Date().toISOString(),
        url: url,
        industry: industry,
        model: CLAUDE_MODEL,
        partial: true,
        partialReason: err.message
      };
      if (onProgress) onProgress(100, 'Analysis partially complete', '');
      return part1Data;
    }

    // ===== MERGE RESULTS =====
    if (onProgress) onProgress(95, 'Merging analysis data...', 'Processing');

    const analysisData = { ...part1Data, ...part2Data };

    // Add metadata
    analysisData._meta = {
      analyzedAt: new Date().toISOString(),
      url: url,
      industry: industry,
      model: CLAUDE_MODEL
    };

    if (onProgress) onProgress(98, 'Finalising report...', 'Validating data');

    if (onProgress) onProgress(100, 'Analysis complete!', '');

    return analysisData;

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('ANALYSIS_CANCELLED');
    }
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw err;
  } finally {
    currentAbortController = null;
  }
}

// ===== Save/load analyses from localStorage =====

function saveAnalysis(data) {
  const saved = getSavedAnalyses();
  const key = data.business?.url || data._meta?.url || 'unknown';
  saved[key] = {
    data: data,
    savedAt: new Date().toISOString(),
    businessName: data.business?.name || 'Unknown Business'
  };
  localStorage.setItem('saved_analyses', JSON.stringify(saved));
}

function getSavedAnalyses() {
  try {
    return JSON.parse(localStorage.getItem('saved_analyses') || '{}');
  } catch {
    return {};
  }
}

function loadAnalysis(url) {
  const saved = getSavedAnalyses();
  return saved[url]?.data || null;
}

function deleteAnalysis(url) {
  const saved = getSavedAnalyses();
  delete saved[url];
  localStorage.setItem('saved_analyses', JSON.stringify(saved));
}

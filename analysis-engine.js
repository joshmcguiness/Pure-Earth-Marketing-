// ============================================
// MARKETING ANALYSIS TOOL — AI ENGINE
// Calls Claude API to generate business analysis
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

function buildAnalysisPrompt(url, industry, size, platforms, audience) {
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `You are an expert marketing strategist and social media analyst. Analyze the business at ${url} and generate a comprehensive marketing effectiveness report.

Business details provided by the user:
- Website: ${url}
- Industry: ${industry}
- Business size: ${size}
- Active/target platforms: ${platforms.join(', ')}
- Target audience: ${audience}
- Analysis date: ${today}

Generate a COMPLETE marketing effectiveness analysis. Be specific, actionable, and realistic. Use real competitor names, real platform data estimates, and specific strategic recommendations tailored to this exact business and industry.

For the "trends" section: Identify 8 real, current trends in this business's industry (4 "day" timeframe, 4 "week" timeframe). Use actual trending topics, not generic ones. Include realistic view count estimates.

For "viralPosts": Find or describe 5 real viral posts per platform that are relevant to this industry. Use actual creator names where possible, realistic metrics.

For "competitors": Identify 3-5 of this business's actual products/services and 4 real competitors for each. Use real pricing and real competitive advantages.

For "archetypes": Score how well this business uses each of 8 viral content archetypes (0-100). Be honest about gaps.

For "scorecard": Give an honest overall virality score (most small businesses score 15-45). Don't inflate scores.

For "improvedPosts": Write 5 ready-to-use post scripts per platform, tailored to this specific business.

For "kpi": Estimate recent performance and set realistic 90-day targets.

For "roadmap": Create a specific 90-day action plan with weekly tasks.

For "seo": Identify 6 high-value search terms this business should target.

For "llmOpportunities": Identify 6 AI/LLM marketing opportunities relevant to this business.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation text. Just the JSON object.

${SCHEMA_PROMPT}`;
}

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

  // Create a new AbortController for this request
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  // Progress updates
  if (onProgress) onProgress(2, 'Preparing analysis request...', '');

  const prompt = buildAnalysisPrompt(url, industry, size, platforms, audience);

  if (onProgress) onProgress(4, 'Connecting to analysis engine...', '');

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      signal: signal
    });

    if (!response.ok) {
      let errorMsg = `API error: ${response.status}`;
      try {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          // Handle Anthropic error format: { "type": "error", "error": { "message": "..." } }
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
      console.error('API error response:', response.status, errorMsg);
      throw new Error(errorMsg);
    }

    if (onProgress) onProgress(5, 'AI is generating your report...', 'Business Profile');

    // Simulated progress stages — shown while waiting for the full response
    const PROGRESS_STAGES = [
      { pct: 8,  name: 'Business Profile',       label: 'AI is generating your report...' },
      { pct: 14, name: 'Industry Trends',         label: 'Analysing industry trends...' },
      { pct: 22, name: 'Viral Post Database',     label: 'Scanning viral content...' },
      { pct: 32, name: 'Viral Post Database',     label: 'Scanning viral content...' },
      { pct: 42, name: 'Competitor Analysis',      label: 'Researching competitors...' },
      { pct: 50, name: 'Content Archetypes',       label: 'Evaluating content archetypes...' },
      { pct: 56, name: 'Gap Analysis',             label: 'Identifying gaps...' },
      { pct: 62, name: 'Virality Scorecard',       label: 'Calculating virality score...' },
      { pct: 70, name: 'Improved Posts',           label: 'Writing improved posts...' },
      { pct: 76, name: 'Improved Posts',           label: 'Writing improved posts...' },
      { pct: 82, name: 'KPI Dashboard',            label: 'Building KPI dashboard...' },
      { pct: 86, name: '90-Day Roadmap',           label: 'Creating 90-day roadmap...' },
      { pct: 89, name: 'SEO Opportunities',        label: 'Finding SEO opportunities...' },
      { pct: 91, name: 'AI & LLM Opportunities',   label: 'Discovering AI opportunities...' },
      { pct: 93, name: 'Finishing up...',           label: 'Almost done...' }
    ];

    // Start simulated progress timer (advances every ~5 seconds over ~75 seconds)
    let simStageIdx = 0;
    const simInterval = setInterval(() => {
      if (simStageIdx < PROGRESS_STAGES.length) {
        const stage = PROGRESS_STAGES[simStageIdx];
        if (onProgress) onProgress(stage.pct, stage.label, stage.name);
        simStageIdx++;
      }
    }, 5000);

    // Read the full response (blocks until complete)
    let fullText = '';

    try {
      const responseText = await response.text();

      // Stop simulated progress
      clearInterval(simInterval);

      console.log('Response text length:', responseText.length);
      console.log('Response content-type:', response.headers.get('content-type'));

      // Check if the response is SSE (streaming) or plain JSON (non-streaming)
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') || responseText.trimStart().startsWith('event:') || responseText.trimStart().startsWith('data:')) {
        // Parse SSE text to extract content
        const lines = responseText.split('\n');
        let deltaCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                fullText += event.delta.text;
                deltaCount++;
              }
            } catch {}
          }
        }
        console.log('SSE deltas extracted:', deltaCount, 'Full text length:', fullText.length);
      } else {
        // Response might be plain JSON (non-streaming fallback)
        console.log('Non-SSE response detected, trying direct JSON parse');
        try {
          const jsonResp = JSON.parse(responseText);
          // Anthropic Messages API response format
          if (jsonResp.content && Array.isArray(jsonResp.content)) {
            for (const block of jsonResp.content) {
              if (block.type === 'text') {
                fullText += block.text;
              }
            }
          } else {
            // Unknown format — use the raw text
            fullText = responseText;
          }
        } catch {
          // Not JSON either — use raw text
          fullText = responseText;
        }
        console.log('Extracted text length:', fullText.length);
      }

      if (onProgress) onProgress(95, 'Generating report...', 'Processing data');
    } catch (streamErr) {
      clearInterval(simInterval);
      console.error('Stream reading error:', streamErr);
      throw new Error('Failed to read analysis response. Please try again. (' + streamErr.message + ')');
    }

    const content = fullText;

    if (!content) {
      console.error('Empty content. Response type:', response.headers.get('content-type'));
      throw new Error('Empty response from Claude. Please try again.');
    }

    if (onProgress) onProgress(97, 'Processing marketing data...', 'Parsing response');

    // Log raw content for debugging
    console.log('Raw AI response length:', content.length);
    console.log('Raw AI response start:', content.substring(0, 300));
    console.log('Raw AI response end:', content.substring(content.length - 200));

    // Robust JSON extraction — handles markdown wrapping, leading/trailing text, etc.
    let analysisData;
    let jsonStr = content.trim();

    // Step 1: Strip markdown code fences if present
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Step 2: Try direct parse first
    try {
      analysisData = JSON.parse(jsonStr);
    } catch {
      // Step 3: Find the outermost JSON object by locating first { and last }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const extracted = jsonStr.substring(firstBrace, lastBrace + 1);
        try {
          analysisData = JSON.parse(extracted);
        } catch (parseErr2) {
          console.error('JSON parse error (extracted):', parseErr2);
          console.error('Extracted JSON start:', extracted.substring(0, 500));
          console.error('Extracted JSON end:', extracted.substring(extracted.length - 500));
          throw new Error('Failed to parse analysis data. The AI response was not valid JSON. Please try again.');
        }
      } else {
        console.error('No JSON object found in response. Content start:', content.substring(0, 500));
        throw new Error('Failed to parse analysis data. No JSON found in response. Please try again.');
      }
    }

    if (onProgress) onProgress(98, 'Finalizing report...', 'Validating data');

    // Validate essential fields
    if (!analysisData.business || !analysisData.trends) {
      throw new Error('Incomplete analysis data received. Please try again.');
    }

    // Add metadata
    analysisData._meta = {
      analyzedAt: new Date().toISOString(),
      url: url,
      industry: industry,
      model: CLAUDE_MODEL
    };

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

// Save/load analyses from localStorage
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

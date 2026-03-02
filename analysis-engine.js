// ============================================
// MARKETING ANALYSIS TOOL — AI ENGINE
// Calls Claude API to generate business analysis
// ============================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

function getApiKey() {
  return localStorage.getItem('anthropic_api_key') || '';
}

function saveApiKey(key) {
  localStorage.setItem('anthropic_api_key', key.trim());
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

async function analyzeBusiness(url, industry, size, platforms, audience, onProgress) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured. Please add your Anthropic API key in Settings.');
  }

  // Progress updates
  if (onProgress) onProgress(5, 'Preparing analysis request...');

  const prompt = buildAnalysisPrompt(url, industry, size, platforms, audience);

  if (onProgress) onProgress(10, 'Connecting to Claude AI...');

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
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
      })
    });

    if (onProgress) onProgress(30, 'Claude is analyzing the business...');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key in Settings.');
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Please wait a moment and try again.');
      }
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    if (onProgress) onProgress(60, 'Processing marketing data...');

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Claude. Please try again.');
    }

    if (onProgress) onProgress(80, 'Building dashboard...');

    // Parse JSON from response — handle potential markdown wrapping
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    let analysisData;
    try {
      analysisData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw response:', content.substring(0, 500));
      throw new Error('Failed to parse analysis data. The AI response was not valid JSON. Please try again.');
    }

    if (onProgress) onProgress(90, 'Finalizing report...');

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

    if (onProgress) onProgress(100, 'Analysis complete!');

    return analysisData;

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw err;
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

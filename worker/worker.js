// ============================================
// MARKETING ANALYSIS TOOL — CLOUDFLARE WORKER
// Handles auth (register/login/logout) + API proxy
// Uses KV for user accounts and sessions
// ============================================

// ===== CRYPTO UTILITIES =====

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

function generateSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return new Uint8Array(hashBuffer);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ===== RESPONSE HELPERS =====

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token'
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}

// ===== ROUTE HANDLERS =====

async function handleRegister(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400, origin);
  }

  const { username, password, inviteCode } = body;

  // Validate invite code
  if (!inviteCode || !timingSafeEqual(inviteCode, env.INVITE_CODE)) {
    return jsonResponse({ error: 'Invalid invite code' }, 403, origin);
  }

  // Validate username
  if (!username || typeof username !== 'string') {
    return jsonResponse({ error: 'Username is required' }, 400, origin);
  }
  const normalized = username.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 30) {
    return jsonResponse({ error: 'Username must be 3-30 characters' }, 400, origin);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    return jsonResponse({ error: 'Username can only contain letters, numbers, hyphens, and underscores' }, 400, origin);
  }

  // Validate password
  if (!password || typeof password !== 'string' || password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters' }, 400, origin);
  }

  // Check uniqueness
  const existing = await env.AUTH.get('user:' + normalized);
  if (existing) {
    return jsonResponse({ error: 'Username already taken' }, 409, origin);
  }

  // Hash password
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  // Store user
  await env.AUTH.put('user:' + normalized, JSON.stringify({
    username: normalized,
    passwordHash: bufferToBase64(hash),
    salt: bufferToBase64(salt),
    createdAt: new Date().toISOString()
  }));

  // Auto-login: create session
  const token = generateSessionToken();
  await env.AUTH.put('session:' + token, JSON.stringify({
    username: normalized,
    createdAt: new Date().toISOString()
  }), { expirationTtl: 604800 }); // 7 days

  return jsonResponse({ ok: true, username: normalized, sessionToken: token }, 201, origin);
}

async function handleLogin(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400, origin);
  }

  const { username, password } = body;

  if (!username || !password) {
    return jsonResponse({ error: 'Username and password are required' }, 400, origin);
  }

  const normalized = username.toLowerCase().trim();

  // Look up user
  const userJson = await env.AUTH.get('user:' + normalized);
  if (!userJson) {
    return jsonResponse({ error: 'Invalid username or password' }, 401, origin);
  }

  const user = JSON.parse(userJson);

  // Verify password
  const salt = base64ToBuffer(user.salt);
  const hash = await hashPassword(password, salt);
  const hashBase64 = bufferToBase64(hash);

  if (!timingSafeEqual(hashBase64, user.passwordHash)) {
    return jsonResponse({ error: 'Invalid username or password' }, 401, origin);
  }

  // Create session
  const token = generateSessionToken();
  await env.AUTH.put('session:' + token, JSON.stringify({
    username: normalized,
    createdAt: new Date().toISOString()
  }), { expirationTtl: 604800 }); // 7 days

  return jsonResponse({ ok: true, username: normalized, sessionToken: token }, 200, origin);
}

async function handleLogout(request, env, origin) {
  const token = request.headers.get('X-Session-Token') || '';
  if (token) {
    await env.AUTH.delete('session:' + token);
  }
  return jsonResponse({ ok: true }, 200, origin);
}

async function handleAnalyze(request, env, origin) {
  // Validate session
  const token = request.headers.get('X-Session-Token') || '';
  if (!token) {
    return jsonResponse({ error: 'Session required. Please log in.' }, 401, origin);
  }

  const sessionJson = await env.AUTH.get('session:' + token);
  if (!sessionJson) {
    return jsonResponse({ error: 'Session expired. Please log in again.' }, 401, origin);
  }

  // Proxy to Anthropic API with streaming to avoid Cloudflare timeouts
  try {
    const body = await request.json();

    // Force streaming on to prevent Worker timeout on long responses
    body.stream = true;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      return new Response(errorBody, {
        status: anthropicResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }

    // Stream the response through to the client
    return new Response(anthropicResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders(origin)
      }
    });
  } catch (err) {
    return jsonResponse({ error: 'Proxy error: ' + err.message }, 500, origin);
  }
}

// ===== MAIN HANDLER =====

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || '';
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Not found', { status: 404 });
    }

    // CORS origin check
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      env.ALLOWED_ORIGIN,
      'http://localhost:8080'
    ].filter(Boolean);

    if (!allowedOrigins.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Route requests
    if (url.pathname === '/api/register') return handleRegister(request, env, origin);
    if (url.pathname === '/api/login')    return handleLogin(request, env, origin);
    if (url.pathname === '/api/logout')   return handleLogout(request, env, origin);
    if (url.pathname === '/api/analyze')  return handleAnalyze(request, env, origin);

    return new Response('Not found', { status: 404 });
  }
};

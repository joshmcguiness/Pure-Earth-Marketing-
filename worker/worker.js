export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
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

    // Password verify endpoint
    if (url.pathname === '/api/verify') {
      const password = request.headers.get('X-Access-Password') || '';
      if (password === env.ACCESS_PASSWORD) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }

    // Analysis proxy endpoint
    if (url.pathname === '/api/analyze') {
      const password = request.headers.get('X-Access-Password') || '';
      if (!password || password !== env.ACCESS_PASSWORD) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      try {
        const body = await request.json();

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(body)
        });

        const responseBody = await anthropicResponse.text();

        return new Response(responseBody, {
          status: anthropicResponse.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin)
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Password'
  };
}

function handleCORS(request, env) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

// Cloudflare Pages Functions - Albion API Proxy
// This proxies requests to Albion Online API to avoid CORS issues

const SERVERS = {
  'americas': 'https://gameinfo.albiononline.com',
  'europe': 'https://gameinfo-ams.albiononline.com',
  'asia': 'https://gameinfo-sgp.albiononline.com'
};

export async function onRequest(context) {
  const { request, params } = context;
  
  // Get the path after /api/
  const path = params.path ? params.path.join('/') : '';
  
  // Get server from query params
  const url = new URL(request.url);
  const server = url.searchParams.get('server') || 'americas';
  
  // Remove server param from the forwarded URL
  url.searchParams.delete('server');
  
  // Build target URL for official Albion API
  const baseUrl = SERVERS[server] || SERVERS['americas'];
  const targetPath = `/api/gameinfo/${path}`;
  const queryString = url.searchParams.toString();
  const targetUrl = `${baseUrl}${targetPath}${queryString ? '?' + queryString : ''}`;
  
  console.log('Proxying to:', targetUrl);
  
  try {
    // Forward the request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'AlbionBattleLog/1.0',
        'Accept': 'application/json',
      },
    });
    
    // Get response body
    const body = await response.text();
    
    // Return with CORS headers
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

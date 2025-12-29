// Cloudflare Pages Functions - Albion API Proxy
// This proxies requests to Albion Online API to avoid CORS issues

const SERVERS = {
  'americas': 'https://gameinfo.albiononline.com',
  'europe': 'https://gameinfo-ams.albiononline.com',
  'asia': 'https://gameinfo-sgp.albiononline.com'
};

const MURDERLEDGER_SERVERS = {
  'americas': 'https://murderledger.albiononline2d.com',
  'europe': 'https://murderledger-europe.albiononline2d.com',
  'asia': 'https://murderledger-asia.albiononline2d.com'
};

// Albion Data Project (market prices) - use West server (most data available)
const ALBION_DATA_PROJECT_URL = 'https://west.albion-online-data.com';

export async function onRequest(context) {
  const { request, params } = context;
  
  // Get the path after /api/
  const path = params.path ? params.path.join('/') : '';
  
  // Get server from query params
  const url = new URL(request.url);
  const server = url.searchParams.get('server') || 'americas';
  
  // Remove server param from the forwarded URL
  url.searchParams.delete('server');
  
  let targetUrl;
  
  // Check if this is an Albion Data Project request (market prices)
  if (path.startsWith('prices/')) {
    const itemIds = path.replace('prices/', '');
    const queryString = url.searchParams.toString();
    targetUrl = `${ALBION_DATA_PROJECT_URL}/api/v2/stats/prices/${itemIds}.json${queryString ? '?' + queryString : ''}`;
    console.log('Proxying to Albion Data Project:', targetUrl);
  }
  // Check if this is a Murder Ledger request
  else if (path.startsWith('murderledger/')) {
    const mlPath = path.replace('murderledger/', '');
    const baseUrl = MURDERLEDGER_SERVERS[server] || MURDERLEDGER_SERVERS['americas'];
    const queryString = url.searchParams.toString();
    targetUrl = `${baseUrl}/api/${mlPath}${queryString ? '?' + queryString : ''}`;
    console.log('Proxying to Murder Ledger:', targetUrl);
  } else {
    // Build target URL for official Albion API
    const baseUrl = SERVERS[server] || SERVERS['americas'];
    const targetPath = `/api/gameinfo/${path}`;
    const queryString = url.searchParams.toString();
    targetUrl = `${baseUrl}${targetPath}${queryString ? '?' + queryString : ''}`;
    console.log('Proxying to Albion API:', targetUrl);
  }
  
  try {
    // Forward the request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'AlbionBattleLog/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
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

// Feedback API endpoint - sends feedback via email using Resend
export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.type || !data.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Type labels
    const typeLabels = {
      bug: '🐛 バグ報告 / Bug Report',
      feature: '💡 機能要望 / Feature Request',
      question: '❓ 質問 / Question',
      other: '📝 その他 / Other'
    };

    // Build email content
    const emailSubject = `[Albion Log] ${typeLabels[data.type] || data.type}`;
    const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 Albion Log フィードバック
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【種類 / Type】
${typeLabels[data.type] || data.type}

【メッセージ / Message】
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 追加情報 / Additional Info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

送信日時: ${data.timestamp || new Date().toISOString()}
プレイヤー: ${data.player || 'N/A'}
URL: ${data.url || 'N/A'}
User Agent: ${data.userAgent || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Check if Resend API key is configured
    if (!env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured. Feedback data:', data);
      // Still return success for development/testing
      return new Response(JSON.stringify({ success: true, message: 'Feedback received (email not configured)' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Albion Log <feedback@resend.dev>',
        to: env.FEEDBACK_EMAIL || 'your-email@example.com',
        subject: emailSubject,
        text: emailBody
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Feedback error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

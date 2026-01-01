// Feedback API endpoint - sends feedback to Discord via Webhook
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

    // Type labels and colors
    const typeConfig = {
      bug: { label: '🐛 バグ報告', color: 0xDC2626 },      // Red
      feature: { label: '💡 機能要望', color: 0x2563EB },  // Blue
      question: { label: '❓ 質問', color: 0x7C3AED },     // Purple
      other: { label: '📝 その他', color: 0x737373 }       // Gray
    };

    const config = typeConfig[data.type] || typeConfig.other;

    // Build Discord embed
    const embed = {
      title: `${config.label}`,
      color: config.color,
      fields: [
        {
          name: '📝 メッセージ',
          value: data.message.substring(0, 1024) || 'N/A',
          inline: false
        }
      ],
      footer: {
        text: `Albion Log Feedback`
      },
      timestamp: new Date().toISOString()
    };

    // Add contact field if provided
    if (data.contact && data.contact.trim()) {
      embed.fields.push({
        name: '📬 連絡先',
        value: data.contact,
        inline: true
      });
    }

    // Add player info if available
    if (data.player && data.player !== 'N/A') {
      embed.fields.push({
        name: '🎮 プレイヤー',
        value: data.player,
        inline: true
      });
    }

    // Discord Webhook URL from environment variable
    const webhookUrl = env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('DISCORD_WEBHOOK_URL not configured. Feedback data:', JSON.stringify(data));
      // Still return success for development/testing
      return new Response(JSON.stringify({ success: true, message: 'Feedback received (webhook not configured)' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send to Discord
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord Webhook error:', errorText);
      throw new Error('Failed to send to Discord');
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

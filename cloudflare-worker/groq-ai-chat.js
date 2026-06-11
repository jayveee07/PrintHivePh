const GROQ_MODEL = 'llama-3.1-8b-instant';
const MAX_HISTORY_MESSAGES = 8;

const SYSTEM_INSTRUCTIONS = `You are the customer assistant for Print Hive PH, a professional printing service.

Your job:
- Help customers when the Print Hive PH team cannot reply immediately.
- Answer questions about printing services, supplies, order requirements, and next steps.
- Collect useful quote details: customer name, contact number, service needed, quantity, size, material, deadline, design/file status, and delivery/pickup preference.
- Be honest that final pricing and availability must be confirmed by Print Hive PH.
- If a request is urgent, tell the customer to contact Print Hive PH directly through the Contact page or Facebook Messenger.

Services include:
- T-Shirt Printing: DTF and vinyl
- Tarpaulin and banners
- Stickers and labels
- Flyers and brochures
- Business cards
- Acrylic signage
- Invitations
- Custom merchandise such as mugs, tote bags, and pillows

Tone: friendly, concise, professional, and helpful. Use short markdown when it improves readability.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const cleanHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((message) => {
      return (
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim()
      );
    })
    .slice(-MAX_HISTORY_MESSAGES);

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const body = await request.json();
      const message = String(body.message || '').trim();

      if (!message) {
        return jsonResponse({ error: 'Missing message' }, 400);
      }

      if (!env.GROQ_API_KEY) {
        return jsonResponse({ error: 'AI assistant is not configured' }, 500);
      }

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL || GROQ_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTIONS },
            ...cleanHistory(body.history),
            { role: 'user', content: message },
          ],
          max_tokens: 450,
          temperature: 0.4,
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq request failed', groqResponse.status, errorText);
        return jsonResponse({ error: 'AI request failed' }, 502);
      }

      const data = await groqResponse.json();
      const text = data.choices?.[0]?.message?.content?.trim();

      return jsonResponse({
        text:
          text ||
          'Thanks for messaging Print Hive PH. Please share your item, quantity, size, deadline, and contact number so our team can prepare your quote.',
      });
    } catch (error) {
      console.error('AI chat request failed', error);
      return jsonResponse({ error: 'Failed to generate response' }, 500);
    }
  },
};

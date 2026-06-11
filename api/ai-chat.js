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

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

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

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const message = String(req.body?.message || '').trim();

    if (!message) {
      res.status(400).json({ error: 'Missing message' });
      return;
    }

    if (!process.env.GROQ_API_KEY) {
      res.status(500).json({ error: 'AI assistant is not configured' });
      return;
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTIONS },
          ...cleanHistory(req.body?.history),
          { role: 'user', content: message },
        ],
        max_tokens: 450,
        temperature: 0.4,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq request failed', groqResponse.status, errorText);
      res.status(502).json({ error: 'AI request failed' });
      return;
    }

    const data = await groqResponse.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      text:
        text ||
        'Thanks for messaging Print Hive PH. Please share your item, quantity, size, deadline, and contact number so our team can prepare your quote.',
    });
  } catch (error) {
    console.error('AI chat request failed', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}

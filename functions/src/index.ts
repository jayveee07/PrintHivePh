import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatMessage[];
};

type GroqResponseBody = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
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

const setCorsHeaders = (res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
};

const cleanHistory = (history: ChatMessage[] | undefined) =>
  (Array.isArray(history) ? history : [])
    .filter((message) => {
      return (
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
      );
    })
    .slice(-MAX_HISTORY_MESSAGES);

export const aiChat = onRequest(async (req: any, res: any) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = (req.body ?? {}) as ChatRequestBody;
    const message = String(body.message ?? "").trim();

    if (!message) {
      res.status(400).json({ error: "Missing message" });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logger.error("GROQ_API_KEY is not set in Cloud Functions environment");
      res.status(500).json({ error: "AI assistant is not configured" });
      return;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTIONS },
          ...cleanHistory(body.history),
          { role: "user", content: message },
        ],
        max_tokens: 450,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Groq request failed", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      res.status(502).json({ error: "AI request failed" });
      return;
    }

    const data = (await response.json()) as GroqResponseBody;
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    res.status(200).json({
      text:
        text ||
        "Thanks for messaging Print Hive PH. Please share your item, quantity, size, deadline, and contact number so our team can prepare your quote.",
    });
  } catch (error) {
    logger.error("AI chat request failed", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

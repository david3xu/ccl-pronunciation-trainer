import { IncomingMessage, ServerResponse } from 'http';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_LENGTH = 10;

/**
 * AI Chat middleware for Vite Dev Server.
 * Validates input, limits message size, and avoids leaking internals.
 */
export function aiChatMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
  env: Record<string, string>,
) {
  if (req.url !== '/api/ai/chat' || req.method !== 'POST') {
    return next();
  }

  let body = '';
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
    if (body.length > 50_000) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Request too large' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    // Parse body safely
    let message: string;
    let context: { word?: string; difficulty?: string } | undefined;
    let conversationHistory: { role: string; content: string }[] | undefined;

    try {
      const parsed = JSON.parse(body);
      message = parsed.message;
      context = parsed.context;
      conversationHistory = parsed.conversationHistory;
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      return;
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Message is required' }));
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }));
      return;
    }

    // Trim history
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-MAX_HISTORY_LENGTH)
      : [];

    try {
      const { GoogleGenAI } = await import('@google/genai');

      const apiKey =
        env['GEMINI_API'] || env['GEMINI_API_KEY'] || env['VITE_GEMINI_API_KEY'];

      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({ success: false, error: 'AI Tutor is not configured. Missing API Key.' }),
        );
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const SYSTEM_PROMPT = `You are an expert PTE pronunciation tutor.
Your role is to help students with pronunciation, IPA, and vocabulary.
Be encouraging, clear, and concise. Use bold for key terms.`;

      let fullPrompt = SYSTEM_PROMPT;

      if (context) {
        const word = typeof context.word === 'string' ? context.word.substring(0, 200) : '';
        if (word) {
          fullPrompt += `\n\nContext: Word "${word}"`;
          if (context.difficulty) fullPrompt += `, Difficulty: ${context.difficulty}`;
        }
      }

      if (history.length > 0) {
        fullPrompt +=
          '\n\nHistory:\n' +
          history
            .map(
              (m) =>
                `${m.role === 'user' ? 'Student' : 'Tutor'}: ${String(m.content).substring(0, 500)}`,
            )
            .join('\n');
      }

      fullPrompt += `\n\nStudent: ${message}\n\nTutor:`;

      const result = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const chunk of result) {
          // @ts-expect-error Property vs method mismatch
          const chunkText = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      } finally {
        res.end();
      }
    } catch (error) {
      console.error('AI Middleware Error:', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'An internal error occurred' }));
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
        res.end();
      }
    }
  });
}

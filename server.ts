import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Health check endpoints for Cloud Run liveness/readiness probes
app.get(['/healthz', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'All9s Edexcel IGCSE Terminal',
    timestamp: new Date().toISOString(),
  });
});

// Server-side Gemini API proxy route (satisfies MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { message, nickname, subject } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are Opencode, an encouraging and rigorous Edexcel IGCSE academic tutor on the All9s terminal. Address the candidate as ${
      nickname || 'Candidate'
    }. Focus strictly on official Edexcel IGCSE syllabus standards (Grade 9 target). Subject context: ${
      subject || 'General IGCSE Revision'
    }. Keep answers concise, clear, and structured with key formulas and mark scheme points where relevant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('[Gemini API Proxy Error]:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate response' });
  }
});

// Serve static frontend assets from production build
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for client-side routing
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req: Request, res: Response) => {
    res.status(200).send('All9s Production Server is starting. Dist assets loading...');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[All9s Server] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
});

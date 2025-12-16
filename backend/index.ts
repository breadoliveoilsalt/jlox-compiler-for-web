import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { compileForApi } from './utils/compileForApi';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration: Use ALLOWED_ORIGINS env var for production
// Format: comma-separated list, e.g., "https://example.com,https://www.example.com"
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) =>
  s.trim(),
);
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Evaluate jlox code
app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        result: null,
        output: [],
        error: 'Invalid request: "code" must be a non-empty string',
      });
    }

    const result = await compileForApi(code);
    res.json(result);
  } catch (error) {
    console.error('Unexpected error in /api/evaluate:', error);
    res.status(500).json({
      result: null,
      output: [],
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

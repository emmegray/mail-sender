import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { sendEmail } from './mailer.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: true, // allow local frontend
  credentials: false
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Validation schema
const TransportConfigSchema = z.union([
  z.object({
    service: z.string().min(2, 'service is required when using service-based config'),
    user: z.string().email(),
    pass: z.string().min(8),
    host: z.string().optional(),
    port: z.number().optional(),
    secure: z.boolean().optional()
  }),
  z.object({
    host: z.string().min(2, 'host is required when using custom SMTP'),
    port: z.number().int().positive(),
    secure: z.boolean().default(false),
    user: z.string().email(),
    pass: z.string().min(8),
    service: z.string().optional()
  })
]);

const SendBodySchema = z.object({
  transportConfig: TransportConfigSchema,
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  toAddresses: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional()
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'email-tester-backend' });
});

app.post('/api/send', async (req, res) => {
  try {
    const parsed = SendBodySchema.parse(req.body);

    // Security note: no credentials are saved on the server
    const results = await sendEmail(parsed);

    res.json({ ok: true, results });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', details: err.errors });
    }
    console.error('SEND ERROR:', err);
    res.status(500).json({ ok: false, error: 'SEND_FAILED', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
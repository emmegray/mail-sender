import { sendEmail } from '../../backend/src/mailer.js';

const MAX_BODY_BYTES = 1_500_000;
const MAX_RECIPIENTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ALLOWED_SERVICES = new Set(['gmail', 'hotmail', 'outlook', 'yahoo', 'mailtrap']);
const requestLog = new Map();

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'X-Content-Type-Options': 'nosniff'
  },
  body: JSON.stringify(body)
});

const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePayload = (body) => {
  const config = body?.transportConfig;
  const recipients = body?.toAddresses;

  if (!config || typeof config !== 'object') return 'SMTP configuration is required.';
  if (!config.user || !isEmail(config.user)) return 'SMTP user must be a valid email address.';
  if (!config.pass || config.pass.length < 8) return 'SMTP password must contain at least 8 characters.';
  if (config.service && !ALLOWED_SERVICES.has(config.service.toLowerCase())) return 'This SMTP service is not allowed.';
  if (!config.service && process.env.ALLOW_CUSTOM_SMTP !== 'true') return 'Custom SMTP is disabled on this public deployment.';
  if (!config.service && (!config.host || config.host.length < 2)) return 'SMTP host is required.';
  if (!config.service && (!Number.isInteger(config.port) || config.port <= 0)) return 'SMTP port is invalid.';
  if (!body.fromName || body.fromName.length > 120 || !isEmail(body.fromEmail)) return 'Sender name and email are required.';
  if (!Array.isArray(recipients) || recipients.length === 0 || recipients.length > MAX_RECIPIENTS || recipients.some((email) => !isEmail(email))) {
    return 'At least one valid recipient email is required.';
  }
  if (!body.subject || body.subject.length > 998 || !body.html || body.html.length > 1_000_000) return 'Subject and HTML content are required and must be within the allowed size.';

  return null;
};

const isRateLimited = (ip) => {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'METHOD_NOT_ALLOWED' });

  const ip = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return json(429, { ok: false, error: 'RATE_LIMITED', message: 'Too many send attempts. Please try again later.' });

  try {
    if (Buffer.byteLength(event.body || '', 'utf8') > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: 'PAYLOAD_TOO_LARGE', message: 'The email content is too large.' });
    }

    const body = JSON.parse(event.body || '{}');
    const validationError = validatePayload(body);
    if (validationError) return json(400, { ok: false, error: 'VALIDATION_ERROR', message: validationError });

    const results = await sendEmail(body);
    return json(200, { ok: true, results });
  } catch (error) {
    console.error('SEND ERROR:', error);
    return json(500, { ok: false, error: 'SEND_FAILED', message: 'Email sending failed. Check the SMTP settings and try again.' });
  }
};

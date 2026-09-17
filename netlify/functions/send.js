import { sendEmail } from '../../backend/src/mailer.js';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
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
  if (config.service && config.service.length < 2) return 'SMTP service is invalid.';
  if (!config.service && (!config.host || config.host.length < 2)) return 'SMTP host is required.';
  if (!config.service && (!Number.isInteger(config.port) || config.port <= 0)) return 'SMTP port is invalid.';
  if (!body.fromName || !isEmail(body.fromEmail)) return 'Sender name and email are required.';
  if (!Array.isArray(recipients) || recipients.length === 0 || recipients.some((email) => !isEmail(email))) {
    return 'At least one valid recipient email is required.';
  }
  if (!body.subject || !body.html) return 'Subject and HTML content are required.';

  return null;
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    const body = JSON.parse(event.body || '{}');
    const validationError = validatePayload(body);
    if (validationError) return json(400, { ok: false, error: 'VALIDATION_ERROR', message: validationError });

    const results = await sendEmail(body);
    return json(200, { ok: true, results });
  } catch (error) {
    console.error('SEND ERROR:', error);
    return json(500, { ok: false, error: 'SEND_FAILED', message: error.message || 'Email sending failed.' });
  }
};

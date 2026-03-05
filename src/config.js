const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { z } = require('zod');

const EnvSchema = z.object({
  SMTP_SERVICE: z.string().default('gmail'),
  SMTP_USER: z.string().email('SMTP_USER must be a valid email'),
  SMTP_PASS: z.string().min(8, 'SMTP_PASS must be at least 8 characters long'),
  FROM_NAME: z.string().default('Test DEM'),
  FROM_EMAIL: z.string().email('FROM_EMAIL must be a valid email'),
  TO_ADDRESSES: z.string().min(1, 'TO_ADDRESSES is required (comma-separated list)'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Error parsing environment variables:');
  const errors = parsed.error.flatten();
  console.error(JSON.stringify(errors.fieldErrors, null, 2));
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  smtpService: env.SMTP_SERVICE,
  smtpUser: env.SMTP_USER,
  smtpPass: env.SMTP_PASS,
  fromName: env.FROM_NAME,
  fromEmail: env.FROM_EMAIL,
  toAddresses: env.TO_ADDRESSES.split(',').map(s => s.trim()).filter(Boolean),
};
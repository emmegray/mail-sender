import nodemailer from 'nodemailer';

export function createTransporter({
  service,
  host,
  port,
  secure,
  user,
  pass
}) {
  // If "service" is passed (e.g., 'gmail'), use it
  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  // Otherwise custom config
  return nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Boolean(secure), // true per 465, false per altri
    auth: { user, pass }
  });
}

export async function sendEmail({
  transportConfig,
  fromName,
  fromEmail,
  toAddresses,
  subject,
  html,
  text
}) {
  const transporter = createTransporter(transportConfig);

  // (optional but useful) verify connection and credentials
  await transporter.verify();

  const results = [];
  for (const to of toAddresses) {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || undefined,
      html
    });
    results.push({ to, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected });
  }

  return results;
}

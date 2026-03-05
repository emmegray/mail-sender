// src/send.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function sendMail() {
  // Load the HTML of your DEM
  const htmlPath = path.join(__dirname, '..', 'html_test', 'dem-base.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Transporter: Gmail simplified via "service"
  const transporter = nodemailer.createTransport({
    service: config.smtpService, // example. 'gmail'
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  // Send to all recipients (one at a time)
  for (const to of config.toAddresses) {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject: 'Test DEM HTML',
      html,
    });
    console.log(`Email send to: ${to}`);
  }
}

sendMail().catch(err => {
  console.error('Error sending email:', err.message);
  process.exit(1);
});
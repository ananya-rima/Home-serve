const nodemailer = require('nodemailer');

let cachedTransporter = null;

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  if (!isSmtpConfigured()) return null;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
};


const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('--------- EMAIL NOT SENT (SMTP not configured) ---------');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('----------------------------------------------------------');
    return { simulated: true };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'HomeServe';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
};

const sendOtpEmail = async (to, otp) => {
  const expiresIn = process.env.OTP_EXPIRES_MIN || 5;
  const subject = 'Your HomeServe Login OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>HomeServe Verification Code</h2>
      <p>Use the code below to complete your login. It expires in ${expiresIn} minutes.</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

module.exports = { sendEmail, sendOtpEmail, isSmtpConfigured };

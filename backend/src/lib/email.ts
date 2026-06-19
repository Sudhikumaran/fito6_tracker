import nodemailer from 'nodemailer';
import { config } from '../config';

function getTransport() {
  if (!config.smtp.configured) return null;

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  await transport.sendMail({
    from: config.smtp.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to,
    subject: 'Fito6 — Reset your password',
    text: `Hi ${name},\n\nWe received a request to reset your Fito6 password.\n\nReset your password (link expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email. Your password will not change.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your <strong>Fito6</strong> account password.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="font-size:13px;color:#555">This link expires in 1 hour. If the button does not work, copy this URL:</p>
        <p style="font-size:13px;word-break:break-all"><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="font-size:13px;color:#555">If you did not request a password reset, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendStaffWelcomeEmail(
  to: string,
  name: string,
  temporaryPassword: string
): Promise<void> {
  const loginUrl = `${config.frontendUrl}/login`;

  await sendEmail({
    to,
    subject: 'Fito6 — Your staff account',
    text: `Hi ${name},\n\nAn admin created your Fito6 staff account.\nLogin: ${loginUrl}\nEmail: ${to}\nTemporary password: ${temporaryPassword}\n\nPlease change your password after logging in if your admin asks you to.`,
    html: `
      <p>Hi ${name},</p>
      <p>Your <strong>Fito6</strong> staff account has been created.</p>
      <p><a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${to}<br/><strong>Temporary password:</strong> ${temporaryPassword}</p>
      <p>You can change your password anytime using <strong>Forgot password</strong> on the login page.</p>
    `,
  });
}

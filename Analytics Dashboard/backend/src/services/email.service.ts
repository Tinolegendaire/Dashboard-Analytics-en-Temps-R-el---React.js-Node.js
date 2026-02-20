import nodemailer from 'nodemailer';
import { env } from '../config/environment.js';
import logger from '../utils/logger.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async sendAlert(email: string, subject: string, message: string) {
    if (!this.transporter || !env.ALERT_EMAIL) {
      logger.warn('Email service not configured, alert not sent');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject: `[Analytics Alert] ${subject}`,
        html: `
          <h2>Analytics Alert</h2>
          <p><strong>${subject}</strong></p>
          <p>${message}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `,
      });
      
      logger.info(`Alert email sent to ${email}: ${subject}`);
      return true;
    } catch (error) {
      logger.error('Failed to send alert email:', error);
      return false;
    }
  }
}
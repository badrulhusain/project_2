import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Branded HTML wrapper that matches the EventSense look. */
function render(subject: string, body: string) {
  const paragraphs = body.split(/\n{2,}/).map(p => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#141414">${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#F4E55A;padding:28px 12px;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FAF7F2;border:3px solid #141414;border-radius:20px;overflow:hidden">
<tr><td style="background:#141414;padding:18px 24px;font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff">&#10022; EVENT<span style="color:#F4E55A">SENSE</span></td></tr>
<tr><td style="padding:28px 24px 12px"><h1 style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#141414;text-transform:uppercase">${esc(subject)}</h1>${paragraphs}</td></tr>
<tr><td style="padding:0 24px 26px"><span style="display:inline-block;background:#F6B8D6;border:2px solid #141414;border-radius:999px;padding:6px 14px;font-size:11px;font-weight:800;letter-spacing:1px;color:#141414;text-transform:uppercase">Plan less. Waste less. Show up.</span></td></tr>
</table></td></tr></table></body></html>`;
}

@Injectable() export class MailService {
  private logger = new Logger(MailService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * Sends through Resend when RESEND_API_KEY is set, otherwise only logs. Every message is recorded in Outbox.
   * MAIL_REDIRECT_TO sends all mail to one address (needed while no sending domain is verified in Resend).
   */
  async send(to: string, subject: string, body: string) {
    const row = await this.prisma.outbox.create({ data: { to, subject, body } });
    const key = process.env.RESEND_API_KEY;
    if (!key) { this.logger.log(`Email to ${to}: ${subject} - ${body}`); return; }
    const redirect = process.env.MAIL_REDIRECT_TO?.trim();
    const target = redirect || to;
    const finalSubject = redirect && redirect.toLowerCase() !== to.toLowerCase() ? `[for ${to}] ${subject}` : subject;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: process.env.MAIL_FROM || 'EventSense <onboarding@resend.dev>', to: [target], subject: finalSubject, text: body, html: render(subject, body) }),
      });
      if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
      await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'SENT' } });
    } catch (error) {
      this.logger.error(`Email to ${to} failed: ${error instanceof Error ? error.message : error}`);
      await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'FAILED' } }).catch(() => undefined);
    }
  }
}


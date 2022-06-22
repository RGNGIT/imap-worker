import nodemailer, { Transporter } from 'nodemailer';
import { Readable } from 'stream';

export default interface NotificationAttachment {
    filename: string;
    content: Readable;
}

export default class SendingEmailsService {
  transporter: Transporter;

  constructor(host: string, port: number, secure: boolean, username: string, password: string) {
    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  async send(from: string, to: string, subject: string, text: string, attachments?: Array<NotificationAttachment>) {
    await this.sendEmail(from, to, subject, text, null, attachments);
  }

  async sendHtml(from: string, to: string, subject: string, html: string, attachments?: Array<NotificationAttachment>) {
    await this.sendEmail(from, to, subject, null, html, attachments);
  }

  private async sendEmail(from: string, to: string, subject: string, text?: string, html?: string, attachments?: Array<NotificationAttachment>) {
    if(!text && !html)
      throw new Error("Text or Html required");

    await this.transporter.sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
      attachments: attachments?.map((attachment)=> { return { filename: attachment.filename, content: attachment.content } }) ?? null
    });
  }
}

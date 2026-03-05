import Handlebars from 'handlebars';
import { transporter } from './transporter';
import { BASE_LAYOUT, EmailTemplates, TemplateName } from './templates';

interface SendEmailOptions {
    to: string;
    template: TemplateName;
    data: Record<string, any>;
    attachments?: {
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }[];
}

export class EmailService {
    private static fromEmail = process.env.SMTP_FROM || 'Wabotti <noreply@wabotti.com>';
    private static siteUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

    /**
     * Send an email using a predefined template
     */
    static async send({ to, template, data, attachments }: SendEmailOptions) {
        try {
            const templateDef = EmailTemplates[template];
            if (!templateDef) {
                throw new Error(`Template ${template} not found`);
            }

            // Prepare common data
            const commonData = {
                siteUrl: this.siteUrl,
                year: new Date().getFullYear(),
                brandingColor: '#471ca8', // Default Wabotti Indigo
                ...data
            };

            // Compile Subject
            const subjectDelegate = Handlebars.compile(templateDef.subject);
            const subject = subjectDelegate(commonData);

            // Compile Body
            const bodyDelegate = Handlebars.compile(templateDef.body);
            const bodyHtml = bodyDelegate(commonData);

            // Wrap in Layout
            const layoutDelegate = Handlebars.compile(BASE_LAYOUT);
            const finalHtml = layoutDelegate({
                ...commonData,
                body: bodyHtml
            });

            // Send Email
            const info = await transporter.sendMail({
                from: this.fromEmail,
                to,
                subject,
                html: finalHtml,
                text: this.stripHtml(bodyHtml), // Basic fallback
                attachments
            });

            console.log(`Email sent: ${info.messageId} (Template: ${template})`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error };
        }
    }

    /**
     * Very basic HTML to text conversion for fallback
     */
    private static stripHtml(html: string): string {
        return html
            .replace(/<style[^>]*>.*<\/style>/gms, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

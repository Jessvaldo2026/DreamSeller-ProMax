import { supabase } from './supabase';

export interface EmailCampaign {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  sender_name: string;
  supplier_ids: string[];
  status: 'pending' | 'sending' | 'completed' | 'failed';
  sent_count: number;
  failed_count: number;
  created_at: Date;
}

export interface InvitationEmailData {
  recipientEmail: string;
  inviteLink: string;
  role: string;
  senderName: string;
  senderEmail: string;
}

interface EmailLog {
  status: string;
}

export class RealEmailService {
  async sendBulkEmails(
    campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'sent_count' | 'failed_count'>
  ): Promise<{ success: number; failed: number }> {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaign,
          status: 'sending',
          sent_count: 0,
          failed_count: 0,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .in('id', campaign.supplier_ids);

      if (suppliersError) throw suppliersError;

      let successCount = 0;
      let failedCount = 0;

      for (const supplier of suppliers || []) {
        try {
          const personalizedContent = this.personalizeContent(
            campaign.content,
            supplier,
            campaign.sender_name
          );

          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: `"${campaign.sender_name}" <goncalvesjacelina27@gmail.com>`,
              to: supplier.email,
              subject: campaign.subject,
              html: this.formatEmailHTML(personalizedContent),
              text: personalizedContent,
            }),
          });

          if (!emailResponse.ok) throw new Error('Email send failed');

          successCount++;

          await supabase.from('email_logs').insert({
            campaign_id: campaignData.id,
            supplier_id: supplier.id,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });
        } catch (error: unknown) {
          console.error(`Failed to send email to ${supplier.email}:`, error);
          failedCount++;

          await supabase.from('email_logs').insert({
            campaign_id: campaignData.id,
            supplier_id: supplier.id,
            status: 'failed',
            error_message: error instanceof Error ? error.message : String(error),
            sent_at: new Date().toISOString(),
          });
        }
      }

      await supabase
        .from('email_campaigns')
        .update({
          status: 'completed',
          sent_count: successCount,
          failed_count: failedCount,
        })
        .eq('id', campaignData.id);

      return { success: successCount, failed: failedCount };
    } catch (error: unknown) {
      console.error('Bulk email campaign failed:', error);
      throw error;
    }
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    try {
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `"${data.senderName}" <${data.senderEmail}>`,
          to: data.recipientEmail,
          subject: `You're invited to join DreamSeller Pro`,
          html: this.formatInvitationHTML(data),
          text: this.generateInvitationContent(data),
        }),
      });

      if (!emailResponse.ok) throw new Error('Email send failed');

      await supabase.from('email_logs').insert({
        recipient_email: data.recipientEmail,
        email_type: 'invitation',
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error('Failed to send invitation email:', error);

      await supabase.from('email_logs').insert({
        recipient_email: data.recipientEmail,
        email_type: 'invitation',
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error),
        sent_at: new Date().toISOString(),
      });

      throw error;
    }
  }

  private generateInvitationContent(data: InvitationEmailData): string {
    return `
Hi there,

You've been invited to join DreamSeller Pro, the automated business empire platform that helps entrepreneurs generate passive income through AI-powered business automation.

Your Role: ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}

Click the link below to accept your invitation:
${data.inviteLink}

Best regards,
${data.senderName}
DreamSeller Pro Team
    `.trim();
  }

  private personalizeContent(content: string, supplier: any, senderName: string): string {
    return content
      .replace(/\{\{supplier_name\}\}/g, supplier.name || 'Valued Partner')
      .replace(/\{\{sender_name\}\}/g, senderName || 'DreamSeller Pro Team')
      .replace(/\{\{supplier_email\}\}/g, supplier.email || '')
      .replace(/\{\{supplier_category\}\}/g, supplier.category || 'General');
  }

  private formatEmailHTML(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Business Partnership Opportunity</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DreamSeller Pro</h1>
            <p>Automated Business Partnership Platform</p>
          </div>
          <div class="content">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>This email was sent by DreamSeller Pro automated system.</p>
            <p>© 2025 DreamSeller Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatInvitationHTML(data: InvitationEmailData): string {
    return `<p>You are invited to DreamSeller Pro. Click here: ${data.inviteLink}</p>`;
  }

  async getEmailCampaigns(userId: string): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaignStats(campaignId: string): Promise<{ sent: number; opened: number; clicked: number }> {
    const { data, error } = await supabase
      .from('email_logs')
      .select('status')
      .eq('campaign_id', campaignId);

    if (error) throw error;

    const sent = data?.filter((log: EmailLog) => log.status === 'sent').length || 0;
    const opened = data?.filter((log: EmailLog) => log.status === 'opened').length || 0;
    const clicked = data?.filter((log: EmailLog) => log.status === 'clicked').length || 0;

    return { sent, opened, clicked };
  }
}

export const realEmailService = new RealEmailService();


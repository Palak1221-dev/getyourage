export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export interface OrderConfirmationParams {
  to: string;
  orderId: string;
  productTitle: string;
  downloadUrl?: string;
}

export async function sendOrderConfirmation(params: OrderConfirmationParams): Promise<void> {
  const fromEmail = process.env.SMTP_FROM || 'orders@tooltails.com';

  console.log('[email] SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');
  console.log('[email] SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
  console.log('[email] SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  console.log('[email] isSmtpConfigured():', isSmtpConfigured());

  if (isSmtpConfigured()) {
    console.log('[email] Importing nodemailer...');
    try {
      const nodemailer = await import('nodemailer');
      console.log('[email] Nodemailer imported successfully');
      console.log('[email] Creating SMTP transporter...');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      });

      console.log('[email] Calling transporter.sendMail...');
      await transporter.sendMail({
        from: `"Tooltails Store" <${fromEmail}>`,
        to: params.to,
        subject: `Your ${params.productTitle} is ready — Order #${params.orderId}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 56px; height: 56px; background: #ECFDF5; border: 2px solid #A7F3D0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                <span style="font-size: 24px;">✓</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #1c1917; margin: 0;">Payment Confirmed</h1>
              <p style="font-size: 14px; color: #78716c; margin: 8px 0 0;">Thank you for your order!</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Order</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1c1917;">#${params.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Product</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1c1917;">${params.productTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-weight: 600;">Email</td>
                <td style="padding: 8px 0; text-align: right; color: #57534e;">${params.to}</td>
              </tr>
            </table>

            ${params.downloadUrl ? `
            <div style="background: #F5F3FF; border: 1px solid #E4D5F7; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 13px; color: #57534e; margin: 0 0 12px;">Your personalized planner is ready to download:</p>
              <a href="${params.downloadUrl}" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none;">
                Download Your Planner
              </a>
              <p style="font-size: 11px; color: #a8a29e; margin: 10px 0 0;">Link expires in 30 days</p>
            </div>
            ` : ''}

            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; margin-top: 24px; text-align: center;">
              <p style="font-size: 11px; color: #a8a29e; margin: 0;">
                Tooltails — Personalized Digital Planners<br>
                <a href="https://tooltails.com/digital-store" style="color: #7C3AED; text-decoration: underline;">Visit Store</a>
              </p>
            </div>
          </div>
        `,
      });

      console.log(`[email] Confirmation email sent to ${params.to}`);
    } catch (err) {
      console.error('[email] Failed to send email:', err);
      if (err instanceof Error) {
        console.error('[email] Error message:', err.message);
        console.error('[email] Error stack:', err.stack);
      }
    }
  } else {
    console.log(`[email] SMTP not configured. Would send to ${params.to}: Order #${params.orderId} - ${params.productTitle}${params.downloadUrl ? ` - Download: ${params.downloadUrl}` : ''}`);
  }
}

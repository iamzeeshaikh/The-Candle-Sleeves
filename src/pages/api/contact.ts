import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || 'Not provided';
    const company = formData.get('company') as string || 'Not provided';
    const product = formData.get('product') as string || '';
    const quantity = formData.get('quantity') as string || '';
    const size = formData.get('size') as string || '';
    const material = formData.get('material') as string || '';
    const printing = formData.get('printing') as string || '';
    const subject = formData.get('subject') as string || 'New Quote Request';
    const message = formData.get('message') as string || '';

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const isQuote = !!product;
    const emailSubject = isQuote
      ? `New Quote Request from ${name} — ${product}`
      : `New Contact Message: ${subject} — from ${name}`;

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; background: #FAF6EF; padding: 2rem; border-radius: 8px;">
        <h1 style="color: #4A2C1A; border-bottom: 2px solid #C9A84C; padding-bottom: 0.75rem; margin-bottom: 1.5rem;">
          ${isQuote ? '&#9670; New Quote Request' : '&#9670; New Contact Message'}
        </h1>
        <table style="width:100%; border-collapse:collapse; font-size:0.95rem;">
          <tr><td style="padding:0.5rem 0; color:#6B6B6B; width:140px;"><strong>Name</strong></td><td style="padding:0.5rem 0; color:#1A1A1A;">${name}</td></tr>
          <tr style="background:#F0E9DC;"><td style="padding:0.5rem;color:#6B6B6B;"><strong>Email</strong></td><td style="padding:0.5rem;color:#1A1A1A;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:0.5rem 0;color:#6B6B6B;"><strong>Phone</strong></td><td style="padding:0.5rem 0;color:#1A1A1A;">${phone}</td></tr>
          <tr style="background:#F0E9DC;"><td style="padding:0.5rem;color:#6B6B6B;"><strong>Company</strong></td><td style="padding:0.5rem;color:#1A1A1A;">${company}</td></tr>
          ${product ? `<tr><td style="padding:0.5rem 0;color:#6B6B6B;"><strong>Product</strong></td><td style="padding:0.5rem 0;color:#1A1A1A;">${product}</td></tr>` : ''}
          ${quantity ? `<tr style="background:#F0E9DC;"><td style="padding:0.5rem;color:#6B6B6B;"><strong>Quantity</strong></td><td style="padding:0.5rem;color:#1A1A1A;">${quantity}</td></tr>` : ''}
          ${size ? `<tr><td style="padding:0.5rem 0;color:#6B6B6B;"><strong>Size</strong></td><td style="padding:0.5rem 0;color:#1A1A1A;">${size}</td></tr>` : ''}
          ${material ? `<tr style="background:#F0E9DC;"><td style="padding:0.5rem;color:#6B6B6B;"><strong>Material</strong></td><td style="padding:0.5rem;color:#1A1A1A;">${material}</td></tr>` : ''}
          ${printing ? `<tr><td style="padding:0.5rem 0;color:#6B6B6B;"><strong>Printing</strong></td><td style="padding:0.5rem 0;color:#1A1A1A;">${printing}</td></tr>` : ''}
        </table>
        <div style="margin-top:1.5rem; background:#fff; padding:1rem; border-left:3px solid #C9A84C; border-radius:4px;">
          <strong style="color:#4A2C1A;">Message:</strong>
          <p style="margin:0.5rem 0 0; color:#1A1A1A; line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="margin-top:2rem; font-size:0.8rem; color:#6B6B6B; border-top:1px solid #DDD3BE; padding-top:1rem;">
          Sent via thecandlesleeves.com contact form
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'The Candle Sleeves'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO || 'shanimazhar82@gmail.com',
      replyTo: email,
      subject: emailSubject,
      html: htmlBody,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Email error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email.' }), { status: 500 });
  }
};
